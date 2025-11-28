/**
 * Theme Helper Utilities
 * 
 * This file provides helper functions and patterns for applying theme colors
 * across all screens in the app.
 * 
 * Usage Pattern:
 * 
 * 1. Import ThemeContext in your screen:
 *    import { ThemeContext } from '../context/themeContext';
 * 
 * 2. Get theme in component:
 *    const { theme } = useContext(ThemeContext);
 * 
 * 3. Create dynamic styles object:
 *    const dynamicStyles = {
 *      container: { backgroundColor: theme.background },
 *      card: { backgroundColor: theme.card },
 *      text: { color: theme.text },
 *      textMuted: { color: theme.textMuted },
 *      // ... etc
 *    };
 * 
 * 4. Apply to components:
 *    <View style={[styles.container, dynamicStyles.container]}>
 *      <Text style={[styles.text, dynamicStyles.text]}>Hello</Text>
 *    </View>
 * 
 * 5. For Ionicons, use theme colors directly:
 *    <Ionicons name="home" size={24} color={theme.text} />
 *    <Ionicons name="star" size={24} color={theme.primary} />
 */

export const getThemeColors = (theme) => {
  return {
    background: theme.background,
    backgroundAlt: theme.backgroundAlt,
    card: theme.card,
    text: theme.text,
    textSecondary: theme.textSecondary,
    textMuted: theme.textMuted,
    textDisabled: theme.textDisabled,
    border: theme.border,
    lightGray: theme.lightGray,
    primary: theme.primary,
    success: theme.success,
    warning: theme.warning,
    error: theme.error,
    info: theme.info,
  };
};

/**
 * Common dynamic style patterns for screens
 */
export const createDynamicStyles = (theme) => {
  return {
    // Container styles
    container: { backgroundColor: theme.background },
    scrollView: { backgroundColor: theme.background },
    
    // Card styles
    card: { backgroundColor: theme.card },
    
    // Text styles
    text: { color: theme.text },
    textSecondary: { color: theme.textSecondary },
    textMuted: { color: theme.textMuted },
    title: { color: theme.text },
    subtitle: { color: theme.textMuted },
    
    // Input styles
    input: {
      backgroundColor: theme.mode === 'dark' ? '#333333' : '#F9FAFB',
      borderColor: theme.border,
      color: theme.text,
    },
    inputError: {
      borderColor: theme.error,
      backgroundColor: theme.mode === 'dark' ? '#3A2A2A' : '#FFF6F2',
    },
    
    // Button styles
    buttonPrimary: {
      backgroundColor: theme.mode === 'dark' ? theme.text : '#111827',
    },
    buttonPrimaryText: {
      color: theme.mode === 'dark' ? theme.background : '#FFF',
    },
    
    // Header/Navigation
    header: { backgroundColor: theme.background },
    bottomNav: { backgroundColor: theme.card },
    
    // Dividers
    divider: { backgroundColor: theme.border },
    
    // Icons - use directly in Ionicons color prop
    // Example: <Ionicons name="home" color={theme.text} />
  };
};

