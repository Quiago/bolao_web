import { ArrowLeft, Facebook, Globe, Instagram, MapPin, Phone, ShoppingBag, Star, Truck } from 'lucide-react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Map from '../../components/Map';
import { logProductView, logContactAction, logSocialClick } from '../../utils/analytics';

export default function ProductDetail() {
    const router = useRouter();
    const { id, search, filters } = router.query;
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (id) {
            fetchProductDetails();
        }
    }, [id]);

    const getBackUrl = () => {
        if (search) {
            const searchParams = new URLSearchParams();
            searchParams.set('q', search);
            if (filters) {
                try {
                    const parsedFilters = JSON.parse(filters);
                    if (parsedFilters.location) searchParams.set('location', parsedFilters.location);
                    if (parsedFilters.type) searchParams.set('type', parsedFilters.type);
                } catch (e) {
                    // Si hay error parsing filters, solo usar search
                }
            }
            return `/?${searchParams.toString()}`;
        }
        return '/';
    };

    const fetchProductDetails = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/product/${id}`);

            if (!response.ok) {
                throw new Error('Producto no encontrado');
            }

            const data = await response.json();
            setProduct(data);

            // Log product view analytics
            logProductView(data.id, data.product_name || data.name);
        } catch (error) {
            console.error('Error fetching product:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price) => {
        return typeof price === 'number' ? `$${price.toFixed(2)}` : `$${price}`;
    };

    const getScoreColor = (score) => {
        if (score > 0.8) return 'bg-green-500';
        if (score > 0.6) return 'bg-yellow-500';
        return 'bg-gray-400';
    };

    const handleCall = (phone) => {
        if (phone) {
            // Log contact action
            logContactAction('phone_call', product?.product_name || product?.name);
            window.open(`tel:${phone}`, '_self');
        }
    };

    const handleWebsite = (website) => {
        if (website) {
            // Log contact action
            logContactAction('website_visit', product?.product_name || product?.name);
            const url = website.startsWith('http') ? website : `https://${website}`;
            window.open(url, '_blank');
        }
    };

    const handleSocialMedia = (platform, handle) => {
        if (handle) {
            // Log social media interaction
            logSocialClick(platform, product?.product_name || product?.name);
            
            let url = '';
            const cleanHandle = handle.replace('@', '');

            switch (platform) {
                case 'instagram':
                    url = `https://instagram.com/${cleanHandle}`;
                    break;
                case 'facebook':
                    url = `https://facebook.com/${cleanHandle}`;
                    break;
                default:
                    return;
            }

            window.open(url, '_blank');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                    <p className="mt-4 text-gray-600">Cargando producto...</p>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Producto no encontrado</h1>
                    <p className="text-gray-600 mb-6">{error || 'El producto que buscas no existe'}</p>
                    <Link href="/" className="bg-orange-500 text-white px-6 py-3 rounded-md hover:bg-orange-600 transition">
                        Volver al inicio
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <>
            <Head>
                <title>{product.product_name} - {product.name} | BOLAO</title>
                <meta name="description" content={`${product.product_name} en ${product.name}. ${formatPrice(product.product_price)} - ${product.location}`} />
                <link rel="icon" href="/bolao-logo.png" />
            </Head>

            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <header className="bg-white shadow-sm border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            <div className="flex items-center space-x-4">
                                <Link
                                    href={getBackUrl()}
                                    className="flex items-center space-x-2 text-gray-600 hover:text-orange-500 transition"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                    <span>{search ? 'Volver a resultados' : 'Volver'}</span>
                                </Link>
                                <div className="h-6 w-px bg-gray-300"></div>
                                <Link href="/" className="flex items-center space-x-3">
                                    <img
                                        src="/bolao-logo.png"
                                        alt="BOLAO Logo"
                                        className="w-8 h-8"
                                    />
                                    <span className="text-xl font-bold text-gray-900">BOLAO</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                        {/* Product Header */}
                        <div className="relative">
                            {product.logo && (
                                <img
                                    src={product.logo}
                                    alt={product.name}
                                    className="w-full h-64 object-cover"
                                />
                            )}
                            <div className="absolute top-4 right-4 bg-white rounded-full px-3 py-1 shadow-md">
                                <div className={`flex items-center space-x-1 ${getScoreColor(product.score)} text-white px-2 py-1 rounded-full text-sm font-semibold`}>
                                    <Star className="w-4 h-4" />
                                    <span>{(product.score * 100).toFixed(0)}%</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-8">
                            <div className="grid lg:grid-cols-2 gap-8">
                                {/* Product Information */}
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                        {product.product_name}
                                    </h1>
                                    <h2 className="text-xl text-gray-600 mb-4">{product.name}</h2>

                                    <div className="text-4xl font-bold text-orange-500 mb-6">
                                        {formatPrice(product.product_price)}
                                    </div>

                                    {/* Location */}
                                    <div className="flex items-start space-x-3 mb-6">
                                        <MapPin className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                                        <div>
                                            <p className="text-gray-900 font-medium">{product.location}</p>
                                            {product.address && (
                                                <p className="text-gray-600 text-sm">{product.address}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Services */}
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        {product.delivery && (
                                            <div className="flex items-center space-x-2 text-green-600">
                                                <Truck className="w-5 h-5" />
                                                <span className="text-sm font-medium">Delivery disponible</span>
                                            </div>
                                        )}
                                        {product.pickup && (
                                            <div className="flex items-center space-x-2 text-blue-600">
                                                <ShoppingBag className="w-5 h-5" />
                                                <span className="text-sm font-medium">Pickup disponible</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Contact Actions */}
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        {product.phone && (
                                            <button
                                                onClick={() => handleCall(product.phone)}
                                                className="flex items-center justify-center space-x-2 bg-green-500 text-white px-4 py-3 rounded-md hover:bg-green-600 transition"
                                            >
                                                <Phone className="w-5 h-5" />
                                                <span>Llamar</span>
                                            </button>
                                        )}

                                        {product.website && (
                                            <button
                                                onClick={() => handleWebsite(product.website)}
                                                className="flex items-center justify-center space-x-2 bg-blue-500 text-white px-4 py-3 rounded-md hover:bg-blue-600 transition"
                                            >
                                                <Globe className="w-5 h-5" />
                                                <span>Sitio web</span>
                                            </button>
                                        )}
                                    </div>

                                    {/* Social Media */}
                                    <div className="flex space-x-4">
                                        {product.instagram && (
                                            <button
                                                onClick={() => handleSocialMedia('instagram', product.instagram)}
                                                className="flex items-center space-x-2 text-pink-500 hover:text-pink-600 transition"
                                            >
                                                <Instagram className="w-6 h-6" />
                                                <span className="text-sm">Instagram</span>
                                            </button>
                                        )}

                                        {product.facebook && (
                                            <button
                                                onClick={() => handleSocialMedia('facebook', product.facebook)}
                                                className="flex items-center space-x-2 text-blue-500 hover:text-blue-600 transition"
                                            >
                                                <Facebook className="w-6 h-6" />
                                                <span className="text-sm">Facebook</span>
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Map */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Ubicación</h3>
                                    <Map products={[product]} selectedProduct={product} />

                                    {/* Contact Info */}
                                    <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                                        <h4 className="font-semibold text-gray-900 mb-3">Información de contacto</h4>
                                        <div className="space-y-2 text-sm">
                                            {product.phone && (
                                                <div className="flex items-center space-x-2">
                                                    <Phone className="w-4 h-4 text-gray-400" />
                                                    <span>{product.phone}</span>
                                                </div>
                                            )}
                                            {product.email && (
                                                <div className="flex items-center space-x-2">
                                                    <span className="w-4 h-4 text-gray-400">✉</span>
                                                    <span>{product.email}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center space-x-2">
                                                <span className="w-4 h-4 text-gray-400">🏷</span>
                                                <span className="capitalize">{product.type}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
