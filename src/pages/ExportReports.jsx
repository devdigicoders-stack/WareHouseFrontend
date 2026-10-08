import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
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
  RefreshCw,
  Filter,
} from 'lucide-react'
import {
  fetchProducts,
  fetchGRNs,
  fetchDispatches,
  fetchQCs,
  fetchStockAdjustments,
  fetchGatePasses,
  fetchRacks,
  fetchShades,
  fetchGateEntries,
} from '../services/api'
import { exportToExcel, exportToCSV, printOrExportPDF } from '../utils/exportHelper'
import { PRODUCT_MASTER } from '../data/productMaster'

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

  // Selected Operational Dataset Module
  const [selectedDataset, setSelectedDataset] = useState('inventory') // 'inventory' | 'grn' | 'dispatch' | 'lab' | 'hold' | 'gatepass'

  // Selected Export Format
  const [fileFormat, setFileFormat] = useState('excel') // 'excel' | 'pdf' | 'csv'
  const [fileName, setFileName] = useState(() => `Warehouse_Inventory_Extract_${new Date().toISOString().slice(0, 10)}`)

  // Filter settings
  const [filterShade, setFilterShade] = useState('ALL')
  const [dateFilterPreset, setDateFilterPreset] = useState('ALL_TIME')
  const [startDate, setStartDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - 30)
    return d.toISOString().slice(0, 10)
  })
  const [endDate, setEndDate] = useState(() => new Date().toISOString().slice(0, 10))

  // Dynamic backend data
  const [liveProducts, setLiveProducts] = useState([])
  const [liveGRNs, setLiveGRNs] = useState([])
  const [liveDispatches, setLiveDispatches] = useState([])
  const [liveQCs, setLiveQCs] = useState([])
  const [liveAdjustments, setLiveAdjustments] = useState([])
  const [liveGatePasses, setLiveGatePasses] = useState([])
  const [liveGateEntries, setLiveGateEntries] = useState([])
  const [liveRacks, setLiveRacks] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch live collections
  const loadStudioData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [
        prodRes,
        grnRes,
        dspRes,
        qcRes,
        adjRes,
        gpRes,
        geRes,
        rackRes,
      ] = await Promise.allSettled([
        fetchProducts(),
        fetchGRNs(),
        fetchDispatches(),
        fetchQCs(),
        fetchStockAdjustments(),
        fetchGatePasses(),
        fetchGateEntries(),
        fetchRacks(),
      ])

      const rawProds = prodRes.status === 'fulfilled' && Array.isArray(prodRes.value) && prodRes.value.length > 0
        ? prodRes.value
        : PRODUCT_MASTER

      setLiveProducts(rawProds)
      setLiveGRNs(grnRes.status === 'fulfilled' && Array.isArray(grnRes.value) ? grnRes.value : [])
      setLiveDispatches(dspRes.status === 'fulfilled' && Array.isArray(dspRes.value) ? dspRes.value : [])
      setLiveQCs(qcRes.status === 'fulfilled' && Array.isArray(qcRes.value) ? qcRes.value : [])
      setLiveAdjustments(adjRes.status === 'fulfilled' && Array.isArray(adjRes.value) ? adjRes.value : [])
      setLiveGatePasses(gpRes.status === 'fulfilled' && Array.isArray(gpRes.value) ? gpRes.value : [])
      setLiveGateEntries(geRes.status === 'fulfilled' && Array.isArray(geRes.value) ? geRes.value : [])
      setLiveRacks(rackRes.status === 'fulfilled' && Array.isArray(rackRes.value) ? rackRes.value : [])
    } catch (err) {
      console.error('Failed to load export data:', err)
      setLiveProducts(PRODUCT_MASTER)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadStudioData()
  }, [loadStudioData])

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

  // Recent Exports Log History persisted in localStorage
  const [recentExports, setRecentExports] = useState(() => {
    try {
      const saved = localStorage.getItem('wms_export_history')
      return saved ? JSON.parse(saved) : [
        {
          id: 1,
          fileName: 'Warehouse_Stock_Consolidated.xlsx',
          dataset: 'Current Stock Registry',
          format: 'Excel',
          records: 120,
          timestamp: 'Recent',
          officer: 'Warehouse Manager',
        }
      ]
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem('wms_export_history', JSON.stringify(recentExports))
    } catch {}
  }, [recentExports])

  // Dataset Options with dynamic counts
  const datasetOptions = useMemo(() => [
    { id: 'inventory', name: 'Current Stock Registry', records: liveProducts.length, code: 'INV-MASTER' },
    { id: 'grn', name: 'Inward GRN Audit Logs', records: liveGRNs.length || liveGateEntries.length, code: 'GRN-INWARD' },
    { id: 'dispatch', name: 'Outward Dispatch Manifests', records: liveDispatches.length, code: 'DSP-OUTWARD' },
    { id: 'lab', name: 'QA Lab Clearance & Certs', records: liveQCs.length, code: 'LAB-QUALITY' },
    { id: 'hold', name: 'Hold Stock & Quarantine Incidents', records: liveAdjustments.length, code: 'HLD-QUARANTINE' },
    { id: 'gatepass', name: 'Gate Pass Outward Manifests', records: liveGatePasses.length, code: 'GPO-SECURITY' },
  ], [liveProducts, liveGRNs, liveGateEntries, liveDispatches, liveQCs, liveAdjustments, liveGatePasses])

  const currentDatasetMeta = datasetOptions.find((d) => d.id === selectedDataset) || datasetOptions[0]

  // Column definitions for the UI
  const columnItems = [
    { key: 'productName', label: 'Product / Item Name' },
    { key: 'sku', label: 'SKU / Identifier Code' },
    { key: 'category', label: 'Product / Entry Category' },
    { key: 'batchNo', label: 'Batch / Lot Number' },
    { key: 'storageBin', label: 'Storage Bin & Shade Coordinate' },
    { key: 'baseQty', label: 'Base Unit Quantity' },
    { key: 'baseUnit', label: 'Base Unit (Kg/Ltr/Pcs)' },
    { key: 'packQty', label: 'Packaging Packs Count' },
    { key: 'packUnit', label: 'Pack Unit (Gatta/Bags/Tins)' },
    { key: 'expiryDate', label: 'Shelf-Life / Expiry Date' },
    { key: 'labStatus', label: 'Lab QA Clearance Status' },
    { key: 'responsibleOfficer', label: 'Authorizing Officer' },
  ]

  // Dynamic Live Database Totals
  const totalLiveRecords = useMemo(() => {
    return liveProducts.length + (liveGRNs.length || liveGateEntries.length) + liveDispatches.length + liveQCs.length + liveAdjustments.length + liveGatePasses.length
  }, [liveProducts, liveGRNs, liveGateEntries, liveDispatches, liveQCs, liveAdjustments, liveGatePasses])

  // Count active columns
  const activeColCount = Object.values(selectedColumns).filter(Boolean).length

  // Build real dynamic export records with applied shade & date filters
  const buildExportData = () => {
    let rawItems = []

    if (selectedDataset === 'inventory') {
      rawItems = liveProducts
    } else if (selectedDataset === 'grn') {
      rawItems = liveGRNs.length > 0 ? liveGRNs : liveGateEntries
    } else if (selectedDataset === 'dispatch') {
      rawItems = liveDispatches
    } else if (selectedDataset === 'lab') {
      rawItems = liveQCs
    } else if (selectedDataset === 'hold') {
      rawItems = liveAdjustments
    } else if (selectedDataset === 'gatepass') {
      rawItems = liveGatePasses
    }

    if (!rawItems || rawItems.length === 0) {
      return []
    }

    // Apply Shade Filter
    let filtered = rawItems
    if (filterShade !== 'ALL') {
      filtered = filtered.filter((item) => {
        const shadeStr = (item.shadeId || item.storageZone || item.shade || item.location || '').toUpperCase()
        return shadeStr.includes(filterShade)
      })
    }

    // Apply Date Range Filter if enabled
    if (dateFilterPreset === 'CUSTOM') {
      const startT = new Date(startDate + 'T00:00:00Z').getTime()
      const endT = new Date(endDate + 'T23:59:59Z').getTime()
      filtered = filtered.filter((item) => {
        const itemDate = item.dateTime || item.dispatchDate || item.testDate || item.createdAt
        if (!itemDate) return true
        const t = new Date(itemDate).getTime()
        return t >= startT && t <= endT
      })
    }

    return filtered.map((item) => {
      const row = {}
      if (selectedColumns.productName) {
        row['Product / Item Name'] = item.name || item.productName || item.customerName || item.supplier || item.receiverName || 'General Item'
      }
      if (selectedColumns.sku) {
        row['SKU / Reference Code'] = item.sku || item.grnNo || item.dispatchNo || item.qcNumber || item.adjNumber || item.passNo || 'PRD-001'
      }
      if (selectedColumns.category) {
        row['Category'] = item.category || item.dispatchType || item.testProtocol || item.type || item.passType || 'Inventory'
      }
      if (selectedColumns.batchNo) {
        row['Batch / Lot No'] = item.batchNo || item.batchNumber || item.poNo || item.orderNo || 'BT-2026-001'
      }
      if (selectedColumns.storageBin) {
        row['Storage Bin & Shade'] = item.binLocation || item.locationCode || item.storageZone || item.shade || 'SH01-R01-C01'
      }
      if (selectedColumns.baseQty) {
        row['Base Quantity'] = Number(item.currentStock ?? item.totalBaseQty ?? item.adjustedQty ?? item.quantity ?? item.totalQty ?? 0).toLocaleString()
      }
      if (selectedColumns.baseUnit) {
        row['Base Unit'] = item.baseUnit || item.unit || 'Kg'
      }
      if (selectedColumns.packQty) {
        row['Pack Count'] = Number(item.packSize ?? item.totalPackages ?? item.packQty ?? item.itemsCount ?? 1).toLocaleString()
      }
      if (selectedColumns.packUnit) {
        row['Pack Unit'] = item.outerPackaging || item.packagingUnit || 'Packs'
      }
      if (selectedColumns.expiryDate) {
        row['Expiry / Test Date'] = item.expiryDate || (item.testDate ? new Date(item.testDate).toLocaleDateString('en-IN') : 'Live')
      }
      if (selectedColumns.labStatus) {
        row['Lab QA Status'] = item.labStatus || item.status || 'Verified / Passed'
      }
      if (selectedColumns.responsibleOfficer) {
        row['Officer'] = item.testedBy || item.dispatchedBy || item.receivedBy || item.reportedBy || item.authorisedBy || 'Warehouse Manager'
      }
      return row
    })
  }

  // Handle Export Generation
  const handleGenerateExport = () => {
    const exportRows = buildExportData()
    if (exportRows.length === 0) {
      triggerToast('Notice: 0 matching records found with current shade/date filters.')
      return
    }
    const cleanFileName = fileName.trim() || `Warehouse_${selectedDataset.toUpperCase()}_Extract`

    try {
      if (fileFormat === 'excel') {
        exportToExcel(exportRows, cleanFileName, currentDatasetMeta.name)
        triggerToast(`Exported ${cleanFileName}.xlsx (${exportRows.length} rows)`)
      } else if (fileFormat === 'csv') {
        exportToCSV(exportRows, cleanFileName)
        triggerToast(`Exported ${cleanFileName}.csv (${exportRows.length} rows)`)
      } else {
        printOrExportPDF(exportRows, currentDatasetMeta.name, `Warehouse Extract (${filterShade !== 'ALL' ? filterShade : 'All Shades'})`)
        triggerToast(`Opened PDF Print / Export dialog for ${currentDatasetMeta.name}`)
      }

      const ext = fileFormat === 'excel' ? 'xlsx' : fileFormat === 'pdf' ? 'pdf' : 'csv'
      const newLog = {
        id: Date.now(),
        fileName: `${cleanFileName}.${ext}`,
        dataset: currentDatasetMeta.name,
        format: fileFormat === 'excel' ? 'Excel' : fileFormat === 'pdf' ? 'PDF' : 'CSV',
        records: exportRows.length,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        officer: 'Warehouse Manager',
      }

      setRecentExports((prev) => [newLog, ...prev.slice(0, 9)])
    } catch (err) {
      console.error('Export failed:', err)
      triggerToast(`Export failed: ${err.message || 'Error downloading file'}`)
    }
  }

  return (
    <div className="space-y-5 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-[9999] pointer-events-auto bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-bounce border border-slate-700">
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
              <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2.5 py-0.5 rounded-full shrink-0 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Custom Extracts (.xlsx / .pdf / .csv)
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1 max-w-2xl">
              Configure columnar extracts, select date ranges, apply shade filters, and export verified warehouse datasets to Excel, CSV, or PDF.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">
          {/* Live Sync Button */}
          <button
            type="button"
            onClick={() => {
              loadStudioData()
              triggerToast('Refreshed export studio with live database.')
            }}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition shrink-0 cursor-pointer disabled:opacity-50"
            title="Refresh Live Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
            <span>{isLoading ? 'Syncing...' : 'Sync Live'}</span>
          </button>

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
              setFileName(`Warehouse_Inventory_Extract_${new Date().toISOString().slice(0, 10)}`)
              setFilterShade('ALL')
              setDateFilterPreset('ALL_TIME')
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
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center gap-3.5 min-w-0 hover:shadow-md transition">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-500 truncate">Exportable Modules</p>
            <h3 className="text-xl font-bold text-slate-800 leading-tight mt-0.5 truncate">
              {datasetOptions.length} Datasets
            </h3>
            <p className="text-[11px] text-emerald-600 font-medium truncate">Stock, GRN, Dispatch, QC &amp; Pass</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center gap-3.5 min-w-0 hover:shadow-md transition">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-500 truncate">Live Database Rows</p>
            <h3 className="text-xl font-bold text-slate-800 leading-tight mt-0.5 truncate">
              {totalLiveRecords.toLocaleString()} Records
            </h3>
            <p className="text-[11px] text-indigo-600 font-medium truncate">Across all 6 shades</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center gap-3.5 min-w-0 hover:shadow-md transition">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-500 truncate">Supported Formats</p>
            <h3 className="text-xl font-bold text-slate-800 leading-tight mt-0.5 truncate">
              Excel, CSV &amp; PDF
            </h3>
            <p className="text-[11px] text-blue-600 font-medium truncate">Structured columnar extracts</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center gap-3.5 min-w-0 hover:shadow-md transition">
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
                      <strong className={`font-bold ${ds.records > 0 ? 'text-emerald-700' : 'text-slate-500'}`}>
                        {ds.records.toLocaleString()} rows
                      </strong>
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

            {/* Format Selection Cards (Excel, PDF, CSV) */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-2">
                Choose Output Format
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setFileFormat('excel')}
                  className={`p-2.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center gap-1 ${
                    fileFormat === 'excel'
                      ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20 font-bold text-emerald-900'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                  <span className="text-[11px]">Excel (.xlsx)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFileFormat('pdf')}
                  className={`p-2.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center gap-1 ${
                    fileFormat === 'pdf'
                      ? 'border-rose-500 bg-rose-50/60 ring-2 ring-rose-500/20 font-bold text-rose-900'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <FileText className="w-5 h-5 text-rose-600" />
                  <span className="text-[11px]">PDF Document</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFileFormat('csv')}
                  className={`p-2.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center gap-1 ${
                    fileFormat === 'csv'
                      ? 'border-blue-500 bg-blue-50/60 ring-2 ring-blue-500/20 font-bold text-blue-900'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                  <span className="text-[11px]">CSV File</span>
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
                  .{fileFormat === 'excel' ? 'xlsx' : fileFormat === 'pdf' ? 'pdf' : 'csv'}
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

            {/* Date Scope Filter */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-bold text-slate-700">
                  Date Scope Filter
                </label>
                <button
                  type="button"
                  onClick={() => setDateFilterPreset(dateFilterPreset === 'ALL_TIME' ? 'CUSTOM' : 'ALL_TIME')}
                  className="text-[10px] font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer"
                >
                  {dateFilterPreset === 'ALL_TIME' ? '+ Add Date Range' : 'Use All Time'}
                </button>
              </div>

              {dateFilterPreset === 'CUSTOM' ? (
                <div className="grid grid-cols-2 gap-2 animate-in fade-in">
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block mb-0.5">From Date</span>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block mb-0.5">To Date</span>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>
                </div>
              ) : (
                <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-xl border border-slate-200/70">
                  Exporting entire active historical records.
                </div>
              )}
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
                <th className="py-3 px-4 w-24 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentExports.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 text-xs font-medium">
                    No export manifests generated yet. Click "Generate & Download Extract File" above to export data.
                  </td>
                </tr>
              ) : (
                recentExports.map((row, idx) => (
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
                            : row.format === 'PDF'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
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
                        onClick={() => triggerToast(`Manifest ${row.fileName} logged in verified audit history.`)}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition cursor-pointer"
                        title="Manifest audit details"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
