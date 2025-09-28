'use client'

import React from 'react'
import { CheckIcon, XMarkIcon, StarIcon } from '@heroicons/react/24/outline'
import { SUBSCRIPTION_TIERS, FEATURE_ACCESS } from '@cpn/shared'

interface SubscriptionManagerProps {
  currentTier: string
  currentStatus: string
  onUpgrade?: (tier: string) => void
}

const plans = [
  {
    name: 'Boyfriend',
    tier: SUBSCRIPTION_TIERS.BOYFRIEND,
    price: 'Free',
    description: 'Perfect for getting started',
    features: [
      'Up to 3 girl profiles',
      'Basic data entry',
      'Overview dashboard',
      'Basic metrics'
    ],
    limitations: [
      'No analytics dashboard',
      'No custom sharing',
      'Limited features'
    ]
  },
  {
    name: 'Player',
    tier: SUBSCRIPTION_TIERS.PLAYER,
    price: '$9.99/month',
    description: 'For serious data tracking',
    features: [
      'Unlimited girl profiles',
      'Advanced analytics',
      'Custom sharing',
      'All dashboard features',
      'Export capabilities',
      'Priority support'
    ],
    limitations: []
  },
  {
    name: 'Lifetime',
    tier: SUBSCRIPTION_TIERS.LIFETIME,
    price: '$199 once',
    description: 'All features, forever',
    features: [
      'Everything in Player',
      'Lifetime access',
      'Future features included',
      'Premium support',
      'Early access to new features'
    ],
    limitations: [],
    popular: true
  }
]

export default function SubscriptionManager({
  currentTier,
  currentStatus,
  onUpgrade
}: SubscriptionManagerProps) {
  const currentFeatures = FEATURE_ACCESS[currentTier as keyof typeof FEATURE_ACCESS]

  return (
    <div className="space-y-6">
      {/* Current Plan Status */}
      <div className="card-cpn bg-gradient-to-r from-cpn-yellow/10 to-cpn-yellow/5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-heading text-cpn-white capitalize">
              {currentTier} Plan
            </h3>
            <p className="text-sm text-cpn-gray">
              Status: <span className={`font-medium ${
                currentStatus === 'active' ? 'text-green-400' : 'text-red-400'
              }`}>
                {currentStatus}
              </span>
            </p>
          </div>
          {currentTier === SUBSCRIPTION_TIERS.BOYFRIEND && (
            <div className="text-right">
              <p className="text-cpn-yellow font-medium">Free Plan</p>
              <p className="text-xs text-cpn-gray">Upgrade for more features</p>
            </div>
          )}
        </div>
      </div>

      {/* Current Features */}
      <div className="card-cpn">
        <h4 className="text-lg font-heading text-cpn-white mb-4">Your Current Features</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <h5 className="text-sm font-medium text-cpn-yellow mb-2">Available</h5>
            <ul className="space-y-1">
              {Object.entries(currentFeatures || {})
                .filter(([key, value]) => value === true)
                .map(([key]) => (
                  <li key={key} className="flex items-center gap-2 text-sm text-cpn-white">
                    <CheckIcon className="w-4 h-4 text-green-400" />
                    {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </li>
                ))}
              {currentFeatures?.max_girls && (
                <li className="flex items-center gap-2 text-sm text-cpn-white">
                  <CheckIcon className="w-4 h-4 text-green-400" />
                  Up to {currentFeatures.max_girls} girl profiles
                </li>
              )}
            </ul>
          </div>
          <div>
            <h5 className="text-sm font-medium text-cpn-gray mb-2">Upgrade to unlock</h5>
            <ul className="space-y-1">
              {Object.entries(currentFeatures || {})
                .filter(([key, value]) => value === false)
                .map(([key]) => (
                  <li key={key} className="flex items-center gap-2 text-sm text-cpn-gray">
                    <XMarkIcon className="w-4 h-4 text-cpn-gray" />
                    {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Upgrade Options (only show if not lifetime) */}
      {currentTier !== SUBSCRIPTION_TIERS.LIFETIME && (
        <div className="space-y-4">
          <h4 className="text-lg font-heading text-cpn-white">Upgrade Your Plan</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plans
              .filter(plan => plan.tier !== currentTier)
              .map((plan) => (
                <div
                  key={plan.tier}
                  className={`relative card-cpn border-2 transition-all duration-200 hover:scale-105 ${
                    plan.popular
                      ? 'border-cpn-yellow bg-gradient-to-b from-cpn-yellow/10 to-cpn-yellow/5'
                      : 'border-cpn-gray/20 hover:border-cpn-yellow/40'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <div className="bg-cpn-yellow text-cpn-dark px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        <StarIcon className="w-3 h-3" />
                        Most Popular
                      </div>
                    </div>
                  )}

                  <div className="text-center mb-4">
                    <h3 className="text-xl font-heading text-cpn-white">{plan.name}</h3>
                    <p className="text-2xl font-bold text-cpn-yellow mt-2">{plan.price}</p>
                    <p className="text-sm text-cpn-gray mt-1">{plan.description}</p>
                  </div>

                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-cpn-white">
                        <CheckIcon className="w-4 h-4 text-green-400 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => onUpgrade?.(plan.tier)}
                    className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                      plan.popular
                        ? 'bg-cpn-yellow text-cpn-dark hover:bg-cpn-yellow/90'
                        : 'bg-cpn-gray/20 text-cpn-white hover:bg-cpn-gray/30'
                    }`}
                  >
                    Upgrade to {plan.name}
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Lifetime User Message */}
      {currentTier === SUBSCRIPTION_TIERS.LIFETIME && (
        <div className="card-cpn bg-gradient-to-r from-cpn-yellow/20 to-cpn-yellow/10 border border-cpn-yellow/30">
          <div className="text-center">
            <StarIcon className="w-12 h-12 text-cpn-yellow mx-auto mb-4" />
            <h3 className="text-xl font-heading text-cpn-white mb-2">Lifetime Member</h3>
            <p className="text-cpn-gray">
              You have lifetime access to all features. Thank you for your support!
            </p>
          </div>
        </div>
      )}
    </div>
  )
}