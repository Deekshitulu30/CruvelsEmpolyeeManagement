import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Mail, MapPin, Phone } from 'lucide-react';
import toast from 'react-hot-toast';

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error('Please complete all required fields.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      toast.success('Your message has been sent to Cruvels support.');
    }, 600);
  };

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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-12">
          <span className="font-label-caps text-label-caps uppercase tracking-widest text-primary">Get in Touch</span>
          <h1 className="font-headline-page text-headline-page text-on-surface font-extrabold text-3xl sm:text-4xl tracking-tight mt-2">
            Contact Cruvels Support & Sales
          </h1>
          <p className="font-body-md text-xs sm:text-sm text-secondary mt-2 max-w-md mx-auto">
            Questions regarding employee portal setup, enterprise licenses, or custom integrations? Send us a message.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-3 text-primary mb-2">
                <Mail size={18} />
                <h2 className="font-label-caps text-label-caps uppercase tracking-wider text-on-surface">Email Inquiries</h2>
              </div>
              <p className="font-body-sm text-xs text-secondary">contact@cruvels.com</p>
              <p className="font-body-sm text-xs text-secondary">support@cruvels.com</p>
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-3 text-primary mb-2">
                <Phone size={18} />
                <h2 className="font-label-caps text-label-caps uppercase tracking-wider text-on-surface">Direct Desk</h2>
              </div>
              <p className="font-body-sm text-xs text-secondary">+91 (80) 4122-8900</p>
              <p className="font-mono-data text-[11px] text-secondary mt-1">Mon – Fri: 9:00 AM – 6:30 PM IST</p>
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-3 text-primary mb-2">
                <MapPin size={18} />
                <h2 className="font-label-caps text-label-caps uppercase tracking-wider text-on-surface">Bengaluru Campus</h2>
              </div>
              <p className="font-body-sm text-xs text-secondary leading-relaxed">
                Cruvels Ltd. Level 5, Brigade Tech Gardens, Brookefield, Bengaluru 560037
              </p>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 shadow-sm">
              {submitted ? (
                <div className="text-center py-10 space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-status-active-bg border border-status-active-border flex items-center justify-center text-status-active-text mx-auto">
                    <CheckCircle2 size={30} />
                  </div>
                  <h2 className="font-headline-section text-headline-section text-on-surface font-bold text-xl">Message Dispatched</h2>
                  <p className="font-body-sm text-xs text-secondary max-w-sm mx-auto">
                    Thank you, {name}. Our customer success desk has received your ticket and will follow up at {email} within 4 business hours.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setName('');
                      setEmail('');
                      setSubject('');
                      setMessage('');
                    }}
                    className="btn-secondary text-xs mt-2"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label text-xs">Full Name *</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ananya Gupta"
                        className="form-input text-xs"
                        required
                      />
                    </div>
                    <div>
                      <label className="form-label text-xs">Work Email *</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="ananya@company.com"
                        className="form-input text-xs"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="form-label text-xs">Subject / Department</label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g. Enterprise License or API Inquiry"
                      className="form-input text-xs"
                    />
                  </div>

                  <div>
                    <label className="form-label text-xs">Message *</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={5}
                      placeholder="How can our workforce specialists assist you?"
                      className="form-input text-xs resize-none"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary text-xs w-full justify-center"
                  >
                    {isSubmitting ? 'Sending...' : 'Dispatch Message'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
