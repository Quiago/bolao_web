#!/bin/bash

echo "🚀 Configurando BOLAO Frontend..."
echo "=================================="

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js no está instalado${NC}"
    echo "Por favor instala Node.js desde https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node --version) encontrado${NC}"

# Verificar si npm está instalado
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm no está instalado${NC}"
    exit 1
fi

echo -e "${GREEN}✅ npm $(npm --version) encontrado${NC}"

# Instalar dependencias
echo -e "\n${YELLOW}📦 Instalando dependencias...${NC}"
npm install

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error instalando dependencias${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Dependencias instaladas correctamente${NC}"

# Crear archivo de variables de entorno si no existe
if [ ! -f ".env.local" ]; then
    echo -e "\n${YELLOW}🔧 Configurando variables de entorno...${NC}"
    cp .env.local.example .env.local
    echo -e "${GREEN}✅ Archivo .env.local creado${NC}"
    echo -e "${YELLOW}⚠️  Recuerda configurar tu API_URL en .env.local${NC}"
else
    echo -e "${GREEN}✅ Archivo .env.local ya existe${NC}"
fi

# Verificar estructura de archivos
echo -e "\n${YELLOW}📁 Verificando estructura de archivos...${NC}"

required_files=(
    "package.json"
    "pages/index.js"
    "pages/_app.js"
    "pages/api/search.js"
    "pages/api/filters.js"
    "components/Map.js"
    "styles/globals.css"
    "public/bolao-logo.png"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file${NC}"
    else
        echo -e "${RED}❌ $file (falta)${NC}"
    fi
done

# Verificar iconos del mapa
echo -e "\n${YELLOW}🗺️  Verificando iconos del mapa...${NC}"
map_icons=(
    "public/leaflet/marker-icon.png"
    "public/leaflet/marker-icon-2x.png"
    "public/leaflet/marker-shadow.png"
)

for icon in "${map_icons[@]}"; do
    if [ -f "$icon" ]; then
        echo -e "${GREEN}✅ $icon${NC}"
    else
        echo -e "${YELLOW}⚠️  $icon (se descargará automáticamente)${NC}"
    fi
done

echo -e "\n${GREEN}🎉 ¡Configuración completada!${NC}"
echo ""
echo -e "${YELLOW}📋 Próximos pasos:${NC}"
echo ""
echo "1. Configura tu API en .env.local:"
echo "   NEXT_PUBLIC_API_URL=https://tu-api.hf.space"
echo "   HUGGING_FACE_TOKEN=tu-token-aqui"
echo ""
echo "2. Ejecuta el proyecto:"
echo "   npm run dev"
echo ""
echo "3. Abre tu navegador en:"
echo "   http://localhost:3000"
echo ""
echo -e "${GREEN}¡Listo para usar BOLAO! 🚀${NC}"
