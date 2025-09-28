'use client'

import { useState, useEffect } from 'react'
import { createSupabaseBrowser } from '@cpn/shared'
import { useAuth } from '@/lib/auth/AuthProvider'
import type { Girl, GirlWithMetrics, CalculatedMetrics } from '@/lib/types'
// TODO: Add proper Database types when they are generated
type DbGirl = {
  id: string
  user_id: string
  name: string
  age: number
  nationality: string | null
  rating: number
  is_active: boolean | null
  ethnicity: string | null
  hair_color: string | null
  location_city: string | null
  location_country: string | null
  created_at: string | null
  updated_at: string | null
}

type DbGirlInsert = {
  user_id?: string
  name: string
  age: number
  nationality: string | null
  rating: number
  is_active?: boolean | null
  ethnicity: string | null
  hair_color: string | null
  location_city: string | null
  location_country: string | null
}

type DbGirlUpdate = {
  name?: string
  age?: number
  nationality?: string | null
  rating?: number
  is_active?: boolean | null
  ethnicity?: string | null
  hair_color?: string | null
  location_city?: string | null
  location_country?: string | null
}

export function useSupabaseGirls() {
  const [girls, setGirls] = useState<Girl[]>([])
  const [girlsWithMetrics, setGirlsWithMetrics] = useState<GirlWithMetrics[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { user } = useAuth()
  const supabase = createSupabaseBrowser()

  // Convert database girl to app girl format
  const dbGirlToGirl = (dbGirl: DbGirl): Girl => ({
    id: dbGirl.id,
    name: dbGirl.name,
    age: dbGirl.age,
    nationality: dbGirl.nationality || '',
    rating: Number(dbGirl.rating),
    isActive: dbGirl.is_active ?? true,
    ethnicity: dbGirl.ethnicity as any,
    hairColor: dbGirl.hair_color as any,
    location: {
      city: dbGirl.location_city || undefined,
      country: dbGirl.location_country || undefined,
    },
    createdAt: new Date(dbGirl.created_at || ''),
    updatedAt: new Date(dbGirl.updated_at || ''),
  })

  // Convert app girl to database format
  const girlToDbGirl = (girl: Partial<Girl>): DbGirlInsert => ({
    name: girl.name!,
    age: girl.age!,
    rating: girl.rating!,
    ethnicity: girl.ethnicity || null,
    hair_color: girl.hairColor || null,
    location_city: girl.location?.city || null,
    location_country: girl.location?.country || null,
    nationality: girl.nationality || null,
    is_active: girl.isActive ?? true,
  })

  // Calculate metrics for a girl
  const calculateMetrics = async (girl: Girl): Promise<GirlWithMetrics> => {
    const { data: entries } = await (supabase as any)
      .from('data_entries')
      .select('*')
      .eq('girl_id', girl.id)
      .eq('user_id', user?.id)

    if (!entries || entries.length === 0) {
      return {
        ...girl,
        metrics: {
          totalSpent: 0,
          totalNuts: 0,
          totalTime: 0,
          costPerNut: 0,
          timePerNut: 0,
          costPerHour: 0,
        },
        totalEntries: 0,
      }
    }

    const totalSpent = entries.reduce((sum: number, entry: any) => sum + Number(entry.amount_spent), 0)
    const totalNuts = entries.reduce((sum: number, entry: any) => sum + Number(entry.number_of_nuts), 0)
    const totalTime = entries.reduce((sum: number, entry: any) => sum + Number(entry.duration_minutes), 0)

    const metrics: CalculatedMetrics = {
      totalSpent,
      totalNuts,
      totalTime,
      costPerNut: totalNuts > 0 ? totalSpent / totalNuts : 0,
      timePerNut: totalNuts > 0 ? totalTime / totalNuts : 0,
      costPerHour: totalTime > 0 ? totalSpent / (totalTime / 60) : 0,
    }

    return {
      ...girl,
      metrics,
      totalEntries: entries.length,
    }
  }

  // Fetch girls from database
  const fetchGirls = async () => {
    if (!user) {
      setGirls([])
      setGirlsWithMetrics([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: dbError } = await (supabase as any)
        .from('girls')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (dbError) throw dbError

      const girlsData = (data || []).map(dbGirlToGirl)
      setGirls(girlsData)

      // Calculate metrics for all girls
      const girlsWithMetricsData = await Promise.all(
        girlsData.map((girl: Girl) => calculateMetrics(girl))
      )
      setGirlsWithMetrics(girlsWithMetricsData)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch girls')
    } finally {
      setLoading(false)
    }
  }

  // Add new girl
  const addGirl = async (girlData: Omit<Girl, 'id' | 'createdAt' | 'updatedAt'>): Promise<Girl | null> => {
    if (!user) return null

    try {
      setError(null)
      const dbGirl = girlToDbGirl(girlData)

      const { data, error: dbError } = await (supabase as any)
        .from('girls')
        .insert({ ...dbGirl, user_id: user.id })
        .select()
        .single()

      if (dbError) throw dbError

      const newGirl = dbGirlToGirl(data)
      setGirls(prev => [newGirl, ...prev])

      const newGirlWithMetrics = await calculateMetrics(newGirl)
      setGirlsWithMetrics(prev => [newGirlWithMetrics, ...prev])

      return newGirl
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add girl')
      return null
    }
  }

  // Update girl
  const updateGirl = async (id: string, updates: Partial<Girl>): Promise<boolean> => {
    if (!user) return false

    try {
      setError(null)
      const dbUpdates: DbGirlUpdate = {}

      if (updates.name) dbUpdates.name = updates.name
      if (updates.age) dbUpdates.age = updates.age
      if (updates.rating) dbUpdates.rating = updates.rating
      if (updates.ethnicity) dbUpdates.ethnicity = updates.ethnicity
      if (updates.hairColor) dbUpdates.hair_color = updates.hairColor
      if (updates.location?.city) dbUpdates.location_city = updates.location.city
      if (updates.location?.country) dbUpdates.location_country = updates.location.country
      if (updates.nationality) dbUpdates.nationality = updates.nationality
      if (typeof updates.isActive !== 'undefined') dbUpdates.is_active = updates.isActive

      const { error: dbError } = await (supabase as any)
        .from('girls')
        .update(dbUpdates)
        .eq('id', id)
        .eq('user_id', user.id)

      if (dbError) throw dbError

      await fetchGirls() // Refresh data
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update girl')
      return false
    }
  }

  // Delete girl
  const deleteGirl = async (id: string): Promise<boolean> => {
    if (!user) return false

    try {
      setError(null)

      const { error: dbError } = await (supabase as any)
        .from('girls')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (dbError) throw dbError

      setGirls(prev => prev.filter(girl => girl.id !== id))
      setGirlsWithMetrics(prev => prev.filter(girl => girl.id !== id))
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete girl')
      return false
    }
  }

  // Get girl by ID
  const getGirlById = (id: string): Girl | undefined => {
    return girls.find(girl => girl.id === id)
  }

  // Subscribe to real-time updates
  useEffect(() => {
    if (!user) return

    fetchGirls()

    const channel = supabase
      .channel('girls_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'girls',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchGirls() // Refresh on any change
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  return {
    girls,
    girlsWithMetrics,
    loading,
    error,
    addGirl,
    updateGirl,
    deleteGirl,
    getGirlById,
    refetch: fetchGirls,
  }
}