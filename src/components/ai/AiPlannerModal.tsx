import React, { useState } from 'react';
import { X, Sparkles, MapPin, Calendar, DollarSign, Compass, Check, ArrowRight, RefreshCw, AlertCircle, Info } from 'lucide-react';
import { GeneratedItinerary, Trip } from '../../types/travel';
import { requestAiItinerary } from '../../services/ai';
import { useTrips } from '../../context/TripContext';
import { formatCurrency } from '../../utils/travel-calc';

interface AiPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetTrip?: Trip | null;
  onTripCreated?: (newTrip: Trip) => void;
}

const INTEREST_TAGS = [
  'Historic Architecture',
  'Artisan Cuisine & Wine',
  'Scenic Coastal Hikes',
  'Local Hidden Alleys',
  'Boutique Shopping',
  'Museums & Galleries',
  'Sunrise Viewpoints',
  'Traditional Craft Markets',
  'Wellness & Thermal Spas'
];

export const AiPlannerModal: React.FC<AiPlannerModalProps> = ({
  isOpen,
  onClose,
  targetTrip,
  onTripCreated,
}) => {
  const { createTrip, importAiItineraryToTrip } = useTrips();

  const [destination, setDestination] = useState(targetTrip?.destination || 'Reykjavik, Iceland');
  const [daysCount, setDaysCount] = useState(targetTrip?.durationDays || 4);
  const [budget, setBudget] = useState(targetTrip?.budget || 2200);
  const [currency, setCurrency] = useState(targetTrip?.currency || 'USD');
  const [travelStyle, setTravelStyle] = useState('Cultural & Relaxed');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    'Scenic Coastal Hikes',
    'Artisan Cuisine & Wine',
    'Local Hidden Alleys'
  ]);
  const [travelerCount, setTravelerCount] = useState(2);
  const [naturalPrompt, setNaturalPrompt] = useState('');

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<GeneratedItinerary | null>(null);
  const [isAiGenerated, setIsAiGenerated] = useState(true);
  const [serviceWarning, setServiceWarning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleParseNaturalPrompt = (customText?: string) => {
    const text = customText || naturalPrompt;
    if (!text.trim()) return;

    // Extract days: e.g. "7 days" or "7-day"
    const daysMatch = text.match(/(\d+)\s*(?:days?|day)/i);
    if (daysMatch && daysMatch[1]) {
      const d = parseInt(daysMatch[1], 10);
      if (d > 0 && d <= 30) setDaysCount(d);
    }

    // Extract budget: e.g. "$2500", "2500 USD", "€2000"
    const budgetMatch = text.match(/[\$€£¥₹]?\s*(\d{3,6})\s*(?:usd|eur|gbp|inr|cad|aud|dollars?|budget)?/i);
    if (budgetMatch && budgetMatch[1]) {
      const b = parseInt(budgetMatch[1], 10);
      if (b > 100) setBudget(b);
    }

    // Extract travelers: e.g. "2 people", "2 travelers", "solo"
    const travelerMatch = text.match(/(\d+)\s*(?:people|travelers?|persons?|guests?)/i);
    if (travelerMatch && travelerMatch[1]) {
      setTravelerCount(parseInt(travelerMatch[1], 10));
    } else if (text.toLowerCase().includes('solo')) {
      setTravelerCount(1);
    }

    // Extract destination: "in <Destination> for" or "to <Destination> for"
    const destMatch = text.match(/(?:in|to|visiting)\s+([A-Za-z\s,]+?)(?:\s+for|\s+with|\s+in\s+late|\s+in\s+early|\.|$)/i);
    if (destMatch && destMatch[1]) {
      const cleanDest = destMatch[1].trim();
      if (cleanDest.length > 2) {
        setDestination(cleanDest);
      }
    }
  };

  const handleUseSamplePrompt = (sample: string) => {
    setNaturalPrompt(sample);
    handleParseNaturalPrompt(sample);
  };

  const toggleInterest = (tag: string) => {
    if (selectedInterests.includes(tag)) {
      setSelectedInterests(selectedInterests.filter(t => t !== tag));
    } else {
      setSelectedInterests([...selectedInterests, tag]);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setServiceWarning(null);

    if (!destination.trim()) {
      setError('Please provide a destination.');
      return;
    }

    setIsGenerating(true);
    try {
      const res = await requestAiItinerary({
        destination: destination.trim(),
        daysCount,
        budget: Number(budget) || 1500,
        currency,
        interests: selectedInterests,
        travelStyle,
        travelerCount,
        naturalLanguageRequirements: naturalPrompt.trim() || undefined,
      });

      if (res.itinerary) {
        setGeneratedResult(res.itinerary);
        setIsAiGenerated(res.isAiGenerated);
        if (res.warning) {
          setServiceWarning(res.warning);
        }
      } else {
        throw new Error(res.error || 'Failed to generate itinerary');
      }
    } catch (err: any) {
      setError(err?.message || 'Error occurred while contacting Gemini AI concierge.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateNewTripFromItinerary = async () => {
    if (!generatedResult) return;
    try {
      const today = new Date();
      const end = new Date();
      end.setDate(today.getDate() + (daysCount - 1));

      const newTrip = await createTrip({
        title: generatedResult.title || `${destination} Journey`,
        destination: generatedResult.destination || destination,
        startDate: today.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
        budget: generatedResult.totalEstimatedCost || budget,
        currency: generatedResult.currency || currency,
        description: generatedResult.overview,
        travelStyle: 'Cultural',
        coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
      });

      await importAiItineraryToTrip(newTrip.id, generatedResult);
      if (onTripCreated) onTripCreated(newTrip);
      onClose();
    } catch (e) {
      console.error(e);
    }
  };

  const handleImportToCurrentTrip = async () => {
    if (!generatedResult || !targetTrip) return;
    try {
      await importAiItineraryToTrip(targetTrip.id, generatedResult);
      onClose();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#FBF8F3] rounded-3xl max-w-3xl w-full border border-stone-300 shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-5 bg-[#1B4332] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-400/30">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="font-editorial text-2xl font-bold">Gemini Travel Co-Pilot</h2>
              <p className="text-xs text-emerald-200">Bespoke multi-day itineraries crafted with structured precision</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-emerald-200 hover:text-white hover:bg-emerald-800 transition-colors cursor-pointer"
            aria-label="Close AI Concierge"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 max-h-[78vh] overflow-y-auto">
          {error && (
            <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {serviceWarning && (
            <div className="mb-4 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
              <Info className="w-4 h-4 flex-shrink-0 text-amber-600" />
              <span>{serviceWarning}</span>
            </div>
          )}

          {!generatedResult ? (
            /* Input Form */
            <form onSubmit={handleGenerate} className="space-y-6">
              {/* Natural Language Prompt (PDF AI Requirement 1) */}
              <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200/90 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#1B4332] uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    Describe Requirements in Natural Language
                  </label>
                  <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-emerald-200 text-[#1B4332] font-semibold">
                    AI Auto-Extraction
                  </span>
                </div>
                <textarea
                  rows={2}
                  value={naturalPrompt}
                  onChange={(e) => setNaturalPrompt(e.target.value)}
                  placeholder="e.g. 6 days in Florence and Tuscany for 2 foodies on a $2800 budget focusing on Renaissance art, wine tastings, and local markets."
                  className="w-full p-3 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B4332] resize-none leading-relaxed"
                />
                <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                  <div className="flex flex-wrap gap-1">
                    {[
                      '6 days in Amalfi Coast for 2 with $3200 budget',
                      '5 days in Kyoto for 1 with $1800 budget',
                      '8 days in Swiss Alps for 2 with $3500 budget'
                    ].map((sample, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleUseSamplePrompt(sample)}
                        className="text-[10px] bg-white border border-stone-200 text-stone-600 px-2.5 py-1 rounded-lg hover:bg-stone-50 cursor-pointer"
                      >
                        {sample.split(' for')[0]}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleParseNaturalPrompt()}
                    disabled={!naturalPrompt.trim()}
                    className="text-xs font-semibold text-[#1B4332] bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 px-3 py-1 rounded-lg transition-colors cursor-pointer disabled:opacity-40"
                  >
                    Auto-Fill Parameters
                  </button>
                </div>
              </div>

              {/* Destination & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                    Destination
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kyoto, Japan or Florence, Italy"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                    Duration (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="14"
                    value={daysCount}
                    onChange={(e) => setDaysCount(Number(e.target.value))}
                    className="w-full px-3 py-2.5 text-sm bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
                  />
                </div>
              </div>

              {/* Budget & Currency */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                    Total Estimated Budget
                  </label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                    <input
                      type="number"
                      min="100"
                      step="100"
                      value={budget}
                      onChange={(e) => setBudget(Number(e.target.value))}
                      className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
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
                    className="w-full px-3 py-2.5 text-sm bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="JPY">JPY (¥)</option>
                    <option value="CHF">CHF (Fr)</option>
                    <option value="INR">INR (₹)</option>
                  </select>
                </div>
              </div>

              {/* Travel Style */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                  Travel Mood & Pace
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    'Cultural & Relaxed',
                    'Culinary Explorer',
                    'Luxury & Wellness',
                    'Scenic Outdoors',
                    'Fast-Paced Sights',
                    'Romantic & Slow'
                  ].map((style) => (
                    <button
                      type="button"
                      key={style}
                      onClick={() => setTravelStyle(style)}
                      className={`px-3 py-2 text-xs font-medium rounded-xl border transition-all cursor-pointer text-left ${
                        travelStyle === style
                          ? 'border-[#1B4332] bg-[#1B4332] text-white font-semibold'
                          : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              {/* Interests Tags */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                  Interests & Focus Areas (Pick Multiple)
                </label>
                <div className="flex flex-wrap gap-2">
                  {INTEREST_TAGS.map((tag) => {
                    const isSelected = selectedInterests.includes(tag);
                    return (
                      <button
                        type="button"
                        key={tag}
                        onClick={() => toggleInterest(tag)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-emerald-800 text-white shadow-2xs'
                            : 'bg-white text-stone-600 border border-stone-200 hover:border-stone-300'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                        <span>{tag}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-xs font-semibold text-stone-600 hover:text-stone-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="px-6 py-2.5 bg-[#1B4332] hover:bg-[#2D6A4F] text-[#FBF8F3] text-xs font-semibold rounded-xl shadow-2xs transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Synthesizing Itinerary...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate Itinerary</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* Review Generated Itinerary */
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-bold tracking-widest text-[#1B4332]">
                    Generated Itinerary Preview
                  </span>
                  <div className="text-xs font-semibold text-stone-500">
                    Est. Total: {formatCurrency(generatedResult.totalEstimatedCost, generatedResult.currency)}
                  </div>
                </div>

                <h3 className="font-editorial text-3xl font-bold text-stone-900">
                  {generatedResult.title}
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed font-light">
                  {generatedResult.overview}
                </p>

                {/* Insider Tips */}
                {generatedResult.insiderTips?.length > 0 && (
                  <div className="mt-3 p-3 rounded-xl bg-amber-50/60 border border-amber-200 text-xs text-amber-900 space-y-1">
                    <span className="font-bold block">Travel Concierge Tips:</span>
                    <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-800">
                      {generatedResult.insiderTips.map((tip, idx) => (
                        <li key={idx}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Day-by-Day Breakdown */}
              <div className="space-y-4">
                <h4 className="font-editorial text-xl font-bold text-stone-900">
                  Daily Chronology ({generatedResult.days?.length || 0} Days)
                </h4>

                <div className="space-y-3">
                  {generatedResult.days?.map((day) => (
                    <div key={day.dayNumber} className="bg-white p-4 rounded-xl border border-stone-200 space-y-2">
                      <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                        <span className="font-editorial text-base font-bold text-[#1B4332]">
                          Day {day.dayNumber}: {day.theme}
                        </span>
                        <span className="text-[11px] text-stone-500 font-medium">
                          {day.activities?.length || 0} stops
                        </span>
                      </div>

                      <div className="space-y-2 pt-1">
                        {day.activities?.map((act, idx) => (
                          <div key={idx} className="flex items-start justify-between text-xs gap-3">
                            <div>
                              <div className="font-semibold text-stone-900">
                                <span className="text-stone-400 font-mono text-[10px] mr-1.5">{act.startTime}</span>
                                {act.name}
                              </div>
                              <p className="text-stone-500 text-[11px] font-light">{act.description}</p>
                            </div>
                            <span className="font-semibold text-stone-800 whitespace-nowrap">
                              {formatCurrency(act.estimatedCost, generatedResult.currency)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setGeneratedResult(null)}
                  className="text-xs font-semibold text-stone-600 hover:text-stone-900 cursor-pointer"
                >
                  &larr; Adjust Parameters & Regenerate
                </button>

                <div className="flex items-center gap-2">
                  {targetTrip && (
                    <button
                      type="button"
                      onClick={handleImportToCurrentTrip}
                      className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                    >
                      Import into Current Trip
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleCreateNewTripFromItinerary}
                    className="px-5 py-2 bg-[#1B4332] hover:bg-[#2D6A4F] text-[#FBF8F3] text-xs font-semibold rounded-xl shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Save as New Trip</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
