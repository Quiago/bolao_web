import { useState, useEffect } from 'react';
import Head from 'next/head';
import Map from '../components/Map';

export default function GeoDebug() {
    const [searchResult, setSearchResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    // Hacer una búsqueda de prueba
    const testSearch = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/search?query=café');
            const data = await response.json();
            setSearchResult(data);
            
            // Seleccionar el primer producto si existe
            if (data.products && data.products.length > 0) {
                setSelectedProduct(data.products[0]);
            }
        } catch (error) {
            console.error('Error en búsqueda:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        testSearch();
    }, []);

    const analyzeGeo = (geo) => {
        const result = {
            type: typeof geo,
            value: geo,
            isArray: Array.isArray(geo),
            isString: typeof geo === 'string',
            parsed: null,
            error: null,
            coords: null
        };

        try {
            if (Array.isArray(geo)) {
                result.parsed = geo;
                if (geo.length === 2 && typeof geo[0] === 'number' && typeof geo[1] === 'number') {
                    result.coords = { lng: geo[0], lat: geo[1] };
                }
            } else if (typeof geo === 'string') {
                result.parsed = JSON.parse(geo);
                if (Array.isArray(result.parsed) && result.parsed.length === 2) {
                    result.coords = { lng: result.parsed[0], lat: result.parsed[1] };
                }
            }
        } catch (e) {
            result.error = e.message;
        }

        return result;
    };

    return (
        <>
            <Head>
                <title>Debug de Coordenadas - BOLAO</title>
            </Head>

            <div className="min-h-screen bg-gray-50 p-4">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-3xl font-bold mb-6">Debug de Coordenadas</h1>

                    {/* Botón de recarga */}
                    <div className="mb-6">
                        <button
                            onClick={testSearch}
                            disabled={loading}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                        >
                            {loading ? 'Buscando...' : 'Recargar búsqueda'}
                        </button>
                    </div>

                    {searchResult && (
                        <>
                            {/* Información de la búsqueda */}
                            <div className="bg-white rounded-lg shadow p-6 mb-6">
                                <h2 className="text-xl font-semibold mb-4">Resultado de búsqueda</h2>
                                <p>Total de productos: {searchResult.products?.length || 0}</p>
                                <p>Tiempo de búsqueda: {searchResult.search_time?.toFixed(2)}s</p>
                            </div>

                            {/* Análisis de coordenadas */}
                            <div className="bg-white rounded-lg shadow p-6 mb-6">
                                <h2 className="text-xl font-semibold mb-4">Análisis de coordenadas</h2>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-sm">
                                        <thead>
                                            <tr className="bg-gray-50">
                                                <th className="px-4 py-2 text-left">Producto</th>
                                                <th className="px-4 py-2 text-left">Tipo geo</th>
                                                <th className="px-4 py-2 text-left">Valor geo</th>
                                                <th className="px-4 py-2 text-left">Coordenadas</th>
                                                <th className="px-4 py-2 text-left">Estado</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {searchResult.products?.map((product, idx) => {
                                                const geoAnalysis = analyzeGeo(product.geo);
                                                return (
                                                    <tr key={idx} className="border-b">
                                                        <td className="px-4 py-2">
                                                            <div>
                                                                <p className="font-medium">{product.product_name}</p>
                                                                <p className="text-xs text-gray-500">{product.name}</p>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-2">
                                                            <span className={`px-2 py-1 rounded text-xs ${
                                                                geoAnalysis.isArray ? 'bg-green-100 text-green-800' : 
                                                                geoAnalysis.isString ? 'bg-blue-100 text-blue-800' : 
                                                                'bg-red-100 text-red-800'
                                                            }`}>
                                                                {geoAnalysis.type}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-2">
                                                            <code className="text-xs bg-gray-100 p-1 rounded">
                                                                {JSON.stringify(geoAnalysis.value)}
                                                            </code>
                                                        </td>
                                                        <td className="px-4 py-2">
                                                            {geoAnalysis.coords ? (
                                                                <span className="text-xs">
                                                                    Lat: {geoAnalysis.coords.lat.toFixed(4)}<br/>
                                                                    Lng: {geoAnalysis.coords.lng.toFixed(4)}
                                                                </span>
                                                            ) : (
                                                                <span className="text-red-500 text-xs">No válido</span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-2">
                                                            {geoAnalysis.error ? (
                                                                <span className="text-red-500 text-xs">{geoAnalysis.error}</span>
                                                            ) : geoAnalysis.coords ? (
                                                                <span className="text-green-500 text-xs">✓ OK</span>
                                                            ) : (
                                                                <span className="text-yellow-500 text-xs">⚠ Sin coords</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Mapa de prueba */}
                            {selectedProduct && (
                                <div className="bg-white rounded-lg shadow p-6 mb-6">
                                    <h2 className="text-xl font-semibold mb-4">
                                        Mapa - {selectedProduct.product_name} ({selectedProduct.name})
                                    </h2>
                                    <div className="border border-gray-300 rounded">
                                        <Map 
                                            products={[selectedProduct]}
                                            selectedProduct={selectedProduct}
                                            height="h-96"
                                        />
                                    </div>
                                    <div className="mt-4 p-4 bg-gray-50 rounded">
                                        <p className="text-sm text-gray-600">
                                            <strong>Dirección:</strong> {selectedProduct.address}<br/>
                                            <strong>Ubicación:</strong> {selectedProduct.location}<br/>
                                            <strong>Geo:</strong> <code className="bg-gray-200 px-1 rounded">
                                                {JSON.stringify(selectedProduct.geo)}
                                            </code>
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Todos los productos en el mapa */}
                            {searchResult.products && searchResult.products.length > 0 && (
                                <div className="bg-white rounded-lg shadow p-6">
                                    <h2 className="text-xl font-semibold mb-4">
                                        Todos los productos ({searchResult.products.length})
                                    </h2>
                                    <div className="border border-gray-300 rounded">
                                        <Map 
                                            products={searchResult.products}
                                            height="h-96"
                                        />
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* Información de ayuda */}
                    <div className="mt-8 bg-blue-50 rounded-lg p-6">
                        <h3 className="font-semibold text-blue-900 mb-2">Información importante:</h3>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Las coordenadas pueden venir como array <code>[lng, lat]</code> o string <code>"[lng, lat]"</code></li>
                            <li>• El formato es [longitud, latitud] (estándar GeoJSON)</li>
                            <li>• Para Cuba: longitud ≈ -82, latitud ≈ 23</li>
                            <li>• Si el mapa no muestra marcadores, revisa el tipo de dato del campo geo</li>
                        </ul>
                    </div>
                </div>
            </div>
        </>
    );
}