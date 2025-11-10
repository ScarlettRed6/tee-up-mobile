import React, { useContext, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Pressable, ScrollView } from 'react-native';
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
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Create an account</Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Name</Text>
          <TextInput 
            value={name}
            onChangeText={setName}
            style={styles.input} 
          />
          <View style={styles.underline} />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput 
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address" 
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
        <Pressable onPress={() => navigation.navigate('Login')}>
          <Text style={styles.bottomLink}>Login</Text>
        </Pressable>
      </View>
    </View>
  );
}
