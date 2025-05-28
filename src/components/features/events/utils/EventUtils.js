// Función para verificar si un evento ha terminado (exactamente 1 hora después de la hora de inicio)
export const isEventExpired = (event) => {
    const now = new Date(); // Hora actual
    console.log(`Verificando evento: ${event.titulo || 'Sin título'}, ID: ${event.id}`);
    console.log(`Hora actual: ${now.toLocaleTimeString()}`);
    
    // Extraer la hora y minutos actuales
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTotalMinutes = currentHours * 60 + currentMinutes;
    console.log(`Hora actual en minutos desde medianoche: ${currentTotalMinutes}`);
    
    // Obtener la fecha del evento (puede estar en diferentes propiedades)
    const eventDate = event.fechaInicio || event.fechaProgramada || event.fecha;
    
    if (eventDate) {
      const eventDateTime = new Date(eventDate);
      console.log(`Fecha y hora del evento: ${eventDateTime.toLocaleString()}`);
      
      // Si la fecha es anterior a hoy, el evento ya terminó
      const nowDateOnly = new Date(now);
      const eventDateOnly = new Date(eventDateTime);
      nowDateOnly.setHours(0, 0, 0, 0);
      eventDateOnly.setHours(0, 0, 0, 0);
      
      if (eventDateOnly < nowDateOnly) {
        console.log('Evento terminado: fecha anterior a hoy');
        return true;
      }
      
      // Si la fecha es hoy, verificar si ha pasado exactamente 1 hora desde el inicio
      if (eventDateOnly.getTime() === nowDateOnly.getTime()) {
        const eventHours = eventDateTime.getHours();
        const eventMinutes = eventDateTime.getMinutes();
        const eventTotalMinutes = eventHours * 60 + eventMinutes;
        
        // Calcular la hora de fin (exactamente 1 hora después del inicio)
        const finTotalMinutes = eventTotalMinutes + 60; // 1 hora = 60 minutos
        
        console.log(`Hora inicio en minutos: ${eventTotalMinutes}`);
        console.log(`Hora fin en minutos: ${finTotalMinutes}`);
        console.log(`Hora actual en minutos: ${currentTotalMinutes}`);
        
        // El evento ha terminado si la hora actual es mayor o igual a la hora de inicio + 1 hora
        return currentTotalMinutes >= finTotalMinutes;
      }
      
      // Si la fecha es futura, el evento no ha terminado
      return false;
    }
    
    // Si no hay información suficiente sobre la hora de inicio, asumimos que no ha terminado
    console.log('No hay información suficiente de fecha/hora. Asumiendo que no ha terminado.');
    return false;
  };