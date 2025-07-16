# Plan para la integración nativa de Winamp

## Objetivo
Modificar la aplicación de Winamp para que su apariencia y comportamiento sean idénticos a los de la versión nativa de Windows XP. Esto implica dos puntos clave:
1.  **Apariencia:** Eliminar completamente el contenedor de la ventana (bordes azules, barra de título, etc.) para que solo el componente de Winamp sea visible y arrastrable.
2.  **Funcionalidad:** Implementar correctamente la capacidad de reproducir la canción `track.mp3` y mostrar el título "Paint It Black" en la pantalla de Winamp al hacer clic en el botón de reproducción.

## Análisis del Problema
1.  **Contenedor de Ventana Incorrecto:** La aplicación de Winamp se carga actualmente dentro de una ventana genérica del sistema, lo que le añade un marco y una barra de título no deseados. La solución no es ocultar los bordes con CSS, sino evitar que Winamp se cargue en ese contenedor.
2.  **Lógica de Reproducción Fallida:** El script `winamp-logic.js` anterior no funcionó porque los selectores (`.play`, `.song-title`) eran suposiciones. Es necesario inspeccionar la estructura interna real del componente de Winamp para identificar los elementos correctos.

## Pasos para la Solución

### 1. Modificar la Creación de Ventanas
- **Analizar `js/apps.js` y `js/main.js`:** Investigaré estos archivos para entender cómo se crean y gestionan las ventanas de las aplicaciones.
- **Crear una Ventana "sin marco" (Frameless):** Modificaré la lógica de creación de ventanas para que, si el programa a abrir es "winamp", se genere un contenedor especial sin los elementos de la ventana estándar. Esto asegurará que solo la interfaz de Winamp sea visible.
- **Asegurar que sea Arrastrable:** Me aseguraré de que la nueva ventana sin marco siga siendo arrastrable, utilizando la barra de título del propio Winamp como punto de anclaje.

### 2. Implementar la Lógica de Audio y Título
- **Inspeccionar el Componente Winamp:** Analizaré el código de `js/winamp.js` para encontrar los selectores de clase o ID correctos para:
    - El botón de `play`.
    - El botón de `stop`.
    - El área donde se muestra el título de la canción.
- **Actualizar `winamp-logic.js`:** Reescribiré el script con los selectores correctos. La lógica hará lo siguiente:
    - Al pulsar "Play", comenzará la reproducción de `assets/winamp/track.mp3`.
    - El título "Paint It Black" se mostrará en el display.
    - Al pulsar "Stop", la reproducción se detendrá y el título se borrará.
- **Integrar el Audio:** Me aseguraré de que el elemento `<audio>` se cree y gestione correctamente para evitar problemas de reproducción.

### 3. Limpieza y Verificación
- **Eliminar Archivos Antiguos:** Borraré el archivo `winamp-integration.css` que ya no es necesario para evitar confusión.
- **Verificación Final:** Probaré la aplicación completa para asegurar que Winamp se vea y funcione como se espera, sin afectar al resto de las aplicaciones del escritorio.
