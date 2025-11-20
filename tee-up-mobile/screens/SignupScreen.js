import React, { useContext, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Pressable, ScrollView, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import styles from './styles/SignupScreen.styles';
import { authContext } from '../context/authContext';

export default function SignupScreen({ navigation }) {
  const { register } = useContext(authContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const isFormValid = name.trim().length > 0 && email.trim().length > 0 && password.trim().length > 0 && confirmPassword.trim().length > 0;

  const handleSignup = async () => {
    if (!isFormValid) return;

    try{
      const token = await register({name, email, password, confirmPassword});

      if (token) {
        navigation.reset({
          index: 0,
          routes: [{name: 'Discover'}],
        });
      }
      console.log("Registered Successfully!");
    }catch(err){
      console.log("Registration Failed:", err.message);
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
            onChangeText={setName}
            style={styles.input}
            returnKeyType="next"
            blurOnSubmit={false}
          />
          <View style={styles.underline} />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput 
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            returnKeyType="next"
            blurOnSubmit={false}
            style={styles.input} 
          />
          <View style={styles.underline} />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput 
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            returnKeyType="next"
            blurOnSubmit={false}
            style={styles.input} 
          />
          <View style={styles.underline} />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Confirm password</Text>
          <TextInput 
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            returnKeyType="done"
            onSubmitEditing={() => Keyboard.dismiss()}
            style={styles.input} 
          />
          <View style={styles.underline} />
        </View>

        <TouchableOpacity 
          activeOpacity={0.8} 
          style={[styles.primaryButton, !isFormValid && styles.primaryButtonDisabled]}
          onPress={handleSignup}
          disabled={!isFormValid}
        >
          <Text style={[styles.primaryButtonText, !isFormValid && styles.primaryButtonTextDisabled]}>Sign up</Text>
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
