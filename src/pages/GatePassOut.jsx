import { useState, useMemo, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { printSpecificElement } from '../utils/printHelper'
import {
  FileText,
  ShieldCheck,
  ShieldAlert,
  Truck,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Download,
  Eye,
  RotateCcw,
  Search,
  ChevronDown,
  Check,
  X,
  Printer,
  MapPin,
  Calendar,
  User,
  QrCode,
  Layers,
  ArrowUpRight,
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

// 6 Dedicated Warehouse Storage Shades
const SHADES = [
  { id: 'SH01', name: 'Shade 1: Grains & Bulk Pulses', baseUnit: 'Kg', packUnit: 'Bags (50kg)', unitsPerPack: 50 },
  { id: 'SH02', name: 'Shade 2: Edible Oils & Liquids', baseUnit: 'Ltr', packUnit: 'Tins (15L)', unitsPerPack: 15 },
  { id: 'SH03', name: 'Shade 3: Packaged Food & FMCG', baseUnit: 'Pieces', packUnit: 'Gatta (Cartons)', unitsPerPack: 6 },
  { id: 'SH04', name: 'Shade 4: Packaging Materials & Cartons', baseUnit: 'Cartons', packUnit: 'Bundles', unitsPerPack: 25 },
  { id: 'SH05', name: 'Shade 5: Chemicals & Hygiene', baseUnit: 'Ltr', packUnit: 'Carboys (20L)', unitsPerPack: 20 },
  { id: 'SH06', name: 'Shade 6: Spares & General Goods', baseUnit: 'Nos', packUnit: 'Crates', unitsPerPack: 10 },
]

export default function GatePassOut() {
  // Toast notifications state
  const [toastMessage, setToastMessage] = useState(null)
  const triggerToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Filter toolbar state
  const [filterType, setFilterType] = useState('ALL')
  const [filterShade, setFilterShade] = useState('ALL')
  const [filterDestination, setFilterDestination] = useState('ALL')
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const perPage = 7

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showVoucherModal, setShowVoucherModal] = useState(null)

  // Create Gate Pass Form State
  const [newPass, setNewPass] = useState({
    dispatchNo: 'DISP-2026-325',
    vehicleNo: 'DL-01-EA-5521',
    driverName: 'Virender Yadav',
    licenseNo: 'DL-0420190038124',
    destination: 'Metro Hypermarket Central Hub',
    shadeId: 'SH03',
    productName: 'Parle-G Gold Biscuits (100g)',
    baseUnit: 'Pieces',
    packUnit: 'Gatta',
    unitsPerPack: 6,
    packsCount: 200,
    dispatchType: 'Commercial Issue',
    labStatus: 'Passed',
    labCertNo: 'LAB-2026-FMCG-099',
    authorisedBy: 'Logistics Mgr. A. Sharma',
    remarks: 'Verified commercial gate pass out with strict lab clearance compliance.',
  })

  // 8 Rich Gate Pass Out Records
  const [gatePasses, setGatePasses] = useState([
    {
      id: 1,
      gatePassNo: 'GP-2026-246',
      date: '16 Sep 2026, 14:30',
      dispatchNo: 'DISP-2026-324',
      vehicleNo: 'UP-32-AB-1234',
      driverName: 'Rajesh Kumar',
      licenseNo: 'DL-0420190038124',
      destination: 'Metro Hypermarket Central Hub',
      shadeId: 'SH01',
      location: 'SH01-R02-C04',
      productName: 'Sharbati Wheat Flour (10kg Bags)',
      baseQty: 1200,
      baseUnit: 'Kg',
      packQty: 120,
      packUnit: 'Bags',
      dispatchType: 'Commercial Issue',
      status: 'Approved',
      labStatus: 'Passed',
      labCertNo: 'LAB-2026-FMCG-088',
      authorisedBy: 'A. Sharma (Logistics Mgr)',
    },
    {
      id: 2,
      gatePassNo: 'GP-2026-245',
      date: '16 Sep 2026, 11:15',
      dispatchNo: 'DISP-2026-323',
      vehicleNo: 'HR-26-CD-5678',
      driverName: 'Suresh Yadav',
      licenseNo: 'HR-0620180029381',
      destination: 'Reliance Retail Distribution Centre',
      shadeId: 'SH03',
      location: 'SH03-R01-C03',
      productName: 'Parle-G Gold Biscuits (100g)',
      baseQty: 2400,
      baseUnit: 'Pieces',
      packQty: 200,
      packUnit: 'Gatta',
      dispatchType: 'Commercial Issue',
      status: 'Departed',
      labStatus: 'Passed',
      labCertNo: 'LAB-2026-FMCG-077',
      authorisedBy: 'V. Singh (Gate Officer)',
    },
    {
      id: 3,
      gatePassNo: 'GP-2026-244',
      date: '15 Sep 2026, 17:40',
      dispatchNo: 'DISP-2026-322',
      vehicleNo: 'DL-04-EF-9012',
      driverName: 'Manoj Patel',
      licenseNo: 'DL-0820170018273',
      destination: 'DMart Logistics Park',
      shadeId: 'SH02',
      location: 'SH02-R03-C01',
      productName: 'Fortune Mustard Oil (15L Tins)',
      baseQty: 600,
      baseUnit: 'Ltr',
      packQty: 40,
      packUnit: 'Tins',
      dispatchType: 'Commercial Issue',
      status: 'Departed',
      labStatus: 'Passed',
      labCertNo: 'LAB-2026-OIL-012',
      authorisedBy: 'A. Sharma (Logistics Mgr)',
    },
    {
      id: 4,
      gatePassNo: 'GP-2026-243',
      date: '15 Sep 2026, 09:20',
      dispatchNo: 'DISP-2026-321',
      vehicleNo: 'KA-04-GH-3456',
      driverName: 'Deepak Verma',
      licenseNo: 'KA-0220200047291',
      destination: 'BigBasket Fulfillment Centre',
      shadeId: 'SH04',
      location: 'SH04-R02-C02',
      productName: 'Master 5-Ply Shipping Cartons',
      baseQty: 1500,
      baseUnit: 'Cartons',
      packQty: 60,
      packUnit: 'Bundles',
      dispatchType: 'Inter-Warehouse Transfer',
      status: 'Pending Exit',
      labStatus: 'Passed',
      labCertNo: 'LAB-2026-PKG-011',
      authorisedBy: 'V. Singh (Gate Officer)',
    },
    {
      id: 5,
      gatePassNo: 'GP-2026-242',
      date: '14 Sep 2026, 16:10',
      dispatchNo: 'DISP-2026-320',
      vehicleNo: 'HR-26-BK-3390',
      driverName: 'Vikram Singh',
      licenseNo: 'HR-0420190018374',
      destination: 'Blinkit Rapid Staging Hub',
      shadeId: 'SH03',
      location: 'SH03-R02-C04',
      productName: 'Parle-G Glucose Biscuits (50g)',
      baseQty: 600,
      baseUnit: 'Pieces',
      packQty: 100,
      packUnit: 'Gatta',
      dispatchType: 'Commercial Issue',
      status: 'Departed',
      labStatus: 'Passed',
      labCertNo: 'LAB-2026-FMCG-088',
      authorisedBy: 'A. Sharma (Logistics Mgr)',
    },
    {
      id: 6,
      gatePassNo: 'GP-2026-241',
      date: '14 Sep 2026, 12:05',
      dispatchNo: 'DISP-2026-319',
      vehicleNo: 'WB-02-SP-5589',
      driverName: 'Anil Roy',
      licenseNo: 'WB-0120180039281',
      destination: 'Spencers Wholesale Depot',
      shadeId: 'SH05',
      location: 'SH05-R01-C03',
      productName: 'Industrial Disinfectant Concentrate',
      baseQty: 400,
      baseUnit: 'Ltr',
      packQty: 20,
      packUnit: 'Carboys',
      dispatchType: 'Commercial Issue',
      status: 'Departed',
      labStatus: 'Passed',
      labCertNo: 'LAB-2026-CHM-019',
      authorisedBy: 'V. Singh (Gate Officer)',
    },
    {
      id: 7,
      gatePassNo: 'GP-2026-240',
      date: '13 Sep 2026, 15:50',
      dispatchNo: 'DISP-2026-318',
      vehicleNo: 'DL-04-AZ-6620',
      driverName: 'Pradeep Shinde',
      licenseNo: 'DL-0920190028194',
      destination: 'Amazon Pantry Staging Bay',
      shadeId: 'SH03',
      location: 'SH03-R01-C06',
      productName: 'Tata Tea Gold (500g)',
      baseQty: 840,
      baseUnit: 'Pieces',
      packQty: 70,
      packUnit: 'Gatta',
      dispatchType: 'Commercial Issue',
      status: 'Approved',
      labStatus: 'Passed',
      labCertNo: 'LAB-2026-TEA-044',
      authorisedBy: 'A. Sharma (Logistics Mgr)',
    },
    {
      id: 8,
      gatePassNo: 'GP-2026-239',
      date: '13 Sep 2026, 10:30',
      dispatchNo: 'DISP-2026-317',
      vehicleNo: 'HR-55-FK-1109',
      driverName: 'Harish Rawat',
      licenseNo: 'HR-0220170048291',
      destination: 'Flipkart Grocery Hub',
      shadeId: 'SH01',
      location: 'SH01-R04-C02',
      productName: 'Moong Dal Mogar Yellow',
      baseQty: 2500,
      baseUnit: 'Kg',
      packQty: 50,
      packUnit: 'Bags',
      dispatchType: 'Inter-Warehouse Transfer',
      status: 'Departed',
      labStatus: 'Passed',
      labCertNo: 'LAB-2026-PUL-011',
      authorisedBy: 'V. Singh (Gate Officer)',
    },
  ])

  // Filtered Gate Passes
  const filteredPasses = useMemo(() => {
    return gatePasses.filter((item) => {
      if (filterType !== 'ALL' && item.dispatchType !== filterType) return false
      if (filterShade !== 'ALL' && item.shadeId !== filterShade) return false
      if (filterDestination !== 'ALL' && item.destination !== filterDestination) return false
      if (filterStatus !== 'ALL' && item.status !== filterStatus) return false

      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase()
        return (
          item.gatePassNo.toLowerCase().includes(q) ||
          item.dispatchNo.toLowerCase().includes(q) ||
          item.vehicleNo.toLowerCase().includes(q) ||
          item.driverName.toLowerCase().includes(q) ||
          item.destination.toLowerCase().includes(q) ||
          item.productName.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [gatePasses, filterType, filterShade, filterDestination, filterStatus, searchQuery])

  // Paginated Results
  const totalPages = Math.max(1, Math.ceil(filteredPasses.length / perPage))
  const paginatedPasses = filteredPasses.slice((currentPage - 1) * perPage, currentPage * perPage)

  // Dynamic KPI Stats
  const stats = useMemo(() => {
    const total = gatePasses.length
    const approved = gatePasses.filter((g) => g.status === 'Approved').length
    const pendingExit = gatePasses.filter((g) => g.status === 'Pending Exit').length
    const departed = gatePasses.filter((g) => g.status === 'Departed').length
    return { total, approved, pendingExit, departed }
  }, [gatePasses])

  // Handle Save New Gate Pass
  const handleCreateGatePass = (e) => {
    e.preventDefault()
    const computedBase = (Number(newPass.packsCount) || 0) * (Number(newPass.unitsPerPack) || 1)
    const newNo = `GP-2026-${247 + gatePasses.length}`
    const locCode = `${newPass.shadeId}-R01-C01`

    const newRecord = {
      id: Date.now(),
      gatePassNo: newNo,
      date: 'Today, Just now',
      dispatchNo: newPass.dispatchNo,
      vehicleNo: newPass.vehicleNo,
      driverName: newPass.driverName,
      licenseNo: newPass.licenseNo,
      destination: newPass.destination,
      shadeId: newPass.shadeId,
      location: locCode,
      productName: newPass.productName,
      baseQty: computedBase,
      baseUnit: newPass.baseUnit,
      packQty: Number(newPass.packsCount) || 1,
      packUnit: newPass.packUnit,
      dispatchType: newPass.dispatchType,
      status: 'Approved',
      labStatus: 'Passed',
      labCertNo: newPass.labCertNo,
      authorisedBy: newPass.authorisedBy,
    }

    setGatePasses([newRecord, ...gatePasses])
    setShowCreateModal(false)
    triggerToast(`Gate Pass ${newNo} issued for vehicle ${newRecord.vehicleNo}.`)
  }

  // Handle Advance Pass Status
  const handleAdvanceStatus = (id) => {
    setGatePasses(
      gatePasses.map((p) => {
        if (p.id !== id) return p
        const next = p.status === 'Approved' ? 'Pending Exit' : 'Departed'
        return { ...p, status: next }
      })
    )
    triggerToast('Gate pass status updated.')
  }

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      '#',
      'Gate Pass No',
      'Date & Time',
      'Dispatch Ref',
      'Vehicle No',
      'Driver Name',
      'License No',
      'Destination Hub',
      'Origin Shade',
      'Product Name',
      'Base Qty',
      'Base Unit',
      'Packaging Packs',
      'Dispatch Type',
      'Lab QC Cert',
      'Status',
    ]

    const rows = filteredPasses.map((row, idx) => [
      idx + 1,
      row.gatePassNo,
      `"${row.date}"`,
      row.dispatchNo,
      row.vehicleNo,
      `"${row.driverName}"`,
      row.licenseNo,
      `"${row.destination}"`,
      row.shadeId,
      `"${row.productName}"`,
      row.baseQty,
      row.baseUnit,
      `"${row.packQty} ${row.packUnit}"`,
      `"${row.dispatchType}"`,
      row.labCertNo,
      row.status,
    ])

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'Gate_Pass_Outward_Register.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    triggerToast('Gate pass outward register exported to CSV.')
  }

  // Filter Options
  const typeOptions = [
    { value: 'ALL', label: 'All Pass Types' },
    { value: 'Commercial Issue', label: 'Commercial Customer Issue' },
    { value: 'Inter-Warehouse Transfer', label: 'Inter-Warehouse Transfer' },
  ]

  const shadeOptions = [
    { value: 'ALL', label: 'All 6 Dedicated Shades' },
    ...SHADES.map((s) => ({ value: s.id, label: s.name })),
  ]

  const destinationOptions = [
    { value: 'ALL', label: 'All Destination Hubs' },
    { value: 'Metro Hypermarket Central Hub', label: 'Metro Hypermarket Hub' },
    { value: 'Reliance Retail Distribution Centre', label: 'Reliance Retail DC' },
    { value: 'DMart Logistics Park', label: 'DMart Logistics Park' },
    { value: 'BigBasket Fulfillment Centre', label: 'BigBasket Fulfillment' },
    { value: 'Blinkit Rapid Staging Hub', label: 'Blinkit Staging Hub' },
    { value: 'Spencers Wholesale Depot', label: 'Spencers Wholesale' },
    { value: 'Amazon Pantry Staging Bay', label: 'Amazon Pantry Bay' },
    { value: 'Flipkart Grocery Hub', label: 'Flipkart Grocery Hub' },
  ]

  const statusOptions = [
    { value: 'ALL', label: 'All Security Statuses' },
    { value: 'Approved', label: 'Security Approved' },
    { value: 'Pending Exit', label: 'Pending Gate Exit' },
    { value: 'Departed', label: 'Departed & Closed' },
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
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-xs shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">Gate Pass Out &amp; Security Clearance</h1>
              <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2.5 py-0.5 rounded-full shrink-0">
                Security Perimeter Desk
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1 max-w-2xl">
              Issue authorized outbound gate passes, cross-verify vehicle cargo against QA lab clearance certificates, and log gate exit timestamps.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition shrink-0 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Gate Pass</span>
          </button>
        </div>
      </div>

      {/* 4 Dynamic KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-700 border border-slate-200 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Total Gate Passes</p>
            <h3 className="text-xl font-bold text-slate-800 leading-tight mt-0.5">
              {stats.total} Passes
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">Logged this month</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Security Approved</p>
            <h3 className="text-xl font-bold text-slate-800 leading-tight mt-0.5">
              {stats.approved} Ready
            </h3>
            <p className="text-[11px] text-emerald-600 font-medium">Verified by security officer</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Pending Gate Exit</p>
            <h3 className="text-xl font-bold text-slate-800 leading-tight mt-0.5">
              {stats.pendingExit} Vehicles
            </h3>
            <p className="text-[11px] text-amber-600 font-medium">At exit checkpoint bay</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Departed &amp; Closed</p>
            <h3 className="text-xl font-bold text-slate-800 leading-tight mt-0.5">
              {stats.departed} Vehicles
            </h3>
            <p className="text-[11px] text-blue-600 font-medium">Perimeter exit complete</p>
          </div>
        </div>
      </div>

      {/* Gate Pass Master Register Card */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
        {/* Filter Section Header & Inputs */}
        <div className="p-5 border-b border-slate-100 space-y-4">
          {/* Top Line: Section Title & Results Count */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-800">Outward Gate Pass Register</h2>
                <p className="text-[11px] text-slate-500">Filter passes by vehicle registration, driver license, destination hub, or gate status.</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-3 py-1 rounded-full border border-emerald-200/60">
                {filteredPasses.length} Passes Found
              </span>
              {(searchQuery || filterType !== 'ALL' || filterShade !== 'ALL' || filterDestination !== 'ALL' || filterStatus !== 'ALL') && (
                <button
                  type="button"
                  onClick={() => {
                    setFilterType('ALL')
                    setFilterShade('ALL')
                    setFilterDestination('ALL')
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
              placeholder="Search gate pass (GP-2026-...), vehicle registration no, driver name, destination hub, or cargo product..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition"
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
                Pass Type
              </label>
              <CustomSelect
                value={filterType}
                onChange={(val) => {
                  setFilterType(val)
                  setCurrentPage(1)
                }}
                options={typeOptions}
                placeholder="All Pass Types"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1.5">
                Origin Shade
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
                Destination Hub
              </label>
              <CustomSelect
                value={filterDestination}
                onChange={(val) => {
                  setFilterDestination(val)
                  setCurrentPage(1)
                }}
                options={destinationOptions}
                placeholder="All Destinations"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1.5">
                Security Gate Status
              </label>
              <CustomSelect
                value={filterStatus}
                onChange={(val) => {
                  setFilterStatus(val)
                  setCurrentPage(1)
                }}
                options={statusOptions}
                placeholder="All Security Statuses"
              />
            </div>
          </div>
        </div>

        {/* Gate Passes Table */}
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4 min-w-[140px]">Pass No &amp; Timestamp</th>
                <th className="py-3 px-4 min-w-[130px]">Dispatch Ref</th>
                <th className="py-3 px-4 min-w-[170px]">Vehicle &amp; Driver</th>
                <th className="py-3 px-4 min-w-[180px]">Destination Hub</th>
                <th className="py-3 px-4 min-w-[150px] text-right">Cargo Payload</th>
                <th className="py-3 px-4 min-w-[100px] text-center">Lab Clearance</th>
                <th className="py-3 px-4 min-w-[110px] text-center">Status</th>
                <th className="py-3 px-4 min-w-[120px] text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedPasses.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <FileText className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    No gate passes match the selected filters.
                  </td>
                </tr>
              ) : (
                paginatedPasses.map((row, idx) => {
                  const globalIdx = (currentPage - 1) * perPage + idx + 1
                  return (
                    <tr key={row.id} className="hover:bg-slate-50/60 transition group">
                      <td className="py-3 px-4 text-center text-slate-400 font-mono text-[11px]">
                        {globalIdx}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-800">{row.gatePassNo}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{row.date}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-mono text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200/60">
                          {row.dispatchNo}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-1 font-medium">{row.dispatchType}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-800 font-mono">{row.vehicleNo}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <User className="w-3 h-3 text-slate-400" />
                          <span>{row.driverName}</span>
                          <span className="text-slate-300">•</span>
                          <span className="font-mono text-[10px] text-slate-400">{row.licenseNo}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{row.destination}</div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5 flex items-center gap-1">
                          <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-bold">{row.shadeId}</span>
                          <span>{row.location}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="font-bold text-slate-800">
                          {row.baseQty.toLocaleString()} {row.baseUnit}
                        </div>
                        <div className="text-[11px] text-emerald-600 font-medium mt-0.5">
                          {row.packQty} {row.packUnit}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <Check className="w-3 h-3" />
                          <span>Passed</span>
                        </span>
                        <div className="text-[9px] text-slate-400 font-mono mt-0.5">{row.labCertNo}</div>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                            row.status === 'Departed'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : row.status === 'Pending Exit'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              row.status === 'Departed'
                                ? 'bg-blue-500'
                                : row.status === 'Pending Exit'
                                ? 'bg-amber-500 animate-pulse'
                                : 'bg-emerald-500'
                            }`}
                          />
                          <span>{row.status}</span>
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setShowVoucherModal(row)}
                            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 transition cursor-pointer"
                            title="View Gate Pass Voucher"
                          >
                            <Printer className="w-3.5 h-3.5 text-slate-600" />
                          </button>

                          {row.status !== 'Departed' && (
                            <button
                              type="button"
                              onClick={() => handleAdvanceStatus(row.id)}
                              className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold transition cursor-pointer"
                              title="Advance Pass Status"
                            >
                              {row.status === 'Approved' ? 'Gate Exit' : 'Depart'}
                            </button>
                          )}
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
            {Math.min(currentPage * perPage, filteredPasses.length)} of{' '}
            {filteredPasses.length} gate passes
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
                    ? 'bg-emerald-600 text-white'
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

      {/* MODAL 1: CREATE GATE PASS */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto no-scrollbar animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">Issue Outbound Gate Pass</h3>
                  <p className="text-xs text-slate-500">Authorize vehicle departure with verified QA test certificate</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGatePass} className="mt-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                    Dispatch Reference No *
                  </label>
                  <input
                    type="text"
                    required
                    value={newPass.dispatchNo}
                    onChange={(e) => setNewPass({ ...newPass, dispatchNo: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                    Destination Hub / Unit *
                  </label>
                  <input
                    type="text"
                    required
                    value={newPass.destination}
                    onChange={(e) => setNewPass({ ...newPass, destination: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                    Vehicle Registration Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={newPass.vehicleNo}
                    onChange={(e) => setNewPass({ ...newPass, vehicleNo: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                    Driver Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newPass.driverName}
                    onChange={(e) => setNewPass({ ...newPass, driverName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                    Driver Driving License No *
                  </label>
                  <input
                    type="text"
                    required
                    value={newPass.licenseNo}
                    onChange={(e) => setNewPass({ ...newPass, licenseNo: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                    Origin Warehouse Shade *
                  </label>
                  <CustomSelect
                    value={newPass.shadeId}
                    onChange={(val) => {
                      const sh = SHADES.find((s) => s.id === val)
                      setNewPass({
                        ...newPass,
                        shadeId: val,
                        baseUnit: sh ? sh.baseUnit : 'Pieces',
                        packUnit: sh ? sh.packUnit : 'Gatta',
                        unitsPerPack: sh ? sh.unitsPerPack : 6,
                      })
                    }}
                    options={SHADES.map((s) => ({ value: s.id, label: s.name }))}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                    Product Commodity Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newPass.productName}
                    onChange={(e) => setNewPass({ ...newPass, productName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                    Packaging Packs ({newPass.packUnit}) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newPass.packsCount}
                    onChange={(e) => setNewPass({ ...newPass, packsCount: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                    QA Lab Certificate Reference *
                  </label>
                  <input
                    type="text"
                    required
                    value={newPass.labCertNo}
                    onChange={(e) => setNewPass({ ...newPass, labCertNo: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                    Authorizing Gate Officer *
                  </label>
                  <input
                    type="text"
                    required
                    value={newPass.authorisedBy}
                    onChange={(e) => setNewPass({ ...newPass, authorisedBy: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Live Calculation Preview */}
              <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-emerald-800 font-semibold">Total Base Unit Cargo Payload</p>
                  <p className="text-xs text-emerald-950 font-bold mt-0.5">
                    {Number(newPass.packsCount) || 0} {newPass.packUnit} × {Number(newPass.unitsPerPack) || 1} ={' '}
                    <span className="text-sm font-black text-emerald-700">
                      {((Number(newPass.packsCount) || 0) * (Number(newPass.unitsPerPack) || 1)).toLocaleString()}{' '}
                      {newPass.baseUnit}
                    </span>
                  </p>
                </div>
                <span className="text-[10px] font-bold bg-emerald-200 text-emerald-900 px-2 py-1 rounded-md">
                  ✓ Verified for Gate
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
                >
                  Authorize Gate Pass
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: PRINTABLE GATE PASS VOUCHER */}
      {showVoucherModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto no-scrollbar animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-800">Print Gate Pass Slip</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowVoucherModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Printable Voucher Card */}
            <div id="printable-gate-pass-out-voucher" className="printable-area mt-4 p-5 bg-white border border-slate-300 rounded-xl shadow-xs space-y-4 text-xs font-mono">
              <div className="text-center border-b border-slate-200 pb-3">
                <h2 className="text-base font-black tracking-tight text-slate-900">CENTRAL WAREHOUSE LOGISTICS</h2>
                <p className="text-[11px] text-slate-500">OFFICIAL OUTWARD SECURITY GATE PASS</p>
                <p className="text-[10px] text-emerald-700 font-bold mt-0.5">SLIP #{showVoucherModal.gatePassNo}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-400">Timestamp:</span> {showVoucherModal.date}
                </div>
                <div>
                  <span className="text-slate-400">Dispatch Ref:</span> {showVoucherModal.dispatchNo}
                </div>
                <div>
                  <span className="text-slate-400">Vehicle:</span> {showVoucherModal.vehicleNo}
                </div>
                <div>
                  <span className="text-slate-400">Driver:</span> {showVoucherModal.driverName}
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400">License:</span> {showVoucherModal.licenseNo}
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400">Destination:</span> {showVoucherModal.destination}
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400">Cargo Payload:</span> {showVoucherModal.productName} —{' '}
                  <strong>
                    {showVoucherModal.baseQty.toLocaleString()} {showVoucherModal.baseUnit} ({showVoucherModal.packQty}{' '}
                    {showVoucherModal.packUnit})
                  </strong>
                </div>
              </div>

              <div className="border-t border-b border-slate-200 py-3 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase">QA Security Compliance</p>
                  <p className="text-xs font-bold text-emerald-700">✓ 100% LAB QC CLEARED</p>
                  <p className="text-[9px] text-slate-400 mt-0.5 font-mono">CERT: {showVoucherModal.labCertNo}</p>
                </div>
                <div className="w-14 h-14 bg-slate-100 border border-slate-300 rounded-lg flex items-center justify-center">
                  <QrCode className="w-10 h-10 text-slate-800" />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-[10px] text-slate-400">
                <span>Officer: {showVoucherModal.authorisedBy}</span>
                <span>Gate Stamp: CLEARED</span>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowVoucherModal(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  printSpecificElement('#printable-gate-pass-out-voucher', `Gate Pass Out - ${showVoucherModal.gatePassNo}`)
                  triggerToast('Gate Pass sent to printer.')
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Gate Slip</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
