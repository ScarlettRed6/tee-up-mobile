import React, { useContext } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from './styles/RecentListingsScreen.styles';
import { navigateToBottomNav } from '../navigation/navigationHelpers';
import { ListingsContext } from '../context/listingsContext';

export default function RecentListingsScreen({ navigation }) {
  const { listings, loading } = useContext(ListingsContext);

  const renderProductCard = (item, index) => {
    const isLeft = index % 2 === 0;
    const firstPhoto = item.photos && Array.isArray(item.photos) && item.photos.length > 0 
      ? item.photos[0] 
      : null;
    
    return (
      <TouchableOpacity
        key={item.listing_id}
        style={[styles.productCard, isLeft ? styles.cardLeft : styles.cardRight]}
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
            <Ionicons name="image-outline" size={24} color="#999" />
            <Text style={styles.imagePlaceholderText}>
              {item.title.length > 15 ? item.title.substring(0, 15) + '...' : item.title}
            </Text>
          </View>
        )}
        <Text style={styles.productName} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.productCondition}>{item.condition}</Text>
        <Text style={styles.productPrice}>
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
              <Ionicons name="person" size={12} color="#FF6B35" />
            </View>
          )}
          <Text style={styles.sellerName}>{item.seller_name || 'Unknown'}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.pageTitle}>Recent Listings</Text>
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
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* Product Grid */}
        <View style={styles.productGrid}>
          {listings.length > 0 ? (
            listings.map((product, index) => renderProductCard(product, index))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No listings available</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
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


