import React from 'react';
import { Card, CardContent } from '../../../../components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

/**
 * StatsWidget Component
 * Principio de Responsabilidad Única: Solo muestra estadísticas
 * Principio de Composición: Reutilizable para diferentes recursos
 * Optimizado: Ahora recibe los datos directamente para evitar peticiones duplicadas
 */
export const StatsWidget = ({ title, value, icon: Icon, color, loading = false, trend, subtitle }) => {
  const displayValue = loading ? '...' : (value?.toString() || '0');

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
    <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg ${color} shadow-lg flex items-center justify-center`}>
                <Icon className="w-5 h-5 text-white stroke-white fill-none stroke-2" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{title}</h3>
                {subtitle && (
                  <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <p className={`text-3xl font-bold text-gray-900 ${loading ? 'animate-pulse' : ''}`}>
                {loading ? (
                  <span className="inline-block w-16 h-8 bg-gray-200 rounded animate-pulse"></span>
                ) : (
                  (value || 0).toLocaleString()
                )}
              </p>
              {trend && !loading && (
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
        </div>
      </CardContent>
    </Card>
  );
}; 