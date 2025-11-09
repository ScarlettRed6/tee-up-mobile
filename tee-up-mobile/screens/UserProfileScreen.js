import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from './styles/UserProfileScreen.styles';
import { navigateToBottomNav } from '../navigation/navigationHelpers';
import { isCurrentUser } from '../utils/userConstants';

export default function UserProfileScreen({ navigation, route }) {
  // Get user data from route params
  const user = route?.params?.user || {
    username: 'issa123',
    rating: 4.9,
    reviewCount: 120,
    avatarColor: '#333',
    activeListings: 8,
    followers: '3.2K',
    itemsSold: '2.1K',
    reputation: 4.8,
    bio: 'Golf enthusiast and club collector. Always looking for the perfect set!',
  };

  // Get filters from route params if navigating from filter screen
  const initialFilters = route?.params?.filters || {};
  
  const [searchQuery, setSearchQuery] = useState(initialFilters.searchQuery || '');
  const [selectedCategory, setSelectedCategory] = useState(initialFilters.category || 'All');
  const [selectedCondition, setSelectedCondition] = useState(initialFilters.condition || null);
  const [selectedFlex, setSelectedFlex] = useState(initialFilters.flex || null);
  const [selectedHand, setSelectedHand] = useState(initialFilters.hand || null); // Right Hand, Left Hand
  const [sortBy, setSortBy] = useState('recentlyListed');
  const [showSortModal, setShowSortModal] = useState(false);

  // Sample products data for this user - in real app, this would come from API
  const allProducts = [
    { 
      id: 1,
      name: 'PING G30 9.5 Slightly Used', 
      price: '₱7,500', 
      priceValue: 7500,
      seller: user.username, 
      sellerColor: user.avatarColor,
      category: 'Driver',
      condition: 'Slightly Used',
      flex: 'Stiff',
      hand: 'Right Hand',
      listedDate: new Date('2025-10-18'),
    },
    { 
      id: 2,
      name: 'Titleist AP2 Forged 5-PW', 
      price: '₱9,000', 
      priceValue: 9000,
      seller: user.username, 
      sellerColor: user.avatarColor,
      category: 'Iron',
      condition: 'Well Used',
      flex: 'Regular',
      hand: 'Left Hand',
      listedDate: new Date('2025-10-15'),
    },
    { 
      id: 3,
      name: 'TaylorMade SIM Max 5 Wood',
      price: '₱12,000',
      priceValue: 12000,
      seller: user.username,
      sellerColor: user.avatarColor,
      category: 'Woods',
      condition: 'Slightly Used',
      flex: 'Stiff',
      hand: 'Right Hand',
      listedDate: new Date('2025-10-12'),
    },
    {
      id: 4,
      name: 'Callaway Epic Flash Driver',
      price: '₱15,000',
      priceValue: 15000,
      seller: user.username,
      sellerColor: user.avatarColor,
      category: 'Driver',
      condition: 'New',
      flex: 'Regular',
      hand: 'Left Hand',
      listedDate: new Date('2025-10-10'),
    },
  ];

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

    // Flex filter
    if (selectedFlex) {
      filtered = filtered.filter(product => product.flex === selectedFlex);
    }

    // Hand filter
    if (selectedHand) {
      filtered = filtered.filter(product => product.hand === selectedHand);
    }

    // Sort
    switch (sortBy) {
      case 'recentlyListed':
        filtered.sort((a, b) => b.listedDate - a.listedDate);
        break;
      case 'oldestListing':
        filtered.sort((a, b) => a.listedDate - b.listedDate);
        break;
      case 'mostExpensive':
        filtered.sort((a, b) => b.priceValue - a.priceValue);
        break;
      case 'cheapest':
        filtered.sort((a, b) => a.priceValue - b.priceValue);
        break;
      default:
        filtered.sort((a, b) => b.listedDate - a.listedDate);
        break;
    }

    return filtered;
  }, [searchQuery, selectedCategory, selectedCondition, selectedFlex, selectedHand, sortBy]);

  const renderProductCard = (item, index) => {
    const isLeft = index % 2 === 0;
    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.productCard, isLeft ? styles.cardLeft : styles.cardRight]}
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
              rating: user.rating,
              reviewCount: user.reviewCount,
            },
            images: [{ id: 1 }, { id: 2 }, { id: 3 }],
            reviews: [],
          }
        })}
        activeOpacity={0.8}
      >
        <View style={styles.productImagePlaceholder}>
          <Text style={styles.imagePlaceholderText}>
            {item.name.includes('PING') ? 'PING G30' :
             item.name.includes('AP2') ? 'Titleist AP2' : 
             item.name.includes('TaylorMade') ? 'TaylorMade SIM' :
             item.name.includes('Callaway') ? 'Callaway Epic' : 'Product'}
          </Text>
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
            <View style={[styles.profilePhoto, { borderColor: user.avatarColor }]}>
              <Ionicons name="person" size={50} color={user.avatarColor} />
            </View>
          </View>
          
          <Text style={styles.username}>{user.username}</Text>
          
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

