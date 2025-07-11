/**
 * Data Transformer
 * Principio de Responsabilidad Única: Solo transforma datos entre formatos
 * Principio Abierto/Cerrado: Fácil de extender con nuevos tipos de transformación
 */
export class DataTransformer {
  // Places Transformers
  static transformPlace(place) {
    if (!place) return null;
    
    return {
      id: place.id,
      name: place.name || '',
      description: place.description || '',
      address: place.address || '',
      latitude: place.latitude || 0,
      longitude: place.longitude || 0,
      phone: place.phone || '',
      email: place.email || '',
      website: place.website || '',
      category: place.category || '',
      rating: place.rating || 0,
      verified: place.verified || false,
      business_account_id: place.business_account_id,
      created_at: place.created_at,
      updated_at: place.updated_at
    };
  }

  static transformPlaceForApi(place) {
    if (!place) return null;

    return {
      name: place.name,
      description: place.description,
      address: place.address,
      latitude: parseFloat(place.latitude) || 0,
      longitude: parseFloat(place.longitude) || 0,
      phone: place.phone,
      email: place.email,
      website: place.website,
      category: place.category,
      rating: parseFloat(place.rating) || 0,
      verified: Boolean(place.verified)
    };
  }

  // Products Transformers
  static transformProduct(product) {
    if (!product) return null;

    return {
      id: product.id,
      product_name: product.product_name || '',
      description: product.description || '',
      price: product.price || 0,
      category: product.category || '',
      image_url: product.image_url || '',
      available: product.available || false,
      stock_quantity: product.stock_quantity || 0,
      place_id: product.place_id,
      business_account_id: product.business_account_id,
      created_at: product.created_at,
      updated_at: product.updated_at
    };
  }

  static transformProductForApi(product) {
    if (!product) return null;

    return {
      product_name: product.product_name,
      description: product.description,
      price: parseFloat(product.price) || 0,
      category: product.category,
      image_url: product.image_url,
      available: Boolean(product.available),
      stock_quantity: parseInt(product.stock_quantity) || 0,
      place_id: product.place_id
    };
  }

  // Generic Transformers
  static transformDateForDisplay(dateString) {
    if (!dateString) return '';
    
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  }

  static transformPriceForDisplay(price) {
    if (price === null || price === undefined) return '';
    
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  }

  static transformBooleanForDisplay(value) {
    if (value === null || value === undefined) return '';
    return value ? 'Sí' : 'No';
  }

  // Validation Helpers
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  static isValidCoordinate(lat, lng) {
    return (
      typeof lat === 'number' && 
      typeof lng === 'number' &&
      lat >= -90 && lat <= 90 &&
      lng >= -180 && lng <= 180
    );
  }
} 