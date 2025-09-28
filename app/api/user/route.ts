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

    // Get user profile from users table
    const { data: userProfile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    // If no profile exists, create one
    if (!userProfile) {
      const { data: newProfile, error: createError } = await (supabase as any)
        .from('users')
        .insert({
          id: user.id,
          email: user.email || '',
          subscription_tier: 'boyfriend',
          subscription_status: 'active',
        })
        .select()
        .single()

      if (createError) {
        throw createError
      }

      return createSuccessResponse({
        user: {
          ...user,
          profile: newProfile
        }
      })
    }

    return createSuccessResponse({
      user: {
        ...user,
        profile: userProfile
      }
    })
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return createErrorResponse('Failed to fetch user profile')
  }
}

export async function PUT(request: NextRequest) {
  const user = await getAuthenticatedUser(request)
  if (!user) {
    return createAuthResponse('Authentication required')
  }

  try {
    const body = await request.json()
    const supabase = await createSupabaseServer()

    // Build update object with only allowed fields
    const updates: any = {}

    if (body.email !== undefined) updates.email = body.email
    if (body.subscriptionTier !== undefined) {
      if (!['boyfriend', 'player', 'lifetime'].includes(body.subscriptionTier)) {
        return createErrorResponse('Invalid subscription tier', 400)
      }
      updates.subscription_tier = body.subscriptionTier
    }
    if (body.subscriptionStatus !== undefined) {
      if (!['active', 'cancelled', 'expired'].includes(body.subscriptionStatus)) {
        return createErrorResponse('Invalid subscription status', 400)
      }
      updates.subscription_status = body.subscriptionStatus
    }
    if (body.stripeCustomerId !== undefined) updates.stripe_customer_id = body.stripeCustomerId

    const { data: userProfile, error } = await (supabase as any)
      .from('users')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return createSuccessResponse({
      user: {
        ...user,
        profile: userProfile
      }
    })
  } catch (error) {
    console.error('Error updating user profile:', error)
    return createErrorResponse('Failed to update user profile')
  }
}