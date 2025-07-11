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

// Filtros personalizados
const productsFilters = [
  <SearchInput key="search" source="q" placeholder="Buscar productos..." alwaysOn />,
  <TextInput key="category" source="category" label="Categoría" />,
  <SelectInput
    key="available"
    source="available"
    label="Disponible"
    choices={[
      { id: true, name: 'Disponible' },
      { id: false, name: 'No disponible' }
    ]}
  />,
  <NumberInput key="min_price" source="price_gte" label="Precio mínimo" />,
  <NumberInput key="max_price" source="price_lte" label="Precio máximo" />,
  <NumberInput key="min_stock" source="stock_quantity_gte" label="Stock mínimo" />
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
  return (
    <span className="font-semibold text-green-600">
      {DataTransformer.transformPriceForDisplay(record.price)}
    </span>
  );
};

// Componente personalizado para mostrar disponibilidad
const AvailabilityField = ({ record }) => {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${record.available ? 'bg-green-500' : 'bg-red-500'}`} />
      <span className={record.available ? 'text-green-600' : 'text-red-600'}>
        {record.available ? 'Disponible' : 'No disponible'}
      </span>
    </div>
  );
};

// Componente personalizado para mostrar stock
const StockField = ({ record }) => {
  const stockLevel = record.stock_quantity;
  let colorClass = 'text-green-600';
  
  if (stockLevel === 0) {
    colorClass = 'text-red-600';
  } else if (stockLevel < 10) {
    colorClass = 'text-yellow-600';
  }
  
  return (
    <span className={`font-medium ${colorClass}`}>
      {stockLevel} unidades
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
        <TextField source="product_name" label="Nombre" sortable />
        <TextField source="category" label="Categoría" sortable />
        <NumberField 
          source="price" 
          label="Precio" 
          render={PriceField}
          sortable
        />
        <BooleanField 
          source="available" 
          label="Disponible" 
          render={AvailabilityField}
        />
        <NumberField 
          source="stock_quantity" 
          label="Stock" 
          render={StockField}
          sortable
        />
        <DateField
          source="created_at"
          label="Creado"
          showTime
          locales="es-ES"
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