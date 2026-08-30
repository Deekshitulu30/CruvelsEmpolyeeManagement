import React from 'react';
import { Link } from 'react-router-dom';
import { ServerCrash, RefreshCw, ArrowLeft } from 'lucide-react';

export const ServerErrorPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-surface-bright flex items-center justify-center p-6 text-center selection:bg-primary/20">
      <div className="relative max-w-md w-full bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-8 shadow-sm space-y-6">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-status-pending-bg border border-status-pending-border flex items-center justify-center text-status-pending-text">
          <ServerCrash size={32} />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-status-pending-bg text-status-pending-text border border-status-pending-border font-label-caps text-label-caps uppercase tracking-wider">
            <span>500: Server Exception</span>
          </div>
          <h1 className="font-headline-page text-headline-page text-on-surface text-2xl font-bold">
            System Hiccup
          </h1>
          <p className="font-body-sm text-xs text-secondary leading-relaxed max-w-sm mx-auto">
            An unexpected error occurred while communicating with the workforce service. Our automated telemetry monitor has logged this incident.
          </p>
        </div>

        <div className="pt-2 flex items-center justify-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="btn-secondary text-xs py-2.5 px-4"
          >
            <RefreshCw size={14} />
            <span>Reload Page</span>
          </button>
          <Link to="/dashboard" className="btn-primary text-xs py-2.5 px-4">
            <ArrowLeft size={14} />
            <span>Return to Desk</span>
          </Link>
        </div>

        <div className="font-mono-data text-[11px] text-secondary pt-4 border-t border-outline-variant/30">
          Telemetry monitor: ACTIVE · Cruvels Ltd. Infrastructure
        </div>
      </div>
    </div>
  );
};
