import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from './styles/SearchFilterScreen.styles';

export default function SearchFilterScreen({ navigation, route }) {
  // Get initial values from route params if navigating from Profile or SearchResults
  const initialFilters = route?.params?.filters || {};
  const returnTo = route?.params?.returnTo || 'SearchResults';
  const isProfileFilter = returnTo === 'Profile' || returnTo === 'UserProfile'; // Simplified filters for Profile page
  
  const [searchQuery, setSearchQuery] = useState(route?.params?.searchQuery || initialFilters.searchQuery || '');
  const [selectedCategory, setSelectedCategory] = useState(initialFilters.category || (isProfileFilter ? 'All' : 'Iron'));
  const [selectedCondition, setSelectedCondition] = useState(initialFilters.condition || (isProfileFilter ? null : 'Slightly Used'));
  const [minPrice, setMinPrice] = useState(initialFilters.minPrice || '');
  const [maxPrice, setMaxPrice] = useState(initialFilters.maxPrice || '');
  const [selectedFlex, setSelectedFlex] = useState(initialFilters.flex || null);
  const [selectedStatus, setSelectedStatus] = useState(initialFilters.status || 'Available'); // Available, Sold (only for Profile)
  const [location, setLocation] = useState(initialFilters.location || 'Makati City, NCR');
  const [recentSearches, setRecentSearches] = useState([
    'taylormade golf',
    'callaway driver',
    'titleist iron set',
  ]);

  // Limit recent searches to 5 items
  const limitedRecentSearches = recentSearches.slice(0, 5);

  const categories = isProfileFilter 
    ? ['All', 'Driver', 'Woods', 'Iron', 'Accessories', 'Putters', 'Apparell', 'Others']
    : ['All', 'Driver', 'Iron', 'Accessories', 'Putters', 'Apparell', 'Others'];
  // Note: For Profile page, we include 'Woods' in the categories list
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
    // Apply filters logic - only include relevant filters based on context
    const filters = {
      searchQuery: isProfileFilter ? searchQuery : searchQuery, // Keep search query if from profile
      category: selectedCategory,
      condition: selectedCondition,
      flex: selectedFlex,
    };
    
    // Include status filter for Profile page
    if (isProfileFilter) {
      filters.status = selectedStatus;
    } else {
      // Only include price and location for SearchResults
      filters.minPrice = minPrice;
      filters.maxPrice = maxPrice;
      filters.location = location;
    }
    
    console.log('Applying filters:', filters);
    
    // Add search query to recent searches if not empty (only for SearchResults)
    if (!isProfileFilter && searchQuery.trim().length > 0) {
      addRecentSearch(searchQuery);
    }
    
    // Navigate based on returnTo parameter
        if (returnTo === 'Profile') {
          navigation.navigate('Profile', { filters });
        } else if (returnTo === 'UserProfile') {
          const user = route?.params?.user;
          navigation.navigate('UserProfile', { filters, user });
        } else {
          navigation.navigate('SearchResults', { 
            searchQuery: searchQuery || 'all products',
            filters 
          });
        }
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
        {/* Search Bar - Only show for SearchResults, not Profile */}
        {!isProfileFilter && (
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
        )}

        {/* Recent Searches Section - Only show for SearchResults, not Profile */}
        {!isProfileFilter && (
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
                    <Pressable 
                      style={{ flex: 1 }}
                      onPress={() => {
                        setSearchQuery(search);
                        navigation.navigate('SearchResults', { 
                          searchQuery: search,
                          filters: {
                            searchQuery: search,
                            category: selectedCategory,
                            condition: selectedCondition,
                            minPrice,
                            maxPrice,
                            flex: selectedFlex,
                            location,
                          }
                        });
                      }}
                    >
                      <Text style={styles.searchItemText}>{search}</Text>
                    </Pressable>
                    <TouchableOpacity 
                      onPress={() => handleRemoveSearch(search)}
                      style={styles.removeButton}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="close" size={18} color="#666" />
                    </TouchableOpacity>
                  </View>
                  {index < limitedRecentSearches.length - 1 && <View style={styles.divider} />}
                </View>
              ))
            ) : (
              <Text style={styles.emptyStateText}>No recent searches</Text>
            )}
          </View>
        )}

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
                  // Clear flex selection if category doesn't support flex
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
                  // Clear flex selection if category doesn't support flex
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

          {/* Price Filters - Only show for SearchResults, not Profile */}
          {!isProfileFilter && (
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
          )}

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

          {/* Flex Filter (conditional) - Show when Driver/Iron/Woods is selected */}
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
                    onPress={() => setSelectedFlex(selectedFlex === flex ? null : flex)}
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

          {/* Status Filter - Only show for Profile, not SearchResults */}
          {isProfileFilter && (
            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>Status</Text>
              <View style={styles.filterPillsRow}>
                <Pressable
                  style={[
                    styles.filterPill,
                    selectedStatus === 'Available' && styles.filterPillActive
                  ]}
                  onPress={() => setSelectedStatus('Available')}
                >
                  <Text style={[
                    styles.filterPillText,
                    selectedStatus === 'Available' && styles.filterPillTextActive
                  ]}>
                    Available
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.filterPill,
                    selectedStatus === 'Sold' && styles.filterPillActive
                  ]}
                  onPress={() => setSelectedStatus('Sold')}
                >
                  <Text style={[
                    styles.filterPillText,
                    selectedStatus === 'Sold' && styles.filterPillTextActive
                  ]}>
                    Sold
                  </Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* Location Filter - Only show for SearchResults, not Profile */}
          {!isProfileFilter && (
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
          )}
        </View>

        {/* Bottom Spacer for Apply Button */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Apply Filters / Search Button */}
      <View style={styles.applyButtonContainer}>
        <TouchableOpacity 
          style={styles.applyButton}
          onPress={handleApplyFilters}
          activeOpacity={0.8}
        >
          <Text style={styles.applyButtonText}>
            {isProfileFilter ? 'Apply Filters' : 'Search'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

