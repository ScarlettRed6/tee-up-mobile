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
import { ThemeContext } from '../context/themeContext';

// Complete the OAuth flow
WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen({ navigation }) {
  const { login, loginWithGoogle } = useContext(authContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      
      const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || 'Google sign-in failed. Please try again.';

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
      // Silently handle login errors - user will see appropriate error message in UI
      const status = err.response?.status;
      const serverMessage = err.response?.data?.message;
      const normalizedMessage = serverMessage?.toLowerCase() || '';

      if (status === 403 && normalizedMessage.includes('not verified')) {
        Alert.alert(
          'Verify your email',
          'Email not verified. We\'re taking you to the verification screen to finish the process.',
          [{ text: 'OK' }]
        );
        navigation.navigate('EmailVerification', {
          email: email.trim(),
          password,
          fromLogin: true,
        });
        return;
      }
      
      // Handle different error types
      let errorMessage = serverMessage || err.message || 'Login failed. Please try again.';

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

  const dynamicStyles = {
    container: { backgroundColor: theme.background },
    heroCard: { backgroundColor: theme.primary },
    formCard: { backgroundColor: theme.card },
    label: { color: theme.text },
    input: { 
      borderColor: errors.email || errors.password ? theme.error : theme.border,
      backgroundColor: errors.email || errors.password ? (theme.mode === 'dark' ? '#3A2A2A' : '#FFF6F2') : (theme.mode === 'dark' ? '#333333' : '#F9FAFB'),
      color: theme.text,
    },
    inputError: {
      borderColor: theme.error,
      backgroundColor: theme.mode === 'dark' ? '#3A2A2A' : '#FFF6F2',
    },
    rememberText: { color: theme.text },
    forgot: { color: theme.primary },
    primaryButton: { backgroundColor: theme.mode === 'dark' ? theme.text : '#111827' },
    primaryButtonText: { color: theme.mode === 'dark' ? theme.background : '#FFF' },
    errorText: { color: theme.error },
    errorContainer: {
      backgroundColor: theme.mode === 'dark' ? '#3A2A2A' : '#FFF1ED',
      borderColor: theme.mode === 'dark' ? '#5A3A3A' : '#FFB199',
    },
    dividerLine: { backgroundColor: theme.border },
    dividerText: { color: theme.textMuted },
    googleButton: { 
      backgroundColor: theme.card,
      borderColor: theme.border,
    },
    googleButtonText: { color: theme.text },
    bottomMuted: { color: theme.textMuted },
    bottomLink: { color: theme.primary },
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, dynamicStyles.container]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      {/* Theme Toggle Button */}
      <View style={styles.themeToggleContainer}>
        <TouchableOpacity
          style={[styles.themeToggleButton, { backgroundColor: theme.card }]}
          onPress={toggleTheme}
          activeOpacity={0.7}
        >
          <Ionicons 
            name={theme.mode === 'dark' ? 'sunny' : 'moon'} 
            size={22} 
            color={theme.primary} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.heroCard, dynamicStyles.heroCard]}>
          <Text style={styles.heroTitle}>Welcome back 👋</Text>
          <Text style={styles.heroSubtitle}>Sign in to keep trading gear with trusted golfers.</Text>
        </View>

        <View style={[styles.formCard, dynamicStyles.formCard]}>
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, dynamicStyles.label]}>Email / Username</Text>
            <TextInput
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) {
                  setErrors(prev => ({ ...prev, email: null }));
                }
              }}
              placeholder="name@email.com"
              style={[styles.input, dynamicStyles.input, errors.email && styles.inputError]}
              placeholderTextColor={theme.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
              blurOnSubmit={false}
            />
            {errors.email && (
              <Text style={[styles.errorText, dynamicStyles.errorText]}>{errors.email}</Text>
            )}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.label, dynamicStyles.label]}>Password</Text>
            <View style={styles.passwordInputContainer}>
              <TextInput
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password) {
                    setErrors(prev => ({ ...prev, password: null }));
                  }
                }}
                placeholder="••••••••"
                secureTextEntry={!showPassword}
                style={[styles.input, styles.passwordInput, dynamicStyles.input, errors.password && styles.inputError]}
                placeholderTextColor={theme.textMuted}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity
                style={styles.passwordToggle}
                onPress={() => setShowPassword(!showPassword)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={theme.textMuted}
                />
              </TouchableOpacity>
            </View>
            {errors.password && (
              <Text style={[styles.errorText, dynamicStyles.errorText]}>{errors.password}</Text>
            )}
          </View>

          {errors.general && (
            <View style={[styles.errorContainer, dynamicStyles.errorContainer]}>
              <Text style={[styles.errorText, dynamicStyles.errorText]}>{errors.general}</Text>
            </View>
          )}

          <View style={styles.rowBetween}>
            <View style={styles.rowLeft}>
              <View style={[styles.checkbox, { borderColor: theme.text }]} />
              <Text style={[styles.rememberText, dynamicStyles.rememberText]}>Remember me</Text>
            </View>
            <Pressable onPress={() => {
              Keyboard.dismiss();
              navigation.navigate('ForgotPasswordRequest');
            }}>
              <Text style={[styles.forgot, dynamicStyles.forgot]}>Forgot Password?</Text>
            </Pressable>
          </View>

          <TouchableOpacity 
            activeOpacity={0.9} 
            style={[styles.primaryButton, dynamicStyles.primaryButton, (!isFormValid || isSubmitting) && styles.primaryButtonDisabled]}
            onPress={handleLogin}
            disabled={!isFormValid || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color={theme.mode === 'dark' ? theme.background : '#FFF'} />
            ) : (
              <Text style={[styles.primaryButtonText, dynamicStyles.primaryButtonText]}>Log in</Text>
            )}
          </TouchableOpacity>

          {isGoogleSignInAvailable && (
            <>
              <View style={styles.dividerContainer}>
                <View style={[styles.dividerLine, dynamicStyles.dividerLine]} />
                <Text style={[styles.dividerText, dynamicStyles.dividerText]}>or continue with</Text>
                <View style={[styles.dividerLine, dynamicStyles.dividerLine]} />
              </View>

              <TouchableOpacity 
                activeOpacity={0.8} 
                style={[styles.googleButton, dynamicStyles.googleButton, isGoogleLoading && styles.googleButtonDisabled]}
                onPress={handleGooglePress}
                disabled={isGoogleLoading}
              >
                {isGoogleLoading ? (
                  <ActivityIndicator size="small" color={theme.text} />
                ) : (
                  <>
                    <Ionicons name="logo-google" size={20} color={theme.text} style={styles.googleIcon} />
                    <Text style={[styles.googleButtonText, dynamicStyles.googleButtonText]}>Continue with Google</Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={styles.bottomRow}>
          <Text style={[styles.bottomMuted, dynamicStyles.bottomMuted]}>Don't have an account?</Text>
          <Pressable onPress={() => {
            Keyboard.dismiss();
            navigation.replace('Signup');
          }}>
            <Text style={[styles.bottomLink, dynamicStyles.bottomLink]}> Sign up</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
