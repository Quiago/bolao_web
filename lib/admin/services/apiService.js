/**
 * API Service
 * Principio de Responsabilidad Única: Solo maneja comunicación HTTP
 * Principio de Inversión de Dependencias: Interface consistente para todas las operaciones HTTP
 */
export class ApiService {
  static getAuthHeaders() {
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('token') : null;
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  static async handleResponse(response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  static async get(url) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });
      return this.handleResponse(response);
    } catch (error) {
      throw new Error(`GET ${url} failed: ${error.message}`);
    }
  }

  static async post(url, data) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data)
      });
      return this.handleResponse(response);
    } catch (error) {
      throw new Error(`POST ${url} failed: ${error.message}`);
    }
  }

  static async put(url, data) {
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data)
      });
      return this.handleResponse(response);
    } catch (error) {
      throw new Error(`PUT ${url} failed: ${error.message}`);
    }
  }

  static async delete(url, data) {
    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data)
      });
      return this.handleResponse(response);
    } catch (error) {
      throw new Error(`DELETE ${url} failed: ${error.message}`);
    }
  }

  static async patch(url, data) {
    try {
      const response = await fetch(url, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data)
      });
      return this.handleResponse(response);
    } catch (error) {
      throw new Error(`PATCH ${url} failed: ${error.message}`);
    }
  }
} 