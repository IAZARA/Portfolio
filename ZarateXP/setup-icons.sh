#!/bin/bash

# Script para configurar los iconos de ZarateXP
echo "🎨 Configurando iconos para ZarateXP..."

# Crear estructura de directorios si no existe
mkdir -p assets/images

# Lista de iconos requeridos
REQUIRED_ICONS=(
    "computer.png"
    "folder.png"
    "user.png"
    "email.png"
    "document.png"
    "tools.png"
    "user-icon.png"
    "windows-logo-small.png"
    "shutdown.png"
    "github.png"
    "linkedin.png"
    "notepad.png"
    "pdf.png"
    "internet-explorer.png"
    "recycle-bin-empty.png"
    "recycle-bin-full.png"
    "my-documents.png"
    "text-file.png"
)

# Verificar qué iconos faltan
echo "📋 Verificando iconos..."
MISSING_COUNT=0

for icon in "${REQUIRED_ICONS[@]}"; do
    if [ ! -f "assets/images/$icon" ]; then
        echo "❌ Falta: $icon"
        ((MISSING_COUNT++))
    else
        echo "✅ Encontrado: $icon"
    fi
done

echo ""
echo "📊 Resumen:"
echo "Total de iconos requeridos: ${#REQUIRED_ICONS[@]}"
echo "Iconos faltantes: $MISSING_COUNT"

# Verificar el fondo
if [ -f "assets/images/bliss.jpg" ]; then
    echo "✅ Fondo bliss.jpg encontrado"
else
    echo "❌ Falta el fondo bliss.jpg"
fi

echo ""
echo "💡 Sugerencias:"
echo "1. Descarga los iconos desde generate-xp-icons.html"
echo "2. Coloca los iconos descargados en la carpeta assets/images/"
echo "3. Ejecuta este script nuevamente para verificar"