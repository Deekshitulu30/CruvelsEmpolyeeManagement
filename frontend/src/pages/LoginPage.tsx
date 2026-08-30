import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('new_session') === 'true') {
      sessionStorage.removeItem('ems_token');
      sessionStorage.removeItem('ems_user');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) { setError('Please enter your work email.'); return; }
    if (!password)     { setError('Password cannot be blank.'); return; }

    setIsLoading(true);
    try {
      await login(email.trim(), password);
      toast.success('Welcome back! Loading your desk...');
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg || 'Hmm, that email or password did not match our records.');
      toast.error('Sign in failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const width = 500;
    const height = 650;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2.5;
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (googleClientId) {
      const redirectUri = window.location.origin + '/login';
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
        googleClientId
      )}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token%20id_token&scope=openid%20email%20profile&prompt=select_account`;
      window.open(googleAuthUrl, 'google_auth', `width=${width},height=${height},top=${top},left=${left},scrollbars=yes`);
    } else {
      const url = `https://accounts.google.com/AccountChooser?service=lso&continue=${encodeURIComponent(
        window.location.origin + '/login'
      )}&prompt=select_account`;
      window.open(url, 'google_account_picker', `width=${width},height=${height},top=${top},left=${left},scrollbars=yes`);
    }
  };

  const handleMicrosoftLogin = () => {
    const width = 500;
    const height = 650;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2.5;
    const msClientId = import.meta.env.VITE_MICROSOFT_CLIENT_ID;

    if (msClientId) {
      const redirectUri = window.location.origin + '/login';
      const msAuthUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${encodeURIComponent(
        msClientId
      )}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=openid%20profile%20email&prompt=select_account`;
      window.open(msAuthUrl, 'microsoft_auth', `width=${width},height=${height},top=${top},left=${left},scrollbars=yes`);
    } else {
      const url = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?prompt=select_account&response_type=token&client_id=common`;
      window.open(url, 'microsoft_account_picker', `width=${width},height=${height},top=${top},left=${left},scrollbars=yes`);
    }
  };

  const handleEnterpriseSso = () => {
    const ssoDomain = window.prompt('Enter your company SSO identity domain or work email:');
    if (ssoDomain && ssoDomain.trim()) {
      toast(`Connecting to ${ssoDomain.trim()} Enterprise SSO identity provider...`, { icon: '🔐' });
    }
  };

  return (
    <div className="bg-background text-on-background font-body-md h-screen w-screen overflow-hidden flex flex-col md:flex-row">
      <div className="hidden md:flex md:w-1/2 relative bg-surface-container-low flex-col justify-between p-margin-desktop overflow-hidden border-r border-outline-variant/30">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-primary-fixed opacity-30 blur-3xl mix-blend-multiply" />
          <div className="absolute top-[40%] -right-[20%] w-[60%] h-[60%] rounded-full bg-secondary-fixed opacity-30 blur-3xl mix-blend-multiply" />
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-primary text-on-primary font-bold text-lg flex items-center justify-center shadow-sm">
            C
          </div>
          <span className="font-headline-section text-headline-section font-bold text-primary">Cruvels</span>
        </div>

        <div className="relative z-10 max-w-md mt-auto mb-12">
          <h1 className="font-headline-page text-headline-page text-on-surface mb-3">Welcome back</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Sign in to manage your employee workspace. Intelligent HR operations for modern teams.
          </p>
        </div>

        <div className="relative z-10 w-[120%] -ml-[5%] glass-panel rounded-xl shadow-lg border border-outline-variant/20 p-6 flex flex-col gap-4 transform translate-y-6 rotate-[-1deg] transition-transform hover:rotate-0 duration-500">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-container/20 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-sm">groups</span>
              </div>
              <div>
                <div className="h-3 w-24 bg-surface-variant rounded-full mb-1" />
                <div className="h-2 w-16 bg-surface-container-high rounded-full" />
              </div>
            </div>
            <span className="font-label-caps text-label-caps text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded-full">
              Live Workspace
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            <div className="h-10 bg-primary/20 rounded-md" />
            <div className="h-12 bg-primary/30 rounded-md" />
            <div className="h-8 bg-primary/20 rounded-md" />
            <div className="h-14 bg-primary rounded-md" />
          </div>
        </div>
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-md space-y-6">
          <div className="md:hidden flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-md bg-primary text-on-primary font-bold flex items-center justify-center">
              C
            </div>
            <span className="font-headline-section font-bold text-primary text-lg">Cruvels</span>
          </div>

          <div>
            <h2 className="font-headline-section text-headline-section text-on-surface font-semibold text-2xl tracking-tight">
              Sign In
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              Enter your credentials to access your account.
            </p>
          </div>

          {error && (
            <div className="bg-error-container/20 border border-error/30 text-error p-3 rounded-lg flex items-start gap-2.5 text-xs font-body-sm animate-in fade-in">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
            <div>
              <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider mb-1.5 font-medium">
                Work Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline" />
                <input
                  type="email"
                  name="cruvels_user_email_no_autofill"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-surface-bright border border-outline-variant rounded-lg pl-10 pr-4 py-2.5 text-on-surface font-body-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-shadow placeholder:text-outline/60"
                  autoComplete="off"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider font-medium">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="font-body-sm text-xs text-primary hover:text-primary-container transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline" />
                <input
                  type="password"
                  name="cruvels_user_password_no_autofill"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-surface-bright border border-outline-variant rounded-lg pl-10 pr-4 py-2.5 text-on-surface font-body-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-shadow placeholder:text-outline/60"
                  autoComplete="new-password"
                  disabled={isLoading}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-primary hover:bg-surface-tint text-on-primary font-body-md font-medium py-3 px-4 rounded-full shadow-sm transition-all active:scale-[0.98] flex justify-center items-center gap-2 mt-2 cursor-pointer"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : null}
              <span>{isLoading ? 'Signing in...' : 'Sign in'}</span>
              {!isLoading && <span className="material-symbols-outlined text-[18px]">arrow_forward</span>}
            </button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-outline-variant/30" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-surface-container-lowest px-3 font-body-sm text-[11px] text-secondary">
                Or continue with
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-full border border-outline-variant/40 hover:border-outline bg-surface-container-low hover:bg-surface-container text-on-surface font-body-sm text-xs font-medium transition-all shadow-sm cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <button
              type="button"
              onClick={handleMicrosoftLogin}
              className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-full border border-outline-variant/40 hover:border-outline bg-surface-container-low hover:bg-surface-container text-on-surface font-body-sm text-xs font-medium transition-all shadow-sm cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 21 21">
                <rect x="1" y="1" width="9" height="9" fill="#f25022" />
                <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
                <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
                <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
              </svg>
              <span>Continue with Microsoft</span>
            </button>

            <button
              type="button"
              onClick={handleEnterpriseSso}
              className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-full border border-outline-variant/40 hover:border-outline bg-surface-container-low hover:bg-surface-container text-on-surface font-body-sm text-xs font-medium transition-all shadow-sm cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <circle cx="12" cy="11" r="3" />
                <path d="M12 14v3" />
              </svg>
              <span>Continue with Enterprise SSO</span>
            </button>
          </div>

          <p className="text-center font-body-sm text-body-sm text-on-surface-variant mt-6 text-xs">
            Don't have an account?{' '}
            <Link to="/signup" className="font-semibold text-primary hover:text-primary-container transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
