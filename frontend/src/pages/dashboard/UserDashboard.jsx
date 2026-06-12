import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import {
  FiUser, FiShoppingBag, FiHeart, FiSettings, FiMessageCircle, FiRefreshCw,
  FiPackage, FiDollarSign, FiStar, FiClock, FiMapPin, FiTruck, FiCheck,
  FiTrendingUp, FiAward, FiCalendar, FiMail, FiPhone, FiEdit3, FiX
} from 'react-icons/fi'
import { toast } from 'react-hot-toast'
import ChatInbox from '../../components/dashboard/ChatInbox'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import StatCard from '../../components/dashboard/StatCard'
import api from '../../utils/api'

const UserDashboard = () => {
  const { user, updateProfile } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [backgroundRefresh, setBackgroundRefresh] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    }
  })
  const [saveLoading, setSaveLoading] = useState(false)

  useEffect(() => {
    fetchOrders()
    const interval = setInterval(() => fetchOrders(true), 30000)
    const handleFocus = () => fetchOrders(true)
    const handleVisibilityChange = () => {
      if (!document.hidden) fetchOrders(true)
    }

    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          state: user.address?.state || '',
          zipCode: user.address?.zipCode || '',
          country: user.address?.country || ''
        }
      })
    }
  }, [user])

  const fetchOrders = async (isBackgroundRefresh = false) => {
    try {
      if (!isBackgroundRefresh) setLoading(true)
      else setBackgroundRefresh(true)

      const response = await api.get('/orders')
      setOrders(response.data.orders || [])
    } catch (error) {
      console.error(error)
      if (!isBackgroundRefresh) {
        const token = localStorage.getItem('token')
        if (!token || error.code === 'ECONNABORTED' || error.message.includes('Network Error')) {
          setOrders([])
        }
      }
    } finally {
      if (!isBackgroundRefresh) setLoading(false)
      else setBackgroundRefresh(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSaveLoading(true)
    try {
      const response = await api.put('/auth/profile', formData)
      updateProfile(response.data.user)
      setIsEditing(false)
      toast.success('Profile updated successfully')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile')
    } finally {
      setSaveLoading(false)
    }
  }

  const getOrderStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'text-green-600 bg-green-50'
      case 'processing': return 'text-blue-600 bg-blue-50'
      case 'shipped': return 'text-purple-600 bg-purple-50'
      case 'delivered': return 'text-slate-900 bg-slate-50'
      case 'cancelled': return 'text-red-600 bg-red-50'
      default: return 'text-yellow-600 bg-yellow-50'
    }
  }

  const navItems = [
    { id: 'overview', label: 'Overview', icon: FiUser },
    { id: 'orders', label: 'Purchases', icon: FiShoppingBag },
    { id: 'messages', label: 'Intelligence', icon: FiMessageCircle },
    { id: 'profile', label: 'Directive', icon: FiSettings }
  ];

  if (loading) {
     return (
        <div className="min-h-screen bg-white flex items-center justify-center">
           <div className="text-center animate-pulse space-y-8">
              <div className="w-16 h-16 bg-slate-50 rounded-full mx-auto" />
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">Synchronizing Vault</p>
           </div>
        </div>
     )
  }

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab} title="Sanctum Dashboard" navItems={navItems}>
      {/* Dynamic Header */}
      <div className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div className="space-y-6">
          <span className="text-accent font-black tracking-[0.3em] uppercase text-[10px]">Portal Access Granted</span>
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-none italic">Welcome Back, <span className="text-gradient">{user?.name}</span></h1>
          <p className="text-lg text-slate-500 font-medium italic">Manage your acquisitions and algorithmic preferences.</p>
        </div>
        {backgroundRefresh && (
          <div className="flex items-center space-x-3 px-6 py-3 bg-slate-50 rounded-full">
            <FiRefreshCw className="w-3 h-3 text-accent animate-spin" />
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Syncing Matrix</span>
          </div>
        )}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-24">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
             {[
               { t: 'Acquisitions', v: orders.length, i: FiShoppingBag, c: 'slate-900' },
               { t: 'Investment', v: `$${orders.reduce((s, o) => s + o.total, 0).toFixed(0)}`, i: FiDollarSign, c: 'slate-900' },
               { t: 'Secured', v: orders.filter(o => o.status === 'delivered').length, i: FiAward, c: 'accent' },
               { t: 'In Transit', v: orders.filter(o => ['pending', 'confirmed', 'processing', 'shipped'].includes(o.status)).length, i: FiClock, c: 'slate-400' }
             ].map((s, idx) => (
                <div key={idx} className="p-10 bg-slate-50 rounded-[3rem] border-2 border-transparent hover:border-slate-100 transition-all duration-500 group">
                   <div className={`w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-${s.c} mb-8 shadow-xl shadow-slate-100 group-hover:scale-110 transition-transform`}>
                      <s.i className="w-5 h-5" />
                   </div>
                   <h4 className="text-3xl font-black text-slate-900 tracking-tighter leading-none mb-2">{s.v}</h4>
                   <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{s.t}</p>
                </div>
             ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
             {/* Recent Activity */}
             <div className="lg:col-span-7 space-y-12">
                <div className="flex items-center justify-between">
                   <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase tracking-widest text-[10px]">Recent Acquisitions</h3>
                   <button onClick={() => setActiveTab('orders')} className="text-[10px] font-black uppercase tracking-widest text-accent hover:text-slate-900 transition-colors">Manifest All</button>
                </div>
                
                {orders.length === 0 ? (
                   <div className="p-20 bg-slate-50 rounded-[3rem] text-center space-y-4">
                      <FiPackage className="w-12 h-12 text-slate-200 mx-auto" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Inventory Empty</p>
                   </div>
                ) : (
                   <div className="space-y-6">
                      {orders.slice(0, 3).map((o) => (
                         <div key={o._id} className="p-8 bg-white border border-slate-50 rounded-[2.5rem] shadow-2xl shadow-slate-100 flex items-center justify-between group hover:border-slate-200 transition-all duration-500">
                            <div className="flex items-center space-x-6">
                               <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-900 font-bold group-hover:bg-slate-950 group-hover:text-white transition-all duration-500">
                                  <FiPackage className="w-6 h-6" />
                               </div>
                               <div>
                                  <h4 className="text-lg font-black text-slate-900 tracking-tight">Order #{o.orderNumber || o._id.slice(-6).toUpperCase()}</h4>
                                  <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">{new Date(o.createdAt).toLocaleDateString()}</p>
                               </div>
                            </div>
                            <div className="text-right space-y-1">
                               <p className="font-black text-slate-900">${o.total}</p>
                               <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${getOrderStatusColor(o.status)}`}>{o.status}</span>
                            </div>
                         </div>
                      ))}
                   </div>
                )}
             </div>

             {/* Profile Preview */}
             <div className="lg:col-span-5 space-y-12">
                <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase tracking-widest text-[10px]">Identity Credentials</h3>
                <div className="p-12 bg-slate-950 rounded-[4rem] text-white space-y-10 shadow-3xl shadow-slate-200">
                   <div className="flex items-center space-x-6">
                      <div className="w-16 h-16 rounded-[1.5rem] bg-white/10 flex items-center justify-center font-black text-2xl uppercase border border-white/10">{user?.name?.charAt(0)}</div>
                      <div>
                         <h4 className="font-black text-lg tracking-tight leading-none">{user?.name}</h4>
                         <p className="text-[10px] font-black text-accent uppercase tracking-widest mt-2">Premium Collector</p>
                      </div>
                   </div>
                   <div className="space-y-6 pt-10 border-t border-white/10">
                      <div className="flex items-center space-x-4">
                         <FiMail className="w-4 h-4 text-slate-500" />
                         <span className="text-sm font-bold text-slate-300">{user?.email}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                         <FiCalendar className="w-4 h-4 text-slate-500" />
                         <span className="text-sm font-bold text-slate-300">Member since {new Date(user?.createdAt).getFullYear()}</span>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="space-y-12">
          <div className="flex justify-between items-center">
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">Purchase <span className="text-gradient">Timeline</span></h3>
            <button onClick={() => fetchOrders()} className="p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors">
              <FiRefreshCw className={loading ? 'animate-spin' : ''} />
            </button>
          </div>

          {orders.length === 0 ? (
            <div className="py-48 text-center space-y-10 bg-slate-50 rounded-[4rem]">
              <FiShoppingBag className="w-20 h-20 text-slate-100 mx-auto" />
              <div className="space-y-4">
                 <h4 className="text-xl font-black text-slate-900 uppercase tracking-widest text-xs">Acquisition History Terminal</h4>
                 <p className="text-slate-400 font-medium italic">Begin your journey by discovering the marketplace artifacts.</p>
              </div>
              <button onClick={() => navigate('/products')} className="btn-accent !px-12">Browse Artifacts</button>
            </div>
          ) : (
            <div className="space-y-10">
              {orders.map(o => (
                <div key={o._id} className="bg-white rounded-[4rem] border-4 border-slate-50 overflow-hidden shadow-3xl shadow-slate-100">
                  <div className="p-12 flex flex-col md:flex-row justify-between items-center gap-12 bg-slate-50/50">
                    <div className="space-y-2">
                       <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Order Reference</p>
                       <h4 className="text-4xl font-black text-slate-900 tracking-tighter">#{o.orderNumber || o._id.slice(-6).toUpperCase()}</h4>
                       <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                         <FiCalendar className="w-3 h-3" />
                         <span>{new Date(o.createdAt).toLocaleDateString()}</span>
                       </div>
                    </div>
                    <div className="text-center md:text-right space-y-4">
                       <p className="text-4xl font-black text-slate-900 tracking-tighter italic">${o.total}</p>
                       <span className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] inline-block ${getOrderStatusColor(o.status)}`}>{o.status}</span>
                    </div>
                  </div>

                  <div className="p-12 space-y-12">
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                        <div className="space-y-8">
                           <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Acquired Items</h5>
                           <div className="space-y-6">
                              {o.items.map((item, i) => (
                                <div key={i} className="flex items-center space-x-6 group">
                                  <div className="w-20 h-20 bg-slate-50 rounded-[1.5rem] overflow-hidden shadow-inner flex-shrink-0 group-hover:scale-105 transition-transform duration-500">
                                    <img src={item.image} className="w-full h-full object-cover" />
                                  </div>
                                  <div>
                                    <h6 className="font-black text-slate-900 text-lg tracking-tight">{item.name}</h6>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Qty: {item.quantity} — ${item.price}</p>
                                  </div>
                                </div>
                              ))}
                           </div>
                        </div>
                        <div className="space-y-8">
                           <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Dispatch Coordinates</h5>
                           <div className="p-10 bg-slate-50 rounded-[2.5rem] space-y-4">
                              <p className="text-lg font-black text-slate-900 tracking-tight">{o.shippingAddress.firstName} {o.shippingAddress.lastName}</p>
                              <p className="text-sm font-medium text-slate-500 leading-relaxed italic">{o.shippingAddress.address}, {o.shippingAddress.city}, {o.shippingAddress.state} {o.shippingAddress.zipCode}</p>
                           </div>
                        </div>
                     </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'messages' && (
        <div className="h-[70vh] rounded-[4rem] overflow-hidden border-8 border-slate-50 shadow-3xl shadow-slate-100 bg-white">
          <ChatInbox />
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="flex justify-between items-center mb-16">
            <h3 className="text-5xl font-black text-slate-900 tracking-tight italic">Security <span className="text-gradient">Directive</span></h3>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-10 py-5 bg-slate-950 text-white rounded-[1.5rem] text-[10px] uppercase tracking-[0.3em] font-black hover:bg-slate-800 transition-all active:scale-95 shadow-2xl shadow-slate-200"
            >
              {isEditing ? 'Abort Changes' : 'Initialize Edit'}
            </button>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-12">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-4">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-6">Full Identity</label>
                   <input
                     disabled={!isEditing}
                     name="name"
                     value={formData.name}
                     onChange={handleInputChange}
                     className="w-full bg-slate-50 border-none rounded-[2rem] px-10 py-6 font-bold text-sm focus:ring-4 focus:ring-slate-100 disabled:opacity-50 transition-all placeholder:text-slate-300"
                   />
                </div>
                <div className="space-y-4">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-6">Comm Line</label>
                   <input
                     disabled={!isEditing}
                     name="phone"
                     value={formData.phone}
                     onChange={handleInputChange}
                     className="w-full bg-slate-50 border-none rounded-[2rem] px-10 py-6 font-bold text-sm focus:ring-4 focus:ring-slate-100 disabled:opacity-50 transition-all placeholder:text-slate-300"
                   />
                </div>
             </div>

             <div className="pt-12 border-t border-slate-50 space-y-10">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Logistic Matrix</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   <div className="md:col-span-2 space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-6">Street Protocol</label>
                      <input
                        disabled={!isEditing}
                        name="address.street"
                        value={formData.address.street}
                        onChange={handleInputChange}
                        className="w-full bg-slate-50 border-none rounded-[2rem] px-10 py-6 font-bold text-sm focus:ring-4 focus:ring-slate-100"
                      />
                   </div>
                   <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-6">Metropolis</label>
                      <input
                        disabled={!isEditing}
                        name="address.city"
                        value={formData.address.city}
                        onChange={handleInputChange}
                        className="w-full bg-slate-50 border-none rounded-[2rem] px-10 py-6 font-bold text-sm focus:ring-4 focus:ring-slate-100"
                      />
                   </div>
                   <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-6">Region/State</label>
                      <input
                        disabled={!isEditing}
                        name="address.state"
                        value={formData.address.state}
                        onChange={handleInputChange}
                        className="w-full bg-slate-50 border-none rounded-[2rem] px-10 py-6 font-bold text-sm focus:ring-4 focus:ring-slate-100"
                      />
                   </div>
                </div>
             </div>

             {isEditing && (
                <div className="flex justify-end pt-12">
                   <button
                     disabled={saveLoading}
                     type="submit"
                     className="btn-accent !px-16 !py-6 !rounded-[2rem] uppercase tracking-[0.3em] font-black text-xs shadow-2xl shadow-accent/20"
                   >
                     {saveLoading ? <FiRefreshCw className="animate-spin" /> : 'Confirm Credentials'}
                   </button>
                </div>
             )}
          </form>
        </div>
      )}
    </DashboardLayout>
  )
}


export default UserDashboard
