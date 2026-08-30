import React, { useEffect, useState, useCallback } from 'react';
import { leaveService } from '../services/leaveService';
import { useAuth } from '../context/AuthContext';
import type { LeaveRequest } from '../types';
import { LeaveBadge, EmptyState, ErrorState, Modal, PageHeader } from '../components/shared';
import { ConfirmDialog } from '../components/shared/ConfirmDialog';
import { TableSkeleton } from '../components/shared/SkeletonLoader';
import { format } from '../utils/formatters';
import { Plus, CheckCircle, XCircle, Loader2, Palmtree, Plane } from 'lucide-react';
import toast from 'react-hot-toast';

const LEAVE_TYPES = [
  { value: 'CASUAL', label: 'Casual Leave (Personal / Errands)' },
  { value: 'SICK', label: 'Sick Leave (Rest & Recovery)' },
  { value: 'ANNUAL', label: 'Annual Paid Vacation' },
  { value: 'UNPAID', label: 'Unpaid Time Off' },
];

export const LeavePage: React.FC = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Reject confirmation dialog state
  const [rejectTarget, setRejectTarget] = useState<LeaveRequest | null>(null);

  const fetchLeaves = useCallback(() => {
    setIsLoading(true);
    setError('');
    const svc = user?.role === 'EMPLOYEE'
      ? leaveService.getMyLeaves({ status: statusFilter })
      : leaveService.getAllLeaves({ status: statusFilter });

    svc
      .then(r => { setLeaves(r.data); setTotal(r.total); })
      .catch(() => setError('Unable to reach the time off desk right now.'))
      .finally(() => setIsLoading(false));
  }, [user?.role, statusFilter]);

  useEffect(() => { fetchLeaves(); }, [fetchLeaves]);

  const handleApprove = async (lr: LeaveRequest) => {
    setActionLoading(lr.id + 'approve');
    try {
      await leaveService.approve(lr.id);
      toast.success(`Approved ${lr.employee_name || 'teammate'}'s time off request! 🎉`);
      fetchLeaves();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error(msg || 'Failed to approve request');
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectTarget) return;
    setActionLoading(rejectTarget.id + 'reject');
    try {
      await leaveService.reject(rejectTarget.id);
      toast.success(`Declined time off request for ${rejectTarget.employee_name || 'employee'}`);
      setRejectTarget(null);
      fetchLeaves();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error(msg || 'Failed to decline request');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (lr: LeaveRequest) => {
    setActionLoading(lr.id + 'cancel');
    try {
      await leaveService.cancel(lr.id);
      toast.success('Leave request cancelled.');
      fetchLeaves();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error(msg || 'Failed to cancel request');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-headline-page text-headline-page text-on-surface">
            {user?.role === 'EMPLOYEE' ? 'Time Off & Leave' : 'Leave Approvals'}
          </h2>
          <p className="font-body-md text-body-md text-secondary mt-1">
            {user?.role === 'EMPLOYEE'
              ? 'Request vacation, sick leave, and personal time off with automatic routing.'
              : `Review and approve pending team time off requests (${total} total).`}
          </p>
        </div>
        {user?.role === 'EMPLOYEE' && (
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="btn-primary"
          >
            <span className="material-symbols-outlined text-[18px]">event_available</span>
            <span>Request Time Off</span>
          </button>
        )}
      </div>

      <div className="bg-surface-container-lowest p-1 rounded-full border border-outline-variant/30 inline-flex gap-1 shadow-sm flex-wrap">
        {['', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium font-body-sm transition-all ${
              statusFilter === s
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-secondary hover:text-on-surface hover:bg-surface-container-low'
            }`}
          >
            {s ? s.charAt(0) + s.slice(1).toLowerCase() : 'All Requests'}
          </button>
        ))}
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={5} cols={6} />
        ) : error ? (
          <ErrorState text={error} onRetry={fetchLeaves} />
        ) : leaves.length === 0 ? (
          <EmptyState
            icon={<Palmtree size={36} className="text-outline" />}
            text="No time off records found"
            subtitle={
              statusFilter
                ? `No requests currently marked as ${statusFilter.toLowerCase()}.`
                : "You haven't requested any time off yet."
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-body-md">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant/30">
                  {user?.role !== 'EMPLOYEE' && (
                    <th className="py-3 px-4 font-label-caps text-label-caps text-secondary font-medium uppercase tracking-wider">Employee</th>
                  )}
                  <th className="py-3 px-4 font-label-caps text-label-caps text-secondary font-medium uppercase tracking-wider">Category</th>
                  <th className="py-3 px-4 font-label-caps text-label-caps text-secondary font-medium uppercase tracking-wider">Dates</th>
                  <th className="py-3 px-4 font-label-caps text-label-caps text-secondary font-medium uppercase tracking-wider">Duration</th>
                  <th className="py-3 px-4 font-label-caps text-label-caps text-secondary font-medium uppercase tracking-wider">Reason</th>
                  <th className="py-3 px-4 font-label-caps text-label-caps text-secondary font-medium uppercase tracking-wider">Status</th>
                  <th className="py-3 px-4 font-label-caps text-label-caps text-secondary font-medium uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {leaves.map((lr) => {
                  const s = new Date(lr.start_date);
                  const e = new Date(lr.end_date);
                  const days = Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                  return (
                    <tr key={lr.id} className="hover:bg-surface-bright transition-colors">
                      {user?.role !== 'EMPLOYEE' && (
                        <td className="py-3 px-4">
                          <div className="font-body-sm text-body-sm font-medium text-on-surface">{lr.employee_name || '—'}</div>
                          <div className="text-[11px] text-secondary font-mono-data">{lr.employee_code}</div>
                        </td>
                      )}
                      <td className="py-3 px-4">
                        <span className="badge badge-purple text-[11px]">{lr.leave_type}</span>
                      </td>
                      <td className="py-3 px-4 font-mono-data text-xs text-on-surface">
                        {format.date(lr.start_date)} – {format.date(lr.end_date)}
                      </td>
                      <td className="py-3 px-4 text-secondary font-body-sm text-xs">{days} day{days !== 1 ? 's' : ''}</td>
                      <td className="py-3 px-4 text-on-surface-variant max-w-[220px] truncate text-xs font-body-sm" title={lr.reason}>
                        {lr.reason}
                      </td>
                      <td className="py-3 px-4"><LeaveBadge status={lr.status} /></td>
                      <td className="py-3 px-4 text-right">
                        {user?.role === 'EMPLOYEE' ? (
                          lr.status === 'PENDING' ? (
                            <button
                              type="button"
                              onClick={() => handleCancel(lr)}
                              disabled={actionLoading === lr.id + 'cancel'}
                              className="btn-secondary text-xs py-1 px-2.5 inline-flex items-center gap-1 text-error hover:bg-status-inactive-bg"
                            >
                              {actionLoading === lr.id + 'cancel' ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={12} />}
                              <span>Cancel</span>
                            </button>
                          ) : (
                            <span className="text-secondary text-[11px] font-mono-data">{lr.status.toLowerCase()}</span>
                          )
                        ) : (
                          lr.status === 'PENDING' ? (
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => handleApprove(lr)}
                                disabled={actionLoading === lr.id + 'approve'}
                                className="inline-flex items-center gap-1.5 text-xs font-medium text-status-active-text bg-status-active-bg border border-status-active-border hover:opacity-90 px-3.5 py-1.5 rounded-full transition-all shadow-sm"
                              >
                                {actionLoading === lr.id + 'approve' ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                                Approve
                              </button>
                              <button
                                type="button"
                                onClick={() => setRejectTarget(lr)}
                                disabled={actionLoading === lr.id + 'reject'}
                                className="inline-flex items-center gap-1.5 text-xs font-medium text-status-inactive-text bg-status-inactive-bg border border-status-inactive-border hover:opacity-90 px-3.5 py-1.5 rounded-full transition-all shadow-sm"
                              >
                                <XCircle size={12} />
                                Decline
                              </button>
                            </div>
                          ) : (
                            <span className="text-secondary text-[11px] font-mono-data">Logged</span>
                          )
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!rejectTarget}
        onClose={() => setRejectTarget(null)}
        onConfirm={handleConfirmReject}
        title="Decline Time Off Request?"
        message={`Are you sure you want to decline the ${rejectTarget?.leave_type} leave request from ${rejectTarget?.employee_name || 'this employee'}?`}
        confirmText="Decline Request"
        isDangerous
        isLoading={actionLoading === (rejectTarget?.id + 'reject')}
      />

      {showModal && (
        <ApplyLeaveModal
          onClose={() => setShowModal(false)}
          onSaved={() => {
            setShowModal(false);
            fetchLeaves();
            toast.success('Time off request submitted successfully!');
          }}
        />
      )}
    </div>
  );
};

const ApplyLeaveModal: React.FC<{ onClose: () => void; onSaved: () => void }> = ({ onClose, onSaved }) => {
  const [form, setForm] = useState({
    leave_type: 'CASUAL',
    start_date: '',
    end_date: '',
    reason: '',
  });
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.start_date || !form.end_date) { setError('Start and end dates are required.'); return; }
    if (!form.reason.trim()) { setError('Please add a short note about the reason.'); return; }
    if (new Date(form.end_date) < new Date(form.start_date)) { setError('End date cannot be earlier than start date.'); return; }

    setIsSaving(true);
    setError('');
    try {
      await leaveService.create(form);
      onSaved();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg || 'Failed to submit leave application.');
      toast.error('Could not submit request');
    } finally { setIsSaving(false); }
  };

  return (
    <Modal isOpen onClose={onClose} title="Request Time Off">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="font-body-sm text-xs text-secondary">
          Choose your requested dates and specify a reason for your manager to review.
        </p>

        {error && <div className="text-xs text-error bg-status-inactive-bg border border-status-inactive-border rounded-xl px-3.5 py-2">{error}</div>}

        <div>
          <label className="form-label text-xs">Leave Category *</label>
          <select className="form-select text-xs" value={form.leave_type} onChange={set('leave_type')}>
            {LEAVE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="form-label text-xs">First Day Away *</label>
            <input
              type="date"
              className="form-input text-xs"
              value={form.start_date}
              onChange={set('start_date')}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>
          <div>
            <label className="form-label text-xs">Return Date *</label>
            <input
              type="date"
              className="form-input text-xs"
              value={form.end_date}
              onChange={set('end_date')}
              min={form.start_date || new Date().toISOString().split('T')[0]}
              required
            />
          </div>
        </div>

        {form.start_date && form.end_date && new Date(form.end_date) >= new Date(form.start_date) && (
          <div className="text-[11px] text-primary font-mono-data bg-primary-container/10 border border-primary/20 px-3 py-1.5 rounded-lg flex items-center justify-between">
            <span>Duration (excluding weekends):</span>
            <span className="font-bold text-on-surface">
              {(() => {
                let count = 0;
                const cur = new Date(form.start_date);
                const end = new Date(form.end_date);
                while (cur <= end) {
                  const d = cur.getUTCDay();
                  if (d !== 0 && d !== 6) count++;
                  cur.setUTCDate(cur.getUTCDate() + 1);
                }
                return `${count} working day(s)`;
              })()}
            </span>
          </div>
        )}

        <div>
          <label className="form-label text-xs">Reason / Note for Manager *</label>
          <textarea
            className="form-input min-h-[85px] resize-none text-xs"
            value={form.reason}
            onChange={set('reason')}
            placeholder="e.g. Taking family for outstation trip, or attending personal appointment..."
            required
          />
        </div>

        <div className="flex gap-3 pt-3 border-t border-outline-variant/30">
          <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center text-xs">Cancel</button>
          <button type="submit" className="btn-primary flex-1 justify-center text-xs" disabled={isSaving}>
            {isSaving ? 'Submitting...' : 'Submit Application'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

