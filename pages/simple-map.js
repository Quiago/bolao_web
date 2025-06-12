import { useEffect, useRef } from 'react';
import Head from 'next/head';

export default function SimpleMap() {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);

    useEffect(() => {
        // Solo ejecutar en el cliente
        if (typeof window === 'undefined') return;

        const initMap = async () => {
            try {
                // Importar Leaflet dinámicamente
                const L = (await import('leaflet')).default;
                
                // Si el mapa ya existe, no crear otro
                if (mapInstance.current) return;

                console.log('Creando mapa...');

                // Crear el mapa
                const map = L.map(mapRef.current).setView([23.1136, -82.3666], 13);
                mapInstance.current = map;

                // Agregar capa de tiles
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenStreetMap contributors'
                }).addTo(map);

                // Agregar un marcador de prueba
                const marker = L.marker([23.1136, -82.3666]).addTo(map);
                marker.bindPopup('<b>La Habana</b><br>Centro de la ciudad').openPopup();

                console.log('Mapa creado exitosamente');

                // Agregar marcadores de los datos de prueba
                const testLocations = [
                    {
                        coords: [23.137781719937383, -82.38192918071945],
                        name: "TerrazaCafé",
                        product: "Croissant - $700"
                    },
                    {
                        coords: [23.093554501966015, -82.35978920727577],
                        name: "Alexin",
                        product: "Croissant TODAY - $180"
                    }
                ];

                testLocations.forEach(location => {
                    L.marker(location.coords)
                        .addTo(map)
                        .bindPopup(`<b>${location.name}</b><br>${location.product}`);
                });

            } catch (error) {
                console.error('Error al crear el mapa:', error);
            }
        };

        // Pequeño delay para asegurar que el DOM esté listo
        setTimeout(initMap, 100);

        // Cleanup
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
                <title>Mapa Simple - Test</title>
                <link
                    rel="stylesheet"
                    href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"
                    integrity="sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A=="
                    crossOrigin=""
                />
            </Head>

            <div className="p-8">
                <h1 className="text-2xl font-bold mb-4">Test Simple de Leaflet</h1>
                
                <div className="mb-4 p-4 bg-yellow-100 rounded">
                    <p className="text-sm">Este es un test básico. Si ves el mapa aquí pero no en las otras páginas, 
                    el problema está en la configuración de los estilos CSS.</p>
                </div>

                <div 
                    ref={mapRef} 
                    style={{ 
                        height: '400px', 
                        width: '100%',
                        border: '2px solid #ccc',
                        borderRadius: '8px'
                    }}
                />

                <div className="mt-4 space-y-2 text-sm">
                    <p>📍 Marcador azul: Centro de La Habana</p>
                    <p>📍 Otros marcadores: Ubicaciones de los productos de prueba</p>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded">
                    <h2 className="font-bold mb-2">Si este mapa funciona:</h2>
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                        <li>El problema es con la importación de CSS en tu proyecto</li>
                        <li>Asegúrate de que <code className="bg-blue-100 px-1">styles/globals.css</code> tenga: 
                            <code className="block mt-1 bg-blue-100 p-2 rounded">@import 'leaflet/dist/leaflet.css';</code>
                        </li>
                        <li>O importa los estilos en <code className="bg-blue-100 px-1">_app.js</code>:
                            <code className="block mt-1 bg-blue-100 p-2 rounded">import 'leaflet/dist/leaflet.css'</code>
                        </li>
                    </ol>
                </div>
            </div>
        </>
    );
}