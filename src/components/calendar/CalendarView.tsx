import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, MapPin, Clock, ArrowRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, parseISO, isWithinInterval } from 'date-fns';
import { useTrips } from '../../context/TripContext';
import { Trip, Activity } from '../../types/travel';

interface CalendarViewProps {
  onSelectTrip: (tripId: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ onSelectTrip }) => {
  const { trips, allActivities } = useTrips();
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date(2026, 10, 1)); // November 2026 default
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2026, 10, 10));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  // Get trips that overlap with a specific day
  const getTripsForDay = (day: Date): Trip[] => {
    return trips.filter((t) => {
      try {
        const start = parseISO(t.startDate);
        const end = parseISO(t.endDate);
        return isWithinInterval(day, { start, end });
      } catch {
        return false;
      }
    });
  };

  // Get activities for selected date across active trips
  const selectedDayTrips = getTripsForDay(selectedDate);
  const selectedDayActivities = allActivities.filter((act) => {
    // Check if activity matches trip and day
    return selectedDayTrips.some(t => t.id === act.tripId);
  });

  return (
    <div className="space-y-8">
      {/* Calendar Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-[#1B4332]">
            Trip Itinerary Timeline
          </span>
          <h1 className="font-editorial text-4xl font-bold text-stone-900 mt-1">
            {format(currentMonth, 'MMMM yyyy')}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
            aria-label="Previous Month"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={() => setCurrentMonth(new Date())}
            className="px-3.5 py-2 text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl transition-colors cursor-pointer"
          >
            Current Month
          </button>

          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
            aria-label="Next Month"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Calendar Grid + Daily Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Monthly Grid */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-stone-200 shadow-2xs">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-stone-400 uppercase tracking-wider pb-3 border-b border-stone-100">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          {/* Month Days */}
          <div className="grid grid-cols-7 gap-1.5 pt-3">
            {days.map((day, idx) => {
              const isCurrentMonthDay = isSameMonth(day, monthStart);
              const isSelected = isSameDay(day, selectedDate);
              const dayTrips = getTripsForDay(day);

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDate(day)}
                  className={`min-h-[90px] sm:min-h-[105px] p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-[#1B4332] ring-2 ring-[#1B4332]/20 bg-emerald-50/40'
                      : isCurrentMonthDay
                      ? 'bg-white hover:bg-stone-50 border-stone-200/80'
                      : 'bg-stone-50/50 text-stone-300 border-transparent opacity-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                        isSelected
                          ? 'bg-[#1B4332] text-white'
                          : isCurrentMonthDay
                          ? 'text-stone-800'
                          : 'text-stone-400'
                      }`}
                    >
                      {format(day, 'd')}
                    </span>
                    {dayTrips.length > 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1B4332]"></span>
                    )}
                  </div>

                  {/* Trip Banner Chips */}
                  <div className="space-y-1 my-1">
                    {dayTrips.slice(0, 2).map((t) => (
                      <div
                        key={t.id}
                        className="text-[10px] font-semibold text-emerald-900 bg-emerald-100/90 rounded px-1.5 py-0.5 truncate border border-emerald-200"
                        title={t.title}
                      >
                        {t.destination}
                      </div>
                    ))}
                    {dayTrips.length > 2 && (
                      <div className="text-[9px] text-stone-500 font-medium pl-1">
                        +{dayTrips.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Date Inspector Sidebar */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-stone-200 shadow-2xs space-y-5">
          <div className="border-b border-stone-100 pb-4">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#1B4332]">
              Selected Date
            </span>
            <h3 className="font-editorial text-2xl font-bold text-stone-900">
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </h3>
          </div>

          {/* Trips Overlapping Date */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Active Trips ({selectedDayTrips.length})
            </h4>

            {selectedDayTrips.length === 0 ? (
              <div className="p-6 text-center bg-stone-50 rounded-2xl border border-dashed border-stone-200 text-xs text-stone-500">
                No trips scheduled for this date.
              </div>
            ) : (
              selectedDayTrips.map((t) => (
                <div
                  key={t.id}
                  className="p-4 rounded-2xl border border-stone-200 bg-[#FBF8F3] space-y-2 hover:border-stone-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-900 truncate">
                      {t.title}
                    </span>
                    <span className="text-[10px] font-semibold text-[#1B4332] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      {t.travelStyle}
                    </span>
                  </div>
                  <div className="text-xs text-stone-500 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-stone-400" />
                    <span>{t.destination}</span>
                  </div>
                  <button
                    onClick={() => onSelectTrip(t.id)}
                    className="mt-2 w-full py-1.5 bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>Open Itinerary</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
