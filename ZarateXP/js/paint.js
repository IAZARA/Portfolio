// Paint Application for ZarateXP
// Emulates Windows XP Paint functionality

let paintApp = null;

function initPaintApp() {
    if (paintApp) {
        console.log('Paint app already initialized');
        return;
    }

    console.log('Initializing Paint application...');
    
    paintApp = new PaintApplication();
    paintApp.init();
}

class PaintApplication {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.isDrawing = false;
        this.currentTool = 'pencil';
        this.currentColor = '#000000';
        this.currentSize = 1;
        this.startX = 0;
        this.startY = 0;
        this.imageData = null;
        
        // Tools
        this.tools = {
            select: this.selectTool.bind(this),
            freeform: this.freeformSelect.bind(this),
            pencil: this.drawPencil.bind(this),
            brush: this.drawBrush.bind(this),
            eraser: this.drawEraser.bind(this),
            bucket: this.floodFill.bind(this),
            eyedropper: this.eyedropper.bind(this),
            magnifier: this.magnifier.bind(this),
            spray: this.spray.bind(this),
            text: this.textTool.bind(this),
            line: this.drawLine.bind(this),
            curve: this.drawCurve.bind(this),
            rectangle: this.drawRectangle.bind(this),
            polygon: this.drawPolygon.bind(this),
            ellipse: this.drawEllipse.bind(this),
            'rounded-rect': this.drawRoundedRect.bind(this)
        };
    }

    init() {
        this.canvas = document.getElementById('paintCanvas');
        if (!this.canvas) {
            console.error('Paint canvas not found');
            return;
        }

        this.ctx = this.canvas.getContext('2d');
        this.setupCanvas();
        this.setupEventListeners();
        this.setupTools();
        this.setupColors();
        this.setupSizes();
        
        console.log('Paint application initialized successfully');
    }

    setupCanvas() {
        // Set canvas size to fill container
        const container = this.canvas.parentElement;
        this.canvas.width = Math.max(400, container.clientWidth - 20);
        this.canvas.height = Math.max(300, container.clientHeight - 20);
        
        // Set default canvas properties
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    setupEventListeners() {
        // Mouse events
        this.canvas.addEventListener('mousedown', this.startDrawing.bind(this));
        this.canvas.addEventListener('mousemove', this.draw.bind(this));
        this.canvas.addEventListener('mouseup', this.stopDrawing.bind(this));
        this.canvas.addEventListener('mouseout', this.stopDrawing.bind(this));
        
        // Prevent context menu
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    setupTools() {
        const tools = document.querySelectorAll('.paint-tool[data-tool]');
        tools.forEach(tool => {
            tool.addEventListener('click', () => {
                // Remove active class from all tools
                tools.forEach(t => t.classList.remove('active'));
                // Add active class to clicked tool
                tool.classList.add('active');
                // Set current tool
                this.currentTool = tool.dataset.tool;
                console.log('Selected tool:', this.currentTool);
            });
        });
    }

    setupColors() {
        const colors = document.querySelectorAll('.paint-color[data-color]');
        const currentColorDisplay = document.getElementById('currentColor');
        
        colors.forEach(color => {
            color.addEventListener('click', () => {
                // Remove active class from all colors
                colors.forEach(c => c.classList.remove('active'));
                // Add active class to clicked color
                color.classList.add('active');
                // Set current color
                this.currentColor = color.dataset.color;
                currentColorDisplay.style.backgroundColor = this.currentColor;
                console.log('Selected color:', this.currentColor);
            });
        });
    }

    setupSizes() {
        const sizes = document.querySelectorAll('.paint-size-option[data-size]');
        sizes.forEach(size => {
            size.addEventListener('click', () => {
                // Remove active class from all sizes
                sizes.forEach(s => s.classList.remove('active'));
                // Add active class to clicked size
                size.classList.add('active');
                // Set current size
                this.currentSize = parseInt(size.dataset.size);
                console.log('Selected size:', this.currentSize);
            });
        });
    }

    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    startDrawing(e) {
        this.isDrawing = true;
        const pos = this.getMousePos(e);
        this.startX = pos.x;
        this.startY = pos.y;
        
        // Save canvas state for shape tools
        if (['line', 'rectangle', 'ellipse', 'curve', 'polygon', 'rounded-rect'].includes(this.currentTool)) {
            this.imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        }
        
        // Handle tools that execute immediately
        if (['bucket', 'eyedropper', 'text'].includes(this.currentTool)) {
            this.tools[this.currentTool](pos.x, pos.y, true);
            this.isDrawing = false;
        } else {
            this.tools[this.currentTool](pos.x, pos.y, true);
        }
    }

    draw(e) {
        if (!this.isDrawing) return;
        
        const pos = this.getMousePos(e);
        this.tools[this.currentTool](pos.x, pos.y, false);
    }

    stopDrawing() {
        this.isDrawing = false;
        this.imageData = null;
    }

    // Drawing tools
    drawPencil(x, y, isStart) {
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.strokeStyle = this.currentColor;
        this.ctx.lineWidth = this.currentSize;
        
        if (isStart) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, y);
        } else {
            this.ctx.lineTo(x, y);
            this.ctx.stroke();
        }
    }

    drawBrush(x, y, isStart) {
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.fillStyle = this.currentColor;
        
        const size = this.currentSize * 2;
        this.ctx.beginPath();
        this.ctx.arc(x, y, size, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawEraser(x, y, isStart) {
        this.ctx.globalCompositeOperation = 'destination-out';
        const size = this.currentSize * 3;
        this.ctx.beginPath();
        this.ctx.arc(x, y, size, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawLine(x, y, isStart) {
        if (isStart) return;
        
        // Restore canvas and draw line
        if (this.imageData) {
            this.ctx.putImageData(this.imageData, 0, 0);
        }
        
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.strokeStyle = this.currentColor;
        this.ctx.lineWidth = this.currentSize;
        this.ctx.beginPath();
        this.ctx.moveTo(this.startX, this.startY);
        this.ctx.lineTo(x, y);
        this.ctx.stroke();
    }

    drawRectangle(x, y, isStart) {
        if (isStart) return;
        
        // Restore canvas and draw rectangle
        if (this.imageData) {
            this.ctx.putImageData(this.imageData, 0, 0);
        }
        
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.strokeStyle = this.currentColor;
        this.ctx.lineWidth = this.currentSize;
        this.ctx.beginPath();
        this.ctx.rect(this.startX, this.startY, x - this.startX, y - this.startY);
        this.ctx.stroke();
    }

    drawEllipse(x, y, isStart) {
        if (isStart) return;
        
        // Restore canvas and draw ellipse
        if (this.imageData) {
            this.ctx.putImageData(this.imageData, 0, 0);
        }
        
        const radiusX = Math.abs(x - this.startX) / 2;
        const radiusY = Math.abs(y - this.startY) / 2;
        const centerX = (this.startX + x) / 2;
        const centerY = (this.startY + y) / 2;
        
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.strokeStyle = this.currentColor;
        this.ctx.lineWidth = this.currentSize;
        this.ctx.beginPath();
        this.ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
        this.ctx.stroke();
    }

    // Additional tool methods
    selectTool(x, y, isStart) {
        // Selection tool placeholder
        console.log('Select tool not fully implemented');
    }

    freeformSelect(x, y, isStart) {
        // Freeform selection placeholder
        console.log('Freeform select tool not fully implemented');
    }

    eyedropper(x, y, isStart) {
        if (!isStart) return;
        
        // Get pixel color at click position
        const imageData = this.ctx.getImageData(x, y, 1, 1);
        const pixel = imageData.data;
        const color = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
        
        // Convert to hex
        const hexColor = this.rgbToHex(pixel[0], pixel[1], pixel[2]);
        this.currentColor = hexColor;
        
        // Update color display
        const currentColorDisplay = document.getElementById('currentColor');
        if (currentColorDisplay) {
            currentColorDisplay.style.backgroundColor = hexColor;
        }
        
        // Update active color in palette
        const colors = document.querySelectorAll('.paint-color[data-color]');
        colors.forEach(c => c.classList.remove('active'));
        const matchingColor = document.querySelector(`[data-color="${hexColor}"]`);
        if (matchingColor) {
            matchingColor.classList.add('active');
        }
    }

    magnifier(x, y, isStart) {
        // Magnifier tool placeholder
        console.log('Magnifier tool not fully implemented');
    }

    spray(x, y, isStart) {
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.fillStyle = this.currentColor;
        
        // Create spray effect
        const density = 20;
        const radius = this.currentSize * 3;
        
        for (let i = 0; i < density; i++) {
            const offsetX = (Math.random() - 0.5) * radius;
            const offsetY = (Math.random() - 0.5) * radius;
            
            this.ctx.beginPath();
            this.ctx.arc(x + offsetX, y + offsetY, 1, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    textTool(x, y, isStart) {
        if (!isStart) return;
        
        // Simple text input
        const text = prompt('Ingrese el texto:');
        if (text) {
            this.ctx.globalCompositeOperation = 'source-over';
            this.ctx.fillStyle = this.currentColor;
            this.ctx.font = `${this.currentSize * 6}px Arial`;
            this.ctx.fillText(text, x, y);
        }
    }

    drawCurve(x, y, isStart) {
        // Curve tool placeholder - simplified
        this.drawLine(x, y, isStart);
    }

    drawPolygon(x, y, isStart) {
        // Polygon tool placeholder - simplified to triangle
        if (isStart) return;
        
        if (this.imageData) {
            this.ctx.putImageData(this.imageData, 0, 0);
        }
        
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.strokeStyle = this.currentColor;
        this.ctx.lineWidth = this.currentSize;
        this.ctx.beginPath();
        this.ctx.moveTo(this.startX, this.startY);
        this.ctx.lineTo(x, y);
        this.ctx.lineTo(this.startX - (x - this.startX), y);
        this.ctx.closePath();
        this.ctx.stroke();
    }

    drawRoundedRect(x, y, isStart) {
        if (isStart) return;
        
        if (this.imageData) {
            this.ctx.putImageData(this.imageData, 0, 0);
        }
        
        const width = x - this.startX;
        const height = y - this.startY;
        const radius = Math.min(Math.abs(width), Math.abs(height)) * 0.1;
        
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.strokeStyle = this.currentColor;
        this.ctx.lineWidth = this.currentSize;
        this.ctx.beginPath();
        this.ctx.roundRect(this.startX, this.startY, width, height, radius);
        this.ctx.stroke();
    }

    // Helper function
    rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    // Flood fill algorithm (bucket tool)
    floodFill(x, y) {
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;
        const targetColor = this.getPixelColor(data, x, y, this.canvas.width);
        const fillColor = this.hexToRgb(this.currentColor);
        
        if (this.colorsMatch(targetColor, fillColor)) {
            return; // Same color, nothing to do
        }
        
        const stack = [{x: Math.floor(x), y: Math.floor(y)}];
        
        while (stack.length > 0) {
            const {x: currentX, y: currentY} = stack.pop();
            
            if (currentX < 0 || currentX >= this.canvas.width || 
                currentY < 0 || currentY >= this.canvas.height) {
                continue;
            }
            
            const currentColor = this.getPixelColor(data, currentX, currentY, this.canvas.width);
            
            if (!this.colorsMatch(currentColor, targetColor)) {
                continue;
            }
            
            this.setPixelColor(data, currentX, currentY, this.canvas.width, fillColor);
            
            stack.push({x: currentX + 1, y: currentY});
            stack.push({x: currentX - 1, y: currentY});
            stack.push({x: currentX, y: currentY + 1});
            stack.push({x: currentX, y: currentY - 1});
        }
        
        this.ctx.putImageData(imageData, 0, 0);
    }

    getPixelColor(data, x, y, width) {
        const index = (y * width + x) * 4;
        return {
            r: data[index],
            g: data[index + 1],
            b: data[index + 2],
            a: data[index + 3]
        };
    }

    setPixelColor(data, x, y, width, color) {
        const index = (y * width + x) * 4;
        data[index] = color.r;
        data[index + 1] = color.g;
        data[index + 2] = color.b;
        data[index + 3] = 255;
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : {r: 0, g: 0, b: 0};
    }

    colorsMatch(a, b) {
        return a.r === b.r && a.g === b.g && a.b === b.b;
    }

    // Clear canvas
    clearCanvas() {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPaintApp);
} else {
    initPaintApp();
}