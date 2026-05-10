import { useState, useRef, useEffect } from 'react';
import Logo from './Logo';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Bell, User, LogOut, MessageCircle, Star, Tag, Heart, Megaphone, UserPlus } from 'lucide-react';
import { useNotifications } from '../context/NotificationsContext';
import { formatChatSnippet } from '../utils/chatOffers';
import { cn } from '@/lib/utils';
import { resolveMediaUrl } from '../utils/mediaUrl';
import './UserHeader.css';

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

function UserHeader({
  user,
  guest = false,
  onGuestLogin,
  onGuestSignUp,
  onSearch,
  searchPlaceholder = 'Search clubs, balls, rangefinders...',
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
  const [searchValue, setSearchValue] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { notifications, unreadCount, refreshNotifications, markNotificationAsRead } = useNotifications();
  const notifDropdownRef = useRef(null);
  const profileDropdownRef = useRef(null);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(e.target)) {
        setNotifDropdownOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setNotifDropdownOpen(false);
        setDropdownOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch?.(searchValue.trim());
  };

  const handleOpenProfile = () => {
    setDropdownOpen(false);
    onOpenProfile?.();
  };

  const handleLogout = () => {
    setDropdownOpen(false);
    onLogout?.();
  };

  const handleBellClick = () => {
    setDropdownOpen(false);
    setNotifDropdownOpen((prev) => {
      const next = !prev;
      if (!prev && !next) return next;
      if (!prev && next) {
        refreshNotifications();
      }
      return next;
    });
  };

  const handleProfileMenuToggle = () => {
    setNotifDropdownOpen(false);
    setDropdownOpen((prev) => !prev);
  };

  const handleNotificationItemClick = (n) => {
    markNotificationAsRead(n.id);
    if (onNotificationClick) {
      onNotificationClick(n);
    } else {
      onViewAllNotifications?.();
    }
  };

  const recentNotifications = notifications.slice(0, 5);
  const hasNotifications = recentNotifications.length > 0;

  return (
    <header className="user-header">
      <div className="user-header-inner">
        <div className="user-header-left">
          <button
            type="button"
            className="user-header-logo-btn"
            onClick={() => onGoHome?.()}
            aria-label="Go to home"
          >
            <Logo className="user-header-logo" size={32} showText={true} />
          </button>
        </div>

        <form className="user-header-search-wrap" onSubmit={handleSearchSubmit}>
          <Input
            type="search"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="user-header-search-input"
            aria-label="Search listings"
          />
        </form>

        <nav className="user-header-right">
          {guest ? (
            <>
              <Button variant="ghost" size="sm" className="user-header-link user-header-guest-link" type="button" onClick={() => onGuestLogin?.()}>
                Log in
              </Button>
              <Button variant="secondary" size="sm" className="user-header-btn-sell user-header-btn-join" type="button" onClick={() => onGuestSignUp?.()}>
                Join free
              </Button>
            </>
          ) : null}
          {!guest && onMessages ? (
            <Button variant="ghost" size="sm" className="user-header-link" onClick={onMessages}>
              Messages
            </Button>
          ) : null}
          {!guest && onMyListings ? (
            <Button variant="ghost" size="sm" className="user-header-link" onClick={onMyListings}>
              My Listings
            </Button>
          ) : null}
          {!guest && onSell ? (
            <Button variant="secondary" size="sm" className="user-header-btn-sell" onClick={onSell}>
              + Sell
            </Button>
          ) : null}
          {!guest && onNotifications != null ? (
            <div className="user-header-notif-wrap" ref={notifDropdownRef}>
              <Button
                variant="ghost"
                size="icon"
                className="user-header-icon-btn"
                aria-label="Notifications"
                onClick={handleBellClick}
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="user-header-notif-badge" aria-hidden="true">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Button>
              {notifDropdownOpen && (
                <div className="user-header-notif-dropdown">
                  <div className="user-header-notif-dropdown-head">
                    <span className="user-header-notif-dropdown-title">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="user-header-notif-dropdown-count">
                        {unreadCount} unread
                      </span>
                    )}
                  </div>
                  <div className="user-header-notif-dropdown-list">
                    {hasNotifications ? (
                      recentNotifications.map((n) => {
                        const meta =
                          NOTIFICATION_ICON_MAP[n.type] || {
                            Icon: Bell,
                            color: 'var(--color-text-muted)',
                          };
                        const isUnread = !n.read_at;
                        const IconComponent = meta.Icon;
                        return (
                          <button
                            key={n.id}
                            type="button"
                            className={cn(
                              'user-header-notif-item',
                              isUnread && 'user-header-notif-item-unread'
                            )}
                            onClick={() => handleNotificationItemClick(n)}
                          >
                            <span
                              className="user-header-notif-item-icon"
                              style={{ color: meta.color }}
                            >
                              <IconComponent className="h-4 w-4" />
                            </span>
                            <span className="user-header-notif-item-content">
                              <span className="user-header-notif-item-message">
                                {formatChatSnippet(n.message)}
                              </span>
                              <span className="user-header-notif-item-time">
                                {formatRelativeTime(n.created_at)}
                              </span>
                            </span>
                            {isUnread && <span className="user-header-notif-item-dot" />}
                          </button>
                        );
                      })
                    ) : (
                      <p className="user-header-notif-empty">No notifications yet</p>
                    )}
                  </div>
                  <button
                    type="button"
                    className="user-header-notif-view-all"
                    onClick={() => onViewAllNotifications?.()}
                  >
                    View all notifications
                  </button>
                </div>
              )}
            </div>
          ) : null}
          {!guest && (onOpenProfile != null || onLogout != null) ? (
            <div className="user-header-account-wrap" ref={profileDropdownRef}>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                id="user-header-account-trigger"
                className={cn('user-header-profile-btn', dropdownOpen && 'user-header-profile-btn-open')}
                aria-label="Account menu"
                aria-expanded={dropdownOpen}
                aria-controls="user-header-account-panel"
                aria-haspopup="menu"
                onClick={handleProfileMenuToggle}
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={resolveMediaUrl(user?.profile_image)} alt="" />
                  <AvatarFallback>
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
              </Button>
              {dropdownOpen ? (
                <div
                  id="user-header-account-panel"
                  className="user-header-account-panel"
                  role="menu"
                  aria-labelledby="user-header-account-trigger"
                  tabIndex={-1}
                >
                  <div className="user-header-account-head">
                    <p className="user-header-account-name">{user?.name || 'Account'}</p>
                    {user?.email ? (
                      <p className="user-header-account-email">{user.email}</p>
                    ) : null}
                  </div>
                  {onOpenProfile != null ? (
                    <button
                      type="button"
                      className="user-header-account-option"
                      role="menuitem"
                      onClick={handleOpenProfile}
                    >
                      <User className="user-header-account-option-icon" aria-hidden strokeWidth={2} />
                      <span>Profile</span>
                    </button>
                  ) : null}
                  {onLogout != null ? (
                    <button
                      type="button"
                      className="user-header-account-option user-header-account-option-logout"
                      role="menuitem"
                      onClick={handleLogout}
                    >
                      <LogOut className="user-header-account-option-icon" aria-hidden strokeWidth={2} />
                      <span>Log out</span>
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}
        </nav>
      </div>
    </header>
  );
}

export default UserHeader;
