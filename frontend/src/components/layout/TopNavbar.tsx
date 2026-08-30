import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Menu, Bell, Search, User as UserIcon, Settings,
  LogOut, ExternalLink, CheckCircle2, AlertCircle, Clock,
  Coffee, ShieldCheck
} from 'lucide-react';

interface TopNavbarProps {
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  isSidebarCollapsed,
  onToggleSidebar,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Quick keyboard shortcut: '/' focuses search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    if (user?.role === 'ADMIN' || user?.role === 'MANAGER') {
      navigate(`/app/admin/employees?search=${encodeURIComponent(query)}`);
    } else {
      navigate(`/app/attendance?search=${encodeURIComponent(query)}`);
    }
  };

  const mockNotifications = [
    {
      id: 1,
      title: 'Time Off Desk',
      desc: 'Priya Singh requested 2 days casual leave.',
      time: '12m ago',
      icon: <Clock size={15} className="text-amber-400" />,
    },
    {
      id: 2,
      title: 'Office Watercooler',
      desc: "Priya's birthday cupcakes in cafeteria on Thursday!",
      time: '1h ago',
      icon: <Coffee size={15} className="text-pink-400" />,
    },
    {
      id: 3,
      title: 'Daily Shift Active',
      desc: 'Morning punch-in registry is open.',
      time: '2h ago',
      icon: <CheckCircle2 size={15} className="text-emerald-400" />,
    },
    {
      id: 4,
      title: 'Security Trail',
      desc: 'Audit logs synced and token verification healthy.',
      time: '4h ago',
      icon: <ShieldCheck size={15} className="text-indigo-400" />,
    },
  ];

  const roleColor: Record<string, string> = {
    ADMIN: 'text-primary bg-primary-container/10 border-primary/20',
    MANAGER: 'text-secondary bg-secondary-container/50 border-secondary/20',
    EMPLOYEE: 'text-on-surface-variant bg-surface-container border-outline-variant/40',
  };

  return (
    <header className="h-16 bg-surface border-b border-outline-variant/20 sticky top-0 z-20 px-4 md:px-margin-desktop flex items-center justify-between">
      <div className="flex items-center gap-3 lg:gap-4 flex-1 max-w-md">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-all active:scale-90"
          title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <Menu size={19} />
        </button>

        <form onSubmit={handleSearchSubmit} className="relative w-full hidden sm:block">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search coworkers, departments, or emails... (press / to jump)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2 pl-10 pr-9 text-body-sm font-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-outline font-mono-data px-1.5 py-0.5 rounded border border-outline-variant/40 bg-surface-bright">
            /
          </span>
        </form>
      </div>

      <div className="flex items-center gap-2 lg:gap-3">
        <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-low border border-outline-variant/40 text-[11px] text-on-surface-variant">
          <span className="w-2 h-2 rounded-full bg-status-active-text animate-pulse" />
          <span>Cruvels Bengaluru HQ</span>
        </div>

        <button
          type="button"
          onClick={() => window.open('/login?new_session=true', '_blank', 'noopener,noreferrer')}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-primary bg-primary-container/10 border border-primary/20 hover:bg-primary-container/20 transition-colors"
          title="Open a parallel session in a separate tab (e.g. Test Admin + Employee concurrently)"
        >
          <ExternalLink size={13} />
          <span>New Role Tab</span>
        </button>

        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setShowNotifications(prev => !prev)}
            className="relative p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-all active:scale-90"
            title="Office Notifications"
          >
            <Bell size={19} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full ring-2 ring-surface" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-lg z-50 overflow-hidden py-2">
              <div className="px-4 py-2 border-b border-outline-variant/20 flex items-center justify-between">
                <span className="font-bold text-xs text-on-surface">Office Feed</span>
                <span className="text-[10px] font-semibold text-primary bg-primary-container/10 px-2 py-0.5 rounded-full border border-primary/20">
                  {mockNotifications.length} updates
                </span>
              </div>
              <div className="divide-y divide-outline-variant/20 max-h-72 overflow-y-auto">
                {mockNotifications.map(n => (
                  <div key={n.id} className="p-3 hover:bg-surface-bright transition-colors flex items-start gap-3 cursor-pointer">
                    <div className="w-7 h-7 rounded-lg bg-surface-container-low flex items-center justify-center shrink-0 mt-0.5 border border-outline-variant/20">
                      {n.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-on-surface truncate">{n.title}</div>
                      <div className="text-[11px] text-on-surface-variant leading-snug mt-0.5">{n.desc}</div>
                      <div className="text-[10px] text-outline font-mono-data mt-1">{n.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setShowProfileMenu(prev => !prev)}
            className="flex items-center gap-2.5 p-1 hover:bg-surface-container-high rounded-lg transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-primary-container/20 text-primary flex items-center justify-center text-xs font-bold shrink-0 border border-outline-variant/30">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-medium text-on-surface leading-tight">{user?.name}</div>
              <div className="text-[10px] text-on-surface-variant font-label-caps uppercase">{user?.role}</div>
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-lg z-50 overflow-hidden py-1.5">
              <div className="px-4 py-3 border-b border-outline-variant/20">
                <div className="font-bold text-xs text-on-surface truncate">{user?.name}</div>
                <div className="text-[11px] text-on-surface-variant truncate mt-0.5 font-mono-data">{user?.email}</div>
                <span className={`inline-block mt-2 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${roleColor[user?.role || 'EMPLOYEE']}`}>
                  {user?.role} Access
                </span>
              </div>

              <div className="py-1">
                <Link
                  to="/app/profile"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-on-surface-variant hover:text-on-surface hover:bg-surface-bright transition-colors"
                >
                  <UserIcon size={14} className="text-outline" />
                  <span>My Profile</span>
                </Link>
                <Link
                  to="/app/settings"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-on-surface-variant hover:text-on-surface hover:bg-surface-bright transition-colors"
                >
                  <Settings size={14} className="text-outline" />
                  <span>Preferences & Password</span>
                </Link>
              </div>

              <div className="border-t border-outline-variant/20 pt-1">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-error hover:bg-error-container/30 transition-colors"
                >
                  <LogOut size={14} />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};


