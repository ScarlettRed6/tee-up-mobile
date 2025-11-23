import React, { useContext, useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import styles from './styles/DiscoverScreen.styles';
import { navigateToBottomNav } from '../navigation/navigationHelpers';
import { ListingsContext } from '../context/listingsContext';
import { authContext } from '../context/authContext';
import { getUserProfile } from '../api/userApi';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function DiscoverScreen({ navigation }) {
  const { listings, loading } = useContext(ListingsContext);
  const { accessToken } = useContext(authContext);
  const [userProfileImage, setUserProfileImage] = useState(null);

  // Helper function to navigate to product detail
  const navigateToProductDetail = (productData) => {
    navigation.navigate('ProductDetail', { product: productData });
  };

  // Fetch current user's profile image
  const fetchUserProfile = useCallback(async () => {
    if (!accessToken) return;
    try {
      const userData = await getUserProfile();
      setUserProfileImage(userData.profile_image || null);
    } catch (err) {
      console.log('Error fetching user profile in DiscoverScreen:', err);
    }
  }, [accessToken]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  // Refresh profile image when screen comes into focus (e.g., after updating profile)
  useFocusEffect(
    useCallback(() => {
      fetchUserProfile();
    }, [fetchUserProfile])
  );

  if(loading){
    return (
       <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.pageTitle}>Discover</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.headerIcon}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('SearchFilter')}
          >
            <Ionicons name="search-outline" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.headerIcon, { marginLeft: 16 }]}
            activeOpacity={0.7}
          >
            <Ionicons name="people-outline" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.headerIcon, { marginLeft: 16 }]}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('SavedListings')}
          >
            <Ionicons name="heart-outline" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.headerIcon, { marginLeft: 16 }]}
            activeOpacity={0.7}
            onPress={() => navigateToBottomNav(navigation, 'Profile')}
          >
            {userProfileImage ? (
              <Image 
                source={{ uri: userProfileImage }}
                style={styles.profileAvatar}
              />
            ) : (
              <View style={styles.profileAvatar}>
                <Ionicons name="person" size={18} color="#FF6B35" />
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Subtitle */}
        <View style={styles.subtitleSection}>
          <Text style={styles.subtitle}>Browse many golf products in the marketplace.</Text>
        </View>

        {/* Newly Added Listings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Newly Added Listings</Text>
          {listings.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScrollContent}
              style={styles.horizontalScrollView}
            >
              {listings.slice(0, 6).map(item => {
                const firstPhoto = item.photos && Array.isArray(item.photos) && item.photos.length > 0 
                  ? item.photos[0] 
                  : null;
                
                return (
                  <TouchableOpacity
                    key={item.listing_id}
                    onPress={() => navigation.navigate("ProductDetail", { product: item })}
                    style={[styles.productCard, { marginRight: 12 }]}
                    activeOpacity={0.8}
                  >
                    {firstPhoto ? (
                      <Image 
                        source={{ uri: firstPhoto }}
                        style={styles.productImage}
                        resizeMode="cover"
                        onError={(error) => {
                          console.error('Image load error for listing:', item.listing_id, error.nativeEvent.error);
                          console.error('Failed URL:', firstPhoto);
                        }}
                      />
                    ) : (
                      <View style={styles.productImagePlaceholder}>
                        <Ionicons name="image-outline" size={24} color="#999" />
                        <Text style={styles.imagePlaceholderText}>
                          {item.title.length > 15 ? item.title.substring(0, 15) + '...' : item.title}
                        </Text>
                      </View>
                    )}
                    <Text style={styles.productName} numberOfLines={2}>
                      {item.title}
                    </Text>
                    <Text style={styles.productPrice}>₱{item.price?.toLocaleString() || item.price}</Text>
                    <View style={styles.sellerInfo}>
                      {item.seller_profile_image ? (
                        <Image 
                          source={{ uri: item.seller_profile_image }}
                          style={[styles.sellerAvatar, { marginRight: 6 }]}
                        />
                      ) : (
                        <View style={[styles.sellerAvatar, { marginRight: 6 }]}>
                          <Ionicons name="person" size={12} color="#FF6B35" />
                        </View>
                      )}
                      <Text style={styles.sellerName} numberOfLines={1}>{item.seller_name || 'Unknown'}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
              
              {/* View More Button at the end */}
              <TouchableOpacity
                style={styles.viewMoreCard}
                onPress={() => navigation.navigate('RecentListings')}
                activeOpacity={0.8}
              >
                <View style={styles.viewMoreContent}>
                  <Ionicons name="arrow-forward-circle" size={32} color="#FF6B35" />
                  <Text style={styles.viewMoreTitle}>View More</Text>
                  <Text style={styles.viewMoreSubtitle}>See all recent listings</Text>
                </View>
              </TouchableOpacity>
            </ScrollView>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No listings available</Text>
            </View>
          )}
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <View style={styles.categoriesRow}>
            <TouchableOpacity style={styles.categoryPill}>
              <Text style={styles.categoryText}>All</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.categoryPill}>
              <Text style={styles.categoryText}>Driver</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.categoryPill}>
              <Text style={styles.categoryText}>Iron</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.categoryPill}>
              <Text style={styles.categoryText}>Putters</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.categoriesRow}>
            <TouchableOpacity style={styles.categoryPill}>
              <Text style={styles.categoryText}>Apparel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.categoryPill}>
              <Text style={styles.categoryText}>Others</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.categoryPill}>
              <Text style={styles.categoryText}>Accessories</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recommended For You */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommended For You</Text>
          <View style={styles.productRow}>
            {listings.length > 3 ? (
              listings.slice(3, 5).map(item => (
                <TouchableOpacity
                  key={item.listing_id}
                  onPress={() => navigation.navigate("ProductDetail", { product: item })}
                  style={[styles.productCard, { marginRight: 12 }]}
                  activeOpacity={0.8}
                >
                  <View style={styles.productImagePlaceholder}>
                    <Text style={styles.imagePlaceholderText}>
                      {item.title.length > 15 ? item.title.substring(0, 15) + '...' : item.title}
                    </Text>
                  </View>
                  <Text style={styles.productName} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text style={styles.productPrice}>₱{item.price?.toLocaleString() || item.price}</Text>
                  <View style={styles.sellerInfo}>
                    {item.seller_profile_image ? (
                      <Image 
                        source={{ uri: item.seller_profile_image }}
                        style={[styles.sellerAvatar, { marginRight: 6 }]}
                      />
                    ) : (
                      <View style={[styles.sellerAvatar, { marginRight: 6 }]}>
                        <Ionicons name="person" size={12} color="#FF6B35" />
                      </View>
                    )}
                    <Text style={styles.sellerName}>{item.seller_name || 'Unknown'}</Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>More listings coming soon</Text>
              </View>
            )}
            {listings.length > 5 && (
              <TouchableOpacity 
                style={styles.viewMoreArrow}
                onPress={() => navigation.navigate('RecommendedForYou')}
              >
                <Text style={styles.arrowSymbol}>→</Text>
                <Text style={styles.viewMoreText}>Click to view more</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => {
            // Already on Discover, do nothing
          }}
        >
          <Ionicons name="home" size={22} color="#000" />
          <Text style={styles.navLabelActive}>Home</Text>
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

