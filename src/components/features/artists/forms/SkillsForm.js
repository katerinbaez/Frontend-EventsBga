import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles, ACCENT_COLOR } from '../../../../styles/ArtistProfileStyles';

const SkillsForm = ({ skills, newSkill, onNewSkillChange, onAddSkill, onRemoveSkill }) => {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>Habilidades</Text>
      <View style={styles.skillsInputContainer}>
        <TextInput
          style={styles.skillInput}
          value={newSkill}
          onChangeText={onNewSkillChange}
          placeholder="Agregar habilidad"
          onSubmitEditing={onAddSkill}
          placeholderTextColor="#666"
        />
        <TouchableOpacity 
          style={styles.addSkillButton}
          onPress={onAddSkill}
        >
          <Ionicons name="add-circle" size={24} color={ACCENT_COLOR} />
        </TouchableOpacity>
      </View>
      <ScrollView horizontal style={styles.skillsScrollView}>
        <View style={styles.skillsContainer}>
          {skills.map((skill, index) => (
            <View key={index} style={styles.skillChip}>
              <Text style={styles.skillChipText}>{skill}</Text>
              <TouchableOpacity 
                onPress={() => onRemoveSkill(index)}
                style={styles.removeSkillButton}
              >
                <Ionicons name="close-circle" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default SkillsForm;
