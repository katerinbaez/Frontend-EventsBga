/**
 * Este archivo maneja las utilidades de programación
 * - UI
 * - Espacios
 * - Programación
 * - Utilidades
 * - Horarios
 */

export const getDayName = (dayIndex) => {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return days[dayIndex];
};

export const getShortDayName = (dayIndex) => {
  const shortDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  return shortDays[dayIndex];
};
export const initializeWeekDays = (selectedDate = new Date()) => {
  const currentDay = selectedDate.getDay();
  const firstDayOfWeek = 1; // Lunes
  const mondayOffset = currentDay === 0 ? -6 : firstDayOfWeek - currentDay;
  const monday = new Date(selectedDate);
  monday.setDate(selectedDate.getDate() + mondayOffset);
  
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

export const formatDateToYYYYMMDD = (date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDateToDDMMYYYY = (date) => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

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

export const debugWeekDays = (weekDaysWithDates) => {
  console.log('🔍 Depurando días de la semana:');
  weekDaysWithDates.forEach(day => {
    console.log(`- Día ${day.id} (${day.name}): ${day.date}`);
  });
};

export const debugBlockedSlots = (blockedSlots, blockedSlotsByDate) => {
  console.log(`🔍 Depurando slots bloqueados (total: ${blockedSlots.length}):`);
  blockedSlots.forEach((slot, index) => {
    console.log(`- Slot ${index + 1}: día=${slot.day} (${slot.dayName || 'Sin nombre'}), hora=${slot.hour}, fecha=${slot.date || 'Sin fecha'}`);
  });
  console.log('🔍 Slots bloqueados por fecha:');
  Object.keys(blockedSlotsByDate).forEach(date => {
    const slots = blockedSlotsByDate[date];
    console.log(`- Fecha ${date}: ${slots.length} slots bloqueados`);
    slots.forEach((slot, index) => {
      console.log(`  - Slot ${index + 1}: día=${slot.day} (${slot.dayName || 'Sin nombre'}), hora=${slot.hour}`);
    });
  });
};

export const updateWeekDays = (date) => {
  const currentDay = date.getDay();
  const firstDayOfWeek = 1; // Lunes
  const mondayOffset = currentDay === 0 ? -6 : firstDayOfWeek - currentDay;
  const monday = new Date(date);
  monday.setDate(date.getDate() + mondayOffset);
  
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
