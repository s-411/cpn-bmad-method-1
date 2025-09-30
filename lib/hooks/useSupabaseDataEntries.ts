'use client'

import { useState, useEffect } from 'react'
import { createSupabaseBrowser } from '@cpn/shared'
import { useAuth } from '@/lib/auth/AuthProvider'
import type { DataEntry } from '@/lib/types'
// TODO: Add proper Database types when they are generated
type DbDataEntry = {
  id: string
  user_id: string
  girl_id: string | null
  date: string
  amount_spent: number
  duration_minutes: number
  number_of_nuts: number
  created_at: string | null
  updated_at: string | null
}

type DbDataEntryInsert = {
  user_id?: string
  girl_id: string
  date: string
  amount_spent: number
  duration_minutes: number
  number_of_nuts: number
}

type DbDataEntryUpdate = {
  girl_id?: string
  date?: string
  amount_spent?: number
  duration_minutes?: number
  number_of_nuts?: number
}

export function useSupabaseDataEntries() {
  const [dataEntries, setDataEntries] = useState<DataEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { user, loading: authLoading } = useAuth()
  const supabase = createSupabaseBrowser()

  // Convert database entry to app entry format
  const dbEntryToEntry = (dbEntry: DbDataEntry): DataEntry => ({
    id: dbEntry.id,
    girlId: dbEntry.girl_id || '',
    date: new Date(dbEntry.date),
    amountSpent: Number(dbEntry.amount_spent),
    durationMinutes: Number(dbEntry.duration_minutes),
    numberOfNuts: Number(dbEntry.number_of_nuts),
    createdAt: new Date(dbEntry.created_at || ''),
    updatedAt: new Date(dbEntry.updated_at || ''),
  })

  // Convert app entry to database format
  const entryToDbEntry = (entry: Partial<DataEntry>): DbDataEntryInsert => ({
    girl_id: entry.girlId!,
    date: entry.date!.toISOString().split('T')[0], // YYYY-MM-DD format
    amount_spent: entry.amountSpent!,
    duration_minutes: entry.durationMinutes!,
    number_of_nuts: entry.numberOfNuts!,
  })

  // Fetch data entries from database
  const fetchDataEntries = async () => {
    if (authLoading) {
      return // Don't fetch while auth is loading
    }

    if (!user) {
      setDataEntries([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: dbError } = await (supabase as any)
        .from('data_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })

      if (dbError) throw dbError

      const entriesData = (data || []).map(dbEntryToEntry)
      setDataEntries(entriesData)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data entries')
    } finally {
      setLoading(false)
    }
  }

  // Add new data entry
  const addDataEntry = async (entryData: Omit<DataEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<DataEntry | null> => {
    if (!user) return null

    try {
      setError(null)
      const dbEntry = entryToDbEntry(entryData)

      const { data, error: dbError } = await (supabase as any)
        .from('data_entries')
        .insert({ ...dbEntry, user_id: user.id })
        .select()
        .single()

      if (dbError) throw dbError

      const newEntry = dbEntryToEntry(data)
      setDataEntries(prev => [newEntry, ...prev])

      return newEntry
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add data entry')
      return null
    }
  }

  // Update data entry
  const updateDataEntry = async (id: string, updates: Partial<DataEntry>): Promise<boolean> => {
    if (!user) return false

    try {
      setError(null)
      const dbUpdates: DbDataEntryUpdate = {}

      if (updates.girlId) dbUpdates.girl_id = updates.girlId
      if (updates.date) dbUpdates.date = updates.date.toISOString().split('T')[0]
      if (updates.amountSpent !== undefined) dbUpdates.amount_spent = updates.amountSpent
      if (updates.durationMinutes !== undefined) dbUpdates.duration_minutes = updates.durationMinutes
      if (updates.numberOfNuts !== undefined) dbUpdates.number_of_nuts = updates.numberOfNuts

      const { error: dbError } = await (supabase as any)
        .from('data_entries')
        .update(dbUpdates)
        .eq('id', id)
        .eq('user_id', user.id)

      if (dbError) throw dbError

      await fetchDataEntries() // Refresh data
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update data entry')
      return false
    }
  }

  // Delete data entry
  const deleteDataEntry = async (id: string): Promise<boolean> => {
    if (!user) return false

    try {
      setError(null)

      const { error: dbError } = await (supabase as any)
        .from('data_entries')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (dbError) throw dbError

      setDataEntries(prev => prev.filter(entry => entry.id !== id))
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete data entry')
      return false
    }
  }

  // Get entries for a specific girl
  const getEntriesForGirl = (girlId: string): DataEntry[] => {
    return dataEntries.filter(entry => entry.girlId === girlId)
  }

  // Get entries for a date range
  const getEntriesForDateRange = (startDate: Date, endDate: Date): DataEntry[] => {
    return dataEntries.filter(entry => {
      const entryDate = new Date(entry.date)
      return entryDate >= startDate && entryDate <= endDate
    })
  }

  // Subscribe to real-time updates
  useEffect(() => {
    if (authLoading) return // Wait for auth to complete

    fetchDataEntries()

    // Only set up real-time subscription if user is authenticated
    if (user) {
      const channel = supabase
        .channel('data_entries_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'data_entries',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            fetchDataEntries() // Refresh on any change
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [user, authLoading])

  return {
    dataEntries,
    loading,
    error,
    addDataEntry,
    updateDataEntry,
    deleteDataEntry,
    getEntriesForGirl,
    getEntriesForDateRange,
    refetch: fetchDataEntries,
  }
}