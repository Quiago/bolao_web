import React from 'react';
import {
  Edit,
  SimpleForm,
  TextInput,
  NumberInput,
  BooleanInput,
  SelectInput,
  required,
  email,
  minValue,
  maxValue,
  regex,
  useRecordContext
} from 'react-admin';

/**
 * Places Edit Component
 * Principio de Responsabilidad Única: Solo maneja la edición de lugares
 * Reutiliza validaciones del componente Create
 */

// Opciones de categorías (reutilizadas)
const categoryChoices = [
  { id: 'restaurant', name: 'Restaurante' },
  { id: 'cafe', name: 'Café' },
  { id: 'bar', name: 'Bar' },
  { id: 'hotel', name: 'Hotel' },
  { id: 'shop', name: 'Tienda' },
  { id: 'service', name: 'Servicio' },
  { id: 'entertainment', name: 'Entretenimiento' },
  { id: 'other', name: 'Otro' }
];

// Validaciones (reutilizadas)
const validatePhone = regex(/^[+]?[\d\s\-\(\)]+$/, 'Formato de teléfono inválido');
const validateUrl = regex(/^https?:\/\/.+/, 'URL debe comenzar con http:// o https://');
const validateLatitude = [
  required(),
  minValue(-90, 'Latitud debe ser mayor a -90'),
  maxValue(90, 'Latitud debe ser menor a 90')
];
const validateLongitude = [
  required(),
  minValue(-180, 'Longitud debe ser mayor a -180'),
  maxValue(180, 'Longitud debe ser menor a 180')
];

// Componente para mostrar el título con el nombre del lugar
const EditTitle = () => {
  const record = useRecordContext();
  return record ? `Editar "${record.name}"` : 'Editar Lugar';
};

export const PlacesEdit = () => {
  return (
    <Edit title={<EditTitle />}>
      <SimpleForm>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {/* Información básica */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Información Básica
            </h3>
            
            <TextInput
              source="name"
              label="Nombre del lugar"
              validate={required()}
              fullWidth
              className="mb-4"
            />
            
            <SelectInput
              source="category"
              label="Categoría"
              choices={categoryChoices}
              validate={required()}
              fullWidth
              className="mb-4"
            />
            
            <TextInput
              source="description"
              label="Descripción"
              multiline
              rows={4}
              fullWidth
              className="mb-4"
            />
            
            <TextInput
              source="address"
              label="Dirección"
              validate={required()}
              fullWidth
              className="mb-4"
            />
          </div>

          {/* Información de contacto */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Información de Contacto
            </h3>
            
            <TextInput
              source="phone"
              label="Teléfono"
              validate={validatePhone}
              fullWidth
              className="mb-4"
            />
            
            <TextInput
              source="email"
              label="Email"
              validate={email()}
              fullWidth
              className="mb-4"
            />
            
            <TextInput
              source="website"
              label="Sitio web"
              validate={validateUrl}
              fullWidth
              className="mb-4"
            />
            
            <NumberInput
              source="rating"
              label="Calificación"
              min={0}
              max={5}
              step={0.1}
              validate={[minValue(0), maxValue(5)]}
              fullWidth
              className="mb-4"
            />
            
            <BooleanInput
              source="verified"
              label="Lugar verificado"
              className="mb-4"
            />
          </div>
        </div>

        {/* Coordenadas */}
        <div className="mt-6 pt-6 border-t">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Ubicación en el Mapa
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <NumberInput
              source="latitude"
              label="Latitud"
              validate={validateLatitude}
              step={0.000001}
              fullWidth
            />
            
            <NumberInput
              source="longitude"
              label="Longitud"
              validate={validateLongitude}
              step={0.000001}
              fullWidth
            />
          </div>
          
          <div className="mt-4 p-4 bg-amber-50 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>Nota:</strong> Cambiar las coordenadas afectará la posición del lugar en el mapa. 
              Asegúrate de que las coordenadas sean correctas antes de guardar.
            </p>
          </div>
        </div>

        {/* Información de auditoría */}
        <div className="mt-6 pt-6 border-t">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Información del Sistema
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextInput
              source="created_at"
              label="Fecha de creación"
              disabled
              fullWidth
            />
            
            <TextInput
              source="updated_at"
              label="Última actualización"
              disabled
              fullWidth
            />
          </div>
        </div>
      </SimpleForm>
    </Edit>
  );
}; 