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

// Opciones de categorías para productos
const productCategoryChoices = [
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
  { id: 'other', name: 'Otro' }
];

// Validaciones personalizadas
const validatePrice = [
  required(),
  minValue(0, 'El precio debe ser mayor a 0')
];

const validateStock = [
  required(),
  minValue(0, 'El stock no puede ser negativo')
];

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
              source="product_name"
              label="Nombre del producto"
              validate={required()}
              fullWidth
              className="mb-4"
            />
            
            <SelectInput
              source="category"
              label="Categoría"
              choices={productCategoryChoices}
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
              source="image_url"
              label="URL de la imagen"
              fullWidth
              className="mb-4"
              helperText="URL de la imagen del producto (opcional)"
            />
          </div>

          {/* Información comercial */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Información Comercial
            </h3>
            
            <NumberInput
              source="price"
              label="Precio (€)"
              validate={validatePrice}
              min={0}
              step={0.01}
              fullWidth
              className="mb-4"
            />
            
            <NumberInput
              source="stock_quantity"
              label="Cantidad en stock"
              validate={validateStock}
              min={0}
              step={1}
              fullWidth
              className="mb-4"
            />
            
            <BooleanInput
              source="available"
              label="Producto disponible"
              defaultValue={true}
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
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">💡 Consejos para un buen producto</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Usa un nombre descriptivo y atractivo</li>
                <li>• Incluye una descripción detallada</li>
                <li>• Asegúrate de que el precio sea competitivo</li>
                <li>• Mantén el stock actualizado</li>
              </ul>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">📊 Gestión de inventario</h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Stock bajo: menos de 10 unidades</li>
                <li>• Producto agotado: 0 unidades</li>
                <li>• Puedes marcar como no disponible temporalmente</li>
                <li>• El stock se actualiza automáticamente</li>
              </ul>
            </div>
          </div>
        </div>
      </SimpleForm>
    </Create>
  );
}; 