import React, { useContext, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styles from './styles/SavedListingsScreen.styles';
import { navigateToBottomNav } from '../navigation/navigationHelpers';
import { favoritesContext } from '../context/favoritesContext';

const normalizeListingStatus = (statusValue = 'available') => {
  const lower = (statusValue || '').toString().toLowerCase();
  if (lower === 'sold') return 'Sold';
  if (lower === 'pending') return 'Pending';
  return 'Available';
};

const parsePhotos = (photos) => {
  if (Array.isArray(photos)) return photos;
  if (typeof photos === 'string') {
    try {
      const parsed = JSON.parse(photos);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }
  return [];
};

const formatPrice = (price) => {
  const numeric = typeof price === 'number' ? price : parseFloat(price) || 0;
  return `₱${numeric.toLocaleString('en-US', { minimumFractionDigits: 0 })}`;
};

export default function SavedListingsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { favorites, favoritesLoading, refreshFavorites } = useContext(favoritesContext);

  const savedProducts = useMemo(() => {
    return favorites.map((item) => {
      const photos = parsePhotos(item.photos);
      const sellerName = item.seller_name || item.seller || 'Unknown';
      const statusLabel = normalizeListingStatus(item.status);
      const normalized = {
        id: item.listing_id || item.id,
        title: item.title || 'Untitled Listing',
        condition: item.condition || null,
        category: item.category || null,
        priceLabel: formatPrice(item.price),
        seller: sellerName,
        sellerColor: '#FF6B35',
        image: photos.length > 0 ? photos[0] : null,
        status: statusLabel,
        rawListing: {
          ...item,
          photos,
        },
      };
      return normalized;
    });
  }, [favorites]);

  const renderProductCard = (item, index) => {
    const isLeft = index % 2 === 0;
    return (
      <TouchableOpacity
        key={item.id || index}
        style={[styles.productCard, isLeft ? styles.cardLeft : styles.cardRight]}
        activeOpacity={0.85}
        onPress={() => {
          navigation.navigate('ProductDetail', {
            product: {
              listing_id: item.rawListing?.listing_id,
              id: item.rawListing?.listing_id,
              user_id: item.rawListing?.user_id,
              title: item.rawListing?.title,
              price: item.rawListing?.price,
              location: item.rawListing?.location,
              date_posted: item.rawListing?.date_posted,
              description: item.rawListing?.description,
              category: item.rawListing?.category,
              condition: item.rawListing?.condition,
              brand: item.rawListing?.brand,
              status: item.rawListing?.status,
              seller_name: item.rawListing?.seller_name || item.rawListing?.seller || item.seller,
              seller_profile_image: item.rawListing?.profile_image || null,
              photos: item.rawListing?.photos || [],
            },
          });
        }}
      >
        <View style={styles.productImageWrapper}>
          {item.image ? (
            <Image source={{ uri: item.image }} style={styles.productImage} resizeMode="cover" />
          ) : (
            <View style={styles.productImagePlaceholder}>
              <Text style={styles.imagePlaceholderText}>{item.title}</Text>
            </View>
          )}
          {item.status === 'Sold' && (
            <View style={styles.soldBadge}>
              <Text style={styles.soldBadgeText}>SOLD</Text>
            </View>
          )}
        </View>
        <Text style={styles.productName} numberOfLines={2}>{item.title}</Text>
        {item.condition && <Text style={styles.productCondition}>{item.condition}</Text>}
        <Text style={styles.productPrice}>{item.priceLabel}</Text>
        <View style={styles.sellerInfo}>
          <View style={[styles.sellerAvatar, { marginRight: 6 }]}>
            <Ionicons name="person" size={12} color={item.sellerColor} />
          </View>
          <Text style={styles.sellerName}>{item.seller}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const isEmpty = !favoritesLoading && savedProducts.length === 0;

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.pageTitle}>Saved Listings</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.headerIcon}
            activeOpacity={0.7}
          >
            <Ionicons name="people-outline" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.headerIcon, { marginLeft: 16 }]}
            activeOpacity={0.7}
            onPress={() => {
              // Already on SavedListings, do nothing or show active state
            }}
          >
            <Ionicons name="heart" size={24} color="#FF6B35" />
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
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 140 + insets.bottom, flexGrow: isEmpty ? 1 : 0 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={favoritesLoading} onRefresh={refreshFavorites} tintColor="#FF6B35" />
        }
      >
        {favoritesLoading && savedProducts.length === 0 ? (
          <View style={styles.loadingState}>
            <ActivityIndicator size="large" color="#FF6B35" />
            <Text style={styles.loadingText}>Loading your saved listings...</Text>
          </View>
        ) : isEmpty ? (
          <View style={styles.emptyState}>
            <Ionicons name="heart-outline" size={36} color="#FF6B35" style={{ marginBottom: 8 }} />
            <Text style={styles.emptyStateText}>No saved listings yet.</Text>
            <Text style={styles.emptyStateSubtext}>Tap the heart on a product to save it here.</Text>
          </View>
        ) : (
          <View style={styles.productGrid}>
            {savedProducts.map((product, index) => renderProductCard(product, index))}
          </View>
        )}
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

