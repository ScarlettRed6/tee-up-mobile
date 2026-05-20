/** Notification types that open a marketplace listing. */
export const LISTING_NOTIFICATION_TYPES = [
  'favorite_sold',
  'favorite_status_changed',
  'listing_favorited',
  'followed_new_listing',
];

export function getNotificationData(notification) {
  const raw = notification?.data;
  if (!raw) return {};
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }
  return typeof raw === 'object' ? raw : {};
}

/**
 * Resolve where a notification should navigate.
 * @returns {{ kind: 'none'|'messages'|'listing'|'publicProfile'|'profile', conversationId?: string, listingId?: string, userId?: string, tab?: string }}
 */
export function resolveNotificationRoute(notification) {
  const type = notification?.type;
  const data = getNotificationData(notification);

  const conversationId = data.conversationId ?? data.conversation_id;
  const listingId = data.listing_id ?? data.listingId;
  const followerId = data.follower_id ?? data.followerId;

  if (type === 'new_message' && conversationId != null && conversationId !== '') {
    return { kind: 'messages', conversationId: String(conversationId) };
  }

  if (LISTING_NOTIFICATION_TYPES.includes(type) && listingId != null && listingId !== '') {
    return { kind: 'listing', listingId: String(listingId) };
  }

  if (type === 'new_follower' && followerId != null && followerId !== '') {
    return { kind: 'publicProfile', userId: String(followerId) };
  }

  if (type === 'rating_received') {
    return { kind: 'profile', tab: 'reviews' };
  }

  return { kind: 'none' };
}
