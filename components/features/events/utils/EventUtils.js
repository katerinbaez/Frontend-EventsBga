// Función para verificar si un evento ha terminado (hora exacta vencida, incluso en la fecha actual)
export const isEventExpired = (event) => {
    const now = new Date(); // Hora actual
    console.log(`Verificando evento: ${event.titulo || 'Sin título'}, ID: ${event.id}`);
    console.log(`Hora actual: ${now.toLocaleTimeString()}`);
    
    // Extraer la hora y minutos actuales
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTotalMinutes = currentHours * 60 + currentMinutes;
    console.log(`Hora actual en minutos desde medianoche: ${currentTotalMinutes}`);
    
    // Si el evento tiene fecha de fin específica
    if (event.fechaFin) {
      const fechaFinDate = new Date(event.fechaFin);
      console.log(`Fecha fin del evento: ${fechaFinDate.toLocaleString()}`);
      
      // Si la fecha es anterior a hoy, el evento ya terminó
      if (fechaFinDate.setHours(0,0,0,0) < now.setHours(0,0,0,0)) {
        console.log('Evento terminado: fecha anterior a hoy');
        return true;
      }
      
      // Si la fecha es hoy, verificar si la hora ya pasó
      if (fechaFinDate.setHours(0,0,0,0) === now.setHours(0,0,0,0)) {
        const finHours = fechaFinDate.getHours();
        const finMinutes = fechaFinDate.getMinutes();
        const finTotalMinutes = finHours * 60 + finMinutes;
        
        console.log(`Hora fin en minutos: ${finTotalMinutes}, Hora actual en minutos: ${currentTotalMinutes}`);
        return currentTotalMinutes >= finTotalMinutes;
      }
      
      return false; // La fecha es futura
    }
    
    // Si el evento tiene fecha y hora de inicio
    if (event.fechaInicio) {
      const fechaInicioDate = new Date(event.fechaInicio);
      console.log(`Fecha inicio del evento: ${fechaInicioDate.toLocaleString()}`);
      
      // Calcular la hora de fin (1 hora después si no hay duración especificada)
      const duracionMinutos = event.duracion || 60; // 1 hora por defecto
      
      // Si la fecha es anterior a hoy, el evento ya terminó
      if (fechaInicioDate.setHours(0,0,0,0) < now.setHours(0,0,0,0)) {
        console.log('Evento terminado: fecha de inicio anterior a hoy');
        return true;
      }
      
      // Si la fecha es hoy, verificar si la hora de fin ya pasó
      if (fechaInicioDate.setHours(0,0,0,0) === now.setHours(0,0,0,0)) {
        const inicioHours = fechaInicioDate.getHours();
        const inicioMinutes = fechaInicioDate.getMinutes();
        const inicioTotalMinutes = inicioHours * 60 + inicioMinutes;
        const finTotalMinutes = inicioTotalMinutes + duracionMinutos;
        
        console.log(`Hora inicio en minutos: ${inicioTotalMinutes}`);
        console.log(`Duración en minutos: ${duracionMinutos}`);
        console.log(`Hora fin en minutos: ${finTotalMinutes}`);
        console.log(`Hora actual en minutos: ${currentTotalMinutes}`);
        
        return currentTotalMinutes >= finTotalMinutes;
      }
      
      return false; // La fecha es futura
    }
    
    // Si hay fecha programada (para solicitudes de eventos)
    if (event.fechaProgramada) {
      const fechaProgramadaDate = new Date(event.fechaProgramada);
      console.log(`Fecha programada del evento: ${fechaProgramadaDate.toLocaleString()}`);
      
      // Si la fecha es anterior a hoy, el evento ya terminó
      if (fechaProgramadaDate.setHours(0,0,0,0) < now.setHours(0,0,0,0)) {
        console.log('Evento terminado: fecha programada anterior a hoy');
        return true;
      }
      
      // Si la fecha es hoy, verificar si la hora de fin (1 hora después) ya pasó
      if (fechaProgramadaDate.setHours(0,0,0,0) === now.setHours(0,0,0,0)) {
        const programadaHours = fechaProgramadaDate.getHours();
        const programadaMinutes = fechaProgramadaDate.getMinutes();
        const programadaTotalMinutes = programadaHours * 60 + programadaMinutes;
        const finTotalMinutes = programadaTotalMinutes + 60; // 1 hora por defecto
        
        console.log(`Hora programada en minutos: ${programadaTotalMinutes}`);
        console.log(`Hora fin en minutos: ${finTotalMinutes}`);
        console.log(`Hora actual en minutos: ${currentTotalMinutes}`);
        
        return currentTotalMinutes >= finTotalMinutes;
      }
      
      return false; // La fecha es futura
    }
    
    // Si no hay información suficiente sobre la hora de finalización, asumimos que no ha terminado
    console.log('No hay información suficiente de fecha/hora. Asumiendo que no ha terminado.');
    return false;
  };