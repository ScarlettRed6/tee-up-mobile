import React, { useState, useRef, useEffect, useContext } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, Keyboard, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from './styles/ChatDetailScreen.styles';
import { getMessages, findOrCreateConversation } from '../api/chatApi';
import { getSocket, disconnectSocket } from '../utils/socketClient';
import { authContext } from '../context/authContext';
import { getUserProfile } from '../api/userApi';
import jwtDecode from 'jwt-decode';

export default function ChatDetailScreen({ navigation, route }) {
  const { accessToken } = useContext(authContext);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUserProfileImage, setCurrentUserProfileImage] = useState(null);
  const [otherUserProfileImage, setOtherUserProfileImage] = useState(null);
  const scrollViewRef = useRef(null);
  const socketRef = useRef(null);
  const currentUserIdRef = useRef(null); // Store current user ID for consistent comparison

  // Get route params
  const conversationId = route?.params?.conversationId;
  const existingChat = route?.params?.chat;
  const listingInfo = route?.params?.listingInfo;
  const isNewConversation = route?.params?.isNewConversation || false;

  // Get current user ID and store it in ref for consistent comparison
  const getCurrentUserId = () => {
    if (currentUserIdRef.current) {
      return currentUserIdRef.current;
    }
    if (!accessToken) return null;
    try {
      const decoded = jwtDecode(accessToken);
      // Store as string for consistent comparison
      currentUserIdRef.current = String(decoded.id);
      return currentUserIdRef.current;
    } catch (err) {
      console.error('Error decoding token:', err);
      return null;
    }
  };

  // Update currentUserIdRef when accessToken changes
  useEffect(() => {
    if (accessToken) {
      try {
        const decoded = jwtDecode(accessToken);
        currentUserIdRef.current = String(decoded.id);
      } catch (err) {
        console.error('Error decoding token:', err);
        currentUserIdRef.current = null;
      }
    } else {
      currentUserIdRef.current = null;
    }
  }, [accessToken]);

  // Initialize conversation and messages
  useEffect(() => {
    const initializeChat = async () => {
      if (!accessToken) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // If we have listingInfo (new conversation), we'll create it when first message is sent
        if (listingInfo && isNewConversation) {
          // Set up conversation data from listingInfo
          setConversation({
            conversation_id: null, // Will be created on first message
            listing_title: listingInfo.listingTitle,
            listing_price: listingInfo.listingPrice,
            other_user_name: listingInfo.sellerName,
            other_user_id: listingInfo.sellerId,
            listing_id: listingInfo.listingId,
          });
          setMessages([]);
          setLoading(false);
          return;
        }

        // If we have an existing conversationId, fetch messages
        if (conversationId) {
          const data = await getMessages(conversationId);
          const currentUserId = getCurrentUserId();
          
          // Determine other user's name and profile image from conversation
          if (data.conversation) {
            const currentUserIdStr = String(currentUserId || '');
            const buyerIdStr = String(data.conversation.buyer_id || '');
            const sellerIdStr = String(data.conversation.seller_id || '');
            
            let otherUserName = null;
            let otherUserProfileImg = null;
            
            if (currentUserIdStr === buyerIdStr) {
              // Current user is buyer, other user is seller
              otherUserName = data.conversation.seller_name || null;
              otherUserProfileImg = data.conversation.seller_profile_image || null;
            } else if (currentUserIdStr === sellerIdStr) {
              // Current user is seller, other user is buyer
              otherUserName = data.conversation.buyer_name || null;
              otherUserProfileImg = data.conversation.buyer_profile_image || null;
            }
            
            // Add other_user_name and other_user_id to conversation object
            data.conversation.other_user_name = otherUserName;
            data.conversation.other_user_id = currentUserIdStr === buyerIdStr 
              ? data.conversation.seller_id 
              : data.conversation.buyer_id;
            
            setOtherUserProfileImage(otherUserProfileImg);
          }
          
          setConversation(data.conversation);
          
          // Get current user's profile image
          try {
            const currentUserProfile = await getUserProfile();
            setCurrentUserProfileImage(currentUserProfile.profile_image || null);
          } catch (err) {
            console.log('Could not fetch current user profile:', err);
          }
          
          // Transform messages to match UI format
          console.log('=== Loading Messages ===');
          console.log('Current User ID (from token):', currentUserId);
          console.log('Current User ID type:', typeof currentUserId);
          
          if (!currentUserId) {
            console.error('ERROR: currentUserId is null or undefined!');
          }
          
          const transformedMessages = data.messages.map(msg => {
            // Convert both to strings for consistent comparison (handle both string and number)
            const msgSenderId = String(msg.sender_id || '');
            const currentUserIdStr = String(currentUserId || '');
            const isMyMessage = msgSenderId === currentUserIdStr;
            
            console.log(`Message ${msg.id}:`, {
              sender_id: msg.sender_id,
              sender_id_type: typeof msg.sender_id,
              sender_id_str: msgSenderId,
              currentUserId: currentUserId,
              currentUserId_str: currentUserIdStr,
              isMyMessage: isMyMessage,
              sender: isMyMessage ? 'me (RIGHT)' : 'other (LEFT)'
            });
            
            return {
              id: msg.id,
              text: msg.message,
              sender: isMyMessage ? 'me' : 'other', // 'me' = right side, 'other' = left side
              timestamp: msg.created_at 
                ? new Date(msg.created_at).toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit',
                    hour12: true 
                  })
                : 'Now',
              sender_name: msg.sender_name,
              sender_profile_image: msg.sender_profile_image || null,
            };
          });
          
          console.log('=== Message Summary ===');
          console.log(`Total messages: ${transformedMessages.length}`);
          console.log(`My messages (RIGHT): ${transformedMessages.filter(m => m.sender === 'me').length}`);
          console.log(`Other messages (LEFT): ${transformedMessages.filter(m => m.sender === 'other').length}`);
          
          setMessages(transformedMessages);

          // Connect to Socket.IO and join conversation room
          try {
            const socket = await getSocket();
            socketRef.current = socket;
            
            socket.emit('join_conversation', { conversationId });
            
            // Listen for new messages
            socket.on('new_message', (newMessage) => {
              const currentUserId = getCurrentUserId();
              // Convert both to strings for consistent comparison
              const msgSenderId = String(newMessage.sender_id || '');
              const currentUserIdStr = String(currentUserId || '');
              const isMyMessage = msgSenderId === currentUserIdStr;
              
              console.log('=== New Message via Socket ===');
              console.log({
                sender_id: newMessage.sender_id,
                sender_id_type: typeof newMessage.sender_id,
                sender_id_str: msgSenderId,
                currentUserId: currentUserId,
                currentUserId_str: currentUserIdStr,
                isMyMessage: isMyMessage,
                sender: isMyMessage ? 'me (RIGHT)' : 'other (LEFT)'
              });
              
              // Check if this message already exists (from optimistic update)
              setMessages(prev => {
                // Remove optimistic message if it exists (temporary ID with 'temp_' prefix)
                const filtered = prev.filter(m => !String(m.id).startsWith('temp_') && m.id !== newMessage.id);
                
                const transformedMessage = {
                  id: newMessage.id,
                  text: newMessage.message,
                  sender: isMyMessage ? 'me' : 'other', // 'me' = right side, 'other' = left side
                  timestamp: newMessage.created_at 
                    ? new Date(newMessage.created_at).toLocaleTimeString('en-US', { 
                        hour: 'numeric', 
                        minute: '2-digit',
                        hour12: true 
                      })
                    : 'Now',
                  sender_name: newMessage.sender_name || null,
                  sender_profile_image: newMessage.sender_profile_image || null,
                };
                
                return [...filtered, transformedMessage];
              });
              
              // Scroll to bottom
              setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
              }, 100);
            });

            socket.on('error_message', (error) => {
              Alert.alert('Error', error.message || 'Failed to send message');
            });
          } catch (socketError) {
            console.error('Socket connection error:', socketError);
            // Continue without Socket.IO - messages will still work via API
          }
        } else if (existingChat && existingChat.conversation_id) {
          // Use existing chat data if provided, but still fetch messages to ensure we have latest
          const existingConvId = existingChat.conversation_id || existingChat.id;
          const data = await getMessages(existingConvId);
          
          // Use existingChat for conversation display, but use fetched data for messages
          setConversation({
            conversation_id: existingConvId,
            listing_title: existingChat.productName || data.conversation?.listing_title,
            listing_price: existingChat.product?.price || data.conversation?.listing_price,
            other_user_name: existingChat.username || data.conversation?.other_user_name || 'User',
            other_user_id: existingChat.otherUserId || data.conversation?.other_user_id,
            listing_id: existingChat.listingId || data.conversation?.listing_id,
          });
          
          // Get current user's profile image
          try {
            const currentUserProfile = await getUserProfile();
            setCurrentUserProfileImage(currentUserProfile.profile_image || null);
          } catch (err) {
            console.log('Could not fetch current user profile:', err);
          }
          
          // Extract other user's profile image from conversation
          const currentUserId = getCurrentUserId();
          if (data.conversation) {
            const currentUserIdStr = String(currentUserId || '');
            const buyerIdStr = String(data.conversation.buyer_id || '');
            const sellerIdStr = String(data.conversation.seller_id || '');
            
            let otherUserName = null;
            let otherUserProfileImg = null;
            
            if (currentUserIdStr === buyerIdStr) {
              // Current user is buyer, other user is seller
              otherUserName = data.conversation.seller_name || null;
              otherUserProfileImg = data.conversation.seller_profile_image || null;
            } else if (currentUserIdStr === sellerIdStr) {
              // Current user is seller, other user is buyer
              otherUserName = data.conversation.buyer_name || null;
              otherUserProfileImg = data.conversation.buyer_profile_image || null;
            }
            
            // Update conversation with correct other_user_name if not already set
            if (otherUserName && !data.conversation.other_user_name) {
              data.conversation.other_user_name = otherUserName;
              setConversation(prev => ({
                ...prev,
                other_user_name: otherUserName || prev.other_user_name,
              }));
            }
            
            setOtherUserProfileImage(otherUserProfileImg || existingChat.otherUserProfileImage || null);
          }
          
          // Transform messages to match UI format
          const currentUserIdForMsgs = getCurrentUserId();
          const transformedMessages = data.messages.map(msg => {
            const msgSenderId = String(msg.sender_id || '');
            const currentUserIdStr = String(currentUserIdForMsgs || '');
            const isMyMessage = msgSenderId === currentUserIdStr;
            
            return {
              id: msg.id,
              text: msg.message,
              sender: isMyMessage ? 'me' : 'other',
              timestamp: msg.created_at 
                ? new Date(msg.created_at).toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit',
                    hour12: true 
                  })
                : 'Now',
              sender_name: msg.sender_name,
              sender_profile_image: msg.sender_profile_image || null,
            };
          });
          
          setMessages(transformedMessages);
          
          // Connect to Socket.IO and join conversation room
          try {
            const socket = await getSocket();
            socketRef.current = socket;
            
            socket.emit('join_conversation', { conversationId: existingConvId });
            
            // Listen for new messages (same logic as above)
            socket.on('new_message', (newMessage) => {
              const currentUserId = getCurrentUserId();
              const msgSenderId = String(newMessage.sender_id || '');
              const currentUserIdStr = String(currentUserId || '');
              const isMyMessage = msgSenderId === currentUserIdStr;
              
              setMessages(prev => {
                const filtered = prev.filter(m => !String(m.id).startsWith('temp_') && m.id !== newMessage.id);
                
                const transformedMessage = {
                  id: newMessage.id,
                  text: newMessage.message,
                  sender: isMyMessage ? 'me' : 'other',
                  timestamp: newMessage.created_at 
                    ? new Date(newMessage.created_at).toLocaleTimeString('en-US', { 
                        hour: 'numeric', 
                        minute: '2-digit',
                        hour12: true 
                      })
                    : 'Now',
                  sender_name: newMessage.sender_name || null,
                  sender_profile_image: newMessage.sender_profile_image || null,
                };
                
                return [...filtered, transformedMessage];
              });
              
              setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
              }, 100);
            });
            
            socket.on('error_message', (error) => {
              Alert.alert('Error', error.message || 'Failed to send message');
            });
          } catch (socketError) {
            console.error('Socket connection error:', socketError);
          }
        }

        setLoading(false);
      } catch (err) {
        console.error('Error initializing chat:', err);
        Alert.alert('Error', err.response?.data?.message || err.message || 'Failed to load conversation');
        setLoading(false);
      }
    };

    initializeChat();

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.off('new_message');
        socketRef.current.off('error_message');
        if (conversationId) {
          socketRef.current.emit('leave_conversation', { conversationId });
        }
      }
    };
  }, [conversationId, accessToken]);

  // Handle keyboard show/hide to scroll to bottom
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        // Scroll to bottom when keyboard opens
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        // Optional: scroll to bottom when keyboard closes
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const handleSend = async () => {
    if (message.trim().length === 0 || sending) return;

    const messageText = message.trim();
    setMessage('');
    setSending(true);

    try {
      const currentUserId = getCurrentUserId();
      let currentConversationId = conversationId;

      // If this is a new conversation, create it first
      if (!currentConversationId && listingInfo) {
        const newConversation = await findOrCreateConversation(
          listingInfo.sellerId,
          listingInfo.listingId
        );
        currentConversationId = newConversation.conversation_id;
        setConversation(prev => ({
          ...prev,
          conversation_id: currentConversationId,
        }));

        // Connect to Socket.IO and join the new conversation room
        try {
          const socket = await getSocket();
          socketRef.current = socket;
          
          socket.emit('join_conversation', { conversationId: currentConversationId });
          
          // Listen for new messages
          socket.on('new_message', (newMessage) => {
            const currentUserId = getCurrentUserId();
            // Convert both to strings for consistent comparison
            const msgSenderId = String(newMessage.sender_id || '');
            const currentUserIdStr = String(currentUserId || '');
            const isMyMessage = msgSenderId === currentUserIdStr;
            
            console.log('=== New Message via Socket (new conv) ===');
            console.log({
              sender_id: newMessage.sender_id,
              sender_id_type: typeof newMessage.sender_id,
              sender_id_str: msgSenderId,
              currentUserId: currentUserId,
              currentUserId_str: currentUserIdStr,
              isMyMessage: isMyMessage,
              sender: isMyMessage ? 'me (RIGHT)' : 'other (LEFT)'
            });
            
            // Check if this message already exists (from optimistic update)
            setMessages(prev => {
              // Remove optimistic message if it exists (temporary ID with 'temp_' prefix)
              const filtered = prev.filter(m => !String(m.id).startsWith('temp_') && m.id !== newMessage.id);
              
              const transformedMessage = {
                id: newMessage.id,
                text: newMessage.message,
                sender: isMyMessage ? 'me' : 'other', // 'me' = right side, 'other' = left side
                timestamp: newMessage.created_at 
                  ? new Date(newMessage.created_at).toLocaleTimeString('en-US', { 
                      hour: 'numeric', 
                      minute: '2-digit',
                      hour12: true 
                    })
                  : 'Now',
                sender_name: newMessage.sender_name || null,
                sender_profile_image: newMessage.sender_profile_image || (isMyMessage ? currentUserProfileImage : otherUserProfileImage) || null,
              };
              
              return [...filtered, transformedMessage];
            });
            
            setTimeout(() => {
              scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
          });

          socket.on('error_message', (error) => {
            Alert.alert('Error', error.message || 'Failed to send message');
          });
        } catch (socketError) {
          console.error('Socket connection error:', socketError);
        }
      }

      // Send message via Socket.IO
      if (socketRef.current && currentConversationId) {
        socketRef.current.emit('send_message', {
          conversationId: currentConversationId,
          message: messageText,
        });

        // Optimistically add message to UI
        const tempId = `temp_${Date.now()}`; // Use a unique temporary ID with prefix
        const optimisticMessage = {
          id: tempId, // Temporary ID with prefix
          text: messageText,
          sender: 'me', // Always 'me' for sent messages
          timestamp: new Date().toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
          }),
          sender_profile_image: currentUserProfileImage || null,
        };
        
        setMessages(prev => [...prev, optimisticMessage]);
        
        // Scroll to bottom
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      } else {
        Alert.alert('Error', 'Unable to send message. Please try again.');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      Alert.alert('Error', err.response?.data?.message || err.message || 'Failed to send message');
      // Restore message on error
      setMessage(messageText);
    } finally {
      setSending(false);
    }
  };

  // Navigate to user profile
  const handleViewProfile = () => {
    if (conversation?.other_user_id) {
      navigation.navigate('UserProfile', {
        userId: conversation.other_user_id,
        user: {
          id: conversation.other_user_id,
          username: conversation.other_user_name,
        }
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.topBar}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <View style={styles.topBarCenter}>
            <Text style={styles.username}>Loading...</Text>
          </View>
          <View style={styles.profileButton} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#FF6B35" />
        </View>
      </View>
    );
  }

  if (!conversation) {
    return (
      <View style={styles.container}>
        <View style={styles.topBar}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <View style={styles.topBarCenter}>
            <Text style={styles.username}>Error</Text>
          </View>
          <View style={styles.profileButton} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ color: '#FF6B35', textAlign: 'center' }}>
            Conversation not found
          </Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
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
            {conversation.other_user_name || 'User'}
          </Text>
          <View style={styles.productInfoTop}>
            <View style={styles.productThumbnailTop}>
              <Ionicons name="golf" size={20} color="#666" />
            </View>
            <View style={styles.productTextContainer}>
              <Text style={styles.productNameTop} numberOfLines={1}>
                {conversation.listing_title || 'Product'}
              </Text>
              <Text style={styles.productPriceTop}>
                {conversation.listing_price || '₱0'}
              </Text>
            </View>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={handleViewProfile}
          activeOpacity={0.7}
        >
          <Ionicons name="person-outline" size={22} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Chat Messages */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        onContentSizeChange={() => {
          // Scroll to bottom when content size changes
          setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }, 50);
        }}
        onLayout={() => {
          // Scroll to bottom on layout
          setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: false });
          }, 100);
        }}
      >
        {messages.length > 0 ? (
          messages.map((msg) => {
            // 'me' = current logged-in user's messages = RIGHT side
            // 'other' = other user's messages = LEFT side
            const isMyMessage = msg.sender === 'me';
            
            // Debug log for rendering
            if (msg.id === messages[messages.length - 1]?.id) {
              console.log('Rendering message:', {
                id: msg.id,
                sender: msg.sender,
                isMyMessage: isMyMessage,
                side: isMyMessage ? 'RIGHT' : 'LEFT',
                text: msg.text.substring(0, 20) + '...'
              });
            }
            
            return (
              <View
                key={msg.id}
                style={[
                  styles.messageWrapper,
                  isMyMessage ? styles.messageWrapperRight : styles.messageWrapperLeft
                ]}
              >
                {/* Left side: Other user's messages - Avatar first, then bubble */}
                {!isMyMessage && (
                  <View style={styles.avatar}>
                    {(msg.sender_profile_image || otherUserProfileImage) ? (
                      <Image 
                        source={{ uri: msg.sender_profile_image || otherUserProfileImage }}
                        style={styles.avatarImage}
                      />
                    ) : (
                      <Ionicons name="person" size={16} color="#666" />
                    )}
                  </View>
                )}
                
                {/* Message bubble container */}
                <View style={[
                  styles.messageBubbleContainer,
                  isMyMessage ? styles.messageBubbleContainerRight : styles.messageBubbleContainerLeft
                ]}>
                  <Text style={[
                    styles.messageTimestamp,
                    isMyMessage ? styles.messageTimestampRight : styles.messageTimestampLeft
                  ]}>
                    {msg.timestamp}
                  </Text>
                  <View style={[
                    styles.messageBubble,
                    isMyMessage ? styles.messageBubbleMe : styles.messageBubbleOther
                  ]}>
                    <Text style={styles.messageText}>{msg.text}</Text>
                  </View>
                </View>
                
                {/* Right side: My messages - Bubble first, then avatar */}
                {isMyMessage && (
                  <View style={styles.avatar}>
                    {(msg.sender_profile_image || currentUserProfileImage) ? (
                      <Image 
                        source={{ uri: msg.sender_profile_image || currentUserProfileImage }}
                        style={styles.avatarImage}
                      />
                    ) : (
                      <Ionicons name="person" size={16} color="#666" />
                    )}
                  </View>
                )}
              </View>
            );
          })
        ) : (
          <View style={{ padding: 20, alignItems: 'center', marginTop: 40 }}>
            <Ionicons name="chatbubbles-outline" size={48} color="#999" />
            <Text style={{ color: '#999', marginTop: 12, fontSize: 16, textAlign: 'center' }}>
              {isNewConversation 
                ? 'Start the conversation by sending a message'
                : 'No messages yet'}
            </Text>
          </View>
        )}
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
          onChangeText={(text) => {
            setMessage(text);
            // Scroll to bottom when typing
            setTimeout(() => {
              scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
          }}
          multiline
          maxLength={500}
          onFocus={() => {
            // Scroll to bottom when input is focused
            setTimeout(() => {
              scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 300);
          }}
        />
        <TouchableOpacity 
          style={styles.sendButton}
          onPress={handleSend}
          activeOpacity={0.7}
          disabled={message.trim().length === 0 || sending}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <Ionicons 
              name="send" 
              size={20} 
              color={message.trim().length > 0 ? "#000" : "#999"} 
            />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

