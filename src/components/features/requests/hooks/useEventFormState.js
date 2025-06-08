/**
 * Este archivo maneja el hook del estado del formulario de evento
 * - Hooks
 * - Formulario
 * - Estado
 */

import { useState } from 'react';
import { Platform } from 'react-native';

const useEventFormState = () => {
  const [eventName, setEventName] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventDate, setEventDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [expectedAttendees, setExpectedAttendees] = useState('');
  const [eventType, setEventType] = useState('');
  const [eventCategory, setEventCategory] = useState('otro');
  const [customCategory, setCustomCategory] = useState('');
  const [additionalRequirements, setAdditionalRequirements] = useState('');
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [capacityExceeded, setCapacityExceeded] = useState(false);
  const [spaceCapacity, setSpaceCapacity] = useState(null);

  const handleCategoryChange = (category) => {
    setEventCategory(category);
    if (category !== 'otro') {
      setCustomCategory('');
    }
  };

  const handleExpectedAttendeesChange = (value) => {
    setExpectedAttendees(value);
    
    const defaultCapacity = 100;
    const capacity = spaceCapacity || defaultCapacity;
    const attendees = parseInt(value, 10);
    if (!isNaN(attendees) && attendees > capacity) {
      setCapacityExceeded(true);
    } else {
      setCapacityExceeded(false);
    }
  };

  const handleDateChange = (event, selectedDate, showPicker = false) => {
    if (event && event.type === 'dismissed') {
      setShowDatePicker(false);
      return;
    }
    
    if (showPicker !== undefined) {
      setShowDatePicker(showPicker);
      return;
    }
    
    if (Platform.OS === 'ios') {
      setShowDatePicker(false);
    }
    
    if (!selectedDate) return;
    
    const newDate = new Date(selectedDate);
    
    newDate.setHours(12, 0, 0, 0);
    
    setEventDate(newDate);
  };

  const resetForm = () => {
    setEventName('');
    setEventDescription('');
    setEventDate(new Date());
    setExpectedAttendees('');
    setEventType('');
    setEventCategory('otro');
    setCustomCategory('');
    setAdditionalRequirements('');
  };

  return {
    eventName,
    eventDescription,
    eventDate,
    showDatePicker,
    expectedAttendees,
    eventType,
    eventCategory,
    customCategory,
    additionalRequirements,
    confirmModalVisible,
    capacityExceeded,
    spaceCapacity,
    
    setEventName,
    setEventDescription,
    setEventDate,
    setEventType,
    setAdditionalRequirements,
    setShowDatePicker,
    setConfirmModalVisible,
    setSpaceCapacity,
    setExpectedAttendees,
    
    handleCategoryChange,
    handleExpectedAttendeesChange,
    handleDateChange,
    setCustomCategory,
    resetForm
  };
};

export default useEventFormState;