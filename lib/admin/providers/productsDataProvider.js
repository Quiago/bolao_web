import { ApiService } from '../services/apiService';
import { DataTransformer } from '../utils/dataTransformer';

/**
 * Products Data Provider
 * Principio de Responsabilidad Única: Solo maneja operaciones de Products
 * Principio de Inversión de Dependencias: Depende de abstracciones (ApiService)
 */
export const ProductsDataProvider = {
  async getList(params) {
    try {
      const { pagination, sort, filter } = params;
      const page = pagination?.page || 1;
      const perPage = pagination?.perPage || 10;

      const queryParams = new URLSearchParams({
        page: page.toString(),
        pageSize: perPage.toString()
      });

      // Agregar filtros de búsqueda si existen
      if (filter?.q) {
        queryParams.append('search', filter.q);
      }
      if (filter?.category) {
        queryParams.append('category', filter.category);
      }
      if (filter?.available !== undefined) {
        queryParams.append('available', filter.available);
      }
      if (filter?.price_gte) {
        queryParams.append('price_gte', filter.price_gte);
      }
      if (filter?.price_lte) {
        queryParams.append('price_lte', filter.price_lte);
      }
      if (filter?.stock_quantity_gte) {
        queryParams.append('stock_quantity_gte', filter.stock_quantity_gte);
      }

      const response = await ApiService.get(`/api/products?${queryParams}`);
      
      return {
        data: response.products.map(product => DataTransformer.transformProduct(product)),
        total: response.meta.totalItems
      };
    } catch (error) {
      throw new Error(`Error fetching products: ${error.message}`);
    }
  },

  async getOne(params) {
    try {
      const response = await ApiService.get(`/api/products/${params.id}`);
      return {
        data: DataTransformer.transformProduct(response.product)
      };
    } catch (error) {
      throw new Error(`Error fetching product: ${error.message}`);
    }
  },

  async getMany(params) {
    try {
      const promises = params.ids.map(id => 
        ApiService.get(`/api/products/${id}`)
      );
      const responses = await Promise.all(promises);
      
      return {
        data: responses.map(response => DataTransformer.transformProduct(response.product))
      };
    } catch (error) {
      throw new Error(`Error fetching products: ${error.message}`);
    }
  },

  async getManyReference(params) {
    // Implementar si es necesario para referencias
    return this.getList(params);
  },

  async create(params) {
    try {
      const transformedData = DataTransformer.transformProductForApi(params.data);
      const response = await ApiService.post('/api/products', transformedData);
      
      return {
        data: DataTransformer.transformProduct(response.product)
      };
    } catch (error) {
      throw new Error(`Error creating product: ${error.message}`);
    }
  },

  async update(params) {
    try {
      const transformedData = DataTransformer.transformProductForApi(params.data);
      const response = await ApiService.put('/api/products', {
        id: params.id,
        ...transformedData
      });
      
      return {
        data: DataTransformer.transformProduct(response.product)
      };
    } catch (error) {
      throw new Error(`Error updating product: ${error.message}`);
    }
  },

  async updateMany(params) {
    try {
      const promises = params.ids.map(id =>
        this.update({ id, data: params.data })
      );
      const responses = await Promise.all(promises);
      
      return {
        data: responses.map(response => response.data.id)
      };
    } catch (error) {
      throw new Error(`Error updating products: ${error.message}`);
    }
  },

  async delete(params) {
    try {
      await ApiService.delete('/api/products', { id: params.id });
      return {
        data: { id: params.id }
      };
    } catch (error) {
      throw new Error(`Error deleting product: ${error.message}`);
    }
  },

  async deleteMany(params) {
    try {
      const promises = params.ids.map(id =>
        ApiService.delete('/api/products', { id })
      );
      await Promise.all(promises);
      
      return {
        data: params.ids
      };
    } catch (error) {
      throw new Error(`Error deleting products: ${error.message}`);
    }
  }
}; 