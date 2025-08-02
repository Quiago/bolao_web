import React from 'react';
import { Package, MapPin, DollarSign, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * RecentProducts Component
 * Muestra los productos más recientes con datos reales
 */
export const RecentProducts = ({ products, loading, error }) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-24"></div>
                  <div className="h-3 bg-gray-300 rounded w-32"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Error cargando productos: {error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="text-blue-600 hover:text-blue-800 text-sm mt-2"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="font-medium">Sin productos registrados</p>
        <p className="text-sm text-gray-400 mb-4">Añade tu primer producto</p>
        <button 
          onClick={() => navigate('/products/create')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Crear Producto
        </button>
      </div>
    );
  }

  const formatPrice = (product) => {
    if (product.product_price) {
      return `$${product.product_price}`;
    }
    if (product.price) {
      return product.price;
    }
    return 'Sin precio';
  };

  return (
    <div className="space-y-4">
      {products.map((product) => (
        <div 
          key={product.id} 
          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer group"
          onClick={() => navigate(`/products/${product.id}`)}
        >
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 p-2 bg-green-100 rounded-full group-hover:bg-green-200 transition-colors">
              <Package className="w-5 h-5 text-green-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-gray-900 truncate">
                {product.product_name || product.name}
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <MapPin className="w-3 h-3" />
                <span className="truncate">{product.name || product.location}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                {product.type && (
                  <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                    {product.type}
                  </span>
                )}
                {(product.delivery === 'yes' || product.pickup === 'yes') && (
                  <div className="flex gap-1">
                    {product.delivery === 'yes' && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        🚚 Delivery
                      </span>
                    )}
                    {product.pickup === 'yes' && (
                      <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                        🏪 Pickup
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex-shrink-0 text-right">
            <div className="flex items-center gap-1 text-green-600 font-semibold">
              <DollarSign className="w-4 h-4" />
              {formatPrice(product)}
            </div>
            {product.score && (
              <div className="text-sm text-yellow-600 mt-1">
                ⭐ {product.score}
              </div>
            )}
          </div>
        </div>
      ))}
      
      {products.length > 0 && (
        <div className="pt-3 border-t">
          <button 
            onClick={() => navigate('/products')}
            className="w-full text-center text-green-600 hover:text-green-800 text-sm font-medium py-2"
          >
            Ver todos los productos
          </button>
        </div>
      )}
    </div>
  );
};