import React, { useContext, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Pressable, ScrollView, KeyboardAvoidingView, Platform, Keyboard, Alert } from 'react-native';
import styles from './styles/LoginScreen.styles';
import { authContext } from '../context/authContext';

export default function LoginScreen({ navigation }) {
  const { login } = useContext(authContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Email validation helper
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid = email.trim().length > 0 && password.trim().length > 0;

  const handleLogin = async () => {
    // Clear previous errors
    setErrors({});
    
    // Validate form
    if (!validateForm()) {
      return;
    }

    if (!isFormValid) {
      setErrors({
        general: 'Please fill in all fields'
      });
      return;
    }

    setIsSubmitting(true);

    try{
      await login(email.trim(), password);
      console.log("Logged in!");
    }catch(err){
      console.log("Login failed:", err);
      
      // Handle different error types
      let errorMessage = 'Login failed. Please try again.';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      // Set specific field errors if available
      if (errorMessage.toLowerCase().includes('user') || errorMessage.toLowerCase().includes('not found')) {
        setErrors({ email: 'User not found. Please check your email.' });
      } else if (errorMessage.toLowerCase().includes('password') || errorMessage.toLowerCase().includes('invalid')) {
        setErrors({ password: 'Invalid password. Please try again.' });
      } else {
        setErrors({ general: errorMessage });
      }

      Alert.alert(
        'Login Failed',
        errorMessage,
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
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
              onChangeText={(text) => {
                setEmail(text);
                // Clear error when user starts typing
                if (errors.email) {
                  setErrors(prev => ({ ...prev, email: null }));
                }
              }}
              placeholder=""
              style={[styles.input, errors.email && styles.inputError]}
              placeholderTextColor="#666"
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
              blurOnSubmit={false}
            />
            <View style={[styles.underline, errors.email && styles.underlineError]} />
            {errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                // Clear error when user starts typing
                if (errors.password) {
                  setErrors(prev => ({ ...prev, password: null }));
                }
              }}
              placeholder=""
              secureTextEntry
              style={[styles.input, errors.password && styles.inputError]}
              placeholderTextColor="#666"
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
            <View style={[styles.underline, errors.password && styles.underlineError]} />
            {errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}
          </View>

          {errors.general && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errors.general}</Text>
            </View>
          )}

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
            style={[styles.primaryButton, (!isFormValid || isSubmitting) && styles.primaryButtonDisabled]}
            onPress={handleLogin}
            disabled={!isFormValid || isSubmitting}
          >
            <Text style={[styles.primaryButtonText, (!isFormValid || isSubmitting) && styles.primaryButtonTextDisabled]}>
              {isSubmitting ? 'Logging in...' : 'Log in'}
            </Text>
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
