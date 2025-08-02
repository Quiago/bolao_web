import React from 'react';
import {
  Create,
  SimpleForm,
  TextInput,
  NumberInput,
  BooleanInput,
  SelectInput,
  ImageInput,
  ImageField,
  required,
  minValue,
  maxValue
} from 'react-admin';

/**
 * Products Create Component
 * Principio de Responsabilidad Única: Solo maneja la creación de productos
 * Incluye validaciones completas
 */

// Opciones de tipos para productos
const productTypeChoices = [
  { id: 'food', name: 'Comida' },
  { id: 'drink', name: 'Bebida' },
  { id: 'dessert', name: 'Postre' },
  { id: 'appetizer', name: 'Aperitivo' },
  { id: 'main_course', name: 'Plato Principal' },
  { id: 'side_dish', name: 'Acompañamiento' },
  { id: 'snack', name: 'Snack' },
  { id: 'alcohol', name: 'Bebida Alcohólica' },
  { id: 'coffee', name: 'Café' },
  { id: 'tea', name: 'Té' },
  { id: 'product', name: 'Producto' },
  { id: 'service', name: 'Servicio' },
  { id: 'other', name: 'Otro' }
];

// Opciones para delivery y pickup
const availabilityChoices = [
  { id: 'yes', name: 'Sí' },
  { id: 'no', name: 'No' },
  { id: 'upon_request', name: 'Bajo pedido' }
];

// Validaciones personalizadas
const validatePrice = [
  minValue(0, 'El precio debe ser mayor a 0')
];

const validateSlug = [
  required(),
  // Validar formato de slug (solo letras, números, guiones)
  (value) => {
    if (!/^[a-z0-9-]+$/.test(value)) {
      return 'El slug solo puede contener letras minúsculas, números y guiones';
    }
    return undefined;
  }
];

const validateUrl = (value) => {
  if (value && !/^https?:\/\/.+/.test(value)) {
    return 'URL debe comenzar con http:// o https://';
  }
  return undefined;
};

const validatePhone = (value) => {
  if (value && !/^[+]?[\d\s\-\(\)]+$/.test(value)) {
    return 'Formato de teléfono inválido';
  }
  return undefined;
};

const validateEmail = (value) => {
  if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return 'Formato de email inválido';
  }
  return undefined;
};

export const ProductsCreate = () => {
  return (
    <Create title="Crear Nuevo Producto">
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
              helperText="Nombre del lugar/negocio donde se vende el producto"
            />
            
            <TextInput
              source="product_slug"
              label="Slug del producto *"
              validate={validateSlug}
              fullWidth
              className="mb-4"
              helperText="Identificador único (ej: pizza-margarita-2024)"
            />
            
            <TextInput
              source="product_name"
              label="Nombre del producto"
              fullWidth
              className="mb-4"
            />
            
            <SelectInput
              source="type"
              label="Tipo"
              choices={productTypeChoices}
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
          </div>

          {/* Información de ubicación */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Ubicación y Contacto
            </h3>
            
            <TextInput
              source="location"
              label="Ubicación"
              fullWidth
              className="mb-4"
              helperText="Ej: La Habana, Centro Habana"
            />
            
            <TextInput
              source="address"
              label="Dirección"
              fullWidth
              className="mb-4"
            />
            
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
              validate={validateEmail}
              fullWidth
              className="mb-4"
            />
          </div>
        </div>

        {/* Información comercial */}
        <div className="mt-6 pt-6 border-t">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Información Comercial
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <NumberInput
              source="product_price"
              label="Precio (numérico)"
              validate={validatePrice}
              min={0}
              step={0.01}
              fullWidth
              className="mb-4"
            />
            
            <TextInput
              source="price"
              label="Precio (texto)"
              fullWidth
              className="mb-4"
              helperText="Ej: $15-20, Gratis, A consultar"
            />
            
            <TextInput
              source="score"
              label="Puntuación"
              fullWidth
              className="mb-4"
              helperText="Ej: 4.5/5, Excelente"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <SelectInput
              source="delivery"
              label="Delivery disponible"
              choices={availabilityChoices}
              fullWidth
              className="mb-4"
            />
            
            <SelectInput
              source="pickup"
              label="Pickup disponible"
              choices={availabilityChoices}
              fullWidth
              className="mb-4"
            />
          </div>
        </div>

        {/* Redes sociales y web */}
        <div className="mt-6 pt-6 border-t">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Presencia Online
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            
            <TextInput
              source="slug"
              label="Slug general"
              fullWidth
              className="mb-4"
              helperText="Slug general del producto/lugar"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <NumberInput
              source="latitude"
              label="Latitud"
              step={0.000001}
              fullWidth
              className="mb-4"
            />
            
            <NumberInput
              source="longitude"
              label="Longitud"
              step={0.000001}
              fullWidth
              className="mb-4"
            />
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Consejo:</strong> Los campos marcados con (*) son requeridos. 
              El slug del producto debe ser único y seguir el formato sugerido.
            </p>
          </div>
        </div>
      </SimpleForm>
    </Create>
  );
}; 