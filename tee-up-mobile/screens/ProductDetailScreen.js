import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from './styles/ProductDetailScreen.styles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ProductDetailScreen({ navigation, route }) {
  // Get product data from route params or use default
  const product = route?.params?.product || {
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
      avatar: null, // Will use placeholder
      rating: 4.9,
      reviewCount: 120,
    },
    images: [
      // Placeholder images - in real app these would be actual image URIs
      { id: 1, uri: null },
      { id: 2, uri: null },
      { id: 3, uri: null },
      { id: 4, uri: null },
      { id: 5, uri: null },
    ],
    reviews: [
      {
        id: 1,
        heading: 'Loved It!',
        text: 'The seller is very trustworthy and...',
        reviewer: {
          name: 'hockeyops',
          avatar: null,
        },
      },
    ],
  };

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);

  const handlePreviousImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  };

  const toggleFavorite = () => {
    setIsFavorited(!isFavorited);
  };

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
            {/* Placeholder for product image - in real app use Image component with actual URI */}
            <View style={styles.productImagePlaceholder}>
              <Text style={styles.imagePlaceholderText}>
                {product.title}
              </Text>
            </View>
            
            {/* Navigation Arrows */}
            {product.images.length > 1 && (
              <>
                <TouchableOpacity 
                  style={[styles.carouselArrow, styles.arrowLeft]}
                  onPress={handlePreviousImage}
                  activeOpacity={0.7}
                >
                  <Ionicons name="chevron-back" size={24} color="#000" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.carouselArrow, styles.arrowRight]}
                  onPress={handleNextImage}
                  activeOpacity={0.7}
                >
                  <Ionicons name="chevron-forward" size={24} color="#000" />
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Pagination Dots */}
          {product.images.length > 1 && (
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
          
          <Text style={styles.productPrice}>₱ {product.price}</Text>
          
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
        </View>

        {/* Seller Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Seller Information</Text>
          <View style={styles.sellerInfoContainer}>
            <View style={styles.sellerAvatar}>
              <Ionicons name="person" size={30} color="#FF6B35" />
            </View>
            <View style={styles.sellerDetails}>
              <Text style={styles.sellerName}>{product.seller.name}</Text>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color="#FFD700" />
                <Text style={styles.ratingText}>
                  {product.seller.rating} ({product.seller.reviewCount})
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Product Reviews Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Product Reviews</Text>
          {product.reviews.map((review) => (
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
          ))}
        </View>

        {/* Bottom Spacer for Navigation */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Floating Chat Icon */}
      <TouchableOpacity 
        style={styles.chatButton}
        activeOpacity={0.8}
      >
        <Ionicons name="chatbubbles" size={24} color="#FFF" />
      </TouchableOpacity>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.replace('Discover')}
        >
          <Ionicons name="home-outline" size={22} color="#999" />
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('Inbox')}
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
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="notifications-outline" size={22} color="#999" />
          <Text style={styles.navLabel}>Notifications</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.replace('Profile')}
        >
          <Ionicons name="person-outline" size={22} color="#999" />
          <Text style={styles.navLabel}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

