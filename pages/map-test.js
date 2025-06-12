import { useEffect, useRef, useState } from 'react';
import Head from 'next/head';

export default function TestRealMap() {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const [mapError, setMapError] = useState(null);
    const [mapSuccess, setMapSuccess] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const initMap = async () => {
            try {
                console.log('1. Iniciando carga de Leaflet...');
                const L = (await import('leaflet')).default;
                console.log('2. Leaflet cargado exitosamente');

                if (mapInstance.current) {
                    console.log('3. Mapa ya existe, saliendo...');
                    return;
                }

                console.log('4. Creando instancia del mapa...');
                const map = L.map(mapRef.current).setView([23.1136, -82.3666], 12);
                mapInstance.current = map;
                console.log('5. Mapa creado');

                console.log('6. Agregando capa de tiles...');
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenStreetMap contributors'
                }).addTo(map);
                console.log('7. Capa de tiles agregada');

                // Datos reales del producto que está causando problemas
                const testProduct = {
                    name: "Crispy Chicken",
                    product_name: "Café expresso",
                    geo: [-82.37602472305299, 23.089443592479565], // Array directo
                    address: "Tu dirección aquí"
                };

                console.log('8. Procesando producto:', testProduct);

                // Verificar el tipo de geo
                console.log('9. Tipo de geo:', typeof testProduct.geo, 'Es array:', Array.isArray(testProduct.geo));

                let lat, lng;
                if (Array.isArray(testProduct.geo)) {
                    [lng, lat] = testProduct.geo;
                    console.log('10. Coordenadas extraídas - Lat:', lat, 'Lng:', lng);
                } else {
                    console.error('10. ERROR: geo no es un array');
                    return;
                }

                console.log('11. Creando marcador...');
                const marker = L.marker([lat, lng]).addTo(map);
                
                const popupContent = `
                    <div style="padding: 10px;">
                        <h3 style="margin: 0 0 5px 0;">${testProduct.product_name}</h3>
                        <p style="margin: 0; color: #666;">${testProduct.name}</p>
                        <p style="margin: 5px 0 0 0; font-size: 12px;">
                            Lat: ${lat.toFixed(6)}<br>
                            Lng: ${lng.toFixed(6)}
                        </p>
                    </div>
                `;
                
                marker.bindPopup(popupContent).openPopup();
                console.log('12. Marcador creado y popup abierto');

                // Centrar el mapa en el marcador
                map.setView([lat, lng], 15);
                console.log('13. Mapa centrado en el marcador');

                setMapSuccess(true);
                setMapError(null);

            } catch (error) {
                console.error('ERROR en paso del mapa:', error);
                setMapError(error.message);
                setMapSuccess(false);
            }
        };

        setTimeout(initMap, 100);

        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, []);

    return (
        <>
            <Head>
                <title>Test de Mapa con Datos Reales</title>
                <link
                    rel="stylesheet"
                    href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"
                />
            </Head>

            <div className="p-8">
                <h1 className="text-2xl font-bold mb-4">Test de Mapa con Producto Real</h1>
                
                {/* Estado del mapa */}
                <div className="mb-4">
                    {mapError && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                            <strong>Error:</strong> {mapError}
                        </div>
                    )}
                    {mapSuccess && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                            ✓ Mapa cargado exitosamente
                        </div>
                    )}
                </div>

                {/* Información del producto */}
                <div className="mb-4 p-4 bg-gray-100 rounded">
                    <h2 className="font-bold mb-2">Datos del producto de prueba:</h2>
                    <pre className="text-sm">
{`{
  name: "Crispy Chicken",
  product_name: "Café expresso",
  geo: [-82.37602472305299, 23.089443592479565],
  tipo_geo: "${typeof [-82.37602472305299, 23.089443592479565]}",
  es_array: ${Array.isArray([-82.37602472305299, 23.089443592479565])}
}`}
                    </pre>
                </div>

                {/* El mapa */}
                <div 
                    ref={mapRef} 
                    style={{ 
                        height: '400px', 
                        width: '100%',
                        border: '2px solid #ccc',
                        borderRadius: '8px',
                        backgroundColor: '#f0f0f0'
                    }}
                />

                {/* Instrucciones */}
                <div className="mt-6 p-4 bg-blue-50 rounded">
                    <h3 className="font-bold mb-2">¿Qué debería ver?</h3>
                    <ul className="list-disc list-inside text-sm space-y-1">
                        <li>Un mapa centrado en las coordenadas del producto</li>
                        <li>Un marcador con un popup mostrando "Café expresso - Crispy Chicken"</li>
                        <li>Mensajes en la consola mostrando cada paso del proceso</li>
                    </ul>
                </div>

                {/* Debug info */}
                <div className="mt-4 p-4 bg-yellow-50 rounded">
                    <h3 className="font-bold mb-2">Revisa la consola del navegador</h3>
                    <p className="text-sm">Deberías ver mensajes numerados del 1 al 13 mostrando el progreso.</p>
                    <p className="text-sm mt-2">Si el mapa funciona aquí pero no en tu componente, el problema está en la integración.</p>
                </div>
            </div>
        </>
    );
}