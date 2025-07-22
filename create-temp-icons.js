// Script Node.js para crear iconos temporales
const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// Crear directorio si no existe
const imagesDir = path.join(__dirname, 'assets', 'images');
if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
}

// Configuración de iconos
const icons = [
    { name: 'computer.png', size: 48, color: '#4169E1', text: 'PC' },
    { name: 'folder.png', size: 48, color: '#FFD700', text: 'Dir' },
    { name: 'user.png', size: 48, color: '#32CD32', text: 'User' },
    { name: 'email.png', size: 48, color: '#FF6347', text: '@' },
    { name: 'document.png', size: 48, color: '#87CEEB', text: 'Doc' },
    { name: 'tools.png', size: 48, color: '#808080', text: 'Tool' },
    { name: 'user-icon.png', size: 48, color: '#4169E1', text: 'Me' },
    { name: 'windows-logo-small.png', size: 16, color: '#0078D4', text: 'W' },
    { name: 'shutdown.png', size: 20, color: '#DC143C', text: 'Off' },
    { name: 'github.png', size: 48, color: '#333333', text: 'GH' },
    { name: 'linkedin.png', size: 48, color: '#0077B5', text: 'in' },
    { name: 'notepad.png', size: 48, color: '#87CEEB', text: 'Txt' },
    { name: 'pdf.png', size: 48, color: '#DC143C', text: 'PDF' },
];

// Función para crear icono
function createIcon(config) {
    const canvas = createCanvas(config.size, config.size);
    const ctx = canvas.getContext('2d');
    
    // Fondo con gradiente
    const gradient = ctx.createLinearGradient(0, 0, 0, config.size);
    gradient.addColorStop(0, config.color);
    gradient.addColorStop(1, adjustColor(config.color, -30));
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, config.size, config.size);
    
    // Borde
    ctx.strokeStyle = adjustColor(config.color, -50);
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, config.size - 2, config.size - 2);
    
    // Texto
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${config.size / 3}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(config.text, config.size / 2, config.size / 2);
    
    // Guardar
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(path.join(imagesDir, config.name), buffer);
    console.log(`✅ Creado: ${config.name}`);
}

// Función para ajustar brillo del color
function adjustColor(color, amount) {
    const num = parseInt(color.replace('#', ''), 16);
    const r = Math.max(0, Math.min(255, (num >> 16) + amount));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
    const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

// Crear todos los iconos
console.log('🎨 Creando iconos temporales...\n');
icons.forEach(icon => createIcon(icon));
console.log('\n✅ ¡Iconos temporales creados!');