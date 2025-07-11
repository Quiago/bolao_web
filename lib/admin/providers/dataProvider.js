import { PlacesDataProvider } from './placesDataProvider';
import { ProductsDataProvider } from './productsDataProvider';

/**
 * Custom Data Provider siguiendo principios SOLID
 * Principio de Responsabilidad Única: Cada resource tiene su propio data provider
 * Principio Abierto/Cerrado: Fácil de extender con nuevos recursos
 */
export const CustomDataProvider = {
  getList: (resource, params) => {
    switch (resource) {
      case 'places':
        return PlacesDataProvider.getList(params);
      case 'products':
        return ProductsDataProvider.getList(params);
      default:
        return Promise.reject(new Error(`Unknown resource: ${resource}`));
    }
  },

  getOne: (resource, params) => {
    switch (resource) {
      case 'places':
        return PlacesDataProvider.getOne(params);
      case 'products':
        return ProductsDataProvider.getOne(params);
      default:
        return Promise.reject(new Error(`Unknown resource: ${resource}`));
    }
  },

  getMany: (resource, params) => {
    switch (resource) {
      case 'places':
        return PlacesDataProvider.getMany(params);
      case 'products':
        return ProductsDataProvider.getMany(params);
      default:
        return Promise.reject(new Error(`Unknown resource: ${resource}`));
    }
  },

  getManyReference: (resource, params) => {
    switch (resource) {
      case 'places':
        return PlacesDataProvider.getManyReference(params);
      case 'products':
        return ProductsDataProvider.getManyReference(params);
      default:
        return Promise.reject(new Error(`Unknown resource: ${resource}`));
    }
  },

  create: (resource, params) => {
    switch (resource) {
      case 'places':
        return PlacesDataProvider.create(params);
      case 'products':
        return ProductsDataProvider.create(params);
      default:
        return Promise.reject(new Error(`Unknown resource: ${resource}`));
    }
  },

  update: (resource, params) => {
    switch (resource) {
      case 'places':
        return PlacesDataProvider.update(params);
      case 'products':
        return ProductsDataProvider.update(params);
      default:
        return Promise.reject(new Error(`Unknown resource: ${resource}`));
    }
  },

  updateMany: (resource, params) => {
    switch (resource) {
      case 'places':
        return PlacesDataProvider.updateMany(params);
      case 'products':
        return ProductsDataProvider.updateMany(params);
      default:
        return Promise.reject(new Error(`Unknown resource: ${resource}`));
    }
  },

  delete: (resource, params) => {
    switch (resource) {
      case 'places':
        return PlacesDataProvider.delete(params);
      case 'products':
        return ProductsDataProvider.delete(params);
      default:
        return Promise.reject(new Error(`Unknown resource: ${resource}`));
    }
  },

  deleteMany: (resource, params) => {
    switch (resource) {
      case 'places':
        return PlacesDataProvider.deleteMany(params);
      case 'products':
        return ProductsDataProvider.deleteMany(params);
      default:
        return Promise.reject(new Error(`Unknown resource: ${resource}`));
    }
  }
}; 