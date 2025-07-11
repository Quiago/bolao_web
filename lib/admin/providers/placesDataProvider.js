import { ApiService } from '../services/apiService';
import { DataTransformer } from '../utils/dataTransformer';

/**
 * Places Data Provider
 * Principio de Responsabilidad Única: Solo maneja operaciones de Places
 * Principio de Inversión de Dependencias: Depende de abstracciones (ApiService)
 */
export const PlacesDataProvider = {
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
      if (filter?.verified !== undefined) {
        queryParams.append('verified', filter.verified);
      }
      if (filter?.address) {
        queryParams.append('address', filter.address);
      }

      const response = await ApiService.get(`/api/places?${queryParams}`);
      
      return {
        data: response.places.map(place => DataTransformer.transformPlace(place)),
        total: response.meta.totalItems
      };
    } catch (error) {
      throw new Error(`Error fetching places: ${error.message}`);
    }
  },

  async getOne(params) {
    try {
      const response = await ApiService.get(`/api/places/${params.id}`);
      return {
        data: DataTransformer.transformPlace(response.place)
      };
    } catch (error) {
      throw new Error(`Error fetching place: ${error.message}`);
    }
  },

  async getMany(params) {
    try {
      const promises = params.ids.map(id => 
        ApiService.get(`/api/places/${id}`)
      );
      const responses = await Promise.all(promises);
      
      return {
        data: responses.map(response => DataTransformer.transformPlace(response.place))
      };
    } catch (error) {
      throw new Error(`Error fetching places: ${error.message}`);
    }
  },

  async getManyReference(params) {
    // Implementar si es necesario para referencias
    return this.getList(params);
  },

  async create(params) {
    try {
      const transformedData = DataTransformer.transformPlaceForApi(params.data);
      const response = await ApiService.post('/api/places', transformedData);
      
      return {
        data: DataTransformer.transformPlace(response.place)
      };
    } catch (error) {
      throw new Error(`Error creating place: ${error.message}`);
    }
  },

  async update(params) {
    try {
      const transformedData = DataTransformer.transformPlaceForApi(params.data);
      const response = await ApiService.put('/api/places', {
        id: params.id,
        ...transformedData
      });
      
      return {
        data: DataTransformer.transformPlace(response.place)
      };
    } catch (error) {
      throw new Error(`Error updating place: ${error.message}`);
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
      throw new Error(`Error updating places: ${error.message}`);
    }
  },

  async delete(params) {
    try {
      await ApiService.delete('/api/places', { id: params.id });
      return {
        data: { id: params.id }
      };
    } catch (error) {
      throw new Error(`Error deleting place: ${error.message}`);
    }
  },

  async deleteMany(params) {
    try {
      const promises = params.ids.map(id =>
        ApiService.delete('/api/places', { id })
      );
      await Promise.all(promises);
      
      return {
        data: params.ids
      };
    } catch (error) {
      throw new Error(`Error deleting places: ${error.message}`);
    }
  }
}; 