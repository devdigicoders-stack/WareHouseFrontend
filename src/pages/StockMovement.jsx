import { useState, useMemo, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
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

export default function StockMovement() {
  // Toast state
  const [toastMessage, setToastMessage] = useState(null)
  const triggerToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3200)
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

  // New Movement Form state
  const [newMovement, setNewMovement] = useState({
    type: 'Internal',
    productName: 'Parle-G Glucose Biscuits (50g)',
    batchNo: 'BT-2026-FMCG-01',
    fromLocation: 'SH03-R02-C04',
    toLocation: 'SH03-R05-C08',
    quantity: '1200',
    unit: 'Pieces',
    packagingSummary: '200 Gatta @ 6 pcs',
    reason: 'Relocation to dispatch staging bay',
    requestedBy: 'Rajesh Sharma (Storekeeper)',
  })

  // Stock Movement Master Data
  const [movementsData, setMovementsData] = useState([
    {
      id: 1,
      dateTime: '21 Sep 2026, 09:45',
      refNo: 'MOV-2026-101',
      type: 'Internal',
      productName: 'Parle-G Glucose Biscuits (50g)',
      sku: 'PRD-FMCG-001',
      batchNo: 'BT-2026-FMCG-01',
      fromLocation: 'SH03-R02-C04',
      toLocation: 'SH03-R05-C08',
      quantity: 1200,
      unit: 'Pieces',
      packagingSummary: '200 Gatta @ 6 pcs',
      user: 'Rajesh Sharma',
      status: 'Completed',
    },
    {
      id: 2,
      dateTime: '21 Sep 2026, 08:30',
      refNo: 'MOV-2026-102',
      type: 'Inward',
      productName: 'Fortune Refined Mustard Oil (15L Tin)',
      sku: 'PRD-OIL-002',
      batchNo: 'BT-2026-OIL-02',
      fromLocation: 'Receiving Dock Gate-01',
      toLocation: 'SH02-R01-C03',
      quantity: 450,
      unit: 'Ltr',
      packagingSummary: '30 Tins @ 15L',
      user: 'Priya Patel',
      status: 'Completed',
    },
    {
      id: 3,
      dateTime: '20 Sep 2026, 17:20',
      refNo: 'MOV-2026-103',
      type: 'Outward',
      productName: 'Corrugated Packaging Cartons 5-Ply',
      sku: 'PRD-BOX-007',
      batchNo: 'BT-2026-PKG-03',
      fromLocation: 'SH04-R03-C02',
      toLocation: 'Dispatch Staging Bay-02',
      quantity: 1000,
      unit: 'Nos',
      packagingSummary: '40 Bundles @ 25 pcs',
      user: 'Amit Patel',
      status: 'Completed',
    },
    {
      id: 4,
      dateTime: '20 Sep 2026, 14:10',
      refNo: 'MOV-2026-104',
      type: 'Internal',
      productName: 'Sharbati Wheat Grain (Grade A)',
      sku: 'PRD-GRN-001',
      batchNo: 'BT-2026-WHT-04',
      fromLocation: 'SH01-R02-C05',
      toLocation: 'SH01-R04-C02',
      quantity: 2500,
      unit: 'Kg',
      packagingSummary: '50 Bags @ 50 kg',
      user: 'Suresh Nair',
      status: 'Completed',
    },
    {
      id: 5,
      dateTime: '19 Sep 2026, 11:35',
      refNo: 'MOV-2026-105',
      type: 'Inward',
      productName: 'Industrial Floor Disinfectant Liquid',
      sku: 'PRD-CHM-005',
      batchNo: 'BT-2026-CHM-05',
      fromLocation: 'Receiving Dock Gate-02',
      toLocation: 'SH05-R01-C01',
      quantity: 300,
      unit: 'Ltr',
      packagingSummary: '60 Cans @ 5L',
      user: 'Vikram Singh',
      status: 'Completed',
    },
    {
      id: 6,
      dateTime: '19 Sep 2026, 10:20',
      refNo: 'MOV-2026-106',
      type: 'Outward',
      productName: 'Arhar / Toor Dal (Grade A 30kg)',
      sku: 'PRD-DAL-003',
      batchNo: 'BT-2026-PUL-06',
      fromLocation: 'SH01-R01-C02',
      toLocation: 'Dispatch Staging Bay-01',
      quantity: 1500,
      unit: 'Kg',
      packagingSummary: '50 Bags @ 30 kg',
      user: 'Deepak Verma',
      status: 'Completed',
    },
    {
      id: 7,
      dateTime: '18 Sep 2026, 16:45',
      refNo: 'MOV-2026-107',
      type: 'Internal',
      productName: 'Heavy Duty Waterproof Tarpaulin',
      sku: 'PRD-TAR-006',
      batchNo: 'BT-2026-TAR-07',
      fromLocation: 'SH04-R01-C01',
      toLocation: 'SH04-R02-C03',
      quantity: 200,
      unit: 'Nos',
      packagingSummary: '40 Bundles @ 5 pcs',
      user: 'Rajesh Sharma',
      status: 'Completed',
    },
    {
      id: 8,
      dateTime: '18 Sep 2026, 13:15',
      refNo: 'MOV-2026-108',
      type: 'Adjust',
      productName: 'Industrial First Aid Kit',
      sku: 'PRD-MED-004',
      batchNo: 'BT-2026-MED-08',
      fromLocation: 'SH06-R01-C01',
      toLocation: 'SH06-R01-C01',
      quantity: -5,
      unit: 'Box',
      packagingSummary: '-5 Kits (Audit Adjustment)',
      user: 'Priya Patel',
      status: 'Completed',
    },
  ])

  // Filtered rows
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
          row.refNo.toLowerCase().includes(q) ||
          row.productName.toLowerCase().includes(q) ||
          row.batchNo.toLowerCase().includes(q) ||
          row.fromLocation.toLowerCase().includes(q) ||
          row.toLocation.toLowerCase().includes(q) ||
          row.user.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [movementsData, activeTab, filterType, searchQuery])

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredMovements.length / perPage))
  const paginatedMovements = filteredMovements.slice((currentPage - 1) * perPage, currentPage * perPage)

  // Dynamic KPI Stats
  const stats = useMemo(() => {
    const total = movementsData.length
    const internal = movementsData.filter((m) => m.type === 'Internal').length
    const inward = movementsData.filter((m) => m.type === 'Inward').length
    const outward = movementsData.filter((m) => m.type === 'Outward').length
    return { total, internal, inward, outward }
  }, [movementsData])

  // Handle Create Movement Submission
  const handleCreateMovement = (e) => {
    e.preventDefault()
    const newId = movementsData.length + 1
    const refCode = `MOV-2026-${100 + newId}`
    const now = new Date()
    const dateFormatted = `${now.getDate()} Sep 2026, ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

    const record = {
      id: newId,
      dateTime: dateFormatted,
      refNo: refCode,
      type: newMovement.type,
      productName: newMovement.productName,
      sku: `PRD-${newMovement.batchNo.slice(3, 6)}-0${newId}`,
      batchNo: newMovement.batchNo,
      fromLocation: newMovement.fromLocation,
      toLocation: newMovement.toLocation,
      quantity: parseInt(newMovement.quantity, 10) || 100,
      unit: newMovement.unit,
      packagingSummary: newMovement.packagingSummary,
      user: newMovement.requestedBy,
      status: 'Completed',
    }

    setMovementsData([record, ...movementsData])
    setShowCreateModal(false)
    triggerToast(`Movement ${refCode} successfully executed!`)
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
      `"${r.dateTime}"`,
      `"${r.refNo}"`,
      `"${r.type}"`,
      `"${r.productName.replace(/"/g, '""')}"`,
      `"${r.sku}"`,
      `"${r.batchNo}"`,
      `"${r.fromLocation}"`,
      `"${r.toLocation}"`,
      r.quantity,
      `"${r.unit}"`,
      `"${r.packagingSummary}"`,
      `"${r.user}"`,
      `"${r.status}"`,
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
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-bounce border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
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
              Track intra-warehouse bin transfers, staging dispatch movements, and audit adjustments.
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
            onClick={() => setShowCreateModal(true)}
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
            <p className="text-xs font-semibold text-slate-500">Total Movements</p>
            <h3 className="text-xl font-bold text-slate-800 leading-tight mt-0.5">
              {stats.total}
            </h3>
            <p className="text-[11px] text-indigo-600 font-medium">Logged in ledger</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center shrink-0">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Internal Relocations</p>
            <h3 className="text-xl font-bold text-slate-800 leading-tight mt-0.5">
              {stats.internal}
            </h3>
            <p className="text-[11px] text-sky-600 font-medium">Bin-to-bin transfers</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Inward Dock Moves</p>
            <h3 className="text-xl font-bold text-slate-800 leading-tight mt-0.5">
              {stats.inward}
            </h3>
            <p className="text-[11px] text-emerald-600 font-medium">Check-in put-away</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
            <ArrowRight className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Outward Staging</p>
            <h3 className="text-xl font-bold text-slate-800 leading-tight mt-0.5">
              {stats.outward}
            </h3>
            <p className="text-[11px] text-rose-600 font-medium">Pre-dispatch transfers</p>
          </div>
        </div>
      </div>

      {/* 100% Full-Width Stock Movements Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
        {/* Table Toolbar & Tabs */}
        <div className="p-4 sm:p-5 border-b border-slate-100 space-y-3.5">
          {/* Movement Type Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar p-1 bg-slate-100 rounded-xl text-xs font-semibold max-w-full">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('ALL')
                  setCurrentPage(1)
                }}
                className={`px-3.5 py-1.5 rounded-lg transition whitespace-nowrap cursor-pointer shrink-0 ${
                  activeTab === 'ALL'
                    ? 'bg-white text-indigo-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Movements ({movementsData.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('INTERNAL')
                  setCurrentPage(1)
                }}
                className={`px-3.5 py-1.5 rounded-lg transition whitespace-nowrap cursor-pointer shrink-0 ${
                  activeTab === 'INTERNAL'
                    ? 'bg-white text-sky-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Internal ({movementsData.filter((m) => m.type === 'Internal').length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('INWARD')
                  setCurrentPage(1)
                }}
                className={`px-3.5 py-1.5 rounded-lg transition whitespace-nowrap cursor-pointer shrink-0 ${
                  activeTab === 'INWARD'
                    ? 'bg-white text-emerald-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Inward ({movementsData.filter((m) => m.type === 'Inward').length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('OUTWARD')
                  setCurrentPage(1)
                }}
                className={`px-3.5 py-1.5 rounded-lg transition whitespace-nowrap cursor-pointer shrink-0 ${
                  activeTab === 'OUTWARD'
                    ? 'bg-white text-rose-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Outward ({movementsData.filter((m) => m.type === 'Outward').length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('ADJUST')
                  setCurrentPage(1)
                }}
                className={`px-3.5 py-1.5 rounded-lg transition whitespace-nowrap cursor-pointer shrink-0 ${
                  activeTab === 'ADJUST'
                    ? 'bg-white text-purple-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Adjustments ({movementsData.filter((m) => m.type === 'Adjust').length})
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setActiveTab('ALL')
                setFilterType('ALL')
                setSearchQuery('')
                setCurrentPage(1)
                triggerToast('Filters reset to default.')
              }}
              className="text-xs font-semibold text-slate-500 hover:text-indigo-600 flex items-center gap-1.5 transition cursor-pointer self-end sm:self-auto shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>

          {/* Search and Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5 items-center text-xs">
            <div className="lg:col-span-8 relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Ref No, Product, Batch, From/To location, Operator..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
              />
            </div>

            <div className="lg:col-span-4">
              <CustomSelect
                value={filterType}
                onChange={setFilterType}
                options={typeOptions}
                zIndexClass="z-30"
              />
            </div>
          </div>
        </div>

        {/* Full-Width Table */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs divide-y divide-slate-200">
            <thead className="bg-slate-50/80 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4 w-12 text-center">#</th>
                <th className="py-3.5 px-4 min-w-[130px]">Date &amp; Time</th>
                <th className="py-3.5 px-4 min-w-[125px]">Ref No.</th>
                <th className="py-3.5 px-4 text-center min-w-[95px]">Type</th>
                <th className="py-3.5 px-4 min-w-[200px]">Product Stored</th>
                <th className="py-3.5 px-4 min-w-[120px]">Batch No.</th>
                <th className="py-3.5 px-4 min-w-[140px]">From Location</th>
                <th className="py-3.5 px-4 min-w-[140px]">To Location</th>
                <th className="py-3.5 px-4 text-center min-w-[110px]">Quantity</th>
                <th className="py-3.5 px-4 min-w-[140px]">Operator</th>
                <th className="py-3.5 px-4 text-center w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {paginatedMovements.length === 0 ? (
                <tr>
                  <td colSpan="11" className="py-10 text-center text-slate-400">
                    No stock movement records found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedMovements.map((row, idx) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 text-center text-slate-400 font-bold text-[11px]">
                      {(currentPage - 1) * perPage + idx + 1}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {row.dateTime}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {row.refNo}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          row.type === 'Internal'
                            ? 'bg-sky-50 text-sky-700 border border-sky-200'
                            : row.type === 'Inward'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : row.type === 'Outward'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-purple-50 text-purple-700 border border-purple-200'
                        }`}
                      >
                        {row.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{row.productName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{row.packagingSummary}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-700 text-[11px]">
                      {row.batchNo}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600 text-[11px]">
                      {row.fromLocation}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-600 text-[11px]">
                      {row.toLocation}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-900">
                      {row.quantity > 0 ? `+${row.quantity}` : row.quantity} {row.unit}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {row.user}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setShowDetailModal(row)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 transition"
                          title="View Movement Voucher"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowDetailModal(row)
                            setTimeout(() => {
                              printSpecificElement('#printable-movement-voucher', `Movement Voucher - ${row.refNo}`)
                            }, 300)
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 transition"
                          title="Print Movement Slip"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 bg-slate-50/80 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium">
          <div>
            Showing <strong>{filteredMovements.length > 0 ? (currentPage - 1) * perPage + 1 : 0}</strong> to{' '}
            <strong>{Math.min(currentPage * perPage, filteredMovements.length)}</strong> of{' '}
            <strong>{filteredMovements.length}</strong> movements
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
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setCurrentPage(p)}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  currentPage === p
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {p}
              </button>
            ))}
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

      {/* MODAL 1: Record Movement Modal */}
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
                  <p className="text-[11px] text-slate-500">Intra-depot transit and bin re-allocation</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Source Bin *</label>
                  <input
                    type="text"
                    required
                    value={newMovement.fromLocation}
                    onChange={(e) => setNewMovement({ ...newMovement, fromLocation: e.target.value })}
                    placeholder="e.g. SH01-R01-C01"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Destination Bin *</label>
                  <input
                    type="text"
                    required
                    value={newMovement.toLocation}
                    onChange={(e) => setNewMovement({ ...newMovement, toLocation: e.target.value })}
                    placeholder="e.g. SH03-R05-C02"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-mono font-bold text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Quantity</label>
                  <input
                    type="number"
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
                    placeholder="e.g. 200 Gatta @ 6 pcs"
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
                  placeholder="e.g. Dispatch staging re-allocation"
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
                  className="flex-1 sm:flex-none justify-center bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl text-xs font-bold transition cursor-pointer text-center"
                >
                  Execute Movement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Stock Movement Transit Slip */}
      {showDetailModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-4 sm:p-6 max-h-[90dvh] overflow-y-auto shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                  MOV
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-800">Stock Movement Transit Voucher</h3>
                  <p className="text-[11px] text-slate-500">Authorized Intra-Depot Movement • {showDetailModal.refNo}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDetailModal(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Printable Voucher Card */}
            <div id="printable-movement-voucher" className="printable-area border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3.5 text-xs font-sans">
              <div className="flex items-start justify-between border-b pb-2.5 border-slate-200">
                <div>
                  <h4 className="text-xs font-black uppercase text-slate-900">CENTRAL WAREHOUSE LOGISTICS</h4>
                  <p className="text-[10px] text-slate-500">Internal Inventory Transfer Slip</p>
                </div>
                <div className="text-right font-mono text-[11px]">
                  <strong className="text-slate-900 block">{showDetailModal.refNo}</strong>
                  <span className="text-slate-400 text-[10px]">{showDetailModal.dateTime}</span>
                </div>
              </div>

              {/* Transit Route Visualization */}
              <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200">
                <div className="text-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Origin</span>
                  <strong className="font-mono text-xs text-slate-800">{showDetailModal.fromLocation}</strong>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-indigo-600 font-bold mb-0.5">{showDetailModal.type}</span>
                  <ArrowRight className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="text-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Destination</span>
                  <strong className="font-mono text-xs text-indigo-700">{showDetailModal.toLocation}</strong>
                </div>
              </div>

              <div className="space-y-1 text-[11px] bg-white p-3 rounded-xl border border-slate-200">
                <div className="flex justify-between">
                  <span className="text-slate-500">Product:</span>
                  <strong className="text-slate-800">{showDetailModal.productName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Batch Number:</span>
                  <strong className="font-mono text-slate-800">{showDetailModal.batchNo}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Quantity Transferred:</span>
                  <strong className="font-mono text-slate-900">{showDetailModal.quantity} {showDetailModal.unit}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Packaging Ratio:</span>
                  <span className="text-slate-700 font-medium">{showDetailModal.packagingSummary}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-100">
                  <span className="text-slate-500">Authorized By:</span>
                  <span className="text-slate-800 font-semibold">{showDetailModal.user}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                <span>Voucher Hash: SHA256-{showDetailModal.refNo}</span>
                <span>Status: Confirmed &amp; Updated in Bin Ledger</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowDetailModal(null)}
                className="flex-1 sm:flex-none justify-center px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer text-center"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => printSpecificElement('#printable-movement-voucher', `Movement Voucher - ${showDetailModal.refNo}`)}
                className="flex-1 sm:flex-none justify-center inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition cursor-pointer text-center"
              >
                <Printer className="w-4 h-4 shrink-0" />
                <span>Print Transit Voucher</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
