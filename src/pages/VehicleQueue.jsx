import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Megaphone, Zap, Check, AlertTriangle, X } from 'lucide-react'

export default function VehicleQueue() {
  const [activeTab, setActiveTab] = useState('all') // 'all', 'incoming', 'outgoing'
  const [searchQuery, setSearchQuery] = useState('')
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [openActionMenuId, setOpenActionMenuId] = useState(null)
  const [toastMessage, setToastMessage] = useState(null)

  // Initial Queue Data matching reference screenshot exactly
  const [vehicles, setVehicles] = useState([
    {
      id: 1,
      tokenNo: 'TKN-001',
      vehicleNo: 'UP32 AB 1256',
      type: 'truck',
      driverName: 'Rajesh Yadav',
      supplier: 'Bharat Supply',
      purpose: 'Material Inward',
      arrivedAt: '09:12 AM',
      waitingTime: '1h 12m',
      waitingTimeClass: 'text-amber-700 font-semibold',
      status: 'In Queue',
      statusClass: 'bg-amber-100 text-amber-800 border-amber-200',
    },
    {
      id: 2,
      tokenNo: 'TKN-002',
      vehicleNo: 'HR55 CD 7890',
      type: 'truck',
      driverName: 'Sandeep Kumar',
      supplier: 'Defence Foods',
      purpose: 'Material Inward',
      arrivedAt: '09:45 AM',
      waitingTime: '39m',
      waitingTimeClass: 'text-emerald-700 font-semibold',
      status: 'In Queue',
      statusClass: 'bg-amber-100 text-amber-800 border-amber-200',
    },
    {
      id: 3,
      tokenNo: 'TKN-003',
      vehicleNo: 'DL01 EF 4321',
      type: 'car',
      driverName: 'Amit Singh',
      supplier: 'Ordnance Factory',
      purpose: 'Dispatch',
      arrivedAt: '10:05 AM',
      waitingTime: '19m',
      waitingTimeClass: 'text-emerald-700 font-semibold',
      status: 'Processing',
      statusClass: 'bg-blue-100 text-blue-800 border-blue-200',
    },
    {
      id: 4,
      tokenNo: 'TKN-004',
      vehicleNo: 'UP78 GH 9987',
      type: 'car',
      driverName: 'Vikram Pal',
      supplier: 'Army Stores',
      purpose: 'Material Inward',
      arrivedAt: '08:55 AM',
      waitingTime: '1h 29m',
      waitingTimeClass: 'text-red-600 font-bold',
      status: 'Delayed',
      statusClass: 'bg-red-100 text-red-800 border-red-200',
    },
    {
      id: 5,
      tokenNo: 'TKN-005',
      vehicleNo: 'RJ14 JK 6543',
      type: 'car',
      driverName: 'Imran Khan',
      supplier: 'National Supply',
      purpose: 'Dispatch',
      arrivedAt: '10:10 AM',
      waitingTime: '14m',
      waitingTimeClass: 'text-emerald-700 font-semibold',
      status: 'In Queue',
      statusClass: 'bg-amber-100 text-amber-800 border-amber-200',
    },
    {
      id: 6,
      tokenNo: 'TKN-006',
      vehicleNo: 'UP32 ZZ 1111',
      type: 'truck',
      driverName: 'Ramesh Tiwari',
      supplier: 'Kansai Pvt Ltd',
      purpose: 'Material Inward',
      arrivedAt: '07:50 AM',
      waitingTime: '2h 34m',
      waitingTimeClass: 'text-red-600 font-bold',
      status: 'Delayed',
      statusClass: 'bg-red-100 text-red-800 border-red-200',
    },
    {
      id: 7,
      tokenNo: 'TKN-007',
      vehicleNo: 'BR01 XY 2222',
      type: 'car',
      driverName: 'Manoj Kumar',
      supplier: 'Eastern Logistics',
      purpose: 'Dispatch',
      arrivedAt: '10:15 AM',
      waitingTime: '9m',
      waitingTimeClass: 'text-emerald-700 font-semibold',
      status: 'In Queue',
      statusClass: 'bg-amber-100 text-amber-800 border-amber-200',
    },
    {
      id: 8,
      tokenNo: 'TKN-008',
      vehicleNo: 'MP09 KL 3333',
      type: 'truck',
      driverName: 'Suresh Patel',
      supplier: 'Central Depot',
      purpose: 'Material Inward',
      arrivedAt: '09:20 AM',
      waitingTime: '1h 4m',
      waitingTimeClass: 'text-amber-700 font-semibold',
      status: 'Processing',
      statusClass: 'bg-blue-100 text-blue-800 border-blue-200',
    },
    {
      id: 9,
      tokenNo: 'TKN-009',
      vehicleNo: 'GJ05 MN 4444',
      type: 'car',
      driverName: 'Arun Mehta',
      supplier: 'Western Traders',
      purpose: 'Dispatch',
      arrivedAt: '10:18 AM',
      waitingTime: '6m',
      waitingTimeClass: 'text-emerald-700 font-semibold',
      status: 'In Queue',
      statusClass: 'bg-amber-100 text-amber-800 border-amber-200',
    },
    {
      id: 10,
      tokenNo: 'TKN-010',
      vehicleNo: 'UP81 RT 5555',
      type: 'truck',
      driverName: 'Deepak Singh',
      supplier: 'Northern Supply',
      purpose: 'Material Inward',
      arrivedAt: '08:30 AM',
      waitingTime: '1h 54m',
      waitingTimeClass: 'text-red-600 font-bold',
      status: 'Delayed',
      statusClass: 'bg-red-100 text-red-800 border-red-200',
    },
  ])

  // New Vehicle Form State
  const [newVehicle, setNewVehicle] = useState({
    vehicleNo: '',
    type: 'truck',
    driverName: '',
    supplier: '',
    purpose: 'Material Inward',
  })

  // Toast trigger
  const triggerToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Filtered vehicles
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((item) => {
      // Tab filter
      if (activeTab === 'incoming' && item.purpose !== 'Material Inward') return false
      if (activeTab === 'outgoing' && item.purpose !== 'Dispatch') return false

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchVeh = item.vehicleNo.toLowerCase().includes(q)
        const matchDriver = item.driverName.toLowerCase().includes(q)
        const matchSupplier = item.supplier.toLowerCase().includes(q)
        const matchToken = item.tokenNo.toLowerCase().includes(q)
        return matchVeh || matchDriver || matchSupplier || matchToken
      }
      return true
    })
  }, [vehicles, activeTab, searchQuery])

  // Add Vehicle handler
  const handleAddVehicle = (e) => {
    e.preventDefault()
    if (!newVehicle.vehicleNo.trim() || !newVehicle.driverName.trim()) {
      triggerToast('Please provide Vehicle Number and Driver Name!')
      return
    }

    const nextTokenNum = vehicles.length + 1
    const tokenStr = `TKN-${String(nextTokenNum).padStart(3, '0')}`

    const newItem = {
      id: Date.now(),
      tokenNo: tokenStr,
      vehicleNo: newVehicle.vehicleNo.trim().toUpperCase(),
      type: newVehicle.type,
      driverName: newVehicle.driverName.trim(),
      supplier: newVehicle.supplier.trim() || 'Direct Deputation',
      purpose: newVehicle.purpose,
      arrivedAt: 'Just now',
      waitingTime: '1m',
      waitingTimeClass: 'text-emerald-700 font-semibold',
      status: 'In Queue',
      statusClass: 'bg-amber-100 text-amber-800 border-amber-200',
    }

    setVehicles([newItem, ...vehicles])
    setShowAddModal(false)
    setNewVehicle({
      vehicleNo: '',
      type: 'truck',
      driverName: '',
      supplier: '',
      purpose: 'Material Inward',
    })
    triggerToast(`Vehicle ${newItem.vehicleNo} added with Token ${tokenStr}`)
  }

  // Action status update
  const handleStatusUpdate = (id, newStatus) => {
    setVehicles(
      vehicles.map((v) => {
        if (v.id === id) {
          let sClass = 'bg-amber-100 text-amber-800 border-amber-200'
          if (newStatus === 'Processing') sClass = 'bg-blue-100 text-blue-800 border-blue-200'
          if (newStatus === 'Completed') sClass = 'bg-emerald-100 text-emerald-800 border-emerald-200'
          if (newStatus === 'Delayed') sClass = 'bg-red-100 text-red-800 border-red-200'
          return { ...v, status: newStatus, statusClass: sClass }
        }
        return v
      })
    )
    setOpenActionMenuId(null)
    triggerToast(`Vehicle status updated to ${newStatus}`)
  }

  // Call Next Vehicle
  const handleCallNext = () => {
    const nextVeh = vehicles.find((v) => v.status === 'In Queue')
    if (nextVeh) {
      triggerToast(`Calling ${nextVeh.vehicleNo} (${nextVeh.tokenNo}) to Depot Bay!`)
    } else {
      triggerToast('No vehicles currently waiting in queue.')
    }
  }

  // CSV export
  const handleExport = () => {
    const headers = ['Token No', 'Vehicle No', 'Type', 'Driver Name', 'Supplier / Party', 'Purpose', 'Arrived At', 'Waiting Time', 'Status']
    const rows = vehicles.map((v) => [
      v.tokenNo,
      v.vehicleNo,
      v.type,
      v.driverName,
      `"${v.supplier}"`,
      v.purpose,
      v.arrivedAt,
      v.waitingTime,
      v.status,
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'Indian_Army_Vehicle_Queue.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    triggerToast('Vehicle queue exported to CSV file successfully.')
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
          <div className="w-11 h-11 rounded-lg bg-[#EBF5EA] border border-[#CDE5CA] flex items-center justify-center text-[#1E3A1E] shadow-xs">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 17H5a2 2 0 01-2-2V7a2 2 0 012-2h10a2 2 0 012 2v2m-6 8h6m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0zm10-6h3.5a1.5 1.5 0 011.2.6L22 14v3a1 1 0 01-1 1h-2" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">Vehicle Queue</h1>
            <p className="text-xs text-slate-500 font-medium">
              Real-time view of all incoming and outgoing vehicles at the warehouse.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="text-xs text-slate-400 flex items-center gap-1.5 font-medium mr-2">
            <Link to="/dashboard" className="hover:text-slate-700">Home</Link>
            <span>›</span>
            <span className="text-slate-800 font-semibold">Vehicle Queue</span>
          </div>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="bg-[#1F331E] hover:bg-[#2A4428] text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shadow-xs transition cursor-pointer"
          >
            <span className="text-base leading-none">+</span>
            <span>Add to Queue</span>
          </button>
        </div>
      </div>

      {/* 5 KPI Stat Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Card 1: Total in Queue */}
        <div className="bg-white rounded-xl p-3.5 shadow-xs border border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 17H5a2 2 0 01-2-2V7a2 2 0 012-2h10a2 2 0 012 2v2m-6 8h6m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Total in Queue</p>
            <h3 className="text-2xl font-black text-slate-800 leading-tight">12</h3>
            <p className="text-[10px] text-slate-400 font-medium">Vehicles waiting</p>
          </div>
        </div>

        {/* Card 2: Incoming Vehicles */}
        <div className="bg-white rounded-xl p-3.5 shadow-xs border border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Incoming Vehicles</p>
            <h3 className="text-2xl font-black text-slate-800 leading-tight">7</h3>
            <p className="text-[10px] text-slate-400 font-medium">For Material Inward</p>
          </div>
        </div>

        {/* Card 3: Outgoing Vehicles */}
        <div className="bg-white rounded-xl p-3.5 shadow-xs border border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Outgoing Vehicles</p>
            <h3 className="text-2xl font-black text-slate-800 leading-tight">5</h3>
            <p className="text-[10px] text-slate-400 font-medium">For Dispatch</p>
          </div>
        </div>

        {/* Card 4: Avg. Waiting Time */}
        <div className="bg-white rounded-xl p-3.5 shadow-xs border border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Avg. Waiting Time</p>
            <h3 className="text-2xl font-black text-slate-800 leading-tight">38 mins</h3>
            <p className="text-[10px] text-slate-400 font-medium">Current average</p>
          </div>
        </div>

        {/* Card 5: Delayed Vehicles */}
        <div className="bg-white rounded-xl p-3.5 shadow-xs border border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Delayed Vehicles</p>
            <h3 className="text-2xl font-black text-slate-800 leading-tight">3</h3>
            <p className="text-[10px] text-slate-400 font-medium">Waiting &gt; 2 Hours</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Controls Bar */}
      <div className="bg-white rounded-xl p-3 shadow-xs border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'all'
                ? 'bg-[#1E381E] text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            All Vehicles ({vehicles.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('incoming')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'incoming'
                ? 'bg-[#1E381E] text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            Incoming ({vehicles.filter((v) => v.purpose === 'Material Inward').length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('outgoing')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'outgoing'
                ? 'bg-[#1E381E] text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            Outgoing ({vehicles.filter((v) => v.purpose === 'Dispatch').length})
          </button>
        </div>

        {/* Right Search & Buttons */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <svg className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by Vehicle No., Driver, Supplier..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white"
            />
          </div>

          <button
            type="button"
            onClick={() => triggerToast('Filter settings opened.')}
            className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
          >
            <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span>Filter</span>
          </button>

          <button
            type="button"
            onClick={handleExport}
            className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
          >
            <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Grid: Queue Table (Left) + Queue Status & Instructions (Right) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: Queue Table (Span 9 / 12)                                    */}
        {/* ========================================================================= */}
        <div className="xl:col-span-9 bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden flex flex-col">
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
              style={{ minWidth: '1200px' }}
            >
              <thead className="bg-slate-50/80 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-3 w-8 text-center whitespace-nowrap">#</th>
                  <th className="py-3 px-3 min-w-[95px] whitespace-nowrap">Token No.</th>
                  <th className="py-3 px-3 min-w-[125px] whitespace-nowrap">Vehicle No.</th>
                  <th className="py-3 px-2 text-center w-8 whitespace-nowrap">Type</th>
                  <th className="py-3 px-3 min-w-[130px] whitespace-nowrap">Driver Name</th>
                  <th className="py-3 px-3 min-w-[150px] whitespace-nowrap">Supplier / Party</th>
                  <th className="py-3 px-3 min-w-[130px] whitespace-nowrap">Purpose</th>
                  <th className="py-3 px-3 min-w-[90px] whitespace-nowrap">Arrived At</th>
                  <th className="py-3 px-3 min-w-[100px] whitespace-nowrap">Waiting Time</th>
                  <th className="py-3 px-3 text-center min-w-[100px] whitespace-nowrap">Status</th>
                  <th className="py-3 px-3 text-center w-12 whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredVehicles.map((row, idx) => (
                  <tr key={row.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-3 text-center text-slate-400 font-bold text-[11px] whitespace-nowrap">{idx + 1}</td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-800 whitespace-nowrap">{row.tokenNo}</td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-800 tracking-wide whitespace-nowrap">{row.vehicleNo}</td>
                    <td className="py-3 px-2 text-center whitespace-nowrap">
                      {row.type === 'truck' ? (
                        <span title="Heavy Truck" className="inline-block text-slate-700">
                          <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 17H5a2 2 0 01-2-2V7a2 2 0 012-2h10a2 2 0 012 2v2m-6 8h6m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0zm10-6h3.5a1.5 1.5 0 011.2.6L22 14v3a1 1 0 01-1 1h-2" />
                          </svg>
                        </span>
                      ) : (
                        <span title="Light / Pickup Vehicle" className="inline-block text-slate-700">
                          <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                          </svg>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-800 whitespace-nowrap">{row.driverName}</td>
                    <td className="py-3 px-3 text-slate-600 whitespace-nowrap">{row.supplier}</td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="text-slate-700 font-medium">{row.purpose}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-500 whitespace-nowrap">{row.arrivedAt}</td>
                    <td className={`py-3 px-3 whitespace-nowrap ${row.waitingTimeClass}`}>
                      {row.waitingTime}
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${row.statusClass}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center relative whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setOpenActionMenuId(openActionMenuId === row.id ? null : row.id)}
                        className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 px-2 py-1 rounded-md text-xs font-bold transition cursor-pointer"
                        title="Options"
                      >
                        •••
                      </button>

                      {/* Dropdown Menu */}
                      {openActionMenuId === row.id && (
                        <div className="absolute right-3 top-10 w-44 bg-white border border-slate-200 rounded-lg shadow-xl z-20 py-1 text-left text-xs font-medium">
                          <button
                            type="button"
                            onClick={() => {
                              triggerToast(`Calling ${row.vehicleNo} to Dock!`)
                              setOpenActionMenuId(null)
                            }}
                            className="w-full px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                          >
                            <Megaphone className="w-3.5 h-3.5 text-slate-500" />
                            <span>Call Vehicle</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusUpdate(row.id, 'Processing')}
                            className="w-full px-3 py-1.5 hover:bg-blue-50 text-blue-700 flex items-center gap-2"
                          >
                            <Zap className="w-3.5 h-3.5 text-blue-600" />
                            <span>Mark Processing</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusUpdate(row.id, 'Completed')}
                            className="w-full px-3 py-1.5 hover:bg-emerald-50 text-emerald-700 flex items-center gap-2"
                          >
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Mark Completed</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusUpdate(row.id, 'Delayed')}
                            className="w-full px-3 py-1.5 hover:bg-red-50 text-red-700 flex items-center gap-2"
                          >
                            <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                            <span>Mark Delayed</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: Queue Status Chart, Next in Line, Instructions (Span 3/12) */}
        {/* ========================================================================= */}
        <div className="xl:col-span-3 space-y-4">
          {/* Card 1: Queue Status (SVG Donut Chart) */}
          <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200">
            <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100">
              <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
              <h2 className="text-xs font-bold text-slate-800">Queue Status</h2>
            </div>

            <div className="flex items-center justify-between gap-4">
              {/* SVG Donut Chart */}
              <div className="relative w-28 h-28 shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  {/* Background Circle */}
                  <path
                    className="text-slate-100"
                    strokeWidth="3.8"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* In Queue (Amber: 5/12 = 41.6%) */}
                  <path
                    className="text-amber-500"
                    strokeDasharray="41.6, 100"
                    strokeDashoffset="0"
                    strokeWidth="3.8"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Processing (Blue: 2/12 = 16.6%) */}
                  <path
                    className="text-blue-500"
                    strokeDasharray="16.6, 100"
                    strokeDashoffset="-41.6"
                    strokeWidth="3.8"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Completed (Emerald: 3/12 = 25%) */}
                  <path
                    className="text-emerald-500"
                    strokeDasharray="25, 100"
                    strokeDashoffset="-58.2"
                    strokeWidth="3.8"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Delayed (Red: 2/12 = 16.6%) */}
                  <path
                    className="text-red-500"
                    strokeDasharray="16.6, 100"
                    strokeDashoffset="-83.2"
                    strokeWidth="3.8"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-base font-black text-slate-800">12</span>
                  <span className="text-[9px] text-slate-400 font-semibold">Vehicles</span>
                </div>
              </div>

              {/* Legend List */}
              <div className="space-y-1.5 text-[11px] font-medium flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <span className="text-slate-600">In Queue</span>
                  </div>
                  <strong className="text-slate-800">5</strong>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                    <span className="text-slate-600">Processing</span>
                  </div>
                  <strong className="text-slate-800">2</strong>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span className="text-slate-600">Completed</span>
                  </div>
                  <strong className="text-slate-800">3</strong>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                    <span className="text-slate-600">Delayed</span>
                  </div>
                  <strong className="text-slate-800">2</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Next in Line */}
          <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 13l-7 7-7-7m14-8l-7 7-7-7" />
                </svg>
                <h2 className="text-xs font-bold text-slate-800">Next in Line</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500 font-medium">Auto Refresh</span>
                <button
                  type="button"
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`w-7 h-4 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                    autoRefresh ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`w-3 h-3 rounded-full bg-white transition-transform ${
                      autoRefresh ? 'translate-x-3' : 'translate-x-0'
                    }`}
                  ></div>
                </button>
              </div>
            </div>

            {/* Next Vehicle Details Box */}
            <div className="bg-slate-50/90 rounded-lg p-3 border border-slate-200/80 space-y-2 text-xs">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-800 text-white font-mono font-bold text-[10px] px-2 py-0.5 rounded">
                    TKN-003
                  </span>
                  <span className="font-mono font-bold text-slate-800">DL01 EF 4221</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-amber-700 font-semibold">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Waiting Time</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 17H5a2 2 0 01-2-2V7a2 2 0 012-2h10a2 2 0 012 2v2m-6 8h6m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-xs">Amit Singh</p>
                    <p className="text-[10px] text-slate-500">Ordnance Factory</p>
                    <p className="text-[10px] text-slate-400 font-medium">Dispatch</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-base font-black text-slate-800">19 mins</p>
                </div>
              </div>
            </div>

            {/* Call Next Button */}
            <button
              type="button"
              onClick={handleCallNext}
              className="w-full bg-[#1F331E] hover:bg-[#2A4428] text-white py-2.5 px-3 rounded-lg text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
              <span>Call Next Vehicle</span>
            </button>
          </div>

          {/* Card 3: Queue Instructions */}
          <div className="bg-[#FAF8F2] rounded-xl p-4 border border-amber-200/70">
            <div className="flex items-center gap-2 mb-2 text-slate-800">
              <svg className="w-4 h-4 text-amber-700" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <h3 className="text-xs font-bold tracking-tight text-slate-800">Queue Instructions</h3>
            </div>
            <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-slate-600 leading-relaxed font-medium">
              <li>Vehicles will be served as per token sequence.</li>
              <li>Ensure valid gate pass and documents.</li>
              <li>Delayed vehicles require supervisor approval.</li>
              <li>Keep documents ready for verification.</li>
              <li>Follow security guidelines at all times.</li>
            </ol>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ADD TO QUEUE MODAL                                                        */}
      {/* ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-[#EBF5EA] text-[#1E3A1E] flex items-center justify-center font-black text-sm">
                  +
                </div>
                <h3 className="text-sm font-bold text-slate-800">Add Vehicle to Queue</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 font-bold"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddVehicle} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Vehicle Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DL04 XY 9876"
                  value={newVehicle.vehicleNo}
                  onChange={(e) => setNewVehicle({ ...newVehicle, vehicleNo: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono uppercase font-bold focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Vehicle Type</label>
                  <select
                    value={newVehicle.type}
                    onChange={(e) => setNewVehicle({ ...newVehicle, type: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  >
                    <option value="truck">Heavy Truck</option>
                    <option value="car">Pickup / LTV</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Purpose</label>
                  <select
                    value={newVehicle.purpose}
                    onChange={(e) => setNewVehicle({ ...newVehicle, purpose: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  >
                    <option value="Material Inward">Material Inward</option>
                    <option value="Dispatch">Dispatch</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Driver Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter Driver Name"
                  value={newVehicle.driverName}
                  onChange={(e) => setNewVehicle({ ...newVehicle, driverName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Supplier / Party</label>
                <input
                  type="text"
                  placeholder="e.g. Bharat Supply, Army Stores"
                  value={newVehicle.supplier}
                  onChange={(e) => setNewVehicle({ ...newVehicle, supplier: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white"
                />
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
                  Add Vehicle to Queue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
