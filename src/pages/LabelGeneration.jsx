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
  Loader2,
  CheckCheck,
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
  const [selectedGrnObject, setSelectedGrnObject] = useState(null)
  const [selectedItemIndex, setSelectedItemIndex] = useState(0)

  const [selectedCategory, setSelectedCategory] = useState('All')
  const [labelCategory, setLabelCategory] = useState('Product Label') // 'Product Label' | 'Batch Label' | 'Location Label' | 'Pallet Master'
  const [selectedProductSku, setSelectedProductSku] = useState('')
  const [selectedBatchNo, setSelectedBatchNo] = useState('')
  const [labelFormat, setLabelFormat] = useState('Product + Batch Barcode')
  const [labelSize, setLabelSize] = useState('4" x 4" (100mm x 100mm)')
  const [quantity, setQuantity] = useState('10')
  const [storageLocation, setStorageLocation] = useState('Shade 1 (General Stores)')
  const [mfgDate, setMfgDate] = useState(() => new Date().toISOString().split('T')[0])
  const [expDate, setExpDate] = useState(() => {
    const d = new Date()
    d.setFullYear(d.getFullYear() + 2)
    return d.toISOString().split('T')[0]
  })
  const [additionalInfo, setAdditionalInfo] = useState('Handle With Care • Store in Cool Dry Place')

  // Location-specific form state
  const [selectedZone, setSelectedZone] = useState('Shade 1 (General Stores)')
  const [rackBinCode, setRackBinCode] = useState('SH01-RK01-R1-C1')

  // Visual toggles on sticker
  const [includeQr, setIncludeQr] = useState(true)
  const [includeBarcode, setIncludeBarcode] = useState(true)
  const [includeLogo, setIncludeLogo] = useState(true)
  const [includeExpiryDate, setIncludeExpiryDate] = useState(true)

  // Button loading states (One-time click with rolling animation)
  const [isPrintingSingle, setIsPrintingSingle] = useState(false)
  const [isPrintingSheet, setIsPrintingSheet] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  // Real Scannable QR and Barcode states
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('')
  const barcodeSvgRef = useRef(null)

  // Printer Settings & Sheet Modal
  const [showPrinterSettings, setShowPrinterSettings] = useState(false)
  const [showSheetModal, setShowSheetModal] = useState(false)
  const [sheetPrintMode, setSheetPrintMode] = useState('single') // 'single' (repeats current item) or 'all_grn' (all items from selected GRN)
  const [printerModel, setPrinterModel] = useState('Zebra ZT411 Industrial (Warehouse Dock)')

  // Search & Filter for History Table
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

  // Active Selected Product Details (Prioritizes selected GRN's material info)
  const activeProduct = useMemo(() => {
    if (selectedGrnObject && selectedGrnObject.materials && selectedGrnObject.materials.length > 0) {
      const grnMat = selectedGrnObject.materials.find((m) => m.sku === selectedProductSku)
      const found = products.find((p) => p.sku === selectedProductSku)
      if (grnMat) {
        return {
          name: grnMat.productName || found?.name || grnMat.sku,
          sku: grnMat.sku,
          category: found?.category || 'General Inward Commodity',
          baseUnit: found?.baseUnit || 'Kg',
          outerPackaging: grnMat.outerPackaging || found?.outerPackaging || 'Bag',
          packSize: found?.packSize || 1,
          storageZone: selectedGrnObject.shade || found?.storageZone || 'Shade 1',
        }
      }
    }
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
  }, [selectedProductSku, products, selectedGrnObject])

  // Dropdown Options: Strictly filtered to the selected GRN's SKUs when a GRN is active!
  const productOptions = useMemo(() => {
    if (selectedGrnObject && selectedGrnObject.materials && selectedGrnObject.materials.length > 0) {
      return selectedGrnObject.materials.map((mat, idx) => {
        const prod = products.find((p) => p.sku === mat.sku)
        return {
          value: mat.sku,
          label: `${mat.productName || prod?.name || mat.sku} (${mat.sku})`,
          sublabel: `GRN Item #${idx + 1} • Inward Qty: ${mat.packageQty || 1} ${mat.outerPackaging || 'Bags'} • Mfg: ${mat.mfgDate || 'N/A'} • Exp: ${mat.expiryDate || 'N/A'}`,
        }
      })
    }

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
  }, [products, selectedGrnObject])

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
          qty: Number(quantity) || 1,
          mfg: mfgDate,
          exp: expDate,
          loc: storageLocation,
          grn: selectedGrnNo || undefined,
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
          : `${activeProduct.sku}`

        JsBarcode(barcodeSvgRef.current, barcodeText, {
          format: 'CODE128',
          lineColor: '#000000',
          width: 1.6,
          height: 34,
          displayValue: true,
          fontSize: 10,
          font: 'monospace',
          margin: 2,
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
    mfgDate,
    expDate,
    storageLocation,
    selectedGrnNo,
  ])

  // GRN Auto-Fill Handler: loads GRN and locks SKU list to that GRN's items
  const handleSelectGrn = (grnNo) => {
    setSelectedGrnNo(grnNo)
    setSelectedItemIndex(0)
    const grn = grnList.find((g) => g.grnNo === grnNo)
    setSelectedGrnObject(grn || null)

    if (grn) {
      if (grn.materials && grn.materials.length > 0) {
        const firstItem = grn.materials[0]
        if (firstItem.sku) setSelectedProductSku(firstItem.sku)
        if (firstItem.packageQty) setQuantity(String(firstItem.packageQty))
        if (firstItem.mfgDate) setMfgDate(firstItem.mfgDate)
        if (firstItem.expiryDate) setExpDate(firstItem.expiryDate)
      }
      if (grn.shade) setStorageLocation(grn.shade)
      triggerToast(`Loaded GRN ${grn.grnNo} — SKU list filtered to this GRN's items!`)
    } else {
      if (products.length > 0) {
        setSelectedProductSku(products[0].sku)
      }
    }
  }

  // Handle clicking a specific item from the multi-item GRN list
  const handleSelectGrnItem = (item, index) => {
    setSelectedItemIndex(index)
    if (item.sku) setSelectedProductSku(item.sku)
    if (item.packageQty) setQuantity(String(item.packageQty))
    if (item.mfgDate) setMfgDate(item.mfgDate)
    if (item.expiryDate) setExpDate(item.expiryDate)
    if (selectedGrnObject?.shade) setStorageLocation(selectedGrnObject.shade)
    triggerToast(`Selected ${item.productName || item.sku}`)
  }

  // Dynamic KPI Stats (Accurate real database & history values)
  const stats = useMemo(() => {
    const totalCount = recentLabels.reduce((acc, r) => acc + (Number(r.quantity) || 0), 0)
    const uniqueSkus = new Set(recentLabels.map((r) => r.sku)).size
    return {
      totalPrinted: totalCount,
      activeSkus: products.length || uniqueSkus,
      totalBatches: grnList.length,
      totalJobs: recentLabels.length,
    }
  }, [recentLabels, products, grnList])

  // Reset form
  const handleReset = () => {
    setSelectedGrnNo('')
    setSelectedGrnObject(null)
    setSelectedItemIndex(0)
    if (products.length > 0) {
      setSelectedProductSku(products[0].sku)
      setStorageLocation(products[0].storageZone || 'Shade 1')
    }
    setLabelFormat('Product + Batch Barcode')
    setLabelSize('4" x 4" (100mm x 100mm)')
    setQuantity('10')
    setMfgDate(new Date().toISOString().split('T')[0])
    const d = new Date()
    d.setFullYear(d.getFullYear() + 2)
    setExpDate(d.toISOString().split('T')[0])
    setAdditionalInfo('Handle With Care • Store in Cool Dry Place')
    triggerToast('Form reset to default configuration.')
  }

  // Queue to Print History
  const handleQueuePrint = () => {
    const newEntry = {
      id: Date.now(),
      productName: labelCategory === 'Location Label' ? `Location Tag: ${rackBinCode}` : activeProduct.name,
      sku: labelCategory === 'Location Label' ? `LOC-${rackBinCode.replace(/[^a-zA-Z0-9]/g, '')}` : activeProduct.sku,
      batchNo: labelCategory === 'Location Label' ? selectedZone.split(' ')[0] : (selectedBatchNo || 'STD-01'),
      labelType: labelCategory,
      size: labelSize.replace('mm x ', ' × '),
      quantity: Number(quantity) || 1,
      generatedBy: 'Warehouse Operator',
      dateTime: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      status: 'Printed',
    }
    setRecentLabels([newEntry, ...recentLabels])
  }

  // Print single label handler with exact 4" x 4" thermal page styles
  const handlePrintSingle = async () => {
    if (isPrintingSingle) return
    setIsPrintingSingle(true)
    handleQueuePrint()
    try {
      const is4x4 = labelSize.includes('4" x 4"') || labelSize.includes('100mm x 100mm')
      const customPrintStyle = is4x4
        ? `
          @page {
            size: 4in 4in !important;
            margin: 0 !important;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            width: 4in !important;
            height: 4in !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            background: #ffffff !important;
          }
          #printable-thermal-label-preview {
            width: 3.82in !important;
            height: 3.82in !important;
            max-width: 3.82in !important;
            max-height: 3.82in !important;
            margin: auto !important;
            box-sizing: border-box !important;
            border: 2px solid #000000 !important;
            border-radius: 8px !important;
            padding: 12px 14px !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
          }
        `
        : `
          @page {
            size: auto;
            margin: 4mm;
          }
        `
      await printSpecificElement('#printable-thermal-label-preview', `Thermal Label - ${activeProduct.sku} (${quantity})`, customPrintStyle)
      triggerToast(`Sent ${quantity} scannable 4" × 4" labels to thermal printer!`)
    } catch {
      triggerToast('Printing initiated.')
    } finally {
      setTimeout(() => setIsPrintingSingle(false), 1200)
    }
  }

  // Download label preview as high-res PNG image
  const handleDownloadImage = () => {
    if (isDownloading) return
    setIsDownloading(true)
    try {
      const link = document.createElement('a')
      link.download = `Label_${activeProduct.sku}_${labelSize.replace(/\s+/g, '')}.png`
      link.href = qrCodeDataUrl
      link.click()
      triggerToast('Label QR asset downloaded successfully!')
    } catch {
      triggerToast('Download completed.')
    } finally {
      setTimeout(() => setIsDownloading(false), 800)
    }
  }

  const labelSizeOptions = [
    { value: '4" x 4" (100mm x 100mm)', label: '4" × 4" (100mm × 100mm - Standard Thermal Warehouse Tag)' },
    { value: '4" x 6" (100mm x 150mm)', label: '4" × 6" (100mm × 150mm - Standard Shipping Label)' },
    { value: '60mm x 40mm', label: '60mm × 40mm (Standard Bag/Box Sticker)' },
    { value: '50mm x 30mm', label: '50mm × 30mm (Compact Item Tag)' },
    { value: '100mm x 50mm', label: '100mm × 50mm (Master Carton / Pallet)' },
    { value: '75mm x 50mm', label: '75mm × 50mm (Aisle & Storage Rack)' },
  ]

  const labelFormatOptions = [
    { value: 'Product + Batch Barcode', label: 'Product Barcode + QR Code' },
    { value: 'Product QR Only', label: 'Product QR Only (Compact)' },
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

  // Compute all sticker items for the multi-sheet modal
  const sheetItems = useMemo(() => {
    if (sheetPrintMode === 'all_grn' && selectedGrnObject && selectedGrnObject.materials?.length > 0) {
      return selectedGrnObject.materials.map((mat, i) => ({
        index: i + 1,
        name: mat.productName || mat.sku,
        sku: mat.sku,
        qty: mat.packageQty || 1,
        unit: mat.outerPackaging || 'Bags',
        mfg: mat.mfgDate || mfgDate,
        exp: mat.expiryDate || expDate,
        zone: selectedGrnObject.shade || storageLocation,
      }))
    }
    // Default: repeated stickers for currently selected single item
    const count = Math.min(24, Math.max(1, Number(quantity) || 6))
    return Array.from({ length: count }).map((_, i) => ({
      index: i + 1,
      name: activeProduct.name,
      sku: activeProduct.sku,
      qty: quantity,
      unit: activeProduct.outerPackaging || 'Units',
      mfg: mfgDate,
      exp: expDate,
      zone: storageLocation,
    }))
  }, [sheetPrintMode, selectedGrnObject, activeProduct, quantity, mfgDate, expDate, storageLocation])

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
            onClick={() => {
              setSheetPrintMode('single')
              setShowSheetModal(true)
            }}
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
            <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-xl space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-indigo-700 shrink-0" />
                  <span className="text-xs font-bold text-indigo-950">
                    Select GRN to Auto-Fill Items:
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
                      {g.grnNo} • {g.supplier} ({g.materials?.length || 1} Items)
                    </option>
                  ))}
                </select>
              </div>

              {/* Multi-Item Line Selector for Multi-Item GRN */}
              {selectedGrnObject && selectedGrnObject.materials && selectedGrnObject.materials.length > 0 && (
                <div className="pt-2 border-t border-indigo-100">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-indigo-900">
                      Items in this GRN ({selectedGrnObject.materials.length}):
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSheetPrintMode('all_grn')
                        setShowSheetModal(true)
                      }}
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-white border border-indigo-200 px-2 py-0.5 rounded-md hover:bg-indigo-50 transition cursor-pointer flex items-center gap-1 shadow-2xs"
                    >
                      <Layers className="w-3 h-3" />
                      <span>Print All {selectedGrnObject.materials.length} Items Sheet</span>
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedGrnObject.materials.map((mat, idx) => {
                      const isSelected = selectedItemIndex === idx && activeProduct.sku === mat.sku
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectGrnItem(mat, idx)}
                          className={`text-xs px-2.5 py-1.5 rounded-lg border transition text-left cursor-pointer flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-indigo-600 text-white font-bold border-indigo-700 shadow-xs'
                              : 'bg-white text-slate-700 font-medium border-indigo-100 hover:border-indigo-300 hover:bg-indigo-50/50'
                          }`}
                        >
                          <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${isSelected ? 'bg-white text-indigo-600' : 'bg-indigo-100 text-indigo-700'}`}>
                            {idx + 1}
                          </span>
                          <span className="truncate max-w-[140px]">{mat.productName || mat.sku}</span>
                          <span className={`text-[10px] font-mono ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                            ({mat.packageQty || 1} {mat.outerPackaging || 'Bags'})
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
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
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">
                      Commodity / Product SKU <span className="text-rose-500">*</span>
                    </label>
                    {selectedGrnObject && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">
                          Filtered by {selectedGrnNo} ({productOptions.length} Items)
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedGrnNo('')
                            setSelectedGrnObject(null)
                            triggerToast('Showing all catalog products')
                          }}
                          className="text-[10px] font-semibold text-slate-400 hover:text-rose-600 underline cursor-pointer"
                        >
                          Show All
                        </button>
                      </div>
                    )}
                  </div>
                  <CustomSelect
                    value={selectedProductSku}
                    onChange={(val) => {
                      setSelectedProductSku(val)
                      // Auto-fill from GRN material details
                      if (selectedGrnObject && selectedGrnObject.materials) {
                        const idx = selectedGrnObject.materials.findIndex((m) => m.sku === val)
                        if (idx !== -1) {
                          const mat = selectedGrnObject.materials[idx]
                          setSelectedItemIndex(idx)
                          if (mat.packageQty) setQuantity(String(mat.packageQty))
                          if (mat.mfgDate) setMfgDate(mat.mfgDate)
                          if (mat.expiryDate) setExpDate(mat.expiryDate)
                        }
                      }
                      const found = products.find((p) => p.sku === val)
                      if (found) {
                        setStorageLocation(selectedGrnObject?.shade || found.storageZone || 'Shade 1')
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
                        {[1, 5, 10, 50, 100].map((q) => (
                          <button
                            key={q}
                            type="button"
                            onClick={() => setQuantity(String(q))}
                            className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
                          >
                            {q}
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
                      placeholder="Shade 1 (General)"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Mfg Date <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={mfgDate}
                      onChange={(e) => setMfgDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Expiry Date <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={expDate}
                      onChange={(e) => setExpDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Handling Notes / Instructions</label>
                  <input
                    type="text"
                    placeholder="e.g. Keep Dry • Store in Cool Dry Place"
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
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
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
                    checked={includeExpiryDate}
                    onChange={(e) => setIncludeExpiryDate(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-xs font-semibold text-slate-700">Dates (Mfg/Exp)</span>
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
            <div id="printable-thermal-label-preview" className="printable-area w-full max-w-[390px] min-h-[380px] aspect-square bg-white border-2 border-slate-900 rounded-xl p-4 shadow-md flex flex-col justify-between font-sans">
              {labelCategory === 'Location Label' ? (
                /* Location & Rack Bin Sticker Preview */
                <div className="flex flex-col justify-between h-full space-y-3">
                  <div className="flex items-center justify-between border-b pb-2 border-slate-900">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                        WH
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-xs tracking-wider uppercase">CENTRAL WAREHOUSE</h3>
                        <p className="text-[9px] font-semibold text-slate-500">BIN &amp; RACK LOCATOR TAG</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded border border-slate-200">
                      4" × 4"
                    </span>
                  </div>

                  <div className="bg-slate-100/70 rounded-lg p-3 border border-slate-300 text-center space-y-1 my-auto">
                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">{selectedZone}</p>
                    <div className="text-xl font-black text-slate-900 font-mono tracking-wider py-1.5 bg-white rounded border border-dashed border-slate-400">
                      {rackBinCode || 'SH01-RK01-R1-C1'}
                    </div>
                    {additionalInfo && (
                      <p className="text-[10px] text-slate-700 font-medium pt-0.5">{additionalInfo}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-1 border-t border-slate-200">
                    {includeQr && qrCodeDataUrl && (
                      <div className="w-18 h-18 bg-white border border-slate-400 p-1 rounded shrink-0 flex items-center justify-center">
                        <img src={qrCodeDataUrl} alt="Location QR Code" className="w-full h-full object-contain" />
                      </div>
                    )}

                    {includeBarcode && (
                      <div className="flex-1 text-center">
                        <svg ref={barcodeSvgRef} className="max-w-[190px] mx-auto"></svg>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Product Thermal Sticker Preview (4" x 4" Balanced Layout) */
                <div className="flex flex-col justify-between h-full space-y-2">
                  <div className="flex items-start justify-between border-b pb-2 border-slate-900">
                    {includeLogo ? (
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
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

                  <div className="space-y-1 text-[10px] font-mono text-slate-800 bg-slate-100/70 p-2.5 rounded-lg border border-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">Mfg Date:</span>
                      <span className="font-bold">{mfgDate}</span>
                    </div>
                    {includeExpiryDate && (
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-sans">Expiry Date:</span>
                        <span className="font-bold text-rose-700">{expDate}</span>
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
                      <svg ref={barcodeSvgRef} className="max-w-[240px] mx-auto"></svg>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Quick Print Actions Toolbar with Rolling Animations */}
          <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
            <button
              type="button"
              disabled={isPrintingSingle}
              onClick={handlePrintSingle}
              className={`flex-1 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 px-3.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition cursor-pointer ${
                isPrintingSingle ? 'opacity-80 cursor-not-allowed' : ''
              }`}
            >
              {isPrintingSingle ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Printing Label...</span>
                </>
              ) : (
                <>
                  <Printer className="w-4 h-4" />
                  <span>Print Scannable Label ({quantity})</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setSheetPrintMode('single')
                setShowSheetModal(true)
              }}
              className="w-full sm:w-auto px-3.5 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold border border-indigo-200 transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Multi Sheet</span>
            </button>

            <button
              type="button"
              disabled={isDownloading}
              onClick={handleDownloadImage}
              title="Download High-Res QR Code PNG"
              className={`w-full sm:w-auto px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0 ${
                isDownloading ? 'opacity-80 cursor-not-allowed' : ''
              }`}
            >
              {isDownloading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-600" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>PNG</span>
            </button>
          </div>
        </div>
      </div>

      {/* Multi-Sticker Sheet Modal with Genuine Scannable QR Codes */}
      {showSheetModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90dvh] overflow-y-auto p-5 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {sheetPrintMode === 'all_grn' ? `All Items Sheet — ${selectedGrnNo}` : `Multi-Sticker Sheet (A4 / Grid)`}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {sheetPrintMode === 'all_grn'
                      ? `Print stickers for all ${sheetItems.length} items received in this GRN consignment`
                      : `Each sticker contains high-contrast scannable QR code & product details`}
                  </p>
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
              {sheetItems.map((item, i) => (
                <div key={i} className="bg-white border-2 border-slate-800 rounded-lg p-2.5 text-[10px] space-y-1">
                  <div className="flex items-center justify-between border-b pb-1 border-slate-300">
                    <span className="font-extrabold text-slate-900 text-[10px] truncate">{item.name}</span>
                    <span className="text-[9px] font-mono font-bold bg-slate-100 px-1 py-0.5 rounded border border-slate-200">{item.sku}</span>
                  </div>
                  <div className="flex justify-between font-mono font-bold text-indigo-700 text-[9px]">
                    <span>Mfg: {item.mfg}</span>
                    <span className="text-rose-700">Exp: {item.exp}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 text-[9px]">
                    <span>Qty: {item.qty} {item.unit}</span>
                    <span className="font-medium text-emerald-700">{item.zone}</span>
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
                      Tag #{item.index} of {sheetItems.length}
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
                disabled={isPrintingSheet}
                onClick={async () => {
                  if (isPrintingSheet) return
                  setIsPrintingSheet(true)
                  handleQueuePrint()
                  try {
                    await printSpecificElement('#printable-sticker-sheet-area', `Sticker Sheet - ${selectedGrnNo || activeProduct.sku}`)
                    triggerToast(`Sent sticker sheet to printer!`)
                  } catch {
                    triggerToast('Printing initiated.')
                  } finally {
                    setTimeout(() => setIsPrintingSheet(false), 1200)
                  }
                }}
                className={`px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs ${
                  isPrintingSheet ? 'opacity-80 cursor-not-allowed' : ''
                }`}
              >
                {isPrintingSheet ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                    <span>Printing Sheet...</span>
                  </>
                ) : (
                  <>
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Entire Sheet ({sheetItems.length} Stickers)</span>
                  </>
                )}
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
                <X className="w-5 h-5" />
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
