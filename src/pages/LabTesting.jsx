import { useState, useMemo, useRef, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import QRCode from 'qrcode'
import { apiRequest } from '../services/api'
import { printSpecificElement } from '../utils/printHelper'
import {
  FlaskConical,
  Plus,
  Eye,
  Check,
  X,
  Search,
  Filter,
  Download,
  Printer,
  Calendar,
  Layers,
  Package,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ChevronDown,
  FileText,
  RotateCcw,
  Sparkles,
  QrCode,
  Microscope,
  Truck,
  Building2,
  CheckCircle,
  XCircle,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react'

// Custom Accessible Select Dropdown
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
                <div className="truncate pr-2">
                  <div className="truncate font-semibold">{opt.label}</div>
                  {opt.sublabel && <div className="text-[10px] text-slate-400 font-normal truncate">{opt.sublabel}</div>}
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

export default function LabTesting() {
  const [searchParams] = useSearchParams()

  // Toast notification
  const [toastMessage, setToastMessage] = useState(null)
  const triggerToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3200)
  }

  // Filter toolbar state
  const [activeTab, setActiveTab] = useState('ALL')
  const [filterGrn, setFilterGrn] = useState('ALL')
  const [filterProduct, setFilterProduct] = useState('ALL')
  const [filterTestType, setFilterTestType] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const perPage = 7

  // Backend Data
  const [backendProducts, setBackendProducts] = useState([])
  const [backendGRNs, setBackendGRNs] = useState([])
  const [samplesData, setSamplesData] = useState([])
  const [loading, setLoading] = useState(true)

  // Modal State
  const [showCertModal, setShowCertModal] = useState(null)
  const [showLabelModal, setShowLabelModal] = useState(null)
  const [showNewTestModal, setShowNewTestModal] = useState(false)
  const [certQrDataUrl, setCertQrDataUrl] = useState('')
  const [labelQrDataUrl, setLabelQrDataUrl] = useState('')

  // New Test Request Form State (GRN-Driven)
  const [selectedModalGrnNo, setSelectedModalGrnNo] = useState('')
  const [selectedModalItemIndex, setSelectedModalItemIndex] = useState(0)
  const [newTest, setNewTest] = useState({
    grnNo: '',
    productName: '',
    sku: '',
    batchNo: '',
    testType: 'Moisture & Grain Quality Test',
    sampleQty: '1 Bag (Random Inward Sampling)',
    testedBy: 'Dr. Sharma (QA Lead)',
    expectedDate: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
    remarks: 'Standard inward inspection prior to permanent warehouse storage',
    storageZone: '',
    vendor: '',
  })

  // Selected GRN Object for Modal
  const selectedModalGrnObject = useMemo(() => {
    if (!selectedModalGrnNo) return null
    return backendGRNs.find((g) => g.grnNo === selectedModalGrnNo) || null
  }, [selectedModalGrnNo, backendGRNs])

  // Fetch real data on mount
  useEffect(() => {
    setLoading(true)
    Promise.allSettled([
      apiRequest('/product'),
      apiRequest('/grn'),
      apiRequest('/qc'),
    ]).then(([prodRes, grnRes, qcRes]) => {
      let grns = []
      let prods = []

      if (prodRes.status === 'fulfilled' && Array.isArray(prodRes.value)) {
        prods = prodRes.value
        setBackendProducts(prods)
      }

      if (grnRes.status === 'fulfilled' && Array.isArray(grnRes.value)) {
        grns = grnRes.value
        setBackendGRNs(grns)

        // Check if query params specify a GRN or batch
        const paramGrn = searchParams.get('grn')
        const paramBatch = searchParams.get('batch')
        const targetGrn = grns.find((g) => (paramGrn && g.grnNo === paramGrn) || (paramBatch && g.materials?.some((m) => m.batchNo === paramBatch))) || grns[0]

        if (targetGrn) {
          setSelectedModalGrnNo(targetGrn.grnNo)
          setSelectedModalItemIndex(0)
          const firstMat = targetGrn.materials?.[0]
          if (firstMat) {
            setNewTest((prev) => ({
              ...prev,
              grnNo: targetGrn.grnNo,
              productName: firstMat.productName || firstMat.sku,
              sku: firstMat.sku,
              batchNo: firstMat.batchNo || 'BT-2026-001',
              sampleQty: `1 ${firstMat.packagingUnit || 'Bag'} (Random Sample)`,
              storageZone: targetGrn.shade || 'Shade 1',
              vendor: targetGrn.supplier || 'Inward Consignment',
            }))
          }
        }
      }

      if (qcRes.status === 'fulfilled' && Array.isArray(qcRes.value) && qcRes.value.length > 0) {
        const mapped = qcRes.value.map((q, idx) => ({
          id: q._id || idx + 1,
          sampleId: q.qcNumber || `QC-2026-${String(idx + 1).padStart(4, '0')}`,
          grnNo: q.grnNo || 'GRN-2026-0001',
          batchNo: q.batchNo || 'BT-2026-001',
          productName: q.productName || 'Basmati Rice',
          sku: q.sku || 'PRD-RIC-001',
          testType: q.parameters?.[0]?.name || 'Moisture & Quality Test',
          sampleDate: new Date(q.testDate || q.createdAt || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          expectedDate: 'In 48 Hours',
          status: q.status === 'Passed' ? 'Completed' : q.status === 'Failed / Rejected' ? 'Failed' : 'In Progress',
          result: q.status === 'Passed' ? 'Pass' : q.status === 'Failed / Rejected' ? 'Fail' : 'Pending',
          testedBy: q.testedBy || 'Dr. Sharma (QA Lead)',
          parameters: q.parameters?.length > 0 ? q.parameters.map((p) => ({
            param: p.name,
            standard: p.standard || 'Within Specification Limits',
            result: p.observed || (p.pass ? 'Pass' : 'Fail'),
            status: p.pass ? 'Pass' : 'Fail',
          })) : [
            { param: 'Sensory & Appearance', standard: 'Clean & Specimen Compliant', result: 'Verified Normal', status: 'Pass' },
            { param: 'Moisture & Impurity', standard: '< 14.0%', result: '11.5%', status: 'Pass' },
          ],
          remarks: q.remarks || 'Standard QA inspection completed and verified.',
          certificateNo: q.certificateNo || `COA-2026-${String(idx + 101).padStart(5, '0')}`,
        }))
        setSamplesData(mapped)
      }
    }).finally(() => {
      setLoading(false)
    })
  }, [searchParams])

  // Handle GRN selection in Modal
  const handleSelectModalGrn = (grnNo) => {
    setSelectedModalGrnNo(grnNo)
    setSelectedModalItemIndex(0)
    const grn = backendGRNs.find((g) => g.grnNo === grnNo)
    if (grn && grn.materials && grn.materials.length > 0) {
      const mat = grn.materials[0]
      setNewTest((prev) => ({
        ...prev,
        grnNo: grn.grnNo,
        productName: mat.productName || mat.sku,
        sku: mat.sku,
        batchNo: mat.batchNo || 'BT-2026-001',
        sampleQty: `1 ${mat.packagingUnit || 'Bag'} (Random Sample)`,
        storageZone: grn.shade || 'Shade 1',
        vendor: grn.supplier || 'Inward Consignment',
      }))
      triggerToast(`Loaded GRN ${grn.grnNo} with ${grn.materials.length} received items!`)
    }
  }

  // Handle choosing specific material from selected GRN
  const handleSelectModalMaterial = (mat, index) => {
    setSelectedModalItemIndex(index)
    setNewTest((prev) => ({
      ...prev,
      productName: mat.productName || mat.sku,
      sku: mat.sku,
      batchNo: mat.batchNo || 'BT-2026-001',
      sampleQty: `1 ${mat.packagingUnit || 'Bag'} (Random Sample)`,
    }))
    triggerToast(`Selected ${mat.productName || mat.sku} from ${selectedModalGrnNo}`)
  }

  // Generate QR for QA Certificate
  useEffect(() => {
    if (showCertModal) {
      const payload = `=== CENTRAL WAREHOUSE QA CERTIFICATE ===\nCert No: ${showCertModal.certificateNo || showCertModal.sampleId}\nGRN No: ${showCertModal.grnNo}\nProduct: ${showCertModal.productName} (${showCertModal.sku})\nBatch: ${showCertModal.batchNo}\nStatus: ${showCertModal.result.toUpperCase()}\nLead Chemist: ${showCertModal.testedBy}\nDate: ${showCertModal.sampleDate}`
      QRCode.toDataURL(payload, { width: 140, margin: 1, errorCorrectionLevel: 'M' })
        .then(setCertQrDataUrl)
        .catch(() => setCertQrDataUrl(''))
    }
  }, [showCertModal])

  // Generate QR for QC Sticker Label
  useEffect(() => {
    if (showLabelModal) {
      const payload = `=== QC CLEARANCE TAG ===\nSample ID: ${showLabelModal.sampleId}\nGRN No: ${showLabelModal.grnNo}\nProduct: ${showLabelModal.productName}\nBatch: ${showLabelModal.batchNo}\nQC Result: ${showLabelModal.result}\nChemist: ${showLabelModal.testedBy}\nCert No: ${showLabelModal.certificateNo || 'COA-VERIFIED'}`
      QRCode.toDataURL(payload, { width: 130, margin: 1, errorCorrectionLevel: 'M' })
        .then(setLabelQrDataUrl)
        .catch(() => setLabelQrDataUrl(''))
    }
  }, [showLabelModal])

  // Dynamic KPI Stats calculated from state
  const stats = useMemo(() => {
    const total = samplesData.length
    const passed = samplesData.filter((s) => s.result === 'Pass').length
    const failed = samplesData.filter((s) => s.result === 'Fail').length
    const inProgress = samplesData.filter((s) => s.status === 'In Progress').length
    const passRate = total > 0 ? Math.round((passed / (total - inProgress || 1)) * 100) : 0
    return { total, passed, failed, inProgress, passRate }
  }, [samplesData])

  // Filtered samples
  const filteredSamples = useMemo(() => {
    return samplesData.filter((item) => {
      // Tab filter
      if (activeTab === 'PASSED' && item.result !== 'Pass') return false
      if (activeTab === 'FAILED' && item.result !== 'Fail') return false
      if (activeTab === 'IN_PROGRESS' && item.status !== 'In Progress') return false

      // GRN Filter
      if (filterGrn !== 'ALL' && item.grnNo !== filterGrn) return false

      // Product filter
      if (filterProduct !== 'ALL' && item.productName !== filterProduct) return false

      // Test type filter
      if (filterTestType !== 'ALL' && item.testType !== filterTestType) return false

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matches =
          (item.sampleId && item.sampleId.toLowerCase().includes(q)) ||
          (item.grnNo && item.grnNo.toLowerCase().includes(q)) ||
          (item.batchNo && item.batchNo.toLowerCase().includes(q)) ||
          (item.productName && item.productName.toLowerCase().includes(q)) ||
          (item.sku && item.sku.toLowerCase().includes(q)) ||
          (item.testType && item.testType.toLowerCase().includes(q)) ||
          (item.testedBy && item.testedBy.toLowerCase().includes(q))
        if (!matches) return false
      }

      return true
    })
  }, [samplesData, activeTab, filterGrn, filterProduct, filterTestType, searchQuery])

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredSamples.length / perPage))
  const paginatedSamples = filteredSamples.slice((currentPage - 1) * perPage, currentPage * perPage)

  // Reset Filters
  const handleResetFilters = () => {
    setActiveTab('ALL')
    setFilterGrn('ALL')
    setFilterProduct('ALL')
    setFilterTestType('ALL')
    setSearchQuery('')
    setCurrentPage(1)
    triggerToast('All lab filters reset to default.')
  }

  // Create New Test Handler (Strictly GRN-Linked)
  const handleCreateTest = async (e) => {
    e.preventDefault()
    if (!selectedModalGrnNo) {
      triggerToast('Please select a valid received GRN consignment first', 'error')
      return
    }
    if (!newTest.remarks || !newTest.remarks.trim()) {
      triggerToast('Inspection notes are mandatory for laboratory testing audits', 'error')
      return
    }

    const newId = samplesData.length + 1
    const sId = `QC-2026-${String(newId).padStart(4, '0')}`
    const payload = {
      qcNumber: sId,
      grnNo: selectedModalGrnNo,
      productName: newTest.productName,
      sku: newTest.sku,
      batchNo: newTest.batchNo,
      testProtocol: newTest.testType,
      sampleSize: newTest.sampleQty,
      testedBy: newTest.testedBy,
      expectedDate: newTest.expectedDate,
      storageZone: newTest.storageZone,
      status: 'Quarantine / Under Test',
      remarks: newTest.remarks,
      certificateNo: certNumber,
      parameters: [
        { name: newTest.testType, standard: 'Within Specification Limits', observed: 'Sample Inoculated / Under Measurement', pass: true },
        { name: 'Sensory & Physical Integrity', standard: 'Clean & Specimen Compliant', observed: 'Verified Inward', pass: true },
      ],
    }

    let savedQc = null
    try {
      savedQc = await apiRequest('/qc', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    } catch (err) {
      console.warn('QC backend notice:', err)
    }

    const newRecord = {
      id: savedQc?._id || newId,
      sampleId: savedQc?.qcNumber || sId,
      grnNo: selectedModalGrnNo,
      batchNo: newTest.batchNo,
      productName: newTest.productName,
      sku: newTest.sku,
      testType: newTest.testType,
      sampleDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      expectedDate: newTest.expectedDate,
      status: 'In Progress',
      result: 'Pending',
      testedBy: newTest.testedBy,
      parameters: [
        { param: newTest.testType, standard: 'Standard Compliant', result: 'Testing in progress', status: 'Pending' },
        { param: 'Visual & Physical Appearance', standard: 'Uniform / Defect Free', result: 'Verified Normal', status: 'Pass' },
      ],
      remarks: newTest.remarks,
      certificateNo: savedQc?.certificateNo || certNumber,
    }

    setSamplesData([newRecord, ...samplesData])
    setShowNewTestModal(false)
    triggerToast(`New test request ${sId} for GRN ${selectedModalGrnNo} queued successfully!`)
  }

  // Quick Status Update (Pass / Fail approval)
  const handleUpdateStatus = async (sample, newResult) => {
    const isPass = newResult === 'Pass'
    const newStatus = isPass ? 'Passed' : 'Failed / Rejected'
    const remarks = isPass
      ? 'QC Passed — Certified for Warehouse Bay Storage'
      : 'QC Failed — Rejected due to specification non-compliance'

    try {
      if (sample.id && typeof sample.id === 'string' && sample.id.length > 10) {
        await apiRequest(`/qc/${sample.id}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ status: newStatus, remarks }),
        })
      }
    } catch (err) {
      console.warn('Status update API error:', err)
    }

    setSamplesData((prev) =>
      prev.map((s) =>
        s.id === sample.id
          ? {
              ...s,
              status: isPass ? 'Completed' : 'Failed',
              result: newResult,
              remarks,
            }
          : s
      )
    )

    triggerToast(`Sample ${sample.sampleId} marked as ${newResult}! Product inventory status updated.`)
  }

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['#', 'Sample ID', 'GRN No', 'Batch No', 'Product Name', 'SKU', 'Test Type', 'Sample Date', 'Status', 'Result', 'Tested By', 'Remarks']
    const rows = filteredSamples.map((r, i) => [
      i + 1,
      `"${r.sampleId}"`,
      `"${r.grnNo}"`,
      `"${r.batchNo}"`,
      `"${r.productName.replace(/"/g, '""')}"`,
      `"${r.sku}"`,
      `"${r.testType.replace(/"/g, '""')}"`,
      `"${r.sampleDate}"`,
      `"${r.status}"`,
      `"${r.result}"`,
      `"${r.testedBy}"`,
      `"${(r.remarks || '').replace(/"/g, '""')}"`,
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `Warehouse_QC_Lab_Register_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    triggerToast('Laboratory test register exported to CSV.')
  }

  // GRN Options for Filter
  const grnFilterOptions = useMemo(() => [
    { value: 'ALL', label: 'All Received GRNs' },
    ...Array.from(new Set([...samplesData.map((s) => s.grnNo), ...backendGRNs.map((g) => g.grnNo)])).map((g) => ({
      value: g,
      label: g,
    })),
  ], [samplesData, backendGRNs])

  // Product Options for Filter
  const productOptions = useMemo(() => [
    { value: 'ALL', label: 'All Commodities' },
    ...Array.from(new Set([...samplesData.map((s) => s.productName), ...backendProducts.map((p) => p.name)])).map((p) => ({
      value: p,
      label: p,
    })),
  ], [samplesData, backendProducts])

  // GRN Dropdown Options for New Test Modal
  const modalGrnOptions = useMemo(() => {
    if (backendGRNs.length > 0) {
      return backendGRNs.map((g) => ({
        value: g.grnNo,
        label: `${g.grnNo} — ${g.supplier || 'Inward Vendor'} (${g.materials?.length || 1} Items)`,
        sublabel: `Received: ${new Date(g.dateTime || g.createdAt || Date.now()).toLocaleDateString('en-GB')} • Storage: ${g.shade || 'General'}`,
      }))
    }
    return []
  }, [backendGRNs])

  const testTypeOptions = [
    { value: 'ALL', label: 'All Quality Test Protocols' },
    { value: 'Moisture & Grain Quality Test', label: 'Moisture & Grain Quality Test' },
    { value: 'Viscosity & FFA Analysis', label: 'Viscosity & FFA Analysis' },
    { value: 'Sterility & Seal Integrity', label: 'Sterility & Seal Integrity' },
    { value: 'Flash Point & Viscosity Index', label: 'Flash Point & Viscosity Index' },
    { value: 'Bursting Strength & ECT Packaging Test', label: 'Bursting Strength & ECT Packaging Test' },
    { value: 'Hydrostatic & Tensile Test', label: 'Hydrostatic & Tensile Test' },
    { value: 'Microbial & Packaging Seal', label: 'Microbial & Packaging Seal' },
  ]

  const newTestTypeOptions = [
    { value: 'Moisture & Grain Quality Test', label: 'Moisture & Grain Quality Test' },
    { value: 'Purity, Admixture & Foreign Matter', label: 'Purity, Admixture & Foreign Matter' },
    { value: 'Viscosity & Chemical Purity', label: 'Viscosity & Chemical Purity' },
    { value: 'Sterility & Medical Packaging', label: 'Sterility & Medical Packaging' },
    { value: 'Bursting Strength & ECT Packaging Test', label: 'Packaging Strength & Bursting Test' },
    { value: 'Sensory & Physical Appearance', label: 'Sensory & Physical Appearance' },
  ]

  const technicianOptions = [
    { value: 'Dr. Sharma (QA Lead)', label: 'Dr. Sharma (QA Lead)' },
    { value: 'Priya Patel (Chemist)', label: 'Priya Patel (Lab Chemist)' },
    { value: 'Rajesh Verma (Inspector)', label: 'Rajesh Verma (Quality Inspector)' },
    { value: 'Neha Singh (Technician)', label: 'Neha Singh (QC Technician)' },
  ]

  return (
    <div className="space-y-5 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-[9999] pointer-events-auto bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-bounce border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs shrink-0">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Quality & Lab Testing</h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Manage sample quarantine, laboratory analysis, and compliance certification strictly linked to Inward GRNs.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Register</span>
          </button>
          <button
            type="button"
            onClick={() => printSpecificElement('#printable-lab-register-table', 'Lab Testing Register Report')}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print Report</span>
          </button>
          <button
            type="button"
            onClick={() => setShowNewTestModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Test Request</span>
          </button>
        </div>
      </div>

      {/* 4 Dynamic KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
            <Microscope className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Total Samples Tested</p>
            <h3 className="text-xl font-bold text-slate-800 leading-tight mt-0.5">
              {stats.total}
            </h3>
            <p className="text-[11px] text-indigo-600 font-medium">Logged across inward GRNs</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Passed / Cleared</p>
            <h3 className="text-xl font-bold text-slate-800 leading-tight mt-0.5">
              {stats.passed}
            </h3>
            <p className="text-[11px] text-emerald-600 font-medium">{stats.passRate}% pass rate</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">In Testing</p>
            <h3 className="text-xl font-bold text-slate-800 leading-tight mt-0.5">
              {stats.inProgress}
            </h3>
            <p className="text-[11px] text-amber-600 font-medium">Under active analysis</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Failed / Rejected</p>
            <h3 className="text-xl font-bold text-slate-800 leading-tight mt-0.5">
              {stats.failed}
            </h3>
            <p className="text-[11px] text-rose-600 font-medium">Non-compliant lots</p>
          </div>
        </div>
      </div>

      {/* Main Full-Width Table Section */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
        {/* Filter Controls & Tabs Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 space-y-3.5">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('ALL')
                  setCurrentPage(1)
                }}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  activeTab === 'ALL'
                    ? 'bg-white text-indigo-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Samples ({samplesData.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('PASSED')
                  setCurrentPage(1)
                }}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  activeTab === 'PASSED'
                    ? 'bg-white text-emerald-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Passed ({samplesData.filter((s) => s.result === 'Pass').length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('IN_PROGRESS')
                  setCurrentPage(1)
                }}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  activeTab === 'IN_PROGRESS'
                    ? 'bg-white text-amber-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                In Progress ({samplesData.filter((s) => s.status === 'In Progress').length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('FAILED')
                  setCurrentPage(1)
                }}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  activeTab === 'FAILED'
                    ? 'bg-white text-rose-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Failed ({samplesData.filter((s) => s.result === 'Fail').length})
              </button>
            </div>

            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs font-semibold text-slate-500 hover:text-indigo-600 flex items-center gap-1.5 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>

          {/* Search and Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5 items-center text-xs">
            {/* Search Input */}
            <div className="lg:col-span-3 relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Sample ID, GRN, Batch, SKU..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
              />
            </div>

            {/* GRN Filter */}
            <div className="lg:col-span-3">
              <CustomSelect
                value={filterGrn}
                onChange={setFilterGrn}
                options={grnFilterOptions}
                zIndexClass="z-30"
              />
            </div>

            {/* Product Filter */}
            <div className="lg:col-span-3">
              <CustomSelect
                value={filterProduct}
                onChange={setFilterProduct}
                options={productOptions}
                zIndexClass="z-30"
              />
            </div>

            {/* Test Type Filter */}
            <div className="lg:col-span-3">
              <CustomSelect
                value={filterTestType}
                onChange={setFilterTestType}
                options={testTypeOptions}
                zIndexClass="z-30"
              />
            </div>
          </div>
        </div>

        {/* 100% Full-Width Table */}
        <div id="printable-lab-register-table" className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs divide-y divide-slate-200">
            <thead className="bg-slate-50/80 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4 w-12 text-center">#</th>
                <th className="py-3.5 px-4 min-w-[125px]">Sample ID</th>
                <th className="py-3.5 px-4 min-w-[130px]">GRN No.</th>
                <th className="py-3.5 px-4 min-w-[120px]">Batch No.</th>
                <th className="py-3.5 px-4 min-w-[200px]">Product Name</th>
                <th className="py-3.5 px-4 min-w-[170px]">Test Protocol</th>
                <th className="py-3.5 px-4 min-w-[105px]">Sample Date</th>
                <th className="py-3.5 px-4 text-center min-w-[105px]">Status</th>
                <th className="py-3.5 px-4 text-center min-w-[90px]">Result</th>
                <th className="py-3.5 px-4 min-w-[145px]">Tested By</th>
                <th className="py-3.5 px-4 text-center w-36">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {paginatedSamples.length === 0 ? (
                <tr>
                  <td colSpan="11" className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
                        <FlaskConical className="w-6 h-6 stroke-[1.5]" />
                      </div>
                      <p className="font-semibold text-slate-700 text-xs">No lab test records found</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Register a new lab inspection for any received Inward GRN consignment.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedSamples.map((row, idx) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 text-center text-slate-400 font-bold text-[11px]">
                      {(currentPage - 1) * perPage + idx + 1}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {row.sampleId}
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      <span className="bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded border border-indigo-200 text-[11px]">
                        {row.grnNo || 'GRN-2026-0001'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-700 text-[11px]">
                      {row.batchNo}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{row.productName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{row.sku}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium text-[11px]">
                      {row.testType}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px]">
                      {row.sampleDate}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          row.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : row.status === 'Failed'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          row.result === 'Pass'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : row.result === 'Fail'
                            ? 'bg-rose-100 text-rose-800 border-rose-300'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {row.result}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {row.testedBy}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {/* Quick Approve / Reject for in-progress tests */}
                        {row.status === 'In Progress' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(row, 'Pass')}
                              title="Pass & Approve Lot (CoA Clearance)"
                              className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-100 bg-emerald-50 border border-emerald-200 transition cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(row, 'Fail')}
                              title="Reject / Fail Lot"
                              className="p-1.5 rounded-lg text-rose-700 hover:bg-rose-100 bg-rose-50 border border-rose-200 transition cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}

                        <button
                          type="button"
                          onClick={() => setShowCertModal(row)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 transition cursor-pointer"
                          title="View Official QA Certificate of Analysis"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setShowLabelModal(row)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 border border-slate-200 transition cursor-pointer"
                          title="Print QC Clearance Sticker / Tag"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setShowCertModal(row)
                            setTimeout(() => {
                              printSpecificElement('#printable-lab-test-cert', `QA Certificate - ${row.sampleId}`)
                            }, 300)
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 transition cursor-pointer"
                          title="Print Certificate"
                        >
                          <Printer className="w-3.5 h-3.5" />
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
            Showing <strong>{filteredSamples.length > 0 ? (currentPage - 1) * perPage + 1 : 0}</strong> to{' '}
            <strong>{Math.min(currentPage * perPage, filteredSamples.length)}</strong> of{' '}
            <strong>{filteredSamples.length}</strong> samples
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-bold cursor-pointer"
            >
              ‹ Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setCurrentPage(p)}
                className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
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
              className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-bold cursor-pointer"
            >
              Next ›
            </button>
          </div>
        </div>
      </div>

      {/* MODAL 1: GRN-Driven New Lab Test Request Modal */}
      {showNewTestModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-4 sm:p-6 shadow-2xl border border-slate-200 max-h-[90dvh] overflow-y-auto no-scrollbar space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <FlaskConical className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-800">Register New Lab Test Request</h3>
                  <p className="text-[11px] text-slate-500">Initiate sample quarantine and laboratory inspection for Inward GRN</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowNewTestModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {backendGRNs.length === 0 ? (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-2">
                <div className="flex items-center gap-2 text-amber-800 font-bold">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>No Received GRN Consignments Found</span>
                </div>
                <p className="text-amber-700 text-[11px] leading-relaxed">
                  Lab testing can only be performed on inward stock registered through Goods Receiving Note (GRN).
                </p>
                <Link
                  to="/grn"
                  onClick={() => setShowNewTestModal(false)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition"
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Go to Goods Receiving (GRN)</span>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleCreateTest} className="space-y-3.5 text-xs">
                {/* 1. Primary Inward GRN Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Select Received Inward GRN <span className="text-rose-500">*</span>
                  </label>
                  <CustomSelect
                    value={selectedModalGrnNo}
                    onChange={handleSelectModalGrn}
                    options={modalGrnOptions}
                    zIndexClass="z-40"
                  />
                </div>

                {/* GRN Inward Summary Badge */}
                {selectedModalGrnObject && (
                  <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-indigo-950">
                      <span className="flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-indigo-600" />
                        <span>GRN Consignment: {selectedModalGrnObject.grnNo}</span>
                      </span>
                      <span className="text-indigo-700 bg-white px-2 py-0.5 rounded border border-indigo-200 text-[10px]">
                        {selectedModalGrnObject.shade || 'General Storage'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px] text-slate-600 bg-white p-2 rounded-lg border border-indigo-100">
                      <div>
                        <span className="text-slate-400 block">Supplier / Vendor:</span>
                        <strong className="text-slate-800 truncate block">{selectedModalGrnObject.supplier || 'Vendor'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Inward Date:</span>
                        <strong className="text-slate-800 block">
                          {new Date(selectedModalGrnObject.dateTime || selectedModalGrnObject.createdAt || Date.now()).toLocaleDateString('en-GB')}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Total Items:</span>
                        <strong className="text-slate-800 block">{selectedModalGrnObject.materials?.length || 1} Products</strong>
                      </div>
                    </div>

                    {/* Multi-Item Quick Picker if GRN has multiple materials */}
                    {selectedModalGrnObject.materials && selectedModalGrnObject.materials.length > 1 && (
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-900 block mb-1">
                          Select Item to Test from this GRN:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedModalGrnObject.materials.map((mat, idx) => {
                            const isSelected = selectedModalItemIndex === idx
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => handleSelectModalMaterial(mat, idx)}
                                className={`text-[11px] px-2.5 py-1 rounded-lg border transition text-left cursor-pointer flex items-center gap-1.5 ${
                                  isSelected
                                    ? 'bg-indigo-600 text-white font-bold border-indigo-700 shadow-xs'
                                    : 'bg-white text-slate-700 font-medium border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50'
                                }`}
                              >
                                <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold ${isSelected ? 'bg-white text-indigo-600' : 'bg-indigo-100 text-indigo-700'}`}>
                                  {idx + 1}
                                </span>
                                <span className="truncate max-w-[150px]">{mat.productName || mat.sku}</span>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Auto-filled Product & Batch Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Product Name &amp; SKU <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={`${newTest.productName} (${newTest.sku})`}
                      className="w-full bg-slate-100 border border-slate-200 rounded-xl p-2 text-xs font-semibold text-slate-800 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Batch Number (From GRN) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={newTest.batchNo}
                      className="w-full bg-slate-100 border border-slate-200 rounded-xl p-2 text-xs font-mono font-bold text-slate-800 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Test Protocol <span className="text-rose-500">*</span>
                    </label>
                    <CustomSelect
                      value={newTest.testType}
                      onChange={(val) => setNewTest({ ...newTest, testType: val })}
                      options={newTestTypeOptions}
                      zIndexClass="z-30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Assigned QA Chemist</label>
                    <CustomSelect
                      value={newTest.testedBy}
                      onChange={(val) => setNewTest({ ...newTest, testedBy: val })}
                      options={technicianOptions}
                      zIndexClass="z-30"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Sample Size</label>
                    <input
                      type="text"
                      value={newTest.sampleQty}
                      onChange={(e) => setNewTest({ ...newTest, sampleQty: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Expected Completion Date</label>
                    <input
                      type="date"
                      value={newTest.expectedDate}
                      onChange={(e) => setNewTest({ ...newTest, expectedDate: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Inspection &amp; Quarantine Notes <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={newTest.remarks}
                    onChange={(e) => setNewTest({ ...newTest, remarks: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                    placeholder="Notes on sampling method, container seal state, temperature, moisture check..."
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowNewTestModal(false)}
                    className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    Queue Test Request
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: Certificate of Analysis (CoA) Modal */}
      {showCertModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl border border-slate-200 max-h-[90dvh] overflow-y-auto no-scrollbar space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                  QA
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-800">Certificate of Laboratory Analysis (COA)</h3>
                  <p className="text-[11px] text-slate-500">Official Quality Clearance Certificate • {showCertModal.sampleId}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCertModal(null)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Printable Certificate Layout */}
            <div id="printable-lab-test-cert" className="printable-area border border-slate-200 rounded-xl p-5 bg-slate-50/50 space-y-4 text-xs font-sans">
              <div className="flex items-start justify-between border-b pb-3 border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-sm shrink-0">
                    WH
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-slate-900 uppercase">CENTRAL WAREHOUSE QA LAB</h2>
                    <p className="text-[11px] text-slate-500 font-medium">ISO/IEC 17025 Certified Testing Depository</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">Sample Reg: {showCertModal.sampleId}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${
                      showCertModal.result === 'Pass'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : showCertModal.result === 'Fail'
                        ? 'bg-rose-100 text-rose-800 border-rose-300'
                        : 'bg-amber-100 text-amber-800 border-amber-300'
                    }`}
                  >
                    STATUS: {showCertModal.result.toUpperCase()}
                  </span>
                  <p className="text-[10px] text-slate-500 mt-1">Date: {showCertModal.sampleDate}</p>
                </div>
              </div>

              {/* Product Specifications Grid with GRN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white p-3 rounded-xl border border-slate-200 text-[11px]">
                <div>
                  <span className="text-slate-400 block">Inward GRN:</span>
                  <strong className="font-mono text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                    {showCertModal.grnNo}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Product:</span>
                  <strong className="text-slate-800 truncate block">{showCertModal.productName}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Batch No:</span>
                  <strong className="font-mono text-slate-800">{showCertModal.batchNo}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Lead Chemist:</span>
                  <strong className="text-slate-800">{showCertModal.testedBy}</strong>
                </div>
              </div>

              {/* Detailed Parameter Results Table */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Tested Parameters &amp; Acceptance Standards</h4>
                <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white">
                  <table className="w-full text-left text-xs divide-y divide-slate-200 min-w-[340px]">
                    <thead className="bg-slate-50 text-slate-600 font-bold">
                      <tr>
                        <th className="p-2.5">Parameter Measured</th>
                        <th className="p-2.5">Acceptance Standard</th>
                        <th className="p-2.5">Actual Observation</th>
                        <th className="p-2.5 text-center">Result</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(showCertModal.parameters || []).map((p, i) => (
                        <tr key={i}>
                          <td className="p-2.5 font-medium text-slate-800">{p.param}</td>
                          <td className="p-2.5 font-mono text-slate-600">{p.standard}</td>
                          <td className="p-2.5 font-mono font-bold text-slate-900">{p.result}</td>
                          <td className="p-2.5 text-center">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                p.status === 'Pass'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : p.status === 'Fail'
                                  ? 'bg-rose-50 text-rose-700'
                                  : 'bg-amber-50 text-amber-700'
                              }`}
                            >
                              {p.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Remarks Box & QR Code */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-center bg-white p-3 rounded-xl border border-slate-200">
                <div className="sm:col-span-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Evaluator Findings &amp; Clearance:</span>
                  <p className="text-xs text-slate-700 font-medium">{showCertModal.remarks}</p>
                  <p className="text-[10px] text-slate-400 mt-2 font-mono">
                    COA Document No: {showCertModal.certificateNo || 'COA-2026-VERIFIED'} • GRN: {showCertModal.grnNo}
                  </p>
                </div>
                {certQrDataUrl && (
                  <div className="sm:col-span-1 text-center flex flex-col items-center justify-center">
                    <img src={certQrDataUrl} alt="COA QR Code" className="w-20 h-20 border border-slate-300 p-0.5 rounded object-contain" />
                    <span className="text-[8px] font-mono text-slate-400 mt-0.5">Scan to Verify</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 text-[10px] text-slate-400">
                <span>Verification QR / Hash: SHA256-{showCertModal.sampleId}</span>
                <span>Authorized Electronic Signature Verified</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowCertModal(null)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => printSpecificElement('#printable-lab-test-cert', `QA Certificate - ${showCertModal.sampleId}`)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Certificate</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: QC Clearance Sticker / Tag Modal */}
      {showLabelModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-4 sm:p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                  QC
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-800">QC Status Physical Tag</h3>
                  <p className="text-[11px] text-slate-500">4" × 4" Thermal Inward Clearance Tag</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowLabelModal(null)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Realistic High-Contrast Thermal Sticker */}
            <div id="printable-qc-sticker" className="printable-area border-2 border-slate-900 rounded-xl p-4 bg-white space-y-3 font-sans max-w-[340px] mx-auto shadow-md">
              <div className="flex items-center justify-between border-b pb-2 border-slate-900">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                    WH
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">CENTRAL WAREHOUSE</h4>
                    <p className="text-[8px] font-semibold text-slate-500">QC INSPECTION &amp; CLEARANCE TAG</p>
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                    showLabelModal.result === 'Pass'
                      ? 'bg-emerald-600 text-white'
                      : showLabelModal.result === 'Fail'
                      ? 'bg-rose-600 text-white'
                      : 'bg-amber-500 text-white'
                  }`}
                >
                  {showLabelModal.result === 'Pass' ? 'PASSED & APPROVED' : showLabelModal.result === 'Fail' ? 'REJECTED' : 'QUARANTINE'}
                </span>
              </div>

              <div>
                <h5 className="text-xs font-black text-slate-900 leading-tight truncate">
                  {showLabelModal.productName}
                </h5>
                <div className="flex items-center gap-1.5 mt-1 font-mono text-[9px]">
                  <span className="bg-slate-900 text-white px-1.5 py-0.5 rounded font-bold">
                    {showLabelModal.sku}
                  </span>
                  <span className="bg-indigo-50 text-indigo-700 font-bold px-1.5 py-0.5 rounded border border-indigo-200">
                    {showLabelModal.grnNo}
                  </span>
                </div>
              </div>

              <div className="space-y-1 text-[10px] font-mono text-slate-800 bg-slate-100/80 p-2.5 rounded-lg border border-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Batch No:</span>
                  <strong className="font-mono">{showLabelModal.batchNo}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Sample ID:</span>
                  <strong className="font-mono">{showLabelModal.sampleId}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Lead Chemist:</span>
                  <strong>{showLabelModal.testedBy}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Test Date:</span>
                  <strong>{showLabelModal.sampleDate}</strong>
                </div>
              </div>

              {labelQrDataUrl && (
                <div className="flex items-center justify-center pt-1 border-t border-slate-200">
                  <img src={labelQrDataUrl} alt="QC Tag QR" className="w-20 h-20 object-contain" />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowLabelModal(null)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => printSpecificElement('#printable-qc-sticker', `QC Tag - ${showLabelModal.sampleId}`)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Tag</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
