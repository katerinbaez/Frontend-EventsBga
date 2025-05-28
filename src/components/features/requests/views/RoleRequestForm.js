// c:\Users\123\EventsBga\components\features\requests\views\RoleRequestFormView.js
import React from 'react';
import { View, Text, TextInput, ScrollView } from 'react-native';
import styles from '../../../../styles/RoleRequestFormStyles';
import useRoleRequestForm from '../hooks/useRoleRequestForm';
import RoleSelector from '../ui/RoleSelector';
import ArtistFields from '../ui/ArtistFields';
import ManagerFields from '../ui/ManagerFields';
import DocumentUploader from '../ui/DocumentUploader';
import FormButtons from '../ui/FormButtons';

const RoleRequestForm = () => {
  const {
    selectedRole,
    formData,
    errors,
    isSubmitting,
    portfolioUrls,
    handleRoleSelect,
    handleInputChange,
    setPortfolioUrls,
    handleDocumentPick,
    handleRemoveDocument,
    handleSubmit,
    goBack
  } = useRoleRequestForm();

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Solicitud de Rol</Text>
      
      <RoleSelector 
        selectedRole={selectedRole} 
        onSelectRole={handleRoleSelect} 
        errors={errors} 
      />

      {selectedRole && (
        <>
          <Text style={styles.fieldTitle}>Justificación *</Text>
          <TextInput
            style={[
              styles.textArea,
              errors.justificacion && styles.textAreaError
            ]}
            multiline
            numberOfLines={4}
            placeholder="Explica por qué solicitas este rol"
            placeholderTextColor="#666666"
            value={formData.justificacion}
            onChangeText={(text) => handleInputChange('justificacion', text)}
          />
          {errors.justificacion && (
            <Text style={styles.errorText}>Este campo es requerido</Text>
          )}

          {selectedRole === 'Artista' ? (
            <ArtistFields 
              formData={formData} 
              errors={errors} 
              onInputChange={handleInputChange}
              portfolioUrls={portfolioUrls}
              setPortfolioUrls={setPortfolioUrls}
            />
          ) : (
            <ManagerFields 
              formData={formData} 
              errors={errors} 
              onInputChange={handleInputChange}
            />
          )}

          <DocumentUploader 
            documents={formData.documentos}
            onPickDocument={handleDocumentPick}
            onRemoveDocument={handleRemoveDocument}
          />

          <FormButtons 
            onSubmit={handleSubmit}
            onCancel={goBack}
            isSubmitting={isSubmitting}
          />
        </>
      )}
    </ScrollView>
  );
};

export default RoleRequestForm;