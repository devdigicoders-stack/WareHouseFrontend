import { useState, useMemo, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Truck,
  Send,
  Package,
  Layers,
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
  ArrowUpRight,
  Calendar,
  User,
  FileText,
  QrCode,
  Warehouse,
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

// 6 Dedicated Warehouse Storage Shades
const SHADES = [
  { id: 'SH01', name: 'Shade 1: Grains & Bulk Pulses', category: 'Grains & Pulses', baseUnit: 'Kg', packUnit: 'Bags (50kg)', unitsPerPack: 50 },
  { id: 'SH02', name: 'Shade 2: Edible Oils & Liquids', category: 'Edible Oils', baseUnit: 'Ltr', packUnit: 'Tins (15L)', unitsPerPack: 15 },
  { id: 'SH03', name: 'Shade 3: Packaged Food & FMCG', category: 'Packaged FMCG', baseUnit: 'Pieces', packUnit: 'Gatta (Cartons)', unitsPerPack: 6 },
  { id: 'SH04', name: 'Shade 4: Packaging Materials & Cartons', category: 'Packaging', baseUnit: 'Cartons', packUnit: 'Bundles', unitsPerPack: 25 },
  { id: 'SH05', name: 'Shade 5: Chemicals & Hygiene', category: 'Chemicals', baseUnit: 'Ltr', packUnit: 'Carboys (20L)', unitsPerPack: 20 },
  { id: 'SH06', name: 'Shade 6: Spares & General Goods', category: 'Spares', baseUnit: 'Nos', packUnit: 'Crates', unitsPerPack: 10 },
]

export default function IssueDispatch() {
  // Toast notifications state
  const [toastMessage, setToastMessage] = useState(null)
  const triggerToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Filter toolbar state
  const [filterType, setFilterType] = useState('ALL')
  const [filterShade, setFilterShade] = useState('ALL')
  const [filterCustomer, setFilterCustomer] = useState('ALL')
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const perPage = 7

  // Modals state
  const [showNewDispatchModal, setShowNewDispatchModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(null)
  const [showGatePassModal, setShowGatePassModal] = useState(null)

  // New Issue / Dispatch Form State
  const [newDispatch, setNewDispatch] = useState({
    customerUnit: 'Metro Hypermarket Central Hub',
    poIndentNo: 'PO-2026-119',
    shadeId: 'SH03',
    location: 'SH03-R02-C04',
    productName: 'Parle-G Glucose Biscuits (50g)',
    sku: 'FMCG-BIS-01',
    batchNo: 'BT-2026-FMCG-01',
    baseUnit: 'Pieces',
    packUnit: 'Gatta',
    unitsPerPack: 6,
    packsCount: 150,
    dispatchType: 'Outward Sale',
    vehicleNo: 'DL-01-EA-4412',
    driverName: 'Ramesh Kumar',
    contactNo: '+91 98110 44812',
    dispatchOfficer: 'Rajesh Sharma (Warehouse Manager)',
    expectedDelivery: '20 Sep 2026',
    remarks: 'Scheduled retail replenishment for Gurugram central distribution hub.',
  })

  // 8 Rich Outward Dispatch Records
  const [dispatches, setDispatches] = useState([
    {
      id: 1,
      dispatchNo: 'DISP-2026-324',
      date: '16 Sep 2026',
      poIndentNo: 'PO-2026-118',
      customerUnit: 'Metro Hypermarket Central Hub',
      shadeId: 'SH03',
      location: 'SH03-R02-C04',
      productName: 'Parle-G Glucose Biscuits (50g)',
      sku: 'FMCG-BIS-01',
      itemsCount: 3,
      totalQty: 1850,
      baseUnit: 'Pieces',
      packCount: 240,
      packUnit: 'Gatta',
      dispatchType: 'Outward Sale',
      status: 'In Transit',
      labStatus: 'Passed',
      expectedDelivery: '18 Sep 2026',
      vehicleNo: 'DL-01-EA-4412',
      driverName: 'Ramesh Kumar',
      officer: 'Rajesh Sharma',
      remarks: 'Scheduled replenishment for North Delhi retail hubs.',
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
      shadeId: 'SH01',
      location: 'SH01-R02-C05',
      productName: 'Sharbati Golden Wheat Grain',
      sku: 'GRN-WHT-01',
      itemsCount: 2,
      totalQty: 2900,
      baseUnit: 'Kg',
      packCount: 70,
      packUnit: 'Bags (50kg)',
      dispatchType: 'Inter-Warehouse Transfer',
      status: 'Dispatched',
      labStatus: 'Passed',
      expectedDelivery: '17 Sep 2026',
      vehicleNo: 'UP-32-DK-9021',
      driverName: 'Suresh Yadav',
      officer: 'Amit Patel',
      remarks: 'Transferred under Inter-State branch stock reallocation.',
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
      shadeId: 'SH03',
      location: 'SH03-R02-C05',
      productName: 'Good Day Butter Cookies (75g)',
      sku: 'FMCG-BIS-02',
      itemsCount: 2,
      totalQty: 2400,
      baseUnit: 'Pieces',
      packCount: 140,
      packUnit: 'Gatta',
      dispatchType: 'Outward Sale',
      status: 'Delivered',
      labStatus: 'Passed',
      expectedDelivery: '16 Sep 2026',
      vehicleNo: 'MH-12-TR-7721',
      driverName: 'Manoj Patel',
      officer: 'Rajesh Sharma',
      remarks: 'Consignment cleared at DMart inbound dock successfully.',
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
      shadeId: 'SH02',
      location: 'SH02-R01-C03',
      productName: 'Fortune Refined Mustard Oil',
      sku: 'OIL-REF-01',
      itemsCount: 2,
      totalQty: 1300,
      baseUnit: 'Ltr',
      packCount: 60,
      packUnit: 'Tins (15L)',
      dispatchType: 'Outward Sale',
      status: 'Pending',
      labStatus: 'Passed',
      expectedDelivery: '17 Sep 2026',
      vehicleNo: 'KA-04-BB-4402',
      driverName: 'Deepak Verma',
      officer: 'Priya Patel',
      remarks: 'Awaiting transport fleet vehicle staging at Bay 3.',
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
      shadeId: 'SH03',
      location: 'SH03-R02-C04',
      productName: 'Parle-G Glucose Biscuits (50g)',
      sku: 'FMCG-BIS-01',
      itemsCount: 2,
      totalQty: 950,
      baseUnit: 'Pieces',
      packCount: 110,
      packUnit: 'Gatta',
      dispatchType: 'Outward Sale',
      status: 'Dispatched',
      labStatus: 'Passed',
      expectedDelivery: '15 Sep 2026',
      vehicleNo: 'HR-26-BK-3390',
      driverName: 'Vikram Singh',
      officer: 'Amit Patel',
      remarks: 'Express dispatch for quick-commerce replenishment.',
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
      shadeId: 'SH04',
      location: 'SH04-R03-C02',
      productName: 'Master 5-Ply Corrugated Cartons',
      sku: 'PKG-CRT-01',
      itemsCount: 2,
      totalQty: 1780,
      baseUnit: 'Cartons',
      packCount: 75,
      packUnit: 'Bundles',
      dispatchType: 'Outward Sale',
      status: 'Delivered',
      labStatus: 'Passed',
      expectedDelivery: '15 Sep 2026',
      vehicleNo: 'WB-02-SP-5589',
      driverName: 'Anil Roy',
      officer: 'Rajesh Sharma',
      remarks: 'Delivered on schedule with complete transit gate pass voucher.',
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
      shadeId: 'SH03',
      location: 'SH03-R01-C06',
      productName: 'Tata Tea Gold (500g)',
      sku: 'FMCG-TEA-02',
      itemsCount: 2,
      totalQty: 1240,
      baseUnit: 'Pieces',
      packCount: 120,
      packUnit: 'Gatta',
      dispatchType: 'Outward Sale',
      status: 'In Transit',
      labStatus: 'Passed',
      expectedDelivery: '17 Sep 2026',
      vehicleNo: 'DL-04-AZ-6620',
      driverName: 'Pradeep Shinde',
      officer: 'Priya Patel',
      remarks: 'Route via Eastern Peripheral Expressway with live vehicle tracking.',
      itemsList: [
        { name: 'Tata Tea Gold (500g)', sku: 'FMCG-TEA-02', location: 'SH03-R01-C06', qty: 840, baseUnit: 'Pieces', packQty: 70, packUnit: 'Gatta', batch: 'BT-2026-TEA-09', labCert: 'LAB-2026-TEA-044' },
        { name: 'Aashirvaad Select Sharbati Atta', sku: 'GRN-ATA-02', location: 'SH01-R03-C02', qty: 400, baseUnit: 'Kg', packQty: 50, packUnit: 'Bags (10kg)', batch: 'BT-2026-ATA-03', labCert: 'LAB-2026-GRN-020' },
      ],
    },
    {
      id: 8,
      dispatchNo: 'DISP-2026-317',
      date: '13 Sep 2026',
      poIndentNo: 'IND-2026-042',
      customerUnit: 'Flipkart Grocery Hub',
      shadeId: 'SH01',
      location: 'SH01-R04-C02',
      productName: 'Moong Dal Mogar Yellow',
      sku: 'PUL-MNG-01',
      itemsCount: 2,
      totalQty: 3200,
      baseUnit: 'Kg',
      packCount: 80,
      packUnit: 'Bags (50kg)',
      dispatchType: 'Inter-Warehouse Transfer',
      status: 'Delivered',
      labStatus: 'Passed',
      expectedDelivery: '14 Sep 2026',
      vehicleNo: 'HR-55-FK-1109',
      driverName: 'Harish Rawat',
      officer: 'Amit Patel',
      remarks: 'Reconciliation completed. Physical bags tallied 100% with gate register.',
      itemsList: [
        { name: 'Moong Dal Mogar Yellow', sku: 'PUL-MNG-01', location: 'SH01-R04-C02', qty: 2500, baseUnit: 'Kg', packQty: 50, packUnit: 'Bags (50kg)', batch: 'BT-2026-PUL-02', labCert: 'LAB-2026-PUL-011' },
        { name: 'Sunflower Light Edible Oil', sku: 'OIL-SNF-01', location: 'SH02-R02-C04', qty: 700, baseUnit: 'Ltr', packQty: 30, packUnit: 'Tins (15L)', batch: 'BT-2026-OIL-09', labCert: 'LAB-2026-OIL-016' },
      ],
    },
  ])

  // Filtered Dispatches
  const filteredDispatches = useMemo(() => {
    return dispatches.filter((item) => {
      if (filterType !== 'ALL' && item.dispatchType !== filterType) return false
      if (filterShade !== 'ALL' && item.shadeId !== filterShade) return false
      if (filterCustomer !== 'ALL' && item.customerUnit !== filterCustomer) return false
      if (filterStatus !== 'ALL' && item.status !== filterStatus) return false

      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase()
        return (
          item.dispatchNo.toLowerCase().includes(q) ||
          item.poIndentNo.toLowerCase().includes(q) ||
          item.customerUnit.toLowerCase().includes(q) ||
          item.productName.toLowerCase().includes(q) ||
          item.vehicleNo.toLowerCase().includes(q) ||
          item.driverName.toLowerCase().includes(q) ||
          item.location.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [dispatches, filterType, filterShade, filterCustomer, filterStatus, searchQuery])

  // Paginated Results
  const totalPages = Math.max(1, Math.ceil(filteredDispatches.length / perPage))
  const paginatedDispatches = filteredDispatches.slice((currentPage - 1) * perPage, currentPage * perPage)

  // Dynamic KPI Stats
  const stats = useMemo(() => {
    const total = dispatches.length
    const totalUnits = dispatches.reduce((acc, d) => acc + (d.totalQty || 0), 0)
    const inTransit = dispatches.filter((d) => d.status === 'In Transit').length
    const delivered = dispatches.filter((d) => d.status === 'Delivered').length
    return { total, totalUnits, inTransit, delivered }
  }, [dispatches])

  // Handle Save New Dispatch
  const handleCreateDispatch = (e) => {
    e.preventDefault()
    const computedBase = (Number(newDispatch.packsCount) || 0) * (Number(newDispatch.unitsPerPack) || 1)
    const newNo = `DISP-2026-${325 + dispatches.length}`
    const locCode = `${newDispatch.shadeId}-R01-C01`

    const newRecord = {
      id: Date.now(),
      dispatchNo: newNo,
      date: 'Today, Just now',
      poIndentNo: newDispatch.poIndentNo,
      customerUnit: newDispatch.customerUnit,
      shadeId: newDispatch.shadeId,
      location: locCode,
      productName: newDispatch.productName,
      sku: newDispatch.sku,
      itemsCount: 1,
      totalQty: computedBase,
      baseUnit: newDispatch.baseUnit,
      packCount: Number(newDispatch.packsCount) || 1,
      packUnit: newDispatch.packUnit,
      dispatchType: newDispatch.dispatchType,
      status: 'Pending',
      labStatus: 'Passed',
      expectedDelivery: newDispatch.expectedDelivery,
      vehicleNo: newDispatch.vehicleNo,
      driverName: newDispatch.driverName,
      officer: newDispatch.dispatchOfficer,
      remarks: newDispatch.remarks,
      itemsList: [
        {
          name: newDispatch.productName,
          sku: newDispatch.sku,
          location: locCode,
          qty: computedBase,
          baseUnit: newDispatch.baseUnit,
          packQty: Number(newDispatch.packsCount) || 1,
          packUnit: newDispatch.packUnit,
          batch: newDispatch.batchNo,
          labCert: 'LAB-2026-CLEAR-01',
        },
      ],
    }

    setDispatches([newRecord, ...dispatches])
    setShowNewDispatchModal(false)
    triggerToast(`Dispatch ${newNo} created successfully (${computedBase} ${newRecord.baseUnit}).`)
  }

  // Handle Advance Status
  const handleAdvanceStatus = (id) => {
    setDispatches(
      dispatches.map((d) => {
        if (d.id !== id) return d
        let nextStatus = 'Dispatched'
        if (d.status === 'Pending') nextStatus = 'Dispatched'
        else if (d.status === 'Dispatched') nextStatus = 'In Transit'
        else if (d.status === 'In Transit') nextStatus = 'Delivered'
        else nextStatus = 'Delivered'
        return { ...d, status: nextStatus }
      })
    )
    triggerToast('Dispatch status updated successfully.')
  }

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      '#',
      'Dispatch No',
      'Date',
      'PO/Indent No',
      'Customer Unit',
      'Origin Shade',
      'Location',
      'Total Base Qty',
      'Base Unit',
      'Packaging Packs',
      'Dispatch Type',
      'Vehicle No',
      'Driver Name',
      'Lab QC',
      'Status',
    ]

    const rows = filteredDispatches.map((row, idx) => [
      idx + 1,
      row.dispatchNo,
      `"${row.date}"`,
      row.poIndentNo,
      `"${row.customerUnit}"`,
      row.shadeId,
      row.location,
      row.totalQty,
      row.baseUnit,
      `"${row.packCount} ${row.packUnit}"`,
      `"${row.dispatchType}"`,
      row.vehicleNo,
      `"${row.driverName}"`,
      row.labStatus,
      row.status,
    ])

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'Outward_Dispatches_Manifest.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    triggerToast('Dispatch manifests exported to CSV.')
  }

  // Filter Dropdown Options
  const typeOptions = [
    { value: 'ALL', label: 'All Dispatch Types' },
    { value: 'Outward Sale', label: 'Outward Customer Sale' },
    { value: 'Inter-Warehouse Transfer', label: 'Inter-Warehouse Transfer' },
  ]

  const shadeOptions = [
    { value: 'ALL', label: 'All 6 Dedicated Shades' },
    ...SHADES.map((s) => ({ value: s.id, label: s.name })),
  ]

  const customerOptions = [
    { value: 'ALL', label: 'All Customer Hubs' },
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
    { value: 'ALL', label: 'All Dispatch Statuses' },
    { value: 'In Transit', label: 'In Transit Cargo' },
    { value: 'Dispatched', label: 'Dispatched from Gate' },
    { value: 'Delivered', label: 'Delivered / Completed' },
    { value: 'Pending', label: 'Pending Gate Staging' },
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
          <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">Outward Issue &amp; Dispatch</h1>
              <span className="text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60 px-2.5 py-0.5 rounded-full shrink-0">
                Logistics &amp; Delivery Desk
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1 max-w-2xl">
              Track outward stock dispatches, retail customer manifests, dual-unit pack reconciliations, and transit deliveries across 6 warehouse shades.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">
          <Link
            to="/checkout-qr"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition shrink-0"
          >
            <QrCode className="w-3.5 h-3.5 text-slate-500" />
            <span>QR Checkout</span>
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
            onClick={() => setShowNewDispatchModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Issue / Dispatch</span>
          </button>
        </div>
      </div>

      {/* 4 Dynamic KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Total Dispatches</p>
            <h3 className="text-xl font-bold text-slate-800 leading-tight mt-0.5">
              {stats.total} Shipments
            </h3>
            <p className="text-[11px] text-indigo-600 font-medium">Logged this month</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Total Base Units</p>
            <h3 className="text-xl font-bold text-slate-800 leading-tight mt-0.5">
              {stats.totalUnits.toLocaleString()}
            </h3>
            <p className="text-[11px] text-emerald-600 font-medium">Pcs, Kg, Ltr &amp; Boxes</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">In Transit On Road</p>
            <h3 className="text-xl font-bold text-slate-800 leading-tight mt-0.5">
              {stats.inTransit} Consignments
            </h3>
            <p className="text-[11px] text-blue-600 font-medium">Active delivery routes</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Delivered &amp; Received</p>
            <h3 className="text-xl font-bold text-slate-800 leading-tight mt-0.5">
              {stats.delivered} Closed
            </h3>
            <p className="text-[11px] text-purple-600 font-medium">Customer acknowledgment verified</p>
          </div>
        </div>
      </div>

      {/* Outward Dispatches Master Card */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
        {/* Filter Section Header & Inputs */}
        <div className="p-5 border-b border-slate-100 space-y-4">
          {/* Top Line: Section Title & Results Count */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-800">Outward Dispatch Manifest Register</h2>
                <p className="text-[11px] text-slate-500">Filter shipments by customer destination, origin shade, dispatch type, or transit status.</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs bg-indigo-50 text-indigo-700 font-bold px-3 py-1 rounded-full border border-indigo-200/60">
                {filteredDispatches.length} Dispatches Found
              </span>
              {(searchQuery || filterType !== 'ALL' || filterShade !== 'ALL' || filterCustomer !== 'ALL' || filterStatus !== 'ALL') && (
                <button
                  type="button"
                  onClick={() => {
                    setFilterType('ALL')
                    setFilterShade('ALL')
                    setFilterCustomer('ALL')
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
              placeholder="Search dispatch ref (DISP-2026-...), PO/indent number, customer hub, vehicle no, driver name..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition"
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
                Dispatch Type
              </label>
              <CustomSelect
                value={filterType}
                onChange={(val) => {
                  setFilterType(val)
                  setCurrentPage(1)
                }}
                options={typeOptions}
                placeholder="All Dispatch Types"
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
                Customer Unit
              </label>
              <CustomSelect
                value={filterCustomer}
                onChange={(val) => {
                  setFilterCustomer(val)
                  setCurrentPage(1)
                }}
                options={customerOptions}
                placeholder="All Customer Hubs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1.5">
                Transit Status
              </label>
              <CustomSelect
                value={filterStatus}
                onChange={(val) => {
                  setFilterStatus(val)
                  setCurrentPage(1)
                }}
                options={statusOptions}
                placeholder="All Dispatch Statuses"
              />
            </div>
          </div>
        </div>

        {/* Dispatches Table */}
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4 min-w-[140px]">Dispatch &amp; Date</th>
                <th className="py-3 px-4 min-w-[140px]">PO / Indent</th>
                <th className="py-3 px-4 min-w-[180px]">Customer Destination</th>
                <th className="py-3 px-4 min-w-[130px]">Origin Shade</th>
                <th className="py-3 px-4 min-w-[140px] text-right">Base Qty &amp; Packs</th>
                <th className="py-3 px-4 min-w-[130px]">Vehicle &amp; Driver</th>
                <th className="py-3 px-4 min-w-[100px] text-center">QC Check</th>
                <th className="py-3 px-4 min-w-[110px] text-center">Status</th>
                <th className="py-3 px-4 min-w-[120px] text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedDispatches.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <Truck className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    No outward dispatch records match the selected filters.
                  </td>
                </tr>
              ) : (
                paginatedDispatches.map((row, idx) => {
                  const globalIdx = (currentPage - 1) * perPage + idx + 1
                  return (
                    <tr key={row.id} className="hover:bg-slate-50/60 transition group">
                      <td className="py-3 px-4 text-center text-slate-400 font-mono text-[11px]">
                        {globalIdx}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-800">{row.dispatchNo}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{row.date}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                          {row.poIndentNo}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-1 font-medium">{row.dispatchType}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{row.customerUnit}</div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>ETA: {row.expectedDelivery}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="text-[11px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200/60">
                          {row.shadeId}
                        </span>
                        <div className="text-[10px] text-slate-400 font-mono mt-1">{row.location}</div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="font-bold text-slate-800">
                          {row.totalQty.toLocaleString()} {row.baseUnit}
                        </div>
                        <div className="text-[11px] text-emerald-600 font-medium mt-0.5">
                          {row.packCount} {row.packUnit}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800 font-mono">{row.vehicleNo}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <User className="w-3 h-3 text-slate-400" />
                          <span>{row.driverName}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <Check className="w-3 h-3" />
                          <span>Passed</span>
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                            row.status === 'Delivered'
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : row.status === 'In Transit'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : row.status === 'Dispatched'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              row.status === 'Delivered'
                                ? 'bg-purple-500'
                                : row.status === 'In Transit'
                                ? 'bg-blue-500 animate-pulse'
                                : row.status === 'Dispatched'
                                ? 'bg-emerald-500'
                                : 'bg-amber-500'
                            }`}
                          />
                          <span>{row.status}</span>
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setShowDetailsModal(row)}
                            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 transition cursor-pointer"
                            title="View Dispatch Manifest"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-600" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setShowGatePassModal(row)}
                            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 transition cursor-pointer"
                            title="Print Gate Pass Voucher"
                          >
                            <Printer className="w-3.5 h-3.5 text-slate-600" />
                          </button>

                          {row.status !== 'Delivered' && (
                            <button
                              type="button"
                              onClick={() => handleAdvanceStatus(row.id)}
                              className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-semibold transition cursor-pointer"
                              title="Advance Dispatch Status"
                            >
                              {row.status === 'Pending' ? 'Dispatch' : row.status === 'Dispatched' ? 'In Transit' : 'Deliver'}
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
            {Math.min(currentPage * perPage, filteredDispatches.length)} of{' '}
            {filteredDispatches.length} dispatches
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
                    ? 'bg-indigo-600 text-white'
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

      {/* MODAL 1: NEW ISSUE / DISPATCH */}
      {showNewDispatchModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto no-scrollbar animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">New Outward Issue / Dispatch</h3>
                  <p className="text-xs text-slate-500">Initiate outward shipment manifest with automated dual-unit conversion</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowNewDispatchModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDispatch} className="mt-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                    Customer Hub / Destination Unit *
                  </label>
                  <input
                    type="text"
                    required
                    value={newDispatch.customerUnit}
                    onChange={(e) => setNewDispatch({ ...newDispatch, customerUnit: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                    PO / Indent Reference *
                  </label>
                  <input
                    type="text"
                    required
                    value={newDispatch.poIndentNo}
                    onChange={(e) => setNewDispatch({ ...newDispatch, poIndentNo: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                    Origin Warehouse Shade *
                  </label>
                  <CustomSelect
                    value={newDispatch.shadeId}
                    onChange={(val) => {
                      const sh = SHADES.find((s) => s.id === val)
                      setNewDispatch({
                        ...newDispatch,
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
                    Dispatch Type *
                  </label>
                  <CustomSelect
                    value={newDispatch.dispatchType}
                    onChange={(val) => setNewDispatch({ ...newDispatch, dispatchType: val })}
                    options={[
                      { value: 'Outward Sale', label: 'Outward Customer Sale' },
                      { value: 'Inter-Warehouse Transfer', label: 'Inter-Warehouse Transfer' },
                    ]}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                    Product Item Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newDispatch.productName}
                    onChange={(e) => setNewDispatch({ ...newDispatch, productName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                    SKU Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={newDispatch.sku}
                    onChange={(e) => setNewDispatch({ ...newDispatch, sku: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                    Packaging Packs Count ({newDispatch.packUnit}) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newDispatch.packsCount}
                    onChange={(e) => setNewDispatch({ ...newDispatch, packsCount: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                    Units Per Pack Ratio
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newDispatch.unitsPerPack}
                    onChange={(e) => setNewDispatch({ ...newDispatch, unitsPerPack: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                    Vehicle Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={newDispatch.vehicleNo}
                    onChange={(e) => setNewDispatch({ ...newDispatch, vehicleNo: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                    Driver Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newDispatch.driverName}
                    onChange={(e) => setNewDispatch({ ...newDispatch, driverName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Live Calculation Preview Banner */}
              <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-indigo-700 font-semibold">Automatic Base Unit Calculation</p>
                  <p className="text-xs text-indigo-900 font-bold mt-0.5">
                    {Number(newDispatch.packsCount) || 0} {newDispatch.packUnit} × {Number(newDispatch.unitsPerPack) || 1} ={' '}
                    <span className="text-sm font-black text-indigo-600">
                      {((Number(newDispatch.packsCount) || 0) * (Number(newDispatch.unitsPerPack) || 1)).toLocaleString()}{' '}
                      {newDispatch.baseUnit}
                    </span>
                  </p>
                </div>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-1 rounded-md">
                  ✓ Lab Passed
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewDispatchModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
                >
                  Confirm &amp; Create Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: DISPATCH DETAILS VIEW */}
      {showDetailsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto no-scrollbar animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    Dispatch Manifest #{showDetailsModal.dispatchNo}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Issued on {showDetailsModal.date} • {showDetailsModal.customerUnit}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDetailsModal(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                <div>
                  <p className="text-[11px] text-slate-400 font-medium">Customer Unit</p>
                  <p className="font-bold text-slate-800 mt-0.5">{showDetailsModal.customerUnit}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 font-medium">PO / Indent No</p>
                  <p className="font-bold text-slate-800 font-mono mt-0.5">{showDetailsModal.poIndentNo}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 font-medium">Vehicle / Driver</p>
                  <p className="font-bold text-slate-800 font-mono mt-0.5">
                    {showDetailsModal.vehicleNo} ({showDetailsModal.driverName})
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 font-medium">Current Status</p>
                  <p className="font-bold text-indigo-600 mt-0.5">{showDetailsModal.status}</p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 text-xs mb-2">Dispatched Line Items</h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Item &amp; SKU</th>
                        <th className="py-2.5 px-3">Location</th>
                        <th className="py-2.5 px-3">Batch &amp; QC</th>
                        <th className="py-2.5 px-3 text-right">Base Qty</th>
                        <th className="py-2.5 px-3 text-right">Packaging</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {showDetailsModal.itemsList?.map((it, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-3">
                            <div className="font-semibold text-slate-800">{it.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{it.sku}</div>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-600">{it.location}</td>
                          <td className="py-2.5 px-3">
                            <div className="font-mono text-slate-700">{it.batch}</div>
                            <div className="text-[10px] text-emerald-600 font-bold">{it.labCert}</div>
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                            {it.qty.toLocaleString()} {it.baseUnit}
                          </td>
                          <td className="py-2.5 px-3 text-right text-indigo-600 font-semibold">
                            {it.packQty} {it.packUnit}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                <p className="text-[11px] text-slate-400 font-medium">Remarks / Delivery Notes</p>
                <p className="text-slate-700 mt-1">{showDetailsModal.remarks || 'Standard verified dispatch.'}</p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowGatePassModal(showDetailsModal)
                    setShowDetailsModal(null)
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Gate Pass Slip</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: PRINTABLE GATE PASS VOUCHER */}
      {showGatePassModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto no-scrollbar animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-800">Print Outward Gate Pass Slip</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowGatePassModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Printable Voucher Card */}
            <div className="mt-4 p-5 bg-white border border-slate-300 rounded-xl shadow-xs space-y-4 text-xs font-mono">
              <div className="text-center border-b border-slate-200 pb-3">
                <h2 className="text-base font-black tracking-tight text-slate-900">CENTRAL WAREHOUSE LOGISTICS</h2>
                <p className="text-[11px] text-slate-500">AUTHORIZED OUTWARD GATE PASS</p>
                <p className="text-[10px] text-indigo-600 font-bold mt-0.5">REF: GP-{showGatePassModal.dispatchNo}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-400">Date:</span> {showGatePassModal.date}
                </div>
                <div>
                  <span className="text-slate-400">Dispatch:</span> {showGatePassModal.dispatchNo}
                </div>
                <div>
                  <span className="text-slate-400">Vehicle:</span> {showGatePassModal.vehicleNo}
                </div>
                <div>
                  <span className="text-slate-400">Driver:</span> {showGatePassModal.driverName}
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400">Customer:</span> {showGatePassModal.customerUnit}
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400">Total Cargo:</span> {showGatePassModal.totalQty.toLocaleString()} {showGatePassModal.baseUnit} ({showGatePassModal.packCount} {showGatePassModal.packUnit})
                </div>
              </div>

              <div className="border-t border-b border-slate-200 py-3 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase">QA Security Clearance</p>
                  <p className="text-xs font-bold text-emerald-700">✓ 100% LAB QC PASSED</p>
                </div>
                <div className="w-14 h-14 bg-slate-100 border border-slate-300 rounded-lg flex items-center justify-center">
                  <QrCode className="w-10 h-10 text-slate-800" />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-[10px] text-slate-400">
                <span>Security Officer: R. Sharma</span>
                <span>Gate Stamp: APPROVED</span>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowGatePassModal(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  window.print()
                  triggerToast('Gate Pass sent to printer.')
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Document</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
