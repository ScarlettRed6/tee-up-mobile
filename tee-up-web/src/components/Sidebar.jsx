import './Sidebar.css';

function Sidebar({ onNavigate, currentPage, onLogout, user }) {
  const handleNavClick = (e, page) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate(page);
    }
  };

  const handleLogout = (e) => {
    e.preventDefault();
    if (onLogout) {
      onLogout();
    }
  };

  const getRoleDisplay = (role) => {
    if (role === 'superadmin') return 'Super Admin';
    if (role === 'admin') return 'Admin';
    return 'User';
  };

  return (
    <aside className="sidebar">
      <div className="user-profile">
        <div className="avatar"></div>
        <div className="user-info">
          <div className="user-name">{user?.name || 'Admin User'}</div>
          <div className="user-role">{getRoleDisplay(user?.role)}</div>
        </div>
      </div>
      <nav className="sidebar-nav">
        <a 
          href="#" 
          className={`nav-item ${currentPage === 'dashboard' ? 'active' : ''}`}
          onClick={(e) => handleNavClick(e, 'dashboard')}
        >
          Dashboard
        </a>
        <a 
          href="#" 
          className={`nav-item ${currentPage === 'listings' ? 'active' : ''}`}
          onClick={(e) => handleNavClick(e, 'listings')}
        >
          Listings Management
        </a>
        <a 
          href="#" 
          className={`nav-item ${currentPage === 'reports' ? 'active' : ''}`}
          onClick={(e) => handleNavClick(e, 'reports')}
        >
          Reports
        </a>
        <a 
          href="#" 
          className={`nav-item ${currentPage === 'users' ? 'active' : ''}`}
          onClick={(e) => handleNavClick(e, 'users')}
        >
          Users
        </a>
        <a 
          href="#" 
          className="nav-item nav-item-logout"
          onClick={handleLogout}
        >
          Log Out
        </a>
      </nav>
    </aside>
  );
}

export default Sidebar;

