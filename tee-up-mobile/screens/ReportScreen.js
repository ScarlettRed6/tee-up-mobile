import React, { useState, useEffect, useContext } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styles from './styles/ReportScreen.styles';
import { reportListing, reportUser } from '../api/reportApi';
import { authContext } from '../context/authContext';
import { ThemeContext } from '../context/themeContext';

export default function ReportScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { accessToken } = useContext(authContext);
  const { theme } = useContext(ThemeContext);
  const [reason, setReason] = useState('');
  const [photo, setPhoto] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const reportType = route?.params?.reportType; // 'listing' or 'user'
  const listingId = route?.params?.listingId;
  const userId = route?.params?.userId;
  const listingTitle = route?.params?.listingTitle;
  const userName = route?.params?.userName;

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to upload photos!');
        }
      }
    })();
  }, []);

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setPhoto({
          uri: result.assets[0].uri,
          type: 'image/jpeg',
          name: 'report_photo.jpg'
        });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Sorry, we need camera permissions to take photos!');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setPhoto({
          uri: result.assets[0].uri,
          type: 'image/jpeg',
          name: 'report_photo.jpg'
        });
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const handleRemovePhoto = () => {
    setPhoto(null);
  };

  const handleSubmit = async () => {
    if (!reason.trim()) {
      Alert.alert('Required', 'Please provide a reason for reporting.');
      return;
    }

    if (reason.trim().length < 10) {
      Alert.alert('Invalid', 'Please provide a more detailed reason (at least 10 characters).');
      return;
    }

    setIsSubmitting(true);
    try {
      if (reportType === 'listing') {
        await reportListing(listingId, reason.trim(), photo);
        Alert.alert('Success', 'Report submitted successfully. Thank you for helping keep our community safe.', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else if (reportType === 'user') {
        await reportUser(userId, reason.trim(), photo);
        Alert.alert('Success', 'Report submitted successfully. Thank you for helping keep our community safe.', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getReportTitle = () => {
    if (reportType === 'listing') {
      return `Report Listing${listingTitle ? `: ${listingTitle}` : ''}`;
    } else if (reportType === 'user') {
      return `Report User${userName ? `: ${userName}` : ''}`;
    }
    return 'Report';
  };

  const dynamicStyles = {
    container: { backgroundColor: theme.background },
    header: { backgroundColor: theme.background },
    headerTitle: { color: theme.text },
    scrollView: { backgroundColor: theme.background },
    infoSection: { backgroundColor: theme.card },
    infoText: { color: theme.textSecondary },
    section: { backgroundColor: theme.card },
    label: { color: theme.text },
    input: { 
      backgroundColor: theme.mode === 'dark' ? '#333333' : '#F9FAFB',
      borderColor: theme.border,
      color: theme.text,
    },
    hintText: { color: theme.textMuted },
    photoButton: { backgroundColor: theme.lightGray, borderColor: theme.border },
    photoButtonText: { color: theme.text },
    submitButton: { backgroundColor: theme.primary },
    submitButtonDisabled: { backgroundColor: theme.textMuted, opacity: 0.5 },
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, dynamicStyles.container]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.container, dynamicStyles.container]}>
        {/* Header */}
        <View style={[styles.header, dynamicStyles.header, { paddingTop: 50 + insets.top }]}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, dynamicStyles.headerTitle]}>{getReportTitle()}</Text>
          <View style={styles.backButton} />
        </View>

        <ScrollView 
          style={[styles.scrollView, dynamicStyles.scrollView]}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 + insets.bottom }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Info Section */}
          <View style={[styles.infoSection, dynamicStyles.infoSection]}>
            <Text style={[styles.infoText, dynamicStyles.infoText]}>
              Please provide details about why you're reporting this {reportType === 'listing' ? 'listing' : 'user'}. 
              Your report will be reviewed by our team.
            </Text>
          </View>

          {/* Reason Input */}
          <View style={[styles.section, dynamicStyles.section]}>
            <Text style={[styles.label, dynamicStyles.label]}>Reason for Reporting *</Text>
            <TextInput
              style={[styles.input, styles.textArea, dynamicStyles.input]}
              placeholder="Describe the issue in detail..."
              placeholderTextColor={theme.textMuted}
              value={reason}
              onChangeText={setReason}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
            <Text style={[styles.hintText, dynamicStyles.hintText]}>
              Minimum 10 characters required
            </Text>
          </View>

          {/* Photo Section */}
          <View style={[styles.section, dynamicStyles.section]}>
            <Text style={[styles.label, dynamicStyles.label]}>Attach Photo (Optional)</Text>
            <Text style={[styles.hintText, dynamicStyles.hintText, { marginBottom: 12 }]}>
              Add a photo to support your report
            </Text>
            
            {photo ? (
              <View style={styles.photoContainer}>
                <Image source={{ uri: photo.uri }} style={styles.photoPreview} />
                <TouchableOpacity
                  style={styles.removePhotoButton}
                  onPress={handleRemovePhoto}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close-circle" size={24} color={theme.error || '#EF4444'} />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.photoButtonsContainer}>
                <TouchableOpacity
                  style={[styles.photoButton, dynamicStyles.photoButton]}
                  onPress={handlePickImage}
                  activeOpacity={0.7}
                >
                  <Ionicons name="image-outline" size={24} color={theme.primary} />
                  <Text style={[styles.photoButtonText, dynamicStyles.photoButtonText]}>Choose from Library</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.photoButton, dynamicStyles.photoButton]}
                  onPress={handleTakePhoto}
                  activeOpacity={0.7}
                >
                  <Ionicons name="camera-outline" size={24} color={theme.primary} />
                  <Text style={[styles.photoButtonText, dynamicStyles.photoButtonText]}>Take Photo</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Submit Button */}
        <View style={[styles.footer, { paddingBottom: 20 + insets.bottom }]}>
          <TouchableOpacity
            style={[
              styles.submitButton, 
              dynamicStyles.submitButton,
              (!reason.trim() || reason.trim().length < 10) && dynamicStyles.submitButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting || !reason.trim() || reason.trim().length < 10}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.submitButtonText}>Submit Report</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

