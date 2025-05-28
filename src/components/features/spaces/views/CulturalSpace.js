import React from 'react';
import { View, ScrollView, ActivityIndicator } from 'react-native';
import { styles } from '../../../../styles/CulturalSpaceStyles';
import useCulturalSpace from '../hooks/useCulturalSpace';
import SpaceHeader from '../ui/SpaceHeader';
import ImageGallery from '../ui/ImageGallery';
import SpaceDetails from '../ui/SpaceDetails';
import FacilitiesList from '../ui/FacilitiesList';
import ScheduleManager from '../ui/ScheduleManager';
import ContactInfo from '../ui/ContactInfo';
import SocialLinks from '../ui/SocialLinks';
import TimePickerModal from '../ui/TimePickerModal';

const CulturalSpace = ({ navigation, route }) => {
  const {
    space,
    isEditing,
    timePickerVisible,
    nuevaInstalacion,
    availableTimes,
    loading,
    setIsEditing,
    handleInputChange,
    handleAddInstalacion,
    handleRemoveInstalacion,
    handlePickImage,
    handleRemoveImage,
    toggleDayOpen,
    addTimeSlot,
    removeTimeSlot,
    openTimePicker,
    closeTimePicker,
    selectTime,
    setNuevaInstalacion,
    handleSave,
    handleGoBack
  } = useCulturalSpace(navigation, route);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <ActivityIndicator size="large" color="#FF3A5E" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SpaceHeader 
        title={space.nombre}
        isEditing={isEditing}
        onToggleEdit={() => setIsEditing(true)}
        onSave={handleSave}
        onGoBack={handleGoBack}
      />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <ImageGallery 
          images={space.images}
          isEditing={isEditing}
          onPickImage={handlePickImage}
          onRemoveImage={handleRemoveImage}
        />
        
        <SpaceDetails 
          space={space}
          isEditing={isEditing}
          onInputChange={handleInputChange}
        />
        
        <FacilitiesList 
          instalaciones={space.instalaciones}
          isEditing={isEditing}
          nuevaInstalacion={nuevaInstalacion}
          onInputChange={(text) => setNuevaInstalacion(text)}
          onAddInstalacion={handleAddInstalacion}
          onRemoveInstalacion={handleRemoveInstalacion}
        />
        
        <ScheduleManager 
          disponibilidad={space.disponibilidad}
          isEditing={isEditing}
          onToggleDayOpen={toggleDayOpen}
          onAddTimeSlot={addTimeSlot}
          onRemoveTimeSlot={removeTimeSlot}
          onOpenTimePicker={openTimePicker}
        />
        
        <ContactInfo 
          contacto={space.contacto}
          isEditing={isEditing}
          onInputChange={handleInputChange}
        />
        
        <SocialLinks 
          redesSociales={space.redesSociales}
          isEditing={isEditing}
          onInputChange={handleInputChange}
        />
      </ScrollView>
      
      <TimePickerModal 
        visible={timePickerVisible.visible}
        availableTimes={availableTimes}
        onClose={closeTimePicker}
        onSelectTime={selectTime}
      />
    </View>
  );
};

export default CulturalSpace;
