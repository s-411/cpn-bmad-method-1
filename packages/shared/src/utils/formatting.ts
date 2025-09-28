// Data formatting utilities
import { formatCurrency, formatDuration, formatRating } from './calculations';

/**
 * Format date for display
 */
export function formatDate(date: string | Date, format: 'short' | 'long' | 'relative' = 'short'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  switch (format) {
    case 'short':
      return dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    case 'long':
      return dateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    case 'relative':
      return formatRelativeDate(dateObj);
    default:
      return dateObj.toLocaleDateString();
  }
}

/**
 * Format relative date (e.g., "2 days ago", "Yesterday", "Today")
 */
export function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} week${Math.floor(diffInDays / 7) !== 1 ? 's' : ''} ago`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} month${Math.floor(diffInDays / 30) !== 1 ? 's' : ''} ago`;

  return `${Math.floor(diffInDays / 365)} year${Math.floor(diffInDays / 365) !== 1 ? 's' : ''} ago`;
}

/**
 * Format time for display (HH:MM format)
 */
export function formatTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/**
 * Format age with "years old" suffix
 */
export function formatAge(age: number): string {
  return `${age} years old`;
}

/**
 * Format subscription tier for display
 */
export function formatSubscriptionTier(tier: string): string {
  const tierMap: Record<string, string> = {
    boyfriend: 'Boyfriend Mode',
    player: 'Player Mode',
    lifetime: 'Lifetime Access',
  };
  return tierMap[tier] || tier;
}

/**
 * Format subscription status for display
 */
export function formatSubscriptionStatus(status: string): string {
  const statusMap: Record<string, string> = {
    active: 'Active',
    cancelled: 'Cancelled',
    expired: 'Expired',
  };
  return statusMap[status] || status;
}

/**
 * Get status color class for UI styling
 */
export function getStatusColorClass(status: string): string {
  const colorMap: Record<string, string> = {
    active: 'text-green-600 bg-green-100',
    cancelled: 'text-yellow-600 bg-yellow-100',
    expired: 'text-red-600 bg-red-100',
  };
  return colorMap[status] || 'text-gray-600 bg-gray-100';
}

/**
 * Format location (city, country)
 */
export function formatLocation(city?: string, country?: string): string {
  if (!city && !country) return '';
  if (!city) return country || '';
  if (!country) return city;
  return `${city}, ${country}`;
}

/**
 * Format ethnicity for display (capitalize first letter)
 */
export function formatEthnicity(ethnicity?: string): string {
  if (!ethnicity) return '';
  return ethnicity.charAt(0).toUpperCase() + ethnicity.slice(1).toLowerCase();
}

/**
 * Format hair color for display (capitalize first letter)
 */
export function formatHairColor(hairColor?: string): string {
  if (!hairColor) return '';
  return hairColor.charAt(0).toUpperCase() + hairColor.slice(1).toLowerCase();
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Format number with thousand separators
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

/**
 * Format percentage for display
 */
export function formatPercentage(value: number, total: number): string {
  if (total === 0) return '0%';
  const percentage = (value / total) * 100;
  return `${Math.round(percentage)}%`;
}

/**
 * Get initials from name for avatar placeholders
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Pluralize word based on count
 */
export function pluralize(word: string, count: number, suffix = 's'): string {
  return count === 1 ? word : word + suffix;
}

// Re-export calculation formatters for convenience
export { formatCurrency, formatDuration, formatRating };