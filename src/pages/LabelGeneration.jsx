import { useState, useMemo, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  QrCode,
  Barcode,
  Printer,
  Download,
  Copy,
  Check,
  Search,
  Calendar,
  Layers,
  Package,
  Tag,
  MapPin,
  Eye,
  Settings,
  X,
  CheckCircle2,
  ChevronDown,
  Trash2,
  FileSpreadsheet,
  Zap,
  Sliders,
  RotateCcw,
  Sparkles,
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
        className="w-full bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-left font-medium text-slate-800 flex items-center justify-between transition focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ml-2 ${isOpen ? 'rotate-180 text-indigo-600' : ''}`} />
      </button>

      {isOpen && (
        <div className={`absolute left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 ${zIndexClass} max-h-56 overflow-y-auto`}>
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
                className={`w-full px-3.5 py-2 text-xs text-left flex items-center justify-between transition ${
                  isSelected
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="truncate">
                  <div className="truncate">{opt.label}</div>
                  {opt.sublabel && <div className="text-[10px] text-slate-400 font-normal">{opt.sublabel}</div>}
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

export default function LabelGeneration() {
  // Toast notification
  const [toastMessage, setToastMessage] = useState(null)
  const triggerToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3200)
  }

  // Master Products Catalog
  const productsList = useMemo(() => [
    { id: 1, name: 'Rice (Basmati Superior 25kg)', sku: 'PRD-RIC-001', category: 'Grains & Pulses', defaultUnit: 'Kg', packRatio: '1 Bag = 25 Kg', defaultLoc: 'Bay A - R1 - B1' },
    { id: 2, name: 'Refined Mustard Oil (15L Tin)', sku: 'PRD-OIL-002', category: 'Edible Oils', defaultUnit: 'Ltr', packRatio: '1 Tin = 15 Ltr', defaultLoc: 'Bay B - R1 - B2' },
    { id: 3, name: 'Arhar / Toor Dal (Grade A 30kg)', sku: 'PRD-DAL-003', category: 'Grains & Pulses', defaultUnit: 'Kg', packRatio: '1 Bag = 30 Kg', defaultLoc: 'Bay A - R2 - B3' },
    { id: 4, name: 'Industrial Lubricant 15W-40 (20L)', sku: 'PRD-LUB-005', category: 'Maintenance & Spares', defaultUnit: 'Ltr', packRatio: '1 Drum = 20 Ltr', defaultLoc: 'Bay C - R1 - B2' },
    { id: 5, name: 'Heavy Duty Waterproof Tarpaulin', sku: 'PRD-TAR-006', category: 'Packaging & Safety', defaultUnit: 'Nos', packRatio: '1 Bundle = 5 Nos', defaultLoc: 'Bay D - R1 - B1' },
    { id: 6, name: 'Corrugated Packaging Cartons 5-Ply', sku: 'PRD-BOX-007', category: 'Packaging Materials', defaultUnit: 'Nos', packRatio: '1 Bundle = 50 Nos', defaultLoc: 'Bay D - R2 - B4' },
    { id: 7, name: 'Industrial First Aid Kit', sku: 'PRD-MED-004', category: 'Safety & Hygiene', defaultUnit: 'Box', packRatio: '1 Box = 1 Kit', defaultLoc: 'Bay F - R1 - B1' },
    { id: 8, name: 'Glucose Energy Biscuits (Box of 48)', sku: 'PRD-FOD-008', category: 'Food & Groceries', defaultUnit: 'Box', packRatio: '1 Carton = 48 Packs', defaultLoc: 'Bay B - R2 - B1' },
  ], [])

  // Label Form Configuration
  const [labelCategory, setLabelCategory] = useState('Product Label') // 'Product Label' | 'Batch Label' | 'Location Label' | 'Pallet Master'
  const [selectedProductSku, setSelectedProductSku] = useState('PRD-RIC-001')
  const [selectedBatchNo, setSelectedBatchNo] = useState('BT-2026-001')
  const [labelFormat, setLabelFormat] = useState('Product + Batch Barcode')
  const [labelSize, setLabelSize] = useState('60mm x 40mm')
  const [quantity, setQuantity] = useState('100')
  const [storageLocation, setStorageLocation] = useState('Bay A - R1 - B1')
  const [mfgDate, setMfgDate] = useState('2026-09-01')
  const [expDate, setExpDate] = useState('2028-08-31')
  const [additionalInfo, setAdditionalInfo] = useState('Handle With Care • Store in Cool Dry Place')

  // Location-specific form state
  const [selectedZone, setSelectedZone] = useState('Zone A - Dry Food & Grains')
  const [rackBinCode, setRackBinCode] = useState('BAY A1 • RACK 02 • BIN 01')

  // Visual toggles on sticker
  const [includeQr, setIncludeQr] = useState(true)
  const [includeBarcode, setIncludeBarcode] = useState(true)
  const [includeLogo, setIncludeLogo] = useState(true)
  const [includeBatchDetails, setIncludeBatchDetails] = useState(true)
  const [includeExpiryDate, setIncludeExpiryDate] = useState(true)

  // Modals state
  const [showPrinterSettings, setShowPrinterSettings] = useState(false)
  const [showBulkModal, setShowBulkModal] = useState(false)

  // Printer Settings State
  const [printerModel, setPrinterModel] = useState('Zebra ZT411 Industrial (Warehouse Dock)')
  const [printerDpi, setPrinterDpi] = useState('300 DPI (High Precision)')
  const [printDarkness, setPrintDarkness] = useState('Darkness 15 (Standard)')

  // Search & Filter for History Table
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const perPage = 5

  // Active Selected Product Details
  const activeProduct = useMemo(() => {
    return productsList.find((p) => p.sku === selectedProductSku) || productsList[0]
  }, [selectedProductSku, productsList])

  // Recently Generated Labels Register
  const [recentLabels, setRecentLabels] = useState([
    {
      id: 1,
      productName: 'Rice (Basmati Superior 25kg)',
      sku: 'PRD-RIC-001',
      batchNo: 'BT-2026-001',
      labelType: 'Product + Batch Label',
      size: '60 × 40 mm',
      quantity: 100,
      generatedBy: 'Rajesh Kumar',
      dateTime: '21 Sep 2026, 09:15',
      status: 'Printed',
    },
    {
      id: 2,
      productName: 'Refined Mustard Oil (15L Tin)',
      sku: 'PRD-OIL-002',
      batchNo: 'BT-2026-002',
      labelType: 'Product + Batch Label',
      size: '50 × 30 mm',
      quantity: 200,
      generatedBy: 'Priya Sharma',
      dateTime: '21 Sep 2026, 10:22',
      status: 'Printed',
    },
    {
      id: 3,
      productName: 'Industrial First Aid Kit',
      sku: 'PRD-MED-004',
      batchNo: 'BT-2026-003',
      labelType: 'Product Label',
      size: '60 × 40 mm',
      quantity: 50,
      generatedBy: 'Amit Verma',
      dateTime: '20 Sep 2026, 14:10',
      status: 'Printed',
    },
    {
      id: 4,
      productName: 'Industrial Lubricant 15W-40 (20L)',
      sku: 'PRD-LUB-005',
      batchNo: 'BT-2026-004',
      labelType: 'Batch Label',
      size: '50 × 30 mm',
      quantity: 120,
      generatedBy: 'Suresh Nair',
      dateTime: '20 Sep 2026, 15:45',
      status: 'Printed',
    },
    {
      id: 5,
      productName: 'Heavy Duty Waterproof Tarpaulin',
      sku: 'PRD-TAR-006',
      batchNo: 'BT-2026-005',
      labelType: 'Pallet Master',
      size: '100 × 50 mm',
      quantity: 80,
      generatedBy: 'Vikram Singh',
      dateTime: '19 Sep 2026, 11:30',
      status: 'Printed',
    },
    {
      id: 6,
      productName: 'Location Tag: BAY A1 • RACK 02',
      sku: 'LOC-BAY-A1-R2',
      batchNo: 'ZONE-A',
      labelType: 'Location Label',
      size: '75 × 50 mm',
      quantity: 30,
      generatedBy: 'Rajesh Kumar',
      dateTime: '18 Sep 2026, 16:40',
      status: 'Printed',
    },
  ])

  // Dynamic KPI Stats
  const stats = useMemo(() => {
    const totalCount = recentLabels.reduce((acc, r) => acc + (Number(r.quantity) || 0), 0)
    const uniqueSkus = new Set(recentLabels.map((r) => r.sku)).size
    const uniqueBatches = new Set(recentLabels.map((r) => r.batchNo)).size
    return {
      totalPrinted: totalCount,
      activeSkus: uniqueSkus,
      activeBatches: uniqueBatches,
      totalJobs: recentLabels.length,
    }
  }, [recentLabels])

  // Filtered labels
  const filteredLabels = useMemo(() => {
    return recentLabels.filter((item) => {
      const matchesSearch =
        searchQuery === '' ||
        item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.batchNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.generatedBy.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [recentLabels, searchQuery, statusFilter])

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredLabels.length / perPage))
  const paginatedLabels = filteredLabels.slice((currentPage - 1) * perPage, currentPage * perPage)

  // Reset form
  const handleReset = () => {
    setSelectedProductSku('PRD-RIC-001')
    setSelectedBatchNo('BT-2026-001')
    setLabelFormat('Product + Batch Barcode')
    setLabelSize('60mm x 40mm')
    setQuantity('100')
    setStorageLocation('Bay A - R1 - B1')
    setMfgDate('2026-09-01')
    setExpDate('2028-08-31')
    setAdditionalInfo('Handle With Care • Store in Cool Dry Place')
    setIncludeQr(true)
    setIncludeBarcode(true)
    setIncludeLogo(true)
    setIncludeBatchDetails(true)
    setIncludeExpiryDate(true)
    triggerToast('Form reset to default configuration.')
  }

  // Queue to Print History
  const handleQueuePrint = () => {
    const newEntry = {
      id: Date.now(),
      productName: labelCategory === 'Location Label' ? `Location Tag: ${rackBinCode}` : activeProduct.name,
      sku: labelCategory === 'Location Label' ? `LOC-${rackBinCode.replace(/[^a-zA-Z0-9]/g, '')}` : activeProduct.sku,
      batchNo: labelCategory === 'Location Label' ? selectedZone.split(' ')[0] : selectedBatchNo,
      labelType: labelCategory,
      size: labelSize.replace('mm x ', ' × '),
      quantity: Number(quantity) || 1,
      generatedBy: 'Warehouse Operator',
      dateTime: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      status: 'Printed',
    }
    setRecentLabels([newEntry, ...recentLabels])
    triggerToast(`Sent ${quantity} labels to ${printerModel}!`)
  }

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['#', 'Product Name', 'SKU', 'Batch No', 'Label Type', 'Size', 'Quantity', 'Generated By', 'Date & Time', 'Status']
    const rows = filteredLabels.map((r, i) => [
      i + 1,
      `"${r.productName.replace(/"/g, '""')}"`,
      `"${r.sku}"`,
      `"${r.batchNo}"`,
      `"${r.labelType}"`,
      `"${r.size}"`,
      r.quantity,
      `"${r.generatedBy}"`,
      `"${r.dateTime}"`,
      `"${r.status}"`,
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'Warehouse_Label_Generation_Register.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    triggerToast('Label generation register exported to CSV.')
  }

  // Delete history item
  const handleDeleteItem = (id) => {
    setRecentLabels(recentLabels.filter((r) => r.id !== id))
    triggerToast('Print record removed.')
  }

  // Load into preview
  const handleLoadToPreview = (item) => {
    const found = productsList.find((p) => p.name === item.productName || p.sku === item.sku)
    if (found) {
      setSelectedProductSku(found.sku)
      setStorageLocation(found.defaultLoc)
      setLabelCategory('Product Label')
    } else if (item.labelType === 'Location Label') {
      setLabelCategory('Location Label')
      setRackBinCode(item.productName.replace('Location Tag: ', ''))
    }
    setSelectedBatchNo(item.batchNo)
    setQuantity(String(item.quantity))
    triggerToast(`Loaded "${item.productName}" into live preview canvas!`)
  }

  // Dropdown Options
  const productOptions = productsList.map((p) => ({
    value: p.sku,
    label: `${p.name} (${p.sku})`,
    sublabel: `${p.category} • ${p.packRatio}`,
  }))

  const labelSizeOptions = [
    { value: '60mm x 40mm', label: '60mm × 40mm (Standard Shelf Tag)' },
    { value: '50mm x 30mm', label: '50mm × 30mm (Compact Bin Tag)' },
    { value: '100mm x 50mm', label: '100mm × 50mm (Pallet / Outer Carton)' },
    { value: '75mm x 50mm', label: '75mm × 50mm (Aisle & Storage Rack)' },
  ]

  const labelFormatOptions = [
    { value: 'Product + Batch Barcode', label: 'Product + Batch Barcode' },
    { value: 'Product QR Only', label: 'Product QR Only' },
    { value: 'Pallet Master Tag', label: 'Pallet Master Tag' },
    { value: 'Storage Bay Locator', label: 'Storage Bay Locator' },
  ]

  const zoneOptions = [
    { value: 'Zone A - Dry Food & Grains', label: 'Zone A - Dry Food & Grains' },
    { value: 'Zone B - Liquid & Edible Oils', label: 'Zone B - Liquid & Edible Oils' },
    { value: 'Zone C - Maintenance & Spares', label: 'Zone C - Maintenance & Spares' },
    { value: 'Zone D - Packaging Materials', label: 'Zone D - Packaging Materials' },
    { value: 'Zone E - Safety & First Aid', label: 'Zone E - Safety & First Aid' },
  ]

  const printerOptions = [
    { value: 'Zebra ZT411 Industrial (Warehouse Dock)', label: 'Zebra ZT411 Industrial (Inward Dock - 192.168.1.140)' },
    { value: 'TSC TE200 Desktop (Supervisor Desk)', label: 'TSC TE200 Desktop (Office USB)' },
    { value: 'Honeywell PM43 Industrial (Pallet Bay)', label: 'Honeywell PM43 Industrial (Pallet Bay - 192.168.1.145)' },
    { value: 'Citizen CL-S621 Thermal (Mobile Cart)', label: 'Citizen CL-S621 Thermal (Mobile Cart)' },
  ]

  const dpiOptions = [
    { value: '203 DPI (Standard)', label: '203 DPI (Standard Thermal)' },
    { value: '300 DPI (High Precision)', label: '300 DPI (High Precision QR)' },
    { value: '600 DPI (Ultra Fine)', label: '600 DPI (Micro Barcodes)' },
  ]

  const darknessOptions = [
    { value: 'Darkness 10 (Light)', label: 'Darkness 10 (High Speed Draft)' },
    { value: 'Darkness 15 (Standard)', label: 'Darkness 15 (Optimal Contrast)' },
    { value: 'Darkness 20 (Deep Black)', label: 'Darkness 20 (Durable Barcodes)' },
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

      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs shrink-0">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Label / QR Generation</h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Design, preview, and print GS1 standard barcodes, QR stickers, and storage rack tags.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowBulkModal(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
            <span>Bulk Manifest</span>
          </button>
          <button
            type="button"
            onClick={() => setShowPrinterSettings(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition"
          >
            <Settings className="w-3.5 h-3.5 text-slate-500" />
            <span>Printer Setup</span>
          </button>
        </div>
      </div>

      {/* 4 Dynamic KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Labels Printed</p>
            <h3 className="text-xl font-bold text-slate-800 leading-tight mt-0.5">
              {stats.totalPrinted.toLocaleString()}
            </h3>
            <p className="text-[11px] text-indigo-600 font-medium">Across all batches</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Active SKUs</p>
            <h3 className="text-xl font-bold text-slate-800 leading-tight mt-0.5">
              {stats.activeSkus}
            </h3>
            <p className="text-[11px] text-emerald-600 font-medium">Catalog items tagged</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Batches Labeled</p>
            <h3 className="text-xl font-bold text-slate-800 leading-tight mt-0.5">
              {stats.activeBatches}
            </h3>
            <p className="text-[11px] text-amber-600 font-medium">Verified batch codes</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-600 border border-slate-200 flex items-center justify-center shrink-0">
            <Printer className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Print Jobs</p>
            <h3 className="text-xl font-bold text-slate-800 leading-tight mt-0.5">
              {stats.totalJobs}
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">Ready in print spooler</p>
          </div>
        </div>
      </div>

      {/* Main Designer & Live Preview 2-Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Side: Label Form Designer (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-800">Label Specifications</h2>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="text-xs font-semibold text-slate-500 hover:text-indigo-600 flex items-center gap-1 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          {/* Category Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-semibold text-center">
            {['Product Label', 'Batch Label', 'Location Label', 'Pallet Master'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setLabelCategory(tab)
                  if (tab === 'Location Label') {
                    setLabelSize('75mm x 50mm')
                  } else if (tab === 'Pallet Master') {
                    setLabelSize('100mm x 50mm')
                  } else {
                    setLabelSize('60mm x 40mm')
                  }
                  triggerToast(`Switched format to ${tab}`)
                }}
                className={`py-2 px-2 rounded-lg transition truncate cursor-pointer ${
                  labelCategory === tab
                    ? 'bg-white text-indigo-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Form Fields */}
          <div className="space-y-3.5 text-xs">
            {labelCategory === 'Location Label' ? (
              /* Location Tag Designer */
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Warehouse Storage Zone <span className="text-rose-500">*</span>
                  </label>
                  <CustomSelect
                    value={selectedZone}
                    onChange={setSelectedZone}
                    options={zoneOptions}
                    zIndexClass="z-30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Rack & Bin Identifier Code <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={rackBinCode}
                      onChange={(e) => setRackBinCode(e.target.value)}
                      placeholder="e.g. BAY A1 • RACK 02 • BIN 01"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tag Size</label>
                    <CustomSelect
                      value={labelSize}
                      onChange={setLabelSize}
                      options={labelSizeOptions}
                      zIndexClass="z-20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tags to Print</label>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Location Notes & Weight Limits</label>
                  <input
                    type="text"
                    placeholder="e.g. Max 1,500 Kg Pallet Load • Forklift Access Only"
                    value={additionalInfo}
                    onChange={(e) => setAdditionalInfo(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                  />
                </div>
              </div>
            ) : (
              /* Product / Batch / Pallet Label Designer */
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Commodity / Product SKU <span className="text-rose-500">*</span>
                  </label>
                  <CustomSelect
                    value={selectedProductSku}
                    onChange={(val) => {
                      setSelectedProductSku(val)
                      const found = productsList.find((p) => p.sku === val)
                      if (found) {
                        setStorageLocation(found.defaultLoc)
                      }
                    }}
                    options={productOptions}
                    zIndexClass="z-40"
                  />
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1 font-medium px-1">
                    <span>Category: <strong>{activeProduct.category}</strong></span>
                    <span className="text-indigo-600 font-semibold">{activeProduct.packRatio}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Batch Number</label>
                    <input
                      type="text"
                      value={selectedBatchNo}
                      onChange={(e) => setSelectedBatchNo(e.target.value)}
                      placeholder="e.g. BT-2026-001"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Label Format</label>
                    <CustomSelect
                      value={labelFormat}
                      onChange={setLabelFormat}
                      options={labelFormatOptions}
                      zIndexClass="z-30"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Label Size</label>
                    <CustomSelect
                      value={labelSize}
                      onChange={setLabelSize}
                      options={labelSizeOptions}
                      zIndexClass="z-20"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700">Quantity to Print</label>
                      <div className="flex items-center gap-1">
                        {[10, 50, 100].map((q) => (
                          <button
                            key={q}
                            type="button"
                            onClick={() => setQuantity(String(q))}
                            className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600"
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
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Storage Location</label>
                    <input
                      type="text"
                      value={storageLocation}
                      onChange={(e) => setStorageLocation(e.target.value)}
                      placeholder="Bay A - R1 - B1"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Mfg Date</label>
                    <input
                      type="date"
                      value={mfgDate}
                      onChange={(e) => setMfgDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Expiry Date</label>
                    <input
                      type="date"
                      value={expDate}
                      onChange={(e) => setExpDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Handling Notes / Instructions</label>
                  <input
                    type="text"
                    placeholder="e.g. Keep Dry • Store Below 25°C • Stack Max 4 High"
                    value={additionalInfo}
                    onChange={(e) => setAdditionalInfo(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                  />
                </div>
              </div>
            )}

            {/* Sticker Graphic Elements Toggles */}
            <div className="pt-3 border-t border-slate-100">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Visible Elements On Sticker</p>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                <label className="flex items-center gap-2 cursor-pointer select-none bg-slate-50 hover:bg-slate-100/70 p-2 rounded-xl border border-slate-200/80 transition">
                  <input
                    type="checkbox"
                    checked={includeQr}
                    onChange={(e) => setIncludeQr(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-xs font-semibold text-slate-700">QR Code</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none bg-slate-50 hover:bg-slate-100/70 p-2 rounded-xl border border-slate-200/80 transition">
                  <input
                    type="checkbox"
                    checked={includeBarcode}
                    onChange={(e) => setIncludeBarcode(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-xs font-semibold text-slate-700">Barcode</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none bg-slate-50 hover:bg-slate-100/70 p-2 rounded-xl border border-slate-200/80 transition">
                  <input
                    type="checkbox"
                    checked={includeLogo}
                    onChange={(e) => setIncludeLogo(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-xs font-semibold text-slate-700">Warehouse Header</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none bg-slate-50 hover:bg-slate-100/70 p-2 rounded-xl border border-slate-200/80 transition">
                  <input
                    type="checkbox"
                    checked={includeBatchDetails}
                    onChange={(e) => setIncludeBatchDetails(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-xs font-semibold text-slate-700">Batch Specs</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none bg-slate-50 hover:bg-slate-100/70 p-2 rounded-xl border border-slate-200/80 transition">
                  <input
                    type="checkbox"
                    checked={includeExpiryDate}
                    onChange={(e) => setIncludeExpiryDate(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-xs font-semibold text-slate-700">Expiry Date</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Live Thermal Sticker Preview (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-800">Live Thermal Label Preview</h2>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
              {labelSize}
            </span>
          </div>

          {/* Realistic High-Contrast Thermal Label Canvas */}
          <div className="border-2 border-dashed border-slate-300 rounded-2xl p-4 bg-slate-50/50 flex items-center justify-center">
            <div className="w-full max-w-sm bg-white border-2 border-slate-900 rounded-xl p-4 shadow-md space-y-3 font-sans">
              {labelCategory === 'Location Label' ? (
                /* Location & Rack Bin Sticker Preview */
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b pb-2 border-slate-900">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                        WH
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-xs tracking-wider uppercase">CENTRAL WAREHOUSE</h3>
                        <p className="text-[9px] font-semibold text-slate-500">BIN & RACK LOCATOR TAG</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded border border-slate-200">
                      {labelSize}
                    </span>
                  </div>

                  <div className="bg-slate-100/70 rounded-lg p-2.5 border border-slate-300 text-center space-y-1">
                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">{selectedZone}</p>
                    <div className="text-lg font-black text-slate-900 font-mono tracking-wider py-1 bg-white rounded border border-dashed border-slate-400">
                      {rackBinCode || 'BAY A1 • RACK 02 • BIN 01'}
                    </div>
                    {additionalInfo && (
                      <p className="text-[10px] text-slate-700 font-medium pt-0.5">{additionalInfo}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-1">
                    {includeQr && (
                      <div className="w-14 h-14 bg-white border border-slate-400 p-1 rounded shrink-0">
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
                        <div className="flex justify-center items-end h-8 gap-0.5 max-w-[180px] mx-auto">
                          {[2, 1, 3, 1, 2, 4, 1, 2, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 3, 1, 4, 2, 1, 3, 1, 2, 3, 2, 1, 4, 1, 2].map((w, i) => (
                            <div key={i} style={{ width: `${w * 1.5}px` }} className="h-full bg-slate-900"></div>
                          ))}
                        </div>
                        <span className="font-mono text-[9px] tracking-wider text-slate-900 font-bold mt-1 block">
                          LOC-{(rackBinCode || 'BAY-A1').replace(/[^A-Za-z0-9]/g, '')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Product & Batch Thermal Sticker Preview */
                <>
                  <div className="flex items-start justify-between border-b pb-2 border-slate-900">
                    {includeLogo ? (
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                          WH
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-xs tracking-wider uppercase">CENTRAL WAREHOUSE</h3>
                          <p className="text-[8px] font-semibold text-slate-500 uppercase tracking-wider">
                            INVENTORY & COMMODITY TAG
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs font-bold text-slate-900 uppercase">INVENTORY TAG</div>
                    )}

                    {includeQr && (
                      <div className="w-12 h-12 bg-white border border-slate-400 p-0.5 rounded shrink-0">
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

                  <div>
                    <h4 className="text-xs font-black text-slate-900 leading-snug">
                      {activeProduct.name}
                    </h4>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      <span className="bg-slate-900 text-white font-mono text-[9px] px-1.5 py-0.5 rounded font-bold">
                        {activeProduct.sku}
                      </span>
                      <span className="bg-slate-100 text-slate-700 border border-slate-300 text-[9px] px-1.5 py-0.5 rounded font-semibold">
                        {activeProduct.category}
                      </span>
                      <span className="bg-slate-100 text-slate-700 border border-slate-300 text-[9px] px-1.5 py-0.5 rounded font-bold">
                        {activeProduct.packRatio}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1 text-[10px] font-mono text-slate-800 bg-slate-100/60 p-2 rounded border border-slate-300">
                    {includeBatchDetails && (
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-sans">Batch No:</span>
                        <span className="font-bold">{selectedBatchNo || 'BT-2026-001'}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">Mfg Date:</span>
                      <span className="font-bold">{mfgDate || '2026-09-01'}</span>
                    </div>
                    {includeExpiryDate && (
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-sans">Expiry Date:</span>
                        <span className="font-bold">{expDate || '2028-08-31'}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">Pack Qty:</span>
                      <span className="font-bold">{quantity} {activeProduct.defaultUnit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">Location:</span>
                      <span className="font-bold">{storageLocation || activeProduct.defaultLoc}</span>
                    </div>
                    {additionalInfo && (
                      <div className="flex justify-between pt-1 border-t border-slate-300 text-slate-700 font-sans font-medium text-[9px]">
                        <span>Note:</span>
                        <span className="truncate ml-2">{additionalInfo}</span>
                      </div>
                    )}
                  </div>

                  {includeBarcode && (
                    <div className="text-center pt-0.5">
                      <div className="flex justify-center items-end h-8 gap-0.5 max-w-[220px] mx-auto">
                        {[2, 1, 3, 1, 2, 4, 1, 2, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 3, 1, 4, 2, 1, 3, 1, 2, 3, 2, 1, 4, 1, 2].map((w, i) => (
                          <div key={i} style={{ width: `${w * 1.6}px` }} className="h-full bg-slate-900"></div>
                        ))}
                      </div>
                      <span className="font-mono text-[9px] tracking-widest text-slate-900 font-bold mt-1 block">
                        {activeProduct.sku}-{selectedBatchNo || 'BT2026'}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Quick Print Actions Toolbar */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                handleQueuePrint()
                window.print()
              }}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 px-3.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Sticker ({quantity})</span>
            </button>
            <button
              type="button"
              onClick={() => triggerToast(`Exported printable label sheet PDF (${quantity} copies)`)}
              className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>PDF</span>
            </button>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(`^XA^FO50,50^BQN,2,10^FDMM,A${activeProduct.sku}^FS^FO200,50^ADN,36,20^FD${activeProduct.name}^FS^XZ`)
                triggerToast('Copied raw ZPL thermal printer code to clipboard!')
              }}
              className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-mono font-bold border border-slate-200 transition"
              title="Copy ZPL Thermal Printer Code"
            >
              ZPL
            </button>
          </div>
        </div>
      </div>

      {/* Full-Width Bottom Section: Recently Generated Labels Register */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3.5">
          <div className="flex items-center gap-2.5">
            <Tag className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-800">Recently Generated Labels Register</h2>
            <span className="text-xs bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-full border border-slate-200">
              {filteredLabels.length} records
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search product, SKU, batch, user..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
              />
            </div>

            {/* Status Filter */}
            <div className="w-36">
              <CustomSelect
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { value: 'ALL', label: 'All Status' },
                  { value: 'Printed', label: 'Printed' },
                  { value: 'Pending', label: 'Pending' },
                ]}
                zIndexClass="z-30"
              />
            </div>

            {/* Export CSV Button */}
            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 shadow-xs transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Full-Width Table */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs divide-y divide-slate-200">
            <thead className="bg-slate-50/80 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4 w-12 text-center">#</th>
                <th className="py-3.5 px-4 min-w-[200px]">Product / Tag Info</th>
                <th className="py-3.5 px-4 min-w-[130px]">SKU</th>
                <th className="py-3.5 px-4 min-w-[120px]">Batch / Locator</th>
                <th className="py-3.5 px-4 min-w-[130px]">Label Format</th>
                <th className="py-3.5 px-4 min-w-[100px] font-mono">Size</th>
                <th className="py-3.5 px-4 text-center font-bold">Qty</th>
                <th className="py-3.5 px-4 min-w-[130px]">Generated By</th>
                <th className="py-3.5 px-4 min-w-[140px]">Date & Time</th>
                <th className="py-3.5 px-4 text-center min-w-[100px]">Status</th>
                <th className="py-3.5 px-4 text-center w-28">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {paginatedLabels.length === 0 ? (
                <tr>
                  <td colSpan="11" className="py-10 text-center text-slate-400">
                    No label generation records found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedLabels.map((row, idx) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 text-center text-slate-400 font-bold text-[11px]">
                      {(currentPage - 1) * perPage + idx + 1}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {row.productName}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700 text-[11px]">
                      {row.sku}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-800 text-[11px]">
                      {row.batchNo}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {row.labelType}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600 text-[11px]">
                      {row.size}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-900">
                      {row.quantity}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {row.generatedBy}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {row.dateTime}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border bg-emerald-50 text-emerald-700 border-emerald-200">
                        <Check className="w-3 h-3" />
                        <span>{row.status}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleLoadToPreview(row)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 transition"
                          title="Load into Live Preview Canvas"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            triggerToast(`Printing ${row.quantity} labels for ${row.productName}`)
                            window.print()
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 transition"
                          title="Print Immediately"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteItem(row.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition"
                          title="Delete Print Entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 bg-slate-50/80 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium">
          <div>
            Showing <strong>{filteredLabels.length > 0 ? (currentPage - 1) * perPage + 1 : 0}</strong> to{' '}
            <strong>{Math.min(currentPage * perPage, filteredLabels.length)}</strong> of{' '}
            <strong>{filteredLabels.length}</strong> records
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-bold"
            >
              ‹ Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setCurrentPage(p)}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  currentPage === p
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-bold"
            >
              Next ›
            </button>
          </div>
        </div>
      </div>

      {/* Modal: Printer Setup */}
      {showPrinterSettings && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90dvh] overflow-y-auto p-4 sm:p-5 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-800">Thermal Printer Configuration</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPrinterSettings(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Industrial Printer</label>
                <CustomSelect
                  value={printerModel}
                  onChange={setPrinterModel}
                  options={printerOptions}
                  zIndexClass="z-40"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Resolution (DPI)</label>
                  <CustomSelect
                    value={printerDpi}
                    onChange={setPrinterDpi}
                    options={dpiOptions}
                    zIndexClass="z-30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Thermal Darkness</label>
                  <CustomSelect
                    value={printDarkness}
                    onChange={setPrintDarkness}
                    options={darknessOptions}
                    zIndexClass="z-30"
                  />
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1 text-[11px] text-slate-600">
                <div className="flex justify-between">
                  <span>Network Port:</span>
                  <span className="font-mono font-bold text-slate-800">9100 (RAW ZPL)</span>
                </div>
                <div className="flex justify-between">
                  <span>Connection Status:</span>
                  <span className="font-bold text-emerald-600">Ready & Online</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowPrinterSettings(false)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPrinterSettings(false)
                  triggerToast(`Printer setup saved: ${printerModel}`)
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl text-xs font-bold transition"
              >
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Bulk Manifest Upload */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90dvh] overflow-y-auto p-4 sm:p-5 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-800">Bulk Label Manifest Upload</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowBulkModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl p-6 text-center bg-slate-50 transition cursor-pointer space-y-2">
              <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-800">Drag & drop manifest .xlsx or .csv here</p>
              <p className="text-[11px] text-slate-500">Columns required: SKU, BatchNo, Quantity, Location</p>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => triggerToast('Downloaded sample manifest spreadsheet.')}
                className="text-xs font-semibold text-indigo-600 hover:underline"
              >
                Download Sample Template
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowBulkModal(false)}
                  className="px-3.5 py-1.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowBulkModal(false)
                    triggerToast('Generated 350 labels from manifest into print queue!')
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-xl text-xs font-bold"
                >
                  Queue Batch
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
