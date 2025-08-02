import React from 'react';
import { Building2, MapPin, Calendar, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * RecentPlaces Component
 * Muestra los lugares más recientes con datos reales
 */
export const RecentPlaces = ({ places, loading, error }) => {
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
        <Building2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Error cargando lugares: {error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="text-blue-600 hover:text-blue-800 text-sm mt-2"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!places || places.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Building2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="font-medium">Sin lugares registrados</p>
        <p className="text-sm text-gray-400 mb-4">Crea tu primer lugar para comenzar</p>
        <button 
          onClick={() => navigate('/places/create')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Crear Lugar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {places.map((place) => (
        <div 
          key={place.id} 
          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer group"
          onClick={() => navigate(`/places/${place.id}`)}
        >
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 p-2 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-gray-900 truncate">{place.name}</p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <MapPin className="w-3 h-3" />
                <span className="truncate">{place.location || place.address}</span>
              </div>
              {place.type && (
                <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full mt-1">
                  {place.type}
                </span>
              )}
            </div>
          </div>
          <div className="flex-shrink-0 text-right">
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Calendar className="w-3 h-3" />
              {place.created_at ? new Date(place.created_at).toLocaleDateString('es-ES') : 'Reciente'}
            </div>
            {place.score > 0 && (
              <div className="text-sm text-yellow-600 mt-1">
                ⭐ {place.score}
              </div>
            )}
          </div>
        </div>
      ))}
      
      {places.length > 0 && (
        <div className="pt-3 border-t">
          <button 
            onClick={() => navigate('/places')}
            className="w-full text-center text-blue-600 hover:text-blue-800 text-sm font-medium py-2"
          >
            Ver todos los lugares
          </button>
        </div>
      )}
    </div>
  );
};