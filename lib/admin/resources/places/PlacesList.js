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

// Filtros personalizados
const placesFilters = [
  <SearchInput key="search" source="q" placeholder="Buscar lugares..." alwaysOn />,
  <TextInput key="category" source="category" label="Categoría" />,
  <SelectInput
    key="verified"
    source="verified"
    label="Verificado"
    choices={[
      { id: true, name: 'Verificado' },
      { id: false, name: 'No verificado' }
    ]}
  />,
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
        <TextField source="category" label="Categoría" sortable />
        <TextField source="address" label="Dirección" />
        <EmailField source="email" label="Email" />
        <TextField source="phone" label="Teléfono" />
        <NumberField
          source="rating"
          label="Calificación"
          options={{ minimumFractionDigits: 1, maximumFractionDigits: 1 }}
        />
        <BooleanField source="verified" label="Verificado" />
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