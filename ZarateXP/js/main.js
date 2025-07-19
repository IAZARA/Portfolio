// Main JavaScript Module
import { BootManager } from './boot.js';
import { DesktopManager } from './desktop.js';
import { WindowManager } from './windows.js';
import { TaskbarManager } from './taskbar.js';
import { StartMenuManager } from './startMenu.js';
import { SoundManager } from './sounds.js';
import { AppManager } from './apps.js';
import { ClippyManager } from './clippy/ClippyManager.js';

class ZarateXP {
    constructor() {
        // Make ZarateXP globally available immediately
        window.zarateXP = this;
        
        this.bootManager = new BootManager();
        this.desktopManager = new DesktopManager();
        this.windowManager = new WindowManager();
        this.taskbarManager = new TaskbarManager();
        this.startMenuManager = new StartMenuManager();
        this.soundManager = new SoundManager();
        this.appManager = new AppManager();
        this.clippyManager = new ClippyManager();
        
        this.init();
    }
    
    init() {
        // Set viewport height for mobile
        this.setViewportHeight();
        window.addEventListener('resize', () => this.setViewportHeight());
        window.addEventListener('orientationchange', () => this.setViewportHeight());
        
        // Initialize boot sequence
        this.bootManager.startBoot().then(() => {
            this.initializeSystem();
        }).catch(error => {
            console.error('Boot error:', error);
        });
        
        // Handle landscape orientation
        this.handleOrientation();
        window.addEventListener('orientationchange', () => this.handleOrientation());
    }
    
    setViewportHeight() {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--real-vh', `${vh}px`);
    }
    
    handleOrientation() {
        const landscapeBlock = document.getElementById('landscape-block');
        if (window.innerWidth < 768 && window.innerHeight < window.innerWidth) {
            landscapeBlock.style.display = 'flex';
        } else {
            landscapeBlock.style.display = 'none';
        }
    }
    
    initializeSystem() {
        // Initialize all managers
        this.soundManager.init();
        this.desktopManager.init();
        this.windowManager.init();
        this.taskbarManager.init();
        this.startMenuManager.init();
        this.appManager.init(this.windowManager);
        this.clippyManager.init();
        
        // Establecer referencias cruzadas entre managers
        this.windowManager.taskbarManager = this.taskbarManager;
        this.windowManager.soundManager = this.soundManager;
        
        // Set up global event listeners
        this.setupGlobalListeners();
        
        // Update clock
        this.updateClock();
        setInterval(() => this.updateClock(), 1000);
        
        // Initialize tooltips
        this.initTooltips();
        
        // Show Clippy welcome after desktop is ready (10 seconds delay)
        setTimeout(() => {
            this.clippyManager.showWelcome();
        }, 10000);
    }
    
    setupGlobalListeners() {
        // Close start menu when clicking outside
        document.addEventListener('click', (e) => {
            const startMenu = document.querySelector('.startmenu');
            const startButton = document.getElementById('start-button');
            
            if (!startMenu.contains(e.target) && !startButton.contains(e.target)) {
                this.startMenuManager.close();
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Windows key
            if (e.key === 'Meta' || e.key === 'OS') {
                e.preventDefault();
                this.startMenuManager.toggle();
            }
            
            // Alt+F4
            if (e.altKey && e.key === 'F4') {
                e.preventDefault();
                const activeWindow = this.windowManager.getActiveWindow();
                if (activeWindow) {
                    this.windowManager.closeWindow(activeWindow.id);
                }
            }
            
            // Escape
            if (e.key === 'Escape') {
                this.startMenuManager.close();
            }
        });
        
        // Prevent context menu
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }
    
    updateClock() {
        const clockElement = document.querySelector('.time');
        if (clockElement) {
            const now = new Date();
            const hours = now.getHours();
            const minutes = now.getMinutes().toString().padStart(2, '0');
            const ampm = hours >= 12 ? 'PM' : 'AM';
            const displayHours = hours % 12 || 12;
            clockElement.textContent = `${displayHours}:${minutes} ${ampm}`;
        }
    }
    
    initTooltips() {
        const tooltip = document.querySelector('.dynamic-tooltip');
        
        document.addEventListener('mouseover', (e) => {
            const target = e.target.closest('[data-tooltip]');
            if (target) {
                const text = target.getAttribute('data-tooltip');
                tooltip.textContent = text;
                tooltip.style.display = 'block';
                
                const rect = target.getBoundingClientRect();
                tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
                tooltip.style.top = rect.top - tooltip.offsetHeight - 5 + 'px';
            }
        });
        
        document.addEventListener('mouseout', (e) => {
            const target = e.target.closest('[data-tooltip]');
            if (target) {
                tooltip.style.display = 'none';
            }
        });
    }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ZarateXP(); // window.zarateXP is already set in constructor
});

// Export for use in other modules
export { ZarateXP };