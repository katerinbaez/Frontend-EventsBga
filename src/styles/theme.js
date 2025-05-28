import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const COLORS = {
  primary: '#ff4757',
  secondary: '#404040',
  success: '#28a745',
  error: '#ff4757',
  background: '#1a1a1a',
  surface: '#2c2c2c',
  text: {
    primary: '#ffffff',
    secondary: '#cccccc',
    disabled: '#808080',
  },
  border: '#404040',
};

export const SIZES = {
  // Tipografía
  largeTitle: 32,
  h1: 24,
  h2: 20,
  h3: 18,
  body: 16,
  caption: 14,

  // Espaciado
  padding: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  margin: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  radius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    circle: 9999,
  },
  screenWidth: width,
  screenHeight: height,
  modalWidth: width * 0.9,
  maxModalWidth: 400,
};

export const SHADOWS = {
  small: {
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  medium: {
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  large: {
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
  },
  colored: (color) => ({
    elevation: 5,
    shadowColor: color,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  }),
};

export const FONTS = {
  largeTitle: {
    fontSize: SIZES.largeTitle,
    fontWeight: 'bold',
  },
  h1: {
    fontSize: SIZES.h1,
    fontWeight: 'bold',
  },
  h2: {
    fontSize: SIZES.h2,
    fontWeight: '600',
  },
  h3: {
    fontSize: SIZES.h3,
    fontWeight: '600',
  },
  body: {
    fontSize: SIZES.body,
  },
  caption: {
    fontSize: SIZES.caption,
  },
};

export const COMMON_STYLES = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  fonts: FONTS,
  shadows: SHADOWS,
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  button: {
    primary: {
      backgroundColor: COLORS.primary,
      padding: SIZES.padding.md,
      borderRadius: SIZES.radius.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: SIZES.padding.xs,
      ...SHADOWS.colored(COLORS.primary),
    },
    secondary: {
      backgroundColor: COLORS.secondary,
      padding: SIZES.padding.md,
      borderRadius: SIZES.radius.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: SIZES.padding.xs,
    },
    disabled: {
      backgroundColor: COLORS.text.disabled,
      padding: SIZES.padding.md,
      borderRadius: SIZES.radius.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: SIZES.padding.xs,
    },
  },
  modal: {
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
    },
    content: {
      backgroundColor: COLORS.surface,
      borderRadius: SIZES.radius.lg,
      padding: SIZES.padding.lg,
      width: SIZES.modalWidth,
      maxWidth: SIZES.maxModalWidth,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: COLORS.border,
      ...SHADOWS.medium,
    },
  },
  feedback: {
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: SIZES.padding.sm,
      borderRadius: SIZES.radius.sm,
      marginVertical: SIZES.margin.sm,
    },
    text: {
      marginLeft: SIZES.margin.xs,
      fontSize: SIZES.body,
    },
    error: {
      backgroundColor: `${COLORS.error}15`,
    },
    success: {
      backgroundColor: `${COLORS.success}15`,
    },
  },
  input: {
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: COLORS.surface,
      borderRadius: SIZES.radius.md,
      borderWidth: 1,
      borderColor: COLORS.border,
      paddingHorizontal: SIZES.padding.md,
      marginBottom: SIZES.margin.md,
    },
    field: {
      flex: 1,
      color: COLORS.text.primary,
      fontSize: SIZES.body,
      paddingVertical: SIZES.padding.md,
    },
    icon: {
      marginRight: SIZES.margin.sm,
    },
  },
};
