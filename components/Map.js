import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

// Leaflet debe cargarse dinámicamente porque usa el DOM
const MapComponent = dynamic(
  () => import('./MapComponent'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Cargando mapa...</p>
      </div>
    )
  }
);

export default function Map({ products = [], selectedProduct = null, onProductSelect = null }) {
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  
  return (
    <div className="w-full h-64 rounded-lg overflow-hidden shadow-md">
      <MapComponent 
        products={products}
        selectedProduct={selectedProduct}
        onProductSelect={onProductSelect}
        mapboxToken={mapboxToken}
      />
    </div>
  );
}
