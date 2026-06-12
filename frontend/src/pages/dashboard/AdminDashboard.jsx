import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { FiUsers, FiShoppingBag, FiDollarSign, FiTrendingUp, FiSettings, FiCheckCircle, FiTrash2, FiUserCheck, FiUserX, FiEye, FiRefreshCw, FiSearch, FiFilter, FiCalendar, FiClock, FiAward, FiActivity, FiCrosshair } from 'react-icons/fi'
import { toast } from 'react-hot-toast'
import api from '../../utils/api'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import StatCard from '../../components/dashboard/StatCard'
import RevenueChart from '../../components/dashboard/RevenueChart'
import UserGrowthChart from '../../components/dashboard/UserGrowthChart'
import OrderStatusChart from '../../components/dashboard/OrderStatusChart'
import { motion } from 'framer-motion'
import ProductManagement from '../../components/dashboard/ProductManagement'
import OrderManagement from '../../components/dashboard/OrderManagement'
import AdminSettings from '../../components/dashboard/AdminSettings'

const AdminDashboard = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVendors: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingApprovals: 0
  })
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    revenue30Days: 0,
    revenue7Days: 0,
    orders30Days: 0,
    orders7Days: 0,
    users30Days: 0,
    users7Days: 0,
    topProducts: []
  })

  // Data States
  const [users, setUsers] = useState([])
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [vendorApprovals, setVendorApprovals] = useState([])
  const [activeTab, setActiveTab] = useState('overview')

  // Filters & Search
  const [userSearch, setUserSearch] = useState('')
  const [userRoleFilter, setUserRoleFilter] = useState('')
  const [userStatusFilter, setUserStatusFilter] = useState('')
  const [vendorApprovalStatus, setVendorApprovalStatus] = useState('pending')

  // Pagination States
  const [userPagination, setUserPagination] = useState({
    currentPage: 1, totalPages: 1, totalUsers: 0, hasNextPage: false, hasPrevPage: false
  })
  const [vendorApprovalPagination, setVendorApprovalPagination] = useState({
    currentPage: 1, totalPages: 1, totalUsers: 0, hasNextPage: false, hasPrevPage: false
  })

  // Action States
  const [actionLoading, setActionLoading] = useState({})

  // Modals (Keeping the state but simplifying the render for now to keep code clean)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [selectedVendor, setSelectedVendor] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')

  // API Calls
  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/dashboard')
      setStats(response.data.stats)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/admin/analytics-summary')
      setAnalytics(response.data.analytics)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    }
  }

  const refreshDashboard = useCallback(async () => {
    setRefreshing(true)
    try {
      await Promise.all([fetchStats(), fetchAnalytics(), fetchUsers(), fetchProducts(), fetchOrders(), fetchVendorApprovals()])
      setLastUpdated(new Date())
      toast.success('Dashboard refreshed')
    } catch (error) {
      toast.error('Failed to refresh dashboard')
    } finally {
      setRefreshing(false)
    }
  }, [])

  const fetchUsers = async (page = 1, search = '', role = '', status = '') => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search }),
        ...(role && { role }),
        ...(status && { status })
      })
      const response = await api.get(`/admin/users?${params}`)
      setUsers(response.data.users)
      setUserPagination(response.data.pagination)
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await api.get('/admin/products')
      setProducts(response.data.products)
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const fetchOrders = async () => {
    try {
      const response = await api.get('/admin/orders')
      setOrders(response.data.orders)
    } catch (error) {
      console.error('Error fetching orders:', error)
    }
  }

  const fetchVendorApprovals = async (page = 1, status = 'pending') => {
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: '10', status: status })
      const response = await api.get(`/admin/vendor-approvals?${params}`)
      setVendorApprovals(response.data.users)
      setVendorApprovalPagination(response.data.pagination)
    } catch (error) {
      console.error('Error fetching approvals:', error)
    }
  }

  // Effect Hooks
  useEffect(() => {
    const initializeDashboard = async () => {
      setLoading(true)
      await Promise.all([fetchStats(), fetchAnalytics(), fetchUsers(), fetchProducts(), fetchOrders(), fetchVendorApprovals()])
      setLoading(false)
      setLastUpdated(new Date())
    }
    initializeDashboard()
  }, [])

  useEffect(() => {
    if (activeTab === 'users') fetchUsers(1, userSearch, userRoleFilter, userStatusFilter)
    if (activeTab === 'approvals') fetchVendorApprovals(1, vendorApprovalStatus)
  }, [activeTab, userSearch, userRoleFilter, userStatusFilter, vendorApprovalStatus])

  // Real-time auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeTab === 'overview') {
        refreshDashboard()
      }
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [activeTab, refreshDashboard])

  // Actions
  const updateUserStatus = async (userId, isActive) => {
    try {
      setActionLoading(prev => ({ ...prev, [userId]: true }))
      await api.put(`/admin/users/${userId}/status`, { isActive })
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isActive } : u))
      toast.success(`User ${isActive ? 'activated' : 'deactivated'} successfully`)
    } catch (error) {
      toast.error('Failed to update status')
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }))
    }
  }

  const approveVendor = async (vendorId) => {
    try {
      setActionLoading(prev => ({ ...prev, [vendorId]: true }))
      await api.put(`/admin/vendor-approvals/${vendorId}/approve`, {})
      setVendorApprovals(prev => prev.filter(v => v._id !== vendorId))
      toast.success('Vendor approved successfully')
    } catch (error) {
      toast.error('Failed to approve vendor')
    } finally {
      setActionLoading(prev => ({ ...prev, [vendorId]: false }))
    }
  }

  const deleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return
    }

    try {
      await api.delete(`/admin/products/${productId}`)
      setProducts(products.filter(p => p._id !== productId))
      toast.success('Product deleted successfully')
    } catch (error) {
      console.error('Error deleting product:', error)
      toast.error('Failed to delete product')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const navItems = [
    { id: 'overview', label: 'Overview', icon: FiTrendingUp },
    { id: 'users', label: 'Users', icon: FiUsers },
    { id: 'approvals', label: 'Approvals', icon: FiCheckCircle },
    { id: 'products', label: 'Products', icon: FiShoppingBag },
    { id: 'orders', label: 'Orders', icon: FiDollarSign },
    { id: 'settings', label: 'Settings', icon: FiSettings },
  ];

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab} title="Global Command" navItems={navItems}>
      <div className="space-y-24">
        {/* Authority Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
           <div className="space-y-6">
              <div className="flex items-center space-x-4">
                 <div className="w-3 h-3 rounded-full bg-accent animate-pulse" />
                 <span className="text-[10px] font-black uppercase tracking-[0.5em] text-accent">Active Authority Session</span>
              </div>
              <h1 className="text-6xl font-black text-slate-900 tracking-tighter leading-none italic">Marketplace <span className="text-slate-400">Vanguard</span></h1>
              <div className="flex items-center space-x-6 text-slate-400 font-medium italic">
                 <p>Strategic Oversight & Protocol Control</p>
                 <div className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
                 <p className="text-[10px] uppercase font-black tracking-widest">Admin ID: {user?._id.slice(-6).toUpperCase()}</p>
              </div>
           </div>
           
           <div className="flex items-center space-x-8">
              <div className="text-right hidden md:block">
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Matrix Latency</p>
                 <div className="flex items-center space-x-2 justify-end">
                    <span className="text-xs font-black text-slate-900 uppercase tracking-widest">12ms Response</span>
                 </div>
              </div>
              <button 
                onClick={refreshDashboard} 
                disabled={refreshing}
                className="btn-accent !px-12 !py-6 !rounded-[2rem] shadow-2xl shadow-accent/20 flex items-center space-x-4"
              >
                <FiRefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Sync Node</span>
              </button>
           </div>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-24">
            {/* Critical Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
              <StatCard title="Active Entities" value={stats.totalUsers} icon={FiUsers} color="slate" trend={5} />
              <StatCard title="Global Liquidity" value={`$${stats.totalRevenue?.toFixed(0)}`} icon={FiDollarSign} color="slate" trend={12} />
              <StatCard title="Artifact Catalog" value={stats.totalProducts} icon={FiShoppingBag} color="slate" trend={-1} />
              <StatCard title="Vetting Queue" value={stats.pendingApprovals} icon={FiCheckCircle} color="slate" />
            </div>

            {/* Strategic Intelligence Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {[
                { label: 'Short-term Yield (7D)', val: analytics.revenue7Days, icon: FiTrendingUp },
                { label: 'Monthly Velocity (30D)', val: analytics.revenue30Days, icon: FiActivity },
                { label: 'Strategic Acquisitions', val: analytics.orders7Days, icon: FiCrosshair }
              ].map((item, i) => (
                <div key={i} className="p-12 bg-slate-50 rounded-[3rem] border-2 border-transparent hover:border-slate-100 transition-all duration-500 group">
                   <div className="flex items-center justify-between mb-8">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-900 shadow-xl shadow-slate-200 group-hover:scale-110 transition-transform">
                        <item.icon className="w-5 h-5" />
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{item.label}</span>
                   </div>
                   <h3 className="text-3xl font-black text-slate-900 tracking-tighter leading-none italic">${item.val?.toFixed(0)}</h3>
                </div>
              ))}
              <div className="p-12 bg-slate-950 rounded-[3rem] text-white flex flex-col justify-between overflow-hidden relative">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 blur-3xl -mr-16 -mt-16" />
                 <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-8 relative z-10">Infiltration Prevention</p>
                 <div className="space-y-1 relative z-10">
                    <p className="text-4xl font-black text-accent">{analytics.users7Days}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest">New Entity Registrations</p>
                 </div>
              </div>
            </div>

            {/* Visualization Matrix */}
            <div className="space-y-16">
               {/* Liquidity Graph */}
               <div className="p-12 bg-white border-4 border-slate-50 rounded-[4rem] shadow-3xl shadow-slate-100 flex flex-col h-[500px]">
                  <div className="flex items-center justify-between mb-8 flex-shrink-0">
                     <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Liquidity Distribution (Weekly)</h3>
                     <span className="text-[9px] font-black text-accent uppercase tracking-widest">Real-time Matrix Feed</span>
                  </div>
                  <div className="flex-1 w-full min-h-0">
                     <RevenueChart />
                  </div>
               </div>
               
               {/* Growth Vectors */}
               <div className="p-12 bg-slate-50 rounded-[4rem] flex flex-col h-[450px]">
                  <div className="flex items-center justify-between mb-8 flex-shrink-0">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Network Growth Vectors</h3>
                  </div>
                  <div className="flex-1 w-full min-h-0">
                      <UserGrowthChart />
                  </div>
               </div>

               {/* Status Metrics */}
               <div className="p-12 bg-white border-4 border-slate-50 rounded-[4rem] shadow-3xl shadow-slate-100 flex flex-col h-[450px]">
                  <div className="flex items-center justify-between mb-8 flex-shrink-0">
                     <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Order Manifest Status</h3>
                  </div>
                  <div className="flex-1 w-full min-h-0">
                     <OrderStatusChart />
                  </div>
               </div>
            </div>

            {/* High-Value Artifact Operations */}
            <div className="space-y-12">
               <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase tracking-widest text-[10px]">Strategic High-Value Artifacts</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">30-Day Velocity</p>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {analytics.topProducts?.map((product, index) => (
                    <div key={index} className="p-10 bg-white border-2 border-slate-50 rounded-[3rem] shadow-3xl shadow-slate-100 hover:border-slate-100 transition-all duration-500 group">
                       <div className="flex items-center justify-between mb-8">
                          <span className="w-12 h-12 bg-slate-950 text-white rounded-2xl flex items-center justify-center font-black text-xs italic group-hover:bg-accent transition-colors">{index + 1}</span>
                          <div className="text-right">
                             <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Protocol Yield</p>
                             <p className="text-xl font-black text-slate-900 italic">${product.totalRevenue?.toFixed(0)}</p>
                          </div>
                       </div>
                       <div className="space-y-2">
                          <h4 className="text-lg font-black text-slate-900 tracking-tight truncate">{product.name}</h4>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{product.totalSold} Units Transacted</p>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        )}


        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white border-4 border-slate-50 rounded-[4rem] shadow-3xl shadow-slate-100 overflow-hidden">
            <div className="p-12 border-b border-slate-50 flex flex-col lg:flex-row lg:items-center justify-between gap-12">
               <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-accent">Entity Directory</span>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight italic">Global <span className="text-gradient">Registrar</span></h2>
               </div>

              <div className="flex flex-wrap gap-6">
                <div className="relative group">
                  <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-accent transition-colors" />
                  <input
                    type="text"
                    placeholder="Locate Entity..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="pl-14 pr-8 py-5 rounded-[1.5rem] border-none bg-slate-50 text-slate-900 font-bold focus:ring-4 focus:ring-slate-100 transition-all w-full md:w-80"
                  />
                </div>

                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="px-10 py-5 rounded-[1.5rem] border-none bg-slate-50 text-slate-900 font-black uppercase tracking-widest text-[9px] focus:ring-4 focus:ring-slate-100 cursor-pointer appearance-none"
                >
                  <option value="">All Protocol Classes</option>
                  <option value="customer">Customer Class</option>
                  <option value="vendor">Merchant Class</option>
                  <option value="admin">Authority Class</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-12 py-8 text-[9px] font-black text-slate-400 uppercase tracking-widest">Entity Metadata</th>
                    <th className="px-12 py-8 text-[9px] font-black text-slate-400 uppercase tracking-widest">Protocol Role</th>
                    <th className="px-12 py-8 text-[9px] font-black text-slate-400 uppercase tracking-widest">Matrix Status</th>
                    <th className="px-12 py-8 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Interventions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {users.map(user => (
                    <tr key={user._id} className="group hover:bg-slate-50/50 transition-all duration-500">
                      <td className="px-12 py-10">
                        <div className="flex items-center space-x-6">
                          <div className="w-16 h-16 rounded-[1.5rem] bg-slate-900 flex items-center justify-center text-white font-black text-xl italic shadow-2xl shadow-slate-400 group-hover:scale-110 transition-transform">
                            {user.name?.[0] || 'U'}
                          </div>
                          <div className="space-y-1">
                            <p className="font-black text-slate-900 text-lg tracking-tight leading-none italic">{user.name}</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-12 py-10">
                        <span className={`px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl shadow-slate-100 ${user.role === 'admin' ? 'bg-slate-950 text-white' :
                          user.role === 'vendor' ? 'bg-accent text-white' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                          {user.role} class
                        </span>
                      </td>
                      <td className="px-12 py-10">
                        <div className="flex items-center space-x-3">
                           <div className={`w-2.5 h-2.5 rounded-full ${user.isActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                           <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">{user.isActive ? 'Active Node' : 'Dormant'}</span>
                        </div>
                      </td>
                      <td className="px-12 py-10 text-center">
                        <div className="flex items-center justify-center space-x-4">
                          {user.role !== 'admin' && (
                            <button
                              onClick={() => updateUserStatus(user._id, !user.isActive)}
                              className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl shadow-slate-200 transition-all hover:scale-110 active:scale-95 ${user.isActive
                                ? 'bg-white text-red-500'
                                : 'bg-slate-950 text-white'
                                }`}
                            >
                              {user.isActive ? <FiUserX size={20} /> : <FiUserCheck size={20} />}
                            </button>
                          )}
                          <button className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-xl shadow-slate-200 text-slate-400 hover:text-slate-900 hover:scale-110 transition-all">
                            <FiEye size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-12 border-t border-slate-50 flex justify-between items-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Total Entities Identified: {userPagination.totalUsers}</span>
              <div className="flex space-x-6">
                <button
                  disabled={!userPagination.hasPrevPage}
                  onClick={() => fetchUsers(userPagination.currentPage - 1)}
                  className="px-10 py-4 bg-slate-50 text-slate-400 rounded-2xl font-black uppercase tracking-widest text-[9px] hover:bg-slate-100 disabled:opacity-20 transition-all"
                >
                  Previous Cycle
                </button>
                <button
                  disabled={!userPagination.hasNextPage}
                  onClick={() => fetchUsers(userPagination.currentPage + 1)}
                  className="px-10 py-4 bg-slate-950 text-white rounded-2xl font-black uppercase tracking-widest text-[9px] hover:bg-slate-800 disabled:opacity-20 shadow-2xl shadow-slate-400 transition-all"
                >
                  Next Cycle
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Approvals Tab */}
        {activeTab === 'approvals' && (
          <div className="bg-white border-4 border-slate-50 rounded-[4rem] shadow-3xl shadow-slate-100 overflow-hidden">
            <div className="p-12 border-b border-slate-50">
               <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-accent">Strategic Recruitment</span>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight italic">Merchant <span className="text-gradient">Vetting Station</span></h2>
               </div>
            </div>
            
            <div className="overflow-x-auto min-h-[400px]">
              {vendorApprovals.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-48 space-y-8">
                   <div className="w-32 h-32 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-100"><FiCheckCircle size={64} /></div>
                   <p className="text-slate-300 font-black uppercase tracking-widest text-xs italic">All merchant candidates have been processed.</p>
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50">
                    <tr>
                      <th className="px-12 py-8 text-[9px] font-black text-slate-400 uppercase tracking-widest">Candidate Profile</th>
                      <th className="px-12 py-8 text-[9px] font-black text-slate-400 uppercase tracking-widest">Business designation</th>
                      <th className="px-12 py-8 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Authority Decision</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {vendorApprovals.map(vendor => (
                      <tr key={vendor._id} className="group hover:bg-slate-50/50 transition-all duration-500">
                        <td className="px-12 py-10">
                           <div className="space-y-1">
                             <p className="font-black text-slate-900 text-lg tracking-tight leading-none italic">{vendor.name}</p>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{vendor.email}</p>
                           </div>
                        </td>
                        <td className="px-12 py-10">
                          <p className="text-sm font-bold text-slate-600 italic underline underline-offset-4 decoration-slate-200">
                            {vendor.vendorDetails?.businessName || 'Designation Pending'}
                          </p>
                        </td>
                        <td className="px-12 py-10">
                          <div className="flex items-center justify-center space-x-6">
                            <button
                              onClick={() => approveVendor(vendor._id)}
                              className="px-10 py-5 bg-green-500 text-white rounded-[1.5rem] text-[9px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-green-100 hover:bg-green-600 transition-all active:scale-95 flex items-center space-x-3"
                            >
                              <FiCheckCircle className="w-4 h-4" />
                              <span>Authorize</span>
                            </button>
                            <button
                              onClick={() => {
                                setSelectedVendor(vendor)
                                setShowRejectModal(true)
                              }}
                              className="px-10 py-5 bg-slate-950 text-white rounded-[1.5rem] text-[9px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-slate-400 hover:bg-slate-800 transition-all active:scale-95 flex items-center space-x-3"
                            >
                              <FiUserX className="w-4 h-4" />
                              <span>Decline</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}



        {/* Products Tab */}
        {activeTab === 'products' && (
          <ProductManagement
            products={products}
            loading={loading}
            onDelete={deleteProduct}
          />
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <OrderManagement
            orders={orders}
            loading={loading}
          />
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <AdminSettings />
        )}
      </div>
    </DashboardLayout>
  )
}

export default AdminDashboard
