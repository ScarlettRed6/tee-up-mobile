import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from './styles/PostItemScreen.styles';

export default function PostItemScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState(null);
  const [flex, setFlex] = useState(null);
  const [hand, setHand] = useState(null); // Right Hand, Left Hand
  const [condition, setCondition] = useState(null);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [photos, setPhotos] = useState([]);

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
    description.trim().length > 0 &&
    location.trim().length > 0;

  const handlePostItem = () => {
    if (isFormValid) {
      // Handle post item logic here
      console.log('Posting item:', {
        title,
        price,
        category,
        flex,
        hand,
        condition,
        description,
        location,
        photos,
      });
      // Navigate back or show success message
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post an Item</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Upload Photos Section */}
        <View style={styles.section}>
          <Text style={styles.label}>Upload Photos (max 5)</Text>
          <Pressable style={styles.uploadButton}>
            <Ionicons name="add" size={24} color="#222" />
            <Text style={styles.uploadButtonText}>Add</Text>
          </Pressable>
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
        <View style={styles.section}>
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
          />
          <Text style={styles.charCount}>{description.length}/300</Text>
        </View>

        {/* Location Section */}
        <View style={styles.section}>
          <Text style={styles.label}>Location</Text>
          <View style={styles.locationInputContainer}>
            <Ionicons name="location-outline" size={20} color="#666" style={styles.locationIcon} />
            <TextInput
              value={location}
              onChangeText={setLocation}
              style={styles.locationInput}
              placeholder="Enter location"
              placeholderTextColor="#999"
            />
          </View>
        </View>

        {/* Spacer for bottom button */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Post Item Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.postButton,
            !isFormValid && styles.postButtonDisabled
          ]}
          onPress={handlePostItem}
          disabled={!isFormValid}
        >
          <Text style={[
            styles.postButtonText,
            !isFormValid && styles.postButtonTextDisabled
          ]}>
            Post Item
          </Text>
        </TouchableOpacity>
        {!isFormValid && (
          <Text style={styles.disabledHint}>
            Disabled until fields aren't done
          </Text>
        )}
      </View>
    </View>
  );
}
