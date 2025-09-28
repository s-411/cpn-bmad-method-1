import { NextRequest } from 'next/server'
import { createSupabaseServer } from '@cpn/shared'
import { getAuthenticatedUser, createAuthResponse, createSuccessResponse, createErrorResponse } from '@/lib/api/auth'

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request)
  if (!user) {
    return createAuthResponse('Authentication required')
  }

  try {
    const supabase = await createSupabaseServer()

    const { data: girls, error } = await supabase
      .from('girls')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return createSuccessResponse({ girls })
  } catch (error) {
    console.error('Error fetching girls:', error)
    return createErrorResponse('Failed to fetch girls')
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
    if (!body.name || !body.age || typeof body.rating !== 'number') {
      return createErrorResponse('Missing required fields: name, age, rating', 400)
    }

    // Validate age is at least 18
    if (body.age < 18) {
      return createErrorResponse('Age must be 18 or older', 400)
    }

    // Validate rating is between 5 and 10
    if (body.rating < 5 || body.rating > 10) {
      return createErrorResponse('Rating must be between 5.0 and 10.0', 400)
    }

    const { data: girl, error } = await (supabase as any)
      .from('girls')
      .insert({
        user_id: user.id,
        name: body.name.trim(),
        age: parseInt(body.age),
        rating: parseFloat(body.rating),
        ethnicity: body.ethnicity || null,
        hair_color: body.hairColor || null,
        location_city: body.location?.city || null,
        location_country: body.location?.country || null,
        nationality: body.nationality || null,
        is_active: body.isActive ?? true,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return createSuccessResponse({ girl }, 201)
  } catch (error) {
    console.error('Error creating girl:', error)
    return createErrorResponse('Failed to create girl')
  }
}