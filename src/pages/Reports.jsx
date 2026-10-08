import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  apiRequest,
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
import DataLoader from '../components/common/DataLoader'
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
  RefreshCw,
  AlertTriangle,
  FileText,
  Warehouse,
  CheckCircle,
  ExternalLink,
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

  // Raw fetched data from backend
  const [products, setProducts] = useState([])
  const [grns, setGrns] = useState([])
  const [dispatches, setDispatches] = useState([])
  const [qcs, setQcs] = useState([])
  const [adjustments, setAdjustments] = useState([])
  const [gatePasses, setGatePasses] = useState([])
  const [racks, setRacks] = useState([])
  const [shadesList, setShadesList] = useState([])
  const [gateEntries, setGateEntries] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastSyncedTime, setLastSyncedTime] = useState(new Date())

  // Scheduled reports storage
  const [scheduledReports, setScheduledReports] = useState(() => {
    try {
      const saved = localStorage.getItem('wms_scheduled_reports')
      return saved ? JSON.parse(saved) : [
        {
          id: 1,
          reportCode: 'RPT-STK-001',
          reportName: 'Consolidated Warehouse Stock Summary',
          frequency: 'Daily (08:00 IST)',
          format: 'Excel & CSV',
          recipients: 'warehouse.manager@logistics.com',
          status: 'Active',
          createdAt: new Date().toLocaleDateString('en-IN'),
        }
      ]
    } catch {
      return []
    }
  })

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
  const [previewSearch, setPreviewSearch] = useState('')
  const [activeExportDropdown, setActiveExportDropdown] = useState(null)
  const [showSchedulesDrawer, setShowSchedulesDrawer] = useState(false)

  // Schedule Modal Form state
  const [scheduleConfig, setScheduleConfig] = useState({
    reportCode: 'RPT-STK-001',
    reportName: 'Consolidated Warehouse Stock Summary',
    frequency: 'Daily (08:00 IST)',
    format: 'Excel & CSV',
    recipients: 'warehouse.manager@logistics.com, audit@centralhub.com',
    shadeId: 'SH03',
  })

  // Fetch all live collections from API
  const loadReportsData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [
        prodRes,
        grnRes,
        dspRes,
        qcRes,
        adjRes,
        gpRes,
        rackRes,
        shadeRes,
        geRes,
      ] = await Promise.allSettled([
        fetchProducts(),
        fetchGRNs(),
        fetchDispatches(),
        fetchQCs(),
        fetchStockAdjustments(),
        fetchGatePasses(),
        fetchRacks(),
        fetchShades(),
        fetchGateEntries(),
      ])

      const rawProds = prodRes.status === 'fulfilled' && Array.isArray(prodRes.value) && prodRes.value.length > 0
        ? prodRes.value
        : PRODUCT_MASTER

      const rawGrns = grnRes.status === 'fulfilled' && Array.isArray(grnRes.value) ? grnRes.value : []
      const rawDsps = dspRes.status === 'fulfilled' && Array.isArray(dspRes.value) ? dspRes.value : []
      const rawQcs = qcRes.status === 'fulfilled' && Array.isArray(qcRes.value) ? qcRes.value : []
      const rawAdjs = adjRes.status === 'fulfilled' && Array.isArray(adjRes.value) ? adjRes.value : []
      const rawGps = gpRes.status === 'fulfilled' && Array.isArray(gpRes.value) ? gpRes.value : []
      const rawRacks = rackRes.status === 'fulfilled' && Array.isArray(rackRes.value) ? rackRes.value : []
      const rawShades = shadeRes.status === 'fulfilled' && Array.isArray(shadeRes.value) ? shadeRes.value : []
      const rawGes = geRes.status === 'fulfilled' && Array.isArray(geRes.value) ? geRes.value : []

      setProducts(rawProds)
      setGrns(rawGrns)
      setDispatches(rawDsps)
      setQcs(rawQcs)
      setAdjustments(rawAdjs)
      setGatePasses(rawGps)
      setRacks(rawRacks)
      setShadesList(rawShades)
      setGateEntries(rawGes)
      setLastSyncedTime(new Date())
    } catch (err) {
      console.error('Failed to load reports data:', err)
      setProducts(PRODUCT_MASTER)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadReportsData()
  }, [loadReportsData])

  // Save scheduled reports to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('wms_scheduled_reports', JSON.stringify(scheduledReports))
    } catch {}
  }, [scheduledReports])

  // Compute live KPI metrics
  const kpis = useMemo(() => {
    const totalUnits = products.reduce((sum, p) => sum + (Number(p.currentStock) || 0), 0)
    const activeSkus = products.filter((p) => (p.status || 'Active').toLowerCase() === 'active').length
    const lowStockItems = products.filter((p) => (Number(p.currentStock) || 0) <= (Number(p.reorderLevel) || 50)).length
    const totalGrnBatches = grns.length
    const totalDispatchesCount = dispatches.length
    const qcTestedCount = qcs.length

    return {
      totalStockUnits: totalUnits,
      activeSKUs: activeSkus || products.length,
      lowStockCount: lowStockItems,
      grnBatches: totalGrnBatches,
      dispatchesCount: totalDispatchesCount,
      qcTestsCount: qcTestedCount,
      shadesCount: shadesList.length || 6,
    }
  }, [products, grns, dispatches, qcs, shadesList])

  // Helper to extract clean tabular report data for any report code
  const getReportDataSet = useCallback((reportCode) => {
    switch (reportCode) {
      case 'RPT-STK-001': // Consolidated Warehouse Stock Summary
        return products.map((p) => ({
          'SKU Code': p.sku || '—',
          'Product Name': p.name || '—',
          'Category': p.category || 'General',
          'Current Stock': Number(p.currentStock || 0).toLocaleString(),
          'Base Unit': p.baseUnit || 'Kg',
          'Outer Packaging': p.outerPackaging || 'Packs',
          'Pack Size': p.packSize || 1,
          'Reorder Level': p.reorderLevel || 50,
          'Storage Zone': p.storageZone || p.shadeId || 'Shade 1',
          'Bin Location': p.binLocation || '—',
          'QC Lab Status': p.labStatus || 'PASSED',
          'Batch No': p.batchNo || '—',
          'Expiry Date': p.expiryDate || '—',
          'Catalog Status': p.status || 'Active',
        }))

      case 'RPT-GRN-002': // Inward GRN & Gate Inward Audit Log
        if (grns.length === 0) {
          return gateEntries.map((g) => ({
            'Gate Entry No': g.entryNo || '—',
            'PO Number': g.poNo || '—',
            'Supplier / Vendor': g.supplierName || '—',
            'Vehicle Number': g.vehicleNo || '—',
            'Driver Name': g.driverName || '—',
            'Gross Weight': `${g.grossWeight || 0} Kg`,
            'Tare Weight': `${g.tareWeight || 0} Kg`,
            'Net Weight': `${g.netWeight || 0} Kg`,
            'Status': g.status || 'Pending Inward',
            'Entry Date': g.entryTime ? new Date(g.entryTime).toLocaleDateString('en-IN') : 'Live',
          }))
        }
        return grns.map((g) => ({
          'GRN Number': g.grnNo || '—',
          'PO Indent No': g.poNo || '—',
          'Supplier / Vendor': g.supplier || '—',
          'Vehicle Number': g.vehicleNo || '—',
          'Storage Shade': g.shade || 'General Storage',
          'Items Received': g.materials?.length || g.itemsCount || 1,
          'Total Qty': g.totalQty || (g.materials?.reduce((s, m) => s + (Number(m.totalBaseQty) || Number(m.packageQty) || 0), 0) + ' Units'),
          'Received By': g.receivedBy || 'Store Supervisor',
          'Status': g.status || 'Completed',
          'Inward Date': g.dateTime ? new Date(g.dateTime).toLocaleDateString('en-IN') : 'Live',
        }))

      case 'RPT-DSP-003': // Outward Dispatch & Manifest Summary
        return dispatches.map((d) => ({
          'Dispatch No': d.dispatchNo || '—',
          'Order Indent No': d.orderNo || '—',
          'Customer / Consignee': d.customerName || '—',
          'Destination Hub': d.destination || 'Regional Terminal',
          'Vehicle Number': d.vehicleNo || '—',
          'Driver Name': d.driverName || '—',
          'Contact': d.driverContact || '—',
          'Total Packages': d.totalPackages || d.items?.length || 1,
          'Total Quantity': `${d.totalBaseQty || 0} ${d.baseUnit || 'Kg'}`,
          'Gate Pass No': d.gatePassNo || '—',
          'Status': d.status || 'Draft / Picklist',
          'Dispatch Date': d.dispatchDate ? new Date(d.dispatchDate).toLocaleDateString('en-IN') : 'Live',
        }))

      case 'RPT-LAB-004': // QA Lab Clearance & Certificate Register
        return qcs.map((q) => ({
          'QC Test No': q.qcNumber || '—',
          'Certificate / COA': q.certificateNo || '—',
          'Product Description': q.productName || '—',
          'SKU Code': q.sku || '—',
          'Batch No': q.batchNo || '—',
          'Test Protocol': q.testProtocol || 'Moisture & Chemical Purity',
          'Sample Size': q.sampleSize || '500g',
          'Test Status / Clearance': q.status || 'Passed',
          'Tested By QA Lead': q.testedBy || 'Dr. Sharma (QA Lead)',
          'Test Date': q.testDate ? new Date(q.testDate).toLocaleDateString('en-IN') : 'Live',
        }))

      case 'RPT-HLD-005': // Hold Stock & Quarantine Incident Log
        const holdItems = adjustments.filter(
          (a) => a.type?.toLowerCase().includes('hold') || a.type?.toLowerCase().includes('damage') || a.type?.toLowerCase().includes('quarantine')
        )
        const effectiveHold = holdItems.length > 0 ? holdItems : adjustments
        return effectiveHold.map((h) => ({
          'Incident / Adj No': h.adjNumber || '—',
          'Incident Type': h.type || 'Quality Hold',
          'Product Name': h.productName || '—',
          'SKU Code': h.sku || '—',
          'Batch No': h.batchNo || '—',
          'Location Code': h.locationCode || 'Quarantine Zone',
          'Quantity Affected': `${h.adjustedQty || h.variance || 0} ${h.unit || 'Kg'}`,
          'Root Cause / Reason': h.reason || 'Safety inspection',
          'Reported By': h.reportedBy || 'Safety Officer',
          'Resolution Status': h.status || 'Approved / Executed',
          'Logged Date': h.createdAt ? new Date(h.createdAt).toLocaleDateString('en-IN') : 'Live',
        }))

      case 'RPT-BIN-006': // Storage Shade & 2D Bin Capacity Utilization
        return racks.map((r) => {
          const cells = r.cells || []
          const occupied = cells.filter((c) => c.status === 'Occupied' || c.status === 'Reserved').length
          const total = cells.length || ((r.rows || 4) * (r.columns || 6) * (r.levels || 3))
          const utilRate = total > 0 ? Math.round((occupied / total) * 100) : 0
          return {
            'Rack Identifier': r.rackNumber || r.name || '—',
            'Storage Shade': r.shadeCode || r.shadeId?.code || 'SH01',
            'Grid Rows': r.rows || 4,
            'Grid Columns': r.columns || 6,
            'Height Levels': r.levels || 3,
            'Total Cell Capacity': total,
            'Occupied Slots': occupied,
            'Available Vacant Slots': Math.max(0, total - occupied),
            'Occupancy Rate': `${utilRate}%`,
            'Zone Status': r.status || 'Active',
          }
        })

      case 'RPT-ORD-007': // Reorder Level & Low Stock Depletion Alert
        const lowItems = products.filter((p) => (Number(p.currentStock) || 0) <= (Number(p.reorderLevel) || 50))
        return lowItems.map((p) => {
          const stock = Number(p.currentStock) || 0
          const reorder = Number(p.reorderLevel) || 50
          const deficit = Math.max(0, reorder - stock)
          return {
            'SKU Code': p.sku || '—',
            'Product Name': p.name || '—',
            'Category': p.category || 'General',
            'Current Stock': stock.toLocaleString(),
            'Minimum Reorder Threshold': reorder.toLocaleString(),
            'Replenishment Deficit': deficit.toLocaleString(),
            'Base Unit': p.baseUnit || 'Kg',
            'Storage Zone': p.storageZone || p.shadeId || 'Shade 1',
            'Bin Location': p.binLocation || '—',
            'Urgency Level': stock === 0 ? 'CRITICAL (Out of Stock)' : 'HIGH (Below Safety)',
            'Action Needed': 'Initiate PO Purchase Indent to Vendor',
          }
        })

      case 'RPT-GPO-008': // Gate Pass Outward & Security Perimeter Exit
        return gatePasses.map((gp) => ({
          'Gate Pass No': gp.passNo || '—',
          'Reference / Dispatch No': gp.refNo || gp.dispatchNo || '—',
          'Pass Classification': gp.passType || 'Material Outward',
          'Vehicle Number': gp.vehicleNo || '—',
          'Driver Name': gp.driverName || '—',
          'Receiver / Consignee': gp.receiverName || 'Direct Consignee',
          'Destination': gp.receiverAddress || 'Transit Terminal',
          'Authorized By': gp.authorisedBy || 'Logistics Manager',
          'Security Status': gp.status || 'Gate Out / Cleared',
          'Issue Date': gp.dateTime ? new Date(gp.dateTime).toLocaleDateString('en-IN') : 'Live',
        }))

      default:
        return products.map((p) => ({
          'SKU': p.sku,
          'Name': p.name,
          'Category': p.category,
          'Stock': p.currentStock,
        }))
    }
  }, [products, grns, dispatches, qcs, adjustments, racks, gatePasses, gateEntries])

  // 8 Curated Warehouse Reports with Dynamic Counts & Metadata
  const reportsList = useMemo(() => {
    const stockCount = products.length
    const grnCount = grns.length || gateEntries.length
    const dspCount = dispatches.length
    const qcCount = qcs.length
    const holdCount = adjustments.filter(
      (a) => a.type?.toLowerCase().includes('hold') || a.type?.toLowerCase().includes('damage')
    ).length || adjustments.length
    const binCount = racks.length
    const lowStockCount = products.filter((p) => (Number(p.currentStock) || 0) <= (Number(p.reorderLevel) || 50)).length
    const gpCount = gatePasses.length

    return [
      {
        id: 1,
        name: 'Consolidated Warehouse Stock Summary',
        code: 'RPT-STK-001',
        category: 'Inventory',
        shadeId: 'SH03',
        shadeName: 'Shade 3: Packaged FMCG',
        frequency: 'Daily',
        formats: ['Excel', 'PDF', 'CSV'],
        lastGenerated: lastSyncedTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        generatedBy: 'Warehouse Manager',
        recordsCount: stockCount,
        status: 'Active',
        description: 'Comprehensive stock ledger with dual-unit breakdown (Units & Gatta) and storage metrics.',
      },
      {
        id: 2,
        name: 'Inward GRN & Gate Inward Audit Log',
        code: 'RPT-GRN-002',
        category: 'Inward Operations',
        shadeId: 'SH01',
        shadeName: 'Shade 1: Grains & Pulses',
        frequency: 'Daily',
        formats: ['Excel', 'PDF', 'CSV'],
        lastGenerated: lastSyncedTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        generatedBy: 'Store Supervisor',
        recordsCount: grnCount,
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
        formats: ['Excel', 'PDF', 'CSV'],
        lastGenerated: lastSyncedTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        generatedBy: 'Dispatch Lead',
        recordsCount: dspCount,
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
        formats: ['PDF', 'Excel', 'CSV'],
        lastGenerated: lastSyncedTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        generatedBy: 'Dr. Sharma (QA Lead)',
        recordsCount: qcCount,
        status: 'Active',
        description: 'Chemical purity, moisture content, and QC specimen test results.',
      },
      {
        id: 5,
        name: 'Hold Stock & Quarantine Incident Log',
        code: 'RPT-HLD-005',
        category: 'Inventory',
        shadeId: 'SH05',
        shadeName: 'Shade 5: Chemicals & Hygiene',
        frequency: 'Weekly',
        formats: ['Excel', 'PDF', 'CSV'],
        lastGenerated: lastSyncedTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        generatedBy: 'Safety Officer',
        recordsCount: holdCount,
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
        formats: ['Excel', 'PDF', 'CSV'],
        lastGenerated: lastSyncedTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        generatedBy: 'Logistics Lead',
        recordsCount: binCount,
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
        formats: ['Excel', 'PDF', 'CSV'],
        lastGenerated: lastSyncedTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        generatedBy: 'System Automated',
        recordsCount: lowStockCount,
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
        lastGenerated: lastSyncedTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        generatedBy: 'Security Lead',
        recordsCount: gpCount,
        status: 'Active',
        description: 'Gate pass authorizations, security stamps, and vehicle exit timestamps.',
      },
    ]
  }, [products, grns, gateEntries, dispatches, qcs, adjustments, racks, gatePasses, lastSyncedTime])

  // Filtered Reports Catalog
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

  // Real Dynamic Export Handler
  const handleDownloadReport = (report, format) => {
    const rawData = getReportDataSet(report.code)
    const fileName = `${report.code}_${report.name.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().slice(0, 10)}`

    if (!rawData || rawData.length === 0) {
      triggerToast(`Notice: No records currently found in database for ${report.name}.`)
    }

    const exportData = rawData && rawData.length > 0 ? rawData : [
      {
        'Report Code': report.code,
        'Report Name': report.name,
        'Operational Category': report.category,
        'Storage Shade': report.shadeName,
        'Generated By': report.generatedBy,
        'Records Available': 0,
        'Export Timestamp': new Date().toLocaleString('en-IN'),
      }
    ]

    try {
      if (format.toLowerCase() === 'excel') {
        exportToExcel(exportData, fileName, report.code)
        triggerToast(`Exported ${report.name} as Excel (.xlsx) [${rawData.length} rows]`)
      } else if (format.toLowerCase() === 'csv') {
        exportToCSV(exportData, fileName)
        triggerToast(`Exported ${report.name} as CSV (.csv) [${rawData.length} rows]`)
      } else if (format.toLowerCase() === 'pdf') {
        printOrExportPDF(exportData, report.name, `${report.code} • ${report.category}`)
        triggerToast(`Opened PDF Print / Export dialog for ${report.name}`)
      }
    } catch (err) {
      console.error('Export failed:', err)
      triggerToast(`Export error: ${err.message || 'Could not export file'}`)
    }
  }

  // Handle Schedule Submit
  const handleScheduleSubmit = (e) => {
    e.preventDefault()
    const newSchedule = {
      id: Date.now(),
      reportCode: scheduleConfig.reportCode,
      reportName: scheduleConfig.reportName,
      frequency: scheduleConfig.frequency,
      format: scheduleConfig.format,
      recipients: scheduleConfig.recipients,
      status: 'Active',
      createdAt: new Date().toLocaleDateString('en-IN'),
    }
    setScheduledReports((prev) => [newSchedule, ...prev])
    setShowScheduleModal(false)
    triggerToast(`Automated schedule activated for "${scheduleConfig.reportName}".`)
  }

  // Preview Modal Records Dataset
  const previewDataset = useMemo(() => {
    if (!showPreviewModal) return []
    const fullData = getReportDataSet(showPreviewModal.code)
    if (!previewSearch.trim()) return fullData

    const q = previewSearch.toLowerCase()
    return fullData.filter((row) =>
      Object.values(row).some((val) => String(val).toLowerCase().includes(q))
    )
  }, [showPreviewModal, getReportDataSet, previewSearch])

  // Dropdown Options
  const categoryOptions = [
    { value: 'ALL', label: 'All Report Categories' },
    { value: 'Inventory', label: 'Inventory & Stock Summary' },
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
        <div className="fixed top-5 right-5 z-[9999] pointer-events-auto bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-bounce border border-slate-700">
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
              <span className="text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60 px-2.5 py-0.5 rounded-full shrink-0 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Reporting Hub Live
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1 max-w-2xl">
              Generate, schedule, and preview operational audit reports across Inventory, Inward GRN, Outward Dispatches, and Quality testing.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">
          {/* Live Refresh Button */}
          <button
            type="button"
            onClick={() => {
              loadReportsData()
              triggerToast('Refreshed reports data with live database.')
            }}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition shrink-0 cursor-pointer disabled:opacity-50"
            title="Refresh Live Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isLoading ? 'animate-spin text-indigo-600' : ''}`} />
            <span>{isLoading ? 'Syncing...' : 'Sync Live'}</span>
          </button>

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
        {/* Total Stock Volume */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center gap-3.5 min-w-0 transition hover:shadow-md">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-500 truncate">Total Stock Volume</p>
            <h3 className="text-xl font-bold text-slate-800 leading-tight mt-0.5 truncate">
              {kpis.totalStockUnits.toLocaleString()} Units
            </h3>
            <p className="text-[11px] text-emerald-600 font-medium truncate flex items-center gap-1">
              <span className="font-bold">↑ Active Inventory</span>
              <span className="text-slate-400">• {kpis.lowStockCount} low stock alerts</span>
            </p>
          </div>
        </div>

        {/* Active SKUs Monitored */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center gap-3.5 min-w-0 transition hover:shadow-md">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-500 truncate">Active SKUs Monitored</p>
            <h3 className="text-xl font-bold text-slate-800 leading-tight mt-0.5 truncate">
              {kpis.activeSKUs.toLocaleString()} SKUs
            </h3>
            <p className="text-[11px] text-emerald-600 font-medium truncate">
              Across {kpis.shadesCount} warehouse shades
            </p>
          </div>
        </div>

        {/* Inward Goods (GRN) */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center gap-3.5 min-w-0 transition hover:shadow-md">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-500 truncate">Inward Goods (GRN)</p>
            <h3 className="text-xl font-bold text-slate-800 leading-tight mt-0.5 truncate">
              {kpis.grnBatches.toLocaleString()} Batches
            </h3>
            <p className="text-[11px] text-blue-600 font-medium truncate">
              {kpis.qcTestsCount} QC tests cleared
            </p>
          </div>
        </div>

        {/* Outward Dispatches */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center gap-3.5 min-w-0 transition hover:shadow-md">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0">
            <Send className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-500 truncate">Outward Dispatches</p>
            <h3 className="text-xl font-bold text-slate-800 leading-tight mt-0.5 truncate">
              {kpis.dispatchesCount.toLocaleString()} Shipments
            </h3>
            <p className="text-[11px] text-purple-600 font-medium truncate">
              Retail &amp; DC consignments
            </p>
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

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs bg-indigo-50 text-indigo-700 font-bold px-3 py-1 rounded-full border border-indigo-200/60">
                {filteredReports.length} Reports Available
              </span>

              {scheduledReports.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowSchedulesDrawer(!showSchedulesDrawer)}
                  className="text-xs bg-amber-50 text-amber-800 hover:bg-amber-100 font-bold px-3 py-1 rounded-full border border-amber-200 transition cursor-pointer flex items-center gap-1"
                >
                  <Clock className="w-3 h-3 text-amber-600" />
                  <span>{scheduledReports.length} Scheduled</span>
                </button>
              )}

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

          {/* Scheduled Reports Quick Bar */}
          {showSchedulesDrawer && scheduledReports.length > 0 && (
            <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-700" />
                  Active Automated Schedules ({scheduledReports.length})
                </span>
                <button
                  type="button"
                  onClick={() => setShowSchedulesDrawer(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                {scheduledReports.map((sch) => (
                  <div key={sch.id} className="bg-white p-2.5 rounded-lg border border-amber-200/80 flex items-center justify-between gap-2 shadow-xs">
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 truncate">{sch.reportName}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{sch.frequency} • {sch.format}</p>
                      <p className="text-[10px] text-indigo-600 truncate">{sch.recipients}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setScheduledReports((prev) => prev.filter((item) => item.id !== sch.id))
                        triggerToast(`Deleted schedule for "${sch.reportName}".`)
                      }}
                      className="p-1 rounded text-rose-500 hover:bg-rose-50 transition cursor-pointer shrink-0"
                      title="Remove Schedule"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

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
          {isLoading ? (
            <DataLoader
              text="Loading Live Warehouse Reports & Ledger Records..."
              subtext="Synchronizing inventory balances, GRN logs, dispatches, and gate passes..."
              size="md"
            />
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4 min-w-[220px]">Report Name &amp; Code</th>
                  <th className="py-3 px-4 min-w-[150px]">Operational Module</th>
                  <th className="py-3 px-4 min-w-[140px]">Frequency &amp; Shade</th>
                  <th className="py-3 px-4 min-w-[120px] text-right">Records Count</th>
                  <th className="py-3 px-4 min-w-[140px]">Last Generated</th>
                  <th className="py-3 px-4 min-w-[120px] text-center">Formats</th>
                  <th className="py-3 px-4 min-w-[140px] text-center">Actions</th>
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
                        <div
                          className="font-bold text-slate-800 hover:text-indigo-600 transition cursor-pointer"
                          onClick={() => {
                            setShowPreviewModal(row)
                            setPreviewSearch('')
                          }}
                        >
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
                        <span className={`inline-block px-2 py-0.5 rounded-md font-mono ${
                          row.recordsCount > 0 ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {row.recordsCount.toLocaleString()} rows
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800">{row.lastGenerated}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">By {row.generatedBy}</div>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1 flex-wrap">
                          {row.formats.map((fmt, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => handleDownloadReport(row, fmt)}
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded border transition cursor-pointer hover:scale-105 ${
                                fmt === 'Excel'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                  : fmt === 'PDF'
                                  ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                                  : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                              }`}
                              title={`Export as ${fmt}`}
                            >
                              {fmt}
                            </button>
                          ))}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Preview Action */}
                          <button
                            type="button"
                            onClick={() => {
                              setShowPreviewModal(row)
                              setPreviewSearch('')
                            }}
                            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 transition cursor-pointer shadow-xs"
                            title="Preview Live Data Table"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-600" />
                          </button>

                          {/* Quick Export Excel Action */}
                          <button
                            type="button"
                            onClick={() => handleDownloadReport(row, 'Excel')}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold transition cursor-pointer shadow-xs"
                            title="Export to Excel (.xlsx)"
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
          )}
        </div>

        {/* Table Pagination Footer */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Showing {filteredReports.length === 0 ? 0 : (currentPage - 1) * perPage + 1} to{' '}
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
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-4 sm:p-6 max-h-[90dvh] overflow-y-auto no-scrollbar animate-in zoom-in-95">
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
                  Report Template *
                </label>
                <CustomSelect
                  value={scheduleConfig.reportCode}
                  onChange={(val) => {
                    const selected = reportsList.find((r) => r.code === val)
                    setScheduleConfig({
                      ...scheduleConfig,
                      reportCode: val,
                      reportName: selected ? selected.name : scheduleConfig.reportName,
                    })
                  }}
                  options={reportsList.map((r) => ({
                    value: r.code,
                    label: r.name,
                    sublabel: `${r.code} • ${r.category}`,
                  }))}
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
                      { value: 'Daily (18:00 IST)', label: 'Daily (18:00 IST)' },
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
                      { value: 'Excel & CSV', label: 'Excel & CSV (.xlsx, .csv)' },
                      { value: 'PDF Document', label: 'PDF Document (.pdf)' },
                      { value: 'Excel Only', label: 'Excel Only (.xlsx)' },
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
                  placeholder="manager@warehouse.com, supervisor@wms.com"
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
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition cursor-pointer shadow-xs"
                >
                  Activate Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: LIVE REPORT PREVIEW */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full p-4 sm:p-6 max-h-[90dvh] flex flex-col overflow-hidden animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-800">{showPreviewModal.name}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                    Live Data Preview
                  </span>
                </div>
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

            {/* Modal Body with Scroll */}
            <div className="mt-4 space-y-4 text-xs overflow-y-auto pr-1 no-scrollbar flex-1">
              {/* Metadata Cards */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Records</span>
                  <p className="font-bold text-slate-800 text-sm">{showPreviewModal.recordsCount.toLocaleString()} rows</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Frequency</span>
                  <p className="font-bold text-indigo-600 text-sm">{showPreviewModal.frequency}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Author / Role</span>
                  <p className="font-bold text-slate-800 text-sm truncate">{showPreviewModal.generatedBy}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Status</span>
                  <p className="font-bold text-emerald-600 text-sm flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    {showPreviewModal.status}
                  </p>
                </div>
              </div>

              {/* Live Search Inside Preview */}
              <div className="flex items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={previewSearch}
                    onChange={(e) => setPreviewSearch(e.target.value)}
                    placeholder="Search inside preview dataset..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8.5 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                  {previewSearch && (
                    <button
                      type="button"
                      onClick={() => setPreviewSearch('')}
                      className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 shrink-0 font-medium">
                  Showing {previewDataset.length} matching rows
                </div>
              </div>

              {/* Dynamic Live Snapshot Table */}
              <div className="border border-slate-200 rounded-xl overflow-x-auto shadow-xs">
                {previewDataset.length === 0 ? (
                  <div className="py-10 text-center text-slate-400 font-sans text-xs">
                    <FileSpreadsheet className="w-7 h-7 mx-auto text-slate-300 mb-1.5" />
                    No matching records found for this report filter in database.
                  </div>
                ) : (
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-3 w-10 text-center">#</th>
                        {Object.keys(previewDataset[0] || {}).map((colKey) => (
                          <th key={colKey} className="py-2 px-3 whitespace-nowrap">
                            {colKey}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[11px]">
                      {previewDataset.slice(0, 50).map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80 transition">
                          <td className="py-2 px-3 text-center text-slate-400 font-mono text-[10px]">
                            {idx + 1}
                          </td>
                          {Object.keys(previewDataset[0] || {}).map((colKey) => (
                            <td key={colKey} className="py-2 px-3 text-slate-700 whitespace-nowrap">
                              {typeof row[colKey] === 'boolean'
                                ? row[colKey] ? 'Yes' : 'No'
                                : String(row[colKey] ?? '—')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Modal Footer with Direct Export Options */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 shrink-0 mt-3">
              <div className="text-[11px] text-slate-400 font-mono">
                {previewDataset.length > 50 ? `Preview capped at first 50 of ${previewDataset.length} rows. Full export includes all.` : `All ${previewDataset.length} records ready.`}
              </div>

              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(null)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold transition cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadReport(showPreviewModal, 'CSV')}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 font-bold transition cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadReport(showPreviewModal, 'PDF')}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-bold transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadReport(showPreviewModal, 'Excel')}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Excel (.xlsx)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
