import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function LoginScreen() {
  return (
    <View style={styles.container}>
      <Text>THIS IS THE LOGIN SCREEN</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  constainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});



