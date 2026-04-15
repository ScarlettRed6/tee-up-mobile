import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Users from './components/Users';
import Listings from './components/Listings';
import Reports from './components/Reports';
import Login from './components/Login';
import UserHome from './components/UserHome';
import HomePage from './components/HomePage';
import { ThemeToggle } from './components/ThemeToggle';
import { NotificationsProvider } from './context/NotificationsContext';
import LogoutConfirmModal from './components/LogoutConfirmModal';
import './App.css';

function AppContent() {
  const { isAuthenticated, loading, logout, user } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [authView, setAuthView] = useState('home'); // 'home' | 'login'
  const [loginInitialView, setLoginInitialView] = useState('login'); // 'login' | 'signup'
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

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
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ backgroundColor: 'var(--color-background)' }}
      >
        <div className="text-[var(--color-text-muted)]">Loading…</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (authView === 'login') {
      return (
        <Login
          initialView={loginInitialView}
          onBackToHome={() => setAuthView('home')}
        />
      );
    }
    return (
      <HomePage
        onOpenLogin={() => {
          setLoginInitialView('login');
          setAuthView('login');
        }}
        onOpenSignUp={() => {
          setLoginInitialView('signup');
          setAuthView('login');
        }}
      />
    );
  }

  if (!isAdmin) {
    return (
      <NotificationsProvider>
        <UserHome />
      </NotificationsProvider>
    );
  }

  return (
    <div className="app">
      <Header user={user} />
      <Sidebar
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
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
        <ThemeToggle />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
