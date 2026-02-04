import './Header.css';
import { useTheme } from '../hooks/useTheme';

function Header() {
  const [theme, toggleTheme] = useTheme();
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <header className="header">
      <div className="header-left">
        <div className="logo-container">
          <div className="logo-circle"></div>
          <span className="logo-text">Tee Up</span>
        </div>
      </div>
      <div className="header-right">
        <nav className="header-nav">
          <a href="#" className="nav-link">Overview</a>
        </nav>
        <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'light' ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>
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

