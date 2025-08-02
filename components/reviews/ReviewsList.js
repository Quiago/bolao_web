import { useState, useEffect } from 'react';
import { Star, User, Calendar, MessageSquare } from 'lucide-react';

/**
 * ReviewsList Component
 * Muestra la lista de reseñas para un lugar específico
 */
export default function ReviewsList({ placeId, className = "" }) {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    if (placeId) {
      fetchReviews();
    }
  }, [placeId, page]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/reviews?place_id=${placeId}&page=${page}&pageSize=10`);
      
      if (!response.ok) {
        throw new Error('Error al cargar reseñas');
      }

      const data = await response.json();
      
      if (page === 1) {
        setReviews(data.reviews);
        setStats(data.stats);
      } else {
        setReviews(prev => [...prev, ...data.reviews]);
      }
      
      setHasMore(data.meta.hasNextPage);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    setPage(prev => prev + 1);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating 
                ? 'text-yellow-400 fill-yellow-400' 
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const renderStatsBar = (rating, count, total) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="w-3 text-gray-600">{rating}</span>
        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div 
            className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <span className="w-8 text-xs text-gray-500">{count}</span>
      </div>
    );
  };

  if (loading && page === 1) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/6"></div>
                </div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Error al cargar reseñas</p>
        <p className="text-sm text-gray-500">{error}</p>
        <button 
          onClick={() => {
            setPage(1);
            fetchReviews();
          }}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header con estadísticas */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Reseñas de clientes
        </h3>

        {stats && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">{stats.average}</div>
                <div className="flex items-center justify-center gap-1 mb-1">
                  {renderStars(Math.round(stats.average))}
                </div>
                <div className="text-sm text-gray-600">{stats.total} reseñas</div>
              </div>
              
              <div className="flex-1 max-w-xs space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => 
                  renderStatsBar(rating, stats.distribution[rating], stats.total)
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lista de reseñas */}
      {reviews.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">Sin reseñas aún</h4>
          <p className="text-gray-600">
            Sé el primero en compartir tu experiencia sobre este lugar.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
              {/* Header de la reseña */}
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {review.profiles?.avatar_url ? (
                    <img 
                      src={review.profiles.avatar_url} 
                      alt={review.profiles.full_name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">
                      {review.profiles?.full_name || 'Usuario'}
                    </h4>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      {formatDate(review.created_at)}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-1">
                    {renderStars(review.rating)}
                    <span className="text-sm text-gray-600">
                      ({review.rating}/5)
                    </span>
                  </div>
                </div>
              </div>

              {/* Contenido de la reseña */}
              <div className="space-y-2">
                {review.title && (
                  <h5 className="font-medium text-gray-900">{review.title}</h5>
                )}
                
                {review.comment && (
                  <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                )}
              </div>
            </div>
          ))}

          {/* Botón cargar más */}
          {hasMore && (
            <div className="text-center pt-4">
              <button
                onClick={loadMore}
                disabled={loading}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                {loading ? 'Cargando...' : 'Cargar más reseñas'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}