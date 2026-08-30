import React from 'react';
import { ShieldAlert, AlertTriangle } from 'lucide-react';

interface ConcurrentSessionModalProps {
  isOpen: boolean;
  message?: string;
  onConfirm: () => void;
}

export const ConcurrentSessionModal: React.FC<ConcurrentSessionModalProps> = ({
  isOpen,
  message,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-on-surface/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl shadow-2xl max-w-md w-full p-6 text-center">
        <div className="w-14 h-14 rounded-full bg-status-leave-bg border border-status-leave-border text-error flex items-center justify-center mx-auto mb-3">
          <ShieldAlert size={28} />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-status-pending-bg text-status-pending-text border border-status-pending-border text-[11px] font-mono-data mb-3">
          <AlertTriangle size={13} />
          <span>Concurrent Session Detected</span>
        </div>

        <h2 className="font-headline-section text-headline-section text-on-surface font-bold text-lg mb-2">
          Logged Out From Another Tab or Device
        </h2>

        <p className="font-body-sm text-xs text-secondary leading-relaxed mb-6">
          {message || 'You have been logged out because this account was logged into from another tab or another device. To protect organization data, only a single active session is permitted.'}
        </p>

        <button
          type="button"
          onClick={onConfirm}
          className="btn-primary w-full justify-center py-2.5 rounded-full text-xs font-medium shadow-md"
        >
          <span>Log In Again</span>
        </button>
      </div>
    </div>
  );
};
