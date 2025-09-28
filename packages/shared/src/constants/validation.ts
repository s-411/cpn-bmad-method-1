// Validation constants and schemas using Zod
import { z } from 'zod';

// Age validation
export const MIN_AGE = 18;
export const MAX_AGE = 100;

// Rating validation
export const MIN_RATING = 5.0;
export const MAX_RATING = 10.0;
export const RATING_INCREMENT = 0.5;

// Amount validation
export const MIN_AMOUNT = 0;
export const MAX_AMOUNT = 999999.99;

// Duration validation
export const MIN_DURATION_MINUTES = 0;
export const MAX_DURATION_MINUTES = 1440; // 24 hours

// Nuts validation
export const MIN_NUTS = 0;
export const MAX_NUTS = 999;

// Text field limits
export const MAX_NAME_LENGTH = 100;
export const MAX_LOCATION_LENGTH = 100;
export const MAX_ETHNICITY_LENGTH = 50;
export const MAX_HAIR_COLOR_LENGTH = 50;

// Session token validation
export const SESSION_TOKEN_LENGTH = 36; // UUID length

// Zod schemas for validation
export const GirlSchema = z.object({
  name: z.string().min(1, 'Name is required').max(MAX_NAME_LENGTH),
  age: z.number().int().min(MIN_AGE).max(MAX_AGE),
  rating: z.number()
    .min(MIN_RATING)
    .max(MAX_RATING)
    .refine(
      (val) => (val * 10) % 5 === 0,
      'Rating must be in 0.5 increments'
    )
    .default(6.0),
  ethnicity: z.string().max(MAX_ETHNICITY_LENGTH).optional(),
  hair_color: z.string().max(MAX_HAIR_COLOR_LENGTH).optional(),
  location_city: z.string().max(MAX_LOCATION_LENGTH).optional(),
  location_country: z.string().max(MAX_LOCATION_LENGTH).optional(),
  nationality: z.string().max(MAX_ETHNICITY_LENGTH).optional(),
});

export const CreateGirlSchema = GirlSchema;

export const UpdateGirlSchema = GirlSchema.partial().extend({
  is_active: z.boolean().optional(),
});

export const DataEntrySchema = z.object({
  girl_id: z.string().uuid('Invalid girl ID'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  amount_spent: z.number().min(MIN_AMOUNT).max(MAX_AMOUNT),
  duration_minutes: z.number().int().min(MIN_DURATION_MINUTES).max(MAX_DURATION_MINUTES),
  number_of_nuts: z.number().int().min(MIN_NUTS).max(MAX_NUTS),
});

export const CreateDataEntrySchema = DataEntrySchema;

export const UpdateDataEntrySchema = DataEntrySchema.partial().omit({ girl_id: true });

export const AuthSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const SignUpSchema = AuthSchema.extend({
  session_token: z.string().uuid().optional(),
});

export const SignInSchema = AuthSchema;

export const OnboardingSessionSchema = z.object({
  session_token: z.string().length(SESSION_TOKEN_LENGTH, 'Invalid session token'),
  girl_data: GirlSchema.partial().optional(),
  data_entries: z.array(DataEntrySchema.omit({ girl_id: true }).partial()).optional(),
});

export const SubscriptionTierSchema = z.enum(['boyfriend', 'player', 'lifetime']);

export const SubscriptionStatusSchema = z.enum(['active', 'cancelled', 'expired']);

export const UserSchema = z.object({
  email: z.string().email(),
  subscription_tier: SubscriptionTierSchema.default('boyfriend'),
  subscription_status: SubscriptionStatusSchema.default('active'),
  stripe_customer_id: z.string().optional(),
});

export const CreateUserSchema = UserSchema.partial().extend({
  email: z.string().email('Invalid email address'),
});

export const UpdateUserSchema = UserSchema.partial().omit({ email: true });

// Helper function to validate rating increments
export function isValidRating(rating: number): boolean {
  return rating >= MIN_RATING &&
         rating <= MAX_RATING &&
         (rating * 10) % 5 === 0;
}

// Helper function to get valid rating options
export function getValidRatingOptions(): number[] {
  const options: number[] = [];
  for (let i = MIN_RATING; i <= MAX_RATING; i += RATING_INCREMENT) {
    options.push(Math.round(i * 10) / 10);
  }
  return options;
}