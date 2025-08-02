import { ArrowLeft, Clock, Facebook, Globe, Instagram, Mail, MapPin, Phone, ShoppingBag, Star, Truck } from 'lucide-react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Map from '../../components/Map';
import { useProducts } from '../../contexts/ProductContext';
import { logContactAction, logProductView, logSocialClick } from '../../utils/analytics';
import ReviewsList from '../../components/reviews/ReviewsList';
import ReviewForm from '../../components/reviews/ReviewForm';

export default function PlaceDetail() {
    const router = useRouter();
    const { id } = router.query;
    const [place, setPlace] = useState(null);
    const [placeProducts, setPlaceProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const { lastSearch } = useProducts();

    useEffect(() => {
        if (id) {
            fetchPlaceDetails();
        }
    }, [id]);

    const fetchPlaceDetails = async () => {
        try {
            setLoading(true);
            console.log('🔍 Fetching place details for ID:', id);

            const response = await fetch(`/api/places/${id}`);
            if (response.ok) {
                const placeData = await response.json();
                console.log('✅ Place details loaded:', placeData.name);
                setPlace(placeData);
                
                // Log place view analytics
                logProductView(placeData.id, placeData.name);

                // Also fetch products for this place
                if (placeData.name) {
                    fetchPlaceProducts(placeData.name);
                }
            } else {
                console.error('❌ Failed to fetch place details:', response.status);
                // Redirect to home if place not found
                router.push('/');
            }
        } catch (error) {
            console.error('💥 Error fetching place details:', error);
            router.push('/');
        } finally {
            setLoading(false);
        }
    };

    const fetchPlaceProducts = async (placeName) => {
        try {
            setLoadingProducts(true);
            const response = await fetch(`/api/places/products?placeName=${encodeURIComponent(placeName)}`);
            if (response.ok) {
                const data = await response.json();
                setPlaceProducts(data.products || []);
                console.log('Loaded products for place:', placeName, '- Count:', data.products?.length || 0);
            } else {
                console.error('Failed to fetch place products:', response.status);
            }
        } catch (error) {
            console.error('Error fetching place products:', error);
        } finally {
            setLoadingProducts(false);
        }
    };

    const getBackUrl = () => {
        // Return to home and clear search by adding a reset parameter
        return '/?reset=true';
    };

    const formatPrice = (price) => {
        return typeof price === 'number' ? `$${price.toFixed(2)}` : `$${price}`;
    };

    const formatType = (type) => {
        if (!type) return 'Establecimiento';

        const typeMap = {
            'restaurantes': 'Restaurante',
            'dulcerias': 'Dulcería',
            'panaderias': 'Panadería',
            'heladerias': 'Heladería',
            'cafes': 'Café',
            'cafeterias': 'Cafetería',
            'pizzerias': 'Pizzería',
            'bares': 'Bar'
        };

        return typeMap[type.toLowerCase()] || type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
    };

    const handleEmail = (email) => {
        if (email) {
            logContactAction('email', place?.name);
            window.location.href = `mailto:${email}`;
        }
    };

    const handleWhatsApp = (phone) => {
        if (phone) {
            logContactAction('whatsapp', place?.name);
            const cleanPhone = phone.replace(/[^\d]/g, '');
            window.open(`https://wa.me/${cleanPhone}`, '_blank');
        }
    };

    const getScoreColor = (score) => {
        if (score > 0.8) return 'bg-green-500';
        if (score > 0.6) return 'bg-yellow-500';
        return 'bg-gray-400';
    };

    const handleCall = (phone) => {
        if (phone && phone !== '0') {
            // Log contact action
            logContactAction('phone_call', place?.name);
            window.open(`tel:${phone}`, '_self');
        }
    };

    const handleWebsite = (website) => {
        if (website) {
            // Log contact action
            logContactAction('website_visit', place?.name);
            const url = website.startsWith('http') ? website : `https://${website}`;
            window.open(url, '_blank');
        }
    };

    const handleSocialMedia = (platform, handle) => {
        if (handle) {
            // Log social media interaction
            logSocialClick(platform, place?.name);

            let url = '';
            const cleanHandle = handle.replace('@', '');

            switch (platform) {
                case 'instagram':
                    url = `https://instagram.com/${cleanHandle}`;
                    break;
                case 'facebook':
                    url = handle.includes('facebook.com')
                        ? handle
                        : `https://facebook.com/${cleanHandle}`;
                    break;
                case 'telegram':
                    url = handle.includes('t.me')
                        ? handle
                        : `https://t.me/${cleanHandle}`;
                    break;
                case 'youtube':
                    url = handle.includes('youtube.com')
                        ? handle
                        : `https://youtube.com/${cleanHandle}`;
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
                    <p className="mt-4 text-gray-600">Cargando lugar...</p>
                </div>
            </div>
        );
    }

    if (!place) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Lugar no encontrado</h1>
                    <p className="text-gray-600 mb-6">El lugar que buscas no está disponible</p>
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
                <title>{place.name} - {formatType(place.type)} | BOLAO</title>
                <meta name="description" content={`${place.name} - ${formatType(place.type)} en ${place.address || place.location}`} />
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
                                    <span>{lastSearch.query ? 'Volver a resultados' : 'Volver'}</span>
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
                <div className="max-w-4xl mx-auto px-4 py-8">
                    {/* Place Header */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <div className="flex flex-col lg:flex-row gap-6">
                            {/* Left side - Place Info */}
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                                        {formatType(place.type)}
                                    </span>
                                    {place.score && (
                                        <div className={`flex items-center space-x-1 ${getScoreColor(place.score)} text-white px-2 py-1 rounded-full text-sm font-semibold`}>
                                            <Star className="w-4 h-4" />
                                            <span>{(place.score * 100).toFixed(0)}%</span>
                                        </div>
                                    )}
                                </div>

                                <h1 className="text-3xl font-bold text-gray-900 mb-4">{place.name}</h1>

                                {/* Contact Info */}
                                <div className="space-y-3 mb-6">
                                    {place.address && (
                                        <div className="flex items-start gap-3">
                                            <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                                            <div>
                                                <p className="text-gray-900">{place.address}</p>
                                                {place.location && place.location !== place.address && (
                                                    <p className="text-gray-600">{place.location}</p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {place.phone && place.phone !== '0' && (
                                        <div className="flex items-center gap-3">
                                            <Phone className="w-5 h-5 text-gray-500" />
                                            <button
                                                onClick={() => handleCall(place.phone)}
                                                className="text-orange-600 hover:text-orange-700 font-medium"
                                            >
                                                {place.phone}
                                            </button>
                                        </div>
                                    )}

                                    {place.phone2 && place.phone2 !== '0' && place.phone2 !== place.phone && (
                                        <div className="flex items-center gap-3">
                                            <Phone className="w-5 h-5 text-gray-500" />
                                            <button
                                                onClick={() => handleCall(place.phone2)}
                                                className="text-orange-600 hover:text-orange-700 font-medium"
                                            >
                                                {place.phone2} <span className="text-gray-500 text-sm">(2)</span>
                                            </button>
                                        </div>
                                    )}

                                    {place.web && (
                                        <div className="flex items-center gap-3">
                                            <Globe className="w-5 h-5 text-gray-500" />
                                            <button
                                                onClick={() => handleWebsite(place.web)}
                                                className="text-orange-600 hover:text-orange-700 font-medium truncate"
                                            >
                                                {place.web}
                                            </button>
                                        </div>
                                    )}

                                    {place.web2 && place.web2 !== place.web && (
                                        <div className="flex items-center gap-3">
                                            <Globe className="w-5 h-5 text-gray-500" />
                                            <button
                                                onClick={() => handleWebsite(place.web2)}
                                                className="text-orange-600 hover:text-orange-700 font-medium truncate"
                                            >
                                                {place.web2} <span className="text-gray-500 text-sm">(2)</span>
                                            </button>
                                        </div>
                                    )}

                                    {place.email && (
                                        <div className="flex items-center gap-3">
                                            <Mail className="w-5 h-5 text-gray-500" />
                                            <button
                                                onClick={() => handleEmail(place.email)}
                                                className="text-orange-600 hover:text-orange-700 font-medium"
                                            >
                                                {place.email}
                                            </button>
                                        </div>
                                    )}

                                    {place.hours && (
                                        <div className="flex items-start gap-3">
                                            <Clock className="w-5 h-5 text-gray-500 mt-0.5" />
                                            <div>
                                                <p className="text-gray-900 font-medium">Horarios</p>
                                                <p className="text-gray-600">{place.hours}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    {place.phone && place.phone !== '0' && (
                                        <button
                                            onClick={() => handleCall(place.phone)}
                                            className="flex items-center justify-center space-x-2 bg-green-500 text-white px-4 py-3 rounded-md hover:bg-green-600 transition"
                                        >
                                            <Phone className="w-5 h-5" />
                                            <span>Llamar</span>
                                        </button>
                                    )}

                                    {place.phone && place.phone !== '0' && (
                                        <button
                                            onClick={() => handleWhatsApp(place.phone)}
                                            className="flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-3 rounded-md hover:bg-green-700 transition"
                                        >
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.306" />
                                            </svg>
                                            <span>WhatsApp</span>
                                        </button>
                                    )}
                                </div>

                                {/* Social Media Links */}
                                {(place.instagram || place.facebook || place.telegram || place.youtube) && (
                                    <div className="flex flex-wrap gap-3">
                                        {place.instagram && (
                                            <button
                                                onClick={() => handleSocialMedia('instagram', place.instagram)}
                                                className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-md hover:from-purple-600 hover:to-pink-600 transition"
                                            >
                                                <Instagram className="w-5 h-5" />
                                                <span>Instagram</span>
                                            </button>
                                        )}

                                        {place.facebook && (
                                            <button
                                                onClick={() => handleSocialMedia('facebook', place.facebook)}
                                                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                                            >
                                                <Facebook className="w-5 h-5" />
                                                <span>Facebook</span>
                                            </button>
                                        )}

                                        {place.telegram && (
                                            <button
                                                onClick={() => handleSocialMedia('telegram', place.telegram)}
                                                className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
                                            >
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                                                </svg>
                                                <span>Telegram</span>
                                            </button>
                                        )}

                                        {place.youtube && (
                                            <button
                                                onClick={() => handleSocialMedia('youtube', place.youtube)}
                                                className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
                                            >
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                                </svg>
                                                <span>YouTube</span>
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Right side - Map */}
                            {(place.geo || (place.lat && place.lng)) && (
                                <div className="lg:w-1/2">
                                    <div className="h-64 lg:h-full min-h-[300px] rounded-lg overflow-hidden">
                                        <Map
                                            products={[{
                                                id: place.id,
                                                name: place.name,
                                                address: place.address,
                                                geo: place.geo || [place.lat, place.lng]
                                            }]}
                                            selectedProduct={null}
                                            height="h-full"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Menu / Products */}
                    {loadingProducts ? (
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="text-center py-8">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                                <p className="mt-4 text-gray-600">Cargando productos...</p>
                            </div>
                        </div>
                    ) : placeProducts && placeProducts.length > 0 && (
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                                <ShoppingBag className="w-6 h-6 mr-2 text-orange-500" />
                                Menú / Productos
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {placeProducts.map((menuProduct) => (
                                    <div key={menuProduct.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                        {menuProduct.logo && (
                                            <img
                                                src={menuProduct.logo}
                                                alt={menuProduct.product_name}
                                                className="w-full h-32 object-cover rounded-lg mb-3"
                                            />
                                        )}
                                        <h4 className="font-semibold text-gray-900 mb-2">
                                            {menuProduct.product_name}
                                        </h4>
                                        {menuProduct.description && (
                                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                                {menuProduct.description}
                                            </p>
                                        )}
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-bold text-orange-500">
                                                {formatPrice(menuProduct.product_price)}
                                            </span>
                                            {menuProduct.score && (
                                                <div className={`flex items-center space-x-1 ${getScoreColor(menuProduct.score)} text-white px-2 py-1 rounded-full text-xs font-semibold`}>
                                                    <Star className="w-3 h-3" />
                                                    <span>{(menuProduct.score * 100).toFixed(0)}%</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Reseñas */}
                    <div className="space-y-8">
                        <ReviewsList 
                            placeId={place.id}
                            className="bg-white rounded-lg shadow-md p-6"
                        />
                        
                        <ReviewForm 
                            placeId={place.id}
                            placeName={place.name}
                            onReviewSubmitted={(newReview) => {
                                // Opcional: Actualizar la lista de reseñas
                                console.log('Nueva reseña:', newReview);
                            }}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}