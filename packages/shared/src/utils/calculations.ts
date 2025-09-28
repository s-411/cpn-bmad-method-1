// Metrics calculation utilities
import { DataEntry, GirlMetrics } from '../types/database';

/**
 * Calculate metrics for a girl based on her data entries
 * This mirrors the database function calculate_girl_metrics for client-side calculations
 */
export function calculateGirlMetrics(dataEntries: DataEntry[]): GirlMetrics {
  if (!dataEntries || dataEntries.length === 0) {
    return {
      total_spent: 0,
      total_nuts: 0,
      total_minutes: 0,
      cost_per_nut: 0,
      time_per_nut: 0,
      entry_count: 0,
    };
  }

  const totals = dataEntries.reduce(
    (acc, entry) => ({
      total_spent: acc.total_spent + entry.amount_spent,
      total_nuts: acc.total_nuts + entry.number_of_nuts,
      total_minutes: acc.total_minutes + entry.duration_minutes,
      entry_count: acc.entry_count + 1,
    }),
    {
      total_spent: 0,
      total_nuts: 0,
      total_minutes: 0,
      entry_count: 0,
    }
  );

  return {
    total_spent: Math.round(totals.total_spent * 100) / 100, // Round to 2 decimal places
    total_nuts: totals.total_nuts,
    total_minutes: totals.total_minutes,
    cost_per_nut: totals.total_nuts > 0
      ? Math.round((totals.total_spent / totals.total_nuts) * 100) / 100
      : 0,
    time_per_nut: totals.total_nuts > 0
      ? Math.round((totals.total_minutes / totals.total_nuts) * 100) / 100
      : 0,
    entry_count: totals.entry_count,
  };
}

/**
 * Calculate optimistic metrics update when adding a new entry
 * Used for immediate UI updates before database confirmation
 */
export function calculateOptimisticUpdate(
  currentMetrics: GirlMetrics,
  newEntry: Partial<DataEntry>
): GirlMetrics {
  if (!newEntry.amount_spent || !newEntry.duration_minutes || !newEntry.number_of_nuts) {
    return currentMetrics;
  }

  const newTotalSpent = currentMetrics.total_spent + newEntry.amount_spent;
  const newTotalNuts = currentMetrics.total_nuts + newEntry.number_of_nuts;
  const newTotalMinutes = currentMetrics.total_minutes + newEntry.duration_minutes;
  const newEntryCount = currentMetrics.entry_count + 1;

  return {
    total_spent: Math.round(newTotalSpent * 100) / 100,
    total_nuts: newTotalNuts,
    total_minutes: newTotalMinutes,
    cost_per_nut: newTotalNuts > 0
      ? Math.round((newTotalSpent / newTotalNuts) * 100) / 100
      : 0,
    time_per_nut: newTotalNuts > 0
      ? Math.round((newTotalMinutes / newTotalNuts) * 100) / 100
      : 0,
    entry_count: newEntryCount,
  };
}

/**
 * Calculate global statistics across all girls for a user
 */
export function calculateGlobalStatistics(girlsWithMetrics: Array<{ metrics?: GirlMetrics }>): {
  total_girls: number;
  total_spent: number;
  total_nuts: number;
  total_minutes: number;
  average_cost_per_nut: number;
  average_time_per_nut: number;
  total_entries: number;
} {
  const totals = girlsWithMetrics.reduce(
    (acc, girl) => {
      const metrics = girl.metrics;
      if (!metrics) return acc;

      return {
        total_spent: acc.total_spent + metrics.total_spent,
        total_nuts: acc.total_nuts + metrics.total_nuts,
        total_minutes: acc.total_minutes + metrics.total_minutes,
        total_entries: acc.total_entries + metrics.entry_count,
      };
    },
    {
      total_spent: 0,
      total_nuts: 0,
      total_minutes: 0,
      total_entries: 0,
    }
  );

  return {
    total_girls: girlsWithMetrics.length,
    total_spent: Math.round(totals.total_spent * 100) / 100,
    total_nuts: totals.total_nuts,
    total_minutes: totals.total_minutes,
    average_cost_per_nut: totals.total_nuts > 0
      ? Math.round((totals.total_spent / totals.total_nuts) * 100) / 100
      : 0,
    average_time_per_nut: totals.total_nuts > 0
      ? Math.round((totals.total_minutes / totals.total_nuts) * 100) / 100
      : 0,
    total_entries: totals.total_entries,
  };
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

/**
 * Format duration for display (e.g., "2h 30m")
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Format rating for display (ensures 1 decimal place)
 */
export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

/**
 * Calculate efficiency score (higher is better)
 * Based on cost per nut and time per nut
 */
export function calculateEfficiencyScore(metrics: GirlMetrics): number {
  if (metrics.total_nuts === 0) return 0;

  // Lower cost per nut and lower time per nut = higher efficiency
  // Normalize to 0-100 scale (this is a simplified calculation)
  const costEfficiency = Math.max(0, 100 - metrics.cost_per_nut);
  const timeEfficiency = Math.max(0, 100 - (metrics.time_per_nut / 60)); // Convert to hours

  return Math.round((costEfficiency + timeEfficiency) / 2);
}

/**
 * Get rating color class for UI styling
 */
export function getRatingColorClass(rating: number): string {
  if (rating >= 9.0) return 'text-red-500'; // Hot
  if (rating >= 8.0) return 'text-orange-500'; // Very attractive
  if (rating >= 7.0) return 'text-yellow-500'; // Attractive
  if (rating >= 6.0) return 'text-green-500'; // Decent
  return 'text-gray-500'; // Below average
}