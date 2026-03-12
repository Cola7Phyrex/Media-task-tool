// 主应用
const app = {
    // 初始化
    init() {
        // 初始化数据
        dataManager.init();
        
        // 初始化各模块
        projectManager.init();
        taskManager.init();
        peopleManager.init();
        
        // 设置导航
        this.setupNavigation();
        
        // 设置模态框关闭
        this.setupModalClose();
        
        // 注册 Service Worker (PWA)
        this.registerServiceWorker();
        
        console.log('自媒体工作室管理工具已启动');
    },

    // 设置导航
    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        const pages = document.querySelectorAll('.page');
        
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const targetPage = item.dataset.page;
                
                // 更新导航状态
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
                
                // 切换页面
                pages.forEach(page => {
                    page.classList.remove('active');
                    if (page.id === `${targetPage}-page`) {
                        page.classList.add('active');
                    }
                });
                
                // 刷新当前页面数据
                this.refreshPage(targetPage);
            });
        });
    },

    // 刷新页面数据
    refreshPage(pageName) {
        switch(pageName) {
            case 'projects':
                projectManager.render();
                break;
            case 'tasks':
                taskManager.render();
                break;
            case 'people':
                peopleManager.render();
                break;
        }
    },

    // 设置模态框关闭
    setupModalClose() {
        // 点击模态框背景关闭
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        });

        // ESC键关闭模态框
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal.active').forEach(modal => {
                    modal.classList.remove('active');
                });
            }
        });
    },

    // 注册 Service Worker
    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js')
                .then(registration => {
                    console.log('Service Worker 注册成功:', registration);
                })
                .catch(error => {
                    console.log('Service Worker 注册失败:', error);
                });
        }
    }
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});

// 防止iOS双击缩放
let lastTouchEnd = 0;
document.addEventListener('touchend', (event) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);

// 防止iOS橡皮筋效果
document.body.addEventListener('touchmove', (e) => {
    if (e.target.closest('.modal-content') || e.target.closest('.card-list')) {
        return;
    }
    if (document.body.scrollHeight <= window.innerHeight) {
        e.preventDefault();
    }
}, { passive: false });
