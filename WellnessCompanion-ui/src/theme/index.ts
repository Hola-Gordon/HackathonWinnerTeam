export const theme = {
  colors: {
    primary: '#7C9885', // Soft sage green
    secondary: '#B5C9C3', // Light sage
    background: '#F5F7F6', // Off-white
    text: '#2C3639', // Deep gray
    accent: '#E8B4BC', // Soft pink
    success: '#95B8A6', // Muted green
    error: '#D88373', // Muted coral
    card: '#FFFFFF', // White
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  typography: {
    h1: {
      fontSize: 28,
      fontWeight: '600' as const,
    },
    h2: {
      fontSize: 24,
      fontWeight: '500' as const,
    },
    body: {
      fontSize: 16,
      lineHeight: 24,
    },
    caption: {
      fontSize: 14,
      color: '#666',
    },
  },
}; 