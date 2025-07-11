import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../../../components/ui/card';
import { ApiService } from '../../services/apiService';
import { TrendingUp, TrendingDown } from 'lucide-react';

/**
 * StatsWidget Component
 * Principio de Responsabilidad Única: Solo muestra estadísticas
 * Principio de Composición: Reutilizable para diferentes recursos
 */
export const StatsWidget = ({ title, value, icon: Icon, color, resource, trend }) => {
  const [stats, setStats] = useState({ value: value || '0', loading: true });

  useEffect(() => {
    if (resource) {
      fetchStats();
    }
  }, [resource]);

  const fetchStats = async () => {
    try {
      const response = await ApiService.get(`/api/${resource}?page=1&pageSize=1`);
      setStats({
        value: response.meta?.totalItems?.toString() || '0',
        loading: false
      });
    } catch (error) {
      console.error(`Error fetching ${resource} stats:`, error);
      setStats({
        value: '0',
        loading: false
      });
    }
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    const isPositive = trend.startsWith('+');
    return isPositive ? (
      <TrendingUp className="w-4 h-4 text-green-500" />
    ) : (
      <TrendingDown className="w-4 h-4 text-red-500" />
    );
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-gray-900">
                {stats.loading ? '...' : stats.value}
              </p>
              {trend && (
                <div className="flex items-center gap-1">
                  {getTrendIcon()}
                  <span className={`text-sm font-medium ${
                    trend.startsWith('+') ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {trend}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className={`p-3 rounded-full ${color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 