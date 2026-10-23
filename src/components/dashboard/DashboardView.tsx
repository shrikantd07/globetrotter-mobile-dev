import React from 'react';
import { Compass, Calendar, MapPin, DollarSign, Sparkles, Plus, ArrowRight, Clock, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTrips } from '../../context/TripContext';
import { getTripStatus, formatCurrency, calculateBudgetMetrics } from '../../utils/travel-calc';

interface DashboardViewProps {
  onSelectTrip: (tripId: string) => void;
  onOpenCreateTrip: () => void;
  onOpenAiPlanner: () => void;
  onNavigate: (view: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onSelectTrip,
  onOpenCreateTrip,
  onOpenAiPlanner,
  onNavigate,
}) => {
  const { profile } = useAuth();
  const { trips, allActivities } = useTrips();

  // Metrics
  const upcomingTrips = trips.filter(t => getTripStatus(t.startDate, t.endDate) === 'upcoming');
  const ongoingTrips = trips.filter(t => getTripStatus(t.startDate, t.endDate) === 'ongoing');
  const nextTrip = ongoingTrips[0] || upcomingTrips[0] || trips[0];

  const totalDays = trips.reduce((sum, t) => sum + (Number(t.durationDays) || 0), 0);
  const totalBudgetPlanned = allActivities.reduce((sum, a) => sum + (Number(a.estimatedCost) || 0), 0);

  // Next trip activities
  const nextTripActivities = nextTrip
    ? allActivities.filter(a => a.tripId === nextTrip.id).slice(0, 4)
    : [];

  return (
    <div className="space-y-10">
      {/* Editorial Welcome Header */}
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-stone-200 shadow-2xs relative overflow-hidden">
        <div className="relative z-10 space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/5 text-[#1B4332] text-xs font-semibold uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5" />
            <span>Travel Journal Dashboard</span>
          </div>

          <h1 className="font-editorial text-4xl sm:text-5xl font-bold tracking-tight text-stone-900">
            Welcome back, {profile?.displayName?.split(' ')[0] || 'Traveler'}.
          </h1>

          <p className="text-stone-600 text-sm sm:text-base font-light leading-relaxed">
            Where does your compass point next? Your journal holds {trips.length} curated itineraries across {totalDays} days of mindful wandering.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenCreateTrip}
              className="px-5 py-2.5 bg-[#1B4332] hover:bg-[#2D6A4F] text-[#FBF8F3] text-xs font-semibold rounded-xl shadow-2xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Plan a Journey</span>
            </button>

            <button
              onClick={onOpenAiPlanner}
              className="px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold rounded-xl shadow-2xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>AI Co-Pilot</span>
            </button>

            <button
              onClick={() => onNavigate('destinations')}
              className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Browse Destinations
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Curated Trips</span>
          <div className="font-editorial text-3xl font-bold text-stone-900">{trips.length}</div>
          <span className="text-xs text-stone-400 font-light">Custom itineraries</span>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Days Planned</span>
          <div className="font-editorial text-3xl font-bold text-stone-900">{totalDays}</div>
          <span className="text-xs text-stone-400 font-light">Total days on the road</span>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Itinerary Stops</span>
          <div className="font-editorial text-3xl font-bold text-stone-900">{allActivities.length}</div>
          <span className="text-xs text-stone-400 font-light">Scheduled experiences</span>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Planned Budget</span>
          <div className="font-editorial text-3xl font-bold text-emerald-800">
            {formatCurrency(totalBudgetPlanned, 'USD')}
          </div>
          <span className="text-xs text-stone-400 font-light">Across active itineraries</span>
        </div>
      </div>

      {/* Hero Spotlight: Next Upcoming Trip */}
      {nextTrip && (
        <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-2xs">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Visual Cover */}
            <div className="lg:col-span-5 relative aspect-16/10 lg:aspect-auto min-h-[280px]">
              <img
                src={nextTrip.coverImage}
                alt={nextTrip.destination}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent lg:hidden"></div>
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-stone-900 flex items-center gap-1.5 shadow-sm">
                <Calendar className="w-3.5 h-3.5 text-[#1B4332]" />
                <span>Next Milestone Departure</span>
              </div>
            </div>

            {/* Content & Activity Snippet */}
            <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-800">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{nextTrip.destination}</span>
                  <span>•</span>
                  <span>{nextTrip.startDate} ({nextTrip.durationDays} Days)</span>
                </div>

                <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-stone-900">
                  {nextTrip.title}
                </h2>

                <p className="text-xs sm:text-sm text-stone-600 font-light leading-relaxed line-clamp-2">
                  {nextTrip.description}
                </p>

                {/* Upcoming Activities Preview */}
                {nextTripActivities.length > 0 && (
                  <div className="pt-2 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                      Scheduled Stops Ahead
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {nextTripActivities.map((act) => (
                        <div key={act.id} className="p-2.5 bg-stone-50 rounded-xl border border-stone-200/80 text-xs">
                          <div className="font-semibold text-stone-900 truncate">{act.name}</div>
                          <div className="text-[11px] text-stone-500 font-light truncate">
                            Day {act.dayIndex} • {act.startTime || 'Scheduled'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                <div className="text-xs">
                  <span className="text-stone-500 font-light">Target Budget: </span>
                  <span className="font-bold text-stone-900">
                    {formatCurrency(nextTrip.budget, nextTrip.currency)}
                  </span>
                </div>

                <button
                  onClick={() => onSelectTrip(nextTrip.id)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer"
                >
                  <span>Open Full Itinerary</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trips at a Glance Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-editorial text-2xl font-bold text-stone-900">
            Recent Travel Journals
          </h3>
          <button
            onClick={() => onNavigate('trips')}
            className="text-xs font-semibold text-[#1B4332] hover:underline cursor-pointer"
          >
            View all ({trips.length}) &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {trips.slice(0, 3).map((trip) => (
            <div
              key={trip.id}
              onClick={() => onSelectTrip(trip.id)}
              className="group bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              <div className="relative aspect-16/10 overflow-hidden bg-stone-100">
                <img
                  src={trip.coverImage}
                  alt={trip.destination}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full text-white text-[10px] font-medium uppercase tracking-wider">
                  {getTripStatus(trip.startDate, trip.endDate)}
                </div>
              </div>

              <div className="p-5 space-y-2">
                <span className="text-[11px] font-medium text-stone-500 uppercase tracking-wider">
                  {trip.destination} • {trip.durationDays} Days
                </span>
                <h4 className="font-editorial text-xl font-bold text-stone-900 group-hover:text-[#1B4332] transition-colors line-clamp-1">
                  {trip.title}
                </h4>
                <p className="text-xs text-stone-500 line-clamp-2 font-light">
                  {trip.description}
                </p>
              </div>

              <div className="p-5 pt-0 border-t border-stone-100 mt-2 flex items-center justify-between text-xs text-stone-600">
                <span>Budget: {formatCurrency(trip.budget, trip.currency)}</span>
                <span className="font-semibold text-[#1B4332] group-hover:translate-x-1 transition-transform">&rarr;</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
