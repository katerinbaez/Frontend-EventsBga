/**
 * Este archivo maneja las operaciones del servicio de artistas
 * - CRUD
 * - Favoritos
 * - Búsqueda
 */

import axios from 'axios';
import { BACKEND_URL } from '../../../../constants/config';


const ArtistService = {
  
  getAllArtists: async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/artists/all`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener artistas:', error);
      throw error;
    }
  },

  getArtistDetailsById: async (artistId) => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/artists/profile-by-id/${artistId}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener detalles del artista:', error);
      throw error;
    }
  },

  
  getUserFavorites: async (userId) => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/users/${userId}/favorites`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener favoritos:', error);
      throw error;
    }
  },

  
  addFavorite: async (userId, artistId) => {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/users/${userId}/favorites`, { artistId });
      return response.data;
    } catch (error) {
      console.error('Error al agregar favorito:', error);
      throw error;
    }
  },

  
  removeFavorite: async (userId, artistId) => {
    try {
      const response = await axios.delete(`${BACKEND_URL}/api/users/${userId}/favorites/${artistId}`);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar favorito:', error);
      throw error;
    }
  },

  
  processArtistProfilePhoto: (artist) => {
    if (!artist) return artist;
    
    if (artist.fotoPerfil && (artist.fotoPerfil.startsWith('http://') || artist.fotoPerfil.startsWith('https://'))) {
      return artist;
    }
    
    if (artist.fotoPerfil && !artist.fotoPerfil.startsWith('/')) {
      artist.fotoPerfil = `${BACKEND_URL}/${artist.fotoPerfil}`;
    } else if (artist.fotoPerfil && artist.fotoPerfil.startsWith('/')) {
      artist.fotoPerfil = `${BACKEND_URL}${artist.fotoPerfil}`;
    }
    
    return artist;
  },

  
  processArtistPortfolio: (artistData) => {
    if (!artistData) return artistData;
    
    if (!artistData.portfolio) {
      artistData.portfolio = { trabajos: [], imagenes: [] };
      console.log('No se encontró portfolio, se inicializó vacío');
    } else if (typeof artistData.portfolio === 'string') {
      try {
        artistData.portfolio = JSON.parse(artistData.portfolio);
        console.log('Portfolio parseado de string JSON:', JSON.stringify(artistData.portfolio, null, 2));
      } catch (e) {
        console.error('Error al parsear portfolio:', e);
        artistData.portfolio = { trabajos: [], imagenes: [] };
      }
    }
    
    if (!artistData.portfolio.trabajos) {
      artistData.portfolio.trabajos = [];
    }
    
    if (!artistData.portfolio.imagenes) {
      artistData.portfolio.imagenes = [];
    }
    
    return artistData;
  },

  procesarTrabajosPortfolio: (trabajos = []) => {
    if (!Array.isArray(trabajos)) {
      console.log('Trabajos no es un array, inicializando array vacío');
      return [];
    }
    
    return trabajos.map(trabajo => {
      if (!trabajo.id) {
        trabajo.id = Math.random().toString(36).substring(2, 9);
      }
      
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
  isValidArtistFavorite: (artists, favoriteId) => {
    return artists.some(artist => artist.id === favoriteId);
  },

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
