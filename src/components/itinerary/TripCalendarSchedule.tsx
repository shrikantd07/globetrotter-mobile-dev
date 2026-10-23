import React, { useState } from 'react';
import { Calendar, Clock, MapPin, DollarSign, Plus, ArrowLeft, ArrowRight, Sparkles, MoveRight, MoveLeft } from 'lucide-react';
import { Trip, Activity, ActivityCategory } from '../../types/travel';
import { useTrips } from '../../context/TripContext';
import { formatCurrency, sortActivities } from '../../utils/travel-calc';
import { ActivityModal } from './ActivityModal';

interface TripCalendarScheduleProps {
  trip: Trip;
  onOpenAiPlanner: () => void;
}

const CATEGORY_STYLES: Record<ActivityCategory, { bg: string; text: string; icon: string; border: string }> = {
  sightseeing: { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200', icon: '🏛️' },
  food: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200', icon: '🍷' },
  experience: { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200', icon: '✨' },
  transport: { bg: 'bg-sky-50', text: 'text-sky-800', border: 'border-sky-200', icon: '🚆' },
  lodging: { bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-200', icon: '🏨' },
  shopping: { bg: 'bg-orange-50', text: 'text-orange-800', border: 'border-orange-200', icon: '🛍️' },
  other: { bg: 'bg-stone-100', text: 'text-stone-800', border: 'border-stone-200', icon: '📌' },
};

export const TripCalendarSchedule: React.FC<TripCalendarScheduleProps> = ({ trip, onOpenAiPlanner }) => {
  const { activities, moveActivityToDay, deleteActivity } = useTrips();
  const [targetDayForNew, setTargetDayForNew] = useState<number | null>(null);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  const duration = Math.max(1, trip.durationDays);
  const tripActivities = activities.filter(a => a.tripId === trip.id);

  const getDateForDay = (dayIndex: number): string => {
    try {
      const d = new Date(trip.startDate);
      d.setDate(d.getDate() + (dayIndex - 1));
      return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    } catch {
      return `Day ${dayIndex}`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Schedule Header */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#1B4332]">
            <Calendar className="w-3.5 h-3.5" />
            <span>Interactive Multi-Day Calendar Timeline</span>
          </div>
          <p className="text-xs text-stone-500 mt-1 font-light">
            Overview of your complete itinerary across all {duration} days. Move items between days or add scheduled activities.
          </p>
        </div>

        <button
          onClick={onOpenAiPlanner}
          className="flex items-center gap-2 px-3.5 py-2 bg-stone-900 hover:bg-black text-white text-xs font-semibold rounded-xl transition-all shadow-sm cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>AI Re-Plan Schedule</span>
        </button>
      </div>

      {/* Horizontal Multi-Day Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-start">
        {Array.from({ length: duration }, (_, i) => i + 1).map((dayNum) => {
          const dayActs = sortActivities(tripActivities.filter(a => a.dayIndex === dayNum));
          const dayTotal = dayActs.reduce((sum, a) => sum + (Number(a.estimatedCost) || 0), 0);
          const dateStr = getDateForDay(dayNum);

          return (
            <div
              key={dayNum}
              className="bg-white rounded-2xl border border-stone-200 shadow-2xs flex flex-col min-h-[420px] overflow-hidden"
            >
              {/* Day Column Header */}
              <div className="p-4 bg-stone-50/80 border-b border-stone-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                    Day {dayNum}
                  </div>
                  <div className="text-[11px] text-stone-500 font-medium">
                    {dateStr}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-400 block">
                    Day Est.
                  </span>
                  <span className="text-xs font-bold text-[#1B4332]">
                    {formatCurrency(dayTotal, trip.currency)}
                  </span>
                </div>
              </div>

              {/* Day Activities List */}
              <div className="p-3 space-y-2.5 flex-1 overflow-y-auto max-h-[500px]">
                {dayActs.length === 0 ? (
                  <div className="h-48 border border-dashed border-stone-200 rounded-xl flex flex-col items-center justify-center p-4 text-center">
                    <p className="text-xs text-stone-400 font-light">No activities scheduled for this day</p>
                    <button
                      onClick={() => setTargetDayForNew(dayNum)}
                      className="mt-2 text-xs font-semibold text-[#1B4332] hover:underline cursor-pointer"
                    >
                      + Add first item
                    </button>
                  </div>
                ) : (
                  dayActs.map((act) => {
                    const badge = CATEGORY_STYLES[act.category] || CATEGORY_STYLES.other;
                    return (
                      <div
                        key={act.id}
                        className="p-3 rounded-xl border border-stone-200 bg-stone-50/50 hover:bg-stone-50 transition-colors shadow-2xs group relative"
                      >
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md ${badge.bg} ${badge.text}`}>
                            <span>{badge.icon}</span>
                            <span className="capitalize">{act.category}</span>
                          </span>

                          <span className="text-[11px] font-bold text-stone-700">
                            {formatCurrency(act.estimatedCost, trip.currency)}
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-stone-900 group-hover:text-[#1B4332] transition-colors line-clamp-1">
                          {act.title}
                        </h4>

                        <div className="flex items-center gap-2 mt-1.5 text-[11px] text-stone-500">
                          <span className="flex items-center gap-1 font-medium text-stone-700">
                            <Clock className="w-3 h-3 text-stone-400" />
                            {act.startTime} - {act.endTime}
                          </span>
                        </div>

                        {act.location && (
                          <div className="flex items-center gap-1 mt-1 text-[11px] text-stone-500 truncate">
                            <MapPin className="w-3 h-3 text-stone-400 flex-shrink-0" />
                            <span className="truncate">{act.location}</span>
                          </div>
                        )}

                        {/* Quick Day Shift Controls */}
                        <div className="mt-2 pt-2 border-t border-stone-200/80 flex items-center justify-between text-[11px]">
                          <button
                            disabled={dayNum <= 1}
                            onClick={() => moveActivityToDay(act.id, dayNum - 1)}
                            className="text-stone-400 hover:text-stone-800 disabled:opacity-20 flex items-center gap-0.5 font-medium cursor-pointer"
                            title="Move to Previous Day"
                          >
                            <MoveLeft className="w-3 h-3" />
                            <span>Day {dayNum - 1}</span>
                          </button>

                          <button
                            onClick={() => setEditingActivity(act)}
                            className="text-stone-500 hover:text-stone-900 font-medium cursor-pointer"
                          >
                            Edit
                          </button>

                          <button
                            disabled={dayNum >= duration}
                            onClick={() => moveActivityToDay(act.id, dayNum + 1)}
                            className="text-stone-400 hover:text-stone-800 disabled:opacity-20 flex items-center gap-0.5 font-medium cursor-pointer"
                            title="Move to Next Day"
                          >
                            <span>Day {dayNum + 1}</span>
                            <MoveRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Column Footer: Quick Add */}
              <div className="p-3 border-t border-stone-100 bg-stone-50/40">
                <button
                  onClick={() => setTargetDayForNew(dayNum)}
                  className="w-full py-2 px-3 border border-dashed border-stone-300 hover:border-stone-400 hover:bg-white text-stone-600 hover:text-stone-900 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-stone-400" />
                  <span>Add to Day {dayNum}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Activity Modals */}
      {targetDayForNew !== null && (
        <ActivityModal
          isOpen={true}
          onClose={() => setTargetDayForNew(null)}
          tripId={trip.id}
          dayIndex={targetDayForNew}
          currency={trip.currency}
        />
      )}

      {editingActivity !== null && (
        <ActivityModal
          isOpen={true}
          onClose={() => setEditingActivity(null)}
          tripId={trip.id}
          dayIndex={editingActivity.dayIndex}
          currency={trip.currency}
          activityToEdit={editingActivity}
        />
      )}
    </div>
  );
};
