import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { User } from '../types';
import { authService } from '../services/authService';
import { ConcurrentSessionModal } from '../components/shared/ConcurrentSessionModal';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  ssoLogin: (email: string, provider: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const getTabId = (): string => {
  let tabId = sessionStorage.getItem('cruvels_tab_id');
  if (!tabId) {
    tabId = 'tab_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
    sessionStorage.setItem('cruvels_tab_id', tabId);
  }
  return tabId;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = sessionStorage.getItem('ems_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [concurrentModal, setConcurrentModal] = useState<{ isOpen: boolean; message: string }>({
    isOpen: false,
    message: '',
  });

  const userRef = useRef<User | null>(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const handleExternalLogin = useCallback((payload: { userId: number; userEmail?: string; tabId: string }) => {
    const currentTabId = getTabId();
    if (payload.tabId !== currentTabId) {
      const activeUser = userRef.current;
      const stored = sessionStorage.getItem('ems_user');
      const currentUser = activeUser || (stored ? JSON.parse(stored) : null);

      if (currentUser && (currentUser.id === payload.userId || currentUser.email === payload.userEmail)) {
        sessionStorage.removeItem('ems_token');
        sessionStorage.removeItem('ems_user');
        setUser(null);
        setConcurrentModal({
          isOpen: true,
          message: 'You have been logged out because this account was logged into from another tab or another device. To protect organization data, concurrent sessions are restricted.',
        });
      }
    }
  }, []);

  useEffect(() => {
    const currentTabId = getTabId();

    const channel = typeof window !== 'undefined' && 'BroadcastChannel' in window
      ? new BroadcastChannel('cruvels_session_channel')
      : null;

    if (channel) {
      channel.onmessage = (event) => {
        if (event.data?.type === 'CONCURRENT_LOGIN') {
          handleExternalLogin(event.data);
        }
      };
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'cruvels_latest_session_broadcast' && e.newValue) {
        try {
          const payload = JSON.parse(e.newValue);
          if (payload?.type === 'CONCURRENT_LOGIN') {
            handleExternalLogin(payload);
          }
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorage);

    const handleApiConcurrentLogout = (e: Event) => {
      const customEvent = e as CustomEvent<{ message?: string }>;
      sessionStorage.removeItem('ems_token');
      sessionStorage.removeItem('ems_user');
      setUser(null);
      setConcurrentModal({
        isOpen: true,
        message: customEvent.detail?.message || 'You have been logged out because this account was logged into from another tab or another device.',
      });
    };
    window.addEventListener('cruvels_concurrent_logout', handleApiConcurrentLogout);

    return () => {
      channel?.close();
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('cruvels_concurrent_logout', handleApiConcurrentLogout);
    };
  }, [handleExternalLogin]);

  useEffect(() => {
    const token = sessionStorage.getItem('ems_token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    authService.getMe()
      .then((data) => {
        const stored = sessionStorage.getItem('ems_user');
        if (stored) setUser(JSON.parse(stored));
      })
      .catch(() => {
        sessionStorage.removeItem('ems_token');
        sessionStorage.removeItem('ems_user');
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (!user) return;

    const checkSessionLiveness = () => {
      const token = sessionStorage.getItem('ems_token');
      if (!token) return;
      authService.getMe().catch(() => {});
    };

    const interval = setInterval(checkSessionLiveness, 6000);
    const handleFocus = () => checkSessionLiveness();

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, [user]);

  const login = useCallback(async (email: string, password: string) => {
    const { access_token, user: userData } = await authService.login(email, password);
    sessionStorage.setItem('ems_token', access_token);
    sessionStorage.setItem('ems_user', JSON.stringify(userData));
    setUser(userData);

    const currentTabId = getTabId();
    const payload = {
      type: 'CONCURRENT_LOGIN',
      userId: userData.id,
      userEmail: userData.email,
      tabId: currentTabId,
      timestamp: Date.now(),
    };

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        const channel = new BroadcastChannel('cruvels_session_channel');
        channel.postMessage(payload);
        channel.close();
      } catch {}
    }

    try {
      localStorage.setItem('cruvels_latest_session_broadcast', JSON.stringify(payload));
    } catch {}
  }, []);

  const ssoLogin = useCallback(async (email: string, provider: string) => {
    const { access_token, user: userData } = await authService.ssoLogin(email, provider);
    sessionStorage.setItem('ems_token', access_token);
    sessionStorage.setItem('ems_user', JSON.stringify(userData));
    setUser(userData);

    const currentTabId = getTabId();
    const payload = {
      type: 'CONCURRENT_LOGIN',
      userId: userData.id,
      userEmail: userData.email,
      tabId: currentTabId,
      timestamp: Date.now(),
    };

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        const channel = new BroadcastChannel('cruvels_session_channel');
        channel.postMessage(payload);
        channel.close();
      } catch {}
    }

    try {
      localStorage.setItem('cruvels_latest_session_broadcast', JSON.stringify(payload));
    } catch {}
  }, []);

  const logout = useCallback(async () => {
    try { await authService.logout(); } catch {}
    sessionStorage.removeItem('ems_token');
    sessionStorage.removeItem('ems_user');
    setUser(null);
  }, []);

  const handleReturnToLogin = () => {
    setConcurrentModal({ isOpen: false, message: '' });
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, ssoLogin, logout }}>
      {children}
      <ConcurrentSessionModal
        isOpen={concurrentModal.isOpen}
        message={concurrentModal.message}
        onConfirm={handleReturnToLogin}
      />
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
