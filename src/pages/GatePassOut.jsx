import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Eye, MapPin, Printer, X, ArrowUpRight } from 'lucide-react'

export default function GatePassOut() {
  // Toast notifications state
  const [toastMessage, setToastMessage] = useState(null)
  const triggerToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Filter toolbar state
  const [filterGatePassNo, setFilterGatePassNo] = useState('')
  const [fromDate, setFromDate] = useState('01 Sep 2026')
  const [toDate, setToDate] = useState('16 Sep 2026')
  const [filterDispatchType, setFilterDispatchType] = useState('All Types')
  const [filterVehicle, setFilterVehicle] = useState('All Vehicles')
  const [filterStatus, setFilterStatus] = useState('All Status')

  // Selected row for preview ticket and actions (defaults to Row 1: GP-2026-246)
  const [selectedPassId, setSelectedPassId] = useState(1)

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showVoucherModal, setShowVoucherModal] = useState(null)
  const [showGpsModal, setShowGpsModal] = useState(null)
  const [activeActionRow, setActiveActionRow] = useState(null)

  // Create Gate Pass Form State
  const [newGatePass, setNewGatePass] = useState({
    gatePassNo: 'GP-2026-247',
    date: '16 Sep 2026',
    dispatchNo: 'DISP-2026-325',
    vehicleNo: 'DL-01-EA-5521',
    driverName: 'Virender Yadav',
    licenseNo: 'DL-0420190038124',
    destination: 'Metro Hypermarket Hub',
    shade: 'SH02',
    shadeName: 'Processed Foods & Confectionery',
    originBin: 'SH02-R03-C05',
    productName: 'Parle-G Gold Biscuits (100g)',
    baseQty: 1200,
    baseUnit: 'Packets',
    packQty: 200,
    packType: 'Gatta',
    packRatio: '6 pkts/gatta',
    itemsCount: 1200,
    dispatchType: 'Issue',
    labStatus: 'Passed',
    labCertNo: 'LAB-2026-FMCG-099',
    authorisedBy: 'Logistics Mgr. A. Sharma',
    remarks: 'Verified commercial gate pass out with strict lab clearance compliance.',
  })

  // Gate Pass Data (10 Commercial FMCG Distribution Records with 6 Storage Shades & Base Units)
  const [gatePasses, setGatePasses] = useState([
    {
      id: 1,
      gatePassNo: 'GP-2026-246',
      date: '16 Sep 2026',
      dispatchNo: 'DISP-2026-324',
      vehicleNo: 'UP-32-AB-1234',
      driverName: 'Rajesh Kumar',
      licenseNo: 'DL-0420190038124',
      destination: 'Metro Hypermarket Hub',
      shade: 'SH01',
      shadeName: 'Grains, Cereals & Flours',
      originBin: 'SH01-R02-C04',
      productName: 'Sharbati Wheat Flour (10kg Bags)',
      baseQty: 1200,
      baseUnit: 'Kg',
      packQty: 120,
      packType: 'Bags',
      packRatio: '10 kg/bag',
      items: 1200,
      status: 'Approved',
      labStatus: 'Passed',
      labCertNo: 'LAB-2026-FMCG-088',
      authorisedBy: 'Logistics Mgr. A. Sharma',
      dispatchType: 'Issue',
    },
    {
      id: 2,
      gatePassNo: 'GP-2026-245',
      date: '16 Sep 2026',
      dispatchNo: 'DISP-2026-323',
      vehicleNo: 'HR-26-CD-5678',
      driverName: 'Suresh Yadav',
      licenseNo: 'HR-0620180029381',
      destination: 'Reliance Retail Central Depot',
      shade: 'SH02',
      shadeName: 'Processed Foods & Confectionery',
      originBin: 'SH02-R01-C03',
      productName: 'Parle-G Gold Biscuits (100g)',
      baseQty: 2400,
      baseUnit: 'Packets',
      packQty: 200,
      packType: 'Gatta',
      packRatio: '12 pkts/gatta',
      items: 2400,
      status: 'Approved',
      labStatus: 'Passed',
      labCertNo: 'LAB-2026-FMCG-089',
      authorisedBy: 'Logistics Mgr. A. Sharma',
      dispatchType: 'Transfer',
    },
    {
      id: 3,
      gatePassNo: 'GP-2026-244',
      date: '15 Sep 2026',
      dispatchNo: 'DISP-2026-322',
      vehicleNo: 'DL-01-MA-9876',
      driverName: 'Imran Khan',
      licenseNo: 'DL-0120200055412',
      destination: 'DMart Regional Logistics Park',
      shade: 'SH03',
      shadeName: 'Edible Oils & Cooking Fats',
      originBin: 'SH03-R02-C04',
      productName: 'Fortune Refined Sunflower Oil (1L Pouch)',
      baseQty: 1500,
      baseUnit: 'Liters',
      packQty: 100,
      packType: 'Tins',
      packRatio: '15 L/tin',
      items: 1500,
      status: 'Pending',
      labStatus: 'Passed',
      labCertNo: 'LAB-2026-FMCG-090',
      authorisedBy: 'QA Lead V. Patel',
      dispatchType: 'Issue',
    },
    {
      id: 4,
      gatePassNo: 'GP-2026-243',
      date: '15 Sep 2026',
      dispatchNo: 'DISP-2026-321',
      vehicleNo: 'UP-78-EF-4321',
      driverName: 'Mahesh Singh',
      licenseNo: 'UP-7820170041233',
      destination: 'BigBasket Mega Fulfillment Depot',
      shade: 'SH04',
      shadeName: 'Beverages & Dairy Products',
      originBin: 'SH04-R03-C02',
      productName: 'Amul Taaza Milk (1L TetraPack)',
      baseQty: 600,
      baseUnit: 'Liters',
      packQty: 50,
      packType: 'Gatta',
      packRatio: '12 L/gatta',
      items: 600,
      status: 'Approved',
      labStatus: 'Passed',
      labCertNo: 'LAB-2026-FMCG-091',
      authorisedBy: 'Logistics Mgr. A. Sharma',
      dispatchType: 'Issue',
    },
    {
      id: 5,
      gatePassNo: 'GP-2026-242',
      date: '14 Sep 2026',
      dispatchNo: 'DISP-2026-320',
      vehicleNo: 'RJ-14-GH-6789',
      driverName: 'Pawan Sharma',
      licenseNo: 'RJ-1420190019283',
      destination: 'Blinkit Quick-Commerce Depot #14',
      shade: 'SH05',
      shadeName: 'Personal Care & Hygiene',
      originBin: 'SH05-R01-C05',
      productName: 'Lifebuoy Total Soap (125g Bars)',
      baseQty: 2000,
      baseUnit: 'Pieces',
      packQty: 100,
      packType: 'Gatta',
      packRatio: '20 pcs/gatta',
      items: 2000,
      status: 'Approved',
      labStatus: 'Passed',
      labCertNo: 'LAB-2026-FMCG-092',
      authorisedBy: 'Logistics Mgr. A. Sharma',
      dispatchType: 'Transfer',
    },
    {
      id: 6,
      gatePassNo: 'GP-2026-241',
      date: '14 Sep 2026',
      dispatchNo: 'DISP-2026-319',
      vehicleNo: 'UP-32-XY-1111',
      driverName: 'Anil Verma',
      licenseNo: 'UP-3220180091244',
      destination: 'Amazon Sortation Center',
      shade: 'SH06',
      shadeName: 'Packaging & Warehouse Supplies',
      originBin: 'SH06-R02-C01',
      productName: 'Corrugated Master Cartons (Heavy-Duty)',
      baseQty: 700,
      baseUnit: 'Pieces',
      packQty: 70,
      packType: 'Bundles',
      packRatio: '10 pcs/bundle',
      items: 700,
      status: 'Cancelled',
      labStatus: 'Passed',
      labCertNo: 'LAB-2026-FMCG-093',
      authorisedBy: 'Dispatch Lead R. Verma',
      dispatchType: 'Issue',
    },
    {
      id: 7,
      gatePassNo: 'GP-2026-240',
      date: '13 Sep 2026',
      dispatchNo: 'DISP-2026-318',
      vehicleNo: 'BR-01-AB-2222',
      driverName: 'Manoj Patel',
      licenseNo: 'BR-0120160087421',
      destination: "Spencer's Retail Hypermarket",
      shade: 'SH02',
      shadeName: 'Processed Foods & Confectionery',
      originBin: 'SH02-R02-C02',
      productName: 'Britannia Good Day Butter Cookies',
      baseQty: 1000,
      baseUnit: 'Packets',
      packQty: 100,
      packType: 'Gatta',
      packRatio: '10 pkts/gatta',
      items: 1000,
      status: 'Approved',
      labStatus: 'Passed',
      labCertNo: 'LAB-2026-FMCG-094',
      authorisedBy: 'Logistics Mgr. A. Sharma',
      dispatchType: 'Issue',
    },
    {
      id: 8,
      gatePassNo: 'GP-2026-239',
      date: '13 Sep 2026',
      dispatchNo: 'DISP-2026-317',
      vehicleNo: 'MP-09-CD-3333',
      driverName: 'Deepak Yadav',
      licenseNo: 'MP-0920210046328',
      destination: "Nature's Basket Gourmet Store",
      shade: 'SH01',
      shadeName: 'Grains, Cereals & Flours',
      originBin: 'SH01-R03-C01',
      productName: 'Organic Basmati Rice (5kg Bags)',
      baseQty: 500,
      baseUnit: 'Kg',
      packQty: 100,
      packType: 'Bags',
      packRatio: '5 kg/bag',
      items: 500,
      status: 'Approved',
      labStatus: 'Passed',
      labCertNo: 'LAB-2026-FMCG-095',
      authorisedBy: 'Logistics Mgr. A. Sharma',
      dispatchType: 'Transfer',
    },
    {
      id: 9,
      gatePassNo: 'GP-2026-238',
      date: '12 Sep 2026',
      dispatchNo: 'DISP-2026-316',
      vehicleNo: 'CH-01-EF-4444',
      driverName: 'Kamal Kishore',
      licenseNo: 'CH-0120190074125',
      destination: 'Flipkart Grocery Central Yard',
      shade: 'SH04',
      shadeName: 'Beverages & Dairy Products',
      originBin: 'SH04-R01-C03',
      productName: 'Tata Tea Gold Leaf (500g)',
      baseQty: 900,
      baseUnit: 'Packets',
      packQty: 90,
      packType: 'Gatta',
      packRatio: '10 pkts/gatta',
      items: 900,
      status: 'Pending',
      labStatus: 'Passed',
      labCertNo: 'LAB-2026-FMCG-096',
      authorisedBy: 'QA Lead V. Patel',
      dispatchType: 'Issue',
    },
    {
      id: 10,
      gatePassNo: 'GP-2026-237',
      date: '12 Sep 2026',
      dispatchNo: 'DISP-2026-315',
      vehicleNo: 'UK-07-GH-5555',
      driverName: 'Rakesh Negi',
      licenseNo: 'UK-0720200031948',
      destination: 'Zepto Super Hub North',
      shade: 'SH05',
      shadeName: 'Personal Care & Hygiene',
      originBin: 'SH05-R02-C04',
      productName: 'Colgate Total Toothpaste (150g)',
      baseQty: 400,
      baseUnit: 'Pieces',
      packQty: 40,
      packType: 'Gatta',
      packRatio: '10 pcs/gatta',
      items: 400,
      status: 'Approved',
      labStatus: 'Passed',
      labCertNo: 'LAB-2026-FMCG-097',
      authorisedBy: 'Logistics Mgr. A. Sharma',
      dispatchType: 'Issue',
    },
  ])

  // Currently active preview pass
  const currentPreviewPass = useMemo(() => {
    return gatePasses.find((p) => p.id === selectedPassId) || gatePasses[0]
  }, [gatePasses, selectedPassId])

  // Filtered gate passes
  const filteredPasses = useMemo(() => {
    return gatePasses.filter((pass) => {
      if (
        filterGatePassNo.trim() &&
        !pass.gatePassNo.toLowerCase().includes(filterGatePassNo.toLowerCase().trim())
      ) {
        return false
      }
      if (filterVehicle !== 'All Vehicles' && pass.vehicleNo !== filterVehicle) {
        return false
      }
      if (filterStatus !== 'All Status' && pass.status !== filterStatus) {
        return false
      }
      if (filterDispatchType !== 'All Types' && pass.dispatchType !== filterDispatchType) {
        return false
      }
      return true
    })
  }, [gatePasses, filterGatePassNo, filterVehicle, filterStatus, filterDispatchType])

  // Reset filters
  const handleResetFilters = () => {
    setFilterGatePassNo('')
    setFromDate('01 Sep 2026')
    setToDate('16 Sep 2026')
    setFilterDispatchType('All Types')
    setFilterVehicle('All Vehicles')
    setFilterStatus('All Status')
    triggerToast('Filters reset to default view.')
  }

  // Handle Create Gate Pass
  const handleCreateGatePass = (e) => {
    e.preventDefault()
    const newEntry = {
      id: gatePasses.length + 1,
      gatePassNo: newGatePass.gatePassNo,
      date: '16 Sep 2026',
      dispatchNo: newGatePass.dispatchNo,
      vehicleNo: newGatePass.vehicleNo,
      driverName: newGatePass.driverName,
      licenseNo: newGatePass.licenseNo,
      destination: newGatePass.destination,
      shade: newGatePass.shade,
      originBin: newGatePass.originBin,
      productName: newGatePass.productName,
      baseQty: Number(newGatePass.baseQty),
      baseUnit: newGatePass.baseUnit,
      packQty: Number(newGatePass.packQty),
      packType: newGatePass.packType,
      packRatio: newGatePass.packRatio,
      items: Number(newGatePass.baseQty),
      status: 'Approved',
      labStatus: newGatePass.labStatus || 'Passed',
      labCertNo: newGatePass.labCertNo || 'LAB-2026-FMCG-099',
      authorisedBy: newGatePass.authorisedBy || 'Logistics Mgr. A. Sharma',
      dispatchType: newGatePass.dispatchType,
    }
    setGatePasses([newEntry, ...gatePasses])
    setSelectedPassId(newEntry.id)
    setShowCreateModal(false)
    triggerToast(`Gate Pass ${newGatePass.gatePassNo} created and authorised successfully!`)
  }

  // Status Badge Helper matching screenshot
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#DCFCE7] text-[#15803D]">
            Approved
          </span>
        )
      case 'Pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FEF3C7] text-[#B45309]">
            Pending
          </span>
        )
      case 'Cancelled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FEE2E2] text-[#B91C1C]">
            Cancelled
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
            {status}
          </span>
        )
    }
  }

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Gate Pass No',
      'Date',
      'Dispatch No',
      'Vehicle No',
      'Driver Name',
      'Destination',
      'Items',
      'Status',
    ]
    const rows = filteredPasses.map((p) => [
      p.gatePassNo,
      p.date,
      p.dispatchNo,
      p.vehicleNo,
      p.driverName,
      p.destination,
      p.items,
      p.status,
    ])
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `Gate_Pass_Out_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    triggerToast('Gate pass register exported to CSV.')
  }

  return (
    <div className="space-y-4 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#1E3A1E] text-amber-300 px-4 py-3 rounded-lg shadow-2xl border border-amber-400/40 flex items-center gap-3 transition-all animate-bounce">
          <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-xs font-semibold tracking-wide text-white">{toastMessage}</span>
        </div>
      )}

      {/* TOP WAREHOUSE OPERATIONS BANNER */}
      <div className="relative rounded-xl overflow-hidden shadow-md border border-slate-200/80 bg-slate-900 h-28 sm:h-32">
        <img
          src="/border.png"
          alt="Central Warehouse Logistics Operations"
          className="w-full h-full object-cover object-center opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/25 to-black/50"></div>

        {/* Left overlay: title block */}
        <div className="absolute inset-0 flex flex-col justify-center pl-5">
          <p className="text-[9px] font-bold text-amber-400 uppercase tracking-widest mb-0.5">Central Warehouse Logistics</p>
          <h1 className="text-xl sm:text-2xl font-black text-white leading-tight tracking-wide">Outward Gate Pass Register</h1>
          <p className="text-[10px] text-slate-300 mt-1">FMCG Distribution · Dispatch Authorisation · Vehicle Tracking</p>
        </div>

        {/* Right side pill badges */}
        <div className="absolute top-3 right-4 flex flex-col items-end gap-1.5">
          <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-bold text-white tracking-widest uppercase">
              Live Operations
            </span>
          </div>
          <div className="bg-black/50 backdrop-blur-md px-2.5 py-0.5 rounded border border-white/10 text-[9px] font-mono font-bold text-amber-300 tracking-wider hidden sm:block">
            VERIFIED DISPATCH · SECURE TRANSIT
          </div>
        </div>
      </div>

      {/* PAGE HEADER ROW */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#1E3A1E] text-white flex items-center justify-center shadow-xs shrink-0">
            {/* Delivery Truck Icon matching screenshot */}
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
              />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-800">Gate Pass Out</h2>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Manage outbound gate passes for dispatched items.</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Breadcrumbs matching standard */}
          <nav className="text-xs text-slate-500 hidden lg:flex items-center gap-1.5 font-medium">
            <Link to="/dashboard" className="hover:text-slate-800 transition-colors">
              Home
            </Link>
            <span>&gt;</span>
            <span className="text-slate-600">Outward Operations</span>
            <span>&gt;</span>
            <span className="text-slate-800 font-semibold">Gate Pass Out</span>
          </nav>

          {/* + Create Gate Pass Action Button */}
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1E3A1E] text-white text-xs font-semibold shadow-xs hover:bg-[#152915] active:scale-98 transition-all cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            <span>Create Gate Pass</span>
          </button>
        </div>
      </div>

      {/* 5 KPI STAT CARDS (SINGLE ROW) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Total Gate Passes */}
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500 text-white flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500">Total Gate Passes</p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-xl font-bold text-slate-800">246</span>
                <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                  ↑ 12%
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">This month</p>
            </div>
          </div>
        </div>

        {/* Approved */}
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#16A34A] text-white flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500">Approved</p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-xl font-bold text-slate-800">220</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">89.4% of total</p>
            </div>
          </div>
        </div>

        {/* Pending Approval */}
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#F59E0B] text-white flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500">Pending Approval</p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-xl font-bold text-slate-800">18</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">7.3% of total</p>
            </div>
          </div>
        </div>

        {/* Cancelled */}
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#EF4444] text-white flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500">Cancelled</p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-xl font-bold text-slate-800">6</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">2.4% of total</p>
            </div>
          </div>
        </div>

        {/* Items Dispatched */}
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#8B5CF6] text-white flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
                />
              </svg>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500">Items Dispatched</p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-xl font-bold text-slate-800">12,580</span>
                <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                  ↑ 8%
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Units (This month)</p>
            </div>
          </div>
        </div>
      </div>

      {/* FILTER TOOLBAR CARD */}
      <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 items-end">
          {/* Gate Pass No */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Gate Pass No.</label>
            <input
              type="text"
              placeholder="Enter gate pass no..."
              value={filterGatePassNo}
              onChange={(e) => setFilterGatePassNo(e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg focus:outline-hidden focus:border-[#1E3A1E] text-slate-700"
            />
          </div>

          {/* From Date */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">From Date</label>
            <div className="relative">
              <input
                type="text"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full text-xs pl-7 pr-2 py-1.5 border border-slate-300 rounded-lg focus:outline-hidden focus:border-[#1E3A1E] text-slate-700"
              />
              <svg
                className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>

          {/* To Date */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">To Date</label>
            <div className="relative">
              <input
                type="text"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full text-xs pl-7 pr-2 py-1.5 border border-slate-300 rounded-lg focus:outline-hidden focus:border-[#1E3A1E] text-slate-700"
              />
              <svg
                className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>

          {/* Dispatch Type */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Dispatch Type</label>
            <select
              value={filterDispatchType}
              onChange={(e) => setFilterDispatchType(e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg focus:outline-hidden focus:border-[#1E3A1E] text-slate-700 bg-white"
            >
              <option value="All Types">All Types</option>
              <option value="Issue">Issue</option>
              <option value="Transfer">Transfer</option>
              <option value="Return">Return</option>
              <option value="Replacement">Replacement</option>
            </select>
          </div>

          {/* Vehicle No. */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Vehicle No.</label>
            <select
              value={filterVehicle}
              onChange={(e) => setFilterVehicle(e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg focus:outline-hidden focus:border-[#1E3A1E] text-slate-700 bg-white"
            >
              <option value="All Vehicles">All Vehicles</option>
              <option value="UP-32-AB-1234">UP-32-AB-1234</option>
              <option value="HR-26-CD-5678">HR-26-CD-5678</option>
              <option value="DL-01-MA-9876">DL-01-MA-9876</option>
              <option value="UP-78-EF-4321">UP-78-EF-4321</option>
              <option value="RJ-14-GH-6789">RJ-14-GH-6789</option>
              <option value="UP-32-XY-1111">UP-32-XY-1111</option>
              <option value="BR-01-AB-2222">BR-01-AB-2222</option>
              <option value="MP-09-CD-3333">MP-09-CD-3333</option>
              <option value="CH-01-EF-4444">CH-01-EF-4444</option>
              <option value="UK-07-GH-5555">UK-07-GH-5555</option>
            </select>
          </div>

          {/* Status & Buttons */}
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full text-xs px-2 py-1.5 border border-slate-300 rounded-lg focus:outline-hidden focus:border-[#1E3A1E] text-slate-700 bg-white"
              >
                <option value="All Status">All Status</option>
                <option value="Approved">Approved</option>
                <option value="Pending">Pending</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div className="flex items-end gap-1.5 pt-4">
              <button
                type="button"
                onClick={() =>
                  triggerToast(`Filtered results: ${filteredPasses.length} gate passes found.`)
                }
                className="px-3 py-1.5 rounded-lg bg-[#1E3A1E] text-white text-xs font-semibold hover:bg-[#152915] active:scale-98 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
                <span>Filter</span>
              </button>
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-medium hover:bg-slate-50 active:scale-98 transition-all cursor-pointer shadow-xs"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN TWO COLUMN SECTION: LEFT TABLE (SPAN 9) & RIGHT WIDGETS (SPAN 3) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT COLUMN: GATE PASS TABLE CARD (SPAN 9) */}
        <div className="lg:col-span-9 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            {/* Table Header Row */}
            <div className="p-3.5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                <h3 className="text-xs font-bold text-slate-800 tracking-wide">
                  Gate Pass List (246)
                </h3>
              </div>

              {/* Action Buttons matching screenshot */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="px-2.5 py-1 rounded bg-[#1E3A1E] text-white text-[11px] font-medium flex items-center gap-1 hover:bg-[#152915] active:scale-98 transition-all cursor-pointer"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  <span>Export</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-2.5 py-1 rounded bg-[#1E3A1E] text-white text-[11px] font-medium flex items-center gap-1 hover:bg-[#152915] active:scale-98 transition-all cursor-pointer"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                    />
                  </svg>
                  <span>Print</span>
                </button>
                <button
                  type="button"
                  onClick={() => triggerToast('Downloading official Gate Pass Register dossier...')}
                  className="px-2.5 py-1 rounded bg-[#1E3A1E] text-white text-[11px] font-medium flex items-center gap-1 hover:bg-[#152915] active:scale-98 transition-all cursor-pointer"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span>Download</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowVoucherModal(currentPreviewPass)}
                  className="px-2.5 py-1 rounded bg-[#1E3A1E] text-white text-[11px] font-medium flex items-center gap-1 hover:bg-[#152915] active:scale-98 transition-all cursor-pointer"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  <span>View Details</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div
              className="overflow-x-auto no-scrollbar scroll-smooth w-full"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              <table className="w-full text-left border-collapse table-nowrap">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-700">
                    <th className="py-2.5 px-3 text-center w-8">#</th>
                    <th className="py-2.5 px-3">Gate Pass No.</th>
                    <th className="py-2.5 px-3">Dispatch &amp; Date</th>
                    <th className="py-2.5 px-3">Carrier &amp; Driver</th>
                    <th className="py-2.5 px-3">Destination Hub</th>
                    <th className="py-2.5 px-3">Origin Bin &amp; Shade</th>
                    <th className="py-2.5 px-3">Base Qty &amp; Packs</th>
                    <th className="py-2.5 px-3 text-center">Lab QC</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {filteredPasses.map((row) => (
                    <tr
                      key={row.id}
                      onClick={() => setSelectedPassId(row.id)}
                      className={`hover:bg-amber-50/40 transition-colors cursor-pointer ${
                        selectedPassId === row.id ? 'bg-amber-50/50 font-medium' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 text-center font-mono text-[11px] text-slate-500">
                        {row.id}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800 hover:text-blue-600 transition-colors">
                        {row.gatePassNo}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-mono text-slate-800 text-[11px] font-semibold">{row.dispatchNo}</div>
                        <div className="text-[10px] text-slate-400">{row.date}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-mono text-slate-800 text-[11px] font-semibold">{row.vehicleNo}</div>
                        <div className="text-[10px] text-slate-500">{row.driverName}</div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 font-medium">{row.destination}</td>
                      <td className="py-2.5 px-3">
                        <div className="font-mono font-bold text-slate-800 text-[11px]">{row.originBin}</div>
                        <span className="inline-block px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                          {row.shade}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900 text-[11px]">
                          {row.baseQty.toLocaleString()} {row.baseUnit}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {row.packQty} {row.packType} ({row.packRatio})
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                          Passed
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">{getStatusBadge(row.status)}</td>
                      <td className="py-2.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1 relative">
                          {/* View Eye Button */}
                          <button
                            type="button"
                            onClick={() => setShowVoucherModal(row)}
                            title="View Gate Pass Voucher"
                            className="p-1 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          </button>

                          {/* Edit / Quick Toggle Approve */}
                          <button
                            type="button"
                            onClick={() => {
                              setGatePasses(
                                gatePasses.map((p) =>
                                  p.id === row.id
                                    ? { ...p, status: p.status === 'Approved' ? 'Pending' : 'Approved' }
                                    : p
                                )
                              )
                              triggerToast(`Status toggled for ${row.gatePassNo}!`)
                            }}
                            title="Toggle Approval"
                            className="p-1 text-slate-500 hover:text-emerald-700 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>

                          {/* Dots Menu */}
                          <button
                            type="button"
                            onClick={() => setActiveActionRow(activeActionRow === row.id ? null : row.id)}
                            className="p-1 text-slate-400 hover:text-slate-800 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                              <circle cx="5" cy="12" r="2" />
                              <circle cx="12" cy="12" r="2" />
                              <circle cx="19" cy="12" r="2" />
                            </svg>
                          </button>

                          {/* Dropdown Options */}
                          {activeActionRow === row.id && (
                            <div className="absolute right-0 top-7 w-44 bg-white rounded-lg shadow-xl border border-slate-200 z-30 py-1 text-left text-xs divide-y divide-slate-100">
                              <button
                                type="button"
                                onClick={() => {
                                  setShowVoucherModal(row)
                                  setActiveActionRow(null)
                                }}
                                className="w-full px-3 py-1.5 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5 text-slate-500" />
                                <span>View Voucher</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setShowGpsModal(row)
                                  setActiveActionRow(null)
                                }}
                                className="w-full px-3 py-1.5 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                              >
                                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                                <span>Track Vehicle (GPS)</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  window.print()
                                  setActiveActionRow(null)
                                }}
                                className="w-full px-3 py-1.5 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                              >
                                <Printer className="w-3.5 h-3.5 text-slate-500" />
                                <span>Print Pass</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setGatePasses(
                                    gatePasses.map((p) =>
                                      p.id === row.id ? { ...p, status: 'Cancelled' } : p
                                    )
                                  )
                                  setActiveActionRow(null)
                                  triggerToast(`Gate pass ${row.gatePassNo} cancelled.`)
                                }}
                                className="w-full px-3 py-1.5 text-rose-700 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5 text-rose-600" />
                                <span>Cancel Pass</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Footer matching screenshot */}
          <div className="p-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
            <div>
              <span>Showing 1 to 10 of 246 records</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="w-6 h-6 rounded border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50"
              >
                &lt;
              </button>
              <button
                type="button"
                className="w-6 h-6 rounded bg-[#1E3A1E] text-white font-semibold flex items-center justify-center text-xs"
              >
                1
              </button>
              <button
                type="button"
                className="w-6 h-6 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center justify-center text-xs"
              >
                2
              </button>
              <button
                type="button"
                className="w-6 h-6 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center justify-center text-xs"
              >
                3
              </button>
              <button
                type="button"
                className="w-6 h-6 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center justify-center text-xs"
              >
                4
              </button>
              <button
                type="button"
                className="w-6 h-6 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center justify-center text-xs"
              >
                5
              </button>
              <span className="px-1 text-slate-400">..</span>
              <button
                type="button"
                className="w-6 h-6 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center justify-center text-xs"
              >
                25
              </button>
              <button
                type="button"
                className="w-6 h-6 rounded border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50"
              >
                &gt;
              </button>
            </div>
            <div className="flex items-center gap-1">
              <span>Show</span>
              <select className="border border-slate-200 rounded px-1.5 py-0.5 text-xs bg-white text-slate-700">
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
              <span>per page</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: QUICK ACTIONS & GATE PASS PREVIEW TICKET (SPAN 3) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Card 1: Quick Actions */}
          <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs">
            <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
              <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <h3 className="text-xs font-bold text-slate-800">Quick Actions</h3>
            </div>
            <div className="divide-y divide-slate-100 text-xs">
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="w-full py-2 flex items-center gap-2.5 text-slate-700 hover:text-emerald-800 transition-colors text-left cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                <span>Create New Gate Pass</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setGatePasses(
                    gatePasses.map((p) => (p.status === 'Pending' ? { ...p, status: 'Approved' } : p))
                  )
                  triggerToast('All pending gate passes authorised & approved!')
                }}
                className="w-full py-2 flex items-center gap-2.5 text-slate-700 hover:text-emerald-800 transition-colors text-left cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Approve Pending Gate Pass</span>
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="w-full py-2 flex items-center gap-2.5 text-slate-700 hover:text-emerald-800 transition-colors text-left cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                  />
                </svg>
                <span>Print Gate Pass</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setGatePasses(
                    gatePasses.map((p) =>
                      p.id === selectedPassId ? { ...p, status: 'Cancelled' } : p
                    )
                  )
                  triggerToast(`Gate pass ${currentPreviewPass.gatePassNo} cancelled.`)
                }}
                className="w-full py-2 flex items-center gap-2.5 text-slate-700 hover:text-rose-700 transition-colors text-left cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Cancel Gate Pass</span>
              </button>
              <button
                type="button"
                onClick={() => setShowGpsModal(currentPreviewPass)}
                className="w-full py-2 flex items-center gap-2.5 text-slate-700 hover:text-emerald-800 transition-colors text-left cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Track Vehicle (GPS)</span>
              </button>
              <button
                type="button"
                onClick={handleExportCSV}
                className="w-full py-2 flex items-center gap-2.5 text-slate-700 hover:text-emerald-800 transition-colors text-left cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                <span>Download Gate Pass Report</span>
              </button>
              <button
                type="button"
                onClick={() => triggerToast(`Opening dispatch reference ${currentPreviewPass.dispatchNo}...`)}
                className="w-full py-2 flex items-center gap-2.5 text-slate-700 hover:text-emerald-800 transition-colors text-left cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                <span>View Dispatch Details</span>
              </button>
            </div>
          </div>

          {/* Card 2: Gate Pass Preview Ticket Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="text-xs font-bold text-slate-800">Gate Pass Preview</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowVoucherModal(currentPreviewPass)}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-0.5 cursor-pointer"
              >
                <span>View Full</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

            {/* Official Central Warehouse Gate Pass Ticket Preview */}
            <div className="relative mt-2.5 p-3 rounded-lg border border-amber-300/80 bg-[#FFFEF8] text-[11px] text-slate-700 shadow-inner">
              {/* Header with emblem & QR */}
              <div className="flex items-start justify-between pb-2 border-b border-amber-200">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 text-emerald-800">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-[10px] text-slate-900 leading-tight tracking-wider uppercase">
                      CENTRAL WAREHOUSE LOGISTICS
                    </h4>
                    <p className="text-[9px] font-bold text-amber-900 tracking-wider">
                      MATERIAL GATE PASS OUT
                    </p>
                  </div>
                </div>

                {/* QR Code */}
                <div className="w-10 h-10 bg-white p-0.5 border border-slate-300 rounded shrink-0 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-full h-full text-slate-900" fill="currentColor">
                    <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm14 0h2v2h-2v-2zm-4-2h2v2h-2v-2zm2 4h2v2h-2v-2zm2 2h2v2h-2v-2zm-4 0h2v2h-2v-2zm6-4h2v4h-2v-4zm-2-2h4v2h-4v-2z" />
                  </svg>
                </div>
              </div>

              {/* Data Grid */}
              <div className="space-y-1 pt-2 font-mono text-[10px]">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Gate Pass No:</span>
                  <span className="font-bold text-slate-900">{currentPreviewPass.gatePassNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Date:</span>
                  <span>{currentPreviewPass.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Dispatch No:</span>
                  <span className="font-bold text-slate-900">{currentPreviewPass.dispatchNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Carrier Vehicle:</span>
                  <span className="font-bold text-slate-900">{currentPreviewPass.vehicleNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Driver:</span>
                  <span>{currentPreviewPass.driverName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Destination Hub:</span>
                  <span className="font-bold text-slate-900 text-right truncate max-w-[140px]">{currentPreviewPass.destination}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Origin Shade &amp; Bin:</span>
                  <span className="font-bold text-amber-900">{currentPreviewPass.originBin} ({currentPreviewPass.shade})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Base Qty &amp; Packs:</span>
                  <span className="font-bold text-slate-900">
                    {currentPreviewPass.baseQty.toLocaleString()} {currentPreviewPass.baseUnit} ({currentPreviewPass.packQty} {currentPreviewPass.packType})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Lab QA Clearance:</span>
                  <span className="font-bold text-emerald-700">{currentPreviewPass.labStatus} ({currentPreviewPass.labCertNo})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Authorised By:</span>
                  <span>{currentPreviewPass.authorisedBy}</span>
                </div>
              </div>

              {/* Angled Green APPROVED Stamp */}
              {currentPreviewPass.status === 'Approved' && (
                <div className="absolute right-4 bottom-14 transform -rotate-12 pointer-events-none">
                  <div className="border-2 border-emerald-600 px-2 py-0.5 rounded text-emerald-700 text-[10px] font-black tracking-widest uppercase bg-emerald-50/70 shadow-xs">
                    APPROVED
                  </div>
                </div>
              )}

              {/* Bottom Barcode Graphic */}
              <div className="pt-2 border-t border-amber-200 mt-2 text-center">
                <span className="text-[8px] text-slate-400 uppercase font-sans tracking-wider block">
                  For Official Use Only
                </span>
                {/* Simulated Barcode */}
                <div className="flex items-center justify-center gap-0.5 my-1 h-6">
                  {[2, 1, 3, 1, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3, 2, 1, 3, 4, 1, 2, 1, 3].map(
                    (w, idx) => (
                      <span
                        key={idx}
                        className="bg-slate-900 h-full"
                        style={{ width: `${w}px` }}
                      />
                    )
                  )}
                </div>
                <span className="text-[8px] font-mono text-slate-500 tracking-widest block">
                  {currentPreviewPass.gatePassNo.replace(/-/g, '')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LOWER SECTION: 3 WIDGETS SIDE-BY-SIDE UNDER TABLE & QUICK ACTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Widget 1: Gate Pass Trend (Last 7 Days) */}
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
                <h3 className="text-xs font-bold text-slate-800">Gate Pass Trend (Last 7 Days)</h3>
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-3 pt-2 text-[10px] text-slate-600 flex-wrap">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#3B82F6]" />
                <span>Total</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                <span>Approved</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                <span>Pending</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
                <span>Cancelled</span>
              </div>
            </div>

            {/* Multi-line SVG chart matching coordinates in screenshot */}
            <div className="relative mt-3 h-40 w-full">
              <svg viewBox="0 0 350 140" className="w-full h-full overflow-visible">
                {/* Horizontal Grid lines */}
                <line x1="25" y1="120" x2="340" y2="120" stroke="#F1F5F9" strokeWidth="1" />
                <line x1="25" y1="95" x2="340" y2="95" stroke="#F1F5F9" strokeWidth="1" />
                <line x1="25" y1="70" x2="340" y2="70" stroke="#F1F5F9" strokeWidth="1" />
                <line x1="25" y1="45" x2="340" y2="45" stroke="#F1F5F9" strokeWidth="1" />
                <line x1="25" y1="20" x2="340" y2="20" stroke="#F1F5F9" strokeWidth="1" />

                {/* Y-axis Labels */}
                <text x="18" y="123" fontSize="8" fill="#94A3B8" textAnchor="end">0</text>
                <text x="18" y="98" fontSize="8" fill="#94A3B8" textAnchor="end">10</text>
                <text x="18" y="73" fontSize="8" fill="#94A3B8" textAnchor="end">20</text>
                <text x="18" y="48" fontSize="8" fill="#94A3B8" textAnchor="end">30</text>
                <text x="18" y="23" fontSize="8" fill="#94A3B8" textAnchor="end">40</text>
                <text x="18" y="10" fontSize="8" fill="#94A3B8" textAnchor="end">50</text>

                {/* Blue Line: Total */}
                <polyline
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="2"
                  points="35,84 85,74 135,80 185,72 235,58 285,65 335,60"
                />
                <circle cx="35" cy="84" r="2.5" fill="#3B82F6" />
                <circle cx="85" cy="74" r="2.5" fill="#3B82F6" />
                <circle cx="135" cy="80" r="2.5" fill="#3B82F6" />
                <circle cx="185" cy="72" r="2.5" fill="#3B82F6" />
                <circle cx="235" cy="58" r="2.5" fill="#3B82F6" />
                <circle cx="285" cy="65" r="2.5" fill="#3B82F6" />
                <circle cx="335" cy="60" r="2.5" fill="#3B82F6" />

                {/* Green Line: Approved */}
                <polyline
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="2"
                  points="35,92 85,82 135,88 185,80 235,68 285,72 335,68"
                />
                <circle cx="35" cy="92" r="2.5" fill="#10B981" />
                <circle cx="85" cy="82" r="2.5" fill="#10B981" />
                <circle cx="135" cy="88" r="2.5" fill="#10B981" />
                <circle cx="185" cy="80" r="2.5" fill="#10B981" />
                <circle cx="235" cy="68" r="2.5" fill="#10B981" />
                <circle cx="285" cy="72" r="2.5" fill="#10B981" />
                <circle cx="335" cy="68" r="2.5" fill="#10B981" />

                {/* Orange Line: Pending */}
                <polyline
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="2"
                  points="35,108 85,108 135,112 185,108 235,102 285,105 335,108"
                />
                <circle cx="35" cy="108" r="2.5" fill="#F59E0B" />
                <circle cx="85" cy="108" r="2.5" fill="#F59E0B" />
                <circle cx="135" cy="112" r="2.5" fill="#F59E0B" />
                <circle cx="185" cy="108" r="2.5" fill="#F59E0B" />
                <circle cx="235" cy="102" r="2.5" fill="#F59E0B" />
                <circle cx="285" cy="105" r="2.5" fill="#F59E0B" />
                <circle cx="335" cy="108" r="2.5" fill="#F59E0B" />

                {/* Red Line: Cancelled */}
                <polyline
                  fill="none"
                  stroke="#EF4444"
                  strokeWidth="2"
                  points="35,118 85,118 135,118 185,116 235,114 285,116 335,116"
                />
                <circle cx="35" cy="118" r="2.5" fill="#EF4444" />
                <circle cx="85" cy="118" r="2.5" fill="#EF4444" />
                <circle cx="135" cy="118" r="2.5" fill="#EF4444" />
                <circle cx="185" cy="116" r="2.5" fill="#EF4444" />
                <circle cx="235" cy="114" r="2.5" fill="#EF4444" />
                <circle cx="285" cy="116" r="2.5" fill="#EF4444" />
                <circle cx="335" cy="116" r="2.5" fill="#EF4444" />

                {/* X-axis Labels */}
                <text x="35" y="132" fontSize="7.5" fill="#94A3B8" textAnchor="middle">10 Sep</text>
                <text x="85" y="132" fontSize="7.5" fill="#94A3B8" textAnchor="middle">11 Sep</text>
                <text x="135" y="132" fontSize="7.5" fill="#94A3B8" textAnchor="middle">12 Sep</text>
                <text x="185" y="132" fontSize="7.5" fill="#94A3B8" textAnchor="middle">13 Sep</text>
                <text x="235" y="132" fontSize="7.5" fill="#94A3B8" textAnchor="middle">14 Sep</text>
                <text x="285" y="132" fontSize="7.5" fill="#94A3B8" textAnchor="middle">15 Sep</text>
                <text x="335" y="132" fontSize="7.5" fill="#94A3B8" textAnchor="middle">16 Sep</text>
              </svg>
            </div>
          </div>
        </div>

        {/* Widget 2: Top 5 Destinations */}
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <h3 className="text-xs font-bold text-slate-800">Top 5 Destinations</h3>
            </div>

            {/* 5 Progress Bars matching screenshot colors */}
            <div className="space-y-3 pt-3">
              {/* 1. Metro Hypermarket Central Hub - Teal/Green 58 */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700">1. &nbsp;Metro Hypermarket Central Hub</span>
                  <span className="font-bold text-slate-800">58</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-[#0D9488] h-full rounded-full" style={{ width: '85%' }} />
                </div>
              </div>

              {/* 2. Reliance Retail Distribution Centre - Blue 46 */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700">2. &nbsp;Reliance Retail Distribution Centre</span>
                  <span className="font-bold text-slate-800">46</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-[#3B82F6] h-full rounded-full" style={{ width: '68%' }} />
                </div>
              </div>

              {/* 3. DMart Regional Logistics Park - Orange 38 */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700">3. &nbsp;DMart Regional Logistics Park</span>
                  <span className="font-bold text-slate-800">38</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-[#F97316] h-full rounded-full" style={{ width: '56%' }} />
                </div>
              </div>

              {/* 4. BigBasket Mega Fulfillment Depot - Red/Rose 32 */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700">4. &nbsp;BigBasket Mega Fulfillment Depot</span>
                  <span className="font-bold text-slate-800">32</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-[#EF4444] h-full rounded-full" style={{ width: '47%' }} />
                </div>
              </div>

              {/* 5. Blinkit Quick-Commerce Depot #14 - Purple 28 */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700">5. &nbsp;Blinkit Quick-Commerce Depot #14</span>
                  <span className="font-bold text-slate-800">28</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-[#8B5CF6] h-full rounded-full" style={{ width: '40%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Widget 3: Dispatch Type Distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
                />
              </svg>
              <h3 className="text-xs font-bold text-slate-800">Dispatch Type Distribution</h3>
            </div>

            <div className="flex items-center justify-between pt-3">
              {/* SVG Donut Chart */}
              <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                  <circle
                    cx="18"
                    cy="18"
                    r="15.9155"
                    fill="transparent"
                    stroke="#F1F5F9"
                    strokeWidth="4"
                  />
                  {/* Issue: 45% - Green */}
                  <circle
                    cx="18"
                    cy="18"
                    r="15.9155"
                    fill="transparent"
                    stroke="#10B981"
                    strokeWidth="4.5"
                    strokeDasharray="45 55"
                    strokeDashoffset="0"
                  />
                  {/* Transfer: 28% - Red/Rose */}
                  <circle
                    cx="18"
                    cy="18"
                    r="15.9155"
                    fill="transparent"
                    stroke="#F43F5E"
                    strokeWidth="4.5"
                    strokeDasharray="28 72"
                    strokeDashoffset="-45"
                  />
                  {/* Return: 12% - Purple */}
                  <circle
                    cx="18"
                    cy="18"
                    r="15.9155"
                    fill="transparent"
                    stroke="#8B5CF6"
                    strokeWidth="4.5"
                    strokeDasharray="12 88"
                    strokeDashoffset="-73"
                  />
                  {/* Replacement: 8% - Orange */}
                  <circle
                    cx="18"
                    cy="18"
                    r="15.9155"
                    fill="transparent"
                    stroke="#F97316"
                    strokeWidth="4.5"
                    strokeDasharray="8 92"
                    strokeDashoffset="-85"
                  />
                  {/* Others: 7% - Cyan */}
                  <circle
                    cx="18"
                    cy="18"
                    r="15.9155"
                    fill="transparent"
                    stroke="#06B6D4"
                    strokeWidth="4.5"
                    strokeDasharray="7 93"
                    strokeDashoffset="-93"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-base font-extrabold text-slate-800 leading-tight">246</span>
                  <span className="text-[9px] font-medium text-slate-400">Gate Passes</span>
                </div>
              </div>

              {/* Legend matching screenshot */}
              <div className="space-y-1.5 pl-2 text-[11px] text-slate-600 flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] shrink-0" />
                    <span>Issue</span>
                  </div>
                  <span className="font-semibold text-slate-800">45% (111)</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#F43F5E] shrink-0" />
                    <span>Transfer</span>
                  </div>
                  <span className="font-semibold text-slate-800">28% (69)</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6] shrink-0" />
                    <span>Return</span>
                  </div>
                  <span className="font-semibold text-slate-800">12% (30)</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#F97316] shrink-0" />
                    <span>Replacement</span>
                  </div>
                  <span className="font-semibold text-slate-800">8% (20)</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#06B6D4] shrink-0" />
                    <span>Others</span>
                  </div>
                  <span className="font-semibold text-slate-800">7% (16)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER BAR */}
      <div className="bg-[#111A11] border border-slate-700/60 rounded-xl p-3 text-slate-400 text-xs flex flex-col sm:flex-row items-center justify-between gap-2 shadow-xs">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            System Active
          </span>
          <span className="text-slate-500">|</span>
          <span>Authorised Access Only</span>
          <span className="text-slate-500">|</span>
          <span>For Official Use Only</span>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <span className="text-amber-400 font-bold">CENTRAL WAREHOUSE</span>
          <span>Logistics Management System v1.0.0</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-300">Powered by Secure FMCG Distribution Network</span>
        </div>
      </div>

      {/* MODAL 1: CREATE GATE PASS MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 animate-scaleIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#1E3A1E] text-white flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">Create Outward Gate Pass</h3>
                  <p className="text-xs text-slate-500">Generate commercial material gate pass voucher</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateGatePass} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Gate Pass Ref No.</label>
                  <input
                    type="text"
                    required
                    value={newGatePass.gatePassNo}
                    onChange={(e) => setNewGatePass({ ...newGatePass, gatePassNo: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono text-slate-800 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Dispatch Order No.</label>
                  <input
                    type="text"
                    required
                    value={newGatePass.dispatchNo}
                    onChange={(e) => setNewGatePass({ ...newGatePass, dispatchNo: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Carrier Vehicle No.</label>
                  <input
                    type="text"
                    required
                    value={newGatePass.vehicleNo}
                    onChange={(e) => setNewGatePass({ ...newGatePass, vehicleNo: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Driver Name</label>
                  <input
                    type="text"
                    required
                    value={newGatePass.driverName}
                    onChange={(e) => setNewGatePass({ ...newGatePass, driverName: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Destination Hub</label>
                  <select
                    value={newGatePass.destination}
                    onChange={(e) => setNewGatePass({ ...newGatePass, destination: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-800 bg-white"
                  >
                    <option value="Metro Hypermarket Hub">Metro Hypermarket Hub</option>
                    <option value="Reliance Retail Central Depot">Reliance Retail Central Depot</option>
                    <option value="DMart Regional Logistics Park">DMart Regional Logistics Park</option>
                    <option value="BigBasket Mega Fulfillment Depot">BigBasket Mega Fulfillment Depot</option>
                    <option value="Blinkit Quick-Commerce Depot #14">Blinkit Quick-Commerce Depot #14</option>
                    <option value="Amazon Sortation Center">Amazon Sortation Center</option>
                    <option value="Spencer's Retail Hypermarket">Spencer's Retail Hypermarket</option>
                    <option value="Nature's Basket Gourmet Store">Nature's Basket Gourmet Store</option>
                    <option value="Flipkart Grocery Central Yard">Flipkart Grocery Central Yard</option>
                    <option value="Zepto Super Hub North">Zepto Super Hub North</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Base Qty (Units)</label>
                  <input
                    type="number"
                    required
                    value={newGatePass.baseQty}
                    onChange={(e) => setNewGatePass({ ...newGatePass, baseQty: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-800 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Origin Bin (Shade-Row-Col)</label>
                  <input
                    type="text"
                    value={newGatePass.originBin}
                    onChange={(e) => setNewGatePass({ ...newGatePass, originBin: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Product Name</label>
                  <input
                    type="text"
                    value={newGatePass.productName}
                    onChange={(e) => setNewGatePass({ ...newGatePass, productName: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Lab Certificate No.</label>
                  <input
                    type="text"
                    value={newGatePass.labCertNo}
                    onChange={(e) => setNewGatePass({ ...newGatePass, labCertNo: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Dispatch Type</label>
                  <select
                    value={newGatePass.dispatchType}
                    onChange={(e) => setNewGatePass({ ...newGatePass, dispatchType: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-800 bg-white"
                  >
                    <option value="Issue">Issue</option>
                    <option value="Transfer">Transfer</option>
                    <option value="Return">Return</option>
                    <option value="Replacement">Replacement</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Dispatch Remarks</label>
                <textarea
                  rows={2}
                  value={newGatePass.remarks}
                  onChange={(e) => setNewGatePass({ ...newGatePass, remarks: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#1E3A1E] text-white font-bold hover:bg-[#152915] cursor-pointer shadow-md"
                >
                  Issue &amp; Authorise Gate Pass
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: FULL VOUCHER INSPECTION MODAL */}
      {showVoucherModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 animate-scaleIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#1E3A1E] text-white flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    Gate Clearance Voucher: {showVoucherModal.gatePassNo}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    Dispatch Ref: {showVoucherModal.dispatchNo}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowVoucherModal(null)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-xs">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">
                      Destination Hub
                    </span>
                    <span className="font-bold text-slate-900 text-sm">{showVoucherModal.destination}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Status</span>
                    <div className="mt-0.5">{getStatusBadge(showVoucherModal.status)}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">
                      Carrier Vehicle
                    </span>
                    <span className="font-mono text-slate-900 font-semibold">
                      {showVoucherModal.vehicleNo}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">
                      Driver Name
                    </span>
                    <span className="font-semibold text-slate-800">{showVoucherModal.driverName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Origin Bin / Shade</span>
                    <span className="font-bold text-amber-900 font-mono">{showVoucherModal.originBin} ({showVoucherModal.shade})</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">
                      Base Qty &amp; Packs
                    </span>
                    <span className="font-bold text-slate-900">{showVoucherModal.baseQty?.toLocaleString()} {showVoucherModal.baseUnit} / {showVoucherModal.packQty} {showVoucherModal.packType}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Lab QA Status</span>
                    <span className="font-bold text-emerald-700">{showVoucherModal.labStatus} — {showVoucherModal.labCertNo}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">
                      Authorised By
                    </span>
                    <span className="font-semibold text-slate-800">{showVoucherModal.authorisedBy}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-800 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                  GATE CLEARANCE GRANTED &amp; ELECTRONICALLY VERIFIED
                </div>
                <p className="text-slate-600 text-[10px]">
                  All material seal tags, delivery challans, and carrier vehicle manifests have been validated.
                  The consignment is cleared to exit through Outward Bay 02.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 cursor-pointer font-semibold"
                >
                  Print Gate Pass
                </button>
                <button
                  type="button"
                  onClick={() => setShowVoucherModal(null)}
                  className="px-5 py-2 rounded-lg bg-[#1E3A1E] text-white font-bold hover:bg-[#152915] cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: GPS VEHICLE TRACKING MODAL */}
      {showGpsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 animate-scaleIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    Vehicle GPS: {showGpsModal.vehicleNo}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Destination: {showGpsModal.destination}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGpsModal(null)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Driver:</span>
                  <span className="font-semibold text-slate-900">{showGpsModal.driverName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Gate Pass:</span>
                  <span className="font-mono text-slate-900">{showGpsModal.gatePassNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Telemetry Status:</span>
                  <span className="font-bold text-emerald-700">ONLINE (Signal 98%)</span>
                </div>
              </div>

              {/* Transit Steps */}
              <div className="relative pl-6 space-y-4 border-l-2 border-emerald-500 ml-3">
                <div className="relative">
                  <span className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white" />
                  <p className="font-bold text-slate-800">Outward Bay Clearance - OUT</p>
                  <p className="text-[10px] text-slate-400">16 Sep 2026, 10:25 - Outward Bay 02 Logged</p>
                </div>
                <div className="relative">
                  <span className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-amber-500 border-2 border-white animate-pulse" />
                  <p className="font-bold text-amber-800">In Transit – Express Freight Corridor</p>
                  <p className="text-[10px] text-slate-500">Speed: 58 km/h | En route NH-48</p>
                </div>
                <div className="relative opacity-50">
                  <span className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-slate-300 border-2 border-white" />
                  <p className="font-bold text-slate-700">Hub Receiving Bay Check-In</p>
                  <p className="text-[10px] text-slate-400">{showGpsModal.destination} – Inbound Dock</p>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowGpsModal(null)}
                  className="px-4 py-2 rounded-lg bg-[#1E3A1E] text-white font-bold hover:bg-[#152915] cursor-pointer"
                >
                  Close Tracking
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
