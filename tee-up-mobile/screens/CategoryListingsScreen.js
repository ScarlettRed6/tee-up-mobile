import React, { useContext, useMemo, useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styles from './styles/CategoryListingsScreen.styles';
import { ListingsContext } from '../context/listingsContext';
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
  const initialCategory = normalizeCategoryParam(route?.params?.category);
  const [activeCategory, setActiveCategory] = useState(initialCategory);

  useEffect(() => {
    const nextCategory = normalizeCategoryParam(route?.params?.category);
    if (nextCategory !== activeCategory) {
      setActiveCategory(nextCategory);
    }
  }, [route?.params?.category, activeCategory]);

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
        style={[styles.productCard, isLeft ? styles.cardLeft : styles.cardRight]}
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
        <Text style={styles.productName} numberOfLines={2}>{item.title}</Text>
        {item.condition ? <Text style={styles.productCondition}>{item.condition}</Text> : null}
        <Text style={styles.productPrice}>{formatPriceLabel(item.price)}</Text>
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
  };

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  const activeCount = categoryListings.length;

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
            <View style={styles.profileAvatar}>
              <Ionicons name="person" size={18} color="#FF6B35" />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
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
                  style={[styles.switcherPill, isActive && styles.switcherPillActive]}
                  onPress={() => handleCategoryChange(category)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.switcherText, isActive && styles.switcherTextActive]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <View style={styles.categoryStatsRow}>
            <Text style={styles.categoryStatsText}>
              {activeCount} {activeCategory.toLowerCase()} {activeCount === 1 ? 'listing' : 'listings'}
            </Text>
            <TouchableOpacity
              style={styles.clearFiltersButton}
              onPress={() => navigation.navigate('SearchFilter', { category: activeCategory })}
              activeOpacity={0.8}
            >
              <Ionicons name="options-outline" size={16} color="#FF6B35" />
              <Text style={styles.clearFiltersText}>Refine</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Product Grid */}
        <View style={styles.productGrid}>
          {activeCount > 0 ? (
            categoryListings.map((product, index) => renderProductCard(product, index))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="alert-circle-outline" size={24} color="#999" style={{ marginBottom: 8 }} />
              <Text style={styles.emptyStateTitle}>No {activeCategory.toLowerCase()} listings yet</Text>
              <Text style={styles.emptyStateSubtitle}>Check back soon or explore another category.</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <View style={[styles.bottomNav, { paddingBottom: 16 + insets.bottom }]}>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigateToBottomNav(navigation, 'Discover')}
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


