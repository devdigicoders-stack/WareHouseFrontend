import { useState, useMemo, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  X,
  Warehouse,
  Package,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Plus,
  SlidersHorizontal,
  Download,
  Eye,
  RotateCcw,
  Search,
  ChevronDown,
  Check,
  TrendingUp,
  TrendingDown,
  FileSpreadsheet,
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

export default function StockAdjustment() {
  // Toast notifications state
  const [toastMessage, setToastMessage] = useState(null)
  const triggerToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Filter toolbar state
  const [filterType, setFilterType] = useState('ALL')
  const [filterShade, setFilterShade] = useState('ALL')
  const [filterReason, setFilterReason] = useState('ALL')
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const perPage = 8

  // Modals state
  const [showNewModal, setShowNewModal] = useState(false)
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

  // Form State
  const [newAdjustment, setNewAdjustment] = useState({
    productName: 'Parle-G Glucose Biscuits (50g)',
    sku: 'FMCG-BIS-01',
    batchNo: 'BT-2026-FMCG-01',
    shadeId: 'SH03',
    row: 'R02',
    col: 'C04',
    baseUnit: 'Pieces',
    packUnit: 'Gatta',
    unitsPerPack: 6,
    packsCount: 2,
    adjustmentType: 'Increase',
    baseQtyChange: 12,
    adjustedBy: 'Rajesh Sharma (Warehouse Manager)',
    reason: 'Physical Stock Audit Variance',
    status: 'Approved',
    remarks: 'Reconciliation after monthly physical stock count.',
  })

  // Adjustment History Data
  const [adjustmentList, setAdjustmentList] = useState([
    {
      id: 1,
      dateTime: '18 Sep 2026, 11:30',
      refNo: 'ADJ-2026-0146',
      productName: 'Parle-G Glucose Biscuits (50g)',
      sku: 'FMCG-BIS-01',
      batchNo: 'BT-2026-FMCG-01',
      shadeId: 'SH03',
      location: 'SH03-R02-C04',
      baseUnit: 'Pieces',
      packUnit: 'Gatta',
      unitsPerPack: 6,
      adjustmentType: 'Increase',
      baseQtyChange: '+12',
      packsChange: '+2 Gatta',
      adjustedBy: 'Rajesh Sharma',
      reason: 'Physical Stock Audit Variance',
      status: 'Approved',
      remarks: 'Found 2 extra sealed cartons during shelf audit.',
    },
    {
      id: 2,
      dateTime: '17 Sep 2026, 16:45',
      refNo: 'ADJ-2026-0145',
      productName: 'Good Day Butter Cookies (75g)',
      sku: 'FMCG-BIS-02',
      batchNo: 'BT-2026-FMCG-02',
      shadeId: 'SH03',
      location: 'SH03-R02-C05',
      baseUnit: 'Pieces',
      packUnit: 'Gatta',
      unitsPerPack: 12,
      adjustmentType: 'Decrease',
      baseQtyChange: '-24',
      packsChange: '-2 Gatta',
      adjustedBy: 'Amit Patel',
      reason: 'Gatta Carton Crushed in Stacking',
      status: 'Approved',
      remarks: '2 cartons crushed by forklift pallet maneuvering; quarantined.',
    },
    {
      id: 3,
      dateTime: '16 Sep 2026, 14:15',
      refNo: 'ADJ-2026-0144',
      productName: 'Fortune Refined Sunflower Oil',
      sku: 'OIL-SUN-01',
      batchNo: 'BT-2026-OIL-14',
      shadeId: 'SH02',
      location: 'SH02-R01-C02',
      baseUnit: 'Ltr',
      packUnit: 'Tins (15L)',
      unitsPerPack: 15,
      adjustmentType: 'Decrease',
      baseQtyChange: '-15',
      packsChange: '-1 Tin',
      adjustedBy: 'Dr. Neha Verma (QC)',
      reason: 'Lab Testing Sampling Draw',
      status: 'Approved',
      remarks: 'Draw 1 Tin for mandatory FSSAI periodic compliance test.',
    },
    {
      id: 4,
      dateTime: '15 Sep 2026, 09:20',
      refNo: 'ADJ-2026-0143',
      productName: 'Sharbati Wheat Grain (Grade A)',
      sku: 'GRN-WHT-01',
      batchNo: 'BT-2026-GRN-09',
      shadeId: 'SH01',
      location: 'SH01-R02-C08',
      baseUnit: 'Kg',
      packUnit: 'Bags (50kg)',
      unitsPerPack: 50,
      adjustmentType: 'Increase',
      baseQtyChange: '+50',
      packsChange: '+1 Bag',
      adjustedBy: 'Vikram Singh',
      reason: 'Inward Count Discrepancy',
      status: 'Approved',
      remarks: 'Unaccounted bag from GRN-2026-0812 cross-verified with gate tally.',
    },
    {
      id: 5,
      dateTime: '14 Sep 2026, 18:00',
      refNo: 'ADJ-2026-0142',
      productName: 'Industrial Disinfectant Concentrate',
      sku: 'CHM-DIS-01',
      batchNo: 'BT-2026-CHM-03',
      shadeId: 'SH05',
      location: 'SH05-R01-C03',
      baseUnit: 'Ltr',
      packUnit: 'Carboys (20L)',
      unitsPerPack: 20,
      adjustmentType: 'Decrease',
      baseQtyChange: '-20',
      packsChange: '-1 Carboy',
      adjustedBy: 'Sanjay Rawat',
      reason: 'Internal Facility Hygiene Use',
      status: 'Approved',
      remarks: 'Dispatched 1 carboy for weekly deep sanitation across all 6 shades.',
    },
    {
      id: 6,
      dateTime: '13 Sep 2026, 11:10',
      refNo: 'ADJ-2026-0141',
      productName: 'Tata Premium Tea (500g)',
      sku: 'FMCG-TEA-01',
      batchNo: 'BT-2026-FMCG-11',
      shadeId: 'SH03',
      location: 'SH03-R01-C06',
      baseUnit: 'Pieces',
      packUnit: 'Gatta',
      unitsPerPack: 24,
      adjustmentType: 'Increase',
      baseQtyChange: '+24',
      packsChange: '+1 Gatta',
      adjustedBy: 'Rajesh Sharma',
      reason: 'Physical Stock Audit Variance',
      status: 'Approved',
      remarks: 'Found intact pack during inventory realignment.',
    },
  ])

  // Filtered Adjustments
  const filteredAdjustments = useMemo(() => {
    return adjustmentList.filter((item) => {
      if (filterType !== 'ALL' && item.adjustmentType !== filterType) return false
      if (filterShade !== 'ALL' && item.shadeId !== filterShade) return false
      if (filterReason !== 'ALL' && item.reason !== filterReason) return false
      if (filterStatus !== 'ALL' && item.status !== filterStatus) return false

      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase()
        return (
          item.refNo.toLowerCase().includes(q) ||
          item.productName.toLowerCase().includes(q) ||
          item.sku.toLowerCase().includes(q) ||
          item.batchNo.toLowerCase().includes(q) ||
          item.location.toLowerCase().includes(q) ||
          item.adjustedBy.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [adjustmentList, filterType, filterShade, filterReason, filterStatus, searchQuery])

  // Paginated Results
  const totalPages = Math.max(1, Math.ceil(filteredAdjustments.length / perPage))
  const paginatedAdjustments = filteredAdjustments.slice((currentPage - 1) * perPage, currentPage * perPage)

  // Dynamic KPI Stats
  const stats = useMemo(() => {
    const total = adjustmentList.length
    const increaseCount = adjustmentList.filter((i) => i.adjustmentType === 'Increase').length
    const decreaseCount = adjustmentList.filter((i) => i.adjustmentType === 'Decrease').length
    const approvedCount = adjustmentList.filter((i) => i.status === 'Approved').length
    return { total, increaseCount, decreaseCount, approvedCount }
  }, [adjustmentList])

  // Handle Save New Adjustment
  const handleSaveAdjustment = (e) => {
    e.preventDefault()
    const computedBase = (Number(newAdjustment.packsCount) || 0) * (Number(newAdjustment.unitsPerPack) || 1)
    const deltaSign = newAdjustment.adjustmentType === 'Increase' ? '+' : '-'
    const refCode = `ADJ-2026-0${147 + adjustmentList.length}`
    const locCode = `${newAdjustment.shadeId}-${newAdjustment.row}-${newAdjustment.col}`

    const newRecord = {
      id: Date.now(),
      dateTime: 'Today, Just now',
      refNo: refCode,
      productName: newAdjustment.productName,
      sku: newAdjustment.sku,
      batchNo: newAdjustment.batchNo,
      shadeId: newAdjustment.shadeId,
      location: locCode,
      baseUnit: newAdjustment.baseUnit,
      packUnit: newAdjustment.packUnit,
      unitsPerPack: Number(newAdjustment.unitsPerPack) || 1,
      adjustmentType: newAdjustment.adjustmentType,
      baseQtyChange: `${deltaSign}${computedBase}`,
      packsChange: `${deltaSign}${newAdjustment.packsCount} ${newAdjustment.packUnit}`,
      adjustedBy: newAdjustment.adjustedBy,
      reason: newAdjustment.reason,
      status: 'Approved',
      remarks: newAdjustment.remarks,
    }

    setAdjustmentList([newRecord, ...adjustmentList])
    setShowNewModal(false)
    triggerToast(`Adjustment ${refCode} logged: ${deltaSign}${computedBase} ${newRecord.baseUnit}.`)
  }

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      '#',
      'Ref No',
      'Date Time',
      'Product Name',
      'SKU',
      'Batch No',
      'Location',
      'Adjustment Type',
      'Base Qty Delta',
      'Base Unit',
      'Packaging Delta',
      'Reason',
      'Adjusted By',
      'Status',
      'Remarks',
    ]

    const rows = filteredAdjustments.map((row, idx) => [
      idx + 1,
      row.refNo,
      `"${row.dateTime}"`,
      `"${row.productName}"`,
      row.sku,
      row.batchNo,
      row.location,
      row.adjustmentType,
      row.baseQtyChange,
      row.baseUnit,
      `"${row.packsChange}"`,
      `"${row.reason}"`,
      `"${row.adjustedBy}"`,
      row.status,
      `"${row.remarks}"`,
    ])

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'Stock_Adjustments_Log.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    triggerToast('Stock adjustments log exported to CSV.')
  }

  // Filter Dropdown Options
  const typeOptions = [
    { value: 'ALL', label: 'All Adjustment Types' },
    { value: 'Increase', label: 'Positive Variances (+)' },
    { value: 'Decrease', label: 'Deductions / Damage (-)' },
  ]

  const shadeOptions = [
    { value: 'ALL', label: 'All 6 Dedicated Shades' },
    ...SHADES.map((s) => ({ value: s.id, label: s.name })),
  ]

  const reasonOptions = [
    { value: 'ALL', label: 'All Adjustment Reasons' },
    { value: 'Physical Stock Audit Variance', label: 'Physical Audit Variance' },
    { value: 'Gatta Carton Crushed in Stacking', label: 'Crushed Packaging / Damage' },
    { value: 'Lab Testing Sampling Draw', label: 'Lab Sampling Draw' },
    { value: 'Inward Count Discrepancy', label: 'Inward Count Discrepancy' },
    { value: 'Internal Facility Hygiene Use', label: 'Facility Sanitation Use' },
  ]

  const statusOptions = [
    { value: 'ALL', label: 'All Approval Status' },
    { value: 'Approved', label: 'Approved Reconciliation' },
    { value: 'Pending', label: 'Pending Review' },
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
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs shrink-0">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Stock Adjustment &amp; Audit Log</h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Record inventory reconciliations, audit variations, sampling draws, and write-offs in base product units.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setShowNewModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Adjustment</span>
          </button>
        </div>
      </div>

      {/* 4 Dynamic KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Total Adjustments</p>
            <h3 className="text-xl font-bold text-slate-800 leading-tight mt-0.5">
              {stats.total} Logs
            </h3>
            <p className="text-[11px] text-indigo-600 font-medium">Reconciled this month</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Positive Additions (+)</p>
            <h3 className="text-xl font-bold text-slate-800 leading-tight mt-0.5">
              {stats.increaseCount} Instances
            </h3>
            <p className="text-[11px] text-emerald-600 font-medium">Found stock / count variance</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Deductions / Damage (-)</p>
            <h3 className="text-xl font-bold text-slate-800 leading-tight mt-0.5">
              {stats.decreaseCount} Instances
            </h3>
            <p className="text-[11px] text-rose-600 font-medium">Lab draws &amp; damaged packs</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Audit Status</p>
            <h3 className="text-xl font-bold text-slate-800 leading-tight mt-0.5">
              {stats.approvedCount} Approved
            </h3>
            <p className="text-[11px] text-blue-600 font-medium">100% verified by manager</p>
          </div>
        </div>
      </div>

      {/* Adjustments Master Card */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
        {/* Filter Section Header & Inputs */}
        <div className="p-5 border-b border-slate-100 space-y-4">
          {/* Top Line: Section Title & Results Count */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <SlidersHorizontal className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-800">Adjustment Audit Register</h2>
                <p className="text-[11px] text-slate-500">Filter adjustments by reconciliation type, shade location, reason, or approval status.</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs bg-indigo-50 text-indigo-700 font-bold px-3 py-1 rounded-full border border-indigo-200/60">
                {filteredAdjustments.length} Records Found
              </span>
              {(searchQuery || filterType !== 'ALL' || filterShade !== 'ALL' || filterReason !== 'ALL' || filterStatus !== 'ALL') && (
                <button
                  type="button"
                  onClick={() => {
                    setFilterType('ALL')
                    setFilterShade('ALL')
                    setFilterReason('ALL')
                    setFilterStatus('ALL')
                    setSearchQuery('')
                    setCurrentPage(1)
                    triggerToast('Filters reset to default.')
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-semibold transition cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3 text-slate-400" />
                  <span>Reset Filters</span>
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
              placeholder="Search by reference number (ADJ-2026-...), product name, batch, storage bin, or auditor..."
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

          {/* 4 Filter Dropdowns in Spacious Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1.5">
                Adjustment Type
              </label>
              <CustomSelect
                value={filterType}
                onChange={(val) => {
                  setFilterType(val)
                  setCurrentPage(1)
                }}
                options={typeOptions}
                placeholder="All Adjustment Types"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1.5">
                Storage Shade
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
                Adjustment Reason
              </label>
              <CustomSelect
                value={filterReason}
                onChange={(val) => {
                  setFilterReason(val)
                  setCurrentPage(1)
                }}
                options={reasonOptions}
                placeholder="All Adjustment Reasons"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1.5">
                Approval Status
              </label>
              <CustomSelect
                value={filterStatus}
                onChange={(val) => {
                  setFilterStatus(val)
                  setCurrentPage(1)
                }}
                options={statusOptions}
                placeholder="All Approval Status"
              />
            </div>
          </div>
        </div>

        {/* Adjustments Table */}
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4 min-w-[130px]">Ref &amp; Timestamp</th>
                <th className="py-3 px-4 min-w-[190px]">Product &amp; SKU</th>
                <th className="py-3 px-4 min-w-[130px]">Storage Location</th>
                <th className="py-3 px-4 min-w-[110px] text-center">Adjustment</th>
                <th className="py-3 px-4 min-w-[130px] text-right">Base Qty Delta</th>
                <th className="py-3 px-4 min-w-[130px] text-right">Packaging Delta</th>
                <th className="py-3 px-4 min-w-[170px]">Reason &amp; Auditor</th>
                <th className="py-3 px-4 min-w-[100px] text-center">Status</th>
                <th className="py-3 px-4 text-center w-20">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedAdjustments.length === 0 ? (
                <tr>
                  <td colSpan="10" className="py-12 text-center text-slate-400">
                    <SlidersHorizontal className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600">No adjustment records found</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Try changing your search query or filters.</p>
                  </td>
                </tr>
              ) : (
                paginatedAdjustments.map((row, idx) => (
                  <tr key={row.id} className="hover:bg-indigo-50/20 transition">
                    <td className="py-3.5 px-4 text-center text-slate-400 font-bold">
                      {(currentPage - 1) * perPage + idx + 1}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-slate-900 block">{row.refNo}</span>
                      <span className="text-[10px] text-slate-400">{row.dateTime}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{row.productName}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{row.sku} • {row.batchNo}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200/60 text-[11px]">
                        {row.location}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          row.adjustmentType === 'Increase'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {row.adjustmentType === 'Increase' ? '+ Increase' : '- Decrease'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span
                        className={`font-mono font-black text-xs ${
                          row.adjustmentType === 'Increase' ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {row.baseQtyChange}
                      </span>
                      <span className="text-[11px] text-slate-500 ml-1">{row.baseUnit}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="font-bold text-slate-800">{row.packsChange}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800 truncate max-w-[160px]" title={row.reason}>
                        {row.reason}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">By: {row.adjustedBy}</div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => setShowDetailsModal(row)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
                        title="View Audit Record"
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
            Showing <span className="font-semibold text-slate-800">{filteredAdjustments.length === 0 ? 0 : (currentPage - 1) * perPage + 1}</span> to{' '}
            <span className="font-semibold text-slate-800">{Math.min(currentPage * perPage, filteredAdjustments.length)}</span> of{' '}
            <span className="font-semibold text-slate-800">{filteredAdjustments.length}</span> results
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

      {/* MODAL 1: NEW ADJUSTMENT */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">New Stock Adjustment</h3>
                  <p className="text-[11px] text-slate-500">Record positive count variance or deduction write-off.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAdjustment} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Adjustment Type *</label>
                  <CustomSelect
                    value={newAdjustment.adjustmentType}
                    onChange={(val) => setNewAdjustment({ ...newAdjustment, adjustmentType: val })}
                    options={[
                      { value: 'Increase', label: 'Positive Increase (+)' },
                      { value: 'Decrease', label: 'Deduction / Write-off (-)' },
                    ]}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Target Shade</label>
                  <CustomSelect
                    value={newAdjustment.shadeId}
                    onChange={(val) => setNewAdjustment({ ...newAdjustment, shadeId: val })}
                    options={SHADES.map((s) => ({ value: s.id, label: s.name }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={newAdjustment.productName}
                    onChange={(e) => setNewAdjustment({ ...newAdjustment, productName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">SKU Code</label>
                  <input
                    type="text"
                    value={newAdjustment.sku}
                    onChange={(e) => setNewAdjustment({ ...newAdjustment, sku: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Batch No</label>
                  <input
                    type="text"
                    value={newAdjustment.batchNo}
                    onChange={(e) => setNewAdjustment({ ...newAdjustment, batchNo: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Row</label>
                  <input
                    type="text"
                    value={newAdjustment.row}
                    onChange={(e) => setNewAdjustment({ ...newAdjustment, row: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Column</label>
                  <input
                    type="text"
                    value={newAdjustment.col}
                    onChange={(e) => setNewAdjustment({ ...newAdjustment, col: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Packaging & Delta Calculator */}
              <div className="p-3.5 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-2">
                <span className="text-[11px] font-bold text-indigo-950">Adjustment Delta Calculation</span>
                <div className="grid grid-cols-3 gap-2.5 text-xs">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">Packs Count</label>
                    <input
                      type="number"
                      value={newAdjustment.packsCount}
                      onChange={(e) => setNewAdjustment({ ...newAdjustment, packsCount: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-mono font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">Units / Pack</label>
                    <input
                      type="number"
                      value={newAdjustment.unitsPerPack}
                      onChange={(e) => setNewAdjustment({ ...newAdjustment, unitsPerPack: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-mono font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">Base Unit</label>
                    <input
                      type="text"
                      value={newAdjustment.baseUnit}
                      onChange={(e) => setNewAdjustment({ ...newAdjustment, baseUnit: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-indigo-900 font-bold pt-1 border-t border-indigo-100">
                  <span>Net Delta Effect:</span>
                  <span className="font-mono text-xs">
                    {newAdjustment.adjustmentType === 'Increase' ? '+' : '-'}
                    {((Number(newAdjustment.packsCount) || 0) * (Number(newAdjustment.unitsPerPack) || 1)).toLocaleString()} {newAdjustment.baseUnit}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Reason for Adjustment *</label>
                <CustomSelect
                  value={newAdjustment.reason}
                  onChange={(val) => setNewAdjustment({ ...newAdjustment, reason: val })}
                  options={[
                    { value: 'Physical Stock Audit Variance', label: 'Physical Stock Audit Variance' },
                    { value: 'Gatta Carton Crushed in Stacking', label: 'Gatta Carton Crushed in Stacking' },
                    { value: 'Lab Testing Sampling Draw', label: 'Lab Testing Sampling Draw' },
                    { value: 'Minor Tin Seam Leakage', label: 'Minor Tin Seam Leakage' },
                    { value: 'Inward Count Discrepancy', label: 'Inward Count Discrepancy' },
                    { value: 'Internal Facility Hygiene Use', label: 'Internal Facility Hygiene Use' },
                    { value: 'Expiry Date Write-Off', label: 'Expiry Date Write-Off' },
                  ]}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Auditor Remarks</label>
                <textarea
                  rows={2}
                  value={newAdjustment.remarks}
                  onChange={(e) => setNewAdjustment({ ...newAdjustment, remarks: e.target.value })}
                  placeholder="Provide reconciliation notes..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-sm transition cursor-pointer"
                >
                  Save Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADJUSTMENT DETAILS */}
      {showDetailsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Adjustment Record</h3>
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
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">{showDetailsModal.sku} • {showDetailsModal.batchNo}</p>
                </div>
                <span className="font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-1 rounded text-xs">
                  {showDetailsModal.location}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Base Unit Delta</span>
                  <span className={`font-mono font-black text-sm ${showDetailsModal.adjustmentType === 'Increase' ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {showDetailsModal.baseQtyChange} {showDetailsModal.baseUnit}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Packaging Delta</span>
                  <span className="font-bold text-slate-800 text-sm">{showDetailsModal.packsChange}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Reason:</span>
                  <span className="font-bold text-slate-800">{showDetailsModal.reason}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Adjusted By:</span>
                  <span className="text-slate-700 font-medium">{showDetailsModal.adjustedBy}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Logged At:</span>
                  <span className="font-mono text-slate-600">{showDetailsModal.dateTime}</span>
                </div>
              </div>

              {showDetailsModal.remarks && (
                <div className="p-3 bg-indigo-50/40 rounded-xl border border-indigo-100/80">
                  <span className="text-[10px] text-indigo-900 font-bold uppercase block mb-1">Auditor Remarks</span>
                  <p className="text-slate-700 text-xs">{showDetailsModal.remarks}</p>
                </div>
              )}
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
