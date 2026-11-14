/**
 * Date Filtering Helper for Warehouse Operations
 * Supports presets: ALL, TODAY, YESTERDAY, LAST_7_DAYS, THIS_MONTH, CUSTOM
 */

export const DATE_PRESET_OPTIONS = [
  { value: 'ALL', label: 'All Dates (Sabhi Dates)' },
  { value: 'TODAY', label: '📅 Today (आज)' },
  { value: 'YESTERDAY', label: '⏪ Yesterday (कल)' },
  { value: 'LAST_7_DAYS', label: '⏱️ Last 7 Days (पिछले 7 दिन)' },
  { value: 'THIS_MONTH', label: '🗓️ This Month (इस महीने)' },
  { value: 'CUSTOM', label: '📆 Custom Specific Date...' },
]

export function isDateMatching(dateValue, preset = 'ALL', customDate = '') {
  if (!preset || preset === 'ALL') return true
  if (!dateValue) return false

  // Handle human-readable string fallbacks (e.g. 'Today, Just now')
  if (typeof dateValue === 'string') {
    const lower = dateValue.toLowerCase()
    if (preset === 'TODAY' && (lower.includes('today') || lower.includes('just now'))) return true
    if (preset === 'YESTERDAY' && lower.includes('yesterday')) return true
  }

  let d = new Date(dateValue)
  // Support DD/MM/YYYY or DD-MM-YYYY format
  if (isNaN(d.getTime()) && typeof dateValue === 'string') {
    const parts = dateValue.trim().split(/[\s,]+|[-/]/)
    if (parts.length >= 3) {
      if (parts[0].length <= 2 && parts[2].length === 4) {
        // DD-MM-YYYY -> YYYY-MM-DD
        d = new Date(`${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`)
      }
    }
  }
  if (isNaN(d.getTime())) return false

  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)

  if (preset === 'TODAY') {
    return d >= startOfToday && d <= endOfToday
  }

  if (preset === 'YESTERDAY') {
    const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
    const endOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59, 999)
    return d >= startOfYesterday && d <= endOfYesterday
  }

  if (preset === 'LAST_7_DAYS') {
    const start7DaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)
    return d >= start7DaysAgo && d <= endOfToday
  }

  if (preset === 'THIS_MONTH') {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    return d >= startOfMonth && d <= endOfToday
  }

  if (preset === 'CUSTOM' && customDate) {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const localDateStr = `${y}-${m}-${day}`
    return localDateStr === customDate
  }

  return true
}

