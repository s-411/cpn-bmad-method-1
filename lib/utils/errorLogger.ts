'use client'

export interface ErrorLog {
  id: string
  timestamp: Date
  type: 'error' | 'warning' | 'info' | 'auth' | 'network' | 'font' | 'extension'
  category: string
  message: string
  details?: any
  stack?: string
  url?: string
  userAgent?: string
  emoji: string
  explanation: string
  severity: 'low' | 'medium' | 'high' | 'critical'
}

class ErrorLoggerService {
  private logs: ErrorLog[] = []
  private listeners: ((logs: ErrorLog[]) => void)[] = []
  private maxLogs = 1000

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeErrorCapture()
    }
  }

  private initializeErrorCapture() {
    // Capture JavaScript errors
    window.addEventListener('error', (event) => {
      this.logError({
        type: 'error',
        category: 'JavaScript',
        message: event.message,
        details: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          error: event.error
        },
        stack: event.error?.stack,
        severity: 'high',
        emoji: '🚨',
        explanation: 'JavaScript runtime error occurred. This could break app functionality.'
      })
    })

    // Capture unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logError({
        type: 'error',
        category: 'Promise',
        message: `Unhandled Promise Rejection: ${event.reason}`,
        details: event.reason,
        severity: 'high',
        emoji: '🔥',
        explanation: 'A promise was rejected but not caught. This could indicate async operation failures.'
      })
    })

    // Intercept console methods
    this.interceptConsole()

    // Intercept network errors
    this.interceptNetworkErrors()

    // Monitor for specific patterns
    this.monitorSpecificPatterns()
  }

  private interceptConsole() {
    const originalError = console.error
    const originalWarn = console.warn
    const originalLog = console.log

    console.error = (...args) => {
      originalError.apply(console, args)
      this.categorizeAndLog('error', args.join(' '))
    }

    console.warn = (...args) => {
      originalWarn.apply(console, args)
      this.categorizeAndLog('warning', args.join(' '))
    }

    console.log = (...args) => {
      originalLog.apply(console, args)
      const message = args.join(' ')
      if (message.includes('error') || message.includes('failed')) {
        this.categorizeAndLog('info', message)
      }
    }
  }

  private interceptNetworkErrors() {
    // Intercept fetch
    const originalFetch = window.fetch
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch.apply(window, args)
        if (!response.ok) {
          this.logError({
            type: 'error',
            category: 'Network',
            message: `HTTP ${response.status}: ${response.statusText}`,
            details: {
              url: args[0],
              status: response.status,
              statusText: response.statusText
            },
            severity: response.status >= 500 ? 'high' : 'medium',
            emoji: '🌐',
            explanation: `Network request failed. ${response.status >= 500 ? 'Server error' : 'Client error'}.`
          })
        }
        return response
      } catch (error) {
        this.logError({
          type: 'error',
          category: 'Network',
          message: `Network request failed: ${error}`,
          details: { url: args[0], error },
          severity: 'high',
          emoji: '📡',
          explanation: 'Network request completely failed. Check internet connection or server availability.'
        })
        throw error
      }
    }
  }

  private categorizeAndLog(type: 'error' | 'warning' | 'info', message: string) {
    let category = 'General'
    let emoji = '📝'
    let explanation = 'General log message'
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'low'

    // LastPass extension errors
    if (message.includes('Cannot create item with duplicate id') && message.includes('LastPass')) {
      category = 'Browser Extension'
      emoji = '🔌'
      explanation = 'LastPass browser extension conflict. Safe to ignore - does not affect app functionality.'
      severity = 'low'
    }

    // Font loading errors
    else if (message.includes('Failed to decode downloaded font') || message.includes('OTS parsing error')) {
      category = 'Font Loading'
      emoji = '🔤'
      explanation = 'Custom font failed to load. App will fallback to system fonts. Check font file integrity.'
      severity = 'low'
    }

    // Multiple GoTrueClient instances
    else if (message.includes('Multiple GoTrueClient instances detected')) {
      category = 'Authentication'
      emoji = '🔐'
      explanation = 'Multiple Supabase auth clients detected. This could cause auth state inconsistencies.'
      severity = 'medium'
    }

    // React/Next.js errors
    else if (message.includes('Hydration') || message.includes('hydration')) {
      category = 'React Hydration'
      emoji = '💧'
      explanation = 'Server and client render mismatch. Can cause layout shifts or functionality issues.'
      severity = 'medium'
    }

    // Webpack/Build errors
    else if (message.includes('webpack') || message.includes('Compilation')) {
      category = 'Build System'
      emoji = '🔨'
      explanation = 'Build system warning. May indicate development environment issues.'
      severity = 'low'
    }

    // Database/Supabase errors
    else if (message.includes('supabase') || message.includes('postgres') || message.includes('SQL')) {
      category = 'Database'
      emoji = '🗄️'
      explanation = 'Database operation error. Could affect data loading or saving.'
      severity = 'high'
    }

    // API/Network errors
    else if (message.includes('fetch') || message.includes('API') || message.includes('HTTP')) {
      category = 'API'
      emoji = '🌐'
      explanation = 'API request error. May affect app functionality that depends on external services.'
      severity = 'medium'
    }

    // Chrome extension errors
    else if (message.includes('chrome-extension') || message.includes('extension')) {
      category = 'Browser Extension'
      emoji = '🔌'
      explanation = 'Browser extension error. Usually safe to ignore unless affecting app functionality.'
      severity = 'low'
    }

    // Generic error patterns
    else if (type === 'error') {
      emoji = '❌'
      explanation = 'Application error detected. May impact functionality.'
      severity = 'medium'
    }
    else if (type === 'warning') {
      emoji = '⚠️'
      explanation = 'Warning detected. Monitor for potential issues.'
      severity = 'low'
    }

    this.logError({
      type,
      category,
      message,
      severity,
      emoji,
      explanation
    })
  }

  private monitorSpecificPatterns() {
    // Monitor for authentication issues
    const authPatterns = [
      'auth.getUser',
      'signInWithPassword',
      'signUp',
      'signOut',
      'createClient'
    ]

    // Monitor for data loading issues
    const dataPatterns = [
      'fetchGirls',
      'fetchDataEntries',
      'useSupabase',
      'loading'
    ]

    // This would be implemented with MutationObserver or other techniques
    // to monitor for specific patterns in the DOM or network requests
  }

  public logError(error: Partial<ErrorLog>) {
    const log: ErrorLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      type: error.type || 'error',
      category: error.category || 'General',
      message: error.message || 'Unknown error',
      details: error.details,
      stack: error.stack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      emoji: error.emoji || '❓',
      explanation: error.explanation || 'No explanation available',
      severity: error.severity || 'medium'
    }

    this.logs.unshift(log) // Add to beginning

    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs)
    }

    // Notify listeners
    this.listeners.forEach(listener => listener([...this.logs]))

    // Log to console with enhanced formatting
    this.logToConsoleEnhanced(log)
  }

  private logToConsoleEnhanced(log: ErrorLog) {
    const style = this.getConsoleStyle(log.severity)
    console.group(`%c${log.emoji} ${log.category} - ${log.severity.toUpperCase()}`, style)
    console.log(`%c📝 Message: ${log.message}`, 'color: #333; font-weight: bold;')
    console.log(`%c💡 Explanation: ${log.explanation}`, 'color: #666; font-style: italic;')
    console.log(`%c🕐 Time: ${log.timestamp.toLocaleTimeString()}`, 'color: #999;')
    if (log.details) {
      console.log('%c📊 Details:', 'color: #666;', log.details)
    }
    if (log.stack) {
      console.log('%c📚 Stack:', 'color: #999; font-family: monospace;', log.stack)
    }
    console.groupEnd()
  }

  private getConsoleStyle(severity: string): string {
    switch (severity) {
      case 'critical':
        return 'background: #ff0000; color: white; padding: 2px 5px; border-radius: 3px; font-weight: bold;'
      case 'high':
        return 'background: #ff6b35; color: white; padding: 2px 5px; border-radius: 3px; font-weight: bold;'
      case 'medium':
        return 'background: #ffa500; color: white; padding: 2px 5px; border-radius: 3px; font-weight: bold;'
      case 'low':
        return 'background: #28a745; color: white; padding: 2px 5px; border-radius: 3px; font-weight: bold;'
      default:
        return 'background: #6c757d; color: white; padding: 2px 5px; border-radius: 3px; font-weight: bold;'
    }
  }

  public subscribe(listener: (logs: ErrorLog[]) => void) {
    this.listeners.push(listener)
    listener([...this.logs]) // Send current logs immediately

    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  public getLogs() {
    return [...this.logs]
  }

  public getLogsByCategory(category: string) {
    return this.logs.filter(log => log.category === category)
  }

  public getLogsBySeverity(severity: string) {
    return this.logs.filter(log => log.severity === severity)
  }

  public exportLogs(format: 'json' | 'text' = 'text'): string {
    if (format === 'json') {
      return JSON.stringify(this.logs, null, 2)
    }

    return this.logs.map(log => {
      return [
        `${log.emoji} [${log.timestamp.toISOString()}] ${log.category.toUpperCase()} - ${log.severity.toUpperCase()}`,
        `Message: ${log.message}`,
        `Explanation: ${log.explanation}`,
        `URL: ${log.url}`,
        log.details ? `Details: ${JSON.stringify(log.details)}` : '',
        log.stack ? `Stack: ${log.stack}` : '',
        '---'
      ].filter(Boolean).join('\n')
    }).join('\n\n')
  }

  public clearLogs() {
    this.logs = []
    this.listeners.forEach(listener => listener([]))
  }

  public getStats() {
    const stats = {
      total: this.logs.length,
      byType: {} as Record<string, number>,
      byCategory: {} as Record<string, number>,
      bySeverity: {} as Record<string, number>,
      recent: this.logs.slice(0, 10)
    }

    this.logs.forEach(log => {
      stats.byType[log.type] = (stats.byType[log.type] || 0) + 1
      stats.byCategory[log.category] = (stats.byCategory[log.category] || 0) + 1
      stats.bySeverity[log.severity] = (stats.bySeverity[log.severity] || 0) + 1
    })

    return stats
  }
}

// Create singleton instance
export const errorLogger = new ErrorLoggerService()

// React hook for using error logger
import { useState, useEffect } from 'react'

export function useErrorLogger() {
  const [logs, setLogs] = useState<ErrorLog[]>([])

  useEffect(() => {
    const unsubscribe = errorLogger.subscribe(setLogs)
    return unsubscribe
  }, [])

  return {
    logs,
    logError: (error: Partial<ErrorLog>) => errorLogger.logError(error),
    exportLogs: (format?: 'json' | 'text') => errorLogger.exportLogs(format),
    clearLogs: () => errorLogger.clearLogs(),
    getStats: () => errorLogger.getStats(),
    getLogsByCategory: (category: string) => errorLogger.getLogsByCategory(category),
    getLogsBySeverity: (severity: string) => errorLogger.getLogsBySeverity(severity)
  }
}