import { NextRequest } from 'next/server'
import { createSupabaseServer } from '@cpn/shared'
import { getAuthenticatedUser, createAuthResponse, createSuccessResponse, createErrorResponse } from '@/lib/api/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getAuthenticatedUser(request)
  if (!user) {
    return createAuthResponse('Authentication required')
  }

  try {
    const supabase = await createSupabaseServer()

    const { data: dataEntry, error } = await supabase
      .from('data_entries')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return createErrorResponse('Data entry not found', 404)
      }
      throw error
    }

    return createSuccessResponse({ dataEntry })
  } catch (error) {
    console.error('Error fetching data entry:', error)
    return createErrorResponse('Failed to fetch data entry')
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getAuthenticatedUser(request)
  if (!user) {
    return createAuthResponse('Authentication required')
  }

  try {
    const body = await request.json()
    const supabase = await createSupabaseServer()

    // Verify the new girl belongs to this user if girlId is being updated
    if (body.girlId !== undefined) {
      const { data: girl, error: girlError } = await supabase
        .from('girls')
        .select('id')
        .eq('id', body.girlId)
        .eq('user_id', user.id)
        .single()

      if (girlError || !girl) {
        return createErrorResponse('Girl not found or access denied', 404)
      }
    }

    // Validation
    if (body.amountSpent !== undefined && body.amountSpent < 0) {
      return createErrorResponse('Amount must be non-negative', 400)
    }
    if (body.durationMinutes !== undefined && body.durationMinutes < 0) {
      return createErrorResponse('Duration must be non-negative', 400)
    }
    if (body.numberOfNuts !== undefined && body.numberOfNuts < 0) {
      return createErrorResponse('Number of nuts must be non-negative', 400)
    }

    // Build update object
    const updates: Record<string, any> = {}

    if (body.girlId !== undefined) updates.girl_id = body.girlId
    if (body.date !== undefined) updates.date = body.date
    if (body.amountSpent !== undefined) updates.amount_spent = body.amountSpent
    if (body.durationMinutes !== undefined) updates.duration_minutes = body.durationMinutes
    if (body.numberOfNuts !== undefined) updates.number_of_nuts = body.numberOfNuts

    if (Object.keys(updates).length === 0) {
      return createErrorResponse('No valid fields to update', 400)
    }

    const { data: dataEntry, error } = await (supabase as any)
      .from('data_entries')
      .update(updates)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return createErrorResponse('Data entry not found', 404)
      }
      throw error
    }

    return createSuccessResponse({ dataEntry })
  } catch (error) {
    console.error('Error updating data entry:', error)
    return createErrorResponse('Failed to update data entry')
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getAuthenticatedUser(request)
  if (!user) {
    return createAuthResponse('Authentication required')
  }

  try {
    const supabase = await createSupabaseServer()

    const { error } = await supabase
      .from('data_entries')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id)

    if (error) {
      throw error
    }

    return createSuccessResponse({ message: 'Data entry deleted successfully' })
  } catch (error) {
    console.error('Error deleting data entry:', error)
    return createErrorResponse('Failed to delete data entry')
  }
}