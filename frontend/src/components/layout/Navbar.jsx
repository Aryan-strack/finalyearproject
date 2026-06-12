import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiSearch,
  FiShoppingCart,
  FiHeart,
  FiUser,
  FiMenu,
  FiX,
  FiLogOut,
  FiGrid,
  FiChevronDown,
  FiPackage
} from 'react-icons/fi'
import { useAuth } from '../../contexts/AuthContext'
import { useCart } from '../../contexts/CartContext'
import { useFavorites } from '../../contexts/FavoritesContext'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()
  const { itemCount } = useCart()
  const { favoritesCount } = useFavorites()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = () => {
    logout()
    setIsMenuOpen(false)
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path

  // Define links
  const links = [
    { name: 'Home', path: '/' },
    { name: 'Collections', path: '/products' },
    { name: 'Artisans', path: '/artisans' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' }
  ]

  return (
    <>
      {(!isAuthenticated || user?.role === 'user' || user?.role === 'customer') && (
        <nav
          className={`fixed top-0 w-full z-[100] bg-white transition-all duration-500 ease-in-out ${scrolled
            ? 'py-4 bg-white/80 backdrop-blur-xl border-b border-slate-100/50 shadow-[0_4px_30px_rgba(0,0,0,0.03)]'
            : 'py-5 bg-transparent'
            }`}
        >
          <div className="container mx-auto px-6">
            <div className="flex justify-between items-center">
              {/* Logo */}
              <Link to="/" className="flex items-center space-x-3 group">
                <div className="relative w-11 h-11 bg-slate-900 rounded-[1.25rem] flex items-center justify-center transform group-hover:rotate-[15deg] transition-all duration-500 shadow-xl overflow-hidden">
                  <span className="text-2xl font-black text-white font-display relative z-10">IM</span>
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-accent/20"></div>
                </div>
                <div className="flex flex-col">
                  <span className={`text-xl font-black font-display tracking-tight leading-none ${scrolled ? 'text-slate-900' : (location.pathname === '/' ? 'text-black' : 'text-slate-900')}`}>
                    INTELLI
                  </span>
                  <span className="text-[10px] font-black tracking-[0.3em] text-accent mt-1 leading-none uppercase">Mart</span>
                </div>
              </Link>

              {/* Desktop Nav */}
              <div className="hidden lg:flex items-center space-x-2 bg-slate-100/50 p-1 rounded-2xl border border-slate-100">
                {links.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`px-6 py-2.5 text-sm font-bold rounded-[1.1rem] transition-all duration-300 relative ${isActive(item.path)
                      ? 'text-white bg-slate-950 shadow-lg'
                      : `text-slate-500 hover:text-slate-900 hover:bg-white`
                      }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-4">
                <div className="hidden sm:flex items-center space-x-2 mr-3 pr-5 border-r border-slate-200">
                  <Link to="/favorites" className={`relative p-3 rounded-2xl transition-all ${scrolled ? 'text-slate-500 hover:bg-slate-50' : (location.pathname === '/' ? 'text-black/70 hover:bg-white/10 hover:text-black' : 'text-slate-500 hover:bg-slate-50')}`}>
                    <FiHeart className="w-5 h-5" />
                    {favoritesCount > 0 && (
                      <span className="absolute top-2 right-2 w-4 h-4 bg-accent text-[10px] text-black flex items-center justify-center rounded-full font-black border-2 border-white">{favoritesCount}</span>
                    )}
                  </Link>
                  <Link to="/cart" className={`relative p-3 rounded-2xl transition-all ${scrolled ? 'text-slate-500 hover:bg-slate-50' : (location.pathname === '/' ? 'text-black/70 hover:bg-white/10 hover:text-white' : 'text-slate-500 hover:bg-slate-50')}`}>
                    <FiShoppingCart className="w-5 h-5" />
                    {itemCount > 0 && (
                      <span className="absolute top-2 right-2 w-4 h-4 bg-slate-900 text-[10px] text-white flex items-center justify-center rounded-full font-black border-2 border-white">{itemCount}</span>
                    )}
                  </Link>
                </div>

                <div className="flex items-center">
                  {isAuthenticated ? (
                    <div className="relative group">
                      <button className="flex items-center space-x-3 p-1.5 rounded-full border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all active:scale-95">
                        <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center font-bold text-white uppercase shadow-inner">
                          {user?.name?.charAt(0)}
                        </div>
                        <FiChevronDown className="w-4 h-4 text-slate-400 mr-2" />
                      </button>

                      {/* Dropdown Menu */}
                      <div className="absolute right-0 mt-4 w-64 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 invisible group-hover:visible transition-all duration-300 z-50">
                        <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-100 p-3">
                          <div className="px-5 py-5 border-b border-slate-50 flex items-center space-x-3 mb-2">
                            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center font-bold text-white uppercase text-sm">
                              {user?.name?.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-900 leading-none">{user?.name}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Premium Member</p>
                            </div>
                          </div>
                           <div className="space-y-1">
                             <Link to="/dashboard" className="flex items-center space-x-3 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-[1.25rem] transition-colors">
                               <FiGrid className="w-4 h-4" />
                               <span>Dashboard</span>
                             </Link>
                             <Link to="/products" className="flex items-center space-x-3 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-[1.25rem] transition-colors">
                               <FiPackage className="w-4 h-4" />
                               <span>My Products</span>
                             </Link>
                             <Link to="/profile" className="flex items-center space-x-3 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-[1.25rem] transition-colors">
                               <FiUser className="w-4 h-4" />
                               <span>My Profile</span>
                             </Link>
                             <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-[1.25rem] transition-colors text-left">
                               <FiLogOut className="w-4 h-4" />
                               <span>Logout</span>
                             </button>
                           </div>
                        </div>
                      </div>
                    </div>
                  ) :
                    (
                      <div className="hidden lg:flex items-center space-x-6">
                        <Link to="/login" className={`text-sm font-black uppercase tracking-widest transition-colors ${scrolled ? 'text-slate-900 hover:text-accent' : (location.pathname === '/' ? 'text-black hover:text-accent' : 'text-slate-900 hover:text-accent')}`}>Login</Link>
                        <Link to="/register" className="btn-accent !px-8 !py-3 !text-sm whitespace-nowrap">Join Us</Link>
                      </div>
                    )
                  }
                </div>

                {/* Mobile Trigger */}
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className={`lg:hidden p-3 rounded-2xl transition-colors ${scrolled ? 'text-black-900 hover:bg-slate-100' : (location.pathname === '/' ? 'text-black hover:bg-white/10' : 'text-slate-900 hover:bg-slate-100')}`}
                >
                  {isMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="lg:hidden absolute top-full left-0 right-0 p-4 z-50 overflow-hidden"
              >
                <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 p-8 space-y-8 mt-2">
                  <div className="flex flex-col space-y-4">
                    {links.map((item) => (
                      <Link
                        key={item.name}
                        to={item.path}
                        onClick={() => setIsMenuOpen(false)}
                        className={`text-3xl font-black ${isActive(item.path) ? 'text-slate-900' : 'text-slate-300 hover:text-slate-900'
                          }`}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                  {!isAuthenticated && (
                    <div className="pt-8 border-t border-slate-100 space-y-4">
                      <Link
                        to="/register"
                        onClick={() => setIsMenuOpen(false)}
                        className="w-full flex items-center justify-center py-5 rounded-[1.5rem] bg-slate-900 text-white font-black text-lg shadow-xl"
                      >
                        Create Account
                      </Link>
                      <Link
                        to="/login"
                        onClick={() => setIsMenuOpen(false)}
                        className="w-full flex items-center justify-center py-5 rounded-[1.5rem] bg-slate-50 text-slate-500 font-bold"
                      >
                        Sign In
                      </Link>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
      )}
    </>
  )
}

export default Navbar

