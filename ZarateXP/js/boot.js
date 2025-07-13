// Boot Manager Module
export class BootManager {
    constructor() {
        this.bootScreen = document.getElementById('boot-screen');
        this.loginScreen = document.getElementById('login-screen');
        this.desktop = document.querySelector('.desktop');
        this.fadeoutOverlay = document.getElementById('boot-fadeout-overlay');
    }
    
    async startBoot() {
        console.log('Starting boot sequence...');
        console.log('Boot screen element:', this.bootScreen);
        console.log('Login screen element:', this.loginScreen);
        
        // Show boot screen
        this.bootScreen.style.display = 'flex';
        this.bootScreen.style.opacity = '1';
        
        console.log('Boot screen shown, waiting 5 seconds...');
        
        // Simulate boot time
        await this.delay(5000);
        
        console.log('Fading out boot screen...');
        
        // Fade out boot screen
        await this.fadeOut(this.bootScreen);
        
        console.log('Boot screen faded out');
        console.log('Showing login screen...');
        
        // Show login screen
        await this.showLoginScreen();
    }
    
    async showLoginScreen() {
        console.log('showLoginScreen called');
        console.log('Login screen element:', this.loginScreen);
        
        this.loginScreen.style.display = 'flex';
        await this.delay(100);
        this.loginScreen.style.opacity = '1';
        
        console.log('Login screen displayed');
        
        // Set up login click handler
        const userSection = this.loginScreen.querySelector('.right .back-gradient');
        const welcomeMessage = this.loginScreen.querySelector('.welcome-message');
        
        console.log('User section:', userSection);
        console.log('Welcome message:', welcomeMessage);
        
        if (userSection) {
            userSection.addEventListener('click', async () => {
                console.log('User section clicked');
                // Play login sound if available
                if (window.zarateXP?.soundManager) {
                    window.zarateXP.soundManager.play('startup');
                }
                
                // Hide all login screen content except welcome message
                const loginScreenDiv = this.loginScreen.querySelector('.login-screen');
                if (loginScreenDiv) loginScreenDiv.style.display = 'none';
                
                // Show welcome message
                welcomeMessage.classList.remove('welcome-message-initial-hidden');
                welcomeMessage.style.opacity = '1';
                
                await this.delay(4000);
                
                // Fade out login screen
                await this.fadeOut(this.loginScreen);
                
                // Show desktop
                await this.showDesktop();
            });
        }
        
        // Restart button handler
        const restartBtn = this.loginScreen.querySelector('.turn-off');
        restartBtn.addEventListener('click', () => {
            this.restart();
        });
    }
    
    async showDesktop() {
        this.desktop.style.display = 'block';
        this.desktop.style.opacity = '0';
        this.desktop.style.pointerEvents = 'auto';
        
        await this.delay(100);
        this.desktop.style.opacity = '1';
        
        // Desktop is now ready
        this.onDesktopReady();
    }
    
    onDesktopReady() {
        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('desktopReady'));
    }
    
    async restart() {
        // Show fadeout overlay
        this.fadeoutOverlay.style.display = 'block';
        await this.delay(100);
        this.fadeoutOverlay.style.opacity = '1';
        
        // Play shutdown sound if available
        if (window.zarateXP?.soundManager) {
            window.zarateXP.soundManager.play('shutdown');
        }
        
        await this.delay(1000);
        
        // Reload the page
        window.location.reload();
    }
    
    async shutdown() {
        // Show fadeout overlay
        this.fadeoutOverlay.style.display = 'block';
        await this.delay(100);
        this.fadeoutOverlay.style.opacity = '1';
        
        // Play shutdown sound if available
        if (window.zarateXP?.soundManager) {
            window.zarateXP.soundManager.play('shutdown');
        }
        
        await this.delay(2000);
        
        // Show shutdown message
        document.body.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: #000;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #888;
                font-family: 'Tahoma', sans-serif;
                font-size: 14px;
                text-align: center;
            ">
                <div>
                    <p>Es seguro apagar el equipo.</p>
                    <p style="margin-top: 20px; font-size: 12px;">It is now safe to turn off your computer.</p>
                </div>
            </div>
        `;
    }
    
    // Utility functions
    async fadeOut(element) {
        element.style.transition = 'opacity 0.5s';
        element.style.opacity = '0';
        await this.delay(500);
        element.style.display = 'none';
    }
    
    async fadeIn(element) {
        element.style.display = 'block';
        element.style.opacity = '0';
        await this.delay(100);
        element.style.transition = 'opacity 0.5s';
        element.style.opacity = '1';
        await this.delay(500);
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Legacy support for non-module scripts
window.BootManager = BootManager;