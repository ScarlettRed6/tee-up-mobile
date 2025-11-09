import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from './styles/RecommendedForYouScreen.styles';
import { navigateToBottomNav } from '../navigation/navigationHelpers';

export default function RecommendedForYouScreen({ navigation }) {
  const products = [
    { name: 'Srixon ZXi5 Iron set 5-P', price: '₱26,500', seller: 'hockeyops', sellerColor: '#FF0000' },
    { name: 'PING G30 9.5', condition: 'Slightly Used', price: '₱7,500', seller: 'issa123', sellerColor: '#333' },
    { name: 'Titleist AP2 Forged 5-PW', price: '₱9,000', seller: 'hockeyops', sellerColor: '#FF0000' },
    { name: 'Titleist TSR3 9.0', condition: 'BNEW', price: '₱26,500', seller: 'hockeyops', sellerColor: '#FF0000' },
  ];

  const renderProductCard = (item, index) => {
    const isLeft = index % 2 === 0;
    return (
      <View key={index} style={[styles.productCard, isLeft ? styles.cardLeft : styles.cardRight]}>
        <View style={styles.productImagePlaceholder}>
          <Text style={styles.imagePlaceholderText}>
            {item.name.includes('Srixon') ? 'Srixon ZXi5' : 
             item.name.includes('PING') ? 'PING G30' :
             item.name.includes('AP2') ? 'Titleist AP2' : 'Titleist TSR3'}
          </Text>
        </View>
        <Text style={styles.productName}>{item.name}</Text>
        {item.condition && <Text style={styles.productCondition}>{item.condition}</Text>}
        <Text style={styles.productPrice}>{item.price}</Text>
        <View style={styles.sellerInfo}>
          <View style={[styles.sellerAvatar, { marginRight: 6 }]}>
            <Ionicons name="person" size={12} color={item.sellerColor} />
          </View>
          <Text style={styles.sellerName}>{item.seller}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Floating Header Icons */}
      <View style={styles.headerIcons}>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="search-outline" size={22} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="people-outline" size={22} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('SavedListings')}>
          <Ionicons name="heart-outline" size={22} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.iconButton} 
          onPress={() => navigateToBottomNav(navigation, 'Profile')}
        >
          <View style={styles.profileAvatar}>
            <Ionicons name="person" size={16} color="#FF6B35" />
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Spacer handled by paddingTop in scrollContent */}

        {/* Page Title */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Recommended For You</Text>
        </View>

        {/* Product Grid */}
        <View style={styles.productGrid}>
          {products.map((product, index) => renderProductCard(product, index))}
        </View>
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigateToBottomNav(navigation, 'Discover')}
        >
          <Ionicons name="home" size={22} color="#999" />
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
        <TouchableOpacity style={styles.navItem}>
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

