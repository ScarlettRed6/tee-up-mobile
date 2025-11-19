import React, { useContext } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator  } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from './styles/DiscoverScreen.styles';
import { navigateToBottomNav } from '../navigation/navigationHelpers';
import { ListingsContext } from '../context/listingsContext';

export default function DiscoverScreen({ navigation }) {
  const { listings, loading } = useContext(ListingsContext);

  // Helper function to navigate to product detail
  const navigateToProductDetail = (productData) => {
    navigation.navigate('ProductDetail', { product: productData });
  };

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
        {/* Subtitle */}
        <View style={styles.subtitleSection}>
          <Text style={styles.subtitle}>Browse many golf products in the marketplace.</Text>
        </View>

        {/* Newly Added Listings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Newly Added Listings</Text>
          <View style={styles.productRow}>
            {listings.length > 0 ? (
              listings.slice(0, 3).map(item => (
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
                    <View style={[styles.sellerAvatar, { marginRight: 6 }]}>
                      <Ionicons name="person" size={12} color="#FF6B35" />
                    </View>
                    <Text style={styles.sellerName}>{item.seller_name || 'Unknown'}</Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No listings available</Text>
              </View>
            )}
            {/* <TouchableOpacity 
              style={[styles.productCard, { marginRight: 12 }]}
              onPress={() => navigateToProductDetail({
                id: 1,
                title: 'Srixon ZXi5 Iron set 5-P',
                price: '26,500',
                location: 'Quezon City',
                postedDate: 'October 20, 2025',
                description: 'Excellent condition iron set. Perfect for intermediate players looking to upgrade.',
                category: 'Iron',
                condition: 'Slightly Used',
                seller: {
                  name: 'hockeyops',
                  rating: 4.9,
                  reviewCount: 120,
                },
                images: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }],
                reviews: [
                  {
                    id: 1,
                    heading: 'Great Quality!',
                    text: 'The seller is very trustworthy and the clubs are in excellent condition.',
                    reviewer: { name: 'hockeyops' },
                  },
                ],
              })}
              activeOpacity={0.8}
            >
              <View style={styles.productImagePlaceholder}>
                <Text style={styles.imagePlaceholderText}>Srixon ZXi5</Text>
              </View>
              <Text style={styles.productName}>Srixon ZXi5 Iron set 5-P</Text>
              <Text style={styles.productPrice}>₱26,500</Text>
              <View style={styles.sellerInfo}>
                <View style={[styles.sellerAvatar, { marginRight: 6 }]}>
                  <Ionicons name="person" size={12} color="#FF0000" />
                </View>
                <Text style={styles.sellerName}>hockeyops</Text>
              </View>
            </TouchableOpacity> */}

            {/* <TouchableOpacity 
              style={[styles.productCard, { marginRight: 12 }]}
              onPress={() => navigateToProductDetail({
                id: 2,
                title: 'PING G30 9.5 Slightly Used',
                price: '7,500',
                location: 'Manila',
                postedDate: 'October 18, 2025',
                description: 'Used lightly. Excellent condition. Perfect for new players.',
                category: 'Driver',
                condition: 'Slightly Used',
                seller: {
                  name: 'issa123',
                  rating: 4.7,
                  reviewCount: 85,
                },
                images: [{ id: 1 }, { id: 2 }, { id: 3 }],
                reviews: [
                  {
                    id: 1,
                    heading: 'Loved It!',
                    text: 'The seller is very trustworthy and...',
                    reviewer: { name: 'issa123' },
                  },
                ],
              })}
              activeOpacity={0.8}
            >
              <View style={styles.productImagePlaceholder}>
                <Text style={styles.imagePlaceholderText}>PING G30</Text>
              </View>
              <Text style={styles.productName}>PING G30 9.5 Slightly Used</Text>
              <Text style={styles.productPrice}>₱7,500</Text>
              <View style={styles.sellerInfo}>
                <View style={[styles.sellerAvatar, { marginRight: 6 }]}>
                  <Ionicons name="person" size={12} color="#333" />
                </View>
                <Text style={styles.sellerName}>issa123</Text>
              </View>
            </TouchableOpacity> */}

            <TouchableOpacity 
              style={styles.viewMoreArrow}
              onPress={() => navigation.navigate('RecentListings')}
            >
              <Text style={styles.arrowSymbol}>→</Text>
              <Text style={styles.viewMoreText}>Click to view more</Text>
            </TouchableOpacity>
          </View>
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
                    <View style={[styles.sellerAvatar, { marginRight: 6 }]}>
                      <Ionicons name="person" size={12} color="#FF6B35" />
                    </View>
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

