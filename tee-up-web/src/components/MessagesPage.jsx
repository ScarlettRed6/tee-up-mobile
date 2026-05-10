import { useEffect, useState, useCallback, useRef } from 'react';
import UserHeader from './UserHeader';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { cn } from '@/lib/utils';
import { getConversations, getMessages, findOrCreateConversation } from '../api/chatApi';
import { getSocket } from '../utils/socketClient';
import { formatChatSnippet } from '../utils/chatOffers';
import { resolveMediaUrl } from '../utils/mediaUrl';
import './MessagesPage.css';

/** Match login/signup text field padding */
const alignedAuthInputPad = { paddingInline: '1rem', paddingBlock: '0.875rem' };
const alignedInputClassName =
  'min-h-[52px] text-[17px] leading-normal transition-all duration-200 hover:border-[var(--color-primary)]/50';

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
      socket.on('new_message', (payload) => {
        const convId = payload?.conversation_id;
        if (!convId) return;
        loadConversations();
        if (String(convId) !== String(selectedConversationId)) return;
        const normalizedIncoming = normalizeMessage(payload, currentUserId);
        setMessages((prev) => {
          const alreadyExists = prev.some((m) => String(m.id) === String(normalizedIncoming.id));
          if (alreadyExists) return prev;
          return [...prev, normalizedIncoming];
        });
      });
    } catch (err) {
      console.error('Failed to init websocket for messages page', err);
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.off('new_message');
      }
    };
  }, [currentUserId, selectedConversationId, loadConversations]);

  useEffect(() => {
    if (!selectedConversationId || !socketRef.current) return;
    socketRef.current.emit('join_conversation', { conversationId: selectedConversationId });
  }, [selectedConversationId]);

  useEffect(() => {
    if (!listingContext || !listingContext.sellerId || !listingContext.listingId) return;
    const existingConversation = conversations.find(
      (conv) =>
        String(conv.otherUserId) === String(listingContext.sellerId) &&
        String(conv.listingId) === String(listingContext.listingId)
    );
    if (existingConversation) {
      setSelectedConversationId(existingConversation.conversation_id);
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

  const handleSend = async () => {
    const text = messageInput.trim();
    if (!text || !socketRef.current || sending) return;

    setSending(true);
    let conversationId = activeConversation?.conversation_id ?? null;

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

      socketRef.current.emit('send_message', {
        conversationId,
        message: text,
        image_url: null,
      });
    } catch (err) {
      console.error('Failed to send message over websocket', err);
      setMessageInput(text);
    } finally {
      setSending(false);
    }
  };

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
        <div className="messages-shell">
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
            {!activeConversation ? (
              <div className="messages-thread-empty">
                {listingContext?.listingId ? (
                  <p>Type a message below to start a conversation for this listing.</p>
                ) : (
                  <p>Select a conversation on the left to start chatting.</p>
                )}
              </div>
            ) : (
              <>
                <header className="messages-thread-header">
                  <div className="messages-thread-heading">
                    <div className="messages-thread-avatar">
                      {activeConversation.image ? (
                        <img src={resolveMediaUrl(activeConversation.image)} alt="" />
                      ) : (
                        <div className="messages-thread-avatar-fallback" />
                      )}
                    </div>
                    <div>
                      <div className="messages-thread-product">
                        {activeConversation.productName}
                      </div>
                      <div className="messages-thread-meta">
                        with <span className="messages-thread-name">{activeConversation.username}</span>{' '}
                        {activeConversation.price != null && (
                          <span className="messages-thread-price">
                            · ₱{Number(activeConversation.price).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="messages-thread-listing-btn"
                    type="button"
                    onClick={() => {
                      if (onViewListing && activeConversation.listingId) {
                        onViewListing(activeConversation.listingId);
                      }
                    }}
                  >
                    View Listing
                  </Button>
                </header>

                <div className="messages-thread-body">
                  <div className="messages-thread-listing-summary">
                    <div className="messages-thread-listing-thumb">
                      {activeConversation.image ? (
                        <img src={resolveMediaUrl(activeConversation.image)} alt={activeConversation.productName} />
                      ) : (
                        <div className="messages-thread-listing-thumb-fallback" />
                      )}
                    </div>
                    <div className="messages-thread-listing-text">
                      <div className="messages-thread-listing-title">
                        {activeConversation.productName}
                      </div>
                      {activeConversation.price != null && (
                        <div className="messages-thread-listing-price">
                          ₱{Number(activeConversation.price).toLocaleString()}
                        </div>
                      )}
                      <div className="messages-thread-listing-caption">
                        Listing you&apos;re chatting about.
                      </div>
                    </div>
                  </div>

                  {loadingMessages ? (
                    <div className="messages-thread-empty">Loading messages…</div>
                  ) : messages.length === 0 ? (
                    <div className="messages-thread-empty">
                      No messages yet. Say hi to start the conversation.
                    </div>
                  ) : (
                    <div className="messages-thread-scroll">
                      {messages.map((m) => {
                        const otherPic = resolveMediaUrl(
                          m.senderAvatar || activeConversation?.otherUserProfileImage
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
                                  {(activeConversation?.username || '?').trim().charAt(0).toUpperCase() || '?'}
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
                  )}
                </div>

              </>
            )}
            {(activeConversation || listingContext?.listingId) && (
              <footer className="messages-thread-input">
                <Input
                  type="text"
                  placeholder="Type your message…"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
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
                  size="sm"
                  disabled={!messageInput.trim() || sending}
                  onClick={handleSend}
                >
                  Send
                </Button>
              </footer>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

