// Sound Manager Module
export class SoundManager {
    constructor() {
        this.sounds = new Map();
        this.enabled = true;
        this.volume = 0.5;
        this.soundsPath = './assets/sounds/';
        
        // Define system sounds
        this.systemSounds = {
            startup: 'windows-xp-startup.mp3',
            shutdown: 'shutdown.wav',
            'shutdown-custom': 'shutdown-custom.mp3',
            logon: 'logon.wav',
            logoff: 'logoff.wav',
            error: 'error.wav',
            warning: 'warning.wav',
            information: 'information.wav',
            question: 'question.wav',
            maximize: 'maximize.wav',
            minimize: 'minimize.wav',
            restore: 'restore.wav',
            menuOpen: 'menu-open.wav',
            menuClose: 'menu-close.wav',
            menuSelect: 'menu-select.wav',
            click: 'click.wav',
            hover: 'hover.wav',
            recycle: 'recycle.wav',
            empty: 'empty.wav',
            navigate: 'navigate.wav',
            print: 'print.wav',
            screenshot: 'screenshot.wav'
        };
    }
    
    init() {
        // Preload all system sounds
        this.preloadSounds();
        
        // Load user preferences
        this.loadPreferences();
        
        // Set up global sound handlers
        this.setupGlobalHandlers();
    }
    
    preloadSounds() {
        Object.entries(this.systemSounds).forEach(([name, filename]) => {
            const audio = new Audio(this.soundsPath + filename);
            audio.volume = this.volume;
            audio.preload = 'auto';
            
            // Store in sounds map
            this.sounds.set(name, audio);
            
            // Handle loading errors gracefully
            audio.addEventListener('error', () => {
                console.warn(`Failed to load sound: ${filename}`);
                // Create a silent audio as fallback
                const silentAudio = new Audio();
                silentAudio.volume = 0;
                this.sounds.set(name, silentAudio);
            });
        });
    }
    
    loadPreferences() {
        // Load from localStorage
        const savedPrefs = localStorage.getItem('zarateXP_soundPrefs');
        if (savedPrefs) {
            try {
                const prefs = JSON.parse(savedPrefs);
                this.enabled = prefs.enabled !== false;
                this.volume = prefs.volume || 0.5;
                this.updateVolume();
            } catch (e) {
                console.error('Failed to load sound preferences:', e);
            }
        }
    }
    
    savePreferences() {
        const prefs = {
            enabled: this.enabled,
            volume: this.volume
        };
        localStorage.setItem('zarateXP_soundPrefs', JSON.stringify(prefs));
    }
    
    setupGlobalHandlers() {
        // Add click sounds to buttons
        document.addEventListener('click', (e) => {
            if (!this.enabled) return;
            
            const target = e.target;
            
            // Button clicks
            if (target.matches('button, .button')) {
                this.play('click');
            }
            
            // Menu items
            if (target.matches('.menu-item, .start-menu-item')) {
                this.play('menuSelect');
            }
            
            // Desktop icons
            if (target.matches('.desktop-icon')) {
                this.play('click');
            }
        });
        
        // Add hover sounds
        document.addEventListener('mouseover', (e) => {
            if (!this.enabled) return;
            
            const target = e.target;
            
            // Menu items hover
            if (target.matches('.menu-item, .start-menu-item')) {
                this.playQuiet('hover');
            }
        });
    }
    
    play(soundName, options = {}) {
        if (!this.enabled) return;
        
        const sound = this.sounds.get(soundName);
        if (!sound) {
            console.warn(`Sound not found: ${soundName}`);
            return;
        }
        
        // Clone the audio to allow overlapping sounds
        const audio = sound.cloneNode();
        audio.volume = options.volume || this.volume;
        
        // Play the sound
        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                // Auto-play was prevented
                console.warn('Sound play prevented:', error);
            });
        }
        
        // Clean up after playing
        audio.addEventListener('ended', () => {
            audio.remove();
        });
        
        return audio;
    }
    
    playQuiet(soundName) {
        return this.play(soundName, { volume: this.volume * 0.3 });
    }
    
    playSequence(soundNames, delay = 100) {
        if (!this.enabled) return;
        
        soundNames.forEach((soundName, index) => {
            setTimeout(() => {
                this.play(soundName);
            }, index * delay);
        });
    }
    
    stop(audio) {
        if (audio && !audio.paused) {
            audio.pause();
            audio.currentTime = 0;
        }
    }
    
    stopAll() {
        // Stop all currently playing sounds
        document.querySelectorAll('audio').forEach(audio => {
            this.stop(audio);
        });
    }
    
    setEnabled(enabled) {
        this.enabled = enabled;
        this.savePreferences();
        
        if (!enabled) {
            this.stopAll();
        }
    }
    
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        this.updateVolume();
        this.savePreferences();
    }
    
    updateVolume() {
        this.sounds.forEach(audio => {
            audio.volume = this.volume;
        });
    }
    
    // Special sound effects
    playStartup() {
        if (!this.enabled) return;
        
        // Play the classic Windows XP startup sound
        const audio = this.play('startup');
        
        // Add visual feedback
        if (audio) {
            audio.addEventListener('playing', () => {
                document.body.classList.add('sound-playing');
            });
            
            audio.addEventListener('ended', () => {
                document.body.classList.remove('sound-playing');
            });
        }
        
        return audio;
    }
    
    playShutdown() {
        if (!this.enabled) return;
        
        // Play shutdown sound and wait for it to finish
        const audio = this.play('shutdown');
        
        return new Promise(resolve => {
            if (audio) {
                audio.addEventListener('ended', resolve);
                audio.addEventListener('error', resolve);
            } else {
                resolve();
            }
        });
    }
    
    playError() {
        if (!this.enabled) return;
        
        // Play error sound with screen shake effect
        const audio = this.play('error');
        
        // Add screen shake
        document.body.classList.add('error-shake');
        setTimeout(() => {
            document.body.classList.remove('error-shake');
        }, 500);
        
        return audio;
    }
    
    // Create sound scheme
    createSoundScheme(name, sounds) {
        const scheme = new Map();
        
        Object.entries(sounds).forEach(([soundName, filename]) => {
            const audio = new Audio(this.soundsPath + filename);
            audio.volume = this.volume;
            audio.preload = 'auto';
            scheme.set(soundName, audio);
        });
        
        return scheme;
    }
    
    // Apply sound scheme
    applySoundScheme(scheme) {
        if (scheme instanceof Map) {
            // Merge with existing sounds
            scheme.forEach((audio, name) => {
                this.sounds.set(name, audio);
            });
        }
    }
}

// Add CSS for sound effects
const style = document.createElement('style');
style.textContent = `
    @keyframes error-shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
        20%, 40%, 60%, 80% { transform: translateX(2px); }
    }
    
    .error-shake {
        animation: error-shake 0.5s ease-in-out;
    }
    
    .sound-playing::after {
        content: '🔊';
        position: fixed;
        bottom: 60px;
        right: 20px;
        font-size: 20px;
        opacity: 0.5;
        animation: pulse 1s ease-in-out infinite;
        pointer-events: none;
        z-index: 10000;
    }
    
    @keyframes pulse {
        0%, 100% { opacity: 0.5; transform: scale(1); }
        50% { opacity: 0.8; transform: scale(1.1); }
    }
`;
document.head.appendChild(style);

// Legacy support
window.SoundManager = SoundManager;