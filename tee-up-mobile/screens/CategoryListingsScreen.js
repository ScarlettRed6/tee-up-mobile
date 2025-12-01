import React, { useContext, useMemo, useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styles from './styles/CategoryListingsScreen.styles';
import { ListingsContext } from '../context/listingsContext';
import { ThemeContext } from '../context/themeContext';
import { navigateToBottomNav } from '../navigation/navigationHelpers';
import {
  CATEGORY_OPTIONS,
  doesListingMatchCategory,
  extractPhotos,
  formatPriceLabel,
  normalizeCategoryParam,
} from '../utils/categoryUtils';

export default function CategoryListingsScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { listings, loading } = useContext(ListingsContext);
  const { theme } = useContext(ThemeContext);
  const { unreadCount } = useContext(NotificationsContext);
  const initialCategory = normalizeCategoryParam(route?.params?.category);
  const [activeCategory, setActiveCategory] = useState(initialCategory);

  useEffect(() => {
    const nextCategory = normalizeCategoryParam(route?.params?.category);
    if (nextCategory) {
      setActiveCategory(nextCategory);
    }
  }, [route?.params?.category]);

  const categoryListings = useMemo(
    () => listings.filter((listing) => doesListingMatchCategory(listing.category, activeCategory)),
    [listings, activeCategory]
  );

  const renderProductCard = (item, index) => {
    const isLeft = index % 2 === 0;
    const photos = extractPhotos(item.photos);
    const firstPhoto = photos.length > 0 ? photos[0] : null;

    return (
      <TouchableOpacity
        key={`${item.listing_id || item.id || index}`}
        style={[styles.productCard, dynamicStyles.productCard, isLeft ? styles.cardLeft : styles.cardRight]}
        onPress={() => navigation.navigate('ProductDetail', { product: item })}
        activeOpacity={0.85}
      >
        {firstPhoto ? (
          <Image
            source={{ uri: firstPhoto }}
            style={styles.productImage}
            resizeMode="cover"
            onError={(error) => {
              console.error('Image load error for listing:', item.listing_id, error.nativeEvent?.error);
            }}
          />
        ) : (
          <View style={styles.productImagePlaceholder}>
            <Ionicons name="image-outline" size={24} color="#999" />
            <Text style={styles.imagePlaceholderText}>
              {item.title.length > 18 ? `${item.title.substring(0, 18)}...` : item.title}
            </Text>
          </View>
        )}
        <Text style={[styles.productName, dynamicStyles.productName]} numberOfLines={2}>{item.title}</Text>
        {item.condition ? <Text style={[styles.productCondition, { color: theme.textMuted }]}>{item.condition}</Text> : null}
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
  };

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
  };

  const dynamicStyles = {
    container: { backgroundColor: theme.background },
    header: { backgroundColor: theme.background },
    pageTitle: { color: theme.text },
    scrollView: { backgroundColor: theme.background },
    productCard: { backgroundColor: theme.card },
    productName: { color: theme.text },
    productPrice: { color: theme.primary },
    sellerName: { color: theme.textMuted },
    switcherPill: { backgroundColor: theme.lightGray },
    switcherPillActive: { backgroundColor: theme.primary },
    switcherText: { color: theme.text },
    switcherTextActive: { color: '#FFF' },
    categoryStatsText: { color: theme.textMuted },
    emptyStateTitle: { color: theme.text },
    emptyStateSubtitle: { color: theme.textMuted },
    bottomNav: { backgroundColor: theme.card },
  };

  if (loading) {
    return (
      <View style={[styles.container, dynamicStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  const activeCount = categoryListings.length;

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
            <View style={styles.profileAvatar}>
              <Ionicons name="person" size={18} color={theme.primary} />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={[styles.scrollView, dynamicStyles.scrollView]}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 140 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Category Switcher */}
        <View style={styles.categorySwitcher}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.switcherContent}
          >
            {CATEGORY_OPTIONS.map((category) => {
              const isActive = activeCategory === category;
              return (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.switcherPill, 
                    dynamicStyles.switcherPill,
                    isActive && [styles.switcherPillActive, dynamicStyles.switcherPillActive]
                  ]}
                  onPress={() => handleCategoryChange(category)}
                  activeOpacity={0.8}
                >
                  <Text style={[
                    styles.switcherText, 
                    dynamicStyles.switcherText,
                    isActive && [styles.switcherTextActive, dynamicStyles.switcherTextActive]
                  ]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <View style={styles.categoryStatsRow}>
            <Text style={[styles.categoryStatsText, dynamicStyles.categoryStatsText]}>
              {activeCount} {activeCategory.toLowerCase()} {activeCount === 1 ? 'listing' : 'listings'}
            </Text>
          </View>
        </View>

        {/* Product Grid */}
        <View style={styles.productGrid}>
          {activeCount > 0 ? (
            categoryListings.map((product, index) => renderProductCard(product, index))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="alert-circle-outline" size={24} color={theme.textMuted} style={{ marginBottom: 8 }} />
              <Text style={[styles.emptyStateTitle, dynamicStyles.emptyStateTitle]}>No {activeCategory.toLowerCase()} listings yet</Text>
              <Text style={[styles.emptyStateSubtitle, dynamicStyles.emptyStateSubtitle]}>Check back soon or explore another category.</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <View style={[styles.bottomNav, dynamicStyles.bottomNav, { paddingBottom: 16 + insets.bottom }]}>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigateToBottomNav(navigation, 'Discover')}
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
          {unreadCount > 0 && (
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </Text>
            </View>
          )}
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


