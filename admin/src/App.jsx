import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { AuthProvider } from './context/AuthContext'
import ProtectedAdminRoute from './routes/ProtectedAdminRoute'
import AdminLayout from './components/AdminLayout'
import AdminLogin from './pages/AdminLogin'
import Dashboard from './pages/Dashboard'
import ManageProducts from './pages/ManageProducts'
import ManageOrders from './pages/ManageOrders'
import ManageUsers from './pages/ManageUsers'
import Revenue from './pages/Revenue'
import SupportMessages from './pages/SupportMessages'

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <ProtectedAdminRoute>
                <AdminLayout />
              </ProtectedAdminRoute>
            }
          >
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="products" element={<ManageProducts />} />
            <Route path="orders" element={<ManageOrders />} />
            <Route path="users" element={<ManageUsers />} />
            <Route path="revenue" element={<Revenue />} />
            <Route path="support" element={<SupportMessages />} />
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
          </Route>
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
        <ToastContainer position="top-right" autoClose={3500} />
      </HashRouter>
    </AuthProvider>
  )
}

export default App
