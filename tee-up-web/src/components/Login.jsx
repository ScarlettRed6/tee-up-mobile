import { useState } from 'react';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert } from './ui/alert';
import { Sun, Moon } from 'lucide-react';

function Login() {
  const [theme, toggleTheme] = useTheme();
  const { login, register } = useAuth();
  const [view, setView] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setError('');
    setSuccess('');
    setEmail('');
    setPassword('');
    setName('');
    setConfirmPassword('');
  };

  const switchToSignUp = () => {
    resetForm();
    setView('signup');
  };

  const switchToLogin = () => {
    resetForm();
    setView('login');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    const result = await login(email, password);
    if (!result.success) setError(result.error || 'Login failed. Please try again.');
    setLoading(false);
  };

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    const result = await register(name, email, password, confirmPassword);
    if (result.success) {
      setSuccess('Account created! Check your email to verify, then sign in.');
      setView('login');
      resetForm();
    } else {
      setError(result.error || 'Sign up failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div
      className="min-h-screen flex flex-col md:flex-row"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      {/* Left: branding with golf scenery background */}
      <aside
        className="w-full md:w-[42%] min-h-[200px] md:min-h-screen flex flex-col justify-center items-center px-10 py-16 md:py-20 relative overflow-hidden bg-cover bg-center"
        style={{
          backgroundColor: 'var(--color-primary)',
          backgroundImage: `linear-gradient(to bottom, rgba(66, 122, 67, 0.88), rgba(66, 122, 67, 0.78)), url('https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=1200&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="text-center text-white max-w-sm relative z-10 login-brand-enter">
          <div
            className="text-5xl md:text-6xl font-bold tracking-tight mb-4"
            style={{
              fontFamily: 'var(--font-family)',
              letterSpacing: '-0.02em',
              textShadow: '0 2px 20px rgba(0,0,0,0.25), 0 0 1px rgba(0,0,0,0.3)',
            }}
          >
            TeeUp
          </div>
          {view === 'login' ? (
            <>
              <p className="text-2xl md:text-3xl font-semibold opacity-95">Welcome Back</p>
              <p className="text-white/90 mt-2 text-xl">Enter the clubhouse.</p>
            </>
          ) : (
            <>
              <p className="text-2xl md:text-3xl font-semibold opacity-95">Hello! Welcome!</p>
              <p className="text-white/90 mt-2 text-xl">Join the club.</p>
            </>
          )}
        </div>
      </aside>

      {/* Right: form with subtle pattern */}
      <main
        className="flex-1 flex flex-col items-center justify-center px-6 sm:px-12 py-16 md:py-20 relative"
        style={{
          backgroundColor: 'var(--color-background)',
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.04) 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      >
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="absolute top-6 right-6 p-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-white)] text-[var(--color-text-primary)] hover:opacity-90 hover:scale-105 transition-all duration-200 shadow-sm"
        >
          {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </button>

        <div className="w-full max-w-[400px] login-form-enter">
          {success && (
            <Alert
              className="mb-8 border-[var(--color-success)] bg-[var(--color-success)]/10 text-[var(--color-text-primary)]"
            >
              {success}
            </Alert>
          )}
          {error && (
            <Alert variant="destructive" className="mb-8">
              {error}
            </Alert>
          )}

          {view === 'login' ? (
              <form key="login" onSubmit={handleLoginSubmit} className="flex flex-col gap-8 login-form-stagger">
                <div className="flex flex-col gap-3">
                  <Label htmlFor="email" className="text-base">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    autoComplete="email"
                    className="h-12 text-[17px] transition-all duration-200 hover:border-[var(--color-primary)]/50"
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <Label htmlFor="password" className="text-base">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    autoComplete="current-password"
                    className="h-12 text-[17px] transition-all duration-200 hover:border-[var(--color-primary)]/50"
                  />
                </div>
                <Button
                  type="submit"
                  className="h-12 w-full text-base transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-lg active:translate-y-0 active:scale-100"
                  size="lg"
                  disabled={loading}
                >
                  {loading ? 'Signing in…' : 'Sign In'}
                </Button>
              </form>
            ) : (
              <form key="signup" onSubmit={handleSignUpSubmit} className="flex flex-col gap-8 login-form-stagger">
                <div className="flex flex-col gap-3">
                  <Label htmlFor="name" className="text-base">Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={loading}
                    autoComplete="name"
                    className="h-12 text-[17px] transition-all duration-200 hover:border-[var(--color-primary)]/50"
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <Label htmlFor="signup-email" className="text-base">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    autoComplete="email"
                    className="h-12 text-[17px] transition-all duration-200 hover:border-[var(--color-primary)]/50"
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <Label htmlFor="signup-password" className="text-base">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    autoComplete="new-password"
                    className="h-12 text-[17px] transition-all duration-200 hover:border-[var(--color-primary)]/50"
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <Label htmlFor="confirmPassword" className="text-base">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                    autoComplete="new-password"
                    className="h-12 text-[17px] transition-all duration-200 hover:border-[var(--color-primary)]/50"
                  />
                </div>
                <Button
                  type="submit"
                  className="h-12 w-full text-base transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-lg active:translate-y-0 active:scale-100"
                  size="lg"
                  disabled={loading}
                >
                  {loading ? 'Signing up…' : 'Sign Up'}
                </Button>
              </form>
            )}

          <p className="text-center text-[var(--color-text-muted)] mt-10 text-base">
            {view === 'login' ? (
              <>
                New here?{' '}
                <button
                  type="button"
                  onClick={switchToSignUp}
                  className="font-semibold text-[var(--color-primary)] underline underline-offset-2 hover:no-underline inline-flex items-center rounded-full px-4 py-1.5 -ml-2 transition-all duration-200 hover:bg-[var(--color-primary)]/10"
                >
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={switchToLogin}
                  className="font-semibold text-[var(--color-primary)] underline underline-offset-2 hover:no-underline inline-flex items-center rounded-full px-4 py-1.5 -ml-2 transition-all duration-200 hover:bg-[var(--color-primary)]/10"
                >
                  Log in
                </button>
              </>
            )}
          </p>
        </div>
      </main>
    </div>
  );
}

export default Login;
