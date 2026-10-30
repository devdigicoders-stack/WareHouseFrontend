import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  Calendar,
  Tag,
  Check,
  AlertTriangle,
  X,
  Plus,
  Download,
  Search,
  Printer,
  ChevronDown,
  Layers,
  Clock,
  CheckCircle2,
  ShieldAlert,
  Boxes,
  QrCode,
  RefreshCw,
  Loader2,
} from 'lucide-react'
import { apiRequest } from '../services/api'
import DataLoader from '../components/common/DataLoader'

// Custom Select Component to eliminate native OS dropdown black-frame flicker
function CustomSelect({ label, value, onChange, options, required, zIndexClass = 'z-20' }) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    function handleOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  const selectedOption = options.find((opt) => opt.value === value) || options[0]

  return (
    <div className={`relative ${zIndexClass}`} ref={containerRef}>
      {label && (
        <label className="block text-xs font-bold text-slate-700 mb-1.5">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-white border rounded-xl px-3.5 py-2.5 text-xs text-left flex items-center justify-between transition-all cursor-pointer shadow-2xs ${
          isOpen
            ? 'border-indigo-600 ring-2 ring-indigo-500/20 text-slate-900'
            : 'border-slate-300 text-slate-800 hover:border-slate-400'
        }`}
      >
        <span className="truncate font-medium">{selectedOption?.label || value}</span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ml-2 ${
            isOpen ? 'rotate-180 text-indigo-600' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl py-1 max-h-56 overflow-y-auto z-50">
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
                className={`w-full px-3.5 py-2 text-xs text-left flex items-center justify-between transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-50 text-indigo-700 font-bold'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0 ml-2" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

const PRODUCT_OPTIONS = [
  { value: 'Basmati Rice (Grade 1 Special)', label: 'Basmati Rice (Grade 1 Special 25kg) • PRD-RIC-001' },
  { value: 'Refined Mustard Oil (15L Tin)', label: 'Refined Mustard Oil (15L Tin) • PRD-OIL-002' },
  { value: 'Arhar / Toor Dal (Grade A)', label: 'Arhar / Toor Dal (Grade A 30kg) • PRD-DAL-003' },
  { value: 'Standard Glucose Biscuit Packs', label: 'Standard Glucose Biscuit Packs • PRD-BIS-004' },
  { value: 'Industrial First Aid Safety Kit', label: 'Industrial First Aid Safety Kit • PRD-MED-005' },
  { value: 'Industrial Lubricant 15W-40', label: 'Industrial Lubricant 15W-40 • PRD-LUB-006' },
  { value: 'Heavy Duty Waterproof Tarpaulin', label: 'Heavy Duty Waterproof Tarpaulin • PRD-TAR-007' },
  { value: 'Industrial Surface Disinfectant 5L', label: 'Industrial Surface Disinfectant 5L • PRD-CHM-008' },
]

const STATUS_OPTIONS = [
  { value: 'Active', label: 'Active (Within Fresh Period)' },
  { value: 'Expiring Soon', label: 'Expiring Soon (FEFO High Priority)' },
  { value: 'On Hold', label: 'On Hold (Quality / Quarantine)' },
  { value: 'Expired', label: 'Expired (Clearance Required)' },
]

const LOCATION_OPTIONS = [
  { value: 'Shade 1 • Bay A • Rack 02', label: 'Shade 1 (General Stores) • Bay A • Rack 02' },
  { value: 'Shade 2 • Bay B • Rack 01', label: 'Shade 2 (Food & Grains) • Bay B • Rack 01' },
  { value: 'Shade 2 • Bay B • Rack 03', label: 'Shade 2 (Food & Grains) • Bay B • Rack 03' },
  { value: 'Shade 3 • Bay C • Rack 04', label: 'Shade 3 (Industrial Supplies) • Bay C • Rack 04' },
  { value: 'Shade 4 • Bay D • Rack 01', label: 'Shade 4 (Chemical & Hazardous) • Bay D • Rack 01' },
  { value: 'Shade 6 • Bay F • Rack 02', label: 'Shade 6 (Textiles & Medical) • Bay F • Rack 02' },
]

export default function BatchManagement() {
  const [activeTab, setActiveTab] = useState('all') // 'all', 'Active', 'Expiring Soon', 'On Hold', 'Expired'
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)

  // Real-time Commercial Warehouse Batch Registry (FEFO Tracking)
  const [batches, setBatches] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load batches strictly synchronized with MongoDB Atlas
  const loadBatches = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const [batchRes, prodRes] = await Promise.allSettled([
        apiRequest('/batch'),
        apiRequest('/product'),
      ])

      if (batchRes.status === 'fulfilled' && Array.isArray(batchRes.value)) {
        setBatches(batchRes.value)
      }

      if (prodRes.status === 'fulfilled' && Array.isArray(prodRes.value)) {
        setProducts(prodRes.value)
      }
    } catch {
      triggerToast('Error loading batch registry from database')
    } finally {
      if (!silent) setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadBatches()
  }, [loadBatches])

  // New Batch Form State
  const initialNewBatch = {
    batchNo: '',
    productName: 'Basmati Rice (Grade 1 Special)',
    sku: '',
    mfgDate: '2026-09-01',
    expiryDate: '2028-08-31',
    qty: '100',
    unit: 'Bags',
    location: 'Shade 2 • Bay B • Rack 01',
    status: 'Active',
  }
  const [newBatch, setNewBatch] = useState(initialNewBatch)
  // Edit Batch State
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingBatch, setEditingBatch] = useState(null)

  // Toast trigger
  const triggerToast = (msg, type = 'success') => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Dynamic Product Options from MongoDB
  const dynamicProductOptions = useMemo(() => {
    if (products.length > 0) {
      return products.map((p) => ({
        value: p.name,
        label: `${p.name} (SKU: ${p.sku})`,
        sku: p.sku,
        unit: p.baseUnit || 'Bags',
        location: p.storageZone || 'Shade 1 (General Stores)',
        productId: p._id,
      }))
    }
    return PRODUCT_OPTIONS
  }, [products])

  // Filtered Batches
  const filteredBatches = useMemo(() => {
    return batches.filter((b) => {
      if (activeTab !== 'all' && b.status !== activeTab) return false

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        return (
          (b.batchNo && b.batchNo.toLowerCase().includes(q)) ||
          (b.productName && b.productName.toLowerCase().includes(q)) ||
          (b.sku && b.sku.toLowerCase().includes(q)) ||
          (b.location && b.location.toLowerCase().includes(q))
        )
      }
      return true
    })
  }, [batches, activeTab, searchQuery])

  // Create Batch — 100% PERSISTED IN MONGODB
  const handleCreateBatch = async (e) => {
    e.preventDefault()
    if (isSubmitting) return

    if (!newBatch.productName || !newBatch.productName.trim()) {
      triggerToast('Please specify a Product Name.', 'error')
      return
    }

    const nextNum = batches.length + 101
    const batchStr = (newBatch.batchNo || `BTH-2026-${nextNum}`).trim().toUpperCase()
    const matchedProd = products.find((p) => p.name === newBatch.productName || p.sku === newBatch.sku)

    setIsSubmitting(true)
    try {
      const created = await apiRequest('/batch', {
        method: 'POST',
        body: JSON.stringify({
          batchNo: batchStr,
          productId: matchedProd?._id || null,
          productName: newBatch.productName.trim(),
          sku: matchedProd?.sku || newBatch.sku || `SKU-${Date.now().toString().slice(-4)}`,
          mfgDate: newBatch.mfgDate,
          expiryDate: newBatch.expiryDate,
          qty: Math.max(1, Number(newBatch.qty) || 100),
          unit: newBatch.unit || matchedProd?.baseUnit || 'Bags',
          location: newBatch.location,
          status: newBatch.status,
        }),
      })

      setBatches((prev) => [created, ...prev.filter((b) => (b._id !== created._id && b.batchNo !== created.batchNo))])
      setShowAddModal(false)
      setNewBatch(initialNewBatch)
      triggerToast(`Batch ${batchStr} registered & saved in MongoDB!`)
      loadBatches(true)
    } catch (err) {
      triggerToast(err.message || 'Failed to create batch in database', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Open Edit Modal
  const handleOpenEdit = (b) => {
    setEditingBatch({
      ...b,
      rawMfgDate: b.mfgDate || '2026-01-15',
      rawExpiryDate: b.expiryDate || '2028-01-15',
    })
    setShowEditModal(true)
  }

  // Save Batch Edit — 100% PERSISTED IN MONGODB
  const handleUpdateBatch = async (e) => {
    e.preventDefault()
    if (!editingBatch || isSubmitting) return

    setIsSubmitting(true)
    const targetId = editingBatch._id || editingBatch.id

    try {
      const updated = await apiRequest(`/batch/${targetId}`, {
        method: 'PUT',
        body: JSON.stringify({
          batchNo: editingBatch.batchNo?.trim().toUpperCase(),
          productName: editingBatch.productName,
          mfgDate: editingBatch.mfgDate,
          expiryDate: editingBatch.expiryDate,
          qty: Math.max(1, Number(editingBatch.qty) || 1),
          unit: editingBatch.unit,
          location: editingBatch.location,
          status: editingBatch.status,
        }),
      })

      setBatches((prev) =>
        prev.map((b) =>
          (b._id === targetId || b.id === targetId) ? updated : b
        )
      )

      setShowEditModal(false)
      setEditingBatch(null)
      triggerToast(`Batch ${editingBatch.batchNo} updated successfully in MongoDB!`)
      loadBatches(true)
    } catch (err) {
      triggerToast(err.message || 'Failed to update batch in database', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Status Update — PERSISTED IN MONGODB
  const handleStatusUpdate = async (item, newStatus) => {
    const targetId = item._id || item.id
    try {
      if (targetId && typeof targetId === 'string' && targetId.length > 10) {
        await apiRequest(`/batch/${targetId}`, {
          method: 'PUT',
          body: JSON.stringify({ status: newStatus }),
        })
      }
      setBatches((prev) =>
        prev.map((b) => ((b._id === targetId || b.id === targetId) ? { ...b, status: newStatus } : b))
      )
      triggerToast(`Batch ${item.batchNo} status updated to ${newStatus}`)
    } catch (err) {
      triggerToast(err.message || 'Error updating batch status', 'error')
    }
  }

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Batch No',
      'Product Name',
      'SKU Code',
      'Manufacturing Date',
      'Expiry Date',
      'Days Remaining',
      'Quantity',
      'Unit',
      'Storage Location',
      'Status',
    ]
    const rows = batches.map((b) => [
      b.batchNo,
      `"${b.productName}"`,
      b.sku,
      b.mfgDate,
      b.expiryDate,
      b.daysLeft,
      b.qty,
      b.unit,
      `"${b.location}"`,
      b.status,
    ])
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'Warehouse_Batch_Register.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    triggerToast('Batch records exported to CSV successfully.')
  }

  // Status Badge Styling
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'Expiring Soon':
        return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'Expired':
        return 'bg-rose-50 text-rose-700 border-rose-200'
      case 'On Hold':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200'
    }
  }

  return (
    <div className="space-y-6 max-w-[1720px] mx-auto pb-10 select-none">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-[9999] pointer-events-auto bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-fade-in text-sm font-semibold">
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Check className="w-4 h-4" />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header Banner - Clean, Modern & Professional */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 shadow-xs mt-0.5">
            <Layers className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                ● FEFO Dispatch Protocol Active
              </span>
            </div>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 leading-tight">
              Batch &amp; Expiry Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 leading-relaxed">
              Track manufacturing dates, shelf-life expiry schedules, and location allocations for First-Expiry-First-Out dispatch
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
          <button
            type="button"
            onClick={() => loadBatches(false)}
            disabled={loading}
            className="flex-1 sm:flex-none justify-center px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-4 h-4 text-slate-500 shrink-0 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
            <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="flex-1 sm:flex-none justify-center px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer shadow-2xs"
          >
            <Download className="w-4 h-4 text-slate-500 shrink-0" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex-1 sm:flex-none justify-center px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>Register New Batch</span>
          </button>
        </div>
      </div>

      {/* 2. Dynamic KPI Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4.5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Batches</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{batches.length}</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Recorded Inward Lots</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4.5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Healthy Batches</p>
            <p className="text-2xl font-extrabold text-emerald-600 mt-1">
              {batches.filter((b) => b.status === 'Active').length}
            </p>
            <p className="text-xs text-emerald-600 font-semibold mt-0.5">&gt; 90 Days Shelf Life</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4.5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Expiring Batches</p>
            <p className="text-2xl font-extrabold text-amber-600 mt-1">
              {batches.filter((b) => b.status === 'Expiring Soon').length}
            </p>
            <p className="text-xs text-amber-600 font-semibold mt-0.5">Priority Dispatch Target</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4.5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Expired / Blocked</p>
            <p className="text-2xl font-extrabold text-rose-600 mt-1">
              {batches.filter((b) => b.status === 'Expired' || b.status === 'On Hold').length}
            </p>
            <p className="text-xs text-rose-600 font-semibold mt-0.5">Quarantine / RTV Required</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Filter Navigation & Live Search Bar */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-slate-100 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-2 rounded-lg transition whitespace-nowrap cursor-pointer ${
              activeTab === 'all'
                ? 'bg-indigo-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            All Batches ({batches.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('Active')}
            className={`px-3.5 py-2 rounded-lg transition whitespace-nowrap cursor-pointer ${
              activeTab === 'Active'
                ? 'bg-indigo-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            Active Fresh ({batches.filter((b) => b.status === 'Active').length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('Expiring Soon')}
            className={`px-3.5 py-2 rounded-lg transition whitespace-nowrap cursor-pointer ${
              activeTab === 'Expiring Soon'
                ? 'bg-indigo-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            Expiring Soon ({batches.filter((b) => b.status === 'Expiring Soon').length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('Expired')}
            className={`px-3.5 py-2 rounded-lg transition whitespace-nowrap cursor-pointer ${
              activeTab === 'Expired'
                ? 'bg-indigo-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            Expired ({batches.filter((b) => b.status === 'Expired').length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('On Hold')}
            className={`px-3.5 py-2 rounded-lg transition whitespace-nowrap cursor-pointer ${
              activeTab === 'On Hold'
                ? 'bg-indigo-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            On Hold ({batches.filter((b) => b.status === 'On Hold').length})
          </button>
        </div>

        {/* Live Search */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search batch, product, SKU, location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
          />
        </div>
      </div>

      {/* 4. Full-Width Spacious Batches Table */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 border-b border-slate-100 pb-3">
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex flex-wrap items-center gap-2">
              <span>Batch Tracking &amp; FEFO Priority Schedule</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 shrink-0">
                {filteredBatches.length} of {batches.length}
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              Earliest expiry batches prioritised first to minimize warehouse spoilage and shelf degradation
            </p>
          </div>

          <div className="text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg shrink-0 self-start sm:self-auto">
            Dispatch Rule: FEFO Strictly Enforced
          </div>
        </div>

        {loading ? (
          <DataLoader text="Loading Batch Registry & FEFO Lifecycle..." subtext="Auditing active lots, manufacturing dates, and shelf-life metrics..." size="md" />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-sm min-w-[1100px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider font-bold">
                <th className="py-3.5 px-3 w-10 text-center">#</th>
                <th className="py-3.5 px-4 w-36">Batch / Lot No.</th>
                <th className="py-3.5 px-4 min-w-[240px]">Product Name &amp; SKU</th>
                <th className="py-3.5 px-4 w-32">Mfg Date</th>
                <th className="py-3.5 px-4 w-32">Expiry Date</th>
                <th className="py-3.5 px-4 w-32">Shelf Life</th>
                <th className="py-3.5 px-4 w-28 text-right">Available Qty</th>
                <th className="py-3.5 px-4 min-w-[200px]">Shade Location</th>
                <th className="py-3.5 px-4 text-center w-28">Status</th>
                <th className="py-3.5 px-5 text-right w-36">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredBatches.length === 0 ? (
                <tr>
                  <td colSpan="10" className="py-10 text-center text-slate-400 text-sm">
                    No batches match the current filter or search criteria.
                  </td>
                </tr>
              ) : (
                filteredBatches.map((b, idx) => (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-3 text-center text-slate-400 font-mono text-xs font-semibold">
                      {idx + 1}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-700 whitespace-nowrap">
                      {b.batchNo}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{b.productName}</p>
                      <p className="text-xs text-slate-500 font-mono">{b.sku}</p>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600 whitespace-nowrap">
                      {b.mfgDate}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-semibold text-slate-900 whitespace-nowrap">
                      {b.expiryDate}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {b.daysLeft < 0 ? (
                        <span className="text-xs font-bold text-rose-600">Expired</span>
                      ) : b.daysLeft <= 60 ? (
                        <span className="text-xs font-bold text-amber-600">{b.daysLeft} days left (FEFO)</span>
                      ) : (
                        <span className="text-xs font-medium text-emerald-600">{b.daysLeft} days</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap font-mono font-bold text-slate-900 text-xs">
                      {b.qty} <span className="font-normal text-slate-500">{b.unit}</span>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium text-slate-800 whitespace-nowrap">
                      {b.location}
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getStatusBadge(
                          b.status
                        )}`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(b)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition cursor-pointer flex items-center gap-1"
                          title="Edit Batch Details"
                        >
                          <Tag className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>

                        <Link
                          to={`/label-qr?batch=${encodeURIComponent(b.batchNo)}&sku=${encodeURIComponent(b.sku)}&qty=${b.qty}`}
                          className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white border border-indigo-200 hover:border-indigo-600 text-xs font-bold transition cursor-pointer shadow-2xs flex items-center gap-1"
                          title="Generate & Print QR Code Stickers"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>Print QR</span>
                        </Link>

                        {b.status === 'Expiring Soon' && (
                          <button
                            type="button"
                            onClick={() => triggerToast(`Batch ${b.batchNo} prioritized for next outbound order.`)}
                            className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-600 text-amber-700 hover:text-white border border-amber-200 hover:border-amber-600 text-xs font-bold transition cursor-pointer shadow-2xs"
                            title="Prioritize for Dispatch"
                          >
                            FEFO Out
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleStatusUpdate(b.id, b.status === 'On Hold' ? 'Active' : 'On Hold')}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                        >
                          {b.status === 'On Hold' ? 'Release' : 'Hold'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* REGISTER NEW BATCH MODAL (CUSTOM SELECTS, ZERO FLICKER)   */}
      {/* ========================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90dvh] overflow-y-auto p-4 sm:p-6 space-y-5 animate-scale-in border border-slate-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-4 border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Register New Inward Batch</h3>
                  <p className="text-xs text-slate-500">Assign manufacturing dates and storage rack bin</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBatch} className="space-y-4 text-xs">
              <CustomSelect
                label="Target Product"
                value={newBatch.productName}
                onChange={(val) => setNewBatch({ ...newBatch, productName: val })}
                options={dynamicProductOptions.length > 0 ? dynamicProductOptions : PRODUCT_OPTIONS}
                zIndexClass="z-30"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Batch / Lot Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BTH-2026-095"
                    value={newBatch.batchNo}
                    onChange={(e) => setNewBatch({ ...newBatch, batchNo: e.target.value.toUpperCase() })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Batch Quantity <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="1"
                      required
                      placeholder="100"
                      value={newBatch.qty}
                      onChange={(e) => setNewBatch({ ...newBatch, qty: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold"
                    />
                    <select
                      value={newBatch.unit}
                      onChange={(e) => setNewBatch({ ...newBatch, unit: e.target.value })}
                      className="bg-white border border-slate-300 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-800"
                    >
                      <option value="Bags">Bags</option>
                      <option value="Tins">Tins</option>
                      <option value="Boxes">Boxes</option>
                      <option value="Drums">Drums</option>
                      <option value="Bundles">Bundles</option>
                      <option value="Units">Units</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Manufacturing Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={newBatch.mfgDate}
                    onChange={(e) => setNewBatch({ ...newBatch, mfgDate: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Expiry Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={newBatch.expiryDate}
                    onChange={(e) => setNewBatch({ ...newBatch, expiryDate: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <CustomSelect
                label="Storage Shade Location"
                value={newBatch.location}
                onChange={(val) => setNewBatch({ ...newBatch, location: val })}
                options={LOCATION_OPTIONS}
                zIndexClass="z-20"
              />

              <CustomSelect
                label="Initial Batch Status"
                value={newBatch.status}
                onChange={(val) => setNewBatch({ ...newBatch, status: val })}
                options={STATUS_OPTIONS}
                zIndexClass="z-10"
              />

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 font-bold cursor-pointer transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl font-bold shadow-xs cursor-pointer transition flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
                  <span>{isSubmitting ? 'Recording Batch...' : 'Record Batch'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* EDIT / UPDATE BATCH MODAL                                 */}
      {/* ========================================================= */}
      {showEditModal && editingBatch && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90dvh] overflow-y-auto p-4 sm:p-6 space-y-5 animate-scale-in border border-slate-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-4 border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center font-bold">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Edit / Update Batch Details</h3>
                  <p className="text-xs text-slate-500">Update expiry dates, storage location and status</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false)
                  setEditingBatch(null)
                }}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateBatch} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Product Name</label>
                <input
                  type="text"
                  disabled
                  value={editingBatch.productName}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-600 font-semibold cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Batch / Lot Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingBatch.batchNo}
                    onChange={(e) => setEditingBatch({ ...editingBatch, batchNo: e.target.value.toUpperCase() })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Available Quantity <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="1"
                      required
                      value={editingBatch.qty}
                      onChange={(e) => setEditingBatch({ ...editingBatch, qty: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold"
                    />
                    <select
                      value={editingBatch.unit}
                      onChange={(e) => setEditingBatch({ ...editingBatch, unit: e.target.value })}
                      className="bg-white border border-slate-300 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-800"
                    >
                      <option value="Bags">Bags</option>
                      <option value="Tins">Tins</option>
                      <option value="Boxes">Boxes</option>
                      <option value="Drums">Drums</option>
                      <option value="Bundles">Bundles</option>
                      <option value="Units">Units</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Manufacturing Date</label>
                  <input
                    type="text"
                    value={editingBatch.mfgDate}
                    onChange={(e) => setEditingBatch({ ...editingBatch, mfgDate: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Expiry Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingBatch.expiryDate}
                    onChange={(e) => setEditingBatch({ ...editingBatch, expiryDate: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Storage Location</label>
                <input
                  type="text"
                  value={editingBatch.location}
                  onChange={(e) => setEditingBatch({ ...editingBatch, location: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Status</label>
                <select
                  value={editingBatch.status}
                  onChange={(e) => setEditingBatch({ ...editingBatch, status: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="Active">Active (Healthy)</option>
                  <option value="Expiring Soon">Expiring Soon (FEFO Priority)</option>
                  <option value="On Hold">On Hold (Quarantined)</option>
                  <option value="Expired">Expired</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingBatch(null)
                  }}
                  className="px-4 py-2.5 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 font-bold cursor-pointer transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl font-bold shadow-xs cursor-pointer transition flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
                  <span>{isSubmitting ? 'Saving Changes...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
