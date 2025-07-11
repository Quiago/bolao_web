import React from 'react';
import {
  Show,
  SimpleShowLayout,
  TextField,
  NumberField,
  BooleanField,
  DateField,
  useRecordContext,
  EditButton,
  DeleteButton,
  TopToolbar
} from 'react-admin';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Package, Euro, Warehouse, CheckCircle, XCircle, Image } from 'lucide-react';
import { DataTransformer } from '../../utils/dataTransformer';

/**
 * Products Show Component
 * Principio de Responsabilidad Única: Solo muestra detalles de productos
 */

const ShowActions = () => (
  <TopToolbar>
    <EditButton />
    <DeleteButton />
  </TopToolbar>
);

const ShowTitle = () => {
  const record = useRecordContext();
  return record ? `${record.product_name}` : 'Producto';
};

const ProductImage = () => {
  const record = useRecordContext();
  if (!record?.image_url) return null;
  
  return (
    <div className="mb-4">
      <img 
        src={record.image_url} 
        alt={record.product_name}
        className="w-full h-48 object-cover rounded-lg"
        onError={(e) => {
          e.target.style.display = 'none';
        }}
      />
    </div>
  );
};

const PriceDisplay = () => {
  const record = useRecordContext();
  if (!record) return null;
  
  return (
    <div className="text-3xl font-bold text-green-600">
      {DataTransformer.transformPriceForDisplay(record.price)}
    </div>
  );
};

const StockStatus = () => {
  const record = useRecordContext();
  if (!record) return null;
  
  const stockLevel = record.stock_quantity;
  let statusColor = 'text-green-600';
  let statusText = 'Stock disponible';
  
  if (stockLevel === 0) {
    statusColor = 'text-red-600';
    statusText = 'Agotado';
  } else if (stockLevel < 10) {
    statusColor = 'text-yellow-600';
    statusText = 'Stock bajo';
  }
  
  return (
    <div className={`font-medium ${statusColor}`}>
      {stockLevel} unidades - {statusText}
    </div>
  );
};

export const ProductsShow = () => {
  return (
    <Show title={<ShowTitle />} actions={<ShowActions />}>
      <SimpleShowLayout>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información principal */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Información del Producto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <ProductImage />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Nombre</label>
                    <TextField source="product_name" className="text-xl font-semibold" />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Categoría</label>
                    <TextField source="category" className="capitalize" />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Descripción</label>
                  <TextField source="description" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Euro className="w-5 h-5" />
                  Información Comercial
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Precio</label>
                    <PriceDisplay />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Disponibilidad</label>
                    <BooleanField 
                      source="available" 
                      render={({ record }) => (
                        <div className="flex items-center gap-2">
                          {record.available ? (
                            <>
                              <CheckCircle className="w-5 h-5 text-green-500" />
                              <span className="text-green-600 font-medium">Disponible</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-5 h-5 text-red-500" />
                              <span className="text-red-600 font-medium">No disponible</span>
                            </>
                          )}
                        </div>
                      )}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Stock</label>
                  <StockStatus />
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Warehouse className="w-5 h-5" />
                  Gestión de Inventario
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    <NumberField source="stock_quantity" />
                  </div>
                  <div className="text-sm text-gray-600">Unidades en stock</div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Estado:</span>
                    <StockStatus />
                  </div>
                  <div className="flex justify-between">
                    <span>Disponible:</span>
                    <BooleanField 
                      source="available" 
                      render={({ record }) => (
                        <span className={record.available ? 'text-green-600' : 'text-red-600'}>
                          {record.available ? 'Sí' : 'No'}
                        </span>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Información del Sistema</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Fecha de creación</label>
                  <DateField source="created_at" showTime locales="es-ES" />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Última actualización</label>
                  <DateField source="updated_at" showTime locales="es-ES" />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">ID del producto</label>
                  <TextField source="id" className="font-mono text-sm" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SimpleShowLayout>
    </Show>
  );
}; 