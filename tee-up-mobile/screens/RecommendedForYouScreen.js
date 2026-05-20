import React, { useContext, useState, useCallback, useMemo } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styles from './styles/RecommendedForYouScreen.styles';
import { navigateToBottomNav } from '../navigation/navigationHelpers';
import { ThemeContext } from '../context/themeContext';
import { NotificationsContext } from '../context/notificationsContext';
import { authContext } from '../context/authContext';
import { favoritesContext } from '../context/favoritesContext';
import { getConversations } from '../api/chatApi';
import { fetchRecommendations } from '../api/listingsApi';
import { extractPhotos, formatPriceLabel } from '../utils/categoryUtils';

export default function RecommendedForYouScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { theme } = useContext(ThemeContext);
  const { unreadCount } = useContext(NotificationsContext);
  const { accessToken } = useContext(authContext);
  const { favorites } = useContext(favoritesContext);
  const [inboxUnreadCount, setInboxUnreadCount] = useState(0);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Derive user preferences from favorites
  const userPreferences = useMemo(() => {
    if (!favorites || favorites.length === 0) {
      return {};
    }

    // Count category occurrences
    const categoryCounts = {};
    const brandCounts = {};
    let totalPrice = 0;
    let priceCount = 0;

    favorites.forEach((fav) => {
      if (fav.category) {
        categoryCounts[fav.category] = (categoryCounts[fav.category] || 0) + 1;
      }
      if (fav.brand) {
        brandCounts[fav.brand] = (brandCounts[fav.brand] || 0) + 1;
      }
      if (fav.price) {
        const priceNum = typeof fav.price === 'number' ? fav.price : parseFloat(fav.price);
        if (!isNaN(priceNum) && priceNum > 0) {
          totalPrice += priceNum;
          priceCount++;
        }
      }
    });

    // Get most common category
    const preferredCategory = Object.keys(categoryCounts).reduce((a, b) =>
      categoryCounts[a] > categoryCounts[b] ? a : b, Object.keys(categoryCounts)[0]
    );

    // Get most common brand
    const preferredBrand = Object.keys(brandCounts).reduce((a, b) =>
      brandCounts[a] > brandCounts[b] ? a : b, Object.keys(brandCounts)[0]
    );

    // Calculate average price
    const preferredPrice = priceCount > 0 ? Math.round(totalPrice / priceCount) : null;

    return {
      preferredCategory: preferredCategory || undefined,
      preferredBrand: preferredBrand || undefined,
      preferredPrice: preferredPrice || undefined,
    };
  }, [favorites]);

  // Load inbox unread count
  const loadInboxUnread = useCallback(async () => {
    if (!accessToken) return;
    try {
      const { unreadCount: inboxCount } = await getConversations();
      setInboxUnreadCount(inboxCount || 0);
    } catch (error) {
      console.error('Failed to load inbox unread count:', error.response?.data || error.message);
      setInboxUnreadCount(0);
    }
  }, [accessToken]);

  // Fetch recommendations
  const loadRecommendations = useCallback(async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await fetchRecommendations(userPreferences);
      
      // Transform API data to match UI format
      const transformedRecommendations = (data || []).map((item) => {
        const photos = extractPhotos(item.photos);
        const price = typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0;
        
        return {
          id: item.listing_id || item.id,
          listing_id: item.listing_id || item.id,
          name: item.title || 'Untitled Listing',
          price: formatPriceLabel(price),
          priceNum: price,
          seller: item.seller_name || item.seller || 'Unknown',
          sellerColor: '#FF6B35',
          condition: item.condition || null,
          category: item.category,
          brand: item.brand,
          description: item.description,
          location: item.location,
          status: item.status,
          photos: photos,
          user_id: item.user_id,
          seller_profile_image: item.seller_profile_image || null,
        };
      });

      setRecommendations(transformedRecommendations);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError(err.message || 'Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  }, [accessToken, userPreferences]);

  useFocusEffect(
    useCallback(() => {
      loadInboxUnread();
      loadRecommendations();
    }, [loadInboxUnread, loadRecommendations])
  );

  const dynamicStyles = {
    container: { backgroundColor: theme.background },
    header: { backgroundColor: theme.background },
    pageTitle: { color: theme.text },
    scrollView: { backgroundColor: theme.background },
    productCard: { backgroundColor: theme.card },
    productName: { color: theme.text },
    productPrice: { color: theme.primary },
    sellerName: { color: theme.textMuted },
    productCondition: { color: theme.textMuted },
    imagePlaceholderText: { color: theme.textMuted },
    bottomNav: { backgroundColor: theme.card },
  };

  const renderProductCard = (item, index) => {
    const isLeft = index % 2 === 0;
    const firstPhoto = item.photos && item.photos.length > 0 ? item.photos[0] : null;
    
    return (
      <TouchableOpacity
        key={item.id || index}
        style={[styles.productCard, dynamicStyles.productCard, isLeft ? styles.cardLeft : styles.cardRight]}
        activeOpacity={0.85}
        onPress={() => {
          navigation.navigate('ProductDetail', {
            product: {
              listing_id: item.listing_id || item.id,
              id: item.listing_id || item.id,
              user_id: item.user_id,
              title: item.name,
              price: item.priceNum || item.price,
              location: item.location,
              date_posted: item.date_posted,
              description: item.description,
              category: item.category,
              condition: item.condition,
              brand: item.brand,
              status: item.status || 'available',
              photos: item.photos || [],
              seller_name: item.seller,
              seller_profile_image: item.seller_profile_image,
            },
          });
        }}
      >
        {firstPhoto ? (
          <Image
            source={{ uri: firstPhoto }}
            style={styles.productImage}
            resizeMode="cover"
          />
        ) : (
        <View style={styles.productImagePlaceholder}>
            <Ionicons name="image-outline" size={32} color={theme.textMuted} />
          </View>
        )}
        <Text style={[styles.productName, dynamicStyles.productName]} numberOfLines={2}>
          {item.name}
        </Text>
        {item.condition && (
          <Text style={[styles.productCondition, dynamicStyles.productCondition]}>
            {item.condition}
          </Text>
        )}
        <Text style={[styles.productPrice, dynamicStyles.productPrice]}>{item.price}</Text>
        <View style={styles.sellerInfo}>
          {item.seller_profile_image ? (
            <Image
              source={{ uri: item.seller_profile_image }}
              style={styles.sellerAvatarImage}
            />
          ) : (
            <View style={styles.sellerAvatar}>
            <Ionicons name="person" size={12} color={item.sellerColor || theme.primary} />
          </View>
          )}
          <Text style={[styles.sellerName, dynamicStyles.sellerName]} numberOfLines={1}>
            {item.seller}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      {/* Header Section */}
      <View style={[styles.header, dynamicStyles.header]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.pageTitle, dynamicStyles.pageTitle]}>Recommended For You</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.headerIcon}
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
              <Ionicons name="person" size={18} color="#FF6B35" />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={[styles.scrollView, dynamicStyles.scrollView]}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 140 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.loadingText, { color: theme.textMuted, marginTop: 12 }]}>
              Finding recommendations for you...
            </Text>
          </View>
        ) : error ? (
          <View style={styles.emptyState}>
            <Ionicons name="alert-circle-outline" size={48} color={theme.textMuted} />
            <Text style={[styles.emptyStateText, dynamicStyles.emptyStateText]}>
              {error}
            </Text>
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: theme.primary, marginTop: 16 }]}
              onPress={loadRecommendations}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : recommendations.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="sparkles-outline" size={48} color={theme.textMuted} />
            <Text style={[styles.emptyStateText, dynamicStyles.emptyStateText]}>
              No recommendations available yet.
            </Text>
            <Text style={[styles.emptyStateSubtext, { color: theme.textMuted, marginTop: 8 }]}>
              Save some listings to get personalized recommendations!
            </Text>
          </View>
        ) : (
        <View style={styles.productGrid}>
            {recommendations.map((product, index) => renderProductCard(product, index))}
        </View>
        )}
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <View style={[styles.bottomNav, dynamicStyles.bottomNav, { paddingBottom: 16 + insets.bottom }]}>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigateToBottomNav(navigation, 'Discover')}
        >
          <Ionicons name="home" size={22} color={theme.textMuted} />
          <Text style={[styles.navLabel, { color: theme.textMuted }]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigateToBottomNav(navigation, 'Inbox')}
        >
          <Ionicons name="chatbubble-outline" size={22} color={theme.textMuted} />
          <Text style={[styles.navLabel, { color: theme.textMuted }]}>Inbox</Text>
          {inboxUnreadCount > 0 && (
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>
                {inboxUnreadCount > 99 ? '99+' : inboxUnreadCount}
              </Text>
            </View>
          )}
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

