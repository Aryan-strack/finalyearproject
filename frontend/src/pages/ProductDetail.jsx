import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { FiStar, FiHeart, FiShoppingCart, FiTruck, FiPackage, FiShield, FiUser, FiMapPin, FiClock, FiMessageCircle, FiArrowLeft, FiShare2, FiCheck, FiX } from 'react-icons/fi'
import { FaStar, FaHeart, FaRegHeart } from 'react-icons/fa'
import { toast } from 'react-hot-toast'
import ReviewForm from '../components/ReviewForm'
import ReviewList from '../components/ReviewList'
import { useFavorites } from '../contexts/FavoritesContext'
import { useCart } from '../contexts/CartContext'

const ProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const { favorites, toggleFavorite } = useFavorites()
  const { addItem, isInCart, getItemQuantity } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState('description')

  // Check if product is in favorites
  const isProductFavorited = () => {
    return favorites.some(fav => fav.product._id === product?._id)
  }
  const [vendorProfile, setVendorProfile] = useState(null)
  const [contactLoading, setContactLoading] = useState(false)
  const [userReview, setUserReview] = useState(null)
  const [reviewsKey, setReviewsKey] = useState(0)

  console.log('ProductDetail component rendering with id:', id)

  useEffect(() => {
    console.log('ProductDetail useEffect triggered with id:', id)
    if (id) {
      // First check if backend is accessible
      checkBackendStatus()
      fetchProductDetails()
      checkUserReview()
    } else {
      console.error('No product ID provided')
    }
  }, [id])

  const checkBackendStatus = async () => {
    try {
      const response = await fetch('/api/products?limit=1')
      console.log('Backend status check - Response status:', response.status)
    } catch (error) {
      console.error('Backend status check failed:', error)
    }
  }

  const checkUserReview = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch(`/api/reviews/product/${id}`)
      if (response.ok) {
        const data = await response.json()
        // Find if current user has reviewed this product
        const decodedToken = JSON.parse(atob(token.split('.')[1]))
        const currentUserReview = data.reviews.find(review =>
          review.user === decodedToken.id
        )
        if (currentUserReview) {
          setUserReview(currentUserReview)
        }
      } else if (response.status === 429) {
        console.error('Rate limit exceeded while checking user review')
        // Don't set user review on rate limit, just continue
      }
    } catch (error) {
      console.error('Error checking user review:', error)
    }
  }

  const fetchProductDetails = async () => {
    try {
      setLoading(true)
      console.log('Fetching product details for ID:', id)

      // Check if this is a sample product
      if (id && id.startsWith('sample')) {
        console.log('Sample product detected, showing sample data')
        // Show sample product data
        const sampleProduct = {
          _id: id,
          name: id === 'sample1' ? 'Handcrafted Silver Filigree Necklace' : 'Ceramic Vase Collection - Earth Tones',
          price: id === 'sample1' ? 89.99 : 45.50,
          originalPrice: id === 'sample1' ? 129.99 : 65.00,
          rating: id === 'sample1' ? 4.8 : 4.6,
          reviewCount: id === 'sample1' ? 127 : 89,
          vendorName: id === 'sample1' ? 'SilverCraft Studio' : 'Earth & Fire Pottery',
          category: id === 'sample1' ? 'Jewelry' : 'Home Decor',
          images: [id === 'sample1' ? 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=500&h=500&fit=crop' : 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=500&fit=crop'],
          description: id === 'sample1' ? 'Exquisite handcrafted silver necklace with intricate filigree work. Each piece is uniquely designed and crafted with attention to detail.' : 'Beautiful hand-thrown ceramic vases in warm earth tones. Perfect for adding natural elegance to any room.',
          tags: id === 'sample1' ? ['handmade', 'silver', 'filigree', 'necklace', 'artisan'] : ['ceramic', 'handmade', 'vase', 'earth tones', 'pottery'],
          stock: 10,
          inStock: true,
          featured: id === 'sample1',
          vendor: 'sample-vendor',
          dimensions: { length: 10, width: 5, height: 3, unit: 'cm' },
          weight: { value: 500, unit: 'g' },
          materials: ['silver', 'precious stones'],
          careInstructions: 'Store in a cool, dry place. Clean with a soft cloth.'
        }
        // Ensure inStock is calculated for sample products
        const sampleProductWithInStock = {
          ...sampleProduct,
          inStock: sampleProduct.inStock !== undefined ? sampleProduct.inStock : parseInt(sampleProduct.stock) > 0
        }
        console.log('Sample product with calculated inStock:', sampleProductWithInStock)
        setProduct(sampleProductWithInStock)
        setLoading(false)
        return
      }

      // Only try to fetch from API if it's not a sample product
      if (id && !id.startsWith('sample')) {
        try {
          console.log('Making API request to:', `/api/products/${id}`)
          const response = await fetch(`/api/products/${id}`)
          console.log('Response status:', response.status)

          if (response.ok) {
            const data = await response.json()
            console.log('Product data received:', data)
            console.log('Product stock info:', {
              stock: data.product.stock,
              stockType: typeof data.product.stock,
              inStock: data.product.inStock,
              inStockType: typeof data.product.inStock
            })
            console.log('Product rating data:', {
              rating: data.product.rating,
              reviewCount: data.product.reviewCount,
              ratingType: typeof data.product.rating
            })
            // Ensure inStock is calculated if not provided by API
            const productWithInStock = {
              ...data.product,
              inStock: data.product.inStock !== undefined ? data.product.inStock : parseInt(data.product.stock) > 0
            }
            console.log('Product with calculated inStock:', productWithInStock)
            setProduct(productWithInStock)

            // Fetch vendor profile if available
            if (data.product.vendor) {
              try {
                // Handle case where vendor might be an object or string
                const vendorId = typeof data.product.vendor === 'object' ? data.product.vendor._id : data.product.vendor
                console.log('Fetching vendor profile for vendorId:', vendorId)

                if (vendorId) {
                  const vendorResponse = await fetch(`/api/vendors/profile/${vendorId}`)
                  if (vendorResponse.ok) {
                    const vendorData = await vendorResponse.json()
                    setVendorProfile(vendorData.profile)
                  } else if (vendorResponse.status === 429) {
                    console.error('Rate limit exceeded while fetching vendor profile')
                    // Don't set vendor profile on rate limit, just continue
                  }
                }
              } catch (error) {
                console.error('Error fetching vendor profile:', error)
              }
            }
          } else {
            const errorData = await response.json().catch(() => ({}))
            console.error('Failed to fetch product. Status:', response.status, 'Error:', errorData)

            if (response.status === 404) {
              // Product not found - show error message
              setProduct(null)
            } else {
              // Other error - redirect to products page
              navigate('/products')
            }
          }
        } catch (fetchError) {
          console.error('Network error fetching product:', fetchError)

          // If it's a network error, show a helpful message
          if (fetchError.name === 'TypeError' && fetchError.message.includes('fetch')) {
            console.log('Network error detected, showing error message')
            setProduct(null)
          } else {
            // Other error - redirect to products page
            navigate('/products')
          }
        }
      }
    } catch (error) {
      console.error('Error fetching product:', error)
      navigate('/products')
    } finally {
      setLoading(false)
    }
  }

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 1)) {
      setQuantity(newQuantity)
    }
  }

  const handleReviewSubmitted = async () => {
    setReviewsKey(prev => prev + 1)
    checkUserReview()

    // Also refresh the product data to get updated rating and reviewCount
    if (product && !product._id.startsWith('sample')) {
      try {
        console.log('Refreshing product data after review submission')
        const response = await fetch(`/api/products/${product._id}`)
        if (response.ok) {
          const data = await response.json()
          console.log('Updated product data:', data.product)
          setProduct(data.product)
        }
      } catch (error) {
        console.error('Error refreshing product data:', error)
      }
    }
  }



  const addToCart = () => {
    if (!product) return

    const cartItem = {
      _id: product._id,
      name: product.name,
      price: product.price,
      category: product.category,
      image: product.images?.[0] || product.image,
      vendorName: product.vendorName || 'Unknown Vendor',
      vendorId: product.vendor?._id || product.vendor,
      description: product.description
    }

    addItem(cartItem)
    toast.success(`${product.name} added to cart!`, {
      duration: 3000,
      icon: '🛒',
      style: {
        background: '#10B981',
        color: '#fff',
        borderRadius: '12px',
        padding: '16px',
        fontSize: '14px'
      }
    })
  }

  const contactVendor = async () => {
    try {
      // Show confirmation dialog
      const confirmMessage = `Send inquiry about "${product.name}" to vendor?\n\nThis will send a detailed message including:\n• Product details\n• Price information\n• Direct link to this product\n\nThe vendor will receive this in their chat inbox.`

      if (!window.confirm(confirmMessage)) {
        return
      }

      setContactLoading(true)

      if (!product?.vendor) {
        toast.error('Vendor information not available')
        return
      }

      // Handle case where vendor might be an object or string
      const vendorId = typeof product.vendor === 'object' ? product.vendor._id : product.vendor
      if (!vendorId) {
        toast.error('Vendor ID not available')
        return
      }

      // Create a product inquiry message
      const messageData = {
        recipientId: vendorId,
        message: `Hi! I'm interested in your product "${product.name}" (${product.category}). 

📦 **Product Details:**
• **Name:** ${product.name}
• **Price:** $${product.price}
• **Category:** ${product.category}
• **Stock:** ${product.stock} units available

🔍 **Questions:**
Could you please provide more information about:
• Materials used
• Shipping options and costs
• Customization possibilities
• Production time
• Any bulk discounts

🔗 **Product Link:** ${window.location.href}

Looking forward to hearing from you! 😊`,
        productId: product._id,
        productName: product.name,
        productCategory: product.category,
        productPrice: product.price
      }

      // Send the message using the chat API
      const response = await fetch('/api/chat/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(messageData)
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(
          `Message sent to vendor successfully! 💬\n\nProduct: ${product.name}\nCategory: ${product.category}\nPrice: $${product.price}\n\nCheck your dashboard for vendor responses!`,
          { duration: 4000 }
        )
        console.log('Message sent:', result)

        // Show additional success info with chat inbox link
        setTimeout(() => {
          toast.success(
            'Message sent successfully! 💬 Check your dashboard to continue the conversation.',
            {
              duration: 5000,
              action: {
                text: 'Go to Dashboard',
                onClick: () => navigate('/dashboard')
              }
            }
          )
        }, 1000)
      } else {
        const errorData = await response.json()
        console.error('Failed to send message:', errorData)
        toast.error('Failed to send message. Please try again.')
      }
    } catch (error) {
      console.error('Error contacting vendor:', error)
      toast.error('Failed to send message. Please try again.')
    } finally {
      setContactLoading(false)
    }
  }

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FaStar
        key={i}
        className={`w-5 h-5 ${i < Math.floor(rating)
          ? 'text-yellow-400 fill-current'
          : i < rating
            ? 'text-yellow-400 fill-current opacity-60'
            : 'text-gray-300'
          }`}
      />
    ))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-32">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            <div className="aspect-square bg-slate-50 rounded-[4rem] animate-pulse"></div>
            <div className="space-y-8 py-10">
              <div className="h-4 w-1/4 bg-slate-50 rounded-full animate-pulse"></div>
              <div className="h-12 w-3/4 bg-slate-50 rounded-2xl animate-pulse"></div>
              <div className="h-6 w-1/2 bg-slate-50 rounded-full animate-pulse"></div>
              <div className="h-32 w-full bg-slate-50 rounded-2xl animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center py-32">
        <div className="text-center max-w-xl mx-auto px-6">
          <h2 className="text-6xl font-black text-slate-900 mb-8 tracking-tight">Product not <span className="text-gradient">found</span></h2>
          <p className="text-xl text-slate-500 mb-12 text-slate-600">The item you're looking for might have been moved or removed from our collection.</p>
          <Link to="/products" className="btn-accent !px-12 mt-12 inline-block">Return to Collection</Link>
        </div>
      </div>
    )
  }

  const images = product.images && product.images.length > 0 ? product.images : [
    'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500&h=500&fit=crop'
  ]

  return (
    <div className="min-h-screen bg-white py-32">
      <div className="container mx-auto px-6">
        {/* Breadcrumbs / Back */}
        <div className="mb-16">
          <button onClick={() => navigate('/products')} className="group flex items-center space-x-4 text-slate-400 hover:text-slate-900 transition-colors">
            <FiArrowLeft className="group-hover:-translate-x-2 transition-transform" />
            <span className="font-bold uppercase tracking-widest text-xs">Back to Collection</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 lg:gap-32 items-start">
          {/* Left: Images */}
          <div className="space-y-10  top-32">
            <div className="relative aspect-square rounded-[4rem] overflow-hidden bg-slate-50 group">
              <img
                src={images[selectedImage]}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <button
                onClick={() => toggleFavorite(product._id)}
                className="absolute top-10 right-10 p-5 bg-white rounded-full shadow-xl hover:scale-110 transition-transform active:scale-95"
              >
                {isProductFavorited() ? <FaHeart className="text-accent w-6 h-6" /> : <FaRegHeart className="text-slate-300 w-6 h-6" />}
              </button>
            </div>

            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-6 px-10">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`aspect-square rounded-3xl overflow-hidden border-4 transition-all ${selectedImage === i ? 'border-accent p-1' : 'border-transparent opacity-50 hover:opacity-100'}`}
                  >
                    <img src={img} className="w-full h-full object-cover rounded-2xl" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Info */}
          <div className="space-y-12">
            <div className="space-y-6">
              <p className="text-accent font-black tracking-[0.3em] uppercase text-xs">{product.category}</p>
              <h1 className="text-5xl lg:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight">{product.name}</h1>

              <div className="flex items-center space-x-6">
                <div className="flex text-amber-400">
                  {renderStars(product.rating)}
                </div>
                <span className="text-slate-400 font-bold text-sm">({product.reviewCount} REVIEWS)</span>
              </div>
            </div>

            <div className="flex items-baseline space-x-6">
              <span className="text-6xl font-black text-slate-900">${product.price}</span>
              {product.originalPrice > product.price && (
                <span className="text-2xl text-slate-200 line-through font-bold">${product.originalPrice}</span>
              )}
            </div>

            <p className="text-xl text-slate-500 leading-relaxed max-w-xl">
              {product.description}
            </p>

            {/* Actions */}
            <div className="space-y-8 pt-8 border-t border-slate-50">
              <div className="flex items-center space-x-8">
                <span className="font-bold text-slate-900 uppercase tracking-widest text-xs">Quantity</span>
                <div className="flex items-center bg-slate-50 rounded-2xl p-2 h-16">
                  <button onClick={() => handleQuantityChange(quantity - 1)} className="w-12 h-full flex items-center justify-center hover:text-accent transition-colors">
                    <FiX />
                  </button>
                  <span className="w-16 text-center font-black text-xl">{quantity}</span>
                  <button onClick={() => handleQuantityChange(quantity + 1)} className="w-12 h-full flex items-center justify-center hover:text-accent transition-colors">
                    <FiCheck />
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-6">
                <button
                  onClick={addToCart}
                  disabled={!product.inStock}
                  className="flex-1 btn-accent !py-6 !rounded-3xl flex items-center justify-center space-x-3"
                >
                  <FiShoppingCart className="w-6 h-6" />
                  <span>{isInCart(product._id) ? 'Added to Cart' : 'Add to Collection'}</span>
                </button>
                <button
                  onClick={contactVendor}
                  disabled={contactLoading}
                  className="flex-1 btn-outline !py-6 !rounded-3xl flex items-center justify-center space-x-3"
                >
                  <FiMessageCircle className="w-6 h-6" />
                  <span>Inquire Now</span>
                </button>
              </div>
            </div>

            {/* Quick Specs */}
            <div className="grid grid-cols-3 gap-6">
              <div className="p-6 rounded-[2.5rem] bg-slate-50 flex flex-col items-center">
                <FiTruck className="w-6 h-6 text-slate-300 mb-3" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Shipping</span>
                <span className="font-bold text-slate-900 text-xs">Global</span>
              </div>
              <div className="p-6 rounded-[2.5rem] bg-slate-50 flex flex-col items-center">
                <FiShield className="w-6 h-6 text-slate-300 mb-3" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Authentic</span>
                <span className="font-bold text-slate-900 text-xs">Certified</span>
              </div>
              <div className="p-6 rounded-[2.5rem] bg-slate-50 flex flex-col items-center">
                <FiClock className="w-6 h-6 text-slate-300 mb-3" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Process</span>
                <span className="font-bold text-slate-900 text-xs">Handmade</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Tabs */}
        <div className="mt-40">
          <div className="flex flex-wrap justify-center gap-4 mb-20">
            {['description', 'specifications', 'vendor', 'reviews'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-12 py-5 rounded-full font-black uppercase tracking-widest text-xs transition-all ${activeTab === tab ? 'bg-slate-900 text-white shadow-2xl' : 'text-slate-400 hover:text-slate-900'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="max-w-4xl mx-auto">
            {activeTab === 'description' && (
              <div className="space-y-12 animate-fade-in">
                <p className="text-2xl text-slate-600 leading-relaxed font-medium">{product.description}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {product.tags?.map(tag => (
                    <span key={tag} className="px-6 py-3 rounded-2xl bg-slate-50 text-slate-500 font-bold text-sm text-center">#{tag}</span>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-fade-in">
                <div className="space-y-6">
                  <h4 className="text-xl font-black text-slate-900 uppercase tracking-widest mb-10">Product Anatomy</h4>
                  <div className="space-y-4">
                    {[
                      { label: 'Category', value: product.category },
                      { label: 'Materials', value: product.materials?.join(', ') || 'Various' },
                      { label: 'Weight', value: product.weight?.value ? `${product.weight.value}${product.weight.unit}` : 'N/A' },
                      { label: 'Origin', value: product.vendorName || 'Artisan Direct' }
                    ].map((spec, i) => (
                      <div key={i} className="flex justify-between py-4 border-b border-slate-50">
                        <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">{spec.label}</span>
                        <span className="font-bold text-slate-900">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-10 rounded-[3rem] bg-slate-900 text-white">
                  <h4 className="text-xl font-black uppercase tracking-widest mb-8">Dimensions</h4>
                  {product.dimensions ? (
                    <div className="grid grid-cols-3 gap-6">
                      <div className="flex flex-col">
                        <span className="text-slate-500 text-[10px] font-black uppercase">Length</span>
                        <span className="text-2xl font-black">{product.dimensions.length}cm</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-slate-500 text-[10px] font-black uppercase">Width</span>
                        <span className="text-2xl font-black">{product.dimensions.width}cm</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-slate-500 text-[10px] font-black uppercase">Height</span>
                        <span className="text-2xl font-black">{product.dimensions.height}cm</span>
                      </div>
                    </div>
                  ) : <p className="text-slate-500">Provided by vendor upon request.</p>}
                </div>
              </div>
            )}

            {activeTab === 'vendor' && vendorProfile && (
              <div className="bg-slate-50 rounded-[4rem] p-12 md:p-20 flex flex-col md:flex-row gap-16 items-center animate-fade-in">
                <div className="relative">
                  <div className="w-48 h-48 rounded-full overflow-hidden border-8 border-white shadow-2xl">
                    <img src={vendorProfile.profileImage} className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute bottom-4 right-4 w-10 h-10 bg-accent rounded-full border-4 border-white flex items-center justify-center">
                    <FiCheck className="text-white w-4 h-4" />
                  </div>
                </div>
                <div className="flex-1 space-y-6 text-center md:text-left">
                  <h3 className="text-4xl font-black text-slate-900 tracking-tight">{vendorProfile.shopName}</h3>
                  <p className="text-lg text-slate-500 leading-relaxed font-medium">{vendorProfile.bio}</p>
                  <div className="flex flex-wrap gap-8 justify-center md:justify-start">
                    <div className="flex flex-col">
                      <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Global Sales</span>
                      <span className="text-2xl font-black text-slate-900">{vendorProfile.stats?.totalSales}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Items</span>
                      <span className="text-2xl font-black text-slate-900">{vendorProfile.stats?.totalProducts}</span>
                    </div>
                  </div>
                  <div className="pt-6 flex flex-col sm:flex-row gap-4">
                    <Link to={`/vendors/${vendorProfile.userId}`} className="btn-slate text-center">Visit Studio</Link>
                    <button onClick={contactVendor} className="btn-outline text-center">Get in Touch</button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-20 animate-fade-in">
                <ReviewForm productId={product._id} onReviewSubmitted={handleReviewSubmitted} userReview={userReview} />
                <ReviewList key={reviewsKey} productId={product._id} onReviewSubmitted={handleReviewSubmitted} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail
