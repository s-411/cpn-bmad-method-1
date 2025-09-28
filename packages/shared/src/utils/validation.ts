// Validation utility functions
import { z } from 'zod';
import {
  GirlSchema,
  CreateGirlSchema,
  UpdateGirlSchema,
  DataEntrySchema,
  CreateDataEntrySchema,
  UpdateDataEntrySchema,
  AuthSchema,
  SignUpSchema,
  SignInSchema,
  OnboardingSessionSchema,
  UserSchema,
  CreateUserSchema,
  UpdateUserSchema,
  isValidRating,
  MIN_AGE,
  MAX_AGE,
  MIN_RATING,
  MAX_RATING,
} from '../constants/validation';

/**
 * Generic validation function using Zod schemas
 */
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  errors?: Record<string, string[]>;
} {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string[]> = {};

      error.errors.forEach((err) => {
        const path = err.path.join('.');
        if (!errors[path]) {
          errors[path] = [];
        }
        errors[path].push(err.message);
      });

      return { success: false, errors };
    }

    return { success: false, errors: { general: ['Validation failed'] } };
  }
}

/**
 * Validate girl creation data
 */
export function validateCreateGirl(data: unknown) {
  return validateData(CreateGirlSchema, data);
}

/**
 * Validate girl update data
 */
export function validateUpdateGirl(data: unknown) {
  return validateData(UpdateGirlSchema, data);
}

/**
 * Validate data entry creation
 */
export function validateCreateDataEntry(data: unknown) {
  return validateData(CreateDataEntrySchema, data);
}

/**
 * Validate data entry update
 */
export function validateUpdateDataEntry(data: unknown) {
  return validateData(UpdateDataEntrySchema, data);
}

/**
 * Validate authentication signup
 */
export function validateSignUp(data: unknown) {
  return validateData(SignUpSchema, data);
}

/**
 * Validate authentication signin
 */
export function validateSignIn(data: unknown) {
  return validateData(SignInSchema, data);
}

/**
 * Validate onboarding session data
 */
export function validateOnboardingSession(data: unknown) {
  return validateData(OnboardingSessionSchema, data);
}

/**
 * Validate user creation
 */
export function validateCreateUser(data: unknown) {
  return validateData(CreateUserSchema, data);
}

/**
 * Validate user update
 */
export function validateUpdateUser(data: unknown) {
  return validateData(UpdateUserSchema, data);
}

/**
 * Validate email format (more lenient than Zod)
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
  score: number; // 0-4 (weak to strong)
} {
  const errors: string[] = [];
  let score = 0;

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  } else {
    score += 1;
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  } else {
    score += 1;
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  } else {
    score += 1;
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  } else {
    score += 1;
  }

  return {
    isValid: errors.length === 0,
    errors,
    score,
  };
}

/**
 * Validate age range
 */
export function isValidAge(age: number): boolean {
  return Number.isInteger(age) && age >= MIN_AGE && age <= MAX_AGE;
}

/**
 * Validate date format (YYYY-MM-DD)
 */
export function isValidDateFormat(date: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) return false;

  const dateObj = new Date(date);
  return dateObj instanceof Date && !isNaN(dateObj.getTime());
}

/**
 * Validate date is not in the future
 */
export function isDateNotFuture(date: string): boolean {
  const dateObj = new Date(date);
  const today = new Date();
  today.setHours(23, 59, 59, 999); // End of today

  return dateObj <= today;
}

/**
 * Validate UUID format
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validate amount (non-negative number with up to 2 decimal places)
 */
export function isValidAmount(amount: number): boolean {
  if (amount < 0) return false;

  // Check if it has more than 2 decimal places
  const decimalPlaces = (amount.toString().split('.')[1] || '').length;
  return decimalPlaces <= 2;
}

/**
 * Validate duration in minutes
 */
export function isValidDuration(minutes: number): boolean {
  return Number.isInteger(minutes) && minutes >= 0 && minutes <= 1440; // Max 24 hours
}

/**
 * Validate number of nuts
 */
export function isValidNuts(nuts: number): boolean {
  return Number.isInteger(nuts) && nuts >= 0 && nuts <= 999;
}

/**
 * Sanitize string input (remove dangerous characters)
 */
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML/XML characters
    .slice(0, 1000); // Limit length
}

/**
 * Validate and sanitize name input
 */
export function validateAndSanitizeName(name: string): {
  isValid: boolean;
  sanitized: string;
  error?: string;
} {
  const sanitized = sanitizeString(name);

  if (sanitized.length === 0) {
    return { isValid: false, sanitized, error: 'Name cannot be empty' };
  }

  if (sanitized.length > 100) {
    return { isValid: false, sanitized, error: 'Name is too long' };
  }

  return { isValid: true, sanitized };
}

/**
 * Get user-friendly error message from validation errors
 */
export function getErrorMessage(errors: Record<string, string[]>): string {
  const allErrors = Object.values(errors).flat();
  return allErrors[0] || 'Validation failed';
}

/**
 * Check if form data has any validation errors
 */
export function hasValidationErrors(errors: Record<string, string[]>): boolean {
  return Object.keys(errors).length > 0;
}

// Re-export validation schemas for direct use
export {
  GirlSchema,
  CreateGirlSchema,
  UpdateGirlSchema,
  DataEntrySchema,
  CreateDataEntrySchema,
  UpdateDataEntrySchema,
  AuthSchema,
  SignUpSchema,
  SignInSchema,
  OnboardingSessionSchema,
  UserSchema,
  CreateUserSchema,
  UpdateUserSchema,
  isValidRating,
};