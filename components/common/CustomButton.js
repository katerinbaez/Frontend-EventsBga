import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COMMON_STYLES, COLORS } from '../../styles/theme';

const CustomButton = ({
  title,
  onPress,
  type = 'primary',
  icon,
  loading = false,
  disabled = false,
  style,
}) => {
  const getButtonStyle = () => {
    if (disabled || loading) {
      return COMMON_STYLES.button.disabled;
    }
    return COMMON_STYLES.button[type];
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={COLORS.text.primary} size="small" />
      ) : (
        <>
          {icon && (
            <Ionicons
              name={icon}
              size={20}
              color={COLORS.text.primary}
            />
          )}
          <Text
            style={{
              color: disabled ? COLORS.text.disabled : COLORS.text.primary,
              fontSize: 16,
              fontWeight: 'bold',
            }}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

export default CustomButton;
