# BOLAO Admin Panel Setup

## Descripción
Panel de administración completo construido con React Admin siguiendo principios SOLID y clean code.

## Características
- ✅ **Dashboard** con métricas y widgets interactivos
- ✅ **Gestión de Lugares** con CRUD completo, filtros, paginación y ordenación
- ✅ **Gestión de Productos** con CRUD completo, filtros, paginación y ordenación
- ✅ **Sidebar responsive** y desplegable
- ✅ **Tema personalizado** integrado con Tailwind CSS
- ✅ **Autenticación** con JWT tokens
- ✅ **Arquitectura modular** siguiendo principios SOLID

## Instalación de Dependencias

Para completar la instalación, ejecuta:

```bash
npm install @mui/material @mui/icons-material @emotion/react @emotion/styled
```

## Estructura del Proyecto

```
lib/admin/
├── providers/
│   ├── dataProvider.js          # Data provider principal
│   ├── placesDataProvider.js    # Provider específico para lugares
│   ├── productsDataProvider.js  # Provider específico para productos
│   └── authProvider.js          # Provider de autenticación
├── resources/
│   ├── places/
│   │   ├── PlacesList.js        # Lista de lugares
│   │   ├── PlacesCreate.js      # Formulario de creación
│   │   ├── PlacesEdit.js        # Formulario de edición
│   │   └── PlacesShow.js        # Vista de detalle
│   └── products/
│       ├── ProductsList.js      # Lista de productos
│       ├── ProductsCreate.js    # Formulario de creación
│       ├── ProductsEdit.js      # Formulario de edición
│       └── ProductsShow.js      # Vista de detalle
├── dashboard/
│   ├── Dashboard.js             # Dashboard principal
│   └── components/
│       ├── StatsWidget.js       # Widget de estadísticas
│       ├── QuickActions.js      # Acciones rápidas
│       ├── RecentActivity.js    # Actividad reciente
│       └── AnalyticsChart.js    # Gráfico de análisis
├── layout/
│   ├── CustomLayout.js          # Layout principal
│   ├── CustomAppBar.js          # Barra superior
│   ├── CustomSidebar.js         # Sidebar
│   └── CustomMenu.js            # Menú de navegación
├── services/
│   └── apiService.js            # Servicio HTTP centralizado
├── utils/
│   └── dataTransformer.js       # Transformaciones de datos
└── theme/
    └── customTheme.js           # Tema personalizado
```

## Principios SOLID Aplicados

### 1. Single Responsibility Principle (SRP)
- Cada componente tiene una única responsabilidad
- Data providers separados por recurso
- Servicios especializados (API, transformaciones)

### 2. Open/Closed Principle (OCP)
- Fácil extensión con nuevos recursos
- Arquitectura modular que permite agregar funcionalidades

### 3. Liskov Substitution Principle (LSP)
- Interfaces consistentes en todos los data providers
- Componentes intercambiables

### 4. Interface Segregation Principle (ISP)
- Interfaces específicas para cada tipo de operación
- Separación clara entre responsabilidades

### 5. Dependency Inversion Principle (DIP)
- Dependencias de abstracciones, no de concreciones
- Servicios inyectados mediante imports

## Funcionalidades Implementadas

### Dashboard
- Widgets de estadísticas con datos en tiempo real
- Gráfico de análisis con datos históricos
- Acciones rápidas para navegación
- Actividad reciente del sistema

### Gestión de Lugares
- **Lista**: Filtros por categoría, verificación, dirección
- **Crear**: Formulario completo con validaciones
- **Editar**: Formulario con datos precargados
- **Ver**: Vista detallada con información completa
- **Validaciones**: Email, teléfono, coordenadas, URLs

### Gestión de Productos
- **Lista**: Filtros por categoría, disponibilidad, precio, stock
- **Crear**: Formulario completo con validaciones
- **Editar**: Formulario con datos precargados
- **Ver**: Vista detallada con gestión de inventario
- **Validaciones**: Precios, stock, disponibilidad

### Características Técnicas
- **Responsive**: Adaptable a todos los dispositivos
- **Filtros**: Búsqueda, filtros específicos por campo
- **Paginación**: Navegación eficiente de grandes datasets
- **Ordenación**: Ordenación por cualquier campo
- **Validaciones**: Validaciones completas en formularios
- **Autenticación**: Sistema seguro con JWT
- **Tema**: Integración perfecta con Tailwind CSS

## Cómo Usar

1. **Acceso**: Navega a `/backoffice/login`
2. **Login**: Usa tus credenciales de negocio
3. **Dashboard**: Vista general del sistema
4. **Lugares**: Gestiona tus ubicaciones
5. **Productos**: Administra tu inventario

## Próximas Mejoras

- [ ] Sistema de notificaciones
- [ ] Exportación de datos
- [ ] Análisis avanzados
- [ ] Gestión de imágenes
- [ ] Roles y permisos
- [ ] Historial de cambios

## Soporte

Para cualquier duda o problema, revisa la documentación de React Admin: https://marmelab.com/react-admin/ 