import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Modal, Pressable, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from './styles/ProfileScreen.styles';
import { navigateToBottomNav } from '../navigation/navigationHelpers';
import { isCurrentUser } from '../utils/userConstants';
import { authContext } from '../context/authContext';
import { getUserProfile } from '../api/userApi';
import { fetchUserListings } from '../api/listingsApi';
import jwtDecode from 'jwt-decode';

export default function ProfileScreen({ navigation, route }) {
  const { accessToken } = useContext(authContext);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [listingsLoading, setListingsLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if(!accessToken) return;

    try{
      const data = await getUserProfile();
      setUser(data);
    }catch(err){
      console.log("Profile error:", err);
    }finally{
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleEditProfile = useCallback(() => {
    navigation.navigate('EditProfile', {
      onProfileUpdated: fetchProfile,
    });
  }, [navigation, fetchProfile]);

  // Refresh profile when screen comes into focus (e.g., returning from EditProfile)
  useFocusEffect(
    useCallback(() => {
      if (accessToken) {
        fetchProfile();
      }
    }, [accessToken, fetchProfile])
  );

  // Fetch user's own listings
  const fetchUserOwnListings = useCallback(async () => {
    if(!accessToken) return;

    try {
      setListingsLoading(true);
      // Get user ID from JWT token
      const decoded = jwtDecode(accessToken);
      const userId = decoded.id;

      if (userId) {
        const userListings = await fetchUserListings(userId);
        
        // Transform backend listing data to match ProfileScreen format
        const transformedListings = userListings.map(listing => ({
          id: listing.listing_id,
          name: listing.title,
          price: `₱${typeof listing.price === 'number' ? listing.price.toLocaleString() : listing.price}`,
          priceValue: typeof listing.price === 'number' ? listing.price : parseFloat(listing.price) || 0,
          seller: listing.seller_name || user?.name || 'Unknown',
          sellerColor: '#FF6B35',
          category: listing.category,
          condition: listing.condition,
          flex: listing.flex || null,
          hand: listing.hand || null,
          listedDate: listing.date_posted ? new Date(listing.date_posted) : new Date(),
          status: listing.status || 'Available',
          listingData: listing, // Keep original data for updates
        }));

        setAllProducts(transformedListings);
      }
    } catch (err) {
      console.log("Error fetching user listings:", err);
    } finally {
      setListingsLoading(false);
    }
  }, [accessToken, user]);

  useEffect(() => {
    fetchUserOwnListings();
  }, [fetchUserOwnListings]);

  // Refresh listings when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (accessToken && user) {
        fetchUserOwnListings();
      }
    }, [accessToken, user, fetchUserOwnListings])
  );

  // Get filters from route params if navigating from filter screen
  const initialFilters = route?.params?.filters || {};
  
  const [searchQuery, setSearchQuery] = useState(initialFilters.searchQuery || '');
  const [selectedCategory, setSelectedCategory] = useState(initialFilters.category || 'All');
  const [selectedCondition, setSelectedCondition] = useState(initialFilters.condition || null);
  const [selectedFlex, setSelectedFlex] = useState(initialFilters.flex || null);
  const [selectedHand, setSelectedHand] = useState(initialFilters.hand || null); // Right Hand, Left Hand
  const [selectedStatus, setSelectedStatus] = useState(initialFilters.status || 'Available'); // Available, Sold
  const [sortBy, setSortBy] = useState('recentlyListed'); // recentlyListed, oldestListing, mostExpensive, cheapest
  const [showSortModal, setShowSortModal] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState(null); // Track which product's dropdown is open
  const [showConfirmModal, setShowConfirmModal] = useState(false); // Confirmation modal for marking as sold
  const [productToUpdate, setProductToUpdate] = useState(null); // Product ID to update

  // All products data with listing dates and status
  const [allProducts, setAllProducts] = useState([
    { 
      id: 1,
      name: 'Srixon ZXi5 Iron set 5-P', 
      price: '₱26,500', 
      priceValue: 26500,
      seller: 'hockeyops', 
      sellerColor: '#FF0000',
      category: 'Iron',
      condition: 'Slightly Used',
      flex: 'Regular',
      hand: 'Right Hand',
      listedDate: new Date('2025-10-20'), // Most recent
      status: 'Available', // Available or Sold
    },
    { 
      id: 2,
      name: 'PING G30 9.5 Slightly Used', 
      price: '₱7,500', 
      priceValue: 7500,
      seller: 'hockeyops', 
      sellerColor: '#FF0000',
      category: 'Driver',
      condition: 'Slightly Used',
      flex: 'Stiff',
      hand: 'Right Hand',
      listedDate: new Date('2025-10-18'), // Older
      status: 'Available',
    },
    { 
      id: 3,
      name: 'Titleist AP2 Forged 5-PW', 
      price: '₱9,000', 
      priceValue: 9000,
      seller: 'hockeyops', 
      sellerColor: '#FF0000',
      category: 'Iron',
      condition: 'Well Used',
      flex: 'Regular',
      hand: 'Left Hand',
      listedDate: new Date('2025-10-15'), // Older
      status: 'Sold', // This one is sold
    },
    { 
      id: 4,
      name: 'Titleist TSR3 9.0 BNEW', 
      price: '₱26,500', 
      priceValue: 26500,
      seller: 'hockeyops', 
      sellerColor: '#FF0000',
      category: 'Driver',
      condition: 'New',
      flex: 'Stiff',
      hand: 'Right Hand',
      listedDate: new Date('2025-10-10'), // Oldest
      status: 'Available',
    },
    {
      id: 5,
      name: 'Callaway Epic Flash Driver',
      price: '₱15,000',
      priceValue: 15000,
      seller: 'hockeyops',
      sellerColor: '#FF0000',
      category: 'Driver',
      condition: 'New',
      flex: 'Regular',
      hand: 'Left Hand',
      listedDate: new Date('2025-10-19'), // Recent
      status: 'Available',
    },
    {
      id: 6,
      name: 'TaylorMade SIM Max 5 Wood',
      price: '₱12,000',
      priceValue: 12000,
      seller: 'hockeyops',
      sellerColor: '#FF0000',
      category: 'Woods',
      condition: 'Slightly Used',
      flex: 'Stiff',
      hand: 'Right Hand',
      listedDate: new Date('2025-10-12'), // Older
      status: 'Sold', // This one is sold
    },
  ]);

  // Filter and sort products
  const filteredAndSortedProducts = React.useMemo(() => {
    let filtered = [...allProducts];

    // Search filter
    if (searchQuery.trim().length > 0) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory && selectedCategory !== 'All') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Condition filter
    if (selectedCondition) {
      filtered = filtered.filter(product => product.condition === selectedCondition);
    }

    // Price filter - removed for Profile page (only used in SearchResults)

    // Flex filter
    if (selectedFlex) {
      filtered = filtered.filter(product => product.flex === selectedFlex);
    }

    // Hand filter
    if (selectedHand) {
      filtered = filtered.filter(product => product.hand === selectedHand);
    }

    // Status filter (Available/Sold)
    if (selectedStatus) {
      filtered = filtered.filter(product => product.status === selectedStatus);
    }

    // Sort
    switch (sortBy) {
      case 'recentlyListed':
        // Sort by most recent listing date first (newest first)
        filtered.sort((a, b) => b.listedDate - a.listedDate);
        break;
      case 'oldestListing':
        // Sort by oldest listing date first
        filtered.sort((a, b) => a.listedDate - b.listedDate);
        break;
      case 'mostExpensive':
        filtered.sort((a, b) => b.priceValue - a.priceValue);
        break;
      case 'cheapest':
        filtered.sort((a, b) => a.priceValue - b.priceValue);
        break;
      default:
        // Default to recently listed
        filtered.sort((a, b) => b.listedDate - a.listedDate);
        break;
    }

    return filtered;
  }, [searchQuery, selectedCategory, selectedCondition, selectedFlex, selectedHand, selectedStatus, sortBy, allProducts]);

  const handleMarkAsSold = (productId) => {
    // Show confirmation modal
    setProductToUpdate(productId);
    setShowConfirmModal(true);
    setOpenDropdownId(null); // Close dropdown
  };

  const handleMarkAsAvailable = (productId) => {
    // Mark as available immediately (no confirmation needed)
    setAllProducts(prevProducts =>
      prevProducts.map(product =>
        product.id === productId
          ? { ...product, status: 'Available' }
          : product
      )
    );
    setOpenDropdownId(null); // Close dropdown
  };

  const confirmMarkAsSold = () => {
    if (productToUpdate) {
      setAllProducts(prevProducts =>
        prevProducts.map(product =>
          product.id === productToUpdate
            ? { ...product, status: 'Sold' }
            : product
        )
      );
    }
    setShowConfirmModal(false);
    setProductToUpdate(null);
  };

  const cancelMarkAsSold = () => {
    setShowConfirmModal(false);
    setProductToUpdate(null);
  };

  const handleViewAnalytics = (productId) => {
    // Navigate to analytics screen or show analytics modal
    console.log('View Analytics for product:', productId);
    setOpenDropdownId(null); // Close dropdown
    // TODO: Navigate to analytics screen when implemented
  };

  const handleEditListing = (item) => {
    // Navigate to PostItemScreen with listing data for editing
    setOpenDropdownId(null); // Close dropdown
    
    // Prepare listing data for editing
    const listingData = item.listingData || {
      listing_id: item.id,
      title: item.name,
      description: item.listingData?.description || '',
      category: item.category,
      brand: item.listingData?.brand || '',
      condition: item.condition,
      price: item.priceValue || parseFloat(item.price.replace('₱', '').replace(/,/g, '')) || 0,
      status: item.status,
      photos: item.listingData?.photos || [],
      flex: item.flex,
      hand: item.hand,
    };
    
    navigation.navigate('PostItem', { 
      editMode: true,
      listingData: listingData 
    });
  };

  const renderProductCard = (item, index) => {
    const isLeft = index % 2 === 0;
    const isDropdownOpen = openDropdownId === item.id;
    
    // Get first photo from listing data
    const listingPhotos = item.listingData?.photos || [];
    const firstPhoto = Array.isArray(listingPhotos) && listingPhotos.length > 0 
      ? listingPhotos[0] 
      : null;
    
    return (
      <View key={item.id} style={[styles.productCardWrapper, isLeft ? styles.cardLeft : styles.cardRight]}>
        <TouchableOpacity
          style={styles.productCard}
          onPress={() => {
            // Use listingData if available (from API), otherwise construct from item
            const productData = item.listingData || {
              listing_id: item.id,
              title: item.name,
              price: item.priceValue || parseFloat(item.price.replace('₱', '').replace(/,/g, '')) || 0,
              location: 'Location not specified',
              date_posted: item.listedDate,
              description: item.listingData?.description || 'No description provided.',
              category: item.category,
              condition: item.condition,
              brand: item.listingData?.brand || null,
              status: item.status,
              seller_name: item.seller,
              photos: listingPhotos,
            };
            navigation.navigate('ProductDetail', { product: productData });
          }}
          activeOpacity={0.8}
        >
          <View style={styles.productImageContainer}>
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
            {item.status === 'Sold' && (
              <View style={styles.soldBadge}>
                <Text style={styles.soldBadgeText}>SOLD</Text>
              </View>
            )}
          </View>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productPrice}>{item.price}</Text>
          <View style={styles.sellerInfo}>
            <View style={[styles.sellerAvatar, { marginRight: 6 }]}>
              <Ionicons name="person" size={12} color={item.sellerColor} />
            </View>
            <Text style={styles.sellerName}>@{item.seller}</Text>
          </View>
        </TouchableOpacity>
        
        {/* 3-dot menu button */}
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setOpenDropdownId(isDropdownOpen ? null : item.id)}
          activeOpacity={0.7}
        >
          <Ionicons name="ellipsis-vertical" size={18} color="#666" />
        </TouchableOpacity>
        
        {/* Dropdown menu */}
        {isDropdownOpen && (
          <View style={styles.dropdownMenu}>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => handleEditListing(item)}
              activeOpacity={0.7}
            >
              <Ionicons name="create-outline" size={18} color="#000" style={styles.dropdownIcon} />
              <Text style={styles.dropdownText}>Edit Listing</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => handleViewAnalytics(item.id)}
              activeOpacity={0.7}
            >
              <Ionicons name="analytics-outline" size={18} color="#000" style={styles.dropdownIcon} />
              <Text style={styles.dropdownText}>View Analytics</Text>
            </TouchableOpacity>
            {item.status === 'Available' ? (
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => handleMarkAsSold(item.id)}
                activeOpacity={0.7}
              >
                <Ionicons name="checkmark-circle-outline" size={18} color="#000" style={styles.dropdownIcon} />
                <Text style={styles.dropdownText}>Mark as sold</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => handleMarkAsAvailable(item.id)}
                activeOpacity={0.7}
              >
                <Ionicons name="refresh-circle-outline" size={18} color="#000" style={styles.dropdownIcon} />
                <Text style={styles.dropdownText}>Mark as available</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  const handleFilterPress = () => {
    // Navigate to SearchFilterScreen with current filters
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
      returnTo: 'Profile',
    });
  };

  const handleApplyFilters = (filters) => {
    setSelectedCategory(filters.category || 'All');
    setSelectedCondition(filters.condition || null);
    setSelectedFlex(filters.flex || null);
    setSelectedHand(filters.hand || null);
    setSelectedStatus(filters.status || 'Available');
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

  if(loading || listingsLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }
  if(!user) return <Text>No Profile found!</Text>;

  return (
    <View style={styles.container}>
        {/* Header Icons - Top Right */}
        <View style={styles.headerIcons}>
          <View style={styles.headerIconsRight}>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => {
                console.log('Settings icon pressed');
                navigation.navigate('Settings');
              }}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="settings-outline" size={20} color="#000" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          onScrollBeginDrag={() => setOpenDropdownId(null)}
          scrollEventThrottle={16}
        >
        {/* Profile Summary Card */}
        <View style={styles.profileSection}>
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
                <Ionicons name="person" size={50} color="#FF6B35" />
              </View>
            )}
          </View>
          
          <Text style={styles.username}>{user.name}</Text>
          
          <View style={styles.statsContainer}>
            <Text style={styles.statText}>
              Active Listings: {allProducts.filter(p => p.status === 'Available').length}
            </Text>
            <Text style={styles.statText}>
              Total Listings: {allProducts.length}
            </Text>
            <Text style={styles.statText}>
              Sold: {allProducts.filter(p => p.status === 'Sold').length}
            </Text>
          </View>
          
          <View style={styles.reputationContainer}>
            <Text style={styles.reputationText}>User Reputation: 5.0</Text>
            <View style={styles.starsContainer}>
              <Ionicons name="star" size={18} color="#FFD700" style={{ marginRight: 4 }} />
              <Ionicons name="star" size={18} color="#FFD700" style={{ marginRight: 4 }} />
              <Ionicons name="star" size={18} color="#FFD700" style={{ marginRight: 4 }} />
              <Ionicons name="star" size={18} color="#FFD700" style={{ marginRight: 4 }} />
              <Ionicons name="star" size={18} color="#FFD700" />
            </View>
          </View>
        </View>

        {/* Bio Section */}
        <View style={styles.bioSection}>
          <Text
            style={[
              styles.bioText,
              !(user.bio && user.bio.trim().length) && styles.bioPlaceholderText
            ]}
          >
            {user.bio && user.bio.trim().length
              ? user.bio.trim()
              : 'Add a short bio so other golfers know what you sell or how you prefer to meet up.'}
          </Text>
          {!(user.bio && user.bio.trim().length) && (
            <TouchableOpacity
              style={styles.editBioButton}
              onPress={handleEditProfile}
              activeOpacity={0.8}
            >
              <Text style={styles.editBioButtonText}>Add bio</Text>
            </TouchableOpacity>
          )}
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
                <Text style={styles.emptyStateText}>No products found</Text>
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

      {/* Confirm Mark as Sold Modal */}
      <Modal
        visible={showConfirmModal}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelMarkAsSold}
      >
        <View style={styles.modalOverlay}>
          <Pressable 
            style={styles.modalOverlayBackdrop}
            onPress={cancelMarkAsSold}
          />
          <View style={styles.confirmModalContent}>
            <View style={styles.confirmModalIcon}>
              <Ionicons name="warning-outline" size={48} color="#FF6B35" />
            </View>
            <Text style={styles.confirmModalTitle}>Mark as Sold?</Text>
            <Text style={styles.confirmModalMessage}>
              Are you sure you want to mark this item as sold? This action will update the item's status and it will be moved to your sold listings.
            </Text>
            <View style={styles.confirmModalButtons}>
              <TouchableOpacity
                style={[styles.confirmModalButton, styles.cancelButton, { marginRight: 6 }]}
                onPress={cancelMarkAsSold}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmModalButton, styles.confirmButton, { marginLeft: 6 }]}
                onPress={confirmMarkAsSold}
                activeOpacity={0.7}
              >
                <Text style={styles.confirmButtonText}>Mark as Sold</Text>
              </TouchableOpacity>
            </View>
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
          onPress={() => {
            // Already on Profile, do nothing
          }}
        >
          <Ionicons name="person-outline" size={22} color="#000" />
          <Text style={styles.navLabelActive}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

