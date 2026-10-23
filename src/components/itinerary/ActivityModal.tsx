import React, { useState, useEffect } from 'react';
import { X, Clock, MapPin, DollarSign, Tag, FileText } from 'lucide-react';
import { Activity, ActivityCategory } from '../../types/travel';

interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Activity>) => Promise<void>;
  activityToEdit?: Activity | null;
  tripDurationDays: number;
  initialDayIndex?: number;
  currency: string;
}

const CATEGORIES: { id: ActivityCategory; label: string; icon: string }[] = [
  { id: 'sightseeing', label: 'Sightseeing & Culture', icon: '🏛️' },
  { id: 'food', label: 'Food & Dining', icon: '🍷' },
  { id: 'experience', label: 'Tour & Experience', icon: '✨' },
  { id: 'transport', label: 'Transit & Flight', icon: '🚆' },
  { id: 'lodging', label: 'Hotel & Stay', icon: '🏨' },
  { id: 'shopping', label: 'Market & Shopping', icon: '🛍️' },
  { id: 'other', label: 'Other', icon: '📌' },
];

export const ActivityModal: React.FC<ActivityModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  activityToEdit,
  tripDurationDays,
  initialDayIndex = 1,
  currency,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ActivityCategory>('sightseeing');
  const [dayIndex, setDayIndex] = useState(initialDayIndex);
  const [startTime, setStartTime] = useState('10:00 AM');
  const [endTime, setEndTime] = useState('12:00 PM');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [actualCost, setActualCost] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (activityToEdit) {
      setName(activityToEdit.name);
      setCategory(activityToEdit.category);
      setDayIndex(activityToEdit.dayIndex);
      setStartTime(activityToEdit.startTime || '10:00 AM');
      setEndTime(activityToEdit.endTime || '');
      setLocation(activityToEdit.location || '');
      setDescription(activityToEdit.description || '');
      setEstimatedCost(activityToEdit.estimatedCost || 0);
      setActualCost(activityToEdit.actualCost !== undefined ? String(activityToEdit.actualCost) : '');
      setNotes(activityToEdit.notes || '');
    } else {
      setName('');
      setCategory('sightseeing');
      setDayIndex(initialDayIndex);
      setStartTime('10:00 AM');
      setEndTime('12:00 PM');
      setLocation('');
      setDescription('');
      setEstimatedCost(0);
      setActualCost('');
      setNotes('');
    }
  }, [activityToEdit, initialDayIndex, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        category,
        dayIndex: Number(dayIndex) || 1,
        startTime,
        endTime: endTime || undefined,
        location: location.trim(),
        description: description.trim(),
        estimatedCost: Number(estimatedCost) || 0,
        actualCost: actualCost !== '' ? Number(actualCost) : undefined,
        notes: notes.trim(),
        currency,
      });
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#FBF8F3] rounded-2xl max-w-lg w-full border border-stone-300 shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 bg-[#1B4332] text-white flex items-center justify-between">
          <h3 className="font-editorial text-xl font-bold">
            {activityToEdit ? 'Edit Itinerary Stop' : 'Add Activity to Itinerary'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-emerald-200 hover:text-white hover:bg-emerald-800 transition-colors cursor-pointer"
            aria-label="Close activity dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[82vh] overflow-y-auto">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
              Activity Name <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Sunrise Torii Gate Walk"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
            />
          </div>

          {/* Category & Day */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ActivityCategory)}
                className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Day of Trip
              </label>
              <select
                value={dayIndex}
                onChange={(e) => setDayIndex(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
              >
                {Array.from({ length: Math.max(1, tripDurationDays) }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>
                    Day {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Timing */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Start Time
              </label>
              <div className="relative">
                <Clock className="w-3.5 h-3.5 absolute left-3 top-3 text-stone-400" />
                <input
                  type="text"
                  placeholder="09:30 AM"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                End Time
              </label>
              <div className="relative">
                <Clock className="w-3.5 h-3.5 absolute left-3 top-3 text-stone-400" />
                <input
                  type="text"
                  placeholder="11:30 AM"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
              Location / Venue
            </label>
            <div className="relative">
              <MapPin className="w-3.5 h-3.5 absolute left-3 top-3 text-stone-400" />
              <input
                type="text"
                placeholder="e.g. Fushimi Inari Taisha, Kyoto"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
              />
            </div>
          </div>

          {/* Costs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Estimated Cost ({currency})
              </label>
              <div className="relative">
                <DollarSign className="w-3.5 h-3.5 absolute left-3 top-3 text-stone-400" />
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={estimatedCost}
                  onChange={(e) => setEstimatedCost(Number(e.target.value))}
                  className="w-full pl-8 pr-3 py-2 text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Actual Spent ({currency})
              </label>
              <div className="relative">
                <DollarSign className="w-3.5 h-3.5 absolute left-3 top-3 text-stone-400" />
                <input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Optional"
                  value={actualCost}
                  onChange={(e) => setActualCost(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
              Description / Experience Details
            </label>
            <textarea
              rows={2}
              placeholder="What to see, taste, or explore during this stop..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
            ></textarea>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
              Travel Notes / Reservation Info
            </label>
            <input
              type="text"
              placeholder="Booking codes, dress code, tickets info..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 bg-stone-200/50 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-medium bg-[#1B4332] hover:bg-[#2D6A4F] text-[#FBF8F3] rounded-lg transition-colors shadow-2xs disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Saving...' : activityToEdit ? 'Save Changes' : 'Add to Day'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
