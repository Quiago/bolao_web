import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';

// Componente de fallback cuando no se puede cargar el mapa
const MapFallback = ({ products }) => (
  <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
    <div className="text-center p-4">
      <p className="text-gray-600 mb-2">Mapa no disponible</p>
      {products && products[0] && (
        <div className="text-sm text-gray-500">
          <p>{products[0].name}</p>
          <p>{products[0].address}</p>
        </div>
      )}
    </div>
  </div>
);

// Leaflet debe cargarse dinámicamente porque usa el DOM
const MapComponent = dynamic(
  () => import('./MapComponent').catch(err => {
    console.error('Error loading MapComponent:', err);
    return () => <MapFallback />;
  }),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mb-2"></div>
          <p className="text-gray-500">Cargando mapa...</p>
        </div>
      </div>
    )
  }
);

export default function Map({ 
  products = [], 
  selectedProduct = null, 
  onProductSelect = null,
  height = 'h-64',
  className = ''
}) {
  const [mapboxToken, setMapboxToken] = useState(null);
  const [hasError, setHasError] = useState(false);
  
  useEffect(() => {
    // Obtener token en el cliente
    setMapboxToken(process.env.NEXT_PUBLIC_MAPBOX_TOKEN);
    
    // Verificar si Leaflet CSS está cargado
    if (typeof window !== 'undefined') {
      const checkCSS = () => {
        const sheets = document.styleSheets;
        let hasLeafletCSS = false;
        
        // Buscar en hojas de estilo locales
        for (let i = 0; i < sheets.length; i++) {
          try {
            if (sheets[i].href && sheets[i].href.includes('leaflet')) {
              hasLeafletCSS = true;
              break;
            }
            // Verificar reglas CSS inline
            if (sheets[i].cssRules) {
              for (let j = 0; j < sheets[i].cssRules.length; j++) {
                if (sheets[i].cssRules[j].cssText && sheets[i].cssRules[j].cssText.includes('leaflet')) {
                  hasLeafletCSS = true;
                  break;
                }
              }
            }
          } catch (e) {
            // Ignorar errores CORS
          }
        }
        
        if (!hasLeafletCSS) {
          console.warn('⚠️ Leaflet CSS no detectado. Inyectando estilos...');
          // Inyectar estilos de Leaflet como fallback
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
          link.integrity = 'sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A==';
          link.crossOrigin = '';
          document.head.appendChild(link);
        }
      };
      
      // Verificar después de un pequeño delay
      setTimeout(checkCSS, 100);
    }
  }, []);
  
  // Log de debugging
  useEffect(() => {
    if (products.length > 0) {
      console.log('Map component received products:', products.length);
      console.log('Sample product:', products[0]);
      console.log('Mapbox token available:', !!mapboxToken);
    }
  }, [products, mapboxToken]);
  
  // Si hay un error, mostrar fallback
  if (hasError) {
    return <MapFallback products={products} />;
  }
  
  return (
    <div className={`w-full ${height} rounded-lg overflow-hidden shadow-md ${className}`}>
      <MapComponent 
        products={products}
        selectedProduct={selectedProduct}
        onProductSelect={onProductSelect}
        mapboxToken={mapboxToken}
      />
    </div>
  );
}