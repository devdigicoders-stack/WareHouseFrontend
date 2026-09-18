import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Check, Zap, X } from 'lucide-react'

export default function GoodsReceiving() {
  // Toast state
  const [toastMessage, setToastMessage] = useState(null)

  // Active filter tab
  const [activeTab, setActiveTab] = useState('all') // 'all', 'pending', 'in_process', 'completed', 'rejected'

  // Search & Date
  const [searchQuery, setSearchQuery] = useState('')
  const [dateRange, setDateRange] = useState('16-09-2026 - 16-09-2026')

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false)
  const [showPrintModal, setShowPrintModal] = useState(false)
  const [showScannerModal, setShowScannerModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [openActionMenuId, setOpenActionMenuId] = useState(null)

  // Selected GRN for detail/print
  const [selectedGrn, setSelectedGrn] = useState({
    id: 1,
    grnNo: 'GRN-2026-001',
    dateTime: '16 Sep 2026, 09:15',
    poNo: 'PO-2026-4587',
    supplier: 'Bharat Supply Co.',
    vehicleNo: 'UP32 AB 1256',
    items: 15,
    status: 'Completed',
    statusClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    receivedBy: 'Nk. R. Singh',
    totalQty: '350 Units',
    totalValue: '₹ 2,45,000',
    remarks: 'Inspected and accepted in Central Depot Bay-4',
    materials: [
      { code: 'ORD-7701', name: 'Standard Issue Combat Boots (Size 9)', qty: 150, unit: 'Pairs', batch: 'BTH-2026-081' },
      { code: 'ORD-7704', name: 'Tactical Rucksacks 65L (Camouflage)', qty: 100, unit: 'Nos', batch: 'BTH-2026-084' },
      { code: 'ORD-7712', name: 'High Altitude Winter Gloves', qty: 100, unit: 'Pairs', batch: 'BTH-2026-090' },
    ],
  })

  // Full 10 GRN records directly matching the user's reference screenshot
  const [grnList, setGrnList] = useState([
    {
      id: 1,
      grnNo: 'GRN-2026-001',
      dateTime: '16 Sep 2026, 09:15',
      poNo: 'PO-2026-4587',
      supplier: 'Bharat Supply Co.',
      vehicleNo: 'UP32 AB 1256',
      items: 15,
      status: 'Completed',
      statusClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      receivedBy: 'Nk. R. Singh',
      totalQty: '350 Units',
      totalValue: '₹ 2,45,000',
      remarks: 'Inspected and accepted in Central Depot Bay-4',
    },
    {
      id: 2,
      grnNo: 'GRN-2026-002',
      dateTime: '16 Sep 2026, 10:05',
      poNo: 'IND-2026-1123',
      supplier: 'Defence Ordnance',
      vehicleNo: 'HR55 CD 7890',
      items: 8,
      status: 'In Process',
      statusClass: 'bg-blue-100 text-blue-800 border-blue-200',
      receivedBy: 'Hav. P. Kumar',
      totalQty: '180 Units',
      totalValue: '₹ 3,20,000',
      remarks: 'Under technical ballistic and quality clearance',
    },
    {
      id: 3,
      grnNo: 'GRN-2026-003',
      dateTime: '16 Sep 2026, 11:20',
      poNo: 'PO-2026-3321',
      supplier: 'Army Stores Ltd.',
      vehicleNo: 'DL01 EF 4321',
      items: 24,
      status: 'Pending',
      statusClass: 'bg-amber-100 text-amber-800 border-amber-200',
      receivedBy: 'Cpl. A. Yadav',
      totalQty: '520 Units',
      totalValue: '₹ 4,10,000',
      remarks: 'Waiting for gate pass counter verification',
    },
    {
      id: 4,
      grnNo: 'GRN-2026-004',
      dateTime: '15 Sep 2026, 16:45',
      poNo: 'PO-2026-2289',
      supplier: 'Kansai Pvt Ltd',
      vehicleNo: 'UP78 GH 9987',
      items: 12,
      status: 'Completed',
      statusClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      receivedBy: 'Nk. S. Mehta',
      totalQty: '210 Units',
      totalValue: '₹ 1,85,000',
      remarks: 'All packages intact with official hologram seal',
    },
    {
      id: 5,
      grnNo: 'GRN-2026-005',
      dateTime: '15 Sep 2026, 14:30',
      poNo: 'IND-2026-9901',
      supplier: 'National Supply',
      vehicleNo: 'RJ14 JK 6543',
      items: 30,
      status: 'Completed',
      statusClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      receivedBy: 'Hav. D. Singh',
      totalQty: '680 Units',
      totalValue: '₹ 5,40,000',
      remarks: 'Stored in Section B Racks 04-09',
    },
    {
      id: 6,
      grnNo: 'GRN-2026-006',
      dateTime: '15 Sep 2026, 12:10',
      poNo: 'PO-2026-7765',
      supplier: 'Eastern Logistics',
      vehicleNo: 'UP32 ZZ 1111',
      items: 10,
      status: 'Rejected',
      statusClass: 'bg-red-100 text-red-800 border-red-200',
      receivedBy: 'Lt. S. Chauhan',
      totalQty: '95 Units',
      totalValue: '₹ 85,000',
      remarks: 'Batch barcode mismatch; damaged transit packaging',
    },
    {
      id: 7,
      grnNo: 'GRN-2026-007',
      dateTime: '14 Sep 2026, 15:45',
      poNo: 'PO-2026-6654',
      supplier: 'Tech Solutions',
      vehicleNo: 'BR01 XY 2222',
      items: 18,
      status: 'Completed',
      statusClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      receivedBy: 'Nk. P. Verma',
      totalQty: '340 Units',
      totalValue: '₹ 3,90,000',
      remarks: 'Verified against OEM batch inspection test report',
    },
    {
      id: 8,
      grnNo: 'GRN-2026-008',
      dateTime: '14 Sep 2026, 11:25',
      poNo: 'IND-2026-4433',
      supplier: 'Global Supplies',
      vehicleNo: 'MP09 KL 3333',
      items: 9,
      status: 'In Process',
      statusClass: 'bg-blue-100 text-blue-800 border-blue-200',
      receivedBy: 'Cpl. R. Khan',
      totalQty: '160 Units',
      totalValue: '₹ 1,75,000',
      remarks: 'Weighbridge slip verified; unloading at Dock 2',
    },
    {
      id: 9,
      grnNo: 'GRN-2026-009',
      dateTime: '14 Sep 2026, 10:05',
      poNo: 'PO-2026-8890',
      supplier: 'Om Traders',
      vehicleNo: 'GJ05 MN 4444',
      items: 21,
      status: 'Pending',
      statusClass: 'bg-amber-100 text-amber-800 border-amber-200',
      receivedBy: 'Hav. M. Ali',
      totalQty: '410 Units',
      totalValue: '₹ 2,90,000',
      remarks: 'Awaiting lab chemical test certificate',
    },
    {
      id: 10,
      grnNo: 'GRN-2026-010',
      dateTime: '14 Sep 2026, 09:20',
      poNo: 'PO-2026-7711',
      supplier: 'Western Traders',
      vehicleNo: 'UP81 RT 5555',
      items: 14,
      status: 'Completed',
      statusClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      receivedBy: 'Nk. K. Tiwari',
      totalQty: '290 Units',
      totalValue: '₹ 2,15,000',
      remarks: 'Clean stock transfer to Ordnance Division C',
    },
  ])

  // New GRN form state
  const [newGrn, setNewGrn] = useState({
    poNo: '',
    supplier: '',
    vehicleNo: '',
    items: '',
    receivedBy: 'Nk. R. Singh',
    status: 'In Process',
    remarks: 'Received in good condition at Main Inward Bay',
  })

  // Toast notification trigger
  const triggerToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Filtered GRN list
  const filteredGrn = useMemo(() => {
    return grnList.filter((item) => {
      // Tab filter
      if (activeTab === 'pending' && item.status !== 'Pending') return false
      if (activeTab === 'in_process' && item.status !== 'In Process') return false
      if (activeTab === 'completed' && item.status !== 'Completed') return false
      if (activeTab === 'rejected' && item.status !== 'Rejected') return false

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        return (
          item.grnNo.toLowerCase().includes(q) ||
          item.poNo.toLowerCase().includes(q) ||
          item.supplier.toLowerCase().includes(q) ||
          item.vehicleNo.toLowerCase().includes(q) ||
          item.receivedBy.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [grnList, activeTab, searchQuery])

  // Create New GRN submit
  const handleCreateGrn = (e) => {
    e.preventDefault()
    if (!newGrn.poNo.trim() || !newGrn.supplier.trim()) {
      triggerToast('Please provide PO/Indent Number and Supplier Name!')
      return
    }

    const nextNum = grnList.length + 1
    const grnNoStr = `GRN-2026-${String(nextNum).padStart(3, '0')}`

    let sClass = 'bg-blue-100 text-blue-800 border-blue-200'
    if (newGrn.status === 'Completed') sClass = 'bg-emerald-100 text-emerald-800 border-emerald-200'
    if (newGrn.status === 'Pending') sClass = 'bg-amber-100 text-amber-800 border-amber-200'
    if (newGrn.status === 'Rejected') sClass = 'bg-red-100 text-red-800 border-red-200'

    const newRecord = {
      id: Date.now(),
      grnNo: grnNoStr,
      dateTime: '16 Sep 2026, 12:45',
      poNo: newGrn.poNo.trim().toUpperCase(),
      supplier: newGrn.supplier.trim(),
      vehicleNo: newGrn.vehicleNo.trim().toUpperCase() || 'DL01 AB 9999',
      items: Number(newGrn.items) || 10,
      status: newGrn.status,
      statusClass: sClass,
      receivedBy: newGrn.receivedBy,
      totalQty: `${Number(newGrn.items || 10) * 20} Units`,
      totalValue: '₹ 1,50,000',
      remarks: newGrn.remarks || 'Standard receiving recorded.',
    }

    setGrnList([newRecord, ...grnList])
    setSelectedGrn(newRecord)
    setShowAddModal(false)
    setNewGrn({
      poNo: '',
      supplier: '',
      vehicleNo: '',
      items: '',
      receivedBy: 'Nk. R. Singh',
      status: 'In Process',
      remarks: 'Received in good condition at Main Inward Bay',
    })
    triggerToast(`GRN ${grnNoStr} created successfully for ${newRecord.supplier}!`)
  }

  // Quick Status update
  const handleStatusUpdate = (id, newStatus) => {
    setGrnList(
      grnList.map((g) => {
        if (g.id === id) {
          let sClass = 'bg-emerald-100 text-emerald-800 border-emerald-200'
          if (newStatus === 'In Process') sClass = 'bg-blue-100 text-blue-800 border-blue-200'
          if (newStatus === 'Pending') sClass = 'bg-amber-100 text-amber-800 border-amber-200'
          if (newStatus === 'Rejected') sClass = 'bg-red-100 text-red-800 border-red-200'
          return { ...g, status: newStatus, statusClass: sClass }
        }
        return g
      })
    )
    setOpenActionMenuId(null)
    triggerToast(`GRN status updated to ${newStatus}`)
  }

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['GRN No', 'Date & Time', 'PO/Indent No', 'Supplier / Party', 'Vehicle No', 'Items', 'Status', 'Received By']
    const rows = grnList.map((g) => [
      g.grnNo,
      `"${g.dateTime}"`,
      g.poNo,
      `"${g.supplier}"`,
      g.vehicleNo,
      g.items,
      g.status,
      `"${g.receivedBy}"`,
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'Indian_Army_GRN_Register.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    triggerToast('GRN register exported to CSV successfully.')
  }

  // 7-day Bar Chart Data
  const chartDays = [
    { day: '10 Sep', completed: 8, pending: 4, rejected: 2 },
    { day: '11 Sep', completed: 11, pending: 5, rejected: 4 },
    { day: '12 Sep', completed: 14, pending: 7, rejected: 5 },
    { day: '13 Sep', completed: 16, pending: 6, rejected: 4 },
    { day: '14 Sep', completed: 18, pending: 8, rejected: 5 },
    { day: '15 Sep', completed: 19, pending: 9, rejected: 6 },
    { day: '16 Sep', completed: 17, pending: 8, rejected: 5 },
  ]

  // Top Suppliers
  const topSuppliers = [
    { name: 'Bharat Supply Co.', count: 28, max: 30 },
    { name: 'Army Stores Ltd.', count: 22, max: 30 },
    { name: 'National Supply', count: 18, max: 30 },
    { name: 'Defence Ordnance', count: 15, max: 30 },
    { name: 'Eastern Logistics', count: 12, max: 30 },
  ]

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
          {/* Isometric Goods Cube Icon */}
          <div className="w-12 h-12 rounded-xl bg-[#EBF5EA] border border-[#CDE5CA] flex items-center justify-center text-[#1E3A1E] shadow-xs shrink-0">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              <span>Goods Receiving (GRN)</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Record and manage incoming materials received at the warehouse.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="text-xs text-slate-400 flex items-center gap-1.5 font-medium mr-2">
            <Link to="/dashboard" className="hover:text-slate-700">Home</Link>
            <span>›</span>
            <span className="text-slate-500">Inward Operations</span>
            <span>›</span>
            <span className="text-slate-800 font-semibold">Goods Receiving (GRN)</span>
          </div>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="bg-[#1F331E] hover:bg-[#2A4428] text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shadow-xs transition cursor-pointer"
          >
            <span className="text-base leading-none font-black">+</span>
            <span>Create New GRN</span>
          </button>
        </div>
      </div>

      {/* 5 KPI Stat Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Card 1: Total GRN Today */}
        <div className="bg-white rounded-xl p-3.5 shadow-xs border border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Total GRN Today</p>
            <div className="flex items-baseline gap-1.5">
              <h3 className="text-2xl font-black text-slate-800 leading-tight">12</h3>
              <span className="text-[10px] font-bold text-emerald-600">↑ 20%</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">vs. previous day</p>
          </div>
        </div>

        {/* Card 2: Pending GRN */}
        <div className="bg-white rounded-xl p-3.5 shadow-xs border border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Pending GRN</p>
            <h3 className="text-2xl font-black text-slate-800 leading-tight">4</h3>
            <p className="text-[10px] text-slate-400 font-medium">Awaiting verification</p>
          </div>
        </div>

        {/* Card 3: Completed GRN */}
        <div className="bg-white rounded-xl p-3.5 shadow-xs border border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Completed GRN</p>
            <h3 className="text-2xl font-black text-slate-800 leading-tight">8</h3>
            <p className="text-[10px] text-slate-400 font-medium">Today</p>
          </div>
        </div>

        {/* Card 4: Rejected GRN */}
        <div className="bg-white rounded-xl p-3.5 shadow-xs border border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Rejected GRN</p>
            <h3 className="text-2xl font-black text-slate-800 leading-tight">1</h3>
            <p className="text-[10px] text-slate-400 font-medium">Quality / Mismatch</p>
          </div>
        </div>

        {/* Card 5: Total Suppliers */}
        <div className="bg-white rounded-xl p-3.5 shadow-xs border border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 17H5a2 2 0 01-2-2V7a2 2 0 012-2h10a2 2 0 012 2v2m-6 8h6m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0zm10-6h3.5a1.5 1.5 0 011.2.6L22 14v3a1 1 0 01-1 1h-2" />
            </svg>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Total Suppliers</p>
            <h3 className="text-2xl font-black text-slate-800 leading-tight">6</h3>
            <p className="text-[10px] text-slate-400 font-medium">Today</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Controls Bar */}
      <div className="bg-white rounded-xl p-3 shadow-xs border border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Left Filter Pill Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'all'
                ? 'bg-[#1E3A1E] text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            All GRN
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'pending'
                ? 'bg-[#1E3A1E] text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            Pending
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('in_process')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'in_process'
                ? 'bg-[#1E3A1E] text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            In Process
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'completed'
                ? 'bg-[#1E3A1E] text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            Completed
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('rejected')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'rejected'
                ? 'bg-[#1E3A1E] text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            Rejected
          </button>
        </div>

        {/* Right Search, Date Range & Filter Buttons */}
        <div className="flex items-center gap-2">
          {/* Date Range Picker */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-mono">
            <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <input
              type="text"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-40 bg-transparent text-xs font-medium text-slate-800 focus:outline-none"
            />
          </div>

          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <svg className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search GRN No., PO No., Supplier..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white"
            />
          </div>

          {/* Filter Button */}
          <button
            type="button"
            onClick={() => triggerToast('Filter modal activated.')}
            className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
          >
            <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span>Filter</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Section: GRN Register (Left) + Quick Actions & Today's Summary (Right) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: GRN Table (Span 9 / 12)                                      */}
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
              style={{ minWidth: '1280px' }}
            >
              <thead className="bg-slate-50/80 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-3 w-12 text-center whitespace-nowrap">#</th>
                  <th className="py-3.5 px-4 min-w-[130px] whitespace-nowrap">GRN No.</th>
                  <th className="py-3.5 px-4 min-w-[150px] whitespace-nowrap">Date & Time</th>
                  <th className="py-3.5 px-4 min-w-[140px] whitespace-nowrap">PO/Indent No.</th>
                  <th className="py-3.5 px-4 min-w-[180px] whitespace-nowrap">Supplier / Party</th>
                  <th className="py-3.5 px-4 min-w-[135px] whitespace-nowrap">Vehicle No.</th>
                  <th className="py-3.5 px-3 text-center min-w-[80px] whitespace-nowrap">Items</th>
                  <th className="py-3.5 px-4 text-center min-w-[120px] whitespace-nowrap">Status</th>
                  <th className="py-3.5 px-4 min-w-[140px] whitespace-nowrap">Received By</th>
                  <th className="py-3.5 px-3 text-center w-16 whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredGrn.map((row, idx) => {
                  const isSelected = selectedGrn?.id === row.id
                  return (
                    <tr
                      key={row.id}
                      onClick={() => setSelectedGrn(row)}
                      className={`hover:bg-emerald-50/50 cursor-pointer transition ${
                        isSelected ? 'bg-emerald-50/70 font-medium' : ''
                      }`}
                    >
                      <td className="py-3.5 px-3 text-center text-slate-400 font-bold text-[11px] whitespace-nowrap">
                        {idx + 1}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800 text-[11px] tracking-wide whitespace-nowrap">
                        {row.grnNo}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 text-xs whitespace-nowrap font-medium">
                        {row.dateTime}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-700 text-[11px] whitespace-nowrap">
                        {row.poNo}
                      </td>
                      <td className="py-3.5 px-4 text-slate-800 font-semibold whitespace-nowrap">
                        {row.supplier}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-600 text-[11px] whitespace-nowrap">
                        {row.vehicleNo}
                      </td>
                      <td className="py-3.5 px-3 text-center font-bold text-slate-700 whitespace-nowrap">
                        {row.items}
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className={`inline-block px-3 py-0.5 rounded-full text-[10px] font-bold border ${row.statusClass}`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium whitespace-nowrap">
                        {row.receivedBy}
                      </td>
                      <td className="py-3.5 px-3 text-center relative whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => setOpenActionMenuId(openActionMenuId === row.id ? null : row.id)}
                          className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 px-2.5 py-1 rounded-md text-xs font-bold transition cursor-pointer"
                          title="Options"
                        >
                          •••
                        </button>

                        {/* Action Dropdown Menu */}
                        {openActionMenuId === row.id && (
                          <div className="absolute right-3 top-10 w-48 bg-white border border-slate-200 rounded-lg shadow-xl z-20 py-1 text-left text-xs font-medium">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedGrn(row)
                                setShowPrintModal(true)
                                setOpenActionMenuId(null)
                              }}
                              className="w-full px-3 py-1.5 hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                            >
                              <FileText className="w-3.5 h-3.5 text-slate-500" />
                              <span>View / Print GRN Slip</span>
                            </button>
                            {row.status !== 'Completed' && (
                              <button
                                type="button"
                                onClick={() => handleStatusUpdate(row.id, 'Completed')}
                                className="w-full px-3 py-1.5 hover:bg-emerald-50 text-emerald-700 flex items-center gap-2"
                              >
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Mark as Completed</span>
                              </button>
                            )}
                            {row.status !== 'In Process' && (
                              <button
                                type="button"
                                onClick={() => handleStatusUpdate(row.id, 'In Process')}
                                className="w-full px-3 py-1.5 hover:bg-blue-50 text-blue-700 flex items-center gap-2"
                              >
                                <Zap className="w-3.5 h-3.5 text-blue-600" />
                                <span>Set to In Process</span>
                              </button>
                            )}
                            {row.status !== 'Rejected' && (
                              <button
                                type="button"
                                onClick={() => handleStatusUpdate(row.id, 'Rejected')}
                                className="w-full px-3 py-1.5 hover:bg-red-50 text-red-700 flex items-center gap-2"
                              >
                                <X className="w-3.5 h-3.5 text-red-600" />
                                <span>Reject GRN</span>
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer Bar */}
          <div className="px-4 py-2.5 bg-slate-50/80 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
            <span className="font-medium">
              Showing <strong className="text-slate-800 font-semibold">{filteredGrn.length}</strong> of{' '}
              <strong className="text-slate-800 font-semibold">{grnList.length}</strong> GRN records
            </span>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
              <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              <span>Scroll horizontally to view all fields</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: Quick Actions & Today's Summary (Span 3 / 12)               */}
        {/* ========================================================================= */}
        <div className="xl:col-span-3 space-y-4">
          {/* Card 1: Quick Actions */}
          <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200">
            <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100">
              <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
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
                <span>Create New GRN</span>
              </button>

              <button
                type="button"
                onClick={() => setShowScannerModal(true)}
                className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg py-2.5 px-3 text-left text-xs font-bold text-slate-700 flex items-center gap-2.5 transition cursor-pointer"
              >
                <svg className="w-4 h-4 text-slate-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
                <span>Scan QR / Barcode</span>
              </button>

              <button
                type="button"
                onClick={() => setShowImportModal(true)}
                className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg py-2.5 px-3 text-left text-xs font-bold text-slate-700 flex items-center gap-2.5 transition cursor-pointer"
              >
                <svg className="w-4 h-4 text-slate-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8m-5 5h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293h3.172a1 1 0 00.707-.293l2.414-2.414a1 1 0 01.707-.293H20" />
                </svg>
                <span>Import from PO / Indent</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerToast('GRN official template downloaded.')
                }}
                className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg py-2.5 px-3 text-left text-xs font-bold text-slate-700 flex items-center gap-2.5 transition cursor-pointer"
              >
                <svg className="w-4 h-4 text-slate-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Download GRN Template</span>
              </button>

              <button
                type="button"
                onClick={handleExportCSV}
                className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg py-2.5 px-3 text-left text-xs font-bold text-slate-700 flex items-center gap-2.5 transition cursor-pointer"
              >
                <svg className="w-4 h-4 text-slate-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Export GRN Report</span>
              </button>
            </div>
          </div>

          {/* Card 2: Today's Summary */}
          <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200">
            <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100">
              <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <h2 className="text-xs font-bold text-slate-800">Today's Summary</h2>
            </div>

            <div className="space-y-3">
              {/* Item 1: Total Items Received */}
              <div className="flex items-center gap-3 p-2 bg-slate-50/70 rounded-lg border border-slate-100">
                <div className="w-10 h-10 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-500">Total Items Received</p>
                  <h3 className="text-lg font-black text-slate-800 leading-tight">186</h3>
                </div>
              </div>

              {/* Item 2: Total Quantity */}
              <div className="flex items-center gap-3 p-2 bg-slate-50/70 rounded-lg border border-slate-100">
                <div className="w-10 h-10 rounded-lg bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-500">Total Quantity</p>
                  <h3 className="text-lg font-black text-slate-800 leading-tight">2,450 Units</h3>
                </div>
              </div>

              {/* Item 3: Total Value (₹) */}
              <div className="flex items-center gap-3 p-2 bg-slate-50/70 rounded-lg border border-slate-100">
                <div className="w-10 h-10 rounded-lg bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <span className="text-lg font-black leading-none">₹</span>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-500">Total Value (₹)</p>
                  <h3 className="text-lg font-black text-slate-800 leading-tight">18,75,430</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BOTTOM SECTION: 3 ANALYTICS & ACTIVITY CARDS                              */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: GRN Trend (Last 7 Days) */}
        <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
              <h3 className="text-xs font-bold text-slate-800">GRN Trend (Last 7 Days)</h3>
            </div>
            <div className="flex items-center gap-2.5 text-[10px] font-semibold text-slate-600">
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-emerald-700 rounded-xs"></span>
                <span>Completed</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-amber-400 rounded-xs"></span>
                <span>Pending</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-red-500 rounded-xs"></span>
                <span>Rejected</span>
              </div>
            </div>
          </div>

          {/* Bar Chart Area with Y-Axis */}
          <div className="h-44 flex items-end gap-2 pt-2 px-1">
            {/* Y-Axis Labels */}
            <div className="flex flex-col justify-between h-36 text-[9px] font-mono text-slate-400 pr-1 border-r border-slate-100">
              <span>20</span>
              <span>15</span>
              <span>10</span>
              <span>5</span>
              <span>0</span>
            </div>

            {/* Days Bars Container */}
            <div className="flex-1 flex items-end justify-between gap-1.5 h-full">
              {chartDays.map((bar, idx) => {
                const maxVal = 20
                const compH = `${(bar.completed / maxVal) * 100}%`
                const pendH = `${(bar.pending / maxVal) * 100}%`
                const rejH = `${(bar.rejected / maxVal) * 100}%`

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full gap-1">
                    <div className="w-full flex items-end justify-center gap-0.5 h-34">
                      {/* Completed (Green) */}
                      <div
                        style={{ height: compH }}
                        className="w-2 sm:w-2.5 bg-emerald-700 rounded-t-xs hover:opacity-90 transition-all"
                        title={`Completed: ${bar.completed}`}
                      ></div>
                      {/* Pending (Amber) */}
                      <div
                        style={{ height: pendH }}
                        className="w-2 sm:w-2.5 bg-amber-400 rounded-t-xs hover:opacity-90 transition-all"
                        title={`Pending: ${bar.pending}`}
                      ></div>
                      {/* Rejected (Red) */}
                      <div
                        style={{ height: rejH }}
                        className="w-2 sm:w-2.5 bg-red-500 rounded-t-xs hover:opacity-90 transition-all"
                        title={`Rejected: ${bar.rejected}`}
                      ></div>
                    </div>
                    <span className="text-[9px] font-medium text-slate-400 whitespace-nowrap">{bar.day}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Card 2: Top Suppliers (This Month) */}
        <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="text-xs font-bold text-slate-800">Top Suppliers (This Month)</h3>
            </div>
            <span className="text-[10px] font-bold text-slate-500">GRN Count</span>
          </div>

          <div className="space-y-3.5 pt-1">
            {topSuppliers.map((sup, idx) => {
              const pct = `${(sup.count / sup.max) * 100}%`
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-700 truncate">
                      {idx + 1}. {sup.name}
                    </span>
                    <strong className="text-slate-900 font-mono text-xs">{sup.count}</strong>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      style={{ width: pct }}
                      className="h-full bg-[#1E3A1E] rounded-full transition-all duration-500"
                    ></div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Card 3: Recent Activities */}
        <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-xs font-bold text-slate-800">Recent Activities</h3>
            </div>
            <button
              type="button"
              onClick={() => triggerToast('All activity logs view opened.')}
              className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <span>→</span>
            </button>
          </div>

          <div className="space-y-3 text-xs">
            {/* Activity 1 */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
                <div>
                  <p className="text-slate-800 font-semibold text-[11px] leading-tight">
                    GRN-2026-001 marked as Completed
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">16 Sep 2026, 09:45</p>
                </div>
              </div>
              <span className="text-[10.5px] font-medium text-slate-500 whitespace-nowrap">by Nk. R. Singh</span>
            </div>

            {/* Activity 2 */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0"></span>
                <div>
                  <p className="text-slate-800 font-semibold text-[11px] leading-tight">
                    GRN-2026-002 moved to Quality Check
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">16 Sep 2026, 10:12</p>
                </div>
              </div>
              <span className="text-[10.5px] font-medium text-slate-500 whitespace-nowrap">by Hav. P. Kumar</span>
            </div>

            {/* Activity 3 */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-slate-400 mt-1.5 shrink-0"></span>
                <div>
                  <p className="text-slate-800 font-semibold text-[11px] leading-tight">
                    GRN-2026-003 created
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">16 Sep 2026, 11:20</p>
                </div>
              </div>
              <span className="text-[10.5px] font-medium text-slate-500 whitespace-nowrap">by Cpl. A. Yadav</span>
            </div>

            {/* Activity 4 */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0"></span>
                <div>
                  <p className="text-slate-800 font-semibold text-[11px] leading-tight">
                    GRN-2026-006 rejected (Quality issue)
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">15 Sep 2026, 12:45</p>
                </div>
              </div>
              <span className="text-[10.5px] font-medium text-slate-500 whitespace-nowrap">by Lt. S. Chauhan</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: CREATE NEW GRN                                                     */}
      {/* ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#EBF5EA] text-[#1E3A1E] flex items-center justify-center font-black text-sm">
                  +
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Create Goods Receiving Note (GRN)</h3>
                  <p className="text-[10px] text-slate-500">Inward Ordnance & Supply Recording</p>
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

            <form onSubmit={handleCreateGrn} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    PO / Indent No. <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PO-2026-9812"
                    value={newGrn.poNo}
                    onChange={(e) => setNewGrn({ ...newGrn, poNo: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Supplier / Party Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bharat Electronics Ltd"
                    value={newGrn.supplier}
                    onChange={(e) => setNewGrn({ ...newGrn, supplier: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Vehicle Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. UP32 AB 1256"
                    value={newGrn.vehicleNo}
                    onChange={(e) => setNewGrn({ ...newGrn, vehicleNo: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Number of Items</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 15"
                    value={newGrn.items}
                    onChange={(e) => setNewGrn({ ...newGrn, items: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Received By</label>
                  <select
                    value={newGrn.receivedBy}
                    onChange={(e) => setNewGrn({ ...newGrn, receivedBy: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  >
                    <option value="Nk. R. Singh">Nk. R. Singh</option>
                    <option value="Hav. P. Kumar">Hav. P. Kumar</option>
                    <option value="Cpl. A. Yadav">Cpl. A. Yadav</option>
                    <option value="Nk. S. Mehta">Nk. S. Mehta</option>
                    <option value="Hav. D. Singh">Hav. D. Singh</option>
                    <option value="Lt. S. Chauhan">Lt. S. Chauhan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Initial Status</label>
                  <select
                    value={newGrn.status}
                    onChange={(e) => setNewGrn({ ...newGrn, status: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  >
                    <option value="In Process">In Process</option>
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Remarks & Location Bay</label>
                <textarea
                  rows="2"
                  placeholder="e.g. Unloaded at Inward Bay 3. Inspection seals matched."
                  value={newGrn.remarks}
                  onChange={(e) => setNewGrn({ ...newGrn, remarks: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600"
                ></textarea>
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
                  Generate GRN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: OFFICIAL MILITARY GRN VOUCHER / SLIP PRINT                         */}
      {/* ========================================================================= */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200">
              <div className="flex items-center gap-2">
                <img src="/logo.png" alt="Central Warehouse" className="h-9 w-auto object-contain" />
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Official Goods Receipt Note (GRN)</h3>
                  <p className="text-[10px] text-slate-500">Central Ordnance & Military Provision Depot</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 font-bold"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Printable GRN Sheet */}
            <div className="border-2 border-slate-800 p-5 rounded-xl bg-white space-y-3.5 shadow-md text-xs">
              {/* Top Banner */}
              <div className="flex items-center justify-between border-b-2 border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <img src="/logo.png" alt="Warehouse Emblem" className="h-14 w-auto object-contain" />
                  <div>
                    <h4 className="text-sm font-black tracking-wider text-slate-900 font-serif">CENTRAL WAREHOUSE LOGISTICS</h4>
                    <p className="text-[10px] text-slate-600 font-bold">FMCG SUPPLY CHAIN &amp; MATERIAL WING</p>
                    <p className="text-[9px] text-slate-500">Central Warehouse Logistics, India</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-block bg-[#1B3518] text-white px-3 py-1 rounded text-xs font-mono font-bold">
                    {selectedGrn.grnNo}
                  </span>
                  <p className="text-[10px] text-slate-500 mt-1 font-semibold">Status: <strong className="text-slate-800">{selectedGrn.status}</strong></p>
                </div>
              </div>

              {/* Title */}
              <div className="text-center py-1 bg-slate-100 rounded border border-slate-200">
                <h5 className="text-xs font-black tracking-widest text-slate-900 uppercase font-serif">
                  GOODS RECEIPT NOTE & STORE VOUCHER
                </h5>
              </div>

              {/* 2-Column Meta details */}
              <div className="grid grid-cols-2 gap-3 text-[10.5px] p-2.5 bg-slate-50 rounded border border-slate-200">
                <div className="space-y-1">
                  <p><span className="text-slate-500 font-semibold">PO / Indent Ref:</span> <strong className="font-mono text-slate-900">{selectedGrn.poNo}</strong></p>
                  <p><span className="text-slate-500 font-semibold">Supplier / Party:</span> <strong className="text-slate-900">{selectedGrn.supplier}</strong></p>
                  <p><span className="text-slate-500 font-semibold">Vehicle Transport No.:</span> <strong className="font-mono text-slate-900">{selectedGrn.vehicleNo}</strong></p>
                </div>
                <div className="space-y-1">
                  <p><span className="text-slate-500 font-semibold">Date of Receipt:</span> <strong className="text-slate-900">{selectedGrn.dateTime}</strong></p>
                  <p><span className="text-slate-500 font-semibold">Received Incharge:</span> <strong className="text-slate-900">{selectedGrn.receivedBy}</strong></p>
                  <p><span className="text-slate-500 font-semibold">Total Item Kinds:</span> <strong className="text-slate-900">{selectedGrn.items} Types</strong></p>
                </div>
              </div>

              {/* Material Items Table */}
              <div>
                <p className="text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">Receipt Line Item Manifest</p>
                <div className="border border-slate-200 rounded overflow-hidden">
                  <table className="w-full text-left text-[10px] divide-y divide-slate-200">
                    <thead className="bg-slate-100 font-bold text-slate-700">
                      <tr>
                        <th className="p-2 w-8 text-center">#</th>
                        <th className="p-2">Item Code</th>
                        <th className="p-2">Item Nomenclature</th>
                        <th className="p-2">Batch No.</th>
                        <th className="p-2 text-center">Accepted Qty</th>
                        <th className="p-2">Unit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(selectedGrn.materials || [
                        { code: 'ORD-7701', name: 'Standard Issue Combat Boots (Size 9)', qty: 150, unit: 'Pairs', batch: 'BTH-2026-081' },
                        { code: 'ORD-7704', name: 'Tactical Rucksacks 65L (Camouflage)', qty: 100, unit: 'Nos', batch: 'BTH-2026-084' },
                        { code: 'ORD-7712', name: 'High Altitude Winter Gloves', qty: 100, unit: 'Pairs', batch: 'BTH-2026-090' },
                      ]).map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2 text-center text-slate-400 font-mono font-bold">{idx + 1}</td>
                          <td className="p-2 font-mono text-slate-700">{item.code}</td>
                          <td className="p-2 font-semibold text-slate-900">{item.name}</td>
                          <td className="p-2 font-mono text-slate-600">{item.batch}</td>
                          <td className="p-2 text-center font-bold text-slate-900">{item.qty}</td>
                          <td className="p-2 text-slate-600">{item.unit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Remarks Box */}
              <div className="text-[10px] bg-slate-50 p-2 rounded border border-slate-200 text-slate-700">
                <strong>Inspector Remarks: </strong> {selectedGrn.remarks || 'Accepted after physical packaging, barcode scan, and quantity check.'}
              </div>

              {/* Authorized Signatures */}
              <div className="pt-3 grid grid-cols-3 gap-2 text-center text-[9px] border-t border-slate-200">
                <div>
                  <p className="text-slate-400">Received By</p>
                  <p className="font-bold text-slate-800 mt-2">{selectedGrn.receivedBy}</p>
                  <p className="text-[8px] text-slate-400">Storeman</p>
                </div>
                <div>
                  <p className="text-slate-400">Inspected By</p>
                  <p className="font-bold text-slate-800 mt-2">Major R. Singh</p>
                  <p className="text-[8px] text-slate-400">Quality Inspector</p>
                </div>
                <div>
                  <p className="text-slate-400">Cleared & Approved By</p>
                  <p className="font-bold text-slate-800 mt-2">Col. A. Sharma</p>
                  <p className="text-[8px] text-slate-400">Depot Officer</p>
                </div>
              </div>

              {/* Tricolor Tag */}
              <div className="pt-2 text-center border-t border-slate-100">
                <span className="text-[8px] font-extrabold text-slate-700 tracking-widest uppercase">
                  NATION FIRST | ALWAYS
                </span>
                <div className="w-14 h-1 flex rounded-xs overflow-hidden mx-auto mt-0.5">
                  <div className="w-1/3 bg-[#FF9933]"></div>
                  <div className="w-1/3 bg-white border-y border-slate-200"></div>
                  <div className="w-1/3 bg-[#138808]"></div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  window.print()
                  setShowPrintModal(false)
                }}
                className="bg-[#1F331E] hover:bg-[#2A4428] text-white px-5 py-2 rounded-lg text-xs font-bold shadow flex items-center gap-2 cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                <span>Print GRN Slip</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: QR / BARCODE SCANNER                                               */}
      {/* ========================================================================= */}
      {showScannerModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-2.5 border-slate-200">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
                <h3 className="text-sm font-bold text-slate-800">Scan Inward QR / Barcode</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowScannerModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Simulated Scanner Viewport */}
            <div className="relative bg-slate-900 rounded-lg h-56 flex flex-col items-center justify-center overflow-hidden border-2 border-dashed border-emerald-500/50">
              <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-0.5 bg-red-500 shadow-[0_0_12px_#ef4444] animate-pulse"></div>
              <div className="w-40 h-40 border-2 border-emerald-400 rounded-md relative flex items-center justify-center">
                <div className="w-32 h-32 border border-emerald-500/30 rounded flex flex-col items-center justify-center p-2 text-center">
                  <span className="text-[10px] text-emerald-400 font-mono font-bold tracking-widest uppercase">
                    AIM AT BARCODE
                  </span>
                  <span className="text-[9px] text-slate-400 mt-1">Optical Military Sensor Ready</span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 text-center font-medium">
              Point camera or handheld laser scanner at the parcel's shipping label.
            </p>

            <button
              type="button"
              onClick={() => {
                setShowScannerModal(false)
                triggerToast('Scanned Box: BTH-2026-081 (Combat Boots) - Verified!')
              }}
              className="w-full bg-[#1F331E] hover:bg-[#2A4428] text-white py-2 rounded-lg text-xs font-bold shadow transition cursor-pointer"
            >
              Simulate Successful Scan
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: IMPORT FROM PO / INDENT                                            */}
      {/* ========================================================================= */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-2.5 border-slate-200">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8m-5 5h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293h3.172a1 1 0 00.707-.293l2.414-2.414a1 1 0 01.707-.293H20" />
                </svg>
                <h3 className="text-sm font-bold text-slate-800">Import PO / Purchase Indent</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <p className="text-slate-600 font-medium">Select an approved Defence Purchase Order to auto-populate the GRN:</p>
              
              {[
                { po: 'PO-2026-9812', vendor: 'Bharat Electronics Ltd', items: 25, value: '₹ 8,40,000' },
                { po: 'IND-2026-5541', vendor: 'Ordnance Clothing Factory', items: 12, value: '₹ 3,95,000' },
                { po: 'PO-2026-6632', vendor: 'Tata Advanced Systems', items: 8, value: '₹ 14,50,000' },
              ].map((p, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setNewGrn({
                      ...newGrn,
                      poNo: p.po,
                      supplier: p.vendor,
                      items: p.items,
                    })
                    setShowImportModal(false)
                    setShowAddModal(true)
                    triggerToast(`Imported ${p.po} from ${p.vendor}`)
                  }}
                  className="p-3 bg-slate-50 hover:bg-emerald-50/70 border border-slate-200 rounded-lg flex items-center justify-between cursor-pointer transition"
                >
                  <div>
                    <span className="font-mono font-bold text-slate-800 text-xs">{p.po}</span>
                    <p className="text-[11px] text-slate-600 font-medium">{p.vendor}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-bold text-emerald-700">{p.items} Items</span>
                    <p className="text-[10px] text-slate-400 font-mono">{p.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="px-4 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
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
