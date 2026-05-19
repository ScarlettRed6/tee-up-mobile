import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { sendEmailVerification, verifyEmailOtp } from '../api/authApi';
import GoogleRedirectSignIn from './GoogleRedirectSignIn';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert } from './ui/alert';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { normalizeOAuthErrorParam, stripOAuthQueryParams } from '../utils/oauthErrors';
import './Login.css';

const authInputPad = { paddingInline: '1rem', paddingBlock: '0.75rem' };

const authInputClass =
  'min-h-[48px] text-[16px] leading-normal transition-all duration-200 hover:border-[var(--color-primary)]/50';

const authBtnClass =
  'login-auth-btn h-12 w-full text-base transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.01] hover:shadow-md active:translate-y-0 active:scale-100';

function AuthTextField({ className, style, ...props }) {
  return (
    <Input
      className={cn(authInputClass, className)}
      style={{ ...authInputPad, ...style }}
      {...props}
    />
  );
}

function AuthPasswordField({ className, style, id, disabled, ...props }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="auth-password-wrap">
      <Input
        id={id}
        type={visible ? 'text' : 'password'}
        disabled={disabled}
        className={cn('auth-password-input', authInputClass, className)}
        style={{ ...authInputPad, ...style }}
        {...props}
      />
      <button
        type="button"
        className="auth-password-toggle"
        onClick={() => setVisible((v) => !v)}
        disabled={disabled}
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
        aria-controls={id}
        tabIndex={0}
      >
        {visible ? <EyeOff className="h-5 w-5" aria-hidden /> : <Eye className="h-5 w-5" aria-hidden />}
      </button>
    </div>
  );
}

function Login({ initialView = 'login', onBackToHome }) {
  const { login, register } = useAuth();
  const [view, setView] = useState(initialView);
  const pendingPasswordRef = useRef(null);

  useEffect(() => {
    setView(initialView);
  }, [initialView]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthError = params.get('error');
    stripOAuthQueryParams();
    if (!oauthError) return;
    const message = normalizeOAuthErrorParam(oauthError);
    if (message) setError(message);
  }, []);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verifyEmail, setVerifyEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [verifyNotice, setVerifyNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const resetForm = () => {
    setError('');
    setSuccess('');
    setEmail('');
    setPassword('');
    setName('');
    setConfirmPassword('');
    setOtp('');
    setVerifyEmail('');
    setVerifyNotice('');
    pendingPasswordRef.current = null;
  };

  const switchToSignUp = () => {
    resetForm();
    setView('signup');
  };

  const switchToLogin = () => {
    resetForm();
    setView('login');
  };

  const goBackToLoginFromVerify = () => {
    pendingPasswordRef.current = null;
    const keep = verifyEmail.trim();
    setVerifyEmail('');
    setOtp('');
    setError('');
    setSuccess('');
    setVerifyNotice('');
    if (keep) setEmail(keep);
    setView('login');
  };

  const handleBackToHomeClick = () => {
    pendingPasswordRef.current = null;
    resetForm();
    stripOAuthQueryParams();
    onBackToHome?.();
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    const result = await login(email, password);
    if (!result.success) {
      if (result.needsEmailVerification && result.email) {
        setVerifyEmail(result.email);
        setOtp('');
        pendingPasswordRef.current = null;
        setSuccess('');
        setVerifyNotice(
          'This email is not verified yet. Enter the code from your inbox, or resend a new code.'
        );
        setView('verify');
      } else {
        setError(result.error || 'Login failed. Please try again.');
      }
    }
    setLoading(false);
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const code = otp.replace(/\s/g, '').trim();
    if (!/^\d{6}$/.test(code)) {
      setError('Enter the 6-digit code from your email.');
      return;
    }
    setLoading(true);
    try {
      await verifyEmailOtp(verifyEmail.trim(), code);
      setVerifyNotice('');
      const pwd = pendingPasswordRef.current;
      pendingPasswordRef.current = null;
      setOtp('');
      if (pwd) {
        const loginResult = await login(verifyEmail.trim(), pwd);
        if (loginResult.success) return;
        setError(loginResult.error || 'Could not sign you in. Try signing in manually.');
        setEmail(verifyEmail.trim());
        setVerifyEmail('');
        setView('login');
        return;
      }
      setSuccess('Email verified. Sign in to continue.');
      setEmail(verifyEmail.trim());
      setVerifyEmail('');
      setView('login');
    } catch (err) {
      setError(
        err.response?.data?.message || err.response?.data?.error || 'Verification failed'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    const target = verifyEmail.trim();
    if (!target) return;
    setError('');
    setResendLoading(true);
    try {
      await sendEmailVerification(target);
      setSuccess('New verification code sent. Check your inbox.');
    } catch (err) {
      setSuccess('');
      setError(
        err.response?.data?.message || err.response?.data?.error || 'Could not resend code'
      );
    } finally {
      setResendLoading(false);
    }
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
    const signupEmail = email.trim();
    const result = await register(name, signupEmail, password, confirmPassword);
    if (result.success) {
      pendingPasswordRef.current = password;
      setVerifyEmail(result.email || signupEmail);
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setOtp('');
      setError('');
      setVerifyNotice('');
      setSuccess(
        'We sent a 6-digit code to your email. Enter it below to verify your account.'
      );
      setView('verify');
    } else {
      setError(result.error || 'Sign up failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div
      className="login-auth-page min-h-screen flex flex-col md:flex-row md:h-screen md:max-h-screen"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      {/* Left: branding with golf scenery background */}
      <aside
        className="login-auth-aside w-full md:w-[42%] min-h-[160px] md:min-h-0 md:h-full flex flex-col justify-center items-center px-8 py-10 md:py-12 relative overflow-hidden bg-cover bg-center"
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
          ) : view === 'signup' ? (
            <>
              <p className="text-2xl md:text-3xl font-semibold opacity-95">Hello! Welcome!</p>
              <p className="text-white/90 mt-2 text-xl">Join the club.</p>
            </>
          ) : (
            <>
              <p className="text-2xl md:text-3xl font-semibold opacity-95">Verify your email</p>
              <p className="text-white/90 mt-2 text-xl">Almost there — enter your code.</p>
            </>
          )}
        </div>
      </aside>

      {/* Right: form with subtle pattern */}
      <main
        className="login-auth-main flex-1 flex flex-col items-center justify-center px-6 sm:px-10 py-8 md:py-10 relative"
        style={{
          backgroundColor: 'var(--color-background)',
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.04) 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      >
        {onBackToHome ? (
          <div className="absolute top-6 right-6 flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={handleBackToHomeClick}>
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Back to home
            </Button>
          </div>
        ) : null}

        <div className="w-full max-w-[400px] login-form-enter login-auth-panel">
          <div className="login-auth-alerts">
            {success && (
              <Alert className="login-auth-alert-compact border-[var(--color-success)] bg-[var(--color-success)]/10 text-[var(--color-text-primary)]">
                {success}
              </Alert>
            )}
            {view === 'verify' && verifyNotice && (
              <Alert variant="default" className="login-auth-alert-compact app-form-notice">
                {verifyNotice}
              </Alert>
            )}
            {error && (
              <Alert variant="destructive" className="login-auth-alert-compact">
                {error}
              </Alert>
            )}
          </div>

          {view === 'verify' ? (
            <form key="verify" onSubmit={handleVerifySubmit} className="login-auth-form login-form-stagger">
              <p className="login-auth-hint text-[var(--color-text-secondary)]">
                Code sent to <span className="font-semibold text-[var(--color-text-primary)]">{verifyEmail}</span>
              </p>
              <div className="login-auth-field">
                <Label htmlFor="otp" className="login-auth-label">Verification code</Label>
                <AuthTextField
                  id="otp"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  pattern="[0-9]*"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  disabled={loading}
                />
              </div>
              <Button type="submit" className={authBtnClass} size="lg" disabled={loading}>
                {loading ? 'Verifying…' : 'Verify email'}
              </Button>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto"
                  disabled={loading || resendLoading}
                  onClick={handleResendCode}
                >
                  {resendLoading ? 'Sending…' : 'Resend code'}
                </Button>
                <Button type="button" variant="link" className="w-full sm:w-auto p-0 h-auto font-semibold" onClick={goBackToLoginFromVerify}>
                  Back to sign in
                </Button>
              </div>
            </form>
          ) : view === 'login' ? (
            <form key="login" onSubmit={handleLoginSubmit} className="login-auth-form login-form-stagger">
              <div className="login-auth-field">
                <Label htmlFor="email" className="login-auth-label">Email</Label>
                <AuthTextField
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
              <div className="login-auth-field">
                <Label htmlFor="password" className="login-auth-label">Password</Label>
                <AuthPasswordField
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="current-password"
                />
              </div>
              <Button type="submit" className={authBtnClass} size="lg" disabled={loading}>
                {loading ? 'Signing in…' : 'Sign In'}
              </Button>
              <div className="login-divider" aria-hidden>
                <span>or</span>
              </div>
              <GoogleRedirectSignIn disabled={loading} />
            </form>
          ) : (
            <form key="signup" onSubmit={handleSignUpSubmit} className="login-auth-form login-auth-form--signup login-form-stagger">
              <div className="login-auth-field">
                <Label htmlFor="name" className="login-auth-label">Name</Label>
                <AuthTextField
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="name"
                />
              </div>
              <div className="login-auth-field">
                <Label htmlFor="signup-email" className="login-auth-label">Email</Label>
                <AuthTextField
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
              <div className="login-auth-field-pair">
              <div className="login-auth-field">
                <Label htmlFor="signup-password" className="login-auth-label">Password</Label>
                <AuthPasswordField
                  id="signup-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="new-password"
                />
              </div>
              <div className="login-auth-field">
                <Label htmlFor="confirmPassword" className="login-auth-label">Confirm password</Label>
                <AuthPasswordField
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="new-password"
                />
              </div>
              </div>
              <Button type="submit" className={authBtnClass} size="lg" disabled={loading}>
                {loading ? 'Signing up…' : 'Sign Up'}
              </Button>
              <div className="login-divider" aria-hidden>
                <span>or</span>
              </div>
              <GoogleRedirectSignIn disabled={loading} />
            </form>
          )}

          {view !== 'verify' ? (
            <p className="login-auth-footer text-center text-[var(--color-text-muted)]">
              {view === 'login' ? (
                <>
                  New here?{' '}
                  <Button type="button" variant="link" className="p-0 h-auto font-semibold" onClick={switchToSignUp}>
                    Create an account
                  </Button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <Button type="button" variant="link" className="p-0 h-auto font-semibold" onClick={switchToLogin}>
                    Log in
                  </Button>
                </>
              )}
            </p>
          ) : null}
        </div>
      </main>
    </div>
  );
}

export default Login;
