import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Users from './components/Users';
import Listings from './components/Listings';
import Reports from './components/Reports';
import Login from './components/Login';
import './App.css';

function AppContent() {
  const { isAuthenticated, loading, logout, user } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  const handleLogout = () => {
    logout();
    setCurrentPage('dashboard'); // Reset to dashboard when logging out
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'users':
        // Admin and superadmin can access users page
        if (user?.role !== 'admin' && user?.role !== 'superadmin') {
          return <Dashboard />;
        }
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
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#F6EDE2',
        fontFamily: 'Exo, sans-serif'
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
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
