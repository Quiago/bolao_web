import React from 'react';
import { Sidebar } from 'react-admin';

/**
 * Custom Sidebar Component
 * Principio de Responsabilidad Única: Solo maneja el sidebar
 * Responsive y desplegable
 */
export const CustomSidebar = (props) => (
  <Sidebar
    {...props}
    className="bg-gray-50 border-r border-gray-200"
    sx={{
      '& .RaSidebar-fixed': {
        backgroundColor: '#f9fafb',
        borderRight: '1px solid #e5e7eb',
      },
      '& .RaMenu-root': {
        marginTop: '1rem',
      },
    }}
  />
); 