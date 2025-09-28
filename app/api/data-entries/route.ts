import { NextRequest } from 'next/server'
import { createSupabaseServer } from '@cpn/shared'
import { getAuthenticatedUser, createAuthResponse, createSuccessResponse, createErrorResponse } from '@/lib/api/auth'

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request)
  if (!user) {
    return createAuthResponse('Authentication required')
  }

  try {
    const { searchParams } = new URL(request.url)
    const girlId = searchParams.get('girlId')
    const limit = searchParams.get('limit')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const supabase = await createSupabaseServer()

    let query = supabase
      .from('data_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })

    // Apply filters
    if (girlId) {
      query = query.eq('girl_id', girlId)
    }

    if (startDate) {
      query = query.gte('date', startDate)
    }

    if (endDate) {
      query = query.lte('date', endDate)
    }

    if (limit) {
      query = query.limit(parseInt(limit))
    }

    const { data: dataEntries, error } = await query

    if (error) {
      throw error
    }

    return createSuccessResponse({ dataEntries })
  } catch (error) {
    console.error('Error fetching data entries:', error)
    return createErrorResponse('Failed to fetch data entries')
  }
}

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser(request)
  if (!user) {
    return createAuthResponse('Authentication required')
  }

  try {
    const body = await request.json()
    const supabase = await createSupabaseServer()

    // Validate required fields
    if (!body.girlId || !body.date || typeof body.amountSpent !== 'number' ||
        typeof body.durationMinutes !== 'number' || typeof body.numberOfNuts !== 'number') {
      return createErrorResponse('Missing required fields: girlId, date, amountSpent, durationMinutes, numberOfNuts', 400)
    }

    // Validate positive values
    if (body.amountSpent < 0 || body.durationMinutes < 0 || body.numberOfNuts < 0) {
      return createErrorResponse('Amount, duration, and nuts must be non-negative', 400)
    }

    // Verify the girl belongs to this user
    const { data: girl, error: girlError } = await supabase
      .from('girls')
      .select('id')
      .eq('id', body.girlId)
      .eq('user_id', user.id)
      .single()

    if (girlError || !girl) {
      return createErrorResponse('Girl not found or access denied', 404)
    }

    const { data: dataEntry, error } = await (supabase as any)
      .from('data_entries')
      .insert({
        user_id: user.id,
        girl_id: body.girlId,
        date: body.date,
        amount_spent: body.amountSpent,
        duration_minutes: body.durationMinutes,
        number_of_nuts: body.numberOfNuts,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return createSuccessResponse({ dataEntry }, 201)
  } catch (error) {
    console.error('Error creating data entry:', error)
    return createErrorResponse('Failed to create data entry')
  }
}