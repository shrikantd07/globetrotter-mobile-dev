import React, { useState } from 'react';
import { Plus, Clock, MapPin, DollarSign, ChevronUp, ChevronDown, Edit2, Trash2, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { Trip, Activity, ActivityCategory } from '../../types/travel';
import { useTrips } from '../../context/TripContext';
import { formatCurrency } from '../../utils/travel-calc';
import { ActivityModal } from './ActivityModal';

interface ItineraryBuilderProps {
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

export const ItineraryBuilder: React.FC<ItineraryBuilderProps> = ({ trip, onOpenAiPlanner }) => {
  const { activities, addActivity, updateActivity, deleteActivity, reorderActivities, moveActivityToDay, updateTrip } = useTrips();
  const [selectedDay, setSelectedDay] = useState(1);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  const duration = Math.max(1, trip.durationDays);
  const dayActivities = activities.filter(a => a.dayIndex === selectedDay);
  const dayEstimatedCost = dayActivities.reduce((acc, a) => acc + (Number(a.estimatedCost) || 0), 0);
  const dayActualCost = dayActivities.reduce((acc, a) => acc + (a.actualCost !== undefined ? Number(a.actualCost) : (Number(a.estimatedCost) || 0)), 0);

  const handleMoveUp = async (index: number) => {
    if (index <= 0) return;
    const currentList = [...dayActivities];
    const temp = currentList[index];
    currentList[index] = currentList[index - 1];
    currentList[index - 1] = temp;
    await reorderActivities(selectedDay, currentList.map(a => a.id));
  };

  const handleMoveDown = async (index: number) => {
    if (index >= dayActivities.length - 1) return;
    const currentList = [...dayActivities];
    const temp = currentList[index];
    currentList[index] = currentList[index + 1];
    currentList[index + 1] = temp;
    await reorderActivities(selectedDay, currentList.map(a => a.id));
  };

  const handleAddDay = async () => {
    const newDuration = duration + 1;
    // Calculate new end date by adding 1 day
    const currentEnd = new Date(trip.endDate);
    currentEnd.setDate(currentEnd.getDate() + 1);
    const newEndStr = currentEnd.toISOString().split('T')[0];
    await updateTrip(trip.id, { durationDays: newDuration, endDate: newEndStr });
    setSelectedDay(newDuration);
  };

  return (
    <div className="space-y-6">
      {/* Day Selector Pills Bar */}
      <div className="bg-white rounded-2xl p-3 border border-stone-200 shadow-2xs flex items-center gap-2 overflow-x-auto">
        {Array.from({ length: duration }, (_, i) => i + 1).map((d) => {
          const isSelected = selectedDay === d;
          const dayActs = activities.filter(a => a.dayIndex === d);
          return (
            <button
              key={d}
              onClick={() => setSelectedDay(d)}
              className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-left transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#1B4332] text-white shadow-sm'
                  : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200/60'
              }`}
            >
              <div className="text-xs font-semibold uppercase tracking-wider opacity-80">
                Day {d}
              </div>
              <div className="text-[11px] font-medium opacity-90 truncate">
                {dayActs.length} {dayActs.length === 1 ? 'activity' : 'activities'}
              </div>
            </button>
          );
        })}

        <button
          onClick={handleAddDay}
          className="flex-shrink-0 px-3 py-2.5 rounded-xl border border-dashed border-stone-300 hover:border-stone-400 text-stone-600 hover:text-stone-900 bg-stone-50 hover:bg-stone-100 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          title="Add another day to trip"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Day</span>
        </button>
      </div>

      {/* Selected Day Header & Day Stats */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-widest text-[#1B4332] bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md">
              Day {selectedDay} of {duration}
            </span>
            <span className="text-xs text-stone-500 font-medium">
              {trip.destination}
            </span>
          </div>
          <h2 className="font-editorial text-3xl font-bold text-stone-900 mt-1">
            Day {selectedDay} Schedule
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Day Cost Summary */}
          <div className="bg-stone-50 border border-stone-200 px-3.5 py-2 rounded-xl text-right">
            <div className="text-[10px] uppercase font-semibold text-stone-500 tracking-wider">
              Day Estimated Cost
            </div>
            <div className="text-sm font-bold text-stone-900">
              {formatCurrency(dayEstimatedCost, trip.currency)}
            </div>
          </div>

          <button
            onClick={() => {
              setEditingActivity(null);
              setIsActivityModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-[#1B4332] hover:bg-[#2D6A4F] text-[#FBF8F3] text-xs font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Activity</span>
          </button>
        </div>
      </div>

      {/* Activity Timeline List */}
      {dayActivities.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-stone-300 space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 text-[#1B4332] flex items-center justify-center font-editorial text-2xl">
            ✍️
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="font-editorial text-2xl font-bold text-stone-900">
              No stops scheduled for Day {selectedDay} yet
            </h3>
            <p className="text-xs text-stone-500">
              Add a morning walking tour, iconic dining venue, or prompt the AI Co-Pilot to curate recommended activities.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                setEditingActivity(null);
                setIsActivityModalOpen(true);
              }}
              className="px-4 py-2 bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Stop Manually</span>
            </button>
            <button
              onClick={onOpenAiPlanner}
              className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Ask AI Co-Pilot</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3 relative before:absolute before:inset-0 before:left-5 before:w-0.5 before:bg-stone-200 pl-4 sm:pl-0">
          {dayActivities.map((act, index) => {
            const style = CATEGORY_STYLES[act.category] || CATEGORY_STYLES.other;
            return (
              <div
                key={act.id}
                className="bg-white rounded-2xl p-5 border border-stone-200 shadow-2xs hover:shadow-md transition-all relative flex flex-col sm:flex-row sm:items-start justify-between gap-4 group"
              >
                {/* Left Content */}
                <div className="flex-1 space-y-2">
                  {/* Category & Time */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${style.bg} ${style.text} ${style.border}`}>
                      <span>{style.icon}</span>
                      <span className="capitalize">{act.category}</span>
                    </span>

                    {act.startTime && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-stone-600 bg-stone-100 px-2.5 py-0.5 rounded-full">
                        <Clock className="w-3 h-3 text-stone-400" />
                        <span>{act.startTime} {act.endTime ? `– ${act.endTime}` : ''}</span>
                      </span>
                    )}

                    {act.location && (
                      <span className="inline-flex items-center gap-1 text-xs text-stone-500">
                        <MapPin className="w-3 h-3 text-stone-400" />
                        <span>{act.location}</span>
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h4 className="font-editorial text-xl font-bold text-stone-900">
                    {act.name}
                  </h4>

                  {/* Description */}
                  {act.description && (
                    <p className="text-xs text-stone-600 leading-relaxed font-light">
                      {act.description}
                    </p>
                  )}

                  {/* Notes / Tips */}
                  {act.notes && (
                    <div className="text-[11px] text-stone-500 bg-[#FBF8F3] border border-stone-200/80 rounded-lg px-2.5 py-1.5 inline-block">
                      <span className="font-semibold text-stone-700">Note: </span>
                      {act.notes}
                    </div>
                  )}
                </div>

                {/* Right Costs & Controls */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 border-t sm:border-t-0 pt-3 sm:pt-0 border-stone-100">
                  {/* Cost Pill */}
                  <div className="text-right">
                    <div className="text-xs font-bold text-stone-900">
                      {formatCurrency(act.estimatedCost, act.currency || trip.currency)}
                    </div>
                    {act.actualCost !== undefined && (
                      <div className="text-[10px] text-emerald-700">
                        Actual: {formatCurrency(act.actualCost, act.currency || trip.currency)}
                      </div>
                    )}
                  </div>

                  {/* Action Reorder & Edit Buttons */}
                  <div className="flex items-center gap-1">
                    {/* Move Up */}
                    <button
                      disabled={index === 0}
                      onClick={() => handleMoveUp(index)}
                      className="p-1 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-100 disabled:opacity-20 cursor-pointer"
                      title="Move earlier"
                      aria-label="Move earlier"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>

                    {/* Move Down */}
                    <button
                      disabled={index === dayActivities.length - 1}
                      onClick={() => handleMoveDown(index)}
                      className="p-1 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-100 disabled:opacity-20 cursor-pointer"
                      title="Move later"
                      aria-label="Move later"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => {
                        setEditingActivity(act);
                        setIsActivityModalOpen(true);
                      }}
                      className="p-1 rounded-md text-stone-400 hover:text-[#1B4332] hover:bg-stone-100 transition-colors cursor-pointer"
                      title="Edit activity"
                      aria-label="Edit activity"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => {
                        if (confirm(`Remove "${act.name}" from Day ${selectedDay}?`)) {
                          deleteActivity(act.id);
                        }
                      }}
                      className="p-1 rounded-md text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete activity"
                      aria-label="Delete activity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Move to another Day selector */}
                  {duration > 1 && (
                    <div className="text-right">
                      <select
                        value={selectedDay}
                        onChange={(e) => {
                          const targetDay = Number(e.target.value);
                          if (targetDay !== selectedDay) {
                            moveActivityToDay(act.id, targetDay);
                          }
                        }}
                        className="text-[11px] text-stone-500 bg-stone-50 border border-stone-200 rounded px-1.5 py-0.5"
                      >
                        {Array.from({ length: duration }, (_, i) => i + 1).map((d) => (
                          <option key={d} value={d}>
                            {d === selectedDay ? `Day ${d}` : `Move to Day ${d}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal for Add / Edit */}
      <ActivityModal
        isOpen={isActivityModalOpen}
        onClose={() => {
          setIsActivityModalOpen(false);
          setEditingActivity(null);
        }}
        onSubmit={async (data) => {
          if (editingActivity) {
            await updateActivity(editingActivity.id, data);
          } else {
            await addActivity({ ...data, dayIndex: selectedDay });
          }
        }}
        activityToEdit={editingActivity}
        tripDurationDays={duration}
        initialDayIndex={selectedDay}
        currency={trip.currency}
      />
    </div>
  );
};
