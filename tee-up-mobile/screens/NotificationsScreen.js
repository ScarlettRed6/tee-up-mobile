import React, { useCallback, useContext, useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import styles from './styles/NotificationsScreen.styles';
import { navigateToBottomNav } from '../navigation/navigationHelpers';
import { NotificationsContext } from '../context/notificationsContext';
import { fetchListingById } from '../api/listingsApi';
import { getConversations } from '../api/chatApi';

const ICON_MAP = {
  new_message: { icon: 'chatbubble-ellipses-outline', color: '#3B82F6' },
  rating_received: { icon: 'star-outline', color: '#F59E0B' },
  favorite_sold: { icon: 'pricetag-outline', color: '#10B981' },
  favorite_status_changed: { icon: 'pricetag-outline', color: '#F97316' },
  listing_favorited: { icon: 'heart', color: '#EC4899' },
  followed_new_listing: { icon: 'megaphone-outline', color: '#6366F1' },
  new_follower: { icon: 'person-add-outline', color: '#F472B6' },
  default: { icon: 'notifications-outline', color: '#6B7280' },
};

const formatRelativeTime = (timestamp) => {
  if (!timestamp) return '';
  const parsed = new Date(timestamp);
  if (Number.isNaN(parsed.getTime())) return '';
  const diffMs = Date.now() - parsed.getTime();
  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
  return parsed.toLocaleDateString();
};

export default function NotificationsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const {
    notifications,
    notificationsLoading,
    refreshNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    unreadCount,
  } = useContext(NotificationsContext);
  const [refreshing, setRefreshing] = useState(false);
  const [opening, setOpening] = useState(false);
  const [inboxUnreadCount, setInboxUnreadCount] = useState(0);

  const loadInboxUnread = useCallback(async () => {
    try {
      const { unreadCount: inboxCount } = await getConversations();
      setInboxUnreadCount(inboxCount || 0);
    } catch (error) {
      console.error('Failed to load inbox unread count:', error.response?.data || error.message);
      setInboxUnreadCount(0);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refreshNotifications(), loadInboxUnread()]);
    setRefreshing(false);
  }, [refreshNotifications, loadInboxUnread]);

  useFocusEffect(
    useCallback(() => {
      loadInboxUnread();
    }, [loadInboxUnread])
  );

  const handleNavigateToListing = useCallback(
    async (listingId) => {
      if (!listingId) {
        Alert.alert('Listing unavailable', 'This listing is no longer accessible.');
        return;
      }
      setOpening(true);
      try {
        const product = await fetchListingById(listingId);
        if (!product) {
          Alert.alert('Listing unavailable', 'This listing could not be found.');
          return;
        }
        navigation.navigate('ProductDetail', { product });
      } catch (error) {
        console.error('Unable to open listing from notification:', error.response?.data || error.message);
        Alert.alert('Error', 'Unable to open this listing right now.');
      } finally {
        setOpening(false);
      }
    },
    [navigation]
  );

  const handleNotificationPress = useCallback(
    async (notification) => {
      if (!notification) return;
      const notificationId = notification.notification_id || notification.id;
      if (notificationId) {
        markNotificationAsRead(notificationId);
      }

      const { type, data } = notification;
      if (type === 'new_message' && data?.conversationId) {
        navigation.navigate('ChatDetail', { conversationId: data.conversationId });
        return;
      }
      if (
        (type === 'favorite_sold' || type === 'favorite_status_changed' || type === 'listing_favorited' || type === 'followed_new_listing') &&
        data?.listing_id
      ) {
        handleNavigateToListing(data.listing_id);
        return;
      }
      if (type === 'new_follower' && data?.follower_id) {
        navigation.navigate('UserProfile', {
          userId: data.follower_id,
          user: {
            id: data.follower_id,
            name: data.follower_name,
          },
        });
        return;
      }
      if (type === 'rating_received') {
        navigation.navigate('Profile');
        return;
      }
    },
    [handleNavigateToListing, markNotificationAsRead, navigation]
  );

  const renderedNotifications = useMemo(() => notifications || [], [notifications]);

  const renderNotificationItem = (notification, index) => {
    const isOdd = index % 2 !== 0;
    const iconMeta = ICON_MAP[notification.type] || ICON_MAP.default;
    const timestamp = formatRelativeTime(notification.created_at);
    const isUnread = !notification.read_at;

    const key = notification.notification_id || notification.id || `${notification.type}-${index}`;
    return (
      <TouchableOpacity
        key={key}
        style={[
          styles.notificationItem,
          isOdd ? styles.notificationItemOdd : styles.notificationItemEven,
          isUnread && styles.notificationItemUnread,
        ]}
        activeOpacity={0.7}
        onPress={() => handleNotificationPress(notification)}
      >
        <View style={styles.avatarContainer}>
          <View style={[styles.avatarPlaceholder, { borderColor: iconMeta.color }]}>
            <Ionicons name={iconMeta.icon} size={20} color={iconMeta.color} />
          </View>
          {isUnread && <View style={styles.unreadDot} />}
        </View>

        <View style={styles.notificationContent}>
          <Text style={styles.notificationMessage}>{notification.message}</Text>
          {timestamp ? <Text style={styles.timestamp}>{timestamp}</Text> : null}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <View style={styles.headerLeft}>
            <Text style={styles.pageTitle}>Notification</Text>
          </View>
          <View style={styles.headerIconRow}>
            <TouchableOpacity 
              style={styles.headerIcon}
              activeOpacity={0.7}
            >
              <Ionicons name="people-outline" size={24} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerIcon}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('SavedListings')}
            >
              <Ionicons name="heart-outline" size={24} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerIcon}
              activeOpacity={0.7}
              onPress={() => navigateToBottomNav(navigation, 'Profile')}
            >
              <View style={styles.profileAvatar}>
                <Ionicons name="person" size={18} color="#FF6B35" />
              </View>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.markAllRow}>
          <TouchableOpacity
            style={styles.markAllButton}
            activeOpacity={0.7}
            onPress={markAllNotificationsAsRead}
            disabled={!unreadCount}
          >
            <Ionicons
              name="checkmark-done-outline"
              size={18}
              color={unreadCount ? '#FF6B35' : '#D1D5DB'}
            />
            <Text
              style={[
                styles.markAllText,
                !unreadCount && styles.markAllTextDisabled,
              ]}
            >
              Mark all
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Notification List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 140 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#FF6B35"
          />
        }
      >
        {notificationsLoading && renderedNotifications.length === 0 ? (
          <View style={styles.loadingState}>
            <ActivityIndicator size="large" color="#FF6B35" />
          </View>
        ) : renderedNotifications.length > 0 ? (
          renderedNotifications.map((notification, index) =>
            renderNotificationItem(notification, index)
          )
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-outline" size={64} color="#999" />
            <Text style={styles.emptyStateText}>No notifications yet</Text>
          </View>
        )}
        {opening && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#FF6B35" />
          </View>
        )}
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <View style={[styles.bottomNav, { paddingBottom: 16 + insets.bottom }]}>
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
          <Ionicons name="add-circle-outline" size={22} color="#999" />
          <Text style={styles.navLabel}>Sell</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => {}}
        >
          <Ionicons name="notifications" size={22} color="#000" />
          <Text style={styles.navLabelActive}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </Text>
            </View>
          )}
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

