import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Check,
  X,
  AlertTriangle,
  CheckCircle2,
  Warehouse,
  QrCode,
  ShieldCheck,
  ShieldAlert,
  Package,
} from 'lucide-react'

export default function CheckoutQR() {
  const navigate = useNavigate()

  // Toast notifications state
  const [toastMessage, setToastMessage] = useState(null)
  const triggerToast = (msg) => {
    setToastMessage(msg)
  }

  // Active Scanner Tab: 'QR Scanner' or 'Barcode Scanner'
  const [activeScannerTab, setActiveScannerTab] = useState('QR Scanner')

  // Flashlight and Camera State
  const [isFlashOn, setIsFlashOn] = useState(false)
  const [cameraMode, setCameraMode] = useState('Rear Convoy Camera')

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

  // Scanned Item Details Card State (Commercial Warehouse Goods, Lab Clearances, Base Units)
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
    scanPacksCount: 20, // 20 Gatta
    scanBaseQuantity: 120, // 120 Biscuits
    labStatus: 'Passed', // 'Passed' | 'Pending' | 'Failed'
    labCertNo: 'LAB-2026-FMCG-088',
    isValid: true,
    validationChecks: [
      { name: 'Product Catalog Found', passed: true },
      { name: 'Batch & GRN Active', passed: true },
      { name: 'Lab Test Clearance (Passed)', passed: true },
      { name: 'Not Expired (Good till Mar 2027)', passed: true },
      { name: 'Sufficient Base Stock in Bin', passed: true },
      { name: 'Grid Bin Coordinate Match', passed: true },
    ],
  })

  // Scanned Items List Table Data (Base units with Gatta breakdown)
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
      packQty: 5,
      packUnit: 'Gatta',
      labStatus: 'Passed',
      status: 'Ready for Dispatch',
    },
    {
      id: 3,
      name: 'Sharbati Wheat Grain (Grade A)',
      sku: 'GRN-WHT-01',
      batchNo: 'BT-2026-GRN-01',
      location: 'SH01-R02-C01',
      baseQty: 250,
      baseUnit: 'Kg',
      packQty: 5,
      packUnit: 'Bags',
      labStatus: 'Passed',
      status: 'Ready for Dispatch',
    },
    {
      id: 4,
      name: 'Fortune Refined Mustard Oil (15L)',
      sku: 'OIL-REF-01',
      batchNo: 'BT-2026-OIL-01',
      location: 'SH02-R01-C01',
      baseQty: 60,
      baseUnit: 'Ltr',
      packQty: 4,
      packUnit: 'Tins',
      labStatus: 'Passed',
      status: 'Ready for Dispatch',
    },
    {
      id: 5,
      name: 'Maggi 2-Minute Noodles (70g)',
      sku: 'FMCG-NOD-01',
      batchNo: 'BT-2026-FMCG-03',
      location: 'SH03-R01-C03',
      baseQty: 96,
      baseUnit: 'Packets',
      packQty: 4,
      packUnit: 'Cartons',
      labStatus: 'Passed',
      status: 'Ready for Dispatch',
    },
  ])

  // Modals
  const [showManualModal, setShowManualModal] = useState(false)
  const [showProceedModal, setShowProceedModal] = useState(false)
  const [showLabBlockModal, setShowLabBlockModal] = useState(false)
  const [showExpiryBlockModal, setShowExpiryBlockModal] = useState(false)
  const [manualCode, setManualCode] = useState('')
  const [manualQty, setManualQty] = useState(1)
  const [barcodeInput, setBarcodeInput] = useState('')

  // Quick Simulation toggles to test validation safety checks
  const handleSimulateLabBlockedItem = () => {
    setScannedItem({
      title: 'Cooking Oil (Refined Mustard 15L)',
      sku: 'OIL-REF-02',
      category: 'Shade 2: Edible Oils & Liquids',
      batchNo: 'BT-2026-OIL-99',
      expiryDate: '10 Aug 2027',
      isExpired: false,
      location: 'SH02-R01-C04',
      baseUnit: 'Ltr',
      packUnit: 'Tins',
      unitsPerPack: 15,
      stockAvailable: 300,
      scanPacksCount: 10,
      scanBaseQuantity: 150,
      labStatus: 'Pending', // PENDING LAB TEST -> MUST BLOCK
      labCertNo: 'PENDING-QC',
      isValid: false,
      validationChecks: [
        { name: 'Product Catalog Found', passed: true },
        { name: 'Batch & GRN Active', passed: true },
        { name: 'Lab Test Clearance (BLOCKED - Testing Pending)', passed: false },
        { name: 'Not Expired (Good till Aug 2027)', passed: true },
        { name: 'Sufficient Base Stock in Bin', passed: true },
        { name: 'Grid Bin Coordinate Match', passed: true },
      ],
    })
    setShowLabBlockModal(true)
    setShowExpiryBlockModal(false)
    triggerToast('Warning: Scanned batch has PENDING LAB TEST. Checkout is blocked!')
  }

  const handleSimulateExpiredItem = () => {
    setScannedItem({
      title: 'Good Day Butter Cookies (75g)',
      sku: 'FMCG-BIS-02',
      category: 'Shade 3: Packaged FMCG',
      batchNo: 'BT-2025-FMCG-EXPIRED',
      expiryDate: '10 Aug 2025 (Expired)',
      isExpired: true,
      location: 'SH03-R02-C05',
      baseUnit: 'Pieces',
      packUnit: 'Gatta',
      unitsPerPack: 6,
      stockAvailable: 150,
      scanPacksCount: 10,
      scanBaseQuantity: 60,
      labStatus: 'Passed',
      labCertNo: 'LAB-2025-FMCG-019',
      isValid: false,
      validationChecks: [
        { name: 'Product Catalog Found', passed: true },
        { name: 'Batch & GRN Active', passed: true },
        { name: 'Lab Test Clearance (Passed)', passed: true },
        { name: 'Not Expired (BLOCKED - Product Expired)', passed: false },
        { name: 'Sufficient Base Stock in Bin', passed: true },
        { name: 'Grid Bin Coordinate Match', passed: true },
      ],
    })
    setShowExpiryBlockModal(true)
    setShowLabBlockModal(false)
    triggerToast('CRITICAL: Scanned batch is EXPIRED! Outward checkout blocked.')
  }

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
        { name: 'Product Catalog Found', passed: true },
        { name: 'Batch & GRN Active', passed: true },
        { name: 'Lab Test Clearance (Passed)', passed: true },
        { name: 'Not Expired (Good till Mar 2027)', passed: true },
        { name: 'Sufficient Base Stock in Bin', passed: true },
        { name: 'Grid Bin Coordinate Match', passed: true },
      ],
    })
    setShowLabBlockModal(false)
    setShowExpiryBlockModal(false)
    triggerToast('Loaded Lab-Approved Parle-G Biscuits.')
  }

  // Handle handheld Barcode Gun or quick text scan
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
      `${scannedItem.title} (${scannedItem.scanBaseQuantity} ${scannedItem.baseUnit}) verified & added to outward list.`
    )
  }

  // Delete item from list
  const handleDeleteItem = (id) => {
    setScannedItemsList(scannedItemsList.filter((i) => i.id !== id))
    triggerToast('Item removed from checkout list.')
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
    setShowProceedModal(false)
    triggerToast(
      `Checkout Completed! ${scannedItemsList.length} items deducted from 6 Shades warehouse stock.`
    )
    setScannedItemsList([])
  }

  return (
    <div className="space-y-4 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#162214] text-amber-300 px-4 py-3 rounded-lg shadow-2xl border border-amber-400 text-xs font-semibold flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP HIMALAYAN CONVOY BANNER (Preserved) */}
      <div className="relative rounded-xl overflow-hidden shadow-md border border-slate-200/80 bg-slate-900 h-28 sm:h-32">
        <img
          src="/border.png"
          alt="Warehouse Outward Convoy"
          className="w-full h-full object-cover object-center opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/25 to-black/65"></div>
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
          <div className="w-10 h-10 rounded-lg bg-[#1E3A1E] text-white flex items-center justify-center shadow-xs shrink-0">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              Outward QR Checkout Station
            </h2>
            <p className="text-xs text-slate-500">
              Handheld gun or camera scan: 1 Gatta = 6 Biscuits automatic conversion &amp; Lab Safety Lock.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Simulation switches */}
          <button
            type="button"
            onClick={handleSimulateNormalItem}
            className="px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition cursor-pointer"
          >
            ✓ Approved Stock
          </button>
          <button
            type="button"
            onClick={handleSimulateLabBlockedItem}
            className="px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 text-xs font-bold hover:bg-rose-100 transition cursor-pointer"
          >
            ⚠️ Pending Lab
          </button>
          <button
            type="button"
            onClick={handleSimulateExpiredItem}
            className="px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold hover:bg-amber-100 transition cursor-pointer"
          >
            ⛔ Expired Batch
          </button>
          <button
            type="button"
            onClick={() => setShowManualModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1E3A1E] text-white text-xs font-bold shadow-xs hover:bg-[#152915] transition cursor-pointer"
          >
            <span>Manual Entry</span>
          </button>
        </div>
      </div>

      {/* 5 KPI STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500">Items in Checkout</p>
          <h3 className="text-2xl font-black text-slate-800 leading-tight">
            {scannedItemsList.length}
          </h3>
          <p className="text-[10px] text-slate-400">Ready for dispatch manifest</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500">Total Base Units</p>
          <h3 className="text-2xl font-black text-emerald-800 leading-tight">
            {scannedItemsList.reduce((sum, i) => sum + i.baseQty, 0).toLocaleString()}
          </h3>
          <p className="text-[10px] text-slate-400">Pcs / Kg / Ltr to deduct</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500">Physical Cartons / Gatta</p>
          <h3 className="text-2xl font-black text-slate-800 leading-tight">
            {scannedItemsList.reduce((sum, i) => sum + i.packQty, 0)} Packs
          </h3>
          <p className="text-[10px] text-slate-400">Physical packaging count</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500">Lab Safety Lock</p>
          <h3 className="text-sm font-black text-emerald-800 leading-tight flex items-center gap-1 mt-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>100% Verified</span>
          </h3>
          <p className="text-[10px] text-slate-400">Pending/Failed blocked</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500">Outward Bay Status</p>
          <h3 className="text-sm font-black text-slate-800 leading-tight flex items-center gap-1 mt-1 font-mono">
            <Warehouse className="w-4 h-4 text-[#1E3A1E]" />
            <span>BAY 02 (Cleared)</span>
          </h3>
          <p className="text-[10px] text-emerald-600 font-bold">● Ready for Gate Pass</p>
        </div>
      </div>

      {/* SCANNER VIEW + SCANNED ITEM CARD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* SCANNER VIEW (Span 5 / 12) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <QrCode className="w-4 h-4 text-emerald-700" />
              <span>Optical / Gun Barcode Scanner</span>
            </span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              Gun / Camera Active
            </span>
          </div>

          {/* Quick Barcode Gun Scanner Input Bar */}
          <form onSubmit={handleBarcodeGunScan} className="flex gap-1.5">
            <input
              type="text"
              placeholder="Scan with barcode gun or enter SKU/Batch..."
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono focus:bg-white focus:border-emerald-600 outline-none"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-[#1E3A1E] hover:bg-[#152915] text-white rounded-lg text-xs font-bold shrink-0 cursor-pointer"
            >
              Scan
            </button>
          </form>

          <div className="relative h-60 bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center border border-slate-800">
            {/* Viewfinder background */}
            <div
              className={`absolute inset-0 bg-cover bg-center transition-all duration-300 ${
                isFlashOn ? 'brightness-125' : 'brightness-75'
              }`}
              style={{
                backgroundImage:
                  "radial-gradient(circle at center, rgba(30, 58, 30, 0.4) 0%, rgba(10, 15, 10, 0.9) 100%), url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80')",
              }}
            />

            {/* Target Reticle */}
            <div className="absolute w-40 h-40 pointer-events-none z-20 flex flex-col justify-between p-1">
              <div className="flex justify-between w-full">
                <div className="w-6 h-6 border-t-3 border-l-3 border-[#10B981] rounded-tl-lg" />
                <div className="w-6 h-6 border-t-3 border-r-3 border-[#10B981] rounded-tr-lg" />
              </div>
              <div className="w-full h-0.5 bg-[#10B981] shadow-[0_0_8px_#10B981] animate-pulse" />
              <div className="flex justify-between w-full">
                <div className="w-6 h-6 border-b-3 border-l-3 border-[#10B981] rounded-bl-lg" />
                <div className="w-6 h-6 border-b-3 border-r-3 border-[#10B981] rounded-br-lg" />
              </div>
            </div>

            {/* Center QR Graphic */}
            <div className="relative z-10 p-2 bg-white/95 rounded-lg shadow-lg">
              <QrCode className="w-16 h-16 text-slate-900" />
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-2 inset-x-3 z-20 flex items-center justify-between gap-2 text-xs">
              <button
                type="button"
                onClick={() => setIsFlashOn(!isFlashOn)}
                className="flex-1 py-1 px-2 rounded bg-black/60 hover:bg-black/80 text-white font-semibold cursor-pointer"
              >
                {isFlashOn ? 'Flash OFF' : 'Flash ON'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setCameraMode(
                    cameraMode === 'Rear Camera' ? 'Front Camera' : 'Rear Camera'
                  )
                  triggerToast(`Switched to: ${cameraMode}`)
                }}
                className="flex-1 py-1 px-2 rounded bg-black/60 hover:bg-black/80 text-white font-semibold cursor-pointer"
              >
                Switch Lens
              </button>
            </div>
          </div>
        </div>

        {/* SCANNED ITEM VALIDATION CARD (Span 7 / 12) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  LIVE SCANNED ITEM
                </span>
                <h3 className="text-base font-black text-slate-900 leading-tight">
                  {scannedItem.title}
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  SKU: {scannedItem.sku} • BATCH: {scannedItem.batchNo}
                </p>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                  scannedItem.labStatus === 'Passed'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}
              >
                {scannedItem.labStatus === 'Passed' ? (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Lab Approved</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-4 h-4" />
                    <span>Lab Pending / Blocked</span>
                  </>
                )}
              </span>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 text-xs border-b border-slate-100">
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block">Grid Bin</span>
                <span className="font-mono font-black text-slate-800">{scannedItem.location}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block">Expiry Date</span>
                <span className="font-mono font-bold text-slate-800">{scannedItem.expiryDate}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block">
                  Available Stock
                </span>
                <span className="font-mono font-bold text-slate-800">
                  {scannedItem.stockAvailable} {scannedItem.baseUnit}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block">Packaging</span>
                <span className="font-medium text-slate-700">
                  1 {scannedItem.packUnit} = {scannedItem.unitsPerPack} {scannedItem.baseUnit}
                </span>
              </div>
            </div>

            {/* Base Quantity Deduction Computation */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl mt-3 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500 font-medium">Checkout Pack Count:</span>
                <div className="font-bold text-slate-800">
                  {scannedItem.scanPacksCount} {scannedItem.packUnit}
                </div>
              </div>
              <div className="text-right">
                <span className="text-slate-500 font-medium">
                  Calculated Minimum Unit Deduction:
                </span>
                <div className="font-black font-mono text-emerald-900 text-sm">
                  {scannedItem.scanBaseQuantity} {scannedItem.baseUnit}
                </div>
              </div>
            </div>

            {/* 6 Automated Validation Checks */}
            <div className="pt-3 space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Automated Outward Validation Rules
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                {scannedItem.validationChecks.map((v, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-2 p-1.5 rounded-lg border text-[11px] font-medium ${
                      v.passed
                        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                        : 'bg-rose-50 border-rose-300 text-rose-900 font-bold'
                    }`}
                  >
                    {v.passed ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    )}
                    <span className="truncate">{v.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={handleAddItemToCheckout}
              disabled={scannedItem.labStatus !== 'Passed'}
              className={`px-5 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-xs ${
                scannedItem.labStatus === 'Passed'
                  ? 'bg-[#1E3A1E] hover:bg-[#2A4428] text-white active:scale-98'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>Add to Outward List</span>
            </button>
          </div>
        </div>
      </div>

      {/* CHECKOUT LIST TABLE */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-emerald-700" />
            <h2 className="text-sm font-bold text-slate-800">
              Items Verified for Outward Dispatch ({scannedItemsList.length})
            </h2>
          </div>

          {scannedItemsList.length > 0 && (
            <button
              type="button"
              onClick={() => setShowProceedModal(true)}
              className="bg-[#1E3A1E] hover:bg-[#2A4428] text-white px-4 py-2 rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
            >
              Finalize Dispatch ({scannedItemsList.length} Items)
            </button>
          )}
        </div>

        <div className="overflow-x-auto no-scrollbar w-full">
          <table className="w-full text-left text-xs divide-y divide-slate-200" style={{ minWidth: '950px' }}>
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-3 w-10 text-center">#</th>
                <th className="py-3 px-4 min-w-[200px]">Product &amp; SKU</th>
                <th className="py-3 px-4 min-w-[120px]">Batch No.</th>
                <th className="py-3 px-4 min-w-[130px]">Storage Bin</th>
                <th className="py-3 px-4 min-w-[130px] text-right">Base Quantity</th>
                <th className="py-3 px-4 min-w-[130px] text-right">Packaging</th>
                <th className="py-3 px-4 text-center min-w-[120px]">Lab Status</th>
                <th className="py-3 px-3 text-center w-16">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {scannedItemsList.map((item, idx) => (
                <tr key={item.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-3 text-center text-slate-400 font-bold">{idx + 1}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    <div>{item.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{item.sku}</div>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-700">{item.batchNo}</td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-800">{item.location}</td>
                  <td className="py-3 px-4 text-right font-mono font-black text-emerald-900">
                    {item.baseQty} {item.baseUnit}
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-slate-700">
                    {item.packQty} {item.packUnit}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      ✓ {item.labStatus}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: LAB BLOCK WARNING */}
      {showLabBlockModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border-2 border-rose-500 text-center space-y-4">
            <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                DISPATCH LOCKED: LAB TEST NOT PASSED!
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Batch <strong>{scannedItem.batchNo}</strong> has not completed or passed Lab Quality Testing.
                Standard warehouse protocol forbids dispatch of non-certified commodities.
              </p>
            </div>

            <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-left text-xs text-rose-900 space-y-1">
              <div className="flex justify-between">
                <span>Commodity:</span>
                <strong>{scannedItem.title}</strong>
              </div>
              <div className="flex justify-between">
                <span>Current QC Status:</span>
                <span className="font-bold uppercase text-rose-700">{scannedItem.labStatus}</span>
              </div>
              <div className="flex justify-between">
                <span>Required Action:</span>
                <span>Wait for Lab Manager approval certificate.</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setShowLabBlockModal(false)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                Acknowledge &amp; Dismiss
              </button>
              <Link
                to="/lab-reports"
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold"
              >
                Go to Lab Reports
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EXPIRY BLOCK WARNING */}
      {showExpiryBlockModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border-2 border-amber-500 text-center space-y-4">
            <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                DISPATCH LOCKED: EXPIRED COMMODITY!
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Batch <strong>{scannedItem.batchNo}</strong> has exceeded its shelf-life expiry date ({scannedItem.expiryDate}).
                Warehouse safety policies strictly forbid dispatching expired items to customers.
              </p>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-left text-xs text-amber-900 space-y-1">
              <div className="flex justify-between">
                <span>Commodity:</span>
                <strong>{scannedItem.title}</strong>
              </div>
              <div className="flex justify-between">
                <span>Storage Bin:</span>
                <span className="font-bold font-mono text-amber-800">{scannedItem.location}</span>
              </div>
              <div className="flex justify-between">
                <span>Action Required:</span>
                <span>Transfer to Expired Stock segregation area.</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setShowExpiryBlockModal(false)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                Acknowledge &amp; Dismiss
              </button>
              <Link
                to="/damage-rejection"
                className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-bold"
              >
                Go to Rejection Area
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: MANUAL ENTRY */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Manual Barcode / SKU Entry</h3>
              <button
                type="button"
                onClick={() => setShowManualModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">SKU or Barcode</label>
                <input
                  type="text"
                  required
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="e.g. FMCG-BIS-01"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Packs (Gatta) Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={manualQty}
                  onChange={(e) => setManualQty(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#1E3A1E] text-white rounded font-bold"
                >
                  Verify &amp; Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PROCEED OUTWARD CONFIRMATION */}
      {showProceedModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 text-center space-y-3 text-xs">
            <h3 className="text-base font-black text-slate-900">Confirm Outward Gate Dispatch</h3>
            <p className="text-slate-600">
              Are you sure you want to deduct <strong>{scannedItemsList.length} items</strong> from the warehouse inventory and generate the Outward Gate Pass?
            </p>
            <div className="pt-2 flex justify-center gap-2">
              <button
                type="button"
                onClick={() => setShowProceedModal(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleFinalizeCheckout}
                className="px-5 py-2 bg-[#1E3A1E] text-white rounded-lg font-bold"
              >
                Confirm Dispatch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
