import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiSearch, FiMessageSquare } from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext'
import CustomerMessaging from '../components/messaging/CustomerMessaging'
import FollowButton from '../components/common/FollowButton'

const Artisans = () => {
  const { user } = useAuth()
  const [artisans, setArtisans] = useState([])
  const [filteredArtisans, setFilteredArtisans] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedLocation, setSelectedLocation] = useState('all')
  const [sortBy, setSortBy] = useState('rating')
  const [selectedVendor, setSelectedVendor] = useState(null)
  const [showMessaging, setShowMessaging] = useState(false)

  // Fetch real vendor data
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/vendors/featured?limit=50')
        if (response.ok) {
          const data = await response.json()
          const vendorData = data.vendors || []
          
          const vendorsWithReviews = await Promise.all(
            vendorData.map(async (vendor) => {
              try {
                const vendorId = vendor.user._id
                const reviewResponse = await fetch(`/api/vendor-reviews/vendor/${vendorId}`)
                let vendorReviewStats = { averageOverallRating: 0, totalReviews: 0 }
                if (reviewResponse.ok) {
                  const reviewData = await reviewResponse.json()
                  vendorReviewStats = reviewData.stats || vendorReviewStats
                }
                return { ...vendor, vendorReviewStats }
              } catch (error) {
                return { ...vendor, vendorReviewStats: { averageOverallRating: 0, totalReviews: 0 } }
              }
            })
          )
          
          const transformedVendors = vendorsWithReviews.map(vendor => ({
            id: vendor.user._id,
            name: vendor.user?.name || 'Unknown',
            shopName: vendor.shopName || 'Unnamed Shop',
            category: vendor.specialties?.[0] || 'General',
            location: vendor.location?.address || 'Location not specified',
            rating: vendor.vendorReviewStats.averageOverallRating || 0,
            reviewCount: vendor.vendorReviewStats.totalReviews || 0,
            productsCount: vendor.totalProducts || 0,
            followers: vendor.totalFollowers || 0,
            image: vendor.profileImage || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop',
            coverImage: vendor.bannerImage || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=400&fit=crop',
            bio: vendor.bio || 'Passionate artisan creating unique handmade treasures.',
            specialties: vendor.specialties || ['Handmade Items'],
            social: { instagram: '@artisanmart', facebook: 'ArtisanMart' }
          }))
          
          setArtisans(transformedVendors)
          setFilteredArtisans(transformedVendors)
        }
      } catch (error) {
        console.error('Error fetching vendors:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchVendors()
  }, [])

  useEffect(() => {
    let filtered = [...artisans]
    if (searchQuery) {
      filtered = filtered.filter(artisan =>
        artisan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        artisan.shopName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    setFilteredArtisans(filtered)
  }, [artisans, searchQuery])

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-32">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-slate-50 rounded-[3rem] animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white py-32">
      <div className="container mx-auto px-6">
        {/* Header Section */}
        <div className="max-w-4xl mx-auto text-center mb-32">
          <span className="text-accent font-bold tracking-[0.3em] uppercase text-sm mb-8 block">The Creator Network</span>
          <h1 className="text-6xl md:text-8xl font-black text-slate-900 mb-12 tracking-tight leading-none">
            Meet the <span className="text-gradient">Visionaries</span>
          </h1>
          <p className="text-2xl text-slate-500 leading-relaxed max-w-3xl mx-auto">
            Our community is built on the passion of individuals who believe in the beauty of handmade excellence.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-24 relative group">
          <FiSearch className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-300 w-6 h-6 group-focus-within:text-accent transition-colors" />
          <input
            type="text"
            placeholder="Search by name or studio..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-20 pr-8 py-7 bg-slate-50 border-none rounded-[2.5rem] focus:ring-4 focus:ring-accent/5 focus:bg-white transition-all text-xl font-bold placeholder:text-slate-200"
          />
        </div>

        {/* Artisans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16">
          {filteredArtisans.map((artisan) => (
            <div key={artisan.id} className="group relative">
               <div className="relative aspect-[3/4] rounded-[3.5rem] overflow-hidden bg-slate-100 mb-10 shadow-sm transition-all duration-700 group-hover:shadow-2xl group-hover:shadow-slate-200 group-hover:-translate-y-4">
                  <img src={artisan.coverImage} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-slate-950 opacity-90"></div>
                  
                  <div className="absolute inset-x-8 bottom-10">
                     <p className="text-accent font-black text-xs tracking-[0.3em] uppercase mb-4">{artisan.category}</p>
                     <h3 className="text-4xl font-black text-white mb-6 tracking-tight leading-none">{artisan.shopName}</h3>
                     
                     <div className="flex items-center space-x-4 mb-8">
                        <div className="w-14 h-14 rounded-full border-2 border-white/20 p-1">
                           <img src={artisan.image} className="w-full h-full rounded-full object-cover" />
                        </div>
                        <div>
                           <p className="text-white font-bold leading-none">{artisan.name}</p>
                           <p className="text-white/50 text-xs mt-1">{artisan.location}</p>
                        </div>
                     </div>

                     <div className="flex items-center gap-2">
                        <Link to={`/vendors/${artisan.id}`} className="flex-1 btn-white !py-4 text-sm text-center">View Profile</Link>
                        <button 
                           onClick={() => { setSelectedVendor(artisan); setShowMessaging(true); }}
                           className="p-4 rounded-2xl bg-white/10 backdrop-blur-md text-white hover:bg-white hover:text-slate-900 transition-all border border-white/10"
                        >
                           <FiMessageSquare className="w-6 h-6" />
                        </button>
                     </div>
                  </div>

                  <div className="absolute top-8 right-8 flex flex-col items-center gap-4 translate-x-20 group-hover:translate-x-0 transition-all duration-500 delay-100">
                     <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex flex-col items-center justify-center text-white">
                        <span className="text-lg font-black">{artisan.productsCount}</span>
                        <span className="text-[10px] font-black uppercase tracking-tighter opacity-50 leading-none">Items</span>
                     </div>
                     <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex flex-col items-center justify-center text-white">
                        <span className="text-lg font-black">{artisan.rating}</span>
                        <span className="text-[10px] font-black uppercase tracking-tighter opacity-50 leading-none">Stars</span>
                     </div>
                  </div>
               </div>
            </div>
          ))}
        </div>

        {/* Messaging Modal */}
        {showMessaging && selectedVendor && (
          <CustomerMessaging
            vendor={selectedVendor}
            onClose={() => { setShowMessaging(false); setSelectedVendor(null); }}
          />
        )}
      </div>

      {/* Join Section */}
      <div className="container mx-auto px-6 mt-40">
         <div className="bg-slate-900 rounded-[5rem] p-12 md:p-32 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative z-10 max-w-3xl mx-auto">
               <h2 className="text-5xl md:text-7xl font-black mb-10 tracking-tight leading-none">Ready to Showcase <br /> <span className="text-accent">Your Craft?</span></h2>
               <p className="text-xl text-slate-400 mb-12">Join a global network of artisans and reach collectors who value authenticity over mass production.</p>
               <Link to="/register" className="btn-accent !px-12 !py-6 !text-lg">Become an Artisan</Link>
            </div>
         </div>
      </div>
    </div>
  )
}

export default Artisans
