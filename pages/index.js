import { ChevronRight, Eye, Filter, Mail, MapIcon, MapPin, MessageSquare, Phone, Search, Store, X } from 'lucide-react';
import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import ChatPanel from '../components/ChatPanel';
import { useProducts } from '../contexts/ProductContext';
import { logFilterUse, logSearch } from '../utils/analytics';

export default function Home() {
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        location: '',
        type: ''
    });
    const [locations, setLocations] = useState([]);
    const [types, setTypes] = useState([]);
    const [showFilters, setShowFilters] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [showContact, setShowContact] = useState(false);
    const [searchMode, setSearchMode] = useState('productos'); // 'productos' or 'lugares'

    // Usar el contexto
    const { setSearchResults, setLastSearch } = useProducts();

    useEffect(() => {
        loadFilterOptions();

        // Verificar si hay parámetros de búsqueda en la URL
        const urlParams = new URLSearchParams(window.location.search);
        const queryParam = urlParams.get('q');
        const locationParam = urlParams.get('location');
        const typeParam = urlParams.get('type');
        const resetParam = urlParams.get('reset');

        // If reset parameter is present, clear search and remove it from URL
        if (resetParam === 'true') {
            setSearchQuery('');
            setResults([]);
            setHasSearched(false);
            setFilters({ location: '', type: '' });

            // Clean URL by removing the reset parameter
            const newUrl = window.location.pathname;
            window.history.replaceState({}, '', newUrl);
            return;
        }

        if (queryParam) {
            setSearchQuery(queryParam);
            setFilters({
                location: locationParam || '',
                type: typeParam || ''
            });

            // Ejecutar búsqueda automáticamente
            performSearch(queryParam, {
                location: locationParam || '',
                type: typeParam || ''
            });
            setHasSearched(true);
        }
    }, []);

    // Handle keyboard events for contact modal
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape' && showContact) {
                setShowContact(false);
            }
        };

        if (showContact) {
            document.addEventListener('keydown', handleKeyDown);
            // Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [showContact]);

    // Handle search mode changes - clear search and reset state
    useEffect(() => {
        // Clear search when mode changes
        setSearchQuery('');
        setResults([]);
        setHasSearched(false);

        // Reload filters for the new mode
        loadFilterOptions(searchMode);
    }, [searchMode]);

    const loadFilterOptions = async (mode = searchMode) => {
        try {
            const response = await fetch(`/api/filters?mode=${mode}`);
            const data = await response.json();
            setLocations(data.locations || []);
            setTypes(data.types || []);
        } catch (error) {
            console.error('Error loading filters:', error);
        }
    };

    const performSearch = async (query = searchQuery, searchFilters = filters, mode = searchMode) => {
        if (!query.trim()) return;

        setLoading(true);
        try {
            let response, data, items;

            if (mode === 'lugares') {
                // Search places using Supabase
                const params = new URLSearchParams({
                    query: query,
                    ...(searchFilters.location && { location: searchFilters.location }),
                    ...(searchFilters.type && { type: searchFilters.type })
                });

                response = await fetch(`/api/places/search?${params}`);
                data = await response.json();
                items = data.places || [];

                // Normalize places data to match product structure for display
                const normalizedPlaces = items.map(place => ({
                    id: place.id,
                    name: place.name,
                    product_name: place.name, // For consistency with product structure
                    location: place.address,
                    logo: place.logo,
                    phone: place.phone,
                    phone2: place.phone2,
                    web: place.web,
                    web2: place.web2,
                    email: place.email,
                    telegram: place.telegram,
                    facebook: place.facebook,
                    instagram: place.instagram,
                    youtube: place.youtube,
                    type: place.type,
                    score: place.score || 0.5,
                    geo: place.geo,
                    delivery: false, // Places don't have delivery/pickup
                    pickup: false,
                    product_price: 'N/A' // Places don't have prices
                }));

                setResults(normalizedPlaces);
                setSearchResults(normalizedPlaces);
            } else {
                // Search products using existing API
                const params = new URLSearchParams({
                    query: query,
                    ...(searchFilters.location && { location: searchFilters.location }),
                    ...(searchFilters.type && { type: searchFilters.type })
                });

                response = await fetch(`/api/search?${params}`);
                data = await response.json();
                const products = data.products || [];

                // Normalizar los datos antes de guardarlos
                const normalizedProducts = products.map(product => ({
                    ...product,
                    // Asegurar que delivery y pickup son booleanos
                    delivery: product.delivery === true || product.delivery === 'True',
                    pickup: product.pickup === true || product.pickup === 'True',
                    // Asegurar que el precio es un número
                    product_price: typeof product.product_price === 'number'
                        ? product.product_price
                        : parseFloat(product.product_price) || product.product_price,
                    // IMPORTANTE: NO parsear geo, dejarlo como viene de la API
                    geo: product.geo
                }));

                setResults(normalizedProducts);
                setSearchResults(normalizedProducts);
            }

            // Guardar en el contexto
            setLastSearch({
                query: query,
                filters: searchFilters,
                mode: mode
            });

            // Log search analytics
            logSearch(query, items.length || data.products?.length || 0);

            // Log filter usage if filters are applied
            if (searchFilters.location) {
                logFilterUse('location', searchFilters.location);
            }
            if (searchFilters.type) {
                logFilterUse('type', searchFilters.type);
            }
        } catch (error) {
            console.error('Error searching:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        setHasSearched(true);
        await performSearch();
    };

    const handleShowAll = async () => {
        if (searchMode !== 'lugares') return; // Only for places mode

        setLoading(true);
        try {
            const params = new URLSearchParams({
                showAll: 'true',
                ...(filters.location && { location: filters.location }),
                ...(filters.type && { type: filters.type })
            });

            const response = await fetch(`/api/places/search?${params}`);
            const data = await response.json();
            const items = data.places || [];

            // Normalize places data
            const normalizedPlaces = items.map(place => ({
                id: place.id,
                name: place.name,
                product_name: place.name,
                location: place.address,
                logo: place.logo,
                phone: place.phone,
                phone2: place.phone2,
                web: place.web,
                web2: place.web2,
                email: place.email,
                telegram: place.telegram,
                geo: place.geo,
                facebook: place.facebook,
                instagram: place.instagram,
                youtube: place.youtube,
                type: place.type,
                score: 1, // Show all as 100% relevant
                address: place.address
            }));

            setResults(normalizedPlaces);
            setHasSearched(true);
            setSearchQuery('Ver todos los lugares');

            // Update context
            setSearchResults(normalizedPlaces);
            setLastSearch({
                query: 'Ver todos',
                filters: filters
            });

        } catch (error) {
            console.error('Error showing all places:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const formatPrice = (price) => {
        return typeof price === 'number' ? `$${price.toFixed(2)}` : `$${price}`;
    };

    return (
        <>
            <Head>
                <title>BOLAO - Encuentra lo que buscas</title>
                <meta name="description" content="Búsqueda inteligente de productos y servicios cerca de ti" />
                <link rel="icon" href="/bolao-logo.png" />
            </Head>

            <div className="min-h-screen bg-gray-50">
                <header className="bg-white shadow-sm border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            <div className="flex items-center">
                                <Link href="/" className="flex items-center space-x-3">
                                    <img
                                        src="/bolao-logo.png"
                                        alt="BOLAO Logo"
                                        className="w-10 h-10"
                                    />
                                    <span className="text-2xl font-bold text-gray-900">BOLAO</span>
                                </Link>
                            </div>

                            {/* Desktop Navigation */}
                            <nav className="hidden md:flex space-x-8">
                                <button
                                    onClick={() => setShowContact(true)}
                                    className="text-gray-700 hover:text-orange-500 transition"
                                >
                                    Contacto
                                </button>
                            </nav>

                            {/* Mobile Contact Button */}
                            <div className="md:hidden">
                                <button
                                    onClick={() => setShowContact(true)}
                                    className="bg-orange-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors flex items-center space-x-1.5 touch-manipulation"
                                >
                                    <Phone className="w-4 h-4" />
                                    <span>Contacto</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                <section className="relative bg-gradient-to-r from-orange-500 to-red-500 py-20 overflow-hidden">
                    <div className="absolute inset-0 bg-black opacity-10"></div>
                    {/* Logo de fondo */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-5">
                        <img
                            src="/bolao-logo.png"
                            alt="BOLAO Background"
                            className="w-96 h-96 object-contain"
                        />
                    </div>
                    <div className="relative max-w-4xl mx-auto px-4 text-center">
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            Descubre Tu Próximo Sabor Favorito
                        </h1>
                        <p className="text-xl text-white mb-8 opacity-90">
                            Explora un mundo de delicias culinarias con nuestra búsqueda intuitiva
                        </p>

                        <div className="bg-white rounded-lg shadow-lg p-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                            <div className="flex items-center flex-1">
                                <Search className="w-6 h-6 text-gray-400 ml-3" />
                                <input
                                    type="text"
                                    placeholder={searchMode === 'lugares'
                                        ? "¿Qué lugar buscas? Ej: restaurante, cafetería, panadería..."
                                        : "¿Qué estás buscando? Ej: hamburguesa, café, helado..."
                                    }
                                    className="flex-1 px-4 py-3 text-gray-700 focus:outline-none"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleSearch}
                                    className="bg-orange-500 text-white px-6 py-3 rounded-md hover:bg-orange-600 transition font-semibold flex-1 sm:flex-none"
                                >
                                    Buscar
                                </button>
                                <button
                                    onClick={() => setShowChat(true)}
                                    className="bg-blue-500 text-white px-4 py-3 rounded-md hover:bg-blue-600 transition font-semibold flex items-center justify-center"
                                >
                                    <MessageSquare className="w-5 h-5 mr-1" />
                                    <span>Chat</span>
                                </button>
                            </div>
                        </div>

                        {/* Search Mode Buttons */}
                        <div className="mt-4 flex justify-center">
                            <div className="bg-white rounded-lg shadow-md p-1 flex gap-1">
                                <button
                                    onClick={() => setSearchMode('productos')}
                                    className={`flex items-center px-4 py-2 rounded-md transition-all font-medium ${searchMode === 'productos'
                                        ? 'bg-orange-500 text-white shadow-sm'
                                        : 'text-gray-600 hover:text-orange-500 hover:bg-orange-50'
                                        }`}
                                >
                                    <Store className="w-4 h-4 mr-2" />
                                    <span>Productos</span>
                                </button>
                                <button
                                    onClick={() => setSearchMode('lugares')}
                                    className={`flex items-center px-4 py-2 rounded-md transition-all font-medium ${searchMode === 'lugares'
                                        ? 'bg-orange-500 text-white shadow-sm'
                                        : 'text-gray-600 hover:text-orange-500 hover:bg-orange-50'
                                        }`}
                                >
                                    <MapIcon className="w-4 h-4 mr-2" />
                                    <span>Lugares</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="max-w-7xl mx-auto px-4 py-6">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center space-x-2 text-gray-700 hover:text-orange-500 transition mb-4"
                    >
                        <Filter className="w-5 h-5" />
                        <span className="font-medium">Filtros</span>
                    </button>

                    {showFilters && (
                        <div className="bg-white rounded-lg shadow p-6 mb-6">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Ubicación
                                    </label>
                                    <select
                                        value={filters.location}
                                        onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                                    >
                                        <option value="">Todas las ubicaciones</option>
                                        {locations.map((loc) => (
                                            <option key={loc} value={loc}>{loc}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tipo de establecimiento
                                    </label>
                                    <select
                                        value={filters.type}
                                        onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                                    >
                                        <option value="">Todos los tipos</option>
                                        {types.map((type) => (
                                            <option key={type} value={type}>
                                                {type.charAt(0).toUpperCase() + type.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="mt-4 flex justify-end">
                                <button
                                    onClick={() => setFilters({ location: '', type: '' })}
                                    className="text-gray-600 hover:text-gray-800 mr-4"
                                >
                                    Limpiar filtros
                                </button>
                                <button
                                    onClick={handleSearch}
                                    className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition"
                                >
                                    Aplicar filtros
                                </button>
                            </div>
                        </div>
                    )}
                </section>

                <section className="max-w-7xl mx-auto px-4 pb-12">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                            <p className="mt-4 text-gray-600">
                                Buscando {searchMode === 'lugares' ? 'lugares' : 'productos'}...
                            </p>
                        </div>
                    ) : results.length > 0 ? (
                        <>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                {results.length} {searchMode === 'lugares' ? 'lugares' : 'productos'} encontrados para "{searchQuery}"
                            </h2>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {results.map((item) => (
                                    <Link
                                        key={item.id}
                                        href={searchMode === 'lugares' ? `/places/${item.id}` : `/product/${item.id}`}
                                        className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden cursor-pointer"
                                    >
                                        <div className="relative">
                                            {item.logo && (
                                                <img
                                                    src={item.logo}
                                                    alt={item.name}
                                                    className="w-full h-48 object-cover bg-gray-100"
                                                />
                                            )}
                                            {!item.logo && (
                                                <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                                                    {searchMode === 'lugares' ? (
                                                        <MapIcon className="w-12 h-12 text-gray-400" />
                                                    ) : (
                                                        <Store className="w-12 h-12 text-gray-400" />
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-6">
                                            {searchMode === 'lugares' ? (
                                                // Places display
                                                <>
                                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                                        {item.name}
                                                    </h3>
                                                    {item.type && (
                                                        <p className="text-orange-500 font-medium mb-2 text-sm uppercase tracking-wide">
                                                            {item.type}
                                                        </p>
                                                    )}

                                                    <div className="flex items-center text-gray-500 mb-2">
                                                        <MapPin className="w-4 h-4 mr-1" />
                                                        <span className="text-sm">{item.address || item.location || 'Dirección no disponible'}</span>
                                                    </div>

                                                    {item.phone && (
                                                        <div className="flex items-center text-gray-500 mb-2">
                                                            <Phone className="w-4 h-4 mr-1" />
                                                            <span className="text-sm">{item.phone}</span>
                                                        </div>
                                                    )}

                                                    {item.web && (
                                                        <div className="text-blue-600 text-sm mb-2 truncate">
                                                            🌐 {item.web}
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                // Products display
                                                <>
                                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                                        {item.product_name}
                                                    </h3>
                                                    <p className="text-gray-600 mb-2">{item.name}</p>
                                                    {item.description && <p className="text-gray-700 text-sm mb-2">{item.description}</p>}
                                                    <p className="text-2xl font-bold text-orange-500 mb-3">
                                                        {formatPrice(item.product_price)}
                                                    </p>

                                                    <div className="flex items-center text-gray-500 mb-2">
                                                        <MapPin className="w-4 h-4 mr-1" />
                                                        <span className="text-sm">{item.location}</span>
                                                    </div>
                                                </>
                                            )}

                                            <div className="flex items-center justify-end mt-4">
                                                <ChevronRight className="w-5 h-5 text-gray-400" />
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </>
                    ) : hasSearched && results.length === 0 && !loading ? (
                        <div className="text-center py-12">
                            <p className="text-gray-600">No se encontraron resultados para "{searchQuery}"</p>
                            <p className="text-gray-500 mt-2">Intenta con otros términos de búsqueda</p>
                        </div>
                    ) : null}

                    {/* Ver todos button - only show for lugares mode */}
                    {searchMode === 'lugares' && (
                        <div className="text-center mb-6">
                            <button
                                onClick={handleShowAll}
                                className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition font-semibold flex items-center mx-auto"
                                disabled={loading}
                            >
                                <Eye className="w-5 h-5 mr-2" />
                                Ver todos los lugares
                                {(filters.location || filters.type) && (
                                    <span className="ml-2 text-sm opacity-75">
                                        {filters.location && `en ${filters.location}`}
                                        {filters.location && filters.type && ' - '}
                                        {filters.type && filters.type}
                                    </span>
                                )}
                            </button>
                        </div>
                    )}
                </section>
                {showChat && <ChatPanel onClose={() => setShowChat(false)} searchMode={searchMode} />}

                {/* Contact Modal */}
                {showContact && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4 lg:p-8"
                        onClick={(e) => e.target === e.currentTarget && setShowContact(false)}
                    >
                        <div
                            className="bg-white rounded-lg shadow-xl max-w-md w-full mx-2 sm:mx-4 p-4 sm:p-6 lg:p-8 max-h-[90vh] sm:max-h-screen overflow-y-auto"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="contact-modal-title"
                        >
                            <div className="flex items-center justify-between mb-4 sm:mb-6">
                                <h2 id="contact-modal-title" className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Contacto</h2>
                                <button
                                    onClick={() => setShowContact(false)}
                                    className="text-gray-500 hover:text-gray-700 p-2 -m-2 rounded-full hover:bg-gray-100 transition-colors touch-manipulation"
                                    aria-label="Cerrar modal de contacto"
                                >
                                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                                </button>
                            </div>

                            <div className="space-y-4 sm:space-y-6">
                                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                                    ¿Tienes alguna pregunta o sugerencia? ¡No dudes en contactarme!
                                </p>

                                <div className="space-y-3 sm:space-y-4">
                                    <div className="flex items-start space-x-3 sm:space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors touch-manipulation">
                                        <div className="bg-orange-100 p-2.5 sm:p-3 rounded-full flex-shrink-0">
                                            <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Teléfono</p>
                                            <a
                                                href="tel:+5354825243"
                                                className="text-gray-900 font-semibold hover:text-orange-600 transition-colors text-base sm:text-lg touch-manipulation focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 rounded block"
                                            >
                                                +53 54825243
                                            </a>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-3 sm:space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors touch-manipulation">
                                        <div className="bg-orange-100 p-2.5 sm:p-3 rounded-full flex-shrink-0">
                                            <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Email</p>
                                            <a
                                                href="mailto:cquiala12@gmail.com"
                                                className="text-gray-900 font-semibold hover:text-orange-600 transition-colors text-base sm:text-lg break-all touch-manipulation focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 rounded block"
                                            >
                                                cquiala12@gmail.com
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 sm:pt-6 border-t">
                                    <p className="text-xs sm:text-sm text-gray-500 text-center leading-relaxed">
                                        Desarrollado con ❤️ para la comunidad cubana
                                    </p>
                                </div>

                                {/* Mobile close button */}
                                <div className="sm:hidden pt-4">
                                    <button
                                        onClick={() => setShowContact(false)}
                                        className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors touch-manipulation focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                                    >
                                        Cerrar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}