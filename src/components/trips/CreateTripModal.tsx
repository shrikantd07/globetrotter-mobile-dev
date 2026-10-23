import React, { useState } from 'react';
import { X, Calendar, DollarSign, MapPin, Sparkles, Image as ImageIcon } from 'lucide-react';
import { Trip } from '../../types/travel';
import { calculateTripDuration } from '../../utils/travel-calc';

interface CreateTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Trip>) => Promise<Trip>;
  initialDestination?: string;
  initialCoverImage?: string;
}

const PRESET_COVERS = [
  { label: 'Amalfi Coast', url: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Kyoto Temples', url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Swiss Alps', url: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Patagonia Spires', url: 'https://images.unsplash.com/photo-1527004013197-933c4bb611b3?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Parisian Boulevard', url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Santorini Sunset', url: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80' },
];

export const CreateTripModal: React.FC<CreateTripModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialDestination = '',
  initialCoverImage,
}) => {
  const [destination, setDestination] = useState(initialDestination);
  const [title, setTitle] = useState(initialDestination ? `${initialDestination} Getaway` : '');
  const [startDate, setStartDate] = useState('2026-11-15');
  const [endDate, setEndDate] = useState('2026-11-20');
  const [budget, setBudget] = useState(2000);
  const [currency, setCurrency] = useState('USD');
  const [travelStyle, setTravelStyle] = useState<Trip['travelStyle']>('Balanced');
  const [travelerCount, setTravelerCount] = useState(2);
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState(initialCoverImage || PRESET_COVERS[0].url);
  const [customCoverUrl, setCustomCoverUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const durationDays = calculateTripDuration(startDate, endDate);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!destination.trim()) {
      setError('Please provide a destination.');
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      setError('End date cannot precede the start date.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim() || `${destination} Journey`,
        destination: destination.trim(),
        startDate,
        endDate,
        budget: Number(budget) || 1000,
        currency,
        travelStyle,
        travelerCount: Number(travelerCount) || 1,
        description: description.trim() || `An inspiring trip to ${destination}.`,
        coverImage: customCoverUrl.trim() || coverImage,
        isPublic: false,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to create trip');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#FBF8F3] rounded-2xl max-w-2xl w-full border border-stone-300 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-5 bg-[#1B4332] text-white flex items-center justify-between">
          <div>
            <h2 className="font-editorial text-2xl font-bold">Plan a New Journey</h2>
            <p className="text-xs text-emerald-200">Set the dates, budget, and aesthetic for your next expedition</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-emerald-200 hover:text-white hover:bg-emerald-800 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 text-xs rounded-lg bg-rose-50 text-rose-800 border border-rose-200">
              {error}
            </div>
          )}

          {/* Destination & Title */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Destination <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Kyoto, Japan or Amalfi Coast"
                  value={destination}
                  onChange={(e) => {
                    setDestination(e.target.value);
                    if (!title || title.endsWith('Journey') || title.endsWith('Getaway')) {
                      setTitle(`${e.target.value} Journey`);
                    }
                  }}
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Trip Name
              </label>
              <input
                type="text"
                placeholder="e.g. Autumn Zen & Momiji Tour"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
              />
            </div>
          </div>

          {/* Dates & Duration Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Departure Date
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Return Date
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
              />
            </div>
          </div>

          {/* Duration Badge */}
          <div className="bg-emerald-900/5 border border-emerald-900/10 rounded-lg px-4 py-2 flex items-center justify-between text-xs text-[#1B4332]">
            <span className="font-medium">Total Duration:</span>
            <span className="font-bold">{durationDays} {durationDays === 1 ? 'day' : 'days'} on the road</span>
          </div>

          {/* Budget & Currency */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Target Budget
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="JPY">JPY (¥)</option>
                <option value="CHF">CHF (Fr)</option>
                <option value="CAD">CAD ($)</option>
                <option value="AUD">AUD ($)</option>
                <option value="INR">INR (₹)</option>
              </select>
            </div>
          </div>

          {/* Style & Travelers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Travel Style
              </label>
              <select
                value={travelStyle}
                onChange={(e) => setTravelStyle(e.target.value as Trip['travelStyle'])}
                className="w-full px-3 py-2.5 text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
              >
                <option value="Balanced">Balanced & Leisurely</option>
                <option value="Luxury">Luxury & Fine Hospitality</option>
                <option value="Cultural">Cultural & Historic Heritage</option>
                <option value="Culinary">Culinary & Gastronomy Focus</option>
                <option value="Adventure">Active Trekking & Outdoors</option>
                <option value="Relaxed">Slow Travel & Retreat</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Traveler Count
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={travelerCount}
                onChange={(e) => setTravelerCount(Number(e.target.value))}
                className="w-full px-3 py-2.5 text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
              />
            </div>
          </div>

          {/* Cover Photo Selection */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
              Select Cover Artwork
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {PRESET_COVERS.map((preset) => (
                <button
                  type="button"
                  key={preset.url}
                  onClick={() => {
                    setCoverImage(preset.url);
                    setCustomCoverUrl('');
                  }}
                  className={`relative aspect-4/3 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                    coverImage === preset.url && !customCoverUrl ? 'border-[#1B4332] ring-2 ring-[#1B4332]/30 scale-102' : 'border-transparent opacity-75 hover:opacity-100'
                  }`}
                >
                  <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            
            <div className="mt-3">
              <input
                type="url"
                placeholder="Or paste custom image URL (https://...)"
                value={customCoverUrl}
                onChange={(e) => setCustomCoverUrl(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Journal Notes / Vision
            </label>
            <textarea
              rows={2}
              placeholder="What are the dreams, mood, or key goals for this voyage?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
            ></textarea>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-stone-600 hover:text-stone-900 bg-stone-200/50 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 text-sm font-medium bg-[#1B4332] hover:bg-[#2D6A4F] text-[#FBF8F3] rounded-lg shadow-sm transition-all disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              {isSubmitting ? 'Creating Trip...' : 'Create Itinerary Journal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
