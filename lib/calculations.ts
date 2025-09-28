// Utility functions for formatting and calculations

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatTime(minutes: number): string {
  if (minutes < 60) {
    return `${Math.round(minutes)}m`
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = Math.round(minutes % 60)

  if (remainingMinutes === 0) {
    return `${hours}h`
  }

  return `${hours}h ${remainingMinutes}m`
}

export function formatRating(rating: number): string {
  return rating.toFixed(1)
}

export function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(1)}%`
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value)
}

// Calculate cost per nut
export function calculateCostPerNut(totalSpent: number, totalNuts: number): number {
  return totalNuts > 0 ? totalSpent / totalNuts : 0
}

// Calculate time per nut in minutes
export function calculateTimePerNut(totalTime: number, totalNuts: number): number {
  return totalNuts > 0 ? totalTime / totalNuts : 0
}

// Calculate cost per hour
export function calculateCostPerHour(totalSpent: number, totalTime: number): number {
  return totalTime > 0 ? totalSpent / (totalTime / 60) : 0
}

// Calculate efficiency score (0-100, higher is better)
export function calculateEfficiencyScore(costPerNut: number): number {
  if (costPerNut === 0) return 0

  // Scale: $200+ = 0, $0 = 100, with diminishing returns
  const maxCost = 200
  const score = Math.max(0, Math.min(100, ((maxCost - costPerNut) / maxCost) * 100))
  return Math.round(score)
}

// Get efficiency grade based on cost per nut
export function getEfficiencyGrade(costPerNut: number): string {
  if (costPerNut === 0) return 'N/A'
  if (costPerNut < 30) return 'A+'
  if (costPerNut < 50) return 'A'
  if (costPerNut < 75) return 'B+'
  if (costPerNut < 100) return 'B'
  if (costPerNut < 150) return 'C+'
  return 'C'
}

// Calculate total investment return (nuts per dollar)
export function calculateNutsPerDollar(totalNuts: number, totalSpent: number): number {
  return totalSpent > 0 ? totalNuts / totalSpent : 0
}

// Calculate average session duration
export function calculateAverageSessionDuration(totalTime: number, totalSessions: number): number {
  return totalSessions > 0 ? totalTime / totalSessions : 0
}

// Calculate productivity (nuts per hour)
export function calculateProductivity(totalNuts: number, totalTime: number): number {
  return totalTime > 0 ? totalNuts / (totalTime / 60) : 0
}

// Date utility functions
export function getDateRangeStats(entries: any[], startDate: Date, endDate: Date) {
  const filteredEntries = entries.filter(entry => {
    const entryDate = new Date(entry.date)
    return entryDate >= startDate && entryDate <= endDate
  })

  const totalSpent = filteredEntries.reduce((sum, entry) => sum + entry.amountSpent, 0)
  const totalNuts = filteredEntries.reduce((sum, entry) => sum + entry.numberOfNuts, 0)
  const totalTime = filteredEntries.reduce((sum, entry) => sum + entry.durationMinutes, 0)

  return {
    totalSpent,
    totalNuts,
    totalTime,
    totalEntries: filteredEntries.length,
    costPerNut: calculateCostPerNut(totalSpent, totalNuts),
    timePerNut: calculateTimePerNut(totalTime, totalNuts),
    costPerHour: calculateCostPerHour(totalSpent, totalTime),
  }
}

// Get current month stats
export function getCurrentMonthStats(entries: any[]) {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  return getDateRangeStats(entries, startOfMonth, endOfMonth)
}

// Get current week stats
export function getCurrentWeekStats(entries: any[]) {
  const now = new Date()
  const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  return getDateRangeStats(entries, startOfWeek, now)
}