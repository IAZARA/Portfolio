// Desktop Manager Module
export class DesktopManager {
    constructor() {
        this.desktop = document.querySelector('.desktop');
        this.iconsContainer = document.querySelector('.desktop-icons');
        this.selectionOverlay = document.querySelector('.selection-overlay');
        this.selectedIcons = new Set();
        this.isDragging = false;
        this.dragStart = { x: 0, y: 0 };
    }
    
    init() {
        this.setupIconHandlers();
        this.setupSelectionBox();
        this.setupContextMenu();
        
        // Listen for desktop ready event
        window.addEventListener('desktopReady', () => {
            this.animateIcons();
        });
    }
    
    setupIconHandlers() {
        const icons = this.iconsContainer.querySelectorAll('.desktop-icon');
        
        icons.forEach(icon => {
            // Click handler
            icon.addEventListener('click', (e) => {
                e.stopPropagation();
                
                if (!e.ctrlKey && !e.metaKey) {
                    this.clearSelection();
                }
                
                this.selectIcon(icon);
            });
            
            // Double click handler
            icon.addEventListener('dblclick', (e) => {
                e.stopPropagation();
                const programName = icon.getAttribute('data-program-name');
                
                if (programName && window.zarateXP?.appManager) {
                    window.zarateXP.appManager.openApp(programName);
                }
            });
            
            // Touch support for mobile devices
            let touchStartTime = 0;
            let touchTimeout;
            
            icon.addEventListener('touchstart', (e) => {
                e.preventDefault(); // Prevenir comportamiento por defecto del navegador
                const now = Date.now();
                const timeSinceLastTouch = now - touchStartTime;
                
                // Si han pasado menos de 300ms desde el último toque, es un doble tap
                if (timeSinceLastTouch < 300 && timeSinceLastTouch > 0) {
                    // Doble tap - abrir programa
                    clearTimeout(touchTimeout);
                    const programName = icon.getAttribute('data-program-name');
                    
                    if (programName && window.zarateXP?.appManager) {
                        window.zarateXP.appManager.openApp(programName);
                    }
                    touchStartTime = 0;
                } else {
                    // Single tap - seleccionar icono
                    touchStartTime = now;
                    
                    // Limpiar selección anterior si no es multiselección
                    if (!e.ctrlKey && !e.metaKey) {
                        this.clearSelection();
                    }
                    
                    this.selectIcon(icon);
                    
                    // Configurar timeout para resetear el contador de toques
                    touchTimeout = setTimeout(() => {
                        touchStartTime = 0;
                    }, 300);
                }
            });
            
            // Drag handlers - DISABLED for fixed icons
            // this.setupIconDrag(icon);
        });
        
        // Desktop click to clear selection
        this.desktop.addEventListener('click', () => {
            this.clearSelection();
        });
    }
    
    setupIconDrag(icon) {
        let isDragging = false;
        let startX = 0;
        let startY = 0;
        let initialX = 0;
        let initialY = 0;
        
        icon.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return; // Only left click
            
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            
            const rect = icon.getBoundingClientRect();
            initialX = rect.left;
            initialY = rect.top;
            
            icon.style.position = 'fixed';
            icon.style.left = initialX + 'px';
            icon.style.top = initialY + 'px';
            icon.style.zIndex = '1000';
            icon.classList.add('dragging');
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            e.preventDefault();
            
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            
            icon.style.left = (initialX + deltaX) + 'px';
            icon.style.top = (initialY + deltaY) + 'px';
        });
        
        document.addEventListener('mouseup', () => {
            if (!isDragging) return;
            
            isDragging = false;
            icon.classList.remove('dragging');
            
            // Snap to grid
            const gridSize = 90;
            const rect = icon.getBoundingClientRect();
            const desktopRect = this.desktop.getBoundingClientRect();
            
            const relativeX = rect.left - desktopRect.left;
            const relativeY = rect.top - desktopRect.top;
            
            const snappedX = Math.round(relativeX / gridSize) * gridSize;
            const snappedY = Math.round(relativeY / gridSize) * gridSize;
            
            icon.style.position = 'absolute';
            icon.style.left = snappedX + 'px';
            icon.style.top = snappedY + 'px';
            icon.style.zIndex = '';
        });
    }
    
    setupSelectionBox() {
        let isSelecting = false;
        let startX = 0;
        let startY = 0;
        
        this.desktop.addEventListener('mousedown', (e) => {
            if (e.target !== this.desktop && !e.target.classList.contains('desktop-icons')) return;
            if (e.button !== 0) return; // Only left click
            
            isSelecting = true;
            startX = e.clientX;
            startY = e.clientY;
            
            this.selectionOverlay.style.display = 'block';
            this.selectionOverlay.style.left = startX + 'px';
            this.selectionOverlay.style.top = startY + 'px';
            this.selectionOverlay.style.width = '0';
            this.selectionOverlay.style.height = '0';
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isSelecting) return;
            
            const currentX = e.clientX;
            const currentY = e.clientY;
            
            const left = Math.min(startX, currentX);
            const top = Math.min(startY, currentY);
            const width = Math.abs(currentX - startX);
            const height = Math.abs(currentY - startY);
            
            this.selectionOverlay.style.left = left + 'px';
            this.selectionOverlay.style.top = top + 'px';
            this.selectionOverlay.style.width = width + 'px';
            this.selectionOverlay.style.height = height + 'px';
            
            // Check which icons are in the selection box
            this.updateSelection();
        });
        
        document.addEventListener('mouseup', () => {
            if (!isSelecting) return;
            
            isSelecting = false;
            this.selectionOverlay.style.display = 'none';
        });
    }
    
    updateSelection() {
        const selectionRect = this.selectionOverlay.getBoundingClientRect();
        const icons = this.iconsContainer.querySelectorAll('.desktop-icon');
        
        icons.forEach(icon => {
            const iconRect = icon.getBoundingClientRect();
            
            if (this.rectsIntersect(selectionRect, iconRect)) {
                this.selectIcon(icon);
            } else if (!this.selectedIcons.has(icon)) {
                icon.classList.remove('selected');
            }
        });
    }
    
    rectsIntersect(rect1, rect2) {
        return !(rect1.right < rect2.left || 
                rect1.left > rect2.right || 
                rect1.bottom < rect2.top || 
                rect1.top > rect2.bottom);
    }
    
    selectIcon(icon) {
        icon.classList.add('selected');
        this.selectedIcons.add(icon);
    }
    
    clearSelection() {
        this.selectedIcons.forEach(icon => {
            icon.classList.remove('selected');
        });
        this.selectedIcons.clear();
    }
    
    setupContextMenu() {
        this.desktop.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            // TODO: Show context menu
        });
    }
    
    animateIcons() {
        const icons = this.iconsContainer.querySelectorAll('.desktop-icon');
        icons.forEach((icon, index) => {
            icon.style.animationDelay = `${index * 0.1}s`;
        });
    }
    
    // Public methods
    refreshDesktop() {
        // Refresh desktop icons
        this.clearSelection();
    }
    
    changeWallpaper(imagePath) {
        this.desktop.style.backgroundImage = `url(${imagePath})`;
    }
    
    arrangeIcons() {
        const icons = this.iconsContainer.querySelectorAll('.desktop-icon');
        const gridSize = 90;
        let row = 0;
        let col = 0;
        
        icons.forEach(icon => {
            icon.style.position = 'absolute';
            icon.style.left = (col * gridSize) + 'px';
            icon.style.top = (row * gridSize) + 'px';
            
            row++;
            if (row * gridSize > window.innerHeight - 100) {
                row = 0;
                col++;
            }
        });
    }
}

// Legacy support
window.DesktopManager = DesktopManager;