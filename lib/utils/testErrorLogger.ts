'use client'

import { errorLogger } from './errorLogger'

// Test functions to demonstrate error logging
export function testErrorLogger() {
  // Simulate various error types

  // 1. Critical database error
  errorLogger.logError({
    type: 'error',
    category: 'Database',
    message: 'Failed to connect to Supabase database',
    details: {
      connectionString: 'postgres://...',
      timeout: 5000,
      retries: 3
    },
    severity: 'critical',
    emoji: '🗄️',
    explanation: 'Database connection failed completely. All data operations will fail until resolved.'
  })

  // 2. Authentication warning
  errorLogger.logError({
    type: 'warning',
    category: 'Authentication',
    message: 'Multiple GoTrueClient instances detected',
    details: { instances: 2, storageKey: 'sb-auth' },
    severity: 'medium',
    emoji: '🔐',
    explanation: 'Multiple auth clients could cause state inconsistencies. Consider implementing singleton pattern.'
  })

  // 3. Font loading issue (low severity)
  errorLogger.logError({
    type: 'warning',
    category: 'Font Loading',
    message: 'Failed to decode downloaded font: ESKlarheitGrotesk-Rg.otf',
    details: {
      fontUrl: '/fonts/ESKlarheitGrotesk-Rg.otf',
      error: 'OTS parsing error: invalid sfntVersion: 1008813135'
    },
    severity: 'low',
    emoji: '🔤',
    explanation: 'Custom font failed to load. App will fallback to system fonts. Check font file integrity.'
  })

  // 4. Network error
  errorLogger.logError({
    type: 'error',
    category: 'Network',
    message: 'API request failed with 500 Internal Server Error',
    details: {
      url: '/api/girls',
      status: 500,
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    },
    severity: 'high',
    emoji: '🌐',
    explanation: 'Server error occurred. This could affect data loading functionality.'
  })

  // 5. Browser extension noise (very low severity)
  errorLogger.logError({
    type: 'error',
    category: 'Browser Extension',
    message: 'Cannot create item with duplicate id LastPass',
    details: { extension: 'LastPass', action: 'context_menu_create' },
    severity: 'low',
    emoji: '🔌',
    explanation: 'LastPass extension conflict. Safe to ignore - does not affect app functionality.'
  })

  // 6. React hydration warning
  errorLogger.logError({
    type: 'warning',
    category: 'React Hydration',
    message: 'Text content did not match. Server: "0" Client: "5"',
    details: {
      component: 'UserStatsCard',
      serverValue: '0',
      clientValue: '5'
    },
    severity: 'medium',
    emoji: '💧',
    explanation: 'Server and client render mismatch. Can cause layout shifts. Check for client-only state in SSR components.'
  })

  console.log('✅ Test errors logged! Check the error logger button in the bottom-right corner.')
}

// Test specific error patterns from your console
export function simulateConsoleErrors() {
  // Simulate the actual errors you're seeing
  console.error('Cannot create item with duplicate id LastPass https://www.tokopedia.com/chat')
  console.warn('Failed to decode downloaded font: https://cpn-bmad-method-1-fyi0s4hf9-stevens-projects-55bfe26e.vercel.app/fonts/ESKlarheitGrotesk-Rg.otf')
  console.warn('OTS parsing error: invalid sfntVersion: 1008813135')
  console.warn('Multiple GoTrueClient instances detected in the same browser context')

  // Simulate an unhandled promise rejection
  Promise.reject(new Error('Simulated async operation failure'))

  // Simulate a JavaScript error
  setTimeout(() => {
    try {
      // @ts-ignore
      nonExistentFunction()
    } catch (error) {
      // This will be caught by the global error handler
      throw error
    }
  }, 100)
}

// Make these available globally for easy testing
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.testErrorLogger = testErrorLogger
  // @ts-ignore
  window.simulateConsoleErrors = simulateConsoleErrors
  // @ts-ignore
  window.errorLogger = errorLogger
}