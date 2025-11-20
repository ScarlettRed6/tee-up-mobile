import React, { useContext, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Pressable, ScrollView, KeyboardAvoidingView, Platform, Keyboard, Alert } from 'react-native';
import styles from './styles/SignupScreen.styles';
import { authContext } from '../context/authContext';

export default function SignupScreen({ navigation }) {
  const { register } = useContext(authContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Email validation helper
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

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

    // Confirm password validation
    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid = name.trim().length > 0 && email.trim().length > 0 && password.trim().length > 0 && confirmPassword.trim().length > 0;

  const handleSignup = async () => {
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
      const token = await register({name: name.trim(), email: email.trim(), password, confirmPassword});

      if (token) {
        navigation.reset({
          index: 0,
          routes: [{name: 'Discover'}],
        });
      }
      console.log("Registered Successfully!");
    }catch(err){
      console.log("Registration Failed:", err);
      
      // Handle different error types
      let errorMessage = 'Registration failed. Please try again.';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }

      // Set specific field errors if available
      if (errorMessage.toLowerCase().includes('email') && errorMessage.toLowerCase().includes('exists')) {
        setErrors({ email: 'This email is already registered' });
      } else if (errorMessage.toLowerCase().includes('password') && errorMessage.toLowerCase().includes('match')) {
        setErrors({ confirmPassword: 'Passwords do not match' });
      } else {
        setErrors({ general: errorMessage });
      }

      Alert.alert(
        'Registration Failed',
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
        contentContainerStyle={{ paddingBottom: 120 }} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <Text style={styles.title}>Create an account</Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Name</Text>
          <TextInput 
            value={name}
            onChangeText={(text) => {
              setName(text);
              if (errors.name) {
                setErrors(prev => ({ ...prev, name: null }));
              }
            }}
            style={[styles.input, errors.name && styles.inputError]}
            returnKeyType="next"
            blurOnSubmit={false}
            autoCapitalize="words"
          />
          <View style={[styles.underline, errors.name && styles.underlineError]} />
          {errors.name && (
            <Text style={styles.errorText}>{errors.name}</Text>
          )}
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput 
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (errors.email) {
                setErrors(prev => ({ ...prev, email: null }));
              }
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            returnKeyType="next"
            blurOnSubmit={false}
            style={[styles.input, errors.email && styles.inputError]} 
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
              if (errors.password) {
                setErrors(prev => ({ ...prev, password: null }));
              }
              // Clear confirm password error if passwords now match
              if (errors.confirmPassword && text === confirmPassword) {
                setErrors(prev => ({ ...prev, confirmPassword: null }));
              }
            }}
            secureTextEntry
            returnKeyType="next"
            blurOnSubmit={false}
            style={[styles.input, errors.password && styles.inputError]} 
          />
          <View style={[styles.underline, errors.password && styles.underlineError]} />
          {errors.password && (
            <Text style={styles.errorText}>{errors.password}</Text>
          )}
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Confirm password</Text>
          <TextInput 
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              if (errors.confirmPassword) {
                setErrors(prev => ({ ...prev, confirmPassword: null }));
              }
            }}
            secureTextEntry
            returnKeyType="done"
            onSubmitEditing={handleSignup}
            style={[styles.input, errors.confirmPassword && styles.inputError]} 
          />
          <View style={[styles.underline, errors.confirmPassword && styles.underlineError]} />
          {errors.confirmPassword && (
            <Text style={styles.errorText}>{errors.confirmPassword}</Text>
          )}
        </View>

        {errors.general && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errors.general}</Text>
          </View>
        )}

        <TouchableOpacity 
          activeOpacity={0.8} 
          style={[styles.primaryButton, (!isFormValid || isSubmitting) && styles.primaryButtonDisabled]}
          onPress={handleSignup}
          disabled={!isFormValid || isSubmitting}
        >
          <Text style={[styles.primaryButtonText, (!isFormValid || isSubmitting) && styles.primaryButtonTextDisabled]}>
            {isSubmitting ? 'Creating account...' : 'Sign up'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.bottomRow}>
        <Text style={styles.bottomMuted}>Already have an account? </Text>
        <Pressable onPress={() => {
          Keyboard.dismiss();
          navigation.navigate('Login');
        }}>
          <Text style={styles.bottomLink}>Login</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
