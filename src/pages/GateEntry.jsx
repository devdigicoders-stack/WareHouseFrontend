import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Truck,
  FileText,
  ClipboardList,
  Calendar,
  Package,
  Trash2,
  Check,
  Printer,
  ChevronDown,
  X,
  Search,
  ArrowUpRight,
  QrCode,
  LogOut,
  Clock,
  Shield,
  Plus,
  Warehouse,
} from 'lucide-react'

export default function GateEntry() {
  const [activeTab, setActiveTab] = useState('new') // 'new' | 'queue' | 'log'
  const [toastMessage, setToastMessage] = useState(null)

  const triggerToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // --- Form State (Streamlined & Simple for Gate Operator) ---
  const [vehicleNumber, setVehicleNumber] = useState('')
  const [vehicleType, setVehicleType] = useState('Heavy Commercial Truck')
  const [driverName, setDriverName] = useState('')
  const [driverContact, setDriverContact] = useState('')
  const [supplier, setSupplier] = useState('')
  const [challanNo, setChallanNo] = useState('')
  const [purpose, setPurpose] = useState('Goods Delivery (GRN)')
  const [assignedBay, setAssignedBay] = useState('Bay 2 (Dry Ration / Food)')
  const [inTime, setInTime] = useState('18 Sep 2026, 10:30 AM')
  const [remarks, setRemarks] = useState('')

  // Declared Packaging / Material Items (e.g. 100 Gatta Biscuit)
  const [materialItems, setMaterialItems] = useState([
    {
      id: 1,
      product: 'Biscuit (Glucose 100g)',
      packageQty: 100,
      packagingUnit: 'Gatta (Carton)',
      baseUnitEstimate: '600 Biscuits (6 pcs/gatta)',
      remarks: 'Primary shipment for Shade 3',
    },
  ])

  // --- Modal State for Viewing / Printing Gate Pass ---
  const [activePassModal, setActivePassModal] = useState(null)

  // --- Active Vehicles Inside Warehouse Queue ---
  const [activeVehicles, setActiveVehicles] = useState([
    {
      id: 'GE-2026-0041',
      vehicleNo: 'UP32 AB 1256',
      vehicleType: 'Heavy Commercial Truck',
      driver: 'Sukhwinder Singh',
      phone: '98112-34501',
      supplier: 'M/s Bharat Supply Corp',
      challanNo: 'CH-9912',
      itemsSummary: '100 Gatta (Biscuits)',
      inTime: '18 Sep 2026, 09:12 AM',
      bay: 'Bay 2 (Dry Ration / Food)',
      status: 'Unloading at Bay',
    },
    {
      id: 'GE-2026-0042',
      vehicleNo: 'HR55 CD 7890',
      vehicleType: 'Covered Container',
      driver: 'Manoj Yadav',
      phone: '94120-78123',
      supplier: 'M/s Defence Foods Ltd',
      challanNo: 'PO-2026-4587',
      itemsSummary: '200 Bags (Basmati Rice)',
      inTime: '18 Sep 2026, 09:45 AM',
      bay: 'Bay 1 (General Stores)',
      status: 'GRN In Process',
    },
    {
      id: 'GE-2026-0043',
      vehicleNo: 'DL01 EF 4321',
      vehicleType: 'Light Cargo Vehicle (LCV)',
      driver: 'Abdul Kalam',
      phone: '99201-44589',
      supplier: 'M/s Ordnance Stores Ltd',
      challanNo: 'ORD-5521',
      itemsSummary: '50 Boxes (Footwear)',
      inTime: '18 Sep 2026, 10:15 AM',
      bay: 'Bay 3 (Ammunition & Spares)',
      status: 'Waiting at Gate',
    },
  ])

  // --- Historical Gate Entries Log ---
  const [gateLog, setGateLog] = useState([
    {
      id: 'GE-2026-0041',
      vehicleNo: 'UP32 AB 1256',
      vehicleType: 'Heavy Commercial Truck',
      driver: 'Sukhwinder Singh',
      phone: '98112-34501',
      supplier: 'M/s Bharat Supply Corp',
      challanNo: 'CH-9912',
      itemsSummary: '100 Gatta (Biscuits)',
      inTime: '18 Sep 2026, 09:12 AM',
      outTime: '-',
      type: 'Inward',
      status: 'Inside Warehouse',
      bay: 'Bay 2',
    },
    {
      id: 'GE-2026-0042',
      vehicleNo: 'HR55 CD 7890',
      vehicleType: 'Covered Container',
      driver: 'Manoj Yadav',
      phone: '94120-78123',
      supplier: 'M/s Defence Foods Ltd',
      challanNo: 'PO-2026-4587',
      itemsSummary: '200 Bags (Basmati Rice)',
      inTime: '18 Sep 2026, 09:45 AM',
      outTime: '-',
      type: 'Inward',
      status: 'Inside Warehouse',
      bay: 'Bay 1',
    },
    {
      id: 'GE-2026-0043',
      vehicleNo: 'DL01 EF 4321',
      vehicleType: 'Light Cargo Vehicle (LCV)',
      driver: 'Abdul Kalam',
      phone: '99201-44589',
      supplier: 'M/s Ordnance Stores Ltd',
      challanNo: 'ORD-5521',
      itemsSummary: '50 Boxes (Footwear)',
      inTime: '18 Sep 2026, 10:15 AM',
      outTime: '-',
      type: 'Inward',
      status: 'Inside Warehouse',
      bay: 'Bay 3',
    },
    {
      id: 'GE-2026-0040',
      vehicleNo: 'UP78 GH 9987',
      vehicleType: 'Heavy Commercial Truck',
      driver: 'Ram Kumar',
      phone: '98711-22334',
      supplier: 'M/s Army Supply Corp',
      challanNo: 'CH-9844',
      itemsSummary: '150 Tins (Cooking Oil)',
      inTime: '18 Sep 2026, 07:30 AM',
      outTime: '18 Sep 2026, 09:05 AM',
      type: 'Outward',
      status: 'Gate Out / Cleared',
      bay: 'Bay 4',
    },
    {
      id: 'GE-2026-0039',
      vehicleNo: 'RJ14 JK 6543',
      vehicleType: 'Trailor (Multi-Axle)',
      driver: 'Kishan Singh',
      phone: '91234-56780',
      supplier: 'M/s National Logistics',
      challanNo: 'PO-2026-1189',
      itemsSummary: '400 Bags (Sugar Refined)',
      inTime: '17 Sep 2026, 16:20 PM',
      outTime: '17 Sep 2026, 18:40 PM',
      type: 'Outward',
      status: 'Gate Out / Cleared',
      bay: 'Bay 1',
    },
  ])

  // Search & Filter in Log Tab
  const [logSearch, setLogSearch] = useState('')
  const [logStatusFilter, setLogStatusFilter] = useState('All')

  const filteredGateLog = useMemo(() => {
    return gateLog.filter((item) => {
      if (logStatusFilter === 'Inside' && item.status !== 'Inside Warehouse') return false
      if (logStatusFilter === 'Cleared' && item.status !== 'Gate Out / Cleared') return false

      if (logSearch.trim()) {
        const q = logSearch.toLowerCase()
        return (
          item.id.toLowerCase().includes(q) ||
          item.vehicleNo.toLowerCase().includes(q) ||
          item.driver.toLowerCase().includes(q) ||
          item.supplier.toLowerCase().includes(q) ||
          item.challanNo.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [gateLog, logSearch, logStatusFilter])

  // --- Dynamic Item Handlers ---
  const handleAddItem = () => {
    setMaterialItems((prev) => [
      ...prev,
      {
        id: Date.now(),
        product: '',
        packageQty: '',
        packagingUnit: 'Gatta (Carton)',
        baseUnitEstimate: '',
        remarks: '',
      },
    ])
  }

  const handleRemoveItem = (id) => {
    if (materialItems.length === 1) return
    setMaterialItems((prev) => prev.filter((item) => item.id !== id))
  }

  const handleItemChange = (id, field, val) => {
    setMaterialItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item
        const updated = { ...item, [field]: val }

        // Helper: auto-calculate base unit estimate for common packaging units
        if (field === 'packageQty' || field === 'product' || field === 'packagingUnit') {
          const qty = parseInt(field === 'packageQty' ? val : item.packageQty) || 0
          const unit = field === 'packagingUnit' ? val : item.packagingUnit
          const prod = field === 'product' ? val : item.product

          if (unit.includes('Gatta') && prod.includes('Biscuit')) {
            updated.baseUnitEstimate = `${qty * 6} Biscuits (6 pcs/gatta)`
          } else if (unit.includes('Bags') && prod.includes('Rice')) {
            updated.baseUnitEstimate = `${qty * 50} Kg (50 kg/bag)`
          } else if (unit.includes('Tins') && prod.includes('Oil')) {
            updated.baseUnitEstimate = `${qty * 15} Litres (15 L/tin)`
          } else if (qty > 0) {
            updated.baseUnitEstimate = `${qty} ${unit} (Pending GRN verification)`
          }
        }
        return updated
      })
    )
  }

  // --- Reset Form ---
  const handleReset = () => {
    setVehicleNumber('')
    setVehicleType('Heavy Commercial Truck')
    setDriverName('')
    setDriverContact('')
    setSupplier('')
    setChallanNo('')
    setPurpose('Goods Delivery (GRN)')
    setAssignedBay('Bay 2 (Dry Ration / Food)')
    setRemarks('')
    setMaterialItems([
      {
        id: Date.now(),
        product: 'Biscuit (Glucose 100g)',
        packageQty: 100,
        packagingUnit: 'Gatta (Carton)',
        baseUnitEstimate: '600 Biscuits (6 pcs/gatta)',
        remarks: '',
      },
    ])
  }

  // --- Form Submit: Register Inward Gate Pass ---
  const handleSubmit = (e) => {
    e.preventDefault()

    if (!vehicleNumber.trim()) {
      triggerToast('Please enter a valid vehicle number.')
      return
    }
    if (!driverName.trim()) {
      triggerToast('Please enter the driver name.')
      return
    }

    const nextTokenNum = 44 + (gateLog.length - 5)
    const newPassNumber = `GE-2026-00${nextTokenNum}`
    const summaryText = materialItems
      .map((m) => `${m.packageQty || 0} ${m.packagingUnit} ${m.product ? `(${m.product.split(' ')[0]})` : ''}`)
      .join(', ')

    const newVehicleRecord = {
      id: newPassNumber,
      vehicleNo: vehicleNumber.toUpperCase().trim(),
      vehicleType,
      driver: driverName.trim(),
      phone: driverContact.trim() || 'N/A',
      supplier: supplier || 'M/s Army Stores Depot',
      challanNo: challanNo.trim() || 'N/A',
      itemsSummary: summaryText || 'General Consignment',
      inTime,
      outTime: '-',
      bay: assignedBay,
      status: 'Unloading at Bay',
      type: 'Inward',
      items: materialItems,
      remarks,
    }

    // Add to Active Bay Queue & Log
    setActiveVehicles([newVehicleRecord, ...activeVehicles])
    setGateLog([
      { ...newVehicleRecord, status: 'Inside Warehouse' },
      ...gateLog,
    ])

    // Open Printable Gate Pass Modal
    setActivePassModal(newVehicleRecord)
    triggerToast(`Gate Entry ${newPassNumber} registered successfully!`)

    // Reset Form for next incoming truck
    handleReset()
  }

  // --- Gate Outward Pass Clearance ---
  const handleGateOut = (vehicleId) => {
    const target = activeVehicles.find((v) => v.id === vehicleId)
    if (!target) return

    const currentTime = '18 Sep 2026, 11:15 AM'

    // Remove from active queue
    setActiveVehicles((prev) => prev.filter((v) => v.id !== vehicleId))

    // Update in gate log
    setGateLog((prev) =>
      prev.map((entry) =>
        entry.id === vehicleId
          ? {
              ...entry,
              status: 'Gate Out / Cleared',
              outTime: currentTime,
            }
          : entry
      )
    )

    triggerToast(`Truck ${target.vehicleNo} cleared for Exit (Gate Out complete).`)
  }

  return (
    <div className="space-y-4 max-w-[1720px] mx-auto pb-10 select-none">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#142312] text-white px-4 py-3 rounded-xl shadow-2xl border border-emerald-500/40 flex items-center gap-3 animate-fade-in text-xs font-semibold">
          <div className="w-6 h-6 rounded-full bg-emerald-600/30 text-emerald-400 flex items-center justify-center">
            <Check className="w-4 h-4" />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Military Depot Hero Header Banner */}
      <div
        className="relative rounded-2xl overflow-hidden shadow-xs border border-slate-300/80 bg-cover bg-center min-h-[90px] p-5 flex items-center justify-between"
        style={{
          backgroundImage: "url('/border.png')",
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-black/20 pointer-events-none"></div>

        <div className="relative z-10 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#283822] text-amber-300 flex items-center justify-center shadow-md">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Main Gate Inward &amp; Clearance</span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                Gate 01 Operational
              </span>
            </h2>
            <p className="text-xs text-slate-700 font-semibold">
              Step 2 in Warehouse Flow: Truck Check-In, Inward Gate Pass &amp; Unloading Bay Assignment
            </p>
          </div>
        </div>

        <div className="relative z-10 text-right shrink-0 hidden sm:block">
          <h3 className="text-xs font-black tracking-[0.25em] text-white drop-shadow-md uppercase">
            NATION FIRST
          </h3>
          <p className="text-[9px] font-extrabold tracking-[0.3em] text-amber-300 drop-shadow-md uppercase mt-0.5">
            ── ALWAYS ──
          </p>
        </div>
      </div>

      {/* 2. KPI Summary Bar (Real-Time Gate Stats) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Trucks Inside</p>
            <p className="text-xl font-extrabold text-slate-900 mt-0.5">{activeVehicles.length}</p>
            <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
              <Clock className="w-3 h-3" /> Currently in Depots
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Warehouse className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Today&apos;s Inward</p>
            <p className="text-xl font-extrabold text-[#283822] mt-0.5">{gateLog.length}</p>
            <p className="text-[10px] text-slate-500 font-medium mt-0.5">Total Vehicles Entered</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
            <Truck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">At Unloading Bay</p>
            <p className="text-xl font-extrabold text-amber-700 mt-0.5">
              {activeVehicles.filter((v) => v.status.includes('Unloading') || v.status.includes('GRN')).length}
            </p>
            <p className="text-[10px] text-amber-600 font-semibold mt-0.5">Awaiting GRN / Stacking</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Gate Out Cleared</p>
            <p className="text-xl font-extrabold text-slate-700 mt-0.5">
              {gateLog.filter((v) => v.status === 'Gate Out / Cleared').length}
            </p>
            <p className="text-[10px] text-slate-500 font-medium mt-0.5">Exited with Outward Pass</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
            <LogOut className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Navigation Tabs Bar */}
      <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-fit text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('new')}
            className={`px-4 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'new'
                ? 'bg-[#283822] text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Gate Entry (Inward)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('queue')}
            className={`px-4 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'queue'
                ? 'bg-[#283822] text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Trucks Inside Depot</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-200 text-amber-900 font-bold">
              {activeVehicles.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('log')}
            className={`px-4 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'log'
                ? 'bg-[#283822] text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5" />
            <span>Daily Gate Register (Log)</span>
          </button>
        </div>

        {/* Quick Link to Next Step (GRN / Goods Receiving) */}
        <div className="flex items-center gap-2">
          <Link
            to="/goods-receiving"
            className="px-3.5 py-2 rounded-lg border border-slate-300 hover:border-emerald-600 hover:text-emerald-800 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <span>Proceed to Step 3 (GRN)</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: NEW GATE ENTRY FORM                                */}
      {/* ========================================================= */}
      {activeTab === 'new' && (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left 8 Cols: Form Fields */}
          <div className="lg:col-span-8 space-y-4">
            {/* Section 1: Vehicle & Driver */}
            <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-700" />
                  <span>1. Vehicle &amp; Driver Details</span>
                </h3>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>Entry Time:</span>
                  <input
                    type="text"
                    value={inTime}
                    onChange={(e) => setInTime(e.target.value)}
                    className="w-36 bg-transparent font-semibold text-slate-800 focus:outline-none border-b border-dashed border-slate-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {/* Vehicle Number */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Vehicle Registration No. <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative flex">
                    <span className="inline-flex items-center px-2 rounded-l-lg border border-r-0 border-slate-300 bg-slate-100 text-[10px] font-black text-blue-900 select-none">
                      IND
                    </span>
                    <input
                      type="text"
                      value={vehicleNumber}
                      onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                      placeholder="e.g. RJ14 GA 4589"
                      required
                      className="w-full pl-2.5 pr-2 py-2 rounded-r-lg border border-slate-300 text-xs font-bold uppercase text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-[#283822]"
                    />
                  </div>
                </div>

                {/* Vehicle Type */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Vehicle Type <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={vehicleType}
                      onChange={(e) => setVehicleType(e.target.value)}
                      className="w-full pl-3 pr-7 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-[#283822] appearance-none cursor-pointer"
                    >
                      <option value="Heavy Commercial Truck">Heavy Commercial Truck</option>
                      <option value="Covered Container">Covered Container</option>
                      <option value="Light Cargo Vehicle (LCV)">Light Cargo Vehicle (LCV)</option>
                      <option value="Trailor (Multi-Axle)">Trailor (Multi-Axle)</option>
                      <option value="Tanker (Fuel/Liquid)">Tanker (Fuel/Liquid)</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-3 pointer-events-none text-slate-400" />
                  </div>
                </div>

                {/* Driver Name */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Driver Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    placeholder="Enter driver name"
                    required
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#283822]"
                  />
                </div>

                {/* Driver Contact Phone */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Driver Mobile Contact <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={driverContact}
                    onChange={(e) => setDriverContact(e.target.value)}
                    placeholder="e.g. 98765 43210"
                    required
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#283822]"
                  />
                </div>

                {/* Purpose of Entry */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Purpose of Entry <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      className="w-full pl-3 pr-7 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-[#283822] appearance-none cursor-pointer"
                    >
                      <option value="Goods Delivery (GRN)">Goods Delivery (GRN Inward)</option>
                      <option value="Quality / Lab Testing Sample">Quality / Lab Sample</option>
                      <option value="Return / Replaced Stock">Return / Replaced Stock</option>
                      <option value="Maintenance / Empty Exit">Maintenance / Transfer</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-3 pointer-events-none text-slate-400" />
                  </div>
                </div>

                {/* Unloading Bay Assignment */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Assign Unloading Bay <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={assignedBay}
                      onChange={(e) => setAssignedBay(e.target.value)}
                      className="w-full pl-3 pr-7 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-[#283822] appearance-none cursor-pointer font-medium"
                    >
                      <option value="Bay 1 (General Stores)">Bay 1 (General Stores)</option>
                      <option value="Bay 2 (Dry Ration / Food)">Bay 2 (Dry Ration / Food - Shade 3)</option>
                      <option value="Bay 3 (Ammunition & Spares)">Bay 3 (Ammunition &amp; Spares - Shade 1)</option>
                      <option value="Bay 4 (Bulk Storage)">Bay 4 (Bulk Storage - Shade 6)</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-3 pointer-events-none text-slate-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Supplier & Document Reference (Critical for Step 3 GRN) */}
            <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2.5">
                <FileText className="w-4 h-4 text-emerald-700" />
                <span>2. Supplier &amp; Document Reference</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Supplier / Vendor Name */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Supplier / Vendor / Party Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={supplier}
                      onChange={(e) => setSupplier(e.target.value)}
                      required
                      className="w-full pl-3 pr-7 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-[#283822] appearance-none cursor-pointer"
                    >
                      <option value="">Select Registered Supplier</option>
                      <option value="M/s Bharat Supply Corp">M/s Bharat Supply Corp</option>
                      <option value="M/s Defence Foods Ltd">M/s Defence Foods Ltd</option>
                      <option value="M/s Ordnance Factory Board">M/s Ordnance Factory Board</option>
                      <option value="M/s Army Stores Depot">M/s Army Stores Depot</option>
                      <option value="M/s National Logistics">M/s National Logistics</option>
                      <option value="M/s Reliance Logistics & Ration">M/s Reliance Logistics &amp; Ration</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-3 pointer-events-none text-slate-400" />
                  </div>
                </div>

                {/* PO / Challan / Invoice Reference */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Challan / PO / Invoice Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={challanNo}
                    onChange={(e) => setChallanNo(e.target.value.toUpperCase())}
                    placeholder="e.g. CH-2026-9912 or PO-4587"
                    required
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#283822]"
                  />
                  <span className="text-[10px] text-slate-500">Required by GRN team to match order</span>
                </div>
              </div>
            </div>

            {/* Section 3: Material & Declared Packaging (Counted at Gate) */}
            <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Package className="w-4 h-4 text-emerald-700" />
                    <span>3. Declared Packaging / Material Inward</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Gate records physical packaging (e.g. Gattas / Bags). Base inventory units will be verified in Step 3 (GRN).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-3 py-1.5 rounded-lg bg-[#283822] hover:bg-[#1f2c1a] text-white text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Line Item</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[650px]">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 text-[10px] uppercase tracking-wider font-bold">
                      <th className="py-3 px-3 w-10">#</th>
                      <th className="py-3 px-3 min-w-[180px]">Product / Material</th>
                      <th className="py-3 px-3 w-32">Declared Qty</th>
                      <th className="py-3 px-3 w-40">Packaging Unit</th>
                      <th className="py-3 px-3 min-w-[160px]">Estimated Base Units</th>
                      <th className="py-3 px-3 min-w-[130px]">Remarks / Note</th>
                      <th className="py-3 px-3 w-10 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {materialItems.map((item, index) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-3 text-slate-400 font-mono text-[11px]">{index + 1}</td>
                        <td className="py-3.5 px-3">
                          <select
                            value={item.product}
                            onChange={(e) => handleItemChange(item.id, 'product', e.target.value)}
                            required
                            className="w-full px-2 py-1.5 rounded-md border border-slate-300 text-xs bg-white text-slate-800"
                          >
                            <option value="">Select Material</option>
                            <option value="Biscuit (Glucose 100g)">Biscuit (Glucose 100g)</option>
                            <option value="Rice (Basmati Grade 1)">Rice (Basmati Grade 1)</option>
                            <option value="Cooking Oil (Refined)">Cooking Oil (Refined 15L)</option>
                            <option value="Dal (Arhar / Toor)">Dal (Arhar / Toor)</option>
                            <option value="Sugar (Refined)">Sugar (Refined White)</option>
                            <option value="Standard Combat Boots">Standard Combat Boots</option>
                            <option value="7.62mm Ammunition Box">7.62mm Ammunition Box</option>
                          </select>
                        </td>
                        <td className="py-3.5 px-3">
                          <input
                            type="number"
                            min="1"
                            value={item.packageQty}
                            onChange={(e) => handleItemChange(item.id, 'packageQty', e.target.value)}
                            placeholder="e.g. 100"
                            required
                            className="w-full px-2 py-1.5 rounded-md border border-slate-300 text-xs text-slate-900 font-bold"
                          />
                        </td>
                        <td className="py-3.5 px-3">
                          <select
                            value={item.packagingUnit}
                            onChange={(e) => handleItemChange(item.id, 'packagingUnit', e.target.value)}
                            className="w-full px-2 py-1.5 rounded-md border border-slate-300 text-xs bg-white text-slate-800"
                          >
                            <option value="Gatta (Carton)">Gatta (Carton)</option>
                            <option value="Bags (50 Kg)">Bags (50 Kg)</option>
                            <option value="Tins (15 Ltr)">Tins (15 Ltr)</option>
                            <option value="Boxes / Crates">Boxes / Crates</option>
                            <option value="Individual Pieces">Individual Pieces</option>
                          </select>
                        </td>
                        <td className="py-3.5 px-3">
                          <span className="text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2 py-1.5 rounded border border-emerald-200 block truncate">
                            {item.baseUnitEstimate || 'Calculated in GRN'}
                          </span>
                        </td>
                        <td className="py-3.5 px-3">
                          <input
                            type="text"
                            value={item.remarks}
                            onChange={(e) => handleItemChange(item.id, 'remarks', e.target.value)}
                            placeholder="e.g. Shade 3"
                            className="w-full px-2 py-1.5 rounded-md border border-slate-300 text-xs text-slate-700"
                          />
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={materialItems.length === 1}
                            className="text-slate-400 hover:text-rose-500 disabled:opacity-30 cursor-pointer p-1.5 rounded hover:bg-rose-50 transition-colors"
                            title="Remove row"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* General Remarks & Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Optional gate note or security remarks..."
                className="px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 sm:w-1/2 focus:outline-none focus:ring-1 focus:ring-[#283822]"
              />

              <div className="flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer shadow-xs"
                >
                  Clear Form
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-lg bg-[#283822] hover:bg-[#1e2b19] text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md transition-all"
                >
                  <Printer className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Register Inward &amp; Print Pass</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right 4 Cols: Quick Operator Help & Recent Inward Badges */}
          <div className="lg:col-span-4 space-y-4">
            {/* Quick Flow Reference Card */}
            <div className="bg-[#182815] text-white rounded-xl p-4 border border-[#2d4727] shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <Shield className="w-4 h-4" />
                <span>Gate Inward Protocol</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                Every arriving truck is assigned a unique <strong className="text-white">Gate Pass Token</strong>. The driver carries this slip to the unloading bay where the <strong className="text-emerald-300">GRN team</strong> conducts physical verification and piece conversion.
              </p>
              <div className="bg-[#121f10] p-3 rounded-lg border border-emerald-900/50 space-y-1.5 text-[11px]">
                <div className="flex items-center gap-2 text-slate-300">
                  <span className="w-4 h-4 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[9px] font-bold">1</span>
                  <span>Vehicle enters ➔ Register Gate Inward</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <span className="w-4 h-4 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[9px] font-bold">2</span>
                  <span>Driver proceeds to assigned Bay</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <span className="w-4 h-4 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[9px] font-bold">3</span>
                  <span>GRN team unpacks to minimum base units</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <span className="w-4 h-4 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[9px] font-bold">4</span>
                  <span>After unload ➔ Issue Exit Gate Outward Pass</span>
                </div>
              </div>
            </div>

            {/* Quick Live Preview of Vehicles Inside */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Currently at Bays ({activeVehicles.length})</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setActiveTab('queue')}
                  className="text-[10px] font-bold text-emerald-800 hover:underline cursor-pointer"
                >
                  Manage All →
                </button>
              </div>

              <div className="space-y-2">
                {activeVehicles.slice(0, 3).map((truck) => (
                  <div
                    key={truck.id}
                    className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-xs text-slate-900">{truck.vehicleNo}</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 font-semibold">
                          {truck.bay.split(' ')[0]}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">{truck.itemsSummary}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 block">
                        {truck.status}
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono mt-0.5 block">{truck.inTime.split(',')[1]}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </form>
      )}

      {/* ========================================================= */}
      {/* TAB 2: TRUCKS INSIDE DEPOT (LIVE BAY QUEUE)               */}
      {/* ========================================================= */}
      {activeTab === 'queue' && (
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-700" />
                <span>Live Trucks Inside Warehouse Premises</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Vehicles currently parked, unloading material at bays, or undergoing GRN inspection.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
              Active Count: {activeVehicles.length} Vehicles
            </span>
          </div>

          {activeVehicles.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <Truck className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="font-semibold">No vehicles currently inside the premises.</p>
              <button
                onClick={() => setActiveTab('new')}
                className="mt-3 px-4 py-2 bg-[#283822] text-white rounded-lg text-xs font-bold"
              >
                Register New Gate Inward
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[950px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] uppercase tracking-wider font-bold">
                    <th className="py-3 px-4">Pass Token</th>
                    <th className="py-3 px-4">Vehicle Reg.</th>
                    <th className="py-3 px-4">Driver &amp; Phone</th>
                    <th className="py-3 px-4">Supplier / Challan</th>
                    <th className="py-3 px-4">Assigned Bay</th>
                    <th className="py-3 px-4">Declared Material</th>
                    <th className="py-3 px-4">In Time</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeVehicles.map((vehicle) => (
                    <tr key={vehicle.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-4 font-mono font-bold text-emerald-800 whitespace-nowrap">{vehicle.id}</td>
                      <td className="py-4 px-4">
                        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 whitespace-nowrap">
                          {vehicle.vehicleNo}
                        </span>
                        <span className="block text-[10px] text-slate-500 mt-1">{vehicle.vehicleType}</span>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <p className="font-semibold text-slate-800">{vehicle.driver}</p>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">{vehicle.phone}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-medium text-slate-800">{vehicle.supplier}</p>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">Ref: {vehicle.challanNo}</p>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-semibold text-slate-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 text-[11px] whitespace-nowrap">
                          {vehicle.bay}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-700 font-medium max-w-[160px]">
                        <span className="block truncate">{vehicle.itemsSummary}</span>
                      </td>
                      <td className="py-4 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">{vehicle.inTime}</td>
                      <td className="py-4 px-4">
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300 whitespace-nowrap">
                          {vehicle.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setActivePassModal(vehicle)}
                            className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold cursor-pointer transition-colors"
                            title="View Inward Slip"
                          >
                            Slip
                          </button>
                          <button
                            type="button"
                            onClick={() => handleGateOut(vehicle.id)}
                            className="px-3 py-1.5 rounded-lg bg-[#283822] hover:bg-[#1a2616] text-white text-[11px] font-bold cursor-pointer shadow-xs flex items-center gap-1.5 transition-colors"
                            title="Issue Outward Gate Pass"
                          >
                            <LogOut className="w-3 h-3" />
                            <span>Gate Out</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: DAILY GATE REGISTER (LOG)                          */}
      {/* ========================================================= */}
      {activeTab === 'log' && (
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-emerald-700" />
                <span>Daily Gate Inward &amp; Outward Register</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Search, filter, and audit all vehicle movement records through the gate.
              </p>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                  placeholder="Search vehicle, driver, token..."
                  className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-800 w-56 focus:outline-none focus:ring-1 focus:ring-[#283822]"
                />
              </div>

              <select
                value={logStatusFilter}
                onChange={(e) => setLogStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white text-slate-700 font-semibold"
              >
                <option value="All">All Movements</option>
                <option value="Inside">Inside Warehouse Only</option>
                <option value="Cleared">Gate Out Cleared Only</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[950px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] uppercase tracking-wider font-bold">
                  <th className="py-3 px-4">Pass Token</th>
                  <th className="py-3 px-4">Vehicle Reg.</th>
                  <th className="py-3 px-4">Driver Name</th>
                  <th className="py-3 px-4">Supplier</th>
                  <th className="py-3 px-4">Challan / PO</th>
                  <th className="py-3 px-4">In Time</th>
                  <th className="py-3 px-4">Out Time</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Gate Pass</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredGateLog.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-emerald-800 whitespace-nowrap">{log.id}</td>
                    <td className="py-4 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">{log.vehicleNo}</td>
                    <td className="py-4 px-4 font-medium text-slate-800 whitespace-nowrap">{log.driver}</td>
                    <td className="py-4 px-4 text-slate-700">{log.supplier}</td>
                    <td className="py-4 px-4 font-mono text-slate-600 whitespace-nowrap">{log.challanNo}</td>
                    <td className="py-4 px-4 font-mono text-slate-500 text-[11px] whitespace-nowrap">{log.inTime}</td>
                    <td className="py-4 px-4 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                      {log.outTime === '-' ? (
                        <span className="text-amber-600 font-semibold italic">On-site</span>
                      ) : (
                        log.outTime
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full border whitespace-nowrap ${
                          log.status === 'Inside Warehouse'
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setActivePassModal(log)}
                        className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold cursor-pointer inline-flex items-center gap-1.5 transition-colors"
                      >
                        <Printer className="w-3 h-3 text-slate-500" />
                        <span>View Pass</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* PRINTABLE GATE PASS / INWARD SLIP MODAL (WITH QR CODE)   */}
      {/* ========================================================= */}
      {activePassModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-300 overflow-hidden space-y-0 animate-scale-in">
            {/* Slip Header (Military Depot Official Format) */}
            <div className="bg-[#142312] text-white p-4 border-b-2 border-amber-400">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#243d1f] text-amber-300 flex items-center justify-center font-bold">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm tracking-wide text-white">
                      CENTRAL SUPPLY DEPOT
                    </h3>
                    <p className="text-[10px] text-amber-300 font-semibold tracking-wider uppercase">
                      Official Gate Inward Pass &amp; Transit Slip
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActivePassModal(null)}
                  className="text-slate-400 hover:text-white p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Slip Body Content */}
            <div className="p-5 space-y-4 text-xs">
              {/* Token & Simulated QR Code */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-500">Gate Pass Token No.</p>
                  <p className="text-base font-extrabold text-[#283822] font-mono">{activePassModal.id}</p>
                  <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                    Assigned Bay: <strong className="text-slate-800">{activePassModal.bay || 'Bay 2'}</strong>
                  </p>
                </div>
                <div className="w-16 h-16 bg-white border border-slate-300 rounded-lg p-1.5 flex flex-col items-center justify-center shadow-xs">
                  <QrCode className="w-11 h-11 text-slate-800" />
                  <span className="text-[8px] font-mono font-bold text-slate-500">GATE-QR</span>
                </div>
              </div>

              {/* Two Column Key-Value Details */}
              <div className="grid grid-cols-2 gap-2.5 border-y border-slate-200 py-3 text-[11px]">
                <div>
                  <span className="text-slate-500 block">Vehicle Registration:</span>
                  <span className="font-mono font-bold text-slate-900 text-xs">{activePassModal.vehicleNo}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Vehicle Type:</span>
                  <span className="font-semibold text-slate-800">{activePassModal.vehicleType}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Driver Name:</span>
                  <span className="font-bold text-slate-900">{activePassModal.driver}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Driver Contact:</span>
                  <span className="font-mono font-semibold text-slate-800">{activePassModal.phone}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Supplier / Party:</span>
                  <span className="font-semibold text-slate-800">{activePassModal.supplier}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Challan / PO Ref:</span>
                  <span className="font-mono font-bold text-emerald-800">{activePassModal.challanNo}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Gate In Time:</span>
                  <span className="font-mono text-slate-700">{activePassModal.inTime}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Current Status:</span>
                  <span className="font-bold text-amber-700">{activePassModal.status}</span>
                </div>
              </div>

              {/* Declared Material Summary */}
              <div className="bg-emerald-50/70 p-2.5 rounded-lg border border-emerald-200">
                <span className="text-[10px] font-bold uppercase text-emerald-900 block">
                  Declared Consignment &amp; Packaging:
                </span>
                <p className="text-xs font-semibold text-slate-800 mt-0.5">
                  {activePassModal.itemsSummary || 'Standard Military Stores Consignment'}
                </p>
              </div>

              {/* GRN Tear-Off Instructions */}
              <div className="border-t border-dashed border-slate-300 pt-2.5 flex items-center justify-between text-[10px] text-slate-500">
                <span>Authorized Security Guard Sign</span>
                <span className="font-mono font-bold text-slate-700">GRN Handover Copy</span>
              </div>
            </div>

            {/* Modal Buttons */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setActivePassModal(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-white cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  window.print()
                }}
                className="px-5 py-2 bg-[#283822] hover:bg-[#1b2717] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Printer className="w-3.5 h-3.5 text-amber-300" />
                <span>Print Official Gate Pass</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
