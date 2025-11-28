import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { resetPasswordWithOtp } from '../api/authApi';
import { ThemeContext } from '../context/themeContext';
import styles from './styles/ForgotPassword.styles';

export default function ForgotPasswordResetScreen({ navigation, route }) {
  const { theme } = useContext(ThemeContext);
  const resetToken = route?.params?.resetToken;

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleReset = async () => {
    const validationErrors = {};
    if (!newPassword) validationErrors.newPassword = 'New password is required';
    if (!confirmPassword) validationErrors.confirmPassword = 'Please confirm your password';
    if (newPassword && newPassword.length < 6) validationErrors.newPassword = 'Password must be at least 6 characters';
    if (newPassword && confirmPassword && newPassword !== confirmPassword) validationErrors.confirmPassword = 'Passwords do not match';

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (!resetToken) {
      Alert.alert('Missing token', 'Reset token not found. Please restart the forgot password flow.');
      navigation.navigate('ForgotPasswordRequest');
      return;
    }

    setSubmitting(true);
    try {
      await resetPasswordWithOtp({
        resetToken,
        newPassword,
        confirmNewPassword: confirmPassword,
      });

      Alert.alert('Success', 'Password reset successfully. You can now log in with your new password.', [
        {
          text: 'Go to Login',
          onPress: () => navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          }),
        },
      ]);
    } catch (error) {
      const message = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to reset password.';
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
        <Text style={styles.title}>Create new password</Text>
        <Text style={styles.subtitle}>
          Choose a new password that’s at least 6 characters long. You’ll use this to log in next time.
        </Text>

        <TextInput
          style={[styles.input, errors.newPassword && styles.inputError]}
          placeholder="New password"
          placeholderTextColor="#9CA3AF"
          secureTextEntry
          value={newPassword}
          onChangeText={(text) => {
            setNewPassword(text);
            if (errors.newPassword) {
              setErrors((prev) => ({ ...prev, newPassword: undefined }));
            }
          }}
        />
        {errors.newPassword && <Text style={styles.errorText}>{errors.newPassword}</Text>}

        <TextInput
          style={[styles.input, errors.confirmPassword && styles.inputError]}
          placeholder="Confirm new password"
          placeholderTextColor="#9CA3AF"
          secureTextEntry
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            if (errors.confirmPassword) {
              setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
            }
          }}
        />
        {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}

        <TouchableOpacity
          style={[styles.primaryButton, submitting && styles.primaryButtonDisabled]}
          onPress={handleReset}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.primaryButtonText}>Reset password</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

