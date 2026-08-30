import React, { useState, useEffect } from 'react';
import { Cookie, Check } from 'lucide-react';

export const CookieBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem('cruvels_cookie_consent');
    if (!accepted) {
      const timer = setTimeout(() => setIsVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('cruvels_cookie_consent', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 max-w-sm z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-status-pending-bg text-status-pending-text border border-status-pending-border flex items-center justify-center shrink-0 mt-0.5">
            <Cookie size={17} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-bold text-on-surface mb-1 font-headline">
              <span>Purely Essential Cookies</span>
              <span className="font-label-caps text-[9px] px-1.5 py-0.5 rounded-full bg-status-active-bg text-status-active-text border border-status-active-border">
                0 Ad Trackers
              </span>
            </div>
            <p className="font-body-sm text-[11px] text-secondary leading-relaxed">
              We only use browser storage strictly necessary to keep your shift session alive. Zero third-party surveillance or marketing cookies.
            </p>
            <div className="mt-3 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleDismiss}
                className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1"
              >
                <Check size={13} />
                <span>Got it, thanks!</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
