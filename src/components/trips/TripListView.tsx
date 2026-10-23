import React, { useState } from 'react';
import { Plus, Search, Calendar, MapPin, DollarSign, Share2, Trash2, ArrowRight } from 'lucide-react';
import { Trip } from '../../types/travel';
import { useTrips } from '../../context/TripContext';
import { getTripStatus, formatCurrency, calculateBudgetMetrics } from '../../utils/travel-calc';
import { ShareModal } from '../share/ShareModal';

interface TripListViewProps {
  onSelectTrip: (tripId: string) => void;
  onOpenCreateTrip: () => void;
}

export const TripListView: React.FC<TripListViewProps> = ({
  onSelectTrip,
  onOpenCreateTrip,
}) => {
  const { trips, deleteTrip, allActivities } = useTrips();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'ongoing' | 'completed'>('all');
  const [sharingTrip, setSharingTrip] = useState<Trip | null>(null);

  const filteredTrips = trips.filter((trip) => {
    const matchesSearch =
      trip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (trip.country && trip.country.toLowerCase().includes(searchQuery.toLowerCase()));

    const status = getTripStatus(trip.startDate, trip.endDate);
    const matchesStatus = statusFilter === 'all' || status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      {/* Header & Primary Controls */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-[#1B4332]">
              Travel Portfolio
            </span>
            <h1 className="font-editorial text-4xl sm:text-5xl font-bold text-stone-900 mt-1">
              Your Itineraries
            </h1>
            <p className="text-stone-500 text-sm mt-1 font-light">
              {trips.length} curated journeys on record
            </p>
          </div>

          <button
            onClick={onOpenCreateTrip}
            className="flex items-center gap-2 px-5 py-3 bg-[#1B4332] hover:bg-[#2D6A4F] text-[#FBF8F3] text-sm font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Plan New Trip</span>
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between border-t border-stone-100 pt-6">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
            <input
              type="text"
              placeholder="Search by trip title or destination..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {(['all', 'upcoming', 'ongoing', 'completed'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap ${
                  statusFilter === s
                    ? 'bg-[#1B4332] text-white shadow-2xs'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Trips */}
      {filteredTrips.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-dashed border-stone-300 space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 text-[#1B4332] flex items-center justify-center font-editorial text-3xl">
            🧭
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="font-editorial text-2xl font-bold text-stone-900">
              No itineraries match your criteria
            </h3>
            <p className="text-xs text-stone-500 font-light">
              Clear your filters or create a new bespoke itinerary with our travel planner.
            </p>
          </div>
          <button
            onClick={onOpenCreateTrip}
            className="px-5 py-2.5 bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Itinerary</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTrips.map((trip) => {
            const status = getTripStatus(trip.startDate, trip.endDate);
            const tripActs = allActivities.filter(a => a.tripId === trip.id);
            const metrics = calculateBudgetMetrics(trip.budget, tripActs);

            return (
              <div
                key={trip.id}
                className="group bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-2xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Cover Artwork */}
                  <div className="relative aspect-16/10 overflow-hidden bg-stone-100">
                    <img
                      src={trip.coverImage}
                      alt={trip.destination}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    {/* Status Pill */}
                    <div className="absolute top-3 right-3">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full backdrop-blur-md ${
                        status === 'ongoing'
                          ? 'bg-emerald-600/90 text-white'
                          : status === 'upcoming'
                          ? 'bg-amber-600/90 text-white'
                          : 'bg-stone-700/80 text-white'
                      }`}>
                        {status}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-md text-white text-[11px] font-medium">
                      {trip.durationDays} Days • {trip.travelStyle}
                    </div>
                  </div>

                  {/* Body Details */}
                  <div className="p-6 space-y-3">
                    <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-stone-400" />
                      <span>{trip.destination}</span>
                      <span>•</span>
                      <Calendar className="w-3.5 h-3.5 text-stone-400 ml-1" />
                      <span>{trip.startDate}</span>
                    </div>

                    <h3
                      onClick={() => onSelectTrip(trip.id)}
                      className="font-editorial text-2xl font-bold text-stone-900 group-hover:text-[#1B4332] transition-colors cursor-pointer line-clamp-1"
                    >
                      {trip.title}
                    </h3>

                    <p className="text-xs text-stone-600 line-clamp-2 font-light leading-relaxed">
                      {trip.description}
                    </p>

                    {/* Budget Mini Progress Bar */}
                    <div className="pt-2 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-stone-500 font-medium">Budget Planned</span>
                        <span className="font-semibold text-stone-800">
                          {formatCurrency(metrics.totalPlanned, trip.currency)} / {formatCurrency(trip.budget, trip.currency)}
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-stone-100 overflow-hidden">
                        <div
                          style={{ width: `${Math.min(100, metrics.percentUsed)}%` }}
                          className={`h-full ${metrics.isOverBudget ? 'bg-amber-600' : 'bg-[#1B4332]'}`}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="p-6 pt-0 border-t border-stone-100 mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setSharingTrip(trip)}
                      className="p-2 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
                      title="Share trip link"
                      aria-label="Share trip link"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete "${trip.title}"?`)) {
                          deleteTrip(trip.id);
                        }
                      }}
                      className="p-2 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete trip"
                      aria-label="Delete trip"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => onSelectTrip(trip.id)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer"
                  >
                    <span>Open Plan</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Share Modal */}
      {sharingTrip && (
        <ShareModal
          isOpen={Boolean(sharingTrip)}
          onClose={() => setSharingTrip(null)}
          trip={sharingTrip}
        />
      )}
    </div>
  );
};
