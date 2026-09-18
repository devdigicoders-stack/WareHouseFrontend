import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Plus, FileText, Eye, Download, Printer, QrCode, Clock, AlertTriangle, Check, X, BarChart2, Package, FileSpreadsheet, Settings, Microscope, FileCheck, Camera } from 'lucide-react'

export default function LabReports() {
  // Toast state
  const [toastMessage, setToastMessage] = useState(null)
  const triggerToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Active Tab & Filter Tabs definitions
  const [activeTab, setActiveTab] = useState('all')
  const filterTabs = [
    { id: 'all', label: 'All Reports', count: 318, badgeClass: 'bg-slate-200 text-slate-700', legacyKey: 'All Reports (318)' },
    { id: 'passed', label: 'Passed', count: 276, badgeClass: 'bg-emerald-100 text-emerald-800', legacyKey: 'Passed (276)' },
    { id: 'failed', label: 'Failed', count: 22, badgeClass: 'bg-rose-100 text-rose-800', legacyKey: 'Failed (22)' },
    { id: 'conditional', label: 'Conditional', count: 14, badgeClass: 'bg-amber-100 text-amber-800', legacyKey: 'Conditional (14)' },
    { id: 'pending', label: 'Pending', count: 6, badgeClass: 'bg-blue-100 text-blue-800', legacyKey: 'Pending (6)' },
  ]

  // Filter toolbar state
  const [filterProduct, setFilterProduct] = useState('All Products')
  const [filterTestType, setFilterTestType] = useState('All Test Types')
  const [filterResult, setFilterResult] = useState('All Results')
  const [searchQuery, setSearchQuery] = useState('')

  // Modals state
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [showCertModal, setShowCertModal] = useState(null)
  const [showQRModal, setShowQRModal] = useState(false)
  const [activeActionRow, setActiveActionRow] = useState(null)

  // Generate Report Form state
  const [newReport, setNewReport] = useState({
    sampleId: 'LBT-2026-011',
    productName: 'Rice (Basmati Superior 25kg)',
    batchNo: 'BT-2026-011',
    testType: 'Physical Test',
    testedOn: '16 Sep 2026',
    result: 'Pass',
    approvedBy: 'Dr. S. Chauhan (QA Lead)',
    remarks: 'Moisture content 11.8% and grain length meet Grade A specification.',
  })

  // Lab Reports Table Data
  const [reportsData, setReportsData] = useState([
    {
      id: 1,
      reportNo: 'LR-2026-001',
      sampleId: 'LBT-2026-001',
      productName: 'Rice (Basmati Superior 25kg)',
      batchNo: 'BT-2026-001',
      testType: 'Physical Test',
      testedOn: '16 Sep 2026',
      result: 'Pass',
      resultClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      approvedBy: 'Dr. S. Chauhan (QA Lead)',
      remarks: 'Moisture content 11.8% (spec <14%). Aflatoxin negative. Clearance granted.',
    },
    {
      id: 2,
      reportNo: 'LR-2026-002',
      sampleId: 'LBT-2026-002',
      productName: 'Heavy Duty Waterproof Tarpaulin',
      batchNo: 'BT-2026-002',
      testType: 'Material Test',
      testedOn: '16 Sep 2026',
      result: 'Pass',
      resultClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      approvedBy: 'Dr. R. Mehta',
      remarks: 'Tensile strength 1,850 N and hydrostatic water head passed ISO tests.',
    },
    {
      id: 3,
      reportNo: 'LR-2026-003',
      sampleId: 'LBT-2026-003',
      productName: 'Industrial First Aid Kit',
      batchNo: 'BT-2026-003',
      testType: 'Chemical Test',
      testedOn: '15 Sep 2026',
      result: 'Pass',
      resultClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      approvedBy: 'Dr. P. Singh',
      remarks: 'Antiseptic concentrations and package seal certified.',
    },
    {
      id: 4,
      reportNo: 'LR-2026-004',
      sampleId: 'LBT-2026-004',
      productName: 'Refined Mustard Oil (15L Tin)',
      batchNo: 'BT-2026-004',
      testType: 'Viscosity Test',
      testedOn: '15 Sep 2026',
      result: 'Conditional',
      resultClass: 'bg-amber-100 text-amber-800 border-amber-200',
      approvedBy: 'Dr. A. Verma',
      remarks: 'Kinematic viscosity 42 cSt. FFA content 0.18% (spec <0.20%). Approved for dispatch.',
    },
    {
      id: 5,
      reportNo: 'LR-2026-005',
      sampleId: 'LBT-2026-005',
      productName: 'Corrugated Packaging Cartons',
      batchNo: 'BT-2026-005',
      testType: 'Functional Test',
      testedOn: '14 Sep 2026',
      result: 'Pass',
      resultClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      approvedBy: 'Dr. S. Chauhan (QA Lead)',
      remarks: 'Bursting strength and edge crush test (ECT 32) passed standard.',
    },
    {
      id: 6,
      reportNo: 'LR-2026-006',
      sampleId: 'LBT-2026-006',
      productName: 'Industrial Disinfectant 5L',
      batchNo: 'BT-2026-006',
      testType: 'Sterility Test',
      testedOn: '14 Sep 2026',
      result: 'Fail',
      resultClass: 'bg-rose-100 text-rose-800 border-rose-200',
      approvedBy: 'Dr. N. Gupta',
      remarks: 'Active concentration 3.8% below mandated 5.0% threshold.',
    },
    {
      id: 7,
      reportNo: 'LR-2026-007',
      sampleId: 'LBT-2026-007',
      productName: 'Industrial Lubricant 15W-40 (20L)',
      batchNo: 'BT-2026-007',
      testType: 'Durability Test',
      testedOn: '13 Sep 2026',
      result: 'Pass',
      resultClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      approvedBy: 'Dr. R. Mehta',
      remarks: 'High temperature viscosity index and anti-wear additives verified.',
    },
    {
      id: 8,
      reportNo: 'LR-2026-008',
      sampleId: 'LBT-2026-008',
      productName: 'Arhar / Toor Dal (Grade A 30kg)',
      batchNo: 'BT-2026-008',
      testType: 'Chemical Test',
      testedOn: '13 Sep 2026',
      result: 'Pass',
      resultClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      approvedBy: 'Dr. P. Singh',
      remarks: 'Purity 99.4%, foreign matter 0.2%, moisture 10.5%. Grade A certified.',
    },
    {
      id: 9,
      reportNo: 'LR-2026-009',
      sampleId: 'LBT-2026-009',
      productName: 'Solar LED Floodlight 50W',
      batchNo: 'BT-2026-009',
      testType: 'Battery Test',
      testedOn: '12 Sep 2026',
      result: 'Conditional',
      resultClass: 'bg-amber-100 text-amber-800 border-amber-200',
      approvedBy: 'Dr. A. Verma',
      remarks: 'Battery run-time 7.5 hrs (spec: 8 hrs). Usable with periodic recharge.',
    },
    {
      id: 10,
      reportNo: 'LR-2026-010',
      sampleId: 'LBT-2026-010',
      productName: 'Fortified Wheat Flour 50kg',
      batchNo: 'BT-2026-010',
      testType: 'Nutritional Test',
      testedOn: '12 Sep 2026',
      result: 'Pending',
      resultClass: 'bg-rose-50 text-rose-700 border-rose-200',
      approvedBy: '-',
      remarks: 'Secondary incubation in progress for moisture and ash content verification.',
    },
  ])

  // Filtered rows
  const filteredRows = useMemo(() => {
    return reportsData.filter((row) => {
      // Tab filter
      if ((activeTab === 'passed' || activeTab === 'Passed (276)') && row.result !== 'Pass') return false
      if ((activeTab === 'failed' || activeTab === 'Failed (22)') && row.result !== 'Fail') return false
      if ((activeTab === 'conditional' || activeTab === 'Conditional (14)') && row.result !== 'Conditional') return false
      if ((activeTab === 'pending' || activeTab === 'Pending (6)') && row.result !== 'Pending') return false

      // Filter toolbar
      if (filterProduct !== 'All Products' && row.productName !== filterProduct) return false
      if (filterTestType !== 'All Test Types' && row.testType !== filterTestType) return false
      if (filterResult !== 'All Results' && row.result !== filterResult) return false

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const match =
          row.reportNo.toLowerCase().includes(q) ||
          row.sampleId.toLowerCase().includes(q) ||
          row.productName.toLowerCase().includes(q) ||
          row.batchNo.toLowerCase().includes(q)
        if (!match) return false
      }

      return true
    })
  }, [reportsData, activeTab, filterProduct, filterTestType, filterResult, searchQuery])

  // Apply filter
  const handleApplyFilter = () => {
    triggerToast('Filters applied to laboratory reports.')
  }

  // Reset filter
  const handleResetFilter = () => {
    setFilterProduct('All Products')
    setFilterTestType('All Test Types')
    setFilterResult('All Results')
    setSearchQuery('')
    setActiveTab('All Reports (318)')
    triggerToast('All report filters have been reset.')
  }

  // Handle Generate Report Form Submission
  const handleGenerateReport = (e) => {
    e.preventDefault()
    const nextId = reportsData.length + 1
    const repCode = `LR-2026-${String(nextId).padStart(3, '0')}`

    let resultClass = 'bg-emerald-100 text-emerald-800 border-emerald-200'
    if (newReport.result === 'Conditional') resultClass = 'bg-amber-100 text-amber-800 border-amber-200'
    if (newReport.result === 'Fail') resultClass = 'bg-rose-100 text-rose-800 border-rose-200'
    if (newReport.result === 'Pending') resultClass = 'bg-rose-50 text-rose-700 border-rose-200'

    const record = {
      id: nextId,
      reportNo: repCode,
      sampleId: newReport.sampleId,
      productName: newReport.productName,
      batchNo: newReport.batchNo,
      testType: newReport.testType,
      testedOn: newReport.testedOn,
      result: newReport.result,
      resultClass,
      approvedBy: newReport.approvedBy,
      remarks: newReport.remarks,
    }

    setReportsData([record, ...reportsData])
    setShowGenerateModal(false)
    triggerToast(`Report ${repCode} generated and certified!`)
  }

  // Export CSV
  const handleExportCSV = () => {
    const headers = 'Report No,Sample ID,Product Name,Batch No,Test Type,Tested On,Result,Approved By\n'
    const rows = filteredRows
      .map(
        (r) =>
          `"${r.reportNo}","${r.sampleId}","${r.productName}","${r.batchNo}","${r.testType}","${r.testedOn}","${r.result}","${r.approvedBy}"`
      )
      .join('\n')
    const blob = new Blob([headers + rows], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Lab_Reports_Summary_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    triggerToast('Laboratory reports summary exported.')
  }

  // Print Report
  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-4 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#162214] border border-amber-400 text-amber-300 px-4 py-2.5 rounded-lg shadow-2xl flex items-center gap-2 text-xs font-medium animate-bounce">
          <svg className="w-4 h-4 text-amber-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
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
        <div className="absolute bottom-3 left-4 text-white text-xs font-medium flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-emerald-950/70 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            CERTIFIED ARCHIVE ACTIVE
          </div>
          <span className="text-slate-300 text-[11px] font-mono">
            CENTRAL QA RECORD REGISTRY — ISO/IEC 17025 ACCREDITED TESTING DEPOT
          </span>
        </div>
      </div>

      {/* Page Header: Clipboard Icon + Title + Action Button + Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1E3A1E] text-white flex items-center justify-center shadow-md shrink-0">
            {/* Clipboard + Flask Icon */}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900 tracking-tight">Lab Reports</h1>
            <p className="text-xs text-slate-500 font-medium">
              View, manage and analyze quality test reports for all warehouse items.
            </p>
          </div>
        </div>

        {/* Right side: Breadcrumbs + Generate Report Button */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 font-medium mr-2">
            <Link to="/dashboard" className="hover:text-slate-700">Home</Link>
            <span>›</span>
            <span className="text-slate-600">Quality &amp; Lab</span>
            <span>›</span>
            <span className="text-slate-900 font-bold">Lab Reports</span>
          </div>

          <button
            type="button"
            onClick={() => setShowGenerateModal(true)}
            className="bg-[#1F331E] hover:bg-[#2A4428] text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer active:scale-98"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Generate Report</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5 KPI STAT CARDS (Exact Match with Reference Screenshot)                  */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Total Reports */}
        <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Total Reports</p>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-black text-slate-900 leading-tight">318</h3>
              <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                <span>↑</span> 15%
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">This month</p>
          </div>
        </div>

        {/* Card 2: Passed Reports */}
        <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Passed Reports</p>
            <h3 className="text-xl font-black text-slate-900 leading-tight">276</h3>
            <p className="text-[10px] text-slate-400 font-medium">86.8% of total</p>
          </div>
        </div>

        {/* Card 3: Failed Reports */}
        <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Failed Reports</p>
            <h3 className="text-xl font-black text-slate-900 leading-tight">22</h3>
            <p className="text-[10px] text-slate-400 font-medium">6.9% of total</p>
          </div>
        </div>

        {/* Card 4: Conditional Pass */}
        <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Conditional Pass</p>
            <h3 className="text-xl font-black text-slate-900 leading-tight">14</h3>
            <p className="text-[10px] text-slate-400 font-medium">4.4% of total</p>
          </div>
        </div>

        {/* Card 5: Pending Reports */}
        <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Pending Reports</p>
            <h3 className="text-xl font-black text-slate-900 leading-tight">6</h3>
            <p className="text-[10px] text-slate-400 font-medium">1.9% of total</p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FILTER TOOLBAR CARD (Exact Match with Reference Screenshot)               */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-xl p-3.5 shadow-xs border border-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5 items-end text-xs">
          {/* Date Range */}
          <div className="lg:col-span-2">
            <label className="block text-[10px] font-bold text-slate-600 mb-1">Date Range</label>
            <div className="relative">
              <input
                type="text"
                readOnly
                value="01 Sep 2026 - 16 Sep 2026"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-700 focus:outline-none cursor-pointer"
                onClick={() => triggerToast('Date range selector: 01 Sep 2026 to 16 Sep 2026')}
              />
            </div>
          </div>

          {/* Product */}
          <div className="lg:col-span-2">
            <label className="block text-[10px] font-bold text-slate-600 mb-1">Product</label>
            <select
              value={filterProduct}
              onChange={(e) => setFilterProduct(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:bg-white focus:ring-1 focus:ring-emerald-600 cursor-pointer"
            >
              <option value="All Products">All Products</option>
              <option value="Rice (Basmati Superior 25kg)">Rice (Basmati Superior 25kg)</option>
              <option value="Heavy Duty Waterproof Tarpaulin">Heavy Duty Waterproof Tarpaulin</option>
              <option value="Industrial First Aid Kit">Industrial First Aid Kit</option>
              <option value="Refined Mustard Oil (15L Tin)">Refined Mustard Oil (15L Tin)</option>
              <option value="Corrugated Packaging Cartons">Corrugated Packaging Cartons</option>
              <option value="Industrial Disinfectant 5L">Industrial Disinfectant 5L</option>
              <option value="Industrial Lubricant 15W-40 (20L)">Industrial Lubricant 15W-40 (20L)</option>
              <option value="Arhar / Toor Dal (Grade A 30kg)">Arhar / Toor Dal (Grade A 30kg)</option>
              <option value="Solar LED Floodlight 50W">Solar LED Floodlight 50W</option>
              <option value="Fortified Wheat Flour 50kg">Fortified Wheat Flour 50kg</option>
            </select>
          </div>

          {/* Test Type */}
          <div className="lg:col-span-2">
            <label className="block text-[10px] font-bold text-slate-600 mb-1">Test Type</label>
            <select
              value={filterTestType}
              onChange={(e) => setFilterTestType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:bg-white focus:ring-1 focus:ring-emerald-600 cursor-pointer"
            >
              <option value="All Test Types">All Test Types</option>
              <option value="Physical Test">Physical Test</option>
              <option value="Material Test">Material Test</option>
              <option value="Chemical Test">Chemical Test</option>
              <option value="Viscosity Test">Viscosity Test</option>
              <option value="Functional Test">Functional Test</option>
              <option value="Sterility Test">Sterility Test</option>
              <option value="Durability Test">Durability Test</option>
              <option value="Battery Test">Battery Test</option>
              <option value="Nutritional Test">Nutritional Test</option>
            </select>
          </div>

          {/* Result */}
          <div className="lg:col-span-2">
            <label className="block text-[10px] font-bold text-slate-600 mb-1">Result</label>
            <select
              value={filterResult}
              onChange={(e) => setFilterResult(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:bg-white focus:ring-1 focus:ring-emerald-600 cursor-pointer"
            >
              <option value="All Results">All Results</option>
              <option value="Pass">Pass</option>
              <option value="Fail">Failed</option>
              <option value="Conditional">Conditional</option>
              <option value="Pending">Pending</option>
            </select>
          </div>

          {/* Search by Report No., Batch No., Product... */}
          <div className="lg:col-span-2">
            <label className="block text-[10px] font-bold text-slate-600 mb-1">Search</label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Report No., Batch..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-2 py-1.5 text-xs focus:outline-none focus:bg-white focus:ring-1 focus:ring-emerald-600"
              />
            </div>
          </div>

          {/* Buttons: Filter & Reset */}
          <div className="lg:col-span-2 flex items-center gap-2">
            <button
              type="button"
              onClick={handleApplyFilter}
              className="flex-1 bg-[#1F331E] hover:bg-[#2A4428] text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer active:scale-98"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span>Filter</span>
            </button>
            <button
              type="button"
              onClick={handleResetFilter}
              className="px-3 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MAIN LAYOUT: Left Column (Span 9) + Right Column (Span 3)                 */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: Reports Table + 3 Lower Widgets (Span 9 / 12)                */}
        {/* ========================================================================= */}
        <div className="lg:col-span-9 space-y-4">
          {/* Table Card */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden flex flex-col">
            {/* Toolbar Tabs + Actions Header */}
            <div className="p-3.5 sm:p-4 border-b border-slate-100 flex flex-col xl:flex-row xl:items-center justify-between gap-3.5">
              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                {filterTabs.map((tab) => {
                  const isActive = activeTab === tab.id || activeTab === tab.legacyKey
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setActiveTab(tab.id)
                        triggerToast(`Filtered: ${tab.label}`)
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-2 ${
                        isActive
                          ? 'bg-[#1E3A1E] text-white shadow-xs ring-1 ring-[#1E3A1E]'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold leading-none ${
                          isActive ? 'bg-white/20 text-white' : tab.badgeClass
                        }`}
                      >
                        {tab.count}
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* Action Buttons: Export, Print, Download Certificate */}
              <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 flex-wrap">
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs transition cursor-pointer whitespace-nowrap shrink-0"
                  title="Export filtered records to CSV"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Export</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs transition cursor-pointer whitespace-nowrap shrink-0"
                  title="Print report register"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-500" />
                  <span>Print</span>
                </button>
                <button
                  type="button"
                  onClick={() => triggerToast('Packaging certificates for active batch (ZIP)')}
                  className="bg-[#1E3A1E] hover:bg-[#2A4428] text-white px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer whitespace-nowrap shrink-0"
                  title="Download Quality Certificates"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Download Certificates</span>
                </button>
              </div>
            </div>

            {/* Table Container with no-scrollbar */}
            <div
              className="overflow-x-auto no-scrollbar scroll-smooth w-full"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              <table className="w-full text-left text-xs border-collapse table-nowrap min-w-[900px]">
                <thead>
                  <tr className="bg-slate-50/90 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                    <th className="py-2.5 px-3 text-center w-8">#</th>
                    <th className="py-2.5 px-3">Report No.</th>
                    <th className="py-2.5 px-3">Sample ID</th>
                    <th className="py-2.5 px-3">Product Name</th>
                    <th className="py-2.5 px-3">Batch No.</th>
                    <th className="py-2.5 px-3">Test Type</th>
                    <th className="py-2.5 px-3">Tested On</th>
                    <th className="py-2.5 px-3 text-center">Result</th>
                    <th className="py-2.5 px-3">Approved By</th>
                    <th className="py-2.5 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredRows.map((row, idx) => (
                    <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3.5 text-center text-slate-400 font-bold text-[11px] whitespace-nowrap">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-3.5 font-mono font-bold text-slate-800 whitespace-nowrap">
                        {row.reportNo}
                      </td>
                      <td className="py-3 px-3.5 font-mono text-slate-600 whitespace-nowrap">
                        {row.sampleId}
                      </td>
                      <td className="py-3 px-3.5 font-semibold text-slate-900 whitespace-nowrap">
                        {row.productName}
                      </td>
                      <td className="py-3 px-3.5 font-mono font-semibold text-slate-700 text-[11px] whitespace-nowrap">
                        {row.batchNo}
                      </td>
                      <td className="py-3 px-3.5 text-slate-700 font-medium whitespace-nowrap">
                        {row.testType}
                      </td>
                      <td className="py-3 px-3.5 font-mono text-slate-500 whitespace-nowrap">
                        {row.testedOn}
                      </td>
                      <td className="py-3 px-3.5 text-center whitespace-nowrap">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${row.resultClass}`}>
                          {row.result}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 text-slate-700 font-medium whitespace-nowrap">
                        {row.approvedBy}
                      </td>
                      <td className="py-3 px-3.5 text-center whitespace-nowrap relative">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* View Report Eye */}
                          <button
                            type="button"
                            onClick={() => setShowCertModal(row)}
                            className="w-6 h-6 rounded hover:bg-slate-100 flex items-center justify-center text-slate-600 transition"
                            title="View Report"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Download PDF Icon */}
                          <button
                            type="button"
                            onClick={() => triggerToast(`Downloading PDF for ${row.reportNo}`)}
                            className="w-6 h-6 rounded hover:bg-slate-100 flex items-center justify-center text-slate-600 transition"
                            title="Download PDF"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>

                          {/* Action ••• */}
                          <button
                            type="button"
                            onClick={() => setActiveActionRow(activeActionRow === row.id ? null : row.id)}
                            className="w-6 h-6 rounded hover:bg-slate-100 flex items-center justify-center text-slate-500 font-bold tracking-widest transition"
                            title="More Actions"
                          >
                            •••
                          </button>
                        </div>

                        {/* Dropdown Menu */}
                        {activeActionRow === row.id && (
                          <div className="absolute right-2 top-8 z-30 bg-white border border-slate-200 rounded-lg shadow-xl py-1 w-36 text-left text-xs animate-in fade-in zoom-in-95">
                            <button
                              type="button"
                              onClick={() => {
                                setShowCertModal(row)
                                setActiveActionRow(null)
                              }}
                              className="w-full px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-500" />
                              <span>View Details</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                triggerToast(`Reprinting QA seal for ${row.reportNo}`)
                                setActiveActionRow(null)
                              }}
                              className="w-full px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                            >
                              <Printer className="w-3.5 h-3.5 text-slate-500" />
                              <span>Print Slip</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setShowQRModal(true)
                                setActiveActionRow(null)
                              }}
                              className="w-full px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                            >
                              <QrCode className="w-3.5 h-3.5 text-slate-500" />
                              <span>Verify QR</span>
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
            <div className="p-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 font-medium">
              <p>Showing 1 to {filteredRows.length} of 318 reports</p>
              <div className="flex items-center gap-1 self-center">
                <button
                  type="button"
                  className="w-7 h-7 rounded border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-600 cursor-pointer"
                >
                  ‹
                </button>
                <button type="button" className="w-7 h-7 rounded bg-[#1F331E] text-white font-bold cursor-pointer">
                  1
                </button>
                <button type="button" className="w-7 h-7 rounded border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-600 cursor-pointer">
                  2
                </button>
                <button type="button" className="w-7 h-7 rounded border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-600 cursor-pointer">
                  3
                </button>
                <button type="button" className="w-7 h-7 rounded border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-600 cursor-pointer">
                  4
                </button>
                <button type="button" className="w-7 h-7 rounded border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-600 cursor-pointer">
                  5
                </button>
                <span className="px-1 text-slate-400">..</span>
                <button type="button" className="px-2 h-7 rounded border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-600 cursor-pointer font-mono">
                  32
                </button>
                <button
                  type="button"
                  className="w-7 h-7 rounded border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-600 cursor-pointer"
                >
                  ›
                </button>
              </div>
              <div className="flex items-center gap-1.5 self-end sm:self-auto">
                <span>Show</span>
                <select className="bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-xs font-semibold focus:outline-none">
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                </select>
                <span>per page</span>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* LOWER SECTION: 3 Widgets Side-by-Side Under Table                         */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
            {/* WIDGET 1: Reports Trend (Last 7 Days) */}
            <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                  <h2 className="text-xs font-bold text-slate-800">Reports Trend (Last 7 Days)</h2>
                </div>

                {/* Legend */}
                <div className="flex items-center flex-wrap gap-2 pt-2 pb-1 text-[10px] font-semibold text-slate-600">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <span>Total</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>Passed</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    <span>Failed</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    <span>Conditional</span>
                  </div>
                </div>

                {/* Multi-Line SVG Chart */}
                <div className="h-44 w-full pt-2">
                  <svg viewBox="0 0 320 150" className="w-full h-full overflow-visible">
                    {/* Grid lines */}
                    <line x1="30" y1="20" x2="310" y2="20" stroke="#F1F5F9" strokeWidth="1" />
                    <line x1="30" y1="50" x2="310" y2="50" stroke="#F1F5F9" strokeWidth="1" />
                    <line x1="30" y1="80" x2="310" y2="80" stroke="#F1F5F9" strokeWidth="1" />
                    <line x1="30" y1="110" x2="310" y2="110" stroke="#F1F5F9" strokeWidth="1" />
                    <line x1="30" y1="135" x2="310" y2="135" stroke="#CBD5E1" strokeWidth="1" />

                    {/* Y-Axis Labels */}
                    <text x="24" y="23" fill="#94A3B8" fontSize="8" textAnchor="end">80</text>
                    <text x="24" y="53" fill="#94A3B8" fontSize="8" textAnchor="end">60</text>
                    <text x="24" y="83" fill="#94A3B8" fontSize="8" textAnchor="end">40</text>
                    <text x="24" y="113" fill="#94A3B8" fontSize="8" textAnchor="end">20</text>
                    <text x="24" y="137" fill="#94A3B8" fontSize="8" textAnchor="end">0</text>

                    {/* Total Line (Blue) */}
                    <path
                      d="M 45 105 L 90 85 L 135 95 L 180 88 L 225 65 L 270 78 L 305 76"
                      fill="none"
                      stroke="#3B82F6"
                      strokeWidth="2"
                    />
                    {/* Passed Line (Green) */}
                    <path
                      d="M 45 115 L 90 95 L 135 102 L 180 96 L 225 78 L 270 88 L 305 88"
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="2"
                    />
                    {/* Failed Line (Red) */}
                    <path
                      d="M 45 130 L 90 128 L 135 130 L 180 126 L 225 125 L 270 128 L 305 130"
                      fill="none"
                      stroke="#EF4444"
                      strokeWidth="2"
                    />
                    {/* Conditional Line (Orange) */}
                    <path
                      d="M 45 132 L 90 131 L 135 132 L 180 128 L 225 126 L 270 129 L 305 131"
                      fill="none"
                      stroke="#F59E0B"
                      strokeWidth="2"
                    />

                    {/* Points on Total Line (Blue) */}
                    <circle cx="45" cy="105" r="2.5" fill="#3B82F6" />
                    <circle cx="90" cy="85" r="2.5" fill="#3B82F6" />
                    <circle cx="135" cy="95" r="2.5" fill="#3B82F6" />
                    <circle cx="180" cy="88" r="2.5" fill="#3B82F6" />
                    <circle cx="225" cy="65" r="2.5" fill="#3B82F6" />
                    <circle cx="270" cy="78" r="2.5" fill="#3B82F6" />
                    <circle cx="305" cy="76" r="2.5" fill="#3B82F6" />

                    {/* Points on Passed Line (Green) */}
                    <circle cx="45" cy="115" r="2.5" fill="#10B981" />
                    <circle cx="90" cy="95" r="2.5" fill="#10B981" />
                    <circle cx="135" cy="102" r="2.5" fill="#10B981" />
                    <circle cx="180" cy="96" r="2.5" fill="#10B981" />
                    <circle cx="225" cy="78" r="2.5" fill="#10B981" />
                    <circle cx="270" cy="88" r="2.5" fill="#10B981" />
                    <circle cx="305" cy="88" r="2.5" fill="#10B981" />

                    {/* X-Axis Labels */}
                    <text x="45" y="147" fill="#94A3B8" fontSize="8" textAnchor="middle">10 Sep</text>
                    <text x="90" y="147" fill="#94A3B8" fontSize="8" textAnchor="middle">11 Sep</text>
                    <text x="135" y="147" fill="#94A3B8" fontSize="8" textAnchor="middle">12 Sep</text>
                    <text x="180" y="147" fill="#94A3B8" fontSize="8" textAnchor="middle">13 Sep</text>
                    <text x="225" y="147" fill="#94A3B8" fontSize="8" textAnchor="middle">14 Sep</text>
                    <text x="270" y="147" fill="#94A3B8" fontSize="8" textAnchor="middle">15 Sep</text>
                    <text x="305" y="147" fill="#94A3B8" fontSize="8" textAnchor="middle">16 Sep</text>
                  </svg>
                </div>
              </div>
            </div>

            {/* WIDGET 2: Test Type Wise Reports (Progress Bars) */}
            <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <h2 className="text-xs font-bold text-slate-800">Test Type Wise Reports</h2>
                </div>

                <div className="pt-2.5 space-y-2">
                  {/* 1 */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-semibold mb-0.5">
                      <span className="text-slate-700">1. Physical Test</span>
                      <span className="font-mono font-bold text-slate-900">68</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>

                  {/* 2 */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-semibold mb-0.5">
                      <span className="text-slate-700">2. Material Test</span>
                      <span className="font-mono font-bold text-slate-900">52</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '65%' }}></div>
                    </div>
                  </div>

                  {/* 3 */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-semibold mb-0.5">
                      <span className="text-slate-700">3. Chemical Test</span>
                      <span className="font-mono font-bold text-slate-900">46</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: '58%' }}></div>
                    </div>
                  </div>

                  {/* 4 */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-semibold mb-0.5">
                      <span className="text-slate-700">4. Functional Test</span>
                      <span className="font-mono font-bold text-slate-900">38</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '48%' }}></div>
                    </div>
                  </div>

                  {/* 5 */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-semibold mb-0.5">
                      <span className="text-slate-700">5. Durability Test</span>
                      <span className="font-mono font-bold text-slate-900">32</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-teal-700 h-1.5 rounded-full" style={{ width: '40%' }}></div>
                    </div>
                  </div>

                  {/* 6 */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-semibold mb-0.5">
                      <span className="text-slate-700">6. Sterility Test</span>
                      <span className="font-mono font-bold text-slate-900">28</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: '35%' }}></div>
                    </div>
                  </div>

                  {/* 7 */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-semibold mb-0.5">
                      <span className="text-slate-700">7. Battery Test</span>
                      <span className="font-mono font-bold text-slate-900">24</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-amber-600 h-1.5 rounded-full" style={{ width: '30%' }}></div>
                    </div>
                  </div>

                  {/* 8 */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-semibold mb-0.5">
                      <span className="text-slate-700">8. Nutritional Test</span>
                      <span className="font-mono font-bold text-slate-900">20</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: '25%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* WIDGET 3: Recent Reports Feed */}
            <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h2 className="text-xs font-bold text-slate-800">Recent Reports</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => triggerToast('Viewing chronological reports feed')}
                    className="text-[11px] font-bold text-emerald-800 hover:text-emerald-900 cursor-pointer"
                  >
                    View All →
                  </button>
                </div>

                <div className="pt-3 space-y-3">
                  {/* Item 1 */}
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 leading-tight">
                        LR-2026-010 · Fortified Wheat Flour 50kg
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                        <span className="text-rose-600 font-bold">Pending</span> | 12 Sep 2026
                      </p>
                    </div>
                  </div>

                  {/* Item 2 */}
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 leading-tight">
                        LR-2026-009 · Solar LED Floodlight 50W
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                        <span className="text-amber-600 font-bold">Conditional</span> | 12 Sep 2026
                      </p>
                    </div>
                  </div>

                  {/* Item 3 */}
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 leading-tight">
                        LR-2026-008 · Arhar / Toor Dal (Grade A 30kg)
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                        <span className="text-emerald-600 font-bold">Pass</span> | 13 Sep 2026
                      </p>
                    </div>
                  </div>

                  {/* Item 4 */}
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 leading-tight">
                        LR-2026-007 · Industrial Lubricant 15W-40 (20L)
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                        <span className="text-emerald-600 font-bold">Pass</span> | 13 Sep 2026
                      </p>
                    </div>
                  </div>

                  {/* Item 5 */}
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                      <X className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 leading-tight">
                        LR-2026-006 · Industrial Disinfectant 5L
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                        <span className="text-rose-600 font-bold">Fail</span> | 14 Sep 2026
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: Report Summary Donut Chart + Quick Actions (Span 3 / 12)    */}
        {/* ========================================================================= */}
        <div className="lg:col-span-3 space-y-4">
          {/* CARD 1: Report Summary Donut Chart */}
          <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
              <h2 className="text-xs font-bold text-slate-800">Report Summary</h2>
            </div>

            <div className="pt-3 pb-2 flex flex-col items-center">
              <div className="relative w-40 h-40 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#F1F5F9" strokeWidth="15" />

                  {/* Passed: 86.8% -> 207.2 of 238.7 */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="14"
                    strokeDasharray="207.2 238.7"
                    strokeDashoffset="0"
                  />
                  {/* Failed: 6.9% -> 16.5 */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#EF4444"
                    strokeWidth="14"
                    strokeDasharray="16.5 238.7"
                    strokeDashoffset="-207.2"
                  />
                  {/* Conditional: 4.4% -> 10.5 */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="14"
                    strokeDasharray="10.5 238.7"
                    strokeDashoffset="-223.7"
                  />
                  {/* Pending: 1.9% -> 4.5 */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#8B5CF6"
                    strokeWidth="14"
                    strokeDasharray="4.5 238.7"
                    strokeDashoffset="-234.2"
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-black text-slate-900 font-mono leading-none">318</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase mt-1">Reports</span>
                </div>
              </div>

              {/* Legend matching screenshot */}
              <div className="w-full pt-3 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500"></span>
                    <span className="text-slate-700 font-medium">Passed</span>
                  </div>
                  <span className="font-mono font-bold text-slate-800">276 (86.8%)</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-xs bg-rose-500"></span>
                    <span className="text-slate-700 font-medium">Failed</span>
                  </div>
                  <span className="font-mono font-bold text-slate-800">22 (6.9%)</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-xs bg-amber-500"></span>
                    <span className="text-slate-700 font-medium">Conditional</span>
                  </div>
                  <span className="font-mono font-bold text-slate-800">14 (4.4%)</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-xs bg-purple-500"></span>
                    <span className="text-slate-700 font-medium">Pending</span>
                  </div>
                  <span className="font-mono font-bold text-slate-800">6 (1.9%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* CARD 2: Quick Actions */}
          <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <h2 className="text-xs font-bold text-slate-800">Quick Actions</h2>
            </div>

            <div className="pt-3 space-y-2">
              <button
                type="button"
                onClick={() => triggerToast('Compiling Executive Monthly Quality Summary...')}
                className="w-full bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2.5 transition cursor-pointer"
              >
                <BarChart2 className="w-4 h-4 text-emerald-700" />
                <span>Generate Summary Report</span>
              </button>

              <button
                type="button"
                onClick={() => triggerToast('Zipping 318 signed Quality Certificates...')}
                className="w-full bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2.5 transition cursor-pointer"
              >
                <Package className="w-4 h-4 text-blue-600" />
                <span>Download All Reports (ZIP)</span>
              </button>

              <button
                type="button"
                onClick={handleExportCSV}
                className="w-full bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2.5 transition cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Export to Excel</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="w-full bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2.5 transition cursor-pointer"
              >
                <Printer className="w-4 h-4 text-amber-600" />
                <span>Print Selected Reports</span>
              </button>

              <button
                type="button"
                onClick={() => setShowQRModal(true)}
                className="w-full bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2.5 transition cursor-pointer"
              >
                <QrCode className="w-4 h-4 text-purple-600" />
                <span>Verify Certificate (QR Scan)</span>
              </button>

              <button
                type="button"
                onClick={() => triggerToast('Parameter master standards: 42 quality and ISO specifications configured.')}
                className="w-full bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2.5 transition cursor-pointer"
              >
                <Settings className="w-4 h-4 text-slate-600" />
                <span>Test Parameter Master</span>
              </button>

              <button
                type="button"
                onClick={() => triggerToast('Calibrated equipment status: 18 online, 0 overdue.')}
                className="w-full bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2.5 transition cursor-pointer"
              >
                <Microscope className="w-4 h-4 text-indigo-600" />
                <span>Lab Equipment Master</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: Generate Report Modal                                            */}
      {/* ========================================================================= */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-[#1E3A1E] text-white flex items-center justify-center font-bold text-sm">
                  <Plus className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Compile &amp; Generate Lab Report</h3>
                  <p className="text-[11px] text-slate-500">Authorize formal military quality test certificate</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGenerateModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleGenerateReport} className="pt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Sample Reference <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newReport.sampleId}
                    onChange={(e) => setNewReport({ ...newReport, sampleId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono font-bold focus:outline-none focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Batch No. <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newReport.batchNo}
                    onChange={(e) => setNewReport({ ...newReport, batchNo: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono font-bold focus:outline-none focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Product <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newReport.productName}
                    onChange={(e) => setNewReport({ ...newReport, productName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:outline-none focus:bg-white"
                  >
                    <option value="7.62mm Ammunition Box">7.62mm Ammunition Box</option>
                    <option value="Combat Boots">Combat Boots</option>
                    <option value="First Aid Kit">First Aid Kit</option>
                    <option value="Engine Oil 15W-40">Engine Oil 15W-40</option>
                    <option value="VHF Radio Set">VHF Radio Set</option>
                    <option value="Medical Gloves">Medical Gloves</option>
                    <option value="Field Tent">Field Tent</option>
                    <option value="Water Purification Tablet">Water Purification Tablet</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Test Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newReport.testType}
                    onChange={(e) => setNewReport({ ...newReport, testType: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:outline-none focus:bg-white"
                  >
                    <option value="Physical Test">Physical Test</option>
                    <option value="Material Test">Material Test</option>
                    <option value="Chemical Test">Chemical Test</option>
                    <option value="Viscosity Test">Viscosity Test</option>
                    <option value="Functional Test">Functional Test</option>
                    <option value="Sterility Test">Sterility Test</option>
                    <option value="Durability Test">Durability Test</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Evaluation Result <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newReport.result}
                    onChange={(e) => setNewReport({ ...newReport, result: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold focus:outline-none focus:bg-white"
                  >
                    <option value="Pass">Pass (Approved for Service)</option>
                    <option value="Conditional">Conditional Pass (Restricted Use)</option>
                    <option value="Fail">Fail (Quarantine &amp; Rejection)</option>
                    <option value="Pending">Pending Re-analysis</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Approving Authority <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newReport.approvedBy}
                    onChange={(e) => setNewReport({ ...newReport, approvedBy: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:outline-none focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Findings &amp; Clearance Notes
                </label>
                <textarea
                  rows={2}
                  value={newReport.remarks}
                  onChange={(e) => setNewReport({ ...newReport, remarks: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none resize-none"
                ></textarea>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1F331E] hover:bg-[#2A4428] text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Publish Report</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: Certificate / Report Details Modal                                */}
      {/* ========================================================================= */}
      {showCertModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-amber-600" />
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{showCertModal.reportNo}</h3>
                  <p className="text-[10px] text-slate-500 font-mono">LAB TEST EVALUATION VOUCHER</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCertModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-amber-50/40 rounded-xl border border-amber-200/80 space-y-3 text-xs">
              <div className="text-center pb-2 border-b border-amber-200/60">
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-900">
                  CENTRAL WAREHOUSE QA LABORATORY
                </p>
                <h4 className="font-black text-sm text-slate-900 mt-0.5">{showCertModal.productName}</h4>
                <p className="text-[10px] text-slate-600 font-mono">Batch: {showCertModal.batchNo} | Sample: {showCertModal.sampleId}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-500">Test Procedure:</span>
                  <p className="font-bold text-slate-900">{showCertModal.testType}</p>
                </div>
                <div>
                  <span className="text-slate-500">Tested On:</span>
                  <p className="font-mono text-slate-900">{showCertModal.testedOn}</p>
                </div>
                <div>
                  <span className="text-slate-500">Approving Officer:</span>
                  <p className="font-bold text-slate-900">{showCertModal.approvedBy}</p>
                </div>
                <div>
                  <span className="text-slate-500">Result Status:</span>
                  <p className={`font-bold inline-block px-2 py-0.5 rounded text-[10px] ${showCertModal.resultClass}`}>
                    {showCertModal.result}
                  </p>
                </div>
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-amber-200">
                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">Summary Evaluation</span>
                <p className="text-[11px] text-slate-700 italic">
                  "{showCertModal.remarks}"
                </p>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 font-mono">
                <span>DIGITALLY SIGNED VIA PKI</span>
                <span>SECURITY LEVEL: RESTRICTED</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCertModal(null)}
                className="px-4 py-1.5 border border-slate-300 rounded-lg text-slate-700 text-xs font-semibold"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  triggerToast(`Printed report PDF for ${showCertModal.reportNo}`)
                  setShowCertModal(null)
                }}
                className="px-4 py-1.5 bg-[#1F331E] hover:bg-[#2A4428] text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Voucher</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: Verify Certificate (QR Scan) Modal                               */}
      {/* ========================================================================= */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 text-center">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-[#1E3A1E] text-white flex items-center justify-center font-bold text-sm">
                  <QrCode className="w-4 h-4" />
                </span>
                <h3 className="font-bold text-sm text-slate-900">Scan &amp; Verify Certificate QR</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowQRModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scanner Viewport */}
            <div className="relative w-full h-52 bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center border-2 border-dashed border-emerald-500/40">
              <div className="absolute inset-x-8 h-0.5 bg-red-500 shadow-[0_0_8px_#ef4444] animate-bounce"></div>
              <div className="text-center text-slate-400 text-xs space-y-1">
                <Camera className="w-8 h-8 text-emerald-400 mx-auto" />
                <p className="font-semibold text-white">Position certificate QR code in frame</p>
                <p className="text-[10px] text-slate-400">Verifying SHA-256 cryptographic signature</p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
              <input
                type="text"
                placeholder="Or paste QR hash token..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  setShowQRModal(false)
                  triggerToast('Verification SUCCESS: Certificate valid and authentically issued.')
                }}
                className="bg-[#1F331E] hover:bg-[#2A4428] text-white px-4 py-2 rounded-lg text-xs font-bold"
              >
                Verify
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
