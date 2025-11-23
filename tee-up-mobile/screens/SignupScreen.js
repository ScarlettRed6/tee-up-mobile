import React, { useContext, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Pressable, ScrollView, KeyboardAvoidingView, Platform, Keyboard, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
// Import Google OAuth credentials from environment
import { GOOGLE_WEB_CLIENT_ID as ENV_WEB_ID, GOOGLE_ANDROID_CLIENT_ID as ENV_ANDROID_ID, GOOGLE_IOS_CLIENT_ID as ENV_IOS_ID } from '@env';

// Fallback to your actual client ID if env vars aren't loaded
const DEFAULT_CLIENT_ID = '317986566188-37pn9f8odem0fuftirqcel4bhe2jt8o9.apps.googleusercontent.com';

const GOOGLE_WEB_CLIENT_ID = ENV_WEB_ID || DEFAULT_CLIENT_ID;
const GOOGLE_ANDROID_CLIENT_ID = ENV_ANDROID_ID || DEFAULT_CLIENT_ID;
const GOOGLE_IOS_CLIENT_ID = ENV_IOS_ID || DEFAULT_CLIENT_ID;
import styles from './styles/SignupScreen.styles';
import { authContext } from '../context/authContext';

// Complete the OAuth flow
WebBrowser.maybeCompleteAuthSession();

export default function SignupScreen({ navigation }) {
  const { register, loginWithGoogle } = useContext(authContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Get client IDs - they should always be defined now (with fallback)
  const webClientId = GOOGLE_WEB_CLIENT_ID?.toString().trim() || DEFAULT_CLIENT_ID;
  const iosClientId = GOOGLE_IOS_CLIENT_ID?.toString().trim() || DEFAULT_CLIENT_ID;
  const androidClientId = GOOGLE_ANDROID_CLIENT_ID?.toString().trim() || DEFAULT_CLIENT_ID;

  // Configure Google OAuth based on platform
  // The hook REQUIRES the platform-specific client ID to be defined
  const googleAuthConfig = Platform.OS === 'ios' ? {
    iosClientId: iosClientId,
    webClientId: webClientId,
    redirectUri: makeRedirectUri({
      scheme: 'com.dreadcarl.teeupmobile',
      path: 'redirect',
    }),
    scopes: ['openid', 'profile', 'email'],
  } : Platform.OS === 'android' ? {
    androidClientId: androidClientId,
    webClientId: webClientId,
    redirectUri: makeRedirectUri({
      scheme: 'com.dreadcarl.teeupmobile',
      path: 'redirect',
    }),
    scopes: ['openid', 'profile', 'email'],
  } : {
    webClientId: webClientId,
    redirectUri: makeRedirectUri({
      scheme: 'com.dreadcarl.teeupmobile',
      path: 'redirect',
    }),
    scopes: ['openid', 'profile', 'email'],
  };

  // Initialize the hook - client IDs are always defined now
  const [request, response, promptAsync] = Google.useAuthRequest(googleAuthConfig);

  // Google Sign-In is available (always enabled with fallback client ID)
  const isGoogleSignInAvailable = true;

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

  // Handle Google OAuth response
  React.useEffect(() => {
    if (response?.type === 'success') {
      const { authentication, params } = response;
      
      // Try to get ID token from different possible locations
      let idToken = authentication?.idToken || params?.id_token || response?.params?.id_token;
      
      if (idToken) {
        handleGoogleSignIn(idToken);
      } else {
        // Log the response structure for debugging
        console.log('Google OAuth response structure:', JSON.stringify(response, null, 2));
        setIsGoogleLoading(false);
        Alert.alert(
          'Authentication Error',
          'Unable to get ID token from Google. Please check your Google OAuth configuration.',
          [{ text: 'OK' }]
        );
      }
    } else if (response?.type === 'error') {
      setIsGoogleLoading(false);
      const errorMsg = response.error?.message || 'Unable to sign in with Google. Please try again.';
      Alert.alert(
        'Google Sign-In Failed',
        errorMsg,
        [{ text: 'OK' }]
      );
    } else if (response?.type === 'cancel') {
      setIsGoogleLoading(false);
    }
  }, [response]);

  const handleGoogleSignIn = async (idToken) => {
    setIsGoogleLoading(true);
    try {
      await loginWithGoogle(idToken);
      console.log("Google sign-in successful!");
    } catch (err) {
      console.log("Google sign-in failed:", err);
      
      let errorMessage = 'Google sign-in failed. Please try again.';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      Alert.alert(
        'Google Sign-In Failed',
        errorMessage,
        [{ text: 'OK' }]
      );
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGooglePress = async () => {
    if (!isGoogleSignInAvailable || !request || !promptAsync) {
      Alert.alert(
        'Configuration Error',
        'Google Sign-In is not configured for this platform. Please add the required Google OAuth client ID to your environment variables.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    setIsGoogleLoading(true);
    try {
      await promptAsync();
    } catch (error) {
      console.log("Error prompting Google sign-in:", error);
      setIsGoogleLoading(false);
      Alert.alert(
        'Error',
        'Unable to start Google sign-in. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

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

        {/* Google Sign-In Section - Only show if configured */}
        {isGoogleSignInAvailable && (
          <>
            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google Sign-In Button */}
            <TouchableOpacity 
              activeOpacity={0.8} 
              style={[styles.googleButton, isGoogleLoading && styles.googleButtonDisabled]}
              onPress={handleGooglePress}
              disabled={isGoogleLoading}
            >
              {isGoogleLoading ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <>
                  <Ionicons name="logo-google" size={20} color="#000" style={styles.googleIcon} />
                  <Text style={styles.googleButtonText}>Continue with Google</Text>
                </>
              )}
            </TouchableOpacity>
          </>
        )}
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
