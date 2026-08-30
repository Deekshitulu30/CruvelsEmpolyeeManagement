import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Building2, Lock, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const queryToken = searchParams.get('token');
    if (queryToken) {
      setToken(queryToken);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token.trim()) {
      setError('A valid reset token is required.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      await api.post('/auth/reset-password', {
        token: token.trim(),
        new_password: newPassword,
      });
      setIsSuccess(true);
      toast.success('Password reset successfully!');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg || 'Unable to reset password. The link may have expired.');
      toast.error('Password reset failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-bright flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-container/20 border border-primary/20 rounded-2xl mb-3 shadow-sm text-primary">
            <span className="material-symbols-outlined text-[32px]">lock_reset</span>
          </div>
          <h1 className="font-headline-page text-headline-page text-on-surface">Cruvels Ltd.</h1>
          <p className="font-label-caps text-label-caps text-secondary mt-1 uppercase tracking-wider">
            Enterprise Workforce · Security & Password Reset
          </p>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-sm p-8">
          {!isSuccess ? (
            <>
              <h2 className="font-headline-section text-headline-section text-on-surface font-semibold text-xl mb-1">
                Create New Password
              </h2>
              <p className="font-body-sm text-xs text-secondary mb-6">
                Please choose a strong password with at least 6 characters.
              </p>

              {error && (
                <div className="mb-4 flex items-center gap-2 bg-status-inactive-bg border border-status-inactive-border rounded-xl px-3.5 py-2.5 text-error text-xs">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="token" className="form-label text-xs">Reset Token</label>
                  <input
                    id="token"
                    type="text"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Paste your 64-char token if not prefilled"
                    className="form-input font-mono-data text-xs"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label htmlFor="new-password" className="form-label text-xs">New Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
                    <input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="form-input pl-9 text-xs"
                      minLength={6}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="confirm-password" className="form-label text-xs">Confirm New Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
                    <input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="form-input pl-9 text-xs"
                      minLength={6}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <button type="submit" className="btn-primary w-full justify-center mt-2 text-xs" disabled={isLoading}>
                  {isLoading ? <Loader2 size={16} className="animate-spin" /> : null}
                  <span>{isLoading ? 'Updating Password...' : 'Reset Password'}</span>
                </button>
              </form>
            </>
          ) : (
            <div className="space-y-4 text-center py-2">
              <div className="w-12 h-12 rounded-full bg-status-active-bg border border-status-active-border flex items-center justify-center text-status-active-text mx-auto">
                <CheckCircle2 size={24} />
              </div>
              <h2 className="font-headline-section text-headline-section text-on-surface font-semibold text-lg">Password Updated!</h2>
              <p className="font-body-sm text-xs text-secondary leading-relaxed">
                Your account password has been updated. You can now sign in with your new credentials.
              </p>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="btn-primary w-full justify-center mt-4 text-xs"
              >
                Sign In Now
              </button>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-outline-variant/30 text-center">
            <Link to="/login" className="inline-flex items-center gap-2 text-xs text-secondary hover:text-on-surface transition-colors font-body-sm">
              <ArrowLeft size={14} /> Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

