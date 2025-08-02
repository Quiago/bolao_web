import React from 'react';
import {
  List,
  Datagrid,
  TextField,
  NumberField,
  BooleanField,
  DateField,
  EditButton,
  DeleteButton,
  ShowButton,
  CreateButton,
  ExportButton,
  FilterButton,
  SearchInput,
  SelectInput,
  TextInput,
  BooleanInput,
  NumberInput,
  TopToolbar,
  ImageField
} from 'react-admin';
import { Card, CardContent } from '../../../../components/ui/card';
import { DataTransformer } from '../../utils/dataTransformer';

/**
 * Products List Component
 * Principio de Responsabilidad Única: Solo maneja la lista de productos
 * Funcionalidades: Filtrado, paginación, ordenación, búsqueda
 */

// Tipos de productos
const productTypeChoices = [
  { id: 'food', name: 'Comida' },
  { id: 'drink', name: 'Bebida' },
  { id: 'dessert', name: 'Postre' },
  { id: 'product', name: 'Producto' },
  { id: 'service', name: 'Servicio' },
  { id: 'other', name: 'Otro' }
];

// Opciones de delivery/pickup
const availabilityChoices = [
  { id: 'yes', name: 'Sí' },
  { id: 'no', name: 'No' },
  { id: 'upon_request', name: 'Bajo pedido' }
];

// Filtros personalizados
const productsFilters = [
  <SearchInput key="search" source="q" placeholder="Buscar productos..." alwaysOn />,
  <SelectInput key="type" source="type" label="Tipo" choices={productTypeChoices} />,
  <TextInput key="location" source="location" label="Ubicación" />,
  <SelectInput key="delivery" source="delivery" label="Delivery" choices={availabilityChoices} />,
  <SelectInput key="pickup" source="pickup" label="Pickup" choices={availabilityChoices} />,
  <NumberInput key="min_price" source="price_gte" label="Precio mínimo" />,
  <NumberInput key="max_price" source="price_lte" label="Precio máximo" />
];

// Toolbar personalizada
const ListActions = () => (
  <TopToolbar>
    <FilterButton />
    <CreateButton />
    <ExportButton />
  </TopToolbar>
);

// Componente de lista vacía
const Empty = () => (
  <Card className="m-4">
    <CardContent className="text-center py-12">
      <div className="text-gray-500">
        <div className="text-6xl mb-4">📦</div>
        <h3 className="text-xl font-semibold mb-2">No hay productos registrados</h3>
        <p className="text-gray-600 mb-4">
          Comienza añadiendo tu primer producto para mostrar en tu lugar
        </p>
        <CreateButton label="Crear primer producto" />
      </div>
    </CardContent>
  </Card>
);

// Componente personalizado para mostrar precio
const PriceField = ({ record }) => {
  const numericPrice = record.product_price;
  const textPrice = record.price;
  
  return (
    <div className="font-semibold text-green-600">
      {numericPrice && (
        <div>${numericPrice}</div>
      )}
      {textPrice && (
        <div className="text-sm text-gray-600">{textPrice}</div>
      )}
    </div>
  );
};

// Componente personalizado para mostrar delivery/pickup
const DeliveryField = ({ record }) => {
  const hasDelivery = record.delivery === 'yes';
  const hasPickup = record.pickup === 'yes';
  
  return (
    <div className="text-sm">
      {hasDelivery && <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded mr-1">🚚 Delivery</span>}
      {hasPickup && <span className="bg-green-100 text-green-800 px-2 py-1 rounded">🏪 Pickup</span>}
      {!hasDelivery && !hasPickup && <span className="text-gray-400">No disponible</span>}
    </div>
  );
};

// Componente personalizado para mostrar puntuación
const ScoreField = ({ record }) => {
  if (!record.score) return <span className="text-gray-400">Sin puntuación</span>;
  
  return (
    <span className="font-medium text-yellow-600">
      ⭐ {record.score}
    </span>
  );
};

export const ProductsList = () => {
  return (
    <List
      filters={productsFilters}
      actions={<ListActions />}
      empty={<Empty />}
      perPage={25}
      sort={{ field: 'product_name', order: 'ASC' }}
      title="Gestión de Productos"
    >
      <Datagrid
        rowClick="show"
        bulkActionButtons={false}
        optimized
        className="bg-white"
      >
        <TextField source="name" label="Lugar" sortable />
        <TextField source="product_name" label="Producto" sortable />
        <TextField source="type" label="Tipo" sortable />
        <TextField source="location" label="Ubicación" />
        <NumberField 
          source="product_price" 
          label="Precio" 
          render={PriceField}
          sortable
        />
        <TextField 
          source="delivery" 
          label="Delivery/Pickup" 
          render={DeliveryField}
        />
        <TextField 
          source="score" 
          label="Puntuación" 
          render={ScoreField}
        />
        <div className="flex gap-2">
          <ShowButton />
          <EditButton />
          <DeleteButton />
        </div>
      </Datagrid>
    </List>
  );
}; 