import React, { useEffect, useState } from 'react';
import { Compass, Calendar, MapPin, Clock, ArrowLeft, Share2, Sparkles, Copy, Check } from 'lucide-react';
import { Trip, Activity } from '../../types/travel';
import { StorageService } from '../../services/storage';
import { formatCurrency, sortActivities } from '../../utils/travel-calc';

interface SharedTripViewProps {
  token: string;
  onGoHome: () => void;
}

export const SharedTripView: React.FC<SharedTripViewProps> = ({ token, onGoHome }) => {
  const [data, setData] = useState<{ trip: Trip; activities: Activity[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCopying, setIsCopying] = useState(false);
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  useEffect(() => {
    async function fetchShared() {
      setLoading(true);
      const res = await StorageService.getTripByShareToken(token);
      setData(res);
      setLoading(false);
    }
    fetchShared();
  }, [token]);

  const handleCopyTrip = async () => {
    if (!data) return;
    setIsCopying(true);
    try {
      const newTripId = `trip-${Date.now()}`;
      const clonedTrip: Trip = {
        ...data.trip,
        id: newTripId,
        title: `${data.trip.title} (My Copy)`,
        isPublic: false,
        shareToken: undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const clonedActivities: Activity[] = data.activities.map((act, idx) => ({
        ...act,
        id: `act-${Date.now()}-${idx}`,
        tripId: newTripId,
      }));

      await StorageService.saveTrip(clonedTrip);
      if (clonedActivities.length > 0) {
        await StorageService.saveActivitiesBatch(clonedActivities);
      }

      setCopiedSuccess(true);
      setTimeout(() => {
        // Navigate to trips dashboard
        window.location.hash = '#/trips';
        onGoHome();
      }, 1200);
    } catch (e) {
      console.error('Failed to copy trip', e);
    } finally {
      setIsCopying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBF8F3] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-3 border-[#1B4332] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="font-editorial text-xl text-[#1B4332]">Unfolding travel journal...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#FBF8F3] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-4 bg-white p-8 rounded-3xl border border-stone-200 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-500 mx-auto flex items-center justify-center text-xl">
            🔒
          </div>
          <h2 className="font-editorial text-3xl font-bold text-stone-900">
            Itinerary is Private or Expired
          </h2>
          <p className="text-xs text-stone-500 font-light leading-relaxed">
            This trip either does not exist, has had sharing disabled by its creator, or requires an updated link.
          </p>
          <button
            onClick={onGoHome}
            className="px-5 py-2.5 bg-[#1B4332] text-white text-xs font-semibold rounded-xl hover:bg-[#2D6A4F] transition-colors cursor-pointer"
          >
            Explore GlobeTrotter
          </button>
        </div>
      </div>
    );
  }

  const { trip, activities } = data;
  const sortedActivities = sortActivities(activities);

  return (
    <div className="min-h-screen bg-[#FBF8F3] text-stone-900 pb-24">
      {/* Editorial Top Navigation */}
      <header className="bg-white/80 backdrop-blur-md border-b border-stone-200/80 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button
            onClick={onGoHome}
            className="flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-stone-900 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>GlobeTrotter Journal</span>
          </button>

          <div className="flex items-center gap-2.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#1B4332] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              Public Itinerary
            </span>

            <button
              onClick={handleCopyTrip}
              disabled={isCopying || copiedSuccess}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-semibold rounded-xl transition-all shadow-2xs cursor-pointer disabled:opacity-75"
            >
              {copiedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Copied to Account!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{isCopying ? 'Copying...' : 'Copy Trip'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8">
        <div className="relative rounded-3xl overflow-hidden aspect-16/7 shadow-xl border-4 border-white bg-stone-900">
          <img
            src={trip.coverImage}
            alt={trip.destination}
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

          <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-300">
              <MapPin className="w-3.5 h-3.5" />
              <span>{trip.destination} {trip.country ? `• ${trip.country}` : ''}</span>
              <span>•</span>
              <span>{trip.durationDays} Days</span>
            </div>

            <h1 className="font-editorial text-3xl sm:text-5xl font-bold tracking-tight">
              {trip.title}
            </h1>

            <p className="text-xs sm:text-sm text-stone-200 max-w-2xl font-light leading-relaxed">
              {trip.description}
            </p>
          </div>
        </div>

        {/* Days Chronology */}
        <div className="mt-12 space-y-10">
          {Array.from({ length: trip.durationDays }, (_, i) => i + 1).map((dayIndex) => {
            const dayActs = sortedActivities.filter(a => a.dayIndex === dayIndex);
            return (
              <div key={dayIndex} className="space-y-4">
                <div className="border-b border-stone-200 pb-2 flex items-center justify-between">
                  <h3 className="font-editorial text-2xl font-bold text-[#1B4332]">
                    Day {dayIndex}
                  </h3>
                  <span className="text-xs text-stone-500 font-medium">
                    {dayActs.length} {dayActs.length === 1 ? 'experience' : 'experiences'}
                  </span>
                </div>

                {dayActs.length === 0 ? (
                  <p className="text-xs text-stone-400 italic">No scheduled activities for this day.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {dayActs.map((act) => (
                      <div
                        key={act.id}
                        className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-2"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-[#1B4332] uppercase tracking-wider text-[10px]">
                            {act.category}
                          </span>
                          {act.startTime && (
                            <span className="text-stone-500 font-mono text-[11px] flex items-center gap-1">
                              <Clock className="w-3 h-3 text-stone-400" />
                              {act.startTime}
                            </span>
                          )}
                        </div>

                        <h4 className="font-editorial text-xl font-bold text-stone-900">
                          {act.name}
                        </h4>

                        {act.location && (
                          <div className="text-xs text-stone-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-stone-400" />
                            <span>{act.location}</span>
                          </div>
                        )}

                        {act.description && (
                          <p className="text-xs text-stone-600 font-light leading-relaxed pt-1">
                            {act.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer CTA */}
        <div className="mt-16 bg-[#F4EFE6] rounded-3xl p-8 border border-stone-200 text-center space-y-4">
          <Compass className="w-8 h-8 text-[#1B4332] mx-auto" />
          <h3 className="font-editorial text-3xl font-bold text-[#1B4332]">
            Craft your own journey with GlobeTrotter
          </h3>
          <p className="text-xs text-stone-600 max-w-md mx-auto leading-relaxed">
            Build day-by-day itineraries, track budgets, and harness Gemini AI travel concierge for your next voyage.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={handleCopyTrip}
              disabled={isCopying || copiedSuccess}
              className="px-6 py-3 bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-semibold rounded-xl shadow-2xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-75"
            >
              {copiedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Copied to Your Trips!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>{isCopying ? 'Copying to your account...' : 'Copy Itinerary to My Account'}</span>
                </>
              )}
            </button>

            <button
              onClick={onGoHome}
              className="px-6 py-3 bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 text-xs font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer"
            >
              Start Planning Free
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
