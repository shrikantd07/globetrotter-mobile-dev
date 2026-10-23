import React, { useState } from 'react';
import { X, Share2, Copy, Check, Globe, Lock, ExternalLink } from 'lucide-react';
import { Trip } from '../../types/travel';
import { useTrips } from '../../context/TripContext';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, trip }) => {
  const { toggleShareTrip } = useTrips();
  const [copied, setCopied] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  if (!isOpen) return null;

  const shareUrl = trip.shareToken
    ? `${window.location.origin}/#/share/${trip.shareToken}`
    : '';

  const handleToggle = async () => {
    setIsUpdating(true);
    try {
      await toggleShareTrip(trip.id, !trip.isPublic);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCopy = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-[#FBF8F3] rounded-3xl max-w-md w-full border border-stone-300 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-5 bg-[#1B4332] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Share2 className="w-5 h-5 text-emerald-300" />
            <h3 className="font-editorial text-xl font-bold">Share Itinerary</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-emerald-200 hover:text-white hover:bg-emerald-800 transition-colors cursor-pointer"
            aria-label="Close Share Dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status & Toggle */}
          <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-stone-200">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                trip.isPublic ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-500'
              }`}>
                {trip.isPublic ? <Globe className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
              </div>
              <div>
                <div className="text-sm font-bold text-stone-900">
                  {trip.isPublic ? 'Public Share Link Active' : 'Trip is Currently Private'}
                </div>
                <div className="text-xs text-stone-500">
                  {trip.isPublic ? 'Anyone with the link can view' : 'Only you can view this itinerary'}
                </div>
              </div>
            </div>

            <button
              onClick={handleToggle}
              disabled={isUpdating}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                trip.isPublic
                  ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                  : 'bg-[#1B4332] text-white hover:bg-[#2D6A4F]'
              }`}
            >
              {isUpdating ? '...' : trip.isPublic ? 'Make Private' : 'Enable Link'}
            </button>
          </div>

          {/* Share Link Field */}
          {trip.isPublic && (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider">
                Public Read-Only URL
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-xl font-mono text-stone-600 focus:outline-none"
                />
                <button
                  onClick={handleCopy}
                  className="px-3 py-2 bg-[#1B4332] hover:bg-[#2D6A4F] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer flex-shrink-0"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="text-[11px] text-stone-500 pt-1">
                Shared links display the day-by-day timeline, activities, and photos. Private budget ledgers and personal contact details remain hidden.
              </div>
            </div>
          )}

          <div className="pt-2 border-t border-stone-200 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
