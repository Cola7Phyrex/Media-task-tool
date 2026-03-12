// 数据管理器
const dataManager = {
    // 默认数据
    defaultData: {
        projects: [],
        tasks: [],
        people: [],
        templates: [
            {
                id: '1',
                name: '短视频脚本模板',
                content: `【开头钩子】
{{hook}}

【内容主体】
{{content}}

【结尾引导】
{{cta}}

【标签】
{{tags}}`,
                inputs: ['hook', 'content', 'cta', 'tags']
            },
            {
                id: '2',
                name: '产品种草文案',
                content: `姐妹们！今天必须给你们安利这个{{product}}！

{{benefits}}

使用方法超简单：
{{usage}}

{{price_info}}

#{{tag1}} #{{tag2}}`,
                inputs: ['product', 'benefits', 'usage', 'price_info', 'tag1', 'tag2']
            },
            {
                id: '3',
                name: '剧情类开头',
                content: `{{scenario}}

就在我以为{{expectation}}的时候，{{twist}}

{{continuation}}`,
                inputs: ['scenario', 'expectation', 'twist', 'continuation']
            }
        ],
        settings: {
            lastSync: null
        }
    },

    // 初始化数据
    init() {
        const data = this.load();
        if (!data) {
            this.save(this.defaultData);
        }
        return this.load();
    },

    // 加载数据
    load() {
        try {
            const data = localStorage.getItem('studioManagerData');
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('加载数据失败:', e);
            return null;
        }
    },

    // 保存数据
    save(data) {
        try {
            localStorage.setItem('studioManagerData', JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('保存数据失败:', e);
            return false;
        }
    },

    // 获取所有数据
    getAll() {
        return this.load() || this.init();
    },

    // 获取项目
    getProjects() {
        return this.getAll().projects || [];
    },

    // 获取任务
    getTasks() {
        return this.getAll().tasks || [];
    },

    // 获取人员
    getPeople() {
        return this.getAll().people || [];
    },

    // 获取模板
    getTemplates() {
        return this.getAll().templates || this.defaultData.templates;
    },

    // 保存项目
    saveProject(project) {
        const data = this.getAll();
        const index = data.projects.findIndex(p => p.id === project.id);
        if (index >= 0) {
            data.projects[index] = { ...data.projects[index], ...project, updatedAt: new Date().toISOString() };
        } else {
            project.id = project.id || Date.now().toString();
            project.createdAt = new Date().toISOString();
            project.updatedAt = project.createdAt;
            data.projects.push(project);
        }
        this.save(data);
        return project;
    },

    // 删除项目
    deleteProject(id) {
        const data = this.getAll();
        data.projects = data.projects.filter(p => p.id !== id);
        // 同时删除关联的任务
        data.tasks = data.tasks.filter(t => t.projectId !== id);
        this.save(data);
        return true;
    },

    // 保存任务
    saveTask(task) {
        const data = this.getAll();
        const index = data.tasks.findIndex(t => t.id === task.id);
        if (index >= 0) {
            data.tasks[index] = { ...data.tasks[index], ...task, updatedAt: new Date().toISOString() };
        } else {
            task.id = task.id || Date.now().toString();
            task.createdAt = new Date().toISOString();
            task.updatedAt = task.createdAt;
            data.tasks.push(task);
        }
        this.save(data);
        return task;
    },

    // 删除任务
    deleteTask(id) {
        const data = this.getAll();
        data.tasks = data.tasks.filter(t => t.id !== id);
        this.save(data);
        return true;
    },

    // 保存人员
    savePerson(person) {
        const data = this.getAll();
        const index = data.people.findIndex(p => p.id === person.id);
        if (index >= 0) {
            data.people[index] = { ...data.people[index], ...person, updatedAt: new Date().toISOString() };
        } else {
            person.id = person.id || Date.now().toString();
            person.createdAt = new Date().toISOString();
            person.updatedAt = person.createdAt;
            data.people.push(person);
        }
        this.save(data);
        return person;
    },

    // 删除人员
    deletePerson(id) {
        const data = this.getAll();
        data.people = data.people.filter(p => p.id !== id);
        this.save(data);
        return true;
    },

    // 获取人员统计
    getPersonStats(personId) {
        const tasks = this.getTasks().filter(t => t.assignee === personId);
        const projects = [...new Set(tasks.map(t => t.projectId))];
        const totalPrice = tasks.reduce((sum, t) => sum + (parseFloat(t.price) || 0), 0);
        return {
            taskCount: tasks.length,
            projectCount: projects.length,
            totalPrice: totalPrice
        };
    },

    // 导出数据
    exportData() {
        const data = this.getAll();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `studio-manager-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        this.showToast('数据已导出');
    },

    // 导入数据
    importData() {
        document.getElementById('import-file').click();
    },

    // 处理导入
    handleImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (confirm('导入数据将覆盖现有数据，是否继续？')) {
                    this.save(data);
                    location.reload();
                }
            } catch (err) {
                this.showToast('导入失败：文件格式错误');
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    },

    // 显示提示
    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.remove();
        }, 2000);
    },

    // 格式化日期
    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return `${date.getMonth() + 1}/${date.getDate()}`;
    },

    // 格式化金额
    formatPrice(price) {
        if (!price) return '¥0';
        return '¥' + parseFloat(price).toLocaleString();
    },

    // 格式化日期时间
    formatDateTime(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
    }
};
