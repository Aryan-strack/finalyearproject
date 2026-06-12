import React, { useState, useEffect } from 'react'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import { 
  FiTrash2, 
  FiPlus, 
  FiMinus, 
  FiShoppingBag, 
  FiHeart, 
  FiArrowRight,
  FiPackage,
  FiTruck,
  FiShield,
  FiCreditCard
} from 'react-icons/fi'
import toast from 'react-hot-toast'

const Cart = () => {
  const { items: cart, removeItem: removeFromCart, updateQuantity, clearCart } = useCart()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const cartByVendor = cart.reduce((acc, item) => {
    const vendorId = item.vendorId || 'unknown'
    if (!acc[vendorId]) {
      acc[vendorId] = {
        vendorName: item.vendorName || 'Unknown Vendor',
        items: [],
        subtotal: 0
      }
    }
    acc[vendorId].items.push(item)
    acc[vendorId].subtotal += item.price * item.quantity
    return acc
  }, {})

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const shippingCost = totalAmount > 100 ? 0 : 9.99
  const finalTotal = totalAmount + shippingCost

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(itemId)
    } else {
      updateQuantity(itemId, newQuantity)
    }
  }

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.error('Please login to checkout')
      navigate('/login')
      return
    }
    setLoading(true)
    setTimeout(() => {
      navigate('/checkout')
      setLoading(false)
    }, 800)
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center py-32">
        <div className="text-center max-w-xl mx-auto px-6">
          <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-10">
            <FiShoppingBag className="w-12 h-12 text-slate-200" />
          </div>
          <h2 className="text-6xl font-black text-slate-900 mb-8 tracking-tight">Your cart is <span className="text-gradient">empty</span></h2>
          <p className="text-xl text-slate-500 mb-12 leading-relaxed">It looks like you haven't discovered anything to add to your collection yet.</p>
          <Link to="/products" className="btn-accent !px-12">Start Exploring</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white py-32">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center mb-24">
          <span className="text-accent font-black tracking-[0.3em] uppercase text-xs mb-6 block">Your Collection</span>
          <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tight leading-none mb-4">Checkout <span className="text-gradient">Bag</span></h1>
          <p className="text-xl text-slate-400 font-bold uppercase tracking-widest">{totalItems} ARTISAN PIECES</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-start">
          {/* Main Cart Area */}
          <div className="lg:col-span-8 space-y-16">
            {Object.entries(cartByVendor).map(([vendorId, vendorData]) => (
              <div key={vendorId} className="space-y-8 animate-fade-in">
                <div className="flex items-center space-x-6 border-b border-slate-50 pb-6">
                   <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center">
                      <FiPackage className="text-slate-300 w-6 h-6" />
                   </div>
                   <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none uppercase tracking-widest text-sm">{vendorData.vendorName} STUDIO</h3>
                </div>

                <div className="space-y-10">
                  {vendorData.items.map((item) => (
                    <div key={item._id} className="group relative flex flex-col md:flex-row gap-10">
                      <div className="relative w-full md:w-48 aspect-square rounded-[2.5rem] overflow-hidden bg-slate-50 transition-transform duration-700 group-hover:scale-105 group-hover:shadow-xl group-hover:shadow-slate-100">
                        <img src={item.image} className="w-full h-full object-cover" />
                      </div>

                      <div className="flex-1 flex flex-col justify-between py-2">
                        <div className="space-y-4">
                          <div className="flex justify-between items-start">
                             <div>
                                <h4 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">{item.name}</h4>
                                <p className="text-accent font-black text-[10px] uppercase tracking-widest">{item.category}</p>
                             </div>
                             <span className="text-3xl font-black text-slate-900">${item.price}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-8">
                          <div className="flex items-center bg-slate-50 rounded-2xl p-2 h-14">
                            <button onClick={() => handleQuantityChange(item._id, item.quantity - 1)} className="w-10 h-full flex items-center justify-center hover:text-accent transition-colors"><FiMinus className="w-3 h-3" /></button>
                            <span className="w-12 text-center font-black text-lg">{item.quantity}</span>
                            <button onClick={() => handleQuantityChange(item._id, item.quantity + 1)} className="w-10 h-full flex items-center justify-center hover:text-accent transition-colors"><FiPlus className="w-3 h-3" /></button>
                          </div>
                          
                          <button 
                            onClick={() => removeFromCart(item._id)}
                            className="p-4 rounded-2xl text-slate-200 hover:text-red-500 hover:bg-red-50 transition-all underline font-black text-[10px] uppercase tracking-widest"
                          >
                            Remove Item
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="pt-10 flex border-t border-slate-50">
               <button onClick={clearCart} className="text-slate-300 hover:text-slate-900 font-black uppercase tracking-widest text-[10px] transition-colors">Clear Entire Bag</button>
            </div>
          </div>

          {/* Checkout Totals */}
          <div className="lg:col-span-4 sticky top-32">
             <div className="p-12 bg-slate-950 rounded-[4rem] text-white shadow-3xl shadow-slate-200">
                <h2 className="text-3xl font-black mb-12 tracking-tight leading-none">Order Summary</h2>
                
                <div className="space-y-6 mb-12">
                   <div className="flex justify-between text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                      <span>Subtotal</span>
                      <span className="text-white text-lg font-black">${totalAmount.toFixed(2)}</span>
                   </div>
                   <div className="flex justify-between text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                      <span>Shipping</span>
                      <span className="text-white text-lg font-black">{shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}</span>
                   </div>
                   <div className="pt-6 border-t border-white/10 flex justify-between">
                      <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Final Collection</span>
                      <span className="text-5xl font-black tracking-tighter leading-none">${finalTotal.toFixed(2)}</span>
                   </div>
                </div>

                <button 
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full btn-accent !py-8 !rounded-[2rem] flex items-center justify-center space-x-4 shadow-[0_20px_50px_rgba(37,99,235,0.3)]"
                >
                  {loading ? <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" /> : (
                    <>
                      <span className="font-black uppercase tracking-widest text-sm">Secure Checkout</span>
                      <FiArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                <div className="mt-12 space-y-6 pt-12 border-t border-white/5">
                   <div className="flex items-center space-x-4 text-slate-500">
                      <FiShield className="w-5 h-5" />
                      <span className="font-black uppercase tracking-widest text-[9px]">Artisan Protection Guaranteed</span>
                   </div>
                   <div className="flex items-center space-x-4 text-slate-500">
                      <FiTruck className="w-5 h-5" />
                      <span className="font-black uppercase tracking-widest text-[9px]">International Express Shipping</span>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}


export default Cart
