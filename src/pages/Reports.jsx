import { useState, useMemo, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  FileSpreadsheet,
  BarChart3,
  Download,
  Calendar,
  Layers,
  Package,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Clock,
  Search,
  ChevronDown,
  Check,
  X,
  RotateCcw,
  Eye,
  Printer,
  ShieldCheck,
  SlidersHorizontal,
  Plus,
  Send,
  Truck,
  FlaskConical,
} from 'lucide-react'

// Custom Accessible Select Dropdown
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

// 6 Dedicated Warehouse Shades
const SHADES = [
  { id: 'SH01', name: 'Shade 1: Grains & Bulk Pulses' },
  { id: 'SH02', name: 'Shade 2: Edible Oils & Liquids' },
  { id: 'SH03', name: 'Shade 3: Packaged Food & FMCG' },
  { id: 'SH04', name: 'Shade 4: Packaging Materials & Cartons' },
  { id: 'SH05', name: 'Shade 5: Chemicals & Hygiene' },
  { id: 'SH06', name: 'Shade 6: Spares & General Goods' },
]

export default function Reports() {
  // Toast notifications state
  const [toastMessage, setToastMessage] = useState(null)
  const triggerToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Filter toolbar state
  const [filterCategory, setFilterCategory] = useState('ALL')
  const [filterShade, setFilterShade] = useState('ALL')
  const [filterFrequency, setFilterFrequency] = useState('ALL')
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const perPage = 7

  // Modals state
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(null)

  // Schedule Modal Form state
  const [scheduleConfig, setScheduleConfig] = useState({
    reportName: 'Consolidated Warehouse Stock Valuation',
    frequency: 'Daily (08:00 IST)',
    format: 'Excel & CSV',
    recipients: 'warehouse.manager@logistics.com, audit@centralhub.com',
    shadeId: 'SH03',
  })

  // 8 Curated Warehouse Reports
  const [reportsList, setReportsList] = useState([
    {
      id: 1,
      name: 'Consolidated Warehouse Stock Valuation',
      code: 'RPT-STK-001',
      category: 'Inventory',
      shadeId: 'SH03',
      shadeName: 'Shade 3: Packaged FMCG',
      frequency: 'Daily',
      formats: ['Excel', 'PDF', 'CSV'],
      lastGenerated: 'Today, 08:00 IST',
      generatedBy: 'Rajesh Sharma',
      recordsCount: 5842,
      status: 'Active',
      description: 'Comprehensive stock ledger with dual-unit breakdown (Units & Gatta) and valuation.',
    },
    {
      id: 2,
      name: 'Inward GRN & Gate Inward Audit Log',
      code: 'RPT-GRN-002',
      category: 'Inward Operations',
      shadeId: 'SH01',
      shadeName: 'Shade 1: Grains & Pulses',
      frequency: 'Daily',
      formats: ['Excel', 'PDF'],
      lastGenerated: 'Today, 09:30 IST',
      generatedBy: 'Amit Patel',
      recordsCount: 1240,
      status: 'Active',
      description: 'Vendor delivery receipts, weighbridge gross/tare weights, and PO indent reconciliation.',
    },
    {
      id: 3,
      name: 'Outward Dispatch & Manifest Summary',
      code: 'RPT-DSP-003',
      category: 'Outward Operations',
      shadeId: 'SH03',
      shadeName: 'Shade 3: Packaged FMCG',
      frequency: 'Daily',
      formats: ['Excel', 'CSV'],
      lastGenerated: 'Yesterday, 18:00 IST',
      generatedBy: 'Rajesh Sharma',
      recordsCount: 980,
      status: 'Active',
      description: 'Customer deliveries, vehicle registration numbers, driver manifests, and delivery ETAs.',
    },
    {
      id: 4,
      name: 'QA Lab Clearance & Certificate Register',
      code: 'RPT-LAB-004',
      category: 'Quality & Labs',
      shadeId: 'SH02',
      shadeName: 'Shade 2: Edible Oils',
      frequency: 'Weekly',
      formats: ['PDF', 'Excel'],
      lastGenerated: '15 Sep 2026',
      generatedBy: 'Dr. Priya Verma',
      recordsCount: 340,
      status: 'Active',
      description: 'FSSAI chemical purity, moisture content, and micro-biology test results.',
    },
    {
      id: 5,
      name: 'Hold Stock & Quarantine Incident Log',
      code: 'RPT-HLD-005',
      category: 'Inventory',
      shadeId: 'SH05',
      shadeName: 'Shade 5: Chemicals & Hygiene',
      frequency: 'Weekly',
      formats: ['Excel', 'PDF'],
      lastGenerated: '14 Sep 2026',
      generatedBy: 'Sanjay Rawat',
      recordsCount: 48,
      status: 'Active',
      description: 'Quarantined commodities, damaged carton write-offs, and root-cause disposition.',
    },
    {
      id: 6,
      name: 'Storage Shade & 2D Bin Capacity Utilization',
      code: 'RPT-BIN-006',
      category: 'Warehouse Management',
      shadeId: 'ALL',
      shadeName: 'All 6 Dedicated Shades',
      frequency: 'Weekly',
      formats: ['Excel', 'CSV'],
      lastGenerated: '13 Sep 2026',
      generatedBy: 'Vikram Singh',
      recordsCount: 420,
      status: 'Active',
      description: 'Occupancy percentages, vacant rack slots, and high-velocity fast-moving pick aisles.',
    },
    {
      id: 7,
      name: 'Reorder Level & Low Stock Depletion Alert',
      code: 'RPT-ORD-007',
      category: 'Inventory',
      shadeId: 'SH01',
      shadeName: 'Shade 1: Grains & Pulses',
      frequency: 'Daily',
      formats: ['Excel', 'PDF'],
      lastGenerated: 'Today, 07:45 IST',
      generatedBy: 'System Automated',
      recordsCount: 52,
      status: 'Active',
      description: 'SKUs breaching safety threshold requiring immediate supplier purchase indents.',
    },
    {
      id: 8,
      name: 'Gate Pass Outward & Security Perimeter Exit',
      code: 'RPT-GPO-008',
      category: 'Outward Operations',
      shadeId: 'ALL',
      shadeName: 'All 6 Dedicated Shades',
      frequency: 'Monthly',
      formats: ['Excel', 'PDF', 'CSV'],
      lastGenerated: '01 Sep 2026',
      generatedBy: 'Security Lead',
      recordsCount: 246,
      status: 'Active',
      description: 'Gate pass authorizations, security stamps, and vehicle exit timestamps.',
    },
  ])

  // Filtered Reports
  const filteredReports = useMemo(() => {
    return reportsList.filter((item) => {
      if (filterCategory !== 'ALL' && item.category !== filterCategory) return false
      if (filterShade !== 'ALL' && item.shadeId !== filterShade && item.shadeId !== 'ALL') return false
      if (filterFrequency !== 'ALL' && item.frequency !== filterFrequency) return false
      if (filterStatus !== 'ALL' && item.status !== filterStatus) return false

      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase()
        return (
          item.name.toLowerCase().includes(q) ||
          item.code.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.generatedBy.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [reportsList, filterCategory, filterShade, filterFrequency, filterStatus, searchQuery])

  // Paginated Results
  const totalPages = Math.max(1, Math.ceil(filteredReports.length / perPage))
  const paginatedReports = filteredReports.slice((currentPage - 1) * perPage, currentPage * perPage)

  // Download Trigger Mock
  const handleDownloadReport = (report, format) => {
    const csvContent =
      'data:text/csv;charset=utf-8,Report Code,Report Name,Category,Records,Generated On,Author\n' +
      `"${report.code}","${report.name}","${report.category}",${report.recordsCount},"${report.lastGenerated}","${report.generatedBy}"\n`
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `${report.code}_${report.name.replace(/\s+/g, '_')}.${format.toLowerCase() === 'excel' ? 'csv' : 'csv'}`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    triggerToast(`Downloaded ${report.name} in ${format} format.`)
  }

  // Handle Schedule Submit
  const handleScheduleSubmit = (e) => {
    e.preventDefault()
    setShowScheduleModal(false)
    triggerToast(`Automated schedule saved for "${scheduleConfig.reportName}".`)
  }

  // Dropdown Options
  const categoryOptions = [
    { value: 'ALL', label: 'All Report Categories' },
    { value: 'Inventory', label: 'Inventory & Stock Valuation' },
    { value: 'Inward Operations', label: 'Inward GRN Operations' },
    { value: 'Outward Operations', label: 'Outward Dispatch Operations' },
    { value: 'Quality & Labs', label: 'Quality & Lab Clearances' },
    { value: 'Warehouse Management', label: 'Warehouse & Bin Matrix' },
  ]

  const shadeOptions = [
    { value: 'ALL', label: 'All 6 Dedicated Shades' },
    ...SHADES.map((s) => ({ value: s.id, label: s.name })),
  ]

  const frequencyOptions = [
    { value: 'ALL', label: 'All Frequencies' },
    { value: 'Daily', label: 'Daily Automated Reports' },
    { value: 'Weekly', label: 'Weekly Consolidated Reports' },
    { value: 'Monthly', label: 'Monthly Executive Audits' },
  ]

  const statusOptions = [
    { value: 'ALL', label: 'All Report Statuses' },
    { value: 'Active', label: 'Active Reporting Pipeline' },
    { value: 'Paused', label: 'Paused' },
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
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200/80 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs shrink-0">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">Warehouse Reports &amp; Audit Logs</h1>
              <span className="text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60 px-2.5 py-0.5 rounded-full shrink-0">
                Reporting Hub
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1 max-w-2xl">
              Generate, schedule, and preview operational audit reports across Inventory, Inward GRN, Outward Dispatches, and Quality testing.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">
          <Link
            to="/analytics"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition shrink-0"
          >
            <BarChart3 className="w-3.5 h-3.5 text-slate-500" />
            <span>View Analytics</span>
          </Link>

          <Link
            to="/export"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition shrink-0"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Studio</span>
          </Link>

          <button
            type="button"
            onClick={() => setShowScheduleModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition shrink-0 cursor-pointer"
          >
            <Clock className="w-4 h-4" />
            <span>Schedule Report</span>
          </button>
        </div>
      </div>

      {/* 4 Dynamic KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center gap-3.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-500 truncate">Total Stock Valuation</p>
            <h3 className="text-xl font-bold text-slate-800 leading-tight mt-0.5 truncate">
              ₹ 12.48 Cr
            </h3>
            <p className="text-[11px] text-emerald-600 font-medium truncate">↑ 8% vs last month</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center gap-3.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-500 truncate">Active SKUs Monitored</p>
            <h3 className="text-xl font-bold text-slate-800 leading-tight mt-0.5 truncate">
              5,842 SKUs
            </h3>
            <p className="text-[11px] text-emerald-600 font-medium truncate">Across 6 warehouse shades</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center gap-3.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-500 truncate">Inward Goods (GRN)</p>
            <h3 className="text-xl font-bold text-slate-800 leading-tight mt-0.5 truncate">
              1,240 Batches
            </h3>
            <p className="text-[11px] text-blue-600 font-medium truncate">Received &amp; lab cleared</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center gap-3.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0">
            <Send className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-500 truncate">Outward Dispatches</p>
            <h3 className="text-xl font-bold text-slate-800 leading-tight mt-0.5 truncate">
              980 Shipments
            </h3>
            <p className="text-[11px] text-purple-600 font-medium truncate">Retail &amp; DC consignments</p>
          </div>
        </div>
      </div>

      {/* Reports Master Card */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
        {/* Filter Section Header & Inputs */}
        <div className="p-4 sm:p-5 border-b border-slate-100 space-y-4">
          {/* Top Line: Section Title & Results Count */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-800">Operational Report Catalog</h2>
                <p className="text-[11px] text-slate-500">Filter reports by operational module, storage shade, frequency, or status.</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs bg-indigo-50 text-indigo-700 font-bold px-3 py-1 rounded-full border border-indigo-200/60">
                {filteredReports.length} Reports Available
              </span>
              {(searchQuery || filterCategory !== 'ALL' || filterShade !== 'ALL' || filterFrequency !== 'ALL' || filterStatus !== 'ALL') && (
                <button
                  type="button"
                  onClick={() => {
                    setFilterCategory('ALL')
                    setFilterShade('ALL')
                    setFilterFrequency('ALL')
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
              placeholder="Search report by name, code (RPT-...), operational module, author, or keyword..."
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
                Report Category
              </label>
              <CustomSelect
                value={filterCategory}
                onChange={(val) => {
                  setFilterCategory(val)
                  setCurrentPage(1)
                }}
                options={categoryOptions}
                placeholder="All Categories"
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
                Generation Frequency
              </label>
              <CustomSelect
                value={filterFrequency}
                onChange={(val) => {
                  setFilterFrequency(val)
                  setCurrentPage(1)
                }}
                options={frequencyOptions}
                placeholder="All Frequencies"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1.5">
                Pipeline Status
              </label>
              <CustomSelect
                value={filterStatus}
                onChange={(val) => {
                  setFilterStatus(val)
                  setCurrentPage(1)
                }}
                options={statusOptions}
                placeholder="All Statuses"
              />
            </div>
          </div>
        </div>

        {/* Reports Table */}
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4 min-w-[220px]">Report Name &amp; Code</th>
                <th className="py-3 px-4 min-w-[150px]">Operational Module</th>
                <th className="py-3 px-4 min-w-[140px]">Frequency &amp; Shade</th>
                <th className="py-3 px-4 min-w-[120px] text-right">Records Count</th>
                <th className="py-3 px-4 min-w-[140px]">Last Generated</th>
                <th className="py-3 px-4 min-w-[100px] text-center">Formats</th>
                <th className="py-3 px-4 min-w-[130px] text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedReports.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <FileSpreadsheet className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    No reports match the selected filters.
                  </td>
                </tr>
              ) : (
                paginatedReports.map((row, idx) => {
                  const globalIdx = (currentPage - 1) * perPage + idx + 1
                  return (
                    <tr key={row.id} className="hover:bg-slate-50/60 transition group">
                      <td className="py-3 px-4 text-center text-slate-400 font-mono text-[11px]">
                        {globalIdx}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-800 hover:text-indigo-600 transition cursor-pointer" onClick={() => setShowPreviewModal(row)}>
                          {row.name}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-1.5">
                          <span className="bg-slate-100 px-1.5 py-0.2 rounded font-bold text-slate-600">{row.code}</span>
                          <span className="truncate max-w-[220px]">{row.description}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {row.category}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-700 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{row.frequency}</span>
                        </div>
                        <div className="text-[10px] text-indigo-600 font-bold mt-0.5">{row.shadeId}</div>
                      </td>

                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        {row.recordsCount.toLocaleString()} rows
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800">{row.lastGenerated}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">By {row.generatedBy}</div>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {row.formats.map((fmt, i) => (
                            <span
                              key={i}
                              className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                                fmt === 'Excel'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : fmt === 'PDF'
                                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : 'bg-blue-50 text-blue-700 border-blue-200'
                              }`}
                            >
                              {fmt}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setShowPreviewModal(row)}
                            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 transition cursor-pointer"
                            title="Preview Report"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-600" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDownloadReport(row, 'Excel')}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold transition cursor-pointer shadow-xs"
                            title="Download Report"
                          >
                            <Download className="w-3 h-3" />
                            <span>Export</span>
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

        {/* Table Pagination Footer */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Showing {(currentPage - 1) * perPage + 1} to{' '}
            {Math.min(currentPage * perPage, filteredReports.length)} of{' '}
            {filteredReports.length} reports
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 font-semibold cursor-pointer disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setCurrentPage(num)}
                className={`w-8 h-8 rounded-lg font-bold transition cursor-pointer ${
                  currentPage === num
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white border border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 font-semibold cursor-pointer disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* MODAL 1: SCHEDULE AUTOMATED REPORT */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-4 sm:p-6 max-h-[90dvh] overflow-y-auto no-scrollbar animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-800">Schedule Automated Report</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowScheduleModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Report Template Name *
                </label>
                <input
                  type="text"
                  required
                  value={scheduleConfig.reportName}
                  onChange={(e) => setScheduleConfig({ ...scheduleConfig, reportName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Frequency *
                  </label>
                  <CustomSelect
                    value={scheduleConfig.frequency}
                    onChange={(val) => setScheduleConfig({ ...scheduleConfig, frequency: val })}
                    options={[
                      { value: 'Daily (08:00 IST)', label: 'Daily (08:00 IST)' },
                      { value: 'Weekly (Monday 09:00)', label: 'Weekly (Monday 09:00)' },
                      { value: 'Monthly (1st of Month)', label: 'Monthly (1st of Month)' },
                    ]}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Export Format *
                  </label>
                  <CustomSelect
                    value={scheduleConfig.format}
                    onChange={(val) => setScheduleConfig({ ...scheduleConfig, format: val })}
                    options={[
                      { value: 'Excel & CSV', label: 'Excel & CSV' },
                      { value: 'PDF Document', label: 'PDF Document' },
                    ]}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Recipient Email Addresses (Comma-separated) *
                </label>
                <input
                  type="text"
                  required
                  value={scheduleConfig.recipients}
                  onChange={(e) => setScheduleConfig({ ...scheduleConfig, recipients: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition cursor-pointer"
                >
                  Activate Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: REPORT PREVIEW */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full p-4 sm:p-6 max-h-[90dvh] overflow-y-auto no-scrollbar animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-800">{showPreviewModal.name}</h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{showPreviewModal.code} • {showPreviewModal.category}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowPreviewModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase">Records</span>
                  <p className="font-bold text-slate-800">{showPreviewModal.recordsCount.toLocaleString()} rows</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase">Frequency</span>
                  <p className="font-bold text-indigo-600">{showPreviewModal.frequency}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase">Author</span>
                  <p className="font-bold text-slate-800">{showPreviewModal.generatedBy}</p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 mb-2">Sample Snapshot Table</h4>
                <div className="border border-slate-200 rounded-xl overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[340px]">
                    <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Item / Description</th>
                        <th className="py-2.5 px-3">Location</th>
                        <th className="py-2.5 px-3 text-right">Available Units</th>
                        <th className="py-2.5 px-3 text-center">QC Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                      <tr>
                        <td className="py-2.5 px-3 font-sans font-semibold text-slate-800">Parle-G Glucose Biscuits (50g)</td>
                        <td className="py-2.5 px-3 text-indigo-600">SH03-R02-C04</td>
                        <td className="py-2.5 px-3 text-right font-bold">18,450 Pcs</td>
                        <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">PASSED</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-sans font-semibold text-slate-800">Fortune Refined Mustard Oil</td>
                        <td className="py-2.5 px-3 text-indigo-600">SH02-R01-C03</td>
                        <td className="py-2.5 px-3 text-right font-bold">4,500 Ltr</td>
                        <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">PASSED</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-sans font-semibold text-slate-800">Sharbati Golden Wheat Flour</td>
                        <td className="py-2.5 px-3 text-indigo-600">SH01-R02-C08</td>
                        <td className="py-2.5 px-3 text-right font-bold">12,500 Kg</td>
                        <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">PASSED</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold transition cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleDownloadReport(showPreviewModal, 'Excel')
                    setShowPreviewModal(null)
                  }}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Full Report (.csv)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
