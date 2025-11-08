import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function PostItemScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState(null);
  const [flex, setFlex] = useState(null);
  const [condition, setCondition] = useState(null);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [photos, setPhotos] = useState([]);

  const categories = ['Driver', 'Woods', 'Iron', 'Putters', 'Apparel', 'Accessories', 'Others'];
  const flexOptions = ['Ladies', 'Senior', 'Medium', 'Regular', 'Stiff', 'Extra Stiff'];
  const conditions = ['New', 'Slightly Used', 'Well Used'];
  const showFlexSection = category === 'Driver' || category === 'Woods' || category === 'Iron';

  // Form validation
  const isFormValid = 
    title.trim().length > 0 &&
    price.trim().length > 0 &&
    category !== null &&
    (!showFlexSection || flex !== null) &&
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6EDE2',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: '#F6EDE2',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontFamily: 'Exo_700Bold',
    fontSize: 24,
    color: '#222',
    flex: 1,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
    paddingTop: 8,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  label: {
    fontFamily: 'Exo_700Bold',
    fontSize: 16,
    color: '#222',
    marginBottom: 12,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  uploadButtonText: {
    fontFamily: 'Exo_500Medium',
    fontSize: 16,
    color: '#222',
    marginLeft: 8,
  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontFamily: 'Exo_400Regular',
    fontSize: 16,
    color: '#222',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  pesoSymbol: {
    fontFamily: 'Exo_400Regular',
    fontSize: 16,
    color: '#222',
    marginRight: 8,
  },
  priceInput: {
    flex: 1,
    paddingVertical: 14,
    fontFamily: 'Exo_400Regular',
    fontSize: 16,
    color: '#222',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: -8,
  },
  categoryPill: {
    backgroundColor: '#F3F3F3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  categoryPillSelected: {
    backgroundColor: '#666',
  },
  categoryText: {
    fontFamily: 'Exo_500Medium',
    fontSize: 14,
    color: '#222',
  },
  categoryTextSelected: {
    color: '#FFF',
  },
  flexRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: -8,
  },
  flexPill: {
    backgroundColor: '#F3F3F3',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  flexPillSelected: {
    backgroundColor: '#666',
  },
  flexText: {
    fontFamily: 'Exo_500Medium',
    fontSize: 13,
    color: '#222',
  },
  flexTextSelected: {
    color: '#FFF',
  },
  conditionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: -8,
  },
  conditionPill: {
    backgroundColor: '#F3F3F3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  conditionPillSelected: {
    backgroundColor: '#666',
  },
  conditionText: {
    fontFamily: 'Exo_500Medium',
    fontSize: 14,
    color: '#222',
  },
  conditionTextSelected: {
    color: '#FFF',
  },
  descriptionInput: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontFamily: 'Exo_400Regular',
    fontSize: 16,
    color: '#222',
    minHeight: 120,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  charCount: {
    fontFamily: 'Exo_400Regular',
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 6,
  },
  locationInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  locationIcon: {
    marginRight: 8,
  },
  locationInput: {
    flex: 1,
    paddingVertical: 14,
    fontFamily: 'Exo_400Regular',
    fontSize: 16,
    color: '#222',
  },
  bottomSpacer: {
    height: 20,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#F6EDE2',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  postButton: {
    backgroundColor: '#FFF',
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  postButtonDisabled: {
    backgroundColor: '#E0E0E0',
    shadowOpacity: 0.05,
    elevation: 2,
  },
  postButtonText: {
    fontFamily: 'Exo_700Bold',
    fontSize: 18,
    color: '#222',
  },
  postButtonTextDisabled: {
    color: '#999',
  },
  disabledHint: {
    fontFamily: 'Exo_400Regular',
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
});

