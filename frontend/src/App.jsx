import React from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'
import { FavoritesProvider } from './contexts/FavoritesContext'
import { StripeProvider } from './contexts/StripeContext'
import { ThemeProvider } from './contexts/ThemeContext'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import VendorProfile from './pages/VendorProfile'
import About from './pages/About'
import Artisans from './pages/Artisans'
import Contact from './pages/Contact'
import Cart from './pages/Cart'
import Favorites from './pages/Favorites'
import Profile from './pages/Profile'
import Checkout from './pages/Checkout'
import CheckoutSuccess from './pages/CheckoutSuccess'
import Login from './pages/auth/Login'
import Register from './pages/auth/RegisterEnhanced'
import Dashboard from './pages/dashboard/Dashboard'
import ProtectedRoute from './components/auth/ProtectedRoute'

function AppContent() {
  const location = useLocation()
  const { user } = useAuth()
  const isDashboardRoute = location.pathname === '/dashboard' || location.pathname.startsWith('/dashboard/')
  
  // Show footer for customers on dashboard routes, hide for vendors and admins
  const shouldShowFooter = !isDashboardRoute || user?.role === 'customer'

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/vendors/:id" element={<VendorProfile />} />
          <Route path="/about" element={<About />} />
          <Route path="/artisans" element={<Artisans />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route path="/checkout" element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          } />
          <Route path="/checkout/success" element={
            <ProtectedRoute>
              <CheckoutSuccess />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />

        </Routes>
      </main>
      {shouldShowFooter && <Footer />}
    </div>
  )
}

function App() {
  console.log('🎨 App component rendering...')

  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <FavoritesProvider>
              <StripeProvider>
                <AppContent />
                <Toaster position="top-right" />
              </StripeProvider>
            </FavoritesProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  )
}

export default App
