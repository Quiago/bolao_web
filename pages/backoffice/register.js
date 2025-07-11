import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import ReactCountryFlag from 'react-country-flag';
import { getSupabaseClient } from '../../utils/supabaseClient';

export default function BusinessRegister() {
    const phoneCodes = [
        { code: '+53', countryCode: 'CU', name: 'Cuba', length: 8 },
        { code: '+1', countryCode: 'US', name: 'Estados Unidos', length: 10 },
        { code: '+34', countryCode: 'ES', name: 'España', length: 9 },
        { code: '+598', countryCode: 'UY', name: 'Uruguay', length: 8 },
        { code: '+52', countryCode: 'MX', name: 'México', length: 10 },
    ];
    const [form, setForm] = useState({
        businessName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phoneCode: '+53',
        phone: '',
        website: '',
        description: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // Manejar navegación hacia atrás
    useEffect(() => {
        const handlePopState = (event) => {
            // Si el usuario presiona atrás desde el registro, redirigir a la página principal
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

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError('');
    };

    const validate = () => {
        if (!form.businessName.trim()) return 'El nombre del negocio es obligatorio.';
        if (!form.email.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) return 'Email inválido.';
        if (form.password.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
        if (!/[A-Z]/.test(form.password) || !/[a-z]/.test(form.password) || !/[0-9]/.test(form.password)) return 'La contraseña debe tener mayúsculas, minúsculas y números.';
        if (form.password !== form.confirmPassword) return 'Las contraseñas no coinciden.';
        if (form.phone) {
            const selected = phoneCodes.find(p => p.code === form.phoneCode);
            if (!selected) return 'Selecciona un código de país válido.';
            if (!/^\d+$/.test(form.phone)) return 'El número de teléfono solo debe contener dígitos.';
            if (form.phone.length !== selected.length) return `El número debe tener exactamente ${selected.length} dígitos para ${selected.name}.`;
        }
        return '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        const validation = validate();
        if (validation) {
            setError(validation);
            return;
        }
        setLoading(true);
        const phone = form.phone ? `${form.phoneCode} ${form.phone}` : '';
        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: form.email,
                    password: form.password,
                    phone,
                    website: form.website,
                    description: form.description
                })
            });
            const result = await response.json();
            if (!response.ok) {
                setError(result.error || 'Error al registrar la cuenta.');
                setLoading(false);
                return;
            }
            setSuccess('¡Cuenta creada exitosamente!');
            if (result.token) {
                sessionStorage.setItem('token', result.token);
            }
            setForm({
                businessName: '',
                email: '',
                password: '',
                confirmPassword: '',
                phoneCode: '+53',
                phone: '',
                website: '',
                description: '',
            });
            // Redirigir al panel de administración después del registro exitoso
            router.push('/backoffice/admin');
        } catch (err) {
            setError('Error inesperado al registrar la cuenta.');
        } finally {
            setLoading(false);
        }
        setTimeout(() => {
            setSuccess('¡Cuenta creada exitosamente! Revisa tu correo para confirmar tu cuenta.');
            setLoading(false);
        }, 1500);
    };

    return (
        <>
            <Head>
                <title>Registro de Negocio | BOLAO</title>
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
                    <h1 className="text-2xl font-bold mb-6 text-center text-orange-600">Registro para Negocios</h1>
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">Nombre del Negocio *</label>
                            <input
                                type="text"
                                id="businessName"
                                name="businessName"
                                value={form.businessName}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Correo electrónico *</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Teléfono</label>
                            <div className="flex space-x-2">
                                <select
                                    id="phoneCode"
                                    name="phoneCode"
                                    value={form.phoneCode}
                                    onChange={handleChange}
                                    className="px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 bg-white min-w-[110px]"
                                >
                                    {phoneCodes.map(opt => (
                                        <option key={opt.code} value={opt.code}>
                                            {opt.code} {opt.name}
                                        </option>
                                    ))}
                                </select>
                                <span className="ml-1 flex items-center">
                                    <ReactCountryFlag
                                        countryCode={phoneCodes.find(p => p.code === form.phoneCode)?.countryCode || ''}
                                        svg
                                        style={{ width: '1.6em', height: '1.6em', verticalAlign: 'middle' }}
                                        title={phoneCodes.find(p => p.code === form.phoneCode)?.name || ''}
                                    />
                                </span>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={form.phone}
                                    onChange={handleChange}
                                    maxLength={phoneCodes.find(p => p.code === form.phoneCode)?.length || 12}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                                />
                            </div>
                            {form.phone && form.phone.length > 0 && (
                                <div className="text-xs text-gray-500 mt-1">
                                    {`Formato esperado: ${phoneCodes.find(p => p.code === form.phoneCode)?.length || ''} dígitos`}
                                </div>
                            )}
                        </div>
                        <div>
                            <label htmlFor="website" className="block text-sm font-medium text-gray-700">Sitio Web</label>
                            <input
                                type="text"
                                id="website"
                                name="website"
                                value={form.website}
                                onChange={handleChange}
                                pattern="^([a-zA-Z0-9\-]+\.)+[a-zA-Z]{2,}$"
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descripción del Negocio</label>
                            <textarea
                                id="description"
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                                rows={2}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Contraseña *</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirmar Contraseña *</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={form.confirmPassword}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                                required
                            />
                        </div>
                        {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
                        {success && <div className="text-green-600 text-sm mt-2">{success}</div>}
                        <button
                            type="submit"
                            className="w-full py-2 px-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-md transition-colors"
                            disabled={loading}
                        >
                            {loading ? 'Registrando...' : 'Crear Cuenta'}
                        </button>
                    </form>
                    <div className="mt-4 text-center">
                        <Link href="/backoffice/login" className="text-orange-500 hover:underline text-sm">
                            ¿Ya tienes cuenta? Inicia sesión aquí
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
