import { Platform } from 'react-native';

export const shadows = {
  none: {},

  // Default cards on light theme
  light: Platform.select({
    shadowColor: "#dadee6",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.15,
    shadowRadius: 5.62,
    elevation: 3,

    default: {},
  }),

  // Focused / Active cards
  custom: Platform.select({
    ios: {
      shadowColor: '#000BA0',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.12,
      shadowRadius: 12,
    },
    android: {
      elevation: 6,
    },
    default: {},
  }),

  // Cards on dark theme
  dark: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 6,
      },
      shadowOpacity: 0.22,
      shadowRadius: 5,
    },
    android: {
      elevation: 0.75,
    },
    default: {},
  }),
};