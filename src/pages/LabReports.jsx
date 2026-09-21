import { useState, useMemo, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  FileText,
  Plus,
  Eye,
  Check,
  X,
  Search,
  Download,
  Printer,
  Calendar,
  Layers,
  Package,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ChevronDown,
  RotateCcw,
  QrCode,
  Award,
  ShieldCheck,
  FileCheck,
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

export default function LabReports() {
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

  // Modals state
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [showCertModal, setShowCertModal] = useState(null)
  const [showQRModal, setShowQRModal] = useState(false)

  // Generate Report Form state
  const [newReport, setNewReport] = useState({
    sampleId: 'LBT-2026-012',
    productName: 'Rice (Basmati Superior 25kg)',
    batchNo: 'BT-2026-012',
    testType: 'Physical & Moisture Test',
    testedOn: '2026-09-21',
    result: 'Pass',
    approvedBy: 'Dr. Sharma (QA Lead)',
    remarks: 'Moisture content 11.6% and grain length meet Grade A export specification.',
  })

  // Master Lab Reports Data
  const [reportsData, setReportsData] = useState([
    {
      id: 1,
      reportNo: 'LR-2026-001',
      sampleId: 'LBT-2026-001',
      productName: 'Rice (Basmati Superior 25kg)',
      sku: 'PRD-RIC-001',
      batchNo: 'BT-2026-001',
      testType: 'Moisture & Purity Test',
      testedOn: '20 Sep 2026',
      result: 'Pass',
      approvedBy: 'Dr. Sharma (QA Lead)',
      parameters: [
        { param: 'Moisture Content', standard: '< 14.0%', observation: '11.8%', status: 'Pass' },
        { param: 'Average Grain Length', standard: '≥ 7.0 mm', observation: '7.4 mm', status: 'Pass' },
        { param: 'Foreign Matter', standard: '< 0.10%', observation: '0.02%', status: 'Pass' },
        { param: 'Aflatoxin Screen', standard: '< 10 ppb', observation: 'Not Detected', status: 'Pass' },
      ],
      remarks: 'Moisture content 11.8% (spec <14%). Aflatoxin negative. Stock cleared for bay storage.',
    },
    {
      id: 2,
      reportNo: 'LR-2026-002',
      sampleId: 'LBT-2026-002',
      productName: 'Refined Mustard Oil (15L Tin)',
      sku: 'PRD-OIL-002',
      batchNo: 'BT-2026-002',
      testType: 'Viscosity & FFA Analysis',
      testedOn: '20 Sep 2026',
      result: 'Conditional',
      approvedBy: 'Dr. Verma (Chemist)',
      parameters: [
        { param: 'Kinematic Viscosity @40°C', standard: '40 - 50 cSt', observation: '42.1 cSt', status: 'Pass' },
        { param: 'Free Fatty Acids (FFA)', standard: '< 0.20%', observation: '0.19%', status: 'Conditional' },
        { param: 'Moisture & Volatile Matter', standard: '< 0.25%', observation: '0.12%', status: 'Pass' },
      ],
      remarks: 'FFA marginal at 0.19% (spec <0.20%). Approved under 6-month prioritized dispatch protocol.',
    },
    {
      id: 3,
      reportNo: 'LR-2026-003',
      sampleId: 'LBT-2026-003',
      productName: 'Heavy Duty Waterproof Tarpaulin',
      sku: 'PRD-TAR-006',
      batchNo: 'BT-2026-003',
      testType: 'Material & Hydrostatic Test',
      testedOn: '19 Sep 2026',
      result: 'Pass',
      approvedBy: 'Dr. Sharma (QA Lead)',
      parameters: [
        { param: 'Hydrostatic Water Head', standard: '≥ 2,000 mm', observation: '2,480 mm', status: 'Pass' },
        { param: 'Tensile Strength (Warp)', standard: '≥ 1,800 N', observation: '1,960 N', status: 'Pass' },
        { param: 'Grommet Pull Resistance', standard: '≥ 450 N', observation: '510 N', status: 'Pass' },
      ],
      remarks: 'Tensile strength 1,960 N and hydrostatic pressure meet ISO heavy duty outdoor standards.',
    },
    {
      id: 4,
      reportNo: 'LR-2026-004',
      sampleId: 'LBT-2026-004',
      productName: 'Industrial First Aid Kit',
      sku: 'PRD-MED-004',
      batchNo: 'BT-2026-004',
      testType: 'Chemical & Sterility Test',
      testedOn: '18 Sep 2026',
      result: 'Pass',
      approvedBy: 'Priya Patel (QC Analyst)',
      parameters: [
        { param: 'Antiseptic Solution Volume', standard: '100 ml ± 2%', observation: '100.5 ml', status: 'Pass' },
        { param: 'Packaging Seal Integrity', standard: '100% Hermetic', observation: 'Intact Seal', status: 'Pass' },
        { param: 'Sterility Testing (Incubation)', standard: 'Zero Growth', observation: 'No Microbial Growth', status: 'Pass' },
      ],
      remarks: 'Antiseptic concentrations and package seal certified according to medical protocol.',
    },
    {
      id: 5,
      reportNo: 'LR-2026-005',
      sampleId: 'LBT-2026-005',
      productName: 'Corrugated Packaging Cartons 5-Ply',
      sku: 'PRD-BOX-007',
      batchNo: 'BT-2026-005',
      testType: 'Bursting & ECT Strength',
      testedOn: '18 Sep 2026',
      result: 'Fail',
      approvedBy: 'Dr. Sharma (QA Lead)',
      parameters: [
        { param: 'Bursting Strength', standard: '≥ 14.0 kg/cm²', observation: '10.8 kg/cm²', status: 'Fail' },
        { param: 'Edge Crush Test (ECT)', standard: '≥ 32 ECT', observation: '26 ECT', status: 'Fail' },
        { param: 'Ply Adhesion', standard: 'Complete Bond', observation: 'Edge Delamination', status: 'Fail' },
      ],
      remarks: 'Bursting strength below 14 kg/cm² baseline. Defective fluting adhesive. Batch quarantined for return.',
    },
    {
      id: 6,
      reportNo: 'LR-2026-006',
      sampleId: 'LBT-2026-006',
      productName: 'Industrial Lubricant 15W-40 (20L)',
      sku: 'PRD-LUB-005',
      batchNo: 'BT-2026-006',
      testType: 'Viscosity & Flash Point',
      testedOn: '17 Sep 2026',
      result: 'Pass',
      approvedBy: 'Dr. Verma (Chemist)',
      parameters: [
        { param: 'Kinematic Viscosity @100°C', standard: '12.5 - 16.3 cSt', observation: '14.8 cSt', status: 'Pass' },
        { param: 'Viscosity Index', standard: '≥ 135', observation: '144', status: 'Pass' },
        { param: 'Flash Point (COC)', standard: '≥ 220°C', observation: '228°C', status: 'Pass' },
      ],
      remarks: 'High thermal stability verified. Meets API CI-4/SL standards for heavy transport fleet.',
    },
    {
      id: 7,
      reportNo: 'LR-2026-007',
      sampleId: 'LBT-2026-007',
      productName: 'Arhar / Toor Dal (Grade A 30kg)',
      sku: 'PRD-DAL-003',
      batchNo: 'BT-2026-007',
      testType: 'Moisture & Foreign Matter',
      testedOn: '16 Sep 2026',
      result: 'Pass',
      approvedBy: 'Priya Patel (QC Analyst)',
      parameters: [
        { param: 'Moisture Content', standard: '< 12.0%', observation: '10.2%', status: 'Pass' },
        { param: 'Admixture / Stones', standard: '< 0.05%', observation: '0.01%', status: 'Pass' },
        { param: 'Damaged Grains', standard: '< 1.5%', observation: '0.5%', status: 'Pass' },
      ],
      remarks: 'FSSAI compliant pulse grade. Clean and free of any pesticide residue or infestation.',
    },
    {
      id: 8,
      reportNo: 'LR-2026-008',
      sampleId: 'LBT-2026-008',
      productName: 'Glucose Energy Biscuits (Box of 48)',
      sku: 'PRD-FOD-008',
      batchNo: 'BT-2026-008',
      testType: 'Microbiological & Pack Seal',
      testedOn: '15 Sep 2026',
      result: 'Pass',
      approvedBy: 'Dr. Sharma (QA Lead)',
      parameters: [
        { param: 'Total Plate Count', standard: '< 5,000 CFU/g', observation: '380 CFU/g', status: 'Pass' },
        { param: 'E. Coli & Salmonella', standard: 'Absent in 25g', observation: 'Absent', status: 'Pass' },
        { param: 'Moisture in Biscuit', standard: '< 2.5%', observation: '1.8%', status: 'Pass' },
      ],
      remarks: 'Moisture 1.8% ensuring crisp texture. Zero microbial contaminants detected.',
    },
  ])

  // Dynamic KPI Stats calculated live from state
  const stats = useMemo(() => {
    const total = reportsData.length
    const passed = reportsData.filter((r) => r.result === 'Pass').length
    const conditional = reportsData.filter((r) => r.result === 'Conditional').length
    const failed = reportsData.filter((r) => r.result === 'Fail').length
    const passRate = total > 0 ? Math.round(((passed + conditional) / total) * 100) : 0
    return { total, passed, conditional, failed, passRate }
  }, [reportsData])

  // Filtered reports
  const filteredReports = useMemo(() => {
    return reportsData.filter((item) => {
      // Tab filter
      if (activeTab === 'PASSED' && item.result !== 'Pass') return false
      if (activeTab === 'CONDITIONAL' && item.result !== 'Conditional') return false
      if (activeTab === 'FAILED' && item.result !== 'Fail') return false

      // Product filter
      if (filterProduct !== 'ALL' && item.productName !== filterProduct) return false

      // Test type filter
      if (filterTestType !== 'ALL' && item.testType !== filterTestType) return false

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matches =
          item.reportNo.toLowerCase().includes(q) ||
          item.sampleId.toLowerCase().includes(q) ||
          item.batchNo.toLowerCase().includes(q) ||
          item.productName.toLowerCase().includes(q) ||
          item.approvedBy.toLowerCase().includes(q)
        if (!matches) return false
      }

      return true
    })
  }, [reportsData, activeTab, filterProduct, filterTestType, searchQuery])

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredReports.length / perPage))
  const paginatedReports = filteredReports.slice((currentPage - 1) * perPage, currentPage * perPage)

  // Reset Filters
  const handleResetFilters = () => {
    setActiveTab('ALL')
    setFilterProduct('ALL')
    setFilterTestType('ALL')
    setSearchQuery('')
    setCurrentPage(1)
    triggerToast('All lab report filters reset.')
  }

  // Generate Report Handler
  const handleGenerateReport = (e) => {
    e.preventDefault()
    const newId = reportsData.length + 1
    const repNo = `LR-2026-${String(newId).padStart(3, '0')}`

    const newRecord = {
      id: newId,
      reportNo: repNo,
      sampleId: newReport.sampleId,
      productName: newReport.productName,
      sku: `PRD-${newReport.batchNo.slice(3, 6)}-0${newId}`,
      batchNo: newReport.batchNo,
      testType: newReport.testType,
      testedOn: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      result: newReport.result,
      approvedBy: newReport.approvedBy,
      parameters: [
        { param: 'Visual & Physical Appearance', standard: 'Uniform / Standard Compliant', observation: 'Verified Normal', status: 'Pass' },
        { param: 'Specification Verification', standard: 'Quality Baseline Passed', observation: 'Standard Compliant', status: newReport.result },
      ],
      remarks: newReport.remarks || 'Formal laboratory clearance report generated and archived.',
    }

    setReportsData([newRecord, ...reportsData])
    setShowGenerateModal(false)
    triggerToast(`Quality Report ${repNo} generated and digitally signed!`)
  }

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['#', 'Report No', 'Sample ID', 'Product Name', 'SKU', 'Batch No', 'Test Type', 'Tested On', 'Result', 'Approved By', 'Remarks']
    const rows = filteredReports.map((r, i) => [
      i + 1,
      `"${r.reportNo}"`,
      `"${r.sampleId}"`,
      `"${r.productName.replace(/"/g, '""')}"`,
      `"${r.sku}"`,
      `"${r.batchNo}"`,
      `"${r.testType.replace(/"/g, '""')}"`,
      `"${r.testedOn}"`,
      `"${r.result}"`,
      `"${r.approvedBy}"`,
      `"${(r.remarks || '').replace(/"/g, '""')}"`,
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `Warehouse_Quality_Lab_Reports_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    triggerToast('Quality lab reports register exported to CSV.')
  }

  // Dropdown Options
  const productOptions = [
    { value: 'ALL', label: 'All Warehouse Commodities' },
    ...Array.from(new Set(reportsData.map((s) => s.productName))).map((p) => ({
      value: p,
      label: p,
    })),
  ]

  const testTypeOptions = [
    { value: 'ALL', label: 'All Quality Test Types' },
    { value: 'Moisture & Purity Test', label: 'Moisture & Purity Test' },
    { value: 'Viscosity & FFA Analysis', label: 'Viscosity & FFA Analysis' },
    { value: 'Material & Hydrostatic Test', label: 'Material & Hydrostatic Test' },
    { value: 'Chemical & Sterility Test', label: 'Chemical & Sterility Test' },
    { value: 'Bursting & ECT Strength', label: 'Bursting & ECT Strength' },
    { value: 'Viscosity & Flash Point', label: 'Viscosity & Flash Point' },
    { value: 'Moisture & Foreign Matter', label: 'Moisture & Foreign Matter' },
    { value: 'Microbiological & Pack Seal', label: 'Microbiological & Pack Seal' },
  ]

  const newReportProductOptions = [
    { value: 'Rice (Basmati Superior 25kg)', label: 'Rice (Basmati Superior 25kg)', sublabel: 'Grains & Pulses' },
    { value: 'Refined Mustard Oil (15L Tin)', label: 'Refined Mustard Oil (15L Tin)', sublabel: 'Edible Oils' },
    { value: 'Arhar / Toor Dal (Grade A 30kg)', label: 'Arhar / Toor Dal (Grade A 30kg)', sublabel: 'Grains & Pulses' },
    { value: 'Industrial Lubricant 15W-40 (20L)', label: 'Industrial Lubricant 15W-40 (20L)', sublabel: 'Maintenance & Spares' },
    { value: 'Heavy Duty Waterproof Tarpaulin', label: 'Heavy Duty Waterproof Tarpaulin', sublabel: 'Packaging & Safety' },
    { value: 'Corrugated Packaging Cartons 5-Ply', label: 'Corrugated Packaging Cartons 5-Ply', sublabel: 'Packaging Materials' },
    { value: 'Industrial First Aid Kit', label: 'Industrial First Aid Kit', sublabel: 'Safety & Hygiene' },
    { value: 'Glucose Energy Biscuits (Box of 48)', label: 'Glucose Energy Biscuits (Box of 48)', sublabel: 'Food & Groceries' },
  ]

  const approverOptions = [
    { value: 'Dr. Sharma (QA Lead)', label: 'Dr. Sharma (QA Lead)' },
    { value: 'Dr. Verma (Chemist)', label: 'Dr. Verma (Chemist)' },
    { value: 'Priya Patel (QC Analyst)', label: 'Priya Patel (QC Analyst)' },
  ]

  const resultOptions = [
    { value: 'Pass', label: 'Pass (Cleared for Storage & Dispatch)' },
    { value: 'Conditional', label: 'Conditional (Priority Use / Limited Shelf)' },
    { value: 'Fail', label: 'Fail (Quarantine & Return)' },
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
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs shrink-0">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Quality Lab Reports</h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Certificates of analysis, formal compliance records, and lab audit verification.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowQRModal(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition"
          >
            <QrCode className="w-3.5 h-3.5 text-slate-500" />
            <span>Verify Certificate</span>
          </button>
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={() => setShowGenerateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Generate Report</span>
          </button>
        </div>
      </div>

      {/* 4 Dynamic KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Total Quality Reports</p>
            <h3 className="text-xl font-bold text-slate-800 leading-tight mt-0.5">
              {stats.total}
            </h3>
            <p className="text-[11px] text-indigo-600 font-medium">Certified records</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Passed Reports</p>
            <h3 className="text-xl font-bold text-slate-800 leading-tight mt-0.5">
              {stats.passed}
            </h3>
            <p className="text-[11px] text-emerald-600 font-medium">{stats.passRate}% overall pass</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Conditional Clearances</p>
            <h3 className="text-xl font-bold text-slate-800 leading-tight mt-0.5">
              {stats.conditional}
            </h3>
            <p className="text-[11px] text-amber-600 font-medium">Priority dispatch protocol</p>
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
            <p className="text-[11px] text-rose-600 font-medium">Quarantine enforced</p>
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
                All Reports ({reportsData.length})
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
                Passed ({reportsData.filter((r) => r.result === 'Pass').length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('CONDITIONAL')
                  setCurrentPage(1)
                }}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  activeTab === 'CONDITIONAL'
                    ? 'bg-white text-amber-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Conditional ({reportsData.filter((r) => r.result === 'Conditional').length})
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
                Failed ({reportsData.filter((r) => r.result === 'Fail').length})
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
                placeholder="Search Report No, Sample ID, Batch, Product..."
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
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs divide-y divide-slate-200">
            <thead className="bg-slate-50/80 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4 w-12 text-center">#</th>
                <th className="py-3.5 px-4 min-w-[125px]">Report No.</th>
                <th className="py-3.5 px-4 min-w-[120px]">Sample ID</th>
                <th className="py-3.5 px-4 min-w-[200px]">Product Name</th>
                <th className="py-3.5 px-4 min-w-[120px]">Batch No.</th>
                <th className="py-3.5 px-4 min-w-[170px]">Test Type</th>
                <th className="py-3.5 px-4 min-w-[110px]">Tested On</th>
                <th className="py-3.5 px-4 text-center min-w-[110px]">Result</th>
                <th className="py-3.5 px-4 min-w-[150px]">Approved By</th>
                <th className="py-3.5 px-4 text-center w-28">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {paginatedReports.length === 0 ? (
                <tr>
                  <td colSpan="10" className="py-10 text-center text-slate-400">
                    No quality reports found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedReports.map((row, idx) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 text-center text-slate-400 font-bold text-[11px]">
                      {(currentPage - 1) * perPage + idx + 1}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {row.reportNo}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600 text-[11px]">
                      {row.sampleId}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{row.productName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{row.sku}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-700 text-[11px]">
                      {row.batchNo}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {row.testType}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px]">
                      {row.testedOn}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          row.result === 'Pass'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : row.result === 'Conditional'
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : 'bg-rose-100 text-rose-800 border-rose-300'
                        }`}
                      >
                        {row.result}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {row.approvedBy}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setShowCertModal(row)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 transition"
                          title="View Certificate of Analysis (CoA)"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowCertModal(row)
                            setTimeout(() => window.print(), 300)
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 transition"
                          title="Print Quality Certificate"
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
            Showing <strong>{filteredReports.length > 0 ? (currentPage - 1) * perPage + 1 : 0}</strong> to{' '}
            <strong>{Math.min(currentPage * perPage, filteredReports.length)}</strong> of{' '}
            <strong>{filteredReports.length}</strong> reports
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

      {/* MODAL 1: Generate Report Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-4 sm:p-6 shadow-2xl border border-slate-200 max-h-[90dvh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-800">Authorize &amp; Generate Lab Report</h3>
                  <p className="text-[11px] text-slate-500">Certify lot clearance with official analysis</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGenerateModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleGenerateReport} className="pt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Sample ID <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newReport.sampleId}
                    onChange={(e) => setNewReport({ ...newReport, sampleId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Batch Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newReport.batchNo}
                    onChange={(e) => setNewReport({ ...newReport, batchNo: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Commodity Product <span className="text-rose-500">*</span>
                </label>
                <CustomSelect
                  value={newReport.productName}
                  onChange={(val) => setNewReport({ ...newReport, productName: val })}
                  options={newReportProductOptions}
                  zIndexClass="z-40"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Evaluation Result <span className="text-rose-500">*</span>
                  </label>
                  <CustomSelect
                    value={newReport.result}
                    onChange={(val) => setNewReport({ ...newReport, result: val })}
                    options={resultOptions}
                    zIndexClass="z-30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Authorizing Lead</label>
                  <CustomSelect
                    value={newReport.approvedBy}
                    onChange={(val) => setNewReport({ ...newReport, approvedBy: val })}
                    options={approverOptions}
                    zIndexClass="z-30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Compliance Notes &amp; Findings</label>
                <textarea
                  rows={2}
                  value={newReport.remarks}
                  onChange={(e) => setNewReport({ ...newReport, remarks: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                  placeholder="Summary of laboratory findings and disposal / clearance recommendation..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl text-xs font-bold transition"
                >
                  Issue Quality Report
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
                  CoA
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-800">Certificate of Analysis (CoA)</h3>
                  <p className="text-[11px] text-slate-500">Official Clearance Document • {showCertModal.reportNo}</p>
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
            <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/50 space-y-4 text-xs font-sans">
              <div className="flex items-start justify-between border-b pb-3 border-slate-200">
                <div>
                  <h2 className="text-sm font-black text-slate-900 uppercase">CENTRAL WAREHOUSE LOGISTICS</h2>
                  <p className="text-[11px] text-slate-500">Quality Assurance Depository & Testing Division</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">Report Ref: {showCertModal.reportNo} • Sample: {showCertModal.sampleId}</p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${
                      showCertModal.result === 'Pass'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : showCertModal.result === 'Conditional'
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : 'bg-rose-100 text-rose-800 border-rose-300'
                    }`}
                  >
                    STATUS: {showCertModal.result.toUpperCase()}
                  </span>
                  <p className="text-[10px] text-slate-500 mt-1">Certified: {showCertModal.testedOn}</p>
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
                  <span className="text-slate-400 block">Test Type:</span>
                  <strong className="text-slate-800">{showCertModal.testType}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Authorizing Lead:</span>
                  <strong className="text-slate-800">{showCertModal.approvedBy}</strong>
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
                        <th className="p-2.5">Standard Specification</th>
                        <th className="p-2.5">Actual Value Observed</th>
                        <th className="p-2.5 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(showCertModal.parameters || []).map((p, i) => (
                        <tr key={i}>
                          <td className="p-2.5 font-medium text-slate-800">{p.param}</td>
                          <td className="p-2.5 font-mono text-slate-600">{p.standard}</td>
                          <td className="p-2.5 font-mono font-bold text-slate-900">{p.observation}</td>
                          <td className="p-2.5 text-center">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                p.status === 'Pass'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : p.status === 'Conditional'
                                  ? 'bg-amber-50 text-amber-700'
                                  : 'bg-rose-50 text-rose-700'
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
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Quality Lead Remarks:</span>
                <p className="text-xs text-slate-700 font-medium">{showCertModal.remarks}</p>
              </div>

              <div className="flex items-center justify-between pt-2 text-[10px] text-slate-400">
                <span>Verified Certificate Identifier: {showCertModal.reportNo}</span>
                <span>Digitally Signed by QA Depository Division</span>
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
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition"
              >
                <Printer className="w-4 h-4" />
                <span>Print Certificate</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: QR Certificate Verification Modal */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-4 sm:p-6 shadow-2xl border border-slate-200 text-center space-y-4 max-h-[90dvh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between border-b pb-2.5 border-slate-100">
              <h3 className="text-sm font-bold text-slate-800">QR Certificate Verification</h3>
              <button
                type="button"
                onClick={() => setShowQRModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="w-36 h-36 mx-auto bg-slate-50 border-2 border-slate-900 p-2 rounded-xl flex items-center justify-center shadow-xs">
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

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified ISO/IEC 17025 Compliant</span>
              </div>
              <p className="text-xs text-slate-600 font-medium pt-1">
                Scan using handheld scanner or mobile camera to retrieve certified lab audit trail.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowQRModal(false)}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
