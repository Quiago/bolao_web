import { useState, useEffect } from 'react';
import { ApiService } from '../../services/apiService';

/**
 * Hook personalizado para gestionar datos del dashboard
 * Evita peticiones duplicadas y centraliza la gestión de datos
 */
export const useDashboardData = () => {
  const [dashboardData, setDashboardData] = useState({
    places: {
      items: [],
      total: 0,
      loading: true,
      error: null
    },
    products: {
      items: [],
      total: 0,
      loading: true,
      error: null
    },
    loading: true
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setDashboardData(prev => ({ ...prev, loading: true }));

      // Hacer peticiones en paralelo para optimizar el rendimiento
      const [placesResponse, productsResponse] = await Promise.all([
        // Obtener lugares recientes (últimos 5) + total
        ApiService.get('/api/places?page=1&pageSize=5').catch(err => {
          console.error('Error fetching places:', err);
          return { places: [], meta: { totalItems: 0 } };
        }),
        // Obtener productos recientes (últimos 5) + total  
        ApiService.get('/api/products?page=1&pageSize=5').catch(err => {
          console.error('Error fetching products:', err);
          return { products: [], meta: { totalItems: 0 } };
        })
      ]);

      setDashboardData({
        places: {
          items: placesResponse.places || [],
          total: placesResponse.meta?.totalItems || 0,
          loading: false,
          error: null
        },
        products: {
          items: productsResponse.products || [],
          total: productsResponse.meta?.totalItems || 0,
          loading: false,
          error: null
        },
        loading: false
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setDashboardData(prev => ({
        ...prev,
        loading: false,
        places: { ...prev.places, loading: false, error: error.message },
        products: { ...prev.products, loading: false, error: error.message }
      }));
    }
  };

  const refreshData = () => {
    fetchDashboardData();
  };

  return {
    ...dashboardData,
    refreshData
  };
};