import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Check,
  X,
  AlertTriangle,
  CheckCircle2,
  QrCode,
  ShieldCheck,
  ShieldAlert,
  Package,
  Layers,
  Camera,
  Zap,
  RotateCcw,
  Plus,
  Trash2,
  Barcode,
  Truck,
  Clock,
} from 'lucide-react'

export default function CheckoutQR() {
  const navigate = useNavigate()

  // Toast notifications state
  const [toastMessage, setToastMessage] = useState(null)
  const triggerToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Active Scanner Mode: 'QR Scanner' or 'Barcode Gun'
  const [scannerMode, setScannerMode] = useState('QR Scanner')
  const [isFlashOn, setIsFlashOn] = useState(false)
  const [cameraSource, setCameraSource] = useState('Dock Bay Camera 01')

  // Live Session Timer
  const [sessionSeconds, setSessionSeconds] = useState(14 * 60 + 26)
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionSeconds((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatSessionTime = (totalSec) => {
    const hrs = String(Math.floor(totalSec / 3600)).padStart(2, '0')
    const mins = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0')
    const secs = String(totalSec % 60).padStart(2, '0')
    return `${hrs}:${mins}:${secs}`
  }

  // Scanned Item Details Card State
  const [scannedItem, setScannedItem] = useState({
    title: 'Parle-G Glucose Biscuits (50g)',
    sku: 'FMCG-BIS-01',
    category: 'Shade 3: Packaged FMCG',
    batchNo: 'BT-2026-FMCG-01',
    expiryDate: '15 Mar 2027',
    isExpired: false,
    location: 'SH03-R02-C04',
    baseUnit: 'Pieces',
    packUnit: 'Gatta',
    unitsPerPack: 6,
    stockAvailable: 900,
    scanPacksCount: 20,
    scanBaseQuantity: 120,
    labStatus: 'Passed',
    labCertNo: 'LAB-2026-FMCG-088',
    isValid: true,
    validationChecks: [
      { name: 'Product Catalog Verified', passed: true },
      { name: 'Batch & GRN Active in Shade 3', passed: true },
      { name: 'Lab Clearance Certificate Passed', passed: true },
      { name: 'Fresh Expiry (Good till Mar 2027)', passed: true },
      { name: 'Sufficient Available Stock in Bin', passed: true },
      { name: 'Storage Coordinate Match (SH03-R02-C04)', passed: true },
    ],
  })

  // Scanned Items List Table Data
  const [scannedItemsList, setScannedItemsList] = useState([
    {
      id: 1,
      name: 'Parle-G Glucose Biscuits (50g)',
      sku: 'FMCG-BIS-01',
      batchNo: 'BT-2026-FMCG-01',
      location: 'SH03-R02-C04',
      baseQty: 120,
      baseUnit: 'Pieces',
      packQty: 20,
      packUnit: 'Gatta',
      labStatus: 'Passed',
      status: 'Ready for Dispatch',
    },
    {
      id: 2,
      name: 'Good Day Butter Cookies (75g)',
      sku: 'FMCG-BIS-02',
      batchNo: 'BT-2026-FMCG-02',
      location: 'SH03-R02-C05',
      baseQty: 60,
      baseUnit: 'Pieces',
      packQty: 10,
      packUnit: 'Gatta',
      labStatus: 'Passed',
      status: 'Ready for Dispatch',
    },
    {
      id: 3,
      name: 'Fortune Refined Mustard Oil',
      sku: 'OIL-REF-01',
      batchNo: 'BT-2026-OIL-02',
      location: 'SH02-R01-C03',
      baseQty: 150,
      baseUnit: 'Ltr',
      packQty: 10,
      packUnit: 'Tins (15L)',
      labStatus: 'Passed',
      status: 'Ready for Dispatch',
    },
  ])

  // Modals state
  const [showManualModal, setShowManualModal] = useState(false)
  const [showLabBlockModal, setShowLabBlockModal] = useState(false)
  const [showExpiryBlockModal, setShowExpiryBlockModal] = useState(false)
  const [showFinalizeModal, setShowFinalizeModal] = useState(false)

  // Manual input state
  const [manualCode, setManualCode] = useState('')
  const [manualQty, setManualQty] = useState(1)
  const [barcodeInput, setBarcodeInput] = useState('')

  // Simulate Normal Approved Item
  const handleSimulateNormalItem = () => {
    setScannedItem({
      title: 'Parle-G Glucose Biscuits (50g)',
      sku: 'FMCG-BIS-01',
      category: 'Shade 3: Packaged FMCG',
      batchNo: 'BT-2026-FMCG-01',
      expiryDate: '15 Mar 2027',
      isExpired: false,
      location: 'SH03-R02-C04',
      baseUnit: 'Pieces',
      packUnit: 'Gatta',
      unitsPerPack: 6,
      stockAvailable: 900,
      scanPacksCount: 20,
      scanBaseQuantity: 120,
      labStatus: 'Passed',
      labCertNo: 'LAB-2026-FMCG-088',
      isValid: true,
      validationChecks: [
        { name: 'Product Catalog Verified', passed: true },
        { name: 'Batch & GRN Active in Shade 3', passed: true },
        { name: 'Lab Clearance Certificate Passed', passed: true },
        { name: 'Fresh Expiry (Good till Mar 2027)', passed: true },
        { name: 'Sufficient Available Stock in Bin', passed: true },
        { name: 'Storage Coordinate Match (SH03-R02-C04)', passed: true },
      ],
    })
    triggerToast('Simulated: Lab Approved Parle-G batch ready for checkout.')
  }

  // Simulate Lab Blocked Item
  const handleSimulateLabBlockedItem = () => {
    setScannedItem({
      title: 'Aashirvaad Select Wheat Flour',
      sku: 'GRN-ATA-02',
      category: 'Shade 1: Grains & Bulk Pulses',
      batchNo: 'BT-2026-ATA-09 (FAILED QC)',
      expiryDate: '10 Aug 2027',
      isExpired: false,
      location: 'SH01-R03-C02',
      baseUnit: 'Kg',
      packUnit: 'Bags (10kg)',
      unitsPerPack: 10,
      stockAvailable: 400,
      scanPacksCount: 15,
      scanBaseQuantity: 150,
      labStatus: 'Failed',
      labCertNo: 'LAB-2026-FAIL-041',
      isValid: false,
      validationChecks: [
        { name: 'Product Catalog Verified', passed: true },
        { name: 'Batch & GRN Active in Shade 1', passed: true },
        { name: 'Lab Clearance Certificate FAILED (Moisture >14%)', passed: false },
        { name: 'Fresh Expiry Date', passed: true },
        { name: 'Sufficient Available Stock', passed: true },
        { name: 'Storage Coordinate Match', passed: true },
      ],
    })
    setShowLabBlockModal(true)
  }

  // Simulate Expired Item
  const handleSimulateExpiredItem = () => {
    setScannedItem({
      title: 'Amul Pasteurised Butter (500g)',
      sku: 'DRY-BTR-01',
      category: 'Shade 3: Packaged FMCG',
      batchNo: 'BT-2025-DRY-88',
      expiryDate: '01 Aug 2026',
      isExpired: true,
      location: 'SH03-R01-C01',
      baseUnit: 'Pieces',
      packUnit: 'Cartons',
      unitsPerPack: 12,
      stockAvailable: 120,
      scanPacksCount: 5,
      scanBaseQuantity: 60,
      labStatus: 'Passed',
      labCertNo: 'LAB-2025-CLEAR-11',
      isValid: false,
      validationChecks: [
        { name: 'Product Catalog Verified', passed: true },
        { name: 'Batch & GRN Found', passed: true },
        { name: 'Lab Clearance Certificate Passed', passed: true },
        { name: 'EXPIRED BATCH (Expired 01 Aug 2026)', passed: false },
        { name: 'Stock Available', passed: true },
        { name: 'Storage Coordinate Match', passed: true },
      ],
    })
    setShowExpiryBlockModal(true)
  }

  // Handle handheld Barcode Gun scan
  const handleBarcodeGunScan = (e) => {
    e.preventDefault()
    if (!barcodeInput.trim()) return
    const code = barcodeInput.trim().toUpperCase()

    if (code.includes('FAIL') || code.includes('PENDING') || code.includes('QC')) {
      handleSimulateLabBlockedItem()
    } else if (code.includes('EXP') || code.includes('EXPIRED')) {
      handleSimulateExpiredItem()
    } else {
      handleSimulateNormalItem()
    }
    setBarcodeInput('')
  }

  // Add Item to Checkout List
  const handleAddItemToCheckout = () => {
    if (scannedItem.labStatus !== 'Passed') {
      setShowLabBlockModal(true)
      return
    }

    if (scannedItem.isExpired) {
      setShowExpiryBlockModal(true)
      return
    }

    const newItem = {
      id: Date.now(),
      name: scannedItem.title,
      sku: scannedItem.sku,
      batchNo: scannedItem.batchNo,
      location: scannedItem.location,
      baseQty: scannedItem.scanBaseQuantity,
      baseUnit: scannedItem.baseUnit,
      packQty: scannedItem.scanPacksCount,
      packUnit: scannedItem.packUnit,
      labStatus: scannedItem.labStatus,
      status: 'Ready for Dispatch',
    }

    setScannedItemsList([newItem, ...scannedItemsList])
    triggerToast(
      `${scannedItem.title} (${scannedItem.scanBaseQuantity} ${scannedItem.baseUnit}) added to checkout manifest.`
    )
  }

  // Delete item from list
  const handleDeleteItem = (id) => {
    setScannedItemsList(scannedItemsList.filter((i) => i.id !== id))
    triggerToast('Item removed from checkout queue.')
  }

  // Manual code entry
  const handleManualSubmit = (e) => {
    e.preventDefault()
    if (!manualCode.trim()) return

    const mockItem = {
      id: Date.now(),
      name: manualCode.toUpperCase().includes('BIS')
        ? 'Parle-G Glucose Biscuits (50g)'
        : manualCode.toUpperCase().includes('OIL')
        ? 'Fortune Refined Mustard Oil'
        : 'Sharbati Wheat Grain',
      sku: manualCode.toUpperCase().trim(),
      batchNo: 'BT-2026-MANUAL-01',
      location: 'SH03-R02-C04',
      baseQty: Number(manualQty) * 6,
      baseUnit: 'Pieces',
      packQty: Number(manualQty),
      packUnit: 'Gatta',
      labStatus: 'Passed',
      status: 'Ready for Dispatch',
    }

    setScannedItemsList([mockItem, ...scannedItemsList])
    setShowManualModal(false)
    setManualCode('')
    setManualQty(1)
    triggerToast(`Manual item verified and added to checkout list.`)
  }

  // Finalize Outward Dispatch & Deduct Stock
  const handleFinalizeCheckout = () => {
    setShowFinalizeModal(false)
    triggerToast(
      `Checkout Completed! ${scannedItemsList.length} items deducted from 6 Shades warehouse inventory.`
    )
    setScannedItemsList([])
  }

  const totalBaseUnits = scannedItemsList.reduce((sum, i) => sum + i.baseQty, 0)
  const totalPacks = scannedItemsList.reduce((sum, i) => sum + i.packQty, 0)

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
            <QrCode className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">Outward QR Checkout Station</h1>
              <span className="text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60 px-2.5 py-0.5 rounded-full shrink-0">
                Floor Scan Bay
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1 max-w-2xl">
              High-speed barcode/QR scanner with automated dual-unit conversion (Gatta to Units) and mandatory Lab Safety Lock clearance.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={handleSimulateNormalItem}
            className="px-2.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition cursor-pointer"
            title="Simulate scanning a lab-approved batch"
          >
            ✓ Approved Stock
          </button>
          <button
            type="button"
            onClick={handleSimulateLabBlockedItem}
            className="px-2.5 py-1.5 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs font-bold hover:bg-rose-100 transition cursor-pointer"
            title="Simulate scanning a failed/quarantined batch"
          >
            ⚠️ QC Hold Block
          </button>
          <button
            type="button"
            onClick={handleSimulateExpiredItem}
            className="px-2.5 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold hover:bg-amber-100 transition cursor-pointer"
            title="Simulate scanning an expired batch"
          >
            ⛔ Expired Batch
          </button>
          <button
            type="button"
            onClick={() => setShowManualModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Manual Entry</span>
          </button>
        </div>
      </div>

      {/* 4 Dynamic KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center gap-3.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-500 truncate">Scanned in Queue</p>
            <h3 className="text-xl font-bold text-slate-800 leading-tight mt-0.5 truncate">
              {scannedItemsList.length} SKUs
            </h3>
            <p className="text-[11px] text-indigo-600 font-medium truncate">Ready for dispatch gate</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center gap-3.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-500 truncate">Total Base Units</p>
            <h3 className="text-xl font-bold text-slate-800 leading-tight mt-0.5 truncate">
              {totalBaseUnits.toLocaleString()} Units
            </h3>
            <p className="text-[11px] text-emerald-600 font-medium truncate">Pieces, Kg, Ltr &amp; Boxes</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center gap-3.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-500 truncate">Physical Packaging</p>
            <h3 className="text-xl font-bold text-slate-800 leading-tight mt-0.5 truncate">
              {totalPacks} Packs
            </h3>
            <p className="text-[11px] text-blue-600 font-medium truncate">Cartons &amp; Gatta count</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center gap-3.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-500 truncate">Lab Safety Lock</p>
            <h3 className="text-xl font-bold text-purple-700 leading-tight mt-0.5 truncate">
              100% Locked
            </h3>
            <p className="text-[11px] text-purple-600 font-medium truncate">Zero dispatch without QA</p>
          </div>
        </div>
      </div>

      {/* 2-Column Scanner and Item Inspection Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: High-Tech Scanner Viewfinder (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-800">Scanner Viewfinder</h3>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{formatSessionTime(sessionSeconds)}</span>
              </div>
            </div>

            {/* Viewfinder Display Box */}
            <div className="relative bg-slate-950 rounded-xl overflow-hidden aspect-4/3 flex flex-col items-center justify-center p-4 border border-slate-800 shadow-inner">
              {/* Scan laser line animation */}
              <div className="absolute inset-x-4 top-1/2 h-0.5 bg-rose-500/80 shadow-[0_0_12px_#f43f5e] animate-pulse pointer-events-none" />

              {/* Viewfinder Target Brackets */}
              <div className="w-44 h-44 border-2 border-dashed border-indigo-400/70 rounded-2xl flex flex-col items-center justify-center text-center p-3 relative">
                <QrCode className="w-16 h-16 text-slate-600/80 animate-pulse mb-2" />
                <p className="text-[11px] font-semibold text-slate-400">Position Barcode / QR inside frame</p>
              </div>

              {/* Viewfinder Overlay Badges */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 text-[10px] text-emerald-400 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>CAMERA ONLINE</span>
              </div>

              <div className="absolute top-3 right-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsFlashOn(!isFlashOn)}
                  className={`p-1.5 rounded-lg border text-xs transition cursor-pointer ${
                    isFlashOn
                      ? 'bg-amber-400 text-slate-900 border-amber-300'
                      : 'bg-black/60 text-slate-300 border-white/10 hover:bg-black/80'
                  }`}
                  title="Toggle Flashlight"
                >
                  <Zap className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="absolute bottom-3 inset-x-3 text-center bg-black/60 backdrop-blur-md py-1.5 px-3 rounded-lg border border-white/10 text-[11px] text-slate-300 font-mono">
                Source: {cameraSource}
              </div>
            </div>

            {/* Scanner Mode Switch Tabs */}
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setScannerMode('QR Scanner')}
                className={`py-2 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  scannerMode === 'QR Scanner'
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>QR Scanner</span>
              </button>
              <button
                type="button"
                onClick={() => setScannerMode('Barcode Gun')}
                className={`py-2 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  scannerMode === 'Barcode Gun'
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Barcode className="w-3.5 h-3.5" />
                <span>Barcode Gun</span>
              </button>
            </div>

            {/* Handheld Gun Rapid Input */}
            <form onSubmit={handleBarcodeGunScan} className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-700">
                Handheld Scanner Input (Enter Key Supported)
              </label>
              <div className="relative">
                <Barcode className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  placeholder="Scan barcode or type SKU (e.g. FMCG-BIS-01)..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-20 py-2 text-xs text-slate-800 font-mono placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1 px-3 py-1 rounded-lg bg-indigo-600 text-white text-[11px] font-bold hover:bg-indigo-700 transition cursor-pointer"
                >
                  Verify
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Scanned Item Validation & Inspection (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                  Inspected Payload
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">{scannedItem.title}</h3>
              </div>
              <div>
                {scannedItem.labStatus === 'Passed' && !scannedItem.isExpired ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Lab Cleared</span>
                  </span>
                ) : scannedItem.isExpired ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Expired Batch</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Quarantine Locked</span>
                  </span>
                )}
              </div>
            </div>

            {/* Item Key Properties Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                <span className="text-[10px] text-slate-400 font-medium">SKU Code</span>
                <p className="font-bold text-slate-800 font-mono mt-0.5">{scannedItem.sku}</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                <span className="text-[10px] text-slate-400 font-medium">Batch No</span>
                <p className="font-bold text-slate-800 font-mono mt-0.5">{scannedItem.batchNo}</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                <span className="text-[10px] text-slate-400 font-medium">Storage Bin</span>
                <p className="font-bold text-indigo-700 font-mono mt-0.5">{scannedItem.location}</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                <span className="text-[10px] text-slate-400 font-medium">Expiry Date</span>
                <p className={`font-bold mt-0.5 ${scannedItem.isExpired ? 'text-rose-600' : 'text-slate-800'}`}>
                  {scannedItem.expiryDate}
                </p>
              </div>
            </div>

            {/* Dual-Unit Pack Calculation & Quantity Adjuster */}
            <div className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold text-indigo-700 uppercase">Dual-Unit Pack Ratio</span>
                <p className="text-xs text-slate-600 mt-0.5">
                  1 {scannedItem.packUnit} = {scannedItem.unitsPerPack} {scannedItem.baseUnit}
                </p>
                <div className="text-base font-black text-slate-900 mt-1">
                  {scannedItem.scanPacksCount} {scannedItem.packUnit} ={' '}
                  <span className="text-indigo-600">{scannedItem.scanBaseQuantity} {scannedItem.baseUnit}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const nextPacks = Math.max(1, scannedItem.scanPacksCount - 5)
                    setScannedItem({
                      ...scannedItem,
                      scanPacksCount: nextPacks,
                      scanBaseQuantity: nextPacks * scannedItem.unitsPerPack,
                    })
                  }}
                  className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition cursor-pointer flex items-center justify-center shadow-xs"
                >
                  -
                </button>
                <span className="font-mono text-sm font-bold text-slate-800 px-3">
                  {scannedItem.scanPacksCount} Packs
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const nextPacks = scannedItem.scanPacksCount + 5
                    setScannedItem({
                      ...scannedItem,
                      scanPacksCount: nextPacks,
                      scanBaseQuantity: nextPacks * scannedItem.unitsPerPack,
                    })
                  }}
                  className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition cursor-pointer flex items-center justify-center shadow-xs"
                >
                  +
                </button>
              </div>
            </div>

            {/* 6 Pre-Dispatch Quality Validation Checks */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 mb-2">Pre-Dispatch Gate Security Checks</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {scannedItem.validationChecks.map((chk, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-2 p-2 rounded-xl border ${
                      chk.passed
                        ? 'bg-emerald-50/60 border-emerald-100 text-emerald-800'
                        : 'bg-rose-50/60 border-rose-100 text-rose-800'
                    }`}
                  >
                    {chk.passed ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    )}
                    <span className="font-medium truncate">{chk.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Add to Outward Checkout CTA */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleAddItemToCheckout}
                disabled={!scannedItem.isValid}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-bold shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Verify &amp; Add to Checkout Manifest</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Manifest Table Card */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">Active Outward Checkout Queue</h2>
              <p className="text-[11px] text-slate-500">Verified commodities ready for physical stock deduction and gate pass generation.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs bg-indigo-50 text-indigo-700 font-bold px-3 py-1 rounded-full border border-indigo-200/60">
              {scannedItemsList.length} Items in Queue
            </span>
            {scannedItemsList.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setScannedItemsList([])
                  triggerToast('Checkout queue cleared.')
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-semibold transition cursor-pointer"
              >
                <RotateCcw className="w-3 h-3 text-slate-400" />
                <span>Clear All</span>
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4 min-w-[200px]">Product &amp; SKU</th>
                <th className="py-3 px-4 min-w-[140px]">Bin Coordinate</th>
                <th className="py-3 px-4 min-w-[130px]">Batch No</th>
                <th className="py-3 px-4 min-w-[130px] text-right">Base Qty</th>
                <th className="py-3 px-4 min-w-[130px] text-right">Packaging Packs</th>
                <th className="py-3 px-4 min-w-[100px] text-center">Lab Clearance</th>
                <th className="py-3 px-4 min-w-[110px] text-center">Status</th>
                <th className="py-3 px-4 w-16 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {scannedItemsList.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <QrCode className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    No items in checkout queue. Scan a barcode above or click Manual Entry.
                  </td>
                </tr>
              ) : (
                scannedItemsList.map((row, idx) => (
                  <tr key={row.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-4 text-center text-slate-400 font-mono text-[11px]">
                      {idx + 1}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{row.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{row.sku}</div>
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-indigo-700">
                      {row.location}
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-700">
                      {row.batchNo}
                    </td>

                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      {row.baseQty.toLocaleString()} {row.baseUnit}
                    </td>

                    <td className="py-3 px-4 text-right text-emerald-600 font-semibold">
                      {row.packQty} {row.packUnit}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <Check className="w-3 h-3" />
                        <span>Passed</span>
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        <span>{row.status}</span>
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(row.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title="Remove from queue"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Finalize Outward Dispatch Bar */}
        {scannedItemsList.length > 0 && (
          <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs text-slate-500">Checkout Summary Payload</p>
              <p className="text-sm font-bold text-slate-800 mt-0.5">
                {scannedItemsList.length} Products • {totalBaseUnits.toLocaleString()} Base Units •{' '}
                <span className="text-indigo-600">{totalPacks} Packs Total</span>
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowFinalizeModal(true)}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition cursor-pointer"
            >
              <Truck className="w-4 h-4" />
              <span>Finalize Dispatch &amp; Deduct Stock</span>
            </button>
          </div>
        )}
      </div>

      {/* MODAL 1: MANUAL CODE ENTRY */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full max-h-[90dvh] overflow-y-auto p-5 sm:p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800">Manual SKU Entry</h3>
              <button
                type="button"
                onClick={() => setShowManualModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleManualSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                  SKU Code or Barcode Ref *
                </label>
                <input
                  type="text"
                  required
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="e.g. FMCG-BIS-01, OIL-REF-01..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                  Pack Count (Cartons/Gatta) *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={manualQty}
                  onChange={(e) => setManualQty(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition cursor-pointer"
                >
                  Add Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: LAB SAFETY LOCK BLOCK ALERT */}
      {showLabBlockModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-rose-200 max-w-md w-full max-h-[90dvh] overflow-y-auto p-5 sm:p-6 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Lab Clearance Lock Engaged</h3>
            <p className="text-xs text-slate-500 mt-1">
              This commodity batch has <strong>NOT passed QA quality compliance testing</strong> or is currently quarantined under lab hold. Dispatch is strictly prohibited.
            </p>
            <div className="mt-4 p-3 bg-rose-50/70 border border-rose-200 rounded-xl text-xs text-rose-900 font-mono">
              Certificate: {scannedItem.labCertNo || 'FAILED_QC_HOLD'}
            </div>
            <div className="mt-5 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setShowLabBlockModal(false)}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition cursor-pointer"
              >
                Acknowledge &amp; Reject Outward
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: EXPIRED BATCH ALERT */}
      {showExpiryBlockModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-amber-200 max-w-md w-full max-h-[90dvh] overflow-y-auto p-5 sm:p-6 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Expired Commodity Detected</h3>
            <p className="text-xs text-slate-500 mt-1">
              Batch <strong>{scannedItem.batchNo}</strong> reached its shelf-life expiration on <strong>{scannedItem.expiryDate}</strong>. It cannot be issued for outward distribution.
            </p>
            <div className="mt-5 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setShowExpiryBlockModal(false)}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition cursor-pointer"
              >
                Understood &amp; Block
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: FINALIZE CHECKOUT */}
      {showFinalizeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full max-h-[90dvh] overflow-y-auto p-5 sm:p-6 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Confirm Outward Stock Deduction</h3>
            <p className="text-xs text-slate-500 mt-1">
              Finalizing will deduct <strong>{totalBaseUnits.toLocaleString()} base units</strong> across{' '}
              <strong>{scannedItemsList.length} SKUs</strong> from the warehouse inventory matrix.
            </p>
            <div className="mt-5 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={() => setShowFinalizeModal(false)}
                className="w-full sm:w-auto px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleFinalizeCheckout}
                className="w-full sm:w-auto px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
              >
                Confirm &amp; Deduct Stock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
