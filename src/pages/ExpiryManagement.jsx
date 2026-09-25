import { useState, useMemo, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  X,
  Warehouse,
  Package,
  Layers,
  AlertTriangle,
  AlertOctagon,
  Clock,
  Calendar,
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
  Printer,
  ShieldAlert,
  Flame,
  Archive,
  RefreshCw,
} from 'lucide-react'
import { printSpecificElement } from '../utils/printHelper'

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

export default function ExpiryManagement() {
  // Toast notifications state
  const [toastMessage, setToastMessage] = useState(null)
  const triggerToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Active filter tab: ALL, EXPIRED, CRITICAL_30, NEAR_60, NEAR_90, HEALTHY
  const [activeTab, setActiveTab] = useState('ALL')

  // Filter toolbar state
  const [filterCategory, setFilterCategory] = useState('ALL')
  const [filterAction, setFilterAction] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  // Modals
  const [showLogDisposalModal, setShowLogDisposalModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(null)

  // Disposal form state
  const [formBatchId, setFormBatchId] = useState('')
  const [formActionType, setFormActionType] = useState('Write-Off & Disposal')
  const [formReason, setFormReason] = useState('')
  const [formApprovedBy, setFormApprovedBy] = useState('Kiran Maddheshiya (Store Manager)')
  const [formDisposalLocation, setFormDisposalLocation] = useState('Hazardous Waste Yard - Section D')

  // Mock Commercial Warehouse Stock Expiry Registry
  const [expiryList, setExpiryList] = useState([
    {
      id: 1,
      batchNo: 'BTH-2024-098',
      sku: 'SKU-MED-009',
      productName: 'First Aid Antiseptic Liquid (500ml)',
      category: 'Medical & Healthcare',
      shade: 'Shade 6 (Textiles & Medical)',
      location: 'SH6-R01-B04',
      mfgDate: '2024-03-10',
      expDate: '2026-09-10',
      daysRemaining: -15, // Expired
      stockQty: 85,
      packQty: 85,
      unit: 'Bottles',
      packUnit: 'Pcs',
      unitCost: 120,
      totalRiskValue: 10200,
      status: 'Expired',
      recommendedAction: 'Immediate Quarantine & Write-Off',
      supplier: 'Apex Pharma Supplies Ltd',
      quarantined: true,
    },
    {
      id: 2,
      batchNo: 'BTH-2025-112',
      sku: 'SKU-CHM-044',
      productName: 'Fast-Dry Polyurethane Resin Primer (20L Drum)',
      category: 'Chemicals & Paints',
      shade: 'Shade 4 (Chemical & Hazardous)',
      location: 'SH4-R03-B02',
      mfgDate: '2025-01-15',
      expDate: '2026-10-05',
      daysRemaining: 10, // Critical (<30 days)
      stockQty: 24,
      packQty: 24,
      unit: 'Drums',
      packUnit: 'Drums',
      unitCost: 3200,
      totalRiskValue: 76800,
      status: 'Critical (< 30 Days)',
      recommendedAction: 'Priority Clearance Sale / Transfer',
      supplier: 'Kansai Industrial Coatings',
      quarantined: false,
    },
    {
      id: 3,
      batchNo: 'BTH-2025-240',
      sku: 'SKU-FOOD-019',
      productName: 'Organic Wheat Atta Chakki Fresh (10kg)',
      category: 'Food & Grains',
      shade: 'Shade 2 (Food & Grains)',
      location: 'SH2-R05-B01',
      mfgDate: '2025-04-01',
      expDate: '2026-10-20',
      daysRemaining: 25, // Critical (<30 days)
      stockQty: 180,
      packQty: 180,
      unit: 'Bags',
      packUnit: 'Bags',
      unitCost: 380,
      totalRiskValue: 68400,
      status: 'Critical (< 30 Days)',
      recommendedAction: 'Immediate Dispatch to Retail Distribution',
      supplier: 'Kisan Agro Products Ltd',
      quarantined: false,
    },
    {
      id: 4,
      batchNo: 'BTH-2025-305',
      sku: 'SKU-OIL-023',
      productName: 'Cold Pressed Sunflower Oil (15L Tin)',
      category: 'Food & Grains',
      shade: 'Shade 2 (Food & Grains)',
      location: 'SH2-R02-B08',
      mfgDate: '2025-05-10',
      expDate: '2026-11-15',
      daysRemaining: 51, // Near Expiry (31-60 days)
      stockQty: 90,
      packQty: 90,
      unit: 'Tins',
      packUnit: 'Tins',
      unitCost: 1950,
      totalRiskValue: 175500,
      status: 'Expiring Soon (31-60 Days)',
      recommendedAction: 'FEFO Queue Promotion (First-Expiry)',
      supplier: 'National Agro Mills',
      quarantined: false,
    },
    {
      id: 5,
      batchNo: 'BTH-2025-410',
      sku: 'SKU-ADH-005',
      productName: 'High Strength Epoxy Adhesive Part A+B',
      category: 'Industrial Supplies',
      shade: 'Shade 3 (Industrial Supplies)',
      location: 'SH3-R04-B03',
      mfgDate: '2025-06-20',
      expDate: '2026-12-10',
      daysRemaining: 76, // Near Expiry (61-90 days)
      stockQty: 320,
      packQty: 32,
      unit: 'Pcs',
      packUnit: 'Boxes (10 pcs)',
      unitCost: 450,
      totalRiskValue: 144000,
      status: 'Monitor (61-90 Days)',
      recommendedAction: 'Prioritize for Outward Orders',
      supplier: 'Pidilite Industrial Pro',
      quarantined: false,
    },
    {
      id: 6,
      batchNo: 'BTH-2026-003',
      sku: 'SKU-CHM-089',
      productName: 'Industrial Solvent & Degreaser Drum (50L)',
      category: 'Chemicals & Paints',
      shade: 'Shade 4 (Chemical & Hazardous)',
      location: 'SH4-R01-B05',
      mfgDate: '2026-01-10',
      expDate: '2026-09-18',
      daysRemaining: -7, // Expired
      stockQty: 12,
      packQty: 12,
      unit: 'Drums',
      packUnit: 'Drums',
      unitCost: 5500,
      totalRiskValue: 66000,
      status: 'Expired',
      recommendedAction: 'Immediate Quarantine & Hazardous Disposal',
      supplier: 'Bharat Petroleum Chemicals',
      quarantined: true,
    },
    {
      id: 7,
      batchNo: 'BTH-2026-104',
      sku: 'SKU-ELEC-012',
      productName: 'Lithium Battery Pack 12V 100Ah Storage Cell',
      category: 'Electronics & Spares',
      shade: 'Shade 5 (Electronics & Spares)',
      location: 'SH5-R02-B06',
      mfgDate: '2025-08-01',
      expDate: '2027-08-01',
      daysRemaining: 310, // Healthy
      stockQty: 40,
      packQty: 40,
      unit: 'Units',
      packUnit: 'Units',
      unitCost: 14500,
      totalRiskValue: 580000,
      status: 'Healthy (> 90 Days)',
      recommendedAction: 'Standard Storage & Routine Cycle Count',
      supplier: 'Exide Industrial Solutions',
      quarantined: false,
    },
  ])

  // Summary Metrics calculations
  const stats = useMemo(() => {
    const expiredCount = expiryList.filter((x) => x.daysRemaining <= 0).length
    const criticalCount = expiryList.filter((x) => x.daysRemaining > 0 && x.daysRemaining <= 30).length
    const near60Count = expiryList.filter((x) => x.daysRemaining > 30 && x.daysRemaining <= 60).length
    const monitor90Count = expiryList.filter((x) => x.daysRemaining > 60 && x.daysRemaining <= 90).length
    const healthyCount = expiryList.filter((x) => x.daysRemaining > 90).length

    const atRiskValue = expiryList
      .filter((x) => x.daysRemaining <= 60)
      .reduce((acc, curr) => acc + curr.totalRiskValue, 0)

    const totalExpiredValue = expiryList
      .filter((x) => x.daysRemaining <= 0)
      .reduce((acc, curr) => acc + curr.totalRiskValue, 0)

    return {
      expiredCount,
      criticalCount,
      near60Count,
      monitor90Count,
      healthyCount,
      atRiskValue,
      totalExpiredValue,
    }
  }, [expiryList])

  // Filtered List
  const filteredList = useMemo(() => {
    return expiryList.filter((item) => {
      // Tab filter
      if (activeTab === 'EXPIRED' && item.daysRemaining > 0) return false
      if (activeTab === 'CRITICAL_30' && (item.daysRemaining <= 0 || item.daysRemaining > 30)) return false
      if (activeTab === 'NEAR_60' && (item.daysRemaining <= 30 || item.daysRemaining > 60)) return false
      if (activeTab === 'MONITOR_90' && (item.daysRemaining <= 60 || item.daysRemaining > 90)) return false
      if (activeTab === 'HEALTHY' && item.daysRemaining <= 90) return false

      // Category filter
      if (filterCategory !== 'ALL' && item.category !== filterCategory) return false

      // Status/Action filter
      if (filterAction === 'QUARANTINED' && !item.quarantined) return false
      if (filterAction === 'AVAILABLE' && item.quarantined) return false

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchSku = item.sku.toLowerCase().includes(q)
        const matchBatch = item.batchNo.toLowerCase().includes(q)
        const matchName = item.productName.toLowerCase().includes(q)
        const matchLoc = item.location.toLowerCase().includes(q)
        if (!matchSku && !matchBatch && !matchName && !matchLoc) return false
      }

      return true
    })
  }, [expiryList, activeTab, filterCategory, filterAction, searchQuery])

  // Quarantining toggle
  const handleToggleQuarantine = (id) => {
    setExpiryList((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextState = !item.quarantined
          triggerToast(
            nextState
              ? `Batch ${item.batchNo} is now LOCKED in Quarantine!`
              : `Batch ${item.batchNo} moved back to active stock.`
          )
          return { ...item, quarantined: nextState }
        }
        return item
      })
    )
  }

  // Handle Disposal Write-off Submission
  const handleDisposeSubmit = (e) => {
    e.preventDefault()
    if (!formBatchId) {
      triggerToast('Please select a batch for write-off / disposal.')
      return
    }

    const selectedItem = expiryList.find((x) => x.id === parseInt(formBatchId))
    if (!selectedItem) return

    setExpiryList((prev) => prev.filter((x) => x.id !== parseInt(formBatchId)))
    setShowLogDisposalModal(false)
    setFormBatchId('')
    setFormReason('')
    triggerToast(`Write-Off complete: Batch ${selectedItem.batchNo} (${selectedItem.productName}) marked for disposal.`)
  }

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Batch No',
      'SKU',
      'Product Name',
      'Category',
      'Shade',
      'Bin Location',
      'Mfg Date',
      'Expiry Date',
      'Days Remaining',
      'Status',
      'Quantity',
      'Unit',
      'Unit Cost (INR)',
      'Total Value (INR)',
      'Quarantined',
      'Supplier',
    ]

    const rows = filteredList.map((x) => [
      x.batchNo,
      x.sku,
      `"${x.productName}"`,
      `"${x.category}"`,
      `"${x.shade}"`,
      x.location,
      x.mfgDate,
      x.expDate,
      x.daysRemaining,
      `"${x.status}"`,
      x.stockQty,
      x.unit,
      x.unitCost,
      x.totalRiskValue,
      x.quarantined ? 'YES' : 'NO',
      `"${x.supplier}"`,
    ])

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `Expiry_Risk_Report_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    triggerToast('Expiry audit register exported successfully as CSV.')
  }

  // Dropdown Categories
  const categoryOptions = [
    { value: 'ALL', label: 'All Categories' },
    { value: 'Food & Grains', label: 'Food & Grains' },
    { value: 'Chemicals & Paints', label: 'Chemicals & Paints' },
    { value: 'Medical & Healthcare', label: 'Medical & Healthcare' },
    { value: 'Industrial Supplies', label: 'Industrial Supplies' },
    { value: 'Electronics & Spares', label: 'Electronics & Spares' },
  ]

  const actionOptions = [
    { value: 'ALL', label: 'All Quarantine Status' },
    { value: 'QUARANTINED', label: 'Quarantined / Locked Only' },
    { value: 'AVAILABLE', label: 'Active In-Bin Only' },
  ]

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Toast notification banner */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-800 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200 text-xs font-semibold">
          <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-white p-0.5 rounded-lg"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-slate-200/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Expiry & Near-Expiry Management
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                FEFO & Risk Control
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Monitor shelf-life, prevent commercial stock loss, enforce quarantine, and manage disposal write-offs.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={() => printSpecificElement('#printable-expiry-report-table', 'Stock Expiry Risk Audit Register')}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print Audit Report</span>
          </button>
          <button
            type="button"
            onClick={() => setShowLogDisposalModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition cursor-pointer"
          >
            <Flame className="w-4 h-4" />
            <span>Write-Off / Disposal</span>
          </button>
        </div>
      </div>

      {/* 4 Dynamic Risk Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Expired Stock */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-rose-200/80 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Expired Batches</p>
            <h3 className="text-2xl font-black text-rose-600 leading-tight mt-0.5">
              {stats.expiredCount}
            </h3>
            <p className="text-[11px] text-rose-600 font-medium">
              Loss Value: ₹ {stats.totalExpiredValue.toLocaleString()}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
            <AlertOctagon className="w-5 h-5" />
          </div>
        </div>

        {/* Critical Expiry (< 30 Days) */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-amber-200/80 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Critical (&lt; 30 Days)</p>
            <h3 className="text-2xl font-black text-amber-600 leading-tight mt-0.5">
              {stats.criticalCount}
            </h3>
            <p className="text-[11px] text-amber-700 font-medium">Priority clearance required</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        {/* Expiring Soon (31 - 60 Days) */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Expiring (31-60 Days)</p>
            <h3 className="text-2xl font-black text-slate-800 leading-tight mt-0.5">
              {stats.near60Count}
            </h3>
            <p className="text-[11px] text-indigo-600 font-medium">FEFO dispatch queue</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
            <RefreshCw className="w-5 h-5" />
          </div>
        </div>

        {/* Total At-Risk Inventory Value */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Total At-Risk Stock Value</p>
            <h3 className="text-2xl font-black text-slate-900 leading-tight mt-0.5 font-mono">
              ₹ {stats.atRiskValue.toLocaleString()}
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">Batches expiring in &le; 60 days</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-700 border border-slate-200 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Full-Width Expiry Monitoring Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
        {/* Filter Tabs & Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 space-y-3.5">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-semibold overflow-x-auto max-w-full">
              <button
                type="button"
                onClick={() => setActiveTab('ALL')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer whitespace-nowrap ${
                  activeTab === 'ALL'
                    ? 'bg-white text-indigo-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Batches ({expiryList.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('EXPIRED')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer whitespace-nowrap ${
                  activeTab === 'EXPIRED'
                    ? 'bg-white text-rose-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Expired ({stats.expiredCount})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('CRITICAL_30')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer whitespace-nowrap ${
                  activeTab === 'CRITICAL_30'
                    ? 'bg-white text-amber-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                &lt; 30 Days ({stats.criticalCount})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('NEAR_60')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer whitespace-nowrap ${
                  activeTab === 'NEAR_60'
                    ? 'bg-white text-indigo-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                31 - 60 Days ({stats.near60Count})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('MONITOR_90')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer whitespace-nowrap ${
                  activeTab === 'MONITOR_90'
                    ? 'bg-white text-slate-800 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                61 - 90 Days ({stats.monitor90Count})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('HEALTHY')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer whitespace-nowrap ${
                  activeTab === 'HEALTHY'
                    ? 'bg-white text-emerald-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Healthy ({stats.healthyCount})
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setActiveTab('ALL')
                setFilterCategory('ALL')
                setFilterAction('ALL')
                setSearchQuery('')
              }}
              className="text-xs font-semibold text-slate-500 hover:text-indigo-600 flex items-center gap-1.5 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>

          {/* Search and Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5 items-center text-xs">
            {/* Search Input */}
            <div className="lg:col-span-5 relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search SKU, Product Name, Batch Number, Bin Code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
              />
            </div>

            {/* Category Filter */}
            <div className="lg:col-span-4">
              <CustomSelect
                value={filterCategory}
                onChange={setFilterCategory}
                options={categoryOptions}
                zIndexClass="z-30"
              />
            </div>

            {/* Action / Quarantine Status Filter */}
            <div className="lg:col-span-3">
              <CustomSelect
                value={filterAction}
                onChange={setFilterAction}
                options={actionOptions}
                zIndexClass="z-30"
              />
            </div>
          </div>
        </div>

        {/* 100% Full-Width Expiry Table */}
        <div id="printable-expiry-report-table" className="overflow-x-auto w-full printable-area">
          <table className="w-full text-left text-xs divide-y divide-slate-200">
            <thead className="bg-slate-50/80 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4 min-w-[125px]">Batch / SKU</th>
                <th className="py-3.5 px-4 min-w-[220px]">Product Description</th>
                <th className="py-3.5 px-4 min-w-[140px]">Bin Location</th>
                <th className="py-3.5 px-4 min-w-[110px]">Expiry Date</th>
                <th className="py-3.5 px-4 text-center min-w-[120px]">Shelf-Life Status</th>
                <th className="py-3.5 px-4 text-right min-w-[120px]">Stock Quantity</th>
                <th className="py-3.5 px-4 text-right min-w-[120px]">Risk Value</th>
                <th className="py-3.5 px-4 text-center min-w-[110px]">Quarantine</th>
                <th className="py-3.5 px-4 text-center w-28">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-slate-400 text-xs">
                    <Clock className="w-8 h-8 mx-auto mb-2 text-slate-300 stroke-1" />
                    No stock batches matched the selected expiry filter criteria.
                  </td>
                </tr>
              ) : (
                filteredList.map((row) => {
                  const isExpired = row.daysRemaining <= 0
                  const isCritical = row.daysRemaining > 0 && row.daysRemaining <= 30
                  const isNear60 = row.daysRemaining > 30 && row.daysRemaining <= 60

                  return (
                    <tr
                      key={row.id}
                      className={`hover:bg-slate-50/80 transition ${
                        row.quarantined ? 'bg-rose-50/30' : ''
                      }`}
                    >
                      {/* Batch & SKU */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-slate-900">{row.batchNo}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{row.sku}</div>
                      </td>

                      {/* Product Name & Category */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 line-clamp-1">{row.productName}</div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span>{row.category}</span>
                          <span>•</span>
                          <span className="text-slate-400">{row.supplier}</span>
                        </div>
                      </td>

                      {/* Bin Location */}
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-800 rounded font-mono text-[11px] font-bold border border-slate-200">
                          {row.location}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">{row.shade}</div>
                      </td>

                      {/* Expiry Date */}
                      <td className="py-3.5 px-4 font-mono font-semibold">
                        <span className={isExpired ? 'text-rose-700 font-bold' : isCritical ? 'text-amber-700 font-bold' : 'text-slate-800'}>
                          {row.expDate}
                        </span>
                        <div className="text-[10px] text-slate-400">Mfg: {row.mfgDate}</div>
                      </td>

                      {/* Shelf Life Status Badge */}
                      <td className="py-3.5 px-4 text-center">
                        {isExpired ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                            <AlertOctagon className="w-3 h-3" />
                            <span>EXPIRED ({Math.abs(row.daysRemaining)}d ago)</span>
                          </span>
                        ) : isCritical ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            <AlertTriangle className="w-3 h-3" />
                            <span>CRITICAL ({row.daysRemaining}d left)</span>
                          </span>
                        ) : isNear60 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            <Clock className="w-3 h-3" />
                            <span>FEFO PRIORITY ({row.daysRemaining}d)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>HEALTHY ({row.daysRemaining}d)</span>
                          </span>
                        )}
                      </td>

                      {/* Stock Quantity */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="font-mono font-bold text-slate-900">
                          {row.stockQty.toLocaleString()} {row.unit}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {row.packQty} {row.packUnit}
                        </div>
                      </td>

                      {/* Total Risk Value */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold">
                        <span className={isExpired ? 'text-rose-600' : isCritical ? 'text-amber-700' : 'text-slate-800'}>
                          ₹ {row.totalRiskValue.toLocaleString()}
                        </span>
                        <div className="text-[10px] text-slate-400 font-normal">₹ {row.unitCost} / {row.unit}</div>
                      </td>

                      {/* Quarantine Switch */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleQuarantine(row.id)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer inline-flex items-center gap-1 ${
                            row.quarantined
                              ? 'bg-rose-600 text-white border-rose-700 shadow-xs'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                          }`}
                        >
                          <ShieldAlert className="w-3 h-3" />
                          <span>{row.quarantined ? 'LOCKED' : 'Active'}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setShowDetailModal(row)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 transition cursor-pointer"
                            title="View Expiry Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowDetailModal(row)
                              setTimeout(() => {
                                printSpecificElement('#printable-expiry-batch-slip', `Expiry Audit - ${row.batchNo}`)
                              }, 300)
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 transition cursor-pointer"
                            title="Print Batch Expiry Slip"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info summary */}
        <div className="p-4 bg-slate-50/80 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium">
          <div>
            Showing <strong>{filteredList.length}</strong> of <strong>{expiryList.length}</strong> inventory batches
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Expired: {stats.expiredCount}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Critical: {stats.criticalCount}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Healthy: {stats.healthyCount}
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL 1: BATCH EXPIRY DETAIL & AUDIT SLIP                 */}
      {/* ========================================================= */}
      {showDetailModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-4 sm:p-6 max-h-[90dvh] overflow-y-auto no-scrollbar shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center font-bold">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Batch Expiry &amp; Risk Clearance Slip</h3>
                  <p className="text-[11px] text-slate-500 font-mono">BATCH: {showDetailModal.batchNo}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDetailModal(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Printable Slip Layout */}
            <div id="printable-expiry-batch-slip" className="printable-area border border-slate-300 rounded-xl p-5 bg-white space-y-4 text-xs">
              <div className="flex items-start justify-between border-b pb-3 border-slate-200">
                <div>
                  <h2 className="text-sm font-black text-slate-900 uppercase">CENTRAL WAREHOUSE OPERATIONS</h2>
                  <p className="text-[11px] text-slate-500">Stock Expiry Risk &amp; Quarantine Audit Voucher</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">Voucher: EXP-AUD-{showDetailModal.batchNo}</p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${
                      showDetailModal.daysRemaining <= 0
                        ? 'bg-rose-100 text-rose-800 border-rose-300'
                        : showDetailModal.daysRemaining <= 30
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    }`}
                  >
                    {showDetailModal.status}
                  </span>
                </div>
              </div>

              {/* 2-Column Summary */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-[11px]">
                <div>
                  <span className="text-slate-500 block">Product:</span>
                  <strong className="text-slate-900">{showDetailModal.productName}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">SKU Code:</span>
                  <strong className="font-mono text-slate-900">{showDetailModal.sku}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Category:</span>
                  <span className="text-slate-800 font-semibold">{showDetailModal.category}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Allocated Location:</span>
                  <span className="font-mono font-bold text-indigo-700">{showDetailModal.location}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Manufacturing Date:</span>
                  <span className="font-mono text-slate-700">{showDetailModal.mfgDate}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Expiry Date:</span>
                  <span className="font-mono font-bold text-rose-700">{showDetailModal.expDate}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Quantity in Bin:</span>
                  <span className="font-mono font-bold text-slate-900">{showDetailModal.stockQty} {showDetailModal.unit}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Financial Exposure (Risk):</span>
                  <span className="font-mono font-bold text-rose-700">₹ {showDetailModal.totalRiskValue.toLocaleString()}</span>
                </div>
              </div>

              {/* Recommended Action Box */}
              <div className="p-3 bg-indigo-50/80 rounded-xl border border-indigo-100">
                <span className="text-[10px] font-bold uppercase text-indigo-900 block">Warehouse System Recommendation:</span>
                <p className="text-xs font-semibold text-indigo-950 mt-0.5">{showDetailModal.recommendedAction}</p>
              </div>

              {/* Signatures */}
              <div className="pt-4 grid grid-cols-2 gap-4 text-center text-xs border-t border-slate-200">
                <div className="border-t border-dashed border-slate-300 pt-2">
                  <p className="font-bold text-slate-800">Quality &amp; Lab Lead</p>
                  <p className="text-[10px] text-slate-400">Audited &amp; Categorized</p>
                </div>
                <div className="border-t border-dashed border-slate-300 pt-2">
                  <p className="font-bold text-slate-800">Warehouse Manager</p>
                  <p className="text-[10px] text-slate-400">Authorized Disposition</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowDetailModal(null)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => printSpecificElement('#printable-expiry-batch-slip', `Expiry Audit - ${showDetailModal.batchNo}`)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Slip</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: WRITE-OFF & DISPOSAL AUTHORIZATION MODAL          */}
      {/* ========================================================= */}
      {showLogDisposalModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-4 sm:p-6 max-h-[90dvh] overflow-y-auto no-scrollbar shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Authorize Stock Write-Off / Disposal</h3>
                  <p className="text-[11px] text-slate-500">Record scrap / hazardous discard for expired lots</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowLogDisposalModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleDisposeSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Expired / Critical Batch *</label>
                <select
                  value={formBatchId}
                  onChange={(e) => setFormBatchId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 focus:bg-white"
                  required
                >
                  <option value="">-- Choose Batch to Scrap / Write Off --</option>
                  {expiryList.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.batchNo} • {item.productName} ({item.stockQty} {item.unit}) • {item.status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Disposal Action Type</label>
                  <select
                    value={formActionType}
                    onChange={(e) => setFormActionType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800"
                  >
                    <option value="Write-Off & Disposal">Write-Off &amp; Physical Scrapping</option>
                    <option value="Return to Vendor (RTV)">Return to Vendor (RTV)</option>
                    <option value="Hazardous Chemical Incineration">Hazardous Chemical Incineration</option>
                    <option value="Discount Clearance Sale">Heavy Discount Clearance Sale</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Authorized Location</label>
                  <input
                    type="text"
                    value={formDisposalLocation}
                    onChange={(e) => setFormDisposalLocation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Authorizer Sign-Off</label>
                <input
                  type="text"
                  value={formApprovedBy}
                  onChange={(e) => setFormApprovedBy(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Disposal Reason / Incident Notes *</label>
                <textarea
                  rows="3"
                  placeholder="e.g. Chemical expired beyond usable shelf life, container degradation observed during QA inspection."
                  value={formReason}
                  onChange={(e) => setFormReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 focus:bg-white"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowLogDisposalModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
                >
                  Confirm &amp; Write Off
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
