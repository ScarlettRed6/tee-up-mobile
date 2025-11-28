import React, { useContext } from 'react';
import { View, Text, Button } from 'react-native';
import styles from './styles/HomeScreen.styles';
import { ThemeContext } from '../context/themeContext';

export default function HomeScreen({ navigation }) {
  const { theme } = useContext(ThemeContext);
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={{ color: theme.text }}> WELCUM TO TEE-UP!</Text>
      <Button title='GUSTO MO MAG LOGIN?' onPress={() => navigation.navigate('Login')} />
    </View>
  );
}
