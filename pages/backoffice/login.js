import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getSupabaseClient } from '../../utils/supabaseClient';

export default function BackofficeLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const router = useRouter();

    // Manejar navegación hacia atrás
    useEffect(() => {
        const handlePopState = (event) => {
            // Si el usuario presiona atrás desde el login, redirigir a la página principal
            router.replace('/');
        };

        // Agregar listener para el evento popstate (botón atrás/adelante del navegador)
        window.addEventListener('popstate', handlePopState);

        // Limpiar el listener cuando el componente se desmonte
        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, [router]);

    const handleBackToHome = () => {
        router.push('/');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setLoading(true);
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const result = await response.json();
            if (!response.ok) {
                setMessage(result.error || 'Correo o contraseña incorrectos.');
                setLoading(false);
                return;
            }
            setMessage('Login exitoso');
            if (result.token) {
                sessionStorage.setItem('token', result.token);
            }
            // Redirigir al panel de administración
            router.push('/backoffice/admin');
        } catch (err) {
            setMessage('Error inesperado al intentar ingresar.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Head>
                <title>Login Backoffice | BOLAO</title>
            </Head>
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
                    <div className="flex items-center justify-between mb-6">
                        <button
                            onClick={handleBackToHome}
                            className="text-gray-600 hover:text-orange-600 transition-colors flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Volver
                        </button>
                        <Link href="/" className="flex items-center gap-2">
                            <img src="/bolao-logo.png" alt="BOLAO" className="w-8 h-8" />
                            <span className="font-bold text-orange-600">BOLAO</span>
                        </Link>
                    </div>
                    <h1 className="text-2xl font-bold mb-6 text-center text-orange-600">Acceso para Negocios</h1>
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Correo electrónico</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Contraseña</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                                required
                            />
                        </div>
                        {message && <div className={message === 'Login exitoso' ? 'text-green-600 text-sm' : 'text-red-600 text-sm'}>{message}</div>}
                        <button
                            type="submit"
                            className="w-full py-2 px-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-md transition-colors"
                            disabled={loading}
                        >
                            {loading ? 'Ingresando...' : 'Ingresar'}
                        </button>
                    </form>
                    <div className="mt-4 text-center">
                        <Link href="/backoffice/register" className="text-orange-500 hover:underline text-sm">
                            ¿No tienes cuenta? Regístrate aquí
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
