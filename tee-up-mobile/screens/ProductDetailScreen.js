import React, { useState, useEffect, useContext, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Dimensions, ActivityIndicator, Modal, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from './styles/ProductDetailScreen.styles';
import { navigateToBottomNav } from '../navigation/navigationHelpers';
import { isCurrentUser } from '../utils/userConstants';
import { fetchListingById } from '../api/listingsApi';
import { findConversation } from '../api/chatApi';
import { authContext } from '../context/authContext';
import jwtDecode from 'jwt-decode';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ProductDetailScreen({ navigation, route }) {
  const { accessToken } = useContext(authContext);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const routeProduct = route?.params?.product;
  
  // Get current user ID from token
  const getCurrentUserId = () => {
    if (!accessToken) return null;
    try {
      const decoded = jwtDecode(accessToken);
      return decoded.id;
    } catch (err) {
      console.error('Error decoding token:', err);
      return null;
    }
  };

  useEffect(() => {
    const loadProduct = async () => {
      // If product data is passed from route, use it
      if (routeProduct) {
        // Transform backend data to display format
        const transformedProduct = {
          id: routeProduct.listing_id || routeProduct.id,
          listing_id: routeProduct.listing_id || routeProduct.id,
          user_id: routeProduct.user_id, // Store user_id for navigation
          title: routeProduct.title,
          price: routeProduct.price,
          location: routeProduct.location || 'Location not specified',
          postedDate: routeProduct.date_posted 
            ? new Date(routeProduct.date_posted).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })
            : 'Date not available',
          description: routeProduct.description || 'No description provided.',
          category: routeProduct.category,
          condition: routeProduct.condition,
          brand: routeProduct.brand,
          status: routeProduct.status,
          seller: {
            name: routeProduct.seller_name || 'Unknown',
            id: routeProduct.user_id, 
            avatar: routeProduct.seller_profile_image || null,
            profile_image: routeProduct.seller_profile_image || null,
            rating: 4.9, // TODO: Get from user profile
            reviewCount: 120, // TODO: Get from user profile
          },
          seller_name: routeProduct.seller_name,
          images: routeProduct.photos && Array.isArray(routeProduct.photos) && routeProduct.photos.length > 0
            ? routeProduct.photos.map((photo, index) => ({ id: index + 1, uri: photo }))
            : [{ id: 1, uri: null }], // Default placeholder
          reviews: [], // TODO: Fetch reviews from API
        };
        setProduct(transformedProduct);
        setLoading(false);
      } else if (route?.params?.listingId) {
        // If only ID is passed, fetch from API
        try {
          const listingData = await fetchListingById(route.params.listingId);
          const transformedProduct = {
            id: listingData.listing_id,
            listing_id: listingData.listing_id,
            user_id: listingData.user_id, 
            title: listingData.title,
            price: listingData.price,
            location: listingData.location || 'Location not specified',
            postedDate: listingData.date_posted 
              ? new Date(listingData.date_posted).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })
              : 'Date not available',
            description: listingData.description || 'No description provided.',
            category: listingData.category,
            condition: listingData.condition,
            brand: listingData.brand,
            status: listingData.status,
            seller: {
              name: listingData.seller_name || 'Unknown',
              id: listingData.user_id, // Include user_id in seller object
              avatar: listingData.seller_profile_image || null,
              profile_image: listingData.seller_profile_image || null,
              rating: 4.9,
              reviewCount: 120,
            },
            seller_name: listingData.seller_name,
            images: listingData.photos && Array.isArray(listingData.photos) && listingData.photos.length > 0
              ? listingData.photos.map((photo, index) => ({ id: index + 1, uri: photo }))
              : [{ id: 1, uri: null }],
            reviews: [],
          };
          setProduct(transformedProduct);
        } catch (error) {
          console.error('Error fetching listing:', error);
        } finally {
          setLoading(false);
        }
      } else {
        // Fallback to default
        setProduct({
          id: 1,
          title: 'Callaway Epic Flash Driver',
          price: '7,500',
          location: 'Quezon City',
          postedDate: 'October 23, 2025',
          description: 'Used lightly. Excellent condition. Perfect for new players.',
          category: 'Driver',
          condition: 'Used',
          seller: {
            name: 'hockeyops',
            avatar: null,
            rating: 4.9,
            reviewCount: 120,
          },
          images: [{ id: 1, uri: null }],
          reviews: [],
        });
        setLoading(false);
      }
    };

    loadProduct();
  }, [routeProduct, route?.params?.listingId]);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [fullscreenVisible, setFullscreenVisible] = useState(false);
  const [fullscreenIndex, setFullscreenIndex] = useState(0);
  const scrollViewRef = useRef(null);
  const fullscreenScrollViewRef = useRef(null);

  const handleScroll = (event) => {
    const slideSize = SCREEN_WIDTH;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    setCurrentImageIndex(index);
  };

  const openFullscreen = (index = currentImageIndex) => {
    setFullscreenIndex(index);
    setFullscreenVisible(true);
  };

  const closeFullscreen = () => {
    setFullscreenVisible(false);
  };

  const handleFullscreenScroll = (event) => {
    const slideSize = SCREEN_WIDTH;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    setFullscreenIndex(index);
  };

  // Effect to scroll to correct position when fullscreen opens
  useEffect(() => {
    if (fullscreenVisible && fullscreenScrollViewRef.current) {
      // Small delay to ensure ScrollView is rendered
      setTimeout(() => {
        fullscreenScrollViewRef.current?.scrollTo({
          x: fullscreenIndex * SCREEN_WIDTH,
          animated: false,
        });
      }, 100);
    }
  }, [fullscreenVisible, fullscreenIndex]);

  const toggleFavorite = () => {
    setIsFavorited(!isFavorited);
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Product not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: '#FF6B35', marginTop: 10 }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Check if this is the current user's own listing
  const currentUserId = getCurrentUserId();
  const productUserId = product.user_id || product.seller?.id;
  const isOwnListing = currentUserId && productUserId 
    ? currentUserId.toString() === productUserId.toString()
    : false;

  return (
    <View style={styles.container}>
      {/* Header with Back Button and Report Button */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.reportButton}
          onPress={() => {
            // Handle report functionality
            console.log('Report button pressed');
            // You can add navigation to a report screen or show an alert here
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="flag-outline" size={22} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Image Carousel */}
        <View style={styles.imageCarouselContainer}>
          <View style={styles.imageWrapper}>
            <ScrollView
              ref={scrollViewRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              style={styles.imageScrollView}
            >
              {product.images && product.images.length > 0 ? (
                product.images.map((image, index) => (
                  <TouchableOpacity
                    key={index}
                    activeOpacity={0.9}
                    onPress={() => image.uri && openFullscreen(index)}
                    style={styles.imageSlide}
                  >
                    {image.uri ? (
                      <Image 
                        source={{ uri: image.uri }}
                        style={styles.productImage}
                        resizeMode="cover"
                        onError={(error) => {
                          console.error('Image load error:', error.nativeEvent.error);
                          console.error('Failed to load image URL:', image.uri);
                        }}
                        onLoad={() => {
                          console.log('Image loaded successfully:', image.uri);
                        }}
                      />
                    ) : (
                      <View style={styles.productImagePlaceholder}>
                        <Ionicons name="image-outline" size={48} color="#999" />
                        <Text style={styles.imagePlaceholderText}>No Image</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.imageSlide}>
                  <View style={styles.productImagePlaceholder}>
                    <Ionicons name="image-outline" size={48} color="#999" />
                    <Text style={styles.imagePlaceholderText}>No Image</Text>
                  </View>
                </View>
              )}
            </ScrollView>
          </View>

          {/* Pagination Dots */}
          {product.images && product.images.length > 1 && (
            <View style={styles.paginationDots}>
              {product.images.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    index === currentImageIndex && styles.dotActive
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        {/* Product Title, Price, and Location */}
        <View style={styles.productInfoSection}>
          <View style={styles.titleRow}>
            <Text style={styles.productTitle} numberOfLines={2}>
              {product.title}
            </Text>
            <TouchableOpacity 
              style={styles.favoriteButton}
              onPress={toggleFavorite}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={isFavorited ? "heart" : "heart-outline"} 
                size={24} 
                color={isFavorited ? "#FF6B35" : "#333"} 
              />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.productPrice}>
            ₱{typeof product.price === 'number' ? product.price.toLocaleString() : product.price}
          </Text>
          
          <Text style={styles.locationDate}>
            {product.location} | Posted on {product.postedDate}
          </Text>
        </View>

        {/* Description Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.sectionContent}>{product.description}</Text>
        </View>

        {/* Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          <Text style={styles.detailLine}>Category: {product.category}</Text>
          <Text style={styles.detailLine}>Condition: {product.condition}</Text>
          {product.brand && (
            <Text style={styles.detailLine}>Brand: {product.brand}</Text>
          )}
          {product.status && (
            <Text style={styles.detailLine}>Status: {product.status}</Text>
          )}
        </View>

        {/* Seller Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Seller Information</Text>
          <TouchableOpacity
            style={styles.sellerInfoContainer}
            onPress={() => {
              const currentUserId = getCurrentUserId();
              const productUserId = product.user_id || product.seller?.id;
              
              // Check if the seller is the current logged-in user by comparing user IDs
              // Also check by username as fallback for backward compatibility
              const isOwnListing = currentUserId && productUserId 
                ? currentUserId.toString() === productUserId.toString()
                : isCurrentUser(product.seller.name);
              
              if (isOwnListing) {
                // Navigate to own profile page
                navigateToBottomNav(navigation, 'Profile');
              } else {
                // Navigate to other user's profile page
                // Pass userId if available, otherwise fall back to user object
                if (product.user_id || product.seller?.id) {
                  navigation.navigate('UserProfile', {
                    userId: product.user_id || product.seller?.id,
                    // Also pass user object for backward compatibility and immediate display
                    user: {
                      id: product.user_id || product.seller?.id,
                      username: product.seller.name,
                      rating: product.seller.rating,
                      reviewCount: product.seller.reviewCount,
                      avatarColor: '#FF6B35',
                      activeListings: 0, // Will be fetched from API
                      followers: '0',
                      itemsSold: '0',
                      reputation: product.seller.rating,
                      bio: 'Golf enthusiast and club collector.',
                    }
                  });
                } else {
                  // Fallback: navigate with user object only (backward compatibility)
                  navigation.navigate('UserProfile', {
                    user: {
                      username: product.seller.name,
                      rating: product.seller.rating,
                      reviewCount: product.seller.reviewCount,
                      avatarColor: '#FF6B35',
                      activeListings: 0,
                      followers: '0',
                      itemsSold: '0',
                      reputation: product.seller.rating,
                      bio: 'Golf enthusiast and club collector.',
                    }
                  });
                }
              }
            }}
            activeOpacity={0.7}
          >
            {product.seller.profile_image || product.seller.avatar ? (
              <Image 
                source={{ uri: product.seller.profile_image || product.seller.avatar }}
                style={styles.sellerAvatar}
              />
            ) : (
              <View style={styles.sellerAvatar}>
                <Ionicons name="person" size={30} color="#FF6B35" />
              </View>
            )}
            <View style={styles.sellerDetails}>
              <Text style={styles.sellerName}>{product.seller.name}</Text>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color="#FFD700" />
                <Text style={styles.ratingText}>
                  {product.seller.rating} ({product.seller.reviewCount})
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Product Reviews Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Product Reviews</Text>
          {product.reviews && product.reviews.length > 0 ? (
            product.reviews.map((review) => (
              <View key={review.id} style={styles.reviewCard}>
                <Text style={styles.reviewHeading}>{review.heading}</Text>
                <Text style={styles.reviewText}>{review.text}</Text>
                <View style={styles.reviewerInfo}>
                  <View style={styles.reviewerAvatar}>
                    <Ionicons name="person" size={16} color="#FF6B35" />
                  </View>
                  <Text style={styles.reviewerName}>{review.reviewer.name}</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyReviewsText}>No reviews yet. Be the first to review!</Text>
          )}
        </View>

        {/* Bottom Spacer for Navigation */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Floating Chat Icon - Only show for other users' listings */}
      {!isOwnListing && (
        <TouchableOpacity 
          style={styles.chatButton}
          activeOpacity={0.8}
          onPress={async () => {
            try {
              const currentUserId = getCurrentUserId();
              const sellerId = product.user_id || product.seller?.id;
              const listingId = product.listing_id || product.id;

              if (!currentUserId || !sellerId || !listingId) {
                console.error('Missing required IDs for conversation check');
                return;
              }

              // Check if conversation already exists for THIS SPECIFIC listing
              console.log('Checking for conversation:', { currentUserId, sellerId, listingId });
              const existingConversation = await findConversation(sellerId, listingId);
              console.log('Existing conversation result:', existingConversation ? 'Found' : 'Not found');

              if (existingConversation && existingConversation.listing_id === parseInt(listingId)) {
                // Navigate directly to existing conversation for THIS listing
                console.log('Navigating to existing conversation:', existingConversation.conversation_id);
                navigation.navigate('ChatDetail', {
                  conversationId: existingConversation.conversation_id,
                  chat: {
                    conversation_id: existingConversation.conversation_id,
                    productName: product.title,
                    username: product.seller_name || product.seller?.name,
                    otherUserId: sellerId,
                    listingId: listingId,
                    product: {
                      name: product.title,
                      price: product.price,
                    }
                  }
                });
              } else {
                // No conversation exists for this listing - create new one
                console.log('No existing conversation for this listing, creating new one');
                // Navigate to InboxScreen with listing info
                // Conversation will be created when first message is sent
                navigation.navigate('Inbox', {
                  listingInfo: {
                    listingId: listingId,
                    sellerId: sellerId,
                    listingTitle: product.title,
                    listingPrice: product.price,
                    sellerName: product.seller_name || product.seller?.name,
                  }
                });
              }
            } catch (error) {
              console.error('Error checking for conversation:', error);
              // Fallback: navigate to InboxScreen
              navigation.navigate('Inbox', {
                listingInfo: {
                  listingId: product.listing_id || product.id,
                  sellerId: product.user_id || product.seller?.id,
                  listingTitle: product.title,
                  listingPrice: product.price,
                  sellerName: product.seller_name || product.seller?.name,
                }
              });
            }
          }}
        >
          <Ionicons name="chatbubbles" size={24} color="#FFF" />
        </TouchableOpacity>
      )}

      {/* Fullscreen Image Viewer Modal */}
      <Modal
        visible={fullscreenVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeFullscreen}
      >
        <StatusBar hidden />
        <View style={styles.fullscreenContainer}>
          {/* Back Button */}
          <TouchableOpacity
            style={styles.fullscreenBackButton}
            onPress={closeFullscreen}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={32} color="#FFF" />
          </TouchableOpacity>

          {/* Fullscreen Image ScrollView */}
          <ScrollView
            ref={fullscreenScrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleFullscreenScroll}
            scrollEventThrottle={16}
            style={styles.fullscreenScrollView}
          >
            {product.images && product.images.length > 0 ? (
              product.images.map((image, index) => (
                <View key={index} style={styles.fullscreenImageSlide}>
                  {image.uri ? (
                    <Image 
                      source={{ uri: image.uri }}
                      style={styles.fullscreenImage}
                      resizeMode="contain"
                    />
                  ) : (
                    <View style={styles.fullscreenPlaceholder}>
                      <Ionicons name="image-outline" size={64} color="#FFF" />
                      <Text style={styles.fullscreenPlaceholderText}>No Image</Text>
                    </View>
                  )}
                </View>
              ))
            ) : null}
          </ScrollView>

          {/* Fullscreen Pagination Dots */}
          {product.images && product.images.length > 1 && (
            <View style={styles.fullscreenPaginationDots}>
              {product.images.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.fullscreenDot,
                    index === fullscreenIndex && styles.fullscreenDotActive
                  ]}
                />
              ))}
            </View>
          )}
        </View>
      </Modal>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigateToBottomNav(navigation, 'Discover')}
        >
          <Ionicons name="home-outline" size={22} color="#999" />
          <Text style={styles.navLabel}>Home</Text>
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

