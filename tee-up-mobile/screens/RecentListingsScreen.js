import React, { useContext } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styles from './styles/RecentListingsScreen.styles';
import { navigateToBottomNav } from '../navigation/navigationHelpers';
import { ListingsContext } from '../context/listingsContext';
import { ThemeContext } from '../context/themeContext';

export default function RecentListingsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { listings, loading } = useContext(ListingsContext);
  const { theme } = useContext(ThemeContext);

  const renderProductCard = (item, index) => {
    const isLeft = index % 2 === 0;
    const firstPhoto = item.photos && Array.isArray(item.photos) && item.photos.length > 0 
      ? item.photos[0] 
      : null;
    
    return (
      <TouchableOpacity
        key={item.listing_id}
        style={[styles.productCard, dynamicStyles.productCard, isLeft ? styles.cardLeft : styles.cardRight]}
        onPress={() => navigation.navigate('ProductDetail', { product: item })}
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
            <Text style={[styles.imagePlaceholderText, dynamicStyles.imagePlaceholderText]}>
              {item.title.length > 15 ? item.title.substring(0, 15) + '...' : item.title}
            </Text>
          </View>
        )}
        <Text style={[styles.productName, dynamicStyles.productName]} numberOfLines={2}>{item.title}</Text>
        <Text style={[styles.productCondition, dynamicStyles.productCondition]}>{item.condition}</Text>
        <Text style={[styles.productPrice, dynamicStyles.productPrice]}>
          ₱{typeof item.price === 'number' ? item.price.toLocaleString() : item.price}
        </Text>
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
    );
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
    productCondition: { color: theme.textMuted },
    imagePlaceholderText: { color: theme.textMuted },
    emptyStateText: { color: theme.textMuted },
    bottomNav: { backgroundColor: theme.card },
  };

  if (loading) {
    return (
      <View style={[styles.container, dynamicStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      {/* Header Section */}
      <View style={[styles.header, dynamicStyles.header]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.pageTitle, dynamicStyles.pageTitle]}>Recent Listings</Text>
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

        {/* Product Grid */}
        <View style={styles.productGrid}>
          {listings.length > 0 ? (
            listings.map((product, index) => renderProductCard(product, index))
          ) : (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyStateText, dynamicStyles.emptyStateText]}>No listings available</Text>
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


