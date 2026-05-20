import { useCallback, useEffect, useMemo, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPromptProvider } from './context/LoginPromptContext';
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Users from './components/Users';
import Listings from './components/Listings';
import Reports from './components/Reports';
import Login from './components/Login';
import UserHome from './components/UserHome';
import { ThemeToggle } from './components/ThemeToggle';
import { NotificationsProvider } from './context/NotificationsContext';
import LogoutConfirmModal from './components/LogoutConfirmModal';
import { AuthCheckLoadingSkeleton } from './components/admin/AdminSkeletons';
import { stripOAuthQueryParams } from './utils/oauthErrors';
import './App.css';
import './components/admin/AdminResponsive.css';

function AppContent() {
  const { isAuthenticated, loading, logout, user } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  /** Guest: marketplace (browse) or auth form */
  const [authView, setAuthView] = useState('browse'); // 'login' | 'browse'
  const [loginInitialView, setLoginInitialView] = useState('login'); // 'login' | 'signup'
  const [loginSessionKey, setLoginSessionKey] = useState(0);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('auth') === 'login' || params.get('error')) {
      setAuthView('login');
    }
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
  }, [currentPage]);

  useEffect(() => {
    if (!sidebarOpen) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setSidebarOpen(false);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [sidebarOpen]);

  const goLogin = useCallback((_fromBrowse, tab) => {
    if (loading || isAuthenticated) return;
    stripOAuthQueryParams();
    setLoginInitialView(tab === 'signup' ? 'signup' : 'login');
    setLoginSessionKey((k) => k + 1);
    setAuthView('login');
  }, [loading, isAuthenticated]);

  const loginPromptApi = useMemo(
    () => ({
      openLogin: (opts = {}) => goLogin(Boolean(opts.fromBrowse), opts.tab === 'signup' ? 'signup' : 'login'),
    }),
    [goLogin]
  );

  const handleLoginScreenBack = useCallback(() => {
    stripOAuthQueryParams();
    setAuthView('browse');
  }, []);

  useEffect(() => {
    if (authView === 'browse') stripOAuthQueryParams();
  }, [authView]);

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  const confirmLogout = () => {
    logout();
    setLogoutModalOpen(false);
    setCurrentPage('dashboard');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'users':
        if (!isAdmin) return <Dashboard />;
        return <Users />;
      case 'listings':
        return <Listings />;
      case 'reports':
        return <Reports />;
      case 'dashboard':
      default:
        return (
          <Dashboard
            onViewUsers={() => setCurrentPage('users')}
            onViewReports={() => setCurrentPage('reports')}
          />
        );
    }
  };

  if (loading) {
    return <AuthCheckLoadingSkeleton />;
  }

  if (!isAuthenticated) {
    if (authView === 'login') {
      return (
        <LoginPromptProvider value={loginPromptApi}>
          <>
            <Login
              key={loginSessionKey}
              initialView={loginInitialView}
              onBackToHome={handleLoginScreenBack}
            />
            <ThemeToggle />
          </>
        </LoginPromptProvider>
      );
    }
    return (
      <LoginPromptProvider value={loginPromptApi}>
        <NotificationsProvider>
          <>
            <UserHome guest />
            <ThemeToggle />
          </>
        </NotificationsProvider>
      </LoginPromptProvider>
    );
  }

  if (!isAdmin) {
    return (
      <LoginPromptProvider value={loginPromptApi}>
        <NotificationsProvider>
          <>
            <UserHome />
            <ThemeToggle />
          </>
        </NotificationsProvider>
      </LoginPromptProvider>
    );
  }

  return (
    <LoginPromptProvider value={loginPromptApi}>
    <div className={`app app--admin${sidebarOpen ? ' app--sidebar-open' : ''}`}>
      <Header
        user={user}
        menuOpen={sidebarOpen}
        onMenuToggle={() => setSidebarOpen((open) => !open)}
      />
      {sidebarOpen ? (
        <button
          type="button"
          className="admin-sidebar-backdrop"
          aria-label="Close navigation menu"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNavigate={setCurrentPage}
        currentPage={currentPage}
        onLogout={() => setLogoutModalOpen(true)}
        user={user}
      />
      {renderPage()}
      <LogoutConfirmModal
        open={logoutModalOpen}
        roleLabel={user?.role === 'superadmin' ? 'super admin' : 'admin'}
        onCancel={() => setLogoutModalOpen(false)}
        onConfirm={confirmLogout}
      />
    </div>
    </LoginPromptProvider>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
