import { useState } from 'react';
import { Star, Send, User, AlertCircle } from 'lucide-react';

/**
 * ReviewForm Component
 * Formulario para crear y editar reseñas
 */
export default function ReviewForm({ 
  placeId, 
  placeName, 
  onReviewSubmitted,
  existingReview = null,
  className = "" 
}) {
  const [profile, setProfile] = useState({
    email: '',
    full_name: '',
    phone: ''
  });
  const [review, setReview] = useState({
    rating: existingReview?.rating || 0,
    title: existingReview?.title || '',
    comment: existingReview?.comment || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(existingReview ? 2 : 1); // 1: Perfil, 2: Reseña

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Primero intentar obtener el perfil existente
      const getResponse = await fetch(`/api/profiles?email=${encodeURIComponent(profile.email)}`);
      
      if (getResponse.ok) {
        // El perfil ya existe
        const data = await getResponse.json();
        setProfile(prev => ({ ...prev, ...data.profile }));
        setStep(2);
      } else if (getResponse.status === 404) {
        // Crear nuevo perfil
        const createResponse = await fetch('/api/profiles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(profile)
        });

        if (!createResponse.ok) {
          const errorData = await createResponse.json();
          throw new Error(errorData.error || 'Error al crear perfil');
        }

        const data = await createResponse.json();
        setProfile(prev => ({ ...prev, ...data.profile }));
        setStep(2);
      } else {
        const errorData = await getResponse.json();
        throw new Error(errorData.error || 'Error al verificar perfil');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (review.rating === 0) {
        throw new Error('Por favor selecciona una calificación');
      }

      const reviewData = {
        place_id: placeId,
        profile_id: profile.id,
        rating: review.rating,
        title: review.title.trim() || null,
        comment: review.comment.trim() || null
      };

      const method = existingReview ? 'PUT' : 'POST';
      const url = existingReview ? '/api/reviews' : '/api/reviews';
      
      if (existingReview) {
        reviewData.id = existingReview.id;
      }

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al enviar reseña');
      }

      const data = await response.json();
      setSuccess(true);
      
      // Notificar al componente padre
      if (onReviewSubmitted) {
        onReviewSubmitted(data.review);
      }

      // Limpiar formulario si es nueva reseña
      if (!existingReview) {
        setReview({ rating: 0, title: '', comment: '' });
        setStep(1);
        setProfile({ email: '', full_name: '', phone: '' });
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (interactive = false) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && setReview(prev => ({ ...prev, rating: star }))}
            className={`w-8 h-8 transition-colors ${
              interactive ? 'hover:scale-110 cursor-pointer' : ''
            } ${
              star <= review.rating 
                ? 'text-yellow-400 fill-yellow-400' 
                : 'text-gray-300 hover:text-yellow-300'
            }`}
          >
            <Star className="w-full h-full" />
          </button>
        ))}
      </div>
    );
  };

  if (success) {
    return (
      <div className={`bg-green-50 border border-green-200 rounded-lg p-6 text-center ${className}`}>
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Send className="w-6 h-6 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-green-900 mb-2">
          ¡Reseña {existingReview ? 'actualizada' : 'enviada'}!
        </h3>
        <p className="text-green-700">
          Gracias por compartir tu experiencia sobre {placeName}.
        </p>
        <button
          onClick={() => {
            setSuccess(false);
            if (!existingReview) {
              setStep(1);
            }
          }}
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          {existingReview ? 'Cerrar' : 'Escribir otra reseña'}
        </button>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {existingReview ? 'Editar reseña' : 'Escribir reseña'}
        </h3>
        <p className="text-gray-600">
          Comparte tu experiencia sobre <span className="font-medium">{placeName}</span>
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Error</span>
          </div>
          <p className="text-red-700 mt-1">{error}</p>
        </div>
      )}

      {/* Indicador de pasos */}
      <div className="flex items-center gap-4 mb-6">
        <div className={`flex items-center gap-2 ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
            step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
          }`}>
            1
          </div>
          <span className="font-medium">Perfil</span>
        </div>
        
        <div className={`h-px flex-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
        
        <div className={`flex items-center gap-2 ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
            step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
          }`}>
            2
          </div>
          <span className="font-medium">Reseña</span>
        </div>
      </div>

      {/* Paso 1: Información del perfil */}
      {step === 1 && (
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              required
              value={profile.email}
              onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre completo *
            </label>
            <input
              type="text"
              required
              value={profile.full_name}
              onChange={(e) => setProfile(prev => ({ ...prev, full_name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Tu nombre completo"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teléfono (opcional)
            </label>
            <input
              type="tel"
              value={profile.phone}
              onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="+53 5123-4567"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <User className="w-5 h-5" />
                Continuar
              </>
            )}
          </button>
        </form>
      )}

      {/* Paso 2: Reseña */}
      {step === 2 && (
        <form onSubmit={handleReviewSubmit} className="space-y-6">
          {/* Calificación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Calificación *
            </label>
            <div className="flex items-center gap-4">
              {renderStars(true)}
              <span className="text-sm text-gray-600">
                {review.rating > 0 ? `${review.rating}/5` : 'Selecciona una calificación'}
              </span>
            </div>
          </div>

          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título (opcional)
            </label>
            <input
              type="text"
              value={review.title}
              onChange={(e) => setReview(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Resume tu experiencia..."
              maxLength="100"
            />
            <p className="text-xs text-gray-500 mt-1">{review.title.length}/100 caracteres</p>
          </div>

          {/* Comentario */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comentario (opcional)
            </label>
            <textarea
              value={review.comment}
              onChange={(e) => setReview(prev => ({ ...prev, comment: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Cuéntanos más detalles sobre tu experiencia..."
              maxLength="500"
            />
            <p className="text-xs text-gray-500 mt-1">{review.comment.length}/500 caracteres</p>
          </div>

          <div className="flex gap-3">
            {!existingReview && (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Volver
              </button>
            )}
            
            <button
              type="submit"
              disabled={loading || review.rating === 0}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  {existingReview ? 'Actualizar reseña' : 'Enviar reseña'}
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}