#!/bin/bash

# Script de inicio para ZarateXP Portfolio
# Autor: Ivan Agustin Zarate
# Versión: 2.0 - Optimizado para pantalla completa

echo "🚀 Iniciando ZarateXP Portfolio..."
echo "=================================="
echo "✨ Mejoras incluidas:"
echo "   • Pantalla completa automática"
echo "   • Imagen de usuario personalizada"
echo "   • Directorio organizado"
echo "=================================="

# Verificar si existe el directorio del proyecto
if [ ! -d "ZarateXP" ]; then
    echo "❌ Error: No se encontró el directorio ZarateXP"
    exit 1
fi

# Cambiar al directorio del proyecto
cd ZarateXP

# Verificar si existe index.html
if [ ! -f "index.html" ]; then
    echo "❌ Error: No se encontró index.html en el directorio ZarateXP"
    exit 1
fi

echo "✅ Proyecto encontrado"
echo "📁 Directorio: $(pwd)"

# Función para verificar si un puerto está en uso
check_port() {
    if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # Puerto en uso
    else
        return 1  # Puerto libre
    fi
}

# Verificar si el puerto 8080 está disponible
if check_port; then
    echo "⚠️  El puerto 8080 ya está en uso"
    echo "🔍 Intentando encontrar un puerto disponible..."
    
    # Buscar un puerto disponible entre 8080-8090
    PORT=8080
    while [ $PORT -le 8090 ]; do
        if ! lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
            break
        fi
        PORT=$((PORT + 1))
    done
    
    if [ $PORT -gt 8090 ]; then
        echo "❌ No se encontró un puerto disponible entre 8080-8090"
        exit 1
    fi
    
    echo "✅ Usando puerto alternativo: $PORT"
else
    PORT=8080
    echo "✅ Puerto 8080 disponible"
fi

echo "🌐 Iniciando servidor web en localhost:$PORT..."

# Función para abrir el navegador después de un breve delay
open_browser() {
    sleep 2
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        echo "🍎 Abriendo navegador en macOS..."
        open "http://localhost:$PORT"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        echo "🐧 Abriendo navegador en Linux..."
        xdg-open "http://localhost:$PORT"
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
        # Windows
        echo "🪟 Abriendo navegador en Windows..."
        start "http://localhost:$PORT"
    fi
}

# Abrir navegador en segundo plano
open_browser &

echo ""
echo "🎉 ZarateXP Portfolio iniciado exitosamente!"
echo "🌐 Accede a tu aplicación en: http://localhost:$PORT"
echo "💡 Tip: Presiona F11 para pantalla completa (mejor experiencia)"
echo "🛑 Para detener el servidor, presiona Ctrl+C"
echo ""
echo "=================================="
echo "✨ ¡Disfruta explorando el portfolio estilo Windows XP!"
echo "=================================="

# Iniciar servidor web con Python
if command -v python3 &> /dev/null; then
    echo "🐍 Usando Python 3..."
    python3 -m http.server $PORT
elif command -v python &> /dev/null; then
    echo "🐍 Usando Python 2..."
    python -m SimpleHTTPServer $PORT
else
    echo "❌ Error: Python no está instalado"
    echo "💡 Instala Python o abre manualmente: file://$(pwd)/index.html"
    exit 1
fi