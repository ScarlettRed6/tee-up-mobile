import React, { useState, useRef, useEffect, useContext, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, Keyboard, Image, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from './styles/ChatDetailScreen.styles';
import { getMessages, findOrCreateConversation, uploadChatImage } from '../api/chatApi';
import { getSocket, disconnectSocket } from '../utils/socketClient';
import { authContext } from '../context/authContext';
import { ThemeContext } from '../context/themeContext';
import { getUserProfile } from '../api/userApi';
import jwtDecode from 'jwt-decode';
import { rateUser } from '../api/ratingApi';
import * as ImagePicker from 'expo-image-picker';

const MIN_MESSAGES_FOR_RATING = 6;

export default function ChatDetailScreen({ navigation, route }) {
  const { accessToken } = useContext(authContext);
  const { theme } = useContext(ThemeContext);
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
  const [showRatingPrompt, setShowRatingPrompt] = useState(false);
  const [ratingValue, setRatingValue] = useState(0);
  const [ratingReview, setRatingReview] = useState('');
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState(null);
  const [lastRatingPromptCount, setLastRatingPromptCount] = useState(0);
  const [hasRatedUser, setHasRatedUser] = useState(false);

  // Get route params
  const conversationId = route?.params?.conversationId;
  const existingChat = route?.params?.chat;
  const listingInfo = route?.params?.listingInfo;
  const isNewConversation = route?.params?.isNewConversation || false;

  const ratingThreshold = MIN_MESSAGES_FOR_RATING;

  const conversationIdentifier = useMemo(() => {
    if (conversation?.conversation_id) return conversation.conversation_id;
    if (conversationId) return conversationId;
    if (conversation?.listing_id && conversation?.other_user_id) {
      return `${conversation.other_user_id}-${conversation.listing_id}`;
    }
    return null;
  }, [conversation?.conversation_id, conversation?.listing_id, conversation?.other_user_id, conversationId]);

  const resolvedOtherUserId = useMemo(() => {
    if (conversation?.other_user_id) {
      return conversation.other_user_id;
    }
    const currentUserId = currentUserIdRef.current;
    if (!conversation || !currentUserId) return null;
    const currentUserIdStr = String(currentUserId);
    const buyerIdStr = String(conversation.buyer_id || '');
    const sellerIdStr = String(conversation.seller_id || '');
    if (currentUserIdStr === buyerIdStr) {
      return conversation.seller_id;
    }
    if (currentUserIdStr === sellerIdStr) {
      return conversation.buyer_id;
    }
    return null;
  }, [conversation]);

  const scrollToBottom = useCallback((delay = 100) => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, delay);
  }, []);

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

  const handleIncomingSocketMessage = useCallback((newMessage) => {
    const currentUserId = getCurrentUserId();
    const msgSenderId = String(newMessage.sender_id || '');
    const currentUserIdStr = String(currentUserId || '');
    const isMyMessage = msgSenderId === currentUserIdStr;

    setMessages(prev => {
      const filtered = prev.filter(m => !String(m.id).startsWith('temp_') && m.id !== newMessage.id);

      const transformedMessage = {
        id: newMessage.id,
        text: newMessage.message || '',
        imageUrl: newMessage.image_url || null,
        sender: isMyMessage ? 'me' : 'other',
        timestamp: newMessage.created_at
          ? new Date(newMessage.created_at).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            })
          : 'Now',
        sender_name: newMessage.sender_name || null,
        sender_profile_image:
          newMessage.sender_profile_image ||
          (isMyMessage ? currentUserProfileImage : otherUserProfileImage) ||
          null,
      };

      return [...filtered, transformedMessage];
    });

    scrollToBottom();
  }, [currentUserProfileImage, otherUserProfileImage, scrollToBottom]);

  const attachSocketListeners = useCallback((socketInstance) => {
    if (!socketInstance) return;
    socketInstance.off('new_message');
    socketInstance.off('error_message');
    socketInstance.on('new_message', handleIncomingSocketMessage);
    socketInstance.on('error_message', (error) => {
      Alert.alert('Error', error.message || 'Failed to send message');
    });
  }, [handleIncomingSocketMessage]);

  const joinConversationRoom = useCallback(async (conversationIdToJoin) => {
    if (!conversationIdToJoin) return null;
    try {
      if (!socketRef.current) {
        const socket = await getSocket();
        socketRef.current = socket;
        attachSocketListeners(socket);
      } else {
        attachSocketListeners(socketRef.current);
      }

      socketRef.current.emit('join_conversation', { conversationId: conversationIdToJoin });
      return socketRef.current;
    } catch (socketError) {
      console.error('Socket connection error:', socketError);
      return null;
    }
  }, [attachSocketListeners]);

  useEffect(() => {
    setLastRatingPromptCount(0);
    setShowRatingPrompt(false);
    setHasRatedUser(false); // Reset when conversation changes
  }, [conversationIdentifier]);

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
            listing_image: listingInfo.listingImage || null, // Add listing image if provided
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
            
            // Parse listing_photos to get first image
            let listingPhoto = null;
            if (data.conversation.listing_photos) {
              try {
                let photos = data.conversation.listing_photos;
                // Handle different formats: array, JSON string, or single value
                if (typeof photos === 'string') {
                  try {
                    photos = JSON.parse(photos);
                  } catch (e) {
                    // If parsing fails, treat as single URL
                    photos = [photos];
                  }
                }
                if (Array.isArray(photos) && photos.length > 0) {
                  listingPhoto = photos[0];
                } else if (photos && typeof photos === 'string') {
                  listingPhoto = photos;
                }
              } catch (e) {
                console.error('Error parsing listing_photos:', e);
              }
            }
            data.conversation.listing_image = listingPhoto;
            
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
              text: msg.message || '',
              imageUrl: msg.image_url || null,
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

          await joinConversationRoom(conversationId);
        } else if (existingChat && existingChat.conversation_id) {
          // Use existing chat data if provided, but still fetch messages to ensure we have latest
          const existingConvId = existingChat.conversation_id || existingChat.id;
          const data = await getMessages(existingConvId);
          
          // Parse listing_photos from fetched conversation data
          let listingPhotoFromData = null;
          if (data.conversation?.listing_photos) {
            try {
              let photos = data.conversation.listing_photos;
              if (typeof photos === 'string') {
                try {
                  photos = JSON.parse(photos);
                } catch (e) {
                  photos = [photos];
                }
              }
              if (Array.isArray(photos) && photos.length > 0) {
                listingPhotoFromData = photos[0];
              } else if (photos && typeof photos === 'string') {
                listingPhotoFromData = photos;
              }
            } catch (e) {
              console.error('Error parsing listing_photos:', e);
            }
          }
          
          // Use existingChat for conversation display, but use fetched data for messages
          setConversation({
            conversation_id: existingConvId,
            listing_title: existingChat.productName || data.conversation?.listing_title,
            listing_price: existingChat.product?.price || data.conversation?.listing_price,
            listing_image: existingChat.product?.image || listingPhotoFromData || null,
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
            
            // Parse listing_photos to get first image if not already set
            let listingPhoto = existingChat.product?.image || null;
            if (!listingPhoto && data.conversation.listing_photos) {
              try {
                let photos = data.conversation.listing_photos;
                if (typeof photos === 'string') {
                  try {
                    photos = JSON.parse(photos);
                  } catch (e) {
                    photos = [photos];
                  }
                }
                if (Array.isArray(photos) && photos.length > 0) {
                  listingPhoto = photos[0];
                } else if (photos && typeof photos === 'string') {
                  listingPhoto = photos;
                }
              } catch (e) {
                console.error('Error parsing listing_photos:', e);
              }
            }
            data.conversation.listing_image = listingPhoto;
            
            setOtherUserProfileImage(otherUserProfileImg || existingChat.otherUserProfileImage || null);
            
            // Update conversation with listing image
            setConversation(prev => ({
              ...prev,
              listing_image: listingPhoto || prev.listing_image,
            }));
          }
          
          // Transform messages to match UI format
          const currentUserIdForMsgs = getCurrentUserId();
          const transformedMessages = data.messages.map(msg => {
            const msgSenderId = String(msg.sender_id || '');
            const currentUserIdStr = String(currentUserIdForMsgs || '');
            const isMyMessage = msgSenderId === currentUserIdStr;
            
            return {
              id: msg.id,
              text: msg.message || '',
              imageUrl: msg.image_url || null,
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
          
          await joinConversationRoom(existingConvId);
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
        scrollToBottom();
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        // Optional: scroll to bottom when keyboard closes
        scrollToBottom();
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [scrollToBottom]);

  useEffect(() => {
    if (!resolvedOtherUserId || !conversationIdentifier || hasRatedUser) {
      setShowRatingPrompt(false);
      return;
    }
    const totalMessages = messages.length;
    if (!showRatingPrompt && totalMessages - lastRatingPromptCount >= ratingThreshold) {
      setShowRatingPrompt(true);
    }
  }, [messages.length, resolvedOtherUserId, conversationIdentifier, ratingThreshold, lastRatingPromptCount, showRatingPrompt, hasRatedUser]);

  const handleSubmitRating = async () => {
    if (!resolvedOtherUserId) return;
    if (ratingValue < 1) {
      Alert.alert('Select rating', 'Please choose a star rating before submitting.');
      return;
    }

    setRatingSubmitting(true);
    try {
      await rateUser(resolvedOtherUserId, {
        rating: ratingValue,
        review: ratingReview.trim() || undefined,
      });

      // Mark as rated and hide the prompt permanently
      setHasRatedUser(true);
      setLastRatingPromptCount(messages.length);
      setShowRatingPrompt(false);
      setRatingReview('');
      setRatingValue(0);
      Alert.alert('Thank you!', 'Your rating has been submitted.');
    } catch (error) {
      const message = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to submit rating.';
      Alert.alert('Error', message);
    } finally {
      setRatingSubmitting(false);
    }
  };

  const ensureConversationReady = useCallback(async () => {
    let currentConversationId = conversation?.conversation_id || conversationId;

    if (!currentConversationId) {
      if (!listingInfo || !isNewConversation) {
        Alert.alert('Error', 'Unable to start this conversation. Please reopen the chat.');
        return null;
      }

      const newConversation = await findOrCreateConversation(
        listingInfo.sellerId,
        listingInfo.listingId
      );
      currentConversationId = newConversation.conversation_id;
      setConversation(prev => ({
        ...prev,
        conversation_id: currentConversationId,
      }));
    }

    await joinConversationRoom(currentConversationId);
    return currentConversationId;
  }, [conversation?.conversation_id, conversationId, listingInfo, isNewConversation, joinConversationRoom]);

  const sendMessagePayload = useCallback(async ({ text = '', imageUrl = null }) => {
    const trimmedText = (text || '').trim();
    const hasContent = trimmedText.length > 0 || !!imageUrl;
    if (!hasContent || sending) return;

    setSending(true);

    try {
      const currentConversationId = await ensureConversationReady();

      if (!currentConversationId || !socketRef.current) {
        Alert.alert('Error', 'Unable to send message. Please try again.');
        return;
      }

      socketRef.current.emit('send_message', {
        conversationId: currentConversationId,
        message: trimmedText || null,
        image_url: imageUrl || null,
      });

      const tempId = `temp_${Date.now()}`;
      const optimisticMessage = {
        id: tempId,
        text: trimmedText,
        imageUrl: imageUrl || null,
        sender: 'me',
        timestamp: new Date().toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        }),
        sender_profile_image: currentUserProfileImage || null,
      };

      setMessages(prev => [...prev, optimisticMessage]);
      scrollToBottom();
    } catch (err) {
      console.error('Error sending message:', err);
      Alert.alert('Error', err.response?.data?.message || err.message || 'Failed to send message');
      throw err;
    } finally {
      setSending(false);
    }
  }, [ensureConversationReady, sending, currentUserProfileImage, scrollToBottom]);

  const handleSend = async () => {
    const messageText = message.trim();
    if (messageText.length === 0) return;

    setMessage('');
    try {
      await sendMessagePayload({ text: messageText });
    } catch {
      setMessage(messageText);
    }
  };

  const buildImageFormData = (asset) => {
    const uri = asset?.uri;
    if (!uri) {
      throw new Error('Invalid image selected.');
    }

    const fileName = asset.fileName || `chat-${Date.now()}.jpg`;
    const mimeType = asset.mimeType || 'image/jpeg';

    const formData = new FormData();
    formData.append('image', {
      uri,
      name: fileName,
      type: mimeType,
    });

    return formData;
  };

  const handleImageSelectionResult = async (result) => {
    if (!result || result.canceled || !result.assets?.length) return;

    try {
      setUploadingImage(true);
      const asset = result.assets[0];
      const formData = buildImageFormData(asset);
      const uploadResult = await uploadChatImage(formData);
      const uploadedUrl = uploadResult?.image_url;

      if (!uploadedUrl) {
        throw new Error('Failed to upload image.');
      }

      await sendMessagePayload({ imageUrl: uploadedUrl });
    } catch (error) {
      console.error('Image upload error:', error);
      Alert.alert('Error', error.response?.data?.message || error.message || 'Failed to send image.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handlePickImage = async () => {
    if (uploadingImage) return;
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow photo library access to send images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    await handleImageSelectionResult(result);
  };

  const handleTakePhoto = async () => {
    if (uploadingImage) return;
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow camera access to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    await handleImageSelectionResult(result);
  };

  // Navigate to user profile
  const handleViewProfile = () => {
    if (resolvedOtherUserId) {
      navigation.navigate('UserProfile', {
        userId: resolvedOtherUserId,
        user: {
          id: resolvedOtherUserId,
          username: conversation.other_user_name,
        }
      });
    }
  };

  const renderRatingPrompt = () => {
    if (!showRatingPrompt || !resolvedOtherUserId || hasRatedUser) return null;
    const otherName = conversation?.other_user_name || 'this user';

    return (
      <View style={styles.ratingCard}>
        <Text style={styles.ratingTitle}>Rate your meetup with {otherName}</Text>
        <Text style={styles.ratingSubtitle}>Share how the transaction went so others know what to expect.</Text>
        <View style={styles.ratingStars}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity
              key={star}
              style={styles.ratingStarButton}
              onPress={() => setRatingValue(star)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={star <= ratingValue ? 'star' : 'star-outline'}
                size={28}
                color="#FFB703"
              />
            </TouchableOpacity>
          ))}
        </View>
        <TextInput
          style={styles.ratingReviewInput}
          placeholder="Add a short review (optional)"
          placeholderTextColor="#9CA3AF"
          multiline
          value={ratingReview}
          onChangeText={setRatingReview}
          maxLength={250}
        />
        <TouchableOpacity
          style={[styles.ratingSubmitButton, (ratingSubmitting || ratingValue < 1) && styles.ratingSubmitButtonDisabled]}
          onPress={handleSubmitRating}
          disabled={ratingSubmitting || ratingValue < 1}
        >
          {ratingSubmitting ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.ratingSubmitButtonText}>Submit rating</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const openImagePreview = useCallback((uri) => {
    if (uri) {
      setPreviewImageUrl(uri);
    }
  }, []);

  const closeImagePreview = useCallback(() => {
    setPreviewImageUrl(null);
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.topBar}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <View style={styles.topBarCenter}>
            <Text style={[styles.username, { color: theme.text }]}>Loading...</Text>
          </View>
          <View style={styles.profileButton} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </View>
    );
  }

  if (!conversation) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.topBar, { backgroundColor: theme.card }]}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <View style={styles.topBarCenter}>
            <Text style={[styles.username, { color: theme.text }]}>Error</Text>
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

  const dynamicStyles = {
    container: { backgroundColor: theme.background },
    topBar: { backgroundColor: theme.card },
    username: { color: theme.text },
    productNameTop: { color: theme.text },
    productPriceTop: { color: theme.primary },
    messagesContainer: { backgroundColor: theme.background },
    messageBubbleMe: { backgroundColor: theme.primary },
    messageBubbleOther: { backgroundColor: theme.card },
    messageText: { color: theme.mode === 'dark' ? '#FFF' : '#000' },
    messageTimestamp: { color: theme.textMuted },
    inputBar: { backgroundColor: theme.card },
    input: { 
      backgroundColor: theme.mode === 'dark' ? '#333333' : '#F9FAFB',
      color: theme.text,
    },
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, dynamicStyles.container]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      {/* Top Bar */}
      <View style={[styles.topBar, dynamicStyles.topBar]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <View style={styles.topBarCenter}>
          <Text style={[styles.username, dynamicStyles.username]} numberOfLines={1}>
            {conversation.other_user_name || 'User'}
          </Text>
          <View style={styles.productInfoTop}>
            {conversation.listing_image ? (
              <Image 
                source={{ uri: conversation.listing_image }}
                style={styles.productThumbnailTop}
                resizeMode="cover"
                onError={(e) => {
                  console.error('Listing image load error:', e.nativeEvent.error, conversation.listing_image);
                }}
              />
            ) : (
              <View style={styles.productThumbnailTop}>
                <Ionicons name="golf" size={20} color={theme.textMuted} />
              </View>
            )}
            <View style={styles.productTextContainer}>
              <Text style={[styles.productNameTop, dynamicStyles.productNameTop]} numberOfLines={1}>
                {conversation.listing_title || 'Product'}
              </Text>
              <Text style={[styles.productPriceTop, dynamicStyles.productPriceTop]}>
                {typeof conversation.listing_price === 'number' 
                  ? `₱${conversation.listing_price.toLocaleString()}` 
                  : conversation.listing_price || '₱0'}
              </Text>
            </View>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => {
            const otherUserId = resolvedOtherUserId;
            if (otherUserId) {
              navigation.navigate('Report', {
                reportType: 'user',
                userId: otherUserId,
                userName: conversation?.other_user_name || conversation?.seller_name || conversation?.buyer_name || 'User'
              });
            }
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="flag-outline" size={22} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* Chat Messages */}
      <ScrollView 
        ref={scrollViewRef}
        style={[styles.messagesContainer, dynamicStyles.messagesContainer]}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        onContentSizeChange={() => {
          // Scroll to bottom when content size changes
          scrollToBottom(50);
        }}
        onLayout={() => {
          // Scroll to bottom on layout
          scrollToBottom(100);
        }}
      >
        {messages.length > 0 ? (
          messages.map((msg) => {
            // 'me' = current logged-in user's messages = RIGHT side
            // 'other' = other user's messages = LEFT side
            const isMyMessage = msg.sender === 'me';
            const hasImage = Boolean(msg.imageUrl);
            const hasText = Boolean(msg.text);
            
            // Debug log for rendering
            if (msg.id === messages[messages.length - 1]?.id) {
              console.log('Rendering message:', {
                id: msg.id,
                sender: msg.sender,
                isMyMessage: isMyMessage,
                side: isMyMessage ? 'RIGHT' : 'LEFT',
                text: hasText ? `${msg.text.substring(0, 20)}...` : (hasImage ? '[image]' : '[empty]'),
              });
            }
            
            const BubbleComponent = hasImage ? TouchableOpacity : View;

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
                      <Ionicons name="person" size={16} color={theme.textMuted} />
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
                    dynamicStyles.messageTimestamp,
                    isMyMessage ? styles.messageTimestampRight : styles.messageTimestampLeft
                  ]}>
                    {msg.timestamp}
                  </Text>
                  <BubbleComponent
                    activeOpacity={0.9}
                    onPress={hasImage ? () => openImagePreview(msg.imageUrl) : undefined}
                    style={[
                    styles.messageBubble,
                    isMyMessage ? [styles.messageBubbleMe, dynamicStyles.messageBubbleMe] : [styles.messageBubbleOther, dynamicStyles.messageBubbleOther]
                  ]}
                  >
                    {hasImage && (
                      <Image 
                        source={{ uri: msg.imageUrl }}
                        style={[styles.messageImage, hasText && styles.messageImageWithText]}
                        resizeMode="cover"
                      />
                    )}
                    {hasText && (
                      <Text style={[styles.messageText, dynamicStyles.messageText]}>{msg.text}</Text>
                    )}
                  </BubbleComponent>
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
                      <Ionicons name="person" size={16} color={theme.textMuted} />
                    )}
                  </View>
                )}
              </View>
            );
          })
        ) : (
          <View style={{ padding: 20, alignItems: 'center', marginTop: 40 }}>
            <Ionicons name="chatbubbles-outline" size={48} color={theme.textMuted} />
            <Text style={{ color: theme.textMuted, marginTop: 12, fontSize: 16, textAlign: 'center' }}>
              {isNewConversation 
                ? 'Start the conversation by sending a message'
                : 'No messages yet'}
            </Text>
          </View>
        )}
        {renderRatingPrompt()}
      </ScrollView>

      {/* Message Input Bar */}
      <View style={[styles.inputBar, dynamicStyles.inputBar]}>
        <TouchableOpacity 
          style={[
            styles.inputIcon,
            (uploadingImage) && styles.inputIconDisabled
          ]}
          activeOpacity={0.7}
          onPress={handlePickImage}
          disabled={uploadingImage}
        >
          {uploadingImage ? (
            <ActivityIndicator size="small" color={theme.text} />
          ) : (
            <Ionicons name="images-outline" size={22} color={theme.text} />
          )}
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.inputIcon,
            (uploadingImage) && styles.inputIconDisabled
          ]}
          activeOpacity={0.7}
          onPress={handleTakePhoto}
          disabled={uploadingImage}
        >
          <Ionicons name="camera-outline" size={22} color={theme.text} />
        </TouchableOpacity>
        <TextInput
          style={[styles.textInput, dynamicStyles.input]}
          placeholder="Type Your Message"
          placeholderTextColor={theme.textMuted}
          value={message}
          onChangeText={(text) => {
            setMessage(text);
            // Scroll to bottom when typing
            scrollToBottom();
          }}
          multiline
          maxLength={500}
          onFocus={() => {
            // Scroll to bottom when input is focused
            scrollToBottom(300);
          }}
        />
        <TouchableOpacity 
          style={styles.sendButton}
          onPress={handleSend}
          activeOpacity={0.7}
          disabled={message.trim().length === 0 || sending}
        >
          {sending ? (
            <ActivityIndicator size="small" color={theme.text} />
          ) : (
            <Ionicons 
              name="send" 
              size={20} 
              color={message.trim().length > 0 ? theme.text : theme.textMuted} 
            />
          )}
        </TouchableOpacity>
      </View>

      <Modal
        visible={!!previewImageUrl}
        transparent
        animationType="fade"
        onRequestClose={closeImagePreview}
      >
        <View style={styles.previewOverlay}>
          <TouchableOpacity
            style={styles.previewBackdrop}
            activeOpacity={1}
            onPress={closeImagePreview}
          />
          <View style={styles.previewContent}>
            <Image
              source={{ uri: previewImageUrl || undefined }}
              style={styles.previewImage}
              resizeMode="contain"
            />
            <TouchableOpacity
              style={styles.previewCloseButton}
              onPress={closeImagePreview}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

