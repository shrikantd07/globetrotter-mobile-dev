import React, { useState } from 'react';
import { DollarSign, AlertTriangle, TrendingUp, CheckCircle, PieChart, Plus, Wallet, ShieldAlert } from 'lucide-react';
import { Trip, Activity, ActivityCategory } from '../../types/travel';
import { calculateBudgetMetrics, formatCurrency } from '../../utils/travel-calc';
import { useTrips } from '../../context/TripContext';

interface BudgetViewProps {
  trip: Trip;
}

const CATEGORY_META: Record<string, { label: string; icon: string; color: string }> = {
  lodging: { label: 'Lodging & Stays', icon: '🏨', color: 'bg-rose-500' },
  food: { label: 'Dining & Food', icon: '🍷', color: 'bg-amber-500' },
  experience: { label: 'Tours & Tickets', icon: '✨', color: 'bg-purple-500' },
  transport: { label: 'Transit & Flights', icon: '🚆', color: 'bg-sky-500' },
  sightseeing: { label: 'Monuments & Sights', icon: '🏛️', color: 'bg-emerald-600' },
  shopping: { label: 'Shopping & Gifts', icon: '🛍️', color: 'bg-orange-500' },
  other: { label: 'Miscellaneous', icon: '📌', color: 'bg-stone-400' },
};

export const BudgetView: React.FC<BudgetViewProps> = ({ trip }) => {
  const { activities, updateTrip, addActivity } = useTrips();
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [newBudgetVal, setNewBudgetVal] = useState(trip.budget);

  // Quick expense logger
  const [showQuickExpense, setShowQuickExpense] = useState(false);
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmount, setExpenseAmount] = useState(40);
  const [expenseCategory, setExpenseCategory] = useState<ActivityCategory>('food');
  const [expenseDay, setExpenseDay] = useState(1);

  const metrics = calculateBudgetMetrics(trip.budget, activities);

  const handleSaveBudget = async () => {
    await updateTrip(trip.id, { budget: Number(newBudgetVal) || 0 });
    setIsEditingBudget(false);
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseTitle.trim()) return;

    await addActivity({
      name: expenseTitle.trim(),
      category: expenseCategory,
      dayIndex: expenseDay,
      estimatedCost: Number(expenseAmount) || 0,
      actualCost: Number(expenseAmount) || 0,
      location: trip.destination,
      notes: 'Logged via Budget Tracker',
      completed: true,
      currency: trip.currency,
    });

    setExpenseTitle('');
    setShowQuickExpense(false);
  };

  // Compute daily spending breakdown
  const dailyCosts: number[] = Array.from({ length: trip.durationDays }, (_, i) => {
    const dayActs = activities.filter(a => a.dayIndex === i + 1);
    return dayActs.reduce((sum, a) => sum + (Number(a.estimatedCost) || 0), 0);
  });
  const maxDayCost = Math.max(1, ...dailyCosts);

  return (
    <div className="space-y-8">
      {/* Over-budget warning alert if planned exceeds total budget */}
      {metrics.isOverBudget && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 flex items-start gap-3 shadow-2xs">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-bold">Planned expenses exceed target budget</p>
            <p className="text-xs text-amber-800 mt-0.5 font-light">
              Your planned expenses total {formatCurrency(metrics.totalPlanned, trip.currency)}, which is {formatCurrency(metrics.totalPlanned - trip.budget, trip.currency)} over your {formatCurrency(trip.budget, trip.currency)} budget. Consider adjusting activities or updating your budget allocation.
            </p>
          </div>
        </div>
      )}

      {/* KPI Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Budget Card */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-stone-500 uppercase tracking-wider">
            <span>Target Budget</span>
            <button
              onClick={() => setIsEditingBudget(!isEditingBudget)}
              className="text-[#1B4332] hover:underline text-[11px] cursor-pointer"
            >
              {isEditingBudget ? 'Close' : 'Adjust'}
            </button>
          </div>
          {isEditingBudget ? (
            <div className="flex items-center gap-2 pt-1">
              <input
                type="number"
                min="0"
                value={newBudgetVal}
                onChange={(e) => setNewBudgetVal(Number(e.target.value))}
                className="w-full px-2 py-1 text-sm bg-stone-50 border border-stone-300 rounded"
              />
              <button
                onClick={handleSaveBudget}
                className="px-2.5 py-1 text-xs bg-[#1B4332] text-white rounded font-medium cursor-pointer"
              >
                Save
              </button>
            </div>
          ) : (
            <div className="font-editorial text-3xl font-bold text-stone-900">
              {formatCurrency(trip.budget, trip.currency)}
            </div>
          )}
          <div className="text-xs text-stone-500">
            Total target for {trip.durationDays} days
          </div>
        </div>

        {/* Total Planned Card */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-2xs space-y-2">
          <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
            Planned Activities
          </div>
          <div className="font-editorial text-3xl font-bold text-stone-900">
            {formatCurrency(metrics.totalPlanned, trip.currency)}
          </div>
          <div className="text-xs text-stone-500">
            {metrics.percentUsed}% of target budget allocated
          </div>
        </div>

        {/* Actual Spent Card */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-2xs space-y-2">
          <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
            Actual Spent
          </div>
          <div className="font-editorial text-3xl font-bold text-emerald-800">
            {formatCurrency(metrics.totalActual, trip.currency)}
          </div>
          <div className="text-xs text-stone-500">
            Verified logged receipts
          </div>
        </div>

        {/* Remaining Budget Card */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-2xs space-y-2">
          <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
            Remaining Cushion
          </div>
          <div className={`font-editorial text-3xl font-bold ${metrics.isOverBudget ? 'text-amber-700' : 'text-[#1B4332]'}`}>
            {formatCurrency(metrics.remainingBudget, trip.currency)}
          </div>
          <div className="text-xs text-stone-500">
            {metrics.isOverBudget ? 'Deficit' : 'Available for spontaneous finds'}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-stone-700">
          <span>Budget Utilization</span>
          <span>{metrics.percentUsed}% Allocated</span>
        </div>
        <div className="w-full h-3 rounded-full bg-stone-100 overflow-hidden flex">
          <div
            style={{ width: `${Math.min(100, metrics.percentUsed)}%` }}
            className={`h-full transition-all duration-500 ${metrics.isOverBudget ? 'bg-amber-600' : 'bg-[#1B4332]'}`}
          ></div>
        </div>
      </div>

      {/* Grid: Category Breakdown + Daily Histogram Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Category Breakdown */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-stone-200 shadow-2xs space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-editorial text-xl font-bold text-stone-900">
              Expenses by Category
            </h3>
            <span className="text-xs text-stone-500">Planned Totals</span>
          </div>

          <div className="space-y-4">
            {Object.entries(metrics.categoryTotals).map(([catKey, total]) => {
              const meta = CATEGORY_META[catKey] || CATEGORY_META.other;
              const catPercent = metrics.totalPlanned > 0 ? Math.round((total / metrics.totalPlanned) * 100) : 0;
              return (
                <div key={catKey} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 font-medium text-stone-800">
                      <span>{meta.icon}</span>
                      <span>{meta.label}</span>
                    </div>
                    <div className="font-semibold text-stone-900">
                      {formatCurrency(total, trip.currency)} <span className="text-stone-400 font-normal">({catPercent}%)</span>
                    </div>
                  </div>
                  <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden">
                    <div
                      style={{ width: `${catPercent}%` }}
                      className={`h-full ${meta.color} transition-all duration-500`}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Daily Spending Histogram */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-stone-200 shadow-2xs space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-editorial text-xl font-bold text-stone-900">
                Daily Spending Rhythm
              </h3>
              <span className="text-xs text-stone-500">{trip.durationDays} Days</span>
            </div>

            {/* SVG Visual Histogram */}
            <div className="h-48 flex items-end gap-2 pt-6 pb-2 px-2 border-b border-stone-200">
              {dailyCosts.map((cost, idx) => {
                const heightPercent = maxDayCost > 0 ? Math.max(10, Math.round((cost / maxDayCost) * 100)) : 10;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 group relative">
                    {/* Tooltip */}
                    <div className="absolute -top-8 bg-stone-900 text-white text-[10px] px-2 py-0.5 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                      Day {idx + 1}: {formatCurrency(cost, trip.currency)}
                    </div>
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full max-w-[32px] bg-[#1B4332] hover:bg-[#2D6A4F] rounded-t transition-all cursor-pointer"
                    ></div>
                    <span className="text-[10px] font-semibold text-stone-500">
                      D{idx + 1}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Expense Action Trigger */}
          <div className="pt-4 flex items-center justify-between">
            <div className="text-xs text-stone-500">
              Need to record on-the-go cash expenses?
            </div>
            <button
              onClick={() => setShowQuickExpense(!showQuickExpense)}
              className="px-3.5 py-2 text-xs font-semibold bg-[#1B4332] text-white rounded-lg hover:bg-[#2D6A4F] transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Quick Expense</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Expense Drawer */}
      {showQuickExpense && (
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-md animate-in fade-in duration-200">
          <h4 className="font-editorial text-lg font-bold text-stone-900 mb-3">
            Record Travel Expense
          </h4>
          <form onSubmit={handleAddExpense} className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-stone-600 mb-1">Title / Description</label>
              <input
                type="text"
                required
                placeholder="e.g. Gelato at Piazza Navona"
                value={expenseTitle}
                onChange={(e) => setExpenseTitle(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-600 mb-1">Amount ({trip.currency})</label>
              <input
                type="number"
                min="0"
                step="1"
                required
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-600 mb-1">Category</label>
              <select
                value={expenseCategory}
                onChange={(e) => setExpenseCategory(e.target.value as ActivityCategory)}
                className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg"
              >
                <option value="food">🍷 Food & Dining</option>
                <option value="sightseeing">🏛️ Sightseeing</option>
                <option value="transport">🚆 Transit</option>
                <option value="experience">✨ Experience</option>
                <option value="lodging">🏨 Stay</option>
                <option value="shopping">🛍️ Shopping</option>
                <option value="other">📌 Other</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-1.5 bg-[#1B4332] text-white text-xs font-semibold rounded-lg hover:bg-[#2D6A4F] cursor-pointer"
              >
                Save Expense
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
