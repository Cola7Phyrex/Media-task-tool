// 任务管理器
const taskManager = {
    currentFilter: 'all',
    editingId: null,

    // 初始化
    init() {
        this.render();
        this.setupFilters();
    },

    // 设置筛选器
    setupFilters() {
        const tabs = document.querySelectorAll('#tasks-page .filter-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.currentFilter = tab.dataset.filter;
                this.render();
            });
        });
    },

    // 获取筛选后的任务
    getFilteredTasks() {
        let tasks = dataManager.getTasks();
        
        // 状态筛选
        if (this.currentFilter !== 'all') {
            tasks = tasks.filter(t => t.status === this.currentFilter);
        }
        
        // 搜索筛选
        const searchTerm = document.getElementById('task-search')?.value?.toLowerCase() || '';
        if (searchTerm) {
            tasks = tasks.filter(t => 
                t.name?.toLowerCase().includes(searchTerm) ||
                t.qualityReq?.toLowerCase().includes(searchTerm) ||
                t.notes?.toLowerCase().includes(searchTerm)
            );
        }
        
        // 按截止时间排序
        return tasks.sort((a, b) => {
            if (a.end && b.end) {
                return new Date(a.end) - new Date(b.end);
            }
            return new Date(b.updatedAt) - new Date(a.updatedAt);
        });
    },

    // 渲染任务列表
    render() {
        const container = document.getElementById('tasks-list');
        const tasks = this.getFilteredTasks();
        
        if (tasks.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">✓</div>
                    <h3>暂无任务</h3>
                    <p>点击右上角按钮创建新任务</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = tasks.map(task => this.createTaskCard(task)).join('');
    },

    // 创建任务卡片
    createTaskCard(task) {
        const statusText = {
            'todo': '待办',
            'doing': '进行中',
            'done': '已完成'
        }[task.status] || '待办';
        
        const project = dataManager.getProjects().find(p => p.id === task.projectId);
        const person = dataManager.getPeople().find(p => p.id === task.assignee);
        
        let deadlineClass = '';
        let deadlineText = '';
        if (task.end) {
            const deadline = new Date(task.end);
            const now = new Date();
            const diff = deadline - now;
            const hoursLeft = diff / (1000 * 60 * 60);
            
            if (task.status !== 'done') {
                if (hoursLeft < 0) {
                    deadlineClass = 'style="color: var(--danger);"';
                    deadlineText = '已逾期';
                } else if (hoursLeft < 24) {
                    deadlineClass = 'style="color: var(--warning);"';
                    deadlineText = '今天截止';
                }
            }
        }
        
        // 统计通用质量要求数量
        let qualityCount = 0;
        if (task.qualityStandards) {
            qualityCount = task.qualityStandards.length;
        }
        
        return `
            <div class="card">
                <div class="card-header" onclick="taskManager.openModal('${task.id}')">
                    <div class="card-title">${task.name}</div>
                    <span class="card-status status-${task.status}">${statusText}</span>
                </div>
                <div class="card-body" onclick="taskManager.openModal('${task.id}')">
                    ${project ? `<p>📁 ${project.name}</p>` : ''}
                    ${person ? `<p>👤 ${person.name}</p>` : ''}
                    ${task.formReq ? `<p>🎬 ${task.formReq}</p>` : ''}
                    ${qualityCount > 0 ? `<p>✓ ${qualityCount}项质量要求</p>` : ''}
                </div>
                <div class="card-footer">
                    <div class="card-meta" onclick="taskManager.openModal('${task.id}')" ${deadlineClass}>
                        ${task.end ? `⏰ ${dataManager.formatDate(task.end)} ${deadlineText}` : ''}
                    </div>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        ${task.price ? `<div class="card-price" onclick="taskManager.openModal('${task.id}')">${dataManager.formatPrice(task.price)}</div>` : ''}
                        ${task.videoFormat ? `<span style="font-size: 12px; color: var(--text-secondary);" onclick="taskManager.openModal('${task.id}')">${task.videoFormat}</span>` : ''}
                        <button type="button" class="btn-icon" onclick="event.stopPropagation(); taskManager.showExportOptions('${task.id}')" title="导出" style="width: 32px; height: 32px; font-size: 14px;">📤</button>
                    </div>
                </div>
            </div>
        `;
    },

    // 搜索
    search(value) {
        this.render();
    },

    // 更新项目选择下拉框
    updateProjectSelect() {
        const select = document.getElementById('task-project');
        const projects = dataManager.getProjects();
        select.innerHTML = '<option value="">不关联项目（手动填写）</option>' + 
            projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
    },

    // 更新人员选择下拉框
    updateAssigneeSelect() {
        const select = document.getElementById('task-assignee');
        const people = dataManager.getPeople();
        select.innerHTML = '<option value="">选择执行人员</option>' + 
            people.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
    },

    // 项目选择变化时同步信息
    onProjectChange(projectId) {
        if (!projectId) return;
        
        const project = dataManager.getProjects().find(p => p.id === projectId);
        if (!project) return;
        
        // 同步项目信息到任务表单
        if (project.start) document.getElementById('task-start').value = project.start;
        if (project.end) document.getElementById('task-end').value = project.end;
        if (project.formReq) document.getElementById('task-form-req').value = project.formReq;
        if (project.contentLength) document.getElementById('task-content-length').value = project.contentLength;
        if (project.videoFormat) document.getElementById('task-video-format').value = project.videoFormat;
        if (project.coverReq) document.getElementById('task-cover-req').value = project.coverReq;
        if (project.qualityReq) document.getElementById('task-quality-req').value = project.qualityReq;
        
        dataManager.showToast('已同步项目信息');
    },

    // 获取通用质量要求
    getQualityStandards() {
        const standards = [];
        if (document.getElementById('quality-watermark').checked) {
            standards.push('素材不能出现水印、品牌logo、真人人脸等敏感信息');
        }
        if (document.getElementById('quality-match').checked) {
            standards.push('文案与画面完全对应');
        }
        if (document.getElementById('quality-car').checked) {
            standards.push('封面图必须包含清晰、完整的车');
        }
        if (document.getElementById('quality-human').checked) {
            standards.push('文案有真人感，禁止AI味');
        }
        if (document.getElementById('quality-keyword').checked) {
            standards.push('需要植入关键词');
        }
        if (document.getElementById('quality-other-check').checked) {
            const otherText = document.getElementById('quality-other-text').value;
            if (otherText) {
                standards.push(`其他：${otherText}`);
            }
        }
        return standards;
    },

    // 设置通用质量要求
    setQualityStandards(standards) {
        document.getElementById('quality-watermark').checked = false;
        document.getElementById('quality-match').checked = false;
        document.getElementById('quality-car').checked = false;
        document.getElementById('quality-human').checked = false;
        document.getElementById('quality-keyword').checked = false;
        document.getElementById('quality-other-check').checked = false;
        document.getElementById('quality-other-text').value = '';
        
        if (!standards || standards.length === 0) return;
        
        standards.forEach(std => {
            if (std === '素材不能出现水印、品牌logo、真人人脸等敏感信息') {
                document.getElementById('quality-watermark').checked = true;
            } else if (std === '文案与画面完全对应') {
                document.getElementById('quality-match').checked = true;
            } else if (std === '封面图必须包含清晰、完整的车') {
                document.getElementById('quality-car').checked = true;
            } else if (std === '文案有真人感，禁止AI味') {
                document.getElementById('quality-human').checked = true;
            } else if (std === '需要植入关键词') {
                document.getElementById('quality-keyword').checked = true;
            } else if (std.startsWith('其他：')) {
                document.getElementById('quality-other-check').checked = true;
                document.getElementById('quality-other-text').value = std.substring(3);
            }
        });
    },

    // 打开模态框
    openModal(taskId = null) {
        this.editingId = taskId;
        this.updateProjectSelect();
        this.updateAssigneeSelect();
        
        const modal = document.getElementById('task-modal');
        const title = document.getElementById('task-modal-title');
        const deleteBtn = document.getElementById('task-delete-btn');
        
        if (taskId) {
            const task = dataManager.getTasks().find(t => t.id === taskId);
            if (task) {
                title.textContent = '编辑任务';
                document.getElementById('task-id').value = task.id;
                document.getElementById('task-name').value = task.name || '';
                document.getElementById('task-project').value = task.projectId || '';
                document.getElementById('task-assignee').value = task.assignee || '';
                document.getElementById('task-start').value = task.start || '';
                document.getElementById('task-end').value = task.end || '';
                document.getElementById('task-form-req').value = task.formReq || '';
                document.getElementById('task-content-length').value = task.contentLength || '';
                document.getElementById('task-video-format').value = task.videoFormat || '';
                document.getElementById('task-cover-req').value = task.coverReq || '';
                document.getElementById('task-quality-req').value = task.qualityReq || '';
                this.setQualityStandards(task.qualityStandards);
                document.getElementById('task-price').value = task.price || '';
                document.getElementById('task-status').value = task.status || 'todo';
                document.getElementById('task-notes').value = task.notes || '';
                
                // 显示删除按钮
                deleteBtn.style.display = 'inline-block';
            }
        } else {
            title.textContent = '新建任务';
            document.getElementById('task-form').reset();
            document.getElementById('task-id').value = '';
            document.getElementById('task-status').value = 'todo';
            this.setQualityStandards([]);
            
            // 隐藏删除按钮
            deleteBtn.style.display = 'none';
        }
        
        modal.classList.add('active');
    },

    // 关闭模态框
    closeModal() {
        const modal = document.getElementById('task-modal');
        modal.classList.remove('active');
        this.editingId = null;
    },

    // 保存任务
    save(event) {
        event.preventDefault();
        
        const task = {
            id: document.getElementById('task-id').value || null,
            name: document.getElementById('task-name').value,
            projectId: document.getElementById('task-project').value,
            assignee: document.getElementById('task-assignee').value,
            start: document.getElementById('task-start').value,
            end: document.getElementById('task-end').value,
            formReq: document.getElementById('task-form-req').value,
            contentLength: document.getElementById('task-content-length').value,
            videoFormat: document.getElementById('task-video-format').value,
            coverReq: document.getElementById('task-cover-req').value,
            qualityReq: document.getElementById('task-quality-req').value,
            qualityStandards: this.getQualityStandards(),
            price: document.getElementById('task-price').value,
            status: document.getElementById('task-status').value,
            notes: document.getElementById('task-notes').value
        };
        
        dataManager.saveTask(task);
        this.closeModal();
        this.render();
        dataManager.showToast(this.editingId ? '任务已更新' : '任务已创建');
    },

    // 删除当前任务
    deleteCurrent() {
        if (this.editingId) {
            this.delete(this.editingId);
            this.closeModal();
        }
    },

    // 删除任务
    delete(taskId) {
        if (confirm('确定要删除这个任务吗？')) {
            dataManager.deleteTask(taskId);
            this.render();
            dataManager.showToast('任务已删除');
        }
    },

    // 显示导出选项
    showExportOptions(taskId) {
        const task = dataManager.getTasks().find(t => t.id === taskId);
        if (!task) return;

        const choice = prompt('选择导出方式：\n1. 导出文字\n2. 导出图片\n\n输入数字 1 或 2');
        
        if (choice === '1') {
            this.exportAsText(task);
        } else if (choice === '2') {
            this.exportAsImage(task);
        }
    },

    // 导出为文字
    exportAsText(task) {
        const lines = [];
        const project = dataManager.getProjects().find(p => p.id === task.projectId);
        const person = dataManager.getPeople().find(p => p.id === task.assignee);
        
        lines.push(`任务: ${task.name || '未命名'}`);
        if (project) lines.push(`关联项目: ${project.name}`);
        if (person) lines.push(`执行人员: ${person.name}`);
        if (task.start) lines.push(`开始时间: ${task.start}`);
        if (task.end) lines.push(`截止时间: ${task.end}`);
        
        if (task.formReq) lines.push(`形式要求: ${task.formReq}`);
        if (task.contentLength) lines.push(`内容长度: ${task.contentLength}`);
        if (task.videoFormat) lines.push(`视频格式: ${task.videoFormat}`);
        if (task.coverReq) lines.push(`封面要求: ${task.coverReq}`);
        if (task.qualityReq) lines.push(`质量要求: ${task.qualityReq}`);
        
        if (task.qualityStandards && task.qualityStandards.length > 0) {
            lines.push('通用质量要求:');
            task.qualityStandards.forEach(std => {
                lines.push(`  ✓ ${std}`);
            });
        }
        
        if (task.price) lines.push(`价格: ${task.price}元`);
        if (task.notes) lines.push(`备注: ${task.notes}`);
        
        const content = lines.join('\n');
        
        navigator.clipboard.writeText(content).then(() => {
            const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${task.name || '任务'}.txt`;
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
    exportAsImage(task) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = 800;
        canvas.height = 900;
        
        ctx.fillStyle = '#1C1C1E';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 32px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.fillText(task.name || '未命名任务', 40, 60);
        
        const statusMap = {
            'todo': '待办',
            'doing': '进行中',
            'done': '已完成'
        };
        const statusText = statusMap[task.status] || '待办';
        ctx.fillStyle = task.status === 'done' ? '#34C759' : (task.status === 'doing' ? '#007AFF' : '#8E8E93');
        ctx.font = '16px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.fillText(statusText, 40, 90);
        
        ctx.strokeStyle = '#38383A';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(40, 110);
        ctx.lineTo(760, 110);
        ctx.stroke();
        
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
        
        const project = dataManager.getProjects().find(p => p.id === task.projectId);
        const person = dataManager.getPeople().find(p => p.id === task.assignee);
        
        if (project) addLine('关联项目', project.name);
        if (person) addLine('执行人员', person.name);
        addLine('开始时间', task.start);
        addLine('截止时间', task.end);
        addLine('形式要求', task.formReq);
        addLine('内容长度', task.contentLength);
        addLine('视频格式', task.videoFormat);
        addLine('封面要求', task.coverReq);
        addLine('质量要求', task.qualityReq);
        if (task.price) addLine('价格', task.price + '元');
        
        if (task.qualityStandards && task.qualityStandards.length > 0) {
            ctx.fillStyle = '#8E8E93';
            ctx.fillText('通用质量要求:', 40, y);
            y += 30;
            
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '18px -apple-system, BlinkMacSystemFont, sans-serif';
            task.qualityStandards.forEach(std => {
                ctx.fillText(`✓ ${std.substring(0, 40)}${std.length > 40 ? '...' : ''}`, 60, y);
                y += 28;
            });
        }
        
        canvas.toBlob(blob => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${task.name || '任务'}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            dataManager.showToast('图片已导出');
        });
    }
};
