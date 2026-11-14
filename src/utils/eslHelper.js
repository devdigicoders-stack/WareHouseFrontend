/**
 * Universal Estimated Shelf Life (ESL) & Expiry Date Helper
 * Guarantees Expiry Date and ESL are calculated and displayed
 * across all software pages, modals, tables, and print stickers/slips.
 */

// Category to Default Shelf Life (Months)
const CATEGORY_SHELF_LIFE_MONTHS = {
  'Grains & Pulses': 18,
  'Edible Oils & Liquids': 12,
  'Edible Oils': 12,
  'Packaged Food & FMCG': 24,
  'Packaged FMCG': 24,
  'Packaging & Materials': 36,
  'Packaging Materials': 36,
  'Chemicals & Hygiene': 24,
  'Spares & General Hardware': 36,
  'Spares & General': 36,
  'Animal Feed & Agro': 12,
  'General': 24,
  'General Goods': 24,
}

// Product name keyword overrides
const PRODUCT_SHELF_LIFE_KEYWORDS = [
  { keyword: 'atta', months: 12 },
  { keyword: 'wheat', months: 18 },
  { keyword: 'rice', months: 24 },
  { keyword: 'sugar', months: 24 },
  { keyword: 'salt', months: 36 },
  { keyword: 'oil', months: 12 },
  { keyword: 'dal', months: 18 },
  { keyword: 'moong', months: 18 },
  { keyword: 'chana', months: 18 },
  { keyword: 'barley', months: 12 },
  { keyword: 'feed', months: 12 },
  { keyword: 'hay', months: 12 },
  { keyword: 'chemical', months: 24 },
  { keyword: 'tablet', months: 24 },
]

export function getShelfLifeMonths(productName = '', category = '') {
  const pNameLower = String(productName).toLowerCase()
  for (const item of PRODUCT_SHELF_LIFE_KEYWORDS) {
    if (pNameLower.includes(item.keyword)) {
      return item.months
    }
  }
  return CATEGORY_SHELF_LIFE_MONTHS[category] || 18
}

export function formatDisplayDate(dateInput) {
  if (!dateInput) return '—'
  const d = new Date(dateInput)
  if (isNaN(d.getTime())) return String(dateInput)
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function getEslInfo(item = {}) {
  if (!item) item = {}
  
  const pName = item.productName || item.name || item.product || ''
  const cat = item.category || ''
  const shelfMonths = item.shelfLifeMonths || getShelfLifeMonths(pName, cat)

  // Manufacturing date resolution
  let mfg = item.mfgDate || item.manufacturingDate
  if (!mfg) {
    // Fallback to start of 2026 or item createdAt
    const d = item.createdAt ? new Date(item.createdAt) : new Date('2026-01-15')
    mfg = !isNaN(d.getTime()) ? d.toISOString().split('T')[0] : '2026-01-15'
  }

  // Expiry date resolution
  let exp = item.expiryDate || item.expDate
  if (!exp || exp === '—' || exp === 'N/A') {
    const mfgD = new Date(mfg)
    if (!isNaN(mfgD.getTime())) {
      const computedExp = new Date(mfgD)
      computedExp.setMonth(computedExp.getMonth() + shelfMonths)
      exp = computedExp.toISOString().split('T')[0]
    } else {
      exp = '2027-12-31'
    }
  }

  const expTime = new Date(exp).getTime()
  const nowTime = new Date().getTime()
  const daysRemaining = !isNaN(expTime) ? Math.round((expTime - nowTime) / (1000 * 3600 * 24)) : 365

  let status = 'Valid'
  let badgeColor = 'text-emerald-700 bg-emerald-50 border-emerald-200'
  if (daysRemaining <= 0) {
    status = 'Expired'
    badgeColor = 'text-rose-700 bg-rose-50 border-rose-200'
  } else if (daysRemaining <= 30) {
    status = 'Critical (<30d)'
    badgeColor = 'text-rose-700 bg-rose-50 border-rose-200'
  } else if (daysRemaining <= 90) {
    status = 'Near Expiry'
    badgeColor = 'text-amber-700 bg-amber-50 border-amber-200'
  }

  return {
    mfgDate: mfg,
    mfgFormatted: formatDisplayDate(mfg),
    expiryDate: exp,
    expiryFormatted: formatDisplayDate(exp),
    shelfLifeMonths: shelfMonths,
    eslText: `ESL: ${shelfMonths} Mos`,
    daysRemaining,
    status,
    badgeColor,
    fullBadge: `Exp: ${formatDisplayDate(exp)} • ESL: ${shelfMonths} Mos`,
  }
}

