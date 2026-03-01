import { useState } from 'react';
import Logo from './Logo';
import './UserHeader.css';

function UserHeader({ user, onSearch, onSell, onMessages, onMyListings, onNotifications, onProfile }) {
  const [searchValue, setSearchValue] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch?.(searchValue.trim());
  };

  return (
    <header className="user-header">
      <div className="user-header-inner">
        <div className="user-header-left">
          <Logo className="user-header-logo" size={32} showText={true} />
        </div>

        <form className="user-header-search-wrap" onSubmit={handleSearchSubmit}>
          <input
            type="search"
            className="user-header-search-input"
            placeholder="Find your next favorite club..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            aria-label="Search listings"
          />
        </form>

        <nav className="user-header-right">
          {onMessages && (
            <button type="button" className="user-header-link" onClick={onMessages}>
              Messages
            </button>
          )}
          {onMyListings && (
            <button type="button" className="user-header-link" onClick={onMyListings}>
              My Listings
            </button>
          )}
          {onSell && (
            <button type="button" className="user-header-btn-sell" onClick={onSell}>
              + Sell
            </button>
          )}
          {onNotifications && (
            <button
              type="button"
              className="user-header-icon-btn"
              onClick={onNotifications}
              aria-label="Notifications"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </button>
          )}
          {onProfile && (
            <button
              type="button"
              className="user-header-icon-btn user-header-profile-btn"
              onClick={onProfile}
              aria-label="Profile"
            >
              {user?.profile_image ? (
                <img src={user.profile_image} alt="" className="user-header-avatar" />
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              )}
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}

export default UserHeader;
