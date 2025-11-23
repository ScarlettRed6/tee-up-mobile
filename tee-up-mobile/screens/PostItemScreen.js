import React, { useState, useRef, useContext, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Pressable, KeyboardAvoidingView, Platform, Keyboard, Alert, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import styles from './styles/PostItemScreen.styles';
import { createListing, updateListing } from '../api/listingsApi';
import { ListingsContext } from '../context/listingsContext';
import { authContext } from '../context/authContext';

export default function PostItemScreen({ navigation, route }) {
  const { refreshListings } = useContext(ListingsContext);
  const { accessToken } = useContext(authContext);
  
  // Check if we're in edit mode
  const isEditMode = route?.params?.editMode || false;
  const listingData = route?.params?.listingData || null;
  
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState(null);
  const [brand, setBrand] = useState('');
  const [flex, setFlex] = useState(null);
  const [hand, setHand] = useState(null); // Right Hand, Left Hand
  const [condition, setCondition] = useState(null);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [photos, setPhotos] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Request camera/photo library permissions
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

  // Populate form with existing data if in edit mode
  useEffect(() => {
    if (isEditMode && listingData) {
      setTitle(listingData.title || '');
      setPrice(listingData.price?.toString() || '');
      setCategory(listingData.category || null);
      setBrand(listingData.brand || '');
      setFlex(listingData.flex || null);
      setHand(listingData.hand || null);
      setCondition(listingData.condition || null);
      setDescription(listingData.description || '');
      // Convert existing photo URLs to objects with uri property
      const existingPhotos = (listingData.photos || []).map((photoUrl, index) => ({
        uri: typeof photoUrl === 'string' ? photoUrl : photoUrl.uri || photoUrl,
        isExisting: true,
        id: `existing_${index}_${Date.now()}`, // Unique ID for existing photos
      }));
      setPhotos(existingPhotos);
    }
  }, [isEditMode, listingData]);
  
  const scrollViewRef = useRef(null);
  const descriptionSectionRef = useRef(null);
  const locationSectionRef = useRef(null);

  const categories = ['Driver', 'Woods', 'Iron', 'Putters', 'Apparel', 'Accessories', 'Others'];
  const flexOptions = ['Ladies', 'Senior', 'Medium', 'Regular', 'Stiff', 'Extra Stiff'];
  const handOptions = ['Right Hand', 'Left Hand'];
  const conditions = ['New', 'Slightly Used', 'Well Used'];
  const showFlexSection = category === 'Driver' || category === 'Woods' || category === 'Iron';
  const showHandSection = category === 'Driver' || category === 'Woods' || category === 'Iron' || category === 'Putters';

  // Form validation
  const isFormValid = 
    title.trim().length > 0 &&
    price.trim().length > 0 &&
    category !== null &&
    (!showFlexSection || flex !== null) &&
    (!showHandSection || hand !== null) &&
    condition !== null &&
    description.trim().length > 0;

  // Check if user is authenticated
  useEffect(() => {
    if (!accessToken) {
      Alert.alert(
        'Authentication Required',
        'You must be logged in to post a listing.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    }
  }, [accessToken, navigation]);

  const handlePostItem = async () => {
    if (!isFormValid || isSubmitting) return;

    // Verify user is authenticated before posting
    if (!accessToken) {
      Alert.alert(
        'Authentication Required',
        'You must be logged in to post a listing. Please log in and try again.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Prepare listing data according to backend expectations
      // Note: user_id is automatically extracted from JWT token by backend
      const listingDataToSubmit = {
        title: title.trim(),
        description: description.trim(),
        category: category,
        brand: brand.trim() || null, // Optional field
        condition: condition,
        price: parseFloat(price.replace(/,/g, '')) || parseFloat(price), // Remove commas if any
        status: isEditMode ? (listingData?.status || 'Available') : 'Available', // Keep existing status in edit mode
      };

      console.log(isEditMode ? 'Updating listing with data:' : 'Posting listing with data:', listingDataToSubmit);
      console.log('Photos to upload:', photos);
      console.log('User authenticated:', !!accessToken);

      let result;
      if (isEditMode && listingData?.listing_id) {
        // Update existing listing - pass photos separately
        result = await updateListing(listingData.listing_id, listingDataToSubmit, photos);
        console.log('Listing updated successfully:', result);
      } else {
        // Create new listing - pass photos separately
        // Filter out existing photos (URLs) for new listings, only send new files
        const newPhotos = photos.filter(photo => !photo.isExisting);
        result = await createListing(listingDataToSubmit, newPhotos);
        console.log('Listing created successfully:', result);
        console.log('Listing user_id:', result.user_id);
      }
      
      // Refresh listings to show the updated/new one
      if (refreshListings) {
        await refreshListings();
      }

      Alert.alert(
        'Success!',
        isEditMode 
          ? 'Your listing has been updated successfully.'
          : 'Your listing has been posted successfully.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'posting'} listing:`, error);
      console.error('Error response:', error.response?.data);
      
      // Handle authentication errors specifically
      if (error.response?.status === 401) {
        Alert.alert(
          'Authentication Error',
          'Your session has expired. Please log in again.',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else {
        Alert.alert(
          'Error',
          error.response?.data?.error || error.response?.data?.message || error.message || `Failed to ${isEditMode ? 'update' : 'post'} listing. Please try again.`,
          [{ text: 'OK' }]
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToInput = (ref) => {
    // Scroll to input field when focused
    if (ref.current && scrollViewRef.current) {
      setTimeout(() => {
        ref.current.measureLayout(
          scrollViewRef.current,
          (x, y, width, height) => {
            scrollViewRef.current?.scrollTo({
              y: Math.max(0, y - 80),
              animated: true,
            });
          },
          () => {
            // Fallback: scroll to end if measurement fails
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }
        );
      }, 300);
    }
  };

  const handleDescriptionFocus = () => {
    scrollToInput(descriptionSectionRef);
  };

  const handleLocationFocus = () => {
    scrollToInput(locationSectionRef);
  };

  // Image picker functions
  const pickImage = async () => {
    if (photos.length >= 5) {
      Alert.alert('Limit reached', 'You can only upload up to 5 photos.');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const remainingSlots = 5 - photos.length;
        const imagesToAdd = result.assets.slice(0, remainingSlots);
        
        const newPhotos = imagesToAdd.map((asset, index) => ({
          uri: asset.uri,
          type: 'image/jpeg',
          name: `photo_${Date.now()}_${index}.jpg`,
          isExisting: false,
          id: Date.now() + index,
        }));
        
        setPhotos([...photos, ...newPhotos]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const removePhoto = (photoId) => {
    setPhotos(photos.filter(photo => photo.id !== photoId));
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditMode ? 'Edit Listing' : 'Post an Item'}</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        nestedScrollEnabled={true}
      >
        {/* Upload Photos Section */}
        <View style={styles.section}>
          <Text style={styles.label}>Upload Photos (max 5)</Text>
          
          {/* Photo Preview Grid */}
          {photos.length > 0 && (
            <View style={styles.photoGrid}>
              {photos.map((photo, index) => (
                <View key={photo.id || `photo_${index}`} style={styles.photoContainer}>
                  <Image 
                    source={{ uri: photo.uri || photo }} 
                    style={styles.photoPreview}
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    style={styles.removePhotoButton}
                    onPress={() => removePhoto(photo.id)}
                  >
                    <Ionicons name="close-circle" size={24} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
          
          {/* Add Photo Button */}
          {photos.length < 5 && (
            <Pressable 
              style={styles.uploadButton}
              onPress={pickImage}
            >
              <Ionicons name="add" size={24} color="#222" />
              <Text style={styles.uploadButtonText}>
                {photos.length === 0 ? 'Add Photos' : `Add Photo (${5 - photos.length} remaining)`}
              </Text>
            </Pressable>
          )}
          
          {photos.length >= 5 && (
            <Text style={styles.photoLimitText}>
              Maximum 5 photos reached
            </Text>
          )}
        </View>

        {/* Title Section */}
        <View style={styles.section}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            style={styles.input}
            placeholder="Enter item title"
            placeholderTextColor="#999"
          />
        </View>

        {/* Price Section */}
        <View style={styles.section}>
          <Text style={styles.label}>Price (₱)</Text>
          <View style={styles.priceInputContainer}>
            <Text style={styles.pesoSymbol}>₱</Text>
            <TextInput
              value={price}
              onChangeText={setPrice}
              style={styles.priceInput}
              placeholder="0"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Brand Section (Optional) */}
        <View style={styles.section}>
          <Text style={styles.label}>Brand (Optional)</Text>
          <TextInput
            value={brand}
            onChangeText={setBrand}
            style={styles.input}
            placeholder="Enter brand name"
            placeholderTextColor="#999"
          />
        </View>

        {/* Category Section */}
        <View style={styles.section}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.categoryGrid}>
            {categories.map((cat) => (
              <Pressable
                key={cat}
                style={[
                  styles.categoryPill,
                  category === cat && styles.categoryPillSelected
                ]}
                onPress={() => {
                  setCategory(cat);
                  if (cat !== 'Driver' && cat !== 'Woods' && cat !== 'Iron') {
                    setFlex(null);
                  }
                  if (cat !== 'Driver' && cat !== 'Woods' && cat !== 'Iron' && cat !== 'Putters') {
                    setHand(null);
                  }
                }}
              >
                <Text style={[
                  styles.categoryText,
                  category === cat && styles.categoryTextSelected
                ]}>
                  {cat}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Flex Section (conditional) */}
        {showFlexSection && (
          <View style={styles.section}>
            <Text style={styles.label}>Flex</Text>
            <View style={styles.flexRow}>
              {flexOptions.map((flexOption) => (
                <Pressable
                  key={flexOption}
                  style={[
                    styles.flexPill,
                    flex === flexOption && styles.flexPillSelected
                  ]}
                  onPress={() => setFlex(flexOption)}
                >
                  <Text style={[
                    styles.flexText,
                    flex === flexOption && styles.flexTextSelected
                  ]}>
                    {flexOption}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Hand Section (conditional) - Show when Driver/Woods/Iron/Putters is selected */}
        {showHandSection && (
          <View style={styles.section}>
            <Text style={styles.label}>Hand</Text>
            <View style={styles.conditionRow}>
              {handOptions.map((handOption) => (
                <Pressable
                  key={handOption}
                  style={[
                    styles.conditionPill,
                    hand === handOption && styles.conditionPillSelected
                  ]}
                  onPress={() => setHand(handOption)}
                >
                  <Text style={[
                    styles.conditionText,
                    hand === handOption && styles.conditionTextSelected
                  ]}>
                    {handOption}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Condition Section */}
        <View style={styles.section}>
          <Text style={styles.label}>Condition</Text>
          <View style={styles.conditionRow}>
            {conditions.map((cond) => (
              <Pressable
                key={cond}
                style={[
                  styles.conditionPill,
                  condition === cond && styles.conditionPillSelected
                ]}
                onPress={() => setCondition(cond)}
              >
                <Text style={[
                  styles.conditionText,
                  condition === cond && styles.conditionTextSelected
                ]}>
                  {cond}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Description Section */}
        <View ref={descriptionSectionRef} style={styles.section}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            value={description}
            onChangeText={(text) => {
              if (text.length <= 300) {
                setDescription(text);
              }
            }}
            style={styles.descriptionInput}
            placeholder="Enter item description (max 300 characters)"
            placeholderTextColor="#999"
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            onFocus={handleDescriptionFocus}
            blurOnSubmit={false}
          />
          <Text style={styles.charCount}>{description.length}/300</Text>
        </View>

        {/* Location Section (Optional - for future use) */}
        <View ref={locationSectionRef} style={styles.section}>
          <Text style={styles.label}>Location (Optional)</Text>
          <View style={styles.locationInputContainer}>
            <Ionicons name="location-outline" size={20} color="#666" style={styles.locationIcon} />
            <TextInput
              value={location}
              onChangeText={setLocation}
              style={styles.locationInput}
              placeholder="Enter location (optional)"
              placeholderTextColor="#999"
              onFocus={handleLocationFocus}
              returnKeyType="done"
              onSubmitEditing={() => Keyboard.dismiss()}
            />
          </View>
        </View>

        {/* Spacer for bottom button - increased for keyboard */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Post Item Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.postButton,
            (!isFormValid || isSubmitting) && styles.postButtonDisabled
          ]}
          onPress={handlePostItem}
          disabled={!isFormValid || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={[
              styles.postButtonText,
              (!isFormValid || isSubmitting) && styles.postButtonTextDisabled
            ]}>
              {isEditMode ? 'Update Listing' : 'Post Item'}
            </Text>
          )}
        </TouchableOpacity>
        {!isFormValid && !isSubmitting && (
          <Text style={styles.disabledHint}>
            Please fill in all required fields
          </Text>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
