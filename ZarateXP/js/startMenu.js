// Start Menu Manager Module
export class StartMenuManager {
    constructor() {
        this.startMenu = document.querySelector('.startmenu');
        this.allProgramsMenu = document.querySelector('.all-programs-menu');
        this.recentlyUsedMenu = document.querySelector('.recently-used-menu');
        this.isOpen = false;
        this.currentSubmenu = null;
    }
    
    init() {
        this.setupMenuItems();
        this.setupSubmenus();
        this.setupFooterButtons();
    }
    
    setupMenuItems() {
        // Handle all menu items
        const menuItems = this.startMenu.querySelectorAll('.menu-item');
        
        menuItems.forEach(item => {
            if (item.classList.contains('disabled')) return;
            
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                
                const action = item.getAttribute('data-action');
                const programName = item.getAttribute('data-program-name');
                const url = item.getAttribute('data-url');
                
                if (action === 'open-program' && programName) {
                    this.openProgram(programName);
                } else if (action === 'open-url' && url) {
                    this.openUrl(url);
                } else if (action === 'toggle-all-programs') {
                    this.toggleAllPrograms();
                } else if (action === 'toggle-recently-used') {
                    this.toggleRecentlyUsed();
                }
            });
            
            // Hover effect for submenus
            if (item.getAttribute('data-action') === 'toggle-recently-used') {
                item.addEventListener('mouseenter', () => {
                    this.showRecentlyUsed();
                });
            }
        });
        
        // All programs button
        const allProgramsBtn = document.getElementById('menu-all-programs');
        if (allProgramsBtn) {
            allProgramsBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleAllPrograms();
            });
        }
    }
    
    setupSubmenus() {
        // All Programs Menu
        const allProgramsItems = this.allProgramsMenu.querySelectorAll('.all-programs-item');
        allProgramsItems.forEach(item => {
            if (item.classList.contains('disabled')) return;
            
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                
                const action = item.getAttribute('data-action');
                const programName = item.getAttribute('data-program-name');
                const url = item.getAttribute('data-url');
                
                if (action === 'open-program' && programName) {
                    this.openProgram(programName);
                } else if (action === 'open-url' && url) {
                    this.openUrl(url);
                }
            });
        });
        
        // Recently Used Menu
        const recentlyUsedItems = this.recentlyUsedMenu.querySelectorAll('.recently-used-item');
        recentlyUsedItems.forEach(item => {
            if (item.classList.contains('disabled')) return;
            
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                // Disabled items don't do anything
            });
        });
        
        // Hide submenus when clicking outside
        document.addEventListener('click', () => {
            this.hideAllSubmenus();
        });
        
        // Hide submenus when mouse leaves the area
        this.startMenu.addEventListener('mouseleave', () => {
            setTimeout(() => {
                if (!this.isMouseOverSubmenu()) {
                    this.hideAllSubmenus();
                }
            }, 100);
        });
    }
    
    setupFooterButtons() {
        // Log off button
        const logOffBtn = document.getElementById('btn-log-off');
        if (logOffBtn) {
            logOffBtn.addEventListener('click', () => {
                this.showLogOffDialog();
            });
        }
        
        // Shut down button
        const shutDownBtn = document.getElementById('btn-shut-down');
        if (shutDownBtn) {
            shutDownBtn.addEventListener('click', () => {
                this.showLogOffDialog();
            });
        }
    }
    
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }
    
    open() {
        this.startMenu.style.visibility = 'visible';
        this.startMenu.style.opacity = '1';
        this.isOpen = true;
        
        // Play sound
        if (window.zarateXP?.soundManager) {
            window.zarateXP.soundManager.play('click');
        }
        
        // Animate menu items
        this.animateMenuItems();
    }
    
    close() {
        this.startMenu.style.visibility = 'hidden';
        this.startMenu.style.opacity = '0';
        this.isOpen = false;
        this.hideAllSubmenus();
    }
    
    toggleAllPrograms() {
        if (this.allProgramsMenu.style.display === 'block') {
            this.allProgramsMenu.style.display = 'none';
        } else {
            this.hideAllSubmenus();
            this.allProgramsMenu.style.display = 'block';
            this.currentSubmenu = this.allProgramsMenu;
            this.positionSubmenu(this.allProgramsMenu);
        }
    }
    
    toggleRecentlyUsed() {
        if (this.recentlyUsedMenu.style.display === 'block') {
            this.recentlyUsedMenu.style.display = 'none';
        } else {
            this.showRecentlyUsed();
        }
    }
    
    showRecentlyUsed() {
        this.hideAllSubmenus();
        this.recentlyUsedMenu.style.display = 'block';
        this.currentSubmenu = this.recentlyUsedMenu;
        
        // Position the submenu
        const menuItem = document.getElementById('menu-program4');
        if (menuItem) {
            const rect = menuItem.getBoundingClientRect();
            const menuRect = this.startMenu.getBoundingClientRect();
            this.recentlyUsedMenu.style.top = (rect.top - menuRect.top) + 'px';
        }
    }
    
    hideAllSubmenus() {
        this.allProgramsMenu.style.display = 'none';
        this.recentlyUsedMenu.style.display = 'none';
        this.currentSubmenu = null;
    }
    
    positionSubmenu(submenu) {
        // Position submenu to the right of the start menu
        const startMenuRect = this.startMenu.getBoundingClientRect();
        submenu.style.left = startMenuRect.width + 'px';
    }
    
    isMouseOverSubmenu() {
        if (!this.currentSubmenu) return false;
        
        const rect = this.currentSubmenu.getBoundingClientRect();
        const mouseX = window.mouseX || 0;
        const mouseY = window.mouseY || 0;
        
        return mouseX >= rect.left && mouseX <= rect.right &&
               mouseY >= rect.top && mouseY <= rect.bottom;
    }
    
    openProgram(programName) {
        this.close();
        
        if (window.zarateXP?.appManager) {
            window.zarateXP.appManager.openApp(programName);
        }
    }
    
    openUrl(url) {
        this.close();
        window.open(url, '_blank');
    }
    
    showLogOffDialog() {
        this.close();
        
        const dialog = document.getElementById('logoff-dialog-container');
        dialog.classList.remove('logoff-dialog-hidden');
        
        // Setup dialog buttons
        const cancelBtn = document.getElementById('logoff-cancel-btn');
        const logOffBtn = document.getElementById('logoff-log-off-btn');
        const restartBtn = document.getElementById('logoff-switch-user-btn');
        
        cancelBtn.onclick = () => {
            dialog.classList.add('logoff-dialog-hidden');
        };
        
        logOffBtn.onclick = () => {
            if (window.zarateXP?.bootManager) {
                window.zarateXP.bootManager.shutdown();
            }
        };
        
        restartBtn.onclick = () => {
            if (window.zarateXP?.bootManager) {
                window.zarateXP.bootManager.restart();
            }
        };
    }
    
    animateMenuItems() {
        const items = this.startMenu.querySelectorAll('.menu-item');
        items.forEach((item, index) => {
            item.style.animationDelay = `${index * 0.05}s`;
        });
    }
}

// Track mouse position for submenu handling
document.addEventListener('mousemove', (e) => {
    window.mouseX = e.clientX;
    window.mouseY = e.clientY;
});

// Legacy support
window.StartMenuManager = StartMenuManager;