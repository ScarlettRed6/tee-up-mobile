import { useCallback } from 'react';
import UserHeader from './UserHeader';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { ChevronLeft, Bell, MessageCircle, Star, Tag, Heart, Megaphone, UserPlus, CheckCheck } from 'lucide-react';
import { useNotifications } from '../context/NotificationsContext';
import { formatChatSnippet } from '../utils/chatOffers';
import { cn } from '@/lib/utils';
import './NotificationsPage.css';

const NOTIFICATION_ICON_MAP = {
  new_message: { Icon: MessageCircle, color: 'var(--color-info, #3B82F6)' },
  rating_received: { Icon: Star, color: 'var(--color-warning, #F59E0B)' },
  favorite_sold: { Icon: Tag, color: 'var(--color-success, #10B981)' },
  favorite_status_changed: { Icon: Tag, color: 'var(--color-orange, #F97316)' },
  listing_favorited: { Icon: Heart, color: '#EC4899' },
  followed_new_listing: { Icon: Megaphone, color: '#6366F1' },
  new_follower: { Icon: UserPlus, color: '#F472B6' },
};

function formatRelativeTime(timestamp) {
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
}

export default function NotificationsPage({
  user,
  onBack,
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
  onViewListing,
  onOpenMessages,
  onOpenUserProfile,
}) {
  const {
    notifications,
    notificationsLoading,
    unreadCount,
    refreshNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  } = useNotifications();

  const handleNotificationPress = useCallback(
    (notification) => {
      const id = notification.id ?? notification.notification_id;
      if (id) markNotificationAsRead(id);

      const { type, data } = notification;

      if (type === 'new_message' && data?.conversationId) {
        onOpenMessages?.(data.conversationId);
        return;
      }
      if (
        (type === 'favorite_sold' ||
          type === 'favorite_status_changed' ||
          type === 'listing_favorited' ||
          type === 'followed_new_listing') &&
        data?.listing_id
      ) {
        onViewListing?.(data.listing_id);
        return;
      }
      if (type === 'new_follower' && data?.follower_id) {
        onOpenUserProfile?.(data.follower_id);
        return;
      }
      if (type === 'rating_received') {
        onOpenProfile?.();
        return;
      }
    },
    [
      markNotificationAsRead,
      onOpenMessages,
      onViewListing,
      onOpenUserProfile,
      onOpenProfile,
    ]
  );

  return (
    <div className="notifications-page">
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

      <main className="notifications-page-main">
        <div className="notifications-page-header">
          <Button
            variant="ghost"
            size="sm"
            className="notifications-page-back"
            onClick={onBack}
          >
            <ChevronLeft className="h-5 w-5" />
            Back
          </Button>
          <h1 className="notifications-page-title">Notifications</h1>
          <div className="notifications-page-actions">
            <Button
              variant="outline"
              size="sm"
              className="notifications-page-mark-all"
              onClick={markAllNotificationsAsRead}
              disabled={!unreadCount}
            >
              <CheckCheck className="h-4 w-4" />
              Mark all read
            </Button>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {unreadCount} unread
              </Badge>
            )}
          </div>
        </div>

        <Card className="notifications-page-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg">All notifications</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {notificationsLoading && notifications.length === 0 ? (
              <p className="notifications-page-loading">Loading…</p>
            ) : notifications.length > 0 ? (
              <ScrollArea className="h-[60vh] w-full">
                <ul className="notifications-page-list">
                  {notifications.map((n) => {
                    const meta = NOTIFICATION_ICON_MAP[n.type] || {
                      Icon: Bell,
                      color: 'var(--color-text-muted)',
                    };
                    const IconComponent = meta.Icon;
                    const isUnread = !n.read_at;
                    return (
                      <li key={n.id}>
                        <button
                          type="button"
                          className={cn(
                            'notifications-page-item',
                            isUnread && 'notifications-page-item-unread'
                          )}
                          onClick={() => handleNotificationPress(n)}
                        >
                          <span
                            className="notifications-page-item-icon"
                            style={{ color: meta.color }}
                          >
                            <IconComponent className="h-5 w-5" />
                          </span>
                          <span className="notifications-page-item-content">
                            <span className="notifications-page-item-message">
                              {formatChatSnippet(n.message)}
                            </span>
                            <span className="notifications-page-item-time">
                              {formatRelativeTime(n.created_at)}
                            </span>
                          </span>
                          {isUnread && (
                            <span className="notifications-page-item-dot" />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </ScrollArea>
            ) : (
              <div className="notifications-page-empty">
                <Bell className="notifications-page-empty-icon" />
                <p className="notifications-page-empty-text">No notifications yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
