import React, { useEffect, useState, useContext, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import styles from './styles/EmailVerificationScreen.styles';
import { verifyEmailVerificationOtp, sendVerificationOtp } from '../api/authApi';
import { authContext } from '../context/authContext';
import { ThemeContext } from '../context/themeContext';

const RESEND_INTERVAL = 45;

export default function EmailVerificationScreen({ navigation, route }) {
  const params = route?.params || {};
  const email = params.email?.trim();
  const password = params.password || '';
  const fromLogin = params.fromLogin ?? false;

  const { login } = useContext(authContext);
  const { theme } = useContext(ThemeContext);

  const [otp, setOtp] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [resending, setResending] = useState(false);

  const maskedEmail = useMemo(() => {
    if (!email) return '';
    const [user, domain] = email.split('@');
    if (!domain) return email;
    const maskedUser = user.length <= 2 ? `${user[0]}*` : `${user[0]}${'*'.repeat(Math.max(1, user.length - 2))}${user[user.length - 1]}`;
    return `${maskedUser}@${domain}`;
  }, [email]);

  useEffect(() => {
    if (!email) {
      Alert.alert(
        'Missing email',
        'We need an email address to verify.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
      return;
    }

    if (fromLogin) {
      handleSendOtp(true);
    }
  }, [email, fromLogin, navigation]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const timer = setInterval(() => {
      setResendTimer((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendTimer]);

  const handleSendOtp = async (silent = false) => {
    if (!email) return;
    setResending(true);
    try {
      await sendVerificationOtp(email);
      setResendTimer(RESEND_INTERVAL);
      if (!silent) {
        Alert.alert('OTP sent', `We've sent a new verification code to ${email}.`);
      }
    } catch (error) {
      const message = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to send OTP. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setResending(false);
    }
  };

  const handleVerify = async () => {
    if (!email) return;
    if (otp.trim().length !== 6) {
      Alert.alert('Invalid code', 'Please enter the 6-digit code sent to your email.');
      return;
    }

    setSubmitting(true);
    try {
      await verifyEmailVerificationOtp({ email, otp: otp.trim() });
      Alert.alert('Success', 'Email verified successfully!');

      if (password) {
        await login(email, password);
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }
    } catch (error) {
      const message = error.response?.data?.message || error.response?.data?.error || error.message || 'OTP verification failed. Please try again.';
      Alert.alert('Verification Failed', message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Enter verification code</Text>
        <Text style={styles.subtitle}>
          We sent a 6-digit code to {maskedEmail || 'your email'}. Enter it below to verify your account.
        </Text>

        <TextInput
          value={otp}
          onChangeText={(text) => setOtp(text.replace(/[^0-9]/g, ''))}
          maxLength={6}
          keyboardType="number-pad"
          style={styles.otpInput}
          placeholder="000000"
          placeholderTextColor="#C4C4C4"
        />

        <TouchableOpacity
          style={[styles.verifyButton, (otp.length !== 6 || submitting) && styles.verifyButtonDisabled]}
          onPress={handleVerify}
          disabled={otp.length !== 6 || submitting}
          activeOpacity={0.8}
        >
          <Text style={styles.verifyButtonText}>
            {submitting ? 'Verifying...' : 'Verify email'}
          </Text>
        </TouchableOpacity>

        <View style={styles.resendRow}>
          <Text style={styles.resendPrompt}>Didn't receive a code?</Text>
          <TouchableOpacity
            onPress={() => resendTimer === 0 && !resending && handleSendOtp(false)}
            disabled={resendTimer > 0 || resending}
          >
            <Text style={[
              styles.resendText,
              (resendTimer > 0 || resending) && styles.resendTextDisabled
            ]}>
              {resendTimer > 0 ? `Resend in ${resendTimer}s` : (resending ? 'Sending...' : 'Resend code')}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>Go back</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

