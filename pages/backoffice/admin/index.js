import { Admin, Resource } from 'react-admin';
import { CustomDataProvider } from '../../../lib/admin/providers/dataProvider';
import { CustomAuthProvider } from '../../../lib/admin/providers/authProvider';
import { CustomLayout } from '../../../lib/admin/layout/CustomLayout';
import { customTheme } from '../../../lib/admin/theme/customTheme';
import { useEffect, useState } from 'react';

// Resources
import { PlacesList, PlacesCreate, PlacesEdit, PlacesShow } from '../../../lib/admin/resources/places';
import { ProductsList, ProductsCreate, ProductsEdit, ProductsShow } from '../../../lib/admin/resources/products';
import { Dashboard } from '../../../lib/admin/dashboard/Dashboard';

// Icons
import { Building2, Package } from 'lucide-react';

const AdminApp = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Solo renderizar React Admin en el cliente
  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando panel de administración...</p>
        </div>
      </div>
    );
  }

  return (
    <Admin
      dataProvider={CustomDataProvider}
      authProvider={CustomAuthProvider}
      layout={CustomLayout}
      theme={customTheme}
      dashboard={Dashboard}
      title="BOLAO Admin"
      disableTelemetry
      loginPage={false}
    >
      <Resource
        name="places"
        list={PlacesList}
        create={PlacesCreate}
        edit={PlacesEdit}
        show={PlacesShow}
        icon={Building2}
        options={{ label: 'Lugares' }}
      />
      <Resource
        name="products"
        list={ProductsList}
        create={ProductsCreate}
        edit={ProductsEdit}
        show={ProductsShow}
        icon={Package}
        options={{ label: 'Productos' }}
      />
    </Admin>
  );
};

// Deshabilitar SSR para esta página
AdminApp.getInitialProps = async () => {
  return {};
};

export default AdminApp; 