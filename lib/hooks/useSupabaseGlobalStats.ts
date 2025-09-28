'use client'

import { useState, useEffect } from 'react'
import { useSupabaseGirls } from './useSupabaseGirls'
import { useSupabaseDataEntries } from './useSupabaseDataEntries'
import type { GlobalStats } from '@/lib/types'

export function useSupabaseGlobalStats() {
  const [globalStats, setGlobalStats] = useState<GlobalStats>({
    totalGirls: 0,
    activeGirls: 0,
    totalSpent: 0,
    totalNuts: 0,
    totalTime: 0,
    averageRating: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  const { girls, girlsWithMetrics, loading: girlsLoading } = useSupabaseGirls()
  const { dataEntries, loading: entriesLoading } = useSupabaseDataEntries()

  // Calculate global statistics
  useEffect(() => {
    if (girlsLoading || entriesLoading) {
      setIsLoading(true)
      return
    }

    try {
      const stats: GlobalStats = {
        totalGirls: girls.length,
        activeGirls: girls.filter(girl => girl.isActive).length,
        totalSpent: girlsWithMetrics.reduce((sum, girl) => sum + girl.metrics.totalSpent, 0),
        totalNuts: girlsWithMetrics.reduce((sum, girl) => sum + girl.metrics.totalNuts, 0),
        totalTime: girlsWithMetrics.reduce((sum, girl) => sum + girl.metrics.totalTime, 0),
        averageRating: girls.length > 0
          ? girls.reduce((sum, girl) => sum + girl.rating, 0) / girls.length
          : 0,
      }

      setGlobalStats(stats)
      setIsLoading(false)
    } catch (error) {
      console.error('Error calculating global stats:', error)
      setIsLoading(false)
    }
  }, [girls, girlsWithMetrics, dataEntries, girlsLoading, entriesLoading])

  // Additional computed statistics
  const computedStats = {
    averageCostPerNut: globalStats.totalNuts > 0
      ? globalStats.totalSpent / globalStats.totalNuts
      : 0,

    averageTimePerNut: globalStats.totalNuts > 0
      ? globalStats.totalTime / globalStats.totalNuts
      : 0,

    averageCostPerHour: globalStats.totalTime > 0
      ? globalStats.totalSpent / (globalStats.totalTime / 60)
      : 0,

    totalEntries: dataEntries.length,

    averageEntriesPerGirl: girls.length > 0
      ? dataEntries.length / girls.length
      : 0,

    // Performance metrics
    topPerformers: girlsWithMetrics
      .filter(girl => girl.metrics.totalNuts > 0)
      .sort((a, b) => a.metrics.costPerNut - b.metrics.costPerNut)
      .slice(0, 3),

    highestSpenders: girlsWithMetrics
      .filter(girl => girl.metrics.totalSpent > 0)
      .sort((a, b) => b.metrics.totalSpent - a.metrics.totalSpent)
      .slice(0, 3),

    // Time-based insights
    thisMonthEntries: dataEntries.filter(entry => {
      const entryDate = new Date(entry.date)
      const now = new Date()
      return entryDate.getMonth() === now.getMonth() &&
             entryDate.getFullYear() === now.getFullYear()
    }),

    thisWeekEntries: dataEntries.filter(entry => {
      const entryDate = new Date(entry.date)
      const now = new Date()
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      return entryDate >= weekAgo
    }),

    // Efficiency scores
    efficiencyGrade: (() => {
      const avgCost = globalStats.totalNuts > 0
        ? globalStats.totalSpent / globalStats.totalNuts
        : 0

      if (avgCost === 0) return 'N/A'
      if (avgCost < 30) return 'A+'
      if (avgCost < 50) return 'A'
      if (avgCost < 75) return 'B+'
      if (avgCost < 100) return 'B'
      if (avgCost < 150) return 'C+'
      return 'C'
    })(),
  }

  return {
    globalStats,
    computedStats,
    isLoading,
  }
}