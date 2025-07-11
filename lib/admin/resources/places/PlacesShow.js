import React from 'react';
import {
  Show,
  SimpleShowLayout,
  TextField,
  EmailField,
  UrlField,
  NumberField,
  BooleanField,
  DateField,
  useRecordContext,
  EditButton,
  DeleteButton,
  TopToolbar
} from 'react-admin';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { MapPin, Phone, Mail, Globe, Star, CheckCircle, XCircle } from 'lucide-react';

/**
 * Places Show Component
 * Principio de Responsabilidad Única: Solo muestra detalles de lugares
 * Diseño responsive con información bien organizada
 */

// Toolbar personalizada para acciones
const ShowActions = () => (
  <TopToolbar>
    <EditButton />
    <DeleteButton />
  </TopToolbar>
);

// Componente para mostrar el título con el nombre del lugar
const ShowTitle = () => {
  const record = useRecordContext();
  return record ? `${record.name}` : 'Lugar';
};

// Componente para mostrar la calificación con estrellas
const RatingDisplay = ({ rating }) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  
  for (let i = 0; i < fullStars; i++) {
    stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
  }
  
  if (hasHalfStar) {
    stars.push(<Star key="half" className="w-4 h-4 fill-yellow-400/50 text-yellow-400" />);
  }
  
  const emptyStars = 5 - Math.ceil(rating);
  for (let i = 0; i < emptyStars; i++) {
    stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />);
  }
  
  return (
    <div className="flex items-center gap-2">
      <div className="flex">{stars}</div>
      <span className="text-sm text-gray-600">({rating}/5)</span>
    </div>
  );
};

// Componente personalizado para mostrar información de contacto
const ContactInfo = () => {
  const record = useRecordContext();
  if (!record) return null;
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="w-5 h-5" />
          Información de Contacto
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {record.phone && (
          <div className="flex items-center gap-3">
            <Phone className="w-4 h-4 text-gray-500" />
            <span>{record.phone}</span>
          </div>
        )}
        
        {record.email && (
          <div className="flex items-center gap-3">
            <Mail className="w-4 h-4 text-gray-500" />
            <a href={`mailto:${record.email}`} className="text-blue-600 hover:underline">
              {record.email}
            </a>
          </div>
        )}
        
        {record.website && (
          <div className="flex items-center gap-3">
            <Globe className="w-4 h-4 text-gray-500" />
            <a href={record.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              {record.website}
            </a>
          </div>
        )}
        
        {record.address && (
          <div className="flex items-center gap-3">
            <MapPin className="w-4 h-4 text-gray-500" />
            <span>{record.address}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Componente para mostrar ubicación
const LocationInfo = () => {
  const record = useRecordContext();
  if (!record) return null;
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Ubicación
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Latitud</label>
            <p className="text-lg font-mono">{record.latitude}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Longitud</label>
            <p className="text-lg font-mono">{record.longitude}</p>
          </div>
        </div>
        
        <div className="mt-4">
          <a
            href={`https://www.google.com/maps?q=${record.latitude},${record.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <MapPin className="w-4 h-4" />
            Ver en Google Maps
          </a>
        </div>
      </CardContent>
    </Card>
  );
};

export const PlacesShow = () => {
  return (
    <Show title={<ShowTitle />} actions={<ShowActions />}>
      <SimpleShowLayout>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información principal */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Información General</span>
                  <BooleanField 
                    source="verified" 
                    render={({ record }) => (
                      <div className="flex items-center gap-2">
                        {record.verified ? (
                          <>
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <span className="text-green-600 font-medium">Verificado</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-5 h-5 text-red-500" />
                            <span className="text-red-600 font-medium">No verificado</span>
                          </>
                        )}
                      </div>
                    )}
                  />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Nombre</label>
                  <TextField source="name" className="text-xl font-semibold" />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Categoría</label>
                  <TextField source="category" className="capitalize" />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Descripción</label>
                  <TextField source="description" />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Calificación</label>
                  <NumberField 
                    source="rating" 
                    render={({ record }) => <RatingDisplay rating={record.rating} />}
                  />
                </div>
              </CardContent>
            </Card>
            
            <ContactInfo />
            <LocationInfo />
          </div>
          
          {/* Sidebar con información adicional */}
          <div className="space-y-6">
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
                  <label className="text-sm font-medium text-gray-600">ID del lugar</label>
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