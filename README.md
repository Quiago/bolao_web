# 🔍 BOLAO Frontend

Frontend moderno para BOLAO, una aplicación de búsqueda semántica de productos y servicios locales.

## 🚀 Características

- **Búsqueda en lenguaje natural**: Encuentra exactamente lo que buscas
- **Filtros avanzados**: Por ubicación y tipo de establecimiento
- **Resultados ordenados por relevancia**: Algoritmo de búsqueda semántica
- **Vista de detalles completa**: Con mapa, redes sociales y acciones rápidas
- **Diseño responsive**: Funciona perfectamente en móvil y desktop
- **📊 Analytics integrado**: Google Analytics 4 para insights de tráfico y comportamiento

## 📋 Instalación

1. **Instala las dependencias**
```bash
npm install
```

2. **Configura las variables de entorno**
```bash
cp .env.local.example .env.local
# Edita .env.local con tu API URL
```

3. **Ejecuta el proyecto**
```bash
npm run dev
```

## 🌐 Despliegue

### Vercel
```bash
npm i -g vercel
vercel --prod
```

### Render.com
- Build Command: `npm run build`
- Start Command: `npm start`

## 📊 Analytics

BOLAO incluye Google Analytics 4 para obtener insights valiosos sobre el tráfico y comportamiento de usuarios.

**Configuración rápida:**
1. Obtén tu ID de Google Analytics (formato: `G-XXXXXXXXXX`)
2. Agrega `NEXT_PUBLIC_GA_TRACKING_ID=G-TU-ID` a `.env.local`
3. Despliega y verifica en Google Analytics

Ver [GOOGLE_ANALYTICS_GUIDE.md](./GOOGLE_ANALYTICS_GUIDE.md) para documentación completa.

## 📄 Licencia

MIT
