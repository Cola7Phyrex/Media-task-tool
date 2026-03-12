// 人员管理器
const peopleManager = {
    editingId: null,
    capacityCounter: 0,

    // 初始化
    init() {
        this.render();
    },

    // 渲染人员列表
    render() {
        const container = document.getElementById('people-list');
        const people = dataManager.getPeople();
        
        if (people.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">👥</div>
                    <h3>暂无成员</h3>
                    <p>点击右上角按钮添加成员</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = people.map(person => this.createPersonCard(person)).join('');
    },

    // 创建人员卡片
    createPersonCard(person) {
        const stats = dataManager.getPersonStats(person.id);
        const initials = person.name.charAt(0).toUpperCase();
        
        // 计算每日总产能
        let dailyOutput = 0;
        if (person.capacities && person.capacities.length > 0) {
            dailyOutput = person.capacities.reduce((sum, item) => sum + (parseFloat(item.output) || 0), 0);
        }
        
        // 生成内容类型标签
        let capacityTags = '';
        if (person.capacities && person.capacities.length > 0) {
            capacityTags = person.capacities.slice(0, 3).map(c => c.type).join(' · ');
            if (person.capacities.length > 3) {
                capacityTags += ` +${person.capacities.length - 3}`;
            }
        }
        
        return `
            <div class="card people-card" onclick="peopleManager.openModal('${person.id}')">
                <div class="card-body">
                    <div class="people-avatar">${initials}</div>
                    <div class="people-info">
                        <div class="people-name">${person.name}</div>
                        <div class="people-role">${capacityTags || '未设置内容类型'}</div>
                    </div>
                    <div class="people-stats">
                        <div class="people-count">${stats.taskCount}</div>
                        <div class="people-label">任务</div>
                    </div>
                </div>
                <div class="card-footer">
                    <div class="card-meta">
                        ${person.contact || ''}
                    </div>
                    ${dailyOutput > 0 ? `<div class="card-price">${dailyOutput}条/天</div>` : ''}
                </div>
            </div>
        `;
    },

    // 添加内容类型行
    addCapacity(data = null) {
        this.capacityCounter++;
        const id = this.capacityCounter;
        const container = document.getElementById('people-capacity-list');
        
        const row = document.createElement('div');
        row.className = 'capacity-row';
        row.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr 1fr auto; gap: 8px; margin-bottom: 8px; align-items: center;';
        row.dataset.capacityId = id;
        
        const typeOptions = ['真人', '配音', '剪辑', '实拍', '直播', '其他'];
        const isCustom = data?.type && !typeOptions.includes(data.type);
        
        row.innerHTML = `
            <select class="capacity-type" onchange="peopleManager.handleTypeChange(${id}, this.value)" style="padding: 10px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-primary);">
                <option value="">内容类型</option>
                ${typeOptions.map(opt => `<option value="${opt}" ${data?.type === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                <option value="custom" ${isCustom ? 'selected' : ''}>自定义...</option>
            </select>
            <input type="text" class="capacity-custom-type" placeholder="自定义类型" value="${isCustom ? data?.type : ''}" style="padding: 10px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-primary); display: ${isCustom ? 'block' : 'none'};">
            <input type="number" class="capacity-price" placeholder="价格" value="${data?.price || ''}" style="padding: 10px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-primary);">
            <input type="number" class="capacity-output" placeholder="产能/天" value="${data?.output || ''}" style="padding: 10px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-primary);">
            <button type="button" onclick="peopleManager.removeCapacity(${id})" style="background: var(--danger); color: white; border: none; border-radius: 8px; padding: 10px; cursor: pointer; font-size: 16px;">×</button>
        `;
        
        container.appendChild(row);
    },

    // 处理类型选择变化
    handleTypeChange(id, value) {
        const row = document.querySelector(`[data-capacity-id="${id}"]`);
        const customInput = row.querySelector('.capacity-custom-type');
        if (value === 'custom') {
            customInput.style.display = 'block';
            customInput.focus();
        } else {
            customInput.style.display = 'none';
        }
    },

    // 删除内容类型行
    removeCapacity(id) {
        const row = document.querySelector(`[data-capacity-id="${id}"]`);
        if (row) {
            row.remove();
        }
    },

    // 获取所有内容类型
    getCapacities() {
        const rows = document.querySelectorAll('.capacity-row');
        const capacities = [];
        rows.forEach(row => {
            let type = row.querySelector('.capacity-type').value;
            if (type === 'custom') {
                type = row.querySelector('.capacity-custom-type').value || '其他';
            }
            const price = row.querySelector('.capacity-price').value;
            const output = row.querySelector('.capacity-output').value;
            if (type || price || output) {
                capacities.push({ type, price, output });
            }
        });
        return capacities;
    },

    // 清空内容类型
    clearCapacities() {
        document.getElementById('people-capacity-list').innerHTML = '';
        this.capacityCounter = 0;
    },

    // 打开模态框
    openModal(personId = null) {
        this.editingId = personId;
        this.clearCapacities();
        
        const modal = document.getElementById('people-modal');
        const title = document.getElementById('people-modal-title');
        const deleteBtn = document.getElementById('people-delete-btn');
        
        if (personId) {
            const person = dataManager.getPeople().find(p => p.id === personId);
            if (person) {
                title.textContent = '编辑成员';
                document.getElementById('people-id').value = person.id;
                document.getElementById('people-name').value = person.name || '';
                document.getElementById('people-contact').value = person.contact || '';
                document.getElementById('people-notes').value = person.notes || '';
                
                // 加载内容类型
                if (person.capacities && person.capacities.length > 0) {
                    person.capacities.forEach(capacity => this.addCapacity(capacity));
                }
                
                // 显示删除按钮
                deleteBtn.style.display = 'inline-block';
            }
        } else {
            title.textContent = '添加成员';
            document.getElementById('people-form').reset();
            document.getElementById('people-id').value = '';
            // 默认添加一个空行
            this.addCapacity();
            
            // 隐藏删除按钮
            deleteBtn.style.display = 'none';
        }
        
        modal.classList.add('active');
    },

    // 关闭模态框
    closeModal() {
        const modal = document.getElementById('people-modal');
        modal.classList.remove('active');
        this.editingId = null;
        this.clearCapacities();
    },

    // 保存人员
    save(event) {
        event.preventDefault();
        
        const person = {
            id: document.getElementById('people-id').value || null,
            name: document.getElementById('people-name').value,
            capacities: this.getCapacities(),
            contact: document.getElementById('people-contact').value,
            notes: document.getElementById('people-notes').value
        };
        
        dataManager.savePerson(person);
        this.closeModal();
        this.render();
        dataManager.showToast(this.editingId ? '成员已更新' : '成员已添加');
    },

    // 删除当前人员
    deleteCurrent() {
        if (this.editingId) {
            this.delete(this.editingId);
            this.closeModal();
        }
    },

    // 删除人员
    delete(personId) {
        if (confirm('确定要删除这个成员吗？')) {
            dataManager.deletePerson(personId);
            this.render();
            dataManager.showToast('成员已删除');
        }
    }
};
