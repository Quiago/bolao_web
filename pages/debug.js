import Head from 'next/head';
import { useState } from 'react';

export default function Debug() {
    const [testResult, setTestResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [geocodeTest, setGeocodeTest] = useState(null);
    const [testAddress, setTestAddress] = useState('Calle 23 y 12, Vedado, La Habana');

    const testAPI = async () => {
        setLoading(true);
        setTestResult(null);

        try {
            const response = await fetch('/api/search?query=test');
            const data = await response.json();

            setTestResult({
                success: response.ok,
                status: response.status,
                data: data,
                url: process.env.NEXT_PUBLIC_API_URL,
                hasToken: !!process.env.HUGGING_FACE_TOKEN
            });
        } catch (error) {
            setTestResult({
                success: false,
                error: error.message,
                url: process.env.NEXT_PUBLIC_API_URL,
                hasToken: !!process.env.HUGGING_FACE_TOKEN
            });
        } finally {
            setLoading(false);
        }
    };

    const testMapboxGeocoding = async () => {
        setLoading(true);
        setGeocodeTest(null);
        
        const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
        
        if (!mapboxToken) {
            setGeocodeTest({
                success: false,
                error: 'No Mapbox token configured'
            });
            setLoading(false);
            return;
        }

        try {
            const encodedAddress = encodeURIComponent(`${testAddress} Cuba`);
            const response = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?` +
                `access_token=${mapboxToken}&` +
                `country=CU&` +
                `limit=1&` +
                `language=es`
            );

            const data = await response.json();

            if (response.ok && data.features && data.features.length > 0) {
                const [lng, lat] = data.features[0].center;
                setGeocodeTest({
                    success: true,
                    coordinates: { lat, lng },
                    placeName: data.features[0].place_name,
                    rawResponse: data
                });
            } else {
                setGeocodeTest({
                    success: false,
                    error: 'No results found',
                    rawResponse: data
                });
            }
        } catch (error) {
            setGeocodeTest({
                success: false,
                error: error.message
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Head>
                <title>Debug - BOLAO</title>
            </Head>

            <div className="min-h-screen bg-gray-50 p-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">BOLAO Debug Panel</h1>

                    {/* Environment Variables */}
                    <div className="bg-white rounded-lg shadow p-6 mb-6">
                        <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
                        <div className="space-y-2 text-sm font-mono">
                            <div className="flex items-center">
                                <span className="text-gray-600 mr-2">API URL:</span>
                                <span className="text-blue-600">{process.env.NEXT_PUBLIC_API_URL || 'Not set'}</span>
                            </div>
                            <div className="flex items-center">
                                <span className="text-gray-600 mr-2">Has HF Token:</span>
                                <span className={process.env.HUGGING_FACE_TOKEN ? 'text-green-600' : 'text-red-600'}>
                                    {process.env.HUGGING_FACE_TOKEN ? 'Yes ✓' : 'No ✗'}
                                </span>
                            </div>
                            <div className="flex items-center">
                                <span className="text-gray-600 mr-2">Has Mapbox Token:</span>
                                <span className={process.env.NEXT_PUBLIC_MAPBOX_TOKEN ? 'text-green-600' : 'text-red-600'}>
                                    {process.env.NEXT_PUBLIC_MAPBOX_TOKEN ? 'Yes ✓' : 'No ✗'}
                                </span>
                            </div>
                            {process.env.NEXT_PUBLIC_MAPBOX_TOKEN && (
                                <div className="text-xs text-gray-500 mt-1">
                                    Token: {process.env.NEXT_PUBLIC_MAPBOX_TOKEN.substring(0, 10)}...
                                </div>
                            )}
                        </div>
                    </div>

                    {/* API Test */}
                    <div className="bg-white rounded-lg shadow p-6 mb-6">
                        <h2 className="text-xl font-semibold mb-4">API Test</h2>

                        <button
                            onClick={testAPI}
                            disabled={loading}
                            className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 disabled:opacity-50"
                        >
                            {loading ? 'Testing...' : 'Test API Connection'}
                        </button>

                        {testResult && (
                            <div className="mt-6">
                                <h3 className="font-semibold mb-2">Test Result:</h3>
                                <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                                    {JSON.stringify(testResult, null, 2)}
                                </pre>
                            </div>
                        )}
                    </div>

                    {/* Mapbox Geocoding Test */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-4">Mapbox Geocoding Test</h2>
                        
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Test Address:
                            </label>
                            <input
                                type="text"
                                value={testAddress}
                                onChange={(e) => setTestAddress(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                                placeholder="Enter an address in Cuba"
                            />
                        </div>

                        <button
                            onClick={testMapboxGeocoding}
                            disabled={loading || !process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                        >
                            {loading ? 'Testing...' : 'Test Geocoding'}
                        </button>

                        {!process.env.NEXT_PUBLIC_MAPBOX_TOKEN && (
                            <p className="text-red-500 text-sm mt-2">
                                ⚠️ Mapbox token not configured. Add NEXT_PUBLIC_MAPBOX_TOKEN to your .env.local
                            </p>
                        )}

                        {geocodeTest && (
                            <div className="mt-6">
                                <h3 className="font-semibold mb-2">Geocoding Result:</h3>
                                {geocodeTest.success ? (
                                    <div className="bg-green-50 p-4 rounded">
                                        <p className="text-green-800 font-medium">✓ Success!</p>
                                        <p className="text-sm text-gray-700 mt-1">
                                            Place: {geocodeTest.placeName}
                                        </p>
                                        <p className="text-sm text-gray-700">
                                            Coordinates: {geocodeTest.coordinates.lat.toFixed(6)}, {geocodeTest.coordinates.lng.toFixed(6)}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="bg-red-50 p-4 rounded">
                                        <p className="text-red-800 font-medium">✗ Error</p>
                                        <p className="text-sm text-red-700 mt-1">{geocodeTest.error}</p>
                                    </div>
                                )}
                                
                                {geocodeTest.rawResponse && (
                                    <details className="mt-4">
                                        <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                                            View raw response
                                        </summary>
                                        <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto mt-2">
                                            {JSON.stringify(geocodeTest.rawResponse, null, 2)}
                                        </pre>
                                    </details>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Instructions */}
                    <div className="mt-8 bg-blue-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-blue-900 mb-2">Setup Instructions:</h3>
                        <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
                            <li>Create a <code className="bg-blue-100 px-1 rounded">.env.local</code> file in your project root</li>
                            <li>Add your Mapbox token: <code className="bg-blue-100 px-1 rounded">NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_token_here</code></li>
                            <li>Get a free token at <a href="https://account.mapbox.com/" target="_blank" rel="noopener noreferrer" className="underline">mapbox.com</a></li>
                            <li>Restart your development server after adding the token</li>
                        </ol>
                    </div>
                </div>
            </div>
        </>
    );
}