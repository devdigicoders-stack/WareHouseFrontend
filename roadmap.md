Indian Army Warehouse Management System – Implementation Roadmap
An enterprise-grade, defense-standard warehouse management and supply depot operating system designed with zero-margin-of-error accounting, end-to-end chain of custody, air-gapped terminal security, and automated QR-driven inward/outward workflows.

User Review Required
IMPORTANT

Key Architecture Decisions:

Authentication Mode: Single-operator terminal mode with dual authentication — 6-digit secure PIN and Hardware USB Token (encrypted keyfile/hardware token handshake).
Base Unit Accounting Principle: Inventory is strictly recorded and depleted at the minimum base unit (e.g. 1 Piece / Packet), while packaging units (e.g. 1 Gatta = 6 Pieces) serve as handling and physical QR labeling units.
Gatekeeper Security (Zero Bypass): No item can be placed in active stock without Lab Test = "Passed". No item can be checked out if expired or unapproved.
Open Questions
NOTE

Backend Integration Preference: Should we build a self-contained local storage / mock backend first for immediate interactive testing in the browser, and then connect to Node.js/Express SQLite/PostgreSQL, or build both simultaneously?
Camera / Barcode Hardware: Will warehouse operators use standard USB handheld 2D barcode/QR scanners (which simulate keyboard keystrokes), or device camera scanning, or both? (We will support both by default).
Shade Dimensions: Does each of the 6 Shades have a fixed number of Rows and Columns (e.g., 10 Rows × 10 Columns = 100 slots per shade), or should each Shade's grid size be dynamically configurable?
Implementation Phases & Roadmap
Phase 1: Security & Terminal Auth (PIN + USB)
Phase 2: Master Data & Nomenclature
Phase 3: Gate Entry & Inward Logistics
Phase 4: GRN & Base-Unit Math Engine
Phase 5: Serialized QR & Label Engine
Phase 6: Lab Testing & Quality Quarantine
Phase 7: 6-Shade 3D Grid & Put-Away
Phase 8: Expiry Tracker & FEFO Enforcement
Phase 9: High-Speed QR Checkout Engine
Phase 10: Military Audit Trail & Reports
Phase 1: Security, Terminal Auth & Session Guard
PIN Authentication: 6-digit hardened master terminal PIN with anti-brute force lockout and session timeout.
Hardware USB Pendrive Token: Cryptographic key verification for authorized USB drives.
Audit Logger: Track every login, failed attempt, and logout with precision millisecond timestamps.
Phase 2: Master Data & Nomenclature Management
Product & Nomenclature Master: Item Name, Military SKU / Part No, Category (Rations, Equipment, Medical, Spares, Uniforms).
Unit Hierarchy: Base Unit (Piece/Tin/Kg) vs Packaging Unit (Gatta/Carton/Crate/Bag) with auto-conversion factors.
Warehouse Architecture: Setup for 6 Shades (Shade 1 to Shade 6) with customizable Row × Column matrix and capacity limits.
Suppliers & Military Depots Directory: Authorized units, suppliers, and contractor registry.
Phase 3: Gate Entry & Inward Logistics
Gate Inward Console:
Vehicle / Convoy Registration Number
Driver Name, Contact, Army Gate Pass / Identity
Source Supplier / Depot & Delivery Challan / Issue Voucher Number
Timestamped Inward Gate Pass generation
Vehicle Status Tracking: At Gate ➔ At Unloading Bay ➔ Cleared.
Phase 4: Goods Receipt Note (GRN) & Base-Unit Math Engine
GRN Generator: Standard format (GRN-YYYY-XXXXXX).
Tally & Conversion: Input packaging units (e.g., 100 Gatta) ➔ system automatically credits base units (600 Pieces).
Batch Registry: Batch/Lot allocation, Manufacturing Date, Expiry Date.
Discrepancy & Transit Damage Recording: Broken/damaged items logged immediately at arrival.
Phase 5: Serialized QR Code & Physical Label Printing
Unique Hash Generator: Unique tamper-proof QR code per physical carton/gatta.
Embedded QR Payload: Item Code, Batch No, GRN ID, Pack Qty, Expiry Date, Serial Hash.
Label Formatter: 4×2 and 4×3 inch thermal sticker printer layout ready with clear human-readable typography + 2D QR.
Batch Print Queue: 1-click print for entire truckloads.
Phase 6: Lab Testing & Quality Assurance (QA/QC Hold)
Mandatory Quarantine: Newly arrived stock starts in Pending Lab Test status.
Testing Lifecycle: Pending Sampling ➔ Sent to Lab ➔ Under Testing ➔ Approved (Passed) / Rejected (Failed) / Hold.
Enforcement Rule: Only Approved batches unlock for Put-Away. Rejected stock auto-diverts to Isolation/Return logs.
Phase 7: 6-Shade Visual Grid & Put-Away (Check-In)
Interactive Shade Matrix: Visual color-coded grid for Shade 1 through 6:
🟢 Vacant slot
🔵 Occupied / Valid stock
🟡 Near Expiry warning
🔴 Full / Quarantined
Put-Away Assistant: Scan carton QR ➔ System recommends optimal slot (Shade 3 ➔ Row 5 ➔ Column 7) ➔ Scan location to confirm.
Phase 8: Expiry Management & FEFO Engine
3-Tier Expiry Monitor:
Safe Stock (>90 Days)
Expiring Soon Alert (30–90 Days) — Prioritized for next issue under FEFO (First Expired, First Out)
Critical Expiry (<30 Days)
Expired Stock (Auto-lockout: completely disables checkout)
Condemnation & Disposal Log: Formal audit-ready write-off register for life-expired stock.
Phase 9: High-Speed QR Scan Checkout & Dispatch
Outward Demand / Indent: Target Military Unit / Battalion, Required Items.
1-Second Verification Engine:
Scan carton QR code.
Automated checks:
Authenticity check: Does QR exist in system?
Lab status: Is it Passed?
Expiry check: Is current date < Expiry Date?
Location validation: Is it being pulled from registered slot?
Automatic Stock Depletion: Stock decremented at Base Unit level.
Gate Outward Clearance: Gate Pass generated for outbound vehicle.
Phase 10: Military Audit Trail, Daily Ledgers & Reports
Daily Stock Ledger (Army Form compliant): Opening Balance + Receipts - Issues = Closing Balance.
Inward / Outward Registers: Filterable by date, batch, supplier, or recipient unit.
Shade Occupancy & Heatmap: Real-time space utilization statistics.
Tamper-Proof Audit Trail: Permanent timestamped log of every single scan, click, check-in, and checkout.
Export Engine: 1-Click PDF & Excel export for official documentation.
Proposed Changes (Frontend Modules)
[NEW] Security & Auth
[NEW] 
src/components/auth/PinLoginModal.jsx
[NEW] 
src/components/auth/UsbTokenModal.jsx
[NEW] Gate & Inward Management
[NEW] 
src/pages/GateEntry.jsx
[NEW] 
src/pages/GoodsReceiving.jsx
[NEW] Lab Testing & Quality Control
[NEW] 
src/pages/LabTesting.jsx
[NEW] Warehouse 6-Shade Visual Grid
[NEW] 
src/pages/WarehouseShades.jsx
[NEW] 
src/components/warehouse/ShadeGrid.jsx
[NEW] 
src/pages/PutAwayCheckIn.jsx
[NEW] Inventory, Expiry & QR Checkout
[NEW] 
src/pages/InventoryStock.jsx
[NEW] 
src/pages/ExpiryMonitor.jsx
[NEW] 
src/pages/QrCheckout.jsx
[NEW] 
src/components/qr/QrLabelGenerator.jsx
[NEW] 
src/components/qr/QrScannerModal.jsx
[NEW] Reports & Audit
[NEW] 
src/pages/ReportsAudit.jsx
Verification Plan
Automated Verification
npm run lint: Zero ESLint warnings/errors across all modules.
npm run build: Clean production bundle compilation with Vite and Tailwind CSS.
Functional Verification
PIN / USB Token Verification: Test invalid vs valid PIN entry and token simulation.
Unit Conversion Math: Verify 100 Gatta * 6 = 600 Pieces accurately reflected across all tables.
Lab Hold Gatekeeper: Confirm that an item in Pending or Under Testing CANNOT be checked out.
Expiry Auto-Lock: Inject an expired batch and verify that the checkout scanner strictly rejects it with an alert.
Put-Away Matrix: Test clicking/scanning slots in Shade 1 through 6 and ensuring real-time state updates.