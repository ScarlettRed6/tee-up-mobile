import React, { useState, useEffect, useContext, useCallback } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Modal, Pressable, ActivityIndicator, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styles from './styles/UserProfileScreen.styles';
import { navigateToBottomNav } from '../navigation/navigationHelpers';
import { getUserById } from '../api/userApi';
import { fetchUserListings } from '../api/listingsApi';
import { fetchUserRatingSummary, fetchUserRatings } from '../api/ratingApi';
import { followUser, unfollowUser, getFollowerCount, getFollowStatus } from '../api/followerApi';
import { authContext } from '../context/authContext';
import { ThemeContext } from '../context/themeContext';
import jwtDecode from 'jwt-decode';

const normalizeListingStatus = (statusValue = 'available') => {
  const lower = (statusValue || '').toString().toLowerCase();
  if (lower === 'sold') return 'Sold';
  if (lower === 'pending') return 'Pending';
  return 'Available';
};

export default function UserProfileScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  // Get user ID or user object from route params
  const userIdFromParams = route?.params?.userId;
  const userFromParams = route?.params?.user;

  // Get filters from route params if navigating from filter screen
  const initialFilters = route?.params?.filters || {};
  
  const { accessToken } = useContext(authContext);
  const { theme } = useContext(ThemeContext);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [user, setUser] = useState(userFromParams || null);
  const [userListings, setUserListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ratingSummary, setRatingSummary] = useState({ average_rating: '0.00', total_raters: 0 });
  const [recentRatings, setRecentRatings] = useState([]);
  const [ratingsLoading, setRatingsLoading] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  
  useEffect(() => {
    if (!accessToken) {
      setCurrentUserId(null);
      return;
    }
    try {
      const decoded = jwtDecode(accessToken);
      setCurrentUserId(Number(decoded?.id) || null);
    } catch (err) {
      console.warn('Failed to decode token for follow state:', err.message);
      setCurrentUserId(null);
    }
  }, [accessToken]);

  const renderRatingStars = (ratingValue = 0) => {
    const value = Number(ratingValue || 0);
    const stars = [];
    for (let i = 1; i <= 5; i += 1) {
      let iconName = 'star-outline';
      if (value >= i) {
        iconName = 'star';
      } else if (value >= i - 0.5) {
        iconName = 'star-half';
      }
      stars.push(
        <Ionicons
          key={`profile-rating-star-${i}`}
          name={iconName}
          size={16}
          color={iconName === 'star-outline' ? theme.textMuted : '#FFD700'}
          style={{ marginRight: i === 5 ? 0 : 2 }}
        />
      );
    }
    return stars;
  };

  const fetchFollowerInfo = useCallback(async (targetUserId) => {
    if (!targetUserId) {
      setFollowersCount(0);
      setIsFollowing(false);
      return;
    }
    try {
      const countPromise = getFollowerCount(targetUserId);
      let statusPromise = Promise.resolve({ isFollowing: false });
      if (currentUserId && Number(targetUserId) !== Number(currentUserId)) {
        statusPromise = getFollowStatus(targetUserId);
      }
      const [countRes, statusRes] = await Promise.all([countPromise, statusPromise]);
      setFollowersCount(Number(countRes?.followers || 0));
      if (currentUserId && Number(targetUserId) !== Number(currentUserId)) {
        setIsFollowing(Boolean(statusRes?.isFollowing));
      } else {
        setIsFollowing(false);
      }
    } catch (err) {
      console.error('Failed to load follower info:', err.response?.data || err.message);
      setFollowersCount(0);
      setIsFollowing(false);
    }
  }, [currentUserId]);

  const [searchQuery, setSearchQuery] = useState(initialFilters.searchQuery || '');
  const [selectedCategory, setSelectedCategory] = useState(initialFilters.category || 'All');
const [selectedCondition, setSelectedCondition] = useState(initialFilters.condition || null);
const [selectedFlex, setSelectedFlex] = useState(initialFilters.flex || null);
const [selectedHand, setSelectedHand] = useState(initialFilters.hand || null); // Right Hand, Left Hand
const [selectedStatus, setSelectedStatus] = useState(normalizeListingStatus(initialFilters.status || 'Available'));
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

        if (targetUserId) {
            await fetchRatingsAndListings(targetUserId, userData);
            await fetchFollowerInfo(targetUserId);
          } else {
            console.warn('No targetUserId available, cannot fetch listings');
            setUserListings([]);
            setFollowersCount(0);
            setIsFollowing(false);
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
  }, [userIdFromParams, userFromParams?.id, fetchFollowerInfo]);

  useEffect(() => {
    if (user?.id) {
      fetchFollowerInfo(user.id);
    }
  }, [user?.id, fetchFollowerInfo]);

  const fetchRatingsAndListings = async (targetUserId, userData) => {
    try {
      setRatingsLoading(true);
      const [summaryRes, ratingsRes, listings] = await Promise.all([
        fetchUserRatingSummary(targetUserId),
        fetchUserRatings(targetUserId),
        fetchUserListings(targetUserId)
      ]);

      setRatingSummary({
        average_rating: summaryRes?.average_rating || '0.00',
        total_raters: Number(summaryRes?.total_raters || 0)
      });
      setRecentRatings((ratingsRes?.ratings || []).slice(0, 3));

      if (Array.isArray(listings)) {
        const transformedListings = listings.map(listing => {
          const priceNum = typeof listing.price === 'string' 
            ? parseFloat(listing.price.replace(/[^0-9.]/g, '')) 
            : parseFloat(listing.price) || 0;
          const normalizedStatus = normalizeListingStatus(listing.status);
          return {
            id: listing.listing_id,
            name: listing.title,
            price: `₱${priceNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            priceValue: priceNum,
            seller: userData?.username || userData?.name || listing.seller_name || 'Unknown',
            sellerColor: userData?.avatarColor || '#FF6B35',
            category: listing.category,
            condition: listing.condition,
            flex: listing.flex || null,
            hand: listing.hand || null,
            listedDate: listing.date_posted ? new Date(listing.date_posted) : new Date(),
            description: listing.description,
            brand: listing.brand,
            status: normalizedStatus,
            listingData: { ...listing, status: normalizedStatus },
          };
        });
        setUserListings(transformedListings);
        if (userData) {
          setUser(prev => ({
            ...prev,
            activeListings: transformedListings.filter(
              l => normalizeListingStatus(l.status) === 'Available'
            ).length,
          }));
        }
      } else {
        setUserListings([]);
      }
    } catch (err) {
      console.error('Error loading ratings/listings:', err);
      Alert.alert('Error', 'Failed to load user ratings.');
    } finally {
      setRatingsLoading(false);
    }
  };

  const handleFollowToggle = useCallback(async () => {
    if (!user?.id || followLoading) return;
    if (!accessToken) {
      Alert.alert('Login required', 'Please login to follow users.');
      return;
    }

    try {
      setFollowLoading(true);
      if (isFollowing) {
        await unfollowUser(user.id);
        setIsFollowing(false);
        setFollowersCount((prev) => Math.max(prev - 1, 0));
      } else {
        await followUser(user.id);
        setIsFollowing(true);
        setFollowersCount((prev) => prev + 1);
      }
    } catch (err) {
      console.error('Failed to toggle follow:', err.response?.data || err.message);
      Alert.alert('Error', err.response?.data?.message || err.message || 'Failed to update follow status.');
    } finally {
      setFollowLoading(false);
    }
  }, [user?.id, followLoading, accessToken, isFollowing]);

  const ratingValue = Number(ratingSummary?.average_rating || 0);
  const reviewCount = Number(ratingSummary?.total_raters || 0);
  const hasReviews = reviewCount > 0;

  const dynamicStyles = {
    container: { backgroundColor: theme.background },
    header: { backgroundColor: theme.background },
    scrollView: { backgroundColor: theme.background },
    scrollContent: { backgroundColor: 'transparent' },
    profileHeaderCard: { backgroundColor: theme.card },
    username: { color: theme.text },
    statCard: { backgroundColor: theme.backgroundAlt || '#F6EDE2' },
    statValue: { color: theme.text },
    statLabel: { color: theme.textMuted },
    reputationTitle: { color: theme.text },
    ratingValue: { color: theme.text },
    reviewCount: { color: theme.textMuted },
    bioCard: { backgroundColor: theme.card },
    bioTitle: { color: theme.text },
    bioText: { color: theme.text },
    bioPlaceholderText: { color: theme.textMuted },
    searchBar: { backgroundColor: theme.card },
    searchInput: { color: theme.text },
    filterButton: { backgroundColor: theme.lightGray },
    filterButtonText: { color: theme.text },
    productCard: { backgroundColor: theme.card },
    productName: { color: theme.text },
    productPrice: { color: theme.primary },
    sellerName: { color: theme.textMuted },
    emptyStateText: { color: theme.textMuted },
    reviewsSection: { backgroundColor: 'transparent' },
    reviewsTitle: { color: theme.text },
    reviewCard: { backgroundColor: theme.card },
    reviewText: { color: theme.text },
    reviewAuthor: { color: theme.text },
    reviewDate: { color: theme.textMuted },
    modalOverlay: { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
    modalContent: { backgroundColor: theme.card },
    modalTitle: { color: theme.text },
    modalOption: { backgroundColor: theme.card },
    modalOptionText: { color: theme.text },
    modalOptionSelected: { backgroundColor: theme.backgroundAlt },
    bottomNav: { backgroundColor: theme.card },
  };

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

    // Status filter
    if (selectedStatus) {
      const normalizedSelected = normalizeListingStatus(selectedStatus);
      filtered = filtered.filter(product => normalizeListingStatus(product.status) === normalizedSelected);
      console.log('After status filter:', filtered.length);
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
  }, [userListings, searchQuery, selectedCategory, selectedCondition, selectedFlex, selectedHand, selectedStatus, sortBy]);

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
        style={[styles.productCard, dynamicStyles.productCard, isLeft ? styles.cardLeft : styles.cardRight]}
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
            <Ionicons name="image-outline" size={24} color={theme.textMuted} />
            <Text style={[styles.imagePlaceholderText, { color: theme.textMuted }]}>
              {item.name.length > 15 ? item.name.substring(0, 15) + '...' : item.name}
            </Text>
          </View>
        )}
        <Text style={[styles.productName, dynamicStyles.productName]} numberOfLines={2}>{item.name}</Text>
        <Text style={[styles.productPrice, dynamicStyles.productPrice]}>{item.price}</Text>
        <View style={styles.sellerInfo}>
          <View style={[styles.sellerAvatar, { marginRight: 6 }]}>
            <Ionicons name="person" size={12} color={item.sellerColor || user?.avatarColor || theme.primary} />
          </View>
          <Text style={[styles.sellerName, dynamicStyles.sellerName]}>@{item.seller}</Text>
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
        status: selectedStatus,
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
    setSelectedStatus(filters.status ? normalizeListingStatus(filters.status) : 'Available');
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
  // Show loading state
  if (loading) {
    const loadingStyles = {
      container: { backgroundColor: theme.background },
      header: { backgroundColor: theme.background },
    };
    return (
      <View style={[styles.container, loadingStyles.container]}>
        <View style={[styles.header, loadingStyles.header]}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={{ marginTop: 16, color: theme.textMuted }}>Loading profile...</Text>
        </View>
      </View>
    );
  }

  // Show error state
  if (error || !user) {
    const errorStyles = {
      container: { backgroundColor: theme.background },
      header: { backgroundColor: theme.background },
    };
    return (
      <View style={[styles.container, errorStyles.container]}>
        <View style={[styles.header, errorStyles.header]}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Ionicons name="alert-circle-outline" size={48} color={theme.primary} />
          <Text style={{ marginTop: 16, color: theme.textMuted, textAlign: 'center' }}>
            {error || 'User not found'}
          </Text>
          <TouchableOpacity
            style={{ marginTop: 20, padding: 12, backgroundColor: theme.primary, borderRadius: 8 }}
            onPress={() => navigation.goBack()}
          >
            <Text style={{ color: '#FFF', fontWeight: '600' }}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const isOwnProfile = currentUserId && user?.id && Number(currentUserId) === Number(user.id);

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      {/* Header with Back Button - No Settings Icon */}
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
        contentContainerStyle={[styles.scrollContent, dynamicStyles.scrollContent, { paddingBottom: 160 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header Card */}
        <View style={[styles.profileHeaderCard, dynamicStyles.profileHeaderCard]}>
          {/* Profile Photo and Name */}
          <View style={styles.profileHeaderTop}>
            <View style={styles.profilePhotoContainer}>
              {user.profile_image ? (
                <Image 
                  source={{ uri: user.profile_image }}
                  style={styles.profilePhoto}
                  resizeMode="cover"
                  onError={(error) => {
                    console.error('Profile image load error:', error.nativeEvent.error);
                    console.error('Failed URL:', user.profile_image);
                  }}
                />
              ) : (
                <View style={styles.profilePhoto}>
                  <Ionicons name="person" size={50} color={theme.primary} />
                </View>
              )}
            </View>
            <Text style={[styles.username, dynamicStyles.username]}>{user.username || user.name}</Text>
          </View>

          {/* Stats Cards Row */}
          <View style={styles.statsCardsRow}>
            <View style={[styles.statCard, dynamicStyles.statCard]}>
              <Ionicons name="cube-outline" size={24} color={theme.primary} />
              <Text style={[styles.statValue, dynamicStyles.statValue]}>
                {userListings.filter(l => normalizeListingStatus(l.status) === 'Available').length}
              </Text>
              <Text style={[styles.statLabel, dynamicStyles.statLabel]}>Active</Text>
            </View>
            <View style={[styles.statCard, dynamicStyles.statCard]}>
              <Ionicons name="list-outline" size={24} color={theme.primary} />
              <Text style={[styles.statValue, dynamicStyles.statValue]}>
                {userListings.length}
              </Text>
              <Text style={[styles.statLabel, dynamicStyles.statLabel]}>Total</Text>
            </View>
            <View style={[styles.statCard, dynamicStyles.statCard]}>
              <Ionicons name="checkmark-circle-outline" size={24} color={theme.primary} />
              <Text style={[styles.statValue, dynamicStyles.statValue]}>
                {userListings.filter(l => normalizeListingStatus(l.status) === 'Sold').length}
              </Text>
              <Text style={[styles.statLabel, dynamicStyles.statLabel]}>Sold</Text>
            </View>
          </View>

          {/* Reputation Section */}
          <View style={styles.reputationSection}>
            <View style={styles.reputationHeader}>
              <Ionicons name="star" size={20} color="#FFD700" />
              <Text style={[styles.reputationTitle, dynamicStyles.reputationTitle]}>Reputation</Text>
            </View>
            <View style={styles.reputationContent}>
              <View style={styles.ratingDisplay}>
                <Text style={[styles.ratingValue, dynamicStyles.ratingValue]}>
                  {hasReviews
                    ? Number(ratingValue || 0).toFixed(1)
                    : '0.0'}
                </Text>
                <View style={styles.starsContainer}>
                  {renderRatingStars(ratingValue)}
                </View>
              </View>
              <Text style={[styles.reviewCount, dynamicStyles.reviewCount]}>
                {hasReviews
                  ? `${reviewCount} ${reviewCount === 1 ? 'review' : 'reviews'}`
                  : 'No reviews yet'}
              </Text>
            </View>
          </View>

          {/* Follow Button */}
          {!isOwnProfile && (
            <View style={styles.followButtonContainer}>
              <TouchableOpacity
                style={[
                  styles.followButton,
                  isFollowing && styles.followButtonActive,
                ]}
                onPress={handleFollowToggle}
                activeOpacity={0.8}
                disabled={followLoading}
              >
                {followLoading ? (
                  <ActivityIndicator size="small" color={isFollowing ? '#111' : '#FFF'} />
                ) : (
                  <Text
                    style={[
                      styles.followButtonText,
                      isFollowing && styles.followButtonTextActive,
                    ]}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Bio Section */}
        <View style={[styles.bioCard, dynamicStyles.bioCard]}>
          <View style={styles.bioHeader}>
            <Ionicons name="document-text-outline" size={18} color={theme.textMuted} />
            <Text style={[styles.bioTitle, dynamicStyles.bioTitle]}>About</Text>
          </View>
          <Text
            style={[
              styles.bioText,
              dynamicStyles.bioText,
              !(user.bio && user.bio.trim().length) && [styles.bioPlaceholderText, dynamicStyles.bioPlaceholderText]
            ]}
          >
            {user.bio && user.bio.trim().length
              ? user.bio.trim()
              : 'No bio available.'}
          </Text>
        </View>

        {recentRatings.length > 0 && (
          <View style={[styles.reviewsSection, dynamicStyles.reviewsSection]}>
            <View style={styles.reviewsHeader}>
              <Text style={[styles.reviewsTitle, dynamicStyles.reviewsTitle]}>Recent Reviews</Text>
            </View>
            {recentRatings.map((rating, idx) => (
              <View key={`${rating.created_at}-${idx}`} style={[styles.reviewCard, dynamicStyles.reviewCard]}>
                <View style={styles.reviewHeader}>
                  <Ionicons name="person-circle" size={30} color={theme.primary} />
                  <View style={{ marginLeft: 8, flex: 1 }}>
                    <Text style={[styles.reviewAuthor, dynamicStyles.reviewAuthor]}>
                      {rating.reviewer_name || `Buyer ${idx + 1}`}
                    </Text>
                    <Text style={[styles.reviewDate, dynamicStyles.reviewDate]}>
                      {rating.created_at ? new Date(rating.created_at).toLocaleDateString() : 'Recently'}
                    </Text>
                  </View>
                  <View style={styles.reviewRatingBadge}>
                    <Ionicons name="star" size={14} color="#FFD700" />
                    <Text style={styles.reviewRatingText}>{rating.rating.toFixed(1)}</Text>
                  </View>
                </View>
                {rating.review ? (
                  <Text style={[styles.reviewText, dynamicStyles.reviewText]}>{rating.review}</Text>
                ) : (
                  <Text style={[styles.reviewTextMuted, { color: theme.textMuted }]}>No written review provided.</Text>
                )}
              </View>
            ))}
          </View>
        )}
        {recentRatings.length === 0 && (
          <View style={[styles.reviewsSection, dynamicStyles.reviewsSection]}>
            <Text style={[styles.reviewTextMuted, { color: theme.textMuted }]}>No reviews yet for this seller.</Text>
          </View>
        )}

        {/* Search and Filters */}
        <View style={styles.searchSection}>
          <View style={[styles.searchBar, dynamicStyles.searchBar]}>
            <Ionicons name="search-outline" size={18} color={theme.textMuted} style={styles.searchIcon} />
            <TextInput
              placeholder="Search seller's listing."
              placeholderTextColor={theme.textMuted}
              style={[styles.searchInput, dynamicStyles.searchInput]}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          
          <View style={styles.filterButtons}>
            <TouchableOpacity 
              style={[styles.filterButton, dynamicStyles.filterButton, { marginRight: 12 }]}
              onPress={handleFilterPress}
            >
              <Text style={[styles.filterButtonText, dynamicStyles.filterButtonText]}>Filters</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.filterButton, dynamicStyles.filterButton]}
              onPress={() => setShowSortModal(true)}
            >
              <Text style={[styles.filterButtonText, dynamicStyles.filterButtonText]}>Sort by</Text>
              <Ionicons name="chevron-down" size={16} color={theme.text} style={{ marginLeft: 4 }} />
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
            <Ionicons name="cube-outline" size={48} color={theme.textMuted} style={{ marginBottom: 12 }} />
            <Text style={[styles.emptyStateText, dynamicStyles.emptyStateText]}>
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
          <View style={[styles.modalOverlay, dynamicStyles.modalOverlay]}>
            <Pressable 
              style={styles.modalOverlayBackdrop}
              onPress={() => setShowSortModal(false)}
            />
            <View style={[styles.modalContent, dynamicStyles.modalContent]}>
              <Text style={[styles.modalTitle, dynamicStyles.modalTitle]}>Sort by</Text>
              {sortOptions.map((option) => (
                <Pressable
                  key={option.value}
                  style={[
                    styles.modalOption,
                    dynamicStyles.modalOption,
                    sortBy === option.value && styles.modalOptionSelected
                  ]}
                  onPress={() => {
                    setSortBy(option.value);
                    setShowSortModal(false);
                  }}
                >
                  <Text style={[
                    styles.modalOptionText,
                    dynamicStyles.modalOptionText,
                    sortBy === option.value && styles.modalOptionTextSelected
                  ]}>
                    {option.label}
                  </Text>
                  {sortBy === option.value && (
                    <Ionicons name="checkmark" size={20} color={theme.primary} />
                  )}
                </Pressable>
              ))}
            </View>
          </View>
      </Modal>

      {/* Bottom Navigation Bar */}
      <View style={[styles.bottomNav, dynamicStyles.bottomNav, { paddingBottom: 16 + insets.bottom }]}>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigateToBottomNav(navigation, 'Discover')}
        >
          <Ionicons name="home-outline" size={22} color={theme.textMuted} />
          <Text style={[styles.navLabel, { color: theme.textMuted }]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigateToBottomNav(navigation, 'Inbox')}
        >
          <Ionicons name="chatbubble-outline" size={22} color={theme.textMuted} />
          <Text style={[styles.navLabel, { color: theme.textMuted }]}>Inbox</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('PostItem')}
        >
          <Ionicons name="add-circle-outline" size={22} color={theme.textMuted} />
          <Text style={[styles.navLabel, { color: theme.textMuted }]}>Sell</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigateToBottomNav(navigation, 'Notifications')}
        >
          <Ionicons name="notifications-outline" size={22} color={theme.textMuted} />
          <Text style={[styles.navLabel, { color: theme.textMuted }]}>Notifications</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigateToBottomNav(navigation, 'Profile')}
        >
          <Ionicons name="person-outline" size={22} color={theme.textMuted} />
          <Text style={[styles.navLabel, { color: theme.textMuted }]}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
