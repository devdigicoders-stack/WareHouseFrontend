import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Tag, Check, Pause, AlertTriangle, ShieldAlert, Sparkles, X } from 'lucide-react'

export default function BatchManagement() {
  // Toast state
  const [toastMessage, setToastMessage] = useState(null)

  // Filter Form State
  const [filterProduct, setFilterProduct] = useState('')
  const [filterBatchNo, setFilterBatchNo] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterDateRange, setFilterDateRange] = useState('')
  const [filterLocation, setFilterLocation] = useState('')

  // Quick Search & Pagination
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false)
  const [showLabelModal, setShowLabelModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [openActionMenuId, setOpenActionMenuId] = useState(null)

  // Trigger Toast Notification
  const triggerToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Selected Batch for preview/label
  const [selectedBatch, setSelectedBatch] = useState({
    id: 1,
    batchNo: 'BT-2026-001',
    productName: '7.62mm Ammunition Box',
    sku: 'AMM-762-001',
    mfgDate: '01 Jan 2026',
    expiryDate: '01 Jan 2031',
    qty: 1200,
    location: 'A-01-01',
    status: 'Active',
    statusClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  })

  // Full 10 Batch records directly matching user screenshot
  const [batches, setBatches] = useState([
    {
      id: 1,
      batchNo: 'BT-2026-001',
      productName: '7.62mm Ammunition Box',
      sku: 'AMM-762-001',
      mfgDate: '01 Jan 2026',
      expiryDate: '01 Jan 2031',
      qty: 1200,
      location: 'A-01-01',
      status: 'Active',
      statusClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    },
    {
      id: 2,
      batchNo: 'BT-2026-002',
      productName: 'Combat Boots',
      sku: 'UNI-CB-002',
      mfgDate: '15 Feb 2026',
      expiryDate: '15 Feb 2030',
      qty: 320,
      location: 'B-02-03',
      status: 'Active',
      statusClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    },
    {
      id: 3,
      batchNo: 'BT-2026-003',
      productName: 'First Aid Kit',
      sku: 'MED-FA-003',
      mfgDate: '10 Mar 2026',
      expiryDate: '10 Mar 2029',
      qty: 85,
      location: 'C-01-02',
      status: 'Active',
      statusClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    },
    {
      id: 4,
      batchNo: 'BT-2026-004',
      productName: 'Engine Oil 15W-40',
      sku: 'VEH-EO-004',
      mfgDate: '05 Jan 2026',
      expiryDate: '05 Jan 2028',
      qty: 450,
      location: 'D-03-01',
      status: 'Expiring Soon',
      statusClass: 'bg-amber-100 text-amber-800 border-amber-200',
    },
    {
      id: 5,
      batchNo: 'BT-2026-005',
      productName: 'VHF Radio Set',
      sku: 'COM-VHF-005',
      mfgDate: '12 Apr 2026',
      expiryDate: '12 Apr 2031',
      qty: 75,
      location: 'E-01-01',
      status: 'Active',
      statusClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    },
    {
      id: 6,
      batchNo: 'BT-2026-006',
      productName: 'Water Purification Tablet',
      sku: 'GEN-WP-013',
      mfgDate: '18 Feb 2025',
      expiryDate: '18 Feb 2027',
      qty: 600,
      location: 'F-02-01',
      status: 'Expired',
      statusClass: 'bg-red-100 text-red-800 border-red-200',
    },
    {
      id: 7,
      batchNo: 'BT-2026-007',
      productName: 'Field Tent',
      sku: 'GEN-FT-012',
      mfgDate: '01 May 2026',
      expiryDate: '01 May 2030',
      qty: 150,
      location: 'G-01-04',
      status: 'Active',
      statusClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    },
    {
      id: 8,
      batchNo: 'BT-2026-008',
      productName: 'Sleeping Bag',
      sku: 'GEN-SB-014',
      mfgDate: '22 Mar 2026',
      expiryDate: '22 Mar 2030',
      qty: 220,
      location: 'H-02-02',
      status: 'Active',
      statusClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    },
    {
      id: 9,
      batchNo: 'BT-2026-009',
      productName: 'Solar Lantern',
      sku: 'GEN-SL-015',
      mfgDate: '14 Jul 2026',
      expiryDate: '14 Jul 2029',
      qty: 310,
      location: 'A-02-03',
      status: 'Active',
      statusClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    },
    {
      id: 10,
      batchNo: 'BT-2026-010',
      productName: 'Medical Gloves',
      sku: 'MED-MG-016',
      mfgDate: '20 Jan 2026',
      expiryDate: '20 Jan 2028',
      qty: 1000,
      location: 'C-03-02',
      status: 'Expiring Soon',
      statusClass: 'bg-amber-100 text-amber-800 border-amber-200',
    },
  ])

  // New Batch Form State
  const [newBatch, setNewBatch] = useState({
    productName: '7.62mm Ammunition Box',
    sku: 'AMM-762-001',
    batchNo: '',
    mfgDate: '2026-01-01',
    expiryDate: '2031-01-01',
    qty: '',
    location: 'A-01-01',
    status: 'Active',
  })

  // Expiry Alerts List matching screenshot
  const expiryAlerts = [
    {
      batchNo: 'BT-2026-004',
      productName: 'Engine Oil 15W-40',
      expiryDate: 'Exp: 05 Jan 2028',
      daysLeft: '35 days',
    },
    {
      batchNo: 'BT-2026-010',
      productName: 'Medical Gloves',
      expiryDate: 'Exp: 20 Jan 2028',
      daysLeft: '50 days',
    },
    {
      batchNo: 'BT-2026-021',
      productName: 'Ration Pack',
      expiryDate: 'Exp: 28 Jan 2028',
      daysLeft: '52 days',
    },
    {
      batchNo: 'BT-2026-033',
      productName: 'Water Tablets',
      expiryDate: 'Exp: 10 Feb 2028',
      daysLeft: '60 days',
    },
  ]

  // Filtered Batches
  const filteredBatches = useMemo(() => {
    return batches.filter((b) => {
      // Form filters
      if (filterProduct && !b.productName.toLowerCase().includes(filterProduct.toLowerCase())) return false
      if (filterBatchNo && !b.batchNo.toLowerCase().includes(filterBatchNo.toLowerCase())) return false
      if (filterStatus && b.status !== filterStatus) return false
      if (filterLocation && b.location !== filterLocation) return false

      // Quick Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        return (
          b.batchNo.toLowerCase().includes(q) ||
          b.productName.toLowerCase().includes(q) ||
          b.sku.toLowerCase().includes(q) ||
          b.location.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [batches, filterProduct, filterBatchNo, filterStatus, filterLocation, searchQuery])

  // Reset Filters
  const handleResetFilters = () => {
    setFilterProduct('')
    setFilterBatchNo('')
    setFilterStatus('')
    setFilterDateRange('')
    setFilterLocation('')
    setSearchQuery('')
    triggerToast('Filters reset.')
  }

  // Create New Batch
  const handleCreateBatch = (e) => {
    e.preventDefault()
    const nextNum = batches.length + 1
    const batchStr = newBatch.batchNo.trim().toUpperCase() || `BT-2026-${String(nextNum).padStart(3, '0')}`

    let sClass = 'bg-emerald-100 text-emerald-800 border-emerald-200'
    if (newBatch.status === 'Expiring Soon') sClass = 'bg-amber-100 text-amber-800 border-amber-200'
    if (newBatch.status === 'Expired') sClass = 'bg-red-100 text-red-800 border-red-200'
    if (newBatch.status === 'On Hold') sClass = 'bg-blue-100 text-blue-800 border-blue-200'

    const newObj = {
      id: Date.now(),
      batchNo: batchStr,
      productName: newBatch.productName,
      sku: newBatch.sku || 'ORD-GEN-001',
      mfgDate: newBatch.mfgDate,
      expiryDate: newBatch.expiryDate,
      qty: Number(newBatch.qty) || 100,
      location: newBatch.location,
      status: newBatch.status,
      statusClass: sClass,
    }

    setBatches([newObj, ...batches])
    setShowAddModal(false)
    triggerToast(`Batch ${batchStr} recorded successfully!`)
  }

  // Status update
  const handleStatusUpdate = (id, newStatus) => {
    setBatches(
      batches.map((b) => {
        if (b.id === id) {
          let sClass = 'bg-emerald-100 text-emerald-800 border-emerald-200'
          if (newStatus === 'Expiring Soon') sClass = 'bg-amber-100 text-amber-800 border-amber-200'
          if (newStatus === 'Expired') sClass = 'bg-red-100 text-red-800 border-red-200'
          if (newStatus === 'On Hold') sClass = 'bg-blue-100 text-blue-800 border-blue-200'
          return { ...b, status: newStatus, statusClass: sClass }
        }
        return b
      })
    )
    setOpenActionMenuId(null)
    triggerToast(`Batch status updated to ${newStatus}`)
  }

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Batch No', 'Product Name', 'SKU / Code', 'Mfg Date', 'Expiry Date', 'Qty (Units)', 'Location', 'Status']
    const rows = batches.map((b) => [
      b.batchNo,
      `"${b.productName}"`,
      b.sku,
      b.mfgDate,
      b.expiryDate,
      b.qty,
      b.location,
      b.status,
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'Indian_Army_Batch_Register.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    triggerToast('Batch records exported to CSV successfully.')
  }

  return (
    <div className="space-y-4 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#162214] border border-amber-400 text-amber-300 px-4 py-2.5 rounded-lg shadow-2xl flex items-center gap-2 text-xs font-medium animate-bounce">
          <svg className="w-4 h-4 text-amber-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Himalayan Convoy Banner */}
      <div className="relative rounded-xl overflow-hidden shadow-md border border-slate-200/80 bg-slate-900 h-28 sm:h-32">
        <img
          src="/border.png"
          alt="Central Warehouse Logistics Operations"
          className="w-full h-full object-cover object-center opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-black/60"></div>
        <div className="absolute top-3 right-4 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
          <div className="h-2 w-5 flex flex-col justify-between rounded-xs overflow-hidden">
            <div className="h-0.5 bg-[#FF9933]"></div>
            <div className="h-0.5 bg-white"></div>
            <div className="h-0.5 bg-[#138808]"></div>
          </div>
          <span className="text-[10px] font-bold text-white tracking-widest uppercase">
            NATION FIRST ALWAYS
          </span>
        </div>
      </div>

      {/* Page Header Bar */}
      <div className="bg-white rounded-xl p-4 sm:p-5 shadow-xs border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          {/* Batch Cubes Icon */}
          <div className="w-12 h-12 rounded-xl bg-[#EBF5EA] border border-[#CDE5CA] flex items-center justify-center text-[#1E3A1E] shadow-xs shrink-0">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              <span>Batch Management</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Manage product batches, expiry dates, locations and batch-wise stock.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="text-xs text-slate-400 flex items-center gap-1.5 font-medium mr-2">
            <Link to="/dashboard" className="hover:text-slate-700">Home</Link>
            <span>›</span>
            <span className="text-slate-500">Inward Operations</span>
            <span>›</span>
            <span className="text-slate-800 font-semibold">Batch Management</span>
          </div>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="bg-[#1F331E] hover:bg-[#2A4428] text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shadow-xs transition cursor-pointer"
          >
            <span className="text-base leading-none font-black">+</span>
            <span>Create New Batch</span>
          </button>
        </div>
      </div>

      {/* 5 KPI Stat Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Card 1: Total Batches */}
        <div className="bg-white rounded-xl p-3.5 shadow-xs border border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Total Batches</p>
            <h3 className="text-2xl font-black text-slate-800 leading-tight">386</h3>
            <p className="text-[10px] font-bold text-emerald-600">v. 12 this month</p>
          </div>
        </div>

        {/* Card 2: Active Batches */}
        <div className="bg-white rounded-xl p-3.5 shadow-xs border border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Active Batches</p>
            <h3 className="text-2xl font-black text-slate-800 leading-tight">312</h3>
            <p className="text-[10px] text-slate-400 font-medium">80.8% of total</p>
          </div>
        </div>

        {/* Card 3: Expiring Soon */}
        <div className="bg-white rounded-xl p-3.5 shadow-xs border border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Expiring Soon</p>
            <h3 className="text-2xl font-black text-slate-800 leading-tight">24</h3>
            <p className="text-[10px] text-slate-400 font-medium">Within 60 days</p>
          </div>
        </div>

        {/* Card 4: Expired Batches */}
        <div className="bg-white rounded-xl p-3.5 shadow-xs border border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Expired Batches</p>
            <h3 className="text-2xl font-black text-slate-800 leading-tight">6</h3>
            <p className="text-[10px] text-slate-400 font-medium">Need attention</p>
          </div>
        </div>

        {/* Card 5: On Hold */}
        <div className="bg-white rounded-xl p-3.5 shadow-xs border border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">On Hold</p>
            <h3 className="text-2xl font-black text-slate-800 leading-tight">14</h3>
            <p className="text-[10px] text-slate-400 font-medium">Quality / Inspection</p>
          </div>
        </div>
      </div>

      {/* Main 2-Column Section: Left (Filter + Table) & Right (Donut Chart + Quick Actions + Alerts) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: Filter Form + Batch List Table (Span 9 / 12)                 */}
        {/* ========================================================================= */}
        <div className="xl:col-span-9 space-y-4">
          {/* 1. Filter Batches Card */}
          <div className="bg-white rounded-xl p-4 sm:p-5 shadow-xs border border-slate-200 space-y-3.5">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <h2 className="text-xs font-bold text-slate-800">Filter Batches</h2>
            </div>

            {/* Filter Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
              {/* Product */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Product</label>
                <select
                  value={filterProduct}
                  onChange={(e) => setFilterProduct(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                >
                  <option value="">Select Product</option>
                  <option value="7.62mm Ammunition Box">7.62mm Ammunition Box</option>
                  <option value="Combat Boots">Combat Boots</option>
                  <option value="First Aid Kit">First Aid Kit</option>
                  <option value="Engine Oil 15W-40">Engine Oil 15W-40</option>
                  <option value="VHF Radio Set">VHF Radio Set</option>
                  <option value="Water Purification Tablet">Water Purification Tablet</option>
                  <option value="Field Tent">Field Tent</option>
                  <option value="Sleeping Bag">Sleeping Bag</option>
                  <option value="Solar Lantern">Solar Lantern</option>
                  <option value="Medical Gloves">Medical Gloves</option>
                </select>
              </div>

              {/* Batch No. */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Batch No.</label>
                <input
                  type="text"
                  placeholder="Enter Batch No."
                  value={filterBatchNo}
                  onChange={(e) => setFilterBatchNo(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                >
                  <option value="">Select Status</option>
                  <option value="Active">Active</option>
                  <option value="Expiring Soon">Expiring Soon</option>
                  <option value="Expired">Expired</option>
                  <option value="On Hold">On Hold</option>
                </select>
              </div>

              {/* Expiry Date */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Expiry Date</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2.5 text-slate-400 pointer-events-none">
                    <Calendar className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    placeholder="Select Date Range"
                    value={filterDateRange}
                    onChange={(e) => setFilterDateRange(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Location</label>
                <select
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                >
                  <option value="">Select Location</option>
                  <option value="A-01-01">A-01-01</option>
                  <option value="A-02-03">A-02-03</option>
                  <option value="B-02-03">B-02-03</option>
                  <option value="C-01-02">C-01-02</option>
                  <option value="C-03-02">C-03-02</option>
                  <option value="D-03-01">D-03-01</option>
                  <option value="E-01-01">E-01-01</option>
                  <option value="F-02-01">F-02-01</option>
                  <option value="G-01-04">G-01-04</option>
                  <option value="H-02-02">H-02-02</option>
                </select>
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex justify-end items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-4 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer transition"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => triggerToast('Filters applied.')}
                className="bg-[#1F331E] hover:bg-[#2A4428] text-white px-4 py-1.5 rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer transition"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Apply Filter</span>
              </button>
            </div>
          </div>

          {/* 2. Batch List Table Card */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden flex flex-col">
            {/* Header & Action Toolbar */}
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <h2 className="text-sm font-bold text-slate-800">
                  Batch List ({batches.length})
                </h2>
              </div>

              <div className="flex items-center gap-2">
                {/* Search input */}
                <div className="relative flex-1 sm:w-64">
                  <svg className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search by batch no., product name, SKU..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white"
                  />
                </div>

                {/* Export Button */}
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="bg-[#1F331E] hover:bg-[#2A4428] text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold shadow-xs transition cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Export</span>
                </button>

                {/* Print Button */}
                <button
                  type="button"
                  onClick={() => {
                    window.print()
                  }}
                  className="bg-[#1F331E] hover:bg-[#2A4428] text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold shadow-xs transition cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  <span>Print</span>
                </button>
              </div>
            </div>

            {/* Table Container - Protected with table-nowrap and hidden scrollbar */}
            <div
              className="overflow-x-auto no-scrollbar scroll-smooth w-full"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              <table
                className="w-full text-left text-xs divide-y divide-slate-200 border-collapse table-nowrap"
                style={{ minWidth: '1220px' }}
              >
                <thead className="bg-slate-50/80 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-3 w-10 text-center whitespace-nowrap">#</th>
                    <th className="py-3.5 px-4 min-w-[130px] whitespace-nowrap">Batch No.</th>
                    <th className="py-3.5 px-4 min-w-[180px] whitespace-nowrap">Product Name</th>
                    <th className="py-3.5 px-4 min-w-[130px] whitespace-nowrap">SKU / Code</th>
                    <th className="py-3.5 px-4 min-w-[115px] whitespace-nowrap">Mfg. Date</th>
                    <th className="py-3.5 px-4 min-w-[115px] whitespace-nowrap">Expiry Date</th>
                    <th className="py-3.5 px-4 min-w-[100px] whitespace-nowrap">Qty (Units)</th>
                    <th className="py-3.5 px-4 min-w-[95px] whitespace-nowrap font-mono">Location</th>
                    <th className="py-3.5 px-4 text-center min-w-[115px] whitespace-nowrap">Status</th>
                    <th className="py-3.5 px-3 text-center w-14 whitespace-nowrap">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredBatches.map((b, idx) => (
                    <tr
                      key={b.id}
                      onClick={() => setSelectedBatch(b)}
                      className="hover:bg-emerald-50/50 transition cursor-pointer"
                    >
                      <td className="py-3.5 px-3 text-center text-slate-400 font-bold text-[11px] whitespace-nowrap">
                        {idx + 1}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800 text-[11px] tracking-wide whitespace-nowrap">
                        {b.batchNo}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800 text-xs whitespace-nowrap">
                        {b.productName}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-600 text-[11px] whitespace-nowrap">
                        {b.sku}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                        {b.mfgDate}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                        {b.expiryDate}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800 whitespace-nowrap">
                        {b.qty.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-700 whitespace-nowrap">
                        {b.location}
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className={`inline-block px-3 py-0.5 rounded-full text-[10px] font-bold border ${b.statusClass}`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-center relative whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => setOpenActionMenuId(openActionMenuId === b.id ? null : b.id)}
                          className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 px-2 py-1 rounded-md text-xs font-bold transition cursor-pointer"
                          title="Options"
                        >
                          •••
                        </button>

                        {/* Dropdown Action Menu */}
                        {openActionMenuId === b.id && (
                          <div className="absolute right-3 top-10 w-44 bg-white border border-slate-200 rounded-lg shadow-xl z-20 py-1 text-left text-xs font-medium">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedBatch(b)
                                setShowLabelModal(true)
                                setOpenActionMenuId(null)
                              }}
                              className="w-full px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                            >
                              <Tag className="w-3.5 h-3.5 text-slate-500" />
                              <span>Print Batch Label</span>
                            </button>
                            {b.status !== 'Active' && (
                              <button
                                type="button"
                                onClick={() => handleStatusUpdate(b.id, 'Active')}
                                className="w-full px-3 py-1.5 hover:bg-emerald-50 text-emerald-700 flex items-center gap-2"
                              >
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Mark Active</span>
                              </button>
                            )}
                            {b.status !== 'On Hold' && (
                              <button
                                type="button"
                                onClick={() => handleStatusUpdate(b.id, 'On Hold')}
                                className="w-full px-3 py-1.5 hover:bg-blue-50 text-blue-700 flex items-center gap-2"
                              >
                                <Pause className="w-3.5 h-3.5 text-blue-600" />
                                <span>Place on Hold</span>
                              </button>
                            )}
                            {b.status !== 'Expired' && (
                              <button
                                type="button"
                                onClick={() => handleStatusUpdate(b.id, 'Expired')}
                                className="w-full px-3 py-1.5 hover:bg-red-50 text-red-700 flex items-center gap-2"
                              >
                                <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                                <span>Mark Expired</span>
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination matching screenshot */}
            <div className="px-4 py-3 bg-slate-50/80 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
              <span className="font-medium">
                Showing <strong>1 to 10</strong> of <strong>386</strong> batches
              </span>

              {/* Number Buttons: < 1 2 3 4 5 ... 39 > */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  className="px-2 py-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold"
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="px-2.5 py-1 rounded font-bold bg-[#1E3A1E] text-white"
                >
                  1
                </button>
                <button
                  type="button"
                  onClick={() => triggerToast('Page 2 loaded')}
                  className="px-2.5 py-1 rounded font-semibold text-slate-700 hover:bg-slate-100"
                >
                  2
                </button>
                <button
                  type="button"
                  onClick={() => triggerToast('Page 3 loaded')}
                  className="px-2.5 py-1 rounded font-semibold text-slate-700 hover:bg-slate-100"
                >
                  3
                </button>
                <button
                  type="button"
                  onClick={() => triggerToast('Page 4 loaded')}
                  className="px-2.5 py-1 rounded font-semibold text-slate-700 hover:bg-slate-100"
                >
                  4
                </button>
                <button
                  type="button"
                  onClick={() => triggerToast('Page 5 loaded')}
                  className="px-2.5 py-1 rounded font-semibold text-slate-700 hover:bg-slate-100"
                >
                  5
                </button>
                <span className="px-1 text-slate-400">...</span>
                <button
                  type="button"
                  onClick={() => triggerToast('Page 39 loaded')}
                  className="px-2 py-1 rounded font-semibold text-slate-700 hover:bg-slate-100"
                >
                  39
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="px-2 py-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold"
                >
                  ›
                </button>
              </div>

              {/* Show per page selector */}
              <div className="flex items-center gap-2">
                <span>Show</span>
                <select
                  value={perPage}
                  onChange={(e) => setPerPage(Number(e.target.value))}
                  className="bg-white border border-slate-200 rounded px-2 py-1 text-xs font-semibold text-slate-700 focus:outline-none"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span>per page</span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: Batch Status Donut + Quick Actions + Expiry Alerts (Span 3) */}
        {/* ========================================================================= */}
        <div className="xl:col-span-3 space-y-4">
          {/* Card 1: Batch Status Donut Chart */}
          <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200">
            <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100">
              <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
              <h2 className="text-xs font-bold text-slate-800">Batch Status</h2>
            </div>

            <div className="flex items-center justify-between gap-3">
              {/* SVG Donut Chart with center text */}
              <div className="relative w-28 h-28 shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  {/* Background Track */}
                  <path
                    className="text-slate-100"
                    strokeWidth="4"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Active (80.8% = ~80.8) */}
                  <path
                    className="text-emerald-500"
                    strokeDasharray="80.8, 100"
                    strokeDashoffset="0"
                    strokeWidth="4"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Expiring Soon (6.2%) */}
                  <path
                    className="text-amber-500"
                    strokeDasharray="6.2, 100"
                    strokeDashoffset="-80.8"
                    strokeWidth="4"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Expired (1.5%) */}
                  <path
                    className="text-red-500"
                    strokeDasharray="1.5, 100"
                    strokeDashoffset="-87"
                    strokeWidth="4"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* On Hold (3.6%) */}
                  <path
                    className="text-blue-500"
                    strokeDasharray="3.6, 100"
                    strokeDashoffset="-88.5"
                    strokeWidth="4"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>

                {/* Donut Center */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-base font-black text-slate-800 leading-none">386</span>
                  <span className="text-[9px] text-slate-400 font-semibold mt-0.5">Batches</span>
                </div>
              </div>

              {/* Legend List */}
              <div className="space-y-1.5 text-xs flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500"></span>
                    <span className="text-slate-600 font-medium">Active</span>
                  </div>
                  <strong className="text-slate-800 font-mono">312</strong>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-xs bg-amber-500"></span>
                    <span className="text-slate-600 font-medium">Expiring Soon</span>
                  </div>
                  <strong className="text-slate-800 font-mono">24</strong>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-xs bg-red-500"></span>
                    <span className="text-slate-600 font-medium">Expired</span>
                  </div>
                  <strong className="text-slate-800 font-mono">6</strong>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-xs bg-blue-500"></span>
                    <span className="text-slate-600 font-medium">On Hold</span>
                  </div>
                  <strong className="text-slate-800 font-mono">14</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Quick Actions */}
          <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200">
            <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100">
              <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <h2 className="text-xs font-bold text-slate-800">Quick Actions</h2>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg py-2.5 px-3 text-left text-xs font-bold text-slate-700 flex items-center gap-2.5 transition cursor-pointer"
              >
                <span className="w-4 h-4 rounded bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-xs shrink-0">+</span>
                <span>Create New Batch</span>
              </button>

              <button
                type="button"
                onClick={() => setShowImportModal(true)}
                className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg py-2.5 px-3 text-left text-xs font-bold text-slate-700 flex items-center gap-2.5 transition cursor-pointer"
              >
                <svg className="w-4 h-4 text-slate-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Import Batches (Excel)</span>
              </button>

              <button
                type="button"
                onClick={() => triggerToast('Select a batch from the table to update details.')}
                className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg py-2.5 px-3 text-left text-xs font-bold text-slate-700 flex items-center gap-2.5 transition cursor-pointer"
              >
                <svg className="w-4 h-4 text-slate-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Update Batch Details</span>
              </button>

              <button
                type="button"
                onClick={() => setShowLabelModal(true)}
                className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg py-2.5 px-3 text-left text-xs font-bold text-slate-700 flex items-center gap-2.5 transition cursor-pointer"
              >
                <svg className="w-4 h-4 text-slate-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
                <span>Print Batch Label (QR)</span>
              </button>

              <button
                type="button"
                onClick={handleExportCSV}
                className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg py-2.5 px-3 text-left text-xs font-bold text-slate-700 flex items-center gap-2.5 transition cursor-pointer"
              >
                <svg className="w-4 h-4 text-slate-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Export Batch Report</span>
              </button>
            </div>
          </div>

          {/* Card 3: Expiry Alerts (Next 60 Days) */}
          <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                <h2 className="text-xs font-bold text-slate-800">Expiry Alerts (Next 60 Days)</h2>
              </div>
              <button
                type="button"
                onClick={() => triggerToast('All 24 expiring batches loaded.')}
                className="text-[10px] font-bold text-emerald-800 hover:text-emerald-950 cursor-pointer"
              >
                View All →
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {expiryAlerts.map((alert, idx) => (
                <div key={idx} className="flex items-center justify-between gap-2 p-1.5 hover:bg-slate-50 rounded-lg transition">
                  <div className="flex items-start gap-2.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-800 text-[11px]">
                          {alert.batchNo}
                        </span>
                        <span className="text-slate-800 font-semibold text-[11px]">
                          {alert.productName}
                        </span>
                      </div>
                      <p className="font-mono text-[10px] text-slate-400">
                        {alert.expiryDate}
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 whitespace-nowrap">
                    {alert.daysLeft}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: CREATE NEW BATCH                                                   */}
      {/* ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#EBF5EA] text-[#1E3A1E] flex items-center justify-center font-black text-sm">
                  +
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Create New Product Batch</h3>
                  <p className="text-[10px] text-slate-500">Warehouse Lot Registration</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 font-bold"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBatch} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Select Product <span className="text-red-500">*</span>
                </label>
                <select
                  value={newBatch.productName}
                  onChange={(e) => {
                    const prodName = e.target.value
                    let skuCode = 'ORD-GEN-001'
                    if (prodName === '7.62mm Ammunition Box') skuCode = 'AMM-762-001'
                    if (prodName === 'Combat Boots') skuCode = 'UNI-CB-002'
                    if (prodName === 'First Aid Kit') skuCode = 'MED-FA-003'
                    if (prodName === 'Engine Oil 15W-40') skuCode = 'VEH-EO-004'
                    if (prodName === 'VHF Radio Set') skuCode = 'COM-VHF-005'
                    setNewBatch({ ...newBatch, productName: prodName, sku: skuCode })
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600"
                >
                  <option value="7.62mm Ammunition Box">7.62mm Ammunition Box</option>
                  <option value="Combat Boots">Combat Boots</option>
                  <option value="First Aid Kit">First Aid Kit</option>
                  <option value="Engine Oil 15W-40">Engine Oil 15W-40</option>
                  <option value="VHF Radio Set">VHF Radio Set</option>
                  <option value="Water Purification Tablet">Water Purification Tablet</option>
                  <option value="Field Tent">Field Tent</option>
                  <option value="Sleeping Bag">Sleeping Bag</option>
                  <option value="Solar Lantern">Solar Lantern</option>
                  <option value="Medical Gloves">Medical Gloves</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Batch Number (Auto/Manual)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. BT-2026-011"
                    value={newBatch.batchNo}
                    onChange={(e) => setNewBatch({ ...newBatch, batchNo: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Batch Quantity (Units) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 500"
                    value={newBatch.qty}
                    onChange={(e) => setNewBatch({ ...newBatch, qty: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Mfg. Date</label>
                  <input
                    type="date"
                    value={newBatch.mfgDate}
                    onChange={(e) => setNewBatch({ ...newBatch, mfgDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={newBatch.expiryDate}
                    onChange={(e) => setNewBatch({ ...newBatch, expiryDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Storage Location</label>
                  <select
                    value={newBatch.location}
                    onChange={(e) => setNewBatch({ ...newBatch, location: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  >
                    <option value="A-01-01">A-01-01 (Bay A, Rack 1)</option>
                    <option value="B-02-03">B-02-03 (Bay B, Rack 2)</option>
                    <option value="C-01-02">C-01-02 (Bay C, Rack 1)</option>
                    <option value="D-03-01">D-03-01 (Bay D, Rack 3)</option>
                    <option value="E-01-01">E-01-01 (Bay E, Rack 1)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Initial Status</label>
                  <select
                    value={newBatch.status}
                    onChange={(e) => setNewBatch({ ...newBatch, status: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  >
                    <option value="Active">Active</option>
                    <option value="Expiring Soon">Expiring Soon</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Expired">Expired</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#1F331E] hover:bg-[#2A4428] text-white px-5 py-2 rounded-lg font-bold shadow-xs cursor-pointer"
                >
                  Save Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: PRINT BATCH QR / BARCODE LABEL                                     */}
      {/* ========================================================================= */}
      {showLabelModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-2.5 border-slate-200">
              <div className="flex items-center gap-2">
                <img src="/logo.png" alt="Central Warehouse" className="h-7 w-auto object-contain" />
                <h3 className="text-sm font-bold text-slate-800">Print Batch Storage Label</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowLabelModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Warehouse Label Sheet */}
            <div className="border-2 border-slate-900 rounded-lg p-4 bg-white space-y-2.5 shadow-sm text-xs">
              <div className="flex items-center justify-between border-b pb-2 border-slate-300">
                <div>
                  <h4 className="font-black text-slate-900 text-xs tracking-wider">CENTRAL WAREHOUSE LOGISTICS</h4>
                  <p className="text-[9px] text-slate-500 font-bold">MATERIAL BATCH &amp; LOT IDENTIFIER</p>
                </div>
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-[#1E3A1E] text-white rounded">
                  {selectedBatch.location}
                </span>
              </div>

              <div>
                <p className="text-sm font-black text-slate-900">{selectedBatch.productName}</p>
                <div className="flex items-center gap-3 text-[10px] text-slate-600 mt-0.5">
                  <span>Batch: <strong className="font-mono text-slate-900">{selectedBatch.batchNo}</strong></span>
                  <span>SKU: <strong className="font-mono text-slate-900">{selectedBatch.sku}</strong></span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] bg-slate-50 p-2 rounded border border-slate-200">
                <div>
                  <span className="text-slate-500">Mfg Date: </span>
                  <strong className="text-slate-800">{selectedBatch.mfgDate}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Expiry Date: </span>
                  <strong className="text-slate-800">{selectedBatch.expiryDate}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Lot Qty: </span>
                  <strong className="text-slate-800">{selectedBatch.qty} Units</strong>
                </div>
                <div>
                  <span className="text-slate-500">Status: </span>
                  <strong className="text-emerald-700">{selectedBatch.status}</strong>
                </div>
              </div>

              {/* Barcode Graphic */}
              <div className="text-center p-2 bg-white rounded border border-slate-200">
                <div className="flex justify-center items-end h-9 gap-0.5">
                  {[2, 1, 3, 1, 2, 4, 1, 2, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 3, 1, 4, 2, 1, 3].map((w, i) => (
                    <div key={i} style={{ width: `${w * 2}px` }} className="h-full bg-slate-900"></div>
                  ))}
                </div>
                <span className="font-mono text-[9.5px] tracking-widest text-slate-800 font-bold mt-1 block">
                  * {selectedBatch.batchNo} *
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowLabelModal(false)}
                className="px-4 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  window.print()
                  setShowLabelModal(false)
                }}
                className="bg-[#1F331E] hover:bg-[#2A4428] text-white px-5 py-1.5 rounded-lg text-xs font-bold shadow cursor-pointer"
              >
                Print Label
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: IMPORT BATCHES (EXCEL)                                             */}
      {/* ========================================================================= */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-2.5 border-slate-200">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <h3 className="text-sm font-bold text-slate-800">Import Batches from Excel</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-6 text-center bg-slate-50 transition cursor-pointer">
              <svg className="w-8 h-8 text-slate-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-xs font-bold text-slate-700">Drag and drop your batch manifest spreadsheet here</p>
              <p className="text-[10px] text-slate-400 mt-1">Accepts .xlsx or .csv up to 10 MB</p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => triggerToast('Sample batch template downloaded.')}
                className="text-xs text-emerald-800 font-bold hover:underline cursor-pointer"
              >
                ↓ Download Sample Template
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowImportModal(false)
                    triggerToast('Imported 38 Ordnance batches successfully!')
                  }}
                  className="bg-[#1F331E] hover:bg-[#2A4428] text-white px-5 py-1.5 rounded-lg text-xs font-bold shadow cursor-pointer"
                >
                  Import File
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
