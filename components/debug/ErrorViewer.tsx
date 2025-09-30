'use client'

import React, { useState } from 'react'
import {
  BugAntIcon,
  DocumentArrowDownIcon,
  TrashIcon,
  FunnelIcon,
  ClipboardDocumentIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { useErrorLogger, type ErrorLog } from '@/lib/utils/errorLogger'

interface ErrorViewerProps {
  isOpen: boolean
  onClose: () => void
}

export function ErrorViewer({ isOpen, onClose }: ErrorViewerProps) {
  const {
    logs,
    exportLogs,
    clearLogs,
    getStats,
    getLogsByCategory,
    getLogsBySeverity
  } = useErrorLogger()

  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all')
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set())
  const [showExportModal, setShowExportModal] = useState(false)

  const stats = getStats()

  const filteredLogs = logs.filter(log => {
    const categoryMatch = selectedCategory === 'all' || log.category === selectedCategory
    const severityMatch = selectedSeverity === 'all' || log.severity === selectedSeverity
    return categoryMatch && severityMatch
  })

  const toggleLogExpansion = (logId: string) => {
    const newExpanded = new Set(expandedLogs)
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId)
    } else {
      newExpanded.add(logId)
    }
    setExpandedLogs(newExpanded)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-500 bg-red-500/10 border-red-500/20'
      case 'high': return 'text-orange-500 bg-orange-500/10 border-orange-500/20'
      case 'medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20'
      case 'low': return 'text-green-500 bg-green-500/10 border-green-500/20'
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20'
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
    }
  }

  const downloadErrorReport = () => {
    const reportData = {
      timestamp: new Date().toISOString(),
      stats,
      logs: filteredLogs,
      userAgent: navigator.userAgent,
      url: window.location.href
    }

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cpn-error-report-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-cpn-dark border border-cpn-gray/20 rounded-lg w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-cpn-gray/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BugAntIcon className="w-6 h-6 text-cpn-yellow" />
            <div>
              <h2 className="text-xl font-heading text-cpn-white">Error Logger</h2>
              <p className="text-sm text-cpn-gray">
                {stats.total} total logs • {stats.bySeverity.high || 0} high severity • {stats.bySeverity.critical || 0} critical
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-cpn-gray hover:text-cpn-white transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Overview */}
        <div className="p-6 border-b border-cpn-gray/20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-cpn-dark2/50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-red-500">{stats.bySeverity.critical || 0}</p>
              <p className="text-xs text-cpn-gray">Critical</p>
            </div>
            <div className="bg-cpn-dark2/50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-orange-500">{stats.bySeverity.high || 0}</p>
              <p className="text-xs text-cpn-gray">High</p>
            </div>
            <div className="bg-cpn-dark2/50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-yellow-500">{stats.bySeverity.medium || 0}</p>
              <p className="text-xs text-cpn-gray">Medium</p>
            </div>
            <div className="bg-cpn-dark2/50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-green-500">{stats.bySeverity.low || 0}</p>
              <p className="text-xs text-cpn-gray">Low</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <FunnelIcon className="w-4 h-4 text-cpn-gray" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-cpn-dark2 border border-cpn-gray/30 rounded px-3 py-1 text-cpn-white text-sm"
              >
                <option value="all">All Categories</option>
                {Object.keys(stats.byCategory).map(category => (
                  <option key={category} value={category}>
                    {category} ({stats.byCategory[category]})
                  </option>
                ))}
              </select>
            </div>

            {/* Severity Filter */}
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="bg-cpn-dark2 border border-cpn-gray/30 rounded px-3 py-1 text-cpn-white text-sm"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            {/* Actions */}
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => copyToClipboard(exportLogs('text'))}
                className="px-3 py-1 bg-cpn-yellow text-cpn-dark rounded text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                <ClipboardDocumentIcon className="w-4 h-4" />
                Copy All
              </button>
              <button
                onClick={downloadErrorReport}
                className="px-3 py-1 bg-blue-500 text-white rounded text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                <DocumentArrowDownIcon className="w-4 h-4" />
                Download Report
              </button>
              <button
                onClick={clearLogs}
                className="px-3 py-1 bg-red-500 text-white rounded text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                <TrashIcon className="w-4 h-4" />
                Clear All
              </button>
            </div>
          </div>
        </div>

        {/* Error Logs */}
        <div className="flex-1 overflow-auto p-6">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <InformationCircleIcon className="w-12 h-12 text-cpn-gray mx-auto mb-4" />
              <p className="text-cpn-gray">
                {logs.length === 0 ? 'No errors logged yet' : 'No errors match the current filters'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className={`border rounded-lg p-4 ${getSeverityColor(log.severity)}`}
                >
                  {/* Log Header */}
                  <div
                    className="flex items-start justify-between cursor-pointer"
                    onClick={() => toggleLogExpansion(log.id)}
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <span className="text-2xl">{log.emoji}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-cpn-white">{log.category}</h3>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(log.severity)}`}>
                            {log.severity.toUpperCase()}
                          </span>
                          <span className="text-xs text-cpn-gray">
                            {log.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-cpn-white text-sm mb-2">{log.message}</p>
                        <p className="text-cpn-gray text-xs italic">{log.explanation}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          copyToClipboard(JSON.stringify(log, null, 2))
                        }}
                        className="p-1 text-cpn-gray hover:text-cpn-white transition-colors"
                        title="Copy log"
                      >
                        <ClipboardDocumentIcon className="w-4 h-4" />
                      </button>
                      {expandedLogs.has(log.id) ? (
                        <ChevronDownIcon className="w-4 h-4 text-cpn-gray" />
                      ) : (
                        <ChevronRightIcon className="w-4 h-4 text-cpn-gray" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedLogs.has(log.id) && (
                    <div className="mt-4 pt-4 border-t border-cpn-gray/20 space-y-3">
                      <div>
                        <p className="text-xs font-medium text-cpn-gray mb-1">URL:</p>
                        <p className="text-xs text-cpn-white font-mono break-all">{log.url}</p>
                      </div>

                      {log.details && (
                        <div>
                          <p className="text-xs font-medium text-cpn-gray mb-1">Details:</p>
                          <pre className="text-xs text-cpn-white bg-cpn-dark2/50 rounded p-3 overflow-auto max-h-32">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </div>
                      )}

                      {log.stack && (
                        <div>
                          <p className="text-xs font-medium text-cpn-gray mb-1">Stack Trace:</p>
                          <pre className="text-xs text-cpn-white bg-cpn-dark2/50 rounded p-3 overflow-auto max-h-32 font-mono">
                            {log.stack}
                          </pre>
                        </div>
                      )}

                      <div>
                        <p className="text-xs font-medium text-cpn-gray mb-1">User Agent:</p>
                        <p className="text-xs text-cpn-white font-mono break-all">{log.userAgent}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Floating Error Logger Button
export function ErrorLoggerButton() {
  const [isOpen, setIsOpen] = useState(false)
  const { logs } = useErrorLogger()

  const criticalCount = logs.filter(log => log.severity === 'critical').length
  const highCount = logs.filter(log => log.severity === 'high').length

  const hasImportantErrors = criticalCount > 0 || highCount > 0

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-4 right-4 z-50 p-3 rounded-full shadow-lg transition-all duration-200 ${
          hasImportantErrors
            ? 'bg-red-500 hover:bg-red-600 animate-pulse'
            : 'bg-cpn-yellow hover:bg-cpn-yellow/90'
        } text-cpn-dark font-medium`}
        title={`Error Logger (${logs.length} logs)`}
      >
        <div className="flex items-center gap-2">
          <BugAntIcon className="w-5 h-5" />
          {logs.length > 0 && (
            <span className="bg-cpn-dark text-cpn-white px-2 py-1 rounded-full text-xs font-bold">
              {logs.length}
            </span>
          )}
        </div>
      </button>

      <ErrorViewer isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}