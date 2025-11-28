import React, { useContext } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import AppNavigator from './navigation/AppNavigator';
import { useFonts, Exo_400Regular, Exo_500Medium, Exo_600SemiBold, Exo_700Bold, Exo_400Regular_Italic } from '@expo-google-fonts/exo';
import { AuthProvider } from './context/authContext';
import { ListingsProvider } from './context/listingsContext';
import { FavoritesProvider } from './context/favoritesContext';
import { NotificationsProvider } from './context/notificationsContext';
import { ThemeProvider, ThemeContext } from './context/themeContext';

// Inner component to access theme
function AppContent() {
  const { theme } = useContext(ThemeContext);
  
  return (
    <AuthProvider>
      <FavoritesProvider>
        <ListingsProvider>
          <NotificationsProvider>
            <View style={{ flex: 1 }}>
              <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
              <AppNavigator />
            </View>
          </NotificationsProvider>
        </ListingsProvider>
      </FavoritesProvider>
    </AuthProvider>
  );
}


export default function App() {
  const [fontsLoaded] = useFonts({
    Exo_400Regular,
    Exo_500Medium,
    Exo_600SemiBold,
    Exo_700Bold,
    Exo_400Regular_Italic
  });

  if (!fontsLoaded) {
    return <View style={styles.container} />;
  }

  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
