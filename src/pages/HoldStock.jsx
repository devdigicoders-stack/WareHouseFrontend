import { useState, useMemo, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  X,
  Warehouse,
  Package,
  Layers,
  FlaskConical,
  CheckCircle2,
  AlertTriangle,
  Download,
  Eye,
  Plus,
  Lock,
  Unlock,
  Search,
  RotateCcw,
  ChevronDown,
  Check,
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

export default function HoldStock() {
  // Toast notifications state
  const [toastMessage, setToastMessage] = useState(null)
  const triggerToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Active filter tab
  const [activeTab, setActiveTab] = useState('ALL')

  // Filter toolbar state
  const [searchKeyword, setSearchKeyword] = useState('')
  const [filterShade, setFilterShade] = useState('ALL')
  const [filterReason, setFilterReason] = useState('ALL')

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const perPage = 8

  // Modals state
  const [showPutOnHoldModal, setShowPutOnHoldModal] = useState(false)
  const [showReleaseModal, setShowReleaseModal] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(null)

  // 6 Dedicated Shades
  const SHADES = [
    { id: 'SH01', name: 'Shade 1: Grains & Bulk Pulses' },
    { id: 'SH02', name: 'Shade 2: Edible Oils & Liquids' },
    { id: 'SH03', name: 'Shade 3: Packaged Food & FMCG' },
    { id: 'SH04', name: 'Shade 4: Packaging Materials & Cartons' },
    { id: 'SH05', name: 'Shade 5: Chemicals & Hygiene' },
    { id: 'SH06', name: 'Shade 6: Spares & General Goods' },
  ]

  // Form State
  const [newHold, setNewHold] = useState({
    productName: 'Refined Mustard Oil (New Batch Sample)',
    sku: 'OIL-REF-02',
    batchNo: 'BT-2026-OIL-99',
    shadeId: 'SH02',
    row: 'R01',
    col: 'C04',
    baseUnit: 'Ltr',
    packUnit: 'Tins (15L)',
    unitsPerPack: 15,
    packsCount: 20,
    baseQty: 300,
    reason: 'Under Lab Testing',
    holdDate: '18 Sep 2026',
    expectedRelease: '24 Sep 2026',
    status: 'On Hold',
    holdOfficer: 'Priya Patel (QC Lead)',
    remarks: 'Awaiting chemical purity and fatty acid profile test results.',
  })

  // Hold Stock Items Data
  const [holdItems, setHoldItems] = useState([
    {
      id: 1,
      refNo: 'HLD-2026-048',
      productName: 'Refined Mustard Oil (New Batch Sample)',
      sku: 'OIL-REF-02',
      batchNo: 'BT-2026-OIL-99',
      shadeId: 'SH02',
      location: 'SH02-R01-C04',
      baseQty: 300,
      baseUnit: 'Ltr',
      packQty: 20,
      packUnit: 'Tins',
      unitsPerPack: 15,
      reason: 'Under Lab Testing',
      labStatus: 'Pending Lab Test',
      holdDate: '18 Sep 2026',
      expectedRelease: '22 Sep 2026',
      status: 'On Hold',
      officer: 'Priya Patel',
      remarks: 'Sample drawn at gate inward; locked from outward dispatch.',
    },
    {
      id: 2,
      refNo: 'HLD-2026-047',
      productName: 'Maggi 2-Minute Noodles (70g)',
      sku: 'FMCG-NOD-01',
      batchNo: 'BT-2026-FMCG-88',
      shadeId: 'SH03',
      location: 'SH03-R03-C02',
      baseQty: 480,
      baseUnit: 'Pieces',
      packQty: 20,
      packUnit: 'Gatta',
      unitsPerPack: 24,
      reason: 'FSSAI Heavy Metal Lead Testing',
      labStatus: 'Under Testing',
      holdDate: '17 Sep 2026',
      expectedRelease: '21 Sep 2026',
      status: 'On Hold',
      officer: 'Dr. Neha Verma',
      remarks: 'Periodic compliance draw sent to referral laboratory.',
    },
    {
      id: 3,
      refNo: 'HLD-2026-046',
      productName: 'Sharbati Wheat Grain (Grade A)',
      sku: 'GRN-WHT-01',
      batchNo: 'BT-2026-GRN-09',
      shadeId: 'SH01',
      location: 'SH01-R02-C08',
      baseQty: 100,
      baseUnit: 'Kg',
      packQty: 2,
      packUnit: 'Bags',
      unitsPerPack: 50,
      reason: 'Quality Rejection (High Moisture)',
      labStatus: 'Lab Rejected',
      holdDate: '17 Sep 2026',
      expectedRelease: 'Vendor Return',
      status: 'Quarantine',
      officer: 'Dr. Neha Verma',
      remarks: 'Moisture 15.2% exceeds standard 12.0%. Awaiting RTV debit note.',
    },
    {
      id: 4,
      refNo: 'HLD-2026-045',
      productName: 'Tata Premium Tea (500g)',
      sku: 'FMCG-TEA-01',
      batchNo: 'BT-2026-FMCG-11',
      shadeId: 'SH03',
      location: 'SH03-R01-C06',
      baseQty: 360,
      baseUnit: 'Pieces',
      packQty: 15,
      packUnit: 'Gatta',
      unitsPerPack: 24,
      reason: 'Under Lab Testing',
      labStatus: 'Under Testing',
      holdDate: '16 Sep 2026',
      expectedRelease: '20 Sep 2026',
      status: 'On Hold',
      officer: 'Priya Patel',
      remarks: 'Moisture and pesticide residue screening in process.',
    },
    {
      id: 5,
      refNo: 'HLD-2026-044',
      productName: 'Parle-G Glucose Biscuits (50g)',
      sku: 'FMCG-BIS-01',
      batchNo: 'BT-2026-FMCG-01',
      shadeId: 'SH03',
      location: 'SH03-R02-C04',
      baseQty: 900,
      baseUnit: 'Pieces',
      packQty: 150,
      packUnit: 'Gatta',
      unitsPerPack: 6,
      reason: 'Routine Sampling Passed',
      labStatus: 'Passed',
      holdDate: '12 Sep 2026',
      expectedRelease: 'Released',
      status: 'Released',
      officer: 'Rajesh Sharma',
      remarks: 'Lab Certificate LAB-2026-FMCG-088 approved; released to stock.',
    },
  ])

  // Filtered Hold Items
  const filteredItems = useMemo(() => {
    return holdItems.filter((item) => {
      // Tab filter
      if (activeTab === 'PENDING' && item.status !== 'On Hold') return false
      if (activeTab === 'REJECTED' && item.status !== 'Quarantine') return false
      if (activeTab === 'RELEASED' && item.status !== 'Released') return false

      // Dropdown filters
      if (filterShade !== 'ALL' && item.shadeId !== filterShade) return false
      if (filterReason !== 'ALL' && item.reason !== filterReason) return false

      if (searchKeyword.trim() !== '') {
        const q = searchKeyword.toLowerCase()
        return (
          item.refNo.toLowerCase().includes(q) ||
          item.productName.toLowerCase().includes(q) ||
          item.batchNo.toLowerCase().includes(q) ||
          item.location.toLowerCase().includes(q) ||
          item.reason.toLowerCase().includes(q) ||
          item.officer.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [holdItems, activeTab, filterShade, filterReason, searchKeyword])

  // Paginated Results
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / perPage))
  const paginatedItems = filteredItems.slice((currentPage - 1) * perPage, currentPage * perPage)

  // Dynamic KPI Stats
  const stats = useMemo(() => {
    const total = holdItems.length
    const onHoldCount = holdItems.filter((i) => i.status === 'On Hold').length
    const quarantineCount = holdItems.filter((i) => i.status === 'Quarantine').length
    const releasedCount = holdItems.filter((i) => i.status === 'Released').length
    return { total, onHoldCount, quarantineCount, releasedCount }
  }, [holdItems])

  // Handle Save New Hold
  const handleSaveHold = (e) => {
    e.preventDefault()
    const computedBase = (Number(newHold.packsCount) || 0) * (Number(newHold.unitsPerPack) || 1)
    const refCode = `HLD-2026-0${49 + holdItems.length}`
    const locCode = `${newHold.shadeId}-${newHold.row}-${newHold.col}`

    const newRecord = {
      id: Date.now(),
      refNo: refCode,
      productName: newHold.productName,
      sku: newHold.sku,
      batchNo: newHold.batchNo,
      shadeId: newHold.shadeId,
      location: locCode,
      baseQty: computedBase,
      baseUnit: newHold.baseUnit,
      packQty: Number(newHold.packsCount) || 1,
      packUnit: newHold.packUnit,
      unitsPerPack: Number(newHold.unitsPerPack) || 1,
      reason: newHold.reason,
      labStatus: newHold.reason.includes('Rejection') ? 'Lab Rejected' : 'Under Testing',
      holdDate: 'Today, Just now',
      expectedRelease: newHold.expectedRelease || '3-5 Days',
      status: newHold.status,
      officer: newHold.holdOfficer,
      remarks: newHold.remarks,
    }

    setHoldItems([newRecord, ...holdItems])
    setShowPutOnHoldModal(false)
    triggerToast(`Batch ${newHold.batchNo} placed on hold (${refCode}).`)
  }

  // Handle Confirm Release
  const handleConfirmRelease = (item) => {
    setHoldItems((prev) =>
      prev.map((i) =>
        i.id === item.id
          ? {
              ...i,
              status: 'Released',
              labStatus: 'Passed',
              expectedRelease: 'Released Today',
            }
          : i
      )
    )
    setShowReleaseModal(null)
    triggerToast(`Batch ${item.batchNo} released to active stock successfully.`)
  }

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      '#',
      'Hold Ref',
      'Product Name',
      'SKU',
      'Batch No',
      'Storage Location',
      'Held Base Qty',
      'Base Unit',
      'Packaging Packs',
      'Hold Reason',
      'Lab Status',
      'Hold Date',
      'Expected Release',
      'Status',
      'Officer',
    ]

    const rows = filteredItems.map((row, idx) => [
      idx + 1,
      row.refNo,
      `"${row.productName}"`,
      row.sku,
      row.batchNo,
      row.location,
      row.baseQty,
      row.baseUnit,
      `"${row.packQty} ${row.packUnit}"`,
      `"${row.reason}"`,
      row.labStatus,
      row.holdDate,
      row.expectedRelease,
      row.status,
      `"${row.officer}"`,
    ])

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'Hold_Quarantine_Log.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    triggerToast('Hold stock registry exported to CSV.')
  }

  // Dropdown Options
  const shadeOptions = [
    { value: 'ALL', label: 'All 6 Dedicated Shades' },
    ...SHADES.map((s) => ({ value: s.id, label: s.name })),
  ]

  const reasonOptions = [
    { value: 'ALL', label: 'All Hold Reasons' },
    { value: 'Under Lab Testing', label: 'Under Lab QC Testing' },
    { value: 'Quality Rejection (High Moisture)', label: 'Quality Rejection' },
    { value: 'FSSAI Heavy Metal Lead Testing', label: 'FSSAI Compliance Test' },
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
          <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shadow-xs shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">Hold Stock &amp; Quarantine Control</h1>
              <span className="text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/60 px-2.5 py-0.5 rounded-full shrink-0">
                Quarantine Desk
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1 max-w-2xl">
              Lock unverified batches awaiting lab test clearance, failed QC runs, or damaged goods from dispatch.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">
          <Link
            to="/lab-reports"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition shrink-0"
          >
            <FlaskConical className="w-3.5 h-3.5 text-slate-500" />
            <span>Lab Test Reports</span>
          </Link>

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
            onClick={() => setShowPutOnHoldModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Place Stock on Hold</span>
          </button>
        </div>
      </div>

      {/* 4 Dynamic KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Batches on Hold</p>
            <h3 className="text-xl font-bold text-amber-700 leading-tight mt-0.5">
              {stats.onHoldCount} Batches
            </h3>
            <p className="text-[11px] text-amber-600 font-medium">Locked from outward gate</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Awaiting Lab Results</p>
            <h3 className="text-xl font-bold text-blue-700 leading-tight mt-0.5">
              {holdItems.filter((i) => i.labStatus === 'Under Testing' || i.labStatus === 'Pending Lab Test').length} Batches
            </h3>
            <p className="text-[11px] text-blue-600 font-medium">In quality testing</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Quarantine Zone</p>
            <h3 className="text-xl font-bold text-rose-700 leading-tight mt-0.5">
              {stats.quarantineCount} Batches
            </h3>
            <p className="text-[11px] text-rose-600 font-medium">Failed QC / Damaged</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
            <Unlock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Released Batches</p>
            <h3 className="text-xl font-bold text-emerald-700 leading-tight mt-0.5">
              {stats.releasedCount} Released
            </h3>
            <p className="text-[11px] text-emerald-600 font-medium">Restored to active stock</p>
          </div>
        </div>
      </div>

      {/* Hold Stock Master Card */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
        {/* Table Filter Toolbar */}
        <div className="p-5 border-b border-slate-100 space-y-4">
          {/* Top Line: Category Tabs & Count / Reset */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('ALL')
                  setCurrentPage(1)
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                  activeTab === 'ALL'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Records ({holdItems.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('PENDING')
                  setCurrentPage(1)
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                  activeTab === 'PENDING'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                On Hold ({stats.onHoldCount})
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('REJECTED')
                  setCurrentPage(1)
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                  activeTab === 'REJECTED'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Quarantine ({stats.quarantineCount})
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('RELEASED')
                  setCurrentPage(1)
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                  activeTab === 'RELEASED'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Released ({stats.releasedCount})
              </button>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs bg-amber-50 text-amber-700 font-bold px-3 py-1 rounded-full border border-amber-200/60">
                {filteredItems.length} Records Found
              </span>
              {(searchKeyword || filterShade !== 'ALL' || filterReason !== 'ALL' || activeTab !== 'ALL') && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('ALL')
                    setFilterShade('ALL')
                    setFilterReason('ALL')
                    setSearchKeyword('')
                    setCurrentPage(1)
                    triggerToast('Filters reset to default.')
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-semibold transition cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3 text-slate-400" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>

          {/* Main Keyword Search Bar */}
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => {
                setSearchKeyword(e.target.value)
                setCurrentPage(1)
              }}
              placeholder="Search hold ref (HLD-...), product name, batch number, storage location, or officer..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition"
            />
            {searchKeyword && (
              <button
                type="button"
                onClick={() => setSearchKeyword('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 rounded-full cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1.5">
                Storage Shade Zone
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
                Hold &amp; Quarantine Reason
              </label>
              <CustomSelect
                value={filterReason}
                onChange={(val) => {
                  setFilterReason(val)
                  setCurrentPage(1)
                }}
                options={reasonOptions}
                placeholder="All Hold Reasons"
              />
            </div>
          </div>
        </div>

        {/* Hold Items Table */}
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4 min-w-[130px]">Hold Ref &amp; Date</th>
                <th className="py-3 px-4 min-w-[190px]">Product &amp; Batch</th>
                <th className="py-3 px-4 min-w-[130px]">Storage Location</th>
                <th className="py-3 px-4 min-w-[120px] text-right">Held Base Units</th>
                <th className="py-3 px-4 min-w-[120px] text-right">Packaging Eqv</th>
                <th className="py-3 px-4 min-w-[160px]">Hold Reason</th>
                <th className="py-3 px-4 min-w-[110px] text-center">Lab Clearance</th>
                <th className="py-3 px-4 min-w-[100px] text-center">Status</th>
                <th className="py-3 px-4 text-center w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan="10" className="py-12 text-center text-slate-400">
                    <Lock className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600">No hold records found</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Try changing your search query or tab filters.</p>
                  </td>
                </tr>
              ) : (
                paginatedItems.map((row, idx) => (
                  <tr key={row.id} className="hover:bg-amber-50/20 transition">
                    <td className="py-3.5 px-4 text-center text-slate-400 font-bold">
                      {(currentPage - 1) * perPage + idx + 1}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-slate-900 block">{row.refNo}</span>
                      <span className="text-[10px] text-slate-400">{row.holdDate}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{row.productName}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{row.sku} • {row.batchNo}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200/60 text-[11px]">
                        {row.location}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="font-mono font-black text-rose-700 text-xs">
                        {row.baseQty.toLocaleString()}
                      </span>
                      <span className="text-[11px] text-slate-500 ml-1">{row.baseUnit}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="font-bold text-slate-800">{row.packQty} {row.packUnit}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800 truncate max-w-[150px]" title={row.reason}>
                        {row.reason}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Lock By: {row.officer}</div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          row.labStatus === 'Passed'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : row.labStatus === 'Lab Rejected'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {row.labStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          row.status === 'Released'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : row.status === 'Quarantine'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setShowDetailsModal(row)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {row.status !== 'Released' && (
                          <button
                            type="button"
                            onClick={() => setShowReleaseModal(row)}
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition cursor-pointer"
                            title="Release Stock"
                          >
                            <Unlock className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Footer */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Showing <span className="font-semibold text-slate-800">{filteredItems.length === 0 ? 0 : (currentPage - 1) * perPage + 1}</span> to{' '}
            <span className="font-semibold text-slate-800">{Math.min(currentPage * perPage, filteredItems.length)}</span> of{' '}
            <span className="font-semibold text-slate-800">{filteredItems.length}</span> results
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Previous
            </button>
            <span className="px-3 py-1.5 text-slate-700 font-bold">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* MODAL 1: PLACE STOCK ON HOLD */}
      {showPutOnHoldModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Place Stock on Hold</h3>
                  <p className="text-[11px] text-slate-500">Lock inventory pending lab analysis or quality review.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPutOnHoldModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveHold} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={newHold.productName}
                    onChange={(e) => setNewHold({ ...newHold, productName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Batch Number *</label>
                  <input
                    type="text"
                    required
                    value={newHold.batchNo}
                    onChange={(e) => setNewHold({ ...newHold, batchNo: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Storage Shade</label>
                  <CustomSelect
                    value={newHold.shadeId}
                    onChange={(val) => setNewHold({ ...newHold, shadeId: val })}
                    options={SHADES.map((s) => ({ value: s.id, label: s.name }))}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Row</label>
                  <input
                    type="text"
                    value={newHold.row}
                    onChange={(e) => setNewHold({ ...newHold, row: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Column</label>
                  <input
                    type="text"
                    value={newHold.col}
                    onChange={(e) => setNewHold({ ...newHold, col: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Hold Reason</label>
                  <CustomSelect
                    value={newHold.reason}
                    onChange={(val) => setNewHold({ ...newHold, reason: val })}
                    options={[
                      { value: 'Under Lab Testing', label: 'Under Lab QC Testing' },
                      { value: 'Quality Rejection (High Moisture)', label: 'Quality Rejection' },
                      { value: 'FSSAI Heavy Metal Lead Testing', label: 'FSSAI Compliance Test' },
                      { value: 'Damaged Transit Hold', label: 'Damaged Transit Hold' },
                    ]}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Lock Classification</label>
                  <CustomSelect
                    value={newHold.status}
                    onChange={(val) => setNewHold({ ...newHold, status: val })}
                    options={[
                      { value: 'On Hold', label: 'On Hold (Pending QC)' },
                      { value: 'Quarantine', label: 'Quarantine (Failed QC)' },
                    ]}
                  />
                </div>
              </div>

              {/* Quantity Breakdown */}
              <div className="p-3.5 bg-amber-50/50 border border-amber-100 rounded-xl space-y-2">
                <span className="text-[11px] font-bold text-amber-950">Held Quantity Breakdown</span>
                <div className="grid grid-cols-3 gap-2.5 text-xs">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">Packs Count</label>
                    <input
                      type="number"
                      value={newHold.packsCount}
                      onChange={(e) => setNewHold({ ...newHold, packsCount: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-mono font-bold text-slate-800 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">Units / Pack</label>
                    <input
                      type="number"
                      value={newHold.unitsPerPack}
                      onChange={(e) => setNewHold({ ...newHold, unitsPerPack: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-mono font-bold text-slate-800 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">Base Unit</label>
                    <input
                      type="text"
                      value={newHold.baseUnit}
                      onChange={(e) => setNewHold({ ...newHold, baseUnit: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-bold text-slate-800 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-amber-900 font-bold pt-1 border-t border-amber-100">
                  <span>Total Base Units Locked:</span>
                  <span className="font-mono text-xs">
                    {((Number(newHold.packsCount) || 0) * (Number(newHold.unitsPerPack) || 1)).toLocaleString()} {newHold.baseUnit}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">QC Officer Notes</label>
                <textarea
                  rows={2}
                  value={newHold.remarks}
                  onChange={(e) => setNewHold({ ...newHold, remarks: e.target.value })}
                  placeholder="Awaiting lab results or inspection details..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowPutOnHoldModal(false)}
                  className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-sm transition cursor-pointer"
                >
                  Lock Stock on Hold
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CONFIRM RELEASE */}
      {showReleaseModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
              <Unlock className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-bold text-slate-900 text-base">Release to Active Stock?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Confirm that <span className="font-bold text-slate-800">{showReleaseModal.productName}</span> (Batch: {showReleaseModal.batchNo}) has passed QC and can be dispatched.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-left space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Storage Bin:</span>
                <span className="font-mono font-bold text-indigo-700">{showReleaseModal.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Releasing Quantity:</span>
                <span className="font-mono font-black text-emerald-700">{showReleaseModal.baseQty.toLocaleString()} {showReleaseModal.baseUnit}</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowReleaseModal(null)}
                className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleConfirmRelease(showReleaseModal)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
              >
                Confirm Release
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: HOLD DETAILS */}
      {showDetailsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Hold Batch Inspection</h3>
                  <p className="text-[10px] font-mono text-slate-400">{showDetailsModal.refNo}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDetailsModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Product</p>
                  <p className="font-bold text-slate-900 text-sm">{showDetailsModal.productName}</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">Batch: {showDetailsModal.batchNo}</p>
                </div>
                <span className="font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-1 rounded text-xs">
                  {showDetailsModal.location}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Held Base Stock</span>
                  <span className="font-mono font-black text-rose-700 text-sm">
                    {showDetailsModal.baseQty.toLocaleString()} {showDetailsModal.baseUnit}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Packaging Breakdown</span>
                  <span className="font-bold text-slate-800 text-sm">{showDetailsModal.packQty} {showDetailsModal.packUnit}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Hold Reason:</span>
                  <span className="font-bold text-slate-800">{showDetailsModal.reason}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">QC Status:</span>
                  <span className="font-bold text-amber-700">{showDetailsModal.labStatus}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Locked By:</span>
                  <span className="text-slate-700 font-medium">{showDetailsModal.officer}</span>
                </div>
              </div>

              {showDetailsModal.remarks && (
                <div className="p-3 bg-amber-50/40 rounded-xl border border-amber-100/80">
                  <span className="text-[10px] text-amber-900 font-bold uppercase block mb-1">QC Officer Remarks</span>
                  <p className="text-slate-700 text-xs">{showDetailsModal.remarks}</p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setShowDetailsModal(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
