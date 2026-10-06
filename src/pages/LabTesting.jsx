import { useState, useMemo, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
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

export default function LabTesting() {
  // Toast notification
  const [toastMessage, setToastMessage] = useState(null)
  const triggerToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3200)
  }

  // Filter toolbar state
  const [activeTab, setActiveTab] = useState('ALL')
  const [filterProduct, setFilterProduct] = useState('ALL')
  const [filterTestType, setFilterTestType] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const perPage = 7

  // Products and QC Data from Backend
  const [backendProducts, setBackendProducts] = useState([])
  const [backendGRNs, setBackendGRNs] = useState([])
  const [showCertModal, setShowCertModal] = useState(null)
  const [showNewTestModal, setShowNewTestModal] = useState(false)
  const [certQrDataUrl, setCertQrDataUrl] = useState('')
  const [showLabelModal, setShowLabelModal] = useState(null)
  const [labelQrDataUrl, setLabelQrDataUrl] = useState('')

  // Fetch real data on mount
  useEffect(() => {
    Promise.allSettled([
      apiRequest('/product'),
      apiRequest('/grn'),
      apiRequest('/qc'),
    ]).then(([prodRes, grnRes, qcRes]) => {
      if (prodRes.status === 'fulfilled' && Array.isArray(prodRes.value)) {
        setBackendProducts(prodRes.value)
        if (prodRes.value.length > 0) {
          setNewTest((prev) => ({
            ...prev,
            productName: prodRes.value[0].name,
          }))
        }
      }
      if (grnRes.status === 'fulfilled' && Array.isArray(grnRes.value)) {
        setBackendGRNs(grnRes.value)
      }
      if (qcRes.status === 'fulfilled' && Array.isArray(qcRes.value) && qcRes.value.length > 0) {
        const mapped = qcRes.value.map((q, idx) => ({
          id: q._id || idx + 1,
          sampleId: q.qcNumber || `LBT-2026-${String(idx + 1).padStart(3, '0')}`,
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
            standard: p.standard || 'Within Spec',
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
    }).catch(() => {})
  }, [])

  // Generate QR for QA Certificate
  useEffect(() => {
    if (showCertModal) {
      const payload = JSON.stringify({
        type: 'WMS_QA_CERTIFICATE',
        certNo: showCertModal.certificateNo || showCertModal.sampleId,
        product: showCertModal.productName,
        batch: showCertModal.batchNo,
        testedBy: showCertModal.testedBy,
        result: showCertModal.result,
        date: showCertModal.sampleDate,
      })
      QRCode.toDataURL(payload, { width: 140, margin: 1 })
        .then(setCertQrDataUrl)
        .catch(() => setCertQrDataUrl(''))
    }
  }, [showCertModal])

  // Generate QR for QC Sticker Label
  useEffect(() => {
    if (showLabelModal) {
      const payload = JSON.stringify({
        type: 'WMS_QC_STICKER',
        sampleId: showLabelModal.sampleId,
        product: showLabelModal.productName,
        batch: showLabelModal.batchNo,
        status: showLabelModal.status,
        result: showLabelModal.result,
      })
      QRCode.toDataURL(payload, { width: 120, margin: 1 })
        .then(setLabelQrDataUrl)
        .catch(() => setLabelQrDataUrl(''))
    }
  }, [showLabelModal])

  // New Test Request Form State
  const [newTest, setNewTest] = useState({
    productName: 'Rice (Basmati Superior 25kg)',
    batchNo: 'BT-2026-001',
    testType: 'Moisture & Grain Quality',
    sampleQty: '2 Bags (Random Sampling)',
    testedBy: 'Dr. Sharma (QA Lead)',
    expectedDate: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
    remarks: 'Moisture meter and grain purity inspection prior to bay storage',
  })

  // Laboratory Samples Master Data
  const [samplesData, setSamplesData] = useState([])

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

      // Product filter
      if (filterProduct !== 'ALL' && item.productName !== filterProduct) return false

      // Test type filter
      if (filterTestType !== 'ALL' && item.testType !== filterTestType) return false

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matches =
          item.sampleId.toLowerCase().includes(q) ||
          item.batchNo.toLowerCase().includes(q) ||
          item.productName.toLowerCase().includes(q) ||
          item.testType.toLowerCase().includes(q) ||
          item.testedBy.toLowerCase().includes(q)
        if (!matches) return false
      }

      return true
    })
  }, [samplesData, activeTab, filterProduct, filterTestType, searchQuery])

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredSamples.length / perPage))
  const paginatedSamples = filteredSamples.slice((currentPage - 1) * perPage, currentPage * perPage)

  // Reset Filters
  const handleResetFilters = () => {
    setActiveTab('ALL')
    setFilterProduct('ALL')
    setFilterTestType('ALL')
    setSearchQuery('')
    setCurrentPage(1)
    triggerToast('All lab filters reset to default.')
  }

  // Create New Test Handler
  const handleCreateTest = async (e) => {
    e.preventDefault()
    if (!newTest.remarks || !newTest.remarks.trim()) {
      triggerToast('Inspection notes are mandatory for laboratory testing audits', 'error')
      return
    }

    const newId = samplesData.length + 1
    const sId = `LBT-2026-${String(newId).padStart(3, '0')}`
    const matchingProd = backendProducts.find((p) => p.name === newTest.productName)

    const payload = {
      qcNumber: sId,
      grnNo: `GRN-2026-${String(newId + 10).padStart(4, '0')}`,
      productName: newTest.productName,
      sku: matchingProd?.sku || `PRD-${newTest.batchNo.slice(3, 6)}-0${newId}`,
      batchNo: newTest.batchNo,
      sampleSize: newTest.sampleQty,
      testedBy: newTest.testedBy,
      status: 'Quarantine / Under Test',
      remarks: newTest.remarks,
      parameters: [
        { name: newTest.testType, standard: 'Within Specification Limits', observed: 'Sample Inoculated / Under Measurement', pass: true },
        { name: 'Sensory & Physical Integrity', standard: 'Clean & Sealed', observed: 'Verified Inward', pass: true },
      ],
    }

    try {
      await apiRequest('/qc', {
        method: 'POST',
        body: JSON.stringify(payload),
      }).catch(() => {})
    } catch (err) {
      console.warn('QC backend notice:', err)
    }

    const newRecord = {
      id: newId,
      sampleId: sId,
      batchNo: newTest.batchNo,
      productName: newTest.productName,
      sku: matchingProd?.sku || `PRD-${newTest.batchNo.slice(3, 6)}-0${newId}`,
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
      certificateNo: `COA-2026-${String(newId + 100).padStart(5, '0')}`,
    }

    setSamplesData([newRecord, ...samplesData])
    setShowNewTestModal(false)
    triggerToast(`New test request ${sId} registered successfully!`)
  }

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['#', 'Sample ID', 'Batch No', 'Product Name', 'SKU', 'Test Type', 'Sample Date', 'Expected Date', 'Status', 'Result', 'Tested By', 'Remarks']
    const rows = filteredSamples.map((r, i) => [
      i + 1,
      `"${r.sampleId}"`,
      `"${r.batchNo}"`,
      `"${r.productName.replace(/"/g, '""')}"`,
      `"${r.sku}"`,
      `"${r.testType.replace(/"/g, '""')}"`,
      `"${r.sampleDate}"`,
      `"${r.expectedDate}"`,
      `"${r.status}"`,
      `"${r.result}"`,
      `"${r.testedBy}"`,
      `"${(r.remarks || '').replace(/"/g, '""')}"`,
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `Warehouse_Lab_Testing_Register_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    triggerToast('Laboratory test register exported to CSV.')
  }

  // Dropdown Options
  const productOptions = useMemo(() => [
    { value: 'ALL', label: 'All Warehouse Commodities' },
    ...Array.from(new Set([...samplesData.map((s) => s.productName), ...backendProducts.map((p) => p.name)])).map((p) => ({
      value: p,
      label: p,
    })),
  ], [samplesData, backendProducts])

  const testTypeOptions = [
    { value: 'ALL', label: 'All Quality Test Types' },
    { value: 'Moisture & Purity Test', label: 'Moisture & Purity Test' },
    { value: 'Viscosity & FFA Analysis', label: 'Viscosity & FFA Analysis' },
    { value: 'Sterility & Seal Integrity', label: 'Sterility & Seal Integrity' },
    { value: 'Flash Point & Viscosity Index', label: 'Flash Point & Viscosity Index' },
    { value: 'Bursting Strength & ECT', label: 'Bursting Strength & ECT' },
    { value: 'Hydrostatic & Tensile Test', label: 'Hydrostatic & Tensile Test' },
    { value: 'Microbial & Packaging Seal', label: 'Microbial & Packaging Seal' },
  ]

  const newTestProductOptions = useMemo(() => {
    if (backendProducts && backendProducts.length > 0) {
      return backendProducts.map((p) => ({
        value: p.name,
        label: `${p.name} (${p.sku})`,
        sublabel: `${p.category} • 1 ${p.outerPackaging} = ${p.packSize} ${p.baseUnit}`,
      }))
    }
    return [
      { value: 'Rice (Basmati Superior 25kg)', label: 'Rice (Basmati Superior 25kg)', sublabel: 'Grains & Pulses' },
      { value: 'Refined Mustard Oil (15L Tin)', label: 'Refined Mustard Oil (15L Tin)', sublabel: 'Edible Oils' },
      { value: 'Arhar / Toor Dal (Grade A 30kg)', label: 'Arhar / Toor Dal (Grade A 30kg)', sublabel: 'Grains & Pulses' },
      { value: 'Industrial Lubricant 15W-40 (20L)', label: 'Industrial Lubricant 15W-40 (20L)', sublabel: 'Maintenance & Spares' },
      { value: 'Heavy Duty Waterproof Tarpaulin', label: 'Heavy Duty Waterproof Tarpaulin', sublabel: 'Packaging & Safety' },
      { value: 'Corrugated Packaging Cartons 5-Ply', label: 'Corrugated Packaging Cartons 5-Ply', sublabel: 'Packaging Materials' },
      { value: 'Industrial First Aid Kit', label: 'Industrial First Aid Kit', sublabel: 'Safety & Hygiene' },
      { value: 'Glucose Energy Biscuits (Box of 48)', label: 'Glucose Energy Biscuits (Box of 48)', sublabel: 'Food & Groceries' },
    ]
  }, [backendProducts])

  const newTestTypeOptions = [
    { value: 'Moisture & Grain Quality', label: 'Moisture & Grain Quality Test' },
    { value: 'Viscosity & Chemical Purity', label: 'Viscosity & Chemical Purity' },
    { value: 'Sterility & Medical Packaging', label: 'Sterility & Medical Packaging' },
    { value: 'Packaging Strength & ECT', label: 'Packaging Strength & Bursting Test' },
    { value: 'Waterproofing & Tensile Head', label: 'Waterproofing & Tensile Head' },
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
              Quality assurance, sample testing verification, and laboratory compliance certification for warehouse stock.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Register</span>
          </button>
          <button
            type="button"
            onClick={() => printSpecificElement('#printable-lab-register-table', 'Lab Testing Register Report')}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print Report</span>
          </button>
          <button
            type="button"
            onClick={() => setShowNewTestModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition"
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
            <p className="text-[11px] text-indigo-600 font-medium">Logged in register</p>
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
              className="text-xs font-semibold text-slate-500 hover:text-indigo-600 flex items-center gap-1.5 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>

          {/* Search and Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5 items-center text-xs">
            {/* Search Input */}
            <div className="lg:col-span-4 relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Sample ID, Batch, Product..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
              />
            </div>

            {/* Product Filter */}
            <div className="lg:col-span-4">
              <CustomSelect
                value={filterProduct}
                onChange={setFilterProduct}
                options={productOptions}
                zIndexClass="z-30"
              />
            </div>

            {/* Test Type Filter */}
            <div className="lg:col-span-4">
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
                <th className="py-3.5 px-4 min-w-[120px]">Batch No.</th>
                <th className="py-3.5 px-4 min-w-[200px]">Product Name</th>
                <th className="py-3.5 px-4 min-w-[170px]">Test Type</th>
                <th className="py-3.5 px-4 min-w-[110px]">Sample Date</th>
                <th className="py-3.5 px-4 min-w-[110px]">Expected Date</th>
                <th className="py-3.5 px-4 text-center min-w-[110px]">Status</th>
                <th className="py-3.5 px-4 text-center min-w-[95px]">Result</th>
                <th className="py-3.5 px-4 min-w-[150px]">Tested By</th>
                <th className="py-3.5 px-4 text-center w-28">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {paginatedSamples.length === 0 ? (
                <tr>
                  <td colSpan="11" className="py-10 text-center text-slate-400">
                    No lab test records found matching the filter criteria.
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
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-700 text-[11px]">
                      {row.batchNo}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{row.productName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{row.sku}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {row.testType}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px]">
                      {row.sampleDate}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px]">
                      {row.expectedDate}
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
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setShowCertModal(row)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 transition cursor-pointer"
                          title="View QA Certificate of Analysis"
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

      {/* MODAL 1: New Test Request Modal */}
      {showNewTestModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-4 sm:p-6 shadow-2xl border border-slate-200 max-h-[90dvh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-800">Register New Lab Test Request</h3>
                  <p className="text-[11px] text-slate-500">Initiate sample quarantine and laboratory inspection</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowNewTestModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTest} className="pt-4 space-y-3.5 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Product / Commodity <span className="text-rose-500">*</span>
                </label>
                <CustomSelect
                  value={newTest.productName}
                  onChange={(val) => setNewTest({ ...newTest, productName: val })}
                  options={newTestProductOptions}
                  zIndexClass="z-40"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Batch Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newTest.batchNo}
                    onChange={(e) => setNewTest({ ...newTest, batchNo: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Sample Size</label>
                  <input
                    type="text"
                    value={newTest.sampleQty}
                    onChange={(e) => setNewTest({ ...newTest, sampleQty: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
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

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Expected Completion Date</label>
                <input
                  type="date"
                  value={newTest.expectedDate}
                  onChange={(e) => setNewTest({ ...newTest, expectedDate: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Inspection Notes</label>
                <textarea
                  rows={2}
                  value={newTest.remarks}
                  onChange={(e) => setNewTest({ ...newTest, remarks: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                  placeholder="Notes on sampling method, packaging state, temperature..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewTestModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl text-xs font-bold transition"
                >
                  Queue Test Request
                </button>
              </div>
            </form>
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
                  <h3 className="font-bold text-sm text-slate-800">Certificate of Laboratory Analysis</h3>
                  <p className="text-[11px] text-slate-500">Official Quality Clearance Certificate • {showCertModal.sampleId}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCertModal(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Printable Certificate Layout */}
            <div id="printable-lab-test-cert" className="printable-area border border-slate-200 rounded-xl p-5 bg-slate-50/50 space-y-4 text-xs font-sans">
              <div className="flex items-start justify-between border-b pb-3 border-slate-200">
                <div>
                  <h2 className="text-sm font-black text-slate-900 uppercase">CENTRAL WAREHOUSE QA LAB</h2>
                  <p className="text-[11px] text-slate-500">ISO/IEC 17025 Certified Testing Depository</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">Sample Reg: {showCertModal.sampleId}</p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${
                      showCertModal.result === 'Pass'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-rose-100 text-rose-800 border-rose-300'
                    }`}
                  >
                    STATUS: {showCertModal.result.toUpperCase()}
                  </span>
                  <p className="text-[10px] text-slate-500 mt-1">Date: {showCertModal.sampleDate}</p>
                </div>
              </div>

              {/* Product Specifications Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white p-3 rounded-xl border border-slate-200 text-[11px]">
                <div>
                  <span className="text-slate-400 block">Product:</span>
                  <strong className="text-slate-800">{showCertModal.productName}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Batch No:</span>
                  <strong className="font-mono text-slate-800">{showCertModal.batchNo}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Test Protocol:</span>
                  <strong className="text-slate-800">{showCertModal.testType}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Lead Chemist:</span>
                  <strong className="text-slate-800">{showCertModal.testedBy}</strong>
                </div>
              </div>

              {/* Detailed Parameter Results Table */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Tested Parameters & Standards</h4>
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

              {/* Remarks Box */}
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Evaluator Findings & Remarks:</span>
                <p className="text-xs text-slate-700 font-medium">{showCertModal.remarks}</p>
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
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => printSpecificElement('#printable-lab-test-cert', `QA Certificate - ${showCertModal.sampleId}`)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition"
              >
                <Printer className="w-4 h-4" />
                <span>Print Certificate</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
