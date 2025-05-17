// Utilidades para el componente SpaceSchedule

// Función para obtener el nombre del día de la semana
export const getDayName = (dayIndex) => {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return days[dayIndex];
};

// Función para obtener el nombre corto del día de la semana
export const getShortDayName = (dayIndex) => {
  const shortDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  return shortDays[dayIndex];
};

// Función para inicializar los días de la semana con fechas
export const initializeWeekDays = (selectedDate = new Date()) => {
  // Obtener el día de la semana (0 = domingo, 1 = lunes, ..., 6 = sábado)
  const currentDay = selectedDate.getDay();
  
  // Ajustar para que la semana comience en lunes (1)
  const firstDayOfWeek = 1; // Lunes
  
  // Calcular el lunes de la semana actual
  const mondayOffset = currentDay === 0 ? -6 : firstDayOfWeek - currentDay;
  const monday = new Date(selectedDate);
  monday.setDate(selectedDate.getDate() + mondayOffset);
  
  // Generar fechas para cada día de la semana (lunes a domingo)
  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(monday);
    currentDate.setDate(monday.getDate() + i);
    
    const dayName = getDayName(currentDate.getDay());
    const shortName = getShortDayName(currentDate.getDay());
    const dateStr = formatDateToYYYYMMDD(currentDate);
    
    weekDays.push({
      id: currentDate.getDay().toString(),
      name: dayName,
      shortName: shortName,
      date: dateStr
    });
  }
  
  return weekDays;
};

// Función para formatear una fecha a YYYY-MM-DD
export const formatDateToYYYYMMDD = (date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Función para formatear una fecha a DD/MM/YYYY
export const formatDateToDDMMYYYY = (date) => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// Función para generar franjas horarias (de 6am a 10pm)
export const generateTimeSlots = () => {
  return Array.from({ length: 17 }, (_, index) => {
    const hour = index + 6;
    return { 
      id: hour, 
      hour: hour > 12 ? hour - 12 : hour, 
      period: hour >= 12 ? 'PM' : 'AM' 
    };
  });
};

// Función para depurar los días de la semana
export const debugWeekDays = (weekDaysWithDates) => {
  console.log('🔍 Depurando días de la semana:');
  weekDaysWithDates.forEach(day => {
    console.log(`- Día ${day.id} (${day.name}): ${day.date}`);
  });
};

// Función para depurar los slots bloqueados
export const debugBlockedSlots = (blockedSlots, blockedSlotsByDate) => {
  console.log(`🔍 Depurando slots bloqueados (total: ${blockedSlots.length}):`);
  
  // Mostrar todos los slots bloqueados
  blockedSlots.forEach((slot, index) => {
    console.log(`- Slot ${index + 1}: día=${slot.day} (${slot.dayName || 'Sin nombre'}), hora=${slot.hour}, fecha=${slot.date || 'Sin fecha'}`);
  });
  
  // Mostrar slots bloqueados por fecha
  console.log('🔍 Slots bloqueados por fecha:');
  Object.keys(blockedSlotsByDate).forEach(date => {
    const slots = blockedSlotsByDate[date];
    console.log(`- Fecha ${date}: ${slots.length} slots bloqueados`);
    slots.forEach((slot, index) => {
      console.log(`  - Slot ${index + 1}: día=${slot.day} (${slot.dayName || 'Sin nombre'}), hora=${slot.hour}`);
    });
  });
};

// Función para actualizar los días de la semana basados en una fecha
export const updateWeekDays = (date) => {
  // Obtener el día de la semana (0 = domingo, 1 = lunes, ..., 6 = sábado)
  const currentDay = date.getDay();
  
  // Ajustar para que la semana comience en lunes (1)
  const firstDayOfWeek = 1; // Lunes
  
  // Calcular el lunes de la semana actual
  const mondayOffset = currentDay === 0 ? -6 : firstDayOfWeek - currentDay;
  const monday = new Date(date);
  monday.setDate(date.getDate() + mondayOffset);
  
  // Generar fechas para cada día de la semana (lunes a domingo)
  const newDays = [];
  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(monday);
    currentDate.setDate(monday.getDate() + i);
    
    const dayName = getDayName(currentDate.getDay());
    const shortName = getShortDayName(currentDate.getDay());
    const dateStr = formatDateToYYYYMMDD(currentDate);
    
    newDays.push({
      id: currentDate.getDay().toString(),
      name: dayName,
      shortName: shortName,
      date: dateStr
    });
  }
  
  return newDays;
};
