import React from 'react';
import { Menu, DashboardMenuItem, MenuItemLink, useGetIdentity } from 'react-admin';
import { Building2, Package, BarChart3, Settings, Home } from 'lucide-react';

/**
 * Custom Menu Component
 * Principio de Responsabilidad Única: Solo maneja el menú de navegación
 * Incluye iconos personalizados y organización lógica
 */
export const CustomMenu = (props) => {
  const { data: identity } = useGetIdentity();
  
  return (
    <Menu {...props}>
      <DashboardMenuItem 
        leftIcon={<Home className="w-5 h-5" />}
        primaryText="Dashboard"
        className="mb-2"
      />
      
      <MenuItemLink
        to="/places"
        primaryText="Lugares"
        leftIcon={<Building2 className="w-5 h-5" />}
        className="mb-2"
      />
      
      <MenuItemLink
        to="/products"
        primaryText="Productos"
        leftIcon={<Package className="w-5 h-5" />}
        className="mb-2"
      />
      
      <div className="border-t border-gray-200 my-4" />
      
      <MenuItemLink
        to="/analytics"
        primaryText="Análisis"
        leftIcon={<BarChart3 className="w-5 h-5" />}
        className="mb-2"
      />
      
      <MenuItemLink
        to="/settings"
        primaryText="Configuración"
        leftIcon={<Settings className="w-5 h-5" />}
        className="mb-2"
      />
      
      {identity && (
        <div className="mt-8 p-4 bg-orange-50 rounded-lg mx-4">
          <div className="text-sm text-orange-800">
            <div className="font-medium">{identity.fullName}</div>
            <div className="text-xs text-orange-600">{identity.email}</div>
          </div>
        </div>
      )}
    </Menu>
  );
}; 