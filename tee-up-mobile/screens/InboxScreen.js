import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from './styles/InboxScreen.styles';
import { navigateToBottomNav } from '../navigation/navigationHelpers';

export default function InboxScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');

  // Sample chat data - in real app, this would come from API/state
  const chats = [
    {
      id: 1,
      productName: 'TaylorMade Burner 2009 Driver',
      username: 'hockeyops',
      timestamp: '12:47 PM',
      productImage: null, // Placeholder - in real app would be image URI
      product: {
        name: 'TaylorMade Burner 2009 Driver 10.5',
        price: 'P5,000',
        image: null,
      },
      messages: [
        {
          id: 1,
          text: "Can you do 3500 sir?",
          sender: 'other',
          timestamp: '5:49 PM',
        },
        {
          id: 2,
          text: "Ang baba sir barat naman po presyo",
          sender: 'me',
          timestamp: '5:50 PM',
        },
        {
          id: 3,
          text: "I'm fine, thanks!",
          sender: 'other',
          timestamp: 'Just Now',
        },
      ],
    },
    {
      id: 2,
      productName: 'TaylorMade P790 Iron Set 5-P',
      username: 'LetHimCook123',
      timestamp: '9:27 AM',
      productImage: null,
      product: {
        name: 'TaylorMade P790 Iron Set 5-P',
        price: 'P15,000',
        image: null,
      },
      messages: [],
    },
    {
      id: 3,
      productName: 'Cobra F9 Driver 9.0',
      username: 'hockeyops',
      timestamp: '5:11 AM',
      productImage: null,
      product: {
        name: 'Cobra F9 Driver 9.0',
        price: 'P8,500',
        image: null,
      },
      messages: [],
    },
    {
      id: 4,
      productName: 'TaylorMade SIM Max 5 Wood',
      username: 'hockeyops',
      timestamp: '12:17 AM',
      productImage: null,
      product: {
        name: 'TaylorMade SIM Max 5 Wood',
        price: 'P6,000',
        image: null,
      },
      messages: [],
    },
    {
      id: 5,
      productName: 'Callaway AI Smoke Driver 10.5',
      username: 'scottiescheffler4',
      timestamp: '11:35 AM',
      productImage: null,
      product: {
        name: 'Callaway AI Smoke Driver 10.5',
        price: 'P12,000',
        image: null,
      },
      messages: [],
    },
  ];

  // Filter chats based on search query
  const filteredChats = chats.filter(chat => 
    chat.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleChatPress = (chat) => {
    navigation.navigate('ChatDetail', { chat });
  };

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
        {filteredChats.map((chat) => (
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
            </View>
          </TouchableOpacity>
        ))}
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
    </View>
  );
}

