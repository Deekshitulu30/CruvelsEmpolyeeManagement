import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, ArrowLeft, Shield, Users, HeartHandshake, MapPin } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-surface-bright text-on-surface selection:bg-primary/20">
      <nav className="border-b border-outline-variant/30 bg-surface/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary-container/20 border border-primary/20 flex items-center justify-center text-primary font-bold">
              <span className="material-symbols-outlined text-[20px]">corporate_fare</span>
            </div>
            <div>
              <span className="font-headline-section text-headline-section text-primary font-bold text-lg">Cruvels Ltd.</span>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-xs font-semibold text-secondary hover:text-on-surface flex items-center gap-1 font-body-sm">
              <ArrowLeft size={14} />
              <span>Back to Home</span>
            </Link>
            <Link to="/login" className="btn-primary text-xs py-2 px-4">
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="text-center mb-16">
          <span className="font-label-caps text-label-caps uppercase tracking-widest text-primary">About Cruvels Ltd.</span>
          <h1 className="font-headline-page text-headline-page text-on-surface font-extrabold text-3xl sm:text-4xl tracking-tight mt-3 mb-6">
            Built for modern engineering and operations teams
          </h1>
          <p className="font-body-md text-base text-secondary leading-relaxed max-w-2xl mx-auto">
            Cruvels Ltd. designs intelligent workplace software that replaces scattered spreadsheets and legacy portals with a unified, high-performance operational hub.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 shadow-sm flex flex-col">
            <div className="w-10 h-10 rounded-lg bg-primary-container/10 border border-primary-container/20 flex items-center justify-center text-primary mb-4">
              <Shield size={20} />
            </div>
            <h3 className="font-headline-section text-headline-section text-on-surface font-semibold text-base mb-2">Security by Default</h3>
            <p className="font-body-sm text-xs text-secondary leading-relaxed">
              Every data point is guarded by Row-Level Security, AES-256 field encryption, and tamper-evident audit trails.
            </p>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 shadow-sm flex flex-col">
            <div className="w-10 h-10 rounded-lg bg-secondary-container/50 border border-secondary/20 flex items-center justify-center text-secondary mb-4">
              <Users size={20} />
            </div>
            <h3 className="font-headline-section text-headline-section text-on-surface font-semibold text-base mb-2">People-First Clarity</h3>
            <p className="font-body-sm text-xs text-secondary leading-relaxed">
              Streamlined leave submissions and one-click attendance check-ins built with respectful, intuitive human workflows.
            </p>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 shadow-sm flex flex-col">
            <div className="w-10 h-10 rounded-lg bg-status-active-bg border border-status-active-border flex items-center justify-center text-status-active-text mb-4">
              <HeartHandshake size={20} />
            </div>
            <h3 className="font-headline-section text-headline-section text-on-surface font-semibold text-base mb-2">Operational Integrity</h3>
            <p className="font-body-sm text-xs text-secondary leading-relaxed">
              Transparent multi-level approvals where managers and employees always share a single source of truth.
            </p>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 shadow-sm mb-12">
          <h2 className="font-headline-section text-headline-section text-on-surface font-bold text-xl mb-4">Corporate Headquarters</h2>
          <div className="flex items-start gap-3 text-xs text-secondary">
            <MapPin size={18} className="text-primary shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-on-surface text-sm">Cruvels Ltd. Operations Center</div>
              <div className="text-secondary mt-1 font-body-sm">Level 5, Brigade Tech Gardens, Brookefield, Bengaluru, Karnataka 560037, India</div>
              <div className="text-secondary mt-1 font-mono-data text-xs">Contact: contact@cruvels.com · +91 (80) 4122-8900</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
