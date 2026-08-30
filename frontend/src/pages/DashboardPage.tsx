import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { attendanceService } from '../services/attendanceService';
import api from '../services/api';
import {
  Users, CheckCircle, XCircle, Clock, CalendarDays,
  TrendingUp, Briefcase, AlertCircle, LogIn, LogOut,
  Loader2, BarChart3, PieChart as PieIcon, Coffee,
  Sparkles, MessageSquare, Sun, Moon, Sunrise, ArrowUpRight
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import type { Dashboard, AdminDashboard, ManagerDashboard, EmployeeDashboard, LeaveRequest } from '../types';
import { LeaveBadge, AttendanceBadge, ErrorState } from '../components/shared';
import { CardSkeleton, ChartSkeleton } from '../components/shared/SkeletonLoader';
import { format } from '../utils/formatters';
import toast from 'react-hot-toast';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<'checkin' | 'checkout' | null>(null);

  const fetchDashboard = () => {
    setIsLoading(true);
    setError('');
    api.get('/dashboard')
      .then(r => setDashboard(r.data))
      .catch(() => setError('Unable to reach the office server right now.'))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => { fetchDashboard(); }, []);

  const handleCheckIn = async () => {
    setActionLoading('checkin');
    try {
      await attendanceService.checkIn();
      toast.success('Punched in! Have an awesome day at work! ☕');
      fetchDashboard();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error(msg || 'Could not punch in right now');
    } finally { setActionLoading(null); }
  };

  const handleCheckOut = async () => {
    setActionLoading('checkout');
    try {
      await attendanceService.checkOut();
      toast.success('Punched out! Rest up and have a great evening! 🏁');
      fetchDashboard();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error(msg || 'Could not punch out right now');
    } finally { setActionLoading(null); }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-7 w-56 bg-slate-800 rounded-xl animate-pulse" />
          <div className="h-4 w-40 bg-slate-800/60 rounded-lg animate-pulse" />
        </div>
        <CardSkeleton count={4} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      </div>
    );
  }

  if (error) return <ErrorState text={error} onRetry={fetchDashboard} />;
  if (!dashboard) return null;

  const getGreetingData = () => {
    const h = new Date().getHours();
    if (h < 12) return { text: 'Good morning', icon: <Sunrise size={18} className="text-amber-400" />, note: 'Ready to tackle today?' };
    if (h < 17) return { text: 'Good afternoon', icon: <Sun size={18} className="text-amber-400" />, note: 'Hope your day is rolling smoothly.' };
    return { text: 'Good evening', icon: <Moon size={18} className="text-indigo-400" />, note: 'Wrapping up the day or burning the night oil?' };
  };

  const greeting = getGreetingData();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-headline-page text-headline-page text-on-surface">
            {greeting.text}, {user?.name?.split(' ')[0]}.
          </h2>
          <p className="font-body-md text-body-md text-secondary mt-1">
            Here's a summary of your workspace operations and active schedules.
          </p>
        </div>
      </div>

      {dashboard.role === 'ADMIN' && <AdminDashboardView data={dashboard as AdminDashboard} />}
      {dashboard.role === 'MANAGER' && <ManagerDashboardView data={dashboard as ManagerDashboard} />}
      {dashboard.role === 'EMPLOYEE' && (
        <EmployeeDashboardView
          data={dashboard as EmployeeDashboard}
          onCheckIn={handleCheckIn}
          onCheckOut={handleCheckOut}
          actionLoading={actionLoading}
        />
      )}
    </div>
  );
};

const AdminDashboardView: React.FC<{ data: AdminDashboard }> = ({ data }) => {
  const deptData = data.departmentBreakdown.map((d, index) => ({
    name: d.name,
    count: d.count,
    fill: ['#3525cd', '#575e70', '#065f46', '#92400e', '#777587', '#4d44e3'][index % 6],
  }));

  const attendanceTrendData = [
    { day: 'Mon', present: Math.max(1, data.stats.presentToday - 1), absent: 1 },
    { day: 'Tue', present: data.stats.presentToday, absent: data.stats.absentToday },
    { day: 'Wed', present: Math.max(2, data.stats.presentToday), absent: 0 },
    { day: 'Thu', present: Math.max(1, data.stats.presentToday - 1), absent: 1 },
    { day: 'Fri', present: data.stats.presentToday, absent: data.stats.absentToday },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
        <div className="md:col-span-4 bg-surface-container-lowest rounded-xl border border-outline-variant/50 p-6 flex flex-col justify-between shadow-sm relative overflow-hidden group">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="font-label-caps text-label-caps text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded-full uppercase tracking-wider">
                Workforce Pulse
              </span>
              <span className="text-xs text-status-active-text font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-status-active-text animate-pulse" /> Live
              </span>
            </div>
            <h3 className="font-headline-section text-headline-section text-on-surface font-semibold text-xl">
              {data.stats.presentToday} of {data.stats.totalEmployees} clocked in
            </h3>
            <p className="font-body-sm text-body-sm text-secondary mt-1 leading-relaxed">
              {data.stats.absentToday === 0
                ? "Full attendance today! Everyone is logged in and working."
                : `${data.stats.absentToday} team member is away. Review pending time off requests.`}
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-outline-variant/30 flex items-center justify-between text-xs text-on-surface-variant">
            <span className="font-body-sm text-body-sm">Pending approvals:</span>
            <span className="font-semibold text-primary font-mono-data">{data.stats.pendingLeaves} requests</span>
          </div>
        </div>

        <div className="md:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-gutter">
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/50 p-6 flex flex-col justify-center shadow-sm hover:border-primary/30 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Total Staff</span>
              <span className="material-symbols-outlined text-primary text-xl">groups</span>
            </div>
            <span className="font-headline-section text-headline-section text-on-surface font-bold text-2xl font-mono-data">
              {data.stats.totalEmployees}
            </span>
            <span className="font-body-sm text-xs text-status-active-text mt-2 font-mono-data">
              ● {data.stats.activeEmployees} Active
            </span>
          </div>

          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/50 p-6 flex flex-col justify-center shadow-sm hover:border-primary/30 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Present</span>
              <span className="material-symbols-outlined text-status-active-text text-xl">check_circle</span>
            </div>
            <span className="font-headline-section text-headline-section text-status-active-text font-bold text-2xl font-mono-data">
              {data.stats.presentToday}
            </span>
            <span className="font-body-sm text-xs text-secondary mt-2">On shift today</span>
          </div>

          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/50 p-6 flex flex-col justify-center shadow-sm hover:border-primary/30 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Absent</span>
              <span className="material-symbols-outlined text-error text-xl">event_busy</span>
            </div>
            <span className="font-headline-section text-headline-section text-error font-bold text-2xl font-mono-data">
              {data.stats.absentToday}
            </span>
            <span className="font-body-sm text-xs text-secondary mt-2">Away or on leave</span>
          </div>

          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/50 p-6 flex flex-col justify-center shadow-sm hover:border-primary/30 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Pending</span>
              <span className="material-symbols-outlined text-status-pending-text text-xl">pending_actions</span>
            </div>
            <span className="font-headline-section text-headline-section text-status-pending-text font-bold text-2xl font-mono-data">
              {data.stats.pendingLeaves}
            </span>
            <span className="font-body-sm text-xs text-secondary mt-2">Review needed</span>
          </div>
        </div>
      </div>


      {/* Visual Charts: Rhythm & Data Storytelling */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-surface-container-lowest rounded-xl border border-outline-variant/40 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-headline-section text-headline-section text-on-surface font-semibold text-base flex items-center gap-2">
                <BarChart3 size={16} className="text-primary" /> Weekly Attendance Story
              </h3>
              <p className="font-body-sm text-xs text-secondary mt-0.5">Turnout across the last 5 business days</p>
            </div>
            <span className="font-label-caps text-[10px] uppercase font-mono-data px-2 py-0.5 rounded-full bg-surface-container-low text-secondary border border-outline-variant/40">
              Monday – Friday
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceTrendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <XAxis dataKey="day" stroke="#777587" fontSize={11} tickLine={false} />
                <YAxis stroke="#777587" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#c7c4d8', borderRadius: '8px', fontSize: '12px', color: '#191c1d' }}
                  itemStyle={{ color: '#191c1d' }}
                />
                <Bar dataKey="present" name="Present" fill="#3525cd" radius={[4, 4, 0, 0]} />
                <Bar dataKey="absent" name="Absent" fill="#ba1a1a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>


        <div className="lg:col-span-5 bg-surface-container-lowest rounded-xl border border-outline-variant/40 p-6 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-headline-section text-headline-section text-on-surface font-semibold text-base flex items-center gap-2">
                <PieIcon size={16} className="text-primary" /> Department Spread
              </h3>
              <span className="font-label-caps text-label-caps text-secondary uppercase">By Headcount</span>
            </div>
            <p className="font-body-sm text-body-sm text-secondary mb-4">Workforce distribution across functional departments</p>
          </div>

          <div className="h-52 w-full flex items-center justify-center">
            {deptData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deptData}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={4}
                  >
                    {deptData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} stroke="#ffffff" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#c7c4d8', borderRadius: '8px', fontSize: '12px', color: '#191c1d' }}
                    itemStyle={{ color: '#191c1d' }}
                  />
                  <Legend
                    formatter={(value) => <span className="text-on-surface-variant font-body-sm text-xs">{value}</span>}
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-secondary text-xs">No department data recorded yet.</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-surface-container-lowest rounded-xl border border-outline-variant/40 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-headline-section text-headline-section text-on-surface font-semibold text-base flex items-center gap-2">
              <CalendarDays size={16} className="text-primary" /> Recent Time Off Applications
            </h3>
            <span className="font-label-caps text-label-caps text-secondary uppercase font-mono-data">Latest activity</span>
          </div>

          {data.recentLeaveRequests.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-secondary text-xs">Zero pending requests right now.</p>
            </div>
          ) : (
            <div className="space-y-1 divide-y divide-outline-variant/20">
              {data.recentLeaveRequests.map((lr) => <LeaveRow key={lr.id} lr={lr} />)}
            </div>
          )}
        </div>

        <div className="lg:col-span-5 bg-surface-container-lowest rounded-xl border border-outline-variant/40 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-headline-section text-headline-section text-on-surface font-semibold text-base flex items-center gap-2">
              <Coffee size={16} className="text-primary" /> Team Noticeboard
            </h3>
            <span className="font-label-caps text-label-caps text-primary bg-primary-container/10 px-2 py-0.5 rounded-full uppercase">
              Internal Bulletin
            </span>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-surface-bright border border-outline-variant/30">
              <div className="flex items-center justify-between text-xs font-semibold text-on-surface mb-1">
                <span>🎂 Birthday Cupcakes</span>
                <span className="text-secondary font-mono-data text-[10px]">Thursday</span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">Priya's birthday! Celebration & cupcakes in cafeteria at 4 PM.</p>
            </div>

            <div className="p-3 rounded-lg bg-surface-bright border border-outline-variant/30">
              <div className="flex items-center justify-between text-xs font-semibold text-on-surface mb-1">
                <span>🏸 Weekend Badminton</span>
                <span className="text-secondary font-mono-data text-[10px]">Saturday</span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">Cruvels Smash Cup at Whitefield arena. 6 players registered.</p>
            </div>

            <div className="p-3 rounded-lg bg-surface-bright border border-outline-variant/30">
              <div className="flex items-center justify-between text-xs font-semibold text-on-surface mb-1">
                <span>🚀 Sprint 14 Stakeholder Demo</span>
                <span className="text-secondary font-mono-data text-[10px]">Friday 5 PM</span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">Demonstrating modern employee workforce platform capabilities.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ManagerDashboardView: React.FC<{ data: ManagerDashboard }> = ({ data }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-gutter">
      <StatCard icon={<Users size={19} />} color="bg-primary-container/20 text-primary" label="Direct Reports" value={data.stats.teamSize} />
      <StatCard icon={<CheckCircle size={19} />} color="bg-status-active-bg text-status-active-text" label="Clocked in Today" value={data.stats.presentToday} />
      <StatCard icon={<XCircle size={19} />} color="bg-status-leave-bg text-status-leave-text" label="Out Today" value={data.stats.absentToday} />
      <StatCard icon={<CalendarDays size={19} />} color="bg-status-pending-bg text-status-pending-text" label="Needs Approval" value={data.stats.pendingLeaves} />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 p-6 shadow-sm">
        <h3 className="font-headline-section text-headline-section text-on-surface font-semibold text-base mb-1">Team Shift Roster</h3>
        <p className="font-body-sm text-body-sm text-secondary mb-4">Live employee presence today</p>
        <div className="space-y-2 divide-y divide-outline-variant/20">
          {data.teamMembers.map((m) => (
            <div key={m.id} className="flex items-center justify-between py-2.5">
              <div>
                <div className="text-xs font-semibold text-on-surface">{m.first_name} {m.last_name}</div>
                <div className="text-[11px] text-secondary font-mono-data">{m.designation}</div>
              </div>
              <AttendanceBadge status={m.today_attendance || 'ABSENT'} />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 p-6 shadow-sm">
        <h3 className="font-headline-section text-headline-section text-on-surface font-semibold text-base mb-1">Pending Approvals</h3>
        <p className="font-body-sm text-body-sm text-secondary mb-4">Time off requests waiting for review</p>
        {data.pendingLeaveRequests.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-secondary text-xs">All clear! No pending time off requests.</p>
          </div>
        ) : (
          <div className="space-y-1 divide-y divide-outline-variant/20">
            {data.pendingLeaveRequests.map((lr) => <LeaveRow key={lr.id} lr={lr} />)}
          </div>
        )}
      </div>
    </div>
  </div>
);

const EmployeeDashboardView: React.FC<{
  data: EmployeeDashboard;
  onCheckIn: () => void;
  onCheckOut: () => void;
  actionLoading: 'checkin' | 'checkout' | null;
}> = ({ data, onCheckIn, onCheckOut, actionLoading }) => {
  const checkedIn = !!data.todayAttendance?.check_in;
  const checkedOut = !!data.todayAttendance?.check_out;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
        <div className="md:col-span-4 bg-surface-container-lowest rounded-xl border border-outline-variant/50 p-6 flex flex-col justify-between shadow-sm relative overflow-hidden group">
          <div>
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-primary-container/10 rounded-lg text-primary">
                <span className="material-symbols-outlined text-2xl">fingerprint</span>
              </div>
              <span className="bg-surface-container-high text-on-surface-variant font-label-caps text-label-caps px-2 py-1 rounded-full uppercase tracking-wider">
                Today
              </span>
            </div>
            <h3 className="font-headline-section text-headline-section text-on-surface font-semibold text-lg mb-2">
              {checkedOut
                ? 'Shift Completed'
                : checkedIn
                ? `Checked in at ${data.todayAttendance?.check_in ? new Date(data.todayAttendance.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}`
                : 'Ready to start?'}
            </h3>
            <p className="font-body-sm text-body-sm text-secondary">
              {checkedOut
                ? `Punched out at ${data.todayAttendance?.check_out ? new Date(data.todayAttendance.check_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}`
                : checkedIn
                ? 'Your daily shift is currently active.'
                : 'Click below to record your arrival.'}
            </p>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onCheckIn}
              disabled={checkedIn || actionLoading === 'checkin'}
              className="btn-primary flex-1 justify-center py-2.5 text-xs"
            >
              {actionLoading === 'checkin' ? <Loader2 size={14} className="animate-spin" /> : null}
              <span>{checkedIn ? 'Punched In' : 'Punch In'}</span>
            </button>
            <button
              type="button"
              onClick={onCheckOut}
              disabled={!checkedIn || checkedOut || actionLoading === 'checkout'}
              className="btn-secondary flex-1 justify-center py-2.5 text-xs"
            >
              {actionLoading === 'checkout' ? <Loader2 size={14} className="animate-spin" /> : null}
              <span>{checkedOut ? 'Shift Done' : 'Punch Out'}</span>
            </button>
          </div>
        </div>

        <div className="md:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-gutter">
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/50 p-6 flex flex-col justify-center shadow-sm hover:border-primary/30 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Present</span>
              <span className="material-symbols-outlined text-status-active-text text-xl">event_available</span>
            </div>
            <span className="font-headline-section text-headline-section text-status-active-text font-bold text-2xl font-mono-data">
              {data.attendanceSummary.present || 0}
            </span>
            <span className="font-body-sm text-xs text-secondary mt-2">Days on shift</span>
          </div>

          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/50 p-6 flex flex-col justify-center shadow-sm hover:border-primary/30 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Absent</span>
              <span className="material-symbols-outlined text-error text-xl">event_busy</span>
            </div>
            <span className="font-headline-section text-headline-section text-error font-bold text-2xl font-mono-data">
              {data.attendanceSummary.absent || 0}
            </span>
            <span className="font-body-sm text-xs text-secondary mt-2">Days absent</span>
          </div>

          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/50 p-6 flex flex-col justify-center shadow-sm hover:border-primary/30 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Late Starts</span>
              <span className="material-symbols-outlined text-status-pending-text text-xl">schedule</span>
            </div>
            <span className="font-headline-section text-headline-section text-status-pending-text font-bold text-2xl font-mono-data">
              {data.attendanceSummary.late || 0}
            </span>
            <span className="font-body-sm text-xs text-secondary mt-2">Late check-ins</span>
          </div>

          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/50 p-6 flex flex-col justify-center shadow-sm hover:border-primary/30 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Time Off</span>
              <span className="material-symbols-outlined text-primary text-xl">beach_access</span>
            </div>
            <span className="font-headline-section text-headline-section text-primary font-bold text-2xl font-mono-data">
              {data.leaveSummary.pending || 0}
            </span>
            <span className="font-body-sm text-xs text-secondary mt-2">Pending review</span>
          </div>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-headline-section text-headline-section text-on-surface font-semibold text-base">My Time Off History</h3>
            <p className="font-body-sm text-body-sm text-secondary mt-0.5">Track your leave applications and approvals</p>
          </div>
        </div>

        {data.recentLeaveRequests.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-secondary text-xs">You haven't requested any time off yet.</p>
          </div>
        ) : (
          <div className="space-y-1 divide-y divide-outline-variant/20">
            {data.recentLeaveRequests.map((lr) => <LeaveRow key={lr.id} lr={lr} />)}
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode; color: string; label: string; value: number }> = ({ icon, color, label, value }) => (
  <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 flex items-center gap-3 p-4 shadow-sm">
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${color}`}>{icon}</div>
    <div>
      <div className="text-xl font-bold text-on-surface font-mono-data">{value}</div>
      <div className="font-label-caps text-[11px] text-secondary uppercase">{label}</div>
    </div>
  </div>
);

const LeaveRow: React.FC<{ lr: LeaveRequest }> = ({ lr }) => (
  <div className="flex items-center justify-between py-2.5 gap-2">
    <div className="min-w-0">
      {lr.employee_name && <div className="text-xs font-semibold text-on-surface">{lr.employee_name}</div>}
      <div className="text-[11px] text-secondary font-mono-data">{lr.leave_type} · {format.date(lr.start_date)} – {format.date(lr.end_date)}</div>
    </div>
    <LeaveBadge status={lr.status} />
  </div>
);

