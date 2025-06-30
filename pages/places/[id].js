import { ArrowLeft, Clock, Globe, Mail, MapPin, Phone, Star, User } from 'lucide-react';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

// Dynamically import Map component to avoid SSR issues
const Map = dynamic(() => import('../../components/Map'), { ssr: false });

export default function PlaceDetail() {
    const router = useRouter();
    const { id } = router.query;
    const [place, setPlace] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (id) {
            fetchPlaceDetails();
        }
    }, [id]);

    const fetchPlaceDetails = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/places/${id}`);

            if (!response.ok) {
                throw new Error('Place not found');
            }

            const data = await response.json();
            setPlace(data);

            // After getting place details, fetch the menu/products
            if (data.name) {
                fetchPlaceProducts(data.name);
            }
        } catch (error) {
            console.error('Error fetching place details:', error);
            setError(error.message);
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
                setProducts(data.products || []);
                console.log(`Found ${data.products?.length || 0} products for ${placeName}`);
            } else {
                console.warn('No products found for place:', placeName);
                setProducts([]);
            }
        } catch (error) {
            console.error('Error fetching place products:', error);
            setProducts([]);
        } finally {
            setLoadingProducts(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
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

    const handleCall = (phone) => {
        window.location.href = `tel:${phone}`;
    };

    const handleWebsite = (website) => {
        const url = website.startsWith('http') ? website : `https://${website}`;
        window.open(url, '_blank');
    };

    const handleEmail = (email) => {
        window.location.href = `mailto:${email}`;
    };

    const formatPrice = (product) => {
        // Check different price fields and return formatted price
        if (product.product_price) {
            return `$${product.product_price}`;
        }
        if (product.price) {
            return `$${product.price}`;
        }
        if (product.price_range_min && product.price_range_max) {
            return `$${product.price_range_min} - $${product.price_range_max}`;
        }
        if (product.price_range_min) {
            return `Desde $${product.price_range_min}`;
        }
        return 'Consultar precio';
    };

    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        for (let i = 0; i < fullStars; i++) {
            stars.push(
                <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            );
        }

        if (hasHalfStar) {
            stars.push(
                <div key="half" className="relative">
                    <Star className="w-5 h-5 text-gray-300" />
                    <div className="absolute inset-0 overflow-hidden w-1/2">
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    </div>
                </div>
            );
        }

        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars.push(
                <Star key={`empty-${i}`} className="w-5 h-5 text-gray-300" />
            );
        }

        return stars;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando detalles del lugar...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={() => router.push('/?reset=true')}
                        className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600"
                    >
                        Volver
                    </button>
                </div>
            </div>
        );
    }

    if (!place) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600 mb-4">Lugar no encontrado</p>
                    <button
                        onClick={() => router.push('/?reset=true')}
                        className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600"
                    >
                        Volver
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <Head>
                <title>{place.name} - BOLAO</title>
                <meta name="description" content={place.description || `Detalles de ${place.name}`} />
            </Head>

            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white shadow-sm border-b">
                    <div className="max-w-4xl mx-auto px-4 py-4 flex items-center">
                        <button
                            onClick={() => router.push('/?reset=true')}
                            className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <ArrowLeft className="w-6 h-6 text-gray-600" />
                        </button>
                        <h1 className="text-2xl font-bold text-gray-900">{place.name}</h1>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto px-4 py-8">
                    {/* Main Info Card */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <div className="flex flex-col lg:flex-row gap-6">
                            {/* Left side - Info */}
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                                        {formatType(place.type)}
                                    </span>
                                </div>

                                <h2 className="text-3xl font-bold text-gray-900 mb-4">{place.name}</h2>

                                {/* Rating */}
                                {place.average_rating && (
                                    <div className="flex items-center gap-2 mb-6">
                                        <div className="flex items-center">
                                            {renderStars(place.average_rating)}
                                        </div>
                                        <span className="text-lg font-semibold text-gray-900">
                                            {place.average_rating.toFixed(1)}
                                        </span>
                                        <span className="text-gray-600">
                                            ({place.total_reviews} reseñas)
                                        </span>
                                    </div>
                                )}

                                {/* Contact Info */}
                                <div className="space-y-3">
                                    {place.address && (
                                        <div className="flex items-start gap-3">
                                            <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                                            <div>
                                                <p className="text-gray-900">{place.address}</p>
                                                <p className="text-gray-600">{place.location}</p>
                                            </div>
                                        </div>
                                    )}

                                    {place.phone && (
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

                                    {place.website && (
                                        <div className="flex items-center gap-3">
                                            <Globe className="w-5 h-5 text-gray-500" />
                                            <button
                                                onClick={() => handleWebsite(place.website)}
                                                className="text-orange-600 hover:text-orange-700 font-medium"
                                            >
                                                {place.website}
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
                                </div>
                            </div>

                            {/* Right side - Map */}
                            {(place.lat && place.lng) && (
                                <div className="lg:w-1/2">
                                    <div className="h-64 lg:h-full min-h-[300px] rounded-lg overflow-hidden">
                                        <Map
                                            products={[{
                                                id: place.id,
                                                name: place.name,
                                                address: place.address,
                                                geo: [place.lat, place.lng]
                                            }]}
                                            selectedProduct={null}
                                            height="h-full"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Reviews Section */}
                    {place.recent_reviews && place.recent_reviews.length > 0 && (
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">
                                Reseñas Recientes
                            </h3>
                            <div className="space-y-6">
                                {place.recent_reviews.map((review) => (
                                    <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                                                <User className="w-6 h-6 text-orange-600" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900">
                                                            {review.profiles?.full_name || review.profiles?.username || 'Usuario'}
                                                        </h4>
                                                        <div className="flex items-center gap-1">
                                                            {renderStars(review.rating)}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-gray-500 text-sm">
                                                        <Clock className="w-4 h-4" />
                                                        {formatDate(review.created_at)}
                                                    </div>
                                                </div>
                                                {review.comment && (
                                                    <p className="text-gray-700 leading-relaxed">
                                                        {review.comment}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {place.total_reviews > place.recent_reviews.length && (
                                <div className="mt-6 text-center">
                                    <p className="text-gray-600">
                                        Mostrando {place.recent_reviews.length} de {place.total_reviews} reseñas
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Menu/Products Section */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                            <span className="mr-2">🍽️</span>
                            Menú / Productos
                        </h3>

                        {loadingProducts ? (
                            <div className="text-center py-8">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mb-4"></div>
                                <p className="text-gray-600">Cargando menú...</p>
                            </div>
                        ) : products.length > 0 ? (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {products.map((product, index) => (
                                    <div key={product.id || index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                        {/* Product Image */}
                                        {product.logo && (
                                            <img
                                                src={product.logo}
                                                alt={product.product_name}
                                                className="w-full h-32 object-cover rounded-md mb-3"
                                            />
                                        )}

                                        {/* Product Info */}
                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-1">
                                                {product.product_name}
                                            </h4>

                                            {product.description && (
                                                <p className="text-gray-600 text-sm mb-2 overflow-hidden" style={{
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical'
                                                }}>
                                                    {product.description}
                                                </p>
                                            )}

                                            <div className="flex items-center justify-between">
                                                <span className="text-lg font-bold text-orange-600">
                                                    {formatPrice(product)}
                                                </span>

                                                {/* Delivery/Pickup indicators */}
                                                <div className="flex gap-1">
                                                    {product.delivery && (
                                                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                                                            🚚 Delivery
                                                        </span>
                                                    )}
                                                    {product.pickup && (
                                                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                                                            🏪 Pickup
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Product Type */}
                                            {product.type && (
                                                <span className="inline-block mt-2 bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                                                    {product.type}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <div className="text-gray-400 mb-4">
                                    <span className="text-4xl">🍽️</span>
                                </div>
                                <p className="text-gray-600 mb-2">No hay productos disponibles</p>
                                <p className="text-gray-500 text-sm">
                                    El menú de este lugar no está disponible en este momento.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
