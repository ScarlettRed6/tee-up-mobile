import { Menu, X } from 'lucide-react';
import './Header.css';
import Logo from './Logo';
import { ThemeToggle } from './ThemeToggle';

function Header({ menuOpen = false, onMenuToggle }) {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="header">
      <div className="header-left">
        <button
          type="button"
          className="header-menu-btn"
          onClick={onMenuToggle}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <div className="logo-container">
          <Logo size={36} />
        </div>
      </div>
      <div className="header-right">
        <nav className="header-nav">
          <a href="#" className="nav-link">Overview</a>
        </nav>
        <ThemeToggle variant="header" />
        <div className="date-container">
          <svg className="calendar-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2.667h-1.333V2c0-.367-.3-.667-.667-.667-.367 0-.667.3-.667.667v.667H6.667V2c0-.367-.3-.667-.667-.667-.367 0-.667.3-.667.667v.667H4c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2v-8c0-1.1-.9-2-2-2zm0 10H4v-6h8v6z" fill="currentColor"/>
          </svg>
          <span className="date-text">{currentDate}</span>
        </div>
      </div>
    </header>
  );
}

export default Header;
