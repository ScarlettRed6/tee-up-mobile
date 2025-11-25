import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import styles from './styles/EditProfileScreen.styles';
import { authContext } from '../context/authContext';
import { getUserProfile, updateUserProfile } from '../api/userApi';

const BIO_MAX_LENGTH = 200;

export default function EditProfileScreen({ navigation, route }) {
  const { accessToken } = useContext(authContext);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [profileImageUri, setProfileImageUri] = useState(null);
  const [errors, setErrors] = useState({});
  const [isGoogleAccount, setIsGoogleAccount] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const userData = await getUserProfile();
      setName(userData.name || '');
      setEmail(userData.email || '');
      setBio(userData.bio || '');
      setIsGoogleAccount(userData.provider === 'google');
      if (userData.profile_image) {
        setProfileImageUri(userData.profile_image);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load profile information.');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant permission to access your photos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setProfileImage({
          uri: asset.uri,
          type: 'image/jpeg',
          name: 'profile.jpg',
        });
        setProfileImageUri(asset.uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image.');
    }
  };

  const removeImage = () => {
    setProfileImage(null);
    setProfileImageUri(null);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!isGoogleAccount) {
      // Only validate email for local accounts
      if (!email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    if (bio && bio.trim().length > BIO_MAX_LENGTH) {
      newErrors.bio = `Bio cannot exceed ${BIO_MAX_LENGTH} characters`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      const profileData = {
        name: name.trim(),
        email: isGoogleAccount ? undefined : email.trim(), // Don't send email for Google accounts
        bio: bio ? bio.trim() : '',
      };

      await updateUserProfile(profileData, profileImage);

      Alert.alert(
        'Success',
        'Profile updated successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.goBack();
              // Trigger profile refresh in ProfileScreen
              if (route.params?.onProfileUpdated) {
                route.params.onProfileUpdated();
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error updating profile:', error);
      
      let errorMessage = 'Failed to update profile. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response?.data?.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response?.data?.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={styles.backButton} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Image Section */}
        <View style={styles.profileImageSection}>
          <View style={styles.profileImageContainer}>
            {profileImageUri ? (
              <Image source={{ uri: profileImageUri }} style={styles.profileImage} />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Ionicons name="person" size={40} color="#999" />
              </View>
            )}
            <TouchableOpacity
              style={styles.changeImageButton}
              onPress={pickImage}
              activeOpacity={0.8}
            >
              <Ionicons name="camera" size={20} color="#FFF" />
            </TouchableOpacity>
            {profileImageUri && (
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={removeImage}
                activeOpacity={0.8}
              >
                <Ionicons name="close-circle" size={24} color="#FF6B35" />
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.imageHintText}>Tap camera icon to change photo</Text>
        </View>

        {/* Name Field */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            value={name}
            onChangeText={(text) => {
              setName(text);
              if (errors.name) {
                setErrors(prev => ({ ...prev, name: null }));
              }
            }}
            style={[styles.input, errors.name && styles.inputError]}
            placeholder="Enter your name"
            placeholderTextColor="#999"
            autoCapitalize="words"
            returnKeyType="next"
          />
          {errors.name && (
            <Text style={styles.errorText}>{errors.name}</Text>
          )}
        </View>

        {/* Email Field */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>
            Email {isGoogleAccount && <Text style={styles.labelHint}>(Cannot change for Google accounts)</Text>}
          </Text>
          <TextInput
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (errors.email) {
                setErrors(prev => ({ ...prev, email: null }));
              }
            }}
            style={[styles.input, errors.email && styles.inputError, isGoogleAccount && styles.inputDisabled]}
            placeholder="Enter your email"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isGoogleAccount}
            returnKeyType="done"
          />
          {errors.email && (
            <Text style={styles.errorText}>{errors.email}</Text>
          )}
          {isGoogleAccount && (
            <Text style={styles.hintText}>Email cannot be changed for Google accounts</Text>
          )}
        </View>

        {/* Bio Field */}
        <View style={styles.fieldGroup}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Bio</Text>
            <Text style={styles.labelHint}>Let buyers know more about you</Text>
          </View>
          <TextInput
            value={bio}
            onChangeText={(text) => {
              if (text.length <= BIO_MAX_LENGTH) {
                setBio(text);
              }
              if (errors.bio) {
                setErrors(prev => ({ ...prev, bio: null }));
              }
            }}
            style={[styles.input, styles.textArea, errors.bio && styles.inputError]}
            placeholder="Share details like what you sell, shipping preferences, or meetup locations."
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          <View style={styles.fieldFooter}>
            {errors.bio ? (
              <Text style={styles.errorText}>{errors.bio}</Text>
            ) : (
              <View />
            )}
            <Text style={styles.characterCount}>{bio.length}/{BIO_MAX_LENGTH}</Text>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.8}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

