# ZarateXP - Windows XP Portfolio Simulation

Una simulación interactiva de Windows XP construida con tecnologías web modernas. Este proyecto recrea la experiencia nostálgica del sistema operativo Windows XP con aplicaciones funcionales y una interfaz auténtica.

## 🚀 Características

- **Interfaz Auténtica**: Recreación fiel del escritorio de Windows XP usando XP.css framework
- **Sistema de Ventanas**: Ventanas arrastrables, redimensionables, minimizables y maximizables
- **Menú de Inicio**: Menú de inicio funcional con categorías y aplicaciones
- **Barra de Tareas**: Barra de tareas con reloj en tiempo real y gestión de ventanas
- **Aplicaciones Integradas**:
  - About Me (Portfolio)
  - My Projects
  - Resume Viewer
  - Contact Form
  - Skills & Tools
  - Command Prompt
  - Notepad
  - Paint
  - Calculator
  - Internet Explorer
  - Media Player
  - Minesweeper
  - Solitaire
  - Control Panel
  - Recycle Bin

- **Efectos CRT**: Efectos visuales nostálgicos de monitor CRT
- **Sistema de Sonidos**: Efectos de sonido del sistema (requiere archivos de audio)
- **Responsive Design**: Adaptado para dispositivos móviles

## 🛠️ Tecnologías Utilizadas

- **HTML5**: Estructura semántica
- **CSS3**: Estilos avanzados y animaciones
- **JavaScript ES6+**: Módulos y programación orientada a objetos
- **XP.css**: Framework CSS para componentes de Windows XP
- **No frameworks**: Vanilla JavaScript puro

## 📁 Estructura del Proyecto

```
ZarateXP/
├── index.html          # Archivo principal HTML
├── css/               # Archivos de estilos
│   ├── reset.css      # Reset de estilos
│   ├── main.css       # Estilos principales
│   ├── boot.css       # Pantalla de arranque
│   ├── desktop.css    # Escritorio
│   ├── taskbar.css    # Barra de tareas
│   ├── startMenu.css  # Menú de inicio
│   ├── windows.css    # Sistema de ventanas
│   └── crtEffect.css  # Efectos CRT
├── js/                # Módulos JavaScript
│   ├── main.js        # Módulo principal
│   ├── boot.js        # Gestor de arranque
│   ├── desktop.js     # Gestor del escritorio
│   ├── taskbar.js     # Gestor de barra de tareas
│   ├── startMenu.js   # Gestor del menú inicio
│   ├── windows.js     # Gestor de ventanas
│   ├── sounds.js      # Gestor de sonidos
│   └── apps.js        # Gestor de aplicaciones
├── images/            # Imágenes e iconos
│   └── icons/         # Iconos de aplicaciones
├── sounds/            # Archivos de audio (opcional)
└── assets/            # Otros recursos

```

## 🚀 Instalación y Uso

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/tu-usuario/zaratexp.git
   cd zaratexp
   ```

2. **Servir localmente**:
   
   Opción 1 - Python:
   ```bash
   python3 -m http.server 8080
   ```
   
   Opción 2 - Node.js:
   ```bash
   npx serve
   ```
   
   Opción 3 - Live Server en VS Code

3. **Abrir en el navegador**:
   ```
   http://localhost:8080
   ```

## 🎨 Personalización

### Agregar Nuevas Aplicaciones

1. Registrar la aplicación en `js/apps.js`:
   ```javascript
   this.registerApp({
       id: 'mi-app',
       name: 'Mi Aplicación',
       icon: './images/icons/mi-app.png',
       category: 'utilities',
       description: 'Descripción de mi app',
       handler: () => this.openMiApp()
   });
   ```

2. Crear el método handler:
   ```javascript
   openMiApp() {
       const content = `<div>Contenido de mi app</div>`;
       return this.createWindow('mi-app', 'Mi Aplicación', content);
   }
   ```

### Modificar Estilos

Los estilos están organizados por componentes. Para modificar:
- Colores del tema: `css/main.css` (variables CSS)
- Aspecto de ventanas: `css/windows.css`
- Efectos visuales: `css/crtEffect.css`

## 📱 Soporte Móvil

El proyecto incluye:
- Diseño responsive
- Detección de orientación
- Ajustes de viewport
- Interfaz táctil optimizada

## 🔊 Sonidos del Sistema

Para habilitar sonidos, agrega los siguientes archivos WAV en la carpeta `sounds/`:
- startup.wav
- shutdown.wav
- error.wav
- click.wav
- minimize.wav
- maximize.wav
- etc.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👤 Autor

**Ivan Agustin Zarate**
- Portfolio: [zarate.dev](https://zarate.dev)
- GitHub: [@zarate](https://github.com/zarate)

## 🙏 Agradecimientos

- [XP.css](https://botoxparty.github.io/XP.css/) por el framework CSS
- Microsoft por la inspiración de Windows XP
- La comunidad de desarrollo web por las ideas y recursos

---

⭐ Si te gusta este proyecto, ¡dale una estrella en GitHub!