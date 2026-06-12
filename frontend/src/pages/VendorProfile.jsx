import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { FaStar, FaMapMarkerAlt, FaHeart, FaEye, FaInstagram, FaFacebook, FaGlobe, FaArrowLeft, FaShoppingBag, FaUsers, FaAward } from 'react-icons/fa'
import { FiMessageCircle } from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext'
import CustomerMessaging from '../components/messaging/CustomerMessaging'
import FollowButton from '../components/common/FollowButton'
import VendorReviewForm from '../components/VendorReviewForm'

const VendorProfile = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [vendor, setVendor] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showMessaging, setShowMessaging] = useState(false)
  const [activeTab, setActiveTab] = useState('about')
  const [realtimeStats, setRealtimeStats] = useState(null)
  const [vendorReviews, setVendorReviews] = useState([])
  const [reviewStats, setReviewStats] = useState({})
  const [userVendorReview, setUserVendorReview] = useState(null)
  const [showReviewForm, setShowReviewForm] = useState(false)

  useEffect(() => {
    if (id) {
      fetchVendorProfile()
      fetchVendorProducts()
      fetchRealtimeStats()
    }
  }, [id, user])

  useEffect(() => {
    if (vendor && vendor.userId) {
      fetchVendorReviews()
      checkUserVendorReview()
    }
  }, [vendor, user])

  const fetchVendorProfile = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/vendors/profile/id/${id}`)
      if (response.ok) {
        const data = await response.json()
        if (data.profile) {
          const transformedVendor = {
            ...data.profile,
            userId: data.profile.userId,
            user: data.profile.userId,
            rating: data.profile.stats?.averageRating || 0,
            stats: {
              totalProducts: data.profile.stats?.totalProducts || 0,
              totalFollowers: data.profile.stats?.followerCount || 0,
              totalSales: data.profile.stats?.totalSales || 0,
              totalReviews: data.profile.stats?.reviewCount || 0
            }
          }
          setVendor(transformedVendor)
        }
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const fetchVendorProducts = async () => {
    try {
      const response = await fetch(`/api/products/vendor/${id}?limit=12`)
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
      }
    } catch (error) {
      console.error(error)
    }
  }

  const fetchRealtimeStats = async () => {
    try {
      const response = await fetch(`/api/vendors/${id}/stats/public`)
      if (response.ok) {
        const data = await response.json()
        setRealtimeStats(data.stats)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const fetchVendorReviews = async () => {
    try {
      const vendorId = vendor?.userId
        ? (typeof vendor.userId === 'string' ? vendor.userId : (vendor.userId._id || vendor.userId.id || id))
        : id;
      const response = await fetch(`/api/vendor-reviews/vendor/${vendorId}`)
      if (response.ok) {
        const data = await response.json()
        setVendorReviews(data.reviews || [])
        setReviewStats(data.stats || {})
        setRealtimeStats(prev => ({
          ...prev,
          averageRating: data.stats.averageOverallRating || 0,
          reviewCount: data.stats.totalReviews || 0
        }))
      }
    } catch (error) {
      console.error(error)
    }
  }

  const checkUserVendorReview = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token || !user) return
      const vendorId = vendor?.userId
        ? (typeof vendor.userId === 'string' ? vendor.userId : (vendor.userId._id || vendor.userId.id || id))
        : id;
      const response = await fetch(`/api/vendor-reviews/vendor/${vendorId}`)
      if (response.ok) {
        const data = await response.json()
        const currentUserId = user.id || user._id || user.userId
        const currentUserReview = data.reviews.find(review => {
          const reviewCustomerId = typeof review.customer === 'object'
            ? review.customer._id || review.customer.id
            : review.customer
          return reviewCustomerId === currentUserId
        })
        if (currentUserReview) setUserVendorReview(currentUserReview)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleReviewSubmitted = async () => {
    await fetchVendorReviews()
    await checkUserVendorReview()
    setShowReviewForm(false)
  }

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FaStar
        key={i}
        className={`w-3 h-3 ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-slate-100'}`}
      />
    ))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-32">
        <div className="container mx-auto px-6 space-y-12 animate-pulse">
           <div className="h-96 bg-slate-50 rounded-[4rem]"></div>
           <div className="h-64 bg-slate-50 rounded-[3rem]"></div>
        </div>
      </div>
    )
  }

  if (!vendor) {
     return (
        <div className="min-h-screen bg-white py-32 flex items-center justify-center">
           <div className="text-center max-w-xl px-6">
              <h2 className="text-6xl font-black text-slate-900 mb-8 tracking-tight leading-none">Artisan not <span className="text-gradient">found</span></h2>
              <p className="text-xl text-slate-500 mb-12">The studio you're looking for might have been relocated or deactivated.</p>
              <Link to="/artisans" className="btn-accent !px-12">Return to Collective</Link>
           </div>
        </div>
     )
  }

  return (
    <div className="min-h-screen bg-white py-32">
      <div className="container mx-auto px-6">
        {/* Banner Card */}
        <div className="relative rounded-[4rem] overflow-hidden mb-24 shadow-3xl shadow-slate-100">
           <div className="h-[50vh] relative">
              <img 
                src={vendor.bannerImage || 'https://images.unsplash.com/photo-1456086272160-b28b0645b729?auto=format&fit=crop&q=80&w=2000'}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
              
              <div className="absolute bottom-16 left-16 right-16 flex flex-col md:flex-row md:items-end justify-between gap-10">
                 <div className="flex items-center space-x-10">
                    <div className="w-32 h-32 md:w-48 md:h-48 rounded-[3.5rem] border-[12px] border-white/10 shadow-2xl overflow-hidden bg-white/5 backdrop-blur-3xl">
                       <img src={vendor.profileImage} className="w-full h-full object-cover" />
                    </div>
                    <div className="text-white space-y-4">
                       <div className="flex items-center space-x-4">
                          <span className="text-accent font-black tracking-[0.3em] uppercase text-[10px]">Prime Artisan</span>
                          <div className="flex items-center space-x-2">
                             {renderStars(reviewStats.averageOverallRating || 0)}
                             <span className="text-[10px] font-black uppercase tracking-widest text-white/50">({reviewStats.totalReviews || 0} reviews)</span>
                          </div>
                       </div>
                       <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none">{vendor.shopName}</h1>
                       <p className="text-xl font-bold text-white/60">by {vendor.user?.name}</p>
                    </div>
                 </div>
                 
                 <div className="flex items-center space-x-6">
                    <FollowButton
                      vendorId={vendor?.userId ? (typeof vendor.userId === 'string' ? vendor.userId : (vendor.userId._id || id)) : id}
                      initialFollowersCount={vendor.stats?.totalFollowers || 0}
                      className="!bg-white !text-slate-900 !px-12 !py-6 !rounded-3xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-transform"
                    />
                    <button 
                      onClick={() => setShowMessaging(true)}
                      className="p-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl text-white hover:bg-white hover:text-slate-900 transition-all duration-500"
                    >
                      <FiMessageCircle className="w-6 h-6" />
                    </button>
                 </div>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-start">
           {/* Sidebar: Stats & Connect */}
           <div className="lg:col-span-4 space-y-12">
              <div className="p-12 bg-slate-50 rounded-[4rem] space-y-12">
                 <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase tracking-widest text-[10px] text-slate-400">Studio Performance</h3>
                 <div className="grid grid-cols-2 gap-10">
                    <div className="space-y-2">
                       <span className="text-4xl font-black text-slate-900 tracking-tighter leading-none">{realtimeStats?.totalProducts || 0}</span>
                       <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Artifacts</p>
                    </div>
                    <div className="space-y-2">
                       <span className="text-4xl font-black text-slate-900 tracking-tighter leading-none">{realtimeStats?.totalFollowers || 0}</span>
                       <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Followers</p>
                    </div>
                    <div className="space-y-2">
                       <span className="text-4xl font-black text-slate-900 tracking-tighter leading-none">{realtimeStats?.totalSales ? `$${realtimeStats.totalSales}` : '--'}</span>
                       <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Sales Tier</p>
                    </div>
                    <div className="space-y-2">
                       <span className="text-4xl font-black text-slate-900 tracking-tighter leading-none">{reviewStats?.totalReviews || 0}</span>
                       <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Endorsements</p>
                    </div>
                 </div>
              </div>

              <div className="p-12 bg-slate-950 rounded-[4rem] text-white space-y-10 shadow-3xl shadow-slate-200">
                 <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Global Communication</h4>
                 <div className="flex space-x-6">
                    {[FaInstagram, FaFacebook, FaGlobe].map((Icon, i) => (
                       <a key={i} href="#" className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-white hover:text-slate-900 transition-all duration-500 group">
                          <Icon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                       </a>
                    ))}
                 </div>
                 {vendor.location?.address && (
                    <div className="pt-10 border-t border-white/5 flex items-start space-x-4">
                       <FaMapMarkerAlt className="w-5 h-5 text-slate-500 mt-1" />
                       <span className="text-sm font-bold text-slate-300 leading-relaxed">{vendor.location.address}</span>
                    </div>
                 )}
              </div>
           </div>

           {/* Main Content: Tabs & Lists */}
           <div className="lg:col-span-8 space-y-16">
              <nav className="flex space-x-12 border-b border-slate-50">
                 {['about', 'products', 'reviews'].map((t) => (
                    <button
                      key={t}
                      onClick={() => setActiveTab(t)}
                      className={`pb-8 text-[11px] font-black uppercase tracking-[0.3em] transition-all relative ${activeTab === t ? 'text-slate-900' : 'text-slate-300 hover:text-slate-500'}`}
                    >
                      {t}
                      {activeTab === t && <div className="absolute bottom-0 left-0 right-0 h-1 bg-accent rounded-full animate-tab-in" />}
                    </button>
                 ))}
              </nav>

              <div className="animate-fade-in">
                 {activeTab === 'about' && (
                    <div className="space-y-12">
                       <div className="space-y-6">
                          <h3 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Studio <span className="text-gradient">Philosophy</span></h3>
                          <p className="text-2xl text-slate-500 font-medium leading-relaxed italic">
                             "{vendor.bio || 'We believe in the resonance between raw materials and human experience.'}"
                          </p>
                       </div>
                       {vendor.specialties?.length > 0 && (
                          <div className="space-y-6">
                             <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Curatorial Specialties</h4>
                             <div className="flex flex-wrap gap-4">
                                {vendor.specialties.map((s, i) => (
                                   <span key={i} className="px-8 py-3 bg-slate-50 text-slate-900 rounded-2xl text-xs font-black uppercase tracking-widest">{s}</span>
                                ))}
                             </div>
                          </div>
                       )}
                    </div>
                 )}

                 {activeTab === 'products' && (
                    <div className="space-y-12">
                       <h3 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Featured <span className="text-gradient">Artifacts</span></h3>
                       {products.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                             {products.map((p) => (
                                <Link key={p._id} to={`/products/${p._id}`} className="group block">
                                   <div className="aspect-[4/5] rounded-[3rem] overflow-hidden bg-slate-50 mb-6 shadow-2xl shadow-slate-100 group-hover:shadow-slate-200 transition-all duration-700">
                                      <img src={p.images?.[0] || p.image} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                                   </div>
                                   <div className="px-4 flex justify-between items-start">
                                      <h4 className="font-black text-slate-900 text-xl tracking-tight pr-4">{p.name}</h4>
                                      <span className="font-black text-accent text-xl tracking-tighter">${p.price}</span>
                                   </div>
                                </Link>
                             ))}
                          </div>
                       ) : (
                          <div className="py-32 text-center bg-slate-50 rounded-[4rem]">
                             <FaShoppingBag className="w-16 h-16 text-slate-100 mx-auto mb-8" />
                             <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No active listings available</p>
                          </div>
                       )}
                    </div>
                 )}

                 {activeTab === 'reviews' && (
                    <div className="space-y-16">
                       <div className="flex justify-between items-center">
                          <h3 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Public <span className="text-gradient">Endorsements</span></h3>
                          {user?.role === 'customer' && !userVendorReview && (
                             <button onClick={() => setShowReviewForm(true)} className="btn-accent !py-6 !px-10 !rounded-3xl uppercase tracking-widest font-black text-[10px]">Provide Testimony</button>
                          )}
                       </div>

                       {showReviewForm && (
                          <div className="bg-slate-50 p-12 rounded-[3.5rem] border-4 border-slate-100 animate-slide-up">
                             <VendorReviewForm vendorId={vendor?.userId?._id || vendor?.userId || id} onReviewSubmitted={handleReviewSubmitted} userReview={userVendorReview} />
                          </div>
                       )}

                       {vendorReviews.length > 0 ? (
                          <div className="space-y-10">
                             {vendorReviews.map((r) => (
                                <div key={r._id} className="p-12 bg-white rounded-[3.5rem] border border-slate-50 shadow-2xl shadow-slate-50 space-y-8 group hover:border-slate-100 transition-all duration-500">
                                   <div className="flex justify-between items-start">
                                      <div className="flex items-center space-x-6">
                                         <div className="w-16 h-16 rounded-2xl bg-slate-950 text-white flex items-center justify-center font-black text-xl shadow-xl shadow-slate-200 uppercase">{r.customerName?.charAt(0)}</div>
                                         <div>
                                            <h5 className="font-black text-slate-900 text-lg tracking-tight mb-1">{r.customerName || 'Anonymous Collector'}</h5>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                                         </div>
                                      </div>
                                      <div className="flex items-center space-x-2 bg-slate-50 px-4 py-2 rounded-2xl">
                                         {renderStars(r.overallRating)}
                                         <span className="text-[10px] font-black text-slate-900 ml-2">{r.overallRating}</span>
                                      </div>
                                   </div>
                                   <p className="text-xl text-slate-500 font-medium leading-relaxed italic pr-12">"{r.comment}"</p>
                                </div>
                             ))}
                          </div>
                       ) : (
                          <div className="py-32 text-center bg-slate-50 rounded-[4rem]">
                             <FaStar className="w-16 h-16 text-slate-100 mx-auto mb-8" />
                             <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No endorsements recorded yet</p>
                          </div>
                       )}
                    </div>
                 )}
              </div>
           </div>
        </div>
      </div>

      {showMessaging && (
        <CustomerMessaging
          vendor={{
            id: vendor.userId,
            name: vendor.user?.name || 'Unknown',
            shopName: vendor.shopName,
            image: vendor.profileImage
          }}
          onClose={() => setShowMessaging(false)}
        />
      )}
    </div>
  )
}


export default VendorProfile
