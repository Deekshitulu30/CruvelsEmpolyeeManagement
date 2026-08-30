import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, ClipboardCheck, Calendar,
  User, LogOut, Building2, ChevronRight, ExternalLink,
  ShieldCheck, Settings, Coffee, Sparkles, Bell, Layers, CheckSquare
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { WatercoolerModal } from '../shared/WatercoolerModal';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
}

interface SidebarProps {
  isCollapsed: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showWatercooler, setShowWatercooler] = useState(false);

  const adminNav: NavItem[] = [
    { to: '/app/admin', label: 'Admin Dashboard', icon: <LayoutDashboard size={18} /> },
    { to: '/app/admin/employees', label: 'Employee Directory', icon: <Users size={18} />, badge: '6' },
    { to: '/app/admin/departments', label: 'Departments', icon: <Layers size={18} /> },
    { to: '/app/admin/attendance', label: 'Shift Roster', icon: <ClipboardCheck size={18} /> },
    { to: '/app/admin/leaves', label: 'Leave Approvals', icon: <CheckSquare size={18} /> },
    { to: '/audit-logs', label: 'Security Trail', icon: <ShieldCheck size={18} /> },
    { to: '/app/notifications', label: 'Notifications', icon: <Bell size={18} /> },
    { to: '/app/settings', label: 'Preferences & 2FA', icon: <Settings size={18} /> },
    { to: '/app/profile', label: 'My Profile', icon: <User size={18} /> },
  ];

  const managerNav: NavItem[] = [
    { to: '/app/dashboard', label: 'Manager Desk', icon: <LayoutDashboard size={18} /> },
    { to: '/app/team', label: 'Team Operations', icon: <Users size={18} /> },
    { to: '/app/leave-approvals', label: 'Leave Approvals', icon: <CheckSquare size={18} /> },
    { to: '/app/attendance', label: 'Shift Records', icon: <ClipboardCheck size={18} /> },
    { to: '/app/notifications', label: 'Notifications', icon: <Bell size={18} /> },
    { to: '/app/settings', label: 'Preferences & 2FA', icon: <Settings size={18} /> },
    { to: '/app/profile', label: 'My Profile', icon: <User size={18} /> },
  ];

  const employeeNav: NavItem[] = [
    { to: '/app/dashboard', label: 'My Desk', icon: <LayoutDashboard size={18} /> },
    { to: '/app/attendance', label: 'My Shifts', icon: <ClipboardCheck size={18} /> },
    { to: '/app/leaves', label: 'Time Off Requests', icon: <Calendar size={18} /> },
    { to: '/app/notifications', label: 'Notifications', icon: <Bell size={18} /> },
    { to: '/app/settings', label: 'Preferences & 2FA', icon: <Settings size={18} /> },
    { to: '/app/profile', label: 'My Profile', icon: <User size={18} /> },
  ];

  const navItems = user?.role === 'ADMIN'
    ? adminNav
    : user?.role === 'MANAGER'
    ? managerNav
    : employeeNav;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const openNewTabSession = () => {
    window.open('/login?new_session=true', '_blank', 'noopener,noreferrer');
  };

  const roleBadge: Record<string, string> = {
    ADMIN: 'bg-purple-950/70 text-purple-300 border-purple-800/80',
    MANAGER: 'bg-blue-950/70 text-blue-300 border-blue-800/80',
    EMPLOYEE: 'bg-slate-800 text-slate-300 border-slate-700',
  };

  return (
    <>
      <aside
        className={`fixed left-0 top-0 h-full bg-surface border-r border-outline-variant/30 flex flex-col z-30 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-[72px]' : 'w-[280px]'
        }`}
      >
        <div className={`flex items-center gap-3 p-4 md:p-6 border-b border-outline-variant/20 h-16 ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-on-primary font-bold text-base shrink-0 shadow-sm">
            C
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden whitespace-nowrap flex-1">
              <h1 className="font-headline-section text-headline-section font-bold text-primary tracking-tight">Cruvels</h1>
              <p className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Enterprise HR</p>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto p-4 flex flex-col gap-1.5 font-body-sm text-body-sm">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg transition-all ${
                  isCollapsed ? 'justify-center p-2' : 'px-4 py-2.5'
                } ${
                  isActive
                    ? 'bg-primary-container/10 text-primary font-semibold border-l-4 border-primary translate-x-1'
                    : 'text-on-surface-variant hover:bg-surface-variant hover:translate-x-1'
                }`
              }
              title={isCollapsed ? item.label : undefined}
            >
              <div className="shrink-0">{item.icon}</div>
              {!isCollapsed && (
                <>
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] font-mono-data px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant border border-outline-variant/40">
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight size={14} className="opacity-30" />
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {!isCollapsed && (
          <div
            onClick={() => setShowWatercooler(true)}
            className="mx-4 mb-3 p-3 bg-surface-container-low border border-outline-variant/40 rounded-xl cursor-pointer hover:border-primary/40 transition-all group"
            title="Click to view full campus lore and watercooler bulletin"
          >
            <div className="flex items-center justify-between text-on-surface text-xs font-semibold mb-1">
              <div className="flex items-center gap-1.5">
                <Coffee size={13} className="text-primary" />
                <span>Watercooler Bulletin</span>
              </div>
              <span className="text-[10px] text-primary font-mono-data group-hover:underline">View All →</span>
            </div>
            <p className="text-[11px] text-on-surface-variant leading-relaxed">
              🎂 Priya's birthday on Thursday! Pizza & cupcakes in cafeteria at 4 PM.
            </p>
          </div>
        )}

        <div className="p-4 border-t border-outline-variant/20 flex flex-col gap-1.5 font-body-sm text-body-sm">
          {!isCollapsed && (
            <div className="flex items-center gap-3 p-2 mb-1 rounded-xl bg-surface-container-low border border-outline-variant/30">
              <div className="w-8 h-8 rounded-full bg-primary-container/20 text-primary flex items-center justify-center font-bold text-xs shrink-0 border border-outline-variant/20">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-on-surface truncate">{user?.name}</div>
                <span className="inline-block font-label-caps text-[10px] uppercase text-on-surface-variant">
                  {user?.role}
                </span>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={openNewTabSession}
            className={`flex items-center gap-3 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant rounded-lg transition-all ${
              isCollapsed ? 'justify-center p-2' : 'px-4 py-2'
            }`}
            title="Open another role simultaneously in a new tab"
          >
            <ExternalLink size={16} />
            {!isCollapsed && <span>Open Role in New Tab</span>}
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className={`flex items-center gap-3 text-error hover:bg-error-container/30 rounded-lg transition-all ${
              isCollapsed ? 'justify-center p-2' : 'px-4 py-2'
            }`}
            title={isCollapsed ? 'Sign out' : undefined}
          >
            <LogOut size={16} />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>


      {/* Campus Watercooler Modal */}
      <WatercoolerModal
        isOpen={showWatercooler}
        onClose={() => setShowWatercooler(false)}
      />
    </>
  );
};
