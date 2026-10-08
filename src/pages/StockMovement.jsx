import { useState, useMemo, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import QRCode from 'qrcode'
import { printSpecificElement } from '../utils/printHelper'
import {
  ArrowLeftRight,
  Eye,
  Printer,
  RotateCcw,
  Plus,
  Download,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  X,
  Package,
  Layers,
  Warehouse,
  Check,
  ChevronDown,
  FileText,
  Boxes,
  Loader2,
  AlertCircle,
  MapPin,
  Sparkles,
  QrCode,
  Tag,
} from 'lucide-react'
import { apiRequest } from '../services/api'
import DataLoader from '../components/common/DataLoader'

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
        className="w-full bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-left font-medium text-slate-800 flex items-center justify-between transition focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ml-2 ${isOpen ? 'rotate-180 text-indigo-600' : ''}`} />
      </button>

      {isOpen && (
        <div className={`absolute left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 ${zIndexClass} max-h-56 overflow-y-auto`}>
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
                className={`w-full px-3.5 py-2 text-xs text-left flex items-center justify-between transition ${
                  isSelected
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="truncate">
                  <div className="truncate">{opt.label}</div>
                  {opt.sublabel && <div className="text-[10px] text-slate-400 font-normal">{opt.sublabel}</div>}
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

const fmt = (iso) => {
  if (!iso) return '-'
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function StockMovement() {
  // Toast state
  const [toastMessage, setToastMessage] = useState(null)
  const triggerToast = (msg, type = 'success') => {
    setToastMessage({ msg, type })
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Active Tab for table
  const [activeTab, setActiveTab] = useState('ALL')
  const [filterType, setFilterType] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const perPage = 8

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(null)
  const [modalQrUrl, setModalQrUrl] = useState('')
  const [activeModalTab, setActiveModalTab] = useState('voucher') // 'voucher' | 'tag'
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  // Master Data State from Backend
  const [movementsData, setMovementsData] = useState([])
  const [racks, setRacks] = useState([])
  const [products, setProducts] = useState([])

  // New Movement Form state
  const [newMovement, setNewMovement] = useState({
    type: 'Internal',
    productName: '',
    sku: '',
    batchNo: '',
    fromLocation: '',
    toLocation: '',
    quantity: '1',
    unit: 'Kg',
    packagingSummary: '',
    reason: 'Relocation to another storage bin',
    requestedBy: 'Warehouse Manager',
  })

  // Fetch real Stock Movements, Racks, and Products from Backend
  const fetchMovements = async () => {
    try {
      setLoading(true)
      const [movsRes, prodsRes, racksRes] = await Promise.allSettled([
        apiRequest('/stock-movement'),
        apiRequest('/product'),
        apiRequest('/rack'),
      ])

      if (movsRes.status === 'fulfilled' && Array.isArray(movsRes.value)) {
        setMovementsData(movsRes.value)
      }
      if (prodsRes.status === 'fulfilled' && Array.isArray(prodsRes.value)) {
        setProducts(prodsRes.value)
      }
      if (racksRes.status === 'fulfilled' && Array.isArray(racksRes.value)) {
        setRacks(racksRes.value)
      }
    } catch (err) {
      console.error('Failed to load stock movements:', err)
      triggerToast('Failed to load movements ledger from server', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMovements()
  }, [])

  // Generate real QR Code Data URL whenever detail modal item changes
  useEffect(() => {
    if (showDetailModal) {
      const payload = `REF: ${showDetailModal.refNo || ''}\nITEM: ${showDetailModal.productName || ''}\nBATCH: ${showDetailModal.batchNo || ''}\nFROM: ${showDetailModal.fromLocation || ''}\nTO: ${showDetailModal.toLocation || ''}\nQTY: ${showDetailModal.quantity || ''} ${showDetailModal.unit || 'Kg'}\nTYPE: ${showDetailModal.type || 'Internal'}\nTIME: ${showDetailModal.createdAt || showDetailModal.dateTime || new Date().toISOString()}`
      QRCode.toDataURL(payload, { width: 240, margin: 1 })
        .then((url) => setModalQrUrl(url))
        .catch((err) => console.error('QR generation error:', err))
    } else {
      setModalQrUrl('')
    }
  }, [showDetailModal])

  // Extract list of all currently occupied cells across racks for quick source selection
  const occupiedBins = useMemo(() => {
    const list = []
    racks.forEach((r) => {
      (r.cells || []).forEach((c) => {
        if (c.status === 'Occupied' || c.currentStock > 0 || c.productName) {
          const code = c.code || `${r.shadeCode}-${r.rackNumber}-R${c.row}-C${c.col}`
          list.push({
            code,
            productName: c.productName || 'Stocked Item',
            batchNo: c.batchNo || 'N/A',
            currentStock: c.currentStock || 1,
            shadeCode: r.shadeCode,
            rackNumber: r.rackNumber,
          })
        }
      })
    })
    return list
  }, [racks])

  // Extract list of all empty cells for destination selection
  const emptyBins = useMemo(() => {
    const list = []
    racks.forEach((r) => {
      (r.cells || []).forEach((c) => {
        if (c.status === 'Empty' && (!c.currentStock || c.currentStock === 0)) {
          const code = c.code || `${r.shadeCode}-${r.rackNumber}-R${c.row}-C${c.col}`
          list.push({
            code,
            shadeCode: r.shadeCode,
            rackNumber: r.rackNumber,
            row: c.row,
            col: c.col,
          })
        }
      })
    })
    return list
  }, [racks])

  // When source bin is picked, auto-fill product details
  const handleSelectSourceBin = (binCode) => {
    const found = occupiedBins.find((b) => b.code === binCode)
    if (found) {
      const prod = products.find((p) => p.name === found.productName)
      setNewMovement((prev) => ({
        ...prev,
        fromLocation: found.code,
        productName: found.productName,
        batchNo: found.batchNo,
        quantity: String(found.currentStock),
        unit: prod?.baseUnit || 'Kg',
        sku: prod?.sku || '',
        packagingSummary: `${found.currentStock} ${prod?.baseUnit || 'Kg'} (${prod?.outerPackaging || 'Packaged'})`,
      }))
    } else {
      setNewMovement((prev) => ({ ...prev, fromLocation: binCode }))
    }
  }

  // Filtered rows for movements ledger table
  const filteredMovements = useMemo(() => {
    return movementsData.filter((row) => {
      // Tab filter
      if (activeTab === 'INTERNAL' && row.type !== 'Internal') return false
      if (activeTab === 'INWARD' && row.type !== 'Inward') return false
      if (activeTab === 'OUTWARD' && row.type !== 'Outward') return false
      if (activeTab === 'ADJUST' && row.type !== 'Adjust') return false

      // Select filter
      if (filterType !== 'ALL' && row.type !== filterType) return false

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        return (
          (row.refNo || '').toLowerCase().includes(q) ||
          (row.productName || '').toLowerCase().includes(q) ||
          (row.batchNo || '').toLowerCase().includes(q) ||
          (row.fromLocation || '').toLowerCase().includes(q) ||
          (row.toLocation || '').toLowerCase().includes(q) ||
          (row.user || '').toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [movementsData, activeTab, filterType, searchQuery])

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredMovements.length / perPage))
  const paginatedMovements = filteredMovements.slice((currentPage - 1) * perPage, currentPage * perPage)

  // Dynamic KPI Stats from MongoDB
  const stats = useMemo(() => {
    const total = movementsData.length
    const internal = movementsData.filter((m) => m.type === 'Internal').length
    const inward = movementsData.filter((m) => m.type === 'Inward').length
    const outward = movementsData.filter((m) => m.type === 'Outward').length
    const adjustments = movementsData.filter((m) => m.type === 'Adjust').length
    return { total, internal, inward, outward, adjustments }
  }, [movementsData])

  // Handle Create Movement Submission to Backend
  const handleCreateMovement = async (e) => {
    e.preventDefault()
    if (!newMovement.productName.trim() || !newMovement.batchNo.trim() || !newMovement.toLocation.trim()) {
      triggerToast('Product, Batch No, and Destination Bin are required', 'error')
      return
    }

    try {
      setSubmitting(true)
      const res = await apiRequest('/stock-movement', {
        method: 'POST',
        body: JSON.stringify({
          type: newMovement.type,
          productName: newMovement.productName.trim(),
          sku: newMovement.sku || '',
          batchNo: newMovement.batchNo.trim(),
          fromLocation: newMovement.fromLocation.trim() || 'Dock / Staging',
          toLocation: newMovement.toLocation.trim(),
          quantity: Number(newMovement.quantity) || 1,
          unit: newMovement.unit || 'Kg',
          packagingSummary: newMovement.packagingSummary || `${newMovement.quantity} ${newMovement.unit}`,
          reason: newMovement.reason || 'Intra-warehouse bin relocation',
          user: newMovement.requestedBy || 'Warehouse Manager',
        }),
      })

      triggerToast(`✓ Movement ${res.movement?.refNo || 'Recorded'} successfully executed!`)
      setShowCreateModal(false)
      fetchMovements()

      if (res.movement) {
        setShowDetailModal(res.movement)
      }
    } catch (err) {
      triggerToast(err.message || 'Failed to record stock movement', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      '#',
      'Date & Time',
      'Ref No',
      'Movement Type',
      'Product Name',
      'SKU',
      'Batch No',
      'From Location',
      'To Location',
      'Quantity',
      'Unit',
      'Packaging Summary',
      'Operator',
      'Status',
    ]
    const rows = filteredMovements.map((r, i) => [
      i + 1,
      `"${fmt(r.createdAt || r.dateTime)}"`,
      `"${r.refNo}"`,
      `"${r.type}"`,
      `"${(r.productName || '').replace(/"/g, '""')}"`,
      `"${r.sku || ''}"`,
      `"${r.batchNo || ''}"`,
      `"${r.fromLocation || ''}"`,
      `"${r.toLocation || ''}"`,
      r.quantity || 0,
      `"${r.unit || 'Kg'}"`,
      `"${(r.packagingSummary || '').replace(/"/g, '""')}"`,
      `"${r.user || 'Officer'}"`,
      `"${r.status || 'Completed'}"`,
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'Warehouse_Stock_Movement_Register.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    triggerToast('Stock movement register exported to CSV.')
  }

  // Dropdown Options
  const typeOptions = [
    { value: 'ALL', label: 'All Movement Types' },
    { value: 'Internal', label: 'Internal Relocation (Bin to Bin)' },
    { value: 'Inward', label: 'Inward Transfer (Dock to Bin)' },
    { value: 'Outward', label: 'Outward Dispatch (Bin to Staging)' },
    { value: 'Adjust', label: 'Stock Adjustment / Audit' },
  ]

  const newMovementTypeOptions = [
    { value: 'Internal', label: 'Internal Bin-to-Bin Relocation' },
    { value: 'Inward', label: 'Inward Dock-to-Bin Allocation' },
    { value: 'Outward', label: 'Outward Dispatch Staging Transfer' },
    { value: 'Adjust', label: 'Audit Adjustment / Scrap' },
  ]

  return (
    <div className="space-y-5 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-5 right-5 z-[9999] pointer-events-auto px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold border ${
            toastMessage.type === 'error'
              ? 'bg-rose-900 text-white border-rose-700'
              : 'bg-slate-900 text-white border-slate-700'
          }`}
        >
          {toastMessage.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span>{toastMessage.msg}</span>
        </div>
      )}

      {/* Page Header Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs shrink-0 mt-0.5 sm:mt-0">
            <ArrowLeftRight className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight leading-tight">Stock Movement &amp; Relocation</h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5 leading-relaxed">
              Track intra-warehouse bin transfers, staging dispatch movements, and live audit adjustments.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex-1 sm:flex-none justify-center inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>Export Register</span>
          </button>
          <button
            type="button"
            onClick={() => {
              if (occupiedBins.length > 0) {
                handleSelectSourceBin(occupiedBins[0].code)
              }
              setShowCreateModal(true)
            }}
            className="flex-1 sm:flex-none justify-center inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>Record Movement</span>
          </button>
        </div>
      </div>

      {/* 4 Dynamic KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
            <ArrowLeftRight className="w-5 h-5" />
          </div>
          <div>
            <div className="text-slate-400 text-xs font-medium">Total Movements</div>
            <h3 className="text-xl font-bold text-slate-800 tracking-tight">{stats.total}</h3>
            <p className="text-[11px] text-slate-500 font-medium">Logged in ledger</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <div className="text-slate-400 text-xs font-medium">Internal Relocations</div>
            <h3 className="text-xl font-bold text-slate-800 tracking-tight">{stats.internal}</h3>
            <p className="text-[11px] text-blue-600 font-medium">Bin-to-bin transfers</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-slate-400 text-xs font-medium">Inward Dock Moves</div>
            <h3 className="text-xl font-bold text-slate-800 tracking-tight">{stats.inward}</h3>
            <p className="text-[11px] text-emerald-600 font-medium">Check-in put-away</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
            <ArrowRight className="w-5 h-5" />
          </div>
          <div>
            <div className="text-slate-400 text-xs font-medium">Outward Staging</div>
            <h3 className="text-xl font-bold text-slate-800 tracking-tight">{stats.outward}</h3>
            <p className="text-[11px] text-rose-600 font-medium">Pre-dispatch transfers</p>
          </div>
        </div>
      </div>

      {/* Main Ledger Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200/80 space-y-4">
        {/* Filter Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {[
              { id: 'ALL', label: `All Movements (${stats.total})` },
              { id: 'INTERNAL', label: `Internal (${stats.internal})` },
              { id: 'INWARD', label: `Inward (${stats.inward})` },
              { id: 'OUTWARD', label: `Outward (${stats.outward})` },
              { id: 'ADJUST', label: `Adjustments (${stats.adjustments})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id)
                  setCurrentPage(1)
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative min-w-[240px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                placeholder="Search by Ref No, Product, Batch, From/To location, Operator..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
              />
            </div>

            <CustomSelect
              value={filterType}
              onChange={(val) => {
                setFilterType(val)
                setCurrentPage(1)
              }}
              options={typeOptions}
              className="min-w-[190px]"
            />
          </div>
        </div>

        {/* Movements Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-slate-200">
            <thead className="bg-slate-50/80 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4 w-12 text-center">#</th>
                <th className="py-3.5 px-4 min-w-[140px]">Date &amp; Time</th>
                <th className="py-3.5 px-4 min-w-[120px]">Ref No.</th>
                <th className="py-3.5 px-4 min-w-[100px]">Type</th>
                <th className="py-3.5 px-4 min-w-[180px]">Product Stored</th>
                <th className="py-3.5 px-4 min-w-[110px]">Batch No.</th>
                <th className="py-3.5 px-4 min-w-[130px]">From Location</th>
                <th className="py-3.5 px-4 min-w-[130px]">To Location</th>
                <th className="py-3.5 px-4 text-center min-w-[100px]">Quantity</th>
                <th className="py-3.5 px-4 min-w-[120px]">Operator</th>
                <th className="py-3.5 px-4 text-center w-28">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan="11" className="py-8">
                    <DataLoader
                      text="Loading Stock Movements & Inter-Shade Transfers..."
                      subtext="Syncing internal warehouse relocations and pallet movements..."
                      size="md"
                    />
                  </td>
                </tr>
              ) : paginatedMovements.length === 0 ? (
                <tr>
                  <td colSpan="11" className="py-12 text-center text-slate-400 space-y-2">
                    <p>No stock movement records found matching your filter criteria.</p>
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(true)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-50 text-indigo-700 font-bold rounded-lg border border-indigo-200 hover:bg-indigo-100 transition cursor-pointer text-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Record First Movement</span>
                    </button>
                  </td>
                </tr>
              ) : (
                paginatedMovements.map((row, idx) => {
                  const isInternal = row.type === 'Internal'
                  const isInward = row.type === 'Inward'
                  const isOutward = row.type === 'Outward'

                  const badgeClass = isInternal
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : isInward
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : isOutward
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'

                  return (
                    <tr key={row._id || row.refNo || idx} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 text-center text-slate-400 font-bold text-[11px]">
                        {(currentPage - 1) * perPage + idx + 1}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600 whitespace-nowrap">
                        {fmt(row.createdAt || row.dateTime)}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-600 whitespace-nowrap">
                        {row.refNo}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badgeClass}`}>
                          {row.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {row.productName}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-700 font-medium">
                        {row.batchNo}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-600">
                        {row.fromLocation}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-700">
                        {row.toLocation}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-900">
                        {row.quantity} {row.unit || 'Kg'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {row.user || row.operator || 'Storekeeper'}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setShowDetailModal(row)
                              setActiveModalTab('voucher')
                            }}
                            className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition cursor-pointer"
                            title="View & Print Transit Voucher"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowDetailModal(row)
                              setActiveModalTab('tag')
                            }}
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition cursor-pointer"
                            title="View & Print Pallet QR Tag"
                          >
                            <QrCode className="w-4 h-4" />
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

        {/* Pagination Footer */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium">
          <div>
            Showing <strong>{filteredMovements.length > 0 ? (currentPage - 1) * perPage + 1 : 0}</strong> to{' '}
            <strong>{Math.min(currentPage * perPage, filteredMovements.length)}</strong> of{' '}
            <strong>{filteredMovements.length}</strong> recorded movements
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-bold"
            >
              ‹ Prev
            </button>
            <span className="px-2 text-slate-600 font-bold">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-bold"
            >
              Next ›
            </button>
          </div>
        </div>
      </div>

      {/* MODAL 1: Record Stock Movement Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-4 sm:p-6 max-h-[90dvh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <ArrowLeftRight className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-800">Record Stock Movement</h3>
                  <p className="text-[11px] text-slate-500">Live bin relocation &amp; inventory transit in MongoDB</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateMovement} className="pt-4 space-y-3.5 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Movement Category <span className="text-rose-500">*</span>
                </label>
                <CustomSelect
                  value={newMovement.type}
                  onChange={(val) => setNewMovement({ ...newMovement, type: val })}
                  options={newMovementTypeOptions}
                  zIndexClass="z-40"
                />
              </div>

              {/* Source Bin Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Source Origin Bin (Occupied Bin) <span className="text-rose-500">*</span>
                </label>
                {occupiedBins.length > 0 ? (
                  <select
                    value={newMovement.fromLocation}
                    onChange={(e) => handleSelectSourceBin(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                  >
                    <option value="">Select occupied source bin...</option>
                    {occupiedBins.map((b) => (
                      <option key={b.code} value={b.code}>
                        {b.code} — {b.productName} ({b.currentStock} qty, Batch: {b.batchNo})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    value={newMovement.fromLocation}
                    onChange={(e) => setNewMovement({ ...newMovement, fromLocation: e.target.value })}
                    placeholder="e.g. SH-01-RK-01-R1-C1"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                  />
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Commodity / Product <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newMovement.productName}
                    onChange={(e) => setNewMovement({ ...newMovement, productName: e.target.value })}
                    placeholder="e.g. Basmati Rice"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Batch Identifier <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newMovement.batchNo}
                    onChange={(e) => setNewMovement({ ...newMovement, batchNo: e.target.value })}
                    placeholder="e.g. BTH-11241"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Destination Bin Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Destination Target Bin <span className="text-rose-500">*</span>
                </label>
                {emptyBins.length > 0 ? (
                  <div className="space-y-1.5">
                    <select
                      value={newMovement.toLocation}
                      onChange={(e) => setNewMovement({ ...newMovement, toLocation: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-mono font-bold text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                    >
                      <option value="">Select available empty bin...</option>
                      {emptyBins.map((b) => (
                        <option key={b.code} value={b.code}>
                          {b.code} (Shade {b.shadeCode} - {b.rackNumber} - R{b.row}•C{b.col})
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Or enter custom bin / staging bay name..."
                      value={newMovement.toLocation}
                      onChange={(e) => setNewMovement({ ...newMovement, toLocation: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-mono text-slate-700 focus:outline-none focus:bg-white"
                    />
                  </div>
                ) : (
                  <input
                    type="text"
                    required
                    value={newMovement.toLocation}
                    onChange={(e) => setNewMovement({ ...newMovement, toLocation: e.target.value })}
                    placeholder="e.g. SH-01-RK-01-R1-C4 or Staging Bay 1"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-mono font-bold text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                  />
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Quantity to Move *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newMovement.quantity}
                    onChange={(e) => setNewMovement({ ...newMovement, quantity: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Packaging Summary</label>
                  <input
                    type="text"
                    value={newMovement.packagingSummary}
                    onChange={(e) => setNewMovement({ ...newMovement, packagingSummary: e.target.value })}
                    placeholder="e.g. 5 Bags @ 25kg"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Transfer Reason / Notes</label>
                <input
                  type="text"
                  value={newMovement.reason}
                  onChange={(e) => setNewMovement({ ...newMovement, reason: e.target.value })}
                  placeholder="e.g. Re-location to dispatch staging bay"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 sm:flex-none justify-center px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 sm:flex-none justify-center bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-5 py-2 rounded-xl text-xs font-bold transition cursor-pointer text-center flex items-center gap-1.5"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>Execute Movement</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Stock Movement Transit Slip & Destination QR Tag */}
      {showDetailModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-4 sm:p-6 max-h-[90dvh] overflow-y-auto shadow-2xl border border-slate-200 space-y-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                  MOV
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-800">
                    {activeModalTab === 'voucher' ? 'Stock Movement Transit Voucher' : 'Destination Bin / Pallet QR Tag'}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {showDetailModal.refNo} • {showDetailModal.toLocation}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDetailModal(null)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* View Mode Switcher */}
            <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
              <button
                type="button"
                onClick={() => setActiveModalTab('voucher')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeModalTab === 'voucher'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Transit Voucher</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveModalTab('tag')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeModalTab === 'tag'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Pallet / Bin QR Tag</span>
              </button>
            </div>

            {/* VIEW 1: Printable Voucher Card with Embedded Scannable QR Code */}
            {activeModalTab === 'voucher' && (
              <div id="printable-movement-voucher" className="printable-area border border-slate-200 rounded-xl p-4 bg-white space-y-3.5 text-xs font-sans">
                <div className="flex items-start justify-between border-b pb-2.5 border-slate-200">
                  <div>
                    <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider">CENTRAL WAREHOUSE LOGISTICS</h4>
                    <p className="text-[10px] text-slate-500">Intra-Depot Stock Relocation Voucher</p>
                  </div>
                  <div className="text-right font-mono text-[11px]">
                    <strong className="text-slate-900 block">{showDetailModal.refNo}</strong>
                    <span className="text-slate-400 text-[10px]">{fmt(showDetailModal.createdAt || showDetailModal.dateTime)}</span>
                  </div>
                </div>

                {/* Transit Route Visualization */}
                <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="text-center">
                    <span className="text-[9px] text-slate-400 font-bold uppercase block">Source Bin</span>
                    <strong className="font-mono text-xs text-slate-800">{showDetailModal.fromLocation}</strong>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-indigo-600 font-bold mb-0.5">{showDetailModal.type} Transfer</span>
                    <ArrowRight className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="text-center">
                    <span className="text-[9px] text-slate-400 font-bold uppercase block">Target Bin</span>
                    <strong className="font-mono text-xs text-emerald-700">{showDetailModal.toLocation}</strong>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 items-center bg-slate-50/60 p-3 rounded-xl border border-slate-200">
                  <div className="col-span-2 space-y-1.5 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Product:</span>
                      <strong className="text-slate-900 text-right truncate max-w-[180px]">{showDetailModal.productName}</strong>
                    </div>
                    {showDetailModal.sku && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">SKU:</span>
                        <strong className="font-mono text-slate-800">{showDetailModal.sku}</strong>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-500">Batch Number:</span>
                      <strong className="font-mono text-slate-800">{showDetailModal.batchNo}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Transferred Qty:</span>
                      <strong className="font-mono text-slate-900">{showDetailModal.quantity} {showDetailModal.unit || 'Kg'}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Packaging:</span>
                      <span className="text-slate-700 font-medium">{showDetailModal.packagingSummary || `${showDetailModal.quantity} ${showDetailModal.unit}`}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-200">
                      <span className="text-slate-500">Authorized By:</span>
                      <span className="text-slate-800 font-semibold">{showDetailModal.user}</span>
                    </div>
                  </div>

                  {/* Embedded QR Code */}
                  <div className="flex flex-col items-center justify-center p-1.5 bg-white rounded-lg border border-slate-300">
                    {modalQrUrl ? (
                      <img src={modalQrUrl} alt="Movement QR" className="w-24 h-24 object-contain" />
                    ) : (
                      <QrCode className="w-16 h-16 text-slate-300 animate-pulse" />
                    )}
                    <span className="text-[8px] font-mono text-slate-400 mt-0.5 uppercase tracking-tighter">Scan Verification</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100 font-mono">
                  <span>Voucher: {showDetailModal.refNo}</span>
                  <span className="text-emerald-600 font-bold">✓ Relocated &amp; Logged in MongoDB</span>
                </div>
              </div>
            )}

            {/* VIEW 2: Physical Printable QR Sticker Tag (Matches Check-in / Put-Away Format Exactly) */}
            {activeModalTab === 'tag' && (
              <div id="printable-movement-tag" className="printable-area border-2 border-slate-900 rounded-xl p-4 bg-white space-y-2 text-center">
                <div className="text-[9px] font-black uppercase tracking-wider text-slate-500">
                  CENTRAL WAREHOUSE • RELOCATION / PALLET TAG
                </div>
                <div className="text-xl font-black font-mono tracking-widest text-slate-900 py-1 bg-slate-50 rounded border border-dashed border-slate-300">
                  {showDetailModal.toLocation}
                </div>
                <div className="w-32 h-32 mx-auto border border-slate-300 p-1.5 rounded-lg flex items-center justify-center bg-white shadow-xs">
                  {modalQrUrl ? (
                    <img src={modalQrUrl} alt="Relocation QR" className="w-full h-full object-contain" />
                  ) : (
                    <QrCode className="w-16 h-16 text-slate-300 animate-pulse" />
                  )}
                </div>
                <p className="text-xs font-bold text-slate-900 truncate">{showDetailModal.productName}</p>
                <div className="text-[10px] text-slate-600 font-mono">
                  Batch: {showDetailModal.batchNo} • {showDetailModal.quantity} {showDetailModal.unit || 'Kg'}
                </div>
                <div className="text-[9px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 inline-block">
                  Relocation Status: Completed &amp; Occupied
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowDetailModal(null)}
                className="flex-1 sm:flex-none justify-center px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer text-center"
              >
                Close
              </button>
              {activeModalTab === 'voucher' ? (
                <button
                  type="button"
                  onClick={() => printSpecificElement('#printable-movement-voucher', `Movement Voucher - ${showDetailModal.refNo}`)}
                  className="flex-1 sm:flex-none justify-center inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition cursor-pointer text-center"
                >
                  <Printer className="w-4 h-4 shrink-0" />
                  <span>Print Transit Voucher</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => printSpecificElement('#printable-movement-tag', `Relocation Tag - ${showDetailModal.toLocation}`)}
                  className="flex-1 sm:flex-none justify-center inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition cursor-pointer text-center"
                >
                  <Printer className="w-4 h-4 shrink-0" />
                  <span>Print QR Pallet Tag</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
