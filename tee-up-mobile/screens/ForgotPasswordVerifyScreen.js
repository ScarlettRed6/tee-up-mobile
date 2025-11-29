import React, { useEffect, useState, useMemo, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { verifyPasswordResetOtp, requestPasswordResetOtp } from '../api/authApi';
import { ThemeContext } from '../context/themeContext';
import styles from './styles/ForgotPassword.styles';

const RESEND_INTERVAL = 45;

export default function ForgotPasswordVerifyScreen({ navigation, route }) {
  const { theme } = useContext(ThemeContext);
  const email = route?.params?.email;
  const [otp, setOtp] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(RESEND_INTERVAL);

  const maskedEmail = useMemo(() => {
    if (!email) return '';
    const [user, domain] = email.split('@');
    if (!domain || user.length < 2) return email;
    return `${user[0]}***${user[user.length - 1]}@${domain}`;
  }, [email]);

  useEffect(() => {
    if (!email) {
      Alert.alert('Missing email', 'Please start the forgot password flow again.', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('ForgotPasswordRequest'),
        },
      ]);
      return;
    }

    const interval = setInterval(() => {
      setTimer((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [email, navigation]);

  const handleResend = async () => {
    if (timer > 0 || resending) return;
    setResending(true);
    try {
      await requestPasswordResetOtp(email);
      setTimer(RESEND_INTERVAL);
      Alert.alert('OTP Sent', 'We’ve sent another verification code to your email.');
    } catch (error) {
      const message = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to resend OTP.';
      Alert.alert('Error', message);
    } finally {
      setResending(false);
    }
  };

  const handleVerify = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert('Invalid code', 'Please enter the 6-digit code sent to your email.');
      return;
    }

    setSubmitting(true);
    try {
      const data = await verifyPasswordResetOtp({ email, otp: otp.trim() });
      navigation.navigate('ForgotPasswordReset', {
        email,
        resetToken: data.resetToken,
      });
    } catch (error) {
      const message = error.response?.data?.message || error.response?.data?.error || error.message || 'OTP verification failed.';
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
        <Text style={styles.title}>Enter verification code</Text>
        <Text style={styles.subtitle}>
          We sent a 6-digit code to {maskedEmail}. Enter it below to continue.
        </Text>

        <TextInput
          style={styles.otpInput}
          value={otp}
          onChangeText={(text) => setOtp(text.replace(/[^0-9]/g, ''))}
          maxLength={6}
          keyboardType="number-pad"
          placeholder="000000"
          placeholderTextColor="#C4C4C4"
        />

        <TouchableOpacity
          style={[styles.primaryButton, (otp.length !== 6 || submitting) && styles.primaryButtonDisabled]}
          onPress={handleVerify}
          disabled={otp.length !== 6 || submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.primaryButtonText}>Continue</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.resendButton}
          onPress={handleResend}
          disabled={timer > 0 || resending}
        >
          <Text style={[styles.resendText, (timer > 0 || resending) && styles.resendTextDisabled]}>
            {timer > 0 ? `Resend code in ${timer}s` : resending ? 'Sending...' : 'Resend code'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

