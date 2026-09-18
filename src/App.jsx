import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { AppProvider } from './context/AppProvider'
import { useApp } from './hooks/useApp'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import GateEntry from './pages/GateEntry'
import GatePass from './pages/GatePass'
import VehicleQueue from './pages/VehicleQueue'
import VisitorManagement from './pages/VisitorManagement'
import GoodsReceiving from './pages/GoodsReceiving'
import ProductEntry from './pages/ProductEntry'
import BatchManagement from './pages/BatchManagement'
import LabelGeneration from './pages/LabelGeneration'
import LocationMaster from './pages/LocationMaster'
import ShadeManagement from './pages/ShadeManagement'
import PutAwayCheckIn from './pages/PutAwayCheckIn'
import StockMovement from './pages/StockMovement'
import LabTesting from './pages/LabTesting'
import LabReports from './pages/LabReports'
import CurrentStock from './pages/CurrentStock'
import StockSearch from './pages/StockSearch'
import StockAdjustment from './pages/StockAdjustment'
import DamageRejection from './pages/DamageRejection'
import HoldStock from './pages/HoldStock'
import IssueDispatch from './pages/IssueDispatch'
import CheckoutQR from './pages/CheckoutQR'
import GatePassOut from './pages/GatePassOut'
import Reports from './pages/Reports'
import Analytics from './pages/Analytics'
import ExportReports from './pages/ExportReports'
import Settings from './pages/Settings'
import LoginPage from './pages/LoginPage'

function ProtectedRoute({ children }) {
  const { user } = useApp()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Layout>{children}</Layout>
}

function LoginRoute() {
  const { user, setUser } = useApp()
  const navigate = useNavigate()

  const handleLoginSuccess = (userData) => {
    setUser(userData)
    navigate('/dashboard', { replace: true })
  }

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return <LoginPage onLoginSuccess={handleLoginSuccess} />
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginRoute />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/gate-entry"
            element={
              <ProtectedRoute>
                <GateEntry />
              </ProtectedRoute>
            }
          />
          <Route
            path="/gate-pass"
            element={
              <ProtectedRoute>
                <GatePass />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vehicle-queue"
            element={
              <ProtectedRoute>
                <VehicleQueue />
              </ProtectedRoute>
            }
          />
          <Route
            path="/visitor-management"
            element={
              <ProtectedRoute>
                <VisitorManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/grn"
            element={
              <ProtectedRoute>
                <GoodsReceiving />
              </ProtectedRoute>
            }
          />
          <Route
            path="/goods-receiving"
            element={
              <ProtectedRoute>
                <GoodsReceiving />
              </ProtectedRoute>
            }
          />
          <Route
            path="/product-entry"
            element={
              <ProtectedRoute>
                <ProductEntry />
              </ProtectedRoute>
            }
          />
          <Route
            path="/batch-mgmt"
            element={
              <ProtectedRoute>
                <BatchManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/batch-management"
            element={
              <ProtectedRoute>
                <BatchManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/label-qr"
            element={
              <ProtectedRoute>
                <LabelGeneration />
              </ProtectedRoute>
            }
          />
          <Route
            path="/location-master"
            element={
              <ProtectedRoute>
                <LocationMaster />
              </ProtectedRoute>
            }
          />
          <Route
            path="/shade-mgmt"
            element={
              <ProtectedRoute>
                <ShadeManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/shade-management"
            element={
              <ProtectedRoute>
                <ShadeManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/put-away"
            element={
              <ProtectedRoute>
                <PutAwayCheckIn />
              </ProtectedRoute>
            }
          />
          <Route
            path="/put-away-check-in"
            element={
              <ProtectedRoute>
                <PutAwayCheckIn />
              </ProtectedRoute>
            }
          />
          <Route
            path="/stock-movement"
            element={
              <ProtectedRoute>
                <StockMovement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lab-testing"
            element={
              <ProtectedRoute>
                <LabTesting />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lab-reports"
            element={
              <ProtectedRoute>
                <LabReports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/current-stock"
            element={
              <ProtectedRoute>
                <CurrentStock />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/current-stock"
            element={
              <ProtectedRoute>
                <CurrentStock />
              </ProtectedRoute>
            }
          />
          <Route
            path="/stock-search"
            element={
              <ProtectedRoute>
                <StockSearch />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/stock-search"
            element={
              <ProtectedRoute>
                <StockSearch />
              </ProtectedRoute>
            }
          />
          <Route
            path="/stock-adj"
            element={
              <ProtectedRoute>
                <StockAdjustment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/stock-adjustment"
            element={
              <ProtectedRoute>
                <StockAdjustment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/stock-adjustment"
            element={
              <ProtectedRoute>
                <StockAdjustment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/damage-rejection"
            element={
              <ProtectedRoute>
                <DamageRejection />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/damage-rejection"
            element={
              <ProtectedRoute>
                <DamageRejection />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hold-stock"
            element={
              <ProtectedRoute>
                <HoldStock />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/hold-stock"
            element={
              <ProtectedRoute>
                <HoldStock />
              </ProtectedRoute>
            }
          />
          <Route
            path="/issue-dispatch"
            element={
              <ProtectedRoute>
                <IssueDispatch />
              </ProtectedRoute>
            }
          />
          <Route
            path="/outward/issue-dispatch"
            element={
              <ProtectedRoute>
                <IssueDispatch />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout-qr"
            element={
              <ProtectedRoute>
                <CheckoutQR />
              </ProtectedRoute>
            }
          />
          <Route
            path="/outward/checkout-qr"
            element={
              <ProtectedRoute>
                <CheckoutQR />
              </ProtectedRoute>
            }
          />
          <Route
            path="/gate-pass-out"
            element={
              <ProtectedRoute>
                <GatePassOut />
              </ProtectedRoute>
            }
          />
          <Route
            path="/outward/gate-pass-out"
            element={
              <ProtectedRoute>
                <GatePassOut />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics/reports"
            element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/analytics"
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/export"
            element={
              <ProtectedRoute>
                <ExportReports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/export-reports"
            element={
              <ProtectedRoute>
                <ExportReports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/export"
            element={
              <ProtectedRoute>
                <ExportReports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/system/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}
