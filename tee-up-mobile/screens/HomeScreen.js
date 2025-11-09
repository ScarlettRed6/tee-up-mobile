import React from 'react';
import { View, Text, Button } from 'react-native';
import styles from './styles/HomeScreen.styles';

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text> WELCUM TO TEE-UP!</Text>
      <Button title='GUSTO MO MAG LOGIN?' onPress={() => navigation.navigate('Login')} />
    </View>
  );
}
