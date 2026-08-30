import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Modal } from './index';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDangerous = false,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isDangerous ? 'bg-status-inactive-bg text-error border border-status-inactive-border' : 'bg-status-pending-bg text-status-pending-text border border-status-pending-border'}`}>
            <AlertTriangle size={20} />
          </div>
          <p className="text-sm text-secondary leading-relaxed pt-1 font-body-sm">{message}</p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/30">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="btn-secondary text-xs"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`text-xs ${isDangerous ? 'btn-danger' : 'btn-primary'}`}
          >
            {isLoading ? <Loader2 size={14} className="animate-spin" /> : null}
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};
