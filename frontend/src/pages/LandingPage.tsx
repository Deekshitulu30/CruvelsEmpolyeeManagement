import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, CheckCircle2, Sparkles, ShieldCheck,
  Clock, Calendar, Users, Briefcase
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="bg-background text-on-surface font-body-md antialiased selection:bg-primary-container selection:text-on-primary-container min-h-screen flex flex-col">
      <nav className="bg-surface/80 backdrop-blur-md fixed top-0 w-full z-50 border-b border-outline-variant/30 shadow-sm transition-colors duration-200">
        <div className="flex justify-between items-center px-margin-mobile md:px-margin-desktop py-4 max-w-container-max mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center font-bold text-base shadow-sm">
              C
            </div>
            <span className="font-headline-section text-headline-section font-bold text-primary">Cruvels</span>
          </div>

          <div className="hidden md:flex gap-gutter items-center">
            <a className="font-body-md text-body-md text-secondary hover:text-primary transition-colors" href="#features">
              Features
            </a>
            <Link className="font-body-md text-body-md text-secondary hover:text-primary transition-colors" to="/about">
              About
            </Link>
            <Link className="font-body-md text-body-md text-secondary hover:text-primary transition-colors" to="/contact">
              Contact
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="font-body-md text-body-md text-secondary hover:text-primary transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="bg-primary hover:bg-surface-tint text-on-primary font-body-md text-body-md px-6 py-2 rounded-lg transition-all transform hover:scale-105 duration-300 relative overflow-hidden group shadow-sm"
            >
              <span className="relative z-10">Get Started</span>
              <div className="absolute inset-0 w-full h-full btn-shimmer group-hover:animate-shimmer pointer-events-none" />
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-[72px] flex-1">
        <section className="relative overflow-hidden py-20 md:py-28 px-margin-mobile md:px-margin-desktop flex flex-col items-center justify-center min-h-[85vh]">
          <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary-container/20 via-background to-background" />

          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-container/10 border border-primary/20 text-primary text-xs font-semibold mb-6">
              <Sparkles size={14} className="text-primary" />
              <span>Next-Gen Enterprise Workforce Operations</span>
            </div>

            <h1 className="font-display-hero-mobile md:font-display-hero text-display-hero-mobile md:text-display-hero text-on-surface mb-6 leading-tight">
              Your people. Your operations. <span className="text-primary">One workspace.</span>
            </h1>

            <p className="font-body-lg text-body-lg text-on-surface-variant mb-10 max-w-2xl mx-auto">
              The intelligent employee platform designed for modern teams. Streamline HR, track attendance, automate leave approvals, and empower your workforce.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/signup"
                className="bg-primary hover:bg-surface-tint text-on-primary font-body-md text-body-md px-8 py-4 rounded-lg shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg w-full sm:w-auto relative overflow-hidden group flex items-center justify-center gap-2"
              >
                <span className="relative z-10">Start for free</span>
                <ArrowRight size={16} className="relative z-10" />
                <div className="absolute inset-0 w-full h-full btn-shimmer group-hover:animate-shimmer pointer-events-none" />
              </Link>
              <Link
                to="/login"
                className="bg-surface-container-lowest border border-outline-variant text-on-surface hover:bg-surface-container-low font-body-md text-body-md px-8 py-4 rounded-lg transition-all hover:-translate-y-1 hover:shadow-md w-full sm:w-auto text-center"
              >
                Sign In to Your Desk
              </Link>
            </div>
          </div>

          <div className="relative mt-16 w-full max-w-5xl mx-auto z-10">
            <div className="bg-surface-container-lowest/90 backdrop-blur-xl border border-outline-variant/40 rounded-xl shadow-xl overflow-hidden p-6 md:p-8">
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-outline-variant/20">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center font-bold text-xs">
                    C
                  </div>
                  <div>
                    <span className="font-semibold text-sm text-on-surface">Cruvels Workspace</span>
                    <span className="block text-[11px] text-on-surface-variant font-mono-data">app.cruvels.com/dashboard</span>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-status-active-bg text-status-active-text border border-status-active-border text-xs font-medium">
                  <span className="w-2 h-2 rounded-full bg-status-active-text animate-pulse" />
                  Live System
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-surface-bright border border-outline-variant/30">
                  <div className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">Attendance Rate</div>
                  <div className="font-headline-section text-headline-section font-bold text-on-surface">98.4%</div>
                  <div className="text-[11px] text-status-active-text mt-1 flex items-center gap-1">
                    <CheckCircle2 size={12} />
                    <span>Realtime check-in sync</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-surface-bright border border-outline-variant/30">
                  <div className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">Leave Requests</div>
                  <div className="font-headline-section text-headline-section font-bold text-status-pending-text">Zero Backlog</div>
                  <div className="text-[11px] text-on-surface-variant mt-1">Multi-tier approval active</div>
                </div>

                <div className="p-4 rounded-xl bg-surface-bright border border-outline-variant/30">
                  <div className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">Security Health</div>
                  <div className="font-headline-section text-headline-section font-bold text-primary">51 / 51 Hardened</div>
                  <div className="text-[11px] text-on-surface-variant mt-1">RLS & AES-256 active</div>
                </div>
              </div>

              <div className="rounded-lg bg-surface-container-low border border-outline-variant/30 p-3 text-xs font-mono-data text-on-surface-variant flex items-center justify-between">
                <span>Enterprise RBAC: ADMIN · MANAGER · EMPLOYEE isolation enforced</span>
                <span className="text-primary font-semibold">PostgreSQL 16 Engine</span>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 border-y border-outline-variant/30 bg-surface-container-low">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
            <p className="text-center font-label-caps text-label-caps text-on-surface-variant mb-6 uppercase tracking-widest">
              Trusted by innovative teams worldwide
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-70">
              <span className="font-headline-section text-headline-section text-secondary font-bold">NOVA</span>
              <span className="font-headline-section text-headline-section text-secondary font-bold">Vertex</span>
              <span className="font-headline-section text-headline-section text-secondary font-bold">Acme</span>
              <span className="font-headline-section text-headline-section text-secondary font-bold">Orbit</span>
              <span className="font-headline-section text-headline-section text-secondary font-bold">Northstar</span>
            </div>
          </div>
        </section>

        <section id="features" className="py-20 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="font-headline-page text-headline-page text-on-surface mb-3">Engineered for real operational excellence</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">Built to replace disjointed HR spreadsheets with a unified system.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 p-6 shadow-sm hover:border-primary/40 transition-all">
              <div className="w-10 h-10 rounded-lg bg-primary-container/20 text-primary flex items-center justify-center mb-4">
                <Clock size={20} />
              </div>
              <h3 className="font-headline-section text-headline-section text-on-surface font-semibold text-lg mb-2">Shift & Attendance Tracking</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                One-click punch in/out with automated half-day calculations, geo-presence telemetry, and zero duplicate timestamps.
              </p>
            </div>

            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 p-6 shadow-sm hover:border-primary/40 transition-all">
              <div className="w-10 h-10 rounded-lg bg-secondary-container/50 text-secondary flex items-center justify-center mb-4">
                <Calendar size={20} />
              </div>
              <h3 className="font-headline-section text-headline-section text-on-surface font-semibold text-lg mb-2">Leave Workflow Automation</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                Smart balance calculation, weekend exclusion, overlap collision detection, and full manager approval chains.
              </p>
            </div>

            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 p-6 shadow-sm hover:border-primary/40 transition-all">
              <div className="w-10 h-10 rounded-lg bg-status-active-bg text-status-active-text flex items-center justify-center mb-4">
                <ShieldCheck size={20} />
              </div>
              <h3 className="font-headline-section text-headline-section text-on-surface font-semibold text-lg mb-2">Enterprise Grade Security</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                Strict Row-Level Security, AES-256 encrypted fields, complete immutable audit logging, and automated session invalidation.
              </p>
            </div>
          </div>
        </section>

        <section className="py-20 px-margin-mobile md:px-margin-desktop bg-surface-container-low border-t border-outline-variant/30">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-headline-page text-headline-page text-on-surface mb-4">Make employee operations simpler.</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant mb-8">
              Join teams building a cleaner, more respectful workplace with Cruvels.
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 bg-primary hover:bg-surface-tint text-on-primary font-body-md text-body-md px-8 py-4 rounded-lg shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <span>Get Started Today</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </main>
      <footer className="w-full py-12 border-t border-outline-variant bg-surface-container-highest">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
          <div className="col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-md bg-primary text-on-primary flex items-center justify-center font-bold text-xs">
                C
              </div>
              <span className="font-headline-section text-headline-section font-bold text-on-surface">Cruvels</span>
            </div>
            <p className="font-body-sm text-body-sm text-secondary">Enterprise HR operations redefined.</p>
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-label-caps text-label-caps text-on-surface uppercase font-semibold">Product</span>
            <a className="font-body-sm text-body-sm text-secondary hover:text-primary transition-colors" href="#features">Features</a>
            <Link className="font-body-sm text-body-sm text-secondary hover:text-primary transition-colors" to="/pricing">Pricing</Link>
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-label-caps text-label-caps text-on-surface uppercase font-semibold">Company</span>
            <Link className="font-body-sm text-body-sm text-secondary hover:text-primary transition-colors" to="/about">About Us</Link>
            <Link className="font-body-sm text-body-sm text-secondary hover:text-primary transition-colors" to="/contact">Contact</Link>
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-label-caps text-label-caps text-on-surface uppercase font-semibold">Security</span>
            <span className="font-body-sm text-body-sm text-secondary">SOC2 & ISO Ready</span>
            <span className="font-body-sm text-body-sm text-secondary">AES-256 GCM</span>
          </div>
        </div>
        <div className="mt-8 text-center font-body-sm text-body-sm text-secondary text-xs">
          © {new Date().getFullYear()} Cruvels Ltd. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

