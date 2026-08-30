import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Building2, Mail, ArrowLeft, Loader2, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successData, setSuccessData] = useState<{ message: string; reset_url?: string } | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please provide your registered email address.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/forgot-password', { email: email.trim() });
      setSuccessData(res.data);
      toast.success('Password reset link generated!');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg || 'Unable to request password reset. Please try again.');
      toast.error('Failed to generate reset link.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-bright flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-container/20 border border-primary/20 rounded-2xl mb-3 shadow-sm text-primary">
            <span className="material-symbols-outlined text-[32px]">shield_person</span>
          </div>
          <h1 className="font-headline-page text-headline-page text-on-surface">Cruvels Ltd.</h1>
          <p className="font-label-caps text-label-caps text-secondary mt-1 uppercase tracking-wider">
            Enterprise Workforce · Account Recovery
          </p>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-sm p-8">
          {!successData ? (
            <>
              <h2 className="font-headline-section text-headline-section text-on-surface font-semibold text-xl mb-1">
                Forgot Password
              </h2>
              <p className="font-body-sm text-xs text-secondary mb-6">
                Enter your registered corporate email to receive a secure recovery token.
              </p>

              {error && (
                <div className="mb-4 flex items-center gap-2 bg-status-inactive-bg border border-status-inactive-border rounded-xl px-3.5 py-2.5 text-error text-xs">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="recovery-email" className="form-label text-xs">Email address</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
                    <input
                      id="recovery-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. employee@company.com"
                      className="form-input pl-9 text-xs"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <button type="submit" className="btn-primary w-full justify-center mt-2 text-xs" disabled={isLoading}>
                  {isLoading ? <Loader2 size={16} className="animate-spin" /> : null}
                  <span>{isLoading ? 'Generating Link...' : 'Send Reset Link'}</span>
                </button>
              </form>
            </>
          ) : (
            <div className="space-y-4 text-center py-2">
              <div className="w-12 h-12 rounded-full bg-status-active-bg border border-status-active-border flex items-center justify-center text-status-active-text mx-auto">
                <CheckCircle2 size={24} />
              </div>
              <h2 className="font-headline-section text-headline-section text-on-surface font-semibold text-lg">Reset Link Ready</h2>
              <p className="font-body-sm text-xs text-secondary leading-relaxed">
                {successData.message}
              </p>

              {successData.reset_url && (
                <div className="mt-4 p-4 bg-surface-container-low rounded-xl border border-outline-variant/30 text-left space-y-2">
                  <span className="font-label-caps text-label-caps text-primary uppercase tracking-wider block">
                    Developer Demo Mode: Direct Link
                  </span>
                  <p className="font-body-sm text-xs text-secondary">
                    Click below to open the password reset screen with your generated token:
                  </p>
                  <Link
                    to={successData.reset_url}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline mt-1"
                  >
                    <span>Proceed to Reset Password</span>
                    <ExternalLink size={13} />
                  </Link>
                </div>
              )}
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

