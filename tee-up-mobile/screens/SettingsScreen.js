import React, { useContext } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from './styles/SettingsScreen.styles';
import { authContext } from '../context/authContext';

export default function SettingsScreen({ navigation }) {
  const { logout } = useContext(authContext);
  const handleLogout = async () => {
    await logout();
    console.log("Logout succes!");
  };

  const settingsOptions = [
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
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Settings Options */}
        <View style={styles.optionsContainer}>
          {settingsOptions.map((option, index) => (
            <View key={option.id}>
              <Pressable
                style={({ pressed }) => [
                  styles.optionRow,
                  pressed && styles.optionRowPressed
                ]}
                onPress={option.onPress}
              >
                <View style={styles.optionLeft}>
                  <Ionicons name={option.icon} size={22} color="#000" />
                  <Text style={styles.optionLabel}>{option.label}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </Pressable>
              {index < settingsOptions.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        {/* Logout Option */}
        <View style={styles.logoutContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.logoutRow,
              pressed && styles.logoutRowPressed
            ]}
            onPress={handleLogout}
          >
            <View style={styles.optionLeft}>
              <Ionicons name="log-out-outline" size={22} color="#C24B3B" />
              <Text style={styles.logoutLabel}>Logout</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
