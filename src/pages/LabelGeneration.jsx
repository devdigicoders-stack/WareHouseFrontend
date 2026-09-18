import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Package,
  UtensilsCrossed,
  HeartPulse,
  Layers,
  Fuel,
  Check,
  Calendar,
  Eye,
  Printer,
  Download,
  Zap,
  X,
  QrCode,
  Barcode,
  Boxes,
  Tag,
  RefreshCw,
  FileSpreadsheet,
  MapPin,
} from 'lucide-react'

export default function LabelGeneration() {
  // Toast state
  const [toastMessage, setToastMessage] = useState(null)

  // Master Products List
  const productsList = [
    { id: 1, name: 'Rice (Basmati Superior 25kg)', sku: 'PRD-RIC-001', category: 'Grains & Pulses', defaultUnit: 'Kg', packRatio: '1 Bag = 25 Kg', defaultLoc: 'Bay A - R1 - B1' },
    { id: 2, name: 'Refined Mustard Oil (15L Tin)', sku: 'PRD-OIL-002', category: 'Edible Oils & Liquids', defaultUnit: 'Ltr', packRatio: '1 Tin = 15 Ltr', defaultLoc: 'Bay B - R1 - B2' },
    { id: 3, name: 'Arhar / Toor Dal (Grade A 30kg)', sku: 'PRD-DAL-003', category: 'Grains & Pulses', defaultUnit: 'Kg', packRatio: '1 Bag = 30 Kg', defaultLoc: 'Bay A - R2 - B3' },
    { id: 4, name: 'Industrial Lubricant 15W-40 (20L)', sku: 'PRD-LUB-005', category: 'Maintenance & Spares', defaultUnit: 'Ltr', packRatio: '1 Drum = 20 Ltr', defaultLoc: 'Bay C - R1 - B2' },
    { id: 5, name: 'Heavy Duty Waterproof Tarpaulin', sku: 'PRD-TAR-006', category: 'Packaging & Materials', defaultUnit: 'Nos', packRatio: '1 Bundle = 5 Nos', defaultLoc: 'Bay D - R1 - B1' },
    { id: 6, name: 'Corrugated Packaging Cartons', sku: 'PRD-BOX-007', category: 'Packaging & Materials', defaultUnit: 'Nos', packRatio: '1 Bundle = 50 Nos', defaultLoc: 'Bay D - R2 - B4' },
    { id: 7, name: 'Industrial Disinfectant 5L', sku: 'PRD-CHM-008', category: 'Hygiene & Chemicals', defaultUnit: 'Cans', packRatio: '1 Box = 4 Cans', defaultLoc: 'Bay E - R1 - B1' },
    { id: 8, name: 'Industrial First Aid Kit', sku: 'PRD-MED-004', category: 'Safety & First Aid', defaultUnit: 'Box', packRatio: '1 Box = 1 Kit', defaultLoc: 'Bay F - R1 - B1' },
  ]

  // Label Form Configuration
  const [labelCategory, setLabelCategory] = useState('Product Label') // 'Product Label' | 'Batch Label' | 'Location Label' | 'Custom Label'
  const [selectedProductSku, setSelectedProductSku] = useState('PRD-RIC-001')
  const [selectedBatchNo, setSelectedBatchNo] = useState('BT-2026-001')
  const [labelType, setLabelType] = useState('Product + Batch Info')
  const [labelSize, setLabelSize] = useState('60mm x 40mm')
  const [quantity, setQuantity] = useState('100')
  const [storageLocation, setStorageLocation] = useState('Bay A - R1 - B1')
  const [mfgDate, setMfgDate] = useState('2026-09-01')
  const [expDate, setExpDate] = useState('2028-08-31')
  const [additionalInfo, setAdditionalInfo] = useState('')

  // Location-specific form state
  const [selectedZone, setSelectedZone] = useState('Dry & Ambient Pallet Bay')
  const [rackBinCode, setRackBinCode] = useState('BAY A1 • RACK 02 • BIN 01')

  // Toggles
  const [includeQr, setIncludeQr] = useState(true)
  const [includeBarcode, setIncludeBarcode] = useState(true)
  const [includeLogo, setIncludeLogo] = useState(true)
  const [includeBatchDetails, setIncludeBatchDetails] = useState(true)
  const [includeExpiryDate, setIncludeExpiryDate] = useState(true)

  // Active Template
  const [activeTemplate, setActiveTemplate] = useState('Standard Product')

  // Search & Pagination
  const [searchQuery, setSearchQuery] = useState('')
  const [dateRange, setDateRange] = useState('01-09-2026 - 16-09-2026')
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(5)

  // Modals state
  const [showPrinterSettings, setShowPrinterSettings] = useState(false)
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [openActionMenuId, setOpenActionMenuId] = useState(null)

  // Trigger Toast Notification
  const triggerToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Active Product helper
  const activeProduct = useMemo(() => {
    return productsList.find((p) => p.sku === selectedProductSku) || productsList[0]
  }, [selectedProductSku, productsList])

  // Label Templates List
  const templates = [
    { id: 'standard', name: 'Standard Product', subtitle: 'Logo, QR & Barcode', type: 'standard' },
    { id: 'compact', name: 'Compact Label', subtitle: '50mm x 30mm', type: 'compact' },
    { id: 'batch', name: 'Batch Label', subtitle: 'Batch focus + QR', type: 'batch' },
    { id: 'location', name: 'Location Label', subtitle: 'Bin & Rack barcode', type: 'location' },
    { id: 'small', name: 'Small Label', subtitle: 'Barcode only', type: 'small' },
  ]

  // Recently Generated Labels List
  const [recentLabels] = useState([
    {
      id: 1,
      imageType: 'grain',
      productName: 'Rice (Basmati Superior 25kg)',
      batchNo: 'BT-2026-001',
      labelType: 'Product + Batch Label',
      size: '60 × 40 mm',
      quantity: 100,
      generatedBy: 'R. K. Sharma',
      dateTime: '16 Sep 2026, 09:15',
      status: 'Completed',
      statusClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    },
    {
      id: 2,
      imageType: 'oil',
      productName: 'Refined Mustard Oil (15L Tin)',
      batchNo: 'BT-2026-002',
      labelType: 'Product + Batch Label',
      size: '50 × 30 mm',
      quantity: 200,
      generatedBy: 'Priya Patel',
      dateTime: '16 Sep 2026, 10:22',
      status: 'Completed',
      statusClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    },
    {
      id: 3,
      imageType: 'firstaid',
      productName: 'Industrial First Aid Kit',
      batchNo: 'BT-2026-003',
      labelType: 'Product Label',
      size: '60 × 40 mm',
      quantity: 50,
      generatedBy: 'Amit Verma',
      dateTime: '15 Sep 2026, 04:10',
      status: 'Completed',
      statusClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    },
    {
      id: 4,
      imageType: 'oil',
      productName: 'Industrial Lubricant 15W-40 (20L)',
      batchNo: 'BT-2026-004',
      labelType: 'Batch Label',
      size: '50 × 30 mm',
      quantity: 120,
      generatedBy: 'Suresh Nair',
      dateTime: '15 Sep 2026, 03:45',
      status: 'Completed',
      statusClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    },
    {
      id: 5,
      imageType: 'tarpaulin',
      productName: 'Heavy Duty Waterproof Tarpaulin',
      batchNo: 'BT-2026-005',
      labelType: 'Pallet Label',
      size: '100 × 50 mm',
      quantity: 80,
      generatedBy: 'Vikram Singh',
      dateTime: '14 Sep 2026, 02:30',
      status: 'Completed',
      statusClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    },
  ])

  // Filtered recent labels
  const filteredLabels = useMemo(() => {
    return recentLabels.filter((item) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        return (
          item.productName.toLowerCase().includes(q) ||
          item.batchNo.toLowerCase().includes(q) ||
          item.generatedBy.toLowerCase().includes(q) ||
          item.labelType.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [recentLabels, searchQuery])

  // Handle Generate Preview
  const handleGeneratePreview = (e) => {
    e.preventDefault()
    triggerToast(`Preview generated for ${quantity} labels of ${activeProduct.name}`)
  }

  // Handle Reset
  const handleReset = () => {
    setSelectedProductSku('PRD-RIC-001')
    setSelectedBatchNo('BT-2026-001')
    setLabelType('Product + Batch Info')
    setLabelSize('60mm x 40mm')
    setQuantity('100')
    setStorageLocation('Bay A - R1 - B1')
    setMfgDate('2026-09-01')
    setExpDate('2028-08-31')
    setAdditionalInfo('')
    setIncludeQr(true)
    setIncludeBarcode(true)
    setIncludeLogo(true)
    setIncludeBatchDetails(true)
    setIncludeExpiryDate(true)
    triggerToast('Configuration reset to defaults.')
  }

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Product Name', 'Batch No', 'Label Type', 'Size', 'Quantity', 'Generated By', 'Date & Time', 'Status']
    const rows = recentLabels.map((r) => [
      `"${r.productName}"`,
      r.batchNo,
      `"${r.labelType}"`,
      r.size,
      r.quantity,
      `"${r.generatedBy}"`,
      `"${r.dateTime}"`,
      r.status,
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'Warehouse_Labels_Register.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    triggerToast('Label generation history exported to CSV.')
  }

  // Render thumbnail icon
  const renderThumb = (type) => {
    if (type === 'grain') {
      return (
        <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 p-1 flex items-center justify-center">
          <UtensilsCrossed className="w-4 h-4 text-amber-700" />
        </div>
      )
    }
    if (type === 'oil') {
      return (
        <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-300 text-amber-600 flex items-center justify-center">
          <Fuel className="w-4 h-4 text-amber-600" />
        </div>
      )
    }
    if (type === 'firstaid') {
      return (
        <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center">
          <HeartPulse className="w-4 h-4 stroke-[2.2]" />
        </div>
      )
    }
    if (type === 'tarpaulin' || type === 'pack') {
      return (
        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
          <Layers className="w-4 h-4" />
        </div>
      )
    }
    return (
      <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
        <Package className="w-4 h-4" />
      </div>
    )
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
          {/* QR & Barcode Icon */}
          <div className="w-12 h-12 rounded-xl bg-[#EBF5EA] border border-[#CDE5CA] flex items-center justify-center text-[#1E3A1E] shadow-xs shrink-0">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              <span>Label / QR Generation</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Generate and print barcode / QR labels for products, batches and storage locations.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="text-xs text-slate-400 flex items-center gap-1.5 font-medium mr-2">
            <Link to="/dashboard" className="hover:text-slate-700">Home</Link>
            <span>›</span>
            <span className="text-slate-500">Inward Operations</span>
            <span>›</span>
            <span className="text-slate-800 font-semibold">Label / QR Generation</span>
          </div>
        </div>
      </div>

      {/* 5 KPI Stat Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Card 1: Labels Generated */}
        <div className="bg-white rounded-xl p-3.5 shadow-xs border border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Labels Generated</p>
            <h3 className="text-2xl font-black text-slate-800 leading-tight">12,480</h3>
            <p className="text-[10px] font-bold text-emerald-600">v. 18% this month</p>
          </div>
        </div>

        {/* Card 2: Products Labeled */}
        <div className="bg-white rounded-xl p-3.5 shadow-xs border border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Products Labeled</p>
            <h3 className="text-2xl font-black text-slate-800 leading-tight">1,245</h3>
            <p className="text-[10px] text-slate-400 font-medium">Unique products</p>
          </div>
        </div>

        {/* Card 3: Batches Labeled */}
        <div className="bg-white rounded-xl p-3.5 shadow-xs border border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Batches Labeled</p>
            <h3 className="text-2xl font-black text-slate-800 leading-tight">3,860</h3>
            <p className="text-[10px] text-slate-400 font-medium">Total batches</p>
          </div>
        </div>

        {/* Card 4: QR Labels */}
        <div className="bg-white rounded-xl p-3.5 shadow-xs border border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">QR Labels</p>
            <h3 className="text-2xl font-black text-slate-800 leading-tight">8,620</h3>
            <p className="text-[10px] text-slate-400 font-medium">Scanned & active</p>
          </div>
        </div>

        {/* Card 5: Print Jobs */}
        <div className="bg-white rounded-xl p-3.5 shadow-xs border border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Print Jobs</p>
            <h3 className="text-2xl font-black text-slate-800 leading-tight">156</h3>
            <p className="text-[10px] text-slate-400 font-medium">This month</p>
          </div>
        </div>
      </div>

      {/* Middle Section: 3 Columns (Config Form + Live Preview + Templates) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* ========================================================================= */}
        {/* COLUMN 1: Generate Labels Configuration Form (Span 4 / 12)               */}
        {/* ========================================================================= */}
        <div className="lg:col-span-4 bg-white rounded-xl p-4 sm:p-5 shadow-xs border border-slate-200 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <h2 className="text-xs font-bold text-slate-800">Generate Labels</h2>
          </div>

          {/* Top Pill Tabs */}
          <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-lg text-[11px] font-bold text-center">
            {['Product Label', 'Batch Label', 'Location Label', 'Custom Label'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setLabelCategory(tab)
                  triggerToast(`Switched to ${tab}`)
                }}
                className={`py-1.5 px-1 rounded-md transition cursor-pointer truncate ${
                  labelCategory === tab
                    ? 'bg-[#1E3A1E] text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Form Fields */}
          <form onSubmit={handleGeneratePreview} className="space-y-3.5 text-xs">
            {labelCategory === 'Location Label' ? (
              /* Location & Bin Tag Configuration */
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Storage Zone <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedZone}
                    onChange={(e) => setSelectedZone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white"
                  >
                    <option value="Zone A - Dry Food & Grains">Zone A - Dry Food & Grains</option>
                    <option value="Zone B - Liquid & Edible Oils">Zone B - Liquid & Edible Oils</option>
                    <option value="Zone C - Maintenance & Spares">Zone C - Maintenance & Spares</option>
                    <option value="Zone D - Packaging Materials">Zone D - Packaging Materials</option>
                    <option value="Zone E - Safety & Chemicals">Zone E - Safety & Chemicals</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Rack & Bin Identifier Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={rackBinCode}
                    onChange={(e) => setRackBinCode(e.target.value)}
                    placeholder="e.g. BAY A1 • RACK 02 • BIN 01"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Unique locator printed on shelf/bin barcode</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Tag Size</label>
                    <select
                      value={labelSize}
                      onChange={(e) => setLabelSize(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    >
                      <option value="75mm x 50mm">75mm x 50mm (Rack/Bin Tag)</option>
                      <option value="100mm x 50mm">100mm x 50mm (Aisle Header)</option>
                      <option value="60mm x 40mm">60mm x 40mm (Shelf Face)</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-slate-700">Tags to Print</label>
                      <span className="text-[10px] font-bold text-emerald-700">{quantity} tags</span>
                    </div>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Zone Notes / Capacity (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Max 1,500 Kg Pallet Load • Forklift Zone"
                    value={additionalInfo}
                    onChange={(e) => setAdditionalInfo(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white"
                  />
                </div>
              </div>
            ) : (
              /* Product / Batch / Custom Label Configuration */
              <div className="space-y-3">
                {/* Product Selector */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Commodity / Product <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedProductSku}
                    onChange={(e) => {
                      const sku = e.target.value
                      setSelectedProductSku(sku)
                      const found = productsList.find((p) => p.sku === sku)
                      if (found) {
                        setStorageLocation(found.defaultLoc)
                      }
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white"
                  >
                    {productsList.map((p) => (
                      <option key={p.sku} value={p.sku}>
                        {p.name} ({p.sku})
                      </option>
                    ))}
                  </select>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1 font-medium">
                    <span>Category: {activeProduct.category}</span>
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                      {activeProduct.packRatio}
                    </span>
                  </div>
                </div>

                {/* Batch No & Label Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Batch Number</label>
                    <input
                      type="text"
                      value={selectedBatchNo}
                      onChange={(e) => setSelectedBatchNo(e.target.value)}
                      placeholder="e.g. BT-2026-001"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Label Type</label>
                    <select
                      value={labelType}
                      onChange={(e) => setLabelType(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    >
                      <option value="Product + Batch Info">Product + Batch Info</option>
                      <option value="Product Only">Product Only</option>
                      <option value="Pallet Master Tag">Pallet Master Tag</option>
                      <option value="Storage Bay Tag">Storage Bay Tag</option>
                    </select>
                  </div>
                </div>

                {/* Label Size & Quantity */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Label Size</label>
                    <select
                      value={labelSize}
                      onChange={(e) => setLabelSize(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    >
                      <option value="60mm x 40mm">60mm x 40mm (Standard)</option>
                      <option value="50mm x 30mm">50mm x 30mm (Compact)</option>
                      <option value="100mm x 50mm">100mm x 50mm (Pallet/Carton)</option>
                      <option value="75mm x 50mm">75mm x 50mm (Storage Rack)</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-slate-700">
                        Quantity <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center gap-1">
                        {[10, 50, 100].map((q) => (
                          <button
                            key={q}
                            type="button"
                            onClick={() => setQuantity(String(q))}
                            className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600"
                          >
                            +{q}
                          </button>
                        ))}
                      </div>
                    </div>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Storage Bay & Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Storage Bay / Bin</label>
                    <input
                      type="text"
                      value={storageLocation}
                      onChange={(e) => setStorageLocation(e.target.value)}
                      placeholder="e.g. Bay A - R1 - B1"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Mfg Date</label>
                    <input
                      type="date"
                      value={mfgDate}
                      onChange={(e) => setMfgDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Expiry Date & Notes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Expiry Date</label>
                    <input
                      type="date"
                      value={expDate}
                      onChange={(e) => setExpDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Notes / Instructions</label>
                    <input
                      type="text"
                      placeholder="e.g. Keep Dry • Heavy Pallet"
                      value={additionalInfo}
                      onChange={(e) => setAdditionalInfo(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Switch Toggles List */}
            <div className="pt-2.5 border-t border-slate-100 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Elements on Sticker</p>
              <div className="grid grid-cols-3 gap-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includeQr}
                    onChange={(e) => setIncludeQr(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-[11px] font-semibold text-slate-700">QR Code</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includeBarcode}
                    onChange={(e) => setIncludeBarcode(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-[11px] font-semibold text-slate-700">Barcode</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includeLogo}
                    onChange={(e) => setIncludeLogo(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-[11px] font-semibold text-slate-700">Logo/Header</span>
                </label>
              </div>

              {labelCategory !== 'Location Label' && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={includeBatchDetails}
                      onChange={(e) => setIncludeBatchDetails(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-[11px] font-semibold text-slate-700">Batch Info</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={includeExpiryDate}
                      onChange={(e) => setIncludeExpiryDate(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-[11px] font-semibold text-slate-700">Expiry Date</span>
                  </label>
                </div>
              )}
            </div>

            {/* Buttons: Reset + Generate Preview */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer transition"
              >
                Reset
              </button>
              <button
                type="submit"
                className="bg-[#1F331E] hover:bg-[#2A4428] text-white px-5 py-2 rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer transition"
              >
                <span>Update Preview</span>
                <span>→</span>
              </button>
            </div>
          </form>
        </div>

        {/* ========================================================================= */}
        {/* COLUMN 2: Label Preview Live Canvas (Span 5 / 12)                         */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 bg-white rounded-xl p-4 sm:p-5 shadow-xs border border-slate-200 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <h2 className="text-xs font-bold text-slate-800">Label Preview</h2>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={labelSize}
                onChange={(e) => setLabelSize(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs text-slate-700 font-medium"
              >
                <option value="60mm x 40mm">60mm x 40mm</option>
                <option value="50mm x 30mm">50mm x 30mm</option>
                <option value="100mm x 50mm">100mm x 50mm</option>
              </select>

              <button
                type="button"
                onClick={() => triggerToast('Select any template from the right column.')}
                className="bg-[#1F331E] hover:bg-[#2A4428] text-white px-3 py-1 rounded text-xs font-bold shadow-xs cursor-pointer transition"
              >
                Change Template
              </button>
            </div>
          </div>

          {/* Warehouse Thermal Label Live Sheet */}
          <div className="border-2 border-slate-900 rounded-xl p-5 bg-white space-y-3.5 shadow-md max-w-md mx-auto">
            {labelCategory === 'Location Label' ? (
              /* Location & Rack Bin Sticker Preview */
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between border-b pb-2 border-slate-200">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-black text-xs shadow-xs">
                      WH
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 text-xs tracking-wider uppercase">
                        CENTRAL WAREHOUSE
                      </h3>
                      <p className="text-[8px] font-bold text-slate-500">BIN & RACK LOCATOR TAG</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                    {labelSize}
                  </span>
                </div>

                {/* Big Bold Location Badge */}
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-center space-y-1">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{selectedZone}</p>
                  <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono tracking-widest py-2 bg-white rounded border-2 border-dashed border-slate-300 shadow-inner">
                    {rackBinCode || 'BAY A1 • RACK 01 • BIN 01'}
                  </div>
                  {additionalInfo && (
                    <p className="text-[10px] text-emerald-800 font-semibold pt-1">{additionalInfo}</p>
                  )}
                </div>

                {/* QR + Barcode for location */}
                <div className="flex items-center justify-between gap-3 pt-1">
                  {includeQr && (
                    <div className="w-16 h-16 bg-white border border-slate-300 p-1 rounded shadow-xs shrink-0">
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
                        <rect x="38" y="38" width="24" height="24" />
                        <rect x="42" y="42" width="16" height="16" fill="white" />
                        <rect x="46" y="46" width="8" height="8" />
                        <rect x="74" y="38" width="8" height="14" />
                        <rect x="38" y="70" width="12" height="8" />
                        <rect x="54" y="74" width="14" height="6" />
                        <rect x="72" y="72" width="8" height="18" />
                      </svg>
                    </div>
                  )}

                  {includeBarcode && (
                    <div className="flex-1 text-center">
                      <div className="flex justify-center items-end h-9 gap-0.5 max-w-[220px] mx-auto">
                        {[2, 1, 3, 1, 2, 4, 1, 2, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 3, 1, 4, 2, 1, 3, 1, 2, 3, 2, 1, 4, 1, 2].map((w, i) => (
                          <div key={i} style={{ width: `${w * 2}px` }} className="h-full bg-slate-900"></div>
                        ))}
                      </div>
                      <span className="font-mono text-[9px] tracking-widest text-slate-800 font-bold mt-1 block">
                        LOC-{(rackBinCode || 'BAY-A1').replace(/[^A-Za-z0-9]/g, '')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Product & Batch Thermal Sticker Preview */
              <>
                {/* Header: Company Logo + Title + QR Code */}
                <div className="flex items-start justify-between border-b pb-2.5 border-slate-200">
                  {includeLogo ? (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                        WH
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900 text-xs tracking-wider uppercase font-serif">
                          CENTRAL WAREHOUSE
                        </h3>
                        <p className="text-[7.5px] font-bold text-emerald-700 tracking-wider uppercase">
                          INVENTORY & COMMODITY TAG
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs font-black text-slate-800">INVENTORY TAG</div>
                  )}

                  {includeQr && (
                    <div className="w-14 h-14 bg-white border border-slate-300 p-0.5 rounded shadow-xs shrink-0">
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
                        <rect x="38" y="38" width="24" height="24" />
                        <rect x="42" y="42" width="16" height="16" fill="white" />
                        <rect x="46" y="46" width="8" height="8" />
                        <rect x="74" y="38" width="8" height="14" />
                        <rect x="38" y="70" width="12" height="8" />
                        <rect x="54" y="74" width="14" height="6" />
                        <rect x="72" y="72" width="8" height="18" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Product Title, Category, SKU */}
                <div>
                  <h4 className="text-sm font-black text-slate-900 leading-tight">
                    {activeProduct.name}
                  </h4>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                    <span className="bg-slate-900 text-white font-mono text-[10px] px-1.5 py-0.5 rounded font-bold">
                      SKU: {activeProduct.sku}
                    </span>
                    <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] px-1.5 py-0.5 rounded font-semibold">
                      {activeProduct.category}
                    </span>
                    <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[10px] px-1.5 py-0.5 rounded font-bold">
                      {activeProduct.packRatio}
                    </span>
                  </div>
                </div>

                {/* Specs Table List */}
                <div className="space-y-1 text-[10px] font-mono text-slate-700 bg-slate-50/70 p-2.5 rounded border border-slate-200">
                  {includeBatchDetails && (
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">Batch No.</span>
                      <span className="font-bold">: {selectedBatchNo || 'BT-2026-001'}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">Mfg. Date</span>
                    <span className="font-bold">: {mfgDate || '2026-09-01'}</span>
                  </div>
                  {includeExpiryDate && (
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">Expiry Date</span>
                      <span className="font-bold">: {expDate || '2028-08-31'}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">Pack Qty</span>
                    <span className="font-bold">: {quantity} {activeProduct.defaultUnit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">Storage Bay</span>
                    <span className="font-bold">: {storageLocation || activeProduct.defaultLoc}</span>
                  </div>
                  {additionalInfo && (
                    <div className="flex justify-between pt-1 border-t border-slate-200 text-emerald-800 font-sans font-semibold">
                      <span>Note</span>
                      <span>: {additionalInfo}</span>
                    </div>
                  )}
                </div>

                {/* Barcode Graphic */}
                {includeBarcode && (
                  <div className="text-center pt-1">
                    <div className="flex justify-center items-end h-10 gap-0.5 max-w-[280px] mx-auto">
                      {[2, 1, 3, 1, 2, 4, 1, 2, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 3, 1, 4, 2, 1, 3, 1, 2, 3, 2, 1, 4, 1, 2].map((w, i) => (
                        <div key={i} style={{ width: `${w * 2}px` }} className="h-full bg-slate-900"></div>
                      ))}
                    </div>
                    <span className="font-mono text-[9px] tracking-widest text-slate-800 font-bold mt-1 block">
                      {activeProduct.sku}-{selectedBatchNo || 'BT2026'}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Quick Print & Export Actions directly beneath preview */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => window.print()}
              className="flex-1 bg-[#1E3A1E] hover:bg-[#2A4428] text-white py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Sticker Now</span>
            </button>
            <button
              type="button"
              onClick={() => triggerToast(`Downloaded printable PDF for ${quantity} labels.`)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 px-3 rounded-lg text-xs font-bold border border-slate-200 cursor-pointer transition flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>PDF</span>
            </button>
            <button
              type="button"
              onClick={() => triggerToast(`Copied thermal ZPL code for ${activeProduct.sku}`)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 px-2.5 rounded-lg text-xs font-mono font-bold border border-slate-200 cursor-pointer transition"
              title="Copy ZPL Thermal Printer Code"
            >
              ZPL
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* COLUMN 3: Label Templates Grid (Span 3 / 12)                              */}
        {/* ========================================================================= */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                <h2 className="text-xs font-bold text-slate-800">Label Templates</h2>
              </div>
              <button
                type="button"
                onClick={() => triggerToast('Template manager opened.')}
                className="text-[10px] font-bold text-emerald-800 hover:text-emerald-950 hover:underline cursor-pointer"
              >
                Manage Templates
              </button>
            </div>

            {/* 6 Templates in 2x3 Grid matching screenshot */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              {templates.map((tpl) => {
                const isSelected = activeTemplate === tpl.name
                return (
                  <div
                    key={tpl.id}
                    onClick={() => {
                      setActiveTemplate(tpl.name)
                      if (tpl.id === 'standard') {
                        setLabelCategory('Product Label')
                        setLabelSize('60mm x 40mm')
                        setIncludeQr(true)
                        setIncludeBarcode(true)
                        setIncludeBatchDetails(true)
                      } else if (tpl.id === 'compact') {
                        setLabelCategory('Product Label')
                        setLabelSize('50mm x 30mm')
                        setIncludeQr(false)
                        setIncludeBarcode(true)
                        setIncludeBatchDetails(false)
                      } else if (tpl.id === 'batch') {
                        setLabelCategory('Batch Label')
                        setLabelSize('100mm x 50mm')
                        setIncludeQr(true)
                        setIncludeBarcode(true)
                        setIncludeBatchDetails(true)
                        setIncludeExpiryDate(true)
                      } else if (tpl.id === 'location') {
                        setLabelCategory('Location Label')
                        setLabelSize('75mm x 50mm')
                        setIncludeQr(true)
                        setIncludeBarcode(true)
                      } else if (tpl.id === 'small') {
                        setLabelSize('50mm x 30mm')
                        setIncludeQr(false)
                        setIncludeBarcode(true)
                        setIncludeBatchDetails(false)
                      }
                      triggerToast(`Applied template: ${tpl.name}`)
                    }}
                    className={`relative p-2.5 rounded-lg border text-center transition cursor-pointer flex flex-col items-center justify-center space-y-1.5 ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/40 shadow-xs ring-1 ring-emerald-600/30'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50'
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}

                    {/* Miniature graphic representation */}
                    <div className="w-16 h-10 border border-slate-300 rounded bg-white p-1 flex items-center justify-between shadow-2xs">
                      <div className="w-6 h-5 flex flex-col justify-center gap-0.5">
                        <div className="w-full h-1 bg-slate-800 rounded-xs"></div>
                        <div className="w-3/4 h-1 bg-slate-400 rounded-xs"></div>
                      </div>
                      <div className="w-5 h-5 border border-slate-400 p-0.5 rounded-xs flex items-center justify-center">
                        <div className="w-full h-full bg-slate-800 rounded-2xs"></div>
                      </div>
                    </div>

                    <p className="font-bold text-slate-800 text-[10px] truncate w-full">
                      {tpl.name}
                    </p>
                  </div>
                )
              })}

              {/* Custom Template box */}
              <div
                onClick={() => triggerToast('Custom label designer initiated.')}
                className="p-2.5 rounded-lg border-2 border-dashed border-slate-300 hover:border-emerald-600 text-center transition cursor-pointer flex flex-col items-center justify-center space-y-1 text-slate-600"
              >
                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-black">
                  +
                </div>
                <p className="font-bold text-[10px]">Custom Template</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recently Generated Labels Table (Left 9) & Quick Actions (Right 3) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: Recently Generated Labels Table (Span 9 / 12)                */}
        {/* ========================================================================= */}
        <div className="xl:col-span-9 bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden flex flex-col">
          {/* Header & Controls Toolbar */}
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-sm font-bold text-slate-800">Recently Generated Labels</h2>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Search Bar */}
              <div className="relative flex-1 sm:w-64">
                <svg className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by product, batch, or generated by..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white"
                />
              </div>

              {/* Date Range */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-mono">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-36 bg-transparent text-xs font-medium focus:outline-none"
                />
              </div>

              {/* Export Button */}
              <button
                type="button"
                onClick={handleExportCSV}
                className="bg-[#1F331E] hover:bg-[#2A4428] text-white text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 font-bold shadow-xs transition cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Export</span>
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
              style={{ minWidth: '1250px' }}
            >
              <thead className="bg-slate-50/80 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-3 w-10 text-center whitespace-nowrap">#</th>
                  <th className="py-3 px-4 min-w-[190px] whitespace-nowrap">Product Name</th>
                  <th className="py-3 px-4 min-w-[125px] whitespace-nowrap">Batch No.</th>
                  <th className="py-3 px-4 min-w-[130px] whitespace-nowrap">Label Type</th>
                  <th className="py-3 px-4 min-w-[100px] whitespace-nowrap font-mono">Size</th>
                  <th className="py-3 px-3 min-w-[80px] whitespace-nowrap text-center font-bold">Quantity</th>
                  <th className="py-3 px-4 min-w-[135px] whitespace-nowrap">Generated By</th>
                  <th className="py-3 px-4 min-w-[145px] whitespace-nowrap">Date & Time</th>
                  <th className="py-3 px-4 text-center min-w-[110px] whitespace-nowrap">Status</th>
                  <th className="py-3 px-3 text-center w-24 whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredLabels.map((row, idx) => (
                  <tr key={row.id} className="hover:bg-emerald-50/50 transition">
                    <td className="py-3.5 px-3 text-center text-slate-400 font-bold text-[11px] whitespace-nowrap">
                      {idx + 1}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        {renderThumb(row.imageType)}
                        <span className="font-semibold text-slate-800 text-xs">{row.productName}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800 text-[11px] whitespace-nowrap">
                      {row.batchNo}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                      {row.labelType}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600 text-[11px] whitespace-nowrap">
                      {row.size}
                    </td>
                    <td className="py-3.5 px-3 text-center font-bold text-slate-800 whitespace-nowrap">
                      {row.quantity}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium whitespace-nowrap">
                      {row.generatedBy}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap text-[11px]">
                      {row.dateTime}
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${row.statusClass}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="relative py-3.5 px-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        {/* Eye Preview button - loads row into live canvas */}
                        <button
                          type="button"
                          onClick={() => {
                            const found = productsList.find((p) => p.name === row.productName)
                            if (found) {
                              setSelectedProductSku(found.sku)
                              setStorageLocation(found.defaultLoc)
                            }
                            setSelectedBatchNo(row.batchNo)
                            setQuantity(String(row.quantity))
                            setLabelCategory(row.labelType.includes('Location') ? 'Location Label' : 'Product Label')
                            triggerToast(`Loaded "${row.productName}" into live preview canvas!`)
                          }}
                          className="bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 text-slate-600 p-1.5 rounded-md text-xs font-bold transition cursor-pointer flex items-center justify-center shadow-2xs"
                          title="Load into Live Preview"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Print button */}
                        <button
                          type="button"
                          onClick={() => {
                            window.print()
                          }}
                          className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 p-1.5 rounded-md text-xs font-bold transition cursor-pointer flex items-center justify-center shadow-2xs"
                          title="Print Immediately"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>

                        {/* Options button */}
                        <button
                          type="button"
                          onClick={() => setOpenActionMenuId(openActionMenuId === row.id ? null : row.id)}
                          className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 px-1.5 py-1 rounded-md text-xs font-bold transition cursor-pointer shadow-2xs"
                          title="Options"
                        >
                          •••
                        </button>
                      </div>

                      {/* Dropdown Options */}
                      {openActionMenuId === row.id && (
                        <div className="absolute right-3 top-10 w-40 bg-white border border-slate-200 rounded-lg shadow-xl z-20 py-1 text-left text-xs font-medium">
                          <button
                            type="button"
                            onClick={() => {
                              triggerToast(`Downloaded ZPL code for ${row.batchNo}`)
                              setOpenActionMenuId(null)
                            }}
                            className="w-full px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                          >
                            <Download className="w-3.5 h-3.5 text-slate-500" />
                            <span>Download ZPL</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              triggerToast(`Labels queued to Zebra Thermal Printer`)
                              setOpenActionMenuId(null)
                            }}
                            className="w-full px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                          >
                            <Zap className="w-3.5 h-3.5 text-slate-500" />
                            <span>Reprint Batch</span>
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
          <div className="px-4 py-3 bg-slate-50/80 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <span className="font-medium">
              Showing <strong>1 to 5</strong> of <strong>156</strong> records
            </span>

            {/* Number Buttons: < 1 2 3 4 5 ... 32 > */}
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
                onClick={() => triggerToast('Page 32 loaded')}
                className="px-2.5 py-1 rounded font-semibold text-slate-700 hover:bg-slate-100"
              >
                32
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
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
              </select>
              <span>per page</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: Quick Actions Card (Span 3 / 12)                            */}
        {/* ========================================================================= */}
        <div className="xl:col-span-3 space-y-4">
          <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200">
            <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100">
              <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <h2 className="text-xs font-bold text-slate-800">Quick Actions</h2>
            </div>

            <div className="space-y-2">
              {/* Print Labels */}
              <button
                type="button"
                onClick={() => window.print()}
                className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg py-2.5 px-3 text-left text-xs font-bold text-slate-700 flex items-center gap-2.5 transition cursor-pointer"
              >
                <svg className="w-4 h-4 text-slate-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                <span>Print Labels</span>
              </button>

              {/* Download PDF */}
              <button
                type="button"
                onClick={() => triggerToast('Downloaded label sheet as printable PDF.')}
                className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg py-2.5 px-3 text-left text-xs font-bold text-slate-700 flex items-center gap-2.5 transition cursor-pointer"
              >
                <svg className="w-4 h-4 text-slate-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Download PDF</span>
              </button>

              {/* Download as ZPL */}
              <button
                type="button"
                onClick={() => triggerToast('Downloaded raw ZPL code for Zebra / TSC industrial thermal printers.')}
                className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg py-2.5 px-3 text-left text-xs font-bold text-slate-700 flex items-center gap-2.5 transition cursor-pointer"
              >
                <svg className="w-4 h-4 text-slate-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Download as ZPL (For Thermal Printer)</span>
              </button>

              {/* Bulk Label Generation */}
              <button
                type="button"
                onClick={() => setShowBulkModal(true)}
                className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg py-2.5 px-3 text-left text-xs font-bold text-slate-700 flex items-center gap-2.5 transition cursor-pointer"
              >
                <svg className="w-4 h-4 text-slate-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Bulk Label Generation (Excel Upload)</span>
              </button>

              {/* Label History */}
              <button
                type="button"
                onClick={() => triggerToast('Full label print history loaded.')}
                className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg py-2.5 px-3 text-left text-xs font-bold text-slate-700 flex items-center gap-2.5 transition cursor-pointer"
              >
                <svg className="w-4 h-4 text-slate-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Label History</span>
              </button>

              {/* Printer Settings */}
              <button
                type="button"
                onClick={() => setShowPrinterSettings(true)}
                className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg py-2.5 px-3 text-left text-xs font-bold text-slate-700 flex items-center gap-2.5 transition cursor-pointer"
              >
                <svg className="w-4 h-4 text-slate-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Printer Settings</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: PRINTER SETTINGS                                                   */}
      {/* ========================================================================= */}
      {showPrinterSettings && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-2.5 border-slate-200">
              <h3 className="text-sm font-bold text-slate-800">Thermal Printer Configuration</h3>
              <button
                type="button"
                onClick={() => setShowPrinterSettings(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Target Printer</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs">
                  <option>Zebra ZT411 Industrial (Warehouse Dispatch Dock - Network IP: 192.168.1.140)</option>
                  <option>TSC TE200 Desktop (Warehouse Office Desk - USB)</option>
                  <option>Honeywell PM43 Industrial (Inward Receiving Dock - IP: 192.168.1.145)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Resolution (DPI)</label>
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs">
                    <option>203 DPI (Standard)</option>
                    <option>300 DPI (High Precision QR)</option>
                    <option>600 DPI (Ultra Fine)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Print Dark / Speed</label>
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs">
                    <option>Darkness: 15 (Default)</option>
                    <option>Darkness: 20 (Deep Black)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowPrinterSettings(false)}
                className="px-4 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPrinterSettings(false)
                  triggerToast('Thermal printer settings saved and verified online.')
                }}
                className="bg-[#1F331E] hover:bg-[#2A4428] text-white px-5 py-1.5 rounded-lg text-xs font-bold"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: BULK LABEL EXCEL UPLOAD                                            */}
      {/* ========================================================================= */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-2.5 border-slate-200">
              <h3 className="text-sm font-bold text-slate-800">Bulk Label Batch Upload</h3>
              <button
                type="button"
                onClick={() => setShowBulkModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-6 text-center bg-slate-50 transition cursor-pointer">
              <p className="text-xs font-bold text-slate-700">Drop product manifest .xlsx to generate hundreds of labels</p>
              <p className="text-[10px] text-slate-400 mt-1">Columns: SKU, BatchNo, Qty, Location</p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowBulkModal(false)}
                className="px-4 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowBulkModal(false)
                  triggerToast('Generated 450 labels queued to Zebra thermal printer!')
                }}
                className="bg-[#1F331E] hover:bg-[#2A4428] text-white px-5 py-1.5 rounded-lg text-xs font-bold"
              >
                Queue Print Job
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
