import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen({ navigation }) {
  const handleLogout = () => {
    // Handle logout logic here
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  const settingsOptions = [
    {
      id: 'editInfo',
      label: 'Edit User Information',
      icon: 'create-outline',
      onPress: () => {
        // Handle edit user information
        console.log('Edit User Information');
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6EDE2',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: '#F6EDE2',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  title: {
    fontFamily: 'Exo_700Bold',
    fontSize: 24,
    color: '#000',
    flex: 1,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  optionsContainer: {
    backgroundColor: '#FFF',
    marginTop: 8,
    marginHorizontal: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  optionRowPressed: {
    backgroundColor: '#F5F5F5',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionLabel: {
    fontFamily: 'Exo_400Regular',
    fontSize: 16,
    color: '#000',
    marginLeft: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    opacity: 0.1,
    marginLeft: 24,
  },
  logoutContainer: {
    backgroundColor: '#FFF',
    marginTop: 24,
    marginHorizontal: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  logoutRowPressed: {
    backgroundColor: '#F5F5F5',
  },
  logoutLabel: {
    fontFamily: 'Exo_400Regular',
    fontSize: 16,
    color: '#C24B3B',
    marginLeft: 16,
  },
});

