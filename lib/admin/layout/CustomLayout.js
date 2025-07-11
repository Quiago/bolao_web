import React from 'react';
import { Layout } from 'react-admin';
import { CustomAppBar } from './CustomAppBar';
import { CustomSidebar } from './CustomSidebar';
import { CustomMenu } from './CustomMenu';

/**
 * Custom Layout Component
 * Principio de Responsabilidad Única: Solo maneja la estructura del layout
 * Principio de Composición: Compuesto por componentes especializados
 */
export const CustomLayout = (props) => (
  <Layout
    {...props}
    appBar={CustomAppBar}
    sidebar={CustomSidebar}
    menu={CustomMenu}
  />
); 