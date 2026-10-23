import { differenceInCalendarDays, parseISO, isBefore, isAfter, isWithinInterval, startOfDay } from 'date-fns';

export interface ActivityCostItem {
  estimatedCost?: number;
  actualCost?: number;
  category?: string;
  dayIndex?: number;
}

export interface BudgetMetrics {
  totalPlanned: number;
  totalActual: number;
  remainingBudget: number;
  isOverBudget: boolean;
  categoryTotals: Record<string, number>;
  categoryActualTotals: Record<string, number>;
  percentUsed: number;
}

export type TripStatus = 'upcoming' | 'ongoing' | 'completed';

/**
 * Calculates trip duration in days (inclusive of start and end days).
 */
export function calculateTripDuration(startDateStr: string, endDateStr: string): number {
  if (!startDateStr || !endDateStr) return 1;
  try {
    const start = parseISO(startDateStr);
    const end = parseISO(endDateStr);
    const diff = differenceInCalendarDays(end, start);
    return Math.max(1, diff + 1);
  } catch {
    return 1;
  }
}

/**
 * Categorizes a trip as upcoming, ongoing, or completed.
 */
export function getTripStatus(
  startDateStr: string,
  endDateStr: string,
  referenceDateStr?: string
): TripStatus {
  try {
    const ref = referenceDateStr ? parseISO(referenceDateStr) : startOfDay(new Date());
    const start = startOfDay(parseISO(startDateStr));
    const end = startOfDay(parseISO(endDateStr));

    if (isBefore(ref, start)) {
      return 'upcoming';
    }
    if (isAfter(ref, end)) {
      return 'completed';
    }
    return 'ongoing';
  } catch {
    return 'upcoming';
  }
}

/**
 * Aggregates budget stats, planned vs actual expenses, categories, and over-budget flags.
 */
export function calculateBudgetMetrics(
  totalBudget: number,
  items: ActivityCostItem[]
): BudgetMetrics {
  const budget = Math.max(0, Number(totalBudget) || 0);
  let totalPlanned = 0;
  let totalActual = 0;
  const categoryTotals: Record<string, number> = {
    sightseeing: 0,
    food: 0,
    transport: 0,
    lodging: 0,
    experience: 0,
    shopping: 0,
    other: 0,
  };
  const categoryActualTotals: Record<string, number> = {
    sightseeing: 0,
    food: 0,
    transport: 0,
    lodging: 0,
    experience: 0,
    shopping: 0,
    other: 0,
  };

  for (const item of items) {
    const est = Math.max(0, Number(item.estimatedCost) || 0);
    const act = Math.max(0, Number(item.actualCost) || 0);
    totalPlanned += est;
    totalActual += act;

    const catKey = (item.category || 'other').toLowerCase();
    const resolvedCat = catKey in categoryTotals ? catKey : 'other';
    categoryTotals[resolvedCat] = (categoryTotals[resolvedCat] || 0) + est;
    categoryActualTotals[resolvedCat] = (categoryActualTotals[resolvedCat] || 0) + act;
  }

  const effectiveSpent = totalActual > 0 ? totalActual : totalPlanned;
  const remainingBudget = Math.max(0, budget - effectiveSpent);
  const isOverBudget = effectiveSpent > budget && budget > 0;
  const percentUsed = budget > 0 ? Math.min(100, Math.round((effectiveSpent / budget) * 100)) : 0;

  return {
    totalPlanned,
    totalActual,
    remainingBudget,
    isOverBudget,
    categoryTotals,
    categoryActualTotals,
    percentUsed,
  };
}

/**
 * Parses a time string (e.g., "09:30 AM", "14:00", "4:15 PM") into minutes from midnight for sorting.
 */
export function parseTimeToMinutes(timeStr?: string): number {
  if (!timeStr) return 9999;
  const clean = timeStr.trim().toUpperCase();
  const match = clean.match(/(\d{1,2}):?(\d{2})?\s*(AM|PM)?/);
  if (!match) return 9999;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2] || '0', 10);
  const meridiem = match[3];

  if (meridiem === 'PM' && hours < 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

/**
 * Sorts activities chronologically by day index, then start time, then order index.
 */
export function sortActivities<T extends { dayIndex: number; startTime?: string; orderIndex?: number }>(
  activities: T[]
): T[] {
  return [...activities].sort((a, b) => {
    if (a.dayIndex !== b.dayIndex) {
      return a.dayIndex - b.dayIndex;
    }
    const timeA = parseTimeToMinutes(a.startTime);
    const timeB = parseTimeToMinutes(b.startTime);
    if (timeA !== timeB) {
      return timeA - timeB;
    }
    return (a.orderIndex || 0) - (b.orderIndex || 0);
  });
}

/**
 * Currency formatter with symbol mapping and fallback.
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency.toUpperCase()} ${amount.toLocaleString()}`;
  }
}

/**
 * Generates an URL-safe share token with prefix.
 */
export function generateShareToken(tripId: string): string {
  const timestamp = Date.now().toString(36);
  const rand = Math.random().toString(36).substring(2, 8);
  const safeTripId = tripId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8);
  return `gt_${safeTripId}_${timestamp}_${rand}`;
}

/**
 * Validates a share token format.
 */
export function isValidShareToken(token?: string): boolean {
  if (!token) return false;
  return /^gt_[a-zA-Z0-9]+_[a-zA-Z0-9]+_[a-zA-Z0-9]+$/.test(token);
}
