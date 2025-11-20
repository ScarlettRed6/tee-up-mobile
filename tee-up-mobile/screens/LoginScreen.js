import React, { useContext, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Pressable, ScrollView, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import styles from './styles/LoginScreen.styles';
import { authContext } from '../context/authContext';

export default function LoginScreen({ navigation }) {
  const { login } = useContext(authContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const isFormValid = email.trim().length > 0 && password.trim().length > 0;

  const handleLogin = async () => {
    if (!isFormValid) return;

    try{
      await login(email, password);
      console.log("Logged in!");
    }catch(err){
      console.log("Login failed:", err.message);
    }

  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
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
              returnKeyType="next"
              blurOnSubmit={false}
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
              returnKeyType="done"
              onSubmitEditing={() => Keyboard.dismiss()}
            />
            <View style={styles.underline} />
          </View>

          <View style={styles.rowBetween}>
            <View style={styles.rowLeft}>
              <View style={styles.checkbox} />
              <Text style={styles.rememberText}>Remember me</Text>
            </View>
            <Pressable onPress={() => Keyboard.dismiss()}>
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
      </ScrollView>

      <View style={styles.bottomRow}>
        <Text style={styles.bottomMuted}>Don't have an account? </Text>
        <Pressable onPress={() => {
          Keyboard.dismiss();
          navigation.navigate('Signup');
        }}>
          <Text style={styles.bottomLink}>Sign up</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
