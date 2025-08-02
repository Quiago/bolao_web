import React from 'react';
import { Clock, Building2, Package, Plus } from 'lucide-react';

/**
 * RecentActivity Component
 * Principio de Responsabilidad Única: Solo muestra actividad reciente
 * Corregido: Ahora muestra actividad real basada en datos del usuario
 */
export const RecentActivity = ({ places = [], products = [], loading = false }) => {
  // Generar actividad real basada en lugares y productos más recientes
  const generateRealActivity = () => {
    const activities = [];

    // Agregar lugares recientes como actividad
    places.slice(0, 3).forEach((place, index) => {
      activities.push({
        id: `place-${place.id}`,
        type: 'create',
        resource: 'place',
        title: 'Lugar registrado',
        description: `"${place.name}" en ${place.location || place.address}`,
        time: getTimeAgo(place.created_at),
        icon: Building2,
        color: 'text-blue-500',
        data: place
      });
    });

    // Agregar productos recientes como actividad
    products.slice(0, 3).forEach((product, index) => {
      activities.push({
        id: `product-${product.id}`,
        type: 'create', 
        resource: 'product',
        title: 'Producto agregado',
        description: `"${product.product_name || product.name}" ${product.product_price ? `- $${product.product_price}` : ''}`,
        time: getTimeAgo(product.created_at),
        icon: Package,
        color: 'text-green-500',
        data: product
      });
    });

    // Ordenar por fecha más reciente
    return activities
      .filter(activity => activity.time !== 'Fecha no disponible')
      .sort((a, b) => {
        const dateA = new Date(a.data.created_at || 0);
        const dateB = new Date(b.data.created_at || 0);
        return dateB - dateA;
      })
      .slice(0, 4); // Mostrar solo los 4 más recientes
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return 'Fecha no disponible';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      
      if (diffInMinutes < 1) return 'Ahora mismo';
      if (diffInMinutes < 60) return `${diffInMinutes} min`;
      
      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) return `${diffInHours} h`;
      
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) return `${diffInDays} d`;
      
      return date.toLocaleDateString('es-ES');
    } catch (error) {
      return 'Fecha no disponible';
    }
  };

  const activities = generateRealActivity();

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-start gap-3 p-3 bg-gray-100 rounded-lg">
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="font-medium">Sin actividad reciente</p>
          <p className="text-sm text-gray-400 mt-2">
            {places.length === 0 && products.length === 0 
              ? 'Crea tu primer lugar o producto para ver actividad aquí'
              : 'La actividad aparecerá conforme uses el sistema'
            }
          </p>
        </div>
      ) : (
        <>
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className={`flex-shrink-0 p-2 rounded-full bg-white ${activity.color}`}>
                <activity.icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{activity.title}</p>
                <p className="text-sm text-gray-600 truncate">{activity.description}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Clock className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-500">hace {activity.time}</span>
                </div>
              </div>
            </div>
          ))}
          
          {(places.length > 0 || products.length > 0) && (
            <div className="text-center pt-2 border-t">
              <p className="text-xs text-gray-500">
                Actividad basada en elementos más recientes
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}; 