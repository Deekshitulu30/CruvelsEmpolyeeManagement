import React from 'react';
import { Coffee, Sparkles, PartyPopper, Trophy, Lightbulb, MapPin, X } from 'lucide-react';

interface WatercoolerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WatercoolerModal: React.FC<WatercoolerModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-xl max-w-lg w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-outline-variant/30 flex items-center justify-between bg-surface-container-low">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-status-pending-bg text-status-pending-text border border-status-pending-border flex items-center justify-center">
              <Coffee size={18} />
            </div>
            <div>
              <h3 className="font-headline-section text-headline-section text-on-surface font-semibold text-sm">Cruvels Campus Bulletin & Watercooler</h3>
              <p className="font-body-sm text-[11px] text-secondary">Unfiltered updates from our Bengaluru engineering floor</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-secondary hover:text-on-surface p-1 rounded-lg hover:bg-surface-container transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-3.5 max-h-[75vh] overflow-y-auto">
          <div className="p-4 rounded-xl bg-surface-bright border border-outline-variant/30">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-on-surface flex items-center gap-1.5 font-headline">
                <PartyPopper size={14} className="text-primary" /> Priya's Birthday Celebration
              </span>
              <span className="text-[10px] text-secondary font-mono-data">Thursday 4:00 PM</span>
            </div>
            <p className="font-body-sm text-xs text-secondary leading-relaxed">
              Don't bring your own snacks on Thursday! The frontend team is ordering authentic Neapolitan pizza and dark chocolate cupcakes from the bakery around the corner.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-surface-bright border border-outline-variant/30">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-on-surface flex items-center gap-1.5 font-headline">
                <Trophy size={14} className="text-status-active-text" /> Cruvels Smash Badminton Cup
              </span>
              <span className="text-[10px] text-secondary font-mono-data">Saturday 8:00 AM</span>
            </div>
            <p className="font-body-sm text-xs text-secondary leading-relaxed">
              Doubles tournament at Whitefield Sports Complex. Vikram and Arjun are defending their title. Two slots open for newcomers. Bring your own racket; shuttlecocks provided by HR!
            </p>
          </div>

          <div className="p-4 rounded-xl bg-primary-container/5 border border-primary/20">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-primary flex items-center gap-1.5 font-headline">
                <Lightbulb size={14} /> Floor 3 Filter Coffee Secret
              </span>
              <span className="font-label-caps text-[10px] text-primary font-mono-data">Pro Tip</span>
            </div>
            <p className="font-body-sm text-xs text-secondary leading-relaxed">
              The coffee machine by the east pantry on 3rd floor was recalibrated with Chikmagalur roast. It is 10x better than the 1st floor machine. You're welcome.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-surface-bright border border-outline-variant/30">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-on-surface flex items-center gap-1.5 font-headline">
                <Sparkles size={14} className="text-secondary" /> The Great Friday Night Migration
              </span>
              <span className="text-[10px] text-secondary font-mono-data">Engineering Lore</span>
            </div>
            <p className="font-body-sm text-xs text-secondary leading-relaxed">
              Why do we have the _migrations tracking table today? Because last sprint, an eager dev accidentally ran CREATE TYPE twice during deployment and took down the local staging DB. We wrote idempotent migration tracking so it will never happen again!
            </p>
          </div>
        </div>

        <div className="px-6 py-3.5 border-t border-outline-variant/30 bg-surface-container-low flex items-center justify-between text-xs text-secondary font-body-sm">
          <span className="flex items-center gap-1">
            <MapPin size={13} className="text-primary" /> Bengaluru Technology Park
          </span>
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary text-xs py-1.5 px-3"
          >
            Close Bulletin
          </button>
        </div>
      </div>
    </div>
  );
};
