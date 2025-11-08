import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function DiscoverScreen({ navigation }) {
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
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.replace('Profile')}>
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
          <Text style={styles.title}>Discover</Text>
          <Text style={styles.subtitle}>Browse many golf products in the marketplace.</Text>
        </View>

        {/* Newly Added Listings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Newly Added Listings</Text>
          <View style={styles.productRow}>
            <View style={[styles.productCard, { marginRight: 12 }]}>
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
            </View>

            <View style={[styles.productCard, { marginRight: 12 }]}>
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
            </View>

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
            <View style={[styles.productCard, { marginRight: 12 }]}>
              <View style={styles.productImagePlaceholder}>
                <Text style={styles.imagePlaceholderText}>Titleist AP2</Text>
              </View>
              <Text style={styles.productName}>Titleist AP2 Forged 5-PW</Text>
              <Text style={styles.productPrice}>₱9,000</Text>
              <View style={styles.sellerInfo}>
                <View style={[styles.sellerAvatar, { marginRight: 6 }]}>
                  <Ionicons name="person" size={12} color="#FF0000" />
                </View>
                <Text style={styles.sellerName}>hockeyops</Text>
              </View>
            </View>

            <View style={[styles.productCard, { marginRight: 12 }]}>
              <View style={styles.productImagePlaceholder}>
                <Text style={styles.imagePlaceholderText}>Titleist TSR3</Text>
              </View>
              <Text style={styles.productName}>Titleist TSR3 9.10 BNEW</Text>
              <Text style={styles.productPrice}>₱26,500</Text>
              <View style={styles.sellerInfo}>
                <View style={[styles.sellerAvatar, { marginRight: 6 }]}>
                  <Ionicons name="person" size={12} color="#FF0000" />
                </View>
                <Text style={styles.sellerName}>hockeyops</Text>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.viewMoreArrow}
              onPress={() => navigation.navigate('RecommendedForYou')}
            >
              <Text style={styles.arrowSymbol}>→</Text>
              <Text style={styles.viewMoreText}>Click to view more</Text>
            </TouchableOpacity>
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
        <TouchableOpacity style={styles.navItem}>
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
    paddingTop: 110,
  },
  headerIcons: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 20,
    backgroundColor: '#F6EDE2',
    borderBottomWidth: 1,
    borderBottomColor: '#E6D9CC',
    zIndex: 10,
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
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  title: {
    fontFamily: 'Exo_700Bold',
    fontSize: 32,
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Exo_400Regular',
    fontSize: 14,
    color: '#333',
    opacity: 0.8,
  },
  section: {
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontFamily: 'Exo_600SemiBold',
    fontSize: 18,
    color: '#000',
    marginBottom: 16,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  productCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 12,
    width: 140,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  productImagePlaceholder: {
    width: '100%',
    height: 100,
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
  viewMoreArrow: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  arrowSymbol: {
    fontSize: 24,
    color: '#999',
    marginBottom: 4,
  },
  viewMoreText: {
    fontFamily: 'Exo_400Regular',
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
  },
  categoriesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  categoryPill: {
    backgroundColor: '#F3F3F3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  categoryText: {
    fontFamily: 'Exo_500Medium',
    fontSize: 13,
    color: '#000',
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

