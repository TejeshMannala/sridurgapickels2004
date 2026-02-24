import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { AuthProvider } from './context/AuthContext'
import { ShopProvider } from './context/ShopContext'

// Layout Components
import Navbar from './components/Navbar'
import Footer from './components/Footer'

// Pages
import Home from './pages/Home'
import Shop from './pages/Shop'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import Cart from './pages/Cart'
import Wishlist from './pages/Wishlist'
import Checkout from './pages/Checkout'
import Orders from './pages/Orders'
import OrderTracking from './pages/OrderTracking'
import ProductDetails from './pages/ProductDetails'
import About from './pages/About'
import Support from './pages/Support'
import AdminFeedback from './pages/AdminFeedback'
import Deals from './pages/Deals'

// Protected Routes
import ProtectedRoute from './routes/ProtectedRoute'
import AdminRoute from './routes/AdminRoute'
import { MessageCircle } from 'lucide-react'

function App() {
  return (
    <AuthProvider>
      <ShopProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/deals" element={<Deals />} />
                <Route path="/products/:id" element={<ProductDetails />} />
                <Route path="/about" element={<About />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/support"
                  element={
                    <ProtectedRoute>
                      <Support />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/cart"
                  element={
                    <ProtectedRoute>
                      <Cart />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/wishlist"
                  element={
                    <ProtectedRoute>
                      <Wishlist />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute>
                      <Checkout />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute>
                      <Orders />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders/:id/tracking"
                  element={
                    <ProtectedRoute>
                      <OrderTracking />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/feedback"
                  element={
                    <AdminRoute>
                      <AdminFeedback />
                    </AdminRoute>
                  }
                />
              </Routes>
            </main>
            <Footer />
          </div>

          <a
            href={import.meta.env.VITE_WHATSAPP_URL || 'https://wa.me/6593511770'}
            target="_blank"
            rel="noreferrer"
            className="fixed bottom-5 right-5 z-50 rounded-full bg-green-500 p-3 text-white shadow-lg"
            aria-label="WhatsApp support"
          >
            <MessageCircle size={22} />
          </a>

          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </Router>
      </ShopProvider>
    </AuthProvider>
  )
}

export default App
