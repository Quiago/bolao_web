import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function DebugFilters() {
    const [filters, setFilters] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchFilters();
    }, []);

    const fetchFilters = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/filters');
            const data = await response.json();
            setFilters(data);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const expectedTypes = [
        'heladerias',
        'panaderias',
        'restaurantes',
        'dulcerias',
        'cafes',
        'cafeterias',
        'pizzerias',
        'bares'
    ];

    const expectedLocations = [
        'Habana del Este, La Habana',
        'Habana Vieja, La Habana',
        'Playa, La Habana',
        'Plaza, La Habana',
        'Arroyo Naranjo, La Habana',
        'Boyeros, La Habana',
        'Diez de Octubre, La Habana',
        'Artemisa, Artemisa',
        'Centro Habana, La Habana',
        'La Habana, Cuba',
        'Cotorro, La Habana',
        'La Lisa, La Habana',
        'Cerro, La Habana'
    ];

    return (
        <>
            <Head>
                <title>Debug Filtros - BOLAO</title>
            </Head>

            <div className="min-h-screen bg-gray-50 p-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold mb-6">Debug de Filtros</h1>

                    <div className="mb-4">
                        <button
                            onClick={fetchFilters}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                            Recargar Filtros
                        </button>
                    </div>

                    {loading && <p>Cargando...</p>}
                    {error && <p className="text-red-500">Error: {error}</p>}

                    {filters && (
                        <>
                            {/* Tipos */}
                            <div className="bg-white rounded-lg shadow p-6 mb-6">
                                <h2 className="text-xl font-semibold mb-4">Tipos de Establecimiento</h2>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h3 className="font-medium mb-2 text-green-600">Esperados ✓</h3>
                                        <ul className="space-y-1">
                                            {expectedTypes.map(type => (
                                                <li key={type} className="text-sm">
                                                    {type}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    
                                    <div>
                                        <h3 className="font-medium mb-2 text-blue-600">Recibidos</h3>
                                        <ul className="space-y-1">
                                            {filters.types?.map(type => (
                                                <li 
                                                    key={type} 
                                                    className={`text-sm ${
                                                        expectedTypes.includes(type) ? 'text-green-600' : 'text-red-600'
                                                    }`}
                                                >
                                                    {type} {!expectedTypes.includes(type) && '❌'}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Ubicaciones */}
                            <div className="bg-white rounded-lg shadow p-6 mb-6">
                                <h2 className="text-xl font-semibold mb-4">Ubicaciones</h2>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h3 className="font-medium mb-2 text-green-600">Esperadas ✓</h3>
                                        <ul className="space-y-1">
                                            {expectedLocations.map(loc => (
                                                <li key={loc} className="text-sm">
                                                    {loc}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    
                                    <div>
                                        <h3 className="font-medium mb-2 text-blue-600">Recibidas</h3>
                                        <ul className="space-y-1">
                                            {filters.locations?.map(loc => (
                                                <li 
                                                    key={loc} 
                                                    className={`text-sm ${
                                                        expectedLocations.includes(loc) ? 'text-green-600' : 'text-red-600'
                                                    }`}
                                                >
                                                    {loc} {!expectedLocations.includes(loc) && '❌'}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* JSON Raw */}
                            <div className="bg-white rounded-lg shadow p-6">
                                <h2 className="text-xl font-semibold mb-4">Respuesta Raw del API</h2>
                                <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
                                    {JSON.stringify(filters, null, 2)}
                                </pre>
                            </div>
                        </>
                    )}

                    {/* Instrucciones */}
                    <div className="mt-8 bg-yellow-50 rounded-lg p-6">
                        <h3 className="font-bold text-yellow-900 mb-2">Si ves valores incorrectos:</h3>
                        <ol className="list-decimal list-inside space-y-2 text-sm text-yellow-800">
                            <li>Verifica que estés en <code className="bg-yellow-100 px-1">localhost:3000</code></li>
                            <li>Asegúrate de que el archivo <code className="bg-yellow-100 px-1">pages/api/filters.js</code> esté actualizado</li>
                            <li>Limpia el caché: <code className="bg-yellow-100 px-1">rm -rf .next</code></li>
                            <li>Reinicia el servidor</li>
                            <li>Limpia el caché del navegador (Ctrl+Shift+R)</li>
                        </ol>
                    </div>
                </div>
            </div>
        </>
    );
}