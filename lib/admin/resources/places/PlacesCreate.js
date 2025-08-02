import React from 'react';
import {
  Create,
  SimpleForm,
  TextInput,
  NumberInput,
  BooleanInput,
  SelectInput,
  required,
  email,
  minValue,
  maxValue,
  regex
} from 'react-admin';

/**
 * Places Create Component
 * Principio de Responsabilidad Única: Solo maneja la creación de lugares
 * Incluye validaciones completas
 */

// Opciones de tipos
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

// Validaciones personalizadas
const validatePhone = regex(/^[+]?[\d\s\-\(\)]+$/, 'Formato de teléfono inválido');
const validateUrl = regex(/^https?:\/\/.+/, 'URL debe comenzar con http:// o https://');
const validateLatitude = [
  minValue(-90, 'Latitud debe ser mayor a -90'),
  maxValue(90, 'Latitud debe ser menor a 90')
];
const validateLongitude = [
  minValue(-180, 'Longitud debe ser mayor a -180'),
  maxValue(180, 'Longitud debe ser menor a 180')
];
const validateScore = [
  minValue(0, 'La puntuación debe ser mayor a 0'),
  maxValue(5, 'La puntuación debe ser menor a 5')
];

export const PlacesCreate = () => {
  return (
    <Create title="Crear Nuevo Lugar">
      <SimpleForm>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {/* Información básica */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Información Básica
            </h3>
            
            <TextInput
              source="name"
              label="Nombre del lugar *"
              validate={required()}
              fullWidth
              className="mb-4"
            />
            
            <SelectInput
              source="type"
              label="Tipo *"
              choices={typeChoices}
              validate={required()}
              fullWidth
              className="mb-4"
            />
            
            <TextInput
              source="location"
              label="Ubicación *"
              validate={required()}
              fullWidth
              className="mb-4"
              helperText="Ej: La Habana, Centro Habana, etc."
            />
            
            <TextInput
              source="address"
              label="Dirección específica"
              fullWidth
              className="mb-4"
              helperText="Dirección completa (opcional)"
            />
          </div>

          {/* Información de contacto */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Información de Contacto
            </h3>
            
            <TextInput
              source="phone"
              label="Teléfono principal"
              validate={validatePhone}
              fullWidth
              className="mb-4"
            />
            
            <TextInput
              source="phone2"
              label="Teléfono secundario"
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
              source="web"
              label="Sitio web principal"
              validate={validateUrl}
              fullWidth
              className="mb-4"
            />
            
            <TextInput
              source="web2"
              label="Sitio web secundario"
              validate={validateUrl}
              fullWidth
              className="mb-4"
            />
          </div>
        </div>

        {/* Redes sociales */}
        <div className="mt-6 pt-6 border-t">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Redes Sociales
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextInput
              source="facebook"
              label="Facebook"
              fullWidth
              className="mb-4"
            />
            
            <TextInput
              source="instagram"
              label="Instagram"
              fullWidth
              className="mb-4"
            />
            
            <TextInput
              source="youtube"
              label="YouTube"
              fullWidth
              className="mb-4"
            />
            
            <TextInput
              source="telegram"
              label="Telegram"
              fullWidth
              className="mb-4"
            />
          </div>
        </div>

        {/* Información adicional */}
        <div className="mt-6 pt-6 border-t">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Información Adicional
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextInput
              source="logo"
              label="URL del logo"
              validate={validateUrl}
              fullWidth
              className="mb-4"
            />
            
            <NumberInput
              source="score"
              label="Puntuación inicial"
              min={0}
              max={5}
              step={0.1}
              validate={validateScore}
              fullWidth
              className="mb-4"
              defaultValue={0}
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
          
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Consejo:</strong> Puedes obtener las coordenadas exactas usando Google Maps. 
              Haz clic derecho en el lugar y selecciona las coordenadas que aparecen.
            </p>
          </div>
        </div>
      </SimpleForm>
    </Create>
  );
}; 