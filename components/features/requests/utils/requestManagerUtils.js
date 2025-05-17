// Funciones de utilidad para las solicitudes de eventos (gestor)
import { Linking, Alert } from 'react-native';

// Función para obtener el color según el estado de la solicitud
export const getStatusColor = (estado) => {
  if (!estado) return '#999999';

  switch (estado.toLowerCase()) {
    case 'pendiente':
      return '#FFA500';
    case 'aprobada':
      return '#4CAF50';
    case 'rechazada':
      return '#FF3A5E';
    default:
      return '#999999';
  }
};

// Función para obtener el icono según el estado de la solicitud
export const getStatusIcon = (estado) => {
  if (!estado) return 'help-circle-outline';

  switch (estado.toLowerCase()) {
    case 'pendiente':
      return 'time-outline';
    case 'aprobada':
      return 'checkmark-circle-outline';
    case 'rechazada':
      return 'close-circle-outline';
    default:
      return 'help-circle-outline';
  }
};

// Función para formatear la fecha en español (29 de abril de 2025)
export const formatDate = (dateString) => {
  if (!dateString) return '29 de abril de 2025';

  try {
    console.log('Formateando fecha (original):', dateString);

    let date;

    if (!isNaN(dateString) && typeof dateString === 'number') {
      date = new Date(dateString);
    } else if (typeof dateString === 'string' && dateString.includes('T')) {
      date = new Date(dateString);
    } else if (typeof dateString === 'string' && dateString.includes('-')) {
      const parts = dateString.split('-');
      if (parts.length === 3) {
        date = new Date(parts[0], parts[1] - 1, parts[2]);
      } else {
        date = new Date(dateString);
      }
    } else {
      date = new Date(dateString);
    }

    if (isNaN(date.getTime())) {
      console.log('Fecha inválida:', dateString);
      return '29 de abril de 2025';
    }

    const day = date.getDate();
    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    const formattedDate = `${day} de ${month} de ${year}`;
    console.log('Fecha formateada:', formattedDate);
    return formattedDate;
  } catch (error) {
    console.error('Error al formatear fecha:', error);
    return '29 de abril de 2025';
  }
};

// Función para obtener el nombre del artista
export const getArtistName = (artistId) => {
  const artistMap = {
    'google-oauth2|108457060497331191635': 'Mariana',
    'auth0|65f5b7a09feea': 'Carlos',
    'google-oauth2|103028624849014652909': 'Juan',
  };

  if (artistId && artistMap[artistId]) {
    return artistMap[artistId];
  }

  if (artistId) {
    if (artistId.includes('google-oauth2')) {
      return 'Artista de Google';
    } else if (artistId.includes('auth0')) {
      return 'Artista de Auth0';
    }
  }

  return 'Artista';
};

// Función para abrir enlaces
export const openLink = (url) => {
  if (!url) return;

  let formattedUrl = url;
  if (url.startsWith('@')) {
    formattedUrl = `https://instagram.com/${url.substring(1)}`;
  } else if (!url.startsWith('http')) {
    formattedUrl = `https://${url}`;
  }

  Linking.openURL(formattedUrl).catch(err => {
    console.error('Error al abrir la URL:', err);
    Alert.alert('Error', 'No se pudo abrir el enlace');
  });
};

// Función para enviar email
export const sendEmail = (email) => {
  if (!email) return;

  Linking.openURL(`mailto:${email}`).catch(err => {
    console.error('Error al abrir el correo:', err);
    Alert.alert('Error', 'No se pudo abrir la aplicación de correo');
  });
};

// Función para llamar por teléfono
export const callPhone = (phone) => {
  if (!phone) return;

  Linking.openURL(`tel:${phone}`).catch(err => {
    console.error('Error al llamar:', err);
    Alert.alert('Error', 'No se pudo realizar la llamada');
  });
};
