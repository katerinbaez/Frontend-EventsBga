/**
 * Este archivo maneja las utilidades de eventos
 * - Utilidades
 * - Eventos
 * - Estado
 */

export const isEventExpired = (event) => {
    const now = new Date();
    console.log(`Verificando evento: ${event.titulo || 'Sin título'}, ID: ${event.id}`);
    console.log(`Hora actual: ${now.toLocaleTimeString()}`);
    
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTotalMinutes = currentHours * 60 + currentMinutes;
    console.log(`Hora actual en minutos desde medianoche: ${currentTotalMinutes}`);
    
    const eventDate = event.fechaInicio || event.fechaProgramada || event.fecha;
    
    if (eventDate) {
      const eventDateTime = new Date(eventDate);
      console.log(`Fecha y hora del evento: ${eventDateTime.toLocaleString()}`);
      
      const nowDateOnly = new Date(now);
      const eventDateOnly = new Date(eventDateTime);
      nowDateOnly.setHours(0, 0, 0, 0);
      eventDateOnly.setHours(0, 0, 0, 0);
      
      if (eventDateOnly < nowDateOnly) {
        console.log('Evento terminado: fecha anterior a hoy');
        return true;
      }
      
      if (eventDateOnly.getTime() === nowDateOnly.getTime()) {
        const eventHours = eventDateTime.getHours();
        const eventMinutes = eventDateTime.getMinutes();
        const eventTotalMinutes = eventHours * 60 + eventMinutes;
        
        const finTotalMinutes = eventTotalMinutes + 60;
        
        console.log(`Hora inicio en minutos: ${eventTotalMinutes}`);
        console.log(`Hora fin en minutos: ${finTotalMinutes}`);
        console.log(`Hora actual en minutos: ${currentTotalMinutes}`);
        
        return currentTotalMinutes >= finTotalMinutes;
      }
      
      return false;
    }
    
    console.log('No hay información suficiente de fecha/hora. Asumiendo que no ha terminado.');
    return false;
  };