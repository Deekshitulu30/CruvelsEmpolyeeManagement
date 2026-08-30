import React, { useEffect, useState, useCallback } from 'react';
import { attendanceService } from '../services/attendanceService';
import { useAuth } from '../context/AuthContext';
import type { Attendance } from '../types';
import { AttendanceBadge, EmptyState, ErrorState, PageHeader } from '../components/shared';
import { TableSkeleton } from '../components/shared/SkeletonLoader';
import { format } from '../utils/formatters';
import { LogIn, LogOut, Loader2, Filter, RotateCcw, Coffee, Sparkles, Clock, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const AttendancePage: React.FC = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState<Attendance[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [actionLoading, setActionLoading] = useState<'in' | 'out' | null>(null);
  const [liveDuration, setLiveDuration] = useState('');

  const fetchAttendance = useCallback(() => {
    setIsLoading(true);
    setError('');
    const svc = user?.role === 'EMPLOYEE'
      ? attendanceService.getMyAttendance({ startDate, endDate })
      : attendanceService.getTeamAttendance({ startDate, endDate });

    svc
      .then(r => { setRecords(r.data); setTotal(r.total); })
      .catch(() => setError('Unable to reach the shift registry server.'))
      .finally(() => setIsLoading(false));
  }, [user?.role, startDate, endDate]);

  useEffect(() => { fetchAttendance(); }, [fetchAttendance]);

  const today = records.find(r => r.date?.split('T')[0] === new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (!today?.check_in || today?.check_out) {
      setLiveDuration('');
      return;
    }

    const updateDuration = () => {
      const startMs = new Date(today.check_in!).getTime();
      const diffMs = Date.now() - startMs;
      if (diffMs > 0) {
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diffMs % (1000 * 60)) / 1000);
        setLiveDuration(`${hours}h ${mins}m ${secs}s`);
      }
    };

    updateDuration();
    const timer = setInterval(updateDuration, 1000);
    return () => clearInterval(timer);
  }, [today?.check_in, today?.check_out]);

  const doCheckIn = async () => {
    setActionLoading('in');
    try {
      await attendanceService.checkIn();
      toast.success('Punched in! Have an awesome day at Cruvels! 🚀');
      fetchAttendance();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error(msg || 'Could not punch in right now');
    } finally { setActionLoading(null); }
  };

  const doCheckOut = async () => {
    setActionLoading('out');
    try {
      await attendanceService.checkOut();
      toast.success('Punched out! Rest up and have a relaxing evening! 🏁');
      fetchAttendance();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error(msg || 'Could not punch out right now');
    } finally { setActionLoading(null); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-headline-page text-headline-page text-on-surface">
            {user?.role === 'EMPLOYEE' ? 'Attendance & Shifts' : 'Shift Registry'}
          </h2>
          <p className="font-body-md text-body-md text-secondary mt-1">
            {user?.role === 'EMPLOYEE'
              ? 'Track your daily check-in timestamps, durations, and active shift status.'
              : `Review recorded employee shift hours and attendance records (${total} total).`}
          </p>
        </div>
      </div>

      {user?.role === 'EMPLOYEE' && (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 p-6 shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <span className="font-label-caps text-label-caps text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded-full uppercase tracking-wider mb-2 inline-block">
                Today's Shift
              </span>
              <h3 className="font-headline-section text-headline-section text-on-surface font-semibold text-base">
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
              </h3>
              <div className="flex items-center gap-4 text-xs text-secondary mt-2 font-mono-data flex-wrap">
                <div>Punched in: <span className="text-on-surface font-semibold">{today?.check_in ? format.time(today.check_in) : '—'}</span></div>
                <div>Punched out: <span className="text-on-surface font-semibold">{today?.check_out ? format.time(today.check_out) : '—'}</span></div>
                {today && <AttendanceBadge status={today.status} />}
                {today?.check_in && !today?.check_out && (
                  <div className="flex items-center gap-1.5 text-primary bg-primary-container/10 border border-primary/20 px-2.5 py-0.5 rounded-md font-sans">
                    <Clock size={12} className="text-primary animate-pulse" />
                    <span>Working: <strong className="text-primary font-mono-data">{liveDuration || '0h 0m 0s'}</strong></span>
                  </div>
                )}
                {today?.check_in && today?.check_out && (
                  <div className="flex items-center gap-1.5 text-status-active-text bg-status-active-bg border border-status-active-border px-2.5 py-0.5 rounded-md font-sans">
                    <CheckCircle2 size={12} className="text-status-active-text" />
                    <span>Total: <strong className="text-status-active-text font-mono-data">{format.duration(today.check_in, today.check_out)}</strong></span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={doCheckIn}
                disabled={!!today?.check_in || actionLoading === 'in'}
                className="btn-primary text-xs"
              >
                {actionLoading === 'in' ? <Loader2 size={14} className="animate-spin" /> : <LogIn size={14} />}
                <span>{today?.check_in ? 'Already Punched In' : 'Punch In'}</span>
              </button>
              <button
                type="button"
                onClick={doCheckOut}
                disabled={!today?.check_in || !!today?.check_out || actionLoading === 'out'}
                className="btn-secondary text-xs"
              >
                {actionLoading === 'out' ? <Loader2 size={14} className="animate-spin" /> : <LogOut size={14} />}
                <span>{today?.check_out ? 'Shift Done' : 'Punch Out'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 shadow-sm flex gap-3 items-center flex-wrap">
        <div className="flex items-center gap-1.5 font-label-caps text-label-caps text-secondary uppercase">
          <Filter size={14} className="text-outline" />
          <span>Filter dates:</span>
        </div>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="bg-surface-container-low border border-outline-variant rounded-lg px-3 py-1.5 text-xs text-on-surface font-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <span className="text-secondary text-xs">to</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="bg-surface-container-low border border-outline-variant rounded-lg px-3 py-1.5 text-xs text-on-surface font-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {(startDate || endDate) && (
          <button
            type="button"
            onClick={() => { setStartDate(''); setEndDate(''); }}
            className="btn-secondary text-xs flex items-center gap-1.5 py-1.5"
          >
            <RotateCcw size={12} /> Clear Filter
          </button>
        )}
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={8} cols={user?.role === 'EMPLOYEE' ? 4 : 5} />
        ) : error ? (
          <ErrorState text={error} onRetry={fetchAttendance} />
        ) : records.length === 0 ? (
          <EmptyState
            icon={<Coffee size={36} className="text-outline" />}
            text="No shift records found for this period"
            subtitle="No attendance logs exist for the chosen date range."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-body-md">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant/30">
                  {user?.role !== 'EMPLOYEE' && (
                    <th className="py-3 px-4 font-label-caps text-label-caps text-secondary font-medium uppercase tracking-wider">Teammate</th>
                  )}
                  <th className="py-3 px-4 font-label-caps text-label-caps text-secondary font-medium uppercase tracking-wider">Date</th>
                  <th className="py-3 px-4 font-label-caps text-label-caps text-secondary font-medium uppercase tracking-wider">Punch In</th>
                  <th className="py-3 px-4 font-label-caps text-label-caps text-secondary font-medium uppercase tracking-wider">Punch Out</th>
                  <th className="py-3 px-4 font-label-caps text-label-caps text-secondary font-medium uppercase tracking-wider">Shift Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {records.map((r) => (
                  <tr key={r.id} className="hover:bg-surface-bright transition-colors">
                    {user?.role !== 'EMPLOYEE' && (
                      <td className="py-3 px-4">
                        <div className="font-body-sm text-body-sm font-medium text-on-surface">{r.employee_name}</div>
                        <div className="text-[11px] text-secondary font-mono-data">{r.employee_code}</div>
                      </td>
                    )}
                    <td className="py-3 px-4 text-on-surface font-mono-data text-xs">{format.date(r.date)}</td>
                    <td className="py-3 px-4 text-secondary font-mono-data text-xs">{r.check_in ? format.time(r.check_in) : '—'}</td>
                    <td className="py-3 px-4 text-secondary font-mono-data text-xs">{r.check_out ? format.time(r.check_out) : '—'}</td>
                    <td className="py-3 px-4"><AttendanceBadge status={r.status} /></td>
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

