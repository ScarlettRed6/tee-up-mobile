import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Pressable } from 'react-native';

export default function LoginScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.contentWrap}>
        <Text style={styles.title}>Login</Text>
        <Text style={styles.subtitle}>Welcome back! please enter your details.</Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Email/Username</Text>
          <TextInput
            placeholder=""
            style={styles.input}
            placeholderTextColor="#666"
          />
          <View style={styles.underline} />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            placeholder=""
            secureTextEntry
            style={styles.input}
            placeholderTextColor="#666"
          />
          <View style={styles.underline} />
        </View>

        <View style={styles.rowBetween}>
          <View style={styles.rowLeft}>
            <View style={styles.checkbox} />
            <Text style={styles.rememberText}>Remember me</Text>
          </View>
          <Pressable>
            <Text style={styles.forgot}>Forgot Password?</Text>
          </Pressable>
        </View>

        <TouchableOpacity activeOpacity={0.8} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Log in</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomRow}>
        <Text style={styles.bottomMuted}>Don’t have an account? </Text>
        <Pressable onPress={() => navigation.navigate('Signup')}>
          <Text style={styles.bottomLink}>Sign up</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF1E6',
    paddingTop: 64,
    paddingHorizontal: 24,
  },
  contentWrap: {
    flexGrow: 1,
  },
  title: {
    fontFamily: 'Exo_700Bold',
    fontSize: 28,
    color: '#121212',
  },
  subtitle: {
    marginTop: 8,
    fontFamily: 'Exo_400Regular',
    fontSize: 14,
    color: '#2b2b2b',
    opacity: 0.9,
  },
  fieldGroup: {
    marginTop: 28,
  },
  label: {
    fontFamily: 'Exo_500Medium',
    fontSize: 14,
    color: '#1a1a1a',
    marginBottom: 8,
  },
  input: {
    fontFamily: 'Exo_400Regular',
    fontSize: 16,
    paddingVertical: 6,
    color: '#0f0f0f',
  },
  underline: {
    height: 1,
    backgroundColor: '#1f1f1f',
    opacity: 0.9,
  },
  rowBetween: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#1f1f1f',
    marginRight: 10,
    backgroundColor: 'transparent',
  },
  rememberText: {
    fontFamily: 'Exo_400Regular',
    color: '#1a1a1a',
  },
  forgot: {
    fontFamily: 'Exo_400Regular_Italic',
    color: '#111',
    opacity: 0.9,
    fontSize: 12,
  },
  primaryButton: {
    marginTop: 28,
    backgroundColor: '#ffffff',
    borderRadius: 28,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  primaryButtonText: {
    fontFamily: 'Exo_700Bold',
    color: '#111',
    fontSize: 18,
  },
  bottomRow: {
    position: 'absolute',
    bottom: 36,
    left: 24,
    right: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomMuted: {
    fontFamily: 'Exo_400Regular',
    color: '#2b2b2b',
    opacity: 0.9,
    fontSize: 13,
  },
  bottomLink: {
    fontFamily: 'Exo_700Bold',
    color: '#000',
    fontSize: 13,
  },
});



