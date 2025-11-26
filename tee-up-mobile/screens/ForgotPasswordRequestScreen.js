import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { requestPasswordResetOtp } from '../api/authApi';
import styles from './styles/ForgotPassword.styles';

export default function ForgotPasswordRequestScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    setError(null);
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    setSubmitting(true);
    try {
      await requestPasswordResetOtp(email.trim());
      Alert.alert('OTP Sent', 'We’ve emailed you a 6-digit code to reset your password.', [
        {
          text: 'OK',
          onPress: () =>
            navigation.navigate('ForgotPasswordVerify', {
              email: email.trim(),
            }),
        },
      ]);
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to send OTP';
      Alert.alert('Error', message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Forgot password</Text>
        <Text style={styles.subtitle}>
          Enter the email you used to sign up. We’ll send a verification code so you can reset your password.
        </Text>

        <TextInput
          style={[styles.input, error && styles.inputError]}
          placeholder="Email address"
          placeholderTextColor="#9CA3AF"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (error) setError(null);
          }}
        />
        {error && <Text style={styles.errorText}>{error}</Text>}

        <TouchableOpacity
          style={[styles.primaryButton, submitting && styles.primaryButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.primaryButtonText}>Send code</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

