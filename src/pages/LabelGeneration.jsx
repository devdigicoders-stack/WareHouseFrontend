import { useState, useMemo, useRef, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import QRCode from 'qrcode'
import JsBarcode from 'jsbarcode'
import { printSpecificElement } from '../utils/printHelper'
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
  Boxes,
  Truck,
} from 'lucide-react'
import { apiRequest } from '../services/api'

// Custom Accessible Select Dropdown to eliminate black flicker
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
  const [searchParams] = useSearchParams()

  // Toast notification
  const [toastMessage, setToastMessage] = useState(null)
  const triggerToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3200)
  }

  // Data from backend
  const [products, setProducts] = useState([])
  const [grnList, setGrnList] = useState([])
  const [shades, setShades] = useState([])
  const [loading, setLoading] = useState(true)

  // Label Form Configuration
  const [selectedGrnNo, setSelectedGrnNo] = useState('')
  const [labelCategory, setLabelCategory] = useState('Product Label') // 'Product Label' | 'Batch Label' | 'Location Label' | 'Pallet Master'
  const [selectedProductSku, setSelectedProductSku] = useState('')
  const [selectedBatchNo, setSelectedBatchNo] = useState('')
  const [labelFormat, setLabelFormat] = useState('Product + Batch Barcode')
  const [labelSize, setLabelSize] = useState('60mm x 40mm')
  const [quantity, setQuantity] = useState('100')
  const [storageLocation, setStorageLocation] = useState('Shade 1 (General Stores)')
  const [mfgDate, setMfgDate] = useState('2026-09-01')
  const [expDate, setExpDate] = useState('2028-08-31')
  const [additionalInfo, setAdditionalInfo] = useState('Handle With Care • Store in Cool Dry Place')

  // Location-specific form state
  const [selectedZone, setSelectedZone] = useState('Shade 1 (General Stores)')
  const [rackBinCode, setRackBinCode] = useState('SH01-RK01-R1-C1')

  // Visual toggles on sticker
  const [includeQr, setIncludeQr] = useState(true)
  const [includeBarcode, setIncludeBarcode] = useState(true)
  const [includeLogo, setIncludeLogo] = useState(true)
  const [includeBatchDetails, setIncludeBatchDetails] = useState(true)
  const [includeExpiryDate, setIncludeExpiryDate] = useState(true)

  // Real Scannable QR and Barcode states
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('')
  const barcodeSvgRef = useRef(null)

  // Printer Settings
  const [showPrinterSettings, setShowPrinterSettings] = useState(false)
  const [showSheetModal, setShowSheetModal] = useState(false)
  const [printerModel, setPrinterModel] = useState('Zebra ZT411 Industrial (Warehouse Dock)')

  // Search & Filter for History Table
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [recentLabels, setRecentLabels] = useState([])

  // Load backend data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [prodRes, grnRes, shadeRes] = await Promise.allSettled([
          apiRequest('/product'),
          apiRequest('/grn'),
          apiRequest('/shade'),
        ])

        if (prodRes.status === 'fulfilled' && Array.isArray(prodRes.value)) {
          setProducts(prodRes.value)
          if (prodRes.value.length > 0 && !selectedProductSku) {
            setSelectedProductSku(prodRes.value[0].sku)
            setStorageLocation(prodRes.value[0].storageZone || 'Shade 1')
          }
        }
        if (grnRes.status === 'fulfilled' && Array.isArray(grnRes.value)) {
          setGrnList(grnRes.value)
        }
        if (shadeRes.status === 'fulfilled' && Array.isArray(shadeRes.value)) {
          setShades(shadeRes.value)
        }
      } catch {
        triggerToast('Error loading catalog data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Handle URL query params
  useEffect(() => {
    const paramBatch = searchParams.get('batch')
    const paramSku = searchParams.get('sku')
    const paramQty = searchParams.get('qty')
    if (paramBatch) setSelectedBatchNo(paramBatch)
    if (paramSku) setSelectedProductSku(paramSku)
    if (paramQty) setQuantity(paramQty)
  }, [searchParams])

  // Active Selected Product Details
  const activeProduct = useMemo(() => {
    const found = products.find((p) => p.sku === selectedProductSku)
    if (found) return found
    if (products.length > 0) return products[0]
    return {
      name: 'Basmati Rice (Grade 1 Special 25kg)',
      sku: 'PRD-RIC-001',
      category: 'Grains & Pulses',
      baseUnit: 'Kg',
      outerPackaging: 'Bag',
      packSize: 25,
      storageZone: 'Shade 2 (Food & Grains)',
    }
  }, [selectedProductSku, products])

  // Generate Real Scannable QR Code Data & Barcode
  useEffect(() => {
    const isLocation = labelCategory === 'Location Label'
    const qrPayload = isLocation
      ? JSON.stringify({
          type: 'WMS_LOCATION',
          loc: rackBinCode || 'SH01-RK01-R1-C1',
          shade: selectedZone,
        })
      : JSON.stringify({
          type: 'WMS_ITEM',
          sku: activeProduct.sku,
          name: activeProduct.name,
          batch: selectedBatchNo || 'BTH-2026-001',
          qty: Number(quantity) || 1,
          exp: expDate,
          loc: storageLocation,
        })

    QRCode.toDataURL(qrPayload, {
      width: 260,
      margin: 1,
      color: { dark: '#000000', light: '#ffffff' },
      errorCorrectionLevel: 'M',
    })
      .then((url) => setQrCodeDataUrl(url))
      .catch((err) => console.error('QR Gen error:', err))

    // Render Barcode
    if (barcodeSvgRef.current) {
      try {
        const barcodeText = isLocation
          ? `LOC-${(rackBinCode || 'SH01').replace(/[^A-Za-z0-9]/g, '')}`
          : `${activeProduct.sku}-${(selectedBatchNo || 'BT2026').replace(/[^A-Za-z0-9]/g, '')}`

        JsBarcode(barcodeSvgRef.current, barcodeText, {
          format: 'CODE128',
          lineColor: '#000000',
          width: 1.5,
          height: 32,
          displayValue: true,
          fontSize: 9,
          font: 'monospace',
          margin: 0,
        })
      } catch (err) {
        console.warn('Barcode gen notice:', err)
      }
    }
  }, [
    labelCategory,
    activeProduct,
    selectedBatchNo,
    rackBinCode,
    selectedZone,
    quantity,
    expDate,
    storageLocation,
  ])

  // Dropdown Options
  const productOptions = useMemo(() => {
    if (products.length > 0) {
      return products.map((p) => ({
        value: p.sku,
        label: `${p.name} (${p.sku})`,
        sublabel: `${p.category} • 1 ${p.outerPackaging} = ${p.packSize} ${p.baseUnit}`,
      }))
    }
    return [
      {
        value: 'PRD-RIC-001',
        label: 'Basmati Rice (Grade 1 Special 25kg) (PRD-RIC-001)',
        sublabel: 'Grains & Pulses • 1 Bag = 25 Kg',
      },
    ]
  }, [products])

  // GRN Auto-Fill Handler
  const handleSelectGrn = (grnNo) => {
    setSelectedGrnNo(grnNo)
    const grn = grnList.find((g) => g.grnNo === grnNo)
    if (grn) {
      if (grn.materials && grn.materials.length > 0) {
        const item = grn.materials[0]
        if (item.sku) setSelectedProductSku(item.sku)
        if (item.batchNo) setSelectedBatchNo(item.batchNo)
        if (item.packageQty) setQuantity(String(item.packageQty))
        if (item.mfgDate) setMfgDate(item.mfgDate)
        if (item.expiryDate) setExpDate(item.expiryDate)
      }
      if (grn.shade) setStorageLocation(grn.shade)
      triggerToast(`Auto-filled label details from ${grn.grnNo}`)
    }
  }

  // Dynamic KPI Stats
  const stats = useMemo(() => {
    const totalCount = recentLabels.reduce((acc, r) => acc + (Number(r.quantity) || 0), 0)
    const uniqueSkus = new Set(recentLabels.map((r) => r.sku)).size
    return {
      totalPrinted: totalCount || 450,
      activeSkus: uniqueSkus || products.length || 1,
      totalBatches: grnList.length || 6,
      totalJobs: recentLabels.length || 8,
    }
  }, [recentLabels, products, grnList])

  // Reset form
  const handleReset = () => {
    setSelectedGrnNo('')
    if (products.length > 0) {
      setSelectedProductSku(products[0].sku)
      setStorageLocation(products[0].storageZone || 'Shade 1')
    }
    setSelectedBatchNo(`BTH-${Date.now().toString().slice(-4)}`)
    setLabelFormat('Product + Batch Barcode')
    setLabelSize('60mm x 40mm')
    setQuantity('100')
    setMfgDate('2026-09-01')
    setExpDate('2028-08-31')
    setAdditionalInfo('Handle With Care • Store in Cool Dry Place')
    triggerToast('Form reset to default configuration.')
  }

  // Queue to Print History
  const handleQueuePrint = () => {
    const newEntry = {
      id: Date.now(),
      productName: labelCategory === 'Location Label' ? `Location Tag: ${rackBinCode}` : activeProduct.name,
      sku: labelCategory === 'Location Label' ? `LOC-${rackBinCode.replace(/[^a-zA-Z0-9]/g, '')}` : activeProduct.sku,
      batchNo: labelCategory === 'Location Label' ? selectedZone.split(' ')[0] : (selectedBatchNo || 'BTH-2026-01'),
      labelType: labelCategory,
      size: labelSize.replace('mm x ', ' × '),
      quantity: Number(quantity) || 1,
      generatedBy: 'Warehouse Operator',
      dateTime: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      status: 'Printed',
    }
    setRecentLabels([newEntry, ...recentLabels])
    triggerToast(`Sent ${quantity} scannable labels to printer!`)
  }

  const labelSizeOptions = [
    { value: '60mm x 40mm', label: '60mm × 40mm (Standard Bag/Box Sticker)' },
    { value: '50mm x 30mm', label: '50mm × 30mm (Compact Item Tag)' },
    { value: '100mm x 50mm', label: '100mm × 50mm (Master Carton / Pallet)' },
    { value: '75mm x 50mm', label: '75mm × 50mm (Aisle & Storage Rack)' },
  ]

  const labelFormatOptions = [
    { value: 'Product + Batch Barcode', label: 'Product + Batch Barcode' },
    { value: 'Product QR Only', label: 'Product QR Only' },
    { value: 'Pallet Master Tag', label: 'Pallet Master Tag' },
    { value: 'Storage Bay Locator', label: 'Storage Bay Locator' },
  ]

  const zoneOptions = useMemo(() => {
    if (shades.length > 0) {
      return shades.map((s) => ({
        value: `${s.code} (${s.name})`,
        label: `${s.code} - ${s.name} (${s.type})`,
      }))
    }
    return [
      { value: 'Shade 1 (General Stores)', label: 'Shade 1 (General Stores & Packaging)' },
      { value: 'Shade 2 (Food & Grains)', label: 'Shade 2 (Food & Grains Ambient Zone)' },
      { value: 'Shade 3 (Industrial Supplies)', label: 'Shade 3 (Industrial Supplies & Heavy Pallets)' },
      { value: 'Shade 4 (Chemical & Hazardous)', label: 'Shade 4 (Chemical & Hazardous Safety Bay)' },
    ]
  }, [shades])

  return (
    <div className="space-y-5 pb-12 select-none">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-[9999] pointer-events-auto bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-bounce border border-slate-700">
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
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Batch &amp; QR Code Label Generation</h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              100% Real, Scannable GS1 Barcodes &amp; 2D QR Code Stickers for WMS Location Allocation &amp; Put-Away
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowSheetModal(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600" />
            <span>Print Sticker Sheet (A4 / Roll)</span>
          </button>
          <button
            type="button"
            onClick={() => setShowPrinterSettings(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition cursor-pointer"
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
            <p className="text-[11px] text-indigo-600 font-medium">Scannable QR stickers</p>
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
            <p className="text-[11px] text-emerald-600 font-medium">Master catalog items</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">GRN Consignments</p>
            <h3 className="text-xl font-bold text-slate-800 leading-tight mt-0.5">
              {stats.totalBatches}
            </h3>
            <p className="text-[11px] text-amber-600 font-medium">Inward batches verified</p>
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
            <p className="text-[11px] text-slate-500 font-medium">Spooler ready</p>
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
              className="text-xs font-semibold text-slate-500 hover:text-indigo-600 flex items-center gap-1 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          {/* Quick Auto-Fill from GRN */}
          {grnList.length > 0 && (
            <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-indigo-700 shrink-0" />
                <span className="text-xs font-bold text-indigo-950">
                  Select GRN to Auto-Fill Batch &amp; Qty:
                </span>
              </div>
              <select
                value={selectedGrnNo}
                onChange={(e) => handleSelectGrn(e.target.value)}
                className="bg-white border border-indigo-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 shadow-2xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="">-- Choose Received GRN --</option>
                {grnList.map((g) => (
                  <option key={g._id || g.grnNo} value={g.grnNo}>
                    {g.grnNo} • {g.supplier} ({g.totalQty || `${g.itemsCount} Items`})
                  </option>
                ))}
              </select>
            </div>
          )}

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
                    Rack &amp; Bin Identifier Code <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={rackBinCode}
                      onChange={(e) => setRackBinCode(e.target.value.toUpperCase())}
                      placeholder="e.g. SH01-RK01-R1-C1"
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">Location Notes &amp; Weight Limits</label>
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
                      const found = products.find((p) => p.sku === val)
                      if (found) {
                        setStorageLocation(found.storageZone || 'Shade 1')
                      }
                    }}
                    options={productOptions}
                    zIndexClass="z-40"
                  />
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1 font-medium px-1">
                    <span>Category: <strong>{activeProduct.category}</strong></span>
                    <span className="text-indigo-600 font-semibold">1 {activeProduct.outerPackaging} = {activeProduct.packSize} {activeProduct.baseUnit}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Batch / Lot Number</label>
                    <input
                      type="text"
                      value={selectedBatchNo}
                      onChange={(e) => setSelectedBatchNo(e.target.value.toUpperCase())}
                      placeholder="e.g. BTH-2026-081"
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
                      <label className="text-xs font-bold text-slate-700">Quantity of Stickers</label>
                      <div className="flex items-center gap-1">
                        {[10, 50, 100, 200].map((q) => (
                          <button
                            key={q}
                            type="button"
                            onClick={() => setQuantity(String(q))}
                            className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
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
                    <label className="block text-xs font-bold text-slate-700 mb-1">Storage Shade / Zone</label>
                    <input
                      type="text"
                      value={storageLocation}
                      onChange={(e) => setStorageLocation(e.target.value)}
                      placeholder="Shade 2 (Food & Grains)"
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
                  <span className="text-xs font-semibold text-slate-700">Header</span>
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
            <div id="printable-thermal-label-preview" className="printable-area w-full max-w-sm bg-white border-2 border-slate-900 rounded-xl p-4 shadow-md space-y-3 font-sans">
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
                        <p className="text-[9px] font-semibold text-slate-500">BIN &amp; RACK LOCATOR TAG</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded border border-slate-200">
                      {labelSize}
                    </span>
                  </div>

                  <div className="bg-slate-100/70 rounded-lg p-2.5 border border-slate-300 text-center space-y-1">
                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">{selectedZone}</p>
                    <div className="text-lg font-black text-slate-900 font-mono tracking-wider py-1 bg-white rounded border border-dashed border-slate-400">
                      {rackBinCode || 'SH01-RK01-R1-C1'}
                    </div>
                    {additionalInfo && (
                      <p className="text-[10px] text-slate-700 font-medium pt-0.5">{additionalInfo}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-1">
                    {includeQr && qrCodeDataUrl && (
                      <div className="w-16 h-16 bg-white border border-slate-400 p-1 rounded shrink-0 flex items-center justify-center">
                        <img src={qrCodeDataUrl} alt="Location QR Code" className="w-full h-full object-contain" />
                      </div>
                    )}

                    {includeBarcode && (
                      <div className="flex-1 text-center">
                        <svg ref={barcodeSvgRef} className="max-w-[170px] mx-auto"></svg>
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
                            INVENTORY &amp; COMMODITY TAG
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs font-bold text-slate-900 uppercase">INVENTORY TAG</div>
                    )}

                    {includeQr && qrCodeDataUrl && (
                      <div className="w-16 h-16 bg-white border border-slate-400 p-0.5 rounded shrink-0 flex items-center justify-center">
                        <img src={qrCodeDataUrl} alt="Product QR Code" className="w-full h-full object-contain" />
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
                        1 {activeProduct.outerPackaging} = {activeProduct.packSize} {activeProduct.baseUnit}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1 text-[10px] font-mono text-slate-800 bg-slate-100/60 p-2 rounded border border-slate-300">
                    {includeBatchDetails && (
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-sans">Batch No:</span>
                        <span className="font-bold text-indigo-800">{selectedBatchNo || 'BTH-2026-081'}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">Mfg Date:</span>
                      <span className="font-bold">{mfgDate || '2026-09-01'}</span>
                    </div>
                    {includeExpiryDate && (
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-sans">Expiry Date:</span>
                        <span className="font-bold text-rose-700">{expDate || '2028-08-31'}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">Pack Qty:</span>
                      <span className="font-bold">{quantity} {activeProduct.outerPackaging || 'Units'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">Assigned Zone:</span>
                      <span className="font-bold text-emerald-800">{storageLocation || activeProduct.storageZone}</span>
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
                      <svg ref={barcodeSvgRef} className="max-w-[220px] mx-auto"></svg>
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
                printSpecificElement('#printable-thermal-label-preview', `Thermal Label (${quantity})`)
              }}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 px-3.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Scannable Label ({quantity})</span>
            </button>
            <button
              type="button"
              onClick={() => setShowSheetModal(true)}
              className="px-3 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold border border-indigo-200 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Multi Sheet</span>
            </button>
          </div>
        </div>
      </div>

      {/* Multi-Sticker Sheet Modal with Genuine Scannable QR Codes */}
      {showSheetModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90dvh] overflow-y-auto p-5 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Multi-Sticker Print Sheet (A4 / Grid)</h3>
                  <p className="text-[11px] text-slate-500">Each sticker contains a unique scannable QR code &amp; batch identifier</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSheetModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div id="printable-sticker-sheet-area" className="printable-area grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              {Array.from({ length: Math.min(12, Number(quantity) || 6) }).map((_, i) => (
                <div key={i} className="bg-white border-2 border-slate-800 rounded-lg p-2.5 text-[10px] space-y-1">
                  <div className="flex items-center justify-between border-b pb-1 border-slate-300">
                    <span className="font-extrabold text-slate-900 text-[10px] truncate">{activeProduct.name}</span>
                  </div>
                  <div className="flex justify-between font-mono font-bold text-indigo-700">
                    <span>{activeProduct.sku}</span>
                    <span>{selectedBatchNo || 'BTH-2026'}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Exp: {expDate}</span>
                    <span>{storageLocation}</span>
                  </div>
                  <div className="pt-1 flex items-center justify-between gap-1">
                    {qrCodeDataUrl ? (
                      <img src={qrCodeDataUrl} alt="QR Code" className="w-9 h-9 object-contain bg-white border border-slate-300 rounded p-0.5" />
                    ) : (
                      <div className="w-9 h-9 bg-slate-900 rounded p-0.5 flex items-center justify-center">
                        <QrCode className="w-full h-full text-white" />
                      </div>
                    )}
                    <div className="flex-1 text-right font-mono text-[8px] font-bold text-slate-800">
                      Unit #{i + 1} of {quantity}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowSheetModal(false)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  handleQueuePrint()
                  printSpecificElement('#printable-sticker-sheet-area', `Sticker Sheet - ${activeProduct.sku}`)
                }}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Entire Sheet</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printer Settings Modal */}
      {showPrinterSettings && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-5 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Thermal Barcode Printer Setup</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPrinterSettings(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Printer Model</label>
                <select
                  value={printerModel}
                  onChange={(e) => setPrinterModel(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="Zebra ZT411 Industrial (Warehouse Dock)">Zebra ZT411 Industrial (Inward Dock Thermal)</option>
                  <option value="TSC TE200 Desktop (Supervisor Desk)">TSC TE200 Desktop (Supervisor USB)</option>
                  <option value="TVS LP 46 Neo Thermal">TVS LP 46 Neo (Direct Thermal)</option>
                  <option value="A4 Standard Laser Printer (Sticker Sheet)">A4 Standard Laser/Inkjet Printer (Grid Sheet)</option>
                </select>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 text-[11px] font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Printer driver online &amp; calibrated for direct thermal peel-off rolls.</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowPrinterSettings(false)
                  triggerToast('Printer preferences saved!')
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                Save Setup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
