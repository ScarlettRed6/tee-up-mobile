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
import './App.css';

function AppContent() {
  const { isAuthenticated, loading, logout, user } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

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
        return <Dashboard />;
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
    return <Login />;
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
