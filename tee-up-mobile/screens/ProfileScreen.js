import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from './styles/ProfileScreen.styles';
import { navigateToBottomNav } from '../navigation/navigationHelpers';
import { isCurrentUser } from '../utils/userConstants';

export default function ProfileScreen({ navigation, route }) {
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

  const renderProductCard = (item, index) => {
    const isLeft = index % 2 === 0;
    const isDropdownOpen = openDropdownId === item.id;
    
    return (
      <View key={item.id} style={[styles.productCardWrapper, isLeft ? styles.cardLeft : styles.cardRight]}>
        <TouchableOpacity
          style={styles.productCard}
          onPress={() => navigation.navigate('ProductDetail', {
            product: {
              id: item.id,
              title: item.name,
              price: item.price.replace('₱', '').replace(',', ''),
              location: 'Quezon City',
              postedDate: 'October 20, 2025',
              description: 'Excellent condition. Perfect for players looking to upgrade.',
              category: item.category,
              condition: item.condition,
              seller: {
                name: item.seller,
                rating: 4.9,
                reviewCount: 120,
              },
              images: [{ id: 1 }, { id: 2 }, { id: 3 }],
              reviews: [],
            }
          })}
          activeOpacity={0.8}
        >
          <View style={styles.productImagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>
              {item.name.includes('Srixon') ? 'Srixon ZXi5' : 
               item.name.includes('PING') ? 'PING G30' :
               item.name.includes('AP2') ? 'Titleist AP2' : 
               item.name.includes('TSR3') ? 'Titleist TSR3' :
               item.name.includes('Callaway') ? 'Callaway Epic' : 'TaylorMade SIM'}
            </Text>
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
            <View style={styles.profilePhoto}>
              <Ionicons name="person" size={50} color="#FF6B35" />
            </View>
          </View>
          
          <Text style={styles.username}>hockeyops</Text>
          
          <View style={styles.statsContainer}>
            <Text style={styles.statText}>Active Listings: 10</Text>
            <Text style={styles.statText}>5.5K followers</Text>
            <Text style={styles.statText}>3.2K items sold</Text>
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
          <Text style={styles.bioText}>
            I buy/sell/trade golf clubs! Feel free to offer on any of my listings!
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

