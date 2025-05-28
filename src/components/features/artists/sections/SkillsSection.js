import React from 'react';
import { View, Text } from 'react-native';
import { styles } from '../../../../styles/ArtistProfileStyles';

const SkillsSection = ({ skills = [] }) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Habilidades</Text>
      <View style={styles.skillsContainer}>
        {skills.length > 0 ? (
          skills.map((skill, index) => (
            <View key={index} style={styles.skillTag}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.text}>No hay habilidades registradas</Text>
        )}
      </View>
    </View>
  );
};

export default SkillsSection;
