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

    const { data: girl, error } = await supabase
      .from('girls')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return createErrorResponse('Girl not found', 404)
      }
      throw error
    }

    return createSuccessResponse({ girl })
  } catch (error) {
    console.error('Error fetching girl:', error)
    return createErrorResponse('Failed to fetch girl')
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

    // Build update object with only provided fields
    const updates: any = {}

    if (body.name !== undefined) updates.name = body.name.trim()
    if (body.age !== undefined) {
      const age = parseInt(body.age)
      if (age < 18) {
        return createErrorResponse('Age must be 18 or older', 400)
      }
      updates.age = age
    }
    if (body.rating !== undefined) {
      const rating = parseFloat(body.rating)
      if (rating < 5 || rating > 10) {
        return createErrorResponse('Rating must be between 5.0 and 10.0', 400)
      }
      updates.rating = rating
    }
    if (body.ethnicity !== undefined) updates.ethnicity = body.ethnicity
    if (body.hairColor !== undefined) updates.hair_color = body.hairColor
    if (body.location?.city !== undefined) updates.location_city = body.location.city
    if (body.location?.country !== undefined) updates.location_country = body.location.country
    if (body.nationality !== undefined) updates.nationality = body.nationality
    if (body.isActive !== undefined) updates.is_active = body.isActive

    const { data: girl, error } = await supabase
      .from('girls')
      .update(updates)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return createErrorResponse('Girl not found', 404)
      }
      throw error
    }

    return createSuccessResponse({ girl })
  } catch (error) {
    console.error('Error updating girl:', error)
    return createErrorResponse('Failed to update girl')
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

    // First, delete all related data entries
    await supabase
      .from('data_entries')
      .delete()
      .eq('girl_id', params.id)
      .eq('user_id', user.id)

    // Then delete the girl
    const { error } = await supabase
      .from('girls')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id)

    if (error) {
      throw error
    }

    return createSuccessResponse({ message: 'Girl deleted successfully' })
  } catch (error) {
    console.error('Error deleting girl:', error)
    return createErrorResponse('Failed to delete girl')
  }
}