import { useState, useEffect } from 'react';
import Head from 'next/head';
import { Search, MapPin, Filter, Star, Phone, Globe, Instagram, Facebook, ChevronRight } from 'lucide-react';
import Link from 'next/link';

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

  useEffect(() => {
    loadFilterOptions();
    
    // Verificar si hay parámetros de búsqueda en la URL
    const urlParams = new URLSearchParams(window.location.search);
    const queryParam = urlParams.get('q');
    const locationParam = urlParams.get('location');
    const typeParam = urlParams.get('type');
    
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

  const loadFilterOptions = async () => {
    try {
      const response = await fetch('/api/filters');
      const data = await response.json();
      setLocations(data.locations || []);
      setTypes(data.types || []);
    } catch (error) {
      console.error('Error loading filters:', error);
    }
  };

  const performSearch = async (query = searchQuery, searchFilters = filters) => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        query: query,
        ...(searchFilters.location && { location: searchFilters.location }),
        ...(searchFilters.type && { type: searchFilters.type })
      });

      const response = await fetch(`/api/search?${params}`);
      const data = await response.json();
      setResults(data.products || []);
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

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
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
              <nav className="hidden md:flex space-x-8">
                <a href="#" className="text-gray-700 hover:text-orange-500 transition">Inicio</a>
                <a href="#" className="text-gray-700 hover:text-orange-500 transition">Categorías</a>
                <a href="#" className="text-gray-700 hover:text-orange-500 transition">Ofertas</a>
                <a href="#" className="text-gray-700 hover:text-orange-500 transition">Contacto</a>
              </nav>
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
            
            <div className="bg-white rounded-lg shadow-lg p-2 flex items-center">
              <Search className="w-6 h-6 text-gray-400 ml-3" />
              <input
                type="text"
                placeholder="¿Qué estás buscando? Ej: hamburguesa, café, helado..."
                className="flex-1 px-4 py-3 text-gray-700 focus:outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <button
                onClick={handleSearch}
                className="bg-orange-500 text-white px-6 py-3 rounded-md hover:bg-orange-600 transition font-semibold"
              >
                Buscar
              </button>
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
                      <option key={type} value={type}>{type}</option>
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
              <p className="mt-4 text-gray-600">Buscando productos...</p>
            </div>
          ) : results.length > 0 ? (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {results.length} resultados encontrados para "{searchQuery}"
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((product) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.id}?search=${encodeURIComponent(searchQuery)}&filters=${encodeURIComponent(JSON.stringify(filters))}`}
                    className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden cursor-pointer"
                  >
                    <div className="relative">
                      {product.logo && (
                        <img
                          src={product.logo}
                          alt={product.name}
                          className="w-full h-48 object-cover"
                        />
                      )}
                      <div className={`absolute top-4 right-4 ${getScoreColor(product.score)} text-white px-3 py-1 rounded-full text-sm font-semibold`}>
                        {(product.score * 100).toFixed(0)}% relevante
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {product.product_name}
                      </h3>
                      <p className="text-gray-600 mb-2">{product.name}</p>
                      <p className="text-2xl font-bold text-orange-500 mb-3">
                        {formatPrice(product.product_price)}
                      </p>
                      
                      <div className="flex items-center text-gray-500 mb-2">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span className="text-sm">{product.location}</span>
                      </div>
                      
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
        </section>
      </div>
    </>
  );
}
