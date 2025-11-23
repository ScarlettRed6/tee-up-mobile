import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Modal, Pressable, ActivityIndicator, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from './styles/UserProfileScreen.styles';
import { navigateToBottomNav } from '../navigation/navigationHelpers';
import { isCurrentUser } from '../utils/userConstants';
import { getUserById } from '../api/userApi';
import { fetchUserListings } from '../api/listingsApi';

export default function UserProfileScreen({ navigation, route }) {
  // Get user ID or user object from route params
  const userIdFromParams = route?.params?.userId;
  const userFromParams = route?.params?.user;

  // Get filters from route params if navigating from filter screen
  const initialFilters = route?.params?.filters || {};
  
  const [user, setUser] = useState(userFromParams || null);
  const [userListings, setUserListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState(initialFilters.searchQuery || '');
  const [selectedCategory, setSelectedCategory] = useState(initialFilters.category || 'All');
  const [selectedCondition, setSelectedCondition] = useState(initialFilters.condition || null);
  const [selectedFlex, setSelectedFlex] = useState(initialFilters.flex || null);
  const [selectedHand, setSelectedHand] = useState(initialFilters.hand || null); // Right Hand, Left Hand
  const [sortBy, setSortBy] = useState('recentlyListed');
  const [showSortModal, setShowSortModal] = useState(false);

  // Fetch user data and listings
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      setError(null);

      try {
        let userData = userFromParams;
        let targetUserId = userIdFromParams;

        console.log('UserProfileScreen - Route params:', { userIdFromParams, userFromParams });

        // Priority: userIdFromParams > userFromParams.id > userFromParams (fallback)
        // If userId is provided, fetch user data from API
        if (userIdFromParams) {
          console.log('Fetching user by ID:', userIdFromParams);
          const fetchedUser = await getUserById(userIdFromParams);
          console.log('Fetched user:', fetchedUser);
          userData = {
            id: fetchedUser.id,
            username: fetchedUser.name || fetchedUser.email?.split('@')[0] || 'User',
            name: fetchedUser.name,
            email: fetchedUser.email,
            profile_image: fetchedUser.profile_image || null,
            avatarColor: '#FF6B35', // Default color, can be enhanced later
            rating: 4.5, // Default, can be fetched from reviews later
            reviewCount: 0, // Default, can be fetched from reviews later
            activeListings: 0, // Will be updated after fetching listings
            followers: '0', // Default, can be fetched later
            itemsSold: '0', // Default, can be fetched later
            reputation: 4.5, // Default, can be calculated from reviews later
            bio: 'Golf enthusiast and club collector.', // Default, can be added to user model later
          };
          targetUserId = fetchedUser.id;
        } else if (userFromParams?.id) {
          // Use ID from user object if provided
          console.log('Using user ID from user object:', userFromParams.id);
          targetUserId = userFromParams.id;
          // If user object doesn't have all required fields, fetch from API
          if (!userFromParams.username && !userFromParams.name) {
            try {
              const fetchedUser = await getUserById(userFromParams.id);
              userData = {
                ...userFromParams,
                id: fetchedUser.id,
                username: fetchedUser.name || userFromParams.username || 'User',
                name: fetchedUser.name,
                email: fetchedUser.email,
              };
            } catch (err) {
              console.warn('Could not fetch user details, using provided user object');
            }
          }
        } else if (userFromParams) {
          // If user object is passed but no ID, try to extract from username/name
          // This is a fallback for backward compatibility
          console.warn('UserProfileScreen: User object passed without ID, listings may not load correctly');
          console.log('User object:', userFromParams);
        }

        // Set user data (use provided user object or fetched data)
        if (userData) {
          setUser(userData);
        } else {
          // Fallback to default user if nothing is provided
          setUser({
            username: 'Unknown User',
            avatarColor: '#FF6B35',
            activeListings: 0,
            followers: '0',
            itemsSold: '0',
            reputation: 0,
            bio: '',
          });
        }

        // Fetch user listings if we have a user ID
        if (targetUserId) {
          console.log('Fetching listings for user ID:', targetUserId);
          const listings = await fetchUserListings(targetUserId);
          console.log('Fetched listings:', listings);
          console.log('Number of listings:', listings?.length || 0);
          
          // Check if listings is an array
          if (Array.isArray(listings)) {
            // Transform listings to match expected format
            const transformedListings = listings.map(listing => {
              // Ensure price is a number for sorting
              const priceNum = typeof listing.price === 'string' 
                ? parseFloat(listing.price.replace(/[^0-9.]/g, '')) 
                : parseFloat(listing.price) || 0;
              
              return {
                id: listing.listing_id,
                name: listing.title,
                price: `₱${priceNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                priceValue: priceNum, // Ensure it's a number
                seller: userData?.username || userData?.name || listing.seller_name || 'Unknown',
                sellerColor: userData?.avatarColor || '#FF6B35',
                category: listing.category,
                condition: listing.condition,
                flex: listing.flex || null,
                hand: listing.hand || null,
                listedDate: listing.date_posted ? new Date(listing.date_posted) : new Date(),
                description: listing.description,
                brand: listing.brand,
                status: listing.status,
                listingData: listing, // Keep original listing data including photos
              };
            });

            console.log('Transformed listings:', transformedListings);
            setUserListings(transformedListings);
            
            // Update active listings count
            if (userData) {
              setUser(prev => ({
                ...prev,
                activeListings: transformedListings.filter(l => l.status === 'Available' || l.status === 'available').length,
              }));
            }
          } else {
            console.warn('Listings is not an array:', listings);
            setUserListings([]);
          }
        } else {
          console.warn('No targetUserId available, cannot fetch listings');
          setUserListings([]);
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        console.error('Error details:', err.response?.data || err.message);
        setError(err.message || 'Failed to load user profile');
        // Don't show alert immediately, let user see the error state
        // Alert.alert(
        //   'Error',
        //   err.response?.data?.message || err.message || 'Failed to load user profile',
        //   [{ text: 'OK' }]
        // );
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userIdFromParams, userFromParams?.id]);

  // Filter and sort products
  const filteredAndSortedProducts = React.useMemo(() => {
    console.log('Filtering products - userListings length:', userListings.length);
    console.log('Filtering products - userListings:', userListings);
    console.log('Current filters:', { searchQuery, selectedCategory, selectedCondition, selectedFlex, selectedHand, sortBy });
    
    let filtered = [...userListings];

    // Search filter
    if (searchQuery.trim().length > 0) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      console.log('After search filter:', filtered.length);
    }

    // Category filter
    if (selectedCategory && selectedCategory !== 'All') {
      filtered = filtered.filter(product => product.category === selectedCategory);
      console.log('After category filter:', filtered.length, 'category:', selectedCategory);
    }

    // Condition filter
    if (selectedCondition) {
      filtered = filtered.filter(product => product.condition === selectedCondition);
      console.log('After condition filter:', filtered.length);
    }

    // Flex filter
    if (selectedFlex) {
      filtered = filtered.filter(product => product.flex === selectedFlex);
      console.log('After flex filter:', filtered.length);
    }

    // Hand filter
    if (selectedHand) {
      filtered = filtered.filter(product => product.hand === selectedHand);
      console.log('After hand filter:', filtered.length);
    }

    // Sort
    switch (sortBy) {
      case 'recentlyListed':
        filtered.sort((a, b) => {
          const dateA = a.listedDate instanceof Date ? a.listedDate : new Date(a.listedDate);
          const dateB = b.listedDate instanceof Date ? b.listedDate : new Date(b.listedDate);
          return dateB - dateA;
        });
        break;
      case 'oldestListing':
        filtered.sort((a, b) => {
          const dateA = a.listedDate instanceof Date ? a.listedDate : new Date(a.listedDate);
          const dateB = b.listedDate instanceof Date ? b.listedDate : new Date(b.listedDate);
          return dateA - dateB;
        });
        break;
      case 'mostExpensive':
        filtered.sort((a, b) => {
          const priceA = typeof a.priceValue === 'number' ? a.priceValue : parseFloat(a.priceValue) || 0;
          const priceB = typeof b.priceValue === 'number' ? b.priceValue : parseFloat(b.priceValue) || 0;
          return priceB - priceA;
        });
        break;
      case 'cheapest':
        filtered.sort((a, b) => {
          const priceA = typeof a.priceValue === 'number' ? a.priceValue : parseFloat(a.priceValue) || 0;
          const priceB = typeof b.priceValue === 'number' ? b.priceValue : parseFloat(b.priceValue) || 0;
          return priceA - priceB;
        });
        break;
      default:
        filtered.sort((a, b) => {
          const dateA = a.listedDate instanceof Date ? a.listedDate : new Date(a.listedDate);
          const dateB = b.listedDate instanceof Date ? b.listedDate : new Date(b.listedDate);
          return dateB - dateA;
        });
        break;
    }

    console.log('Final filtered products:', filtered.length);
    console.log('Final filtered products data:', filtered);
    return filtered;
  }, [userListings, searchQuery, selectedCategory, selectedCondition, selectedFlex, selectedHand, sortBy]);

  const renderProductCard = (item, index) => {
    const isLeft = index % 2 === 0;
    
    // Get first photo from listing data
    const listingPhotos = item.listingData?.photos || [];
    const firstPhoto = Array.isArray(listingPhotos) && listingPhotos.length > 0 
      ? listingPhotos[0] 
      : null;
    
    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.productCard, isLeft ? styles.cardLeft : styles.cardRight]}
        onPress={() => navigation.navigate('ProductDetail', {
          product: {
            listing_id: item.id,
            id: item.id,
            title: item.name,
            price: item.priceValue || parseFloat(item.price.replace('₱', '').replace(/,/g, '')) || 0,
            location: 'Quezon City', // Can be added to listing model later
            postedDate: item.listedDate ? item.listedDate.toISOString() : new Date().toISOString(),
            description: item.description || 'No description available',
            category: item.category,
            condition: item.condition,
            brand: item.brand,
            seller: {
              name: item.seller,
              rating: user?.rating || 4.5,
              reviewCount: user?.reviewCount || 0,
            },
            seller_name: item.seller,
            photos: listingPhotos,
            images: listingPhotos && listingPhotos.length > 0
              ? listingPhotos.map((photo, idx) => ({ id: idx + 1, uri: photo }))
              : [],
            reviews: [],
            status: item.status,
          }
        })}
        activeOpacity={0.8}
      >
        {firstPhoto ? (
          <Image 
            source={{ uri: firstPhoto }}
            style={styles.productImage}
            resizeMode="cover"
            onError={(error) => {
              console.error('Image load error for listing:', item.id, error.nativeEvent.error);
              console.error('Failed URL:', firstPhoto);
            }}
          />
        ) : (
          <View style={styles.productImagePlaceholder}>
            <Ionicons name="image-outline" size={24} color="#999" />
            <Text style={styles.imagePlaceholderText}>
              {item.name.length > 15 ? item.name.substring(0, 15) + '...' : item.name}
            </Text>
          </View>
        )}
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.productPrice}>{item.price}</Text>
        <View style={styles.sellerInfo}>
          <View style={[styles.sellerAvatar, { marginRight: 6 }]}>
            <Ionicons name="person" size={12} color={item.sellerColor || user?.avatarColor || '#FF6B35'} />
          </View>
          <Text style={styles.sellerName}>@{item.seller}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const handleFilterPress = () => {
    navigation.navigate('SearchFilter', {
      searchQuery,
      filters: {
        searchQuery,
        category: selectedCategory,
        condition: selectedCondition,
        flex: selectedFlex,
        hand: selectedHand,
      },
      returnTo: 'UserProfile',
      user: user,
    });
  };

  const handleApplyFilters = (filters) => {
    setSelectedCategory(filters.category || 'All');
    setSelectedCondition(filters.condition || null);
    setSelectedFlex(filters.flex || null);
    setSelectedHand(filters.hand || null);
    setSearchQuery(filters.searchQuery || '');
  };

  // Listen for filter updates when navigating back
  useEffect(() => {
    if (route?.params?.filters) {
      handleApplyFilters(route.params.filters);
    }
  }, [route?.params?.filters]);

  const sortOptions = [
    { value: 'recentlyListed', label: 'Recently Listed' },
    { value: 'oldestListing', label: 'Oldest Listing' },
    { value: 'mostExpensive', label: 'Most Expensive' },
    { value: 'cheapest', label: 'Cheapest' },
  ];

  // Render stars based on rating
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Ionicons key={i} name="star" size={18} color="#FFD700" style={{ marginRight: 4 }} />
      );
    }
    if (hasHalfStar) {
      stars.push(
        <Ionicons key="half" name="star-half" size={18} color="#FFD700" style={{ marginRight: 4 }} />
      );
    }
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Ionicons key={`empty-${i}`} name="star-outline" size={18} color="#FFD700" style={{ marginRight: 4 }} />
      );
    }
    return stars;
  };

  // Show loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={{ marginTop: 16, color: '#666' }}>Loading profile...</Text>
        </View>
      </View>
    );
  }

  // Show error state
  if (error || !user) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Ionicons name="alert-circle-outline" size={48} color="#FF6B35" />
          <Text style={{ marginTop: 16, color: '#666', textAlign: 'center' }}>
            {error || 'User not found'}
          </Text>
          <TouchableOpacity
            style={{ marginTop: 20, padding: 12, backgroundColor: '#FF6B35', borderRadius: 8 }}
            onPress={() => navigation.goBack()}
          >
            <Text style={{ color: '#FFF', fontWeight: '600' }}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Back Button - No Settings Icon */}
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
        {/* Profile Summary Card */}
        <View style={styles.profileSection}>
          <View style={styles.profilePhotoContainer}>
            {user.profile_image ? (
              <Image 
                source={{ uri: user.profile_image }}
                style={[styles.profilePhoto, { borderColor: user.avatarColor || '#E0E0E0' }]}
                resizeMode="cover"
                onError={(error) => {
                  console.error('Profile image load error:', error.nativeEvent.error);
                  console.error('Failed URL:', user.profile_image);
                }}
              />
            ) : (
              <View style={[styles.profilePhoto, { borderColor: user.avatarColor || '#E0E0E0' }]}>
                <Ionicons name="person" size={50} color={user.avatarColor || '#FF6B35'} />
              </View>
            )}
          </View>
          
          <Text style={styles.username}>{user.username || user.name}</Text>
          
          <View style={styles.statsContainer}>
            <Text style={styles.statText}>Active Listings: {user.activeListings}</Text>
            <Text style={styles.statText}>{user.followers} followers</Text>
            <Text style={styles.statText}>{user.itemsSold} items sold</Text>
          </View>
          
          <View style={styles.reputationContainer}>
            <Text style={styles.reputationText}>User Reputation: {user.reputation}</Text>
            <View style={styles.starsContainer}>
              {renderStars(user.reputation)}
            </View>
          </View>
        </View>

        {/* Bio Section */}
        <View style={styles.bioSection}>
          <Text style={styles.bioText}>
            {user.bio}
          </Text>
        </View>

        {/* Search and Filters */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={18} color="#666" style={styles.searchIcon} />
            <TextInput
              placeholder="Search seller's listing."
              placeholderTextColor="#999"
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          
          <View style={styles.filterButtons}>
            <TouchableOpacity 
              style={[styles.filterButton, { marginRight: 12 }]}
              onPress={handleFilterPress}
            >
              <Text style={styles.filterButtonText}>Filters</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.filterButton}
              onPress={() => setShowSortModal(true)}
            >
              <Text style={styles.filterButtonText}>Sort by</Text>
              <Ionicons name="chevron-down" size={16} color="#000" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Listings Grid */}
        <View style={styles.listingsSection}>
          <View style={styles.productGrid}>
            {filteredAndSortedProducts.length > 0 ? (
              filteredAndSortedProducts.map((product, index) => renderProductCard(product, index))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="cube-outline" size={48} color="#999" style={{ marginBottom: 12 }} />
                <Text style={styles.emptyStateText}>
                  {loading ? 'Loading listings...' : 
                   searchQuery || selectedCategory !== 'All' || selectedCondition || selectedFlex || selectedHand
                     ? 'No products match your filters' 
                     : userListings.length === 0 
                       ? 'This user has no listings yet' 
                       : 'No products found'}
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Sort Modal */}
      <Modal
        visible={showSortModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSortModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable 
            style={styles.modalOverlayBackdrop}
            onPress={() => setShowSortModal(false)}
          />
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sort by</Text>
            {sortOptions.map((option) => (
              <Pressable
                key={option.value}
                style={[
                  styles.modalOption,
                  sortBy === option.value && styles.modalOptionSelected
                ]}
                onPress={() => {
                  setSortBy(option.value);
                  setShowSortModal(false);
                }}
              >
                <Text style={[
                  styles.modalOptionText,
                  sortBy === option.value && styles.modalOptionTextSelected
                ]}>
                  {option.label}
                </Text>
                {sortBy === option.value && (
                  <Ionicons name="checkmark" size={20} color="#FF6B35" />
                )}
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigateToBottomNav(navigation, 'Discover')}
        >
          <Ionicons name="home-outline" size={22} color="#999" />
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigateToBottomNav(navigation, 'Inbox')}
        >
          <Ionicons name="chatbubble-outline" size={22} color="#999" />
          <Text style={styles.navLabel}>Inbox</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('PostItem')}
        >
          <Ionicons name="add-circle-outline" size={22} color="#999" />
          <Text style={styles.navLabel}>Sell</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigateToBottomNav(navigation, 'Notifications')}
        >
          <Ionicons name="notifications-outline" size={22} color="#999" />
          <Text style={styles.navLabel}>Notifications</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigateToBottomNav(navigation, 'Profile')}
        >
          <Ionicons name="person-outline" size={22} color="#999" />
          <Text style={styles.navLabel}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
