import { useState, useRef, useEffect } from 'react';
import Logo from './Logo';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Bell, User, LogOut } from 'lucide-react';
import './UserHeader.css';

function UserHeader({ user, onSearch, onSell, onMessages, onMyListings, onNotifications, onOpenProfile, onLogout, onGoHome }) {
  const [searchValue, setSearchValue] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch?.(searchValue.trim());
  };

  const handleProfileClick = () => {
    setDropdownOpen((prev) => !prev);
  };

  const handleOpenProfile = () => {
    setDropdownOpen(false);
    onOpenProfile?.();
  };

  const handleLogout = () => {
    setDropdownOpen(false);
    onLogout?.();
  };

  return (
    <header className="user-header">
      <div className="user-header-inner">
        <div className="user-header-left">
          {onGoHome ? (
            <button
              type="button"
              className="user-header-logo-btn"
              onClick={onGoHome}
              aria-label="Go to home"
            >
              <Logo className="user-header-logo" size={32} showText={true} />
            </button>
          ) : (
            <Logo className="user-header-logo" size={32} showText={true} />
          )}
        </div>

        <form className="user-header-search-wrap" onSubmit={handleSearchSubmit}>
          <Input
            type="search"
            placeholder="Find your next favorite club..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="user-header-search-input"
            aria-label="Search listings"
          />
        </form>

        <nav className="user-header-right">
          {onMessages && (
            <Button variant="ghost" size="sm" className="user-header-link" onClick={onMessages}>
              Messages
            </Button>
          )}
          {onMyListings && (
            <Button variant="ghost" size="sm" className="user-header-link" onClick={onMyListings}>
              My Listings
            </Button>
          )}
          {onSell && (
            <Button variant="secondary" size="sm" className="user-header-btn-sell" onClick={onSell}>
              + Sell
            </Button>
          )}
          {onNotifications && (
            <Button
              variant="ghost"
              size="icon"
              className="user-header-icon-btn"
              onClick={onNotifications}
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
            </Button>
          )}
          {onOpenProfile != null || onLogout != null ? (
            <div className="user-header-profile-wrap" ref={dropdownRef}>
              <Button
                variant="ghost"
                size="icon"
                className={`user-header-profile-btn ${dropdownOpen ? 'user-header-profile-btn-open' : ''}`}
                onClick={handleProfileClick}
                aria-label="Profile menu"
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.profile_image} alt={user?.name} />
                  <AvatarFallback>
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
              </Button>
              {dropdownOpen && (
                <div className="user-header-dropdown">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="user-header-dropdown-item"
                    onClick={handleOpenProfile}
                  >
                    Profile
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="user-header-dropdown-item user-header-dropdown-item-logout"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </div>
              )}
            </div>
          ) : null}
        </nav>
      </div>
    </header>
  );
}

export default UserHeader;
