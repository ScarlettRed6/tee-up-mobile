import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Pressable } from 'react-native';
import styles from './styles/LoginScreen.styles';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const isFormValid = email.trim().length > 0 && password.trim().length > 0;

  const handleLogin = () => {
    if (isFormValid) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Discover' }],
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentWrap}>
        <Text style={styles.title}>Login</Text>
        <Text style={styles.subtitle}>Welcome back! please enter your details.</Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Email/Username</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder=""
            style={styles.input}
            placeholderTextColor="#666"
          />
          <View style={styles.underline} />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder=""
            secureTextEntry
            style={styles.input}
            placeholderTextColor="#666"
          />
          <View style={styles.underline} />
        </View>

        <View style={styles.rowBetween}>
          <View style={styles.rowLeft}>
            <View style={styles.checkbox} />
            <Text style={styles.rememberText}>Remember me</Text>
          </View>
          <Pressable>
            <Text style={styles.forgot}>Forgot Password?</Text>
          </Pressable>
        </View>

        <TouchableOpacity 
          activeOpacity={0.8} 
          style={[styles.primaryButton, !isFormValid && styles.primaryButtonDisabled]}
          onPress={handleLogin}
          disabled={!isFormValid}
        >
          <Text style={[styles.primaryButtonText, !isFormValid && styles.primaryButtonTextDisabled]}>Log in</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomRow}>
        <Text style={styles.bottomMuted}>Don’t have an account? </Text>
        <Pressable onPress={() => navigation.navigate('Signup')}>
          <Text style={styles.bottomLink}>Sign up</Text>
        </Pressable>
      </View>
    </View>
  );
}
