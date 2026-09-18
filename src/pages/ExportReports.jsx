import { useState } from 'react'
import { X, Check, Clock, FileText } from 'lucide-react'

export default function ExportReports() {
  // Toast notifications state
  const [toastMessage, setToastMessage] = useState(null)
  const triggerToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Active Category Tab state
  const [activeCategory, setActiveCategory] = useState('inventory')

  // Column selection state (12 attributes)
  const [columns, setColumns] = useState({
    productName: true,
    sku: true,
    category: false,
    batchNo: true,
    location: true,
    currentStock: true,
    unit: true,
    expiryDate: true,
    manufacturingDate: false,
    supplier: false,
    reorderLevel: true,
    remarks: false,
  })

  // Master toggle for columns
  const areAllSelected = Object.values(columns).every(Boolean)
  const handleToggleSelectAll = () => {
    const newState = !areAllSelected
    const updated = {}
    Object.keys(columns).forEach((key) => {
      updated[key] = newState
    })
    setColumns(updated)
  }

  // Filter Data state
  const [selectedReport, setSelectedReport] = useState('Current Stock Report')
  const [dateRange, setDateRange] = useState('01 Sep 2026 - 16 Sep 2026')
  const [filterLocation, setFilterLocation] = useState('All Locations')
  const [filterCategory, setFilterCategory] = useState('All Categories')
  const [searchProduct, setSearchProduct] = useState('')
  const [stockStatus, setStockStatus] = useState('All')
  const [batchStatus, setBatchStatus] = useState('All')
  const [includeZeroStock, setIncludeZeroStock] = useState(false)
  const [groupByLocation, setGroupByLocation] = useState(true)

  // Export Options state
  const [fileFormat, setFileFormat] = useState('excel') // 'excel' | 'pdf'
  const [fileName, setFileName] = useState('current-stock-report_16-09-2026')
  const [pdfOrientation, setPdfOrientation] = useState('portrait') // 'portrait' | 'landscape'
  const [additionalOptions, setAdditionalOptions] = useState({
    includeSummary: true,
    addCompanyHeader: false,
    includeCharts: true,
    includeGeneratedByDate: false,
  })

  // Modals state
  const [showScheduledModal, setShowScheduledModal] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(null)
  const [recentExportsList, setRecentExportsList] = useState([
    {
      id: 1,
      name: 'Current Stock Report',
      type: 'Inventory',
      typeColor: 'bg-teal-50 text-teal-700 border-teal-200',
      filters: 'All Locations | All Categories',
      format: 'Excel',
      formatColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      generatedOn: '16 Sep 2026 10:20',
      generatedBy: 'Col. A. Sharma',
      status: 'Completed',
    },
    {
      id: 2,
      name: 'GRN Report',
      type: 'Transaction',
      typeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      filters: '01 Sep - 16 Sep 2026',
      format: 'PDF',
      formatColor: 'bg-rose-50 text-rose-700 border-rose-200',
      generatedOn: '15 Sep 2026 16:45',
      generatedBy: 'R. Kumar',
      status: 'Completed',
    },
    {
      id: 3,
      name: 'Damage / Rejection Report',
      type: 'Quality',
      typeColor: 'bg-purple-50 text-purple-700 border-purple-200',
      filters: 'All Locations',
      format: 'Excel',
      formatColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      generatedOn: '14 Sep 2026 12:30',
      generatedBy: 'M. Singh',
      status: 'Completed',
    },
    {
      id: 4,
      name: 'Stock Movement Report',
      type: 'Movement',
      typeColor: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      filters: '01 Sep - 15 Sep 2026',
      format: 'Excel',
      formatColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      generatedOn: '12 Sep 2026 09:15',
      generatedBy: 'S. Yadav',
      status: 'Completed',
    },
    {
      id: 5,
      name: 'Expiry Report',
      type: 'Inventory',
      typeColor: 'bg-teal-50 text-teal-700 border-teal-200',
      filters: 'Next 30 Days',
      format: 'PDF',
      formatColor: 'bg-rose-50 text-rose-700 border-rose-200',
      generatedOn: '10 Sep 2026 14:22',
      generatedBy: 'P. Sharma',
      status: 'Completed',
    },
  ])

  // Category Cards Data (6 Cards in Row)
  const reportCategories = [
    {
      id: 'inventory',
      title: 'Inventory Reports',
      subtitle: 'Stock, location, batch, expiry',
      icon: (
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      bgIcon: 'bg-[#1E3A1E]',
    },
    {
      id: 'transaction',
      title: 'Transaction Reports',
      subtitle: 'GRN, issue, dispatch, gate pass',
      icon: (
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ),
      bgIcon: 'bg-teal-700',
    },
    {
      id: 'quality',
      title: 'Quality Reports',
      subtitle: 'Lab testing, damage, rejection',
      icon: (
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
      bgIcon: 'bg-emerald-800',
    },
    {
      id: 'movement',
      title: 'Movement Reports',
      subtitle: 'Inward, outward, adjustments',
      icon: (
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
        </svg>
      ),
      bgIcon: 'bg-[#166534]',
    },
    {
      id: 'master',
      title: 'Master Data Reports',
      subtitle: 'Products, locations, suppliers',
      icon: (
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
        </svg>
      ),
      bgIcon: 'bg-emerald-900',
    },
    {
      id: 'audit',
      title: 'Audit Reports',
      subtitle: 'Activity logs, user actions',
      icon: (
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      bgIcon: 'bg-teal-800',
    },
  ]

  // Handle Export Trigger
  const handleGenerateExport = () => {
    triggerToast(`Generating ${fileFormat.toUpperCase()} file: ${fileName}.${fileFormat === 'excel' ? 'xlsx' : 'pdf'}...`)

    // Prepend to recent exports
    const newEntry = {
      id: Date.now(),
      name: selectedReport,
      type: activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1),
      typeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      filters: `${filterLocation} | ${filterCategory}`,
      format: fileFormat === 'excel' ? 'Excel' : 'PDF',
      formatColor: fileFormat === 'excel' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200',
      generatedOn: 'Just now',
      generatedBy: 'Col. A. Sharma',
      status: 'Completed',
    }
    setRecentExportsList([newEntry, ...recentExportsList.slice(0, 4)])

    if (fileFormat === 'pdf') {
      setShowPreviewModal({
        name: selectedReport,
        fileName: `${fileName}.pdf`,
        format: 'PDF',
        orientation: pdfOrientation,
      })
    }
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-[1600px] mx-auto min-h-screen bg-slate-50/50 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900 text-white text-xs shadow-2xl border border-slate-700 animate-slide-in">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white p-1 ml-2 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* TOP HIMALAYAN CONVOY BANNER WITH SIGN */}
      <div className="relative rounded-xl overflow-hidden shadow-md border border-slate-200/80 bg-slate-900 h-28 sm:h-32">
        <img
          src="/border.png"
          alt="Central Warehouse Logistics Operations"
          className="w-full h-full object-cover object-center opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-black/60" />

        {/* Right side slogan billboard & flag pill matching screenshot */}
        <div className="absolute top-3 right-4 flex flex-col items-end gap-1.5">
          <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
            <div className="h-2 w-5 flex flex-col justify-between rounded-xs overflow-hidden">
              <div className="h-0.5 bg-[#FF9933]" />
              <div className="h-0.5 bg-white" />
              <div className="h-0.5 bg-[#138808]" />
            </div>
            <span className="text-[10px] font-bold text-white tracking-widest uppercase">
              NATION FIRST ALWAYS
            </span>
          </div>
          <div className="bg-black/50 backdrop-blur-md px-2.5 py-0.5 rounded border border-white/10 text-[9px] font-mono font-bold text-amber-300 tracking-wider hidden sm:block">
            SECURE SUPPLY | STRONGER NATION
          </div>
        </div>
      </div>

      {/* PAGE HEADER ROW */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Left Title & Icon */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#1E3A1E] text-white flex items-center justify-center shadow-xs shrink-0">
                {/* Export Document Icon */}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-800 tracking-tight">
                  Export Reports
                </h1>
                <p className="text-xs text-slate-500">
                  Generate and download reports in Excel or PDF format for inventory, transactions, and warehouse operations.
                </p>
              </div>
            </div>

            {/* Right Breadcrumbs & Scheduled Reports Button */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="text-[11px] text-slate-400 font-medium hidden md:block">
                <span>Home</span>
                <span className="mx-1.5">›</span>
                <span>Export</span>
                <span className="mx-1.5">›</span>
                <span className="text-slate-600 font-semibold">Export Reports</span>
              </div>

              <button
                type="button"
                onClick={() => setShowScheduledModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1E3A1E] hover:bg-[#2a4e2a] text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Scheduled Reports</span>
              </button>
            </div>
          </div>

        {/* 6 Category Selector Cards (Horizontal Row) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
          {reportCategories.map((cat) => {
            const isActive = activeCategory === cat.id
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setActiveCategory(cat.id)
                  triggerToast(`Category switched to: ${cat.title}`)
                }}
                className={`p-3 rounded-xl border text-left transition-all duration-150 flex items-start gap-2.5 ${
                  isActive
                    ? 'bg-[#1E3A1E]/5 border-[#1E3A1E] ring-1 ring-[#1E3A1E]/30 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg ${cat.bgIcon} flex items-center justify-center shrink-0 shadow-xs`}>
                  {cat.icon}
                </div>
                <div className="truncate">
                  <div className={`text-xs font-bold truncate ${isActive ? 'text-[#1E3A1E]' : 'text-slate-800'}`}>
                    {cat.title}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">
                    {cat.subtitle}
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Middle Configuration Section (3 Columns, Grid 12) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4">
          {/* Column 1: Select Report & Include Columns (Span 4) */}
          <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between">
            <div>
              {/* Card Header */}
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-4 h-4 text-[#1E3A1E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="text-xs font-bold text-slate-800">
                  Select Report
                </h3>
              </div>

              {/* Report Selection Dropdown */}
              <div className="mb-2">
                <select
                  value={selectedReport}
                  onChange={(e) => {
                    setSelectedReport(e.target.value)
                    setFileName(e.target.value.toLowerCase().replace(/\s+/g, '-') + '_16-09-2026')
                  }}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-[#1E3A1E]"
                >
                  <option>Current Stock Report</option>
                  <option>Stock Valuation Summary</option>
                  <option>Low Stock Replenishment List</option>
                  <option>Batch Expiry Analysis</option>
                  <option>Location Bin Allocation Ledger</option>
                </select>
              </div>
              <p className="text-[11px] text-slate-400 mb-4">
                Export current stock with location, batch, expiry and other details.
              </p>

              {/* Include Columns Subheading */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
                <span className="text-xs font-bold text-slate-700">
                  Include Columns
                </span>
                <label className="flex items-center gap-1.5 text-xs text-[#1E3A1E] font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={areAllSelected}
                    onChange={handleToggleSelectAll}
                    className="w-3.5 h-3.5 rounded text-[#1E3A1E] focus:ring-0 cursor-pointer accent-[#1E3A1E]"
                  />
                  <span>Select all</span>
                </label>
              </div>

              {/* 2-Column Checkbox Grid */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs text-slate-700">
                {/* Left Column */}
                <div className="space-y-2.5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={columns.productName}
                      onChange={(e) => setColumns({ ...columns, productName: e.target.checked })}
                      className="w-3.5 h-3.5 rounded accent-[#1E3A1E]"
                    />
                    <span className="font-medium">Product Name</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={columns.sku}
                      onChange={(e) => setColumns({ ...columns, sku: e.target.checked })}
                      className="w-3.5 h-3.5 rounded accent-[#1E3A1E]"
                    />
                    <span className="font-medium">SKU</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={columns.category}
                      onChange={(e) => setColumns({ ...columns, category: e.target.checked })}
                      className="w-3.5 h-3.5 rounded accent-[#1E3A1E]"
                    />
                    <span className="font-medium text-slate-600">Category</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={columns.batchNo}
                      onChange={(e) => setColumns({ ...columns, batchNo: e.target.checked })}
                      className="w-3.5 h-3.5 rounded accent-[#1E3A1E]"
                    />
                    <span className="font-medium">Batch No.</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={columns.location}
                      onChange={(e) => setColumns({ ...columns, location: e.target.checked })}
                      className="w-3.5 h-3.5 rounded accent-[#1E3A1E]"
                    />
                    <span className="font-medium">Location</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={columns.currentStock}
                      onChange={(e) => setColumns({ ...columns, currentStock: e.target.checked })}
                      className="w-3.5 h-3.5 rounded accent-[#1E3A1E]"
                    />
                    <span className="font-medium">Current Stock</span>
                  </label>
                </div>

                {/* Right Column */}
                <div className="space-y-2.5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={columns.unit}
                      onChange={(e) => setColumns({ ...columns, unit: e.target.checked })}
                      className="w-3.5 h-3.5 rounded accent-[#1E3A1E]"
                    />
                    <span className="font-medium">Unit</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={columns.expiryDate}
                      onChange={(e) => setColumns({ ...columns, expiryDate: e.target.checked })}
                      className="w-3.5 h-3.5 rounded accent-[#1E3A1E]"
                    />
                    <span className="font-medium">Expiry Date</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={columns.manufacturingDate}
                      onChange={(e) => setColumns({ ...columns, manufacturingDate: e.target.checked })}
                      className="w-3.5 h-3.5 rounded accent-[#1E3A1E]"
                    />
                    <span className="font-medium text-slate-600">Manufacturing Date</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={columns.supplier}
                      onChange={(e) => setColumns({ ...columns, supplier: e.target.checked })}
                      className="w-3.5 h-3.5 rounded accent-[#1E3A1E]"
                    />
                    <span className="font-medium text-slate-600">Supplier</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={columns.reorderLevel}
                      onChange={(e) => setColumns({ ...columns, reorderLevel: e.target.checked })}
                      className="w-3.5 h-3.5 rounded accent-[#1E3A1E]"
                    />
                    <span className="font-medium">Reorder Level</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={columns.remarks}
                      onChange={(e) => setColumns({ ...columns, remarks: e.target.checked })}
                      className="w-3.5 h-3.5 rounded accent-[#1E3A1E]"
                    />
                    <span className="font-medium text-slate-600">Remarks</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Filter Data (Span 4) */}
          <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between">
            <div>
              {/* Card Header */}
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-4 h-4 text-[#1E3A1E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <h3 className="text-xs font-bold text-slate-800">
                  Filter Data
                </h3>
              </div>

              {/* Date Range */}
              <div className="mb-3">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Date Range
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-2 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-[#1E3A1E]"
                  />
                  <svg className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>

              {/* Location & Category Grid */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Location
                  </label>
                  <select
                    value={filterLocation}
                    onChange={(e) => setFilterLocation(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#1E3A1E]"
                  >
                    <option>All Locations</option>
                    <option>A1-R1-B1</option>
                    <option>B1-R2-B3</option>
                    <option>C1-R1-B2</option>
                    <option>Z1-R1-B1</option>
                    <option>A2-R3-B1</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Category
                  </label>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#1E3A1E]"
                  >
                    <option>All Categories</option>
                    <option>Ammunition</option>
                    <option>Medical</option>
                    <option>Combat Gear</option>
                    <option>Spare Parts</option>
                    <option>Uniform & Textile</option>
                  </select>
                </div>
              </div>

              {/* Product Search */}
              <div className="mb-3">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Product
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchProduct}
                    onChange={(e) => setSearchProduct(e.target.value)}
                    placeholder="Search product..."
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-2 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#1E3A1E]"
                  />
                  <svg className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Stock Status & Batch Status Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Stock Status
                  </label>
                  <select
                    value={stockStatus}
                    onChange={(e) => setStockStatus(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#1E3A1E]"
                  >
                    <option>All</option>
                    <option>In Stock</option>
                    <option>Low Stock</option>
                    <option>Out of Stock</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Batch Status
                  </label>
                  <select
                    value={batchStatus}
                    onChange={(e) => setBatchStatus(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#1E3A1E]"
                  >
                    <option>All</option>
                    <option>Active</option>
                    <option>Quarantine</option>
                    <option>Expired</option>
                  </select>
                </div>
              </div>

              {/* Toggles Row */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-700">
                {/* Toggle 1: Include Zero Stock Items */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <div
                    onClick={() => setIncludeZeroStock(!includeZeroStock)}
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 cursor-pointer ${
                      includeZeroStock ? 'bg-[#1E3A1E]' : 'bg-slate-300'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 shadow-xs ${
                        includeZeroStock ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </div>
                  <span className="text-[11px] text-slate-600 font-medium">
                    Include Zero Stock Items
                  </span>
                </label>

                {/* Toggle 2: Group by Location */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <div
                    onClick={() => setGroupByLocation(!groupByLocation)}
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 cursor-pointer ${
                      groupByLocation ? 'bg-[#1E3A1E]' : 'bg-slate-300'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 shadow-xs ${
                        groupByLocation ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </div>
                  <span className="text-[11px] text-slate-600 font-medium">
                    Group by Location
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Column 3: Export Options (Span 4) */}
          <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between">
            <div>
              {/* Card Header */}
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-4 h-4 text-[#1E3A1E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <h3 className="text-xs font-bold text-slate-800">
                  Export Options
                </h3>
              </div>

              {/* File Format Cards Grid */}
              <div className="mb-3">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  File Format
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {/* Excel Card */}
                  <div
                    onClick={() => setFileFormat('excel')}
                    className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      fileFormat === 'excel'
                        ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-500/30 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-md bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                        X
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800">
                          Microsoft Excel
                        </div>
                        <div className="text-[10px] text-slate-400">
                          (.xlsx)
                        </div>
                      </div>
                    </div>
                    {fileFormat === 'excel' && (
                      <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </div>

                  {/* PDF Card */}
                  <div
                    onClick={() => setFileFormat('pdf')}
                    className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      fileFormat === 'pdf'
                        ? 'border-rose-600 bg-rose-50/50 ring-1 ring-rose-500/30 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-md bg-rose-600 text-white flex items-center justify-center font-bold text-xs">
                        PDF
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800">
                          PDF Document
                        </div>
                        <div className="text-[10px] text-slate-400">
                          (.pdf)
                        </div>
                      </div>
                    </div>
                    {fileFormat === 'pdf' && (
                      <div className="w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* File Name */}
              <div className="mb-3">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  File Name
                </label>
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-[#1E3A1E]"
                />
              </div>

              {/* Report Orientation (PDF) */}
              <div className="mb-3">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Report Orientation (PDF)
                </label>
                <div className="flex items-center gap-5 text-xs text-slate-700">
                  <label className="flex items-center gap-2 cursor-pointer font-medium">
                    <input
                      type="radio"
                      name="orientation"
                      checked={pdfOrientation === 'portrait'}
                      onChange={() => setPdfOrientation('portrait')}
                      className="accent-[#1E3A1E]"
                    />
                    <span>Portrait</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-medium">
                    <input
                      type="radio"
                      name="orientation"
                      checked={pdfOrientation === 'landscape'}
                      onChange={() => setPdfOrientation('landscape')}
                      className="accent-[#1E3A1E]"
                    />
                    <span>Landscape</span>
                  </label>
                </div>
              </div>

              {/* Additional Options */}
              <div className="mb-4">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Additional Options
                </label>
                <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs text-slate-700">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={additionalOptions.includeSummary}
                      onChange={(e) => setAdditionalOptions({ ...additionalOptions, includeSummary: e.target.checked })}
                      className="w-3.5 h-3.5 rounded accent-[#1E3A1E]"
                    />
                    <span className="font-medium text-slate-700">Include Summary</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={additionalOptions.addCompanyHeader}
                      onChange={(e) => setAdditionalOptions({ ...additionalOptions, addCompanyHeader: e.target.checked })}
                      className="w-3.5 h-3.5 rounded accent-[#1E3A1E]"
                    />
                    <span className="font-medium text-slate-600">Add Company Header</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={additionalOptions.includeCharts}
                      onChange={(e) => setAdditionalOptions({ ...additionalOptions, includeCharts: e.target.checked })}
                      className="w-3.5 h-3.5 rounded accent-[#1E3A1E]"
                    />
                    <span className="font-medium text-slate-700">Include Charts (PDF only)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={additionalOptions.includeGeneratedByDate}
                      onChange={(e) => setAdditionalOptions({ ...additionalOptions, includeGeneratedByDate: e.target.checked })}
                      className="w-3.5 h-3.5 rounded accent-[#1E3A1E]"
                    />
                    <span className="font-medium text-slate-600">Include Generated By & Date</span>
                  </label>
                </div>
              </div>

              {/* Generate & Export Button */}
              <button
                type="button"
                onClick={handleGenerateExport}
                className="w-full py-2.5 px-4 rounded-lg bg-[#1E3A1E] hover:bg-[#2a4e2a] text-white text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Generate & Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Section: Recent Exports Table */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-[#1E3A1E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-xs font-bold text-slate-800">
                Recent Exports
              </h3>
            </div>
            <button
              type="button"
              onClick={() => triggerToast('Viewing complete export history archive')}
              className="text-[11px] font-semibold text-emerald-800 hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <span>→</span>
            </button>
          </div>

          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400">
                  <th className="pb-2.5 px-2 w-6 text-center whitespace-nowrap">#</th>
                  <th className="pb-2.5 px-2 whitespace-nowrap">Report Name</th>
                  <th className="pb-2.5 px-2 whitespace-nowrap">Type</th>
                  <th className="pb-2.5 px-2 whitespace-nowrap">Filters</th>
                  <th className="pb-2.5 px-2 whitespace-nowrap">Format</th>
                  <th className="pb-2.5 px-2 whitespace-nowrap">Generated On</th>
                  <th className="pb-2.5 px-2 whitespace-nowrap">Generated By</th>
                  <th className="pb-2.5 px-2 whitespace-nowrap">Status</th>
                  <th className="pb-2.5 px-2 text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {recentExportsList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-2 text-center text-slate-400 text-[11px] whitespace-nowrap">
                      {item.id}
                    </td>
                    <td className="py-3 px-2 font-medium text-slate-800 whitespace-nowrap">
                      {item.name}
                    </td>
                    <td className="py-3 px-2 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${item.typeColor}`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-slate-500 text-[11px] whitespace-nowrap">
                      {item.filters}
                    </td>
                    <td className="py-3 px-2 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${item.formatColor}`}>
                        {item.format}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-slate-600 font-mono text-[11px] whitespace-nowrap">
                      {item.generatedOn}
                    </td>
                    <td className="py-3 px-2 text-slate-700 font-medium whitespace-nowrap">
                      {item.generatedBy}
                    </td>
                    <td className="py-3 px-2 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Download button */}
                        <button
                          type="button"
                          onClick={() => triggerToast(`Downloading ${item.name} (${item.format})...`)}
                          className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors"
                          title="Download"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </button>
                        {/* View button */}
                        <button
                          type="button"
                          onClick={() => setShowPreviewModal(item)}
                          className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                          title="View Details"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        {/* Delete button */}
                        <button
                          type="button"
                          onClick={() => {
                            setRecentExportsList(recentExportsList.filter((x) => x.id !== item.id))
                            triggerToast(`Removed export log #${item.id}`)
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                          title="Delete from list"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      {/* MODAL 1: Scheduled Reports Modal */}
      {showScheduledModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-5 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#1E3A1E] text-emerald-400 flex items-center justify-center font-bold">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    Automated Scheduled Reports
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Active cron dispatch schedules to Army command centers
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowScheduledModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs mb-5">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800">Daily Stock Valuation (Excel)</div>
                  <div className="text-[10px] text-slate-500">Every day at 06:00 IST • To: Col. A. Sharma</div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Active
                </span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800">Weekly Expiry Warning (PDF)</div>
                  <div className="text-[10px] text-slate-500">Every Monday at 08:00 IST • To: Medical Unit QM</div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Active
                </span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800">Monthly Audit Trail Log</div>
                  <div className="text-[10px] text-slate-500">1st of every month • To: Headquarters Northern Command</div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Active
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowScheduledModal(false)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowScheduledModal(false)
                  triggerToast('New automated schedule created successfully.')
                }}
                className="px-5 py-2 rounded-lg bg-[#1E3A1E] text-white font-semibold text-xs hover:bg-[#2a4e2a]"
              >
                + Add New Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Report Inspection / Printable Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#1E3A1E] text-emerald-400 flex items-center justify-center font-bold">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    Export Preview: {showPreviewModal.name}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Format: {showPreviewModal.format} | Generated On: {showPreviewModal.generatedOn || 'Just now'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPreviewModal(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 text-xs space-y-3 mb-5">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Document Security Classification:</span>
                <span className="font-bold text-emerald-800">OFFICIAL USE ONLY // CENTRAL WAREHOUSE</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Selected Reporting Filter:</span>
                <span className="font-medium text-slate-800">{filterLocation} | {filterCategory}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Selected Output Columns:</span>
                <span className="font-medium text-slate-800">
                  {Object.entries(columns)
                    .filter(([, v]) => v)
                    .map(([k]) => k)
                    .join(', ')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">File Integrity Hash (SHA-256):</span>
                <span className="font-mono text-[10px] text-slate-600">8f4c2b9a7e1d5a8...verified</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowPreviewModal(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50"
              >
                Close Preview
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPreviewModal(null)
                  triggerToast(`Downloading ${showPreviewModal.name} (${showPreviewModal.format})...`)
                }}
                className="px-5 py-2 rounded-lg bg-[#1E3A1E] text-white font-semibold text-xs hover:bg-[#2a4e2a] flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Download Document</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
