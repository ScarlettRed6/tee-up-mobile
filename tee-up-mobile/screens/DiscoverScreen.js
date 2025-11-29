import React, { useContext, useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styles from './styles/DiscoverScreen.styles';
import { navigateToBottomNav } from '../navigation/navigationHelpers';
import { ListingsContext } from '../context/listingsContext';
import { authContext } from '../context/authContext';
import { ThemeContext } from '../context/themeContext';
import { getUserProfile } from '../api/userApi';
import { CATEGORY_OPTIONS, extractPhotos, formatPriceLabel } from '../utils/categoryUtils';

export default function DiscoverScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { listings, loading } = useContext(ListingsContext);
  const { accessToken } = useContext(authContext);
  const { theme } = useContext(ThemeContext);
  const [userProfileImage, setUserProfileImage] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(CATEGORY_OPTIONS[0]);

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

  const handleCategoryPress = (category) => {
    setSelectedCategory(category);
    navigation.navigate('CategoryListings', { category });
  };

  if(loading){
    return (
       <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const dynamicStyles = {
    container: { backgroundColor: theme.background },
    header: { backgroundColor: theme.background },
    pageTitle: { color: theme.text },
    subtitle: { color: theme.textMuted },
    sectionTitle: { color: theme.text },
    productCard: { backgroundColor: theme.card },
    productName: { color: theme.text },
    productPrice: { color: theme.primary },
    sellerName: { color: theme.textMuted },
    categoryPill: { backgroundColor: theme.lightGray },
    categoryPillActive: { backgroundColor: theme.primary },
    categoryText: { color: theme.text },
    categoryTextActive: { color: '#FFF' },
    categoryHintText: { color: theme.textMuted },
    emptyStateText: { color: theme.textMuted },
    bottomNav: { backgroundColor: theme.card },
  };

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      {/* Header Section */}
      <View style={[styles.header, dynamicStyles.header]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.pageTitle, dynamicStyles.pageTitle]}>Discover</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.headerIcon}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('SearchFilter')}
          >
            <Ionicons name="search-outline" size={24} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.headerIcon, { marginLeft: 16 }]}
            activeOpacity={0.7}
          >
            <Ionicons name="people-outline" size={24} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.headerIcon, { marginLeft: 16 }]}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('SavedListings')}
          >
            <Ionicons name="heart-outline" size={24} color={theme.text} />
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
                <Ionicons name="person" size={18} color={theme.primary} />
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 140 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Subtitle */}
        <View style={styles.subtitleSection}>
          <Text style={[styles.subtitle, dynamicStyles.subtitle]}>Browse many golf products in the marketplace.</Text>
        </View>

        {/* Newly Added Listings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Newly Added Listings</Text>
          {listings.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScrollContent}
              style={styles.horizontalScrollView}
            >
              {listings.slice(0, 6).map(item => {
                const photos = extractPhotos(item.photos);
                const firstPhoto = photos.length > 0 ? photos[0] : null;
                
                return (
                  <TouchableOpacity
                    key={item.listing_id}
                    onPress={() => navigation.navigate("ProductDetail", { product: item })}
                    style={[styles.productCard, dynamicStyles.productCard, { marginRight: 12 }]}
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
                        <Ionicons name="image-outline" size={24} color={theme.textMuted} />
                        <Text style={[styles.imagePlaceholderText, { color: theme.textMuted }]}>
                          {item.title.length > 15 ? item.title.substring(0, 15) + '...' : item.title}
                        </Text>
                      </View>
                    )}
                    <Text style={[styles.productName, dynamicStyles.productName]} numberOfLines={2}>
                      {item.title}
                    </Text>
                    <Text style={[styles.productPrice, dynamicStyles.productPrice]}>{formatPriceLabel(item.price)}</Text>
                    <View style={styles.sellerInfo}>
                      {item.seller_profile_image ? (
                        <Image 
                          source={{ uri: item.seller_profile_image }}
                          style={[styles.sellerAvatar, { marginRight: 6 }]}
                        />
                      ) : (
                        <View style={[styles.sellerAvatar, { marginRight: 6 }]}>
                          <Ionicons name="person" size={12} color={theme.primary} />
                        </View>
                      )}
                      <Text style={[styles.sellerName, dynamicStyles.sellerName]} numberOfLines={1}>{item.seller_name || 'Unknown'}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
              
              {/* View More Button at the end */}
              <TouchableOpacity
                style={[styles.viewMoreCard, { backgroundColor: theme.card }]}
                onPress={() => navigation.navigate('RecentListings')}
                activeOpacity={0.8}
              >
                <View style={styles.viewMoreContent}>
                  <Ionicons name="arrow-forward-circle" size={32} color={theme.primary} />
                  <Text style={[styles.viewMoreTitle, { color: theme.text }]}>View More</Text>
                  <Text style={[styles.viewMoreSubtitle, { color: theme.textMuted }]}>See all recent listings</Text>
                </View>
              </TouchableOpacity>
            </ScrollView>
          ) : (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyStateText, dynamicStyles.emptyStateText]}>No listings available</Text>
            </View>
          )}
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Categories</Text>
          <View style={styles.categoriesRow}>
            {CATEGORY_OPTIONS.map((category) => {
              const isActive = selectedCategory === category;
              return (
                <TouchableOpacity
                  key={category}
                  style={[styles.categoryPill, dynamicStyles.categoryPill, isActive && styles.categoryPillActive]}
                  onPress={() => handleCategoryPress(category)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.categoryText, dynamicStyles.categoryText, isActive && styles.categoryTextActive]}>{category}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={[styles.categoryHintText, dynamicStyles.categoryHintText]}>Tap a category to instantly filter active listings.</Text>
        </View>

        {/* Recommended For You */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Recommended For You</Text>
          <View style={styles.productRow}>
            {listings.length > 3 ? (
              listings.slice(3, 5).map(item => (
                <TouchableOpacity
                  key={item.listing_id}
                  onPress={() => navigation.navigate("ProductDetail", { product: item })}
                  style={[styles.productCard, dynamicStyles.productCard, { marginRight: 12 }]}
                  activeOpacity={0.8}
                >
                  <View style={styles.productImagePlaceholder}>
                    <Text style={[styles.imagePlaceholderText, { color: theme.textMuted }]}>
                      {item.title.length > 15 ? item.title.substring(0, 15) + '...' : item.title}
                    </Text>
                  </View>
                  <Text style={[styles.productName, dynamicStyles.productName]} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text style={[styles.productPrice, dynamicStyles.productPrice]}>{formatPriceLabel(item.price)}</Text>
                  <View style={styles.sellerInfo}>
                    {item.seller_profile_image ? (
                      <Image 
                        source={{ uri: item.seller_profile_image }}
                        style={[styles.sellerAvatar, { marginRight: 6 }]}
                      />
                    ) : (
                      <View style={[styles.sellerAvatar, { marginRight: 6 }]}>
                        <Ionicons name="person" size={12} color={theme.primary} />
                      </View>
                    )}
                    <Text style={[styles.sellerName, dynamicStyles.sellerName]}>{item.seller_name || 'Unknown'}</Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={[styles.emptyStateText, dynamicStyles.emptyStateText]}>More listings coming soon</Text>
              </View>
            )}
            {listings.length > 5 && (
              <TouchableOpacity 
                style={styles.viewMoreArrow}
                onPress={() => navigation.navigate('RecommendedForYou')}
              >
                <Text style={[styles.arrowSymbol, { color: theme.primary }]}>→</Text>
                <Text style={[styles.viewMoreText, { color: theme.textMuted }]}>Click to view more</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <View style={[styles.bottomNav, dynamicStyles.bottomNav, { paddingBottom: 16 + insets.bottom }]}>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => {
            // Already on Discover, do nothing
          }}
        >
          <Ionicons name="home" size={22} color={theme.primary} />
          <Text style={[styles.navLabelActive, { color: theme.primary }]}>Home</Text>
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

