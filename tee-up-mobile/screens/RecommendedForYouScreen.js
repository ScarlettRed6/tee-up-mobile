import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function RecommendedForYouScreen() {
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
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Icons */}
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="search-outline" size={22} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="people-outline" size={22} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="heart-outline" size={22} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <View style={styles.profileAvatar}>
              <Ionicons name="person" size={16} color="#FF6B35" />
            </View>
          </TouchableOpacity>
        </View>

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
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home" size={22} color="#999" />
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="chatbubble-outline" size={22} color="#999" />
          <Text style={styles.navLabel}>Inbox</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="add-circle-outline" size={22} color="#999" />
          <Text style={styles.navLabel}>Sell</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="notifications-outline" size={22} color="#999" />
          <Text style={styles.navLabel}>Notifications</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="person-outline" size={22} color="#999" />
          <Text style={styles.navLabel}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6EDE2',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
    paddingHorizontal: 20,
  },
  headerIcons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 20,
  },
  iconButton: {
    padding: 4,
  },
  profileAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontFamily: 'Exo_700Bold',
    fontSize: 28,
    color: '#000',
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 12,
    width: '48%',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  cardLeft: {
    marginRight: '2%',
  },
  cardRight: {
    marginLeft: '2%',
  },
  productImagePlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  imagePlaceholderText: {
    fontFamily: 'Exo_400Regular',
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  productName: {
    fontFamily: 'Exo_600SemiBold',
    fontSize: 12,
    color: '#000',
    marginBottom: 4,
  },
  productCondition: {
    fontFamily: 'Exo_400Regular',
    fontSize: 10,
    color: '#666',
    marginBottom: 6,
  },
  productPrice: {
    fontFamily: 'Exo_700Bold',
    fontSize: 14,
    color: '#000',
    marginBottom: 8,
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sellerAvatar: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sellerName: {
    fontFamily: 'Exo_400Regular',
    fontSize: 10,
    color: '#666',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -2 },
    elevation: 8,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  navLabel: {
    fontFamily: 'Exo_400Regular',
    fontSize: 10,
    color: '#999',
    marginTop: 4,
  },
});

