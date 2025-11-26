import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styles from './styles/NotificationsScreen.styles';
import { navigateToBottomNav } from '../navigation/navigationHelpers';

export default function NotificationsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  // Sample notification data
  const notifications = [
    {
      id: 1,
      type: 'sale',
      username: 'hockeyops',
      action: 'has sold the item to another buyer.',
      timestamp: '13 hours ago',
      avatar: null, // Will use placeholder
      itemImage: 'driver', // Type of item for placeholder
    },
    {
      id: 2,
      type: 'save',
      username: 'tigerwoodsfan123',
      action: 'saved your item listing.',
      timestamp: '23 hours ago',
      avatar: null,
      itemImage: 'iron',
    },
    {
      id: 3,
      type: 'save',
      username: 'tigerwoodsfan123',
      action: 'saved your item listing.',
      timestamp: '1 day ago',
      avatar: null,
      itemImage: 'driver',
    },
    {
      id: 4,
      type: 'sale',
      username: 'morikawafan123',
      action: 'has sold the item to another buyer',
      timestamp: '1 day ago',
      avatar: null,
      itemImage: 'putter',
    },
    {
      id: 5,
      type: 'sale',
      username: 'hockeyops',
      action: 'has sold the item to another buyer.',
      timestamp: '2 days ago',
      avatar: null,
      itemImage: 'driver',
    },
  ];

  const renderNotificationItem = (notification, index) => {
    const isOdd = index % 2 !== 0;
    
    return (
      <TouchableOpacity
        key={notification.id}
        style={[
          styles.notificationItem,
          isOdd ? styles.notificationItemOdd : styles.notificationItemEven
        ]}
        activeOpacity={0.7}
        onPress={() => {
          // Navigate to product detail or user profile based on notification type
          // TODO: Implement navigation based on notification type
        }}
      >
        {/* Avatar/Icon */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatarPlaceholder}>
            {notification.itemImage === 'driver' ? (
              <Ionicons name="golf" size={20} color="#666" />
            ) : notification.itemImage === 'iron' ? (
              <Ionicons name="barbell" size={20} color="#666" />
            ) : notification.itemImage === 'putter' ? (
              <Ionicons name="golf" size={20} color="#666" />
            ) : (
              <Ionicons name="cube" size={20} color="#666" />
            )}
          </View>
        </View>

        {/* Center Content */}
        <View style={styles.notificationContent}>
          <Text style={styles.notificationText}>
            <Text style={styles.username}>{notification.username}</Text>
            {' '}
            <Text style={styles.actionText}>{notification.action}</Text>
          </Text>
          <Text style={styles.timestamp}>{notification.timestamp}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.pageTitle}>Notification</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.headerIcon}
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

      {/* Notification List */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 140 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        {notifications.length > 0 ? (
          notifications.map((notification, index) => renderNotificationItem(notification, index))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-outline" size={64} color="#999" />
            <Text style={styles.emptyStateText}>No notifications yet</Text>
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
          onPress={() => {
            // Already on Notifications, do nothing
          }}
        >
          <Ionicons name="notifications" size={22} color="#000" />
          <Text style={styles.navLabelActive}>Notifications</Text>
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

