import React, { useState, useEffect, useCallback } from 'react';
import {
  FiPackage, FiPlus, FiEdit2, FiTrash2, FiEye, FiTrendingUp,
  FiShoppingBag, FiDollarSign, FiStar, FiUsers, FiSettings, FiUser,
  FiImage, FiTag, FiMapPin, FiClock, FiAward, FiShare2, FiBarChart,
  FiMessageCircle, FiRefreshCw, FiCheck, FiMail, FiPhone, FiGlobe, FiX, FiCamera,
  FiActivity, FiZap
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import api from '../../utils/api';
import ChatInbox from '../../components/dashboard/ChatInbox';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import StatCard from '../../components/dashboard/StatCard';

const VendorDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showEditProduct, setShowEditProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [vendorProfile, setVendorProfile] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Form states
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    tags: '',
    materials: '',
    careInstructions: '',
    dimensions: { length: '', width: '', height: '', unit: 'cm' },
    weight: { value: '', unit: 'g' }
  });

  const [profileForm, setProfileForm] = useState({
    shopName: '',
    bio: '',
    tagline: '',
    specialties: '',
    location: { address: '', city: '', state: '', country: '', zipCode: '' },
    experience: { years: '', description: '' },
    contactInfo: { phone: '', email: '', website: '' }
  });

  const categories = [
    'Jewelry', 'Home Decor', 'Art & Prints', 'Clothing', 'Pottery',
    'Textiles', 'Bath & Body', 'Leather', 'Glass', 'Metalwork',
    'Kitchen', 'Garden', 'Beauty', 'Accessories', 'Electronics'
  ];

  // Real-time analytics data
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    revenueToday: 0,
    revenueWeek: 0,
    revenueMonth: 0,
    ordersToday: 0,
    ordersWeek: 0,
    ordersMonth: 0,
    averageOrderValue: 0,
    conversionRate: 0,
    topProducts: [],
    recentActivity: []
  });

  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  // Calculate real category distribution
  const categoryData = products.reduce((acc, p) => {
    const cat = p.category || 'Other';
    const existing = acc.find(item => item.name === cat);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: cat, value: 1 });
    }
    return acc;
  }, []);

  // Calculate weekly sales from orders
  const getWeeklySales = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const salesMap = {};
    days.forEach(d => salesMap[d] = 0);

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    orders.forEach(order => {
      const orderDate = new Date(order.createdAt);
      if (orderDate >= oneWeekAgo) {
        const dayName = days[orderDate.getDay()];
        salesMap[dayName] += (order.vendorOrders?.[0]?.vendorAmount || 0);
      }
    });

    return days.map(d => ({ name: d, sales: Math.round(salesMap[d]) }));
  };

  // Calculate monthly sales from orders
  const getMonthlySales = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const salesMap = {};
    months.forEach(m => salesMap[m] = 0);

    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    orders.forEach(order => {
      const orderDate = new Date(order.createdAt);
      if (orderDate >= oneYearAgo) {
        const monthName = months[orderDate.getMonth()];
        salesMap[monthName] += (order.vendorOrders?.[0]?.vendorAmount || 0);
      }
    });

    return months.map(m => ({ name: m, sales: Math.round(salesMap[m]) }));
  };

  // Calculate real-time analytics
  const calculateAnalytics = useCallback(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const oneMonthAgo = new Date(today);
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    let totalRevenue = 0;
    let revenueToday = 0;
    let revenueWeek = 0;
    let revenueMonth = 0;
    let ordersToday = 0;
    let ordersWeek = 0;
    let ordersMonth = 0;

    orders.forEach(order => {
      const orderDate = new Date(order.createdAt);
      const vendorAmount = order.vendorOrders?.[0]?.vendorAmount || 0;

      totalRevenue += vendorAmount;

      if (orderDate >= today) {
        revenueToday += vendorAmount;
        ordersToday++;
      }
      if (orderDate >= oneWeekAgo) {
        revenueWeek += vendorAmount;
        ordersWeek++;
      }
      if (orderDate >= oneMonthAgo) {
        revenueMonth += vendorAmount;
        ordersMonth++;
      }
    });

    const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
    const conversionRate = products.length > 0 ? (orders.length / products.length) * 100 : 0;

    // Get top selling products
    const productSales = {};
    orders.forEach(order => {
      order.vendorOrders?.[0]?.items?.forEach(item => {
        if (!productSales[item.name]) {
          productSales[item.name] = { name: item.name, sales: 0, revenue: 0 };
        }
        productSales[item.name].sales += item.quantity;
        productSales[item.name].revenue += item.quantity * item.price;
      });
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Recent activity
    const recentActivity = orders.slice(0, 5).map(order => ({
      id: order._id,
      type: 'order',
      message: `Order #${order._id.slice(-6).toUpperCase()} - $${order.vendorOrders?.[0]?.vendorAmount?.toFixed(2)}`,
      time: new Date(order.createdAt).toLocaleString(),
      status: order.vendorOrders?.[0]?.status
    }));

    setAnalytics({
      totalRevenue,
      revenueToday,
      revenueWeek,
      revenueMonth,
      ordersToday,
      ordersWeek,
      ordersMonth,
      averageOrderValue,
      conversionRate,
      topProducts,
      recentActivity
    });
  }, [orders, products]);

  const dynamicSalesData = getWeeklySales();
  const monthlySalesData = getMonthlySales();

  const refreshDashboard = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchProducts(), fetchOrders(), fetchVendorProfile(), fetchUnreadCount()]);
      calculateAnalytics();
      setLastUpdated(new Date());
      toast.success('Dashboard refreshed');
    } catch (error) {
      toast.error('Failed to refresh dashboard');
    } finally {
      setRefreshing(false);
    }
  }, [calculateAnalytics]);

  useEffect(() => {
    fetchProducts();
    fetchOrders();
    fetchVendorProfile();
    fetchUnreadCount();
  }, []);

  // Calculate analytics when orders change
  useEffect(() => {
    if (orders.length > 0) {
      calculateAnalytics();
    }
  }, [orders, calculateAnalytics]);

  // Real-time auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeTab === 'overview') {
        refreshDashboard();
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [activeTab, refreshDashboard]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products/vendor/me');
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders/vendor');
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      setActionLoading(true);
      await api.put(`/orders/${orderId}/vendor-status`, { status });
      toast.success(`Order marked as ${status}`);
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const fetchVendorProfile = async () => {
    try {
      const response = await api.get('/vendors/profile/me');
      if (response.data.profile) {
        setVendorProfile(response.data.profile);
        const p = response.data.profile;
        setProfileForm({
          shopName: p.shopName || '',
          bio: p.bio || '',
          tagline: p.tagline || '',
          specialties: p.specialties?.join(', ') || '',
          location: p.location || { address: '', city: '', state: '', country: '', zipCode: '' },
          experience: p.experience || { years: '', description: '' },
          contactInfo: p.contactInfo || { phone: '', email: '', website: '' }
        });
      }
    } catch (error) {
      if (error.response?.status === 404) setVendorProfile(null);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/chat/unread-count');
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const formData = new FormData();
      Object.keys(productForm).forEach(key => {
        if (typeof productForm[key] === 'object') {
          formData.append(key, JSON.stringify(productForm[key]));
        } else {
          formData.append(key, productForm[key]);
        }
      });

      const images = document.getElementById('product-images').files;
      if (images.length === 0) return toast.error('Upload at least one image');
      Array.from(images).forEach(file => formData.append('images', file));

      await api.post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Product added successfully!');
      setShowAddProduct(false);
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error adding product');
    } finally {
      setActionLoading(false);
    }
  };

  const openEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      stock: product.stock,
      tags: product.tags?.join(', ') || '',
      materials: product.materials?.join(', ') || '',
      careInstructions: product.careInstructions || '',
      dimensions: product.dimensions || { length: '', width: '', height: '', unit: 'cm' },
      weight: product.weight || { value: '', unit: 'g' }
    });
    setShowEditProduct(true);
  };

  const handleEditProduct = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const formData = new FormData();
      Object.keys(productForm).forEach(key => {
        if (typeof productForm[key] === 'object') {
          formData.append(key, JSON.stringify(productForm[key]));
        } else {
          formData.append(key, productForm[key]);
        }
      });

      const images = document.getElementById('edit-images').files;
      if (images.length > 0) {
        Array.from(images).forEach(file => formData.append('images', file));
        formData.append('replaceImages', 'true');
      }

      await api.put(`/products/${editingProduct._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Product updated!');
      setShowEditProduct(false);
      fetchProducts();
    } catch (error) {
      toast.error('Update failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Deleted');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const formData = new FormData();

      // Append basic fields
      formData.append('shopName', profileForm.shopName);
      formData.append('tagline', profileForm.tagline);
      formData.append('bio', profileForm.bio);
      formData.append('specialties', profileForm.specialties);

      // Append nested objects
      formData.append('location', JSON.stringify(profileForm.location));
      formData.append('experience', JSON.stringify(profileForm.experience));
      formData.append('contactInfo', JSON.stringify(profileForm.contactInfo));

      const pImg = document.getElementById('profile-image').files[0];
      const bImg = document.getElementById('banner-image').files[0];

      if (pImg) formData.append('profileImage', pImg);
      if (bImg) formData.append('bannerImage', bImg);

      if (!vendorProfile && !pImg) {
        toast.error('Profile image is required for new accounts');
        return;
      }

      if (vendorProfile) {
        await api.put('/vendors/profile/me', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/vendors/profile', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      toast.success('Profile saved!');
      setShowProfileModal(false);
      fetchVendorProfile();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save profile');
    } finally {
      setActionLoading(false);
    }
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: FiTrendingUp },
    { id: 'products', label: 'Products', icon: FiPackage },
    { id: 'orders', label: 'Orders', icon: FiShoppingBag },
    { id: 'messages', label: 'Messages', icon: FiMessageCircle },
    { id: 'profile', label: 'Profile', icon: FiUser },
    { id: 'settings', label: 'Settings', icon: FiSettings },
  ];

  // Vendor profile sidebar data
  const vendorProfileSidebar = vendorProfile ? {
    name: vendorProfile.shopName || 'Merchant Shop',
    tagline: vendorProfile.tagline || 'Artisan Business',
    image: vendorProfile.profileImage,
    stats: {
      products: products.length,
      orders: orders.length,
      revenue: `$${analytics.totalRevenue.toFixed(2)}`
    }
  } : null;

  const totalSales = orders.reduce((sum, order) => sum + (order.vendorOrders?.[0]?.vendorAmount || 0), 0).toFixed(2);
  const pendingOrders = orders.filter(order => order.vendorOrders?.[0]?.status === 'pending').length;

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab} title="Artisan Command" navItems={navItems} vendorProfileSidebar={vendorProfileSidebar}>
      <div className="space-y-24">
        {/* Profile Alert */}
        {!vendorProfile && (
          <div className="p-8 bg-accent/5 rounded-[2.5rem] border-2 border-accent/10 flex items-center justify-between group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-3xl -mr-32 -mt-32" />
            <div className="flex items-center space-x-8 relative z-10">
              <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-accent/20">
                <FiAward className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-accent">Deployment Pending</span>
                <p className="text-sm font-bold text-slate-900 italic">Complete your workstation profile to initialize marketplace broadcasting.</p>
              </div>
            </div>
            <button onClick={() => setShowProfileModal(true)} className="btn-accent !px-10 !py-4 relative z-10 shadow-2xl shadow-accent/20">Set Up Command Center</button>
          </div>
        )}

        {/* Action Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
          <div className="space-y-8">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 rounded-[2.5rem] overflow-hidden border-4 border-slate-50 shadow-2xl shadow-slate-200">
                {vendorProfile?.profileImage ? (
                  <img src={vendorProfile.profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-300"><FiUser size={40} /></div>
                )}
              </div>
              <div className="space-y-2">
                <span className="text-accent font-black tracking-[0.3em] uppercase text-[10px]">Merchant Intelligence</span>
                <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">{vendorProfile?.shopName || 'Workshop Alpha'}</h1>
                <div className="flex items-center space-x-4">
                  <p className="text-slate-400 font-medium italic">{vendorProfile?.tagline || 'Strategic Artisan Operations'}</p>
                  {refreshing && (
                    <div className="flex items-center space-x-2 text-accent">
                      <FiRefreshCw className="w-3 h-3 animate-spin" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Syncing Matrix</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="text-right hidden md:block">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Matrix Status</p>
              <div className="flex items-center space-x-2 justify-end">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Connected</span>
              </div>
            </div>
            <button onClick={() => setShowAddProduct(true)} className="btn-accent !px-12 !py-6 !rounded-[2rem] shadow-2xl shadow-accent/20">
              <FiPlus className="inline-block mr-3 w-5 h-5" /> <span>Deploy Artifact</span>
            </button>
          </div>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-24">
            {/* Real-time Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
              <StatCard title="Total Artifacts" value={products.length} icon={FiPackage} color="slate" />
              <StatCard title="Strategic Revenue" value={`$${analytics.totalRevenue.toFixed(0)}`} icon={FiDollarSign} color="slate" />
              <StatCard title="Acquisitions" value={orders.length} icon={FiShoppingBag} color="slate" />
              <StatCard title="Execution Pending" value={pendingOrders} icon={FiClock} color="slate" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
              {/* Analysis & Visualization */}
              <div className="lg:col-span-8 space-y-12">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase tracking-widest text-[10px]">Strategic Analysis</h3>
                  <div className="flex items-center space-x-8">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-accent rounded-full" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Weekly Ops</span>
                    </div>
                  </div>
                </div>

                <div className="p-12 bg-white border-2 border-slate-50 rounded-[4rem] shadow-3xl shadow-slate-100 transition-all duration-500 hover:border-slate-100">
                  <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={dynamicSalesData}>
                        <defs>
                          <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0F172A" stopOpacity={0.1} />
                            <stop offset="95%" stopColor="#0F172A" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} dy={20} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} dx={-10} />
                        <Tooltip
                          contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '10px' }}
                          itemStyle={{ color: '#0F172A' }}
                        />
                        <Area type="monotone" dataKey="sales" stroke="#0F172A" strokeWidth={4} fillOpacity={1} fill="url(#colorSales)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Activity Stream */}
              <div className="lg:col-span-4 space-y-12">
                <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase tracking-widest text-[10px]">Operations Log</h3>
                <div className="space-y-6">
                  {analytics.recentActivity.length > 0 ? (
                    analytics.recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-start space-x-6 group">
                        <div className={`p-4 rounded-2xl ${activity.status === 'delivered' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-400'
                          } transition-all duration-500 group-hover:scale-110`}>
                          <FiShoppingBag className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-black text-slate-900 leading-tight">{activity.message}</p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{activity.time}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400 text-sm italic py-10">No operational data detected in the current cycle.</p>
                  )}
                </div>

                <div className="pt-10 border-t border-slate-50">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 italic">Artifact Distribution</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {categoryData.slice(0, 4).map((item, i) => (
                      <div key={i} className="p-6 bg-slate-50 rounded-[2rem] space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">{item.name}</p>
                        <p className="text-xl font-black text-slate-900">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}


        {activeTab === 'products' && (
          <div className="space-y-16">
            <div className="flex items-center justify-between">
              <h3 className="text-3xl font-black text-slate-900 tracking-tight italic">Artifact <span className="text-gradient">Portfolio</span></h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{products.length} Items Live</p>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-48 bg-slate-50 rounded-[4rem] space-y-10 group">
                <div className="w-32 h-32 bg-white rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl shadow-slate-200 group-hover:scale-110 transition-transform duration-700">
                  <FiPackage size={48} className="text-slate-100" />
                </div>
                <div className="space-y-4">
                  <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest text-xs">Vanguard Inventory Empty</h2>
                  <p className="text-slate-400 font-medium italic max-w-sm mx-auto leading-relaxed">Begin your merchant legacy by deploying your first handcrafted artifact to the global matrix.</p>
                </div>
                <button onClick={() => setShowAddProduct(true)} className="btn-accent !px-16 !py-6 !rounded-[2rem] shadow-2xl shadow-accent/20">Initialize Deployment</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
                {products.map(product => (
                  <div key={product._id} className="group bg-white rounded-[3rem] border-4 border-slate-50 overflow-hidden hover:border-slate-100 transition-all duration-500 shadow-3xl shadow-slate-100/50">
                    <div className="relative h-72 bg-slate-50">
                      {product.images?.[0] ? (
                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-200"><FiImage size={40} /></div>
                      )}
                      <div className="absolute top-6 left-6">
                        <span className="px-5 py-2 bg-white/90 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-widest text-slate-900 shadow-xl">{product.category}</span>
                      </div>
                    </div>

                    <div className="p-8 space-y-8">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <h4 className="font-black text-slate-900 text-xl tracking-tighter leading-none">{product.name}</h4>
                          <span className="text-xl font-black text-accent italic">${product.price}</span>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 truncate">{product.stock} Units in Reserve</p>
                      </div>

                      <div className="flex items-center space-x-3">
                        <button onClick={() => openEditProduct(product)} className="flex-1 py-4 bg-slate-950 text-white rounded-[1.5rem] text-[10px] uppercase font-black tracking-widest hover:bg-slate-800 transition-all active:scale-95">Reconfigure</button>
                        <button onClick={() => handleDeleteProduct(product._id)} className="w-14 h-14 bg-slate-50 rounded-[1.5rem] flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all active:scale-95">
                          <FiTrash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-16">
            <div className="flex items-center justify-between">
              <h3 className="text-3xl font-black text-slate-900 tracking-tight italic">Acquisition <span className="text-gradient">Manifest</span></h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{orders.length} Protocols Active</p>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-48 bg-slate-50 rounded-[4rem] space-y-10">
                <FiShoppingBag size={80} className="mx-auto text-slate-100" />
                <div className="space-y-4">
                  <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest text-xs">Awaiting Market Orders</h2>
                  <p className="text-slate-400 font-medium italic">Your acquisition protocols will materialize here upon customer engagement.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-12">
                {orders.map(order => (
                  <div key={order._id} className="bg-white rounded-[4rem] border-4 border-slate-50 overflow-hidden shadow-3xl shadow-slate-100/50 group hover:border-slate-100 transition-all duration-500">
                    <div className="px-12 py-8 bg-slate-50/50 backdrop-blur-md flex flex-wrap justify-between items-center gap-8 border-b border-slate-50">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-accent uppercase tracking-[0.3em]">Protocol Reference</span>
                        <h4 className="text-2xl font-black text-slate-900 tracking-tighter italic">#{order._id.slice(-8).toUpperCase()}</h4>
                      </div>
                      <div className="text-right space-y-1 px-10 py-4 bg-white rounded-[2rem] shadow-xl shadow-slate-200">
                        <p className="text-2xl font-black text-slate-900 leading-none italic">${order.vendorOrders?.[0]?.vendorAmount.toFixed(0)}</p>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Net Intelligence</p>
                      </div>
                    </div>

                    <div className="p-12 space-y-12">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                        <div className="space-y-8">
                          <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Order Artifacts</h5>
                          <div className="space-y-6">
                            {order.vendorOrders?.[0]?.items.map((item, idx) => (
                              <div key={idx} className="flex items-center space-x-6 group/item">
                                <div className="w-20 h-20 rounded-[1.5rem] bg-slate-50 overflow-hidden shadow-inner group-hover/item:scale-105 transition-transform duration-500">
                                  {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                                </div>
                                <div className="space-y-1">
                                  <p className="font-black text-slate-900 text-lg tracking-tight leading-none">{item.name}</p>
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Units: {item.quantity} — Strategic Value: ${item.price}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-8">
                          <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Protocol Execution</h5>
                          <div className="flex flex-wrap gap-4">
                            {['pending', 'confirmed', 'processing', 'shipped', 'delivered'].map((status) => (
                              <button
                                key={status}
                                disabled={actionLoading}
                                onClick={() => updateOrderStatus(order._id, status)}
                                className={`px-8 py-4 rounded-[1.5rem] text-[9px] font-black uppercase tracking-[0.3em] transition-all duration-500 active:scale-95 ${order.vendorOrders?.[0]?.status === status
                                  ? 'bg-slate-950 text-white shadow-2xl shadow-slate-400'
                                  : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-900'
                                  }`}
                              >
                                {status}
                              </button>
                            ))}
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
        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="h-[70vh] rounded-[4rem] overflow-hidden border-8 border-slate-50 shadow-3xl shadow-slate-100 bg-white">
            <ChatInbox />
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-16">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-accent">Store Identity</span>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight italic">Store <span className="text-gradient">Profile</span></h3>
              </div>
              <button onClick={() => setShowProfileModal(true)} className="btn-accent !px-10 !py-4 shadow-2xl shadow-accent/20">
                {vendorProfile ? 'Edit Profile' : 'Create Profile'}
              </button>
            </div>

            {!vendorProfile ? (
              <div className="text-center py-48 bg-slate-50 rounded-[4rem] space-y-10 group">
                <div className="w-32 h-32 bg-white rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl shadow-slate-200 group-hover:scale-110 transition-transform duration-700">
                  <FiUser size={48} className="text-slate-200" />
                </div>
                <div className="space-y-4">
                  <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest text-xs">No Store Profile Found</h2>
                  <p className="text-slate-400 font-medium italic max-w-sm mx-auto leading-relaxed">Setup your store profile so customers can discover your shop and products.</p>
                </div>
                <button onClick={() => setShowProfileModal(true)} className="btn-accent !px-16 !py-6 !rounded-[2rem] shadow-2xl shadow-accent/20">
                  Setup Store Profile
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                {/* Left: Profile Card */}
                <div className="lg:col-span-4 space-y-12">
                  {/* Banner */}
                  <div className="relative rounded-[3rem] overflow-hidden shadow-3xl shadow-slate-200">
                    <div className="h-40 bg-gradient-to-br from-slate-800 to-slate-950 overflow-hidden">
                      {vendorProfile?.bannerImage && (
                        <img src={vendorProfile.bannerImage} alt="Banner" className="w-full h-full object-cover opacity-60" />
                      )}
                    </div>
                    <div className="bg-white px-10 pb-10">
                      <div className="w-28 h-28 rounded-[1.5rem] overflow-hidden border-4 border-white shadow-2xl -mt-14 mb-6">
                        {vendorProfile?.profileImage ? (
                          <img src={vendorProfile.profileImage} alt="Shop" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 font-black text-3xl">
                            {vendorProfile?.shopName?.charAt(0) || '?'}
                          </div>
                        )}
                      </div>
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight">{vendorProfile?.shopName || 'My Shop'}</h2>
                      <p className="text-accent font-bold text-sm mt-1 italic">{vendorProfile?.tagline || 'No tagline set'}</p>
                      <p className="text-slate-500 text-sm mt-4 leading-relaxed">{vendorProfile?.bio || 'No bio added yet.'}</p>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: 'Products', value: products.length },
                      { label: 'Orders', value: orders.length },
                      { label: 'Revenue', value: `$${analytics.totalRevenue.toFixed(0)}` }
                    ].map((stat, i) => (
                      <div key={i} className="p-6 bg-slate-50 rounded-[2rem] text-center space-y-1">
                        <p className="text-xl font-black text-slate-900">{stat.value}</p>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Details */}
                <div className="lg:col-span-8 space-y-10">
                  {/* Contact Info */}
                  <div className="p-10 bg-white border-2 border-slate-50 rounded-[3rem] shadow-xl shadow-slate-100 space-y-8">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Contact Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {[
                        { label: 'Email', value: vendorProfile?.contactInfo?.email, icon: FiMail },
                        { label: 'Phone', value: vendorProfile?.contactInfo?.phone, icon: FiPhone },
                        { label: 'Website', value: vendorProfile?.contactInfo?.website, icon: FiGlobe }
                      ].map((item, i) => (
                        <div key={i} className="flex items-center space-x-4 p-6 bg-slate-50 rounded-[2rem]">
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-md">
                            <item.icon className="w-4 h-4 text-slate-600" />
                          </div>
                          <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{item.label}</p>
                            <p className="text-sm font-bold text-slate-900 truncate">{item.value || '—'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Location */}
                  <div className="p-10 bg-white border-2 border-slate-50 rounded-[3rem] shadow-xl shadow-slate-100 space-y-6">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-2"><FiMapPin /> Location</h4>
                    <p className="text-slate-700 font-medium">
                      {[vendorProfile?.location?.address, vendorProfile?.location?.city, vendorProfile?.location?.state, vendorProfile?.location?.country]
                        .filter(Boolean).join(', ') || 'No location set'}
                    </p>
                  </div>

                  {/* Specialties */}
                  {vendorProfile?.specialties?.length > 0 && (
                    <div className="p-10 bg-white border-2 border-slate-50 rounded-[3rem] shadow-xl shadow-slate-100 space-y-6">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-2"><FiStar /> Specialties</h4>
                      <div className="flex flex-wrap gap-3">
                        {vendorProfile.specialties.map((s, i) => (
                          <span key={i} className="px-5 py-2 bg-slate-950 text-white rounded-full text-[9px] font-black uppercase tracking-widest">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Member Since */}
                  <div className="p-8 bg-slate-50 rounded-[2rem] flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Member Since</span>
                    <span className="font-black text-slate-900">{vendorProfile?.createdAt ? new Date(vendorProfile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-24">
            <div className="flex items-center justify-between">
              <h3 className="text-3xl font-black text-slate-900 tracking-tight italic">Workshop <span className="text-gradient">Infrastructure</span></h3>
              <button onClick={() => setShowProfileModal(true)} className="btn-accent !px-10">Initialize Edit</button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
              {/* Identity Matrix */}
              <div className="lg:col-span-5 space-y-12">
                <div className="p-12 bg-slate-950 rounded-[4rem] text-white space-y-12 shadow-3xl shadow-slate-200 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 blur-3xl -mr-32 -mt-32" />
                  <div className="flex flex-col items-center text-center space-y-8 relative z-10">
                    <div className="w-40 h-40 rounded-[3rem] overflow-hidden border-8 border-white/5 shadow-2xl bg-white/5">
                      {vendorProfile?.profileImage ? (
                        <img src={vendorProfile.profileImage} alt="Shop" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/20 font-black text-4xl">{vendorProfile?.shopName?.charAt(0)}</div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-3xl font-black tracking-tight italic">{vendorProfile?.shopName || 'Workshop Zero'}</h2>
                      <p className="text-accent font-black text-[10px] uppercase tracking-[0.4em]">Verified High-End Merchant</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-12 relative z-10">
                    <div className="p-6 bg-white/5 rounded-[2rem] space-y-1">
                      <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Global Rank</p>
                      <p className="text-xl font-black">Top 1%</p>
                    </div>
                    <div className="p-6 bg-white/5 rounded-[2rem] space-y-1">
                      <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Ops Year</p>
                      <p className="text-xl font-black">{new Date(vendorProfile?.createdAt).getFullYear() || 2024}</p>
                    </div>
                  </div>
                </div>

                <div className="p-12 bg-slate-50 rounded-[4rem] space-y-10">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Communication Nodes</h3>
                  <div className="space-y-8">
                    {[
                      { l: 'Direct Link', v: vendorProfile?.contactInfo?.email, i: FiMail },
                      { l: 'Secure Voice', v: vendorProfile?.contactInfo?.phone, i: FiPhone },
                      { l: 'Matrix Portal', v: vendorProfile?.contactInfo?.website || 'artisan.io/secure', i: FiGlobe }
                    ].map((node, i) => (
                      <div key={i} className="flex items-center space-x-6">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-900 shadow-xl shadow-slate-200"><node.i className="w-5 h-5" /></div>
                        <div className="space-y-1">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{node.l}</p>
                          <p className="text-sm font-bold text-slate-900">{node.v || 'Restricted'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Protocol Logistics */}
              <div className="lg:col-span-7 space-y-12">
                <div className="p-16 bg-white border-4 border-slate-50 rounded-[4rem] shadow-3xl shadow-slate-100">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-12">Business Directive</h3>
                  <div className="space-y-16">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Merchant Bio</label>
                      <p className="text-xl font-medium text-slate-600 leading-relaxed italic">{vendorProfile?.bio || 'Establishing dominance in the artisan matrix...'}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center"><FiMapPin className="mr-3" /> HQ Coordinates</label>
                        <p className="text-lg font-black text-slate-900 leading-tight">
                          {vendorProfile?.location?.address}<br />
                          {vendorProfile?.location?.city}, {vendorProfile?.location?.country}
                        </p>
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center"><FiStar className="mr-3" /> Core Specializations</label>
                        <div className="flex flex-wrap gap-3">
                          {vendorProfile?.specialties?.map((s, i) => (
                            <span key={i} className="px-5 py-2 bg-slate-950 text-white rounded-full text-[9px] font-black uppercase tracking-widest">{s}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modals: Artifact Deployment & Identity Matrix */}
        <AnimatePresence>
          {(showAddProduct || showEditProduct) && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex flex-col items-center p-4 sm:p-8 bg-slate-950/40 backdrop-blur-3xl overflow-y-auto"
            >
              <motion.div
                initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                className="bg-white w-full max-w-6xl rounded-[4rem] shadow-4xl shadow-slate-900/20 overflow-hidden my-auto"
              >
                <div className="flex justify-between items-center p-12 bg-slate-50">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-accent">Artifact Management</span>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter italic">{showEditProduct ? 'Reconfigure Artifact' : 'Deploy New Artifact'}</h2>
                  </div>
                  <button onClick={() => { setShowAddProduct(false); setShowEditProduct(false); }} className="w-16 h-16 bg-white rounded-[1.5rem] flex items-center justify-center shadow-xl hover:scale-110 transition-transform"><FiX size={24} /></button>
                </div>

                <form onSubmit={showEditProduct ? handleEditProduct : handleAddProduct} className="p-16 space-y-16 max-h-[60vh] overflow-y-auto">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    <div className="lg:col-span-8 space-y-12">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-8">Identification Label</label>
                        <input type="text" className="w-full px-10 py-6 bg-slate-50 border-none rounded-[2rem] font-bold text-lg focus:ring-4 focus:ring-slate-100 transition-all" value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} required />
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-8">Functional Description</label>
                        <textarea rows={6} className="w-full px-10 py-8 bg-slate-50 border-none rounded-[3rem] font-medium text-lg leading-relaxed italic focus:ring-4 focus:ring-slate-100 transition-all" value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })} required />
                      </div>
                    </div>

                    <div className="lg:col-span-4 space-y-12">
                      <div className="space-y-4 text-center">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Strategic Value ($)</label>
                        <input type="number" step="0.01" className="w-full py-10 bg-slate-50 border-none rounded-[3rem] font-black text-accent text-6xl text-center focus:ring-4 focus:ring-slate-100" value={productForm.price} onChange={e => setProductForm({ ...productForm, price: e.target.value })} required />
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-8">Reserve Count</label>
                        <input type="number" className="w-full px-10 py-6 bg-slate-50 border-none rounded-[2rem] font-black text-lg focus:ring-4 focus:ring-slate-100" value={productForm.stock} onChange={e => setProductForm({ ...productForm, stock: e.target.value })} required />
                      </div>
                    </div>

                    <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-12 pt-12 border-t border-slate-50">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-8">Class Selection</label>
                        <select className="w-full px-10 py-6 bg-slate-50 border-none rounded-[2rem] font-black uppercase tracking-widest text-xs" value={productForm.category} onChange={e => setProductForm({ ...productForm, category: e.target.value })} required>
                          <option value="">Choose Class...</option>
                          {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div className="md:col-span-2 space-y-4 text-center">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Visual Matrix Deployment</label>
                        <div className="relative group">
                          <input id={showEditProduct ? 'edit-images' : 'product-images'} type="file" multiple className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer" />
                          <div className="w-full py-10 bg-slate-950 text-white rounded-[3rem] flex items-center justify-center font-black uppercase tracking-[0.4em] text-[10px] group-hover:bg-slate-800 transition-all shadow-2xl shadow-slate-400">
                            <FiImage className="mr-4 w-5 h-5 text-accent" /> {showEditProduct ? 'Replace Visual Data' : 'Upload Artifact Visuals'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-12">
                    <button type="submit" disabled={actionLoading} className="btn-accent !px-20 !py-8 !rounded-[2.5rem] !text-sm shadow-3xl shadow-accent/20">
                      {actionLoading ? <FiRefreshCw className="animate-spin" /> : showEditProduct ? 'Confirm Configuration' : 'Confirm Deployment'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}

          {showProfileModal && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex flex-col items-center p-4 sm:p-8 bg-slate-950/40 backdrop-blur-3xl overflow-y-auto"
            >
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="my-auto w-full max-w-4xl bg-white rounded-[4rem] shadow-4xl shadow-slate-900/20 relative p-10 md:p-16">
                <div className="space-y-1 mb-16">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-accent">Identity Establishment</span>
                  <h2 className="text-4xl font-black text-slate-900 tracking-tighter italic">Establish Command Identity</h2>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-12">
                  <div className="grid grid-cols-2 gap-12  ">
                    <div className="col-span-2 space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-8">Workshop Designation</label>
                      <input type="text" className="w-full px-10 py-6 bg-slate-50 border-none rounded-[2rem] font-bold text-lg" value={profileForm.shopName} onChange={e => setProfileForm({ ...profileForm, shopName: e.target.value })} required placeholder="e.g. Zenith Artisans" />
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-8">Profile Vector</label>
                      <div className="relative group">
                        <input type="file" id="profile-image" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                        <div className="py-6 bg-slate-50 rounded-[2rem] text-center font-black uppercase tracking-widest text-[9px] text-slate-400 group-hover:bg-slate-100 transition-all border-2 border-dashed border-slate-200">Select Profile</div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-8">Banner Vector</label>
                      <div className="relative group">
                        <input type="file" id="banner-image" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                        <div className="py-6 bg-slate-50 rounded-[2rem] text-center font-black uppercase tracking-widest text-[9px] text-slate-400 group-hover:bg-slate-100 transition-all border-2 border-dashed border-slate-200">Select Banner</div>
                      </div>
                    </div>

                    <div className="col-span-2 space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-8">HQ Coordinates</label>
                      <input type="text" className="w-full px-10 py-6 bg-slate-50 border-none rounded-[2rem] font-bold" value={profileForm.location.address} onChange={e => setProfileForm({ ...profileForm, location: { ...profileForm.location, address: e.target.value } })} required />
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-8">Secure Line</label>
                      <input type="text" className="w-full px-10 py-6 bg-slate-50 border-none rounded-[2rem] font-bold" value={profileForm.contactInfo.phone} onChange={e => setProfileForm({ ...profileForm, contactInfo: { ...profileForm.contactInfo, phone: e.target.value } })} />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-8">Matrix Email</label>
                      <input type="email" className="w-full px-10 py-6 bg-slate-50 border-none rounded-[2rem] font-bold" value={profileForm.contactInfo.email} onChange={e => setProfileForm({ ...profileForm, contactInfo: { ...profileForm.contactInfo, email: e.target.value } })} />
                    </div>
                  </div>

                  <div className="pt-12 flex space-x-6">
                    <button type="button" onClick={() => setShowProfileModal(false)} className="flex-1 py-6 bg-slate-50 text-slate-400 rounded-[2rem] font-black uppercase tracking-widest text-[10px] hover:bg-slate-100">Cancel</button>
                    <button type="submit" disabled={actionLoading} className="flex-[2] py-6 bg-slate-950 text-white rounded-[2rem] font-black uppercase tracking-[0.3em] text-[10px] shadow-3xl shadow-slate-400">
                      {actionLoading ? <FiRefreshCw className="animate-spin mx-auto" /> : 'Confirm Workshop Profile'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </DashboardLayout>
  );
};

export default VendorDashboard;
