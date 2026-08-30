import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft, Coffee } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-surface-bright flex items-center justify-center p-6 text-center selection:bg-primary/20">
      <div className="relative max-w-md w-full bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-8 shadow-sm space-y-6">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-primary-container/10 border border-primary-container/20 flex items-center justify-center text-primary">
          <Compass size={32} className="animate-spin" style={{ animationDuration: '10s' }} />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-status-pending-bg text-status-pending-text border border-status-pending-border font-label-caps text-label-caps uppercase tracking-wider">
            <Coffee size={12} />
            <span>404: Page Not Found</span>
          </div>
          <h1 className="font-headline-page text-headline-page text-on-surface text-2xl font-bold">
            Page Not Located
          </h1>
          <p className="font-body-sm text-xs text-secondary leading-relaxed max-w-sm mx-auto">
            The requested workforce resource or endpoint could not be found. Please check the URL or return to your dashboard.
          </p>
        </div>

        <div className="pt-2 flex items-center justify-center gap-3">
          <Link to="/dashboard" className="btn-primary text-xs py-2.5 px-5">
            <ArrowLeft size={15} />
            <span>Return to Workspace Dashboard</span>
          </Link>
        </div>

        <div className="font-mono-data text-[11px] text-secondary pt-4 border-t border-outline-variant/30">
          Error: 404_PAGE_NOT_FOUND · Cruvels Ltd.
        </div>
      </div>
    </div>
  );
};
