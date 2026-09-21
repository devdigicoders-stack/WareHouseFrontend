import { useState, useMemo, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  X,
  Warehouse,
  Package,
  Layers,
  AlertTriangle,
  FlaskConical,
  CheckCircle2,
  Plus,
  SlidersHorizontal,
  Download,
  Eye,
  ArrowRight,
  Search,
  RotateCcw,
  ChevronDown,
  Check,
} from 'lucide-react'

// Custom Accessible Select Dropdown to eliminate Windows Chromium native black flicker
function CustomSelect({ value, onChange, options, placeholder = 'Select option...', className = '', zIndexClass = 'z-50' }) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedOption = options.find((opt) => opt.value === value)

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl px-3 py-2 text-left text-xs font-semibold text-slate-700 flex items-center justify-between gap-2 transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className={`absolute top-full left-0 mt-1.5 w-full bg-white border border-slate-200 rounded-xl shadow-xl py-1 ${zIndexClass} max-h-56 overflow-y-auto no-scrollbar animate-in fade-in zoom-in-95 duration-100`}>
          {options.map((opt) => {
            const isSelected = opt.value === value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value)
                  setIsOpen(false)
                }}
                className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between transition cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-50 text-indigo-700 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="truncate">
                  <div>{opt.label}</div>
                  {opt.sublabel && (
                    <div className="text-[10px] text-slate-400 font-normal">{opt.sublabel}</div>
                  )}
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0 ml-2" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function DamageRejection() {
  // Toast notifications state
  const [toastMessage, setToastMessage] = useState(null)
  const triggerToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Active filter tab
  const [activeTab, setActiveTab] = useState('ALL')

  // Filter toolbar state
  const [filterShade, setFilterShade] = useState('ALL')
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const perPage = 8

  // Modals state
  const [showReportModal, setShowReportModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(null)

  // 6 Dedicated Shades
  const SHADES = [
    { id: 'SH01', name: 'Shade 1: Grains & Bulk Pulses' },
    { id: 'SH02', name: 'Shade 2: Edible Oils & Liquids' },
    { id: 'SH03', name: 'Shade 3: Packaged Food & FMCG' },
    { id: 'SH04', name: 'Shade 4: Packaging Materials & Cartons' },
    { id: 'SH05', name: 'Shade 5: Chemicals & Hygiene' },
    { id: 'SH06', name: 'Shade 6: Spares & General Goods' },
  ]

  // Report Form State
  const [newCase, setNewCase] = useState({
    productName: 'Parle-G Glucose Biscuits (50g)',
    batchNo: 'BT-2026-FMCG-01',
    shadeId: 'SH03',
    row: 'R02',
    col: 'C04',
    damageType: 'Crushed Gatta Packaging',
    baseUnit: 'Pieces',
    packUnit: 'Gatta',
    unitsPerPack: 6,
    packsCount: 2,
    baseQty: 12,
    reason: 'Cartons crushed during forklift pallet stacking',
    status: 'Moved to Hold',
    reportedBy: 'Amit Patel (Storekeeper)',
    disposalAction: 'Segregate to Quarantine / Return to Vendor',
  })

  // Damage & Rejection Data
  const [damageCases, setDamageCases] = useState([
    {
      id: 1,
      refNo: 'DMG-2026-086',
      date: '18 Sep 2026',
      productName: 'Parle-G Glucose Biscuits (50g)',
      batchNo: 'BT-2026-FMCG-01',
      shadeId: 'SH03',
      location: 'SH03-R02-C04',
      damageType: 'Crushed Gatta Packaging',
      baseQty: 12,
      baseUnit: 'Pieces',
      packQty: 2,
      packUnit: 'Gatta',
      unitsPerPack: 6,
      reason: 'Forklift pallet impact crushed outer Gatta',
      status: 'Moved to Hold',
      reportedBy: 'Amit Patel',
    },
    {
      id: 2,
      refNo: 'REJ-2026-085',
      date: '17 Sep 2026',
      productName: 'Sharbati Wheat Grain (Grade A)',
      batchNo: 'BT-2026-GRN-09',
      shadeId: 'SH01',
      location: 'SH01-R02-C08',
      damageType: 'Lab QA Quality Rejection',
      baseQty: 100,
      baseUnit: 'Kg',
      packQty: 2,
      packUnit: 'Bags',
      unitsPerPack: 50,
      reason: 'Excess moisture content (15.2% vs allowed 12%)',
      status: 'Lab Rejected',
      reportedBy: 'Dr. Neha Verma (QC)',
    },
    {
      id: 3,
      refNo: 'DMG-2026-084',
      date: '16 Sep 2026',
      productName: 'Fortune Refined Sunflower Oil',
      batchNo: 'BT-2026-OIL-14',
      shadeId: 'SH02',
      location: 'SH02-R01-C02',
      damageType: 'Liquid Tin Leakage',
      baseQty: 15,
      baseUnit: 'Ltr',
      packQty: 1,
      packUnit: 'Tin',
      unitsPerPack: 15,
      reason: 'Punctured tin corner during transit unloading',
      status: 'Moved to Hold',
      reportedBy: 'Kavita Joshi',
    },
    {
      id: 4,
      refNo: 'REJ-2026-083',
      date: '15 Sep 2026',
      productName: 'Tata Premium Tea (500g)',
      batchNo: 'BT-2026-FMCG-11',
      shadeId: 'SH03',
      location: 'SH03-R01-C06',
      damageType: 'Moisture Contamination',
      baseQty: 24,
      baseUnit: 'Pieces',
      packQty: 1,
      packUnit: 'Gatta',
      unitsPerPack: 24,
      reason: 'Wet carton bottom identified during shelf check',
      status: 'Under Review',
      reportedBy: 'Sanjay Rawat',
    },
    {
      id: 5,
      refNo: 'DMG-2026-082',
      date: '14 Sep 2026',
      productName: 'Corrugated Shipping Cartons (5-Ply)',
      sku: 'PKG-BOX-01',
      batchNo: 'BT-2026-PKG-08',
      shadeId: 'SH04',
      location: 'SH04-R02-C02',
      damageType: 'Crushed Gatta Packaging',
      baseQty: 50,
      baseUnit: 'Cartons',
      packQty: 2,
      packUnit: 'Bundles',
      unitsPerPack: 25,
      reason: 'Strapping band over-tightening split edge walls',
      status: 'Moved to Hold',
      reportedBy: 'Amit Patel',
    },
  ])

  // Filtered Damage Cases
  const filteredCases = useMemo(() => {
    return damageCases.filter((item) => {
      // Tab filter
      if (activeTab === 'LAB' && !item.damageType.includes('Lab QA')) return false
      if (activeTab === 'PACK' && !item.damageType.includes('Gatta') && !item.damageType.includes('Packaging')) return false
      if (activeTab === 'LEAK' && !item.damageType.includes('Leakage') && !item.damageType.includes('Liquid')) return false

      // Dropdown filters
      if (filterShade !== 'ALL' && item.shadeId !== filterShade) return false
      if (filterStatus !== 'ALL' && item.status !== filterStatus) return false

      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase()
        return (
          item.refNo.toLowerCase().includes(q) ||
          item.productName.toLowerCase().includes(q) ||
          item.batchNo.toLowerCase().includes(q) ||
          item.location.toLowerCase().includes(q) ||
          item.damageType.toLowerCase().includes(q) ||
          item.reportedBy.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [damageCases, activeTab, filterShade, filterStatus, searchQuery])

  // Paginated Results
  const totalPages = Math.max(1, Math.ceil(filteredCases.length / perPage))
  const paginatedCases = filteredCases.slice((currentPage - 1) * perPage, currentPage * perPage)

  // Dynamic KPI Stats
  const stats = useMemo(() => {
    const total = damageCases.length
    const labRejections = damageCases.filter((i) => i.damageType.includes('Lab QA')).length
    const packagingDamage = damageCases.filter((i) => i.damageType.includes('Gatta') || i.damageType.includes('Packaging')).length
    const onHold = damageCases.filter((i) => i.status === 'Moved to Hold').length
    return { total, labRejections, packagingDamage, onHold }
  }, [damageCases])

  // Handle Save New Damage Case
  const handleSaveCase = (e) => {
    e.preventDefault()
    const computedBase = (Number(newCase.packsCount) || 0) * (Number(newCase.unitsPerPack) || 1)
    const refCode = newCase.damageType.includes('Lab QA')
      ? `REJ-2026-0${87 + damageCases.length}`
      : `DMG-2026-0${87 + damageCases.length}`
    const locCode = `${newCase.shadeId}-${newCase.row}-${newCase.col}`

    const newRecord = {
      id: Date.now(),
      refNo: refCode,
      date: 'Today, Just now',
      productName: newCase.productName,
      batchNo: newCase.batchNo,
      shadeId: newCase.shadeId,
      location: locCode,
      damageType: newCase.damageType,
      baseQty: computedBase,
      baseUnit: newCase.baseUnit,
      packQty: Number(newCase.packsCount) || 1,
      packUnit: newCase.packUnit,
      unitsPerPack: Number(newCase.unitsPerPack) || 1,
      reason: newCase.reason,
      status: newCase.status,
      reportedBy: newCase.reportedBy,
    }

    setDamageCases([newRecord, ...damageCases])
    setShowReportModal(false)
    triggerToast(`Logged case ${refCode} and quarantined ${computedBase} ${newRecord.baseUnit}.`)
  }

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      '#',
      'Case Ref',
      'Date',
      'Product Name',
      'Batch No',
      'Storage Location',
      'Damage Type',
      'Base Qty',
      'Base Unit',
      'Pack Qty',
      'Pack Unit',
      'Root Cause',
      'Status',
      'Reported By',
    ]

    const rows = filteredCases.map((row, idx) => [
      idx + 1,
      row.refNo,
      `"${row.date}"`,
      `"${row.productName}"`,
      row.batchNo,
      row.location,
      `"${row.damageType}"`,
      row.baseQty,
      row.baseUnit,
      row.packQty,
      `"${row.packUnit}"`,
      `"${row.reason}"`,
      row.status,
      `"${row.reportedBy}"`,
    ])

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'Damage_Rejection_Log.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    triggerToast('Damage and rejection log exported to CSV.')
  }

  // Dropdown Options
  const shadeOptions = [
    { value: 'ALL', label: 'All 6 Dedicated Shades' },
    ...SHADES.map((s) => ({ value: s.id, label: s.name })),
  ]

  const statusOptions = [
    { value: 'ALL', label: 'All Quarantine Statuses' },
    { value: 'Moved to Hold', label: 'Moved to Hold Stock' },
    { value: 'Lab Rejected', label: 'Lab Rejected Batches' },
    { value: 'Under Review', label: 'Under Review' },
  ]

  return (
    <div className="space-y-5 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-bounce border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header Bar */}
      {/* Page Header Bar */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shadow-xs shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">Damage &amp; Rejection Management</h1>
              <span className="text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200/60 px-2.5 py-0.5 rounded-full shrink-0">
                Incident &amp; Quarantine Desk
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1 max-w-2xl">
              Log damaged cartons, failed quality test rejections, and quarantine compromised commodities across 6 shades.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">
          <Link
            to="/hold-stock"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition shrink-0"
          >
            <span>View Hold Stock</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </Link>

          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition shrink-0 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setShowReportModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Report Damage / Rejection</span>
          </button>
        </div>
      </div>

      {/* 4 Dynamic KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Cases Logged */}
        <button
          type="button"
          onClick={() => {
            setActiveTab('ALL')
            setFilterStatus('ALL')
            setCurrentPage(1)
          }}
          className={`text-left bg-white rounded-2xl p-4.5 shadow-2xs border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
            activeTab === 'ALL' && filterStatus === 'ALL'
              ? 'border-slate-800 ring-2 ring-slate-400/20 shadow-sm bg-slate-50/40'
              : 'border-slate-200/90 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center shrink-0">
              <Package className="w-4.5 h-4.5" />
            </div>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 truncate">
              All Shades
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none">
                {stats.total}
              </span>
              <span className="text-xs font-bold text-slate-500">Incident Cases</span>
            </div>
            <div className="text-xs font-bold text-slate-800 mt-2 truncate">
              Total Cases Logged
            </div>
            <div className="text-[11px] text-slate-500 font-medium mt-0.5 truncate">
              Across all 6 facility shades
            </div>
          </div>
        </button>

        {/* Card 2: Lab QA Rejections */}
        <button
          type="button"
          onClick={() => {
            setActiveTab(activeTab === 'LAB' ? 'ALL' : 'LAB')
            setCurrentPage(1)
          }}
          className={`text-left bg-white rounded-2xl p-4.5 shadow-2xs border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
            activeTab === 'LAB'
              ? 'border-rose-500 ring-2 ring-rose-500/20 shadow-sm bg-rose-50/15'
              : 'border-slate-200/90 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-100/80 text-rose-600 flex items-center justify-center shrink-0">
              <FlaskConical className="w-4.5 h-4.5" />
            </div>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200/80 truncate">
              QA Rejection
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-rose-600 tracking-tight leading-none">
                {stats.labRejections}
              </span>
              <span className="text-xs font-bold text-slate-500">Batches</span>
            </div>
            <div className="text-xs font-bold text-slate-800 mt-2 truncate">
              Lab QA Rejections
            </div>
            <div className="text-[11px] text-rose-600 font-semibold mt-0.5 truncate">
              Failed lab quality standards
            </div>
          </div>
        </button>

        {/* Card 3: Packaging / Carton Damage */}
        <button
          type="button"
          onClick={() => {
            setActiveTab(activeTab === 'PACK' ? 'ALL' : 'PACK')
            setCurrentPage(1)
          }}
          className={`text-left bg-white rounded-2xl p-4.5 shadow-2xs border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
            activeTab === 'PACK'
              ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-sm bg-amber-50/15'
              : 'border-slate-200/90 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100/80 text-amber-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4.5 h-4.5" />
            </div>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/80 truncate">
              Packaging
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-amber-600 tracking-tight leading-none">
                {stats.packagingDamage}
              </span>
              <span className="text-xs font-bold text-slate-500">Cases</span>
            </div>
            <div className="text-xs font-bold text-slate-800 mt-2 truncate">
              Packaging &amp; Carton Damage
            </div>
            <div className="text-[11px] text-amber-600 font-semibold mt-0.5 truncate">
              Crushed boxes or transit tears
            </div>
          </div>
        </button>

        {/* Card 4: Quarantined in Hold */}
        <button
          type="button"
          onClick={() => {
            setFilterStatus(filterStatus === 'Moved to Hold' ? 'ALL' : 'Moved to Hold')
            setCurrentPage(1)
          }}
          className={`text-left bg-white rounded-2xl p-4.5 shadow-2xs border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
            filterStatus === 'Moved to Hold'
              ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-sm bg-indigo-50/15'
              : 'border-slate-200/90 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100/80 text-indigo-600 flex items-center justify-center shrink-0">
              <Layers className="w-4.5 h-4.5" />
            </div>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/80 truncate">
              Quarantined
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-indigo-600 tracking-tight leading-none">
                {stats.onHold}
              </span>
              <span className="text-xs font-bold text-slate-500">Segregated</span>
            </div>
            <div className="text-xs font-bold text-slate-800 mt-2 truncate">
              Quarantined in Hold
            </div>
            <div className="text-[11px] text-indigo-600 font-semibold mt-0.5 truncate">
              Locked from outward gate
            </div>
          </div>
        </button>
      </div>

      {/* Damage Cases Master Card */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
        {/* Table Filter Toolbar */}
        <div className="p-5 border-b border-slate-100 space-y-4">
          {/* Top Line: Category Tabs & Count / Reset */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('ALL')
                  setCurrentPage(1)
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                  activeTab === 'ALL'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Incidents ({damageCases.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('LAB')
                  setCurrentPage(1)
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                  activeTab === 'LAB'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Lab Rejections ({stats.labRejections})
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('PACK')
                  setCurrentPage(1)
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                  activeTab === 'PACK'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Packaging Damage ({stats.packagingDamage})
              </button>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs bg-rose-50 text-rose-700 font-bold px-3 py-1 rounded-full border border-rose-200/60">
                {filteredCases.length} Incidents Found
              </span>
              {(searchQuery || filterShade !== 'ALL' || filterStatus !== 'ALL' || activeTab !== 'ALL') && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('ALL')
                    setFilterShade('ALL')
                    setFilterStatus('ALL')
                    setSearchQuery('')
                    setCurrentPage(1)
                    triggerToast('Filters reset to default.')
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-semibold transition cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3 text-slate-400" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>

          {/* Main Keyword Search Bar */}
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              placeholder="Search case ref (DMG-...), product name, batch number, storage location, or auditor..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 rounded-full cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1.5">
                Storage Shade Zone
              </label>
              <CustomSelect
                value={filterShade}
                onChange={(val) => {
                  setFilterShade(val)
                  setCurrentPage(1)
                }}
                options={shadeOptions}
                placeholder="All 6 Dedicated Shades"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1.5">
                Quarantine / Disposition Status
              </label>
              <CustomSelect
                value={filterStatus}
                onChange={(val) => {
                  setFilterStatus(val)
                  setCurrentPage(1)
                }}
                options={statusOptions}
                placeholder="All Quarantine Statuses"
              />
            </div>
          </div>
        </div>

        {/* Damage Cases Table */}
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4 min-w-[130px]">Case Ref &amp; Date</th>
                <th className="py-3 px-4 min-w-[190px]">Product &amp; Batch</th>
                <th className="py-3 px-4 min-w-[130px]">Storage Location</th>
                <th className="py-3 px-4 min-w-[150px]">Damage Classification</th>
                <th className="py-3 px-4 min-w-[120px] text-right">Base Units Loss</th>
                <th className="py-3 px-4 min-w-[120px] text-right">Packaging Eqv</th>
                <th className="py-3 px-4 min-w-[160px]">Root Cause &amp; Reporter</th>
                <th className="py-3 px-4 min-w-[110px] text-center">Status</th>
                <th className="py-3 px-4 text-center w-20">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedCases.length === 0 ? (
                <tr>
                  <td colSpan="10" className="py-12 text-center text-slate-400">
                    <AlertTriangle className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600">No damage incident cases found</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Try changing active filters or search terms.</p>
                  </td>
                </tr>
              ) : (
                paginatedCases.map((row, idx) => (
                  <tr key={row.id} className="hover:bg-rose-50/20 transition">
                    <td className="py-3.5 px-4 text-center text-slate-400 font-bold">
                      {(currentPage - 1) * perPage + idx + 1}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-slate-900 block">{row.refNo}</span>
                      <span className="text-[10px] text-slate-400">{row.date}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{row.productName}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{row.batchNo}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200/60 text-[11px]">
                        {row.location}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          row.damageType.includes('Lab QA')
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : row.damageType.includes('Leakage')
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {row.damageType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="font-mono font-black text-rose-700 text-xs">
                        {row.baseQty.toLocaleString()}
                      </span>
                      <span className="text-[11px] text-slate-500 ml-1">{row.baseUnit}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="font-bold text-slate-800">{row.packQty} {row.packUnit}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800 truncate max-w-[150px]" title={row.reason}>
                        {row.reason}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">By: {row.reportedBy}</div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          row.status === 'Moved to Hold'
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            : row.status === 'Lab Rejected'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => setShowDetailsModal(row)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
                        title="View Incident Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Footer */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Showing <span className="font-semibold text-slate-800">{filteredCases.length === 0 ? 0 : (currentPage - 1) * perPage + 1}</span> to{' '}
            <span className="font-semibold text-slate-800">{Math.min(currentPage * perPage, filteredCases.length)}</span> of{' '}
            <span className="font-semibold text-slate-800">{filteredCases.length}</span> results
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Previous
            </button>
            <span className="px-3 py-1.5 text-slate-700 font-bold">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* MODAL 1: REPORT DAMAGE / REJECTION */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Report Damage / Rejection Incident</h3>
                  <p className="text-[11px] text-slate-500">Record damaged packaging or failed quality test for quarantine.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCase} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={newCase.productName}
                    onChange={(e) => setNewCase({ ...newCase, productName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Batch Number *</label>
                  <input
                    type="text"
                    required
                    value={newCase.batchNo}
                    onChange={(e) => setNewCase({ ...newCase, batchNo: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Storage Shade</label>
                  <CustomSelect
                    value={newCase.shadeId}
                    onChange={(val) => setNewCase({ ...newCase, shadeId: val })}
                    options={SHADES.map((s) => ({ value: s.id, label: s.name }))}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Row</label>
                  <input
                    type="text"
                    value={newCase.row}
                    onChange={(e) => setNewCase({ ...newCase, row: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Column</label>
                  <input
                    type="text"
                    value={newCase.col}
                    onChange={(e) => setNewCase({ ...newCase, col: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Damage Classification</label>
                  <CustomSelect
                    value={newCase.damageType}
                    onChange={(val) => setNewCase({ ...newCase, damageType: val })}
                    options={[
                      { value: 'Crushed Gatta Packaging', label: 'Crushed Packaging / Gatta' },
                      { value: 'Lab QA Quality Rejection', label: 'Lab QA Quality Rejection' },
                      { value: 'Liquid Tin Leakage', label: 'Liquid Tin / Can Leakage' },
                      { value: 'Moisture Contamination', label: 'Moisture Contamination' },
                      { value: 'Past Expiry Date', label: 'Past Expiry Date' },
                    ]}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Quarantine Action</label>
                  <CustomSelect
                    value={newCase.status}
                    onChange={(val) => setNewCase({ ...newCase, status: val })}
                    options={[
                      { value: 'Moved to Hold', label: 'Move to Hold Stock' },
                      { value: 'Lab Rejected', label: 'Mark Lab Rejected' },
                      { value: 'Under Review', label: 'Mark Under Review' },
                    ]}
                  />
                </div>
              </div>

              {/* Quantity Breakdown */}
              <div className="p-3.5 bg-rose-50/50 border border-rose-100 rounded-xl space-y-2">
                <span className="text-[11px] font-bold text-rose-950">Compromised Quantity Calculation</span>
                <div className="grid grid-cols-3 gap-2.5 text-xs">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">Packs Count</label>
                    <input
                      type="number"
                      value={newCase.packsCount}
                      onChange={(e) => setNewCase({ ...newCase, packsCount: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-mono font-bold text-slate-800 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">Units / Pack</label>
                    <input
                      type="number"
                      value={newCase.unitsPerPack}
                      onChange={(e) => setNewCase({ ...newCase, unitsPerPack: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-mono font-bold text-slate-800 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">Base Unit</label>
                    <input
                      type="text"
                      value={newCase.baseUnit}
                      onChange={(e) => setNewCase({ ...newCase, baseUnit: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-bold text-slate-800 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-rose-900 font-bold pt-1 border-t border-rose-100">
                  <span>Total Base Units Quarantined:</span>
                  <span className="font-mono text-xs">
                    {((Number(newCase.packsCount) || 0) * (Number(newCase.unitsPerPack) || 1)).toLocaleString()} {newCase.baseUnit}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Root Cause / Investigation Notes</label>
                <textarea
                  rows={2}
                  value={newCase.reason}
                  onChange={(e) => setNewCase({ ...newCase, reason: e.target.value })}
                  placeholder="Describe damage reason or lab defect..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-sm transition cursor-pointer"
                >
                  Quarantine Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CASE DETAILS */}
      {showDetailsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Incident Case Record</h3>
                  <p className="text-[10px] font-mono text-slate-400">{showDetailsModal.refNo}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDetailsModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Product</p>
                  <p className="font-bold text-slate-900 text-sm">{showDetailsModal.productName}</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">Batch: {showDetailsModal.batchNo}</p>
                </div>
                <span className="font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-1 rounded text-xs">
                  {showDetailsModal.location}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-rose-50/50 rounded-xl border border-rose-100">
                  <span className="text-[10px] text-rose-800 font-bold block uppercase">Classification</span>
                  <span className="font-bold text-rose-900 text-xs">{showDetailsModal.damageType}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Quarantine Status</span>
                  <span className="font-bold text-slate-800 text-xs">{showDetailsModal.status}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Base Units Quarantined:</span>
                  <span className="font-mono font-black text-rose-700 text-sm">{showDetailsModal.baseQty.toLocaleString()} {showDetailsModal.baseUnit}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-600">
                  <span>Carton / Pack Count:</span>
                  <span className="font-bold">{showDetailsModal.packQty} {showDetailsModal.packUnit}</span>
                </div>
                <div className="flex justify-between text-xs pt-1 border-t border-slate-200/60">
                  <span className="text-slate-500">Reported By:</span>
                  <span className="font-semibold text-slate-800">{showDetailsModal.reportedBy}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Root Cause Description</span>
                <p className="text-slate-700 text-xs">{showDetailsModal.reason}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setShowDetailsModal(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
