import React from 'react';
import { AppBar, UserMenu, useGetIdentity } from 'react-admin';
import { Typography } from '@mui/material';
import { Building2 } from 'lucide-react';

/**
 * Custom AppBar Component
 * Principio de Responsabilidad Única: Solo maneja la barra superior
 */

const CustomUserMenu = () => <UserMenu />;

export const CustomAppBar = () => {
  const { data: identity } = useGetIdentity();
  
  return (
    <AppBar 
      userMenu={<CustomUserMenu />}
      className="bg-white shadow-sm border-b"
    >
      <div className="flex items-center gap-3 flex-1">
        <div className="flex items-center gap-2">
          <Building2 className="w-8 h-8 text-orange-600" />
          <div>
            <Typography variant="h6" className="text-gray-900 font-bold">
              BOLAO Admin
            </Typography>
            <Typography variant="caption" className="text-gray-600">
              Panel de administración
            </Typography>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {identity && (
          <div className="text-right">
            <Typography variant="body2" className="text-gray-900 font-medium">
              {identity.fullName}
            </Typography>
            <Typography variant="caption" className="text-gray-600">
              {identity.email}
            </Typography>
          </div>
        )}
      </div>
    </AppBar>
  );
}; 