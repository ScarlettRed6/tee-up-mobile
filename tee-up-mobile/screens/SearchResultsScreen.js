import React, { useEffect, useMemo, useState, useContext } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styles from './styles/SearchResultsScreen.styles';
import { navigateToBottomNav } from '../navigation/navigationHelpers';
import { fetchListings } from '../api/listingsApi';
import { ThemeContext } from '../context/themeContext';
import { extractPhotos, formatPriceLabel } from '../utils/categoryUtils';

export default function SearchResultsScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { theme } = useContext(ThemeContext);
  const filtersFromRoute = route?.params?.filters || {};
  const filtersKey = JSON.stringify(filtersFromRoute || {});
  const appliedFilters = useMemo(() => {
    try {
      return JSON.parse(filtersKey);
    } catch (error) {
      return {};
    }
  }, [filtersKey]);

  const rawSearchParam = typeof route?.params?.searchQuery === 'string'
    ? route.params.searchQuery
    : '';
  const trimmedQuery = rawSearchParam.trim();
  const displayQuery = trimmedQuery.length ? trimmedQuery : 'All listings';

  const backendFilters = useMemo(() => {
    let parsedFilters = {};
    try {
      parsedFilters = JSON.parse(filtersKey);
    } catch (error) {
      parsedFilters = {};
    }
    const payload = {};
    if (trimmedQuery.length) {
      payload.search = trimmedQuery;
    }
    if (parsedFilters.category && parsedFilters.category !== 'All') {
      payload.category = parsedFilters.category;
    }
    if (parsedFilters.condition) {
      payload.condition = parsedFilters.condition;
    }
    if (parsedFilters.status) {
      payload.status = parsedFilters.status.toString().toLowerCase();
    } else {
      payload.status = 'available';
    }
    if (parsedFilters.minPrice) {
      payload.min_price = parsedFilters.minPrice;
    }
    if (parsedFilters.maxPrice) {
      payload.max_price = parsedFilters.maxPrice;
    }
    return payload;
  }, [trimmedQuery, filtersKey]);

  const serializedBackendFilters = JSON.stringify(backendFilters || {});
  const [results, setResults] = useState([]);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [resultsError, setResultsError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const loadResults = async () => {
      setResultsLoading(true);
      setResultsError(null);
      try {
        const parsedFilters = JSON.parse(serializedBackendFilters);
        const data = await fetchListings(parsedFilters);
        if (!isMounted) return;
        setResults(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch search results', error);
        if (isMounted) {
          setResultsError(error.response?.data?.message || 'Failed to load search results.');
          setResults([]);
        }
      } finally {
        if (isMounted) {
          setResultsLoading(false);
        }
      }
    };
    loadResults();
    return () => {
      isMounted = false;
    };
  }, [serializedBackendFilters]);

  const renderProductCard = (item, index) => {
    const isLeft = index % 2 === 0;
    const photos = extractPhotos(item.photos);
    const firstPhoto = photos.length > 0 ? photos[0] : null;
    const sellerName = item.seller_name || 'Unknown';
    const priceLabel = formatPriceLabel(item.price);
    const cardKey = item.listing_id || item.id || index;
    const statusLabel = item.status
      ? item.status.charAt(0).toUpperCase() + item.status.slice(1)
      : null;

    return (
      <TouchableOpacity
        key={cardKey}
        style={[styles.productCard, dynamicStyles.productCard, isLeft ? styles.cardLeft : styles.cardRight]}
        onPress={() => navigation.navigate('ProductDetail', { product: { ...item, photos } })}
        activeOpacity={0.8}
      >
        {firstPhoto ? (
          <Image
            source={{ uri: firstPhoto }}
            style={styles.productImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.productImagePlaceholder}>
            <Ionicons name="image-outline" size={24} color={theme.textMuted} />
            <Text style={[styles.imagePlaceholderText, { color: theme.textMuted }]}>
              {item.title?.length > 18 ? `${item.title.substring(0, 18)}...` : item.title}
            </Text>
          </View>
        )}
        <Text style={[styles.productName, dynamicStyles.productName]} numberOfLines={2}>{item.title}</Text>
        {item.condition ? <Text style={[styles.productCondition, { color: theme.textMuted }]}>{item.condition}</Text> : null}
        <Text style={[styles.productPrice, dynamicStyles.productPrice]}>{priceLabel}</Text>
        <View style={styles.sellerInfo}>
          {item.seller_profile_image ? (
            <Image
              source={{ uri: item.seller_profile_image }}
              style={[styles.sellerAvatarImage, { marginRight: 6 }]}
            />
          ) : (
            <View style={[styles.sellerAvatar, { marginRight: 6 }]}>
              <Ionicons name="person" size={12} color={theme.primary} />
            </View>
          )}
          <Text style={[styles.sellerName, dynamicStyles.sellerName]}>{sellerName}</Text>
        </View>
        {statusLabel && (
          <View style={styles.statusChip}>
            <Text style={styles.statusChipText}>{statusLabel}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const handleFilterPress = () => {
    navigation.navigate('SearchFilter', { 
      searchQuery: trimmedQuery,
      filters: appliedFilters,
      returnTo: 'SearchResults',
    });
  };

  const dynamicStyles = {
    container: { backgroundColor: theme.background },
    headerIcons: { backgroundColor: theme.background },
    scrollView: { backgroundColor: theme.background },
    titleSection: { backgroundColor: theme.background },
    title: { color: theme.text },
    resultCountText: { color: theme.textMuted },
    activeFilterText: { color: theme.textMuted },
    loadingText: { color: theme.textMuted },
    errorText: { color: theme.error || '#C2410C' },
    emptyStateTitle: { color: theme.text },
    emptyStateSubtitle: { color: theme.textMuted },
    productCard: { backgroundColor: theme.card },
    productName: { color: theme.text },
    productPrice: { color: theme.primary },
    sellerName: { color: theme.textMuted },
    bottomNav: { backgroundColor: theme.card },
  };

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      {/* Floating Header Icons */}
      <View style={[styles.headerIcons, dynamicStyles.headerIcons]}>
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={() => navigation.navigate('SearchFilter')}
        >
          <Ionicons name="search-outline" size={22} color={theme.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="people-outline" size={22} color={theme.text} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.iconButton} 
          onPress={() => navigation.navigate('SavedListings')}
        >
          <Ionicons name="heart-outline" size={22} color={theme.text} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.iconButton} 
          onPress={() => navigateToBottomNav(navigation, 'Profile')}
        >
          <View style={styles.profileAvatar}>
            <Ionicons name="person" size={16} color={theme.primary} />
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={[styles.scrollView, dynamicStyles.scrollView]}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 140 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Page Title with Filter Icon */}
        <View style={[styles.titleSection, dynamicStyles.titleSection]}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, dynamicStyles.title]} numberOfLines={1}>
              {trimmedQuery.length ? `'${displayQuery}'` : 'All Listings'}
            </Text>
            <TouchableOpacity 
              style={styles.filterButton}
              onPress={handleFilterPress}
              activeOpacity={0.7}
            >
              <Ionicons name="options-outline" size={22} color={theme.text} />
            </TouchableOpacity>
          </View>
          <View style={styles.resultMetaRow}>
            <Text style={[styles.resultCountText, dynamicStyles.resultCountText]}>
              {results.length} result{results.length === 1 ? '' : 's'}
            </Text>
            {appliedFilters.category && appliedFilters.category !== 'All' && (
              <Text style={[styles.activeFilterText, dynamicStyles.activeFilterText]}>Category: {appliedFilters.category}</Text>
            )}
          </View>
        </View>

        {resultsLoading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.loadingText, dynamicStyles.loadingText]}>Searching listings...</Text>
          </View>
        ) : resultsError ? (
          <View style={styles.errorState}>
            <Ionicons name="alert-circle-outline" size={24} color={theme.error || '#C2410C'} />
            <Text style={[styles.errorText, dynamicStyles.errorText]}>{resultsError}</Text>
          </View>
        ) : results.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={32} color={theme.primary} />
            <Text style={[styles.emptyStateTitle, dynamicStyles.emptyStateTitle]}>No listings found</Text>
            <Text style={[styles.emptyStateSubtitle, dynamicStyles.emptyStateSubtitle]}>
              Try adjusting your filters or search keywords.
            </Text>
          </View>
        ) : (
          <View style={styles.productGrid}>
            {results.map((product, index) => renderProductCard(product, index))}
          </View>
        )}
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

