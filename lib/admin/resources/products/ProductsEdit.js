import React from 'react';
import {
  Edit,
  SimpleForm,
  TextInput,
  NumberInput,
  BooleanInput,
  SelectInput,
  required,
  minValue,
  useRecordContext
} from 'react-admin';

/**
 * Products Edit Component
 * Principio de Responsabilidad Única: Solo maneja la edición de productos
 */

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

const validatePrice = [
  required(),
  minValue(0, 'El precio debe ser mayor a 0')
];

const validateStock = [
  required(),
  minValue(0, 'El stock no puede ser negativo')
];

const EditTitle = () => {
  const record = useRecordContext();
  return record ? `Editar "${record.product_name}"` : 'Editar Producto';
};

export const ProductsEdit = () => {
  return (
    <Edit title={<EditTitle />}>
      <SimpleForm>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
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
            />
          </div>

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
              className="mb-4"
            />
          </div>
        </div>

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