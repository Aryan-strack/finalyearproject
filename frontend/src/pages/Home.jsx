import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiArrowRight, FiStar, FiHeart, FiShoppingBag, FiUsers } from 'react-icons/fi'
import ThreeDCarousel from '../components/3DCarousel'
import { useFavorites } from '../contexts/FavoritesContext'
import { useCart } from '../contexts/CartContext'
import toast from 'react-hot-toast'
import FollowButton from '../components/common/FollowButton'
import AIChatbot from '../components/AIChatbot'
import VisualSearch from '../components/VisualSearch'
import ProductAnalyzer from '../components/ProductAnalyzer'

const Home = () => {
  const { addToFavorites, removeFromFavorites, isInFavorites } = useFavorites()
  const { addItem: addToCart, isInCart, getItemQuantity, items: cartItems, itemCount } = useCart()
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [apiError, setApiError] = useState(false)
  const [featuredVendors, setFeaturedVendors] = useState([])
  const [artisanLoading, setArtisanLoading] = useState(true)
  const [showCartPreview, setShowCartPreview] = useState(false)

  // Helper function to format vendor location display
  const formatVendorLocation = (location) => {
    if (!location) return 'Location not specified'
    return location.address || 'Location not specified'
  }

  // Fetch featured products from API
  const fetchFeaturedProducts = async () => {
    try {
      setLoading(true)
      console.log('Fetching featured products...')
      const response = await fetch('/api/products/featured')
      if (response.ok) {
        const data = await response.json()
        console.log('Featured products API response:', data)
        if (data.success && data.products && data.products.length > 0) {
          setFeaturedProducts(data.products)
          setApiError(false)
          console.log('Featured products loaded:', data.products.length)
        } else {
          console.log('No featured products found, fetching recent products...')
          // If no featured products, show some recent products instead
          const recentResponse = await fetch('/api/products?limit=8&sort=createdAt')
          if (recentResponse.ok) {
            const recentData = await recentResponse.json()
            console.log('Recent products API response:', recentData)
            if (recentData.success && recentData.products && recentData.products.length > 0) {
              setFeaturedProducts(recentData.products)
              setApiError(false)
              console.log('Recent products loaded:', recentData.products.length)
            } else {
              setApiError(true)
              console.log('No recent products found')
            }
          } else {
            setApiError(true)
            console.log('Recent products API failed')
          }
        }
      } else {
        console.log('Featured products API failed, trying recent products...')
        // Fallback to recent products if featured endpoint fails
        const recentResponse = await fetch('/api/products?limit=8&sort=createdAt')
        if (recentResponse.ok) {
          const recentData = await recentResponse.json()
          if (recentData.success && recentData.products && recentData.products.length > 0) {
            setFeaturedProducts(recentData.products)
            setApiError(false)
          } else {
            setApiError(true)
          }
        } else {
          setApiError(true)
        }
      }
    } catch (error) {
      console.error('Error fetching featured products:', error)
      setApiError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Fetch real featured products from API
    fetchFeaturedProducts()
  }, [])

  // Fetch featured vendors
  useEffect(() => {
    const fetchFeaturedVendors = async () => {
      try {
        setArtisanLoading(true)
        const response = await fetch('/api/vendors/featured?limit=8')
        if (response.ok) {
          const data = await response.json()
          setFeaturedVendors(data.vendors || [])
        } else {
          console.error('Failed to fetch featured vendors')
          setFeaturedVendors([])
        }
      } catch (error) {
        console.error('Error fetching featured vendors:', error)
        setFeaturedVendors([])
      } finally {
        setArtisanLoading(false)
      }
    }

    fetchFeaturedVendors()
  }, [])

  const categories = [
    { name: 'Jewelry', icon: '💍', count: '150+ items' },
    { name: 'Home Decor', icon: '🏠', count: '200+ items' },
    { name: 'Art & Prints', icon: '🎨', count: '100+ items' },
    { name: 'Clothing', icon: '👕', count: '120+ items' },
    { name: 'Pottery', icon: '🏺', count: '80+ items' },
    { name: 'Textiles', icon: '🧵', count: '90+ items' },
  ]

  return (
    <div className="min-h-screen bg-white selection:bg-accent/10 selection:text-accent">
      {/* Hero Section */}
      <section className="relative min-h-[100vh] flex items-center justify-center overflow-hidden bg-[#0a0c10]">
        {/* Background Effects */}
        <div className="absolute inset-0 z-0">
          <ThreeDCarousel />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-[#0a0c10]"></div>
          <div className="absolute top-0 left-0 w-full h-full noise-bg opacity-20"></div>
        </div>

        <div className="container relative z-10 mx-auto px-6 py-28 text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 backdrop-blur-md mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
            <span className="text-sm font-medium text-white/80 tracking-wide uppercase">New Artisans Joined This Week</span>
          </div>

          <h1 className="text-5xl md:text-8xl font-black text-white mb-8 leading-[1.1] tracking-tight animate-slide-up">
            Discover Unique <br />
            <span className="text-gradient-accent">Handmade</span> Treasures
          </h1>

          <p className="text-lg md:text-xl text-white/60 mb-12 max-w-2xl mx-auto leading-relaxed animate-slide-up delay-100">
            Connect with world-class artisans. Find one-of-a-kind pieces that tell a story and bring beauty to your life.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-slide-up delay-200">
            <Link to="/products" className="btn-accent px-10 py-5 text-lg group">
              <FiShoppingBag className="mr-2 group-hover:rotate-12 transition-transform" />
              Browse Collections
            </Link>
            <Link to="/register" className="btn-outline border-white/20 text-white hover:bg-white/10 px-10 py-5 text-lg">
              Meet Our Artisans
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-50">
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center p-1">
            <div className="w-1 h-2 bg-white rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-24 bg-slate-50/50">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-6xl text-slate-900 mb-6">Explore by Category</h2>
              <p className="text-lg text-slate-500 leading-relaxed">
                Discover unique treasures organized by craft type. Each category holds a world of <span className="text-slate-900 font-semibold">handmade wonders</span> waiting for you.
              </p>
            </div>
            <Link to="/products" className="group flex items-center text-slate-900 font-bold hover:text-accent transition-colors">
              Browse All Categories <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category, index) => (
              <Link
                key={index}
                to={`/products?category=${category.name.toLowerCase()}`}
                className="group p-8 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 text-center"
              >
                <div className="text-5xl mb-6 transform group-hover:scale-110 transition-transform duration-500">{category.icon}</div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-accent transition-colors mb-1">{category.name}</h3>
                <p className="text-xs text-slate-400 font-medium tracking-wide uppercase">{category.count}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="text-accent font-bold tracking-widest uppercase text-sm mb-4 block">Curated Selection</span>
            <h2 className="text-4xl md:text-6xl text-slate-900 mb-8 tracking-tight">Featured Products</h2>
            <p className="text-lg text-slate-500">
              Handpicked treasures from our most talented artisans. Each piece tells a unique story of craftsmanship and creativity.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[4/5] bg-slate-100 rounded-[2.5rem] mb-6"></div>
                  <div className="h-6 bg-slate-100 rounded-full w-3/4 mb-4"></div>
                  <div className="h-4 bg-slate-100 rounded-full w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((product) => (
                <div key={product._id} className="group flex flex-col bg-white rounded-[2.5rem] border border-slate-50 shadow-sm hover:shadow-2xl transition-all duration-700 hover:-translate-y-2 p-3">
                  <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden mb-6">
                    <img
                      src={product.images?.[0] || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=500&fit=crop'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-x-4 bottom-4 flex justify-between items-center z-10 translate-y-12 group-hover:translate-y-0 transition-transform duration-500">
                      <button
                        onClick={() => addToCart(product)}
                        className="bg-white text-slate-900 px-6 py-3 rounded-2xl font-bold text-sm shadow-xl hover:bg-slate-100 active:scale-95 transition-all"
                      >
                        Quick Add
                      </button>
                      <button
                        onClick={() => isInFavorites(product._id) ? removeFromFavorites(product._id) : addToFavorites(product._id)}
                        className={`p-3 rounded-2xl backdrop-blur-md shadow-xl transition-all ${isInFavorites(product._id) ? 'bg-red-500 text-white' : 'bg-white/90 text-slate-900 hover:bg-white'}`}
                      >
                        <FiHeart className={isInFavorites(product._id) ? 'fill-current' : ''} />
                      </button>
                    </div>
                  </div>
                  <div className="px-5 pb-6">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">{product.category || 'Handmade'}</p>
                        <h3 className="text-xl text-slate-900 font-bold group-hover:text-accent transition-colors line-clamp-1">{product.name}</h3>
                      </div>
                      <span className="text-xl font-black text-slate-900">${product.price}</span>
                    </div>
                    <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-50">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold ring-2 ring-white">A</div>
                        <span className="text-sm font-medium text-slate-500">by {product.vendorName || 'Artisan'}</span>
                      </div>
                      <Link to={`/products/${product._id}`} className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all">
                        <FiArrowRight />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-20 text-center">
            <Link to="/products" className="btn-premium px-12 group">
              View All Masterpieces
              <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Artisans Showcase */}
      <section className="py-32 bg-[#0f172a] text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/20 blur-[150px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 blur-[150px] rounded-full -translate-x-1/2 translate-y-1/2"></div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <span className="text-accent font-bold tracking-widest uppercase text-sm mb-6 block">The Creators</span>
              <h2 className="text-5xl md:text-7xl font-bold mb-10 leading-tight">Crafting Stories, One Piece at a Time.</h2>
              <p className="text-xl text-white/60 mb-12 leading-relaxed">
                Our artisans aren't just makers—they're visionaries. Learn the heritage behind the crafts and support independent artists worldwide.
              </p>
              <div className="grid grid-cols-2 gap-8 mb-12">
                <div>
                  <h4 className="text-4xl font-bold mb-2">500+</h4>
                  <p className="text-white/40 uppercase text-xs tracking-widest">Active Artisans</p>
                </div>
                <div>
                  <h4 className="text-4xl font-bold mb-2">12k+</h4>
                  <p className="text-white/40 uppercase text-xs tracking-widest">Unique Items</p>
                </div>
              </div>
              <Link to="/artisans" className="btn-accent px-12">Discover Artisans</Link>
            </div>

            <div className="grid grid-cols-2 gap-4 lg:gap-8 transform lg:rotate-2">
              {featuredVendors.slice(0, 4).map((vendor, i) => (
                <div key={vendor._id} className={`group relative rounded-[2rem] overflow-hidden aspect-square shadow-2xl ${i % 2 !== 0 ? 'mt-8' : ''}`}>
                  <img
                    src={vendor.profileImage || `https://images.unsplash.com/photo-${1550000000000 + i}?auto=format&fit=crop&w=600&q=80`}
                    alt={vendor.shopName}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-6 left-6 right-6">
                    <h5 className="text-xl font-bold mb-1">{vendor.shopName}</h5>
                    <p className="text-xs text-white/60 font-medium uppercase tracking-widest">Master Artisan</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 bg-white flex justify-center">
        <div className="container mx-auto px-6">
          <div className="relative rounded-[4rem] bg-slate-900 p-12 md:p-24 overflow-hidden text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-transparent to-accent/20"></div>
            <div className="relative z-10">
              <h2 className="text-4xl md:text-7xl font-bold text-white mb-10 leading-tight">Ready to Share <br /> Your Craft?</h2>
              <p className="text-xl text-white/60 mb-12 max-w-2xl mx-auto">
                Join our exclusive community of artisans and reach a global audience who appreciates true craftsmanship.
              </p>
              <Link to="/register" className="btn-accent px-12 py-5 text-lg group">
                Become a Vendor
                <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

       {/* AI Chatbot */}
       <AIChatbot />

       
      </div>
    )
  }

export default Home
