import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styles from './styles/InboxScreen.styles';
import { navigateToBottomNav } from '../navigation/navigationHelpers';
import { getConversations } from '../api/chatApi';
import { authContext } from '../context/authContext';
import { NotificationsContext } from '../context/notificationsContext';
import { ThemeContext } from '../context/themeContext';

export default function InboxScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { accessToken } = useContext(authContext);
  const { unreadCount: notificationsUnreadCount } = useContext(NotificationsContext);
  const { theme } = useContext(ThemeContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const hasNavigatedRef = useRef(false); // Track if we've already navigated to ChatDetail
  const [inboxUnreadCount, setInboxUnreadCount] = useState(0);

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
      const { conversations: apiConversations, unreadCount: apiUnreadCount } = await getConversations();
      
      // Transform API data to match UI format
      const transformedConversations = apiConversations.map(conv => {
        // Parse listing_photos if it's a string (PostgreSQL array/JSON might be returned as string)
        let listingPhotos = [];
        if (conv.listing_photos) {
          if (typeof conv.listing_photos === 'string') {
            try {
              listingPhotos = JSON.parse(conv.listing_photos);
            } catch (e) {
              // If parsing fails, try to use it as a single photo URL
              listingPhotos = [conv.listing_photos];
            }
          } else if (Array.isArray(conv.listing_photos)) {
            listingPhotos = conv.listing_photos;
          } else {
            listingPhotos = [];
          }
        }
        
        return {
          conversation_id: conv.conversation_id,
          id: conv.conversation_id,
          productName: conv.listing_title || 'Product',
          username: conv.other_user_name || 'Unknown',
          otherUserId: conv.other_user_id,
          otherUserProfileImage: conv.other_user_profile_image || null,
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
            image: listingPhotos && listingPhotos.length > 0 ? listingPhotos[0] : null,
          },
          listingId: conv.listing_id,
          lastMessage: conv.last_message || null,
          hasMessages: !!conv.last_message,
        };
      });

      setConversations(transformedConversations);
      setInboxUnreadCount(apiUnreadCount || 0);
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

  const dynamicStyles = {
    container: { backgroundColor: theme.background },
    searchContainer: { backgroundColor: theme.background },
    searchBar: { backgroundColor: theme.card },
    searchInput: { color: theme.text },
    scrollView: { backgroundColor: theme.background },
    chatCard: { backgroundColor: theme.card },
    productName: { color: theme.text },
    userInfo: { color: theme.textMuted },
    bottomNav: { backgroundColor: theme.card },
  };

  if (loading) {
    return (
      <View style={[styles.container, dynamicStyles.container]}>
        <View style={[styles.searchContainer, dynamicStyles.searchContainer]}>
          <View style={[styles.searchBar, dynamicStyles.searchBar]}>
            <Ionicons name="search-outline" size={20} color={theme.textMuted} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, dynamicStyles.searchInput]}
              placeholder="Search user or listing"
              placeholderTextColor={theme.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      {/* Search Bar */}
      <View style={[styles.searchContainer, dynamicStyles.searchContainer]}>
        <View style={[styles.searchBar, dynamicStyles.searchBar]}>
          <Ionicons name="search-outline" size={20} color={theme.textMuted} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, dynamicStyles.searchInput]}
            placeholder="Search user or listing"
            placeholderTextColor={theme.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Chat List */}
      <ScrollView 
        style={[styles.scrollView, dynamicStyles.scrollView]}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 140 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        {error ? (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Text style={{ color: theme.primary, marginBottom: 10 }}>{error}</Text>
            <TouchableOpacity onPress={fetchConversations}>
              <Text style={{ color: theme.primary }}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : filteredChats.length > 0 ? (
          filteredChats.map((chat) => (
            <TouchableOpacity
              key={chat.id}
              style={[styles.chatCard, dynamicStyles.chatCard]}
              onPress={() => handleChatPress(chat)}
              activeOpacity={0.7}
            >
              {/* Product Image Thumbnail */}
              <View style={styles.productThumbnail}>
                {chat.product?.image ? (
                  <Image 
                    source={{ uri: chat.product.image }} 
                    style={styles.productImage}
                    resizeMode="cover"
                    onError={(e) => {
                      console.error('Image load error (Inbox):', e.nativeEvent.error, chat.product.image);
                    }}
                    onLoad={() => {
                      console.log('Image loaded successfully (Inbox):', chat.product.image);
                    }}
                  />
                ) : (
                  <Ionicons name="golf" size={24} color={theme.textMuted} />
                )}
              </View>

              {/* Chat Info */}
              <View style={styles.chatInfo}>
                <Text style={[styles.productName, dynamicStyles.productName]} numberOfLines={1}>
                  {chat.productName}
                </Text>
                <Text style={[styles.userInfo, dynamicStyles.userInfo]}>
                  {chat.username} - {chat.timestamp}
                </Text>
                {chat.lastMessage && (
                  <Text style={{ fontSize: 12, color: theme.textMuted, marginTop: 4 }} numberOfLines={1}>
                    {chat.lastMessage}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Ionicons name="chatbubbles-outline" size={48} color={theme.textMuted} />
            <Text style={{ color: theme.textMuted, marginTop: 12, fontSize: 16 }}>
              No conversations yet
            </Text>
            <Text style={{ color: theme.textMuted, marginTop: 4, fontSize: 14, textAlign: 'center' }}>
              Start a conversation by clicking the chat button on a listing
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={[styles.bottomNav, dynamicStyles.bottomNav, { paddingBottom: 16 + insets.bottom }]}>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigateToBottomNav(navigation, 'Discover')}
        >
          <Ionicons name="home-outline" size={22} color={theme.textMuted} />
          <Text style={[styles.navLabel, { color: theme.textMuted }]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => {}}
        >
          <Ionicons name="chatbubble" size={22} color={theme.primary} />
          <Text style={[styles.navLabelActive, { color: theme.primary }]}>Inbox</Text>
          {inboxUnreadCount > 0 && (
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>
                {inboxUnreadCount > 99 ? '99+' : inboxUnreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('PostItem')}
        >
          <Ionicons name="add-circle-outline" size={22} color={theme.textMuted} />
          <Text style={[styles.navLabel, { color: theme.textMuted }]}>Sell</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigateToBottomNav(navigation, 'Notifications')}
        >
          <Ionicons name="notifications-outline" size={22} color={theme.textMuted} />
          <Text style={[styles.navLabel, { color: theme.textMuted }]}>Notifications</Text>
          {notificationsUnreadCount > 0 && (
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>
                {notificationsUnreadCount > 99 ? '99+' : notificationsUnreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigateToBottomNav(navigation, 'Profile')}
        >
          <Ionicons name="person-outline" size={22} color={theme.textMuted} />
          <Text style={[styles.navLabel, { color: theme.textMuted }]}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

