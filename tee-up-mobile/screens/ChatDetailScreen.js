import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from './styles/ChatDetailScreen.styles';

export default function ChatDetailScreen({ navigation, route }) {
  const [message, setMessage] = useState('');
  const scrollViewRef = useRef(null);

  // Get chat data from route params or use default
  const chat = route?.params?.chat || {
    id: 1,
    username: 'hockeyops',
    product: {
      name: 'TaylorMade Burner 2009 Driver 10.5',
      price: 'P5,000',
      image: null, // Placeholder - in real app would be image URI
    },
    messages: [
      {
        id: 1,
        text: "Can you do 3500 sir?",
        sender: 'other',
        timestamp: '5:49 PM',
        avatar: null,
      },
      {
        id: 2,
        text: "Ang baba sir barat naman po presyo",
        sender: 'me',
        timestamp: '5:50 PM',
        avatar: null,
      },
      {
        id: 3,
        text: "I'm fine, thanks!",
        sender: 'other',
        timestamp: 'Just Now',
        avatar: null,
      },
    ],
  };

  const handleSend = () => {
    if (message.trim().length > 0) {
      // In real app, this would send the message to the backend
      console.log('Sending message:', message);
      setMessage('');
      // Scroll to bottom after sending
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const handleViewProfile = () => {
    // Navigate to seller profile
    console.log('Viewing profile:', chat.username);
    // navigation.navigate('SellerProfile', { username: chat.username });
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.topBarCenter}>
          <Text style={styles.username} numberOfLines={1}>
            {chat.username}
          </Text>
          <View style={styles.productInfoTop}>
            <View style={styles.productThumbnailTop}>
              <Ionicons name="golf" size={20} color="#666" />
            </View>
            <View style={styles.productTextContainer}>
              <Text style={styles.productNameTop} numberOfLines={1}>
                {chat.product.name}
              </Text>
              <Text style={styles.productPriceTop}>{chat.product.price}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.profileButton}
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

      {/* Chat Messages */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {chat.messages.map((msg) => (
          <View
            key={msg.id}
            style={[
              styles.messageWrapper,
              msg.sender === 'me' ? styles.messageWrapperRight : styles.messageWrapperLeft
            ]}
          >
            {msg.sender === 'other' && (
              <View style={styles.avatar}>
                <Ionicons name="person" size={16} color="#666" />
              </View>
            )}
            <View style={[
              styles.messageBubbleContainer,
              msg.sender === 'me' ? styles.messageBubbleContainerRight : styles.messageBubbleContainerLeft
            ]}>
              <Text style={[
                styles.messageTimestamp,
                msg.sender === 'me' ? styles.messageTimestampRight : styles.messageTimestampLeft
              ]}>
                {msg.timestamp}
              </Text>
              <View style={[
                styles.messageBubble,
                msg.sender === 'me' ? styles.messageBubbleMe : styles.messageBubbleOther
              ]}>
                <Text style={styles.messageText}>{msg.text}</Text>
              </View>
            </View>
            {msg.sender === 'me' && (
              <View style={styles.avatar}>
                <Ionicons name="person" size={16} color="#666" />
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      {/* Message Input Bar */}
      <View style={styles.inputBar}>
        <TouchableOpacity style={styles.inputIcon} activeOpacity={0.7}>
          <Ionicons name="images-outline" size={22} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.inputIcon} activeOpacity={0.7}>
          <Ionicons name="camera-outline" size={22} color="#000" />
        </TouchableOpacity>
        <TextInput
          style={styles.textInput}
          placeholder="Type Your Message"
          placeholderTextColor="#999"
          value={message}
          onChangeText={setMessage}
          multiline
          maxLength={500}
        />
        <TouchableOpacity 
          style={styles.sendButton}
          onPress={handleSend}
          activeOpacity={0.7}
          disabled={message.trim().length === 0}
        >
          <Ionicons 
            name="send" 
            size={20} 
            color={message.trim().length > 0 ? "#000" : "#999"} 
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

