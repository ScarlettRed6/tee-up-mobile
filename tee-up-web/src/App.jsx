import { useCallback, useMemo, useState } from 'react';
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
import { Skeleton } from './components/ui/skeleton';
import './App.css';

function AppContent() {
  const { isAuthenticated, loading, logout, user } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  /** Guest: marketplace (browse) or auth form */
  const [authView, setAuthView] = useState('browse'); // 'login' | 'browse'
  const [loginInitialView, setLoginInitialView] = useState('login'); // 'login' | 'signup'
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  const goLogin = useCallback((_fromBrowse, tab) => {
    if (loading || isAuthenticated) return;
    setLoginInitialView(tab === 'signup' ? 'signup' : 'login');
    setAuthView('login');
  }, [loading, isAuthenticated]);

  const loginPromptApi = useMemo(
    () => ({
      openLogin: (opts = {}) => goLogin(Boolean(opts.fromBrowse), opts.tab === 'signup' ? 'signup' : 'login'),
    }),
    [goLogin]
  );

  const handleLoginScreenBack = useCallback(() => {
    setAuthView('browse');
  }, []);

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
      <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--color-background)' }}>
        <div className="mx-auto max-w-[1280px] space-y-6">
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-9 w-24" />
            </div>
          </div>
          <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-4 space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-6 space-y-4">
              <Skeleton className="h-8 w-56" />
              <Skeleton className="h-5 w-72" />
              <div className="grid gap-4 md:grid-cols-3">
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (authView === 'login') {
      return (
        <LoginPromptProvider value={loginPromptApi}>
          <>
            <Login initialView={loginInitialView} onBackToHome={handleLoginScreenBack} />
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
