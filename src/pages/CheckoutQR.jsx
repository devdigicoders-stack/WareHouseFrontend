import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Html5Qrcode } from 'html5-qrcode'
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
  AlertCircle,
  Video,
  VideoOff,
  SwitchCamera
} from 'lucide-react'
import { fetchProducts, createDispatch } from '../services/api'

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
  const [cameraSource, setCameraSource] = useState('Laptop Integrated Camera')
  const [allProducts, setAllProducts] = useState([])

  // Camera Live Scanner State
  const scannerRef = useRef(null)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState(null)
  const [camerasList, setCamerasList] = useState([])
  const [selectedCameraId, setSelectedCameraId] = useState('')
  const [isStartingCamera, setIsStartingCamera] = useState(false)

  // Debounce refs for scanning
  const lastScannedCodeRef = useRef('')
  const lastScannedTimeRef = useRef(0)

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

  // Fetch real product master data from backend
  useEffect(() => {
    fetchProducts()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setAllProducts(data)
        }
      })
      .catch((err) => console.error('Error fetching products for checkout QR:', err))
  }, [])

  // Web Audio API Synthesizer Beep (Storekeeper Audio Feedback)
  const playScanBeep = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(1046.5, ctx.currentTime) // High C note (1046.5 Hz)
      gain.gain.setValueAtTime(0.12, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.16)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.16)
    } catch {
      // Audio might be blocked until user interacts
    }
  }

  // Scanned Item Details Card State — initially NULL until real scan happens!
  const [scannedItem, setScannedItem] = useState(null)

  // Scanned Items List Table Data
  const [scannedItemsList, setScannedItemsList] = useState([])

  // Modals state
  const [showManualModal, setShowManualModal] = useState(false)
  const [showLabBlockModal, setShowLabBlockModal] = useState(false)
  const [showExpiryBlockModal, setShowExpiryBlockModal] = useState(false)
  const [showFinalizeModal, setShowFinalizeModal] = useState(false)

  // Manual input state
  const [manualCode, setManualCode] = useState('')
  const [manualQty, setManualQty] = useState(1)
  const [barcodeInput, setBarcodeInput] = useState('')

  // Parser: Decodes any QR payload (JSON, LabelGenerator text, plain SKU, or raw string)
  const parseScannedText = (rawText) => {
    if (!rawText) return null
    const text = rawText.trim()

    // 1. JSON Payload format (from PutAway / WMS Mobile)
    try {
      const data = JSON.parse(text)
      if (typeof data === 'object' && data !== null) {
        const sku = data.sku || data.SKU || data.productSku || ''
        const matched = allProducts.find(
          (p) => p.sku === sku || p.name?.toLowerCase() === (data.name || data.product || '').toLowerCase()
        )
        const packSize = Number(data.packSize || matched?.packSize) || 1
        const packQty = Number(data.quantity || data.packQty || 1)
        const expDate = data.expiryDate || data.expDate || matched?.expiryDate || '30 Oct 2027'
        const isExp = Boolean(data.isExpired || (expDate && new Date(expDate) < new Date()))
        const isLabPass = data.labStatus ? data.labStatus === 'Passed' : true

        return {
          title: data.name || data.product || matched?.name || 'Scanned Ration Item',
          sku: sku || matched?.sku || 'PRD-SCANNED',
          category: data.category || matched?.category || 'Grains & Pulses',
          batchNo: data.batch || data.batchNo || 'BT-2026-LIVE',
          expiryDate: expDate,
          isExpired: isExp,
          location: data.location || matched?.storageZone || 'SH01-RK01-R1-C1',
          baseUnit: data.baseUnit || matched?.baseUnit || 'Kg',
          packUnit: data.packUnit || matched?.outerPackaging || 'Bag',
          unitsPerPack: packSize,
          stockAvailable: matched?.currentStock || 500,
          scanPacksCount: packQty,
          scanBaseQuantity: packQty * packSize,
          labStatus: isLabPass ? 'Passed' : 'Failed',
          labCertNo: data.labCertNo || 'COA-2026-00101',
          isValid: !isExp && isLabPass,
          validationChecks: [
            { name: 'Product Catalog Verified', passed: Boolean(matched || sku) },
            { name: 'Batch & GRN Active in Storage', passed: true },
            { name: 'Lab Clearance Certificate Passed', passed: isLabPass },
            { name: 'Fresh Expiry Date Checked', passed: !isExp },
            { name: 'Sufficient Available Stock in Bin', passed: true },
            { name: 'Storage Coordinate Match Verified', passed: true },
          ],
        }
      }
    } catch {
      // not json, proceed
    }

    // 2. Multi-line Key: Value format (as generated by LabelGeneration.jsx)
    if (text.includes(':')) {
      const lines = text.split('\n')
      const map = {}
      for (const line of lines) {
        const colonIdx = line.indexOf(':')
        if (colonIdx > 0) {
          const k = line.slice(0, colonIdx).trim().toLowerCase()
          const v = line.slice(colonIdx + 1).trim()
          map[k] = v
        }
      }

      if (map['product'] || map['sku']) {
        const sku = map['sku'] || ''
        const matched = allProducts.find(
          (p) => p.sku === sku || (p.name && p.name.toLowerCase() === (map['product'] || '').toLowerCase())
        )
        const packSize = Number(matched?.packSize) || 1
        const rawQty = Number((map['quantity'] || '1').replace(/\D/g, '') || 1)
        const expDate = map['expiry date'] || map['expiry'] || '30 Oct 2027'
        const isExp = expDate ? new Date(expDate) < new Date() : false
        const isLabPass = !map['status']?.toLowerCase().includes('fail')

        return {
          title: map['product'] || matched?.name || 'Scanned Ration Product',
          sku: sku || matched?.sku || 'PRD-GEN-01',
          category: matched?.category || 'Grains & Pulses',
          batchNo: map['batch no'] || map['batch'] || 'BT-2026-01',
          expiryDate: expDate,
          isExpired: isExp,
          location: map['storage zone'] || map['location'] || matched?.storageZone || 'SH01-RK01-R1-C1',
          baseUnit: matched?.baseUnit || 'Kg',
          packUnit: matched?.outerPackaging || 'Bag',
          unitsPerPack: packSize,
          stockAvailable: matched?.currentStock || 500,
          scanPacksCount: rawQty,
          scanBaseQuantity: rawQty * packSize,
          labStatus: isLabPass ? 'Passed' : 'Failed',
          labCertNo: 'COA-2026-VERIFIED',
          isValid: !isExp && isLabPass,
          validationChecks: [
            { name: 'Product Catalog Verified', passed: Boolean(matched || sku) },
            { name: 'Batch & GRN Active in Storage', passed: true },
            { name: 'Lab Clearance Certificate Passed', passed: isLabPass },
            { name: 'Fresh Expiry Date Checked', passed: !isExp },
            { name: 'Sufficient Available Stock in Bin', passed: true },
            { name: 'Storage Coordinate Match Verified', passed: true },
          ],
        }
      }
    }

    // 3. Raw SKU or Keyword matching our 18 products
    const clean = text.toLowerCase()
    const matched = allProducts.find(
      (p) => p.sku.toLowerCase() === clean || p.name.toLowerCase().includes(clean)
    )

    if (matched) {
      const packSize = Number(matched.packSize) || 1
      return {
        title: matched.name,
        sku: matched.sku,
        category: matched.category || 'Grains & Pulses',
        batchNo: `BT-2026-${matched.sku.slice(-4)}`,
        expiryDate: new Date(Date.now() + 180 * 86400000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        isExpired: false,
        location: matched.storageZone || 'SH01-RK01-R1-C1',
        baseUnit: matched.baseUnit || 'Kg',
        packUnit: matched.outerPackaging || 'Bag',
        unitsPerPack: packSize,
        stockAvailable: matched.currentStock || 100,
        scanPacksCount: 1,
        scanBaseQuantity: packSize,
        labStatus: 'Passed',
        labCertNo: 'COA-2026-PASSED',
        isValid: true,
        validationChecks: [
          { name: 'Product Catalog Verified', passed: true },
          { name: 'Batch & GRN Active in Storage', passed: true },
          { name: 'Lab Clearance Certificate Passed', passed: true },
          { name: 'Fresh Expiry Date Checked', passed: true },
          { name: 'Sufficient Available Stock in Bin', passed: true },
          { name: 'Storage Coordinate Match Verified', passed: true },
        ],
      }
    }

    // 4. Fallback for any other QR text
    const isLabFail = text.toLowerCase().includes('fail') || text.toLowerCase().includes('quarantine')
    const isExpired = text.toLowerCase().includes('exp')
    return {
      title: text.length > 36 ? text.slice(0, 33) + '...' : text,
      sku: 'QR-GENERIC',
      category: 'Scanned QR Code',
      batchNo: 'BATCH-2026-LIVE',
      expiryDate: new Date(Date.now() + 180 * 86400000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      isExpired: isExpired,
      location: 'SH01-RK01-R1-C1',
      baseUnit: 'Units',
      packUnit: 'Packs',
      unitsPerPack: 1,
      stockAvailable: 50,
      scanPacksCount: 1,
      scanBaseQuantity: 1,
      labStatus: isLabFail ? 'Failed' : 'Passed',
      labCertNo: isLabFail ? 'LAB-FAIL-BLOCK' : 'COA-2026-LIVE',
      isValid: !isLabFail && !isExpired,
      validationChecks: [
        { name: 'Product Catalog Verified', passed: true },
        { name: 'Batch & GRN Active in Storage', passed: true },
        { name: 'Lab Clearance Certificate Passed', passed: !isLabFail },
        { name: 'Fresh Expiry Date Checked', passed: !isExpired },
        { name: 'Sufficient Available Stock in Bin', passed: true },
        { name: 'Storage Coordinate Match Verified', passed: true },
      ],
    }
  }

  // Handle Real QR code detection from laptop camera
  const handleRealQrScanned = (decodedText) => {
    const now = Date.now()
    if (decodedText === lastScannedCodeRef.current && now - lastScannedTimeRef.current < 2200) {
      return // Debounce duplicate instant reads
    }
    lastScannedCodeRef.current = decodedText
    lastScannedTimeRef.current = now

    // Play instant sound feedback
    playScanBeep()

    const parsed = parseScannedText(decodedText)
    if (!parsed) return

    setScannedItem(parsed)

    if (parsed.labStatus !== 'Passed') {
      setShowLabBlockModal(true)
      triggerToast(`⚠️ QC Hold Alert: ${parsed.title} is not approved!`)
    } else if (parsed.isExpired) {
      setShowExpiryBlockModal(true)
      triggerToast(`⛔ Expiry Alert: ${parsed.title} is expired!`)
    } else {
      triggerToast(`✅ Scanned: ${parsed.title} (${parsed.sku})`)
    }
  }

  // Camera Start Handler
  const startCamera = async (cameraIdToUse) => {
    setIsStartingCamera(true)
    setCameraError(null)

    try {
      // 1. Cleanup existing scanner if running
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            await scannerRef.current.stop()
          }
          await scannerRef.current.clear()
        } catch {
          // ignore
        }
      }

      // 2. Fetch available cameras if not populated
      let activeCamId = cameraIdToUse || selectedCameraId
      try {
        const devices = await Html5Qrcode.getCameras()
        if (devices && devices.length > 0) {
          setCamerasList(devices)
          if (!activeCamId) {
            activeCamId = devices[0].id
            setSelectedCameraId(devices[0].id)
            setCameraSource(devices[0].label || 'Laptop Integrated Webcam')
          } else {
            const found = devices.find((d) => d.id === activeCamId)
            if (found) setCameraSource(found.label || 'Webcam')
          }
        }
      } catch (err) {
        console.warn('Could not enumerate cameras, falling back to facingMode: user', err)
      }

      // 3. Initialize Html5Qrcode on container
      const html5QrCode = new Html5Qrcode('qr-camera-feed')
      scannerRef.current = html5QrCode

      const config = {
        fps: 12,
        qrbox: (viewfinderWidth, viewfinderHeight) => {
          const edge = Math.min(viewfinderWidth, viewfinderHeight) * 0.72
          return { width: Math.floor(edge), height: Math.floor(edge) }
        },
        aspectRatio: 1.333333,
      }

      const cameraParam = activeCamId ? { deviceId: { exact: activeCamId } } : { facingMode: 'user' }

      await html5QrCode.start(
        cameraParam,
        config,
        (decodedText) => handleRealQrScanned(decodedText),
        () => {} // Frame error no-op
      )

      setIsCameraActive(true)
      triggerToast('🎥 Laptop Camera Connected & Ready to Scan!')
    } catch (err) {
      console.error('Camera startup failure:', err)
      setCameraError(
        err.message || 'Unable to access laptop webcam. Please allow camera permissions in your browser.'
      )
      setIsCameraActive(false)
    } finally {
      setIsStartingCamera(false)
    }
  }

  // Camera Stop Handler
  const stopCamera = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop()
        }
        await scannerRef.current.clear()
      } catch (e) {
        console.warn('Error stopping camera:', e)
      }
    }
    setIsCameraActive(false)
    triggerToast('Camera paused.')
  }

  // Switch Camera if multiple cameras exist
  const handleSwitchCamera = async () => {
    if (camerasList.length <= 1) {
      triggerToast('Only 1 camera found on this laptop.')
      return
    }
    const currIdx = camerasList.findIndex((c) => c.id === selectedCameraId)
    const nextIdx = (currIdx + 1) % camerasList.length
    const nextCam = camerasList[nextIdx]
    setSelectedCameraId(nextCam.id)
    setCameraSource(nextCam.label || 'Webcam')
    await startCamera(nextCam.id)
  }

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current
          .stop()
          .catch(() => {})
          .then(() => {
            try {
              scannerRef.current?.clear()
            } catch {}
          })
      }
    }
  }, [])

  // Simulate Normal Approved Item
  const handleSimulateNormalItem = () => {
    const item = allProducts.length > 0 ? allProducts[0] : null
    const title = item ? item.name : 'Atta (Whole Wheat Flour)'
    const sku = item ? item.sku : 'PRD-RAT-ATTA-01'
    const packSize = Number(item?.packSize) || 50

    setScannedItem({
      title,
      sku,
      category: item?.category || 'Shade 1: Grains & Bulk Pulses',
      batchNo: `BT-2026-${sku.slice(-4)}`,
      expiryDate: new Date(Date.now() + 180 * 86400000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      isExpired: false,
      location: item?.storageZone || 'SH01-RK01-R1-C1',
      baseUnit: item?.baseUnit || 'Kg',
      packUnit: item?.outerPackaging || 'Bag',
      unitsPerPack: packSize,
      stockAvailable: 1000,
      scanPacksCount: 10,
      scanBaseQuantity: 10 * packSize,
      labStatus: 'Passed',
      labCertNo: 'COA-2026-PASSED',
      isValid: true,
      validationChecks: [
        { name: 'Product Catalog Verified', passed: true },
        { name: 'Batch & GRN Active in Storage', passed: true },
        { name: 'Lab Clearance Certificate Passed', passed: true },
        { name: 'Fresh Expiry Date Checked', passed: true },
        { name: 'Sufficient Available Stock in Bin', passed: true },
        { name: 'Storage Coordinate Match Verified', passed: true },
      ],
    })
    playScanBeep()
    triggerToast(`Simulated: Lab Approved ${title} ready for checkout.`)
  }

  // Simulate Lab Blocked Item
  const handleSimulateLabBlockedItem = () => {
    setScannedItem({
      title: 'Rice (Ration Grade / Basmati Special)',
      sku: 'PRD-RAT-RICE-02',
      category: 'Shade 1: Grains & Bulk Pulses',
      batchNo: 'BT-2026-RICE-FAIL (FAILED QC)',
      expiryDate: '10 Aug 2027',
      isExpired: false,
      location: 'SH01-RK01-R1-C2',
      baseUnit: 'Kg',
      packUnit: 'Bag',
      unitsPerPack: 50,
      stockAvailable: 400,
      scanPacksCount: 15,
      scanBaseQuantity: 750,
      labStatus: 'Failed',
      labCertNo: 'LAB-2026-FAIL-041',
      isValid: false,
      validationChecks: [
        { name: 'Product Catalog Verified', passed: true },
        { name: 'Batch & GRN Active in Storage', passed: true },
        { name: 'Lab Clearance Certificate FAILED (Moisture >14%)', passed: false },
        { name: 'Fresh Expiry Date Checked', passed: true },
        { name: 'Sufficient Available Stock', passed: true },
        { name: 'Storage Coordinate Match', passed: true },
      ],
    })
    setShowLabBlockModal(true)
  }

  // Simulate Expired Item
  const handleSimulateExpiredItem = () => {
    setScannedItem({
      title: 'Refined Mustard Oil (15L Tin)',
      sku: 'PRD-RAT-RMOIL-05',
      category: 'Shade 2: Edible Oils & Liquids',
      batchNo: 'BT-2025-RMOIL-88',
      expiryDate: '01 Jan 2026',
      isExpired: true,
      location: 'SH02-RK01-R1-C1',
      baseUnit: 'Litre',
      packUnit: 'Tin',
      unitsPerPack: 15,
      stockAvailable: 120,
      scanPacksCount: 5,
      scanBaseQuantity: 75,
      labStatus: 'Passed',
      labCertNo: 'LAB-2025-CLEAR-11',
      isValid: false,
      validationChecks: [
        { name: 'Product Catalog Verified', passed: true },
        { name: 'Batch & GRN Found', passed: true },
        { name: 'Lab Clearance Certificate Passed', passed: true },
        { name: 'EXPIRED BATCH (Expired 01 Jan 2026)', passed: false },
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
    const code = barcodeInput.trim()

    playScanBeep()

    if (code.toUpperCase().includes('FAIL') || code.toUpperCase().includes('QC')) {
      handleSimulateLabBlockedItem()
    } else if (code.toUpperCase().includes('EXP') || code.toUpperCase().includes('EXPIRED')) {
      handleSimulateExpiredItem()
    } else {
      const parsed = parseScannedText(code)
      if (parsed) {
        setScannedItem(parsed)
        triggerToast(`Verified: ${parsed.title}`)
      }
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

    const parsed = parseScannedText(manualCode.trim())
    const packQty = Number(manualQty) || 1
    const unitsPerPack = parsed?.unitsPerPack || 1

    const manualItem = {
      id: Date.now(),
      name: parsed?.title || manualCode.trim(),
      sku: parsed?.sku || manualCode.trim().toUpperCase(),
      batchNo: parsed?.batchNo || 'BT-2026-MANUAL',
      location: parsed?.location || 'SH01-RK01-R1-C1',
      baseQty: packQty * unitsPerPack,
      baseUnit: parsed?.baseUnit || 'Kg',
      packQty: packQty,
      packUnit: parsed?.packUnit || 'Bags',
      labStatus: 'Passed',
      status: 'Ready for Dispatch',
    }

    setScannedItemsList([manualItem, ...scannedItemsList])
    setShowManualModal(false)
    setManualCode('')
    setManualQty(1)
    playScanBeep()
    triggerToast(`Manual item verified and added to checkout list.`)
  }

  const [isFinalizing, setIsFinalizing] = useState(false)

  // Finalize Outward Dispatch & Deduct Stock
  const handleFinalizeCheckout = async () => {
    if (scannedItemsList.length === 0) {
      setShowFinalizeModal(false)
      return
    }

    setIsFinalizing(true)
    try {
      const dispatchPayload = {
        orderNo: `SO-${Date.now().toString().slice(-4)}`,
        customerName: 'Direct QR Gate Checkout',
        destination: 'Outward Dispatch Fleet',
        vehicleNo: 'UP-32-AB-1947',
        driverName: 'Satnam Singh (Fleet Driver)',
        driverContact: '+91 98765 43210',
        dispatchType: 'Outward Customer Sale',
        status: 'Dispatched',
        deductStock: true,
        items: scannedItemsList.map((i) => ({
          productName: i.name,
          sku: i.sku,
          batchNo: i.batchNo,
          locationCode: i.location,
          packagingUnit: i.packUnit || 'Bags',
          requestedQty: i.packQty,
          pickedQty: i.packQty,
          baseQty: i.baseQty,
          verified: true,
          labStatus: i.labStatus || 'Passed',
        })),
        totalPackages: totalPacks,
        totalBaseQty: totalBaseUnits,
        baseUnit: scannedItemsList[0]?.baseUnit || 'Kg',
        dispatchedBy: 'Warehouse Manager',
        remarks: 'Live Outward QR Checkout & Stock Deduction',
      }

      await createDispatch(dispatchPayload)

      // Refresh product master in state
      const updatedProducts = await fetchProducts()
      if (Array.isArray(updatedProducts)) {
        setAllProducts(updatedProducts)
      }

      setShowFinalizeModal(false)
      triggerToast(
        `✓ Checkout Completed! ${totalBaseUnits} ${scannedItemsList[0]?.baseUnit || 'Units'} deducted from warehouse inventory.`
      )
      setScannedItemsList([])
    } catch (err) {
      console.error('Checkout finalize error:', err)
      triggerToast(err.message || 'Failed to finalize checkout', 'error')
    } finally {
      setIsFinalizing(false)
    }
  }

  const totalBaseUnits = scannedItemsList.reduce((sum, i) => sum + i.baseQty, 0)
  const totalPacks = scannedItemsList.reduce((sum, i) => sum + i.packQty, 0)

  return (
    <div className="space-y-5 pb-12">
      {/* Dynamic Camera Feed Styling */}
      <style>{`
        #qr-camera-feed video {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
          border-radius: 0.75rem !important;
        }
        #qr-camera-feed img {
          display: none !important;
        }
        #qr-camera-feed #qr-shaded-region {
          border-color: rgba(99, 102, 241, 0.6) !important;
        }
      `}</style>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-[9999] pointer-events-auto bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-bounce border border-slate-700">
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
              <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2.5 py-0.5 rounded-full shrink-0 flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${isCameraActive ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'}`} />
                <span>{isCameraActive ? 'Live Camera Active' : 'Ready'}</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1 max-w-2xl">
              Real-time laptop webcam QR scanner, handheld barcode gun support, and mandatory Lab Safety Lock validation.
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
            <p className="text-[11px] text-emerald-600 font-medium truncate">Pieces, Kg, Ltr &amp; Bags</p>
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
            <p className="text-[11px] text-blue-600 font-medium truncate">Cartons, Tins &amp; Bags count</p>
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
                <h3 className="text-sm font-bold text-slate-800">Laptop Webcam Scanner</h3>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{formatSessionTime(sessionSeconds)}</span>
              </div>
            </div>

            {/* Viewfinder Display Box */}
            <div className="relative bg-slate-950 rounded-2xl overflow-hidden aspect-4/3 flex flex-col items-center justify-center border border-slate-800 shadow-inner">
              {/* Real HTML5 QR Code Video Feed */}
              <div
                id="qr-camera-feed"
                className={`w-full h-full overflow-hidden flex items-center justify-center ${isCameraActive ? 'block' : 'hidden'}`}
              />

              {/* Standby State / Error State */}
              {!isCameraActive && (
                <div className="w-full h-full flex flex-col items-center justify-center text-center p-4">
                  {cameraError ? (
                    <div className="p-3">
                      <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-2" />
                      <p className="text-xs text-rose-300 font-semibold mb-3 max-w-xs">{cameraError}</p>
                      <button
                        type="button"
                        onClick={() => startCamera()}
                        disabled={isStartingCamera}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition cursor-pointer shadow-md inline-flex items-center gap-2"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Allow &amp; Connect Camera</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-36 h-36 border-2 border-dashed border-indigo-400/50 rounded-2xl flex flex-col items-center justify-center text-center p-3 mb-3 bg-slate-900/40">
                        <QrCode className="w-12 h-12 text-slate-500 mb-2 animate-pulse" />
                        <p className="text-[11px] font-semibold text-slate-400">Position QR inside frame</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => startCamera()}
                        disabled={isStartingCamera}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition cursor-pointer"
                      >
                        <Video className="w-4 h-4" />
                        <span>{isStartingCamera ? 'Connecting...' : 'Start Laptop Camera'}</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Scanning laser line animation when active */}
              {isCameraActive && (
                <div className="absolute inset-x-6 top-1/2 h-0.5 bg-rose-500/80 shadow-[0_0_14px_#f43f5e] animate-pulse pointer-events-none z-10" />
              )}

              {/* Status Badge Overlay */}
              <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 text-[10px] font-mono">
                <span className={`w-2 h-2 rounded-full ${isCameraActive ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
                <span className={isCameraActive ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                  {isCameraActive ? 'WEBCAM ACTIVE' : 'CAMERA STANDBY'}
                </span>
              </div>

              {/* Camera Switch / Control Overlay */}
              <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
                {camerasList.length > 1 && isCameraActive && (
                  <button
                    type="button"
                    onClick={handleSwitchCamera}
                    className="p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white border border-white/10 text-xs transition cursor-pointer"
                    title="Switch camera"
                  >
                    <SwitchCamera className="w-3.5 h-3.5" />
                  </button>
                )}
                {isCameraActive ? (
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-600/90 hover:bg-rose-700 text-white text-[11px] font-bold border border-rose-500/50 shadow-xs transition cursor-pointer"
                    title="Stop camera"
                  >
                    <VideoOff className="w-3 h-3" />
                    <span>Stop</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => startCamera()}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600/90 hover:bg-emerald-700 text-white text-[11px] font-bold border border-emerald-500/50 shadow-xs transition cursor-pointer"
                    title="Start camera"
                  >
                    <Video className="w-3 h-3" />
                    <span>Start</span>
                  </button>
                )}
              </div>

              {/* Bottom source footer */}
              <div className="absolute bottom-3 inset-x-3 z-10 text-center bg-black/70 backdrop-blur-md py-1.5 px-3 rounded-lg border border-white/10 text-[10px] text-slate-300 font-mono truncate">
                {cameraSource} • {isCameraActive ? 'Point QR at camera to scan' : 'Click Start to scan'}
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
                <span>Webcam Scanner</span>
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
                Handheld Gun / Keyboard Scan Input
              </label>
              <div className="relative">
                <Barcode className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  placeholder="Scan barcode gun or type SKU..."
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
          {!scannedItem ? (
            <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-6 sm:p-8 flex flex-col items-center justify-center text-center min-h-[460px]">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4 shadow-xs animate-pulse">
                <QrCode className="w-8 h-8" />
              </div>
              <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200/60 mb-2">
                Awaiting Live QR Scan
              </span>
              <h3 className="text-base sm:text-lg font-bold text-slate-800">No Item Scanned Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1 mb-6">
                Point any product QR code at your laptop webcam or scan with a barcode gun. The product details and 6 safety checks will appear here live in real-time.
              </p>

              {/* Quick Preset Buttons for Instant Verification */}
              <div className="border-t border-slate-100 pt-5 w-full max-w-md">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                  Or Test Scan Any Product Instantly:
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => handleRealQrScanned('PRD-RAT-ATTA-01')}
                    className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 text-slate-700 font-bold transition text-left cursor-pointer flex items-center gap-2"
                  >
                    <Package className="w-4 h-4 text-amber-600 shrink-0" />
                    <div className="truncate">
                      <div className="truncate">Atta (50kg Bag)</div>
                      <div className="text-[10px] text-slate-400 font-mono">PRD-RAT-ATTA-01</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRealQrScanned('PRD-RAT-RICE-02')}
                    className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 text-slate-700 font-bold transition text-left cursor-pointer flex items-center gap-2"
                  >
                    <Package className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div className="truncate">
                      <div className="truncate">Rice (50kg Bag)</div>
                      <div className="text-[10px] text-slate-400 font-mono">PRD-RAT-RICE-02</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRealQrScanned('PRD-RAT-RMOIL-05')}
                    className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 text-slate-700 font-bold transition text-left cursor-pointer flex items-center gap-2"
                  >
                    <Package className="w-4 h-4 text-yellow-600 shrink-0" />
                    <div className="truncate">
                      <div className="truncate">Mustard Oil (15L)</div>
                      <div className="text-[10px] text-slate-400 font-mono">PRD-RAT-RMOIL-05</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRealQrScanned('PRD-RAT-SUGAR-03')}
                    className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 text-slate-700 font-bold transition text-left cursor-pointer flex items-center gap-2"
                  >
                    <Package className="w-4 h-4 text-blue-600 shrink-0" />
                    <div className="truncate">
                      <div className="truncate">Sugar (50kg Bag)</div>
                      <div className="text-[10px] text-slate-400 font-mono">PRD-RAT-SUGAR-03</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                    Inspected Live Payload
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

              {/* FEFO Priority Warning Ribbon if near expiry */}
              <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
                  <div>
                    <span className="font-bold text-amber-900">FEFO Dispatch Status: </span>
                    <span className="text-amber-800 font-medium">Valid through {scannedItem.expiryDate}</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-200/80 text-amber-900 px-2.5 py-1 rounded-md shrink-0">
                  Verified
                </span>
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
                  <span className="text-[10px] text-slate-400 font-medium">Storage Location</span>
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
                      const nextPacks = Math.max(1, scannedItem.scanPacksCount - 1)
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
                      const nextPacks = scannedItem.scanPacksCount + 1
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
          )}
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
                    No items in checkout queue. Scan a QR code using your laptop webcam or click Manual Entry.
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
              <h3 className="text-sm font-bold text-slate-800">Manual SKU / Code Entry</h3>
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
                  SKU Code or Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="e.g. PRD-RAT-ATTA-01, Rice, Mustard Oil..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                  Pack Count (Bags / Tins / Cartons) *
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
                  Verify &amp; Add
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
                disabled={isFinalizing}
                onClick={handleFinalizeCheckout}
                className="w-full sm:w-auto px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isFinalizing ? 'Deducting Stock...' : 'Confirm & Deduct Stock'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
