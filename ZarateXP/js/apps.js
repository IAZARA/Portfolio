// Application Manager Module
export class AppManager {
    constructor() {
        this.apps = new Map();
        this.runningApps = new Map();
        
        // Register built-in applications
        this.registerBuiltInApps();
    }
    
    init() {
        // Initialize app registry
        this.loadAppRegistry();
    }
    
    registerBuiltInApps() {
        // About Me (Portfolio)
        this.registerApp({
            id: 'about-me',
            name: 'About Me',
            icon: './images/icons/user.png',
            category: 'system',
            description: 'Learn about Zarate',
            handler: () => this.openAboutMe()
        });
        
        // My Projects
        this.registerApp({
            id: 'my-projects',
            name: 'My Projects',
            icon: './images/icons/folder-projects.png',
            category: 'documents',
            description: 'View my portfolio projects',
            handler: () => this.openProjects()
        });
        
        // Resume
        this.registerApp({
            id: 'resume',
            name: 'Resume.pdf',
            icon: './images/icons/pdf.png',
            category: 'documents',
            description: 'View my resume',
            handler: () => this.openResume()
        });
        
        // Contact
        this.registerApp({
            id: 'contact',
            name: 'Contact',
            icon: './images/icons/email.png',
            category: 'internet',
            description: 'Get in touch',
            handler: () => this.openContact()
        });
        
        // Skills
        this.registerApp({
            id: 'skills',
            name: 'Skills & Tools',
            icon: './images/icons/tools.png',
            category: 'system',
            description: 'Technical skills and tools',
            handler: () => this.openSkills()
        });
        
        // Terminal
        this.registerApp({
            id: 'terminal',
            name: 'Command Prompt',
            icon: './images/icons/cmd.png',
            category: 'system',
            description: 'Command line interface',
            handler: () => this.openTerminal()
        });
        
        // Notepad
        this.registerApp({
            id: 'notepad',
            name: 'Notepad',
            icon: './images/icons/notepad.png',
            category: 'accessories',
            description: 'Simple text editor',
            handler: () => this.openNotepad()
        });
        
        // Paint
        this.registerApp({
            id: 'paint',
            name: 'Paint',
            icon: './images/icons/paint.png',
            category: 'accessories',
            description: 'Image editor',
            handler: () => this.openPaint()
        });
        
        // Calculator
        this.registerApp({
            id: 'calculator',
            name: 'Calculator',
            icon: './images/icons/calc.png',
            category: 'accessories',
            description: 'Calculator application',
            handler: () => this.openCalculator()
        });
        
        // Internet Explorer
        this.registerApp({
            id: 'internet-explorer',
            name: 'Internet Explorer',
            icon: './images/icons/ie.png',
            category: 'internet',
            description: 'Browse the web',
            handler: () => this.openInternetExplorer()
        });
        
        // Media Player
        this.registerApp({
            id: 'media-player',
            name: 'Windows Media Player',
            icon: './images/icons/media-player.png',
            category: 'entertainment',
            description: 'Play media files',
            handler: () => this.openMediaPlayer()
        });
        
        // Minesweeper
        this.registerApp({
            id: 'minesweeper',
            name: 'Minesweeper',
            icon: './images/icons/minesweeper.png',
            category: 'games',
            description: 'Classic Minesweeper game',
            handler: () => this.openMinesweeper()
        });
        
        // Solitaire
        this.registerApp({
            id: 'solitaire',
            name: 'Solitaire',
            icon: './images/icons/solitaire.png',
            category: 'games',
            description: 'Classic card game',
            handler: () => this.openSolitaire()
        });
        
        // Control Panel
        this.registerApp({
            id: 'control-panel',
            name: 'Control Panel',
            icon: './images/icons/control-panel.png',
            category: 'system',
            description: 'System settings',
            handler: () => this.openControlPanel()
        });
        
        // Recycle Bin
        this.registerApp({
            id: 'recycle-bin',
            name: 'Recycle Bin',
            icon: './images/icons/recycle-bin-empty.png',
            category: 'system',
            description: 'Deleted items',
            handler: () => this.openRecycleBin()
        });
    }
    
    registerApp(appConfig) {
        this.apps.set(appConfig.id, appConfig);
    }
    
    loadAppRegistry() {
        // Load custom apps from localStorage
        const customApps = localStorage.getItem('zarateXP_customApps');
        if (customApps) {
            try {
                const apps = JSON.parse(customApps);
                apps.forEach(app => this.registerApp(app));
            } catch (e) {
                console.error('Failed to load custom apps:', e);
            }
        }
    }
    
    launchApp(appId) {
        const app = this.apps.get(appId);
        if (!app) {
            console.error(`App not found: ${appId}`);
            this.showError(`Application "${appId}" not found`);
            return;
        }
        
        // Check if app is already running
        if (this.runningApps.has(appId) && !app.multiInstance) {
            // Focus existing window
            const windowId = this.runningApps.get(appId);
            if (window.zarateXP?.windowManager) {
                window.zarateXP.windowManager.focusWindow(windowId);
            }
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
    
    closeApp(appId) {
        this.runningApps.delete(appId);
    }
    
    getApp(appId) {
        return this.apps.get(appId);
    }
    
    getAppsByCategory(category) {
        return Array.from(this.apps.values()).filter(app => app.category === category);
    }
    
    getAllApps() {
        return Array.from(this.apps.values());
    }
    
    // Built-in app handlers
    openAboutMe() {
        const content = `
            <div class="about-me-content">
                <div class="profile-section">
                    <img src="./images/profile.jpg" alt="Profile" class="profile-image">
                    <h2>Zarate</h2>
                    <p class="tagline">Full Stack Developer</p>
                </div>
                
                <div class="info-section">
                    <h3>About Me</h3>
                    <p>Passionate developer with expertise in modern web technologies. 
                    I love creating innovative solutions and bringing ideas to life through code.</p>
                    
                    <h3>What I Do</h3>
                    <ul>
                        <li>🚀 Full Stack Development</li>
                        <li>💻 Web Applications</li>
                        <li>📱 Responsive Design</li>
                        <li>🎨 UI/UX Design</li>
                        <li>🔧 System Architecture</li>
                    </ul>
                    
                    <h3>Experience</h3>
                    <p>5+ years building scalable web applications and leading development teams.</p>
                </div>
            </div>
        `;
        
        return this.createWindow('about-me', 'About Me', content, {
            width: 500,
            height: 600
        });
    }
    
    openProjects() {
        const content = `
            <div class="projects-content">
                <div class="toolbar">
                    <button class="filter-btn active" data-filter="all">All Projects</button>
                    <button class="filter-btn" data-filter="web">Web Apps</button>
                    <button class="filter-btn" data-filter="mobile">Mobile</button>
                    <button class="filter-btn" data-filter="other">Other</button>
                </div>
                
                <div class="projects-grid">
                    <div class="project-card" data-category="web">
                        <img src="./images/projects/project1.png" alt="Project 1">
                        <h3>E-Commerce Platform</h3>
                        <p>Full-stack e-commerce solution with React and Node.js</p>
                        <div class="tech-stack">
                            <span class="tech-tag">React</span>
                            <span class="tech-tag">Node.js</span>
                            <span class="tech-tag">MongoDB</span>
                        </div>
                        <button class="view-btn">View Details</button>
                    </div>
                    
                    <div class="project-card" data-category="mobile">
                        <img src="./images/projects/project2.png" alt="Project 2">
                        <h3>Task Manager App</h3>
                        <p>Cross-platform mobile app for task management</p>
                        <div class="tech-stack">
                            <span class="tech-tag">React Native</span>
                            <span class="tech-tag">Firebase</span>
                        </div>
                        <button class="view-btn">View Details</button>
                    </div>
                    
                    <div class="project-card" data-category="web">
                        <img src="./images/projects/project3.png" alt="Project 3">
                        <h3>Real-time Chat App</h3>
                        <p>WebSocket-based chat application with rooms</p>
                        <div class="tech-stack">
                            <span class="tech-tag">Socket.io</span>
                            <span class="tech-tag">Express</span>
                            <span class="tech-tag">Redis</span>
                        </div>
                        <button class="view-btn">View Details</button>
                    </div>
                </div>
            </div>
        `;
        
        return this.createWindow('my-projects', 'My Projects', content, {
            width: 800,
            height: 600
        });
    }
    
    openResume() {
        const content = `
            <div class="resume-viewer">
                <div class="pdf-toolbar">
                    <button class="pdf-btn">🖨️ Print</button>
                    <button class="pdf-btn">💾 Download</button>
                    <button class="pdf-btn">🔍 Zoom In</button>
                    <button class="pdf-btn">🔍 Zoom Out</button>
                </div>
                <iframe src="./documents/resume.pdf" class="pdf-frame"></iframe>
            </div>
        `;
        
        return this.createWindow('resume', 'Resume.pdf', content, {
            width: 700,
            height: 900
        });
    }
    
    openContact() {
        const content = `
            <div class="contact-content">
                <h2>Get in Touch</h2>
                
                <form class="contact-form">
                    <div class="form-group">
                        <label>Name:</label>
                        <input type="text" class="form-control" required>
                    </div>
                    
                    <div class="form-group">
                        <label>Email:</label>
                        <input type="email" class="form-control" required>
                    </div>
                    
                    <div class="form-group">
                        <label>Subject:</label>
                        <input type="text" class="form-control" required>
                    </div>
                    
                    <div class="form-group">
                        <label>Message:</label>
                        <textarea class="form-control" rows="5" required></textarea>
                    </div>
                    
                    <button type="submit" class="submit-btn">Send Message</button>
                </form>
                
                <div class="contact-info">
                    <h3>Other Ways to Connect</h3>
                    <div class="social-links">
                        <a href="#" class="social-link">📧 email@example.com</a>
                        <a href="#" class="social-link">💼 LinkedIn</a>
                        <a href="#" class="social-link">🐙 GitHub</a>
                        <a href="#" class="social-link">🐦 Twitter</a>
                    </div>
                </div>
            </div>
        `;
        
        return this.createWindow('contact', 'Contact', content, {
            width: 500,
            height: 600
        });
    }
    
    openSkills() {
        const content = `
            <div class="skills-content">
                <div class="skills-tabs">
                    <button class="tab-btn active" data-tab="languages">Languages</button>
                    <button class="tab-btn" data-tab="frameworks">Frameworks</button>
                    <button class="tab-btn" data-tab="tools">Tools</button>
                    <button class="tab-btn" data-tab="other">Other</button>
                </div>
                
                <div class="tab-content active" id="languages">
                    <div class="skill-item">
                        <span class="skill-name">JavaScript</span>
                        <div class="skill-bar">
                            <div class="skill-progress" style="width: 90%"></div>
                        </div>
                    </div>
                    <div class="skill-item">
                        <span class="skill-name">TypeScript</span>
                        <div class="skill-bar">
                            <div class="skill-progress" style="width: 85%"></div>
                        </div>
                    </div>
                    <div class="skill-item">
                        <span class="skill-name">Python</span>
                        <div class="skill-bar">
                            <div class="skill-progress" style="width: 80%"></div>
                        </div>
                    </div>
                    <div class="skill-item">
                        <span class="skill-name">HTML/CSS</span>
                        <div class="skill-bar">
                            <div class="skill-progress" style="width: 95%"></div>
                        </div>
                    </div>
                </div>
                
                <div class="tab-content" id="frameworks">
                    <div class="framework-grid">
                        <div class="framework-card">React</div>
                        <div class="framework-card">Vue.js</div>
                        <div class="framework-card">Angular</div>
                        <div class="framework-card">Node.js</div>
                        <div class="framework-card">Express</div>
                        <div class="framework-card">Django</div>
                    </div>
                </div>
            </div>
        `;
        
        return this.createWindow('skills', 'Skills & Tools', content, {
            width: 600,
            height: 500
        });
    }
    
    openTerminal() {
        const content = `
            <div class="terminal-content">
                <div class="terminal-output" id="terminal-output">
                    <div>Microsoft Windows XP [Version 5.1.2600]</div>
                    <div>(C) Copyright 1985-2001 Microsoft Corp.</div>
                    <div>&nbsp;</div>
                </div>
                <div class="terminal-input-line">
                    <span class="terminal-prompt">C:\\></span>
                    <input type="text" class="terminal-input" id="terminal-input" autofocus>
                </div>
            </div>
        `;
        
        const window = this.createWindow('terminal', 'Command Prompt', content, {
            width: 600,
            height: 400
        });
        
        // Set up terminal functionality
        this.setupTerminal(window);
        
        return window;
    }
    
    openNotepad() {
        const content = `
            <div class="notepad-content">
                <div class="menu-bar">
                    <div class="menu-item">File</div>
                    <div class="menu-item">Edit</div>
                    <div class="menu-item">Format</div>
                    <div class="menu-item">View</div>
                    <div class="menu-item">Help</div>
                </div>
                <textarea class="notepad-textarea" placeholder="Type here..."></textarea>
                <div class="status-bar">
                    <span>Ln 1, Col 1</span>
                </div>
            </div>
        `;
        
        return this.createWindow('notepad', 'Untitled - Notepad', content, {
            width: 500,
            height: 400
        });
    }
    
    openPaint() {
        const content = `
            <div class="paint-content">
                <div class="paint-toolbar">
                    <button class="tool-btn" title="Pencil">✏️</button>
                    <button class="tool-btn" title="Brush">🖌️</button>
                    <button class="tool-btn" title="Eraser">🧹</button>
                    <button class="tool-btn" title="Fill">🪣</button>
                    <button class="tool-btn" title="Text">A</button>
                    <button class="tool-btn" title="Line">📏</button>
                    <button class="tool-btn" title="Rectangle">▭</button>
                    <button class="tool-btn" title="Circle">○</button>
                </div>
                <div class="paint-colors">
                    <div class="color-swatch" style="background: black"></div>
                    <div class="color-swatch" style="background: white"></div>
                    <div class="color-swatch" style="background: red"></div>
                    <div class="color-swatch" style="background: green"></div>
                    <div class="color-swatch" style="background: blue"></div>
                    <div class="color-swatch" style="background: yellow"></div>
                </div>
                <canvas class="paint-canvas" width="600" height="400"></canvas>
            </div>
        `;
        
        return this.createWindow('paint', 'Untitled - Paint', content, {
            width: 700,
            height: 500
        });
    }
    
    openCalculator() {
        const content = `
            <div class="calculator-content">
                <input type="text" class="calc-display" value="0" readonly>
                <div class="calc-buttons">
                    <button class="calc-btn">MC</button>
                    <button class="calc-btn">MR</button>
                    <button class="calc-btn">MS</button>
                    <button class="calc-btn">M+</button>
                    <button class="calc-btn">M-</button>
                    
                    <button class="calc-btn">←</button>
                    <button class="calc-btn">CE</button>
                    <button class="calc-btn">C</button>
                    <button class="calc-btn">±</button>
                    <button class="calc-btn">√</button>
                    
                    <button class="calc-btn">7</button>
                    <button class="calc-btn">8</button>
                    <button class="calc-btn">9</button>
                    <button class="calc-btn">/</button>
                    <button class="calc-btn">%</button>
                    
                    <button class="calc-btn">4</button>
                    <button class="calc-btn">5</button>
                    <button class="calc-btn">6</button>
                    <button class="calc-btn">*</button>
                    <button class="calc-btn">1/x</button>
                    
                    <button class="calc-btn">1</button>
                    <button class="calc-btn">2</button>
                    <button class="calc-btn">3</button>
                    <button class="calc-btn">-</button>
                    <button class="calc-btn calc-equals" rowspan="2">=</button>
                    
                    <button class="calc-btn calc-zero" colspan="2">0</button>
                    <button class="calc-btn">.</button>
                    <button class="calc-btn">+</button>
                </div>
            </div>
        `;
        
        return this.createWindow('calculator', 'Calculator', content, {
            width: 250,
            height: 320,
            resizable: false
        });
    }
    
    openInternetExplorer() {
        const content = `
            <div class="ie-content">
                <div class="ie-toolbar">
                    <button class="ie-btn">⬅️</button>
                    <button class="ie-btn">➡️</button>
                    <button class="ie-btn">🔄</button>
                    <button class="ie-btn">🏠</button>
                    <button class="ie-btn">🔍</button>
                    <input type="text" class="ie-address-bar" value="https://zarate.dev">
                    <button class="ie-btn">Go</button>
                </div>
                <iframe src="https://zarate.dev" class="ie-frame"></iframe>
            </div>
        `;
        
        return this.createWindow('internet-explorer', 'Internet Explorer', content, {
            width: 800,
            height: 600
        });
    }
    
    openMediaPlayer() {
        const content = `
            <div class="media-player-content">
                <div class="player-screen">
                    <div class="visualizer"></div>
                </div>
                <div class="player-controls">
                    <button class="player-btn">⏮️</button>
                    <button class="player-btn">▶️</button>
                    <button class="player-btn">⏸️</button>
                    <button class="player-btn">⏹️</button>
                    <button class="player-btn">⏭️</button>
                </div>
                <div class="player-info">
                    <div class="track-name">No track playing</div>
                    <div class="track-time">00:00 / 00:00</div>
                </div>
            </div>
        `;
        
        return this.createWindow('media-player', 'Windows Media Player', content, {
            width: 600,
            height: 400
        });
    }
    
    openMinesweeper() {
        const content = `
            <div class="minesweeper-content">
                <div class="game-info">
                    <div class="mine-counter">010</div>
                    <button class="new-game-btn">🙂</button>
                    <div class="timer">000</div>
                </div>
                <div class="game-board" id="minesweeper-board"></div>
            </div>
        `;
        
        return this.createWindow('minesweeper', 'Minesweeper', content, {
            width: 300,
            height: 400,
            resizable: false
        });
    }
    
    openSolitaire() {
        const content = `
            <div class="solitaire-content">
                <div class="solitaire-toolbar">
                    <button>New Game</button>
                    <button>Undo</button>
                    <button>Hint</button>
                </div>
                <div class="solitaire-board">
                    <div class="card-placeholder">♠️ Solitaire Coming Soon</div>
                </div>
            </div>
        `;
        
        return this.createWindow('solitaire', 'Solitaire', content, {
            width: 700,
            height: 500
        });
    }
    
    openControlPanel() {
        const content = `
            <div class="control-panel-content">
                <h2>Pick a category</h2>
                <div class="control-panel-grid">
                    <div class="control-item">
                        <img src="./images/icons/display.png" alt="Display">
                        <span>Display</span>
                    </div>
                    <div class="control-item">
                        <img src="./images/icons/sound.png" alt="Sound">
                        <span>Sounds and Audio</span>
                    </div>
                    <div class="control-item">
                        <img src="./images/icons/network.png" alt="Network">
                        <span>Network Connections</span>
                    </div>
                    <div class="control-item">
                        <img src="./images/icons/user-accounts.png" alt="Users">
                        <span>User Accounts</span>
                    </div>
                    <div class="control-item">
                        <img src="./images/icons/add-remove.png" alt="Programs">
                        <span>Add or Remove Programs</span>
                    </div>
                    <div class="control-item">
                        <img src="./images/icons/system.png" alt="System">
                        <span>System</span>
                    </div>
                </div>
            </div>
        `;
        
        return this.createWindow('control-panel', 'Control Panel', content, {
            width: 600,
            height: 400
        });
    }
    
    openRecycleBin() {
        const content = `
            <div class="recycle-bin-content">
                <div class="toolbar">
                    <button>Empty Recycle Bin</button>
                    <button>Restore All</button>
                </div>
                <div class="file-list">
                    <div class="empty-message">
                        <img src="./images/icons/recycle-bin-empty.png" alt="Empty">
                        <p>Recycle Bin is empty</p>
                    </div>
                </div>
            </div>
        `;
        
        return this.createWindow('recycle-bin', 'Recycle Bin', content, {
            width: 500,
            height: 400
        });
    }
    
    // Helper methods
    createWindow(appId, title, content, options = {}) {
        if (!window.zarateXP?.windowManager) {
            console.error('Window Manager not available');
            return null;
        }
        
        const app = this.apps.get(appId);
        const windowOptions = {
            id: `window-${appId}-${Date.now()}`,
            title,
            icon: app?.icon || './images/icons/default.png',
            content,
            ...options
        };
        
        const windowElement = window.zarateXP.windowManager.createWindow(windowOptions);
        
        if (windowElement) {
            // Track running app
            this.runningApps.set(appId, windowOptions.id);
            
            // Clean up when window closes
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.removedNodes.length > 0) {
                        mutation.removedNodes.forEach((node) => {
                            if (node === windowElement) {
                                this.closeApp(appId);
                                observer.disconnect();
                            }
                        });
                    }
                });
            });
            
            observer.observe(windowElement.parentNode, { childList: true });
        }
        
        return { windowId: windowOptions.id, element: windowElement };
    }
    
    setupTerminal(windowData) {
        if (!windowData || !windowData.element) return;
        
        const input = windowData.element.querySelector('#terminal-input');
        const output = windowData.element.querySelector('#terminal-output');
        
        if (!input || !output) return;
        
        const commands = {
            help: () => 'Available commands: help, clear, echo, date, whoami, dir, cd, exit',
            clear: () => {
                output.innerHTML = '';
                return '';
            },
            echo: (args) => args.join(' '),
            date: () => new Date().toString(),
            whoami: () => 'Zarate',
            dir: () => 'Directory listing not available in demo',
            cd: () => 'Cannot change directory in demo',
            exit: () => {
                window.zarateXP.windowManager.closeWindow(windowData.windowId);
                return '';
            }
        };
        
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const command = input.value.trim();
                const [cmd, ...args] = command.split(' ');
                
                // Add command to output
                const commandLine = document.createElement('div');
                commandLine.textContent = `C:\\> ${command}`;
                output.appendChild(commandLine);
                
                // Execute command
                if (commands[cmd]) {
                    const result = commands[cmd](args);
                    if (result) {
                        const resultLine = document.createElement('div');
                        resultLine.textContent = result;
                        output.appendChild(resultLine);
                    }
                } else if (command) {
                    const errorLine = document.createElement('div');
                    errorLine.textContent = `'${cmd}' is not recognized as an internal or external command.`;
                    output.appendChild(errorLine);
                }
                
                // Add blank line
                output.appendChild(document.createElement('div'));
                
                // Clear input
                input.value = '';
                
                // Scroll to bottom
                output.scrollTop = output.scrollHeight;
            }
        });
    }
    
    showError(message) {
        if (window.zarateXP?.soundManager) {
            window.zarateXP.soundManager.playError();
        }
        
        const content = `
            <div class="error-dialog">
                <div class="error-icon">❌</div>
                <div class="error-message">${message}</div>
                <button onclick="window.zarateXP.windowManager.closeWindow(this.closest('.window').getAttribute('data-window-id'))">OK</button>
            </div>
        `;
        
        this.createWindow('error-' + Date.now(), 'Error', content, {
            width: 300,
            height: 150,
            resizable: false,
            maximizable: false,
            minimizable: false
        });
    }
}

// Add app-specific styles
const style = document.createElement('style');
style.textContent = `
    /* About Me Styles */
    .about-me-content {
        padding: 20px;
        text-align: center;
    }
    
    .profile-image {
        width: 120px;
        height: 120px;
        border-radius: 50%;
        border: 3px solid #0054E3;
        margin-bottom: 10px;
    }
    
    .tagline {
        color: #666;
        font-style: italic;
        margin-bottom: 20px;
    }
    
    .info-section {
        text-align: left;
        margin-top: 20px;
    }
    
    .info-section h3 {
        color: #0054E3;
        margin-top: 15px;
    }
    
    /* Projects Styles */
    .projects-content {
        padding: 10px;
        height: 100%;
        display: flex;
        flex-direction: column;
    }
    
    .projects-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 15px;
        padding: 15px;
        overflow-y: auto;
        flex: 1;
    }
    
    .project-card {
        border: 1px solid #ccc;
        padding: 15px;
        background: white;
    }
    
    .project-card img {
        width: 100%;
        height: 150px;
        object-fit: cover;
        margin-bottom: 10px;
    }
    
    .tech-stack {
        margin: 10px 0;
    }
    
    .tech-tag {
        display: inline-block;
        background: #e0e0e0;
        padding: 2px 8px;
        margin: 2px;
        font-size: 12px;
        border-radius: 3px;
    }
    
    /* Terminal Styles */
    .terminal-content {
        background: black;
        color: #00ff00;
        font-family: 'Courier New', monospace;
        padding: 10px;
        height: 100%;
        display: flex;
        flex-direction: column;
    }
    
    .terminal-output {
        flex: 1;
        overflow-y: auto;
        white-space: pre-wrap;
    }
    
    .terminal-input-line {
        display: flex;
        align-items: center;
    }
    
    .terminal-prompt {
        margin-right: 5px;
    }
    
    .terminal-input {
        background: transparent;
        border: none;
        color: #00ff00;
        font-family: inherit;
        font-size: inherit;
        flex: 1;
        outline: none;
    }
    
    /* Notepad Styles */
    .notepad-content {
        display: flex;
        flex-direction: column;
        height: 100%;
    }
    
    .notepad-textarea {
        flex: 1;
        border: none;
        padding: 5px;
        font-family: 'Courier New', monospace;
        resize: none;
        outline: none;
    }
    
    /* Calculator Styles */
    .calculator-content {
        padding: 10px;
        background: #f0f0f0;
    }
    
    .calc-display {
        width: 100%;
        padding: 5px;
        text-align: right;
        font-size: 18px;
        margin-bottom: 10px;
    }
    
    .calc-buttons {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 5px;
    }
    
    .calc-btn {
        padding: 10px;
        font-size: 14px;
    }
    
    .calc-zero {
        grid-column: span 2;
    }
    
    .calc-equals {
        grid-row: span 2;
    }
    
    /* Control Panel Styles */
    .control-panel-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 20px;
        padding: 20px;
    }
    
    .control-item {
        text-align: center;
        cursor: pointer;
        padding: 10px;
    }
    
    .control-item:hover {
        background: #e0e0e0;
    }
    
    .control-item img {
        width: 48px;
        height: 48px;
        display: block;
        margin: 0 auto 5px;
    }
    
    /* Error Dialog Styles */
    .error-dialog {
        padding: 20px;
        text-align: center;
    }
    
    .error-icon {
        font-size: 48px;
        margin-bottom: 10px;
    }
    
    .error-message {
        margin-bottom: 20px;
    }
`;
document.head.appendChild(style);

// Legacy support
window.AppManager = AppManager;
            