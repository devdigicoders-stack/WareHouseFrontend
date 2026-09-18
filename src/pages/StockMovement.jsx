import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Eye, Printer, RotateCcw, Plus, Scan, FileSpreadsheet, Clock, Check, Camera, Upload, X } from 'lucide-react'

export default function StockMovement() {
  // Toast state
  const [toastMessage, setToastMessage] = useState(null)
  const triggerToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Active Tab for table
  const [activeTab, setActiveTab] = useState('All Movements')

  // Filter Bar state
  const [filterType, setFilterType] = useState('All Types')
  const [filterProduct, setFilterProduct] = useState('')
  const [filterBatch, setFilterBatch] = useState('')
  const [filterFromDate, setFilterFromDate] = useState('2026-09-01')
  const [filterToDate, setFilterToDate] = useState('2026-09-16')
  const [filterFromLocation, setFilterFromLocation] = useState('')
  const [filterToLocation, setFilterToLocation] = useState('')

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showScanModal, setShowScanModal] = useState(false)
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(null)
  const [activeActionRow, setActiveActionRow] = useState(null)

  // New Movement Form state
  const [newMovement, setNewMovement] = useState({
    type: 'Internal',
    productName: 'Parle-G Gluco Biscuits (Packet)',
    batchNo: 'BT-2026-FMCG-01',
    fromLocation: 'SH03-R02-C04',
    toLocation: 'SH03-R05-C08',
    quantity: '1200',
    unit: 'Pieces (200 Gatta)',
    reason: 'Stock relocation for dispatch staging',
    requestedBy: 'Rajesh Sharma (Warehouse Manager)',
  })

  // Stock Movement Data
  const [movementsData, setMovementsData] = useState([
    {
      id: 1,
      dateTime: '16 Sep 2026, 09:45',
      refNo: 'MOV-2026-1248',
      type: 'Internal',
      typeBadgeClass: 'bg-sky-100 text-sky-800 border-sky-200',
      productName: 'Parle-G Gluco Biscuits (Packet)',
      batchNo: 'BT-2026-FMCG-01',
      fromLocation: 'SH03-R02-C04',
      toLocation: 'SH03-R05-C08',
      quantity: 1200,
      packagingSummary: '200 Gatta @ 6 pcs',
      user: 'Rajesh Sharma',
      status: 'Completed',
      statusBadgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    },
    {
      id: 2,
      dateTime: '16 Sep 2026, 08:30',
      refNo: 'MOV-2026-1247',
      type: 'Inward',
      typeBadgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      productName: 'Fortune Refined Mustard Oil (15L Tin)',
      batchNo: 'BT-2026-OIL-02',
      fromLocation: 'Receiving Dock Gate-01',
      toLocation: 'SH02-R01-C03',
      quantity: 450,
      packagingSummary: '30 Tins @ 15L',
      user: 'Priya Patel',
      status: 'Completed',
      statusBadgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    },
    {
      id: 3,
      dateTime: '15 Sep 2026, 17:20',
      refNo: 'MOV-2026-1246',
      type: 'Outward',
      typeBadgeClass: 'bg-rose-100 text-rose-800 border-rose-200',
      productName: 'Master 5-Ply Corrugated Cartons',
      batchNo: 'BT-2026-PKG-03',
      fromLocation: 'SH04-R03-C02',
      toLocation: 'Dispatch Staging Bay-02',
      quantity: 1000,
      packagingSummary: '40 Bundles @ 25 pcs',
      user: 'Amit Patel',
      status: 'Completed',
      statusBadgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    },
    {
      id: 4,
      dateTime: '15 Sep 2026, 14:10',
      refNo: 'MOV-2026-1245',
      type: 'Internal',
      typeBadgeClass: 'bg-sky-100 text-sky-800 border-sky-200',
      productName: 'Sharbati Golden Wheat Grain (50kg Bag)',
      batchNo: 'BT-2026-WHT-04',
      fromLocation: 'SH01-R02-C05',
      toLocation: 'SH01-R04-C02',
      quantity: 2500,
      packagingSummary: '50 Bags @ 50 kg',
      user: 'Suresh Nair',
      status: 'Completed',
      statusBadgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    },
    {
      id: 5,
      dateTime: '14 Sep 2026, 11:35',
      refNo: 'MOV-2026-1244',
      type: 'Inward',
      typeBadgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      productName: 'Disinfectant Surface Cleaner (5L Can)',
      batchNo: 'BT-2026-CHM-05',
      fromLocation: 'Receiving Dock Gate-02',
      toLocation: 'SH05-R01-C01',
      quantity: 300,
      packagingSummary: '60 Cans @ 5L',
      user: 'Vikram Singh',
      status: 'Completed',
      statusBadgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    },
    {
      id: 6,
      dateTime: '14 Sep 2026, 10:20',
      refNo: 'MOV-2026-1243',
      type: 'Outward',
      typeBadgeClass: 'bg-rose-100 text-rose-800 border-rose-200',
      productName: 'Tata Salt Crystal Iodized (1kg Pkt)',
      batchNo: 'BT-2026-FMCG-06',
      fromLocation: 'SH03-R01-C02',
      toLocation: 'Dispatch Staging Bay-01',
      quantity: 1500,
      packagingSummary: '60 Gatta @ 25 pkts',
      user: 'Deepak Verma',
      status: 'Completed',
      statusBadgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    },
    {
      id: 7,
      dateTime: '13 Sep 2026, 16:45',
      refNo: 'MOV-2026-1242',
      type: 'Internal',
      typeBadgeClass: 'bg-sky-100 text-sky-800 border-sky-200',
      productName: 'Chana Dal Extra Bold (50kg Bag)',
      batchNo: 'BT-2026-PUL-07',
      fromLocation: 'SH01-R06-C03',
      toLocation: 'SH01-R07-C03',
      quantity: 1000,
      packagingSummary: '20 Bags @ 50 kg',
      user: 'Rajesh Sharma',
      status: 'Completed',
      statusBadgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    },
    {
      id: 8,
      dateTime: '13 Sep 2026, 13:15',
      refNo: 'MOV-2026-1241',
      type: 'Adjust',
      typeBadgeClass: 'bg-purple-100 text-purple-800 border-purple-200',
      productName: 'Disinfectant Surface Cleaner (5L Can)',
      batchNo: 'BT-2026-CHM-08',
      fromLocation: 'SH05-R02-C04',
      toLocation: 'SH05-R02-C04',
      quantity: -20,
      packagingSummary: '-4 Cans (Audit Var)',
      user: 'Priya Patel',
      status: 'Completed',
      statusBadgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    },
    {
      id: 9,
      dateTime: '12 Sep 2026, 09:50',
      refNo: 'MOV-2026-1240',
      type: 'Outward',
      typeBadgeClass: 'bg-rose-100 text-rose-800 border-rose-200',
      productName: 'High-Speed Conveyor Rollers & Belts',
      batchNo: 'BT-2026-SPR-09',
      fromLocation: 'SH06-R02-C01',
      toLocation: 'Dispatch Staging Bay-03',
      quantity: 15,
      packagingSummary: '15 Nos (Spares)',
      user: 'Amit Patel',
      status: 'Completed',
      statusBadgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    },
    {
      id: 10,
      dateTime: '12 Sep 2026, 08:25',
      refNo: 'MOV-2026-1239',
      type: 'Inward',
      typeBadgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      productName: 'Refined Soybean Oil (15L Tin)',
      batchNo: 'BT-2026-OIL-10',
      fromLocation: 'Receiving Dock Gate-01',
      toLocation: 'SH02-R03-C06',
      quantity: 600,
      packagingSummary: '40 Tins @ 15L',
      user: 'Suresh Nair',
      status: 'Completed',
      statusBadgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    },
  ])

  // Filtered rows
  const filteredRows = useMemo(() => {
    return movementsData.filter((row) => {
      // Tab filter
      if (activeTab === 'Inward' && row.type !== 'Inward') return false
      if (activeTab === 'Internal' && row.type !== 'Internal') return false
      if (activeTab === 'Outward' && row.type !== 'Outward') return false
      if (activeTab === 'Returns / Adjustments' && row.type !== 'Adjust') return false

      // Filter bar filter
      if (filterType !== 'All Types' && row.type !== filterType) return false
      if (filterProduct && row.productName !== filterProduct) return false
      if (filterBatch && row.batchNo !== filterBatch) return false
      if (filterFromLocation && !row.fromLocation.toLowerCase().includes(filterFromLocation.toLowerCase())) return false
      if (filterToLocation && !row.toLocation.toLowerCase().includes(filterToLocation.toLowerCase())) return false

      return true
    })
  }, [movementsData, activeTab, filterType, filterProduct, filterBatch, filterFromLocation, filterToLocation])

  // Apply filters handler
  const handleApplyFilter = () => {
    triggerToast('Filters applied to stock movement records.')
  }

  // Reset filters handler
  const handleResetFilter = () => {
    setFilterType('All Types')
    setFilterProduct('')
    setFilterBatch('')
    setFilterFromLocation('')
    setFilterToLocation('')
    setActiveTab('All Movements')
    triggerToast('All filters have been reset.')
  }

  // Handle Create Movement Submission
  const handleCreateMovement = (e) => {
    e.preventDefault()
    const newId = movementsData.length + 1
    const refCode = `MOV-2026-${1248 + newId}`
    const now = new Date()
    const dateFormatted = `${now.getDate()} Sep 2026, ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

    let typeBadgeClass = 'bg-sky-100 text-sky-800 border-sky-200'
    if (newMovement.type === 'Inward') typeBadgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-200'
    if (newMovement.type === 'Outward') typeBadgeClass = 'bg-rose-100 text-rose-800 border-rose-200'
    if (newMovement.type === 'Adjust') typeBadgeClass = 'bg-purple-100 text-purple-800 border-purple-200'

    const record = {
      id: newId,
      dateTime: dateFormatted,
      refNo: refCode,
      type: newMovement.type,
      typeBadgeClass,
      productName: newMovement.productName,
      batchNo: newMovement.batchNo,
      fromLocation: newMovement.fromLocation,
      toLocation: newMovement.toLocation,
      quantity: parseInt(newMovement.quantity, 10) || 100,
      user: newMovement.requestedBy,
      status: 'Completed',
      statusBadgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    }

    setMovementsData([record, ...movementsData])
    setShowCreateModal(false)
    triggerToast(`Movement ${refCode} successfully executed!`)
  }

  // Export to CSV
  const handleExportCSV = () => {
    const headers = 'ID,Date & Time,Reference No,Type,Product Name,Batch No,From Location,To Location,Quantity,User,Status\n'
    const rows = filteredRows
      .map(
        (r) =>
          `"${r.id}","${r.dateTime}","${r.refNo}","${r.type}","${r.productName}","${r.batchNo}","${r.fromLocation}","${r.toLocation}","${r.quantity}","${r.user}","${r.status}"`
      )
      .join('\n')
    const blob = new Blob([headers + rows], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Stock_Movement_Report_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    triggerToast('Stock movement report exported successfully!')
  }

  // Print Report
  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-4 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#162214] border border-amber-400 text-amber-300 px-4 py-2.5 rounded-lg shadow-2xl flex items-center gap-2 text-xs font-medium animate-bounce">
          <svg className="w-4 h-4 text-amber-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Operations Banner */}
      <div className="relative rounded-xl overflow-hidden shadow-md border border-slate-200/80 bg-slate-900 h-28 sm:h-32">
        <img
          src="/border.png"
          alt="Warehouse Stock Movement Operations"
          className="w-full h-full object-cover object-center opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-black/60"></div>
        <div className="absolute top-3 right-4 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span className="text-[10px] font-bold text-white tracking-widest uppercase">
            OPERATIONS ACTIVE
          </span>
        </div>
        <div className="absolute bottom-3 left-4 text-white text-xs font-medium flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-emerald-950/70 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            LIVE INVENTORY SYNC
          </div>
          <span className="text-slate-300 text-[11px] font-mono">
            INTRA-DEPOT TRANSIT &amp; BAY DISPATCH RUNNING • MAIN HUB
          </span>
        </div>
      </div>

      {/* Page Header: Icon + Title + Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1E3A1E] text-white flex items-center justify-center shadow-md shrink-0">
            {/* Dual opposite movement arrows */}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.2"
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900 tracking-tight">Stock Movement</h1>
            <p className="text-xs text-slate-500 font-medium">
              Track and manage all stock movements within the warehouse.
            </p>
          </div>
        </div>

        {/* Breadcrumb matching screenshot */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
          <Link to="/dashboard" className="hover:text-slate-700">Home</Link>
          <span>›</span>
          <span className="text-slate-600">Warehouse Management</span>
          <span>›</span>
          <span className="text-slate-900 font-bold">Stock Movement</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5 KPI STAT CARDS (Exact Match with Reference Screenshot)                  */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Total Movements */}
        <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Total Movements</p>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-black text-slate-900 leading-tight">12,486</h3>
              <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                <span>↑</span> 12%
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">This month</p>
          </div>
        </div>

        {/* Card 2: Inward Movements */}
        <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Inward Movements</p>
            <h3 className="text-xl font-black text-slate-900 leading-tight">6,248</h3>
            <p className="text-[10px] text-slate-400 font-medium">50.1% of total</p>
          </div>
        </div>

        {/* Card 3: Internal Movements */}
        <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Internal Movements</p>
            <h3 className="text-xl font-black text-slate-900 leading-tight">3,892</h3>
            <p className="text-[10px] text-slate-400 font-medium">31.2% of total</p>
          </div>
        </div>

        {/* Card 4: Outward Movements */}
        <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Outward Movements</p>
            <h3 className="text-xl font-black text-slate-900 leading-tight">2,346</h3>
            <p className="text-[10px] text-slate-400 font-medium">18.8% of total</p>
          </div>
        </div>

        {/* Card 5: Returns / Adjustments */}
        <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Returns / Adjustments</p>
            <h3 className="text-xl font-black text-slate-900 leading-tight">146</h3>
            <p className="text-[10px] text-slate-400 font-medium">1.2% of total</p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FILTER BAR CARD (Exact Match with Reference Screenshot)                   */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-xl p-3.5 shadow-xs border border-slate-200">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 xl:grid-cols-9 gap-2.5 items-end text-xs">
          {/* Movement Type */}
          <div>
            <label className="block text-[10px] font-bold text-slate-600 mb-1">Movement Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:bg-white focus:ring-1 focus:ring-emerald-600 cursor-pointer"
            >
              <option value="All Types">All Types</option>
              <option value="Inward">Inward</option>
              <option value="Internal">Internal</option>
              <option value="Outward">Outward</option>
              <option value="Adjust">Adjustments</option>
            </select>
          </div>

          {/* Product */}
          <div>
            <label className="block text-[10px] font-bold text-slate-600 mb-1">Product</label>
            <select
              value={filterProduct}
              onChange={(e) => setFilterProduct(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:bg-white focus:ring-1 focus:ring-emerald-600 cursor-pointer"
            >
              <option value="">Select Product</option>
              <option value="Parle-G Gluco Biscuits (Packet)">Parle-G Gluco Biscuits</option>
              <option value="Fortune Refined Mustard Oil (15L Tin)">Fortune Mustard Oil (15L)</option>
              <option value="Sharbati Golden Wheat Grain (50kg Bag)">Sharbati Golden Wheat</option>
              <option value="Master 5-Ply Corrugated Cartons">5-Ply Corrugated Cartons</option>
              <option value="Disinfectant Surface Cleaner (5L Can)">Disinfectant Cleaner (5L)</option>
              <option value="Tata Salt Crystal Iodized (1kg Pkt)">Tata Salt Iodized (1kg)</option>
              <option value="Chana Dal Extra Bold (50kg Bag)">Chana Dal Extra Bold</option>
              <option value="High-Speed Conveyor Rollers & Belts">Conveyor Belts & Spares</option>
              <option value="Refined Soybean Oil (15L Tin)">Refined Soybean Oil (15L)</option>
            </select>
          </div>

          {/* Batch No. */}
          <div>
            <label className="block text-[10px] font-bold text-slate-600 mb-1">Batch No.</label>
            <select
              value={filterBatch}
              onChange={(e) => setFilterBatch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono font-medium focus:outline-none focus:bg-white focus:ring-1 focus:ring-emerald-600 cursor-pointer"
            >
              <option value="">Select Batch</option>
              <option value="BT-2026-FMCG-01">BT-2026-FMCG-01</option>
              <option value="BT-2026-OIL-02">BT-2026-OIL-02</option>
              <option value="BT-2026-PKG-03">BT-2026-PKG-03</option>
              <option value="BT-2026-WHT-04">BT-2026-WHT-04</option>
              <option value="BT-2026-CHM-05">BT-2026-CHM-05</option>
              <option value="BT-2026-FMCG-06">BT-2026-FMCG-06</option>
              <option value="BT-2026-PUL-07">BT-2026-PUL-07</option>
              <option value="BT-2026-CHM-08">BT-2026-CHM-08</option>
              <option value="BT-2026-SPR-09">BT-2026-SPR-09</option>
              <option value="BT-2026-OIL-10">BT-2026-OIL-10</option>
            </select>
          </div>

          {/* From Date */}
          <div>
            <label className="block text-[10px] font-bold text-slate-600 mb-1">From Date</label>
            <div className="relative">
              <input
                type="date"
                value={filterFromDate}
                onChange={(e) => setFilterFromDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-800 focus:outline-none focus:bg-white focus:ring-1 focus:ring-emerald-600"
              />
            </div>
          </div>

          {/* To Date */}
          <div>
            <label className="block text-[10px] font-bold text-slate-600 mb-1">To Date</label>
            <div className="relative">
              <input
                type="date"
                value={filterToDate}
                onChange={(e) => setFilterToDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-800 focus:outline-none focus:bg-white focus:ring-1 focus:ring-emerald-600"
              />
            </div>
          </div>

          {/* Location (From) */}
          <div>
            <label className="block text-[10px] font-bold text-slate-600 mb-1">Location (From)</label>
            <select
              value={filterFromLocation}
              onChange={(e) => setFilterFromLocation(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:bg-white focus:ring-1 focus:ring-emerald-600 cursor-pointer"
            >
              <option value="">Select Location</option>
              <option value="Receiving">Receiving Dock Gate-01</option>
              <option value="SH01">Shade 1 (Grains) - SH01-R02-C05</option>
              <option value="SH02">Shade 2 (Oils) - SH02-R01-C03</option>
              <option value="SH03">Shade 3 (FMCG) - SH03-R02-C04</option>
              <option value="SH04">Shade 4 (Packaging) - SH04-R03-C02</option>
              <option value="SH05">Shade 5 (Chemicals) - SH05-R02-C04</option>
              <option value="SH06">Shade 6 (Spares) - SH06-R02-C01</option>
            </select>
          </div>

          {/* Location (To) */}
          <div>
            <label className="block text-[10px] font-bold text-slate-600 mb-1">Location (To)</label>
            <select
              value={filterToLocation}
              onChange={(e) => setFilterToLocation(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:bg-white focus:ring-1 focus:ring-emerald-600 cursor-pointer"
            >
              <option value="">Select Location</option>
              <option value="Dispatch">Dispatch Staging Bay-01</option>
              <option value="SH01">Shade 1 (Grains) - SH01-R04-C02</option>
              <option value="SH02">Shade 2 (Oils) - SH02-R03-C06</option>
              <option value="SH03">Shade 3 (FMCG) - SH03-R05-C08</option>
              <option value="SH04">Shade 4 (Packaging) - SH04-R05-C01</option>
              <option value="SH05">Shade 5 (Chemicals) - SH05-R01-C01</option>
              <option value="SH06">Shade 6 (Spares) - SH06-R04-C03</option>
            </select>
          </div>

          {/* Buttons: Apply Filter & Reset */}
          <div className="col-span-2 sm:col-span-4 lg:col-span-7 xl:col-span-2 flex items-center gap-2">
            <button
              type="button"
              onClick={handleApplyFilter}
              className="flex-1 bg-[#1F331E] hover:bg-[#2A4428] text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer whitespace-nowrap active:scale-98"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>Apply Filter</span>
            </button>
            <button
              type="button"
              onClick={handleResetFilter}
              className="px-3 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MAIN LAYOUT: Left Column (Span 9) + Right Column (Span 3)                 */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: Movements Table + 3 Lower Widgets (Span 9 / 12)             */}
        {/* ========================================================================= */}
        <div className="lg:col-span-9 space-y-4">
          {/* Table Card */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden flex flex-col">
            {/* Toolbar Tabs + Actions matching screenshot */}
            <div className="p-3 sm:p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {['All Movements', 'Inward', 'Internal', 'Outward', 'Returns / Adjustments'].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab)
                      triggerToast(`Tab: ${tab}`)
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                      activeTab === tab
                        ? 'bg-[#1E3A1E] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Action Buttons: Export & Print */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="bg-[#1F331E] hover:bg-[#2A4428] text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Export</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="bg-[#1F331E] hover:bg-[#2A4428] text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  <span>Print</span>
                </button>
              </div>
            </div>

            {/* Table Container with no-scrollbar */}
            <div
              className="overflow-x-auto no-scrollbar scroll-smooth w-full"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              <table className="w-full text-left text-xs border-collapse table-nowrap min-w-[900px]">
                <thead>
                  <tr className="bg-slate-50/90 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                    <th className="py-3 px-3.5 text-center w-8">#</th>
                    <th className="py-3 px-3.5">Date &amp; Time</th>
                    <th className="py-3 px-3.5">Reference No.</th>
                    <th className="py-3 px-3.5">Type</th>
                    <th className="py-3 px-3.5">Product Name</th>
                    <th className="py-3 px-3.5">Batch No.</th>
                    <th className="py-3 px-3.5">From Location</th>
                    <th className="py-3 px-3.5">To Location</th>
                    <th className="py-3 px-3.5 text-right">Qty (Base Units &amp; Packaging)</th>
                    <th className="py-3 px-3.5">User</th>
                    <th className="py-3 px-3.5 text-center">Status</th>
                    <th className="py-3 px-3.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredRows.map((row, idx) => (
                    <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-3.5 text-center text-slate-400 font-bold text-[11px] whitespace-nowrap">
                        {idx + 1}
                      </td>
                      <td className="py-3.5 px-3.5 font-mono text-slate-600 whitespace-nowrap">
                        {row.dateTime}
                      </td>
                      <td className="py-3.5 px-3.5 font-mono font-bold text-slate-800 whitespace-nowrap">
                        {row.refNo}
                      </td>
                      <td className="py-3.5 px-3.5 whitespace-nowrap">
                        <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold border ${row.typeBadgeClass}`}>
                          {row.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-3.5 font-semibold text-slate-900 whitespace-nowrap">
                        {row.productName}
                      </td>
                      <td className="py-3.5 px-3.5 font-mono font-semibold text-slate-700 text-[11px] whitespace-nowrap">
                        {row.batchNo}
                      </td>
                      <td className="py-3.5 px-3.5 font-mono text-slate-600 whitespace-nowrap">
                        {row.fromLocation}
                      </td>
                      <td className="py-3.5 px-3.5 font-mono text-slate-600 whitespace-nowrap">
                        {row.toLocation}
                      </td>
                      <td className="py-3.5 px-3.5 text-right whitespace-nowrap">
                        <div className="font-mono font-bold text-slate-900">{row.quantity.toLocaleString()} Units</div>
                        {row.packagingSummary && (
                          <div className="text-[10px] text-slate-500 font-medium">{row.packagingSummary}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-3.5 text-slate-700 font-medium whitespace-nowrap">
                        {row.user}
                      </td>
                      <td className="py-3.5 px-3.5 text-center whitespace-nowrap">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${row.statusBadgeClass}`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-3.5 text-center whitespace-nowrap relative">
                        <button
                          type="button"
                          onClick={() => setActiveActionRow(activeActionRow === row.id ? null : row.id)}
                          className="w-7 h-7 rounded hover:bg-slate-100 flex items-center justify-center text-slate-500 font-bold tracking-widest cursor-pointer mx-auto transition"
                          title="Actions"
                        >
                          •••
                        </button>

                        {/* Dropdown Menu */}
                        {activeActionRow === row.id && (
                          <div className="absolute right-2 top-8 z-30 bg-white border border-slate-200 rounded-lg shadow-xl py-1 w-36 text-left text-xs animate-in fade-in zoom-in-95">
                            <button
                              type="button"
                              onClick={() => {
                                setShowDetailModal(row)
                                setActiveActionRow(null)
                              }}
                              className="w-full px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-500" />
                              <span>View Details</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                triggerToast(`Printing transfer voucher for ${row.refNo}`)
                                setActiveActionRow(null)
                              }}
                              className="w-full px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                            >
                              <Printer className="w-3.5 h-3.5 text-slate-500" />
                              <span>Print Slip</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                triggerToast(`Reversal initiated for ${row.refNo}`)
                                setActiveActionRow(null)
                              }}
                              className="w-full px-3 py-1.5 hover:bg-rose-50 flex items-center gap-2 text-rose-600"
                            >
                              <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
                              <span>Reverse</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer matching screenshot */}
            <div className="p-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 font-medium">
              <p>Showing 1 to {filteredRows.length} of 12,486 records</p>
              <div className="flex items-center gap-1 self-center">
                <button
                  type="button"
                  className="w-7 h-7 rounded border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-600 cursor-pointer"
                >
                  ‹
                </button>
                <button type="button" className="w-7 h-7 rounded bg-[#1F331E] text-white font-bold cursor-pointer">
                  1
                </button>
                <button type="button" className="w-7 h-7 rounded border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-600 cursor-pointer">
                  2
                </button>
                <button type="button" className="w-7 h-7 rounded border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-600 cursor-pointer">
                  3
                </button>
                <button type="button" className="w-7 h-7 rounded border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-600 cursor-pointer">
                  4
                </button>
                <button type="button" className="w-7 h-7 rounded border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-600 cursor-pointer">
                  5
                </button>
                <span className="px-1 text-slate-400">..</span>
                <button type="button" className="px-2 h-7 rounded border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-600 cursor-pointer font-mono">
                  1,249
                </button>
                <button
                  type="button"
                  className="w-7 h-7 rounded border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-600 cursor-pointer"
                >
                  ›
                </button>
              </div>
              <div className="flex items-center gap-1.5 self-end sm:self-auto">
                <span>Show</span>
                <select className="bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-xs font-semibold focus:outline-none">
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                </select>
                <span>per page</span>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* LOWER SECTION: 3 Widgets Side-by-Side Under Table                         */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
            {/* WIDGET 1: Stock Movement Trend (Multi-Line SVG Chart) */}
            <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                  <h2 className="text-xs font-bold text-slate-800">Stock Movement Trend</h2>
                </div>

                {/* Legend */}
                <div className="flex items-center flex-wrap gap-2.5 pt-2 pb-1 text-[10px] font-semibold text-slate-600">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>Inward</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <span>Internal</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    <span>Outward</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                    <span>Adjustments</span>
                  </div>
                </div>

                {/* SVG Line Graph */}
                <div className="h-44 w-full pt-2">
                  <svg viewBox="0 0 320 150" className="w-full h-full overflow-visible">
                    {/* Grid lines */}
                    <line x1="30" y1="15" x2="310" y2="15" stroke="#F1F5F9" strokeWidth="1" />
                    <line x1="30" y1="40" x2="310" y2="40" stroke="#F1F5F9" strokeWidth="1" />
                    <line x1="30" y1="65" x2="310" y2="65" stroke="#F1F5F9" strokeWidth="1" />
                    <line x1="30" y1="90" x2="310" y2="90" stroke="#F1F5F9" strokeWidth="1" />
                    <line x1="30" y1="115" x2="310" y2="115" stroke="#F1F5F9" strokeWidth="1" />
                    <line x1="30" y1="135" x2="310" y2="135" stroke="#CBD5E1" strokeWidth="1" />

                    {/* Y-Axis Labels */}
                    <text x="24" y="18" fill="#94A3B8" fontSize="8" textAnchor="end">1,000</text>
                    <text x="24" y="43" fill="#94A3B8" fontSize="8" textAnchor="end">800</text>
                    <text x="24" y="68" fill="#94A3B8" fontSize="8" textAnchor="end">600</text>
                    <text x="24" y="93" fill="#94A3B8" fontSize="8" textAnchor="end">400</text>
                    <text x="24" y="118" fill="#94A3B8" fontSize="8" textAnchor="end">200</text>
                    <text x="24" y="137" fill="#94A3B8" fontSize="8" textAnchor="end">0</text>

                    {/* Data Lines */}
                    {/* Inward Line (Green) */}
                    <path
                      d="M 45 85 L 90 98 L 135 80 L 180 72 L 225 90 L 270 50 L 305 58"
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="2"
                    />
                    {/* Internal Line (Blue) */}
                    <path
                      d="M 45 98 L 90 108 L 135 95 L 180 96 L 225 105 L 270 70 L 305 76"
                      fill="none"
                      stroke="#3B82F6"
                      strokeWidth="2"
                    />
                    {/* Outward Line (Amber) */}
                    <path
                      d="M 45 110 L 90 118 L 135 108 L 180 110 L 225 118 L 270 95 L 305 98"
                      fill="none"
                      stroke="#F59E0B"
                      strokeWidth="2"
                    />
                    {/* Adjustments Line (Purple) */}
                    <path
                      d="M 45 128 L 90 130 L 135 125 L 180 124 L 225 129 L 270 120 L 305 123"
                      fill="none"
                      stroke="#8B5CF6"
                      strokeWidth="2"
                    />

                    {/* Data Points on Inward (Green) */}
                    <circle cx="45" cy="85" r="2.5" fill="#10B981" />
                    <circle cx="90" cy="98" r="2.5" fill="#10B981" />
                    <circle cx="135" cy="80" r="2.5" fill="#10B981" />
                    <circle cx="180" cy="72" r="2.5" fill="#10B981" />
                    <circle cx="225" cy="90" r="2.5" fill="#10B981" />
                    <circle cx="270" cy="50" r="2.5" fill="#10B981" />
                    <circle cx="305" cy="58" r="2.5" fill="#10B981" />

                    {/* Data Points on Internal (Blue) */}
                    <circle cx="45" cy="98" r="2.5" fill="#3B82F6" />
                    <circle cx="90" cy="108" r="2.5" fill="#3B82F6" />
                    <circle cx="135" cy="95" r="2.5" fill="#3B82F6" />
                    <circle cx="180" cy="96" r="2.5" fill="#3B82F6" />
                    <circle cx="225" cy="105" r="2.5" fill="#3B82F6" />
                    <circle cx="270" cy="70" r="2.5" fill="#3B82F6" />
                    <circle cx="305" cy="76" r="2.5" fill="#3B82F6" />

                    {/* X-Axis Labels */}
                    <text x="45" y="147" fill="#94A3B8" fontSize="8" textAnchor="middle">10 Sep</text>
                    <text x="90" y="147" fill="#94A3B8" fontSize="8" textAnchor="middle">11 Sep</text>
                    <text x="135" y="147" fill="#94A3B8" fontSize="8" textAnchor="middle">12 Sep</text>
                    <text x="180" y="147" fill="#94A3B8" fontSize="8" textAnchor="middle">13 Sep</text>
                    <text x="225" y="147" fill="#94A3B8" fontSize="8" textAnchor="middle">14 Sep</text>
                    <text x="270" y="147" fill="#94A3B8" fontSize="8" textAnchor="middle">15 Sep</text>
                    <text x="305" y="147" fill="#94A3B8" fontSize="8" textAnchor="middle">16 Sep</text>
                  </svg>
                </div>
              </div>
            </div>

            {/* WIDGET 2: Top 5 Moved Products (This Month) */}
            <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <h2 className="text-xs font-bold text-slate-800">Top 5 Moved Products (This Month)</h2>
                </div>

                <div className="pt-3 space-y-3">
                  {/* Item 1 */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400 font-bold text-[10px]">1.</span>
                        <span className="text-slate-800 font-medium">Rice (Superior Grade 25kg)</span>
                      </div>
                      <span className="font-mono font-bold text-slate-900">4,850</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-emerald-700 h-2 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>

                  {/* Item 2 */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400 font-bold text-[10px]">2.</span>
                        <span className="text-slate-800 font-medium">Cooking Oil (Refined Mustard 15L)</span>
                      </div>
                      <span className="font-mono font-bold text-slate-900">2,430</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-emerald-700 h-2 rounded-full" style={{ width: '55%' }}></div>
                    </div>
                  </div>

                  {/* Item 3 */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400 font-bold text-[10px]">3.</span>
                        <span className="text-slate-800 font-medium">Corrugated Packaging Cartons</span>
                      </div>
                      <span className="font-mono font-bold text-slate-900">1,950</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-emerald-700 h-2 rounded-full" style={{ width: '42%' }}></div>
                    </div>
                  </div>

                  {/* Item 4 */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400 font-bold text-[10px]">4.</span>
                        <span className="text-slate-800 font-medium">Sugar (Crystalline 50kg Bags)</span>
                      </div>
                      <span className="font-mono font-bold text-slate-900">1,620</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-emerald-700 h-2 rounded-full" style={{ width: '35%' }}></div>
                    </div>
                  </div>

                  {/* Item 5 */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400 font-bold text-[10px]">5.</span>
                        <span className="text-slate-800 font-medium">Industrial Disinfectant 5L</span>
                      </div>
                      <span className="font-mono font-bold text-slate-900">980</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-emerald-700 h-2 rounded-full" style={{ width: '22%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* WIDGET 3: Quick Actions */}
            <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <h2 className="text-xs font-bold text-slate-800">Quick Actions</h2>
                </div>

                <div className="pt-3 space-y-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(true)}
                    className="w-full bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2.5 transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-emerald-700" />
                    <span>Create Stock Movement</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowScanModal(true)}
                    className="w-full bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2.5 transition cursor-pointer"
                  >
                    <Scan className="w-4 h-4 text-blue-600" />
                    <span>Scan & Move (Barcode)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowBulkModal(true)}
                    className="w-full bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2.5 transition cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-amber-600" />
                    <span>Bulk Movement (Excel)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => triggerToast('Opening full movements chronological history')}
                    className="w-full bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2.5 transition cursor-pointer"
                  >
                    <Clock className="w-4 h-4 text-purple-600" />
                    <span>Movement History</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePrint}
                    className="w-full bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2.5 transition cursor-pointer"
                  >
                    <Printer className="w-4 h-4 text-slate-700" />
                    <span>Print Movement Report</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: Distribution Donut Chart + Recent Feed (Span 3 / 12)        */}
        {/* ========================================================================= */}
        <div className="lg:col-span-3 space-y-4">
          {/* CARD 1: Movement Type Distribution Donut Chart */}
          <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
              <h2 className="text-xs font-bold text-slate-800">Movement Type Distribution</h2>
            </div>

            {/* Interactive SVG Donut Chart */}
            <div className="pt-3 pb-2 flex flex-col items-center">
              <div className="relative w-44 h-44 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  {/* Background base circle */}
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#F1F5F9" strokeWidth="15" />

                  {/* Segment 1: Inward (50.1% -> strokeDasharray: 119.6, 238.7) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="14"
                    strokeDasharray="119.6 238.7"
                    strokeDashoffset="0"
                  />

                  {/* Segment 2: Internal (31.2% -> strokeDasharray: 74.5, 238.7) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="14"
                    strokeDasharray="74.5 238.7"
                    strokeDashoffset="-119.6"
                  />

                  {/* Segment 3: Outward (18.8% -> strokeDasharray: 44.9, 238.7) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#F97316"
                    strokeWidth="14"
                    strokeDasharray="44.9 238.7"
                    strokeDashoffset="-194.1"
                  />

                  {/* Segment 4: Adjustments (1.2% -> strokeDasharray: 3.5, 238.7) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#8B5CF6"
                    strokeWidth="14"
                    strokeDasharray="3.5 238.7"
                    strokeDashoffset="-239"
                  />
                </svg>

                {/* Donut Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-black text-slate-900 font-mono leading-none">12,486</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase mt-1">Total</span>
                </div>
              </div>

              {/* Legend with percentages */}
              <div className="w-full pt-3 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500"></span>
                    <span className="text-slate-700 font-medium">Inward</span>
                  </div>
                  <span className="font-mono font-bold text-slate-800">6,248 (50.1%)</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-xs bg-blue-500"></span>
                    <span className="text-slate-700 font-medium">Internal</span>
                  </div>
                  <span className="font-mono font-bold text-slate-800">3,892 (31.2%)</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-xs bg-orange-500"></span>
                    <span className="text-slate-700 font-medium">Outward</span>
                  </div>
                  <span className="font-mono font-bold text-slate-800">2,346 (18.8%)</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-xs bg-purple-500"></span>
                    <span className="text-slate-700 font-medium">Adjustments</span>
                  </div>
                  <span className="font-mono font-bold text-slate-800">146 (1.2%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* CARD 2: Recent Stock Movements Feed */}
          <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 className="text-xs font-bold text-slate-800">Recent Stock Movements</h2>
              </div>
              <button
                type="button"
                onClick={() => triggerToast('Viewing all chronological stock activity')}
                className="text-[11px] font-bold text-emerald-800 hover:text-emerald-900 cursor-pointer"
              >
                View All →
              </button>
            </div>

            {/* Timeline Feed items */}
            <div className="pt-3 space-y-3">
              {/* Feed 1 */}
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                  ↻
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 leading-tight">
                    1,200 units moved (Internal)
                  </p>
                  <p className="text-[11px] text-slate-600">Parle-G Gluco Biscuits (200 Gatta)</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">16 Sep 2026, 09:45</p>
                </div>
              </div>

              {/* Feed 2 */}
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                  ↓
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 leading-tight">
                    450 Liters received (Inward)
                  </p>
                  <p className="text-[11px] text-slate-600">Fortune Mustard Oil (30 Tins)</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">16 Sep 2026, 08:30</p>
                </div>
              </div>

              {/* Feed 3 */}
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                  ↑
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 leading-tight">
                    1,000 Boxes issued (Outward)
                  </p>
                  <p className="text-[11px] text-slate-600">Master Corrugated Cartons (40 Bundles)</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">15 Sep 2026, 17:20</p>
                </div>
              </div>

              {/* Feed 4 */}
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                  ↻
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 leading-tight">
                    2,500 Kg moved (Internal)
                  </p>
                  <p className="text-[11px] text-slate-600">Sharbati Golden Wheat (50 Bags)</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">15 Sep 2026, 14:10</p>
                </div>
              </div>

              {/* Feed 5 */}
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                  ±
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 leading-tight">
                    -20 units adjusted (Adjustment)
                  </p>
                  <p className="text-[11px] text-slate-600">Disinfectant Surface Cleaner (4 Cans)</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">13 Sep 2026, 13:15</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: Create Stock Movement Modal                                      */}
      {/* ========================================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-[#1E3A1E] text-white flex items-center justify-center font-bold text-sm">
                  <Plus className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Create Stock Movement</h3>
                  <p className="text-[11px] text-slate-500">Record a new internal, inward, or outward transfer</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateMovement} className="pt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Movement Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newMovement.type}
                    onChange={(e) => setNewMovement({ ...newMovement, type: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:outline-none focus:bg-white focus:ring-1 focus:ring-emerald-600"
                  >
                    <option value="Internal">Internal Movement</option>
                    <option value="Inward">Inward Receiving</option>
                    <option value="Outward">Outward Dispatch</option>
                    <option value="Adjust">Stock Adjustment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Product <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newMovement.productName}
                    onChange={(e) => setNewMovement({ ...newMovement, productName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:outline-none focus:bg-white focus:ring-1 focus:ring-emerald-600"
                  >
                    <option value="Parle-G Gluco Biscuits (Packet)">Parle-G Gluco Biscuits (Packet)</option>
                    <option value="Fortune Refined Mustard Oil (15L Tin)">Fortune Refined Mustard Oil (15L Tin)</option>
                    <option value="Sharbati Golden Wheat Grain (50kg Bag)">Sharbati Golden Wheat Grain (50kg Bag)</option>
                    <option value="Master 5-Ply Corrugated Cartons">Master 5-Ply Corrugated Cartons</option>
                    <option value="Disinfectant Surface Cleaner (5L Can)">Disinfectant Surface Cleaner (5L Can)</option>
                    <option value="Tata Salt Crystal Iodized (1kg Pkt)">Tata Salt Crystal Iodized (1kg Pkt)</option>
                    <option value="Chana Dal Extra Bold (50kg Bag)">Chana Dal Extra Bold (50kg Bag)</option>
                    <option value="High-Speed Conveyor Rollers & Belts">High-Speed Conveyor Rollers & Belts</option>
                    <option value="Refined Soybean Oil (15L Tin)">Refined Soybean Oil (15L Tin)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Batch No. <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newMovement.batchNo}
                    onChange={(e) => setNewMovement({ ...newMovement, batchNo: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono font-bold focus:outline-none focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Quantity <span className="text-red-500">*</span>
                  </label>
                  <div className="flex">
                    <input
                      type="number"
                      value={newMovement.quantity}
                      onChange={(e) => setNewMovement({ ...newMovement, quantity: e.target.value })}
                      className="w-full bg-slate-50 border border-r-0 border-slate-200 rounded-l-lg p-2 text-xs font-mono font-bold focus:outline-none"
                    />
                    <span className="bg-slate-100 border border-slate-200 rounded-r-lg px-2.5 py-2 text-xs font-semibold text-slate-600">
                      Nos
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    From Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newMovement.fromLocation}
                    onChange={(e) => setNewMovement({ ...newMovement, fromLocation: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono focus:outline-none focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    To Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newMovement.toLocation}
                    onChange={(e) => setNewMovement({ ...newMovement, toLocation: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono focus:outline-none focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Reason / Purpose
                </label>
                <textarea
                  rows={2}
                  value={newMovement.reason}
                  onChange={(e) => setNewMovement({ ...newMovement, reason: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:bg-white resize-none"
                  placeholder="e.g. Relocation, QC hold, or unit requisition"
                ></textarea>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1F331E] hover:bg-[#2A4428] text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Confirm Movement</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: Barcode Scanner Modal                                            */}
      {/* ========================================================================= */}
      {showScanModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 text-center">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-[#1E3A1E] text-white flex items-center justify-center font-bold text-sm">
                  <Scan className="w-4 h-4" />
                </span>
                <h3 className="font-bold text-sm text-slate-900">Scan & Move Barcode</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowScanModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scanner Viewport */}
            <div className="relative w-full h-52 bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center border-2 border-dashed border-emerald-500/40">
              <div className="absolute inset-x-8 h-0.5 bg-red-500 shadow-[0_0_8px_#ef4444] animate-bounce"></div>
              <div className="text-center text-slate-400 text-xs space-y-1">
                <Camera className="w-8 h-8 text-emerald-400 mx-auto" />
                <p className="font-semibold text-white">Align Barcode / QR within frame</p>
                <p className="text-[10px] text-slate-400">Handheld Optical Scanner Ready (Omnidirectional)</p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
              <input
                type="text"
                placeholder="Or type barcode number manually..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  setShowScanModal(false)
                  triggerToast('Scanned: Parle-G Gluco Biscuits [BT-2026-FMCG-01] -> Location SH03-R02-C04 validated')
                }}
                className="bg-[#1F331E] hover:bg-[#2A4428] text-white px-4 py-2 rounded-lg text-xs font-bold"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: Bulk Excel Upload Modal                                          */}
      {/* ========================================================================= */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 text-center">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-[#1E3A1E] text-white flex items-center justify-center font-bold text-sm">
                  <FileSpreadsheet className="w-4 h-4" />
                </span>
                <h3 className="font-bold text-sm text-slate-900">Bulk Stock Movement Upload</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowBulkModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 bg-slate-50 hover:bg-slate-100/70 transition cursor-pointer flex flex-col items-center justify-center gap-2">
              <Upload className="w-8 h-8 text-slate-400" />
              <p className="text-xs font-bold text-slate-700">Drag and drop Excel or CSV file here</p>
              <p className="text-[11px] text-slate-500">Supports .xlsx, .xls, .csv templates</p>
              <button
                type="button"
                className="mt-2 text-xs font-bold text-emerald-800 underline"
                onClick={() => triggerToast('Standard Bulk Movement Template downloaded.')}
              >
                Download Excel Template
              </button>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowBulkModal(false)}
                className="px-4 py-1.5 border border-slate-300 rounded-lg text-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowBulkModal(false)
                  triggerToast('14 batch movements imported successfully!')
                }}
                className="px-5 py-1.5 bg-[#1F331E] hover:bg-[#2A4428] text-white rounded-lg text-xs font-bold"
              >
                Process File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: Detail View Modal                                                */}
      {/* ========================================================================= */}
      {showDetailModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900">{showDetailModal.refNo}</h3>
                <p className="text-[11px] text-slate-500">Stock Transfer Voucher Details</p>
              </div>
              <button
                type="button"
                onClick={() => setShowDetailModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs divide-y divide-slate-100">
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Date & Time:</span>
                <span className="font-mono font-bold text-slate-800">{showDetailModal.dateTime}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Movement Type:</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${showDetailModal.typeBadgeClass}`}>
                  {showDetailModal.type}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Product Name:</span>
                <span className="font-bold text-slate-900">{showDetailModal.productName}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Batch No:</span>
                <span className="font-mono font-bold text-slate-800">{showDetailModal.batchNo}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Source Location:</span>
                <span className="font-mono font-bold text-slate-800">{showDetailModal.fromLocation}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Destination Location:</span>
                <span className="font-mono font-bold text-slate-800">{showDetailModal.toLocation}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Quantity Transferred:</span>
                <span className="font-mono font-bold text-emerald-800 text-sm">
                  {showDetailModal.quantity.toLocaleString()} Units
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Authorized Personnel:</span>
                <span className="font-bold text-slate-800">{showDetailModal.user}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Status:</span>
                <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                  {showDetailModal.status}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDetailModal(null)}
                className="px-4 py-1.5 border border-slate-300 rounded-lg text-slate-700 text-xs font-semibold"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  triggerToast(`Printed slip for ${showDetailModal.refNo}`)
                  setShowDetailModal(null)
                }}
                className="px-4 py-1.5 bg-[#1F331E] hover:bg-[#2A4428] text-white rounded-lg text-xs font-bold"
              >
                Print Slip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
