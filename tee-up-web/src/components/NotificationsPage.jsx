import { useCallback } from 'react';
import UserHeader from './UserHeader';
import { Button } from './ui/button';
import { ChevronLeft, Bell, MessageCircle, Star, Tag, Heart, Megaphone, UserPlus, CheckCheck } from 'lucide-react';
import { useNotifications } from '../context/NotificationsContext';
import { formatChatSnippet } from '../utils/chatOffers';
import { cn } from '@/lib/utils';
import './NotificationsPage.css';

const NOTIFICATION_ICON_MAP = {
  new_message: { Icon: MessageCircle, color: 'var(--color-info, #3B82F6)', label: 'Message' },
  rating_received: { Icon: Star, color: 'var(--color-warning, #F59E0B)', label: 'Rating' },
  favorite_sold: { Icon: Tag, color: 'var(--color-success, #10B981)', label: 'Listing' },
  favorite_status_changed: { Icon: Tag, color: '#F97316', label: 'Listing update' },
  listing_favorited: { Icon: Heart, color: '#EC4899', label: 'Favorite' },
  followed_new_listing: { Icon: Megaphone, color: '#6366F1', label: 'New listing' },
  new_follower: { Icon: UserPlus, color: '#F472B6', label: 'Follower' },
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
  return parsed.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
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
}) {
  const {
    notifications,
    notificationsLoading,
    unreadCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  } = useNotifications();

  const handleNotificationPress = useCallback(
    (notification) => {
      const id = notification.id ?? notification.notification_id;
      if (id) markNotificationAsRead(id);
      onNotificationClick?.(notification);
    },
    [markNotificationAsRead, onNotificationClick]
  );

  const totalCount = notifications.length;
  const subtitle =
    totalCount === 0
      ? 'You’re all caught up'
      : unreadCount > 0
        ? `${unreadCount} unread · ${totalCount} total`
        : `${totalCount} notification${totalCount === 1 ? '' : 's'}`;

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
        <header className="notifications-page-toolbar">
          <div className="notifications-page-toolbar-start">
            <Button
              variant="ghost"
              size="sm"
              className="notifications-page-back"
              onClick={onBack}
            >
              <ChevronLeft className="h-5 w-5" />
              Back
            </Button>
            <div className="notifications-page-heading">
              <h1 className="notifications-page-title">Notifications</h1>
              <p className="notifications-page-subtitle">{subtitle}</p>
            </div>
          </div>
          <div className="notifications-page-toolbar-actions">
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
              <span className="notifications-page-unread-badge" aria-live="polite">
                {unreadCount} unread
              </span>
            )}
          </div>
        </header>

        <section className="notifications-page-panel" aria-label="Notification list">
          {notificationsLoading && notifications.length === 0 ? (
            <p className="notifications-page-loading">Loading notifications…</p>
          ) : notifications.length > 0 ? (
            <div className="notifications-page-scroll">
              <ul className="notifications-page-list">
                {notifications.map((n) => {
                  const meta = NOTIFICATION_ICON_MAP[n.type] || {
                    Icon: Bell,
                    color: 'var(--color-text-muted)',
                    label: 'Update',
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
                          className="notifications-page-item-icon-wrap"
                          style={{ color: meta.color }}
                          aria-hidden
                        >
                          <IconComponent className="h-5 w-5" />
                        </span>
                        <span className="notifications-page-item-body">
                          <span className="notifications-page-item-message">
                            {formatChatSnippet(n.message)}
                          </span>
                          <span className="notifications-page-item-meta">
                            <span className="notifications-page-item-time">
                              {formatRelativeTime(n.created_at)}
                            </span>
                            <span className="notifications-page-item-type">{meta.label}</span>
                          </span>
                        </span>
                        <span className="notifications-page-item-indicator">
                          {isUnread && (
                            <span
                              className="notifications-page-item-dot"
                              aria-label="Unread"
                            />
                          )}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : (
            <div className="notifications-page-empty">
              <span className="notifications-page-empty-icon-wrap" aria-hidden>
                <Bell className="h-8 w-8" />
              </span>
              <h2 className="notifications-page-empty-title">No notifications yet</h2>
              <p className="notifications-page-empty-text">
                When someone messages you, favorites your listing, or follows you, it will show up
                here.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
