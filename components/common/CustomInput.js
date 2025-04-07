import React from 'react';
import { View, TextInput, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COMMON_STYLES, COLORS } from '../../styles/theme';

const CustomInput = ({
  icon,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  editable = true,
  autoCapitalize = 'none',
  keyboardType = 'default',
  returnKeyType = 'done',
  onSubmitEditing,
  autoFocus,
  style,
}) => {
  return (
    <View style={[COMMON_STYLES.input.container, style]}>
      {icon && (
        <Ionicons
          name={icon}
          size={20}
          color={COLORS.primary}
          style={COMMON_STYLES.input.icon}
        />
      )}
      <TextInput
        style={[COMMON_STYLES.input.field, { color: '#FFFFFF', fontSize: 18 }]}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        placeholderTextColor={COLORS.text.secondary}
        editable={editable}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        returnKeyType={returnKeyType}
        onSubmitEditing={onSubmitEditing}
        autoFocus={autoFocus}
        selectionColor={COLORS.primary}
        cursorColor={COLORS.primary}
        textAlign="center"
      />
    </View>
  );
};

export default CustomInput;
