
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, X, Printer, FileText, Download, RefreshCw, Zap } from 'lucide-react'

export default function GatePass() {
  const [activeTab, setActiveTab] = useState('create')
  const [showPrintModal, setShowPrintModal] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)

  // Form State — Pass Details
  const [passType, setPassType] = useState('Material Outward')
  const [dateTime, setDateTime] = useState(new Date().toISOString().slice(0, 16))
  const [purpose, setPurpose] = useState('Customer Delivery')
  const [referenceNo, setReferenceNo] = useState('')

  // Vehicle & Driver Details
  const [vehicleNo, setVehicleNo] = useState('')
  const [vehicleType, setVehicleType] = useState('Truck (6 Wheeler)')
  const [driverName, setDriverName] = useState('')
  const [driverContact, setDriverContact] = useState('')

  // Receiver / Destination
  const [receiverName, setReceiverName] = useState('')
  const [receiverAddress, setReceiverAddress] = useState('')
  const [additionalNotes, setAdditionalNotes] = useState('')

  // Material Items
  const [materialItems, setMaterialItems] = useState([
    { id: 1, productName: '', batchNo: '', qty: '', unit: 'Bags', remarks: '' },
  ])

  // Material Search filter
  const [searchFilter, setSearchFilter] = useState('')

  // Recent Gate Passes List
  const [recentPasses, setRecentPasses] = useState([
    {
      id: 'GP-2026-00125',
      dateTime: '16 Sep 2026, 09:12 AM',
      vehicleNo: 'UP32 AB 1256',
      vehicleType: 'Truck (6 Wheeler)',
      status: 'Issued',
      statusColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      passType: 'Material Outward',
      purpose: 'Customer Delivery',
      refNo: 'SO-2026-4587',
      driverName: 'Rajesh Yadav',
      driverContact: '9876543210',
      receiverName: 'ABC Retail Pvt. Ltd.',
      receiverAddress: 'Plot 12, Industrial Area, Lucknow - 226010',
      materials: [
        { productName: 'Rice (Basmati Grade 1)', batchNo: 'B102', qty: '50', unit: 'Bags' },
        { productName: 'Dal (Arhar)', batchNo: 'D110', qty: '30', unit: 'Bags' },
        { productName: 'Cooking Oil (Refined)', batchNo: 'O301', qty: '20', unit: 'Cans' },
        { productName: 'Biscuit (Glucose 100g)', batchNo: 'B205', qty: '100', unit: 'Cartons' },
      ],
      remarks: 'Monthly delivery — Sept 2026',
    },
    {
      id: 'GP-2026-00124',
      dateTime: '16 Sep 2026, 08:45 AM',
      vehicleNo: 'HR55 CD 7890',
      vehicleType: 'Heavy Transport (10 Wheeler)',
      status: 'Approved',
      statusColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      passType: 'Material Outward',
      purpose: 'Inter-Depot Transfer',
      refNo: 'TR-2026-8841',
      driverName: 'Harpreet Singh',
      driverContact: '9812345678',
      receiverName: 'Warehouse — Branch Store B',
      receiverAddress: 'Sector 7, Kanpur Road, UP',
      materials: [
        { productName: 'Sugar (Refined White)', batchNo: 'SG-88', qty: '80', unit: 'Bags' },
        { productName: 'Salt (Iodized)', batchNo: 'SL-11', qty: '120', unit: 'Packets' },
      ],
      remarks: 'Stock balancing transfer',
    },
    {
      id: 'GP-2026-00123',
      dateTime: '15 Sep 2026, 04:20 PM',
      vehicleNo: 'DL01 EF 4321',
      vehicleType: 'Light Transport Vehicle (LTV)',
      status: 'Approved',
      statusColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      passType: 'Material Outward',
      purpose: 'Return to Supplier',
      refNo: 'RN-2026-1029',
      driverName: 'Sunil Kumar',
      driverContact: '9845012345',
      receiverName: 'XYZ Suppliers Ltd.',
      receiverAddress: 'MG Road, Delhi - 110001',
      materials: [
        { productName: 'Tea Leaves (CTC)', batchNo: 'T-90', qty: '40', unit: 'Bags' },
      ],
      remarks: 'Batch T-90 rejected — lab test failed',
    },
    {
      id: 'GP-2026-00122',
      dateTime: '15 Sep 2026, 02:15 PM',
      vehicleNo: 'UP78 GH 9987',
      vehicleType: 'Truck (6 Wheeler)',
      status: 'Pending',
      statusColor: 'bg-amber-100 text-amber-800 border-amber-300',
      passType: 'Scrap / Disposal Outward',
      purpose: 'Scrap Disposal',
      refNo: 'SC-2026-4550',
      driverName: 'Amit Verma',
      driverContact: '9792001122',
      receiverName: 'Green Waste Recyclers',
      receiverAddress: 'Industrial Zone, Unnao',
      materials: [
        { productName: 'Expired Stock — Mixed', batchNo: 'EXP-04', qty: '250', unit: 'Cartons' },
      ],
      remarks: 'Awaiting supervisor approval before dispatch',
    },
    {
      id: 'GP-2026-00121',
      dateTime: '15 Sep 2026, 11:30 AM',
      vehicleNo: 'RJ14 JK 6543',
      vehicleType: 'Truck (6 Wheeler)',
      status: 'Cancelled',
      statusColor: 'bg-red-100 text-red-800 border-red-300',
      passType: 'Material Outward',
      purpose: 'Customer Delivery',
      refNo: 'SO-2026-4512',
      driverName: 'Vikram Choudhary',
      driverContact: '9414098765',
      receiverName: 'Sharma General Store',
      receiverAddress: 'Hazratganj, Lucknow',
      materials: [
        { productName: 'Canned Tomato Paste', batchNo: 'CM-09', qty: '15', unit: 'Cans' },
      ],
      remarks: 'Cancelled — vehicle breakdown outside gate',
    },
  ])

  // Selected Pass for Preview (defaults to first item)
  const [selectedPass, setSelectedPass] = useState(recentPasses[0])

  // Show Toast
  const triggerToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Add Item to Table
  const handleAddItem = () => {
    const newId = materialItems.length > 0 ? Math.max(...materialItems.map((m) => m.id)) + 1 : 1
    setMaterialItems([
      ...materialItems,
      { id: newId, productName: '', batchNo: '', qty: '', unit: 'Bags', remarks: '' },
    ])
  }

  // Remove Item
  const handleRemoveItem = (id) => {
    if (materialItems.length === 1) {
      triggerToast('At least one item is required in the gate pass!')
      return
    }
    setMaterialItems(materialItems.filter((m) => m.id !== id))
  }

  // Update Item
  const handleUpdateItem = (id, field, value) => {
    setMaterialItems(
      materialItems.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    )
  }

  // Reset Form
  const handleResetForm = () => {
    setPassType('Material Outward')
    setPurpose('Customer Delivery')
    setReferenceNo('')
    setVehicleNo('')
    setVehicleType('Truck (6 Wheeler)')
    setDriverName('')
    setDriverContact('')
    setReceiverName('')
    setReceiverAddress('')
    setAdditionalNotes('')
    setDateTime(new Date().toISOString().slice(0, 16))
    setMaterialItems([{ id: 1, productName: '', batchNo: '', qty: '', unit: 'Bags', remarks: '' }])
    triggerToast('Form has been reset.')
  }

  // Save & Generate Gate Pass
  const handleGeneratePass = () => {
    if (!vehicleNo.trim() || !driverName.trim()) {
      triggerToast('Vehicle Number and Driver Name are required!')
      return
    }

    const nextPassNum = recentPasses.length + 126
    const newPassId = `GP-2026-00${nextPassNum}`
    const formattedDate = new Date(dateTime).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true,
    })

    const newPassObj = {
      id: newPassId,
      dateTime: formattedDate,
      vehicleNo: vehicleNo.trim().toUpperCase(),
      vehicleType,
      status: 'Issued',
      statusColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      passType,
      purpose,
      refNo: referenceNo || `REF-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      driverName: driverName.trim(),
      driverContact: driverContact || '—',
      receiverName: receiverName || '—',
      receiverAddress: receiverAddress || '—',
      materials: materialItems.map((m) => ({
        productName: m.productName || 'General Item',
        batchNo: m.batchNo || '—',
        qty: m.qty || '0',
        unit: m.unit,
      })),
      remarks: additionalNotes || '—',
    }

    setRecentPasses([newPassObj, ...recentPasses])
    setSelectedPass(newPassObj)
    triggerToast(`Gate Pass ${newPassId} generated successfully!`)
  }

  // Filtered passes based on active tab
  const filteredPasses = recentPasses.filter((pass) => {
    if (activeTab === 'create' || activeTab === 'all') return true
    if (activeTab === 'issued') return pass.status === 'Issued'
    if (activeTab === 'approved') return pass.status === 'Approved'
    if (activeTab === 'pending') return pass.status === 'Pending'
    if (activeTab === 'cancelled') return pass.status === 'Cancelled'
    return true
  })

  // Filtered items in form table
  const displayedMaterialItems = materialItems.filter((m) => {
    if (!searchFilter.trim()) return true
    const q = searchFilter.toLowerCase()
    return (
      m.productName.toLowerCase().includes(q) ||
      m.batchNo.toLowerCase().includes(q) ||
      m.remarks.toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-6 pb-16">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#162214] border border-amber-400 text-amber-300 px-4 py-2.5 rounded-lg shadow-2xl flex items-center gap-2 text-xs font-medium animate-bounce">
          <svg className="w-4 h-4 text-amber-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 1: TOP BANNER, HEADER & PASS STATUS TABS                         */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        {/* Warehouse Banner */}
        <div className="relative rounded-xl overflow-hidden shadow-md border border-slate-200 bg-slate-900 h-28 sm:h-32">
          <img
            src="/border.png"
            alt="Warehouse Dispatch Operations"
            className="w-full h-full object-cover object-center opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-black/70"></div>
          <div className="absolute top-3 right-4 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="text-[10px] font-bold text-white tracking-widest uppercase">
              DISPATCH ACTIVE
            </span>
          </div>
        </div>

        {/* Page Title & Breadcrumb Header */}
        <div className="bg-white rounded-xl p-4 sm:p-5 shadow-xs border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-lg bg-[#EBF5EA] border border-[#CDE5CA] flex items-center justify-center text-[#1E3A1E] shadow-xs shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-800 tracking-tight">Gate Pass Management</h1>
              <p className="text-xs text-slate-500 font-medium">
                Generate, verify and manage outward gate passes for consignment dispatch and transport movement.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="text-xs text-slate-400 flex items-center gap-1.5 font-medium mr-2">
              <Link to="/dashboard" className="hover:text-slate-700">Home</Link>
              <span>›</span>
              <span className="text-slate-800 font-semibold">Gate Pass</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setActiveTab('create')
                handleResetForm()
              }}
              className="bg-[#1F331E] hover:bg-[#2A4428] text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shadow-xs transition cursor-pointer"
            >
              <span className="text-base leading-none">+</span>
              <span>Generate New Gate Pass</span>
            </button>
          </div>
        </div>

        {/* 5 Filter Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold">
          {[
            { id: 'create', label: 'Create Gate Pass', count: null },
            { id: 'issued', label: 'Issued Passes', count: recentPasses.filter(p => p.status === 'Issued').length },
            { id: 'approved', label: 'Approved Passes', count: recentPasses.filter(p => p.status === 'Approved').length },
            { id: 'pending', label: 'Pending Approval', count: recentPasses.filter(p => p.status === 'Pending').length },
            { id: 'cancelled', label: 'Cancelled Passes', count: recentPasses.filter(p => p.status === 'Cancelled').length },
          ].map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-lg transition whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-[#1E381E] text-white font-bold shadow-xs'
                    : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== null && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-emerald-900 text-amber-300' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2: GATE PASS CREATOR & LIVE PREVIEW (BALANCED 2-COLUMN LAYOUT)     */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ----------------------------------------------------------------------- */}
        {/* LEFT COLUMN: Input Form (Span 7 / 12) - Spacious & Non-Cramped           */}
        {/* ----------------------------------------------------------------------- */}
        <div className="lg:col-span-7 space-y-4">
          {/* Card 1: Gate Pass Details */}
          <div className="bg-white rounded-xl p-5 shadow-xs border border-slate-200">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <h2 className="text-sm font-bold text-slate-800">Gate Pass Details</h2>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>Gate Pass No.</span>
                <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md font-mono text-[11px] font-semibold border border-slate-200">
                  Auto Generate
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Pass Type */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Pass Type <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </div>
                  <select
                    value={passType}
                    onChange={(e) => setPassType(e.target.value)}
                    className="w-full bg-slate-50/70 border border-slate-200 rounded-lg pl-9 pr-8 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white"
                  >
                    <option value="Material Outward">Material Outward</option>
                    <option value="Material Inward">Material Inward</option>
                    <option value="Vehicle Movement Only">Vehicle Movement Only</option>
                    <option value="Disposal / Scrap Outward">Disposal / Scrap Outward</option>
                    <option value="Inter-Depot Transfer">Inter-Depot Transfer</option>
                  </select>
                </div>
              </div>

              {/* Date & Time */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Date &amp; Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={dateTime}
                  onChange={(e) => setDateTime(e.target.value)}
                  className="w-full bg-slate-50/70 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white"
                />
              </div>

              {/* Purpose */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Purpose <span className="text-red-500">*</span>
                </label>
                <select
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full bg-slate-50/70 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white"
                >
                  <option value="Customer Delivery">Customer Delivery</option>
                  <option value="Return to Supplier">Return to Supplier</option>
                  <option value="Inter-Depot Transfer">Inter-Depot Transfer</option>
                  <option value="Scrap Disposal">Scrap Disposal</option>
                  <option value="Loan / Returnable">Loan / Returnable</option>
                  <option value="Sample Dispatch">Sample Dispatch</option>
                  <option value="Routine Replenishment">Routine Replenishment</option>
                </select>
              </div>

              {/* Reference No. */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Reference No. (SO / PO / MRN)
                </label>
                <input
                  type="text"
                  placeholder="e.g. SO-2026-4587"
                  value={referenceNo}
                  onChange={(e) => setReferenceNo(e.target.value)}
                  className="w-full bg-slate-50/70 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-mono font-medium focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Vehicle & Driver Details */}
          <div className="bg-white rounded-xl p-5 shadow-xs border border-slate-200">
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
              <div className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-xs">
                2
              </div>
              <h2 className="text-sm font-bold text-slate-800">Vehicle & Driver Details</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Vehicle No */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Vehicle No. <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 17H5a2 2 0 01-2-2V7a2 2 0 012-2h10a2 2 0 012 2v2m-6 8h6m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. UP32 AB 1256"
                    value={vehicleNo}
                    onChange={(e) => setVehicleNo(e.target.value)}
                    className="w-full bg-slate-50/70 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-800 font-mono font-bold uppercase tracking-wider focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white"
                  />
                </div>
              </div>

              {/* Vehicle Type */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Vehicle Type
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                  </div>
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className="w-full bg-slate-50/70 border border-slate-200 rounded-lg pl-9 pr-8 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white"
                  >
                    <option value="Truck (6 Wheeler)">Truck (6 Wheeler)</option>
                    <option value="Heavy Transport (10 Wheeler)">Heavy Transport (10 Wheeler)</option>
                    <option value="Light Transport Vehicle (LTV)">Light Transport Vehicle (LTV)</option>
                    <option value="Tempo / Mini Truck">Tempo / Mini Truck</option>
                    <option value="Forklift / Internal Transporter">Forklift / Internal Transporter</option>
                    <option value="Two Wheeler / Bike">Two Wheeler / Bike</option>
                  </select>
                </div>
              </div>

              {/* Driver Name */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Driver Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Enter Driver Name"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    className="w-full bg-slate-50/70 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white"
                  />
                </div>
              </div>

              {/* Driver Contact No */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Driver Contact No.
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. 9876543210"
                    value={driverContact}
                    onChange={(e) => setDriverContact(e.target.value)}
                    className="w-full bg-slate-50/70 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Receiver / Destination */}
          <div className="bg-white rounded-xl p-5 shadow-xs border border-slate-200">
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
              <div className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-xs">
                3
              </div>
              <h2 className="text-sm font-bold text-slate-800">Receiver / Destination</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Receiver / Party Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. ABC Distributors Pvt. Ltd."
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                  className="w-full bg-slate-50/70 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Delivery Address
                </label>
                <input
                  type="text"
                  placeholder="Full delivery / consignee address"
                  value={receiverAddress}
                  onChange={(e) => setReceiverAddress(e.target.value)}
                  className="w-full bg-slate-50/70 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Card 4: Consignment Items */}
          <div className="bg-white rounded-xl p-5 shadow-xs border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-xs">
                  4
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-800">Consignment Items</h2>
                  <p className="text-[11px] text-slate-500 font-medium">Add products, quantities and batches to be dispatched under this pass.</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Filter products..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="w-40 sm:w-48 bg-slate-50 border border-slate-200 rounded-md pl-7 pr-2 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                  <svg className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="bg-[#1F331E] hover:bg-[#2A4428] text-white px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer shrink-0"
                >
                  <span className="text-sm leading-none">+</span>
                  <span>Add Item</span>
                </button>
              </div>
            </div>

            {/* Clean Non-Crushed Table with Proper Min-Widths */}
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs divide-y divide-slate-200">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3 w-8 text-center">#</th>
                    <th className="py-2.5 px-3 min-w-[170px]">Product Name</th>
                    <th className="py-2.5 px-3 min-w-[100px]">Batch No.</th>
                    <th className="py-2.5 px-3 min-w-[90px]">Qty</th>
                    <th className="py-2.5 px-3 min-w-[90px]">Unit</th>
                    <th className="py-2.5 px-3 min-w-[130px]">Remarks</th>
                    <th className="py-2.5 px-2.5 w-10 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {displayedMaterialItems.map((item, index) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-2.5 px-3 text-center font-bold text-slate-500">{index + 1}</td>
                      <td className="py-2.5 px-3">
                        <select
                          value={item.productName}
                          onChange={(e) => handleUpdateItem(item.id, 'productName', e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-600"
                        >
                          <option value="">Select Product</option>
                          <option value="Rice">Rice (Superior Grade)</option>
                          <option value="Dal">Dal (Arhar / Toor)</option>
                          <option value="Cooking Oil">Cooking Oil (Refined Mustard)</option>
                          <option value="Biscuits">Biscuits (High Energy Pack)</option>
                          <option value="Tea Leaves">Tea Leaves (Special CTC)</option>
                          <option value="Sugar">Sugar (Crystalline)</option>
                        </select>
                      </td>
                      <td className="py-2.5 px-3">
                        <input
                          type="text"
                          placeholder="Batch"
                          value={item.batchNo}
                          onChange={(e) => handleUpdateItem(item.id, 'batchNo', e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-600"
                        />
                      </td>
                      <td className="py-2.5 px-3">
                        <input
                          type="number"
                          placeholder="Qty"
                          value={item.qty}
                          onChange={(e) => handleUpdateItem(item.id, 'qty', e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-600"
                        />
                      </td>
                      <td className="py-2.5 px-3">
                        <select
                          value={item.unit}
                          onChange={(e) => handleUpdateItem(item.id, 'unit', e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                        >
                          <option value="Bags">Bags</option>
                          <option value="Packets">Packets</option>
                          <option value="Cans">Cans</option>
                          <option value="Boxes">Boxes</option>
                          <option value="Tins">Tins</option>
                          <option value="Kg">Kg</option>
                        </select>
                      </td>
                      <td className="py-2.5 px-3">
                        <input
                          type="text"
                          placeholder="Remarks"
                          value={item.remarks}
                          onChange={(e) => handleUpdateItem(item.id, 'remarks', e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                        />
                      </td>
                      <td className="py-2.5 px-2.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition cursor-pointer"
                          title="Delete Row"
                        >
                          <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Card 5: Remarks / Notes */}
          <div className="bg-white rounded-xl p-5 shadow-xs border border-slate-200">
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
              <div className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-xs">
                5
              </div>
              <h2 className="text-sm font-bold text-slate-800">Remarks &amp; Additional Notes</h2>
            </div>
            <textarea
              placeholder="Any special instructions, gate guard notes, or delivery conditions..."
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              rows={3}
              className="w-full bg-slate-50/70 border border-slate-200 rounded-lg px-3 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white resize-none"
            />
          </div>

          {/* Bottom Form Actions */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleResetForm}
              className="px-5 py-2.5 rounded-lg text-xs font-semibold text-slate-600 border border-slate-300 hover:bg-slate-50 transition cursor-pointer"
            >
              Reset Form
            </button>
            <button
              type="button"
              onClick={handleGeneratePass}
              className="bg-[#1F331E] hover:bg-[#2A4428] text-white font-bold text-xs px-6 py-2.5 rounded-lg shadow-sm flex items-center gap-2 transition cursor-pointer"
            >
              <span>Save &amp; Generate Gate Pass</span>
              <span className="text-sm">→</span>
            </button>
          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* RIGHT COLUMN: Actions, Preview & Approval Workflow (Span 5 / 12)          */}
        {/* ----------------------------------------------------------------------- */}
        <div className="lg:col-span-5 space-y-4">
          {/* Card: Quick Actions */}
          <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200">
            <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100">
              <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <h2 className="text-xs font-bold text-slate-800">Quick Actions</h2>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleResetForm}
                className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg p-2.5 text-left text-xs font-bold text-slate-700 flex items-center gap-2 transition cursor-pointer"
              >
                <span className="text-emerald-700 font-black text-sm">+</span>
                <span>New Gate Pass</span>
              </button>

              <button
                type="button"
                onClick={() => setShowPrintModal(true)}
                className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg p-2.5 text-left text-xs font-bold text-slate-700 flex items-center gap-2 transition cursor-pointer"
              >
                <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                <span>Print Pass</span>
              </button>

              <button
                type="button"
                onClick={() => triggerToast('Gate Pass PDF downloaded.')}
                className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg p-2.5 text-left text-xs font-bold text-slate-700 flex items-center gap-2 transition cursor-pointer"
              >
                <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Download PDF</span>
              </button>

              <button
                type="button"
                onClick={() => triggerToast('Exporting Gate Pass records...')}
                className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg p-2.5 text-left text-xs font-bold text-slate-700 flex items-center gap-2 transition cursor-pointer"
              >
                <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Export Records</span>
              </button>
            </div>
          </div>

          {/* Card: Gate Pass Preview (Full Comfort Width) */}
          <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h2 className="text-xs font-bold text-slate-800">Gate Pass Live Preview</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowPrintModal(true)}
                className="bg-[#1F331E] hover:bg-[#2A4428] text-white text-xs font-bold px-3 py-1.5 rounded-md flex items-center gap-1.5 shadow-xs transition cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                <span>Print Document</span>
              </button>
            </div>

            {/* Official Gate Pass Document Sheet */}
            <div className="bg-white border border-slate-300 rounded-lg p-4 text-xs text-slate-800 font-sans shadow-sm space-y-3">
              {/* Top Header */}
              <div className="flex items-start justify-between border-b pb-3 border-slate-200">
                <div className="flex flex-col items-center text-center">
                  <img src="/logo.png" alt="Warehouse Logo" className="h-12 w-auto object-contain" />
                </div>

                <div className="text-center pt-1">
                  <h3 className="text-base font-black tracking-widest text-slate-900 font-serif">
                    GATE PASS
                  </h3>
                  <p className="text-[9px] text-slate-500 font-medium tracking-wide">CENTRAL DISTRIBUTION DEPOT</p>
                </div>

                {/* High Res SVG QR Code */}
                <div className="flex flex-col items-end">
                  <div className="w-14 h-14 bg-white border border-slate-300 p-1 rounded shadow-xs">
                    <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900" fill="currentColor">
                      <rect x="0" y="0" width="30" height="30" />
                      <rect x="5" y="5" width="20" height="20" fill="white" />
                      <rect x="9" y="9" width="12" height="12" />
                      
                      <rect x="70" y="0" width="30" height="30" />
                      <rect x="75" y="5" width="20" height="20" fill="white" />
                      <rect x="79" y="9" width="12" height="12" />
                      
                      <rect x="0" y="70" width="30" height="30" />
                      <rect x="5" y="75" width="20" height="20" fill="white" />
                      <rect x="9" y="79" width="12" height="12" />

                      <rect x="36" y="8" width="6" height="14" />
                      <rect x="46" y="12" width="14" height="6" />
                      <rect x="40" y="24" width="8" height="8" />
                      <rect x="54" y="26" width="8" height="8" />

                      <rect x="8" y="38" width="14" height="6" />
                      <rect x="26" y="38" width="8" height="14" />
                      <rect x="14" y="48" width="8" height="12" />

                      <rect x="74" y="38" width="8" height="14" />
                      <rect x="86" y="44" width="8" height="8" />
                      <rect x="74" y="56" width="18" height="6" />

                      <rect x="38" y="38" width="24" height="24" />
                      <rect x="42" y="42" width="16" height="16" fill="white" />
                      <rect x="46" y="46" width="8" height="8" />

                      <rect x="38" y="70" width="12" height="8" />
                      <rect x="54" y="74" width="14" height="6" />
                      <rect x="42" y="84" width="24" height="8" />
                      <rect x="72" y="72" width="8" height="18" />
                      <rect x="84" y="76" width="12" height="12" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Meta details */}
              <div className="flex justify-between text-[10px] font-medium text-slate-600 pb-1 border-b border-slate-100">
                <span>Gate Pass No.: <strong className="text-slate-900 font-mono text-[11px]">{selectedPass.id}</strong></span>
                <span>Date: <strong className="text-slate-900">{selectedPass.dateTime}</strong></span>
              </div>

              {/* From / To 2-Column Grid */}
              <div className="grid grid-cols-2 gap-3 text-[10px] p-2.5 bg-slate-50/90 rounded border border-slate-200">
                <div>
                  <p className="font-bold text-slate-500 uppercase tracking-wider text-[9px]">From (Warehouse)</p>
                  <p className="font-bold text-slate-900 text-[11px]">Central Warehouse</p>
                  <p className="text-slate-500 text-[9px]">Main Store — Gate No. 1</p>
                </div>
                <div>
                  <p className="font-bold text-slate-500 uppercase tracking-wider text-[9px]">To (Receiver)</p>
                  <p className="font-bold text-slate-900 text-[11px]">{selectedPass.receiverName || '—'}</p>
                  <p className="text-slate-500 text-[9px]">{selectedPass.receiverAddress || '—'}</p>
                </div>
              </div>

              {/* Purpose & Reference */}
              <div className="grid grid-cols-2 gap-2 text-[10px] px-1">
                <div>
                  <span className="text-slate-500">Purpose: </span>
                  <strong className="text-slate-800">{selectedPass.purpose}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Reference No.: </span>
                  <strong className="text-slate-800 font-mono">{selectedPass.refNo}</strong>
                </div>
              </div>

              {/* Vehicle Details Box */}
              <div className="bg-slate-50/70 p-2.5 rounded border border-slate-200 space-y-1 text-[10px]">
                <p className="font-bold text-slate-700 text-[9px] uppercase tracking-wider">Vehicle &amp; Driver</p>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                  <p><span className="text-slate-500">Vehicle No.:</span> <strong className="font-mono">{selectedPass.vehicleNo}</strong></p>
                  <p><span className="text-slate-500">Type:</span> <strong>{selectedPass.vehicleType || '—'}</strong></p>
                  <p><span className="text-slate-500">Driver:</span> <strong>{selectedPass.driverName}</strong></p>
                  <p><span className="text-slate-500">Contact:</span> <strong>{selectedPass.driverContact}</strong></p>
                </div>
              </div>

              {/* Material Details Table */}
              <div>
                <p className="font-bold text-slate-700 text-[9px] uppercase tracking-wider mb-1">Consignment Items</p>
                <table className="w-full text-left text-[9.5px] border border-slate-200">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-1.5 w-6 text-center">#</th>
                      <th className="p-1.5">Product Name</th>
                      <th className="p-1.5">Batch</th>
                      <th className="p-1.5 text-center">Qty</th>
                      <th className="p-1.5">Unit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedPass.materials.map((m, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-1.5 text-center text-slate-400">{idx + 1}</td>
                        <td className="p-1.5 font-semibold text-slate-800">{m.productName}</td>
                        <td className="p-1.5 font-mono text-slate-600">{m.batchNo}</td>
                        <td className="p-1.5 text-center font-bold text-slate-900">{m.qty}</td>
                        <td className="p-1.5 text-slate-600">{m.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Remarks */}
              <div className="text-[9.5px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-200/60">
                <strong>Remarks: </strong> {selectedPass.remarks}
              </div>

              {/* Signatures */}
              <div className="pt-3 grid grid-cols-3 gap-2 text-center text-[9px] border-t border-slate-200">
                <div>
                  <p className="text-slate-400 text-[8px]">Prepared By</p>
                  <p className="font-bold text-slate-800 mt-2">Warehouse Clerk</p>
                </div>
                <div>
                  <p className="text-slate-400 text-[8px]">Verified By</p>
                  <p className="font-bold text-slate-800 mt-2">Store Incharge</p>
                </div>
                <div>
                  <p className="text-slate-400 text-[8px]">Authorised By</p>
                  <p className="font-bold text-slate-800 mt-2">Warehouse Officer</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 text-center">
                <p className="text-[8px] text-slate-400 italic">
                  System-generated document. Valid only with authorised signature or digital approval.
                </p>
              </div>
            </div>
          </div>

          {/* Card: Approval Workflow */}
          <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200">
            <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100">
              <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-xs font-bold text-slate-800">Approval Workflow</h2>
            </div>

            <div className="relative pl-6 space-y-3.5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              <div className="relative">
                <span className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <Check className="w-3 h-3" />
                </span>
                <p className="text-xs font-bold text-slate-800">Created by Warehouse Team</p>
                <p className="text-[10px] text-slate-400">16 Sep 2026, 10:20 AM</p>
              </div>

              <div className="relative">
                <span className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <Check className="w-3 h-3" />
                </span>
                <p className="text-xs font-bold text-slate-800">Verified by Store Incharge</p>
                <p className="text-[10px] text-slate-400">16 Sep 2026, 10:22 AM</p>
              </div>

              <div className="relative">
                <span className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-amber-50 border-2 border-amber-500 text-amber-600 flex items-center justify-center text-[9px] font-black">
                  •
                </span>
                <p className="text-xs font-bold text-slate-800">Approved by Officer</p>
                <p className="text-[10px] font-bold text-amber-600">Pending Digital Signature</p>
              </div>

              <div className="relative">
                <span className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-slate-100 border border-slate-300 text-slate-400 flex items-center justify-center text-[10px]">
                  +
                </span>
                <p className="text-xs font-medium text-slate-400">Gate Exit / Security Verification</p>
                <p className="text-[10px] text-slate-400">Pending</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 3: DEDICATED RECENT GATE PASSES & MOVEMENT REGISTER (FULL WIDTH)  */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-xl p-5 shadow-xs border border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">Recent Gate Passes & Movement Register</h2>
              <p className="text-[11px] text-slate-500 font-medium">
                Click on any pass to load its details into the Live Preview above.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Total Passes: {filteredPasses.length}</span>
            <button
              type="button"
              onClick={() => triggerToast('Exporting gate pass register to CSV...')}
              className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Export Register</span>
            </button>
          </div>
        </div>

        {/* Full Width Table - Generously spaced with zero squeezing */}
        <div 
          className="overflow-x-auto no-scrollbar scroll-smooth border border-slate-200 rounded-lg"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          <table 
            className="w-full text-left text-xs divide-y divide-slate-200 border-collapse table-nowrap"
            style={{ minWidth: '1100px' }}
          >
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-3 w-8 text-center">#</th>
                <th className="py-3 px-4 min-w-[130px]">Gate Pass No.</th>
                <th className="py-3 px-4 min-w-[150px]">Date & Time</th>
                <th className="py-3 px-4 min-w-[130px]">Vehicle No.</th>
                <th className="py-3 px-4 min-w-[130px]">Driver Name</th>
                <th className="py-3 px-4 min-w-[140px]">Purpose</th>
                <th className="py-3 px-4 min-w-[130px]">Reference No.</th>
                <th className="py-3 px-4 text-center min-w-[100px]">Status</th>
                <th className="py-3 px-4 text-center min-w-[100px]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredPasses.map((p, idx) => {
                const isSelected = selectedPass?.id === p.id
                return (
                  <tr
                    key={p.id}
                    onClick={() => {
                      setSelectedPass(p)
                      triggerToast(`Loaded ${p.id} into preview.`)
                    }}
                    className={`hover:bg-emerald-50/60 cursor-pointer transition ${
                      isSelected ? 'bg-emerald-50/90 font-medium' : ''
                    }`}
                  >
                    <td className="py-3 px-3 text-center text-slate-400 font-bold text-[11px]">{idx + 1}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      <span className="flex items-center gap-1.5">
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>}
                        {p.id}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">{p.dateTime}</td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-800 whitespace-nowrap">{p.vehicleNo}</td>
                    <td className="py-3 px-4 font-medium text-slate-700 whitespace-nowrap">{p.driverName}</td>
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">{p.purpose}</td>
                    <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">{p.refNo}</td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${p.statusColor}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedPass(p)
                          setShowPrintModal(true)
                        }}
                        className="bg-[#1F331E] hover:bg-[#2A4428] text-white px-2.5 py-1 rounded text-[11px] font-semibold transition"
                      >
                        Print
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 4: INSTRUCTIONS & SECURITY PROTOCOLS                              */}
      {/* ========================================================================= */}
      <div className="bg-[#FAF8F2] rounded-xl p-5 border border-amber-200/80 shadow-xs">
        <div className="flex items-center gap-2 mb-2 text-slate-800">
          <svg className="w-4 h-4 text-amber-700" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <h3 className="text-xs font-bold tracking-tight text-slate-800 uppercase">
            Official Outward Gate Pass Guidelines & Dispatch Protocols
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-[11px] text-slate-600 font-medium pt-1">
          <div className="flex items-start gap-2 bg-white/70 p-2.5 rounded-lg border border-amber-200/50">
            <span className="font-bold text-amber-800 shrink-0">1.</span>
            <span>Ensure all material items and batches are thoroughly verified before generating gate pass.</span>
          </div>
          <div className="flex items-start gap-2 bg-white/70 p-2.5 rounded-lg border border-amber-200/50">
            <span className="font-bold text-amber-800 shrink-0">2.</span>
            <span>Attach relevant invoice, delivery challan, and QA clearance documents with the vehicle file.</span>
          </div>
          <div className="flex items-start gap-2 bg-white/70 p-2.5 rounded-lg border border-amber-200/50">
            <span className="font-bold text-amber-800 shrink-0">3.</span>
            <span>Gate pass must be approved and digitally counter-signed by the designated Warehouse Officer.</span>
          </div>
          <div className="flex items-start gap-2 bg-white/70 p-2.5 rounded-lg border border-amber-200/50">
            <span className="font-bold text-amber-800 shrink-0">4.</span>
            <span>Present printed or digital QR pass at security gate for optical scan before boom barrier release.</span>
          </div>
          <div className="flex items-start gap-2 bg-white/70 p-2.5 rounded-lg border border-amber-200/50">
            <span className="font-bold text-amber-800 shrink-0">5.</span>
            <span>Retain issued copy in dispatch archives for statutory compliance and audit records.</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* HIGH RESOLUTION PRINT MODAL                                              */}
      {/* ========================================================================= */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200">
              <div className="flex items-center gap-2">
                <img src="/logo.png" alt="Warehouse Logo" className="h-8 w-auto object-contain" />
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Print Official Outward Gate Pass</h3>
                  <p className="text-[11px] text-slate-500">Central Warehouse Logistics — Dispatch Unit</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Printable Paper */}
            <div className="border border-slate-300 p-6 rounded-lg bg-white space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b-2 border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <img src="/logo.png" alt="Warehouse Logo" className="h-16 w-auto object-contain" />
                  <div>
                    <h2 className="text-sm font-black text-slate-900 tracking-wider">CENTRAL LOGISTICS &amp; DISTRIBUTION DEPOT</h2>
                    <p className="text-[10px] text-slate-500 font-semibold tracking-wide">CENTRAL WAREHOUSE LOGISTICS HUB</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block bg-[#1B3518] text-white px-3 py-1 rounded text-xs font-mono font-bold">
                    {selectedPass.id}
                  </span>
                  <p className="text-[10px] text-slate-500 mt-1">{selectedPass.dateTime}</p>
                </div>
              </div>

              <div className="text-center py-1.5 bg-slate-100 rounded">
                <h4 className="text-sm font-black tracking-widest text-slate-900 font-serif uppercase">
                  OFFICIAL OUTWARD GATE PASS
                </h4>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs border p-3 rounded border-slate-200">
                <div>
                  <p className="font-bold text-slate-500 uppercase text-[9px]">Dispatched From:</p>
                  <p className="font-bold text-slate-800">Central Warehouse — Main Store</p>
                  <p className="text-slate-600 text-[11px]">Gate No. 1, Warehouse Complex</p>
                </div>
                <div>
                  <p className="font-bold text-slate-500 uppercase text-[9px]">Delivered To:</p>
                  <p className="font-bold text-slate-800">{selectedPass.receiverName || '—'}</p>
                  <p className="text-slate-600 text-[11px]">{selectedPass.receiverAddress || '—'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded">
                <div>
                  <p className="text-slate-500 text-[10px]">Vehicle Number</p>
                  <p className="font-mono font-bold text-slate-900">{selectedPass.vehicleNo}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-[10px]">Vehicle Type</p>
                  <p className="font-bold text-slate-900">{selectedPass.vehicleType || '—'}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-[10px]">Driver Name</p>
                  <p className="font-bold text-slate-900">{selectedPass.driverName}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-[10px]">Driver Contact</p>
                  <p className="font-bold text-slate-900">{selectedPass.driverContact}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-[10px]">Purpose</p>
                  <p className="font-bold text-slate-900">{selectedPass.purpose}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-[10px]">Reference No.</p>
                  <p className="font-mono font-bold text-slate-900">{selectedPass.refNo}</p>
                </div>
              </div>

              {/* Items List */}
              <div>
                <h5 className="text-xs font-bold text-slate-800 mb-1 uppercase tracking-wider">Authorized Consignment</h5>
                <table className="w-full text-left text-xs border border-slate-200">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b">
                    <tr>
                      <th className="p-2 w-8 text-center">#</th>
                      <th className="p-2">Item Description</th>
                      <th className="p-2">Batch / Lot</th>
                      <th className="p-2 text-center">Quantity</th>
                      <th className="p-2">Unit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedPass.materials.map((m, idx) => (
                      <tr key={idx}>
                        <td className="p-2 text-center text-slate-400">{idx + 1}</td>
                        <td className="p-2 font-bold text-slate-800">{m.productName}</td>
                        <td className="p-2 font-mono text-slate-600">{m.batchNo}</td>
                        <td className="p-2 text-center font-bold text-slate-900">{m.qty}</td>
                        <td className="p-2 text-slate-600">{m.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Signatures */}
              <div className="pt-8 grid grid-cols-3 gap-4 text-center text-xs">
                <div className="border-t border-slate-400 pt-1">
                  <p className="font-bold text-slate-800">Warehouse Clerk</p>
                  <p className="text-[10px] text-slate-500">Prepared By</p>
                </div>
                <div className="border-t border-slate-400 pt-1">
                  <p className="font-bold text-slate-800">Store Incharge</p>
                  <p className="text-[10px] text-slate-500">Verified By</p>
                </div>
                <div className="border-t border-slate-400 pt-1">
                  <p className="font-bold text-slate-800">Warehouse Officer</p>
                  <p className="text-[10px] text-slate-500">Authorised By</p>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  window.print()
                  setShowPrintModal(false)
                }}
                className="bg-[#1F331E] hover:bg-[#2A4428] text-white px-5 py-2 rounded-lg text-xs font-bold shadow flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                <span>Print Document</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
