import React, { useContext } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Pressable, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from './styles/SettingsScreen.styles';
import { authContext } from '../context/authContext';
import { ThemeContext } from '../context/themeContext';

export default function SettingsScreen({ navigation }) {
  const { logout } = useContext(authContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  
  const handleLogout = async () => {
    await logout();
    console.log("Logout succes!");
  };

  const dynamicStyles = {
    container: { backgroundColor: theme.background },
    topBar: { backgroundColor: theme.background },
    title: { color: theme.text },
    optionsContainer: { backgroundColor: theme.card },
    optionRow: { backgroundColor: theme.card },
    optionRowPressed: { backgroundColor: theme.mode === 'dark' ? '#333333' : '#F5F5F5' },
    optionLabel: { color: theme.text },
    divider: { backgroundColor: theme.border },
    logoutContainer: { backgroundColor: theme.card },
    logoutRow: { backgroundColor: theme.card },
    logoutRowPressed: { backgroundColor: theme.mode === 'dark' ? '#333333' : '#F5F5F5' },
  };

  const settingsOptions = [
    {
      id: 'theme',
      label: 'Dark Mode',
      icon: theme.mode === 'dark' ? 'moon' : 'sunny',
      onPress: null,
      isToggle: true,
      toggleValue: theme.mode === 'dark',
      onToggle: toggleTheme,
    },
    {
      id: 'editInfo',
      label: 'Edit User Information',
      icon: 'create-outline',
      onPress: () => {
        navigation.navigate('EditProfile');
      },
    },
    {
      id: 'rateApp',
      label: 'Rate App',
      icon: 'star-outline',
      onPress: () => {
        // Handle rate app - open app store
        console.log('Rate App');
      },
    },
    {
      id: 'shareApp',
      label: 'Share App',
      icon: 'share-outline',
      onPress: () => {
        // Handle share app
        console.log('Share App');
      },
    },
    {
      id: 'contact',
      label: 'Contact',
      icon: 'mail-outline',
      onPress: () => {
        // Handle contact
        console.log('Contact');
      },
    },
    {
      id: 'feedback',
      label: 'Feedback',
      icon: 'chatbubble-outline',
      onPress: () => {
        // Handle feedback
        console.log('Feedback');
      },
    },
  ];

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      {/* Top Bar */}
      <View style={[styles.topBar, dynamicStyles.topBar]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, dynamicStyles.title]}>Settings</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Settings Options */}
        <View style={[styles.optionsContainer, dynamicStyles.optionsContainer]}>
          {settingsOptions.map((option, index) => (
            <View key={option.id}>
              <Pressable
                style={({ pressed }) => [
                  styles.optionRow,
                  dynamicStyles.optionRow,
                  pressed && styles.optionRowPressed
                ]}
                onPress={option.isToggle ? null : option.onPress}
                disabled={option.isToggle}
              >
                <View style={styles.optionLeft}>
                  <Ionicons name={option.icon} size={22} color={option.id === 'theme' ? theme.primary : theme.text} />
                  <Text style={[styles.optionLabel, dynamicStyles.optionLabel]}>{option.label}</Text>
                </View>
                {option.isToggle ? (
                  <Switch
                    value={option.toggleValue}
                    onValueChange={option.onToggle}
                    trackColor={{ false: theme.border, true: theme.primary }}
                    thumbColor={theme.card}
                    ios_backgroundColor={theme.border}
                  />
                ) : (
                  <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
                )}
              </Pressable>
              {index < settingsOptions.length - 1 && <View style={[styles.divider, dynamicStyles.divider]} />}
            </View>
          ))}
        </View>

        {/* Logout Option */}
        <View style={[styles.logoutContainer, dynamicStyles.logoutContainer]}>
          <Pressable
            style={({ pressed }) => [
              styles.logoutRow,
              dynamicStyles.logoutRow,
              pressed && styles.logoutRowPressed
            ]}
            onPress={handleLogout}
          >
            <View style={styles.optionLeft}>
              <Ionicons name="log-out-outline" size={22} color="#C24B3B" />
              <Text style={styles.logoutLabel}>Logout</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
