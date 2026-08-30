import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Calendar, CheckCircle2, XCircle, Clock,
  Filter, Check, X
} from 'lucide-react';
import toast from 'react-hot-toast';

interface LeaveRequest {
  id: number;
  employee_id: number;
  employee_name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  days_count: number;
  reason: string;
  status: string;
  created_at: string;
}

export const LeaveApprovalsPage: React.FC = () => {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [filterStatus, setFilterStatus] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL'>('PENDING');
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/leaves?limit=100');
      const data = Array.isArray(res.data) 
        ? res.data 
        : (res.data?.data || res.data?.leaves || []);
      setLeaves(data);
    } catch (err) {
      toast.error('Failed to load leave approvals queue.');
      setLeaves([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecision = async (id: number, decision: 'APPROVED' | 'REJECTED') => {
    setActionLoadingId(id);
    try {
      await api.patch(`/leaves/${id}/status`, { status: decision });
      toast.success(`Leave request ${decision.toLowerCase()} successfully.`);
      setLeaves(prev => prev.map(l => l.id === id ? { ...l, status: decision } : l));
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error(msg || 'Failed to update leave status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredLeaves = leaves.filter(l => {
    if (filterStatus === 'ALL') return true;
    return l.status === filterStatus;
  });

  const pendingCount = leaves.filter(l => l.status === 'PENDING').length;
  const approvedCount = leaves.filter(l => l.status === 'APPROVED').length;
  const rejectedCount = leaves.filter(l => l.status === 'REJECTED').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-headline-page text-headline-page text-on-surface">Leave Approvals Desk</h2>
            <span className="badge badge-purple text-[11px]">Operations & HR</span>
          </div>
          <p className="font-body-md text-body-md text-secondary mt-1">
            Review, authorize, or decline employee time-off and absence requests with full audit compliance.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => setFilterStatus('PENDING')}
          className={`bg-surface-container-lowest border rounded-2xl p-5 text-left transition-all shadow-sm ${
            filterStatus === 'PENDING' ? 'border-primary shadow-md ring-2 ring-primary/10' : 'border-outline-variant/30 hover:border-outline-variant'
          }`}
        >
          <div className="flex items-center justify-between text-secondary text-xs font-medium mb-1">
            <span className="font-label-caps text-label-caps uppercase">Pending Review</span>
            <div className="w-8 h-8 rounded-full bg-status-pending-bg border border-status-pending-border flex items-center justify-center text-status-pending-text">
              <Clock size={16} />
            </div>
          </div>
          <div className="text-3xl font-bold text-status-pending-text font-mono-data">{pendingCount}</div>
          <div className="font-body-sm text-[11px] text-secondary mt-1">Awaiting manager sign-off</div>
        </button>

        <button
          onClick={() => setFilterStatus('APPROVED')}
          className={`bg-surface-container-lowest border rounded-2xl p-5 text-left transition-all shadow-sm ${
            filterStatus === 'APPROVED' ? 'border-primary shadow-md ring-2 ring-primary/10' : 'border-outline-variant/30 hover:border-outline-variant'
          }`}
        >
          <div className="flex items-center justify-between text-secondary text-xs font-medium mb-1">
            <span className="font-label-caps text-label-caps uppercase">Approved Total</span>
            <div className="w-8 h-8 rounded-full bg-status-active-bg border border-status-active-border flex items-center justify-center text-status-active-text">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="text-3xl font-bold text-status-active-text font-mono-data">{approvedCount}</div>
          <div className="font-body-sm text-[11px] text-secondary mt-1">Confirmed and scheduled absences</div>
        </button>

        <button
          onClick={() => setFilterStatus('REJECTED')}
          className={`bg-surface-container-lowest border rounded-2xl p-5 text-left transition-all shadow-sm ${
            filterStatus === 'REJECTED' ? 'border-primary shadow-md ring-2 ring-primary/10' : 'border-outline-variant/30 hover:border-outline-variant'
          }`}
        >
          <div className="flex items-center justify-between text-secondary text-xs font-medium mb-1">
            <span className="font-label-caps text-label-caps uppercase">Declined</span>
            <div className="w-8 h-8 rounded-full bg-status-leave-bg border border-status-leave-border flex items-center justify-center text-error">
              <XCircle size={16} />
            </div>
          </div>
          <div className="text-3xl font-bold text-error font-mono-data">{rejectedCount}</div>
          <div className="font-body-sm text-[11px] text-secondary mt-1">Returned with feedback</div>
        </button>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between gap-4 p-4 border-b border-outline-variant/30 bg-surface-container-low flex-wrap">
          <div className="flex items-center gap-2">
            <Filter size={15} className="text-secondary" />
            <span className="font-label-caps text-label-caps text-on-surface uppercase font-medium">
              Filter: {filterStatus} Requests
            </span>
          </div>

          <div className="inline-flex items-center gap-1 p-1 bg-surface-container rounded-full border border-outline-variant/30">
            {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`text-xs px-4 py-1.5 rounded-full font-body-sm font-medium transition-all ${
                  filterStatus === status
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-secondary hover:text-on-surface hover:bg-surface-container-low'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-secondary text-xs font-body-sm">Loading leave requests...</div>
        ) : filteredLeaves.length === 0 ? (
          <div className="p-12 text-center text-secondary text-xs space-y-2 font-body-sm">
            <CheckCircle2 size={24} className="mx-auto text-status-active-text" />
            <div className="font-semibold text-on-surface">No requests matching filter</div>
            <p className="text-secondary">Your approval queue is fully caught up.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant/30">
                  <th className="px-6 py-3.5 font-label-caps text-label-caps text-secondary font-medium uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-3.5 font-label-caps text-label-caps text-secondary font-medium uppercase tracking-wider">Leave Type</th>
                  <th className="px-6 py-3.5 font-label-caps text-label-caps text-secondary font-medium uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-3.5 font-label-caps text-label-caps text-secondary font-medium uppercase tracking-wider">Reason / Context</th>
                  <th className="px-6 py-3.5 font-label-caps text-label-caps text-secondary font-medium uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3.5 font-label-caps text-label-caps text-secondary font-medium uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {filteredLeaves.map((l) => (
                  <tr key={l.id} className="hover:bg-surface-bright transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-on-surface text-xs font-headline">
                        {l.employee_name || (l.first_name ? `${l.first_name} ${l.last_name}` : `Staff #${l.employee_id}`)}
                      </div>
                      <div className="text-[11px] text-secondary font-mono-data">{l.email || 'Internal Employee'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="badge badge-purple text-[11px] font-mono-data">{l.leave_type}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-on-surface font-body-sm">
                        {new Date(l.start_date).toLocaleDateString()} – {new Date(l.end_date).toLocaleDateString()}
                      </div>
                      <div className="text-[10px] text-secondary mt-0.5 font-mono-data">
                        {l.days_count || 1} business day(s)
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate text-xs text-secondary font-body-sm" title={l.reason}>
                      {l.reason || 'No details provided'}
                    </td>
                    <td className="px-6 py-4">
                      {l.status === 'APPROVED' && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0] shadow-sm">
                          Approved
                        </span>
                      )}
                      {l.status === 'REJECTED' && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#fef2f2] text-[#991b1b] border border-[#fecaca] shadow-sm">
                          Rejected
                        </span>
                      )}
                      {l.status === 'PENDING' && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#fefce8] text-[#854d0e] border border-[#fef08a] shadow-sm">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {l.status === 'PENDING' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleDecision(l.id, 'APPROVED')}
                            disabled={actionLoadingId === l.id}
                            className="bg-primary text-on-primary hover:bg-surface-tint text-xs px-3.5 py-1.5 rounded-full font-medium flex items-center gap-1.5 transition-all shadow-sm"
                            title="Authorize Leave"
                          >
                            <Check size={12} />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleDecision(l.id, 'REJECTED')}
                            disabled={actionLoadingId === l.id}
                            className="btn-secondary text-xs px-3.5 py-1.5 text-error hover:bg-error-container/20 rounded-full flex items-center gap-1.5 transition-all border border-error/30"
                            title="Decline Request"
                          >
                            <X size={12} />
                            <span>Decline</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-secondary font-mono-data">Resolved</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
