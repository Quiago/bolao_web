// Utilidad para fetch autenticado usando el token JWT en sessionStorage
export async function authFetch(url, options = {}) {
  const token = sessionStorage.getItem('token');
  const headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    'Content-Type': 'application/json',
  };
  return fetch(url, { ...options, headers });
}
