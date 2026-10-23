import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateTripDuration,
  getTripStatus,
  calculateBudgetMetrics,
  parseTimeToMinutes,
  sortActivities,
  generateShareToken,
  isValidShareToken,
  formatCurrency,
} from './travel-calc';

test('calculateTripDuration computes inclusive days correctly', () => {
  assert.equal(calculateTripDuration('2026-11-01', '2026-11-05'), 5);
  assert.equal(calculateTripDuration('2026-11-01', '2026-11-01'), 1);
  assert.equal(calculateTripDuration('', ''), 1);
});

test('getTripStatus correctly identifies upcoming, ongoing, and completed trips', () => {
  const ref = '2026-10-22';
  assert.equal(getTripStatus('2026-11-01', '2026-11-10', ref), 'upcoming');
  assert.equal(getTripStatus('2026-10-20', '2026-10-25', ref), 'ongoing');
  assert.equal(getTripStatus('2026-09-01', '2026-09-10', ref), 'completed');
});

test('calculateBudgetMetrics aggregates planned costs and categories', () => {
  const items = [
    { estimatedCost: 50, actualCost: 45, category: 'food' },
    { estimatedCost: 120, actualCost: 120, category: 'lodging' },
    { estimatedCost: 30, actualCost: 35, category: 'transport' },
    { estimatedCost: 80, actualCost: 0, category: 'sightseeing' },
  ];

  const metrics = calculateBudgetMetrics(500, items);
  assert.equal(metrics.totalPlanned, 280);
  assert.equal(metrics.totalActual, 200);
  assert.equal(metrics.categoryTotals.food, 50);
  assert.equal(metrics.categoryTotals.lodging, 120);
  assert.equal(metrics.categoryTotals.transport, 30);
  assert.equal(metrics.categoryTotals.sightseeing, 80);
  assert.equal(metrics.isOverBudget, false);
});

test('calculateBudgetMetrics detects overbudget conditions', () => {
  const items = [
    { estimatedCost: 600, actualCost: 650, category: 'lodging' },
  ];
  const metrics = calculateBudgetMetrics(500, items);
  assert.equal(metrics.isOverBudget, true);
});

test('parseTimeToMinutes handles AM, PM, and 24h formats', () => {
  assert.equal(parseTimeToMinutes('09:00 AM'), 540);
  assert.equal(parseTimeToMinutes('12:00 PM'), 720);
  assert.equal(parseTimeToMinutes('01:30 PM'), 810);
  assert.equal(parseTimeToMinutes('12:00 AM'), 0);
  assert.equal(parseTimeToMinutes('18:00'), 1080);
});

test('sortActivities orders by dayIndex then time then orderIndex', () => {
  const list = [
    { id: '3', dayIndex: 2, startTime: '09:00 AM', orderIndex: 0 },
    { id: '2', dayIndex: 1, startTime: '02:00 PM', orderIndex: 1 },
    { id: '1', dayIndex: 1, startTime: '09:00 AM', orderIndex: 0 },
  ];

  const sorted = sortActivities(list);
  assert.equal(sorted[0].id, '1');
  assert.equal(sorted[1].id, '2');
  assert.equal(sorted[2].id, '3');
});

test('share token generation and verification works', () => {
  const token = generateShareToken('trip123');
  assert.equal(isValidShareToken(token), true);
  assert.equal(isValidShareToken('invalid-token'), false);
});

test('formatCurrency formats USD correctly', () => {
  const res = formatCurrency(1500, 'USD');
  assert.match(res, /1,500/);
});
