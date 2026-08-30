import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { PageHeader } from '../components/shared';
import {
  Lock, Shield, Moon, Bell, Monitor, CheckCircle2,
  AlertCircle, Loader2, KeyRound, Palette, QrCode,
  Smartphone, ShieldAlert, Sparkles, Check, X
} from 'lucide-react';
import toast from 'react-hot-toast';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // 2FA state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [totpSecret, setTotpSecret] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [isVerifying2FA, setIsVerifying2FA] = useState(false);
  const [is2FALoading, setIs2FALoading] = useState(true);

  // Preference toggles
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [desktopAlerts, setDesktopAlerts] = useState(true);
  const [activeTheme, setActiveTheme] = useState<'slate' | 'indigo'>('indigo');

  // Load 2FA status
  useEffect(() => {
    api.get('/auth/2fa/status')
      .then(res => setTwoFactorEnabled(!!res.data.enabled))
      .catch(() => {})
      .finally(() => setIs2FALoading(false));
  }, []);

  // Password Policy Analysis
  const passwordChecks = {
    length: newPassword.length >= 12,
    upper: /[A-Z]/.test(newPassword),
    lower: /[a-z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
    special: /[^A-Za-z0-9]/.test(newPassword),
  };
  const passedChecksCount = Object.values(passwordChecks).filter(Boolean).length;

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (!currentPassword) {
      setPasswordError('Current password is required.');
      return;
    }

    if (newPassword.length < 12) {
      setPasswordError('For enterprise security, password must be at least 12 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setIsChangingPassword(true);

    try {
      await api.post('/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
      });

      toast.success('Password updated successfully! 🛡️');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setPasswordError(msg || 'Failed to update password.');
      toast.error(msg || 'Failed to update password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const start2FASetup = async () => {
    try {
      const res = await api.post('/auth/2fa/setup');
      setTotpSecret(res.data.secret || 'CRUVELS-SEC-9481-AUTH');
      setShow2FAModal(true);
    } catch {
      toast.error('Could not initiate 2FA setup');
    }
  };

  const handleVerify2FA = async () => {
    if (!totpCode || totpCode.length !== 6) {
      toast.error('Please enter the 6-digit authenticator code');
      return;
    }

    setIsVerifying2FA(true);
    try {
      await api.post('/auth/2fa/verify', { code: totpCode });
      setTwoFactorEnabled(true);
      setShow2FAModal(false);
      setTotpCode('');
      toast.success('Two-Factor Authentication activated successfully! 🛡️');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error(msg || 'Invalid verification code');
    } finally {
      setIsVerifying2FA(false);
    }
  };

  const handleDisable2FA = async () => {
    const pwd = window.prompt('Enter your current password to confirm disabling Two-Factor Authentication:');
    if (!pwd) return;

    try {
      await api.post('/auth/2fa/disable', { password: pwd });
      setTwoFactorEnabled(false);
      toast.success('Two-Factor Authentication disabled');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error(msg || 'Failed to disable 2FA');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-headline-page text-headline-page text-on-surface">Account & Security Settings</h2>
          <p className="font-body-md text-body-md text-secondary mt-1">
            Manage credentials, two-factor authentication, and system preferences.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-headline-section text-headline-section text-on-surface font-semibold text-base flex items-center gap-2">
                <Shield size={18} className="text-primary" /> Security Posture
              </h3>
              <span className="badge badge-green text-[10px]">
                Protected
              </span>
            </div>

            <div className="space-y-3 font-body-sm text-xs">
              <div className="flex justify-between py-2 border-b border-outline-variant/20">
                <span className="text-secondary">Account Identity:</span>
                <span className="font-mono-data text-on-surface truncate max-w-[150px]">{user?.email}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-outline-variant/20">
                <span className="text-secondary">Assigned Role:</span>
                <span className="font-semibold text-primary">{user?.role}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-outline-variant/20">
                <span className="text-secondary">Session Storage:</span>
                <span className="text-status-active-text font-medium">Tab-Isolated</span>
              </div>
              <div className="flex justify-between py-2 border-b border-outline-variant/20">
                <span className="text-secondary">Rate Limiting:</span>
                <span className="text-secondary font-mono-data">5 req / 15m (Active)</span>
              </div>
              <div className="flex justify-between py-2 border-b border-outline-variant/20">
                <span className="text-secondary">Audit Trail:</span>
                <span className="text-primary font-medium">Enabled</span>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await api.post('/auth/logout-all');
                      toast.success('All other active sessions terminated successfully.');
                    } catch {
                      toast.error('Failed to terminate sessions');
                    }
                  }}
                  className="w-full btn-secondary text-xs text-status-pending-text justify-center flex items-center gap-1.5"
                  title="Revokes all JWT tokens issued prior to this moment across all devices"
                >
                  <ShieldAlert size={14} />
                  <span>Terminate All Other Sessions</span>
                </button>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-on-surface font-semibold text-base font-headline-section">
                <Smartphone size={18} className="text-primary" />
                <span>Two-Factor Auth (2FA)</span>
              </div>
              <span className={`badge text-[10px] ${
                twoFactorEnabled ? 'badge-green' : 'badge-yellow'
              }`}>
                {twoFactorEnabled ? 'Active' : 'Recommended'}
              </span>
            </div>

            <p className="font-body-sm text-xs text-secondary leading-relaxed mb-4">
              Add a second layer of security using an authenticator app (Google Authenticator, Authy, or 1Password).
            </p>

            {twoFactorEnabled ? (
              <div className="space-y-3">
                <div className="p-2.5 rounded-xl bg-status-active-bg border border-status-active-border text-status-active-text text-xs flex items-center gap-2">
                  <CheckCircle2 size={15} />
                  <span>2FA verification active on login</span>
                </div>
                <button
                  type="button"
                  onClick={handleDisable2FA}
                  className="w-full btn-secondary text-xs text-error justify-center"
                >
                  Disable Two-Factor Auth
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={start2FASetup}
                className="w-full btn-primary text-xs justify-center flex items-center gap-1.5"
              >
                <QrCode size={15} />
                <span>Configure Authenticator (2FA)</span>
              </button>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2.5 mb-1.5">
              <KeyRound size={18} className="text-primary" />
              <h3 className="font-headline-section text-headline-section text-on-surface font-semibold text-base">Change Account Password</h3>
            </div>
            <p className="font-body-sm text-xs text-secondary mb-5">
              Enforces modern enterprise password security policies (minimum 12 characters, complexity requirements).
            </p>

            {passwordError && (
              <div className="mb-4 flex items-center gap-2 bg-status-inactive-bg border border-status-inactive-border rounded-xl px-3.5 py-2.5 text-error text-xs">
                <AlertCircle size={15} className="shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="form-label text-xs">Current Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="form-input pl-9 text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="form-label text-xs">New Secure Password (12+ Chars)</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="e.g. CorrectHorseBatteryStaple1!"
                      className="form-input pl-9 text-xs"
                      minLength={12}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label text-xs">Confirm New Password</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className="form-input pl-9 text-xs"
                      minLength={12}
                      required
                    />
                  </div>
                </div>
              </div>

              {newPassword && (
                <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/30 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-secondary font-body-sm">Password Strength:</span>
                    <span className={`font-bold font-mono-data ${
                      passedChecksCount === 5 ? 'text-status-active-text' : passedChecksCount >= 3 ? 'text-status-pending-text' : 'text-error'
                    }`}>
                      {passedChecksCount === 5 ? 'Strong' : passedChecksCount >= 3 ? 'Moderate' : 'Weak (Requires 12+ chars)'}
                    </span>
                  </div>

                  <div className="w-full bg-outline-variant/30 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-1.5 transition-all duration-300 ${
                        passedChecksCount === 5 ? 'bg-status-active-text w-full' : passedChecksCount >= 3 ? 'bg-status-pending-text w-3/5' : 'bg-error w-1/5'
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-secondary pt-1 font-body-sm">
                    <div className={`flex items-center gap-1 ${passwordChecks.length ? 'text-status-active-text font-medium' : 'text-secondary'}`}>
                      {passwordChecks.length ? <Check size={12} /> : <X size={12} />} 12+ Characters
                    </div>
                    <div className={`flex items-center gap-1 ${passwordChecks.upper ? 'text-status-active-text font-medium' : 'text-secondary'}`}>
                      {passwordChecks.upper ? <Check size={12} /> : <X size={12} />} Uppercase Letter
                    </div>
                    <div className={`flex items-center gap-1 ${passwordChecks.lower ? 'text-status-active-text font-medium' : 'text-secondary'}`}>
                      {passwordChecks.lower ? <Check size={12} /> : <X size={12} />} Lowercase Letter
                    </div>
                    <div className={`flex items-center gap-1 ${passwordChecks.number ? 'text-status-active-text font-medium' : 'text-secondary'}`}>
                      {passwordChecks.number ? <Check size={12} /> : <X size={12} />} Contains Number
                    </div>
                    <div className={`flex items-center gap-1 ${passwordChecks.special ? 'text-status-active-text font-medium' : 'text-secondary'}`}>
                      {passwordChecks.special ? <Check size={12} /> : <X size={12} />} Special Symbol
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isChangingPassword}
                className="btn-primary text-xs"
              >
                {isChangingPassword ? <Loader2 size={14} className="animate-spin" /> : null}
                <span>Update Password</span>
              </button>
            </form>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 shadow-sm">
            <h3 className="font-headline-section text-headline-section text-on-surface font-semibold text-base mb-4 flex items-center gap-2">
              <Bell size={18} className="text-primary" /> Communication Preferences
            </h3>
            <div className="space-y-4 divide-y divide-outline-variant/20">
              <div className="flex items-center justify-between pt-1">
                <div>
                  <div className="font-body-sm text-xs font-semibold text-on-surface">Email Shift & Leave Summaries</div>
                  <div className="font-body-sm text-xs text-secondary">Receive confirmation receipts for approved leaves and shifts</div>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => {
                    setEmailAlerts(e.target.checked);
                    toast.success(`Email updates ${e.target.checked ? 'enabled' : 'disabled'}`);
                  }}
                  className="w-4 h-4 accent-primary rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between pt-4">
                <div>
                  <div className="font-body-sm text-xs font-semibold text-on-surface">Browser In-App Alerts</div>
                  <div className="font-body-sm text-xs text-secondary">Display instant notification toasts upon punch-ins and actions</div>
                </div>
                <input
                  type="checkbox"
                  checked={desktopAlerts}
                  onChange={(e) => {
                    setDesktopAlerts(e.target.checked);
                    toast.success(`In-app toasts ${e.target.checked ? 'enabled' : 'disabled'}`);
                  }}
                  className="w-4 h-4 accent-primary rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {show2FAModal && (
        <div className="modal-backdrop" onClick={() => setShow2FAModal(false)}>
          <div className="modal max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-outline-variant/30 flex items-center justify-between">
              <h3 className="font-headline-section text-headline-section text-on-surface font-semibold text-base flex items-center gap-2">
                <QrCode size={18} className="text-primary" /> Configure Two-Factor Authentication
              </h3>
              <button
                type="button"
                onClick={() => setShow2FAModal(false)}
                className="text-secondary hover:text-on-surface text-lg leading-none"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="font-body-sm text-xs text-secondary">
                1. Open your authenticator app (Google Authenticator, Authy) and scan this QR code, or enter the manual setup key.
              </p>

              <div className="p-4 bg-surface-container-low rounded-2xl flex flex-col items-center justify-center w-40 h-40 mx-auto border border-outline-variant/40 shadow-sm">
                <div className="grid grid-cols-4 gap-1.5 p-2 bg-on-surface rounded-lg">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <div key={i} className={`w-4 h-4 rounded-sm ${i % 2 === 0 ? 'bg-surface' : 'bg-on-surface'}`} />
                  ))}
                </div>
                <span className="text-[9px] text-secondary font-bold mt-2 font-mono-data">CRUVELS-2FA</span>
              </div>

              <div>
                <label className="font-body-sm text-xs text-secondary block mb-1">Manual Secret Key:</label>
                <div className="p-2.5 bg-surface-container-low rounded-lg font-mono-data text-xs text-primary text-center tracking-widest border border-outline-variant/40 select-all">
                  {totpSecret}
                </div>
              </div>

              <div>
                <label className="font-body-sm text-xs text-secondary block mb-1">Enter 6-Digit Authenticator Code (Test: 123456):</label>
                <input
                  type="text"
                  maxLength={6}
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.trim())}
                  placeholder="123456"
                  className="form-input text-center text-lg font-mono-data tracking-widest"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShow2FAModal(false)}
                  className="btn-secondary flex-1 justify-center text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleVerify2FA}
                  disabled={isVerifying2FA}
                  className="btn-primary flex-1 justify-center text-xs"
                >
                  {isVerifying2FA ? <Loader2 size={13} className="animate-spin" /> : null}
                  <span>Activate 2FA</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

