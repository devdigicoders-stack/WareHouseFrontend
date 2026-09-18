import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Eye, FileCheck, Search, FileText, PenTool, Check, FlaskConical, Printer, FileSpreadsheet, Settings, Microscope, Package, X, Award, Download, Upload } from 'lucide-react'

export default function LabTesting() {
  // Toast state
  const [toastMessage, setToastMessage] = useState(null)
  const triggerToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Active Tab
  const [activeTab, setActiveTab] = useState('All Samples (342)')

  // Filter toolbar state
  const [filterStatus, setFilterStatus] = useState('All Status')
  const [filterProduct, setFilterProduct] = useState('All Products')
  const [filterTestType, setFilterTestType] = useState('All Tests')
  const [searchQuery, setSearchQuery] = useState('')

  // Modals state
  const [showNewTestModal, setShowNewTestModal] = useState(false)
  const [showCertModal, setShowCertModal] = useState(null)
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [showParamModal, setShowParamModal] = useState(false)
  const [activeActionRow, setActiveActionRow] = useState(null)

  // New Test Request Form state
  const [newTest, setNewTest] = useState({
    productName: '7.62mm Ammunition Box',
    batchNo: 'BT-2026-001',
    testType: 'Physical Test',
    sampleDate: '16 Sep 2026',
    expectedDate: '18 Sep 2026',
    technician: 'Lt. S. Chauhan',
    sampleQty: '5',
    remarks: 'Pre-dispatch ballistic and casing integrity test',
  })

  // Lab Samples Table Data (Exact match with screenshot)
  const [samplesData, setSamplesData] = useState([
    {
      id: 1,
      sampleId: 'LBT-2026-001',
      batchNo: 'BT-2026-001',
      productName: '7.62mm Ammunition Box',
      testType: 'Physical Test',
      sampleDate: '14 Sep 2026',
      expectedDate: '16 Sep 2026',
      status: 'Completed',
      statusClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      result: 'Pass',
      resultClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      testedBy: 'Lt. S. Chauhan',
      remarks: 'All parameters within acceptable limits.',
    },
    {
      id: 2,
      sampleId: 'LBT-2026-002',
      batchNo: 'BT-2026-002',
      productName: 'Combat Boots',
      testType: 'Material Test',
      sampleDate: '14 Sep 2026',
      expectedDate: '17 Sep 2026',
      status: 'In Progress',
      statusClass: 'bg-amber-100 text-amber-800 border-amber-200',
      result: '-',
      resultClass: 'text-slate-400 font-semibold',
      testedBy: 'Hav. P. Kumar',
      remarks: 'Tensile and water resistance test in progress.',
    },
    {
      id: 3,
      sampleId: 'LBT-2026-003',
      batchNo: 'BT-2026-003',
      productName: 'First Aid Kit',
      testType: 'Chemical Test',
      sampleDate: '13 Sep 2026',
      expectedDate: '15 Sep 2026',
      status: 'Completed',
      statusClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      result: 'Pass',
      resultClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      testedBy: 'Cpl. A. Yadav',
      remarks: 'Sterilization and chemical expiry validated.',
    },
    {
      id: 4,
      sampleId: 'LBT-2026-004',
      batchNo: 'BT-2026-004',
      productName: 'Engine Oil 15W-40',
      testType: 'Viscosity Test',
      sampleDate: '13 Sep 2026',
      expectedDate: '15 Sep 2026',
      status: 'Completed',
      statusClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      result: 'Pass',
      resultClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      testedBy: 'Lt. S. Chauhan',
      remarks: 'Viscosity index 142. Standard compliant.',
    },
    {
      id: 5,
      sampleId: 'LBT-2026-005',
      batchNo: 'BT-2026-005',
      productName: 'VHF Radio Set',
      testType: 'Functional Test',
      sampleDate: '12 Sep 2026',
      expectedDate: '16 Sep 2026',
      status: 'Failed',
      statusClass: 'bg-rose-100 text-rose-800 border-rose-200',
      result: 'Fail',
      resultClass: 'bg-rose-100 text-rose-800 border-rose-200',
      testedBy: 'Nk. S. Mehta',
      remarks: 'Transceiver circuit impedance mismatch on 72MHz band.',
    },
    {
      id: 6,
      sampleId: 'LBT-2026-006',
      batchNo: 'BT-2026-006',
      productName: 'Medical Gloves',
      testType: 'Sterility Test',
      sampleDate: '12 Sep 2026',
      expectedDate: '15 Sep 2026',
      status: 'Completed',
      statusClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      result: 'Pass',
      resultClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      testedBy: 'Cpl. D. Verma',
      remarks: 'Zero microbial contamination detected.',
    },
    {
      id: 7,
      sampleId: 'LBT-2026-007',
      batchNo: 'BT-2026-007',
      productName: 'Field Tent',
      testType: 'Durability Test',
      sampleDate: '11 Sep 2026',
      expectedDate: '14 Sep 2026',
      status: 'In Progress',
      statusClass: 'bg-amber-100 text-amber-800 border-amber-200',
      result: '-',
      resultClass: 'text-slate-400 font-semibold',
      testedBy: 'Nk. R. Singh',
      remarks: 'Wind tunnel and waterproofing testing active.',
    },
    {
      id: 8,
      sampleId: 'LBT-2026-008',
      batchNo: 'BT-2026-008',
      productName: 'Water Purification Tablet',
      testType: 'Chemical Test',
      sampleDate: '11 Sep 2026',
      expectedDate: '13 Sep 2026',
      status: 'Completed',
      statusClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      result: 'Pass',
      resultClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      testedBy: 'Hav. P. Kumar',
      remarks: 'Active chlorine concentration meets DRDO specs.',
    },
    {
      id: 9,
      sampleId: 'LBT-2026-009',
      batchNo: 'BT-2026-009',
      productName: 'Solar Lantern',
      testType: 'Battery Test',
      sampleDate: '10 Sep 2026',
      expectedDate: '14 Sep 2026',
      status: 'Failed',
      statusClass: 'bg-rose-100 text-rose-800 border-rose-200',
      result: 'Fail',
      resultClass: 'bg-rose-100 text-rose-800 border-rose-200',
      testedBy: 'Cpl. A. Yadav',
      remarks: 'LiFePO4 battery pack capacity 28% below rated 4000mAh.',
    },
    {
      id: 10,
      sampleId: 'LBT-2026-010',
      batchNo: 'BT-2026-010',
      productName: 'Ration Pack',
      testType: 'Nutritional Test',
      sampleDate: '10 Sep 2026',
      expectedDate: '13 Sep 2026',
      status: 'Completed',
      statusClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      result: 'Pass',
      resultClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      testedBy: 'Lt. S. Chauhan',
      remarks: 'Calorie count 4,100 kcal. Packaging hermetic seal intact.',
    },
  ])

  // Selected sample for preview in right column
  const [selectedSample, setSelectedSample] = useState(samplesData[0])

  // Filtered rows
  const filteredRows = useMemo(() => {
    return samplesData.filter((row) => {
      // Tab filter
      if (activeTab === 'Pending (20)' && row.status !== 'Pending') return false
      if (activeTab === 'In Progress (18)' && row.status !== 'In Progress') return false
      if (activeTab === 'Passed (298)' && row.result !== 'Pass') return false
      if (activeTab === 'Failed (24)' && row.result !== 'Fail') return false

      // Status filter
      if (filterStatus !== 'All Status' && row.status !== filterStatus) return false

      // Product filter
      if (filterProduct !== 'All Products' && row.productName !== filterProduct) return false

      // Test type filter
      if (filterTestType !== 'All Tests' && row.testType !== filterTestType) return false

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matches =
          row.sampleId.toLowerCase().includes(q) ||
          row.batchNo.toLowerCase().includes(q) ||
          row.productName.toLowerCase().includes(q) ||
          row.testType.toLowerCase().includes(q)
        if (!matches) return false
      }

      return true
    })
  }, [samplesData, activeTab, filterStatus, filterProduct, filterTestType, searchQuery])

  // Apply filter
  const handleApplyFilter = () => {
    triggerToast('Filters applied to laboratory samples.')
  }

  // Reset filter
  const handleResetFilter = () => {
    setFilterStatus('All Status')
    setFilterProduct('All Products')
    setFilterTestType('All Tests')
    setSearchQuery('')
    setActiveTab('All Samples (342)')
    triggerToast('All test filters have been reset.')
  }

  // Create Test Request Handler
  const handleCreateTestRequest = (e) => {
    e.preventDefault()
    const newId = samplesData.length + 1
    const sId = `LBT-2026-${String(newId).padStart(3, '0')}`

    const newRecord = {
      id: newId,
      sampleId: sId,
      batchNo: newTest.batchNo,
      productName: newTest.productName,
      testType: newTest.testType,
      sampleDate: newTest.sampleDate,
      expectedDate: newTest.expectedDate,
      status: 'In Progress',
      statusClass: 'bg-amber-100 text-amber-800 border-amber-200',
      result: '-',
      resultClass: 'text-slate-400 font-semibold',
      testedBy: newTest.technician,
      remarks: newTest.remarks,
    }

    setSamplesData([newRecord, ...samplesData])
    setSelectedSample(newRecord)
    setShowNewTestModal(false)
    triggerToast(`New test request ${sId} registered successfully!`)
  }

  // Export CSV
  const handleExportCSV = () => {
    const headers = 'Sample ID,Batch No,Product Name,Test Type,Sample Date,Expected Date,Status,Result,Tested By\n'
    const rows = filteredRows
      .map(
        (r) =>
          `"${r.sampleId}","${r.batchNo}","${r.productName}","${r.testType}","${r.sampleDate}","${r.expectedDate}","${r.status}","${r.result}","${r.testedBy}"`
      )
      .join('\n')
    const blob = new Blob([headers + rows], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Lab_Testing_Report_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    triggerToast('Lab testing report exported successfully!')
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
            QUALITY ASSURANCE ACTIVE
          </div>
          <span className="text-slate-300 text-[11px] font-mono">
            CENTRAL WAREHOUSE LOGISTICS — QC LAB BATCH COMPLIANCE MONITORED
          </span>
        </div>
      </div>

      {/* Page Header: Beaker Icon + Title + Action Button + Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1E3A1E] text-white flex items-center justify-center shadow-md shrink-0">
            {/* Lab Beaker / Flask Icon */}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900 tracking-tight">Lab Testing</h1>
            <p className="text-xs text-slate-500 font-medium">
              Manage quality testing of received and stored items to ensure compliance with standards.
            </p>
          </div>
        </div>

        {/* Right side: Breadcrumbs + New Test Request Button */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 font-medium mr-2">
            <Link to="/dashboard" className="hover:text-slate-700">Home</Link>
            <span>›</span>
            <span className="text-slate-600">Quality &amp; Lab</span>
            <span>›</span>
            <span className="text-slate-900 font-bold">Lab Testing</span>
          </div>

          <button
            type="button"
            onClick={() => setShowNewTestModal(true)}
            className="bg-[#1F331E] hover:bg-[#2A4428] text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer active:scale-98"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Test Request</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5 KPI STAT CARDS (Exact Match with Reference Screenshot)                  */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Total Samples */}
        <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Total Samples</p>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-black text-slate-900 leading-tight">342</h3>
              <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                <span>↑</span> 12%
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">This month</p>
          </div>
        </div>

        {/* Card 2: Passed */}
        <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Passed</p>
            <h3 className="text-xl font-black text-slate-900 leading-tight">298</h3>
            <p className="text-[10px] text-slate-400 font-medium">87.1% of total</p>
          </div>
        </div>

        {/* Card 3: Failed */}
        <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Failed</p>
            <h3 className="text-xl font-black text-slate-900 leading-tight">24</h3>
            <p className="text-[10px] text-slate-400 font-medium">7.0% of total</p>
          </div>
        </div>

        {/* Card 4: In Progress */}
        <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">In Progress</p>
            <h3 className="text-xl font-black text-slate-900 leading-tight">18</h3>
            <p className="text-[10px] text-slate-400 font-medium">5.3% of total</p>
          </div>
        </div>

        {/* Card 5: Awaiting Test */}
        <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Awaiting Test</p>
            <h3 className="text-xl font-black text-slate-900 leading-tight">2</h3>
            <p className="text-[10px] text-slate-400 font-medium">0.6% of total</p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FILTER TOOLBAR CARD (Exact Match with Reference Screenshot)               */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-xl p-3.5 shadow-xs border border-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5 items-end text-xs">
          {/* Test Status */}
          <div className="lg:col-span-2">
            <label className="block text-[10px] font-bold text-slate-600 mb-1">Test Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:bg-white focus:ring-1 focus:ring-emerald-600 cursor-pointer"
            >
              <option value="All Status">All Status</option>
              <option value="Completed">Completed</option>
              <option value="In Progress">In Progress</option>
              <option value="Failed">Failed</option>
            </select>
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
              <option value="7.62mm Ammunition Box">7.62mm Ammunition Box</option>
              <option value="Combat Boots">Combat Boots</option>
              <option value="First Aid Kit">First Aid Kit</option>
              <option value="Engine Oil 15W-40">Engine Oil 15W-40</option>
              <option value="VHF Radio Set">VHF Radio Set</option>
              <option value="Medical Gloves">Medical Gloves</option>
              <option value="Field Tent">Field Tent</option>
              <option value="Water Purification Tablet">Water Purification Tablet</option>
              <option value="Solar Lantern">Solar Lantern</option>
              <option value="Ration Pack">Ration Pack</option>
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
              <option value="All Tests">All Tests</option>
              <option value="Physical Test">Physical Test</option>
              <option value="Chemical Test">Chemical Test</option>
              <option value="Material Test">Material Test</option>
              <option value="Viscosity Test">Viscosity Test</option>
              <option value="Functional Test">Functional Test</option>
              <option value="Sterility Test">Sterility Test</option>
              <option value="Durability Test">Durability Test</option>
              <option value="Battery Test">Battery Test</option>
              <option value="Nutritional Test">Nutritional Test</option>
            </select>
          </div>

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

          {/* Search by Sample ID, Batch No. or Product... */}
          <div className="lg:col-span-2">
            <label className="block text-[10px] font-bold text-slate-600 mb-1">Search</label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Sample ID, Batch No..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-2 py-1.5 text-xs focus:outline-none focus:bg-white focus:ring-1 focus:ring-emerald-600"
              />
            </div>
          </div>

          {/* Action Buttons: Filter & Reset */}
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
        {/* LEFT COLUMN: Lab Samples Table + 3 Lower Widgets (Span 9 / 12)            */}
        {/* ========================================================================= */}
        <div className="lg:col-span-9 space-y-4">
          {/* Table Card */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden flex flex-col">
            {/* Toolbar Tabs + Actions matching screenshot */}
            <div className="p-3 sm:p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {['All Samples (342)', 'Pending (20)', 'In Progress (18)', 'Passed (298)', 'Failed (24)'].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab)
                      triggerToast(`Tab: ${tab}`)
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                      activeTab === tab
                        ? 'bg-[#1E3A1E] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Action Buttons: Export & Print */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="bg-[#1F331E] hover:bg-[#2A4428] text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Export</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="bg-[#1F331E] hover:bg-[#2A4428] text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  <span>Print</span>
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
                    <th className="py-2.5 px-3">Sample ID</th>
                    <th className="py-2.5 px-3">Batch No.</th>
                    <th className="py-2.5 px-3">Product Name</th>
                    <th className="py-2.5 px-3">Test Type</th>
                    <th className="py-2.5 px-3">Sample Date</th>
                    <th className="py-2.5 px-3">Expected Date</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-center">Result</th>
                    <th className="py-2.5 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredRows.map((row, idx) => {
                    const isSelected = selectedSample?.id === row.id
                    return (
                      <tr
                        key={row.id}
                        onClick={() => setSelectedSample(row)}
                        className={`hover:bg-amber-50/30 transition-colors cursor-pointer ${
                          isSelected ? 'bg-amber-50/40' : ''
                        }`}
                      >
                        <td className="py-2.5 px-3 text-center text-slate-400 font-bold text-[11px] whitespace-nowrap">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-800 whitespace-nowrap">
                          {row.sampleId}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-semibold text-slate-700 text-[11px] whitespace-nowrap">
                          {row.batchNo}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900 whitespace-nowrap">
                          {row.productName}
                        </td>
                        <td className="py-2.5 px-3 text-slate-700 font-medium whitespace-nowrap">
                          {row.testType}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-500 whitespace-nowrap">
                          {row.sampleDate}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-500 whitespace-nowrap">
                          {row.expectedDate}
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${row.statusClass}`}>
                            {row.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          {row.result === '-' ? (
                            <span className="text-slate-400 font-bold">-</span>
                          ) : (
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${row.resultClass}`}>
                              {row.result}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap relative" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1.5">
                            {/* View Details Eye Icon */}
                            <button
                              type="button"
                              onClick={() => setSelectedSample(row)}
                              className="w-6 h-6 rounded hover:bg-slate-100 flex items-center justify-center text-slate-600 transition"
                              title="View Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Certificate Icon */}
                            <button
                              type="button"
                              onClick={() => setShowCertModal(row)}
                              className="w-6 h-6 rounded hover:bg-slate-100 flex items-center justify-center text-slate-600 transition"
                              title="View Certificate"
                            >
                              <FileCheck className="w-3.5 h-3.5" />
                            </button>

                            {/* Actions Dropdown ••• */}
                            <button
                              type="button"
                              onClick={() => setActiveActionRow(activeActionRow === row.id ? null : row.id)}
                              className="w-6 h-6 rounded hover:bg-slate-100 flex items-center justify-center text-slate-500 font-bold tracking-widest transition"
                              title="More Options"
                            >
                              •••
                            </button>
                          </div>

                          {/* Dropdown Menu */}
                          {activeActionRow === row.id && (
                            <div className="absolute right-2 top-8 z-30 bg-white border border-slate-200 rounded-lg shadow-xl py-1 w-40 text-left text-xs animate-in fade-in zoom-in-95">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedSample(row)
                                  setActiveActionRow(null)
                                }}
                                className="w-full px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                              >
                                <Search className="w-3.5 h-3.5 text-slate-500" />
                                <span>View Full Specs</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setShowCertModal(row)
                                  setActiveActionRow(null)
                                }}
                                className="w-full px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                              >
                                <FileText className="w-3.5 h-3.5 text-slate-500" />
                                <span>Quality Certificate</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  triggerToast(`Enter Results opened for ${row.sampleId}`)
                                  setActiveActionRow(null)
                                }}
                                className="w-full px-3 py-1.5 hover:bg-emerald-50 flex items-center gap-2 text-emerald-800 font-semibold"
                              >
                                <PenTool className="w-3.5 h-3.5 text-emerald-800" />
                                <span>Enter Test Result</span>
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer matching screenshot */}
            <div className="p-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 font-medium">
              <p>Showing 1 to {filteredRows.length} of 342 samples</p>
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
                  35
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
            {/* WIDGET 1: Test Result Distribution (SVG Donut Chart) */}
            <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                  </svg>
                  <h2 className="text-xs font-bold text-slate-800">Test Result Distribution</h2>
                </div>

                <div className="pt-3 flex flex-col items-center">
                  <div className="relative w-36 h-36 flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                      <circle cx="50" cy="50" r="38" fill="none" stroke="#F1F5F9" strokeWidth="15" />

                      {/* Passed: 87.1% -> 208 of 238.7 circumference */}
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="none"
                        stroke="#10B981"
                        strokeWidth="14"
                        strokeDasharray="208 238.7"
                        strokeDashoffset="0"
                      />
                      {/* Failed: 7.0% -> 16.7 */}
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="none"
                        stroke="#EF4444"
                        strokeWidth="14"
                        strokeDasharray="16.7 238.7"
                        strokeDashoffset="-208"
                      />
                      {/* In Progress: 5.3% -> 12.6 */}
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="none"
                        stroke="#F59E0B"
                        strokeWidth="14"
                        strokeDasharray="12.6 238.7"
                        strokeDashoffset="-224.7"
                      />
                      {/* Awaiting: 0.6% -> 1.4 */}
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="none"
                        stroke="#8B5CF6"
                        strokeWidth="14"
                        strokeDasharray="1.4 238.7"
                        strokeDashoffset="-237.3"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-xl font-black text-slate-900 font-mono leading-none">342</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase mt-1">Samples</span>
                    </div>
                  </div>

                  {/* Legend matching screenshot */}
                  <div className="w-full pt-3 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500"></span>
                        <span className="text-slate-700 font-medium">Passed</span>
                      </div>
                      <span className="font-mono font-bold text-slate-800">298 (87.1%)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-xs bg-rose-500"></span>
                        <span className="text-slate-700 font-medium">Failed</span>
                      </div>
                      <span className="font-mono font-bold text-slate-800">24 (7.0%)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-xs bg-amber-500"></span>
                        <span className="text-slate-700 font-medium">In Progress</span>
                      </div>
                      <span className="font-mono font-bold text-slate-800">18 (5.3%)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-xs bg-purple-500"></span>
                        <span className="text-slate-700 font-medium">Awaiting</span>
                      </div>
                      <span className="font-mono font-bold text-slate-800">2 (0.6%)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* WIDGET 2: Tests by Type (This Month) */}
            <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <h2 className="text-xs font-bold text-slate-800">Tests by Type (This Month)</h2>
                </div>

                <div className="pt-3 space-y-3">
                  {/* Item 1 */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400 font-bold text-[10px]">1.</span>
                        <span className="text-slate-800 font-medium">Physical Test</span>
                      </div>
                      <span className="font-mono font-bold text-slate-900">96</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-emerald-700 h-2 rounded-full" style={{ width: '82%' }}></div>
                    </div>
                  </div>

                  {/* Item 2 */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400 font-bold text-[10px]">2.</span>
                        <span className="text-slate-800 font-medium">Chemical Test</span>
                      </div>
                      <span className="font-mono font-bold text-slate-900">72</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                    </div>
                  </div>

                  {/* Item 3 */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400 font-bold text-[10px]">3.</span>
                        <span className="text-slate-800 font-medium">Material Test</span>
                      </div>
                      <span className="font-mono font-bold text-slate-900">58</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '52%' }}></div>
                    </div>
                  </div>

                  {/* Item 4 */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400 font-bold text-[10px]">4.</span>
                        <span className="text-slate-800 font-medium">Functional Test</span>
                      </div>
                      <span className="font-mono font-bold text-slate-900">46</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-amber-500 h-2 rounded-full" style={{ width: '40%' }}></div>
                    </div>
                  </div>

                  {/* Item 5 */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400 font-bold text-[10px]">5.</span>
                        <span className="text-slate-800 font-medium">Durability Test</span>
                      </div>
                      <span className="font-mono font-bold text-slate-900">38</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-teal-600 h-2 rounded-full" style={{ width: '32%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* WIDGET 3: Lab Testing Process */}
            <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <h2 className="text-xs font-bold text-slate-800">Lab Testing Process</h2>
                </div>

                <div className="pt-3 space-y-2.5 text-xs">
                  {/* Step 1 */}
                  <div className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0 mt-0.5">
                      <Check className="w-3 h-3" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 leading-tight">1. Sample Collection</p>
                      <p className="text-[10.5px] text-slate-500">Collect sample from received batch</p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0 mt-0.5">
                      <Check className="w-3 h-3" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 leading-tight">2. Testing</p>
                      <p className="text-[10.5px] text-slate-500">Perform required tests as per standard</p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0 mt-0.5">
                      <Check className="w-3 h-3" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 leading-tight">3. Result Entry</p>
                      <p className="text-[10.5px] text-slate-500">Record test results and observations</p>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0 mt-0.5">
                      <Check className="w-3 h-3" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 leading-tight">4. Approval</p>
                      <p className="text-[10.5px] text-slate-500">Authorize and generate test report</p>
                    </div>
                  </div>

                  {/* Step 5 */}
                  <div className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0 mt-0.5">
                      <Check className="w-3 h-3" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 leading-tight">5. Release / Hold</p>
                      <p className="text-[10.5px] text-slate-500">Approve for storage or mark as rejected</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: Quick Actions + Sample Details Preview (Span 3 / 12)        */}
        {/* ========================================================================= */}
        <div className="lg:col-span-3 space-y-4">
          {/* CARD 1: Quick Actions */}
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
                onClick={() => setShowNewTestModal(true)}
                className="w-full bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2.5 transition cursor-pointer"
              >
                <Plus className="w-4 h-4 text-emerald-700" />
                <span>New Test Request</span>
              </button>

              <button
                type="button"
                onClick={() => triggerToast('Sample Collection module initiated for quarantine bay.')}
                className="w-full bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2.5 transition cursor-pointer"
              >
                <FlaskConical className="w-4 h-4 text-blue-600" />
                <span>Sample Collection</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="w-full bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2.5 transition cursor-pointer"
              >
                <Printer className="w-4 h-4 text-amber-600" />
                <span>Print Test Report</span>
              </button>

              <button
                type="button"
                onClick={() => setShowCertModal(selectedSample)}
                className="w-full bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2.5 transition cursor-pointer"
              >
                <FileText className="w-4 h-4 text-purple-600" />
                <span>Download Certificate</span>
              </button>

              <button
                type="button"
                onClick={() => setShowBulkModal(true)}
                className="w-full bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2.5 transition cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-teal-600" />
                <span>Bulk Test Entry (Excel)</span>
              </button>

              <button
                type="button"
                onClick={() => setShowParamModal(true)}
                className="w-full bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2.5 transition cursor-pointer"
              >
                <Settings className="w-4 h-4 text-slate-600" />
                <span>Test Parameter Master</span>
              </button>

              <button
                type="button"
                onClick={() => triggerToast('Lab Equipment Calibration registry: 18 devices active, 1 due.')}
                className="w-full bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2.5 transition cursor-pointer"
              >
                <Microscope className="w-4 h-4 text-indigo-600" />
                <span>Lab Equipment Master</span>
              </button>
            </div>
          </div>

          {/* CARD 2: Sample Details Preview matching screenshot */}
          <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h2 className="text-xs font-bold text-slate-800">Sample Details</h2>
              </div>
              <button
                type="button"
                onClick={() => triggerToast(`Viewing comprehensive specs for ${selectedSample.sampleId}`)}
                className="text-[11px] font-bold text-emerald-800 hover:text-emerald-900 cursor-pointer"
              >
                View Full Details →
              </button>
            </div>

            {/* Container image graphic + details */}
            <div className="pt-3">
              {/* Ammo box graphic badge */}
              <div className="w-full h-24 bg-gradient-to-br from-[#1C2C1A] to-[#142013] rounded-xl flex items-center justify-center p-2 mb-3 shadow-inner border border-[#2B3E29]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-amber-600/20 border border-amber-500/40 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-widest">
                      MIL-STD QA BATCH
                    </span>
                    <h4 className="text-white text-xs font-bold leading-tight">{selectedSample.productName}</h4>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{selectedSample.batchNo}</p>
                  </div>
                </div>
              </div>

              {/* Specs Table */}
              <div className="space-y-2 text-xs divide-y divide-slate-100">
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Sample ID:</span>
                  <span className="font-mono font-bold text-slate-900">{selectedSample.sampleId}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Product:</span>
                  <span className="font-semibold text-slate-900 text-right">{selectedSample.productName}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Batch No.:</span>
                  <span className="font-mono font-bold text-slate-800">{selectedSample.batchNo}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Test Type:</span>
                  <span className="font-semibold text-slate-800">{selectedSample.testType}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Sample Date:</span>
                  <span className="font-mono text-slate-700">{selectedSample.sampleDate}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Expected Date:</span>
                  <span className="font-mono text-slate-700">{selectedSample.expectedDate}</span>
                </div>
                <div className="flex justify-between py-1 items-center">
                  <span className="text-slate-500">Status:</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${selectedSample.statusClass}`}>
                    {selectedSample.status}
                  </span>
                </div>
                <div className="flex justify-between py-1 items-center">
                  <span className="text-slate-500">Result:</span>
                  {selectedSample.result === '-' ? (
                    <span className="text-slate-400 font-bold">-</span>
                  ) : (
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${selectedSample.resultClass}`}>
                      {selectedSample.result}
                    </span>
                  )}
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Tested By:</span>
                  <span className="font-bold text-slate-800">{selectedSample.testedBy}</span>
                </div>
                <div className="py-1">
                  <span className="text-slate-500 block mb-0.5">Remarks:</span>
                  <p className="text-[11px] text-slate-700 bg-slate-50 p-2 rounded border border-slate-100 italic">
                    "{selectedSample.remarks}"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: New Test Request Modal                                           */}
      {/* ========================================================================= */}
      {showNewTestModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-[#1E3A1E] text-white flex items-center justify-center font-bold text-sm">
                  <Plus className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">New Laboratory Test Request</h3>
                  <p className="text-[11px] text-slate-500">Send sample for chemical, physical, or material analysis</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowNewTestModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTestRequest} className="pt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Product <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newTest.productName}
                    onChange={(e) => setNewTest({ ...newTest, productName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:outline-none focus:bg-white focus:ring-1 focus:ring-emerald-600"
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
                    Batch No. <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newTest.batchNo}
                    onChange={(e) => setNewTest({ ...newTest, batchNo: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono font-bold focus:outline-none focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Test Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newTest.testType}
                    onChange={(e) => setNewTest({ ...newTest, testType: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:outline-none focus:bg-white focus:ring-1 focus:ring-emerald-600"
                  >
                    <option value="Physical Test">Physical Test</option>
                    <option value="Chemical Test">Chemical Test</option>
                    <option value="Material Test">Material Test</option>
                    <option value="Viscosity Test">Viscosity Test</option>
                    <option value="Functional Test">Functional Test</option>
                    <option value="Sterility Test">Sterility Test</option>
                    <option value="Durability Test">Durability Test</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Sample Quantity <span className="text-red-500">*</span>
                  </label>
                  <div className="flex">
                    <input
                      type="number"
                      value={newTest.sampleQty}
                      onChange={(e) => setNewTest({ ...newTest, sampleQty: e.target.value })}
                      className="w-full bg-slate-50 border border-r-0 border-slate-200 rounded-l-lg p-2 text-xs font-mono font-bold focus:outline-none"
                    />
                    <span className="bg-slate-100 border border-slate-200 rounded-r-lg px-2.5 py-2 text-xs font-semibold text-slate-600">
                      Units
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Sample Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newTest.sampleDate}
                    onChange={(e) => setNewTest({ ...newTest, sampleDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Expected Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newTest.expectedDate}
                    onChange={(e) => setNewTest({ ...newTest, expectedDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Assigned QA Technician
                </label>
                <input
                  type="text"
                  value={newTest.technician}
                  onChange={(e) => setNewTest({ ...newTest, technician: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Test Objectives &amp; Remarks
                </label>
                <textarea
                  rows={2}
                  value={newTest.remarks}
                  onChange={(e) => setNewTest({ ...newTest, remarks: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none resize-none"
                ></textarea>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewTestModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1F331E] hover:bg-[#2A4428] text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Submit Test Request</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: Quality Certificate Modal                                        */}
      {/* ========================================================================= */}
      {showCertModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-600" />
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Certificate of Quality Assurance</h3>
                  <p className="text-[10px] text-slate-500 font-mono">CENTRAL WAREHOUSE QC — LAB/2026/{showCertModal.sampleId}</p>
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

            {/* Certificate Body */}
            <div className="p-4 bg-amber-50/40 rounded-xl border border-amber-200/80 space-y-3 text-xs">
              <div className="text-center pb-2 border-b border-amber-200/60">
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-900">
                  DEFENCE QUALITY ASSURANCE DIRECTORATE
                </p>
                <h4 className="font-black text-sm text-slate-900 mt-0.5">{showCertModal.productName}</h4>
                <p className="text-[10px] text-slate-600 font-mono">Batch: {showCertModal.batchNo}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-500">Sample Reference:</span>
                  <p className="font-mono font-bold text-slate-900">{showCertModal.sampleId}</p>
                </div>
                <div>
                  <span className="text-slate-500">Test Procedure:</span>
                  <p className="font-bold text-slate-900">{showCertModal.testType}</p>
                </div>
                <div>
                  <span className="text-slate-500">Evaluation Date:</span>
                  <p className="font-mono text-slate-800">{showCertModal.expectedDate}</p>
                </div>
                <div>
                  <span className="text-slate-500">Inspection Officer:</span>
                  <p className="font-bold text-slate-900">{showCertModal.testedBy}</p>
                </div>
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-amber-200 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-500">Final QC Status</span>
                <p className="text-base font-black text-emerald-700 tracking-wider">
                  {showCertModal.result === 'Pass' ? 'VERIFIED & APPROVED' : 'DEFECT DETECTED / REJECTED'}
                </p>
              </div>

              <p className="text-[10px] text-slate-600 italic leading-snug">
                This document certifies that the aforementioned ordnance lot has undergone rigorous inspection as per Indian Armed Forces quality standards.
              </p>
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
                  triggerToast(`Certificate PDF downloaded for ${showCertModal.sampleId}`)
                  setShowCertModal(null)
                }}
                className="px-4 py-1.5 bg-[#1F331E] hover:bg-[#2A4428] text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: Bulk Test Entry Modal                                            */}
      {/* ========================================================================= */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 text-center">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-[#1E3A1E] text-white flex items-center justify-center font-bold text-sm">
                  <FileSpreadsheet className="w-4 h-4" />
                </span>
                <h3 className="font-bold text-sm text-slate-900">Bulk Test Results Upload</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowBulkModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 bg-slate-50 hover:bg-slate-100/70 transition cursor-pointer flex flex-col items-center justify-center gap-2">
              <Upload className="w-8 h-8 text-slate-400" />
              <p className="text-xs font-bold text-slate-700">Drag and drop Lab Results file here</p>
              <p className="text-[11px] text-slate-500">Supports .xlsx, .csv formatted templates</p>
              <button
                type="button"
                className="mt-2 text-xs font-bold text-emerald-800 underline"
                onClick={() => triggerToast('Standard Lab Results Excel template downloaded.')}
              >
                Download Test Template
              </button>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowBulkModal(false)}
                className="px-4 py-1.5 border border-slate-300 rounded-lg text-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowBulkModal(false)
                  triggerToast('28 test observations processed successfully!')
                }}
                className="px-5 py-1.5 bg-[#1F331E] hover:bg-[#2A4428] text-white rounded-lg text-xs font-bold"
              >
                Upload File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: Test Parameter Master Modal                                      */}
      {/* ========================================================================= */}
      {showParamModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-[#1E3A1E] text-white flex items-center justify-center font-bold text-sm">
                  <Settings className="w-4 h-4" />
                </span>
                <h3 className="font-bold text-sm text-slate-900">QC Test Parameter Thresholds</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowParamModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs max-h-80 overflow-y-auto pr-1">
              <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">Ballistic Pressure (7.62mm)</p>
                  <p className="text-[10px] text-slate-500">Range: 3,200 - 3,550 bar</p>
                </div>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">Active</span>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">Leather Sole Tensile Strength</p>
                  <p className="text-[10px] text-slate-500">Min 20 N/mm²</p>
                </div>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">Active</span>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">Engine Oil Kinematic Viscosity</p>
                  <p className="text-[10px] text-slate-500">12.5 - 16.3 cSt at 100°C</p>
                </div>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">Active</span>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">Water Purification Chlorine Dissolution</p>
                  <p className="text-[10px] text-slate-500">&gt; 98% in 30 minutes</p>
                </div>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">Active</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setShowParamModal(false)}
                className="px-4 py-1.5 bg-[#1F331E] hover:bg-[#2A4428] text-white rounded-lg text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
