import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Users from './components/Users';
import Listings from './components/Listings';
import Reports from './components/Reports';
import Login from './components/Login';
import UserHome from './components/UserHome';
import HomePage from './components/HomePage';
import './App.css';

function AppContent() {
  const { isAuthenticated, loading, logout, user } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [authView, setAuthView] = useState('home'); // 'home' | 'login'
  const [loginInitialView, setLoginInitialView] = useState('login'); // 'login' | 'signup'

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  const handleLogout = () => {
    logout();
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
    return <UserHome />;
  }

  return (
    <div className="app">
      <Header user={user} />
      <Sidebar
        onNavigate={setCurrentPage}
        currentPage={currentPage}
        onLogout={handleLogout}
        user={user}
      />
      {renderPage()}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
