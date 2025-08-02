import React from 'react';
import { Building2, Package, TrendingUp, BarChart3, Calendar, MapPin, DollarSign } from 'lucide-react';

/**
 * AnalyticsChart Component
 * Principio de Responsabilidad Única: Solo muestra estadísticas reales del usuario
 * Corregido: Elimina datos falsos y muestra información real
 */
export const AnalyticsChart = ({ places = [], products = [], loading = false }) => {
  
  // Calcular estadísticas reales
  const getLocationStats = () => {
    const locations = {};
    places.forEach(place => {
      const location = place.location || 'Sin ubicación';
      locations[location] = (locations[location] || 0) + 1;
    });
    return Object.entries(locations)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);
  };

  const getTypeStats = () => {
    const types = {};
    places.forEach(place => {
      const type = place.type || 'Sin tipo';
      types[type] = (types[type] || 0) + 1;
    });
    products.forEach(product => {
      const type = product.type || 'Sin tipo';
      types[type] = (types[type] || 0) + 1;
    });
    return Object.entries(types)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);
  };

  const getProductPriceStats = () => {
    const pricesWithProducts = products.filter(p => p.product_price && p.product_price > 0);
    if (pricesWithProducts.length === 0) return null;
    
    const prices = pricesWithProducts.map(p => p.product_price);
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    
    return { avg: avg.toFixed(2), min, max, count: pricesWithProducts.length };
  };

  const locationStats = getLocationStats();
  const typeStats = getTypeStats();
  const priceStats = getProductPriceStats();

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="grid grid-cols-2 gap-4">
          <div className="h-20 bg-gray-200 rounded-lg"></div>
          <div className="h-20 bg-gray-200 rounded-lg"></div>
        </div>
        <div className="h-32 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  if (places.length === 0 && products.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <h3 className="font-medium text-lg mb-2">Sin datos para analizar</h3>
        <p className="text-sm text-gray-400 mb-4">
          Crea lugares y productos para ver estadísticas aquí
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas principales */}
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Lugares</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">{places.length}</div>
          <div className="text-xs text-blue-600">Total registrados</div>
        </div>
        
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Package className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-800">Productos</span>
          </div>
          <div className="text-2xl font-bold text-green-600">{products.length}</div>
          <div className="text-xs text-green-600">Total registrados</div>
        </div>
      </div>

      {/* Estadísticas por ubicación */}
      {locationStats.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-600" />
            <h4 className="font-medium text-gray-900">Ubicaciones principales</h4>
          </div>
          <div className="space-y-2">
            {locationStats.map(([location, count], index) => (
              <div key={location} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 truncate">{location}</span>
                <div className="flex items-center gap-2">
                  <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full transition-all"
                      style={{ width: `${(count / places.length) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 min-w-[2rem]">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Estadísticas de precios */}
      {priceStats && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-gray-600" />
            <h4 className="font-medium text-gray-900">Precios de productos</h4>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-orange-50 rounded-lg">
              <div className="text-lg font-bold text-orange-600">${priceStats.min}</div>
              <div className="text-xs text-orange-600">Mínimo</div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="text-lg font-bold text-green-600">${priceStats.avg}</div>
              <div className="text-xs text-green-600">Promedio</div>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-lg font-bold text-blue-600">${priceStats.max}</div>
              <div className="text-xs text-blue-600">Máximo</div>
            </div>
          </div>
          <p className="text-xs text-gray-500 text-center">
            Basado en {priceStats.count} productos con precio
          </p>
        </div>
      )}

      {/* Nota sobre datos reales */}
      <div className="pt-4 border-t text-center">
        <p className="text-xs text-gray-500">
          📊 Estadísticas basadas en tus datos reales
        </p>
      </div>
    </div>
  );
}; 