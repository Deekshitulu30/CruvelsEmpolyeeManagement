import React, { useState } from 'react';
import {
  Bell, CheckCircle2, AlertCircle, Clock, ShieldCheck,
  Calendar, Check, Trash2, Filter
} from 'lucide-react';
import toast from 'react-hot-toast';

interface NotificationItem {
  id: number;
  title: string;
  message: string;
  category: 'LEAVE' | 'ATTENDANCE' | 'SECURITY' | 'SYSTEM';
  timestamp: string;
  read: boolean;
}

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 1,
      title: 'Leave Request Approved',
      message: 'Your 2-day Casual Leave request for next Thursday and Friday has been authorized by your manager.',
      category: 'LEAVE',
      timestamp: '15 minutes ago',
      read: false
    },
    {
      id: 2,
      title: 'Shift Attendance Logged',
      message: 'Morning shift check-in recorded at 09:02 AM IST. Have a productive day at Cruvels!',
      category: 'ATTENDANCE',
      timestamp: '2 hours ago',
      read: false
    },
    {
      id: 3,
      title: 'Security Telemetry Alert',
      message: 'Two-factor authentication status verified active. AES-256 session token rotated.',
      category: 'SECURITY',
      timestamp: 'Yesterday at 5:30 PM',
      read: true
    },
    {
      id: 4,
      title: 'Scheduled Maintenance Window',
      message: 'Cruvels workforce database maintenance successfully concluded with zero downtime.',
      category: 'SYSTEM',
      timestamp: '2 days ago',
      read: true
    },
    {
      id: 5,
      title: 'Quarterly Town Hall Scheduled',
      message: 'Cruvels Ltd. all-hands meeting scheduled for Friday at 4:00 PM IST.',
      category: 'SYSTEM',
      timestamp: '3 days ago',
      read: true
    }
  ]);

  const [activeTab, setActiveTab] = useState<'ALL' | 'UNREAD' | 'SECURITY' | 'LEAVE'>('ALL');

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success('All notifications marked as read.');
  };

  const clearAll = () => {
    setNotifications([]);
    toast.success('Notification feed cleared.');
  };

  const markSingle = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: !n.read } : n));
  };

  const filtered = notifications.filter(n => {
    if (activeTab === 'UNREAD') return !n.read;
    if (activeTab === 'SECURITY') return n.category === 'SECURITY';
    if (activeTab === 'LEAVE') return n.category === 'LEAVE';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-headline-page text-headline-page text-on-surface">Notification Center</h2>
            {unreadCount > 0 && (
              <span className="badge badge-blue text-[11px]">{unreadCount} Unread</span>
            )}
          </div>
          <p className="font-body-md text-body-md text-secondary mt-1">
            Realtime activity updates, leave decisions, attendance alerts, and security telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="btn-secondary text-xs flex items-center gap-1.5"
            >
              <Check size={14} />
              <span>Mark All Read</span>
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={clearAll}
              className="btn-secondary text-xs text-secondary hover:text-error"
              title="Clear all notifications"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 p-3 border-b border-outline-variant/30 bg-surface-container-low flex-wrap">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium font-body-sm transition-colors ${
              activeTab === 'ALL'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-secondary hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            All Updates ({notifications.length})
          </button>
          <button
            onClick={() => setActiveTab('UNREAD')}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium font-body-sm transition-colors ${
              activeTab === 'UNREAD'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-secondary hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            onClick={() => setActiveTab('LEAVE')}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium font-body-sm transition-colors ${
              activeTab === 'LEAVE'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-secondary hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            Leaves
          </button>
          <button
            onClick={() => setActiveTab('SECURITY')}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium font-body-sm transition-colors ${
              activeTab === 'SECURITY'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-secondary hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            Security Alerts
          </button>
        </div>

        {filtered.length === 0 ? (
          <div className="p-12 text-center text-secondary text-xs space-y-2 font-body-sm">
            <Bell size={24} className="mx-auto text-outline" />
            <div className="font-semibold text-on-surface">No notifications here</div>
            <p className="text-secondary">You're completely up to date with your organization feeds.</p>
          </div>
        ) : (
          <div className="divide-y divide-outline-variant/20">
            {filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => markSingle(item.id)}
                className={`p-4 transition-colors cursor-pointer flex items-start gap-3.5 ${
                  item.read ? 'hover:bg-surface-bright' : 'bg-primary-container/5 hover:bg-primary-container/10'
                }`}
              >
                <div className="shrink-0 mt-0.5">
                  {item.category === 'LEAVE' && (
                    <div className="w-8 h-8 rounded-lg bg-secondary-container/60 border border-secondary/20 flex items-center justify-center text-secondary">
                      <Calendar size={16} />
                    </div>
                  )}
                  {item.category === 'ATTENDANCE' && (
                    <div className="w-8 h-8 rounded-lg bg-status-active-bg border border-status-active-border flex items-center justify-center text-status-active-text">
                      <Clock size={16} />
                    </div>
                  )}
                  {item.category === 'SECURITY' && (
                    <div className="w-8 h-8 rounded-lg bg-primary-container/20 border border-primary/20 flex items-center justify-center text-primary">
                      <ShieldCheck size={16} />
                    </div>
                  )}
                  {item.category === 'SYSTEM' && (
                    <div className="w-8 h-8 rounded-lg bg-status-pending-bg border border-status-pending-border flex items-center justify-center text-status-pending-text">
                      <AlertCircle size={16} />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className={`text-xs font-semibold ${item.read ? 'text-on-surface' : 'text-primary font-bold'}`}>
                      {item.title}
                    </h3>
                    <span className="text-[11px] text-secondary shrink-0 font-mono-data">{item.timestamp}</span>
                  </div>
                  <p className="text-xs text-secondary leading-relaxed font-body-sm">
                    {item.message}
                  </p>
                </div>

                {!item.read && (
                  <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

