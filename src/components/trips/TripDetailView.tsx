import React, { useState } from 'react';
import { ArrowLeft, Calendar, DollarSign, MapPin, Share2, Sparkles, Plus, Trash2, Edit3, Clock, CheckCircle, MessageSquare, List, Sliders, Bot } from 'lucide-react';
import { Trip } from '../../types/travel';
import { useTrips } from '../../context/TripContext';
import { formatCurrency, getTripStatus, calculateBudgetMetrics, sortActivities } from '../../utils/travel-calc';
import { ItineraryBuilder } from '../itinerary/ItineraryBuilder';
import { BudgetView } from '../budget/BudgetView';
import { ShareModal } from '../share/ShareModal';
import { AiPlannerModal } from '../ai/AiPlannerModal';
import { AiOptimizerModal } from '../ai/AiOptimizerModal';
import { ConversationalTripAssistant } from '../ai/ConversationalTripAssistant';
import { TripCalendarSchedule } from '../itinerary/TripCalendarSchedule';

interface TripDetailViewProps {
  trip: Trip;
  onBack: () => void;
  onOpenAiPlanner: () => void;
}

export const TripDetailView: React.FC<TripDetailViewProps> = ({
  trip,
  onBack,
  onOpenAiPlanner,
}) => {
  const { deleteTrip, updateTrip, activities } = useTrips();
  const [activeTab, setActiveTab] = useState<'itinerary' | 'budget' | 'settings'>('itinerary');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isOptimizerOpen, setIsOptimizerOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Editing state in settings tab
  const [title, setTitle] = useState(trip.title);
  const [description, setDescription] = useState(trip.description);
  const [budgetVal, setBudgetVal] = useState(trip.budget);
  const [startDate, setStartDate] = useState(trip.startDate);
  const [endDate, setEndDate] = useState(trip.endDate);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const tripActivities = activities.filter(a => a.tripId === trip.id);
  const sortedTripActivities = sortActivities(tripActivities);

  const status = getTripStatus(trip.startDate, trip.endDate);
  const metrics = calculateBudgetMetrics(trip.budget, activities);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      await updateTrip(trip.id, {
        title: title.trim(),
        description: description.trim(),
        budget: Number(budgetVal) || 0,
        startDate,
        endDate,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleDeleteTrip = async () => {
    if (confirm(`Are you sure you want to delete "${trip.title}"? This cannot be undone.`)) {
      await deleteTrip(trip.id);
      onBack();
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Breadcrumb & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-stone-900 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Trips</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-stone-50 text-stone-700 border border-stone-300 text-xs font-semibold rounded-xl transition-colors shadow-2xs cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-stone-500" />
            <span>Share</span>
          </button>

          <button
            onClick={() => setIsOptimizerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-semibold rounded-xl transition-colors shadow-2xs cursor-pointer"
            title="Analyze pacing, budget health, and sequencing"
          >
            <Sliders className="w-3.5 h-3.5 text-emerald-700" />
            <span>AI Optimizer</span>
          </button>

          <button
            onClick={() => setIsChatOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 text-xs font-semibold rounded-xl transition-colors shadow-2xs cursor-pointer"
            title="Chat with contextual travel assistant"
          >
            <MessageSquare className="w-3.5 h-3.5 text-indigo-700" />
            <span>AI Concierge</span>
          </button>

          <button
            onClick={() => setIsAiModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold rounded-xl transition-colors shadow-2xs cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>AI Co-Pilot</span>
          </button>
        </div>
      </div>

      {/* Hero Overview Card */}
      <div className="relative rounded-3xl overflow-hidden aspect-16/7 sm:aspect-16/6 shadow-xl border-4 border-white bg-stone-900">
        <img
          src={trip.coverImage}
          alt={trip.destination}
          className="w-full h-full object-cover opacity-85"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10"></div>

        <div className="absolute top-6 right-6 flex items-center gap-2">
          <span className={`text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full backdrop-blur-md ${
            status === 'ongoing'
              ? 'bg-emerald-500/90 text-white'
              : status === 'upcoming'
              ? 'bg-amber-500/90 text-white'
              : 'bg-stone-500/90 text-white'
          }`}>
            {status}
          </span>
        </div>

        <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-wider text-emerald-300">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {trip.destination}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {trip.startDate} to {trip.endDate} ({trip.durationDays} Days)
            </span>
            <span>•</span>
            <span>{trip.travelStyle} Style</span>
          </div>

          <h1 className="font-editorial text-3xl sm:text-5xl font-bold tracking-tight">
            {trip.title}
          </h1>

          <p className="text-xs sm:text-sm text-stone-200 line-clamp-2 max-w-3xl font-light">
            {trip.description}
          </p>
        </div>
      </div>

      {/* Navigation Tabs & View Mode Switcher */}
      <div className="border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveTab('itinerary')}
            className={`pb-3 text-sm font-semibold transition-colors relative cursor-pointer ${
              activeTab === 'itinerary'
                ? 'text-[#1B4332]'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <span>Day-by-Day Itinerary</span>
            {activeTab === 'itinerary' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1B4332]"></div>
            )}
          </button>

          <button
            onClick={() => setActiveTab('budget')}
            className={`pb-3 text-sm font-semibold transition-colors relative cursor-pointer ${
              activeTab === 'budget'
                ? 'text-[#1B4332]'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <span>Budget & Expenses</span>
            {activeTab === 'budget' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1B4332]"></div>
            )}
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-3 text-sm font-semibold transition-colors relative cursor-pointer ${
              activeTab === 'settings'
                ? 'text-[#1B4332]'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <span>Trip Settings</span>
            {activeTab === 'settings' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1B4332]"></div>
            )}
          </button>
        </div>

        {activeTab === 'itinerary' && (
          <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200 mb-2 sm:mb-0">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List Mode</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                viewMode === 'calendar'
                  ? 'bg-white text-[#1B4332] shadow-2xs'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Calendar Schedule</span>
            </button>
          </div>
        )}
      </div>

      {/* Tab Panels */}
      {activeTab === 'itinerary' && (
        viewMode === 'list' ? (
          <ItineraryBuilder trip={trip} onOpenAiPlanner={() => setIsAiModalOpen(true)} />
        ) : (
          <TripCalendarSchedule trip={trip} onOpenAiPlanner={() => setIsAiModalOpen(true)} />
        )
      )}

      {activeTab === 'budget' && (
        <BudgetView trip={trip} />
      )}

      {activeTab === 'settings' && (
        <div className="bg-white rounded-3xl p-8 border border-stone-200 shadow-2xs max-w-2xl space-y-6">
          <div>
            <h3 className="font-editorial text-2xl font-bold text-stone-900">
              Trip Settings & Profile
            </h3>
            <p className="text-xs text-stone-500 font-light">
              Modify destination title, planned dates, target budget, or remove this trip.
            </p>
          </div>

          {savedSuccess && (
            <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Trip settings saved successfully.</span>
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Trip Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Target Budget ({trip.currency})
              </label>
              <input
                type="number"
                min="0"
                value={budgetVal}
                onChange={(e) => setBudgetVal(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Description & Vision
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg"
              ></textarea>
            </div>

            <div className="pt-4 border-t border-stone-200 flex items-center justify-between">
              <button
                type="button"
                onClick={handleDeleteTrip}
                className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Trip</span>
              </button>

              <button
                type="submit"
                disabled={isSavingSettings}
                className="px-6 py-2 bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isSavingSettings ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        trip={trip}
      />

      {/* AI Planner Modal (Generates full new itineraries from prompt/params) */}
      <AiPlannerModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        targetTrip={trip}
      />

      {/* AI Optimizer Modal (Pacing, budget health, sequence optimization with 1-click apply) */}
      <AiOptimizerModal
        isOpen={isOptimizerOpen}
        onClose={() => setIsOptimizerOpen(false)}
        trip={trip}
        activities={tripActivities}
      />

      {/* Conversational Trip Assistant (Real-time AI concierge with context & recommendations) */}
      <ConversationalTripAssistant
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        trip={trip}
        activities={tripActivities}
      />
    </div>
  );
};
