import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Eye, Ticket, MapPin, Check, X } from 'lucide-react'

export default function IssueDispatch() {
  // Toast notifications state
  const [toastMessage, setToastMessage] = useState(null)
  const triggerToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Filter toolbar state
  const [filterDispatchNo, setFilterDispatchNo] = useState('')
  const [filterPoIndent, setFilterPoIndent] = useState('')
  const [filterUnit, setFilterUnit] = useState('All Units')
  const [filterCategory, setFilterCategory] = useState('All Categories')
  const [dateRange, setDateRange] = useState('01 Sep 2026 - 16 Sep 2026')
  const [filterStatus, setFilterStatus] = useState('All Status')

  // Modals state
  const [showNewDispatchModal, setShowNewDispatchModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(null)
  const [showGatePassModal, setShowGatePassModal] = useState(null)
  const [showTrackModal, setShowTrackModal] = useState(null)
  const [activeActionRow, setActiveActionRow] = useState(null)
  const [selectedRows, setSelectedRows] = useState([1]) // First row selected by default

  // New Issue / Dispatch Form State
  const [newDispatch, setNewDispatch] = useState({
    dispatchNo: 'DISP-2026-325',
    poIndentNo: 'PO-2026-119',
    customerUnit: 'Metro Hypermarket Central Hub',
    shadeId: 'SH03',
    location: 'SH03-R02-C04',
    category: 'Packaged Food & FMCG',
    productName: 'Parle-G Glucose Biscuits (50g)',
    baseUnit: 'Pieces',
    packUnit: 'Gatta',
    unitsPerPack: 6,
    packsCount: 150,
    totalBaseQty: 900,
    dispatchType: 'Outward Sale',
    status: 'Pending',
    labStatus: 'Passed',
    labCertNo: 'LAB-2026-FMCG-088',
    expectedDelivery: '20 Sep 2026',
    vehicleNo: 'DL-01-EA-4412 (Tata 407)',
    driverName: 'Ramesh Kumar',
    contactNo: '+91 98110 44812',
    dispatchOfficer: 'Rajesh Sharma (Warehouse Manager)',
    remarks: 'Scheduled retail replenishment for Gurugram central distribution hub.',
  })

  // 10 Records (6 Shades origin, Base Units & Packaging, Lab QA Clearances)
  const [dispatches, setDispatches] = useState([
    {
      id: 1,
      dispatchNo: 'DISP-2026-324',
      date: '16 Sep 2026',
      poIndentNo: 'PO-2026-118',
      customerUnit: 'Metro Hypermarket Central Hub',
      items: 3,
      totalQty: 1850,
      packagingSummary: '240 Packs/Gatta',
      dispatchType: 'Outward Sale',
      status: 'In Transit',
      labStatus: 'Passed',
      expectedDelivery: '18 Sep 2026',
      vehicleNo: 'DL-01-EA-4412',
      driverName: 'Ramesh Kumar',
      officer: 'Rajesh Sharma (Manager)',
      itemsList: [
        { name: 'Parle-G Glucose Biscuits (50g)', sku: 'FMCG-BIS-01', location: 'SH03-R02-C04', qty: 1200, baseUnit: 'Pieces', packQty: 200, packUnit: 'Gatta', batch: 'BT-2026-FMCG-01', labCert: 'LAB-2026-FMCG-088' },
        { name: 'Fortune Refined Mustard Oil', sku: 'OIL-REF-01', location: 'SH02-R01-C03', qty: 450, baseUnit: 'Ltr', packQty: 30, packUnit: 'Tins (15L)', batch: 'BT-2026-OIL-02', labCert: 'LAB-2026-OIL-012' },
        { name: 'Tata Salt Crystal Iodized (1kg)', sku: 'FMCG-SLT-01', location: 'SH03-R01-C02', qty: 200, baseUnit: 'Packets', packQty: 10, packUnit: 'Bags', batch: 'BT-2026-FMCG-06', labCert: 'LAB-2026-FMCG-090' },
      ],
    },
    {
      id: 2,
      dispatchNo: 'DISP-2026-323',
      date: '16 Sep 2026',
      poIndentNo: 'IND-2026-045',
      customerUnit: 'Reliance Retail Distribution Centre',
      items: 2,
      totalQty: 2900,
      packagingSummary: '70 Bags/Bundles',
      dispatchType: 'Inter-Warehouse Transfer',
      status: 'Dispatched',
      labStatus: 'Passed',
      expectedDelivery: '17 Sep 2026',
      vehicleNo: 'UP-32-DK-9021',
      driverName: 'Suresh Yadav',
      officer: 'Amit Patel (Storekeeper)',
      itemsList: [
        { name: 'Sharbati Golden Wheat Grain', sku: 'GRN-WHT-01', location: 'SH01-R02-C05', qty: 2500, baseUnit: 'Kg', packQty: 50, packUnit: 'Bags (50kg)', batch: 'BT-2026-WHT-04', labCert: 'LAB-2026-GRN-019' },
        { name: 'Master 5-Ply Corrugated Cartons', sku: 'PKG-CRT-01', location: 'SH04-R03-C02', qty: 400, baseUnit: 'Boxes', packQty: 20, packUnit: 'Bundles', batch: 'BT-2026-PKG-03', labCert: 'CERT-NOT-REQ' },
      ],
    },
    {
      id: 3,
      dispatchNo: 'DISP-2026-322',
      date: '15 Sep 2026',
      poIndentNo: 'PO-2026-117',
      customerUnit: 'DMart Logistics Park',
      items: 2,
      totalQty: 2400,
      packagingSummary: '140 Gatta/Cans',
      dispatchType: 'Outward Sale',
      status: 'Delivered',
      labStatus: 'Passed',
      expectedDelivery: '16 Sep 2026',
      vehicleNo: 'MH-12-TR-7721',
      driverName: 'Manoj Patel',
      officer: 'Rajesh Sharma (Manager)',
      itemsList: [
        { name: 'Good Day Butter Cookies (75g)', sku: 'FMCG-BIS-02', location: 'SH03-R02-C05', qty: 2100, baseUnit: 'Pieces', packQty: 100, packUnit: 'Gatta', batch: 'BT-2026-FMCG-02', labCert: 'LAB-2026-FMCG-091' },
        { name: 'Disinfectant Surface Cleaner (5L)', sku: 'CHM-DIS-01', location: 'SH05-R01-C01', qty: 300, baseUnit: 'Ltr', packQty: 40, packUnit: 'Cans (5L)', batch: 'BT-2026-CHM-05', labCert: 'LAB-2026-CHM-008' },
      ],
    },
    {
      id: 4,
      dispatchNo: 'DISP-2026-321',
      date: '15 Sep 2026',
      poIndentNo: 'IND-2026-044',
      customerUnit: 'BigBasket Fulfillment Centre',
      items: 2,
      totalQty: 1300,
      packagingSummary: '60 Tins/Bags',
      dispatchType: 'Outward Sale',
      status: 'Pending',
      labStatus: 'Passed',
      expectedDelivery: '17 Sep 2026',
      vehicleNo: 'KA-04-BB-4402',
      driverName: 'Deepak Verma',
      officer: 'Priya Patel (QC Officer)',
      itemsList: [
        { name: 'Fortune Refined Mustard Oil', sku: 'OIL-REF-01', location: 'SH02-R01-C03', qty: 600, baseUnit: 'Ltr', packQty: 40, packUnit: 'Tins (15L)', batch: 'BT-2026-OIL-02', labCert: 'LAB-2026-OIL-012' },
        { name: 'Chana Dal Extra Bold (50kg)', sku: 'PUL-CHN-01', location: 'SH01-R06-C03', qty: 700, baseUnit: 'Kg', packQty: 20, packUnit: 'Bags (50kg)', batch: 'BT-2026-PUL-07', labCert: 'LAB-2026-PUL-015' },
      ],
    },
    {
      id: 5,
      dispatchNo: 'DISP-2026-320',
      date: '14 Sep 2026',
      poIndentNo: 'PO-2026-116',
      customerUnit: 'Blinkit Rapid Staging Hub',
      items: 2,
      totalQty: 950,
      packagingSummary: '110 Gatta/Tins',
      dispatchType: 'Outward Sale',
      status: 'Dispatched',
      labStatus: 'Passed',
      expectedDelivery: '15 Sep 2026',
      vehicleNo: 'HR-26-BK-3390',
      driverName: 'Vikram Singh',
      officer: 'Amit Patel (Storekeeper)',
      itemsList: [
        { name: 'Parle-G Glucose Biscuits (50g)', sku: 'FMCG-BIS-01', location: 'SH03-R02-C04', qty: 600, baseUnit: 'Pieces', packQty: 100, packUnit: 'Gatta', batch: 'BT-2026-FMCG-01', labCert: 'LAB-2026-FMCG-088' },
        { name: 'Refined Soybean Oil (15L)', sku: 'OIL-SOY-01', location: 'SH02-R03-C06', qty: 350, baseUnit: 'Ltr', packQty: 10, packUnit: 'Tins', batch: 'BT-2026-OIL-10', labCert: 'LAB-2026-OIL-014' },
      ],
    },
    {
      id: 6,
      dispatchNo: 'DISP-2026-319',
      date: '14 Sep 2026',
      poIndentNo: 'IND-2026-043',
      customerUnit: 'Spencers Wholesale Depot',
      items: 2,
      totalQty: 1780,
      packagingSummary: '75 Bundles/Cans',
      dispatchType: 'Outward Sale',
      status: 'Delivered',
      labStatus: 'Passed',
      expectedDelivery: '15 Sep 2026',
      vehicleNo: 'WB-02-SP-5589',
      driverName: 'Anil Roy',
      officer: 'Rajesh Sharma (Manager)',
      itemsList: [
        { name: 'Master 5-Ply Corrugated Cartons', sku: 'PKG-CRT-01', location: 'SH04-R03-C02', qty: 1500, baseUnit: 'Boxes', packQty: 60, packUnit: 'Bundles', batch: 'BT-2026-PKG-03', labCert: 'CERT-NOT-REQ' },
        { name: 'Industrial Floor Disinfectant', sku: 'CHM-DIS-01', location: 'SH05-R01-C01', qty: 280, baseUnit: 'Ltr', packQty: 15, packUnit: 'Cans', batch: 'BT-2026-CHM-05', labCert: 'LAB-2026-CHM-008' },
      ],
    },
    {
      id: 7,
      dispatchNo: 'DISP-2026-318',
      date: '13 Sep 2026',
      poIndentNo: 'PO-2026-115',
      customerUnit: 'Amazon Pantry Staging Bay',
      items: 2,
      totalQty: 1240,
      packagingSummary: '120 Gatta/Bags',
      dispatchType: 'Outward Sale',
      status: 'In Transit',
      labStatus: 'Passed',
      expectedDelivery: '17 Sep 2026',
      vehicleNo: 'DL-04-AZ-6620',
      driverName: 'Pradeep Shinde',
      officer: 'Priya Patel (QC Officer)',
      itemsList: [
        { name: 'Good Day Butter Cookies (75g)', sku: 'FMCG-BIS-02', location: 'SH03-R02-C05', qty: 720, baseUnit: 'Pieces', packQty: 60, packUnit: 'Gatta', batch: 'BT-2026-FMCG-02', labCert: 'LAB-2026-FMCG-091' },
        { name: 'Tata Salt Crystal Iodized (1kg)', sku: 'FMCG-SLT-01', location: 'SH03-R01-C02', qty: 520, baseUnit: 'Packets', packQty: 60, packUnit: 'Bags', batch: 'BT-2026-FMCG-06', labCert: 'LAB-2026-FMCG-090' },
      ],
    },
    {
      id: 8,
      dispatchNo: 'DISP-2026-317',
      date: '13 Sep 2026',
      poIndentNo: 'IND-2026-042',
      customerUnit: 'Flipkart Grocery Hub',
      items: 2,
      totalQty: 1200,
      packagingSummary: '40 Bags/Tins',
      dispatchType: 'Outward Sale',
      status: 'Delivered',
      labStatus: 'Passed',
      expectedDelivery: '15 Sep 2026',
      vehicleNo: 'HR-55-FK-0081',
      driverName: 'Brijesh Tiwari',
      officer: 'Rajesh Sharma (Manager)',
      itemsList: [
        { name: 'Sharbati Golden Wheat Grain', sku: 'GRN-WHT-01', location: 'SH01-R02-C05', qty: 900, baseUnit: 'Kg', packQty: 25, packUnit: 'Bags', batch: 'BT-2026-WHT-04', labCert: 'LAB-2026-GRN-019' },
        { name: 'Refined Mustard Oil (15L Tin)', sku: 'OIL-REF-01', location: 'SH02-R01-C03', qty: 300, baseUnit: 'Ltr', packQty: 15, packUnit: 'Tins', batch: 'BT-2026-OIL-02', labCert: 'LAB-2026-OIL-012' },
      ],
    },
    {
      id: 9,
      dispatchNo: 'DISP-2026-316',
      date: '12 Sep 2026',
      poIndentNo: 'PO-2026-114',
      customerUnit: 'Metro Hypermarket Central Hub',
      items: 1,
      totalQty: 15,
      packagingSummary: '15 Crates (Spares)',
      dispatchType: 'Inter-Warehouse Transfer',
      status: 'Cancelled',
      labStatus: 'Pending',
      expectedDelivery: '-',
      vehicleNo: '-',
      driverName: '-',
      officer: 'Amit Patel (Storekeeper)',
      itemsList: [
        { name: 'High-Speed Conveyor Rollers & Belts', sku: 'SPR-CNV-01', location: 'SH06-R02-C01', qty: 15, baseUnit: 'Nos', packQty: 15, packUnit: 'Crates', batch: 'BT-2026-SPR-09', labCert: 'PENDING-QC' },
      ],
    },
    {
      id: 10,
      dispatchNo: 'DISP-2026-315',
      date: '12 Sep 2026',
      poIndentNo: 'IND-2026-041',
      customerUnit: 'Reliance Retail Distribution Centre',
      items: 2,
      totalQty: 890,
      packagingSummary: '115 Gatta/Bundles',
      dispatchType: 'Outward Sale',
      status: 'Dispatched',
      labStatus: 'Passed',
      expectedDelivery: '14 Sep 2026',
      vehicleNo: 'UP-16-RR-9912',
      driverName: 'Ashok Mandal',
      officer: 'Rajesh Sharma (Manager)',
      itemsList: [
        { name: 'Parle-G Glucose Biscuits (50g)', sku: 'FMCG-BIS-01', location: 'SH03-R02-C04', qty: 600, baseUnit: 'Pieces', packQty: 100, packUnit: 'Gatta', batch: 'BT-2026-FMCG-01', labCert: 'LAB-2026-FMCG-088' },
        { name: 'Master 5-Ply Corrugated Cartons', sku: 'PKG-CRT-01', location: 'SH04-R03-C02', qty: 290, baseUnit: 'Boxes', packQty: 15, packUnit: 'Bundles', batch: 'BT-2026-PKG-03', labCert: 'CERT-NOT-REQ' },
      ],
    },
  ])

  // Filtered dispatches
  const filteredDispatches = useMemo(() => {
    return dispatches.filter((item) => {
      // Dispatch No filter
      if (
        filterDispatchNo.trim() &&
        !item.dispatchNo.toLowerCase().includes(filterDispatchNo.toLowerCase().trim())
      ) {
        return false
      }
      // PO/Indent No filter
      if (
        filterPoIndent.trim() &&
        !item.poIndentNo.toLowerCase().includes(filterPoIndent.toLowerCase().trim())
      ) {
        return false
      }
      // Customer/Unit filter
      if (filterUnit !== 'All Units' && item.customerUnit !== filterUnit) {
        return false
      }
      // Status filter
      if (filterStatus !== 'All Status' && item.status !== filterStatus) {
        return false
      }
      return true
    })
  }, [dispatches, filterDispatchNo, filterPoIndent, filterUnit, filterStatus])

  // Reset filter
  const handleResetFilters = () => {
    setFilterDispatchNo('')
    setFilterPoIndent('')
    setFilterUnit('All Units')
    setFilterCategory('All Categories')
    setDateRange('01 Sep 2026 - 16 Sep 2026')
    setFilterStatus('All Status')
    triggerToast('Filters reset to default view.')
  }

  // Handle row selection for Gate Pass or Details
  const toggleRowSelect = (id) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter((r) => r !== id))
    } else {
      setSelectedRows([...selectedRows, id])
    }
  }

  // Handle Submit New Dispatch
  const handleCreateDispatch = (e) => {
    e.preventDefault()

    if (newDispatch.labStatus && newDispatch.labStatus !== 'Passed') {
      triggerToast('Security Error: Cannot dispatch consignment with pending Lab clearance!')
      return
    }

    const calculatedBaseQty =
      Number(newDispatch.packsCount || 0) * Number(newDispatch.unitsPerPack || 1) ||
      Number(newDispatch.totalQty || 600)

    const newEntry = {
      id: dispatches.length + 1,
      dispatchNo: newDispatch.dispatchNo,
      date: '16 Sep 2026',
      poIndentNo: newDispatch.poIndentNo,
      customerUnit: newDispatch.customerUnit,
      items: 1,
      totalQty: calculatedBaseQty,
      packagingSummary: `${newDispatch.packsCount || 100} Packs (${newDispatch.packUnit || 'Gatta'})`,
      dispatchType: newDispatch.dispatchType,
      status: 'Pending',
      labStatus: newDispatch.labStatus || 'Passed',
      expectedDelivery: newDispatch.expectedDelivery,
      vehicleNo: newDispatch.vehicleNo,
      driverName: newDispatch.driverName,
      officer: newDispatch.dispatchOfficer,
      itemsList: [
        {
          name: newDispatch.productName || newDispatch.category,
          sku: 'FMCG-OUT-01',
          location: newDispatch.location || 'SH03-R02-C04',
          qty: calculatedBaseQty,
          baseUnit: newDispatch.baseUnit || 'Pieces',
          packQty: Number(newDispatch.packsCount || 100),
          packUnit: newDispatch.packUnit || 'Gatta',
          batch: 'BT-2026-FMCG-01',
          labCert: newDispatch.labCertNo || 'LAB-2026-FMCG-088',
        },
      ],
    }
    setDispatches([newEntry, ...dispatches])
    setShowNewDispatchModal(false)
    triggerToast(`Dispatch ${newDispatch.dispatchNo} recorded successfully!`)
  }

  // Status Badge Helper matching screenshot colors
  const getStatusBadge = (status) => {
    switch (status) {
      case 'In Transit':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#DBEAFE] text-[#1D4ED8]">
            In Transit
          </span>
        )
      case 'Dispatched':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#EDE9FE] text-[#6D28D9]">
            Dispatched
          </span>
        )
      case 'Delivered':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#DCFCE7] text-[#15803D]">
            Delivered
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
      'Dispatch No',
      'Date',
      'PO / Indent No',
      'Customer / Unit',
      'Items',
      'Total Qty',
      'Dispatch Type',
      'Status',
      'Expected Delivery',
    ]
    const rows = filteredDispatches.map((d) => [
      d.dispatchNo,
      d.date,
      d.poIndentNo,
      d.customerUnit,
      d.items,
      d.totalQty,
      d.dispatchType,
      d.status,
      d.expectedDelivery,
    ])
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `Dispatch_List_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    triggerToast('Dispatch list exported to CSV.')
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

      {/* PAGE HEADER ROW */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#1E3A1E] text-white flex items-center justify-center shadow-xs">
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
              <h2 className="text-lg font-bold text-slate-800">Issue / Dispatch</h2>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Manage outward issue, dispatch and delivery of stock items.</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Breadcrumb matching screenshot */}
          <nav className="text-xs text-slate-500 hidden lg:flex items-center gap-1.5 font-medium">
            <Link to="/dashboard" className="hover:text-slate-800 transition-colors">
              Home
            </Link>
            <span>&gt;</span>
            <span className="text-slate-600">Outward Operations</span>
            <span>&gt;</span>
            <span className="text-slate-800 font-semibold">Issue / Dispatch</span>
          </nav>

          {/* New Issue / Dispatch Action Button */}
          <button
            type="button"
            onClick={() => setShowNewDispatchModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1E3A1E] text-white text-xs font-semibold shadow-xs hover:bg-[#152915] active:scale-98 transition-all cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            <span>New Issue / Dispatch</span>
          </button>
        </div>
      </div>

      {/* 5 KPI STAT CARDS (SINGLE ROW) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Total Dispatches */}
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500 text-white flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500">Total Dispatches</p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-xl font-bold text-slate-800">324</span>
                <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                  ↑ 12%
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">This month</p>
            </div>
          </div>
        </div>

        {/* Items Dispatched (Units) */}
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
              {/* Paper airplane / dispatch arrow */}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500">Items Dispatched (Units)</p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-xl font-bold text-slate-800">12,580</span>
                <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                  ↑ 8%
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">vs last month</p>
            </div>
          </div>
        </div>

        {/* In Transit */}
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
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
              <p className="text-[11px] font-semibold text-slate-500">In Transit</p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-xl font-bold text-slate-800">18</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">5.6% of total</p>
            </div>
          </div>
        </div>

        {/* Delivered */}
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500">Delivered</p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-xl font-bold text-slate-800">296</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">91.4% of total</p>
            </div>
          </div>
        </div>

        {/* Pending Dispatch */}
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0">
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
              <p className="text-[11px] font-semibold text-slate-500">Pending Dispatch</p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-xl font-bold text-slate-800">10</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">3.1% of total</p>
            </div>
          </div>
        </div>
      </div>

      {/* FILTER TOOLBAR CARD */}
      <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 items-end">
          {/* Dispatch No */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Dispatch No.</label>
            <input
              type="text"
              placeholder="Enter dispatch no..."
              value={filterDispatchNo}
              onChange={(e) => setFilterDispatchNo(e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg focus:outline-hidden focus:border-[#1E3A1E] text-slate-700"
            />
          </div>

          {/* PO / Indent No */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">PO / Indent No.</label>
            <input
              type="text"
              placeholder="Enter PO / indent no..."
              value={filterPoIndent}
              onChange={(e) => setFilterPoIndent(e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg focus:outline-hidden focus:border-[#1E3A1E] text-slate-700"
            />
          </div>

          {/* Customer / Unit */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Customer / Unit</label>
            <select
              value={filterUnit}
              onChange={(e) => setFilterUnit(e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg focus:outline-hidden focus:border-[#1E3A1E] text-slate-700 bg-white"
            >
              <option value="All Units">All Customer Units</option>
              <option value="Metro Hypermarket Central Hub">Metro Hypermarket Central Hub</option>
              <option value="Reliance Retail Distribution Centre">Reliance Retail Distribution Centre</option>
              <option value="DMart Logistics Park">DMart Logistics Park</option>
              <option value="BigBasket Fulfillment Centre">BigBasket Fulfillment Centre</option>
              <option value="Blinkit Rapid Staging Hub">Blinkit Rapid Staging Hub</option>
              <option value="Spencers Wholesale Depot">Spencers Wholesale Depot</option>
              <option value="Amazon Pantry Staging Bay">Amazon Pantry Staging Bay</option>
              <option value="Flipkart Grocery Hub">Flipkart Grocery Hub</option>
            </select>
          </div>

          {/* Product Category */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Product Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg focus:outline-hidden focus:border-[#1E3A1E] text-slate-700 bg-white"
            >
              <option value="All Categories">All Categories</option>
              <option value="Shade 1: Grains & Bulk Pulses">Shade 1: Grains &amp; Bulk Pulses</option>
              <option value="Shade 2: Edible Oils & Liquids">Shade 2: Edible Oils &amp; Liquids</option>
              <option value="Shade 3: Packaged Food & FMCG">Shade 3: Packaged Food &amp; FMCG</option>
              <option value="Shade 4: Packaging Materials & Cartons">Shade 4: Packaging Materials &amp; Cartons</option>
              <option value="Shade 5: Chemicals & Hygiene">Shade 5: Chemicals &amp; Hygiene</option>
              <option value="Shade 6: Spares & General Goods">Shade 6: Spares &amp; General Goods</option>
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Date Range</label>
            <div className="relative">
              <input
                type="text"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
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
                <option value="In Transit">In Transit</option>
                <option value="Dispatched">Dispatched</option>
                <option value="Delivered">Delivered</option>
                <option value="Pending">Pending</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div className="flex items-end gap-1.5 pt-4">
              <button
                type="button"
                onClick={() => triggerToast(`Filtered results: ${filteredDispatches.length} dispatches found.`)}
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
        {/* LEFT COLUMN: DISPATCH TABLE CARD (SPAN 9) */}
        <div className="lg:col-span-9 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            {/* Table Header Row with Title & Action Buttons */}
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
                  Dispatch List ({filteredDispatches.length === 10 ? 324 : filteredDispatches.length})
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
                  onClick={() => {
                    const row = dispatches.find((d) => d.id === selectedRows[0]) || dispatches[0]
                    setShowGatePassModal(row)
                  }}
                  className="px-2.5 py-1 rounded bg-[#1E3A1E] text-white text-[11px] font-medium flex items-center gap-1 hover:bg-[#152915] active:scale-98 transition-all cursor-pointer"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span>Generate Gate Pass</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const row = dispatches.find((d) => d.id === selectedRows[0]) || dispatches[0]
                    setShowDetailsModal(row)
                  }}
                  className="px-2.5 py-1 rounded bg-[#1E3A1E] text-white text-[11px] font-medium flex items-center gap-1 hover:bg-[#152915] active:scale-98 transition-all cursor-pointer"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
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

            {/* Table wrapper with no-scrollbar styling */}
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
                    <th className="py-2.5 px-3">Dispatch No.</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">PO / Indent No.</th>
                    <th className="py-2.5 px-3">Customer / Unit</th>
                    <th className="py-2.5 px-3 text-center">Items</th>
                    <th className="py-2.5 px-3 text-right">Total Base Qty &amp; Packs</th>
                    <th className="py-2.5 px-3">Dispatch Type</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-center">Lab QC</th>
                    <th className="py-2.5 px-3">Expected Delivery</th>
                    <th className="py-2.5 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {filteredDispatches.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="py-8 text-center text-slate-400">
                        No dispatch records found matching your filters.
                      </td>
                    </tr>
                  ) : (
                    filteredDispatches.map((row) => (
                      <tr
                        key={row.id}
                        onClick={() => toggleRowSelect(row.id)}
                        className={`hover:bg-amber-50/40 transition-colors cursor-pointer ${
                          selectedRows.includes(row.id) ? 'bg-amber-50/50' : ''
                        }`}
                      >
                        <td className="py-2.5 px-3 text-center font-mono text-[11px] text-slate-500">
                          {row.id}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800 hover:text-blue-600 transition-colors">
                          {row.dispatchNo}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 text-[11px]">{row.date}</td>
                        <td className="py-2.5 px-3 text-slate-700 font-mono text-[11px]">
                          {row.poIndentNo}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-800">{row.customerUnit}</td>
                        <td className="py-2.5 px-3 text-center text-slate-600">{row.items}</td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="font-bold text-slate-900">{row.totalQty.toLocaleString()} Units</div>
                          {row.packagingSummary && (
                            <div className="text-[10px] text-slate-500 font-medium">{row.packagingSummary}</div>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 text-[11px]">{row.dispatchType}</td>
                        <td className="py-2.5 px-3 text-center">{getStatusBadge(row.status)}</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            ✓ {row.labStatus || 'Passed'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 text-[11px]">{row.expectedDelivery}</td>
                        <td className="py-2.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1 relative">
                            {/* View Eye Icon */}
                            <button
                              type="button"
                              onClick={() => setShowDetailsModal(row)}
                              title="View Dispatch Details"
                              className="p-1 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                              </svg>
                            </button>

                            {/* Options Dots Menu */}
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

                            {/* Dropdown Menu */}
                            {activeActionRow === row.id && (
                              <div className="absolute right-0 top-7 w-44 bg-white rounded-lg shadow-xl border border-slate-200 z-30 py-1 text-left text-xs divide-y divide-slate-100">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setShowDetailsModal(row)
                                    setActiveActionRow(null)
                                  }}
                                  className="w-full px-3 py-1.5 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                                  <span>View Details</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setShowGatePassModal(row)
                                    setActiveActionRow(null)
                                  }}
                                  className="w-full px-3 py-1.5 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                                >
                                  <Ticket className="w-3.5 h-3.5 text-slate-500" />
                                  <span>Generate Gate Pass</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setShowTrackModal(row)
                                    setActiveActionRow(null)
                                  }}
                                  className="w-full px-3 py-1.5 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                                >
                                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                                  <span>Track Convoy</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setDispatches(
                                      dispatches.map((d) =>
                                        d.id === row.id ? { ...d, status: 'Delivered' } : d
                                      )
                                    )
                                    setActiveActionRow(null)
                                    triggerToast(`Dispatch ${row.dispatchNo} marked as Delivered!`)
                                  }}
                                  className="w-full px-3 py-1.5 text-emerald-700 hover:bg-emerald-50 flex items-center gap-2 cursor-pointer"
                                >
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Mark Delivered</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Footer matching screenshot */}
          <div className="p-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
            <div>
              <span>Showing 1 to 10 of 324 records</span>
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
                33
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

        {/* RIGHT COLUMN: QUICK ACTIONS & DISPATCH TYPE DISTRIBUTION (SPAN 3) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Quick Actions Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs">
            <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
              <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <h3 className="text-xs font-bold text-slate-800">Quick Actions</h3>
            </div>
            <div className="divide-y divide-slate-100 text-xs">
              <button
                type="button"
                onClick={() => setShowNewDispatchModal(true)}
                className="w-full py-2 flex items-center gap-2.5 text-slate-700 hover:text-emerald-800 transition-colors text-left cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                <span>Create New Issue / Dispatch</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const row = dispatches[0]
                  setShowGatePassModal(row)
                }}
                className="w-full py-2 flex items-center gap-2.5 text-slate-700 hover:text-emerald-800 transition-colors text-left cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                  />
                </svg>
                <span>Generate Gate Pass</span>
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
                <span>Print Dispatch Note</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const row = dispatches.find((d) => d.status === 'In Transit') || dispatches[0]
                  setShowTrackModal(row)
                }}
                className="w-full py-2 flex items-center gap-2.5 text-slate-700 hover:text-emerald-800 transition-colors text-left cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span>Track Dispatch</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setDispatches(
                    dispatches.map((d) => (d.status === 'In Transit' ? { ...d, status: 'Delivered' } : d))
                  )
                  triggerToast('All active in-transit dispatches marked as Delivered.')
                }}
                className="w-full py-2 flex items-center gap-2.5 text-slate-700 hover:text-emerald-800 transition-colors text-left cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Mark as Delivered</span>
              </button>
              <button
                type="button"
                onClick={() => triggerToast('Return / Receive Back voucher opened for reverse logistics.')}
                className="w-full py-2 flex items-center gap-2.5 text-slate-700 hover:text-emerald-800 transition-colors text-left cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                  />
                </svg>
                <span>Return / Receive Back</span>
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
                <span>Download Dispatch Report</span>
              </button>
            </div>
          </div>

          {/* Dispatch Type Distribution Donut Chart Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs">
            <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
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
              {/* SVG Donut Chart matching screenshot */}
              <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                  {/* Circle background */}
                  <circle
                    cx="18"
                    cy="18"
                    r="15.9155"
                    fill="transparent"
                    stroke="#F1F5F9"
                    strokeWidth="4"
                  />
                  {/* Segment 1: Issue (48%) - Blue */}
                  <circle
                    cx="18"
                    cy="18"
                    r="15.9155"
                    fill="transparent"
                    stroke="#3B82F6"
                    strokeWidth="4.5"
                    strokeDasharray="48 52"
                    strokeDashoffset="0"
                  />
                  {/* Segment 2: Transfer (32%) - Green */}
                  <circle
                    cx="18"
                    cy="18"
                    r="15.9155"
                    fill="transparent"
                    stroke="#10B981"
                    strokeWidth="4.5"
                    strokeDasharray="32 68"
                    strokeDashoffset="-48"
                  />
                  {/* Segment 3: Return (8%) - Purple */}
                  <circle
                    cx="18"
                    cy="18"
                    r="15.9155"
                    fill="transparent"
                    stroke="#8B5CF6"
                    strokeWidth="4.5"
                    strokeDasharray="8 92"
                    strokeDashoffset="-80"
                  />
                  {/* Segment 4: Replacement (7%) - Orange */}
                  <circle
                    cx="18"
                    cy="18"
                    r="15.9155"
                    fill="transparent"
                    stroke="#F97316"
                    strokeWidth="4.5"
                    strokeDasharray="7 93"
                    strokeDashoffset="-88"
                  />
                  {/* Segment 5: Others (5%) - Cyan */}
                  <circle
                    cx="18"
                    cy="18"
                    r="15.9155"
                    fill="transparent"
                    stroke="#06B6D4"
                    strokeWidth="4.5"
                    strokeDasharray="5 95"
                    strokeDashoffset="-95"
                  />
                </svg>
                {/* Center text inside Donut */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-base font-extrabold text-slate-800 leading-tight">324</span>
                  <span className="text-[9px] font-medium text-slate-400">Dispatches</span>
                </div>
              </div>

              {/* Legend matching screenshot */}
              <div className="space-y-1.5 pl-2 text-[11px] text-slate-600 flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6] shrink-0" />
                    <span>Issue</span>
                  </div>
                  <span className="font-semibold text-slate-800">48% (156)</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] shrink-0" />
                    <span>Transfer</span>
                  </div>
                  <span className="font-semibold text-slate-800">32% (104)</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6] shrink-0" />
                    <span>Return</span>
                  </div>
                  <span className="font-semibold text-slate-800">8% (26)</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#F97316] shrink-0" />
                    <span>Replacement</span>
                  </div>
                  <span className="font-semibold text-slate-800">7% (22)</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#06B6D4] shrink-0" />
                    <span>Others</span>
                  </div>
                  <span className="font-semibold text-slate-800">5% (16)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LOWER SECTION: 3 WIDGETS SIDE-BY-SIDE UNDER TABLE & QUICK ACTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Widget 1: Dispatch Trend (Last 7 Days) */}
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
                <h3 className="text-xs font-bold text-slate-800">Dispatch Trend (Last 7 Days)</h3>
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-3 pt-2 text-[10px] text-slate-600">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#3B82F6]" />
                <span>Total Dispatches</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                <span>Delivered</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                <span>Pending</span>
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

                {/* Blue Line: Total Dispatches (points: 10 Sep: 20 -> 16 Sep: 36) */}
                <polyline
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="2"
                  points="35,88 85,82 135,86 185,78 235,66 285,60 335,56"
                />
                {/* Points on Blue line */}
                <circle cx="35" cy="88" r="2.5" fill="#3B82F6" />
                <circle cx="85" cy="82" r="2.5" fill="#3B82F6" />
                <circle cx="135" cy="86" r="2.5" fill="#3B82F6" />
                <circle cx="185" cy="78" r="2.5" fill="#3B82F6" />
                <circle cx="235" cy="66" r="2.5" fill="#3B82F6" />
                <circle cx="285" cy="60" r="2.5" fill="#3B82F6" />
                <circle cx="335" cy="56" r="2.5" fill="#3B82F6" />

                {/* Green Line: Delivered */}
                <polyline
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="2"
                  points="35,102 85,98 135,93 185,96 235,82 285,82 335,76"
                />
                <circle cx="35" cy="102" r="2.5" fill="#10B981" />
                <circle cx="85" cy="98" r="2.5" fill="#10B981" />
                <circle cx="135" cy="93" r="2.5" fill="#10B981" />
                <circle cx="185" cy="96" r="2.5" fill="#10B981" />
                <circle cx="235" cy="82" r="2.5" fill="#10B981" />
                <circle cx="285" cy="82" r="2.5" fill="#10B981" />
                <circle cx="335" cy="76" r="2.5" fill="#10B981" />

                {/* Orange Line: Pending */}
                <polyline
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="2"
                  points="35,110 85,110 135,114 185,110 235,108 285,108 335,105"
                />
                <circle cx="35" cy="110" r="2.5" fill="#F59E0B" />
                <circle cx="85" cy="110" r="2.5" fill="#F59E0B" />
                <circle cx="135" cy="114" r="2.5" fill="#F59E0B" />
                <circle cx="185" cy="110" r="2.5" fill="#F59E0B" />
                <circle cx="235" cy="108" r="2.5" fill="#F59E0B" />
                <circle cx="285" cy="108" r="2.5" fill="#F59E0B" />
                <circle cx="335" cy="105" r="2.5" fill="#F59E0B" />

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

        {/* Widget 2: Top 5 Products by Dispatch Quantity */}
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
              <h3 className="text-xs font-bold text-slate-800">Top 5 Products by Dispatch Quantity</h3>
            </div>

            {/* 5 Progress Bars matching screenshot */}
            <div className="space-y-2.5 pt-3">
              {/* Product 1 */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700">1. &nbsp;Parle-G Glucose Biscuits (Pieces)</span>
                  <span className="font-bold text-slate-800">3,850</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-[#15803D] h-full rounded-full" style={{ width: '85%' }} />
                </div>
              </div>

              {/* Product 2 */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700">2. &nbsp;Sharbati Golden Wheat (Kg)</span>
                  <span className="font-bold text-slate-800">3,400</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-[#15803D] h-full rounded-full" style={{ width: '74%' }} />
                </div>
              </div>

              {/* Product 3 */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700">3. &nbsp;Fortune Refined Mustard Oil (Ltr)</span>
                  <span className="font-bold text-slate-800">1,920</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-[#15803D] h-full rounded-full" style={{ width: '48%' }} />
                </div>
              </div>

              {/* Product 4 */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700">4. &nbsp;Master 5-Ply Cartons (Boxes)</span>
                  <span className="font-bold text-slate-800">1,450</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-[#15803D] h-full rounded-full" style={{ width: '38%' }} />
                </div>
              </div>

              {/* Product 5 */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700">5. &nbsp;Good Day Butter Cookies (Pieces)</span>
                  <span className="font-bold text-slate-800">1,280</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-[#15803D] h-full rounded-full" style={{ width: '32%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Widget 3: Recent Dispatches */}
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="text-xs font-bold text-slate-800">Recent Dispatches</h3>
              </div>
              <button
                type="button"
                onClick={() => triggerToast('Viewing all 324 dispatch activity logs.')}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-0.5 cursor-pointer"
              >
                <span>View All</span>
                <span>&rarr;</span>
              </button>
            </div>

            {/* 4 Activity Items matching screenshot */}
            <div className="space-y-3 pt-2.5">
              {/* Item 1 */}
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 leading-tight">
                    DISP-2026-324 - 1,850 units (240 Gatta)
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Dispatched to Metro Hypermarket Central Hub | 16 Sep 2026, 10:20
                  </p>
                </div>
              </div>

              {/* Item 2 */}
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 leading-tight">
                    DISP-2026-323 - 2,900 units (70 Bags)
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Dispatched to Reliance Retail Distribution Centre | 16 Sep 2026, 09:45
                  </p>
                </div>
              </div>

              {/* Item 3 */}
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 leading-tight">
                    DISP-2026-322 - 2,400 units (140 Gatta)
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Delivered to DMart Logistics Park | 15 Sep 2026, 17:30
                  </p>
                </div>
              </div>

              {/* Item 4 */}
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 leading-tight">
                    DISP-2026-321 - 1,300 units (60 Tins)
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Pending dispatch to BigBasket | 15 Sep 2026, 14:10
                  </p>
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
            Secure
          </span>
          <span className="text-slate-500">|</span>
          <span>Confidential</span>
          <span className="text-slate-500">|</span>
          <span>For Official Use Only</span>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <span className="text-emerald-400 font-bold">CENTRAL WAREHOUSE LOGISTICS</span>
          <span>Outward Operations Management v2.0</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-300">Developed for a Stronger &amp; Self-Reliant Nation</span>
          <div className="flex w-5 h-3 rounded-xs overflow-hidden border border-white/20">
            <div className="bg-[#FF9933] flex-1" />
            <div className="bg-white flex-1" />
            <div className="bg-[#128807] flex-1" />
          </div>
        </div>
      </div>

      {/* MODAL 1: NEW ISSUE / DISPATCH MODAL */}
      {showNewDispatchModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 animate-scaleIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#1E3A1E] text-white flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">New Outward Issue / Dispatch</h3>
                  <p className="text-xs text-slate-500">Initiate outward stock clearance and gate pass</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowNewDispatchModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDispatch} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Dispatch Reference No.</label>
                  <input
                    type="text"
                    required
                    value={newDispatch.dispatchNo}
                    onChange={(e) => setNewDispatch({ ...newDispatch, dispatchNo: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono text-slate-800 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">PO / Indent Reference No.</label>
                  <input
                    type="text"
                    required
                    value={newDispatch.poIndentNo}
                    onChange={(e) => setNewDispatch({ ...newDispatch, poIndentNo: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Customer / Consignee Unit</label>
                  <select
                    value={newDispatch.customerUnit}
                    onChange={(e) => setNewDispatch({ ...newDispatch, customerUnit: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-800 bg-white"
                  >
                    <option value="Metro Hypermarket Central Hub">Metro Hypermarket Central Hub</option>
                    <option value="Reliance Retail Distribution Centre">Reliance Retail Distribution Centre</option>
                    <option value="DMart Logistics Park">DMart Logistics Park</option>
                    <option value="BigBasket Fulfillment Centre">BigBasket Fulfillment Centre</option>
                    <option value="Blinkit Rapid Staging Hub">Blinkit Rapid Staging Hub</option>
                    <option value="Spencers Wholesale Depot">Spencers Wholesale Depot</option>
                    <option value="Amazon Pantry Staging Bay">Amazon Pantry Staging Bay</option>
                    <option value="Flipkart Grocery Hub">Flipkart Grocery Hub</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Dispatch Type</label>
                  <select
                    value={newDispatch.dispatchType}
                    onChange={(e) => setNewDispatch({ ...newDispatch, dispatchType: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-800 bg-white"
                  >
                    <option value="Outward Sale">Outward Sale / Delivery</option>
                    <option value="Inter-Warehouse Transfer">Inter-Warehouse Transfer</option>
                    <option value="Supplier Return">Supplier Return (Rejection)</option>
                    <option value="Replacement">Customer Replacement</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Source Shade &amp; Category</label>
                  <select
                    value={newDispatch.category}
                    onChange={(e) => setNewDispatch({ ...newDispatch, category: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-800 bg-white"
                  >
                    <option value="Shade 3: Packaged Food & FMCG">Shade 3: Packaged Food &amp; FMCG</option>
                    <option value="Shade 1: Grains & Bulk Pulses">Shade 1: Grains &amp; Bulk Pulses</option>
                    <option value="Shade 2: Edible Oils & Liquids">Shade 2: Edible Oils &amp; Liquids</option>
                    <option value="Shade 4: Packaging Materials & Cartons">Shade 4: Packaging Materials &amp; Cartons</option>
                    <option value="Shade 5: Chemicals & Hygiene">Shade 5: Chemicals &amp; Hygiene</option>
                    <option value="Shade 6: Spares & General Goods">Shade 6: Spares &amp; General Goods</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Origin Storage Bin</label>
                    <input
                      type="text"
                      value={newDispatch.location}
                      onChange={(e) => setNewDispatch({ ...newDispatch, location: e.target.value })}
                      placeholder="e.g. SH03-R02-C04"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-800 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Total Base Qty Units</label>
                    <input
                      type="number"
                      value={newDispatch.totalQty}
                      onChange={(e) => setNewDispatch({ ...newDispatch, totalQty: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-800 font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Vehicle / Transport Truck No.</label>
                  <input
                    type="text"
                    value={newDispatch.vehicleNo}
                    onChange={(e) => setNewDispatch({ ...newDispatch, vehicleNo: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Driver Name &amp; Contact</label>
                  <input
                    type="text"
                    value={newDispatch.driverName}
                    onChange={(e) => setNewDispatch({ ...newDispatch, driverName: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Expected Delivery Date</label>
                  <input
                    type="text"
                    value={newDispatch.expectedDelivery}
                    onChange={(e) => setNewDispatch({ ...newDispatch, expectedDelivery: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Dispatching Officer</label>
                  <input
                    type="text"
                    value={newDispatch.dispatchOfficer}
                    onChange={(e) => setNewDispatch({ ...newDispatch, dispatchOfficer: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Remarks &amp; Dispatch Instructions</label>
                <textarea
                  rows={2}
                  value={newDispatch.remarks}
                  onChange={(e) => setNewDispatch({ ...newDispatch, remarks: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowNewDispatchModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 cursor-pointer font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#1E3A1E] text-white font-semibold hover:bg-[#152915] cursor-pointer shadow-md"
                >
                  Submit &amp; Generate Dispatch Slip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: DISPATCH DETAILS MODAL */}
      {showDetailsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 animate-scaleIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
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
                    Dispatch Voucher: {showDetailsModal.dispatchNo}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">PO: {showDetailsModal.poIndentNo}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDetailsModal(null)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Consignee Unit</span>
                  <span className="font-bold text-slate-800 text-sm">{showDetailsModal.customerUnit}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Dispatch Status</span>
                  <div className="mt-0.5">{getStatusBadge(showDetailsModal.status)}</div>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Dispatch Date</span>
                  <span className="font-semibold text-slate-700">{showDetailsModal.date}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Expected Delivery</span>
                  <span className="font-semibold text-slate-700">{showDetailsModal.expectedDelivery}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Commercial Vehicle No.</span>
                  <span className="font-mono text-slate-800">{showDetailsModal.vehicleNo}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Driver / Transporter</span>
                  <span className="font-semibold text-slate-800">{showDetailsModal.driverName}</span>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <h4 className="font-bold text-slate-800 mb-2">Itemized Outward Cargo Manifest</h4>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-600 font-semibold">
                      <tr>
                        <th className="py-2 px-3">Item Description</th>
                        <th className="py-2 px-3">Storage Bin</th>
                        <th className="py-2 px-3">Batch &amp; QC</th>
                        <th className="py-2 px-3 text-right">Base Quantity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {showDetailsModal.itemsList?.map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-2 px-3">
                            <span className="font-medium text-slate-800 block">{item.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{item.sku}</span>
                          </td>
                          <td className="py-2 px-3 font-mono text-emerald-700 font-bold">{item.location || 'SH03-R02-C04'}</td>
                          <td className="py-2 px-3">
                            <span className="font-mono text-slate-700 block">{item.batch}</span>
                            <span className="text-[10px] text-emerald-600 font-semibold">QA: {item.labCert || 'LAB-PASSED'}</span>
                          </td>
                          <td className="py-2 px-3 text-right">
                            <span className="font-bold text-slate-800 block">{item.qty?.toLocaleString()} {item.baseUnit || 'Units'}</span>
                            {item.packQty && (
                              <span className="text-[10px] text-slate-500 font-medium">({item.packQty} {item.packUnit})</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Barcode & Security stamp */}
              <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl border border-amber-200">
                <div className="space-y-1 font-mono text-[10px] text-slate-600">
                  <p className="font-bold text-slate-800">AUTH: WH-CENTRAL-DSP-{showDetailsModal.id}992</p>
                  <p>Gate Clearance: GRANTED &amp; QA STAMPED</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-1 rounded border border-emerald-300">
                    CENTRAL LOGISTICS HUB QA CLEARED
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 cursor-pointer font-medium"
                >
                  Print Voucher
                </button>
                <button
                  type="button"
                  onClick={() => setShowDetailsModal(null)}
                  className="px-5 py-2 rounded-lg bg-[#1E3A1E] text-white font-semibold hover:bg-[#152915] cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: GENERATE GATE PASS OUT MODAL */}
      {showGatePassModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 animate-scaleIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
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
                  <h3 className="text-base font-bold text-slate-800">Gate Pass Out (Security)</h3>
                  <p className="text-xs text-slate-500 font-mono">GP-{showGatePassModal.dispatchNo}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGatePassModal(null)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-xs">
              <div className="border border-dashed border-emerald-500 bg-emerald-50/50 p-4 rounded-xl text-center space-y-2">
                <p className="text-[10px] uppercase tracking-widest font-bold text-emerald-800">
                  CENTRAL WAREHOUSE OUTWARD LOGISTICS GATE PASS
                </p>
                <div className="text-2xl font-mono font-black text-slate-800 tracking-wider">
                  GP-{showGatePassModal.dispatchNo}
                </div>
                <p className="text-[11px] text-slate-600">
                  Vehicle: <span className="font-semibold">{showGatePassModal.vehicleNo}</span> | Driver:{' '}
                  <span className="font-semibold">{showGatePassModal.driverName}</span>
                </p>
                <p className="text-[11px] text-slate-600">
                  Consignee: <span className="font-semibold">{showGatePassModal.customerUnit}</span>
                </p>
                <div className="pt-2">
                  <span className="inline-block px-3 py-1 bg-emerald-700 text-white font-bold rounded text-[10px] uppercase tracking-wider">
                    CLEARED FOR DEPARTURE
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGatePassModal(null)}
                  className="px-4 py-1.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowGatePassModal(null)
                    triggerToast(`Gate Pass issued for ${showGatePassModal.dispatchNo}!`)
                  }}
                  className="px-4 py-1.5 rounded-lg bg-[#1E3A1E] text-white font-semibold hover:bg-[#152915] cursor-pointer"
                >
                  Authorize Gate Pass Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: TRACK DISPATCH / FREIGHT TRANSIT MODAL */}
      {showTrackModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 animate-scaleIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">Track Freight Transit</h3>
                  <p className="text-xs text-slate-500 font-mono">{showTrackModal.dispatchNo}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowTrackModal(null)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="flex justify-between font-semibold text-slate-700">
                  <span>Destination Hub:</span>
                  <span className="text-slate-900">{showTrackModal.customerUnit}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Vehicle Carrier:</span>
                  <span>{showTrackModal.vehicleNo}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Current GPS Beacon:</span>
                  <span className="text-emerald-700 font-mono font-semibold">En Route NH-48 Express Corridor</span>
                </div>
              </div>

              {/* Transit Steps */}
              <div className="relative pl-6 space-y-4 border-l-2 border-emerald-500 ml-3">
                <div className="relative">
                  <span className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white" />
                  <p className="font-bold text-slate-800">Warehouse Gate Clearance - OUT</p>
                  <p className="text-[10px] text-slate-400">16 Sep 2026, 10:20 - Passed Outward Gate 02</p>
                </div>
                <div className="relative">
                  <span className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white" />
                  <p className="font-bold text-slate-800">Toll Plaza &amp; Weight Sensor Check</p>
                  <p className="text-[10px] text-slate-400">16 Sep 2026, 12:45 - Verified seal integrity &amp; gross weight</p>
                </div>
                <div className="relative">
                  <span className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-amber-500 border-2 border-white animate-pulse" />
                  <p className="font-bold text-amber-800">Highway Transit Active</p>
                  <p className="text-[10px] text-slate-500">In transit towards {showTrackModal.customerUnit}</p>
                </div>
                <div className="relative opacity-50">
                  <span className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-slate-300 border-2 border-white" />
                  <p className="font-bold text-slate-700">Consignee Receiving &amp; Delivery</p>
                  <p className="text-[10px] text-slate-400">Expected: {showTrackModal.expectedDelivery}</p>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowTrackModal(null)}
                  className="px-4 py-2 rounded-lg bg-[#1E3A1E] text-white font-semibold hover:bg-[#152915] cursor-pointer"
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
