import React from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen({ navigation }) {
  const products = [
    { name: 'Srixon ZXi5 Iron set 5-P', price: '₱26,500', seller: 'hockeyops', sellerColor: '#FF0000' },
    { name: 'PING G30 9.5 Slightly Used', price: '₱7,500', seller: 'hockeyops', sellerColor: '#FF0000' },
    { name: 'Titleist AP2 Forged 5-PW', price: '₱9,000', seller: 'hockeyops', sellerColor: '#FF0000' },
    { name: 'Titleist TSR3 9.0 BNEW', price: '₱26,500', seller: 'hockeyops', sellerColor: '#FF0000' },
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
        <Text style={styles.productPrice}>{item.price}</Text>
        <View style={styles.sellerInfo}>
          <View style={[styles.sellerAvatar, { marginRight: 6 }]}>
            <Ionicons name="person" size={12} color={item.sellerColor} />
          </View>
          <Text style={styles.sellerName}>@{item.seller}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header Icons - Top Right */}
      <View style={styles.headerIcons}>
        <View style={styles.headerIconsRight}>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => {
              console.log('Settings icon pressed');
              navigation.navigate('Settings');
            }}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="settings-outline" size={20} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Summary Card */}
        <View style={styles.profileSection}>
          <View style={styles.profilePhotoContainer}>
            <View style={styles.profilePhoto}>
              <Ionicons name="person" size={50} color="#FF6B35" />
            </View>
          </View>
          
          <Text style={styles.username}>hockeyops</Text>
          
          <View style={styles.statsContainer}>
            <Text style={styles.statText}>Active Listings: 10</Text>
            <Text style={styles.statText}>5.5K followers</Text>
            <Text style={styles.statText}>3.2K items sold</Text>
          </View>
          
          <View style={styles.reputationContainer}>
            <Text style={styles.reputationText}>User Reputation: 5.0</Text>
            <View style={styles.starsContainer}>
              <Ionicons name="star" size={18} color="#FFD700" style={{ marginRight: 4 }} />
              <Ionicons name="star" size={18} color="#FFD700" style={{ marginRight: 4 }} />
              <Ionicons name="star" size={18} color="#FFD700" style={{ marginRight: 4 }} />
              <Ionicons name="star" size={18} color="#FFD700" style={{ marginRight: 4 }} />
              <Ionicons name="star" size={18} color="#FFD700" />
            </View>
          </View>
        </View>

        {/* Bio Section */}
        <View style={styles.bioSection}>
          <Text style={styles.bioText}>
            I buy/sell/trade golf clubs! Feel free to offer on any of my listings!
          </Text>
        </View>

        {/* Search and Filters */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={18} color="#666" style={styles.searchIcon} />
            <TextInput
              placeholder="Search seller's listing."
              placeholderTextColor="#999"
              style={styles.searchInput}
            />
          </View>
          
          <View style={styles.filterButtons}>
            <TouchableOpacity style={[styles.filterButton, { marginRight: 12 }]}>
              <Text style={styles.filterButtonText}>Filters</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterButton}>
              <Text style={styles.filterButtonText}>Sort by</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Listings Grid */}
        <View style={styles.listingsSection}>
          <View style={styles.productGrid}>
            {products.map((product, index) => renderProductCard(product, index))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.replace('Discover')}
        >
          <Ionicons name="home-outline" size={22} color="#999" />
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
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => {
            // Already on Profile, do nothing
          }}
        >
          <Ionicons name="person-outline" size={22} color="#000" />
          <Text style={styles.navLabelActive}>Profile</Text>
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
    paddingTop: 60,
  },
  headerIcons: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 20,
    zIndex: 1000,
    elevation: 1000,
  },
  headerIconsRight: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    minWidth: 40,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  profilePhotoContainer: {
    marginBottom: 12,
  },
  profilePhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  username: {
    fontFamily: 'Exo_700Bold',
    fontSize: 24,
    color: '#000',
    marginBottom: 12,
  },
  statsContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  statText: {
    fontFamily: 'Exo_400Regular',
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  reputationContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  reputationText: {
    fontFamily: 'Exo_400Regular',
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  bioSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  bioText: {
    fontFamily: 'Exo_400Regular_Italic',
    fontSize: 15,
    color: '#333',
    textAlign: 'center',
    lineHeight: 22,
  },
  searchSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Exo_400Regular',
    fontSize: 14,
    color: '#000',
  },
  filterButtons: {
    flexDirection: 'row',
  },
  filterButton: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  filterButtonText: {
    fontFamily: 'Exo_500Medium',
    fontSize: 14,
    color: '#000',
  },
  listingsSection: {
    paddingHorizontal: 20,
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
  navLabelActive: {
    fontFamily: 'Exo_700Bold',
    fontSize: 10,
    color: '#000',
    marginTop: 4,
  },
});

