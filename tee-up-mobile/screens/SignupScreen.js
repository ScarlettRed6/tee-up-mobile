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
import { ThemeContext } from '../context/themeContext';

// Complete the OAuth flow
WebBrowser.maybeCompleteAuthSession();

export default function SignupScreen({ navigation }) {
  const { register, loginWithGoogle } = useContext(authContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
      
      let errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || 'Google sign-in failed. Please try again.';

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
      await register({name: name.trim(), email: email.trim(), password, confirmPassword});

      Alert.alert(
        'Verify your email',
        `We sent a 6-digit code to ${email.trim()}. Enter it to finish creating your account.`,
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.navigate('EmailVerification', {
                email: email.trim(),
                password,
                fromLogin: false,
              });
            }
          }
        ]
      );
      console.log("Registered Successfully!");
    }catch(err){
      console.log("Registration Failed:", err);
      
      // Handle different error types
      let errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || 'Registration failed. Please try again.';

      // Set specific field errors if available
      const normalized = errorMessage.toLowerCase();

      if (normalized.includes('email') && normalized.includes('exists')) {
        setErrors({ email: 'Account already exists. Please login to verify your account.' });
        Alert.alert(
          'Account already exists',
          'User already exists, login to verify account.',
          [{ text: 'Login', onPress: () => navigation.replace('Login') }]
        );
      } else if (normalized.includes('password') && normalized.includes('match')) {
        setErrors({ confirmPassword: 'Passwords do not match' });
      } else {
        setErrors({ general: errorMessage });
        Alert.alert(
          'Registration Failed',
          errorMessage,
          [{ text: 'OK' }]
        );
      }

      // Early return since alert already handled where needed
      return;
    } finally {
      setIsSubmitting(false);
    }
  };

  const dynamicStyles = {
    container: { backgroundColor: theme.background },
    heroCard: { backgroundColor: theme.primary },
    formCard: { backgroundColor: theme.card },
    title: { color: '#FFF' },
    subtitle: { color: '#FFF' },
    label: { color: theme.text },
    input: { 
      borderColor: errors.name || errors.email || errors.password || errors.confirmPassword ? theme.error : theme.border,
      backgroundColor: errors.name || errors.email || errors.password || errors.confirmPassword ? (theme.mode === 'dark' ? '#3A2A2A' : '#FFF6F2') : (theme.mode === 'dark' ? '#333333' : '#F9FAFB'),
      color: theme.text,
    },
    inputError: {
      borderColor: theme.error,
      backgroundColor: theme.mode === 'dark' ? '#3A2A2A' : '#FFF6F2',
    },
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
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <View style={[styles.heroCard, dynamicStyles.heroCard]}>
          <Text style={[styles.title, dynamicStyles.title]}>Create an account</Text>
          <Text style={[styles.subtitle, dynamicStyles.subtitle]}>Build trust, list gear, and start connecting with golfers nearby.</Text>
        </View>

        <View style={[styles.formCard, dynamicStyles.formCard]}>
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, dynamicStyles.label]}>Name</Text>
            <TextInput 
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (errors.name) {
                  setErrors(prev => ({ ...prev, name: null }));
                }
              }}
              style={[styles.input, dynamicStyles.input, errors.name && styles.inputError]}
              returnKeyType="next"
              blurOnSubmit={false}
              autoCapitalize="words"
              placeholder="Jane Doe"
              placeholderTextColor={theme.textMuted}
            />
            {errors.name && (
              <Text style={[styles.errorText, dynamicStyles.errorText]}>{errors.name}</Text>
            )}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.label, dynamicStyles.label]}>Email</Text>
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
              style={[styles.input, dynamicStyles.input, errors.email && styles.inputError]} 
              placeholder="you@email.com"
              placeholderTextColor={theme.textMuted}
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
                  if (errors.confirmPassword && text === confirmPassword) {
                    setErrors(prev => ({ ...prev, confirmPassword: null }));
                  }
                }}
                secureTextEntry={!showPassword}
                returnKeyType="next"
                blurOnSubmit={false}
                style={[styles.input, styles.passwordInput, dynamicStyles.input, errors.password && styles.inputError]} 
                placeholder="••••••••"
                placeholderTextColor={theme.textMuted}
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

          <View style={styles.fieldGroup}>
            <Text style={[styles.label, dynamicStyles.label]}>Confirm password</Text>
            <View style={styles.passwordInputContainer}>
              <TextInput 
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (errors.confirmPassword) {
                    setErrors(prev => ({ ...prev, confirmPassword: null }));
                  }
                }}
                secureTextEntry={!showConfirmPassword}
                returnKeyType="done"
                onSubmitEditing={handleSignup}
                style={[styles.input, styles.passwordInput, dynamicStyles.input, errors.confirmPassword && styles.inputError]} 
                placeholder="••••••••"
                placeholderTextColor={theme.textMuted}
              />
              <TouchableOpacity
                style={styles.passwordToggle}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={theme.textMuted}
                />
              </TouchableOpacity>
            </View>
            {errors.confirmPassword && (
              <Text style={[styles.errorText, dynamicStyles.errorText]}>{errors.confirmPassword}</Text>
            )}
          </View>

          {errors.general && (
            <View style={[styles.errorContainer, dynamicStyles.errorContainer]}>
              <Text style={[styles.errorText, dynamicStyles.errorText]}>{errors.general}</Text>
            </View>
          )}

          <TouchableOpacity 
            activeOpacity={0.9} 
            style={[styles.primaryButton, dynamicStyles.primaryButton, (!isFormValid || isSubmitting) && styles.primaryButtonDisabled]}
            onPress={handleSignup}
            disabled={!isFormValid || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color={theme.mode === 'dark' ? theme.background : '#FFF'} />
            ) : (
              <Text style={[styles.primaryButtonText, dynamicStyles.primaryButtonText]}>Create account</Text>
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

          <View style={styles.bottomRow}>
            <Text style={[styles.bottomMuted, dynamicStyles.bottomMuted]}>Already have an account?</Text>
            <Pressable onPress={() => {
              Keyboard.dismiss();
              navigation.replace('Login');
            }}>
              <Text style={[styles.bottomLink, dynamicStyles.bottomLink]}> Log in</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
