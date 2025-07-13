# ZarateXP - Portfolio Estilo Windows XP

## 🖥️ Descripción
Portfolio interactivo que simula completamente Windows XP, construido desde cero con HTML, CSS y JavaScript vanilla.

## 🚀 Características
- ✅ Pantalla de arranque animada
- ✅ Pantalla de login personalizada
- ✅ Escritorio funcional con iconos
- ✅ Ventanas arrastrables y redimensionables
- ✅ Menú Start completo
- ✅ Barra de tareas con reloj funcional
- ✅ Múltiples aplicaciones portfolio
- ✅ Diseño responsive (funciona en móviles)

## 🛠️ Tecnologías
- HTML5
- CSS3 (sin frameworks)
- JavaScript vanilla
- Sin dependencias externas

## 📁 Estructura
```
ZarateXP/
├── index.html
├── css/
│   ├── boot.css      # Estilos de arranque
│   ├── desktop.css   # Estilos del escritorio
│   ├── windows.css   # Estilos de ventanas
│   └── taskbar.css   # Estilos de barra de tareas
├── js/
│   ├── boot.js       # Lógica de arranque
│   ├── desktop.js    # Funcionalidad del escritorio
│   ├── windows.js    # Sistema de ventanas
│   └── apps.js       # Contenido de aplicaciones
└── assets/
    ├── images/       # Iconos e imágenes
    ├── sounds/       # Efectos de sonido (opcional)
    └── documents/    # PDFs y documentos

```

## 🎨 Personalización

### 1. Cambiar información personal
Edita `js/apps.js` para actualizar:
- About Me: Tu información personal
- Projects: Tus proyectos
- Skills: Tus habilidades
- Contact: Tu información de contacto

### 2. Cambiar colores/tema
Modifica las variables en los archivos CSS para personalizar colores.

### 3. Agregar nuevas aplicaciones
1. Añade el icono en el escritorio (index.html)
2. Crea la función de contenido en apps.js
3. Añade el caso en loadAppContent()

## 🚀 Cómo usar
1. Abre `index.html` en tu navegador
2. Espera la animación de arranque
3. Click en "Click here to begin"
4. ¡Explora el escritorio!

## 📝 To-Do
- [ ] Añadir efectos de sonido de Windows XP
- [ ] Implementar más aplicaciones (Calculadora, Paint, etc.)
- [ ] Añadir animaciones de minimizar/maximizar
- [ ] Sistema de archivos simulado
- [ ] Guardado de estado en localStorage

## 👤 Autor
Ivan Agustin Zarate - Full Stack Developer

## 📄 Licencia
MIT License