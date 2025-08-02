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
      type: place.type || '',
      location: place.location || '',
      address: place.address || '',
      phone: place.phone || '',
      phone2: place.phone2 || '',
      web: place.web || '',
      web2: place.web2 || '',
      email: place.email || '',
      facebook: place.facebook || '',
      instagram: place.instagram || '',
      youtube: place.youtube || '',
      telegram: place.telegram || '',
      logo: place.logo || '',
      geo: place.geo || null,
      score: place.score || 0,
      total_reviews: place.total_reviews || 0,
      business_account_id: place.business_account_id,
      created_by: place.created_by || null, // Puede ser null debido a inconsistencia en auth system
      created_at: place.created_at,
      updated_at: place.updated_at
    };
  }

  static transformPlaceForApi(place) {
    if (!place) return null;

    // Construir objeto geo si se proporcionan coordenadas
    let geo = null;
    if (place.latitude && place.longitude) {
      geo = {
        type: "Point",
        coordinates: [parseFloat(place.longitude), parseFloat(place.latitude)]
      };
    } else if (place.geo) {
      geo = place.geo;
    }

    return {
      name: place.name,
      type: place.type,
      location: place.location,
      address: place.address,
      phone: place.phone,
      phone2: place.phone2,
      web: place.web,
      web2: place.web2,
      email: place.email,
      facebook: place.facebook,
      instagram: place.instagram,
      youtube: place.youtube,
      telegram: place.telegram,
      logo: place.logo,
      geo: geo,
      score: parseFloat(place.score) || 0,
      total_reviews: parseInt(place.total_reviews) || 0
    };
  }

  // Products Transformers
  static transformProduct(product) {
    if (!product) return null;

    return {
      id: product.id,
      name: product.name || '',
      product_slug: product.product_slug || '',
      product_name: product.product_name || '',
      description: product.description || '',
      type: product.type || '',
      location: product.location || '',
      address: product.address || '',
      phone: product.phone || '',
      phone2: product.phone2 || '',
      web: product.web || '',
      web2: product.web2 || '',
      email: product.email || '',
      facebook: product.facebook || '',
      instagram: product.instagram || '',
      youtube: product.youtube || '',
      telegram: product.telegram || '',
      logo: product.logo || '',
      geo: product.geo || null,
      score: product.score || '',
      delivery: product.delivery || '',
      pickup: product.pickup || '',
      slug: product.slug || '',
      product_price: product.product_price || null,
      price: product.price || '',
      'prince-range-min': product['prince-range-min'] || '',
      'prince-range-max': product['prince-range-max'] || '',
      business_account_id: product.business_account_id
    };
  }

  static transformProductForApi(product) {
    if (!product) return null;

    // Construir objeto geo si se proporcionan coordenadas
    let geo = null;
    if (product.latitude && product.longitude) {
      geo = {
        type: "Point",
        coordinates: [parseFloat(product.longitude), parseFloat(product.latitude)]
      };
    } else if (product.geo) {
      geo = product.geo;
    }

    return {
      name: product.name,
      product_slug: product.product_slug,
      product_name: product.product_name,
      description: product.description,
      type: product.type,
      location: product.location,
      address: product.address,
      phone: product.phone,
      phone2: product.phone2,
      web: product.web,
      web2: product.web2,
      email: product.email,
      facebook: product.facebook,
      instagram: product.instagram,
      youtube: product.youtube,
      telegram: product.telegram,
      logo: product.logo,
      geo: geo,
      score: product.score,
      delivery: product.delivery,
      pickup: product.pickup,
      slug: product.slug,
      product_price: parseFloat(product.product_price) || null,
      price: product.price,
      'prince-range-min': product['prince-range-min'],
      'prince-range-max': product['prince-range-max']
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

  // Helper para extraer coordenadas del campo geo
  static extractCoordinatesFromGeo(geo) {
    if (!geo || geo.type !== 'Point' || !geo.coordinates || geo.coordinates.length < 2) {
      return { latitude: null, longitude: null };
    }
    return {
      latitude: geo.coordinates[1],
      longitude: geo.coordinates[0]
    };
  }

  // Helper para obtener latitude del lugar (de geo o field directo)
  static getLatitude(place) {
    if (place.latitude !== undefined) return place.latitude;
    const coords = this.extractCoordinatesFromGeo(place.geo);
    return coords.latitude;
  }

  // Helper para obtener longitude del lugar (de geo o field directo)
  static getLongitude(place) {
    if (place.longitude !== undefined) return place.longitude;
    const coords = this.extractCoordinatesFromGeo(place.geo);
    return coords.longitude;
  }
} 