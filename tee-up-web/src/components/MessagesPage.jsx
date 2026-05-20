import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { ChevronLeft, Star, Send, X } from 'lucide-react';
import MessagesThreadToolbar from './MessagesThreadToolbar';
import UserHeader from './UserHeader';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { cn } from '@/lib/utils';
import { getConversations, getMessages, findOrCreateConversation } from '../api/chatApi';
import { getSocket } from '../utils/socketClient';
import { formatChatSnippet } from '../utils/chatOffers';
import { resolveMediaUrl } from '../utils/mediaUrl';
import { rateUser, fetchUserRatings } from '../api/ratingsApi';
import { getExchangeHint, hasMinimumExchange } from '../utils/chatExchange';
import './MessagesPage.css';

/** Match login/signup text field padding */
const alignedAuthInputPad = { paddingInline: '1rem', paddingBlock: '0.875rem' };
const alignedInputClassName =
  'min-h-[52px] text-[17px] leading-normal transition-all duration-200 hover:border-[var(--color-primary)]/50';

function ratingDismissStorageKey(currentUserId, otherUserId) {
  return `teeup-rating-dismissed:${currentUserId}:${otherUserId}`;
}

function writeRatingDismissed(currentUserId, otherUserId, dismissed) {
  if (!currentUserId || !otherUserId) return;
  try {
    const key = ratingDismissStorageKey(currentUserId, otherUserId);
    if (dismissed) sessionStorage.setItem(key, '1');
    else sessionStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

function normalizeConversation(conv) {
  let listingPhotos = [];
  if (conv.listing_photos) {
    if (typeof conv.listing_photos === 'string') {
      try {
        listingPhotos = JSON.parse(conv.listing_photos);
      } catch {
        listingPhotos = [conv.listing_photos];
      }
    } else if (Array.isArray(conv.listing_photos)) {
      listingPhotos = conv.listing_photos;
    }
  }

  return {
    id: conv.conversation_id,
    conversation_id: conv.conversation_id,
    productName: conv.listing_title || 'Product',
    listingId: conv.listing_id,
    price: conv.listing_price,
    image: listingPhotos[0] || null,
    username: conv.other_user_name || 'User',
    otherUserId: conv.other_user_id,
    otherUserProfileImage: conv.other_user_profile_image || null,
    lastMessage: conv.last_message || '',
    lastMessageTime: conv.last_message_time || conv.created_at,
  };
}

function normalizeMessage(row, currentUserId) {
  const senderId = String(row.sender_id ?? '');
  const meId = String(currentUserId ?? '');
  const isMe = senderId === meId;
  return {
    id: row.id,
    text: row.message || '',
    imageUrl: row.image_url || null,
    sender: isMe ? 'me' : 'other',
    timestamp: row.created_at,
    senderName: row.sender_name,
    senderAvatar:
      row.sender_profile_image ||
      row.senderProfileImage ||
      null,
  };
}

export default function MessagesPage({
  user,
  onSearch,
  onSell,
  onMessages,
  onMyListings,
  onNotifications,
  onViewAllNotifications,
  onNotificationClick,
  onOpenProfile,
  onLogout,
  onGoHome,
  listingContext,
  onViewListing,
  initialConversationId,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [conversations, setConversations] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [selectedConversationId, setSelectedConversationId] = useState(initialConversationId ?? null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const [ratingValue, setRatingValue] = useState(0);
  const [ratingReview, setRatingReview] = useState('');
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [hasRatedUser, setHasRatedUser] = useState(false);
  const [existingRating, setExistingRating] = useState(null);
  const [ratingFormOpen, setRatingFormOpen] = useState(false);
  const [ratingsLoading, setRatingsLoading] = useState(false);
  const socketRef = useRef(null);

  const currentUserId = user?.id;

  const loadConversations = useCallback(async () => {
    setLoadingConversations(true);
    try {
      const data = await getConversations();
      const rawConvs = data?.conversations ?? [];
      setConversations(rawConvs.map(normalizeConversation));
    } catch (err) {
      console.error('Failed to load conversations', err);
      setConversations([]);
    } finally {
      setLoadingConversations(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (initialConversationId) {
      setSelectedConversationId(initialConversationId);
    }
  }, [initialConversationId]);

  useEffect(() => {
    try {
      const socket = getSocket();
      socketRef.current = socket;

      socket.off('new_message');
      socket.off('error_message');
      socket.on('new_message', (payload) => {
        const convId = payload?.conversation_id;
        if (!convId) return;
        loadConversations();
        if (String(convId) !== String(selectedConversationId)) return;
        const normalizedIncoming = normalizeMessage(payload, currentUserId);
        setMessages((prev) => {
          const withoutTemps = prev.filter((m) => !String(m.id).startsWith('temp_'));
          const alreadyExists = withoutTemps.some(
            (m) => String(m.id) === String(normalizedIncoming.id)
          );
          if (alreadyExists) return withoutTemps;
          return [...withoutTemps, normalizedIncoming];
        });
      });
      socket.on('error_message', (payload) => {
        setSendError(payload?.message || 'Message not sent.');
        setMessages((prev) => prev.filter((m) => !String(m.id).startsWith('temp_')));
      });
    } catch (err) {
      console.error('Failed to init websocket for messages page', err);
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.off('new_message');
        socketRef.current.off('error_message');
      }
    };
  }, [currentUserId, selectedConversationId, loadConversations]);

  useEffect(() => {
    if (!selectedConversationId || !socketRef.current) return;
    socketRef.current.emit('join_conversation', { conversationId: selectedConversationId });
  }, [selectedConversationId]);

  useEffect(() => {
    if (!listingContext?.sellerId || !listingContext?.listingId) return;
    const existingConversation = conversations.find(
      (conv) =>
        String(conv.otherUserId) === String(listingContext.sellerId) &&
        String(conv.listingId) === String(listingContext.listingId)
    );
    if (existingConversation) {
      setSelectedConversationId(existingConversation.conversation_id);
    } else {
      setSelectedConversationId(null);
      setMessages([]);
    }
  }, [listingContext, conversations]);

  const loadMessages = useCallback(
    async (conversationId) => {
      if (!conversationId) return;
      setLoadingMessages(true);
      try {
        const data = await getMessages(conversationId);
        const rawMessages = data?.messages ?? [];
        setMessages(rawMessages.map((m) => normalizeMessage(m, currentUserId)));
      } catch (err) {
        console.error('Failed to load messages', err);
        setMessages([]);
      } finally {
        setLoadingMessages(false);
      }
    },
    [currentUserId]
  );

  useEffect(() => {
    if (!selectedConversationId) return;
    loadMessages(selectedConversationId);
  }, [selectedConversationId, loadMessages]);

  const filteredConversations = conversations.filter((c) => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    return (
      c.productName.toLowerCase().includes(q) ||
      c.username.toLowerCase().includes(q)
    );
  });

  const activeConversation = conversations.find(
    (c) => c.conversation_id === selectedConversationId
  );

  const threadMeta = useMemo(() => {
    if (activeConversation) {
      return {
        productName: activeConversation.productName,
        username: activeConversation.username,
        image: activeConversation.image,
        price: activeConversation.price,
        listingId: activeConversation.listingId,
        otherUserId: activeConversation.otherUserId,
        otherUserProfileImage: activeConversation.otherUserProfileImage,
      };
    }
    if (listingContext?.listingId) {
      return {
        productName: listingContext.listingTitle || 'Listing',
        username: listingContext.sellerName || 'Seller',
        image: listingContext.listingImage || null,
        price: listingContext.price ?? null,
        listingId: listingContext.listingId,
        otherUserId: listingContext.sellerId ?? null,
        otherUserProfileImage: listingContext.sellerProfileImage || null,
      };
    }
    return null;
  }, [activeConversation, listingContext]);

  const otherUserId = threadMeta?.otherUserId ?? null;
  const otherName = threadMeta?.username || 'the other person';

  const exchangeHint = useMemo(
    () => getExchangeHint(messages, otherName),
    [messages, otherName]
  );
  const canRate = useMemo(
    () => Boolean(otherUserId && currentUserId && hasMinimumExchange(messages)),
    [otherUserId, currentUserId, messages]
  );

  const showRatingForm = ratingFormOpen && canRate;

  useEffect(() => {
    setRatingValue(0);
    setRatingReview('');
    setSendError('');
    setHasRatedUser(false);
    setExistingRating(null);
    setRatingFormOpen(false);
    setRatingsLoading(false);
  }, [selectedConversationId]);

  useEffect(() => {
    if (!otherUserId || !currentUserId) return undefined;
    let cancelled = false;
    setRatingsLoading(true);
    (async () => {
      try {
        const ratings = await fetchUserRatings(otherUserId);
        if (cancelled) return;
        const mine = ratings.find(
          (r) => String(r.rater_user_id) === String(currentUserId)
        );
        if (mine) {
          setHasRatedUser(true);
          setExistingRating({
            rating: Number(mine.rating) || 0,
            review: mine.review || '',
          });
        } else {
          setHasRatedUser(false);
          setExistingRating(null);
        }
      } catch {
        if (!cancelled) {
          setHasRatedUser(false);
          setExistingRating(null);
        }
      } finally {
        if (!cancelled) setRatingsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [otherUserId, currentUserId]);

  const openRatingForm = useCallback(
    (edit = false) => {
      writeRatingDismissed(currentUserId, otherUserId, false);
      if (edit && existingRating) {
        setRatingValue(existingRating.rating);
        setRatingReview(existingRating.review || '');
      } else {
        setRatingValue(0);
        setRatingReview('');
      }
      setRatingFormOpen(true);
    },
    [currentUserId, otherUserId, existingRating]
  );

  const closeRatingForm = useCallback(() => {
    setRatingFormOpen(false);
  }, []);

  const dismissRatingPrompt = useCallback(() => {
    writeRatingDismissed(currentUserId, otherUserId, true);
    setRatingFormOpen(false);
    setRatingValue(0);
    setRatingReview('');
  }, [currentUserId, otherUserId]);

  const handleSubmitRating = async () => {
    if (!otherUserId || ratingValue < 1) return;
    setRatingSubmitting(true);
    try {
      await rateUser(otherUserId, {
        rating: ratingValue,
        review: ratingReview.trim() || undefined,
      });
      const reviewText = ratingReview.trim();
      setHasRatedUser(true);
      setExistingRating({ rating: ratingValue, review: reviewText });
      setRatingFormOpen(false);
      setRatingValue(ratingValue);
      setRatingReview(reviewText);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to submit review.';
      setSendError(msg);
    } finally {
      setRatingSubmitting(false);
    }
  };

  const handleSend = async () => {
    const text = messageInput.trim();
    if (!text || !socketRef.current || sending) return;

    setSending(true);
    setSendError('');
    let conversationId =
      selectedConversationId ?? activeConversation?.conversation_id ?? null;
    const tempId = `temp_${Date.now()}`;

    try {
      if (!conversationId) {
        if (!listingContext?.sellerId || !listingContext?.listingId) {
          setSending(false);
          return;
        }
        const conversation = await findOrCreateConversation(
          listingContext.sellerId,
          listingContext.listingId
        );
        conversationId = conversation?.conversation_id ?? null;
        if (!conversationId) {
          throw new Error('Failed to create conversation');
        }
        socketRef.current.emit('join_conversation', { conversationId });
        await loadConversations();
        setSelectedConversationId(conversationId);
      }

      setMessageInput('');
      setMessages((prev) => [
        ...prev,
        {
          id: tempId,
          text,
          imageUrl: null,
          sender: 'me',
          timestamp: new Date().toISOString(),
        },
      ]);

      socketRef.current.emit('send_message', {
        conversationId,
        message: text,
        image_url: null,
      });
    } catch (err) {
      console.error('Failed to send message over websocket', err);
      setMessageInput(text);
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setSendError(err.message || 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  const showThreadPanel = Boolean(threadMeta?.listingId);

  return (
    <div className="messages-page" style={{ backgroundColor: 'var(--color-background)' }}>
      <UserHeader
        user={user}
        onSearch={onSearch}
        onSell={onSell}
        onMessages={onMessages}
        onMyListings={onMyListings}
        onNotifications={onNotifications}
        onViewAllNotifications={onViewAllNotifications}
        onNotificationClick={onNotificationClick}
        onOpenProfile={onOpenProfile}
        onLogout={onLogout}
        onGoHome={onGoHome}
      />

      <main className="messages-main">
        <div
          className={cn(
            'messages-shell',
            showThreadPanel && 'messages-shell--thread-open'
          )}
        >
          <aside className="messages-sidebar" aria-label="Conversations list">
            <div className="messages-sidebar-header">
              <h1 className="messages-title">Messages</h1>
              <p className="messages-subtitle">Chat about listings you&apos;re interested in.</p>
            </div>
            <div className="messages-search">
              <Input
                type="text"
                role="searchbox"
                enterKeyHint="search"
                placeholder="Search by user or listing…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={cn(alignedInputClassName, 'messages-sidebar-search-field')}
                style={alignedAuthInputPad}
                aria-label="Search conversations by user or listing"
              />
            </div>
            <div className="messages-list">
              {loadingConversations ? (
                <div className="messages-empty">Loading conversations…</div>
              ) : filteredConversations.length === 0 ? (
                <div className="messages-empty">
                  No conversations yet. Open a listing and click &quot;Message seller&quot; to start.
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const isActive = conv.conversation_id === selectedConversationId;
                  return (
                    <button
                      key={conv.conversation_id}
                      type="button"
                      className={`messages-list-item ${isActive ? 'messages-list-item-active' : ''}`}
                      onClick={() => setSelectedConversationId(conv.conversation_id)}
                    >
                      <div className="messages-list-avatar">
                        {conv.image ? (
                          <img src={resolveMediaUrl(conv.image)} alt="" />
                        ) : (
                          <div className="messages-list-avatar-fallback" />
                        )}
                      </div>
                      <div className="messages-list-text">
                        <div className="messages-list-row">
                          <span className="messages-list-name">{conv.productName}</span>
                        </div>
                        <div className="messages-list-row">
                          <span className="messages-list-product">with {conv.username}</span>
                        </div>
                        {conv.lastMessage && (
                          <div className="messages-list-row">
                            <span className="messages-list-last">
                              {formatChatSnippet(conv.lastMessage)}
                            </span>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          <section className="messages-thread">
            {!threadMeta ? (
              <div className="messages-thread-empty">
                <p>Select a conversation on the left to start chatting.</p>
              </div>
            ) : (
              <>
                <header className="messages-thread-header">
                  <button
                    type="button"
                    className="messages-thread-back"
                    onClick={() => setSelectedConversationId(null)}
                    aria-label="Back to conversations"
                  >
                    <ChevronLeft className="h-4 w-4" aria-hidden />
                    Back
                  </button>
                  <div className="messages-thread-heading">
                    <div className="messages-thread-avatar">
                      {threadMeta.image ? (
                        <img src={resolveMediaUrl(threadMeta.image)} alt="" />
                      ) : (
                        <div className="messages-thread-avatar-fallback" />
                      )}
                    </div>
                    <div className="messages-thread-heading-text">
                      <div className="messages-thread-product" title={threadMeta.productName}>
                        {threadMeta.productName}
                      </div>
                      <div className="messages-thread-meta">
                        with <span className="messages-thread-name">{threadMeta.username}</span>
                        {threadMeta.price != null && threadMeta.price !== '' && (
                          <span className="messages-thread-price">
                            {' '}
                            · ₱{Number(threadMeta.price).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <MessagesThreadToolbar
                    listingId={threadMeta.listingId}
                    onViewListing={onViewListing}
                    canRate={canRate}
                    ratingsLoading={ratingsLoading}
                    hasRatedUser={hasRatedUser}
                    onOpenRating={() => openRatingForm(hasRatedUser)}
                    showReport={
                      Boolean(threadMeta.otherUserId) &&
                      String(threadMeta.otherUserId) !== String(user?.id)
                    }
                    reportUserId={threadMeta.otherUserId}
                    reportUserLabel={threadMeta.username}
                    user={user}
                  />
                </header>

                <div className="messages-thread-body">
                  {loadingMessages ? (
                    <div className="messages-thread-empty">Loading messages…</div>
                  ) : messages.length === 0 ? (
                    <div className="messages-thread-empty">
                      {selectedConversationId
                        ? 'No messages yet. Say hi to start the conversation.'
                        : 'Send a message below to start chatting about this listing.'}
                    </div>
                  ) : (
                    <>
                    {exchangeHint ? (
                      <p className="messages-exchange-hint" role="status">
                        {exchangeHint}
                      </p>
                    ) : null}
                    {sendError ? (
                      <p className="messages-send-error" role="alert">
                        {sendError}
                      </p>
                    ) : null}
                    <div className="messages-thread-scroll">
                      {messages.map((m) => {
                        const otherPic = resolveMediaUrl(
                          m.senderAvatar || threadMeta?.otherUserProfileImage
                        );
                        const mePic = resolveMediaUrl(user?.profile_image);
                        return (
                          <div
                            key={m.id}
                            className={`messages-bubble-row ${
                              m.sender === 'me' ? 'messages-bubble-row-me' : 'messages-bubble-row-other'
                            }`}
                          >
                            {m.sender !== 'me' ? (
                              <Avatar className="messages-bubble-avatar h-7 w-7 shrink-0" aria-hidden>
                                <AvatarImage src={otherPic} alt="" />
                                <AvatarFallback className="messages-bubble-avatar-fallback">
                                  {(threadMeta?.username || '?').trim().charAt(0).toUpperCase() || '?'}
                                </AvatarFallback>
                              </Avatar>
                            ) : null}
                            <div
                              className={`messages-bubble ${
                                m.sender === 'me' ? 'messages-bubble-me' : 'messages-bubble-other'
                              }`}
                            >
                              {formatChatSnippet(m.text)}
                            </div>
                            {m.sender === 'me' ? (
                              <Avatar className="messages-bubble-avatar h-7 w-7 shrink-0" aria-hidden>
                                <AvatarImage src={mePic} alt="" />
                                <AvatarFallback className="messages-bubble-avatar-fallback">
                                  {(user?.name || '?').trim().charAt(0).toUpperCase() || '?'}
                                </AvatarFallback>
                              </Avatar>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  {showRatingForm ? (
                    <div className="messages-rating-card">
                      <div className="messages-rating-card-head">
                        <h3 className="messages-rating-title">
                          {hasRatedUser && existingRating
                            ? `Edit your review of ${otherName}`
                            : `Rate your experience with ${otherName}`}
                        </h3>
                        <button
                          type="button"
                          className="messages-rating-close"
                          onClick={closeRatingForm}
                          aria-label="Close review form"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="messages-rating-subtitle">
                        {hasRatedUser && existingRating
                          ? 'Update your stars or review text below.'
                          : 'Share how the deal went — you can close this and rate later.'}
                      </p>
                      <div className="messages-rating-stars">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            className="messages-rating-star-btn"
                            onClick={() => setRatingValue(star)}
                            aria-label={`${star} star${star === 1 ? '' : 's'}`}
                          >
                            <Star
                              className={cn(
                                'h-7 w-7',
                                star <= ratingValue
                                  ? 'messages-rating-star-filled'
                                  : 'messages-rating-star-empty'
                              )}
                              fill={star <= ratingValue ? 'currentColor' : 'none'}
                            />
                          </button>
                        ))}
                      </div>
                      <textarea
                        className="messages-rating-review"
                        placeholder="Write a short review (optional)"
                        value={ratingReview}
                        onChange={(e) => setRatingReview(e.target.value)}
                        maxLength={250}
                        rows={3}
                      />
                      <div className="messages-rating-actions">
                        <Button
                          type="button"
                          variant="outline"
                          className="messages-rating-secondary"
                          disabled={ratingSubmitting}
                          onClick={dismissRatingPrompt}
                        >
                          Not now
                        </Button>
                        <Button
                          type="button"
                          className="messages-rating-submit"
                          disabled={ratingSubmitting || ratingValue < 1}
                          onClick={handleSubmitRating}
                        >
                          {ratingSubmitting
                            ? 'Saving…'
                            : hasRatedUser && existingRating
                              ? 'Update review'
                              : 'Submit review'}
                        </Button>
                      </div>
                    </div>
                  ) : null}
                    </>
                  )}
                </div>

              </>
            )}
            {threadMeta?.listingId && (
              <footer className="messages-thread-input">
                <Input
                  type="text"
                  placeholder="Type your message…"
                  value={messageInput}
                  onChange={(e) => {
                    setMessageInput(e.target.value);
                    if (sendError) setSendError('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  className={cn(alignedInputClassName, 'messages-thread-input-field')}
                  style={alignedAuthInputPad}
                />
                <Button
                  type="button"
                  size="icon"
                  variant="default"
                  className="messages-thread-send-btn"
                  disabled={!messageInput.trim() || sending}
                  onClick={handleSend}
                  aria-label={sending ? 'Sending message' : 'Send message'}
                >
                  <Send className="h-5 w-5" aria-hidden />
                </Button>
              </footer>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

