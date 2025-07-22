import "./ClippyCharacter.js";

export class ClippyManager {
    constructor() {
        this.clippy = null;
        this.isVisible = false;
        this.welcomeShown = false;
    }

    init() {
        // No hacer nada aquí, esperamos a que se llame showWelcome
    }

    showWelcome() {
        if (this.welcomeShown) return;
        
        // Crear Clippy con mensaje de bienvenida
        this.clippy = document.createElement('clippy-character');
        this.clippy.setAttribute('no-paper', '');
        
        // Añadir al DOM
        document.body.appendChild(this.clippy);
        
        // Mostrar con animación
        setTimeout(() => {
            this.clippy.classList.add('entering', 'show');
            this.isVisible = true;
        }, 500);

        // Auto-ocultar después de 8 segundos
        setTimeout(() => {
            this.hide();
        }, 8000);

        this.welcomeShown = true;
    }

    show() {
        if (!this.clippy) {
            this.showWelcome();
            return;
        }

        this.clippy.classList.remove('hide');
        this.clippy.classList.add('show');
        this.isVisible = true;
    }

    hide() {
        if (!this.clippy) return;

        this.clippy.classList.remove('show');
        this.clippy.classList.add('hide');
        this.isVisible = false;

        // Remover del DOM después de la animación
        setTimeout(() => {
            if (this.clippy && this.clippy.parentNode) {
                this.clippy.parentNode.removeChild(this.clippy);
                this.clippy = null;
            }
        }, 800);
    }

    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    changeMessage(message) {
        if (this.clippy) {
            this.clippy.setText(message);
        }
    }
}