// 项目管理器
const projectManager = {
    currentFilter: 'all',
    editingId: null,
    contentPriceCounter: 0,

    // 初始化
    init() {
        this.render();
        this.setupFilters();
    },

    // 设置筛选器
    setupFilters() {
        const tabs = document.querySelectorAll('#projects-page .filter-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.currentFilter = tab.dataset.filter;
                this.render();
            });
        });
    },

    // 获取筛选后的项目
    getFilteredProjects() {
        let projects = dataManager.getProjects();
        
        // 状态筛选
        if (this.currentFilter !== 'all') {
            projects = projects.filter(p => p.status === this.currentFilter);
        }
        
        // 搜索筛选
        const searchTerm = document.getElementById('project-search')?.value?.toLowerCase() || '';
        if (searchTerm) {
            projects = projects.filter(p => 
                p.name?.toLowerCase().includes(searchTerm) ||
                p.client?.toLowerCase().includes(searchTerm) ||
                p.notes?.toLowerCase().includes(searchTerm)
            );
        }
        
        // 按更新时间倒序
        return projects.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    },

    // 渲染项目列表
    render() {
        const container = document.getElementById('projects-list');
        const projects = this.getFilteredProjects();
        
        if (projects.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📁</div>
                    <h3>暂无项目</h3>
                    <p>点击右上角按钮创建新项目</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = projects.map(project => this.createProjectCard(project)).join('');
    },

    // 创建项目卡片
    createProjectCard(project) {
        const statusText = {
            'ongoing': '进行中',
            'completed': '已完成',
            'cancelled': '已取消'
        }[project.status] || '进行中';
        
        const paymentText = {
            'content_account': '内容发布账号',
            'any_account': '任意账号',
            'company': '对公结算',
            'other': '其他'
        }[project.payment] || '';
        
        // 计算总报价（单价 * 数量）
        let totalPrice = 0;
        if (project.contentPrices && project.contentPrices.length > 0) {
            totalPrice = project.contentPrices.reduce((sum, item) => {
                const price = parseFloat(item.price) || 0;
                const quantity = parseFloat(item.quantity) || 0;
                return sum + (price * quantity);
            }, 0);
        }
        
        return `
            <div class="card">
                <div class="card-header" onclick="projectManager.viewDetail('${project.id}')">
                    <div class="card-title">${project.name}</div>
                    <span class="card-status status-${project.status}">${statusText}</span>
                </div>
                <div class="card-body" onclick="projectManager.viewDetail('${project.id}')">
                    ${project.client ? `<p>👤 ${project.client}</p>` : ''}
                    ${project.formReq ? `<p>🎬 ${project.formReq}</p>` : ''}
                    ${project.videoFormat ? `<p>📐 ${project.videoFormat}</p>` : ''}
                    ${project.activityLink ? `<p>🔗 有活动链接</p>` : ''}
                </div>
                <div class="card-footer">
                    <div class="card-meta" onclick="projectManager.viewDetail('${project.id}')">
                        ${project.start ? dataManager.formatDate(project.start) : ''}
                        ${project.start && project.end ? ' - ' : ''}
                        ${project.end ? dataManager.formatDate(project.end) : ''}
                        ${paymentText ? ` · ${paymentText}` : ''}
                    </div>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        ${totalPrice > 0 ? `<div class="card-price" onclick="projectManager.viewDetail('${project.id}')">${dataManager.formatPrice(totalPrice)}</div>` : ''}
                        <button type="button" class="btn-icon" onclick="event.stopPropagation(); projectManager.showExportOptions('${project.id}')" title="导出" style="width: 32px; height: 32px; font-size: 14px;">📤</button>
                    </div>
                </div>
            </div>
        `;
    },

    // 搜索
    search(value) {
        this.render();
    },

    // 添加内容报价行
    addContentPrice(data = null) {
        this.contentPriceCounter++;
        const id = this.contentPriceCounter;
        const container = document.getElementById('content-prices-list');
        
        const row = document.createElement('div');
        row.className = 'content-price-row';
        row.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr 1fr auto; gap: 8px; margin-bottom: 8px; align-items: center;';
        row.dataset.priceId = id;
        
        row.innerHTML = `
            <select class="content-price-type" style="padding: 10px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-primary);">
                <option value="">类别</option>
                <option value="视频" ${data?.type === '视频' ? 'selected' : ''}>视频</option>
                <option value="图文" ${data?.type === '图文' ? 'selected' : ''}>图文</option>
                <option value="直播" ${data?.type === '直播' ? 'selected' : ''}>直播</option>
                <option value="文章" ${data?.type === '文章' ? 'selected' : ''}>文章</option>
                <option value="其他" ${data?.type === '其他' ? 'selected' : ''}>其他</option>
            </select>
            <input type="number" class="content-price-value" placeholder="单价" value="${data?.price || ''}" style="padding: 10px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-primary);">
            <input type="number" class="content-price-quantity" placeholder="数量" value="${data?.quantity || ''}" style="padding: 10px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-primary);">
            <button type="button" onclick="projectManager.removeContentPrice(${id})" style="background: var(--danger); color: white; border: none; border-radius: 8px; padding: 10px; cursor: pointer; font-size: 16px;">×</button>
        `;
        
        container.appendChild(row);
    },

    // 删除内容报价行
    removeContentPrice(id) {
        const row = document.querySelector(`[data-price-id="${id}"]`);
        if (row) {
            row.remove();
        }
    },

    // 获取所有内容报价
    getContentPrices() {
        const rows = document.querySelectorAll('.content-price-row');
        const prices = [];
        rows.forEach(row => {
            const type = row.querySelector('.content-price-type').value;
            const price = row.querySelector('.content-price-value').value;
            const quantity = row.querySelector('.content-price-quantity').value;
            if (type || price || quantity) {
                prices.push({ type, price, quantity });
            }
        });
        return prices;
    },

    // 清空内容报价
    clearContentPrices() {
        document.getElementById('content-prices-list').innerHTML = '';
        this.contentPriceCounter = 0;
    },

    // 获取结算标准复选项
    getPaymentStandards() {
        const standards = [];
        if (document.getElementById('payment-std-recommend').checked) standards.push('推荐');
        if (document.getElementById('payment-std-quality').checked) standards.push('优质');
        if (document.getElementById('payment-std-manual').checked) standards.push('人工');
        return standards;
    },

    // 设置结算标准复选项
    setPaymentStandards(standards) {
        document.getElementById('payment-std-recommend').checked = standards?.includes('推荐') || false;
        document.getElementById('payment-std-quality').checked = standards?.includes('优质') || false;
        document.getElementById('payment-std-manual').checked = standards?.includes('人工') || false;
    },

    // 打开模态框
    openModal(projectId = null) {
        this.editingId = projectId;
        this.clearContentPrices();
        
        const modal = document.getElementById('project-modal');
        const title = document.getElementById('project-modal-title');
        const deleteBtn = document.getElementById('project-delete-btn');
        
        if (projectId) {
            const project = dataManager.getProjects().find(p => p.id === projectId);
            if (project) {
                title.textContent = '编辑项目';
                document.getElementById('project-id').value = project.id;
                document.getElementById('project-name').value = project.name || '';
                document.getElementById('project-client').value = project.client || '';
                document.getElementById('project-start').value = project.start || '';
                document.getElementById('project-end').value = project.end || '';
                
                // 加载内容报价
                if (project.contentPrices && project.contentPrices.length > 0) {
                    project.contentPrices.forEach(price => this.addContentPrice(price));
                }
                
                document.getElementById('project-payment').value = project.payment || '';
                this.setPaymentStandards(project.paymentStandards);
                document.getElementById('project-payment-terms').value = project.paymentTerms || '';
                document.getElementById('project-form-req').value = project.formReq || '';
                document.getElementById('project-content-length').value = project.contentLength || '';
                document.getElementById('project-video-format').value = project.videoFormat || '';
                document.getElementById('project-cover-req').value = project.coverReq || '';
                document.getElementById('project-quality-req').value = project.qualityReq || '';
                document.getElementById('project-account-count').value = project.accountCount || '';
                document.getElementById('project-single-limit').value = project.singleLimit || '';
                document.getElementById('project-daily-limit').value = project.dailyLimit || '';
                document.getElementById('project-activity-link').value = project.activityLink || '';
                document.getElementById('project-publish-req').value = project.publishReq || '';
                document.getElementById('project-notes').value = project.notes || '';
                document.getElementById('project-status').value = project.status || 'ongoing';
                
                // 显示删除按钮
                deleteBtn.style.display = 'inline-block';
            }
        } else {
            title.textContent = '新建项目';
            document.getElementById('project-form').reset();
            document.getElementById('project-id').value = '';
            document.getElementById('project-status').value = 'ongoing';
            // 默认添加一个空报价行
            this.addContentPrice();
            
            // 隐藏删除按钮
            deleteBtn.style.display = 'none';
        }
        
        modal.classList.add('active');
    },

    // 关闭模态框
    closeModal() {
        const modal = document.getElementById('project-modal');
        modal.classList.remove('active');
        this.editingId = null;
        this.clearContentPrices();
    },

    // 保存项目
    save(event) {
        event.preventDefault();
        
        const project = {
            id: document.getElementById('project-id').value || null,
            name: document.getElementById('project-name').value,
            client: document.getElementById('project-client').value,
            start: document.getElementById('project-start').value,
            end: document.getElementById('project-end').value,
            contentPrices: this.getContentPrices(),
            payment: document.getElementById('project-payment').value,
            paymentStandards: this.getPaymentStandards(),
            paymentTerms: document.getElementById('project-payment-terms').value,
            formReq: document.getElementById('project-form-req').value,
            contentLength: document.getElementById('project-content-length').value,
            videoFormat: document.getElementById('project-video-format').value,
            coverReq: document.getElementById('project-cover-req').value,
            qualityReq: document.getElementById('project-quality-req').value,
            accountCount: document.getElementById('project-account-count').value,
            singleLimit: document.getElementById('project-single-limit').value,
            dailyLimit: document.getElementById('project-daily-limit').value,
            activityLink: document.getElementById('project-activity-link').value,
            publishReq: document.getElementById('project-publish-req').value,
            notes: document.getElementById('project-notes').value,
            status: document.getElementById('project-status').value
        };
        
        dataManager.saveProject(project);
        this.closeModal();
        this.render();
        dataManager.showToast(this.editingId ? '项目已更新' : '项目已创建');
    },

    // 删除当前项目
    deleteCurrent() {
        if (this.editingId) {
            this.delete(this.editingId);
            this.closeModal();
        }
    },

    // 查看详情（点击卡片）
    viewDetail(projectId) {
        // 长按或点击编辑
        this.openModal(projectId);
    },

    // 删除项目
    delete(projectId) {
        if (confirm('确定要删除这个项目吗？相关任务也会被删除。')) {
            dataManager.deleteProject(projectId);
            this.render();
            dataManager.showToast('项目已删除');
        }
    },

    // 显示导出选项
    showExportOptions(projectId) {
        const project = dataManager.getProjects().find(p => p.id === projectId);
        if (!project) return;

        const options = ['导出文字', '导出图片'];
        const choice = prompt('选择导出方式：\n1. 导出文字\n2. 导出图片\n\n输入数字 1 或 2');
        
        if (choice === '1') {
            this.exportAsText(project);
        } else if (choice === '2') {
            this.exportAsImage(project);
        }
    },

    // 导出为文字（键值对格式）
    exportAsText(project) {
        const lines = [];
        
        // 基本信息
        lines.push(`项目: ${project.name || '未命名'}`);
        if (project.client) lines.push(`甲方: ${project.client}`);
        if (project.start) lines.push(`开始日期: ${project.start}`);
        if (project.end) lines.push(`截止日期: ${project.end}`);
        
        // 内容报价
        if (project.contentPrices && project.contentPrices.length > 0) {
            project.contentPrices.forEach((item, index) => {
                const total = (parseFloat(item.price) || 0) * (parseFloat(item.quantity) || 0);
                lines.push(`内容${index + 1}: ${item.type || '未分类'} | 单价: ${item.price || 0}元 | 数量: ${item.quantity || 0} | 小计: ${total}元`);
            });
            const totalPrice = project.contentPrices.reduce((sum, item) => {
                return sum + ((parseFloat(item.price) || 0) * (parseFloat(item.quantity) || 0));
            }, 0);
            lines.push(`总价: ${totalPrice}元`);
        }
        
        // 结算信息
        const paymentMap = {
            'content_account': '内容发布账号',
            'any_account': '任意账号',
            'company': '对公结算',
            'other': '其他'
        };
        if (project.payment) lines.push(`结算方式: ${paymentMap[project.payment] || project.payment}`);
        if (project.paymentStandards && project.paymentStandards.length > 0) {
            lines.push(`结算标准: ${project.paymentStandards.join('、')}`);
        }
        if (project.paymentTerms) lines.push(`结算说明: ${project.paymentTerms}`);
        
        // 账号要求
        if (project.formReq) lines.push(`形式要求: ${project.formReq}`);
        if (project.contentLength) lines.push(`内容长度: ${project.contentLength}`);
        if (project.videoFormat) lines.push(`视频格式: ${project.videoFormat}`);
        if (project.coverReq) lines.push(`封面要求: ${project.coverReq}`);
        if (project.qualityReq) lines.push(`质量要求: ${project.qualityReq}`);
        if (project.accountCount) lines.push(`账号数量: ${project.accountCount}`);
        if (project.singleLimit) lines.push(`单账号上限: ${project.singleLimit}`);
        if (project.dailyLimit) lines.push(`单日上限: ${project.dailyLimit}`);
        
        // 发布要求
        if (project.activityLink) lines.push(`活动链接: ${project.activityLink}`);
        if (project.publishReq) lines.push(`发布要求: ${project.publishReq}`);
        
        // 备注
        if (project.notes) lines.push(`备注: ${project.notes}`);
        
        const content = lines.join('\n');
        
        // 复制到剪贴板
        navigator.clipboard.writeText(content).then(() => {
            // 同时提供下载
            const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${project.name || '项目'}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            dataManager.showToast('已导出并复制到剪贴板');
        }).catch(() => {
            dataManager.showToast('导出失败');
        });
    },

    // 导出为图片
    exportAsImage(project) {
        // 创建画布
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // 设置画布尺寸
        canvas.width = 800;
        canvas.height = 1000;
        
        // 背景
        ctx.fillStyle = '#1C1C1E';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 标题
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 32px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.fillText(project.name || '未命名项目', 40, 60);
        
        // 状态标签
        const statusMap = {
            'ongoing': '进行中',
            'completed': '已完成',
            'cancelled': '已取消'
        };
        const statusText = statusMap[project.status] || '进行中';
        ctx.fillStyle = project.status === 'completed' ? '#34C759' : '#007AFF';
        ctx.font = '16px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.fillText(statusText, 40, 90);
        
        // 分隔线
        ctx.strokeStyle = '#38383A';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(40, 110);
        ctx.lineTo(760, 110);
        ctx.stroke();
        
        // 内容
        let y = 150;
        ctx.fillStyle = '#8E8E93';
        ctx.font = '20px -apple-system, BlinkMacSystemFont, sans-serif';
        
        const addLine = (label, value) => {
            if (value) {
                ctx.fillStyle = '#8E8E93';
                ctx.fillText(label + ':', 40, y);
                ctx.fillStyle = '#FFFFFF';
                ctx.fillText(String(value), 200, y);
                y += 40;
            }
        };
        
        addLine('甲方', project.client);
        addLine('开始日期', project.start);
        addLine('截止日期', project.end);
        
        // 内容报价
        if (project.contentPrices && project.contentPrices.length > 0) {
            ctx.fillStyle = '#8E8E93';
            ctx.fillText('内容报价:', 40, y);
            y += 30;
            
            project.contentPrices.forEach((item, index) => {
                const total = (parseFloat(item.price) || 0) * (parseFloat(item.quantity) || 0);
                ctx.fillStyle = '#FFFFFF';
                ctx.font = '18px -apple-system, BlinkMacSystemFont, sans-serif';
                ctx.fillText(`${index + 1}. ${item.type || '未分类'}: ${item.price || 0}元 × ${item.quantity || 0} = ${total}元`, 60, y);
                y += 30;
            });
            
            const totalPrice = project.contentPrices.reduce((sum, item) => {
                return sum + ((parseFloat(item.price) || 0) * (parseFloat(item.quantity) || 0));
            }, 0);
            ctx.fillStyle = '#34C759';
            ctx.font = 'bold 22px -apple-system, BlinkMacSystemFont, sans-serif';
            ctx.fillText(`总计: ${totalPrice}元`, 60, y);
            y += 50;
            ctx.font = '20px -apple-system, BlinkMacSystemFont, sans-serif';
        }
        
        const paymentMap = {
            'content_account': '内容发布账号',
            'any_account': '任意账号',
            'company': '对公结算',
            'other': '其他'
        };
        addLine('结算方式', paymentMap[project.payment]);
        addLine('形式要求', project.formReq);
        addLine('内容长度', project.contentLength);
        addLine('视频格式', project.videoFormat);
        addLine('质量要求', project.qualityReq);
        addLine('发布要求', project.publishReq);
        
        // 下载图片
        canvas.toBlob(blob => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${project.name || '项目'}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            dataManager.showToast('图片已导出');
        });
    },

    // 处理粘贴事件
    handleSmartParse(event) {
        // 延迟执行，等待粘贴完成
        setTimeout(() => {
            this.smartParse();
        }, 100);
    },

    // 智能识别并填充
    smartParse() {
        const text = document.getElementById('project-smart-parse').value;
        if (!text.trim()) {
            dataManager.showToast('请先粘贴文字内容');
            return;
        }

        const parsed = this.parseProjectText(text);
        this.fillFormFields(parsed);
        dataManager.showToast('已识别并填充字段');
    },

    // 解析项目文本
    parseProjectText(text) {
        const result = {};

        // 项目名称 - 寻找活动/赛事名称
        const eventMatch = text.match(/(F1\s*\w+|\w+大赛|\w+活动|\w+赛事|\w+节|\w+周)/i);
        if (eventMatch) {
            result.name = eventMatch[1] + ' 合作项目';
        }

        // 甲方/客户 - 寻找品牌或平台
        const clientMatch = text.match(/(懂车帝|抖音|快手|小红书|B站|微博|知乎|百度|腾讯|阿里|字节|京东|天猫|拼多多|小米|华为|比亚迪|特斯拉|宝马|奔驰|奥迪|保时捷)/i);
        if (clientMatch) {
            result.client = clientMatch[1];
        }

        // 内容报价 - 匹配价格
        const priceMatches = text.matchAll(/(\d+)\s*[元块]?\s*[\/,每]\s*(条|篇|个|小时|分钟|次)/gi);
        const prices = [];
        for (const match of priceMatches) {
            prices.push({
                type: '视频',
                price: match[1],
                quantity: 1
            });
        }
        // 匹配 "每个方向合作X条"
        const directionMatch = text.match(/每个方向合作\s*(\d+)\s*条/);
        if (directionMatch && prices.length > 0) {
            prices[0].quantity = directionMatch[1];
        }
        // 匹配 "总计产出X篇"
        const totalMatch = text.match(/总计\s*(\d+)\s*(条|篇)/);
        if (totalMatch && prices.length > 0) {
            prices[0].quantity = totalMatch[1];
        }
        if (prices.length > 0) {
            result.contentPrices = prices;
        }

        // 形式要求 - 真人出镜
        if (text.includes('真人出镜')) {
            result.formReq = '真人出镜';
        } else if (text.includes('真人配音')) {
            result.formReq = '真人配音';
        } else if (text.includes('二创') || text.includes('剪辑')) {
            result.formReq = '二创剪辑';
        } else if (text.includes('实地拍摄')) {
            result.formReq = '实地拍摄';
        } else if (text.includes('实车')) {
            result.formReq = '实车拍摄';
        }

        // 内容长度
        const lengthMatch = text.match(/(\d+)\s*(分半|分钟|分|秒|小时|h|min)/i);
        if (lengthMatch) {
            result.contentLength = lengthMatch[1] + (lengthMatch[2].includes('分') ? '分钟' : lengthMatch[2]);
        }

        // 视频格式
        if (text.includes('竖版')) {
            result.videoFormat = '竖版';
        } else if (text.includes('横版')) {
            result.videoFormat = '横版';
        }

        // 封面要求
        if (text.includes('封面')) {
            const coverMatch = text.match(/封面[\s\S]{0,50}?([\d]+\s*kb|单独上传|避免截字|压缩)/i);
            if (coverMatch) {
                result.coverReq = text.match(/封面[\s\S]{0,100}/)?.[0]?.substring(0, 50) || '有封面要求';
            }
        }

        // 发布平台
        if (text.includes('懂车帝') || text.includes('抖音')) {
            result.publishReq = '仅可在懂车帝抖音发布';
        }

        // 发布时间
        const dateMatch = text.match(/(\d{1,2})\s*[月\/\.\-]?\s*(\d{1,2})\s*号?\s*之前?/);
        if (dateMatch) {
            const month = dateMatch[1].padStart(2, '0');
            const day = dateMatch[2].padStart(2, '0');
            const year = new Date().getFullYear();
            result.end = `${year}-${month}-${day}`;
        }

        // 结算标准 - 推荐/优质/人工
        result.paymentStandards = [];
        if (text.includes('推荐') || text.includes('流量投放')) {
            result.paymentStandards.push('推荐');
        }
        if (text.includes('优质') || text.includes('精选')) {
            result.paymentStandards.push('优质');
        }
        if (text.includes('人工') || text.includes('审核')) {
            result.paymentStandards.push('人工');
        }

        // 活动链接
        if (text.includes('关联活动') || text.includes('活动链接') || text.includes('活动地址') || text.includes('活动页')) {
            const activityMatch = text.match(/(关联活动|活动链接|活动地址|活动页)[：:]?\s*(https?:\/\/\S+|\S+\.com\/\S+|稍后|待定|暂无)/i);
            if (activityMatch) {
                result.activityLink = activityMatch[2] || '稍后提供';
            } else {
                result.activityLink = '稍后提供';
            }
        }

        // 质量要求 - 提取内容方向作为质量要求
        const directionSection = text.match(/【内容方向】([\s\S]*?)(?=【|$)/);
        if (directionSection) {
            result.qualityReq = directionSection[1].trim().substring(0, 100);
        }

        return result;
    },

    // 填充表单字段
    fillFormFields(parsed) {
        if (parsed.name) document.getElementById('project-name').value = parsed.name;
        if (parsed.client) document.getElementById('project-client').value = parsed.client;
        if (parsed.end) document.getElementById('project-end').value = parsed.end;

        // 填充内容报价
        if (parsed.contentPrices && parsed.contentPrices.length > 0) {
            this.clearContentPrices();
            parsed.contentPrices.forEach(price => this.addContentPrice(price));
        }

        if (parsed.formReq) document.getElementById('project-form-req').value = parsed.formReq;
        if (parsed.contentLength) document.getElementById('project-content-length').value = parsed.contentLength;
        if (parsed.videoFormat) document.getElementById('project-video-format').value = parsed.videoFormat;
        if (parsed.coverReq) document.getElementById('project-cover-req').value = parsed.coverReq;
        if (parsed.qualityReq) document.getElementById('project-quality-req').value = parsed.qualityReq;
        if (parsed.publishReq) document.getElementById('project-publish-req').value = parsed.publishReq;
        if (parsed.activityLink) document.getElementById('project-activity-link').value = parsed.activityLink;

        // 填充结算标准
        if (parsed.paymentStandards) {
            this.setPaymentStandards(parsed.paymentStandards);
        }
    }
};
