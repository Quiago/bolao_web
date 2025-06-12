# 🔧 Guía de Integración - BOLAO Frontend

Esta guía te ayudará a integrar el frontend de BOLAO con tu API semántica.

## 🚀 Configuración Rápida

### 1. Variables de Entorno

Crea un archivo `.env.local` con tu configuración:

```bash
# API de búsqueda semántica
NEXT_PUBLIC_API_URL=https://quiago-bolao-search.hf.space

# Token de Hugging Face (para APIs privadas)
HUGGING_FACE_TOKEN=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
```

### 2. Estructura de Datos Esperada

#### Respuesta de Búsqueda (`/search`)
```json
{
  "products": [
    {
      "id": "1",
      "product_name": "Hamburguesa Clásica",
      "name": "Market Rey",
      "type": "restaurantes",
      "product_price": 8.99,
      "location": "Habana del Este, La Habana",
      "address": "Carretera del asilo #6",
      "phone": "+5355159617",
      "email": "contact@marketrey.com",
      "website": "www.marketrey.com",
      "instagram": "@marketrey",
      "facebook": "marketrey",
      "logo": "https://example.com/logo.jpg",
      "delivery": true,
      "pickup": true,
      "geo": "[-82.33339919218133, 23.154970416175193]",
      "score": 0.95
    }
  ],
  "total_results": 1,
  "search_time": 0.1,
  "filters_applied": []
}
```

#### Respuesta de Filtros (`/filters`)
```json
{
  "types": ["Todos", "restaurantes", "cafeterias", "heladerias"],
  "locations": ["Todas", "Habana del Este, La Habana", "Centro Habana"]
}
```

## 🔌 Endpoints de la API

### Búsqueda de Productos
- **URL**: `POST /search`
- **Headers**: 
  - `Content-Type: application/json`
  - `Authorization: Bearer {HF_TOKEN}` (si es privada)
- **Body**:
```json
{
  "query": "hamburguesa",
  "num_results": 20,
  "filter_type": "restaurantes",
  "filter_location": "La Habana",
  "min_score": 0.3
}
```

### Obtener Filtros
- **URL**: `GET /filters`
- **Headers**: 
  - `Authorization: Bearer {HF_TOKEN}` (si es privada)

## 🎨 Personalización

### Colores del Brand
```css
/* En tailwind.config.js */
colors: {
  orange: {
    500: '#f97316', // Color principal de BOLAO
    600: '#ea580c'  // Color hover
  }
}
```

### Logo
Reemplaza `/public/bolao-logo.png` con tu logo.

## 🗺️ Configuración del Mapa

### Formato de Coordenadas
El mapa espera coordenadas en el campo `geo`:
```json
{
  "geo": "[-82.33339919218133, 23.154970416175193]"
}
```
Formato: `[longitude, latitude]` como string JSON.

### Iconos del Mapa
Los iconos están en `/public/leaflet/`:
- `marker-icon.png`
- `marker-icon-2x.png` 
- `marker-shadow.png`

## 🚀 Despliegue

### Vercel (Recomendado)
```bash
npm i -g vercel
vercel --prod
```

### Render.com
- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Environment Variables**: Configura `NEXT_PUBLIC_API_URL` y `HUGGING_FACE_TOKEN`

### Netlify
```bash
npm run build
# Sube la carpeta .next/
```

## 🔍 Funcionalidades

### ✅ Implementadas
- ✅ Búsqueda semántica
- ✅ Filtros por ubicación y tipo
- ✅ Vista de detalles con mapa
- ✅ Responsive design
- ✅ Acciones rápidas (llamar, web, redes sociales)

### 🔜 Próximas
- 🔜 Favoritos
- 🔜 Historial de búsquedas
- 🔜 Reseñas y calificaciones
- 🔜 Sistema de reservas

## 🆘 Solución de Problemas

### Error "next: not found"
```bash
cd /ruta/del/proyecto
npm install
```

### Mapa no carga
Verifica que los archivos estén en `/public/leaflet/`

### API no responde
1. Verifica `NEXT_PUBLIC_API_URL` en `.env.local`
2. Comprueba el token de Hugging Face
3. Revisa los logs en `/api/search`

### Coordenadas no se muestran
Formato correcto: `"geo": "[lng, lat]"` (como string JSON)

## 📞 Soporte

Para soporte técnico o preguntas sobre integración, contacta al equipo de desarrollo.
