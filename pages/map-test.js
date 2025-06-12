import Head from 'next/head';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Importar Map dinámicamente
const Map = dynamic(
    () => import('../components/Map'),
    { 
        ssr: false,
        loading: () => (
            <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Cargando componente de mapa...</p>
            </div>
        )
    }
);

export default function MapTest() {
    const [testData, setTestData] = useState(null);
    const [leafletLoaded, setLeafletLoaded] = useState(false);
    const [cssLoaded, setCssLoaded] = useState(false);

    // Datos de prueba con las coordenadas que compartiste
    const mockProducts = [
        {
            id: "2026",
            product_name: "Croissant",
            name: "TerrazaCafé",
            type: "cafes",
            product_price: 700,
            location: "Plaza, La Habana",
            address: "Calle L número 502 entre 27 y avenida universidad. Vedado",
            phone: "5352839213",
            delivery: true,
            pickup: true,
            geo: "[-82.38192918071945, 23.137781719937383]"
        },
        {
            id: "4626",
            product_name: "Croissant TODAY",
            name: "Alexin",
            type: "cafeterias",
            product_price: 180,
            location: "Diez de Octubre, La Habana",
            address: "San Francisco 203 e/ Lawton y San Anastasio",
            phone: "5351952997",
            delivery: false,
            pickup: true,
            geo: "[-82.35978920727577, 23.093554501966015]"
        }
    ];

    useEffect(() => {
        // Verificar si Leaflet está disponible
        const checkLeaflet = async () => {
            try {
                const L = await import('leaflet');
                setLeafletLoaded(true);
                console.log('✓ Leaflet cargado correctamente');
            } catch (error) {
                console.error('✗ Error cargando Leaflet:', error);
            }
        };

        // Verificar si los estilos CSS están cargados
        const checkCSS = () => {
            const sheets = document.styleSheets;
            let found = false;
            for (let i = 0; i < sheets.length; i++) {
                try {
                    if (sheets[i].href && sheets[i].href.includes('leaflet')) {
                        found = true;
                        break;
                    }
                } catch (e) {
                    // Ignorar errores de CORS
                }
            }
            setCssLoaded(found);
            console.log(found ? '✓ CSS de Leaflet encontrado' : '✗ CSS de Leaflet no encontrado');
        };

        checkLeaflet();
        checkCSS();
    }, []);

    const parseGeo = (geoString) => {
        try {
            const coords = JSON.parse(geoString);
            return { success: true, coords };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    return (
        <>
            <Head>
                <title>Test de Mapa - BOLAO</title>
            </Head>

            <div className="min-h-screen bg-gray-50 p-8">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">Diagnóstico del Mapa</h1>

                    {/* Status de componentes */}
                    <div className="bg-white rounded-lg shadow p-6 mb-6">
                        <h2 className="text-xl font-semibold mb-4">Estado de Componentes</h2>
                        <div className="space-y-2">
                            <div className="flex items-center">
                                <span className={`w-4 h-4 rounded-full mr-2 ${leafletLoaded ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                <span>Leaflet: {leafletLoaded ? 'Cargado ✓' : 'No cargado ✗'}</span>
                            </div>
                            <div className="flex items-center">
                                <span className={`w-4 h-4 rounded-full mr-2 ${cssLoaded ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                                <span>CSS: {cssLoaded ? 'Detectado ✓' : 'No detectado (verificar manualmente)'}</span>
                            </div>
                            <div className="flex items-center">
                                <span className={`w-4 h-4 rounded-full mr-2 ${process.env.NEXT_PUBLIC_MAPBOX_TOKEN ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                                <span>Mapbox Token: {process.env.NEXT_PUBLIC_MAPBOX_TOKEN ? 'Configurado ✓' : 'No configurado (usando OSM)'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Test de parsing de coordenadas */}
                    <div className="bg-white rounded-lg shadow p-6 mb-6">
                        <h2 className="text-xl font-semibold mb-4">Test de Coordenadas</h2>
                        <div className="space-y-3">
                            {mockProducts.map(product => {
                                const parsed = parseGeo(product.geo);
                                return (
                                    <div key={product.id} className="border-b pb-3">
                                        <p className="font-medium">{product.name}</p>
                                        <p className="text-sm text-gray-600">Geo: {product.geo}</p>
                                        <p className="text-sm">
                                            Parsing: {parsed.success ? 
                                                <span className="text-green-600">✓ Exitoso - Lat: {parsed.coords[1]}, Lng: {parsed.coords[0]}</span> : 
                                                <span className="text-red-600">✗ Error: {parsed.error}</span>
                                            }
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Mapa de prueba simple */}
                    <div className="bg-white rounded-lg shadow p-6 mb-6">
                        <h2 className="text-xl font-semibold mb-4">Mapa Simple (1 producto)</h2>
                        <div className="h-64 border border-gray-300 rounded">
                            <Map 
                                products={[mockProducts[0]]} 
                                selectedProduct={mockProducts[0]}
                            />
                        </div>
                    </div>

                    {/* Mapa con múltiples marcadores */}
                    <div className="bg-white rounded-lg shadow p-6 mb-6">
                        <h2 className="text-xl font-semibold mb-4">Mapa con Múltiples Marcadores</h2>
                        <div className="h-64 border border-gray-300 rounded">
                            <Map 
                                products={mockProducts}
                            />
                        </div>
                    </div>

                    {/* Instrucciones de solución */}
                    <div className="bg-blue-50 rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-4 text-blue-900">Solución de Problemas</h2>
                        <div className="space-y-3 text-sm text-blue-800">
                            <div>
                                <p className="font-semibold">Si el mapa no se muestra:</p>
                                <ol className="list-decimal list-inside ml-4 space-y-1">
                                    <li>Verifica que hayas instalado leaflet: <code className="bg-blue-100 px-1 rounded">npm install leaflet</code></li>
                                    <li>Asegúrate de que los estilos CSS estén importados en <code className="bg-blue-100 px-1 rounded">styles/globals.css</code></li>
                                    <li>Revisa la consola del navegador para errores</li>
                                    <li>Verifica que las coordenadas sean válidas (formato: [lng, lat])</li>
                                </ol>
                            </div>
                            
                            <div>
                                <p className="font-semibold">Si los marcadores no aparecen:</p>
                                <ol className="list-decimal list-inside ml-4 space-y-1">
                                    <li>Verifica que el campo geo contenga coordenadas válidas</li>
                                    <li>Asegúrate de que las coordenadas estén en formato JSON string</li>
                                    <li>Revisa los logs en la consola para ver el parsing de coordenadas</li>
                                </ol>
                            </div>

                            <div className="mt-4 p-3 bg-yellow-100 rounded">
                                <p className="font-semibold text-yellow-900">Nota importante:</p>
                                <p className="text-yellow-800">Las coordenadas vienen en formato [longitud, latitud] (ej: [-82.38, 23.13]). 
                                Este es el formato estándar de GeoJSON que usa Mapbox.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}