import axios from 'axios';
import { BACKEND_URL } from '../../../../constants/config';

/**
 * Servicio para gestionar las operaciones relacionadas con artistas
 */
const ArtistService = {
  /**
   * Obtiene todos los artistas
   * @returns {Promise} Promesa con la respuesta de la API
   */
  getAllArtists: async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/artists/all`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener artistas:', error);
      throw error;
    }
  },

  /**
   * Obtiene los detalles de un artista por su ID
   * @param {string} artistId - ID del artista
   * @returns {Promise} Promesa con la respuesta de la API
   */
  getArtistDetailsById: async (artistId) => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/artists/profile-by-id/${artistId}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener detalles del artista:', error);
      throw error;
    }
  },

  /**
   * Obtiene los artistas favoritos de un usuario
   * @param {string} userId - ID del usuario
   * @returns {Promise} Promesa con la respuesta de la API
   */
  getUserFavorites: async (userId) => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/users/${userId}/favorites`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener favoritos:', error);
      throw error;
    }
  },

  /**
   * Agrega un artista a los favoritos del usuario
   * @param {string} userId - ID del usuario
   * @param {string} artistId - ID del artista
   * @returns {Promise} Promesa con la respuesta de la API
   */
  addFavorite: async (userId, artistId) => {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/users/${userId}/favorites`, { artistId });
      return response.data;
    } catch (error) {
      console.error('Error al agregar favorito:', error);
      throw error;
    }
  },

  /**
   * Elimina un artista de los favoritos del usuario
   * @param {string} userId - ID del usuario
   * @param {string} artistId - ID del artista
   * @returns {Promise} Promesa con la respuesta de la API
   */
  removeFavorite: async (userId, artistId) => {
    try {
      const response = await axios.delete(`${BACKEND_URL}/api/users/${userId}/favorites/${artistId}`);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar favorito:', error);
      throw error;
    }
  },

  /**
   * Procesa la foto de perfil de un artista para asegurar que tenga una URL válida
   * @param {Object} artist - Datos del artista a procesar
   * @returns {Object} - Artista con la foto de perfil procesada
   */
  processArtistProfilePhoto: (artist) => {
    if (!artist) return artist;
    
    // Si la foto de perfil ya es una URL completa, la usamos directamente
    if (artist.fotoPerfil && (artist.fotoPerfil.startsWith('http://') || artist.fotoPerfil.startsWith('https://'))) {
      return artist;
    }
    
    // Si la foto de perfil es una ruta relativa, construimos la URL completa
    if (artist.fotoPerfil && !artist.fotoPerfil.startsWith('/')) {
      artist.fotoPerfil = `${BACKEND_URL}/${artist.fotoPerfil}`;
    } else if (artist.fotoPerfil && artist.fotoPerfil.startsWith('/')) {
      artist.fotoPerfil = `${BACKEND_URL}${artist.fotoPerfil}`;
    }
    
    return artist;
  },

  /**
   * Procesa el portfolio de un artista para asegurar que tenga la estructura correcta
   * @param {Object} artistData - Datos del artista a procesar
   * @returns {Object} - Datos del artista con el portfolio procesado
   */
  processArtistPortfolio: (artistData) => {
    if (!artistData) return artistData;
    
    if (!artistData.portfolio) {
      artistData.portfolio = { trabajos: [], imagenes: [] };
      console.log('No se encontró portfolio, se inicializó vacío');
    } else if (typeof artistData.portfolio === 'string') {
      try {
        // Intentar parsear el portfolio si viene como string JSON
        artistData.portfolio = JSON.parse(artistData.portfolio);
        console.log('Portfolio parseado de string JSON:', JSON.stringify(artistData.portfolio, null, 2));
      } catch (e) {
        console.error('Error al parsear portfolio:', e);
        artistData.portfolio = { trabajos: [], imagenes: [] };
      }
    }
    
    // Asegurar que trabajos sea un array
    if (!artistData.portfolio.trabajos) {
      artistData.portfolio.trabajos = [];
    }
    
    // Asegurar que imágenes sea un array
    if (!artistData.portfolio.imagenes) {
      artistData.portfolio.imagenes = [];
    }
    
    return artistData;
  },

  /**
   * Procesa los trabajos del portfolio de un artista
   * @param {Array} trabajos - Lista de trabajos a procesar
   * @returns {Array} - Lista de trabajos procesados
   */
  procesarTrabajosPortfolio: (trabajos = []) => {
    if (!Array.isArray(trabajos)) {
      console.log('Trabajos no es un array, inicializando array vacío');
      return [];
    }
    
    return trabajos.map(trabajo => {
      // Asegurar que cada trabajo tenga un ID único
      if (!trabajo.id) {
        trabajo.id = Math.random().toString(36).substring(2, 9);
      }
      
      // Asegurar que tenga todas las propiedades necesarias
      return {
        id: trabajo.id,
        titulo: trabajo.titulo || 'Sin título',
        descripcion: trabajo.descripcion || '',
        fecha: trabajo.fecha || '',
        cliente: trabajo.cliente || '',
        url: trabajo.url || '',
        imagenes: Array.isArray(trabajo.imagenes) ? trabajo.imagenes : []
      };
    });
  },

  /**
   * Verifica si un ID de favorito corresponde a un artista existente
   * @param {Array} artists - Lista de artistas disponibles
   * @param {string} favoriteId - ID del favorito a verificar
   * @returns {boolean} - Verdadero si el artista existe
   */
  isValidArtistFavorite: (artists, favoriteId) => {
    return artists.some(artist => artist.id === favoriteId);
  },

  /**
   * Extrae los IDs de favoritos válidos de la respuesta del API
   * @param {Array} favorites - Lista de favoritos del API
   * @param {Array} artists - Lista de artistas disponibles
   * @returns {Array} - Lista de IDs de favoritos válidos
   */
  extractValidFavoriteIds: (favorites, artists) => {
    if (!Array.isArray(favorites) || !Array.isArray(artists)) {
      return [];
    }
    
    return favorites
      .filter(fav => ArtistService.isValidArtistFavorite(artists, fav.artistId || fav.id))
      .map(fav => fav.artistId || fav.id);
  }
};

export default ArtistService;
