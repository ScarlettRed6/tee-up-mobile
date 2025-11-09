import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from './styles/SearchFilterScreen.styles';

export default function SearchFilterScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Iron');
  const [selectedCondition, setSelectedCondition] = useState('Slightly Used');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedFlex, setSelectedFlex] = useState(null);
  const [location, setLocation] = useState('Makati City, NCR');
  const [recentSearches, setRecentSearches] = useState([
    'taylormade golf',
    'callaway driver',
    'titleist iron set',
  ]);

  // Limit recent searches to 5 items
  const limitedRecentSearches = recentSearches.slice(0, 5);

  const categories = ['All', 'Driver', 'Iron', 'Accessories', 'Putters', 'Apparell', 'Others'];
  // Note: 'Woods' is not in the main categories list but flex filter checks for it
  const flexOptions = ['Ladies', 'Senior', 'Medium', 'Regular', 'Stiff', 'Extra Stiff'];
  const conditions = ['New', 'Slightly Used', 'Well Used'];

  // Show flex filter when Iron, Woods, or Driver is selected
  const showFlexSection = selectedCategory === 'Iron' || selectedCategory === 'Driver' || selectedCategory === 'Woods';

  const handleClearRecentSearches = () => {
    setRecentSearches([]);
  };

  const handleRemoveSearch = (searchToRemove) => {
    const updated = recentSearches.filter(search => search !== searchToRemove);
    setRecentSearches(updated.slice(0, 5)); // Ensure max 5 items
  };

  // Helper function to add a new search (for future use)
  const addRecentSearch = (newSearch) => {
    if (!newSearch || newSearch.trim().length === 0) return;
    
    const trimmedSearch = newSearch.trim().toLowerCase();
    // Remove if already exists, then add to beginning, then limit to 5
    const filtered = recentSearches.filter(search => search.toLowerCase() !== trimmedSearch);
    const updated = [trimmedSearch, ...filtered].slice(0, 5);
    setRecentSearches(updated);
  };

  const handleApplyFilters = () => {
    // Apply filters logic
    const filters = {
      searchQuery,
      category: selectedCategory,
      condition: selectedCondition,
      minPrice,
      maxPrice,
      flex: selectedFlex,
      location,
    };
    console.log('Applying filters:', filters);
    // Navigate back with filters or update search results
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar */}
        <View style={styles.searchBarContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for clubs, gear..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Recent Searches Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeader}>Recent Searches</Text>
            <Pressable onPress={handleClearRecentSearches}>
              <Text style={styles.clearButton}>CLEAR</Text>
            </Pressable>
          </View>
          {limitedRecentSearches.length > 0 ? (
            limitedRecentSearches.map((search, index) => (
              <View key={index}>
                <View style={styles.searchItem}>
                  <Text style={styles.searchItemText}>{search}</Text>
                  <Pressable 
                    onPress={() => handleRemoveSearch(search)}
                    style={styles.removeButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="close" size={18} color="#666" />
                  </Pressable>
                </View>
                {index < limitedRecentSearches.length - 1 && <View style={styles.divider} />}
              </View>
            ))
          ) : (
            <Text style={styles.emptyStateText}>No recent searches</Text>
          )}
        </View>

        {/* Categories Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeaderBold}>Categories</Text>
          <View style={styles.categoryRow}>
            {categories.slice(0, 4).map((category) => (
              <Pressable
                key={category}
                style={[
                  styles.categoryPill,
                  selectedCategory === category && styles.categoryPillActive
                ]}
                onPress={() => {
                  setSelectedCategory(category);
                  if (category !== 'Iron' && category !== 'Driver' && category !== 'Woods') {
                    setSelectedFlex(null);
                  }
                }}
              >
                <Text style={[
                  styles.categoryText,
                  selectedCategory === category && styles.categoryTextActive
                ]}>
                  {category}
                </Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.categoryRow}>
            {categories.slice(4).map((category) => (
              <Pressable
                key={category}
                style={[
                  styles.categoryPill,
                  selectedCategory === category && styles.categoryPillActive
                ]}
                onPress={() => {
                  setSelectedCategory(category);
                  if (category !== 'Iron' && category !== 'Driver' && category !== 'Woods') {
                    setSelectedFlex(null);
                  }
                }}
              >
                <Text style={[
                  styles.categoryText,
                  selectedCategory === category && styles.categoryTextActive
                ]}>
                  {category}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Filter By Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeaderBold}>Filter By:</Text>

          {/* Price Filters */}
          <View style={styles.priceRow}>
            <View style={styles.priceInputContainer}>
              <Text style={styles.filterLabel}>Minimum Price</Text>
              <View style={styles.priceInputWrapper}>
                <Text style={styles.currencySymbol}>₱</Text>
                <TextInput
                  style={styles.priceInput}
                  placeholder="0"
                  placeholderTextColor="#999"
                  value={minPrice}
                  onChangeText={setMinPrice}
                  keyboardType="numeric"
                />
              </View>
            </View>
            <View style={styles.priceInputContainer}>
              <Text style={styles.filterLabel}>Maximum Price</Text>
              <View style={styles.priceInputWrapper}>
                <Text style={styles.currencySymbol}>₱</Text>
                <TextInput
                  style={styles.priceInput}
                  placeholder="0"
                  placeholderTextColor="#999"
                  value={maxPrice}
                  onChangeText={setMaxPrice}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          {/* Condition Filter */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Condition</Text>
            <View style={styles.filterPillsRow}>
              {conditions.map((condition) => (
                <Pressable
                  key={condition}
                  style={[
                    styles.filterPill,
                    selectedCondition === condition && styles.filterPillActive
                  ]}
                  onPress={() => setSelectedCondition(condition)}
                >
                  <Text style={[
                    styles.filterPillText,
                    selectedCondition === condition && styles.filterPillTextActive
                  ]}>
                    {condition}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Flex Filter (conditional) */}
          {showFlexSection && (
            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>Flex</Text>
              <View style={styles.flexPillsRow}>
                {flexOptions.map((flex) => (
                  <Pressable
                    key={flex}
                    style={[
                      styles.flexPill,
                      selectedFlex === flex && styles.flexPillActive
                    ]}
                    onPress={() => setSelectedFlex(flex)}
                  >
                    <Text style={[
                      styles.flexPillText,
                      selectedFlex === flex && styles.flexPillTextActive
                    ]}>
                      {flex}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* Location Filter */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Location</Text>
            <Pressable 
              style={styles.locationPill}
              onPress={() => {
                // Open location selector
                console.log('Opening location selector');
              }}
            >
              <Text style={styles.locationText}>{location}</Text>
            </Pressable>
          </View>
        </View>

        {/* Bottom Spacer for Apply Button */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Apply Filters Button */}
      <View style={styles.applyButtonContainer}>
        <TouchableOpacity 
          style={styles.applyButton}
          onPress={handleApplyFilters}
          activeOpacity={0.8}
        >
          <Text style={styles.applyButtonText}>Apply Filters</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

