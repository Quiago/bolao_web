import Head from 'next/head';
import { useState } from 'react';

export default function Debug() {
    const [testResult, setTestResult] = useState(null);
    const [loading, setLoading] = useState(false);

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

    return (
        <>
            <Head>
                <title>Debug - BOLAO</title>
            </Head>

            <div className="min-h-screen bg-gray-50 p-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">BOLAO Debug Panel</h1>

                    <div className="bg-white rounded-lg shadow p-6 mb-6">
                        <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
                        <div className="space-y-2 text-sm font-mono">
                            <div>API URL: <span className="text-blue-600">{process.env.NEXT_PUBLIC_API_URL || 'Not set'}</span></div>
                            <div>Has HF Token: <span className="text-green-600">{process.env.HUGGING_FACE_TOKEN ? 'Yes' : 'No'}</span></div>
                            <div>Has Mapbox Token: <span className="text-green-600">{process.env.NEXT_PUBLIC_MAPBOX_TOKEN ? 'Yes' : 'No'}</span></div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
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
                </div>
            </div>
        </>
    );
}
