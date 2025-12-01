import React, { useState, useContext, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from './styles/SearchFilterScreen.styles';
import jwtDecode from 'jwt-decode';
import { authContext } from '../context/authContext';
import { ThemeContext } from '../context/themeContext';
import { getRecentSearches, addRecentSearch, removeRecentSearch, clearRecentSearches } from '../storage/recentSearchStorage';

export default function SearchFilterScreen({ navigation, route }) {
  const { accessToken } = useContext(authContext);
  const { theme } = useContext(ThemeContext);
  // Get initial values from route params if navigating from Profile or SearchResults
  const initialFilters = route?.params?.filters || {};
  const returnTo = route?.params?.returnTo || 'SearchResults';
  const isProfileFilter = returnTo === 'Profile' || returnTo === 'UserProfile'; // Simplified filters for Profile page
  
  const [searchQuery, setSearchQuery] = useState(route?.params?.searchQuery || initialFilters.searchQuery || '');
  const [selectedCategory, setSelectedCategory] = useState(initialFilters.category || 'All');
  const [selectedCondition, setSelectedCondition] = useState(initialFilters.condition || null);
  const [minPrice, setMinPrice] = useState(initialFilters.minPrice || '');
  const [maxPrice, setMaxPrice] = useState(initialFilters.maxPrice || '');
  const [selectedFlex, setSelectedFlex] = useState(initialFilters.flex || null);
  const [selectedHand, setSelectedHand] = useState(initialFilters.hand || null); // Right Hand, Left Hand
  const [selectedStatus, setSelectedStatus] = useState(initialFilters.status || 'Available'); // Available, Sold (only for Profile)
  const [location, setLocation] = useState(initialFilters.location || 'Makati City, NCR');
  const [recentSearches, setRecentSearches] = useState([]);
  const [recentLoading, setRecentLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    if (!accessToken) {
      setCurrentUserId(null);
      setRecentSearches([]);
      return;
    }
    try {
      const decoded = jwtDecode(accessToken);
      setCurrentUserId(decoded.id ? decoded.id.toString() : null);
    } catch (error) {
      console.error('Failed to decode token for recent searches', error);
      setCurrentUserId(null);
    }
  }, [accessToken]);

  useEffect(() => {
    let isMounted = true;
    const loadRecent = async () => {
      if (!currentUserId) {
        setRecentSearches([]);
        return;
      }
      setRecentLoading(true);
      try {
        const stored = await getRecentSearches(currentUserId);
        if (isMounted) {
          setRecentSearches(stored);
        }
      } catch (error) {
        console.error('Failed to load recent searches', error);
      } finally {
        if (isMounted) {
          setRecentLoading(false);
        }
      }
    };
    loadRecent();
    return () => {
      isMounted = false;
    };
  }, [currentUserId]);

  // Limit recent searches to 5 items
  const limitedRecentSearches = recentSearches.slice(0, 5);

  const categories = ['All', 'Driver', 'Iron', 'Woods', 'Putters', 'Apparel', 'Accessories', 'Others'];
  const flexOptions = ['Ladies', 'Senior', 'Medium', 'Regular', 'Stiff', 'Extra Stiff'];
  const conditions = ['New', 'Slightly Used', 'Well Used'];
  const handOptions = ['Right Hand', 'Left Hand'];

  // Show flex filter when Iron, Woods, or Driver is selected
  const showFlexSection = selectedCategory === 'Iron' || selectedCategory === 'Driver' || selectedCategory === 'Woods';
  
  // Show hand filter when Driver, Woods, Iron, or Putters is selected
  const showHandSection = selectedCategory === 'Driver' || selectedCategory === 'Woods' || selectedCategory === 'Iron' || selectedCategory === 'Putters';

  const handleClearRecentSearches = async () => {
    if (currentUserId) {
      const cleared = await clearRecentSearches(currentUserId);
      setRecentSearches(cleared);
    } else {
      setRecentSearches([]);
    }
  };

  const handleRemoveSearch = async (searchToRemove) => {
    if (currentUserId) {
      const updated = await removeRecentSearch(currentUserId, searchToRemove);
      setRecentSearches(updated);
    } else {
      const updated = recentSearches.filter(search => search !== searchToRemove);
      setRecentSearches(updated.slice(0, 5));
    }
  };

  const addRecentSearchEntry = async (term) => {
    const trimmed = term?.trim();
    if (!trimmed) return;
    if (currentUserId) {
      const updated = await addRecentSearch(currentUserId, trimmed);
      setRecentSearches(updated);
    } else {
      const filtered = recentSearches.filter(
        (search) => search.toLowerCase() !== trimmed.toLowerCase()
      );
      const updated = [trimmed, ...filtered].slice(0, 5);
      setRecentSearches(updated);
    }
  };

  const handleApplyFilters = async () => {
    const trimmedQuery = searchQuery.trim();
    // Apply filters logic - only include relevant filters based on context
    const filters = {
      searchQuery: trimmedQuery,
      flex: selectedFlex,
      hand: selectedHand,
    };
    
    if (selectedCategory && selectedCategory !== 'All') {
      // Ensure category is trimmed and properly formatted
      filters.category = selectedCategory.trim();
      console.log('🔍 Selected category for filter:', filters.category);
      console.log('🔍 Full filters object:', filters);
    } else {
      console.log('🔍 No category selected or category is "All"');
    }

    if (selectedCondition) {
      filters.condition = selectedCondition;
    }
    
    // Include status filter for Profile page
    if (isProfileFilter) {
      filters.status = selectedStatus;
    } else {
      // Only include price for SearchResults - ensure they're valid numbers
      if (minPrice && minPrice.trim() !== '') {
        const minPriceNum = parseFloat(minPrice.trim());
        if (!Number.isNaN(minPriceNum) && minPriceNum >= 0) {
          filters.minPrice = minPriceNum.toString();
        }
      }
      if (maxPrice && maxPrice.trim() !== '') {
        const maxPriceNum = parseFloat(maxPrice.trim());
        if (!Number.isNaN(maxPriceNum) && maxPriceNum >= 0) {
          filters.maxPrice = maxPriceNum.toString();
        }
      }
    }
    
    console.log('Applying filters:', filters);
    
    // Add search query to recent searches if not empty (only for SearchResults)
    if (!isProfileFilter && trimmedQuery.length > 0) {
      await addRecentSearchEntry(trimmedQuery);
    }
    
    // Navigate based on returnTo parameter
        if (returnTo === 'Profile') {
          navigation.navigate('Profile', { filters });
        } else if (returnTo === 'UserProfile') {
          const user = route?.params?.user;
          navigation.navigate('UserProfile', { filters, user });
        } else {
          // Allow navigation even with empty search query if category or other filters are selected
          const hasFilters = (selectedCategory && selectedCategory !== 'All') || 
                            selectedCondition || 
                            (minPrice && minPrice.trim() !== '') || 
                            (maxPrice && maxPrice.trim() !== '');
          
          navigation.navigate('SearchResults', { 
            searchQuery: trimmedQuery || (hasFilters ? '' : 'All products'),
            filters 
          });
        }
  };

  const dynamicStyles = {
    container: { backgroundColor: theme.background },
    header: { backgroundColor: theme.background },
    scrollView: { backgroundColor: theme.background },
    searchBarContainer: { backgroundColor: theme.background },
    searchBar: { backgroundColor: theme.card },
    searchInput: { color: theme.text },
    section: { backgroundColor: theme.background },
    sectionHeader: { color: theme.text },
    sectionHeaderBold: { color: theme.text },
    searchItem: { backgroundColor: theme.card },
    searchItemText: { color: theme.text },
    emptyStateText: { color: theme.textMuted },
    clearButton: { color: theme.primary },
    categoryPill: { backgroundColor: theme.lightGray },
    categoryPillActive: { backgroundColor: theme.primary },
    categoryText: { color: theme.text },
    categoryTextActive: { color: '#FFF' },
    filterLabel: { color: theme.text },
    priceInputWrapper: { backgroundColor: theme.card, borderColor: theme.border },
    priceInput: { color: theme.text },
    currencySymbol: { color: theme.text },
    filterPill: { backgroundColor: theme.lightGray },
    filterPillActive: { backgroundColor: theme.primary },
    filterPillText: { color: theme.text },
    filterPillTextActive: { color: '#FFF' },
    flexPill: { backgroundColor: theme.lightGray },
    flexPillActive: { backgroundColor: theme.primary },
    flexPillText: { color: theme.text },
    flexPillTextActive: { color: '#FFF' },
    locationPill: { backgroundColor: theme.card },
    locationText: { color: theme.text },
    applyButtonContainer: { 
      backgroundColor: theme.card,
      borderTopColor: theme.border 
    },
    applyButton: { backgroundColor: theme.primary },
    applyButtonText: { color: '#FFF' },
  };

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      {/* Header */}
      <View style={[styles.header, dynamicStyles.header]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={[styles.scrollView, dynamicStyles.scrollView]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar - Only show for SearchResults, not Profile */}
        {!isProfileFilter && (
          <View style={[styles.searchBarContainer, dynamicStyles.searchBarContainer]}>
            <View style={[styles.searchBar, dynamicStyles.searchBar]}>
              <Ionicons name="search-outline" size={20} color={theme.textMuted} style={styles.searchIcon} />
              <TextInput
                style={[styles.searchInput, dynamicStyles.searchInput]}
                placeholder="Search for clubs, gear..."
                placeholderTextColor={theme.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>
        )}

        {/* Recent Searches Section - Only show for SearchResults, not Profile */}
        {!isProfileFilter && (
          <View style={[styles.section, dynamicStyles.section]}>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionHeader, dynamicStyles.sectionHeader]}>Recent Searches</Text>
              {limitedRecentSearches.length > 0 && (
                <Pressable onPress={handleClearRecentSearches}>
                  <Text style={[styles.clearButton, dynamicStyles.clearButton]}>CLEAR</Text>
                </Pressable>
              )}
            </View>
            {recentLoading ? (
              <ActivityIndicator size="small" color={theme.primary} />
            ) : limitedRecentSearches.length > 0 ? (
              limitedRecentSearches.map((search, index) => (
                <View key={index}>
                  <View style={[styles.searchItem, dynamicStyles.searchItem]}>
                    <Pressable 
                      style={{ flex: 1 }}
                      onPress={async () => {
                        setSearchQuery(search);
                        await addRecentSearchEntry(search);
                        navigation.navigate('SearchResults', { 
                          searchQuery: search,
                          filters: {
                            searchQuery: search,
                            category: selectedCategory !== 'All' ? selectedCategory : undefined,
                            condition: selectedCondition,
                            minPrice,
                            maxPrice,
                            flex: selectedFlex,
                            hand: selectedHand,
                          }
                        });
                      }}
                    >
                      <Text style={[styles.searchItemText, dynamicStyles.searchItemText]}>{search}</Text>
                    </Pressable>
                    <TouchableOpacity 
                      onPress={() => handleRemoveSearch(search)}
                      style={styles.removeButton}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="close" size={18} color={theme.textMuted} />
                    </TouchableOpacity>
                  </View>
                  {index < limitedRecentSearches.length - 1 && <View style={[styles.divider, { backgroundColor: theme.border }]} />}
                </View>
              ))
            ) : (
              <Text style={[styles.emptyStateText, dynamicStyles.emptyStateText]}>No recent searches</Text>
            )}
          </View>
        )}

        {/* Categories Section */}
        <View style={[styles.section, dynamicStyles.section]}>
          <Text style={[styles.sectionHeaderBold, dynamicStyles.sectionHeaderBold]}>Categories</Text>
          <View style={styles.categoryRow}>
            {categories.slice(0, 4).map((category) => (
              <Pressable
                key={category}
                style={[
                  styles.categoryPill,
                  dynamicStyles.categoryPill,
                  selectedCategory === category && [styles.categoryPillActive, dynamicStyles.categoryPillActive]
                ]}
                onPress={() => {
                  setSelectedCategory(category);
                  // Clear flex selection if category doesn't support flex
                  if (category !== 'Iron' && category !== 'Driver' && category !== 'Woods') {
                    setSelectedFlex(null);
                  }
                  // Clear hand selection if category doesn't support hand
                  if (category !== 'Iron' && category !== 'Driver' && category !== 'Woods' && category !== 'Putters') {
                    setSelectedHand(null);
                  }
                }}
              >
                <Text style={[
                  styles.categoryText,
                  dynamicStyles.categoryText,
                  selectedCategory === category && [styles.categoryTextActive, dynamicStyles.categoryTextActive]
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
                  dynamicStyles.categoryPill,
                  selectedCategory === category && [styles.categoryPillActive, dynamicStyles.categoryPillActive]
                ]}
                onPress={() => {
                  setSelectedCategory(category);
                  // Clear flex selection if category doesn't support flex
                  if (category !== 'Iron' && category !== 'Driver' && category !== 'Woods') {
                    setSelectedFlex(null);
                  }
                  // Clear hand selection if category doesn't support hand
                  if (category !== 'Iron' && category !== 'Driver' && category !== 'Woods' && category !== 'Putters') {
                    setSelectedHand(null);
                  }
                }}
              >
                <Text style={[
                  styles.categoryText,
                  dynamicStyles.categoryText,
                  selectedCategory === category && [styles.categoryTextActive, dynamicStyles.categoryTextActive]
                ]}>
                  {category}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Filter By Section */}
        <View style={[styles.section, dynamicStyles.section]}>
          <Text style={[styles.sectionHeaderBold, dynamicStyles.sectionHeaderBold]}>Filter By:</Text>

          {/* Price Filters - Only show for SearchResults, not Profile */}
          {!isProfileFilter && (
            <View style={styles.priceRow}>
              <View style={styles.priceInputContainer}>
                <Text style={[styles.filterLabel, dynamicStyles.filterLabel]}>Minimum Price</Text>
                <View style={[styles.priceInputWrapper, dynamicStyles.priceInputWrapper]}>
                  <Text style={[styles.currencySymbol, dynamicStyles.currencySymbol]}>₱</Text>
                  <TextInput
                    style={[styles.priceInput, dynamicStyles.priceInput]}
                    placeholder="0"
                    placeholderTextColor={theme.textMuted}
                    value={minPrice}
                    onChangeText={(text) => {
                      // Only allow numbers
                      const numericText = text.replace(/[^0-9]/g, '');
                      setMinPrice(numericText);
                    }}
                    keyboardType="numeric"
                  />
                </View>
              </View>
              <View style={styles.priceInputContainer}>
                <Text style={[styles.filterLabel, dynamicStyles.filterLabel]}>Maximum Price</Text>
                <View style={[styles.priceInputWrapper, dynamicStyles.priceInputWrapper]}>
                  <Text style={[styles.currencySymbol, dynamicStyles.currencySymbol]}>₱</Text>
                  <TextInput
                    style={[styles.priceInput, dynamicStyles.priceInput]}
                    placeholder="0"
                    placeholderTextColor={theme.textMuted}
                    value={maxPrice}
                    onChangeText={(text) => {
                      // Only allow numbers
                      const numericText = text.replace(/[^0-9]/g, '');
                      setMaxPrice(numericText);
                    }}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>
          )}

          {/* Condition Filter */}
          <View style={styles.filterGroup}>
            <Text style={[styles.filterLabel, dynamicStyles.filterLabel]}>Condition</Text>
            <View style={styles.filterPillsRow}>
              {conditions.map((condition) => (
                <Pressable
                  key={condition}
                  style={[
                    styles.filterPill,
                    dynamicStyles.filterPill,
                    selectedCondition === condition && [styles.filterPillActive, dynamicStyles.filterPillActive]
                  ]}
                  onPress={() => setSelectedCondition(condition)}
                >
                  <Text style={[
                    styles.filterPillText,
                    dynamicStyles.filterPillText,
                    selectedCondition === condition && [styles.filterPillTextActive, dynamicStyles.filterPillTextActive]
                  ]}>
                    {condition}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Hand Filter (conditional) - Show when Driver/Woods/Iron/Putters is selected */}
          {showHandSection && (
            <View style={styles.filterGroup}>
              <Text style={[styles.filterLabel, dynamicStyles.filterLabel]}>Hand</Text>
              <View style={styles.filterPillsRow}>
                {handOptions.map((hand) => (
                  <Pressable
                    key={hand}
                    style={[
                      styles.filterPill,
                      dynamicStyles.filterPill,
                      selectedHand === hand && [styles.filterPillActive, dynamicStyles.filterPillActive]
                    ]}
                    onPress={() => setSelectedHand(selectedHand === hand ? null : hand)}
                  >
                    <Text style={[
                      styles.filterPillText,
                      dynamicStyles.filterPillText,
                      selectedHand === hand && [styles.filterPillTextActive, dynamicStyles.filterPillTextActive]
                    ]}>
                      {hand}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* Flex Filter (conditional) - Show when Driver/Iron/Woods is selected */}
          {showFlexSection && (
            <View style={styles.filterGroup}>
              <Text style={[styles.filterLabel, dynamicStyles.filterLabel]}>Flex</Text>
              <View style={styles.flexPillsRow}>
                {flexOptions.map((flex) => (
                  <Pressable
                    key={flex}
                    style={[
                      styles.flexPill,
                      dynamicStyles.flexPill,
                      selectedFlex === flex && [styles.flexPillActive, dynamicStyles.flexPillActive]
                    ]}
                    onPress={() => setSelectedFlex(selectedFlex === flex ? null : flex)}
                  >
                    <Text style={[
                      styles.flexPillText,
                      dynamicStyles.flexPillText,
                      selectedFlex === flex && [styles.flexPillTextActive, dynamicStyles.flexPillTextActive]
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
              <Text style={[styles.filterLabel, dynamicStyles.filterLabel]}>Status</Text>
              <View style={styles.filterPillsRow}>
                <Pressable
                  style={[
                    styles.filterPill,
                    dynamicStyles.filterPill,
                    selectedStatus === 'Available' && [styles.filterPillActive, dynamicStyles.filterPillActive]
                  ]}
                  onPress={() => setSelectedStatus('Available')}
                >
                  <Text style={[
                    styles.filterPillText,
                    dynamicStyles.filterPillText,
                    selectedStatus === 'Available' && [styles.filterPillTextActive, dynamicStyles.filterPillTextActive]
                  ]}>
                    Available
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.filterPill,
                    dynamicStyles.filterPill,
                    selectedStatus === 'Pending' && [styles.filterPillActive, dynamicStyles.filterPillActive]
                  ]}
                  onPress={() => setSelectedStatus('Pending')}
                >
                  <Text style={[
                    styles.filterPillText,
                    dynamicStyles.filterPillText,
                    selectedStatus === 'Pending' && [styles.filterPillTextActive, dynamicStyles.filterPillTextActive]
                  ]}>
                    Pending
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.filterPill,
                    dynamicStyles.filterPill,
                    selectedStatus === 'Sold' && [styles.filterPillActive, dynamicStyles.filterPillActive]
                  ]}
                  onPress={() => setSelectedStatus('Sold')}
                >
                  <Text style={[
                    styles.filterPillText,
                    dynamicStyles.filterPillText,
                    selectedStatus === 'Sold' && [styles.filterPillTextActive, dynamicStyles.filterPillTextActive]
                  ]}>
                    Sold
                  </Text>
                </Pressable>
              </View>
            </View>
          )}

        </View>

        {/* Bottom Spacer for Apply Button */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Apply Filters / Search Button */}
      <View style={[styles.applyButtonContainer, dynamicStyles.applyButtonContainer]}>
        <TouchableOpacity 
          style={[styles.applyButton, dynamicStyles.applyButton]}
          onPress={handleApplyFilters}
          activeOpacity={0.8}
        >
          <Text style={[styles.applyButtonText, dynamicStyles.applyButtonText]}>
            {isProfileFilter ? 'Apply Filters' : 'Search'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

