import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Building2, Package, Settings, BarChart3 } from 'lucide-react';

/**
 * QuickActions Component
 * Principio de Responsabilidad Única: Solo maneja acciones rápidas de navegación
 */
export const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      id: 'create-place',
      title: 'Crear Lugar',
      description: 'Añadir nuevo lugar',
      icon: Building2,
      color: 'bg-blue-500 hover:bg-blue-600',
      onClick: () => navigate('/places/create')
    },
    {
      id: 'create-product',
      title: 'Crear Producto',
      description: 'Añadir nuevo producto',
      icon: Package,
      color: 'bg-green-500 hover:bg-green-600',
      onClick: () => navigate('/products/create')
    },
    {
      id: 'view-analytics',
      title: 'Ver Análisis',
      description: 'Estadísticas detalladas',
      icon: BarChart3,
      color: 'bg-purple-500 hover:bg-purple-600',
      onClick: () => navigate('/analytics')
    },
    {
      id: 'settings',
      title: 'Configuración',
      description: 'Ajustes del sistema',
      icon: Settings,
      color: 'bg-gray-500 hover:bg-gray-600',
      onClick: () => navigate('/settings')
    }
  ];

  return (
    <div className="space-y-3">
      {actions.map((action) => (
        <button
          key={action.id}
          onClick={action.onClick}
          className={`w-full flex items-center gap-3 p-3 rounded-lg text-white transition-colors duration-200 ${action.color}`}
        >
          <div className="flex-shrink-0">
            <action.icon className="w-5 h-5" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-medium">{action.title}</p>
            <p className="text-sm opacity-90">{action.description}</p>
          </div>
          <Plus className="w-4 h-4 opacity-75" />
        </button>
      ))}
    </div>
  );
}; 