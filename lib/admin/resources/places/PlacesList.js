import React from 'react';
import {
  List,
  Datagrid,
  TextField,
  EmailField,
  UrlField,
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
  TopToolbar,
  useListContext
} from 'react-admin';
import { Card, CardContent } from '../../../../components/ui/card';

/**
 * Places List Component
 * Principio de Responsabilidad Única: Solo maneja la lista de lugares
 * Funcionalidades: Filtrado, paginación, ordenación, búsqueda
 */

// Tipos de lugares
const typeChoices = [
  { id: 'restaurant', name: 'Restaurante' },
  { id: 'cafe', name: 'Café' },
  { id: 'bar', name: 'Bar' },
  { id: 'hotel', name: 'Hotel' },
  { id: 'shop', name: 'Tienda' },
  { id: 'service', name: 'Servicio' },
  { id: 'entertainment', name: 'Entretenimiento' },
  { id: 'bakery', name: 'Panadería' },
  { id: 'market', name: 'Mercado' },
  { id: 'pharmacy', name: 'Farmacia' },
  { id: 'other', name: 'Otro' }
];

// Filtros personalizados
const placesFilters = [
  <SearchInput key="search" source="q" placeholder="Buscar lugares..." alwaysOn />,
  <SelectInput key="type" source="type" label="Tipo" choices={typeChoices} />,
  <TextInput key="location" source="location" label="Ubicación" />,
  <TextInput key="address" source="address" label="Dirección" />
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
        <div className="text-6xl mb-4">🏢</div>
        <h3 className="text-xl font-semibold mb-2">No hay lugares registrados</h3>
        <p className="text-gray-600 mb-4">
          Comienza creando tu primer lugar para mostrar en el mapa
        </p>
        <CreateButton label="Crear primer lugar" />
      </div>
    </CardContent>
  </Card>
);

export const PlacesList = () => {
  return (
    <List
      filters={placesFilters}
      actions={<ListActions />}
      empty={<Empty />}
      perPage={25}
      sort={{ field: 'created_at', order: 'DESC' }}
      title="Gestión de Lugares"
    >
      <Datagrid
        rowClick="show"
        bulkActionButtons={false}
        optimized
        className="bg-white"
      >
        <TextField source="name" label="Nombre" sortable />
        <TextField source="type" label="Tipo" sortable />
        <TextField source="location" label="Ubicación" sortable />
        <TextField source="address" label="Dirección" />
        <EmailField source="email" label="Email" />
        <TextField source="phone" label="Teléfono" />
        <TextField source="phone2" label="Tel. 2" />
        <NumberField
          source="score"
          label="Puntuación"
          options={{ minimumFractionDigits: 1, maximumFractionDigits: 1 }}
        />
        <NumberField source="total_reviews" label="Reseñas" />
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