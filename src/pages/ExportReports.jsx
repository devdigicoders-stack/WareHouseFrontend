import { useState, useMemo, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Download,
  FileSpreadsheet,
  FileText,
  Layers,
  Package,
  CheckCircle2,
  Clock,
  Search,
  ChevronDown,
  Check,
  X,
  RotateCcw,
  SlidersHorizontal,
  Calendar,
  Warehouse,
  ShieldCheck,
  Truck,
  Send,
  ArrowRight,
  Printer,
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
        className="w-full bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl px-3 py-2 text-left text-xs font-semibold text-slate-700 flex items-center justify-between gap-2 transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
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
                    ? 'bg-emerald-50 text-emerald-700 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="truncate">
                  <div>{opt.label}</div>
                  {opt.sublabel && (
                    <div className="text-[10px] text-slate-400 font-normal">{opt.sublabel}</div>
                  )}
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 ml-2" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function ExportReports() {
  // Toast notifications state
  const [toastMessage, setToastMessage] = useState(null)
  const triggerToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Selected Operational Dataset
  const [selectedDataset, setSelectedDataset] = useState('inventory') // 'inventory' | 'grn' | 'dispatch' | 'lab' | 'hold'

  // Selected Export Format
  const [fileFormat, setFileFormat] = useState('excel') // 'excel' | 'pdf'
  const [fileName, setFileName] = useState('Warehouse_Inventory_Extract_2026')

  // Filter settings
  const [filterShade, setFilterShade] = useState('ALL')
  const [includeZeroStock, setIncludeZeroStock] = useState(false)
  const [includeQCCerts, setIncludeQCCerts] = useState(true)

  // Column Selector state (12 Columns)
  const [selectedColumns, setSelectedColumns] = useState({
    productName: true,
    sku: true,
    category: true,
    batchNo: true,
    storageBin: true,
    baseQty: true,
    baseUnit: true,
    packQty: true,
    packUnit: true,
    expiryDate: true,
    labStatus: true,
    responsibleOfficer: false,
  })

  // Toggle single column
  const toggleColumn = (key) => {
    setSelectedColumns((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  // Toggle all columns
  const areAllSelected = Object.values(selectedColumns).every(Boolean)
  const toggleSelectAll = () => {
    const nextState = !areAllSelected
    const updated = {}
    Object.keys(selectedColumns).forEach((k) => {
      updated[k] = nextState
    })
    setSelectedColumns(updated)
  }

  // Recent Exports Log History
  const [recentExports, setRecentExports] = useState([
    {
      id: 1,
      fileName: 'Warehouse_Stock_Extract_Sep2026.csv',
      dataset: 'Current Stock Ledger',
      format: 'Excel',
      records: 5842,
      timestamp: 'Today, 11:20 IST',
      officer: 'Rajesh Sharma',
    },
    {
      id: 2,
      fileName: 'Inward_GRN_Audit_Manifest.csv',
      dataset: 'Inward GRN Operations',
      format: 'Excel',
      records: 1240,
      timestamp: 'Today, 09:45 IST',
      officer: 'Amit Patel',
    },
    {
      id: 3,
      fileName: 'Outward_Dispatches_GateLog.pdf',
      dataset: 'Outward Dispatches',
      format: 'PDF',
      records: 980,
      timestamp: 'Yesterday, 17:30 IST',
      officer: 'Rajesh Sharma',
    },
    {
      id: 4,
      fileName: 'QA_Lab_Clearances_Monthly.csv',
      dataset: 'Quality & Lab Clearance',
      format: 'Excel',
      records: 340,
      timestamp: '15 Sep 2026',
      officer: 'Dr. Priya Verma',
    },
  ])

  // Count active columns
  const activeColCount = Object.values(selectedColumns).filter(Boolean).length

  // Dataset Options
  const datasetOptions = [
    { id: 'inventory', name: 'Current Stock Registry', records: 5842, code: 'INV-MASTER' },
    { id: 'grn', name: 'Inward GRN Audit Logs', records: 1240, code: 'GRN-INWARD' },
    { id: 'dispatch', name: 'Outward Dispatch Manifests', records: 980, code: 'DSP-OUTWARD' },
    { id: 'lab', name: 'QA Lab Clearance & Certs', records: 340, code: 'LAB-QUALITY' },
    { id: 'hold', name: 'Hold Stock & Quarantine Incidents', records: 48, code: 'HLD-QUARANTINE' },
  ]

  const currentDatasetMeta = datasetOptions.find((d) => d.id === selectedDataset) || datasetOptions[0]

  // Handle Export Generation
  const handleGenerateExport = () => {
    const selectedHeaders = Object.keys(selectedColumns)
      .filter((k) => selectedColumns[k])
      .map((k) => k.toUpperCase())

    const mockRow = Object.keys(selectedColumns)
      .filter((k) => selectedColumns[k])
      .map((k) => `"${k}_SAMPLE_DATA"`)
      .join(',')

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [selectedHeaders.join(','), mockRow, mockRow].join('\n')

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `${fileName.trim() || 'Warehouse_Extract'}.${fileFormat === 'excel' ? 'csv' : 'csv'}`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    const newLog = {
      id: Date.now(),
      fileName: `${fileName.trim() || 'Warehouse_Extract'}.${fileFormat === 'excel' ? 'xlsx' : 'pdf'}`,
      dataset: currentDatasetMeta.name,
      format: fileFormat === 'excel' ? 'Excel' : 'PDF',
      records: currentDatasetMeta.records,
      timestamp: 'Just now',
      officer: 'Current User',
    }

    setRecentExports([newLog, ...recentExports])
    triggerToast(`Export generated: ${newLog.fileName} (${activeColCount} columns).`)
  }

  // Column definitions for the UI
  const columnItems = [
    { key: 'productName', label: 'Product / Item Name' },
    { key: 'sku', label: 'SKU Code' },
    { key: 'category', label: 'Product Category' },
    { key: 'batchNo', label: 'Batch / Lot Number' },
    { key: 'storageBin', label: 'Storage Bin Coordinate' },
    { key: 'baseQty', label: 'Base Unit Quantity' },
    { key: 'baseUnit', label: 'Base Unit (Kg/Ltr/Pcs)' },
    { key: 'packQty', label: 'Packaging Packs Count' },
    { key: 'packUnit', label: 'Pack Unit (Gatta/Bags)' },
    { key: 'expiryDate', label: 'Shelf-Life Expiry Date' },
    { key: 'labStatus', label: 'Lab QA Clearance Status' },
    { key: 'responsibleOfficer', label: 'Authorizing Officer' },
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
          <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-xs shrink-0">
            <Download className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">Data Export Studio</h1>
              <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2.5 py-0.5 rounded-full shrink-0">
                Custom Extracts (.xlsx / .pdf)
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1 max-w-2xl">
              Configure columnar extracts, select date ranges, apply shade filters, and export verified warehouse datasets to Excel or PDF.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">
          <Link
            to="/reports"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition shrink-0"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
            <span>Reports Catalog</span>
          </Link>

          <button
            type="button"
            onClick={() => {
              setSelectedDataset('inventory')
              setFileFormat('excel')
              setFileName('Warehouse_Inventory_Extract_2026')
              setFilterShade('ALL')
              triggerToast('Export parameters reset to defaults.')
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset Setup</span>
          </button>
        </div>
      </div>

      {/* 4 Dynamic KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center gap-3.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-500 truncate">Exportable Modules</p>
            <h3 className="text-xl font-bold text-slate-800 leading-tight mt-0.5 truncate">
              5 Datasets
            </h3>
            <p className="text-[11px] text-emerald-600 font-medium truncate">Stock, GRN, Dispatch &amp; Lab</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center gap-3.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-500 truncate">Live Database Rows</p>
            <h3 className="text-xl font-bold text-slate-800 leading-tight mt-0.5 truncate">
              8,450 Records
            </h3>
            <p className="text-[11px] text-indigo-600 font-medium truncate">Across all 6 shades</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center gap-3.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-500 truncate">Supported Formats</p>
            <h3 className="text-xl font-bold text-slate-800 leading-tight mt-0.5 truncate">
              Excel &amp; PDF
            </h3>
            <p className="text-[11px] text-blue-600 font-medium truncate">Structured columnar extracts</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center gap-3.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-500 truncate">Recent Downloads</p>
            <h3 className="text-xl font-bold text-slate-800 leading-tight mt-0.5 truncate">
              {recentExports.length} Generated
            </h3>
            <p className="text-[11px] text-purple-600 font-medium truncate">Logged in export history</p>
          </div>
        </div>
      </div>

      {/* 2-Column Interactive Export Studio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Module & Column Configuration (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Step 1: Select Operational Module */}
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-4 sm:p-5 space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center">
                  1
                </span>
                <h3 className="text-sm font-bold text-slate-800">Select Dataset Module</h3>
              </div>
              <span className="text-[11px] font-bold text-slate-400">Step 1 of 3</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {datasetOptions.map((ds) => {
                const isSelected = selectedDataset === ds.id
                return (
                  <button
                    key={ds.id}
                    type="button"
                    onClick={() => {
                      setSelectedDataset(ds.id)
                      setFileName(`Warehouse_${ds.id.toUpperCase()}_Extract_${new Date().toISOString().slice(0, 10)}`)
                    }}
                    className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'border-slate-200/80 bg-slate-50/50 hover:bg-slate-100/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-800">{ds.name}</span>
                      {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0 ml-1" />}
                    </div>
                    <div className="flex items-center justify-between mt-2 text-[10px] text-slate-500 font-mono">
                      <span>{ds.code}</span>
                      <strong className="text-slate-700">{ds.records.toLocaleString()} rows</strong>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Step 2: Select Column Attributes */}
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-4 sm:p-5 space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center">
                  2
                </span>
                <h3 className="text-sm font-bold text-slate-800">Select Column Fields</h3>
              </div>
              <button
                type="button"
                onClick={toggleSelectAll}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer"
              >
                {areAllSelected ? 'Deselect All' : 'Select All Fields'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {columnItems.map((col) => {
                const isChecked = selectedColumns[col.key]
                return (
                  <label
                    key={col.key}
                    onClick={() => toggleColumn(col.key)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition cursor-pointer select-none ${
                      isChecked
                        ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900 font-semibold'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center border transition ${
                        isChecked
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3" />}
                    </div>
                    <span className="truncate">{col.label}</span>
                  </label>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Export Options & Generate CTA (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Step 3: Format & Export Settings */}
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center">
                  3
                </span>
                <h3 className="text-sm font-bold text-slate-800">Export Parameters</h3>
              </div>
              <span className="text-[11px] font-bold text-slate-400">Step 3 of 3</span>
            </div>

            {/* Format Selection Cards */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-2">
                Choose Output Format
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFileFormat('excel')}
                  className={`p-3 rounded-xl border text-center transition cursor-pointer flex flex-col items-center gap-1 ${
                    fileFormat === 'excel'
                      ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20 font-bold text-emerald-900'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
                  <span className="text-xs">Excel (.xlsx / .csv)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFileFormat('pdf')}
                  className={`p-3 rounded-xl border text-center transition cursor-pointer flex flex-col items-center gap-1 ${
                    fileFormat === 'pdf'
                      ? 'border-rose-500 bg-rose-50/60 ring-2 ring-rose-500/20 font-bold text-rose-900'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <FileText className="w-6 h-6 text-rose-600" />
                  <span className="text-xs">PDF Document</span>
                </button>
              </div>
            </div>

            {/* File Name Field */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                Output File Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition"
                />
                <span className="absolute right-3 top-2 text-slate-400 font-mono text-xs">
                  .{fileFormat === 'excel' ? 'csv' : 'pdf'}
                </span>
              </div>
            </div>

            {/* Storage Shade Filter */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                Shade Scope Filter
              </label>
              <CustomSelect
                value={filterShade}
                onChange={(val) => setFilterShade(val)}
                options={[
                  { value: 'ALL', label: 'All 6 Dedicated Shades' },
                  { value: 'SH01', label: 'Shade 1: Grains & Bulk Pulses' },
                  { value: 'SH02', label: 'Shade 2: Edible Oils & Liquids' },
                  { value: 'SH03', label: 'Shade 3: Packaged Food & FMCG' },
                  { value: 'SH04', label: 'Shade 4: Packaging Materials & Cartons' },
                  { value: 'SH05', label: 'Shade 5: Chemicals & Hygiene' },
                  { value: 'SH06', label: 'Shade 6: Spares & General Goods' },
                ]}
              />
            </div>

            {/* Live Payload Summary Card */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Selected Module:</span>
                <strong className="text-slate-800">{currentDatasetMeta.name}</strong>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Column Fields:</span>
                <strong className="text-emerald-700">{activeColCount} of {columnItems.length} active</strong>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Estimated Rows:</span>
                <strong className="text-slate-800">{currentDatasetMeta.records.toLocaleString()} rows</strong>
              </div>
            </div>

            {/* Big Generate Button */}
            <button
              type="button"
              onClick={handleGenerateExport}
              disabled={activeColCount === 0}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-bold shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Generate &amp; Download Extract File</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Export Log Table Card */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">Recent Export Manifests History</h2>
              <p className="text-[11px] text-slate-500">Audit trail of generated spreadsheets and PDF extracts.</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4 min-w-[220px]">Export File Name</th>
                <th className="py-3 px-4 min-w-[170px]">Dataset Module</th>
                <th className="py-3 px-4 min-w-[100px] text-center">Format</th>
                <th className="py-3 px-4 min-w-[120px] text-right">Records Count</th>
                <th className="py-3 px-4 min-w-[140px]">Generated At</th>
                <th className="py-3 px-4 min-w-[130px]">Operator</th>
                <th className="py-3 px-4 w-24 text-center">Re-Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentExports.map((row, idx) => (
                <tr key={row.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3 px-4 text-center text-slate-400 font-mono text-[11px]">
                    {idx + 1}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-800">
                    {row.fileName}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-700">
                    {row.dataset}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        row.format === 'Excel'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {row.format}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-800">
                    {row.records.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-slate-500 text-[11px]">
                    {row.timestamp}
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-medium">
                    {row.officer}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => triggerToast(`Re-downloaded ${row.fileName}.`)}
                      className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition cursor-pointer"
                      title="Download again"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
