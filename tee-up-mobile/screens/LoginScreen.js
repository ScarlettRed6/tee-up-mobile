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
import styles from './styles/LoginScreen.styles';
import { authContext } from '../context/authContext';

// Complete the OAuth flow
WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen({ navigation }) {
  const { login, loginWithGoogle } = useContext(authContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      console.log("Google login successful!");
    } catch (err) {
      console.log("Google login failed:", err);
      
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
