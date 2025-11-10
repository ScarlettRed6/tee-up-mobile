import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { authContext } from '../context/authContext';
import AppStack from './AppStack';
import AuthStack from './AuthStack';
import { View, Text } from 'react-native';

export default function AppNavigator() {
  const { token, loading } = useContext(authContext);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {token ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}