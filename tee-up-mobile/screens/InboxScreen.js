import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import styles from './styles/InboxScreen.styles';
import { navigateToBottomNav } from '../navigation/navigationHelpers';
import { getConversations } from '../api/chatApi';
import { authContext } from '../context/authContext';
import jwtDecode from 'jwt-decode';

export default function InboxScreen({ navigation, route }) {
  const { accessToken } = useContext(authContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const hasNavigatedRef = useRef(false); // Track if we've already navigated to ChatDetail

  // Check if navigating from ProductDetailScreen with listing info
  const listingInfo = route?.params?.listingInfo;

  // Fetch conversations from API
  const fetchConversations = useCallback(async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getConversations();
      
      // Transform API data to match UI format
      const transformedConversations = data.map(conv => ({
        conversation_id: conv.conversation_id,
        id: conv.conversation_id,
        productName: conv.listing_title || 'Product',
        username: conv.other_user_name || 'Unknown',
        otherUserId: conv.other_user_id,
        timestamp: conv.last_message_time 
          ? new Date(conv.last_message_time).toLocaleTimeString('en-US', { 
              hour: 'numeric', 
              minute: '2-digit',
              hour12: true 
            })
          : new Date(conv.created_at).toLocaleTimeString('en-US', { 
              hour: 'numeric', 
              minute: '2-digit',
              hour12: true 
            }),
        product: {
          name: conv.listing_title || 'Product',
          price: `₱${conv.listing_price?.toLocaleString() || conv.listing_price || '0'}`,
          image: conv.listing_photos?.[0] || null,
        },
        listingId: conv.listing_id,
        lastMessage: conv.last_message || null,
        hasMessages: !!conv.last_message,
      }));

      setConversations(transformedConversations);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError(err.message || 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  // Fetch conversations on mount and when screen comes into focus
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Handle navigation to ChatDetailScreen when coming from ProductDetailScreen
  useEffect(() => {
    // Only navigate once when listingInfo is first received and we haven't navigated yet
    if (listingInfo && !hasNavigatedRef.current) {
      hasNavigatedRef.current = true;
      // Navigate to ChatDetailScreen with listing info
      // Conversation will be created when first message is sent
      navigation.navigate('ChatDetail', {
        listingInfo: listingInfo,
        isNewConversation: true,
      });
      // Immediately clear the listingInfo from route params to prevent re-navigation
      navigation.setParams({ listingInfo: undefined });
    }
  }, [listingInfo, navigation]);

  useFocusEffect(
    React.useCallback(() => {
      fetchConversations();
      // Reset navigation flag only if listingInfo is not present (user came back from chat)
      // This allows navigation again if a new listingInfo comes in
      if (!route?.params?.listingInfo) {
        hasNavigatedRef.current = false;
      }
    }, [fetchConversations, route?.params?.listingInfo])
  );

  // Filter chats based on search query
  const filteredChats = conversations.filter(chat => 
    chat.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleChatPress = (chat) => {
    navigation.navigate('ChatDetail', { 
      conversationId: chat.conversation_id,
      chat: chat 
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={20} color="#888" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search user or listing"
              placeholderTextColor="#888"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#FF6B35" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search user or listing"
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Chat List */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {error ? (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Text style={{ color: '#FF6B35', marginBottom: 10 }}>{error}</Text>
            <TouchableOpacity onPress={fetchConversations}>
              <Text style={{ color: '#FF6B35' }}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : filteredChats.length > 0 ? (
          filteredChats.map((chat) => (
            <TouchableOpacity
              key={chat.id}
              style={styles.chatCard}
              onPress={() => handleChatPress(chat)}
              activeOpacity={0.7}
            >
              {/* Product Image Thumbnail */}
              <View style={styles.productThumbnail}>
                <Ionicons name="golf" size={24} color="#666" />
              </View>

              {/* Chat Info */}
              <View style={styles.chatInfo}>
                <Text style={styles.productName} numberOfLines={1}>
                  {chat.productName}
                </Text>
                <Text style={styles.userInfo}>
                  {chat.username} - {chat.timestamp}
                </Text>
                {chat.lastMessage && (
                  <Text style={{ fontSize: 12, color: '#666', marginTop: 4 }} numberOfLines={1}>
                    {chat.lastMessage}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Ionicons name="chatbubbles-outline" size={48} color="#999" />
            <Text style={{ color: '#999', marginTop: 12, fontSize: 16 }}>
              No conversations yet
            </Text>
            <Text style={{ color: '#999', marginTop: 4, fontSize: 14, textAlign: 'center' }}>
              Start a conversation by clicking the chat button on a listing
            </Text>
          </View>
        )}
      </ScrollView>

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
          onPress={() => {
            // Already on Inbox, do nothing
          }}
        >
          <Ionicons name="chatbubble" size={22} color="#000" />
          <Text style={styles.navLabelActive}>Inbox</Text>
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
          onPress={() => {
            // Already on Inbox, do nothing
          }}
        >
          <Ionicons name="chatbubble" size={22} color="#000" />
          <Text style={styles.navLabelActive}>Inbox</Text>
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

