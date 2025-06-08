/**
 * Este archivo maneja el servicio de espacios culturales
 * - Servicios
 * - Espacios
 * - CRUD
 */

import axios from 'axios';
import { BACKEND_URL } from '../../../../constants/config';

export const CulturalSpaceService = {
  getSpaceById: async (spaceId) => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/cultural-spaces/${spaceId}`);
      return response.data;
    } catch (error) {
      console.error('Error al cargar espacio cultural:', error);
      throw error;
    }
  },

  getAllSpaces: async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/cultural-spaces`);
      return response.data.spaces;
    } catch (error) {
      console.error('Error al cargar espacios culturales:', error);
      throw error;
    }
  },

  createSpace: async (spaceData) => {
    try {
      const formattedData = {
        ...spaceData,
        instalaciones: Array.isArray(spaceData.instalaciones) ? spaceData.instalaciones : [],
        images: Array.isArray(spaceData.images) ? spaceData.images : [],
        disponibilidad: Array.isArray(spaceData.disponibilidad) ? spaceData.disponibilidad : [],
        contacto: {
          email: spaceData.contacto?.email || '',
          telefono: spaceData.contacto?.telefono || ''
        },
        redesSociales: {
          facebook: spaceData.redesSociales?.facebook || '',
          instagram: spaceData.redesSociales?.instagram || '',
          twitter: spaceData.redesSociales?.twitter || ''
        }
      };
      
      console.log('Datos formateados para crear espacio:', formattedData);
      const response = await axios.post(`${BACKEND_URL}/api/cultural-spaces`, formattedData);
      return response.data;
    } catch (error) {
      console.error('Error al crear espacio cultural:', error);
      if (error.response && error.response.status === 500) {
        console.log('Error 500 al crear espacio, intentando enfoque alternativo...');
        try {
          if (spaceData.managerId) {
            const spaces = await CulturalSpaceService.getAllSpaces();
            const existingSpace = spaces.find(space => space.managerId === spaceData.managerId);
            
            if (existingSpace) {
              console.log('Espacio existente encontrado, actualizando en lugar de crear');
              return await CulturalSpaceService.updateSpace(existingSpace.id, spaceData);
            }
          }
        } catch (alternativeError) {
          console.error('Error en enfoque alternativo:', alternativeError);
        }
      }
      throw error;
    }
  },

  updateSpace: async (spaceId, spaceData) => {
    try {
      const response = await axios.put(`${BACKEND_URL}/api/cultural-spaces/${spaceId}`, spaceData);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar espacio cultural:', error);
      throw error;
    }
  },

  findSpaceByManagerId: async (managerId) => {
    try {
      const spaces = await CulturalSpaceService.getAllSpaces();
      return spaces.find(space => space.managerId === managerId);
    } catch (error) {
      console.error('Error al buscar espacio por managerId:', error);
      throw error;
    }
  }
};

export default CulturalSpaceService;
