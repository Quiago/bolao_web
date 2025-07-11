import { ApiService } from '../services/apiService';

/**
 * Custom Auth Provider
 * Principio de Responsabilidad Única: Solo maneja autenticación
 * Principio de Inversión de Dependencias: Usa ApiService para comunicación
 */
export const CustomAuthProvider = {
  login: async ({ email, password }) => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Error de autenticación');
      }

      if (result.token) {
        sessionStorage.setItem('token', result.token);
        sessionStorage.setItem('user', JSON.stringify(result.user));
        return Promise.resolve();
      }

      throw new Error('No se recibió token de autenticación');
    } catch (error) {
      throw new Error(error.message || 'Error de login');
    }
  },

  logout: () => {
    // Limpiar datos de sesión
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    
    // Redirigir inmediatamente al login
    if (typeof window !== 'undefined') {
      window.location.replace('/backoffice/login');
    }
    
    return Promise.resolve();
  },

  checkAuth: () => {
    // Verificar si estamos en el cliente
    if (typeof window === 'undefined') {
      return Promise.reject();
    }
    
    const token = sessionStorage.getItem('token');
    return token ? Promise.resolve() : Promise.reject();
  },

  checkError: (error) => {
    // Verificar si estamos en el cliente
    if (typeof window === 'undefined') {
      return Promise.resolve();
    }
    
    const status = error.status;
    if (status === 401 || status === 403) {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      return Promise.reject();
    }
    return Promise.resolve();
  },

  getIdentity: () => {
    // Verificar si estamos en el cliente
    if (typeof window === 'undefined') {
      return Promise.reject();
    }
    
    try {
      const user = JSON.parse(sessionStorage.getItem('user') || '{}');
      return Promise.resolve({
        id: user.id,
        fullName: user.business_name || user.email,
        avatar: user.avatar || null,
        email: user.email
      });
    } catch (error) {
      return Promise.reject();
    }
  },

  getPermissions: () => {
    // Implementar lógica de permisos si es necesario
    return Promise.resolve(['admin']);
  }
}; 