import React, { useState } from 'react';
import { X, Sparkles, CheckCircle2, TrendingDown, Clock, MapPin, ArrowRight, ShieldCheck, RefreshCw, AlertTriangle, Lightbulb } from 'lucide-react';
import { Trip, Activity } from '../../types/travel';
import { requestAiOptimization, ItineraryOptimization } from '../../services/ai';
import { useTrips } from '../../context/TripContext';

interface AiOptimizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip;
  activities: Activity[];
}

export const AiOptimizerModal: React.FC<AiOptimizerModalProps> = ({
  isOpen,
  onClose,
  trip,
  activities,
}) => {
  const { updateActivity } = useTrips();
  const [goal, setGoal] = useState<'balanced' | 'budget_reduction' | 'pacing' | 'cultural_enrichment'>('balanced');
  const [isLoading, setIsLoading] = useState(false);
  const [optimization, setOptimization] = useState<ItineraryOptimization | null>(null);
  const [applied, setApplied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRunOptimization = async () => {
    setIsLoading(true);
    setError(null);
    setApplied(false);
    try {
      const res = await requestAiOptimization({
        trip,
        activities,
        optimizationGoal: goal,
      });

      if (res.optimization) {
        setOptimization(res.optimization);
      } else {
        throw new Error(res.error || 'Optimization returned empty data');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to complete AI optimization analysis.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyOptimization = async () => {
    if (!optimization || !optimization.optimizedActivities) return;
    setIsLoading(true);
    try {
      for (const optAct of optimization.optimizedActivities) {
        if (optAct.id) {
          await updateActivity(optAct.id, {
            startTime: optAct.startTime,
            endTime: optAct.endTime,
            estimatedCost: optAct.estimatedCost,
            notes: optAct.notes,
          });
        }
      }
      setApplied(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err?.message || 'Failed to apply optimizations.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#FBF8F3] w-full max-w-3xl rounded-3xl border border-stone-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 bg-white border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-800 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-editorial text-2xl font-bold text-stone-900">
                  AI Itinerary Optimization
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  GenAI Model
                </span>
              </div>
              <p className="text-xs text-stone-500 font-light">
                Analyze {trip.destination} ({activities.length} stops) for budget health, pacing, and neighborhood clustering.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Goal Selector */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
              Optimization Objective
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'balanced', label: 'Balanced Harmony', desc: 'Equal focus on cost & pacing' },
                { id: 'budget_reduction', label: 'Cost Reduction', desc: 'Maximize savings by 15-20%' },
                { id: 'pacing', label: 'Relaxed Pacing', desc: 'Prevent walking burnout' },
                { id: 'cultural_enrichment', label: 'Cultural Flow', desc: 'Deep historic context' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setGoal(item.id as any)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    goal === item.id
                      ? 'border-[#1B4332] bg-emerald-50/50 text-[#1B4332] shadow-2xs'
                      : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <p className="text-xs font-bold">{item.label}</p>
                  <p className="text-[10px] text-stone-400 mt-0.5">{item.desc}</p>
                </button>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleRunOptimization}
                disabled={isLoading}
                className="px-5 py-2.5 bg-[#1B4332] hover:bg-[#2D6A4F] text-[#FBF8F3] text-xs font-semibold rounded-xl shadow-2xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing Itinerary...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Run AI Analysis</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-rose-50 text-rose-800 border border-rose-200 rounded-xl text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Results Display */}
          {optimization && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Score Badges */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs text-center">
                  <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Pacing Health</div>
                  <div className="font-editorial text-3xl font-bold text-[#1B4332] mt-1">
                    {optimization.pacingScore}/100
                  </div>
                  <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">Smooth rhythm</div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs text-center">
                  <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Budget Alignment</div>
                  <div className="font-editorial text-3xl font-bold text-[#1B4332] mt-1">
                    {optimization.budgetHealthScore}/100
                  </div>
                  <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">Controlled costs</div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs text-center">
                  <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Geo Sequencing</div>
                  <div className="font-editorial text-3xl font-bold text-[#1B4332] mt-1">
                    {optimization.sequenceScore}/100
                  </div>
                  <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">Clustered districts</div>
                </div>
              </div>

              {/* Summary Statement */}
              <div className="bg-emerald-900/5 border border-emerald-900/15 p-4 rounded-2xl">
                <p className="text-xs text-stone-700 leading-relaxed font-normal">
                  {optimization.summary}
                </p>
              </div>

              {/* Recommendations */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-amber-600" />
                  Key Optimization Insights
                </h3>
                <div className="space-y-2.5">
                  {optimization.recommendations.map((rec, i) => (
                    <div
                      key={i}
                      className="bg-white p-4 rounded-xl border border-stone-200/90 shadow-2xs flex items-start justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-stone-100 text-stone-600">
                            {rec.category}
                          </span>
                          <span className="text-xs font-bold text-stone-900">{rec.title}</span>
                        </div>
                        <p className="text-xs text-stone-600 font-light leading-relaxed">
                          {rec.description}
                        </p>
                      </div>
                      {rec.potentialSavings && (
                        <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex-shrink-0 whitespace-nowrap">
                          {rec.potentialSavings}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Optimized Activities Preview */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#1B4332]" />
                  Proposed Schedule Calibrations ({optimization.optimizedActivities.length} Stops)
                </h3>
                <div className="bg-white rounded-2xl border border-stone-200 divide-y divide-stone-100 max-h-56 overflow-y-auto">
                  {optimization.optimizedActivities.map((act, i) => (
                    <div key={i} className="p-3.5 flex items-center justify-between text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#1B4332]">Day {act.dayIndex}</span>
                          <span className="text-stone-300">•</span>
                          <span className="font-semibold text-stone-900">{act.name}</span>
                        </div>
                        <p className="text-[11px] text-stone-500 font-light mt-0.5">
                          {act.notes || act.description}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0 pl-3">
                        <span className="font-mono text-xs font-semibold text-stone-700 bg-stone-100 px-2 py-0.5 rounded">
                          {act.startTime}
                        </span>
                        <div className="text-[11px] text-stone-500 mt-0.5">
                          {trip.currency} {act.estimatedCost}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-white border-t border-stone-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 cursor-pointer"
          >
            Close
          </button>

          {optimization && (
            <button
              onClick={handleApplyOptimization}
              disabled={isLoading || applied}
              className="px-6 py-2.5 bg-[#1B4332] hover:bg-[#2D6A4F] text-[#FBF8F3] text-xs font-semibold rounded-xl shadow-2xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {applied ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Optimizations Applied!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Apply AI Optimizations to Itinerary</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
