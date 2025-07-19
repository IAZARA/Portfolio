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
            name: 'Mis Proyectos',
            icon: './images/Windows XP High Resolution Icon Pack/Windows XP Icons/Internet Explorer 6.png',
            category: 'documents',
            description: 'Explora mis proyectos de desarrollo',
            handler: () => this._openProjectsExplorer()
        });
        
        this.registerApp({
            id: 'resume',
            name: 'Resume.pdf',
            icon: './images/icons/pdf.png',
            category: 'documents',
            description: 'View my resume',
            handler: () => this._openResume()
        });
        
        this.registerApp({
            id: 'contact',
            name: 'Mi Contacto',
            icon: './images/Windows XP High Resolution Icon Pack/Windows XP Icons/Outlook Express.png',
            category: 'internet',
            description: 'Envíame un mensaje',
            handler: () => this._openContact()
        });
        
        // Registrar Buscaminas
        this.registerApp({
            id: 'minesweeper',
            name: 'Buscaminas',
            icon: './images/Windows XP High Resolution Icon Pack/Windows XP Icons/Minesweeper.png',
            category: 'games',
            description: 'Juego clásico de Buscaminas',
            handler: () => this._openMinesweeper()
        });
        
        // Registrar Paint
        this.registerApp({
            id: 'paint',
            name: 'Paint',
            icon: './images/Windows XP High Resolution Icon Pack/Windows XP Icons/Paint.png',
            category: 'accessories',
            description: 'Editor de imágenes Paint',
            handler: () => this._openPaint()
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
                <div id="about-me-window">
                    <div class="about-me-menu-bar">
                        <span><u>A</u>rchivo</span>
                        <span><u>E</u>dición</span>
                        <span><u>V</u>er</span>
                        <span><u>H</u>erramientas</span>
                        <span>A<u>y</u>uda</span>
                    </div>
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

    async _openContact() {
        // Prevenir que se abra más de una ventana de "Contacto"
        if (this.runningApps.has('contact')) {
            console.log('Contact is already running');
            // Intentar enfocar la ventana existente si el WindowManager lo permite
            if (this.windowManager && this.windowManager.focusWindow) {
                this.windowManager.focusWindow('contact');
            }
            return;
        }

        try {
            // Verificar que WindowManager esté disponible
            if (!this.windowManager) {
                throw new Error('WindowManager no está disponible');
            }

            // Cargar el contenido del componente de contacto
            console.log('Loading contacto.html...');
            const response = await fetch('./components/contacto.html');
            if (!response.ok) {
                throw new Error(`Error al cargar contacto.html: ${response.statusText} (${response.status})`);
            }
            const htmlContent = await response.text();

            // Crear la ventana usando el WindowManager
            const contactWindow = this.windowManager.createWindow({
                id: 'contact',
                title: 'Mi Contacto - Ivan Agustin Zarate',
                icon: './images/Windows XP High Resolution Icon Pack/Windows XP Icons/Outlook Express.png',
                content: htmlContent,
                width: 500,
                height: 650,
                resizable: true,
                maximizable: true
            });

            // Marcar como aplicación en ejecución
            this.runningApps.set('contact', 'contact');

            // Configurar la funcionalidad del formulario
            setTimeout(() => {
                this._setupContactForm(contactWindow);
            }, 100);

            // Configurar cleanup cuando se cierre la ventana
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.removedNodes.length > 0) {
                        mutation.removedNodes.forEach((node) => {
                            if (node === contactWindow) {
                                console.log('Contact window removed, cleaning up...');
                                this.closeApp('contact');
                                observer.disconnect();
                            }
                        });
                    }
                });
            });
            
            // Observar cambios en el contenedor de ventanas
            if (contactWindow.parentNode) {
                observer.observe(contactWindow.parentNode, { childList: true });
            }

            console.log('Contact window created successfully');
            return contactWindow;

        } catch (error) {
            console.error("No se pudo abrir 'Mi Contacto':", error);
            
            // Mostrar una ventana de error al usuario
            if (this.windowManager) {
                this.windowManager.createWindow({
                    id: 'error-contact',
                    title: 'Error',
                    icon: './images/Windows XP High Resolution Icon Pack/Windows XP Icons/Outlook Express.png',
                    content: `
                        <div style="padding: 20px; text-align: center;">
                            <div style="font-size: 48px; color: red; margin-bottom: 10px;">❌</div>
                            <div style="margin-bottom: 10px;"><strong>No se pudo cargar 'Mi Contacto'</strong></div>
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
                alert(`Error: No se pudo abrir Mi Contacto. ${error.message}`);
            }
        }
    }

    _setupContactForm(contactWindow) {
        try {
            const form = contactWindow.querySelector('#contact-form');
            const sendBtn = contactWindow.querySelector('.toolbar-btn[title*="Send"]') || 
                           contactWindow.querySelector('.toolbar-btn img[src*="Email"]')?.parentElement;

            if (!form) {
                console.error('No se encontró el formulario de contacto');
                return;
            }

            // Configurar envío del formulario
            const handleSubmit = (e) => {
                e.preventDefault();
                
                const name = form.querySelector('#contact-name').value || "Visitor from ZarateXP";
                const email = form.querySelector('#contact-email').value;
                const subject = form.querySelector('#contact-subject').value;
                const body = form.querySelector('#contact-body').value;

                if (!email || !subject || !body) {
                    this._showValidationError('Por favor completa todos los campos requeridos: Email, Asunto y Mensaje');
                    return;
                }

                // Construir el mensaje completo
                const fullMessage = `Hola Ivan,

De: ${email}
Nombre: ${name}

${body}

---
Enviado desde ZarateXP Portfolio`;

                // Crear enlace mailto
                const mailtoLink = `mailto:ivan.agustin.95@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(fullMessage)}`;
                
                // Abrir cliente de correo
                window.open(mailtoLink, '_blank');
                
                // Mostrar confirmación
                this._showContactConfirmation(contactWindow);
            };

            // Configurar eventos de envío
            form.addEventListener('submit', handleSubmit);
            
            // Configurar botón de envío en toolbar
            if (sendBtn) {
                sendBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    handleSubmit(e);
                });
            }

            // Configurar funcionalidad de toolbar buttons
            this._setupToolbarButtons(contactWindow, form);

            // Enfocar el primer campo editable
            const firstInput = form.querySelector('#contact-email');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 200);
            }

            console.log('Contact form configured successfully');

        } catch (error) {
            console.error('Error configurando formulario de contacto:', error);
        }
    }

    _setupToolbarButtons(contactWindow, form) {
        try {
            // Botón "New Message" - limpiar formulario
            const newMsgBtn = contactWindow.querySelector('.toolbar-btn img[src*="Outlook"]')?.parentElement;
            if (newMsgBtn) {
                newMsgBtn.addEventListener('click', () => {
                    form.reset();
                    const firstInput = form.querySelector('#contact-email');
                    if (firstInput) {
                        firstInput.focus();
                    }
                });
            }

            // Botón "Libreta de Direcciones" - acción placeholder
            const addressBtn = contactWindow.querySelector('.toolbar-btn img[src*="Address"]')?.parentElement;
            if (addressBtn) {
                addressBtn.addEventListener('click', () => {
                    this._showInfoDialog('Libreta de Direcciones', 'Contáctame directamente en ivan.agustin.95@gmail.com');
                });
            }

            // Botones de edición (Cut, Copy, Paste) - funcionalidad básica
            const cutBtn = contactWindow.querySelector('.toolbar-btn img[src*="Cut"]')?.parentElement;
            const copyBtn = contactWindow.querySelector('.toolbar-btn img[src*="Copy"]')?.parentElement;
            const pasteBtn = contactWindow.querySelector('.toolbar-btn img[src*="Paste"]')?.parentElement;

            if (cutBtn) {
                cutBtn.addEventListener('click', () => {
                    document.execCommand('cut');
                });
            }

            if (copyBtn) {
                copyBtn.addEventListener('click', () => {
                    document.execCommand('copy');
                });
            }

            if (pasteBtn) {
                pasteBtn.addEventListener('click', () => {
                    document.execCommand('paste');
                });
            }

        } catch (error) {
            console.error('Error configurando botones de toolbar:', error);
        }
    }

    _showValidationError(message) {
        if (this.windowManager) {
            this.windowManager.createWindow({
                id: 'validation-error',
                title: 'Error de Entrada',
                icon: './images/Windows XP High Resolution Icon Pack/Windows XP Icons/Critical.png',
                content: `
                    <div style="padding: 20px; text-align: center;">
                        <div style="font-size: 32px; color: #FF0000; margin-bottom: 10px;">⚠️</div>
                        <div style="margin-bottom: 20px; color: #000;">${message}</div>
                        <button onclick="this.closest('.window').remove()" style="padding: 6px 16px; min-width: 75px;">Aceptar</button>
                    </div>
                `,
                width: 350,
                height: 150,
                resizable: false,
                maximizable: false
            });
        } else {
            alert(message);
        }
    }

    _showInfoDialog(title, message) {
        if (this.windowManager) {
            this.windowManager.createWindow({
                id: 'info-dialog',
                title: title,
                icon: './images/Windows XP High Resolution Icon Pack/Windows XP Icons/Information.png',
                content: `
                    <div style="padding: 20px; text-align: center;">
                        <div style="font-size: 32px; color: #0066CC; margin-bottom: 10px;">ℹ️</div>
                        <div style="margin-bottom: 20px; color: #000;">${message}</div>
                        <button onclick="this.closest('.window').remove()" style="padding: 6px 16px; min-width: 75px;">Aceptar</button>
                    </div>
                `,
                width: 350,
                height: 150,
                resizable: false,
                maximizable: false
            });
        } else {
            alert(message);
        }
    }

    async _openProjectsExplorer() {
        // Prevenir que se abra más de una ventana de "Mis Proyectos"
        if (this.runningApps.has('projects')) {
            console.log('Projects Explorer is already running');
            if (this.windowManager && this.windowManager.focusWindow) {
                this.windowManager.focusWindow('projects');
            }
            return;
        }

        try {
            // Verificar que WindowManager esté disponible
            if (!this.windowManager) {
                throw new Error('WindowManager no está disponible');
            }

            // Cargar el contenido del componente de proyectos
            console.log('Loading proyectos-explorer.html...');
            const response = await fetch('./components/proyectos-explorer.html');
            if (!response.ok) {
                throw new Error(`Error al cargar proyectos-explorer.html: ${response.statusText} (${response.status})`);
            }
            const htmlContent = await response.text();

            // Crear la ventana usando el WindowManager
            const projectsWindow = this.windowManager.createWindow({
                id: 'projects',
                title: 'Mis Proyectos - Explorer',
                icon: './images/Windows XP High Resolution Icon Pack/Windows XP Icons/Internet Explorer 6.png',
                content: htmlContent,
                width: 800,
                height: 600,
                resizable: true,
                maximizable: true
            });

            // Marcar como aplicación en ejecución
            this.runningApps.set('projects', 'projects');

            // Configurar la funcionalidad del explorer
            setTimeout(() => {
                this._setupProjectsExplorer(projectsWindow);
            }, 100);

            // Configurar cleanup cuando se cierre la ventana
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.removedNodes.length > 0) {
                        mutation.removedNodes.forEach((node) => {
                            if (node === projectsWindow) {
                                console.log('Projects window removed, cleaning up...');
                                this.closeApp('projects');
                                observer.disconnect();
                            }
                        });
                    }
                });
            });
            
            // Observar cambios en el contenedor de ventanas
            if (projectsWindow.parentNode) {
                observer.observe(projectsWindow.parentNode, { childList: true });
            }

            console.log('Projects Explorer window created successfully');
            return projectsWindow;

        } catch (error) {
            console.error("No se pudo abrir 'Mis Proyectos':", error);
            
            // Mostrar una ventana de error al usuario
            if (this.windowManager) {
                this.windowManager.createWindow({
                    id: 'error-projects',
                    title: 'Error',
                    icon: './images/Windows XP High Resolution Icon Pack/Windows XP Icons/Internet Explorer 6.png',
                    content: `
                        <div style="padding: 20px; text-align: center;">
                            <div style="font-size: 48px; color: red; margin-bottom: 10px;">❌</div>
                            <div style="margin-bottom: 10px;"><strong>No se pudo cargar 'Mis Proyectos'</strong></div>
                            <div style="margin-bottom: 20px; color: #666;">${error.message}</div>
                            <button onclick="this.closest('.window').remove()">Aceptar</button>
                        </div>
                    `,
                    width: 400,
                    height: 200,
                    resizable: false
                });
            } else {
                // Fallback si WindowManager no está disponible
                alert(`Error: No se pudo abrir Mis Proyectos. ${error.message}`);
            }
        }
    }

    _setupProjectsExplorer(projectsWindow) {
        try {
            // Configurar navegación del árbol de carpetas
            this._setupTreeNavigation(projectsWindow);
            
            // Configurar botones de la toolbar
            this._setupExplorerToolbar(projectsWindow);
            
            // Configurar vista de contenido
            this._setupContentView(projectsWindow);
            
            // Cargar contenido inicial
            this._loadFolderContent(projectsWindow, 'root');

            console.log('Projects Explorer configured successfully');

        } catch (error) {
            console.error('Error configurando Projects Explorer:', error);
        }
    }

    _setupTreeNavigation(projectsWindow) {
        const treeItems = projectsWindow.querySelectorAll('.tree-item');
        
        treeItems.forEach(item => {
            const content = item.querySelector('.tree-item-content');
            const expand = item.querySelector('.tree-expand');
            
            // Click en el contenido del item
            content.addEventListener('click', (e) => {
                e.stopPropagation();
                
                // Remover selección anterior
                projectsWindow.querySelectorAll('.tree-item.selected').forEach(el => {
                    el.classList.remove('selected');
                });
                
                // Seleccionar el item actual
                item.classList.add('selected');
                
                // Actualizar barra de direcciones
                const path = item.getAttribute('data-path') || 'Mis Proyectos';
                const pathInput = projectsWindow.querySelector('#current-path');
                if (pathInput) {
                    pathInput.value = path;
                }
                
                // Cargar contenido de la carpeta
                const folder = item.getAttribute('data-folder');
                this._loadFolderContent(projectsWindow, folder);
            });
            
            // Click en el botón de expandir/contraer
            if (expand) {
                expand.addEventListener('click', (e) => {
                    e.stopPropagation();
                    
                    if (item.classList.contains('expanded')) {
                        item.classList.remove('expanded');
                        expand.textContent = '+';
                        const icon = item.querySelector('.tree-icon');
                        if (icon) {
                            icon.src = './images/Windows XP High Resolution Icon Pack/Windows XP Icons/Folder Closed.png';
                        }
                    } else {
                        item.classList.add('expanded');
                        expand.textContent = '−';
                        const icon = item.querySelector('.tree-icon');
                        if (icon) {
                            icon.src = './images/Windows XP High Resolution Icon Pack/Windows XP Icons/Folder Opened.png';
                        }
                    }
                });
            }
        });
    }

    _setupExplorerToolbar(projectsWindow) {
        // Botón de vista de íconos
        const iconViewBtn = projectsWindow.querySelector('[data-view="icons"]');
        const listViewBtn = projectsWindow.querySelector('[data-view="list"]');
        
        if (iconViewBtn) {
            iconViewBtn.addEventListener('click', () => {
                iconViewBtn.classList.add('active');
                if (listViewBtn) listViewBtn.classList.remove('active');
                this._switchView(projectsWindow, 'icons');
            });
        }
        
        if (listViewBtn) {
            listViewBtn.addEventListener('click', () => {
                listViewBtn.classList.add('active');
                if (iconViewBtn) iconViewBtn.classList.remove('active');
                this._switchView(projectsWindow, 'list');
            });
        }

        // Botón de carpetas (toggle panel izquierdo)
        const foldersBtn = projectsWindow.querySelector('#btn-folders');
        if (foldersBtn) {
            foldersBtn.addEventListener('click', () => {
                const leftPanel = projectsWindow.querySelector('.explorer-left-panel');
                const splitter = projectsWindow.querySelector('.explorer-splitter');
                
                if (leftPanel && splitter) {
                    const isVisible = leftPanel.style.display !== 'none';
                    leftPanel.style.display = isVisible ? 'none' : 'flex';
                    splitter.style.display = isVisible ? 'none' : 'block';
                    
                    // Cambiar estado del botón
                    if (isVisible) {
                        foldersBtn.classList.remove('active');
                    } else {
                        foldersBtn.classList.add('active');
                    }
                }
            });
        }
    }

    _setupContentView(projectsWindow) {
        const contentArea = projectsWindow.querySelector('#explorer-content');
        if (!contentArea) return;

        // Configurar eventos de doble clic para abrir proyectos
        contentArea.addEventListener('dblclick', (e) => {
            const projectItem = e.target.closest('.project-item');
            if (projectItem) {
                const projectId = projectItem.getAttribute('data-project-id');
                if (projectId) {
                    this._openProjectDetails(projectsWindow, projectId);
                }
            }
        });

        // Configurar selección de elementos
        contentArea.addEventListener('click', (e) => {
            const projectItem = e.target.closest('.project-item');
            
            if (projectItem) {
                // Remover selección anterior
                contentArea.querySelectorAll('.project-item.selected').forEach(el => {
                    el.classList.remove('selected');
                });
                
                // Seleccionar el item actual
                projectItem.classList.add('selected');
                
                // Actualizar barra de estado
                this._updateStatusBar(projectsWindow, projectItem);
            } else {
                // Click en área vacía, deseleccionar todo
                contentArea.querySelectorAll('.project-item.selected').forEach(el => {
                    el.classList.remove('selected');
                });
                this._updateStatusBar(projectsWindow);
            }
        });
    }

    _loadFolderContent(projectsWindow, folder) {
        const contentArea = projectsWindow.querySelector('#explorer-content');
        const statusCount = projectsWindow.querySelector('#items-count');
        
        if (!contentArea) return;

        // Mostrar indicador de carga
        contentArea.innerHTML = `
            <div class="loading-message">
                <img src="./images/Windows XP High Resolution Icon Pack/Windows XP Icons/Folder Opened.png" width="32" height="32"/>
                <p>Cargando proyectos...</p>
            </div>
        `;

        // Simular carga asíncrona
        setTimeout(() => {
            const projects = this._getProjectsData(folder);
            const viewMode = projectsWindow.querySelector('.view-btn.active').getAttribute('data-view') || 'icons';
            
            this._renderProjects(contentArea, projects, viewMode);
            
            // Actualizar contador
            if (statusCount) {
                statusCount.textContent = `${projects.length} elemento${projects.length !== 1 ? 's' : ''}`;
            }
        }, 300);
    }

    _getProjectsData(folder) {
        // Para la carpeta root, mostrar directamente los proyectos sin carpetas
        if (folder === 'root') {
            return [
                {
                    id: 'zaratexp',
                    name: 'Zárate XP',
                    type: 'project',
                    icon: './images/Windows XP High Resolution Icon Pack/Windows XP Icons/HTML.png',
                    detailImage: './logo_ivanxp.png',
                    description: 'Portfolio interactivo estilo Windows XP',
                    url: '#',
                    technologies: ['HTML', 'CSS', 'JavaScript'],
                    category: 'Portfolio',
                    status: 'Activo',
                    details: 'Portfolio personal desarrollado como una simulación completa del sistema operativo Windows XP, incluyendo escritorio interactivo, ventanas funcionales, y aplicaciones integradas.'
                },
                {
                    id: 'osintargy',
                    name: 'OSINTArgy',
                    type: 'project',
                    icon: './images/Windows XP High Resolution Icon Pack/Windows XP Icons/Search.png',
                    detailImage: './osintargy.png',
                    description: 'Plataforma OSINT para la Comunidad Hispana',
                    url: 'https://osintargy.online',
                    technologies: ['React 18', 'Node.js', 'MongoDB', 'Canvas HTML5', 'Vite'],
                    category: 'OSINT Platform',
                    status: 'Activo',
                    details: 'OSINTArgy es una plataforma integral de inteligencia de fuentes abiertas (OSINT) diseñada específicamente para democratizar el acceso a herramientas y conocimientos especializados en la comunidad hispanohablante de Argentina y Latinoamérica.'
                },
                {
                    id: 'wjpc-capituloargentino',
                    name: 'WJPC Capítulo Argentino',
                    type: 'project',
                    icon: './icono.png',
                    detailImage: './icono.png',
                    description: 'Sitio web oficial del Capítulo Argentino del Centro de Estudios Hemisféricos de Defensa William J. Perry',
                    url: 'https://wjpc-capituloargentino.org',
                    technologies: ['React 18', 'Vite', 'Tailwind CSS', 'Node.js', 'Express.js', 'Docker', 'Google Cloud Platform'],
                    category: 'Institucional',
                    status: 'Activo',
                    details: 'Aplicación web completa para una organización profesional dedicada a la integración continental y el fortalecimiento de vínculos fraternales entre las naciones americanas. Incluye un sitio público institucional y un panel administrativo para gestión de contenido. Stack tecnológico: Frontend con React 18 + Vite + Tailwind CSS + React Router, Backend con Node.js + Express.js + JWT Authentication, infraestructura en Google Cloud Platform (Cloud Run, Cloud Build, Cloud Storage), contenedorización con Docker + Nginx. Características principales: Sitio público responsive con información institucional, panel de administración con CRUD para noticias y eventos, autenticación JWT con middleware de seguridad, integración con Google Cloud Storage para imágenes, despliegue serverless en Cloud Run con CI/CD, rate limiting y CSP para seguridad. Arquitectura moderna y escalable con prácticas DevOps, seguridad implementada correctamente y responsive design profesional.'
                },
                {
                    id: 'limpia-limpia',
                    name: 'Limpia-Limpia',
                    type: 'project',
                    icon: './limpia-limpia.png',
                    detailImage: './limpia-limpia.png',
                    description: 'Landing Page de Servicio de Limpieza de Tapizados',
                    url: '#',
                    technologies: ['HTML5', 'CSS3', 'JavaScript Vanilla', 'WhatsApp Business API'],
                    category: 'Landing Page',
                    status: 'Próximamente',
                    details: 'Sitio web profesional y responsivo para "Limpia-Limpia", servicio especializado en limpieza de tapizados, sillones y sillas. Landing page optimizada para conversión con integración directa a WhatsApp. Características principales: Diseño responsivo mobile-first con navegación adaptativa, interfaz interactiva con slider antes/después y animaciones smooth scroll, conversión optimizada con múltiples CTAs integrados con WhatsApp, UX moderna con tipografía Google Fonts (Poppins) y esquema de colores profesional. Stack tecnológico: Frontend con HTML5, CSS3 puro, JavaScript vanilla, características avanzadas con CSS Grid/Flexbox, CSS Variables, Intersection Observer API, integración con WhatsApp Business API, performance optimizada con assets optimizados y lazy loading preparado. Funcionalidades: Header con navegación sticky y hamburger menu, sección hero con CTA principal, grid de servicios (sillones, sillas, limpieza profunda), galería interactiva antes/después, proceso paso a paso (4 etapas), botón flotante de WhatsApp, footer informativo. Valor de negocio: Landing diseñada para generar leads vía WhatsApp, diseño que transmite confianza y calidad, estructura preparada para agregar más servicios, SEO Ready con meta tags y estructura semántica optimizada. Diseño con paleta cyan primario (#06b6d4) y verde secundario (#10b981), animaciones con transiciones suaves y efectos hover, responsivo con breakpoints móvil, tablet, desktop, accesibilidad con contraste adecuado y navegación por teclado.'
                },
                {
                    id: 'sistema-enterprise-java',
                    name: 'Sistema Enterprise Java',
                    type: 'project',
                    icon: './images/Windows XP High Resolution Icon Pack/Windows XP Icons/Component Services.png',
                    detailImage: './images/Windows XP High Resolution Icon Pack/Windows XP Icons/Component Services.png',
                    description: 'Aplicación empresarial full-stack para gestión de expedientes con arquitectura escalable',
                    url: '#',
                    technologies: ['Java 17', 'Spring Boot 3.2.3', 'React 18.3.1', 'TypeScript', 'Material-UI', 'Oracle Database 21c', 'Docker', 'Nginx'],
                    category: 'Enterprise',
                    status: 'Activo',
                    details: 'Aplicación empresarial de nivel enterprise para gestión de expedientes y casos, demostrando arquitectura full-stack escalable y robusta con cumplimiento de estándares internacionales de seguridad. Backend: Spring Boot 3.2.3 con Java 17, Oracle Database 21c, arquitectura Repository/Service pattern, migraciones Flyway, mapeo MapStruct entity-DTO, monitoreo Spring Actuator, manejo centralizado de excepciones. Frontend: React 18.3.1 con TypeScript, Material-UI para componentes, gestión de estado con Context API, hooks personalizados para lógica reutilizable, rutas protegidas con verificación de roles, lazy loading y error boundaries, service workers para funcionalidad offline. Funcionalidades clave: Sistema de gestión completa de expedientes con creación/edición de casos, gestión de personas con scoring de prioridad, carga y gestión de fotos/documentos, tracking de estados. API pública con endpoint público, codificación Base64 de fotos para fácil integración, filtrado por autorización judicial, CORS habilitado para sitios institucionales. Dashboard avanzado con estadísticas y métricas en tiempo real, charts interactivos (Recharts), mapas de calor geográficos (Leaflet), rankings por tipo, evolución temporal de casos. Seguridad enterprise: Autenticación JWT con refresh tokens, 2FA obligatorio (Google Authenticator), acceso basado en roles granular (ADMIN/USER/READ_ONLY), auditoría completa de actividades, protección de timeout de sesión, cumplimiento de normas OWASP Top 10 para seguridad en aplicaciones web, implementación de controles ISO/IEC 27001 para Sistema de Gestión de Seguridad de la Información (SGSI), incluyendo establecimiento, implementación, mantenimiento y mejora continua de políticas de seguridad. DevOps: Dockerfiles multi-stage optimizados, orquestación Docker Compose, configuraciones específicas por ambiente, scripts de deployment automatizado, health checks de contenedores. Demostración de arquitectura de nivel enterprise con seguridad robusta certificada bajo estándares internacionales, escalabilidad y API pública para integración institucional.'
                },
                {
                    id: 'n8n-workflows-atencion',
                    name: 'Workflows n8n - Atención al Cliente',
                    type: 'project',
                    icon: './N8n-logo-new.svg.png',
                    detailImage: './N8n-logo-new.svg.png',
                    description: 'Automatización de procesos de atención al cliente para e-commerce mediante workflows inteligentes',
                    url: '#',
                    technologies: ['n8n', 'Webhook APIs', 'Gmail API', 'Slack API', 'Google Sheets API', 'WhatsApp Business API', 'Telegram Bot API'],
                    category: 'Automatización',
                    status: 'Activo',
                    details: 'Suite de workflows de automatización diseñada para optimizar procesos de atención al cliente en tiendas online y e-commerce. Workflows implementados: Gestión automática de consultas por WhatsApp con clasificación inteligente de mensajes, respuestas automáticas según tipo de consulta, escalamiento a agentes humanos para casos complejos, integración con base de datos de productos para consultas de stock y precios. Automatización de seguimiento post-venta con envío automático de emails de seguimiento después de compras, solicitud de reseñas y feedback, notificaciones de estado de envío, recordatorios de garantía y soporte técnico. Sistema de alertas y monitoreo con notificaciones en Slack para pedidos urgentes, alertas de stock bajo, reportes diarios de métricas de atención, escalamiento automático de quejas y reclamos. Sincronización de datos entre plataformas con actualización automática de inventario entre sistemas, sincronización de datos de clientes, exportación de métricas a Google Sheets, backup automático de conversaciones importantes. Gestión de tickets de soporte con creación automática de tickets desde múltiples canales (email, WhatsApp, formularios web), asignación inteligente según disponibilidad y especialización del equipo, seguimiento automático de tiempos de respuesta, cierre automático de tickets resueltos. Integración omnicanal con conexión entre WhatsApp, Telegram, email y formularios web, historial unificado de conversaciones por cliente, routing inteligente según canal de origen y tipo de consulta. Los workflows están diseñados con triggers inteligentes, validaciones de datos, manejo de errores y recuperación automática, logging detallado para auditoría y optimización. Demostración de capacidades de automatización empresarial con integración multi-plataforma y mejora significativa en tiempos de respuesta y satisfacción del cliente.'
                }
            ];
        }
        
        // Mantener el comportamiento original para otras carpetas
        const projectsData = {
            'web': [
                {
                    id: 'osintargy',
                    name: 'OSINTArgy',
                    type: 'project',
                    icon: '🔍',
                    detailImage: './osintargy.png',
                    description: 'Plataforma OSINT para la Comunidad Hispana',
                    url: 'https://osintargy.online',
                    technologies: ['React 18', 'Node.js', 'MongoDB', 'Canvas HTML5', 'Vite'],
                    category: 'OSINT Platform',
                    status: 'Activo',
                    details: 'OSINTArgy es una plataforma integral de inteligencia de fuentes abiertas (OSINT) diseñada específicamente para democratizar el acceso a herramientas y conocimientos especializados en la comunidad hispanohablante de Argentina y Latinoamérica. Características principales: Interfaz tipo galaxia con visualización interactiva, generador avanzado de Google Dorks con 400+ dorks especializados, herramientas OSINT especializadas para email, username y análisis de archivos, componentes educativos con academia OSINT y juego detective. Stack tecnológico: React 18 + Vite, Canvas HTML5 para visualizaciones, Node.js 18+ + Express.js, MongoDB con autenticación JWT. Impacto: Democratización del conocimiento OSINT en español, enfoque educativo con propósito social.'
                },
                {
                    id: 'zaratexp',
                    name: 'ZarateXP Portfolio',
                    type: 'project',
                    icon: './microsoft-windosXP.png',
                    detailImage: './logo_ivanxp.png',
                    description: 'Portfolio interactivo estilo Windows XP',
                    url: '#',
                    technologies: ['HTML', 'CSS', 'JavaScript'],
                    category: 'Portfolio',
                    status: 'Activo',
                    details: 'Portfolio personal desarrollado como una simulación completa del sistema operativo Windows XP, incluyendo escritorio interactivo, ventanas funcionales, y aplicaciones integradas.'
                }
            ],
            'ai': []
        };

        return projectsData[folder] || [];
    }

    _renderProjects(contentArea, projects, viewMode) {
        if (viewMode === 'icons') {
            this._renderIconView(contentArea, projects);
        } else {
            this._renderListView(contentArea, projects);
        }
    }

    _renderIconView(contentArea, projects) {
        const iconsHtml = projects.map(project => {
            const iconHtml = project.icon.startsWith('./') || project.icon.includes('.png') || project.icon.includes('.jpg') || project.icon.includes('.svg') 
                ? `<img src="${project.icon}" width="32" height="32" alt="${project.name}" style="object-fit: contain;"/>` 
                : project.icon;
            
            return `
                <div class="project-item" data-project-id="${project.id}" data-type="${project.type}" title="${project.description}">
                    <div class="project-icon">
                        ${iconHtml}
                    </div>
                    <div class="project-name">${project.name}</div>
                    <div class="project-details">${project.type === 'folder' ? 'Carpeta' : project.category}</div>
                </div>
            `;
        }).join('');

        contentArea.innerHTML = `<div class="icons-view">${iconsHtml}</div>`;
    }

    _renderListView(contentArea, projects) {
        const listHtml = `
            <div class="list-view">
                <div class="list-header">
                    <div class="list-header-row">
                        <div class="list-header-cell">Nombre</div>
                        <div class="list-header-cell">Tipo</div>
                        <div class="list-header-cell">Categoría</div>
                        <div class="list-header-cell">Estado</div>
                    </div>
                </div>
                <div class="list-body">
                    ${projects.map(project => {
                        const iconHtml = project.icon.startsWith('./') || project.icon.includes('.png') || project.icon.includes('.jpg') || project.icon.includes('.svg') 
                            ? `<img src="${project.icon}" width="16" height="16" alt="${project.name}" style="object-fit: contain;"/>` 
                            : project.icon;
                        
                        return `
                            <div class="list-row" data-project-id="${project.id}" data-type="${project.type}">
                                <div class="list-cell">
                                    <span class="list-cell-icon">${iconHtml}</span>
                                    ${project.name}
                                </div>
                                <div class="list-cell">${project.type === 'folder' ? 'Carpeta' : 'Proyecto'}</div>
                                <div class="list-cell">${project.category || '-'}</div>
                                <div class="list-cell">${project.status || '-'}</div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;

        contentArea.innerHTML = listHtml;
    }

    _switchView(projectsWindow, viewMode) {
        const contentArea = projectsWindow.querySelector('#explorer-content');
        const currentFolder = projectsWindow.querySelector('.tree-item.selected')?.getAttribute('data-folder') || 'root';
        const projects = this._getProjectsData(currentFolder);
        
        this._renderProjects(contentArea, projects, viewMode);
    }

    _updateStatusBar(projectsWindow, selectedItem = null) {
        const selectionInfo = projectsWindow.querySelector('#selection-info');
        
        if (selectedItem && selectionInfo) {
            const projectName = selectedItem.querySelector('.project-name')?.textContent || '';
            const projectType = selectedItem.getAttribute('data-type') || '';
            selectionInfo.textContent = `${projectName} (${projectType === 'folder' ? 'Carpeta' : 'Proyecto'})`;
        } else if (selectionInfo) {
            const currentPath = projectsWindow.querySelector('#current-path')?.value || 'Mis Proyectos';
            selectionInfo.textContent = currentPath;
        }
    }

    _openProjectDetails(projectsWindow, projectId) {
        const projects = this._getAllProjects();
        const project = projects.find(p => p.id === projectId);
        
        if (!project) return;

        if (project.type === 'folder') {
            // Si es carpeta, navegar a ella
            const folderMap = {
                'web-folder': 'web',
                'ai-folder': 'ai'
            };
            
            const targetFolder = folderMap[projectId];
            if (targetFolder) {
                this._navigateToFolder(projectsWindow, targetFolder);
            }
        } else {
            // Si es proyecto, mostrar detalles
            this._showProjectDetails(project);
        }
    }

    _getAllProjects() {
        const allProjects = [];
        const folders = ['root', 'web', 'ai'];
        
        folders.forEach(folder => {
            allProjects.push(...this._getProjectsData(folder));
        });
        
        return allProjects;
    }

    _navigateToFolder(projectsWindow, folder) {
        // Seleccionar el item del árbol correspondiente
        const treeItem = projectsWindow.querySelector(`[data-folder="${folder}"]`);
        if (treeItem) {
            // Simular click en el item del árbol
            const content = treeItem.querySelector('.tree-item-content');
            if (content) {
                content.click();
            }
        }
    }

    _showProjectDetails(project) {
        if (this.windowManager) {
            const detailsContent = `
                <div style="padding: 20px; font-family: 'Tahoma', sans-serif; font-size: 11px;">
                    <div style="display: flex; align-items: center; margin-bottom: 20px;">
                        <div style="margin-right: 16px;">
                            ${project.detailImage ?
                                `<img src="${project.detailImage}" width="64" height="64" alt="${project.name}" style="object-fit: contain;" />` :
                                (project.icon.startsWith('./') || project.icon.includes('.png') || project.icon.includes('.jpg') ?
                                    `<img src="${project.icon}" width="48" height="48" alt="${project.name}" style="object-fit: contain;" />` :
                                    `<div style="font-size: 48px;">${project.icon}</div>`
                                )
                            }
                        </div>
                        <div>
                            <h2 style="margin: 0 0 8px 0; font-size: 16px; color: #1E4A8C;">${project.name}</h2>
                            <p style="margin: 0; color: #666; font-size: 12px;">${project.description}</p>
                        </div>
                    </div>
                    
                    <div style="border: 1px solid #ACA899; padding: 12px; background: #F0F0F0; margin-bottom: 16px;">
                        <div style="margin-bottom: 8px;"><strong>Categoría:</strong> ${project.category}</div>
                        <div style="margin-bottom: 8px;"><strong>Estado:</strong> ${project.status}</div>
                        ${project.technologies ? `<div style="margin-bottom: 8px;"><strong>Tecnologías:</strong> ${project.technologies.join(', ')}</div>` : ''}
                    </div>
                    
                    <div style="margin-bottom: 16px;">
                        <strong>Descripción detallada:</strong><br>
                        <div style="margin-top: 8px; line-height: 1.4; color: #333;">
                            ${project.details || project.description}
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 8px; justify-content: flex-end;">
                        ${project.url && project.url !== '#' ? 
                            `<button onclick="window.open('${project.url}', '_blank')" style="padding: 6px 16px; font-size: 11px;">Visitar Sitio</button>` : 
                            ''
                        }
                        <button onclick="this.closest('.window').remove()" style="padding: 6px 16px; font-size: 11px;">Cerrar</button>
                    </div>
                </div>
            `;

            this.windowManager.createWindow({
                id: `project-details-${project.id}`,
                title: `${project.name} - Detalles`,
                icon: './images/Windows XP High Resolution Icon Pack/Windows XP Icons/Properties.png',
                content: detailsContent,
                width: 500,
                height: 400,
                resizable: true,
                maximizable: false
            });
        }
    }

    _showContactConfirmation(contactWindow) {
        // Crear ventana de confirmación
        if (this.windowManager) {
            this.windowManager.createWindow({
                id: 'contact-confirmation',
                title: 'Mensaje Enviado',
                icon: './images/Windows XP High Resolution Icon Pack/Windows XP Icons/Outlook Express.png',
                content: `
                    <div style="padding: 20px; text-align: center;">
                        <div style="font-size: 48px; color: green; margin-bottom: 10px;">✅</div>
                        <div style="margin-bottom: 10px;"><strong>¡Mensaje preparado!</strong></div>
                        <div style="margin-bottom: 20px; color: #666; line-height: 1.4;">
                            Se abrió tu cliente de correo con el mensaje pre-rellenado.<br>
                            Solo presiona "Enviar" para que me llegue tu mensaje.
                        </div>
                        <button onclick="this.closest('.window').remove()" style="padding: 6px 16px;">Perfecto</button>
                    </div>
                `,
                width: 350,
                height: 200,
                resizable: false,
                maximizable: false
            });
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
    
    async _openMinesweeper() {
        // Prevenir que se abra más de una ventana de Buscaminas
        if (this.runningApps.has('minesweeper')) {
            console.log('Minesweeper is already running');
            if (this.windowManager && this.windowManager.focusWindow) {
                this.windowManager.focusWindow('minesweeper');
            }
            return;
        }
        
        try {
            // Verificar que WindowManager esté disponible
            if (!this.windowManager) {
                throw new Error('WindowManager no está disponible');
            }
            
            // Cargar el contenido del buscaminas
            console.log('Loading minesweeper.html...');
            const response = await fetch('./minesweeper.html');
            if (!response.ok) {
                throw new Error(`Error al cargar minesweeper.html: ${response.statusText} (${response.status})`);
            }
            const htmlContent = await response.text();
            
            // Crear la ventana usando el WindowManager
            const minesweeperWindow = this.windowManager.createWindow({
                id: 'minesweeper',
                title: 'Buscaminas',
                icon: './images/Windows XP High Resolution Icon Pack/Windows XP Icons/Minesweeper.png',
                content: htmlContent,
                width: 300,
                height: 380,
                resizable: false,
                maximizable: false
            });
            
            // Cargar dinámicamente el script del buscaminas
            setTimeout(() => {
                const windowElement = document.querySelector('[data-window-id="minesweeper"]');
                if (windowElement) {
                    // Verificar si ya se ha cargado el script
                    if (!document.querySelector('script[src="js/minesweeper-simple.js"]')) {
                        const script = document.createElement('script');
                        script.src = 'js/minesweeper-simple.js';
                        script.type = 'text/javascript';
                        
                        script.onload = () => {
                            console.log('Minesweeper script loaded, initializing game...');
                            if (typeof initMinesweeperGame === 'function') {
                                try {
                                    initMinesweeperGame();
                                    console.log('Minesweeper game initialized successfully');
                                } catch (error) {
                                    console.error('Error initializing minesweeper game:', error);
                                }
                            }
                        };
                        
                        script.onerror = (error) => {
                            console.error('Error loading minesweeper script:', error);
                        };
                        
                        document.head.appendChild(script);
                    } else {
                        console.log('Minesweeper script already loaded, initializing game...');
                        if (typeof initMinesweeperGame === 'function') {
                            try {
                                initMinesweeperGame();
                                console.log('Minesweeper game initialized successfully');
                            } catch (error) {
                                console.error('Error initializing minesweeper game:', error);
                            }
                        }
                    }
                } else {
                    console.log('Minesweeper window element not found');
                }
            }, 300);
            
            // Hacer la ventana arrastrable
            makeDraggable(minesweeperWindow);
            
            // Configurar observer para detectar cuando se cierra la ventana
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'childList') {
                        mutation.removedNodes.forEach((node) => {
                            if (node.dataset && node.dataset.windowId === 'minesweeper') {
                                console.log('Minesweeper window closed');
                                this.closeApp('minesweeper');
                                observer.disconnect();
                            }
                        });
                    }
                });
            });
            
            // Observar cambios en el contenedor de ventanas
            if (minesweeperWindow.parentNode) {
                observer.observe(minesweeperWindow.parentNode, { childList: true });
            }
            
            // Marcar como aplicación en ejecución
            this.runningApps.set('minesweeper', 'minesweeper');
            
            console.log('Minesweeper window created successfully');
            return minesweeperWindow;
            
        } catch (error) {
            console.error('Error al abrir Buscaminas:', error);
            this.showError(`Error al abrir Buscaminas: ${error.message}`);
        }
    }

    async _openPaint() {
        // Prevenir que se abra más de una ventana de Paint
        if (this.runningApps.has('paint')) {
            console.log('Paint is already running');
            if (this.windowManager && this.windowManager.focusWindow) {
                this.windowManager.focusWindow('paint');
            }
            return;
        }
        
        try {
            // Verificar que WindowManager esté disponible
            if (!this.windowManager) {
                throw new Error('WindowManager no está disponible');
            }
            
            // Cargar el contenido de Paint
            console.log('Loading paint.html...');
            const response = await fetch('./paint.html');
            if (!response.ok) {
                throw new Error(`Error al cargar paint.html: ${response.statusText} (${response.status})`);
            }
            const htmlContent = await response.text();
            
            // Crear la ventana usando el WindowManager
            const paintWindow = this.windowManager.createWindow({
                id: 'paint',
                title: 'Paint',
                icon: './images/Windows XP High Resolution Icon Pack/Windows XP Icons/Paint.png',
                content: htmlContent,
                width: 550,
                height: 450,
                resizable: true,
                maximizable: true
            });
            
            // Cargar dinámicamente el script de Paint
            setTimeout(() => {
                const windowElement = document.querySelector('[data-window-id="paint"]');
                if (windowElement) {
                    // Verificar si ya se ha cargado el script
                    if (!document.querySelector('script[src="js/paint.js"]')) {
                        const script = document.createElement('script');
                        script.src = 'js/paint.js';
                        script.type = 'text/javascript';
                        
                        script.onload = () => {
                            console.log('Paint script loaded, initializing app...');
                            if (typeof initPaintApp === 'function') {
                                try {
                                    initPaintApp();
                                    console.log('Paint app initialized successfully');
                                } catch (error) {
                                    console.error('Error initializing paint app:', error);
                                }
                            }
                        };
                        
                        script.onerror = (error) => {
                            console.error('Error loading paint script:', error);
                        };
                        
                        document.head.appendChild(script);
                    } else {
                        console.log('Paint script already loaded, initializing app...');
                        if (typeof initPaintApp === 'function') {
                            try {
                                initPaintApp();
                                console.log('Paint app initialized successfully');
                            } catch (error) {
                                console.error('Error initializing paint app:', error);
                            }
                        }
                    }
                } else {
                    console.log('Paint window element not found');
                }
            }, 300);
            
            // Hacer la ventana arrastrable
            makeDraggable(paintWindow);
            
            // Configurar observer para detectar cuando se cierra la ventana
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'childList') {
                        mutation.removedNodes.forEach((node) => {
                            if (node.dataset && node.dataset.windowId === 'paint') {
                                console.log('Paint window closed');
                                this.closeApp('paint');
                                observer.disconnect();
                            }
                        });
                    }
                });
            });
            
            // Observar cambios en el contenedor de ventanas
            if (paintWindow.parentNode) {
                observer.observe(paintWindow.parentNode, { childList: true });
            }
            
            // Marcar como aplicación en ejecución
            this.runningApps.set('paint', 'paint');
            
            console.log('Paint window created successfully');
            return paintWindow;
            
        } catch (error) {
            console.error('Error al abrir Paint:', error);
            this.showError(`Error al abrir Paint: ${error.message}`);
        }
    }

    async _openResume() {
        // Prevenir que se abra más de una ventana de Resume
        if (this.runningApps.has('resume')) {
            console.log('Resume is already running');
            if (this.windowManager && this.windowManager.focusWindow) {
                this.windowManager.focusWindow('resume');
            }
            return;
        }

        try {
            // Verificar que WindowManager esté disponible
            if (!this.windowManager) {
                throw new Error('WindowManager no está disponible');
            }

            // Mostrar la imagen del CV directamente
            const content = `
                <div id="resume-viewer">
                    <div class="resume-content">
                        <img src="./images/MI_CV.jpg" alt="CV Ivan Agustin Zarate" style="width: 100%; height: 100%; object-fit: contain; background: white;">
                    </div>
                </div>
                <style>
                    #resume-viewer {
                        display: flex;
                        flex-direction: column;
                        height: 100%;
                        font-family: 'Tahoma', sans-serif;
                        font-size: 11px;
                    }
                    
                    .resume-content {
                        flex: 1;
                        background: #f3f4f6;
                        padding: 0;
                        overflow: hidden;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                </style>
            `;

            // Crear la ventana usando el WindowManager
            const resumeWindow = this.windowManager.createWindow({
                id: 'resume',
                title: 'Mi Curriculum Vitae',
                icon: './images/Windows XP High Resolution Icon Pack/Windows XP Icons/Document Search.png',
                content: content,
                width: 700,
                height: 600,
                resizable: true,
                maximizable: true
            });

            // Marcar como aplicación en ejecución
            this.runningApps.set('resume', 'resume');

            // Configurar cleanup cuando se cierre la ventana
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.removedNodes.length > 0) {
                        mutation.removedNodes.forEach((node) => {
                            if (node === resumeWindow) {
                                console.log('Resume window removed, cleaning up...');
                                this.closeApp('resume');
                                observer.disconnect();
                            }
                        });
                    }
                });
            });
            
            // Observar cambios en el contenedor de ventanas
            if (resumeWindow.parentNode) {
                observer.observe(resumeWindow.parentNode, { childList: true });
            }

            console.log('Resume image viewer window created successfully');
            return resumeWindow;

        } catch (error) {
            console.error("No se pudo abrir el CV:", error);
            
            // Mostrar una ventana de error al usuario
            if (this.windowManager) {
                this.windowManager.createWindow({
                    id: 'error-resume',
                    title: 'Error',
                    icon: './images/Windows XP High Resolution Icon Pack/Windows XP Icons/Critical.png',
                    content: `
                        <div style="padding: 20px; text-align: center;">
                            <div style="font-size: 48px; color: red; margin-bottom: 10px;">❌</div>
                            <div style="margin-bottom: 10px;"><strong>No se pudo cargar el CV</strong></div>
                            <div style="margin-bottom: 20px; color: #666;">${"$"}{error.message}</div>
                            <button onclick="this.closest('.window').remove()">Aceptar</button>
                        </div>
                    `,
                    width: 400,
                    height: 200,
                    resizable: false
                });
            } else {
                alert(`Error: No se pudo abrir el CV. ${"$"}{error.message}`);
            }
        }
    }

    _setupCVIframe(resumeWindow, bodyContent) {
        try {
            const iframe = resumeWindow.querySelector('#cv-iframe');
            if (!iframe) {
                console.error('No se encontró el iframe del CV');
                return;
            }

            // Crear el documento HTML completo para el iframe
            const iframeDocument = `
                <!DOCTYPE html>
                <html lang="es">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>CV de Iván Zarate</title>
                    <!-- Carga de Tailwind CSS -->
                    <script src="https://cdn.tailwindcss.com"></script>
                    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
                    <style>
                        body {
                            font-family: 'Inter', sans-serif;
                            background-color: #f3f4f6;
                            margin: 0;
                            padding: 8px;
                        }
                        .section-title {
                            border-bottom: 2px solid #3b82f6;
                            padding-bottom: 0.5rem;
                            margin-bottom: 1rem;
                        }
                        .max-w-4xl {
                            max-width: 100% !important;
                            margin: 0 !important;
                        }
                    </style>
                </head>
                <body>
                    ${bodyContent}
                </body>
                </html>
            `;

            // Escribir el contenido al iframe
            iframe.onload = () => {
                try {
                    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                    iframeDoc.open();
                    iframeDoc.write(iframeDocument);
                    iframeDoc.close();
                    console.log('CV iframe configurado correctamente');
                } catch (error) {
                    console.error('Error configurando iframe:', error);
                }
            };

            // Configurar el iframe inmediatamente si ya está cargado
            if (iframe.contentDocument) {
                iframe.onload();
            } else {
                // Fallback: configurar el src del iframe
                iframe.src = 'data:text/html;charset=utf-8,' + encodeURIComponent(iframeDocument);
            }

        } catch (error) {
            console.error('Error configurando iframe del CV:', error);
        }
    }

    _setupResumeButtons(resumeWindow, pdfPath) {
        try {
            const openBtn = resumeWindow.querySelector('#open-pdf-btn');
            const saveBtn = resumeWindow.querySelector('#save-pdf-btn');
            const printBtn = resumeWindow.querySelector('#print-pdf-btn');

            // Función para descargar el PDF
            const downloadPDF = () => {
                const link = document.createElement('a');
                link.href = pdfPath;
                link.download = 'Ivan_Zarate_CV.pdf';
                link.click();
                
                // Actualizar status
                const statusElement = resumeWindow.querySelector('#resume-status');
                if (statusElement) {
                    statusElement.textContent = 'Descargando CV...';
                    setTimeout(() => {
                        statusElement.textContent = 'Listo';
                    }, 2000);
                }
            };

            // Función para abrir PDF en nueva ventana
            const openPDFInNewWindow = () => {
                window.open(pdfPath, '_blank');
                
                // Actualizar status
                const statusElement = resumeWindow.querySelector('#resume-status');
                if (statusElement) {
                    statusElement.textContent = 'Abriendo PDF...';
                    setTimeout(() => {
                        statusElement.textContent = 'Listo';
                    }, 2000);
                }
            };

            // Configurar eventos de botones
            if (openBtn) {
                openBtn.addEventListener('click', openPDFInNewWindow);
            }

            if (saveBtn) {
                saveBtn.addEventListener('click', downloadPDF);
            }

            if (printBtn) {
                printBtn.addEventListener('click', () => {
                    // Imprimir la ventana actual (HTML CV)
                    const printWindow = window.open('', '_blank');
                    const cvContent = resumeWindow.querySelector('.cv-container').innerHTML;
                    
                    printWindow.document.write(`
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <title>CV - Ivan Agustin Zarate</title>
                            <style>
                                body { font-family: Arial, sans-serif; margin: 20px; }
                                @media print {
                                    body { margin: 0; }
                                }
                            </style>
                        </head>
                        <body>
                            ${cvContent}
                        </body>
                        </html>
                    `);
                    
                    printWindow.document.close();
                    printWindow.print();
                    
                    // Actualizar status
                    const statusElement = resumeWindow.querySelector('#resume-status');
                    if (statusElement) {
                        statusElement.textContent = 'Preparando impresión...';
                        setTimeout(() => {
                            statusElement.textContent = 'Listo';
                        }, 2000);
                    }
                });
            }

            console.log('Resume buttons configured successfully');

        } catch (error) {
            console.error('Error configurando botones del CV:', error);
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
        } else if (appId === 'minesweeper') {
            console.log('Cleaning up Buscaminas application');
            // Limpiar timer del buscaminas si existe
            if (window.timerInterval) {
                clearInterval(window.timerInterval);
                window.timerInterval = null;
            }
        } else if (appId === 'my-computer') {
            console.log('Cleaning up Mi PC application');
            // Aquí se puede añadir cleanup específico para Mi PC si es necesario
        } else if (appId === 'contact') {
            console.log('Cleaning up Contact application');
            // Limpiar cualquier event listener específico si es necesario
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