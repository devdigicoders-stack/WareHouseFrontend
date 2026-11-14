/**
 * Warehouse Dual-Unit Management Helper
 * Handles conversion and presentation for:
 * 1. Maximum Unit (Inward Bulk Pack, e.g. Carton, Box, Bag)
 * 2. Minimum Unit (Outward Base Piece, e.g. Packet, Piece, Kg)
 */

export const MAXIMUM_UNIT_OPTIONS = [
  { value: 'Carton', label: 'Carton (Gatta / Master Box)' },
  { value: 'Box', label: 'Box / Case' },
  { value: 'Bag', label: 'Bag / Bori (25kg - 50kg)' },
  { value: 'Crate', label: 'Crate' },
  { value: 'Tin', label: 'Tin / Can (15L)' },
  { value: 'Drum', label: 'Drum / Barrel (20L - 200L)' },
  { value: 'Bundle', label: 'Bundle / Pack' },
  { value: 'Pallet', label: 'Pallet' },
]

export const MINIMUM_UNIT_OPTIONS = [
  { value: 'Packet', label: 'Packet / Pouch (Pkt)' },
  { value: 'Piece', label: 'Piece / Item (Pcs)' },
  { value: 'Bottle', label: 'Bottle' },
  { value: 'Can', label: 'Can' },
  { value: 'Kg', label: 'Kilograms (Kg)' },
  { value: 'Litre', label: 'Litres (Ltr)' },
  { value: 'Nos', label: 'Numbers (Nos)' },
  { value: 'Gram', label: 'Grams (g)' },
]

/**
 * Calculates total minimum base units from full maximum packs and loose pieces.
 * Example: 1 Carton (10 Packets/carton) + 5 Loose = 15 Packets
 */
export function calculateBaseQty(fullPacks = 0, looseQty = 0, packSize = 1) {
  const packs = Math.max(0, Number(fullPacks) || 0)
  const loose = Math.max(0, Number(looseQty) || 0)
  const ratio = Math.max(1, Number(packSize) || 1)
  return packs * ratio + loose
}

/**
 * Splits total minimum base units into full maximum packs and loose units.
 * Example: 15 Packets (ratio 10) => 1 Carton + 5 Loose Packets
 */
export function splitBaseQty(totalBaseQty = 0, packSize = 1) {
  const total = Math.max(0, Number(totalBaseQty) || 0)
  const ratio = Math.max(1, Number(packSize) || 1)
  if (ratio <= 1) {
    return { fullPacks: total, looseQty: 0, ratio }
  }
  return {
    fullPacks: Math.floor(total / ratio),
    looseQty: total % ratio,
    ratio,
  }
}

/**
 * Formats quantity with full dual-unit breakdown.
 * Example:
 * formatDualUnits(15, 10, 'Carton', 'Packet')
 * => { totalQty: 15, fullPacks: 1, looseQty: 5, breakdownText: "1 Carton + 5 Loose Packets", summaryText: "15 Packets (1 Carton + 5 Loose Packets)" }
 */
export function formatDualUnits(totalQty = 0, packSize = 1, maxUnit = 'Carton', minUnit = 'Packet') {
  const total = Math.max(0, Number(totalQty) || 0)
  const ratio = Math.max(1, Number(packSize) || 1)
  const max = maxUnit || 'Carton'
  const min = minUnit || 'Packet'

  if (ratio <= 1) {
    return {
      fullPacks: total,
      looseQty: 0,
      totalQty: total,
      ratio: 1,
      maxUnit: max,
      minUnit: min,
      breakdownText: `${total} ${min}`,
      summaryText: `${total} ${min}`,
      badgeText: `${total} ${min}`,
    }
  }

  const fullPacks = Math.floor(total / ratio)
  const looseQty = total % ratio

  const parts = []
  if (fullPacks > 0) {
    parts.push(`${fullPacks} ${max}${fullPacks > 1 ? 's' : ''}`)
  }
  if (looseQty > 0 || fullPacks === 0) {
    parts.push(`${looseQty} Loose ${min}${looseQty > 1 ? 's' : ''}`)
  }

  const breakdownText = parts.join(' + ')

  return {
    fullPacks,
    looseQty,
    totalQty: total,
    ratio,
    maxUnit: max,
    minUnit: min,
    breakdownText,
    summaryText: `${total} ${min} (${breakdownText})`,
    badgeText: breakdownText,
  }
}

