import React from 'react';
import { Loader2, AlertCircle, InboxIcon, RefreshCw } from 'lucide-react';

export const LoadingSpinner: React.FC<{ text?: string }> = ({ text = 'Gathering records...' }) => (
  <div className="flex flex-col items-center justify-center py-20 gap-3">
    <Loader2 size={28} className="text-primary animate-spin" />
    <span className="text-on-surface-variant text-xs font-medium">{text}</span>
  </div>
);

export const EmptyState: React.FC<{
  text?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}> = ({
  text = 'Nothing here yet 👋',
  subtitle = "Looks like there are no records matching right now.",
  icon = <InboxIcon size={36} className="text-outline" />,
  action,
}) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center max-w-sm mx-auto">
    <div className="w-14 h-14 rounded-xl bg-surface-container-low border border-outline-variant/40 flex items-center justify-center mb-3.5 shadow-sm text-outline">
      {icon}
    </div>
    <span className="text-on-surface text-sm font-semibold mb-1">{text}</span>
    <p className="text-on-surface-variant text-xs leading-relaxed mb-4">{subtitle}</p>
    {action && <div>{action}</div>}
  </div>
);

export const ErrorState: React.FC<{
  text?: string;
  onRetry?: () => void;
}> = ({
  text = "Something went a bit sideways on our end.",
  onRetry,
}) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center max-w-sm mx-auto">
    <div className="w-14 h-14 rounded-xl bg-error-container/40 border border-error/30 flex items-center justify-center text-error mb-3.5 shadow-sm">
      <AlertCircle size={28} />
    </div>
    <span className="text-on-surface text-sm font-semibold mb-1">Unable to load data</span>
    <p className="text-on-surface-variant text-xs leading-relaxed mb-4">{text}</p>
    {onRetry && (
      <button onClick={onRetry} className="btn-secondary text-xs flex items-center gap-1.5">
        <RefreshCw size={13} />
        <span>Give it another shot</span>
      </button>
    )}
  </div>
);

interface BadgeProps { status: string }
export const AttendanceBadge: React.FC<BadgeProps> = ({ status }) => {
  const map: Record<string, string> = {
    PRESENT: 'badge-green',
    ABSENT:  'badge-red',
    LATE:    'badge-yellow',
    HALF_DAY: 'badge-blue',
  };
  return <span className={`badge ${map[status] || 'badge-slate'}`}>{status.replace('_', ' ')}</span>;
};

export const LeaveBadge: React.FC<BadgeProps> = ({ status }) => {
  const map: Record<string, string> = {
    PENDING:   'badge-yellow',
    APPROVED:  'badge-green',
    REJECTED:  'badge-red',
    CANCELLED: 'badge-slate',
  };
  return <span className={`badge ${map[status] || 'badge-slate'}`}>{status}</span>;
};

export const EmployeeStatusBadge: React.FC<BadgeProps> = ({ status }) => {
  return <span className={`badge ${status === 'ACTIVE' ? 'badge-green' : 'badge-red'}`}>{status}</span>;
};

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}
export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/30 bg-surface-container-low">
          <h2 className="font-headline-section text-headline-section text-on-surface font-semibold text-base">{title}</h2>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface transition-colors text-lg leading-none p-1 rounded-DEFAULT hover:bg-surface-container"
          >
            ×
          </button>
        </div>
        <div className="p-6 bg-surface-container-lowest">{children}</div>
      </div>
    </div>
  );
};

export const PageHeader: React.FC<{ title: string; subtitle?: string; action?: React.ReactNode }> = ({
  title, subtitle, action
}) => (
  <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
    <div>
      <h2 className="font-headline-page text-headline-page text-on-surface">{title}</h2>
      {subtitle && <p className="font-body-md text-body-md text-secondary mt-1">{subtitle}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
);

