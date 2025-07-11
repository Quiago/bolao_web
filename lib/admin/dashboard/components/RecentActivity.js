import React from 'react';
import { Clock, Building2, Package, Edit, Trash2 } from 'lucide-react';

/**
 * RecentActivity Component
 * Principio de Responsabilidad Única: Solo muestra actividad reciente
 */
export const RecentActivity = () => {
  // Por ahora mostramos actividad simulada
  // En el futuro se puede integrar con un sistema de logs
  const activities = [
    {
      id: 1,
      type: 'create',
      resource: 'place',
      title: 'Lugar creado',
      description: 'Nuevo lugar "Restaurante Central"',
      time: '2 horas',
      icon: Building2,
      color: 'text-blue-500'
    },
    {
      id: 2,
      type: 'update',
      resource: 'product',
      title: 'Producto actualizado',
      description: 'Precio de "Pizza Margarita" modificado',
      time: '4 horas',
      icon: Edit,
      color: 'text-green-500'
    },
    {
      id: 3,
      type: 'create',
      resource: 'product',
      title: 'Producto creado',
      description: 'Nuevo producto "Hamburguesa Clásica"',
      time: '1 día',
      icon: Package,
      color: 'text-purple-500'
    },
    {
      id: 4,
      type: 'delete',
      resource: 'place',
      title: 'Lugar eliminado',
      description: 'Lugar "Café Antiguo" fue eliminado',
      time: '2 días',
      icon: Trash2,
      color: 'text-red-500'
    }
  ];

  return (
    <div className="space-y-4">
      {activities.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No hay actividad reciente</p>
        </div>
      ) : (
        activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className={`flex-shrink-0 p-2 rounded-full bg-white ${activity.color}`}>
              <activity.icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{activity.title}</p>
              <p className="text-sm text-gray-600 truncate">{activity.description}</p>
              <div className="flex items-center gap-1 mt-1">
                <Clock className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-500">hace {activity.time}</span>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}; 