// Oysterglow + Accent theme for React Native
export const colors = {
  oysterglow: {
    bg: '#F8F4F0',
    surface: '#DDD0C8',
    text: '#B0A89F',
  },
  primary: '#1D4ED8',
  white: '#fff',
  black: '#222',
};

export const spacing = {
  layout: 24,
  card: 16,
  sm: 8,
  md: 16,
  lg: 24,
};

export const radius = {
  md: 12,
  lg: 16,
};

export const font = {
  family: 'System', // or 'Inter' if using Expo Google Fonts
  size: {
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
  },
  weight: {
    regular: '400',
    bold: '700',
  },
};

export const lightTheme = {
  bg: "#fff",
  surface: "#f3f3f3",
  text: "#1E1A2E",
  accent: "#5C4F6E",
};

export const darkTheme = {
  bg: "#1E1A2E",
  surface: "#5C4F6E",
  text: "#B3A8C9",
  accent: "#B3A8C9",
};

const theme = { colors, spacing, radius, font };
export default theme; 