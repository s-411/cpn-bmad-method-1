'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { errorLogger } from '@/lib/utils/errorLogger'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)

    // Log to our error logger
    if (typeof window !== 'undefined') {
      errorLogger.logError({
        type: 'error',
        category: 'React Error Boundary',
        message: error.message,
        details: {
          componentStack: errorInfo.componentStack,
          errorBoundary: this.constructor.name,
          stack: error.stack
        },
        stack: error.stack,
        severity: 'critical',
        emoji: '💥',
        explanation: 'React component crashed. This is a critical application error that prevents the UI from rendering.'
      })
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen bg-cpn-dark text-cpn-white flex items-center justify-center p-8">
          <div className="max-w-md text-center">
            <div className="text-6xl mb-4">💥</div>
            <h1 className="text-2xl font-heading mb-4">Something went wrong</h1>
            <p className="text-cpn-gray mb-6">
              A critical error occurred. Please refresh the page to try again.
            </p>
            <div className="space-y-4">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-cpn-yellow text-cpn-dark px-6 py-3 rounded-lg font-medium hover:opacity-90"
              >
                Refresh Page
              </button>
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: undefined })
                }}
                className="w-full bg-cpn-gray/20 text-cpn-white px-6 py-3 rounded-lg font-medium hover:bg-cpn-gray/30"
              >
                Try Again
              </button>
            </div>
            {this.state.error && (
              <details className="mt-6 text-left text-xs text-cpn-gray">
                <summary className="cursor-pointer mb-2">Error Details</summary>
                <pre className="bg-cpn-dark2 p-3 rounded overflow-auto">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}