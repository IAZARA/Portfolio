// Boot Manager Module
export class BootManager {
    constructor() {
        this.bootScreen = document.getElementById('boot-screen');
        this.loginScreen = document.getElementById('login-screen');
        this.desktop = document.querySelector('.desktop');
        this.fadeoutOverlay = document.getElementById('boot-fadeout-overlay');
        this.loginHandlersSet = false;
    }
    
    async startBoot() {
        console.log('Starting boot sequence...');
        console.log('Boot screen element:', this.bootScreen);
        console.log('Login screen element:', this.loginScreen);
        
        // Verificar si ya hay una sesión activa
        const hasActiveSession = localStorage.getItem('zarateXP_session') === 'active';
        
        if (hasActiveSession) {
            console.log('Sesión activa detectada, saltando directamente al escritorio...');
            // Ocultar pantallas de boot y login
            this.bootScreen.style.display = 'none';
            this.loginScreen.style.display = 'none';
            // Mostrar escritorio directamente
            await this.showDesktop();
            return;
        }
        
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
        
        // Only set up event listeners if they haven't been set up already
        if (!this.loginHandlersSet) {
            this.setupLoginHandlers();
            this.loginHandlersSet = true;
        }
    }
    
    setupLoginHandlers() {
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
                
                // Guardar sesión activa en localStorage
                localStorage.setItem('zarateXP_session', 'active');
                
                // Show desktop
                await this.showDesktop();
            });
        }
        
        // Restart button handler
        const restartBtn = this.loginScreen.querySelector('.turn-off');
        if (restartBtn) {
            restartBtn.addEventListener('click', () => {
                this.restart();
            });
        }
    }
    
    async showDesktop() {
        this.desktop.style.display = 'block';
        this.desktop.style.opacity = '0';
        this.desktop.style.pointerEvents = 'auto';
        this.desktop.style.transition = 'opacity 1s ease-in';
        
        await this.delay(200);
        this.desktop.style.opacity = '1';
        
        await this.delay(1000);
        
        // Reset transition for future operations
        this.desktop.style.transition = '';
        
        // Desktop is now ready
        this.onDesktopReady();
    }
    
    onDesktopReady() {
        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('desktopReady'));
    }
    
    async restart() {
        // Limpiar sesión del localStorage
        localStorage.removeItem('zarateXP_session');
        
        // Start desktop fade out smoothly
        this.desktop.style.transition = 'opacity 1.2s ease-out';
        this.desktop.style.opacity = '0';
        
        await this.delay(600);
        
        // Show fadeout overlay with smooth transition
        this.fadeoutOverlay.style.display = 'block';
        this.fadeoutOverlay.style.transition = 'opacity 0.8s ease-in-out';
        this.fadeoutOverlay.style.opacity = '0';
        await this.delay(50);
        this.fadeoutOverlay.style.opacity = '1';
        
        await this.delay(1200);
        
        // Reload the page
        window.location.reload();
    }
    
    async shutdown() {
        // Limpiar sesión del localStorage
        localStorage.removeItem('zarateXP_session');
        
        // Start desktop fade out smoothly
        this.desktop.style.transition = 'opacity 1.5s ease-out';
        this.desktop.style.opacity = '0';
        
        await this.delay(800);
        
        // Show fadeout overlay with smooth transition
        this.fadeoutOverlay.style.display = 'block';
        this.fadeoutOverlay.style.transition = 'opacity 1s ease-in-out';
        this.fadeoutOverlay.style.opacity = '0';
        await this.delay(50);
        this.fadeoutOverlay.style.opacity = '1';
        
        await this.delay(1500);
        
        // Create shutdown message with smooth fade in
        const shutdownDiv = document.createElement('div');
        shutdownDiv.style.cssText = `
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
            opacity: 0;
            transition: opacity 1s ease-in;
        `;
        
        shutdownDiv.innerHTML = `
            <div>
                <p>Es seguro apagar el equipo.</p>
                <p style="margin-top: 20px; font-size: 12px;">It is now safe to turn off your computer.</p>
            </div>
        `;
        
        document.body.appendChild(shutdownDiv);
        
        // Fade in shutdown message
        await this.delay(100);
        shutdownDiv.style.opacity = '1';
    }
    
    async logoff() {
        // Limpiar sesión del localStorage
        localStorage.removeItem('zarateXP_session');
        
        // Start desktop fade out smoothly
        this.desktop.style.transition = 'opacity 1.5s ease-out';
        this.desktop.style.opacity = '0';
        
        await this.delay(800);
        
        // Show fadeout overlay with smooth transition
        this.fadeoutOverlay.style.display = 'block';
        this.fadeoutOverlay.style.transition = 'opacity 0.8s ease-in-out';
        this.fadeoutOverlay.style.opacity = '0';
        await this.delay(50);
        this.fadeoutOverlay.style.opacity = '1';
        
        await this.delay(1200);
        
        // Hide desktop completely
        this.desktop.style.display = 'none';
        this.desktop.style.pointerEvents = 'none';
        
        // Smooth fadeout of overlay
        this.fadeoutOverlay.style.transition = 'opacity 0.6s ease-out';
        this.fadeoutOverlay.style.opacity = '0';
        await this.delay(600);
        this.fadeoutOverlay.style.display = 'none';
        
        // Reset welcome message state
        const welcomeMessage = this.loginScreen.querySelector('.welcome-message');
        if (welcomeMessage) {
            welcomeMessage.classList.add('welcome-message-initial-hidden');
            welcomeMessage.style.opacity = '0';
        }
        
        // Reset login screen content
        const loginScreenDiv = this.loginScreen.querySelector('.login-screen');
        if (loginScreenDiv) {
            loginScreenDiv.style.display = 'block';
        }
        
        // Make sure boot screen stays hidden
        this.bootScreen.style.display = 'none';
        this.bootScreen.style.opacity = '0';
        
        // Show login screen with smooth fade in
        this.loginScreen.style.display = 'flex';
        this.loginScreen.style.opacity = '0';
        this.loginScreen.style.transition = 'opacity 0.8s ease-in';
        await this.delay(100);
        this.loginScreen.style.opacity = '1';
        
        // Reset desktop transition for next time
        await this.delay(800);
        this.desktop.style.transition = '';
        this.desktop.style.opacity = '1';
    }
    
    // Utility functions
    async fadeOut(element, duration = 800) {
        element.style.transition = `opacity ${duration / 1000}s ease-out`;
        element.style.opacity = '0';
        await this.delay(duration);
        element.style.display = 'none';
    }
    
    async fadeIn(element, duration = 800) {
        element.style.display = 'block';
        element.style.opacity = '0';
        await this.delay(100);
        element.style.transition = `opacity ${duration / 1000}s ease-in`;
        element.style.opacity = '1';
        await this.delay(duration);
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Legacy support for non-module scripts
window.BootManager = BootManager;