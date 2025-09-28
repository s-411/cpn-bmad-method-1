'use client'

import React, { useState } from 'react'
import {
  UserCircleIcon,
  CreditCardIcon,
  KeyIcon,
  DocumentArrowDownIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  PencilIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '@/lib/auth/AuthProvider'
import { useUserProfile } from '@/lib/hooks/useUserProfile'
import { useGlobalStats } from '@/lib/context'
import { formatCurrency } from '@/lib/calculations'
import SubscriptionManager from '@/components/subscription/SubscriptionManager'

export default function ProfilePage() {
  const { user, signOut } = useAuth()
  const { profile, loading, error, updateProfile } = useUserProfile()
  const { globalStats } = useGlobalStats()

  const [isEditingEmail, setIsEditingEmail] = useState(false)
  const [tempEmail, setTempEmail] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [showDeleteWarning, setShowDeleteWarning] = useState(false)

  const handleEditEmail = () => {
    setTempEmail(profile?.email || '')
    setIsEditingEmail(true)
  }

  const handleSaveEmail = async () => {
    if (!tempEmail.trim()) return

    setIsUpdating(true)
    const success = await updateProfile({ email: tempEmail.trim() })

    if (success) {
      setIsEditingEmail(false)
    }
    setIsUpdating(false)
  }

  const handleCancelEdit = () => {
    setIsEditingEmail(false)
    setTempEmail('')
  }

  const handleUpgrade = async (tier: string) => {
    try {
      // This would integrate with Stripe for payment processing
      console.log('Upgrading to tier:', tier)
      // For now, just show an alert
      alert(`Upgrade to ${tier} plan - Payment integration coming soon!`)
    } catch (error) {
      console.error('Upgrade failed:', error)
    }
  }

  const exportData = async () => {
    try {
      // This would be implemented with the export API
      const data = {
        user: profile,
        stats: globalStats,
        exportDate: new Date().toISOString(),
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `cpn-data-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cpn-dark flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-cpn-yellow border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-cpn-gray">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cpn-dark">
      {/* Header */}
      <div className="border-b border-cpn-gray/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-heading text-cpn-white">Profile & Settings</h1>
            <p className="text-cpn-gray mt-1">
              Manage your account and subscription settings
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Account Information */}
        <div className="card-cpn">
          <div className="flex items-center gap-3 mb-6">
            <UserCircleIcon className="w-6 h-6 text-cpn-yellow" />
            <h2 className="text-xl font-heading text-cpn-white">Account Information</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-cpn-gray mb-2">Email Address</label>
              <div className="flex items-center gap-3">
                {isEditingEmail ? (
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      type="email"
                      value={tempEmail}
                      onChange={(e) => setTempEmail(e.target.value)}
                      className="input-cpn flex-1"
                      placeholder="Enter new email"
                    />
                    <button
                      onClick={handleSaveEmail}
                      disabled={isUpdating}
                      className="p-2 text-green-400 hover:bg-green-500/10 rounded transition-colors disabled:opacity-50"
                    >
                      <CheckIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={isUpdating}
                      className="p-2 text-cpn-gray hover:bg-cpn-gray/10 rounded transition-colors"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-between">
                    <span className="text-cpn-white">{profile?.email || user?.email}</span>
                    <button
                      onClick={handleEditEmail}
                      className="p-2 text-cpn-gray hover:text-cpn-yellow hover:bg-cpn-yellow/10 rounded transition-colors"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-cpn-gray mb-2">Account Created</label>
              <span className="text-cpn-white">
                {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown'}
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-cpn-gray mb-2">User ID</label>
              <span className="text-cpn-gray font-mono text-sm">{user?.id}</span>
            </div>
          </div>
        </div>

        {/* Subscription Management */}
        <div className="card-cpn">
          <div className="flex items-center gap-3 mb-6">
            <CreditCardIcon className="w-6 h-6 text-cpn-yellow" />
            <h2 className="text-xl font-heading text-cpn-white">Subscription Management</h2>
          </div>

          <SubscriptionManager
            currentTier={profile?.subscription_tier || 'boyfriend'}
            currentStatus={profile?.subscription_status || 'active'}
            onUpgrade={handleUpgrade}
          />
        </div>

        {/* Statistics Overview */}
        <div className="card-cpn">
          <div className="flex items-center gap-3 mb-6">
            <CheckIcon className="w-6 h-6 text-cpn-yellow" />
            <h2 className="text-xl font-heading text-cpn-white">Account Summary</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-cpn-yellow">{globalStats.totalGirls}</p>
              <p className="text-sm text-cpn-gray">Total Profiles</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-cpn-white">{globalStats.totalNuts}</p>
              <p className="text-sm text-cpn-gray">Total Nuts</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-cpn-yellow">{formatCurrency(globalStats.totalSpent)}</p>
              <p className="text-sm text-cpn-gray">Total Spent</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-cpn-white">{Math.round(globalStats.totalTime / 60)}</p>
              <p className="text-sm text-cpn-gray">Hours Logged</p>
            </div>
          </div>
        </div>

        {/* Data & Privacy */}
        <div className="card-cpn">
          <div className="flex items-center gap-3 mb-6">
            <KeyIcon className="w-6 h-6 text-cpn-yellow" />
            <h2 className="text-xl font-heading text-cpn-white">Data & Privacy</h2>
          </div>

          <div className="space-y-4">
            <button
              onClick={exportData}
              className="w-full flex items-center justify-between p-4 bg-cpn-dark2 hover:bg-cpn-dark2/80 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <DocumentArrowDownIcon className="w-5 h-5 text-cpn-gray" />
                <div className="text-left">
                  <p className="text-cpn-white font-medium">Export Your Data</p>
                  <p className="text-sm text-cpn-gray">Download all your data in JSON format</p>
                </div>
              </div>
              <span className="text-cpn-gray">→</span>
            </button>

            <div className="border-t border-cpn-gray/20 pt-4">
              <button
                onClick={() => setShowDeleteWarning(true)}
                className="w-full flex items-center justify-between p-4 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
                  <div className="text-left">
                    <p className="text-red-400 font-medium">Delete Account</p>
                    <p className="text-sm text-red-300">Permanently delete your account and all data</p>
                  </div>
                </div>
                <span className="text-red-400">→</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sign Out */}
        <div className="text-center pt-6">
          <button
            onClick={() => signOut()}
            className="btn-cpn-secondary"
          >
            Sign Out
          </button>
        </div>

        {/* Delete Warning Modal */}
        {showDeleteWarning && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-cpn-dark border border-cpn-gray/20 rounded-lg p-6 max-w-md w-full">
              <div className="text-center">
                <ExclamationTriangleIcon className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <h3 className="text-lg font-heading text-cpn-white mb-2">Delete Account</h3>
                <p className="text-cpn-gray mb-6">
                  This action cannot be undone. All your data will be permanently deleted.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteWarning(false)}
                    className="flex-1 btn-cpn-secondary"
                  >
                    Cancel
                  </button>
                  <button className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}