import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { ArrowRight, AlertCircle, Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [designation, setDesignation] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await api.post('/auth/signup', {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        designation: designation.trim() || 'Team Member',
        password,
      });

      login(res.data.token, res.data.user);
      toast.success('Workspace account created! Welcome to Cruvels Ltd.');
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg || 'Failed to create account. Please check your details.');
      toast.error('Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-bright flex items-center justify-center p-4 selection:bg-primary/20">
      <div className="relative w-full max-w-lg my-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-container/20 border border-primary/20 rounded-2xl mb-3 shadow-sm text-primary">
            <span className="material-symbols-outlined text-[32px]">person_add</span>
          </div>
          <div className="flex flex-col items-center justify-center gap-1 mb-1">
            <h1 className="font-headline-page text-headline-page text-on-surface">Cruvels Ltd.</h1>
            <span className="font-label-caps text-label-caps text-secondary uppercase tracking-wider">
              Employee Operations Platform
            </span>
          </div>
          <p className="font-body-sm text-xs text-secondary mt-1">Join your organization workspace in seconds</p>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-sm p-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-headline-section text-headline-section text-on-surface font-semibold text-lg">Create Account</h2>
            <span className="font-mono-data text-[11px] text-secondary">Fast Provisioning</span>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 bg-status-inactive-bg border border-status-inactive-border rounded-xl px-3.5 py-2.5 text-error text-xs leading-relaxed">
              <AlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="form-label text-xs">First Name *</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Vikram"
                  className="form-input text-xs"
                  required
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="form-label text-xs">Last Name *</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Sharma"
                  className="form-input text-xs"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="form-label text-xs">Work Email *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vikram@cruvels.com"
                className="form-input text-xs"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="form-label text-xs">Designation / Role Title</label>
              <input
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="Software Engineer, Product Designer, etc."
                className="form-input text-xs"
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="form-label text-xs">Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="form-input pr-10 text-xs"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="form-label text-xs">Confirm Password *</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="form-input text-xs"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="text-[11px] text-secondary space-y-1 pt-1 font-body-sm">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={12} className={password.length >= 8 ? 'text-status-active-text' : 'text-outline'} />
                <span>At least 8 characters</span>
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary w-full justify-center mt-2 py-3 text-xs"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 size={15} className="animate-spin" /> : null}
              <span>{isLoading ? 'Provisioning Account...' : 'Complete Registration'}</span>
              {!isLoading && <ArrowRight size={14} />}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-outline-variant/30 text-center text-xs text-secondary font-body-sm">
            <span>Already have an account? </span>
            <Link to="/login" className="text-primary hover:underline font-semibold transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
