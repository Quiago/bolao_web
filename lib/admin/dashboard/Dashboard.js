import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { StatsWidget } from './components/StatsWidget';
import { RecentActivity } from './components/RecentActivity';
import { QuickActions } from './components/QuickActions';
import { AnalyticsChart } from './components/AnalyticsChart';
import { RecentPlaces } from './components/RecentPlaces';
import { RecentProducts } from './components/RecentProducts';
import { useDashboardData } from './hooks/useDashboardData';
import { Building2, Package, TrendingUp, Activity, RefreshCw, Plus, BarChart3, MapPin, ShoppingBag, Home, Store, Zap, Calculator } from 'lucide-react';

/**
 * Dashboard Component - Estructura reorganizada y limpia
 * Principio de Responsabilidad Única: Solo maneja la vista del dashboard
 * Nueva estructura: Header → Métricas → Vista Principal → Gestión de Contenido
 */
export const Dashboard = () => {
  const { places, products, loading, refreshData } = useDashboardData();

  // Calcular estadísticas principales
  const totalItems = places.total + products.total;
  const recentItems = places.items.length + products.items.length;

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Section - Fixed */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-6 py-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Panel de Control</h1>
            <p className="text-gray-600">Gestiona tus lugares y productos desde aquí</p>
          </div>
          <button
            onClick={refreshData}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Actualizando...' : 'Actualizar'}
          </button>
        </div>
      </div>

      {/* Main Content - Flexible */}
      <div className="flex-1 flex flex-col px-6 py-6 gap-6 overflow-hidden">
        
        {/* Métricas - Flex responsive */}
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[250px]">
            <StatsWidget
              title="Total de Elementos"
              value={totalItems}
              icon={Calculator}
              color="bg-gradient-to-r from-blue-500 to-blue-600"
              loading={loading}
              subtitle="Lugares + Productos"
            />
          </div>
          <div className="flex-1 min-w-[250px]">
            <StatsWidget
              title="Lugares Registrados"
              value={places.total}
              icon={Home}
              color="bg-gradient-to-r from-green-500 to-green-600"
              loading={loading}
              subtitle="Total en el sistema"
            />
          </div>
          <div className="flex-1 min-w-[250px]">
            <StatsWidget
              title="Productos Disponibles"
              value={products.total}
              icon={Store}
              color="bg-gradient-to-r from-purple-500 to-purple-600"
              loading={loading}
              subtitle="Total en el catálogo"
            />
          </div>
          <div className="flex-1 min-w-[250px]">
            <StatsWidget
              title="Elementos Recientes"
              value={recentItems}
              icon={Zap}
              color="bg-gradient-to-r from-orange-500 to-orange-600"
              loading={loading}
              subtitle="Últimos registros"
            />
          </div>
        </div>

        {/* Vista Principal - Flex dinámico */}
        <div className="flex flex-1 gap-6 min-h-0">
          {/* Panel de Análisis - Toma la mayor parte del espacio */}
          <div className="flex-[2] min-w-0">
            <Card className="shadow-lg border-0 bg-white h-full flex flex-col">
              <CardHeader className="flex-shrink-0 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  Análisis y Estadísticas
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 p-6 overflow-auto">
                <AnalyticsChart 
                  places={places.items} 
                  products={products.items} 
                  loading={loading} 
                />
              </CardContent>
            </Card>
          </div>

          {/* Panel Lateral - Sidebar flex */}
          <div className="flex-[1] min-w-[320px] max-w-[400px] flex flex-col gap-6">
            <Card className="shadow-lg border-0 bg-white flex-1">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-green-500 rounded-lg">
                    <Plus className="w-4 h-4 text-white" />
                  </div>
                  Acciones Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 overflow-auto">
                <QuickActions />
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-white flex-1">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 border-b">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500 rounded-lg">
                    <Activity className="w-4 h-4 text-white" />
                  </div>
                  Actividad Reciente
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 overflow-auto">
                <RecentActivity 
                  places={places.items} 
                  products={products.items} 
                  loading={loading} 
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Gestión de Contenido - Flex dinámico */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex-1"></div>
            <h2 className="text-lg font-semibold text-gray-800 px-4 whitespace-nowrap">Gestión de Contenido</h2>
            <div className="h-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex-1"></div>
          </div>
          
          <div className="flex gap-6 h-80">
            <Card className="shadow-lg border-0 bg-white flex-1 group hover:shadow-xl transition-shadow duration-300 flex flex-col">
              <CardHeader className="flex-shrink-0 bg-gradient-to-r from-blue-50 to-cyan-50 border-b">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-3 bg-blue-500 rounded-xl group-hover:bg-blue-600 transition-colors">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <span className="text-lg">Lugares</span>
                    <p className="text-sm text-gray-500 font-normal">Últimos registros</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 p-6 overflow-auto">
                <RecentPlaces 
                  places={places.items} 
                  loading={loading} 
                  error={places.error} 
                />
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-white flex-1 group hover:shadow-xl transition-shadow duration-300 flex flex-col">
              <CardHeader className="flex-shrink-0 bg-gradient-to-r from-green-50 to-emerald-50 border-b">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-3 bg-green-500 rounded-xl group-hover:bg-green-600 transition-colors">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <span className="text-lg">Productos</span>
                    <p className="text-sm text-gray-500 font-normal">Últimos registros</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 p-6 overflow-auto">
                <RecentProducts 
                  products={products.items} 
                  loading={loading} 
                  error={products.error} 
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}; 