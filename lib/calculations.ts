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

// Additional functions for analytics page
export function formatTimeDetailed(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = Math.round(minutes % 60)
  return `${hours}h ${mins}m`
}

export function getMonthlyTrends(entries: any[]) {
  const monthlyData: { [key: string]: { spent: number, nuts: number, time: number } } = {}

  entries.forEach(entry => {
    const date = new Date(entry.date)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { spent: 0, nuts: 0, time: 0 }
    }

    monthlyData[monthKey].spent += entry.amountSpent || 0
    monthlyData[monthKey].nuts += entry.numberOfNuts || 0
    monthlyData[monthKey].time += entry.durationMinutes || 0
  })

  return Object.entries(monthlyData)
    .map(([month, data]) => ({
      month,
      spent: data.spent,
      nuts: data.nuts,
      time: data.time
    }))
    .sort((a, b) => a.month.localeCompare(b.month))
}

export function getCostEfficiencyTrends(entries: any[]) {
  const monthlyData = getMonthlyTrends(entries)

  return monthlyData.map(item => ({
    month: item.month,
    costPerNut: item.nuts > 0 ? item.spent / item.nuts : 0
  }))
}

export function getSpendingDistribution(girls: any[]) {
  const total = girls.reduce((sum, girl) => sum + (girl.metrics?.totalSpent || 0), 0)

  return girls.map(girl => ({
    name: girl.name,
    value: girl.metrics?.totalSpent || 0,
    percentage: total > 0 ? ((girl.metrics?.totalSpent || 0) / total) * 100 : 0
  })).filter(item => item.value > 0)
}

export function getEfficiencyRatingCorrelation(girls: any[]) {
  return girls
    .filter(girl => girl.metrics && girl.metrics.totalNuts > 0)
    .map(girl => ({
      name: girl.name,
      rating: girl.rating || 0,
      costPerNut: girl.metrics.costPerNut || 0,
      nutsPerHour: girl.metrics.totalTime > 0 ? (girl.metrics.totalNuts / (girl.metrics.totalTime / 60)) : 0
    }))
}

export function getROIRanking(girls: any[]) {
  return girls
    .filter(girl => girl.metrics && girl.metrics.totalNuts > 0)
    .map(girl => ({
      name: girl.name,
      rating: girl.rating || 0,
      costPerNut: girl.metrics.costPerNut || 0,
      nutsPerHour: girl.metrics.totalTime > 0 ? (girl.metrics.totalNuts / (girl.metrics.totalTime / 60)).toFixed(2) : '0.00',
      efficiencyScore: calculateEfficiencyScore(girl.metrics.costPerNut || 0)
    }))
    .sort((a, b) => b.efficiencyScore - a.efficiencyScore)
}

export function getEnhancedGlobalStats(girls: any[], allEntries: any[], filteredEntries: any[]) {
  const activeProfilesInRange = girls.filter(girl => {
    const hasEntriesInRange = filteredEntries.some(entry => entry.girlId === girl.id)
    return hasEntriesInRange && (girl.isActive !== false)
  }).length

  return {
    activeProfilesInRange,
    totalEntriesInRange: filteredEntries.length,
    totalEntriesAllTime: allEntries.length
  }
}

export function calculateMetricsForGirl(entries: any[]) {
  const totalSpent = entries.reduce((sum, entry) => sum + (entry.amountSpent || 0), 0)
  const totalNuts = entries.reduce((sum, entry) => sum + (entry.numberOfNuts || 0), 0)
  const totalTime = entries.reduce((sum, entry) => sum + (entry.durationMinutes || 0), 0)

  return {
    totalSpent,
    totalNuts,
    totalTime,
    totalEntries: entries.length,
    costPerNut: calculateCostPerNut(totalSpent, totalNuts),
    timePerNut: calculateTimePerNut(totalTime, totalNuts),
    costPerHour: calculateCostPerHour(totalSpent, totalTime),
    averageSessionDuration: calculateAverageSessionDuration(totalTime, entries.length),
    productivity: calculateProductivity(totalNuts, totalTime),
    efficiencyScore: calculateEfficiencyScore(calculateCostPerNut(totalSpent, totalNuts))
  }
}

export function sortGirlsByField(girls: any[], field: string, direction: 'asc' | 'desc' = 'desc') {
  return [...girls].sort((a, b) => {
    let aValue = 0
    let bValue = 0

    switch (field) {
      case 'totalSpent':
        aValue = a.metrics?.totalSpent || 0
        bValue = b.metrics?.totalSpent || 0
        break
      case 'totalNuts':
        aValue = a.metrics?.totalNuts || 0
        bValue = b.metrics?.totalNuts || 0
        break
      case 'costPerNut':
        aValue = a.metrics?.costPerNut || 0
        bValue = b.metrics?.costPerNut || 0
        break
      case 'rating':
        aValue = a.rating || 0
        bValue = b.rating || 0
        break
      default:
        return 0
    }

    return direction === 'asc' ? aValue - bValue : bValue - aValue
  })
}