import axios from 'axios';
import { BACKEND_URL } from '../../../../constants/config';
import { getDayName } from '../../../../components/features/events/utils/dateUtils';

// Función para manejar slots bloqueados al actualizar eventos
export const handleBlockedSlots = async (originalHour, originalDay, newHour, newDay, managerId) => {
  try {
    // 1. Desbloquear la hora anterior
    if (originalHour !== null && originalDay !== null) {
      await unblockSlot(originalHour, originalDay, managerId);
    }
    
    // 2. Bloquear la nueva hora
    await blockSlot(newHour, newDay, managerId);
    
    return { success: true };
  } catch (error) {
    console.error('Error al manejar los slots bloqueados:', error);
    throw error;
  }
};

// Función auxiliar para desbloquear un slot
const unblockSlot = async (hour, day, managerId) => {
  const unblockUrl = `${BACKEND_URL}/api/spaces/blocked-slots/${managerId}`;
  const blockedSlots = await axios.get(unblockUrl);
  
  const slotToUnblock = blockedSlots.data.blockedSlots?.find(slot => 
    slot.hour === hour && slot.day === day
  );
  
  if (slotToUnblock) {
    const deleteUrl = `${BACKEND_URL}/api/spaces/blocked-slots/${slotToUnblock.id}`;
    await axios.delete(deleteUrl);
  }
};

// Función auxiliar para bloquear un slot
const blockSlot = async (hour, day, managerId) => {
  const blockUrl = `${BACKEND_URL}/api/spaces/blocked-slots/space/${managerId}`;
  await axios.post(blockUrl, {
    day: day,
    hour: hour,
    isRecurring: false,
    dayName: getDayName(day)
  });
};
