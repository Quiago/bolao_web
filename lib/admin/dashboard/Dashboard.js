import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { StatsWidget } from './components/StatsWidget';
import { RecentActivity } from './components/RecentActivity';
import { QuickActions } from './components/QuickActions';
import { AnalyticsChart } from './components/AnalyticsChart';
import { Building2, Package, TrendingUp, Users } from 'lucide-react';

/**
 * Dashboard Component
 * Principio de Responsabilidad Única: Solo maneja la vista del dashboard
 * Principio de Composición: Compuesto por widgets especializados
 */
export const Dashboard = () => {
  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          Bienvenido al panel de administración
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsWidget
          title="Total Lugares"
          value="0"
          icon={Building2}
          color="bg-blue-500"
          resource="places"
        />
        <StatsWidget
          title="Total Productos"
          value="0"
          icon={Package}
          color="bg-green-500"
          resource="products"
        />
        <StatsWidget
          title="Crecimiento"
          value="+12%"
          icon={TrendingUp}
          color="bg-purple-500"
          trend="+12%"
        />
        <StatsWidget
          title="Visitas"
          value="1,234"
          icon={Users}
          color="bg-orange-500"
          trend="+5%"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Analytics Chart */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Análisis de Actividad
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AnalyticsChart />
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <QuickActions />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actividad Reciente</CardTitle>
            </CardHeader>
            <CardContent>
              <RecentActivity />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Lugares Recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Sin lugares registrados</p>
                  <p className="text-sm text-gray-500">Crea tu primer lugar</p>
                </div>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  Crear Lugar
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Productos Recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Sin productos registrados</p>
                  <p className="text-sm text-gray-500">Añade tu primer producto</p>
                </div>
                <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                  Crear Producto
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}; 