// --- Gestor de Aplicaciones Dinámicas para ZarateXP ---

// Función para hacer cualquier elemento arrastrable
function makeDraggable(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    const titleBar = element.querySelector(".title-bar") || element; // Arrastrar desde la barra de título o el elemento mismo

    titleBar.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        element.style.top = `${element.offsetTop - pos2}px`;
        element.style.left = `${element.offsetLeft - pos1}px`;
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

// --- AppManager Class para compatibilidad con el sistema existente ---

export class AppManager {
    constructor() {
        this.apps = new Map();
        this.runningApps = new Map();
        this.windowManager = null; // Se asignará en init()
        
        // Register built-in applications
        this.registerBuiltInApps();
    }
    
    init(windowManager) {
        // Guardar referencia al WindowManager
        this.windowManager = windowManager;
        
        // Cargar el script principal de Winamp una sola vez cuando se inicializa el sistema
        this.loadAppScripts();
    }
    
    loadAppScripts() {
        const winampScript = document.createElement('script');
        winampScript.type = 'module';
        winampScript.src = 'js/winamp.js';
        document.head.appendChild(winampScript);
    }
    
    registerBuiltInApps() {
        // Registrar Mi PC
        this.registerApp({
            id: 'my-computer',
            name: 'Mi PC',
            icon: './images/Windows XP High Resolution Icon Pack/Windows XP Icons/My Computer.png',
            category: 'system',
            description: 'Browse computer files and drives',
            handler: () => this._openMyComputer()
        });
        
        // Registrar Winamp
        this.registerApp({
            id: 'winamp',
            name: 'Winamp',
            icon: './images/winamp.png',
            category: 'entertainment',
            description: 'It really whips the llama\'s ass!',
            handler: () => this._openWinamp()
        });
        
        // Registrar otras aplicaciones básicas para compatibilidad
        this.registerApp({
            id: 'about-me',
            name: 'Sobre Mí',
            icon: './images/Windows XP High Resolution Icon Pack/Windows XP Icons/User Accounts.png',
            category: 'system',
            description: 'Conoce más sobre Ivan Zarate',
            handler: () => this._openAboutMe()
        });
        
        this.registerApp({
            id: 'projects',
            name: 'My Projects',
            icon: './images/icons/folder-projects.png',
            category: 'documents',
            description: 'View my portfolio projects',
            handler: () => this.showPlaceholder('My Projects')
        });
        
        this.registerApp({
            id: 'resume',
            name: 'Resume.pdf',
            icon: './images/icons/pdf.png',
            category: 'documents',
            description: 'View my resume',
            handler: () => this.showPlaceholder('Resume')
        });
        
        this.registerApp({
            id: 'contact',
            name: 'Contact',
            icon: './images/icons/email.png',
            category: 'internet',
            description: 'Get in touch',
            handler: () => this.showPlaceholder('Contact')
        });
    }
    
    registerApp(appConfig) {
        this.apps.set(appConfig.id, appConfig);
    }
    
    openApp(appId) {
        const app = this.apps.get(appId);
        if (!app) {
            console.error(`App not found: ${appId}`);
            this.showError(`Application "${appId}" not found`);
            return;
        }
        
        // Check if app is already running for single-instance apps
        if (this.runningApps.has(appId) && !app.multiInstance) {
            console.log(`App ${appId} is already running`);
            return;
        }
        
        // Play launch sound
        if (window.zarateXP?.soundManager) {
            window.zarateXP.soundManager.play('click');
        }
        
        // Execute app handler
        try {
            const result = app.handler();
            if (result && result.windowId) {
                this.runningApps.set(appId, result.windowId);
            }
        } catch (error) {
            console.error(`Failed to launch app ${appId}:`, error);
            this.showError(`Failed to launch "${app.name}"`);
        }
    }
    
    // --- Métodos privados para aplicaciones específicas ---
    
    async _openMyComputer() {
        // Prevenir que se abra más de una ventana de "Mi PC"
        if (this.runningApps.has('my-computer')) {
            console.log('Mi PC is already running');
            // Intentar enfocar la ventana existente si el WindowManager lo permite
            if (this.windowManager && this.windowManager.focusWindow) {
                this.windowManager.focusWindow('my-computer');
            }
            return;
        }

        try {
            // 1. Esperar a que se cargue el contenido del archivo
            console.log('Loading mipc.html...');
            const response = await fetch('./mipc.html');
            if (!response.ok) {
                throw new Error(`Error al cargar mipc.html: ${response.statusText} (${response.status})`);
            }
            const htmlContent = await response.text();
            
            console.log('mipc.html loaded successfully, extracting and adapting content...');

            // Extraer el contenido del window-body pero mantener la estructura necesaria para CSS
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlContent, 'text/html');
            const windowBody = doc.querySelector('.window-body');
            
            let content;
            if (windowBody) {
                // Crear un contenedor con el ID necesario para los estilos CSS
                content = `<div id="mipc-window">${windowBody.innerHTML}</div>`;
                console.log('Window body content extracted and wrapped with mipc-window ID');
            } else {
                // Fallback: usar todo el contenido si no se encuentra window-body
                content = htmlContent;
                console.log('Window body not found, using full content as fallback');
            }

            // 2. Verificar que WindowManager esté disponible
            if (!this.windowManager) {
                throw new Error('WindowManager no está disponible');
            }

            // 3. Una vez que el contenido está listo, crear la ventana
            console.log('Creating Mi PC window with WindowManager...');
            
            const window = this.windowManager.createWindow({
                id: 'my-computer',
                title: 'Mi PC',
                icon: './images/Windows XP High Resolution Icon Pack/Windows XP Icons/My Computer.png',
                content: content,
                width: 660,
                height: 500
            });

            // 4. Marcar como aplicación en ejecución
            this.runningApps.set('my-computer', 'my-computer');

            // 5. Configurar cleanup cuando se cierre la ventana
            // Usar MutationObserver para detectar cuando la ventana se remueve del DOM
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.removedNodes.length > 0) {
                        mutation.removedNodes.forEach((node) => {
                            if (node === window) {
                                console.log('Mi PC window removed, cleaning up...');
                                this.closeApp('my-computer');
                                observer.disconnect();
                            }
                        });
                    }
                });
            });
            
            // Observar cambios en el contenedor de ventanas
            if (window.parentNode) {
                observer.observe(window.parentNode, { childList: true });
            }

            console.log('Mi PC window created successfully with cleanup observer');
            return window;

        } catch (error) {
            console.error("No se pudo abrir 'Mi PC':", error);
            
            // Mostrar una ventana de error al usuario
            if (this.windowManager) {
                this.windowManager.createWindow({
                    id: 'error-mipc',
                    title: 'Error',
                    icon: './images/Windows XP High Resolution Icon Pack/Windows XP Icons/My Computer.png',
                    content: `
                        <div style="padding: 20px; text-align: center;">
                            <div style="font-size: 48px; color: red; margin-bottom: 10px;">❌</div>
                            <div style="margin-bottom: 10px;"><strong>No se pudo cargar el componente 'Mi PC'</strong></div>
                            <div style="margin-bottom: 20px; color: #666;">${error.message}</div>
                            <button onclick="this.closest('.window').remove()">OK</button>
                        </div>
                    `,
                    width: 400,
                    height: 200,
                    resizable: false
                });
            } else {
                // Fallback si WindowManager no está disponible
                alert(`Error: No se pudo abrir Mi PC. ${error.message}`);
            }
        }
    }
    
    async _openWinamp() {
        try {
            // 1. Prevenir múltiples instancias
            if (this.runningApps.has('winamp')) {
                console.log('Winamp is already running');
                return;
            }

            // 2. Verificar que WindowManager esté disponible
            if (!this.windowManager) {
                throw new Error('WindowManager no está disponible');
            }

            // 3. Crear una ventana "frameless" especial para Winamp
            const winampContainer = this._createFramelessWinampWindow();

            // 4. Marcar como aplicación en ejecución
            this.runningApps.set('winamp', 'winamp');

            // 5. Configurar cleanup cuando se cierre la ventana
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.removedNodes.length > 0) {
                        mutation.removedNodes.forEach((node) => {
                            if (node === winampContainer) {
                                console.log('Winamp window removed, cleaning up...');
                                this.closeApp('winamp');
                                observer.disconnect();
                            }
                        });
                    }
                });
            });
            
            // Observar cambios en el contenedor de ventanas
            if (winampContainer.parentNode) {
                observer.observe(winampContainer.parentNode, { childList: true });
            }

            // 6. Esperar a que el componente se renderice y configurar funcionalidades
            setTimeout(() => {
                this._setupWinampControls(winampContainer);
            }, 500);

            console.log('Frameless Winamp created successfully');
            return { windowId: 'winamp', element: winampContainer };

        } catch (error) {
            console.error('Error al abrir Winamp:', error);
            this.showError(`Error al abrir Winamp: ${error.message}`);
        }
    }

    _createFramelessWinampWindow() {
        // Crear contenedor principal sin marco de ventana
        const winampContainer = document.createElement('div');
        winampContainer.className = 'winamp-frameless-container';
        winampContainer.setAttribute('data-window-id', 'winamp');
        
        // Posicionar la ventana en el centro-derecha del escritorio
        winampContainer.style.position = 'absolute';
        winampContainer.style.width = '275px';
        winampContainer.style.height = '116px';
        winampContainer.style.left = 'calc(100vw - 300px)';
        winampContainer.style.top = '100px';
        winampContainer.style.zIndex = '1000';
        winampContainer.style.cursor = 'move';

        // Crear el Web Component de Winamp
        const winampApp = document.createElement('winamp-main');
        winampApp.setAttribute('src', 'assets/winamp/track.mp3');
        
        // Insertar Winamp en el contenedor
        winampContainer.appendChild(winampApp);

        // Hacer la ventana arrastrable usando la barra de título del propio Winamp
        this._makeWinampDraggable(winampContainer);

        // Agregar al contenedor de ventanas del sistema
        const windowsContainer = document.getElementById('windows-container');
        windowsContainer.appendChild(winampContainer);

        // Agregar a la taskbar
        const taskbarManager = this.taskbarManager || window.zarateXP?.taskbarManager;
        if (taskbarManager) {
            taskbarManager.addProgram('winamp', 'Winamp', './images/winamp.png');
        }

        // Reproducir sonido de apertura
        const soundManager = this.soundManager || window.zarateXP?.soundManager;
        if (soundManager) {
            soundManager.play('maximize');
        }

        return winampContainer;
    }

    _makeWinampDraggable(container) {
        let isDragging = false;
        let startX = 0;
        let startY = 0;
        let initialX = 0;
        let initialY = 0;

        const handleMouseDown = (e) => {
            // Solo permitir arrastrar desde la barra de título de Winamp (parte superior)
            const rect = container.getBoundingClientRect();
            const clickY = e.clientY - rect.top;
            
            // Solo si se hace clic en los primeros 14px (barra de título de Winamp)
            if (clickY <= 14) {
                isDragging = true;
                startX = e.clientX;
                startY = e.clientY;
                
                const containerRect = container.getBoundingClientRect();
                initialX = containerRect.left;
                initialY = containerRect.top;
                
                container.style.cursor = 'grabbing';
                e.preventDefault();
            }
        };

        const handleMouseMove = (e) => {
            if (!isDragging) return;
            
            e.preventDefault();
            
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            
            container.style.left = (initialX + deltaX) + 'px';
            container.style.top = (initialY + deltaY) + 'px';
        };

        const handleMouseUp = () => {
            if (!isDragging) return;
            
            isDragging = false;
            container.style.cursor = 'move';
        };

        // Eventos de arrastre
        container.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        // Almacenar referencias para cleanup
        container._dragHandlers = {
            mousedown: handleMouseDown,
            mousemove: handleMouseMove,
            mouseup: handleMouseUp
        };
    }

    _setupWinampControls(winampContainer) {
        try {
            // Buscar el elemento winamp-main dentro del contenedor
            const winampElement = winampContainer.querySelector('winamp-main');
            if (!winampElement) {
                console.error('No se encontró el elemento winamp-main');
                return;
            }

            // Crear elemento de audio global para la reproducción
            const audio = document.createElement('audio');
            audio.src = 'assets/winamp/track.mp3';
            audio.preload = 'auto';
            
            // Almacenar referencia del audio en el contenedor para acceso global
            winampContainer._audioElement = audio;

            // Esperar a que el Shadow DOM esté listo
            setTimeout(() => {
                this._configureShadowDOMControls(winampElement, audio);
            }, 100);

            console.log('Winamp audio system configured successfully');

        } catch (error) {
            console.error('Error configurando controles de Winamp:', error);
        }
    }

    _configureShadowDOMControls(winampElement, audio) {
        try {
            const shadowRoot = winampElement.shadowRoot;
            if (!shadowRoot) {
                console.log('Shadow DOM no disponible para Winamp');
                return;
            }

            // Navegar por la estructura del Shadow DOM para encontrar los controles
            const winampBody = shadowRoot.querySelector('winamp-body');
            if (winampBody && winampBody.shadowRoot) {
                const winampControls = winampBody.shadowRoot.querySelector('winamp-controls');
                if (winampControls && winampControls.shadowRoot) {
                    this._setupPlaybackControls(winampControls.shadowRoot, audio);
                }

                const winampDisplay = winampBody.shadowRoot.querySelector('winamp-display');
                if (winampDisplay && winampDisplay.shadowRoot) {
                    this._setupDisplayControls(winampDisplay.shadowRoot, audio);
                }
            }

        } catch (error) {
            console.error('Error configurando Shadow DOM de Winamp:', error);
        }
    }

    _setupPlaybackControls(controlsShadowRoot, audio) {
        // Buscar botones de control
        const playButton = controlsShadowRoot.querySelector('winamp-button[type="play"]');
        const stopButton = controlsShadowRoot.querySelector('winamp-button[type="stop"]');
        const pauseButton = controlsShadowRoot.querySelector('winamp-button[type="pause"]');

        if (playButton && playButton.shadowRoot) {
            const playButtonElement = playButton.shadowRoot.querySelector('.button');
            if (playButtonElement) {
                playButtonElement.addEventListener('click', () => {
                    audio.play();
                    console.log('Playing: Paint It Black');
                });
            }
        }

        if (stopButton && stopButton.shadowRoot) {
            const stopButtonElement = stopButton.shadowRoot.querySelector('.button');
            if (stopButtonElement) {
                stopButtonElement.addEventListener('click', () => {
                    audio.pause();
                    audio.currentTime = 0;
                    console.log('Stopped playback');
                });
            }
        }

        if (pauseButton && pauseButton.shadowRoot) {
            const pauseButtonElement = pauseButton.shadowRoot.querySelector('.button');
            if (pauseButtonElement) {
                pauseButtonElement.addEventListener('click', () => {
                    if (audio.paused) {
                        audio.play();
                    } else {
                        audio.pause();
                    }
                });
            }
        }
    }

    _setupDisplayControls(displayShadowRoot, audio) {
        // Buscar el área de texto donde se muestra el título
        const audioDataElement = displayShadowRoot.querySelector('.audio-data span');
        
        if (audioDataElement) {
            // Configurar el título de la canción
            audioDataElement.textContent = 'Paint It Black - The Rolling Stones';
            
            // Cambiar el título cuando se reproduce
            audio.addEventListener('play', () => {
                audioDataElement.textContent = 'Paint It Black - The Rolling Stones';
            });
            
            audio.addEventListener('pause', () => {
                audioDataElement.textContent = 'Paint It Black - The Rolling Stones [PAUSED]';
            });
        }
    }

    _setupDirectControls(winampElement) {
        // Fallback para cuando no se puede acceder al Shadow DOM
        try {
            // Intentar configurar controles mediante atributos o eventos personalizados
            winampElement.setAttribute('title', 'Paint It Black - Rolling Stones');
            winampElement.setAttribute('artist', 'Rolling Stones');
            
            // Disparar evento personalizado para configurar la canción
            const setupEvent = new CustomEvent('setup-song', {
                detail: {
                    title: 'Paint It Black',
                    artist: 'Rolling Stones',
                    src: 'assets/winamp/track.mp3'
                }
            });
            winampElement.dispatchEvent(setupEvent);

        } catch (error) {
            console.error('Error en configuración directa de Winamp:', error);
        }
    }

    async _openAboutMe() {
        // Prevenir que se abra más de una ventana de "Sobre Mí"
        if (this.runningApps.has('about-me')) {
            console.log('About Me is already running');
            // Intentar enfocar la ventana existente si el WindowManager lo permite
            if (this.windowManager && this.windowManager.focusWindow) {
                this.windowManager.focusWindow('about-me');
            }
            return;
        }

        try {
            // Verificar que WindowManager esté disponible
            if (!this.windowManager) {
                throw new Error('WindowManager no está disponible');
            }

            // Crear contenido de la ventana "Sobre Mí"
            const content = `
                <div class="about-me-container">
                    <div class="about-sections">
                        <div class="about-section">
                            <div class="about-image">
                                <img src="images/sobremi/sobreMi1.png" alt="Ivan Zarate presentación" />
                            </div>
                            <div class="about-text">
                                <p>¡Hola! Me llamo <strong>Ivan Agustin Zarate</strong>, y quiero compartir un poco de mi historia contigo. Soy Licenciado en Seguridad con Orientación en Investigación Criminal y Analista en Sistemas. Tuve la suerte de estudiar en el IUPFA y en el Instituto Superior ORT, donde no solo aprendí, sino que me rodeé de personas increíbles que se convirtieron en parte de mi familia profesional.</p>
                            </div>
                        </div>

                        <div class="about-section">
                            <div class="about-image">
                                <img src="images/sobremi/sobreMi1Bis.png" alt="Ivan como oficial de policía" />
                            </div>
                            <div class="about-text">
                                <p>Por amor a mi bandera, me recibí de <strong>oficial de policía</strong> en la Policía Federal Argentina, que es una familia que uno aprende a querer. Esta experiencia me enseñó valores fundamentales que llevo a todo lo que hago: compromiso, servicio y trabajo en equipo. Es algo que quiero transmitir a mi audiencia: la importancia de servir con honor.</p>
                            </div>
                        </div>

                        <div class="about-section">
                            <div class="about-image">
                                <img src="images/sobremi/sobreMi2.png" alt="Ivan programando" />
                            </div>
                            <div class="about-text">
                                <p>La programación es mi pasión, y soy un verdadero entusiasta de la Inteligencia Artificial. Creo firmemente que la IA no viene a reemplazarnos, sino a potenciarnos. Como me gusta compartir con mi audiencia: <em>"el que abraza la tecnología, crece junto con ella"</em>. Actualmente trabajo en el Ministerio de Seguridad Nacional, un lugar que realmente amo y que me ha permitido crecer enormemente en bases de datos y desarrollo de SaaS y microservicios.</p>
                            </div>
                        </div>

                        <div class="about-section">
                            <div class="about-image">
                                <img src="images/sobremi/sobreMi3.png" alt="Ivan entrenando" />
                            </div>
                            <div class="about-text">
                                <p>En mis tiempos libres, me gusta mantenerme activo y entrenar. Antes era muy fanático del running, pero ahora me enfoqué en el levantamiento de pesas. Voy al gimnasio con la eterna esperanza de llegar en forma al próximo verano (que siempre parece lejano, ja!). Como les digo a quienes me siguen: <em>"la constancia supera al talento"</em>. Aunque claro, hay un pequeño obstáculo...</p>
                            </div>
                        </div>

                        <div class="about-section">
                            <div class="about-image">
                                <img src="images/sobremi/sobremi4.png" alt="Ivan cocinando" />
                            </div>
                            <div class="about-text">
                                <p>...¡me encanta la comida! No me privo de nada rico, y además disfruto mucho cocinando. Sin ser presumido, pero cada vez que invito a casa, la gente siempre repite. Me gusta pensar que compartir una buena comida es una de las mejores formas de construir vínculos y lazos genuinos. Desde pastas caseras hasta asados dominicales, cocinar me conecta con mis raíces y me permite expresar creatividad fuera del código.</p>
                            </div>
                        </div>

                        <div class="about-section">
                            <div class="about-image">
                                <img src="images/sobremi/SobreMi5.png" alt="Ivan con su familia" />
                            </div>
                            <div class="about-text">
                                <p>Cuando estoy desocupado, uno de mis hobbies favoritos es pasar tiempo con mi familia. Somos muy unidos y casi no hacemos nada sin estar los tres juntos. Ya sea un asado el domingo, una película en casa, o simplemente charlar en el patio, esos momentos son los que realmente me cargan las pilas. Con mi audiencia siempre hablo de la importancia del equilibrio, y mi familia es mi ancla y mi motivación para seguir creciendo.</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Crear la ventana usando el WindowManager
            const aboutWindow = this.windowManager.createWindow({
                id: 'about-me',
                title: 'Sobre Mí - Ivan Agustin Zarate',
                icon: './images/Windows XP High Resolution Icon Pack/Windows XP Icons/User Accounts.png',
                content: content,
                width: 700,
                height: 600,
                resizable: true,
                maximizable: true
            });

            // Marcar como aplicación en ejecución
            this.runningApps.set('about-me', 'about-me');

            // Configurar cleanup cuando se cierre la ventana
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.removedNodes.length > 0) {
                        mutation.removedNodes.forEach((node) => {
                            if (node === aboutWindow) {
                                console.log('About Me window removed, cleaning up...');
                                this.closeApp('about-me');
                                observer.disconnect();
                            }
                        });
                    }
                });
            });
            
            // Observar cambios en el contenedor de ventanas
            if (aboutWindow.parentNode) {
                observer.observe(aboutWindow.parentNode, { childList: true });
            }

            console.log('About Me window created successfully');
            return aboutWindow;

        } catch (error) {
            console.error("No se pudo abrir 'Sobre Mí':", error);
            
            // Mostrar una ventana de error al usuario
            if (this.windowManager) {
                this.windowManager.createWindow({
                    id: 'error-aboutme',
                    title: 'Error',
                    icon: './images/Windows XP High Resolution Icon Pack/Windows XP Icons/User Accounts.png',
                    content: `
                        <div style="padding: 20px; text-align: center;">
                            <div style="font-size: 48px; color: red; margin-bottom: 10px;">❌</div>
                            <div style="margin-bottom: 10px;"><strong>No se pudo cargar 'Sobre Mí'</strong></div>
                            <div style="margin-bottom: 20px; color: #666;">${error.message}</div>
                            <button onclick="this.closest('.window').remove()">OK</button>
                        </div>
                    `,
                    width: 400,
                    height: 200,
                    resizable: false
                });
            } else {
                // Fallback si WindowManager no está disponible
                alert(`Error: No se pudo abrir Sobre Mí. ${error.message}`);
            }
        }
    }
    
    // --- Métodos auxiliares ---
    
    showPlaceholder(appName) {
        const content = `
            <div style="padding: 20px; text-align: center;">
                <h2>${appName}</h2>
                <p>Esta aplicación está en desarrollo.</p>
                <p>Próximamente estará disponible.</p>
            </div>
        `;
        
        // If window manager is available, create a window
        if (this.windowManager) {
            return this.windowManager.createWindow({
                id: `placeholder-${Date.now()}`,
                title: appName,
                content: content,
                width: 400,
                height: 300
            });
        }
    }
    
    showError(message) {
        // If window manager is available, create an error window
        if (this.windowManager) {
            const content = `
                <div style="padding: 20px; text-align: center;">
                    <div style="font-size: 48px; color: red; margin-bottom: 10px;">❌</div>
                    <div style="margin-bottom: 20px;">${message}</div>
                    <button onclick="this.closest('.window').remove()">OK</button>
                </div>
            `;
            
            return this.windowManager.createWindow({
                id: `error-${Date.now()}`,
                title: 'Error',
                content: content,
                width: 300,
                height: 200,
                resizable: false
            });
        } else {
            // Fallback to alert if window manager not available
            alert(message);
        }
    }
    
    closeApp(appId) {
        // Cleanup específico para diferentes aplicaciones
        if (appId === 'winamp') {
            // Limpiar audio del contenedor frameless
            const winampContainer = document.querySelector('.winamp-frameless-container');
            if (winampContainer) {
                // Pausar y limpiar audio
                if (winampContainer._audioElement) {
                    winampContainer._audioElement.pause();
                    winampContainer._audioElement.src = '';
                    winampContainer._audioElement = null;
                }
                
                // Limpiar event listeners de arrastre
                if (winampContainer._dragHandlers) {
                    document.removeEventListener('mousemove', winampContainer._dragHandlers.mousemove);
                    document.removeEventListener('mouseup', winampContainer._dragHandlers.mouseup);
                }
                
                // Remover del DOM
                winampContainer.remove();
            }
            
            // Remover de la taskbar
            const taskbarManager = this.taskbarManager || window.zarateXP?.taskbarManager;
            if (taskbarManager) {
                taskbarManager.removeProgram('winamp');
            }
        } else if (appId === 'my-computer') {
            console.log('Cleaning up Mi PC application');
            // Aquí se puede añadir cleanup específico para Mi PC si es necesario
        }
        
        this.runningApps.delete(appId);
        console.log(`App ${appId} closed and removed from running apps`);
    }
    
    getApp(appId) {
        return this.apps.get(appId);
    }
    
    getAllApps() {
        return Array.from(this.apps.values());
    }
}

// Legacy support
window.AppManager = AppManager;