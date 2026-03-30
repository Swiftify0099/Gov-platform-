/**
 * Format seconds to MM:SS or HH:MM:SS
 */
export const formatTime = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h}:${pad(m)}:${pad(s)}`;
  }
  return `${pad(m)}:${pad(s)}`;
};

const pad = (n: number): string => n.toString().padStart(2, '0');

/**
 * Format duration in minutes to readable string
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
};

/**
 * Format a date string to localized display
 */
export const formatDate = (dateStr: string, locale = 'en-IN'): string => {
  return new Date(dateStr).toLocaleDateString(locale, {
    year: 'numeric', month: 'short', day: 'numeric',
  });
};

/**
 * Format currency amount
 */
export const formatCurrency = (amount: number, currency = 'INR'): string => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(amount);
};

/**
 * Calculate percentage
 */
export const calcPercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100 * 10) / 10;
};

/**
 * Get performance label based on percentage
 */
export const getPerformanceLabel = (percentage: number): 'excellent' | 'good' | 'average' | 'weak' => {
  if (percentage >= 85) return 'excellent';
  if (percentage >= 60) return 'good';
  if (percentage >= 40) return 'average';
  return 'weak';
};

/**
 * Truncate text to max length
 */
export const truncate = (text: string, maxLength = 120): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

/**
 * Generate initials from name
 */
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
};
