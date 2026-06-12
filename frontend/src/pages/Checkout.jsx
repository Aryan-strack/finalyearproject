import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import { useStripe } from '../contexts/StripeContext'
import { Elements, PaymentElement, useStripe as useStripeElements, useElements } from '@stripe/react-stripe-js'
import { FiMapPin, FiCreditCard, FiTruck, FiShield, FiCheckCircle, FiAlertCircle, FiArrowRight, FiArrowLeft } from 'react-icons/fi'
import toast from 'react-hot-toast'

// Payment Form Component
const PaymentForm = ({ clientSecret, onSuccess, onError }) => {
  const stripe = useStripeElements()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setLoading(true)
    setError(null)

    try {
      const { error: submitError } = await elements.submit()
      if (submitError) {
        setError(submitError.message)
        return
      }

      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success`,
        },
        redirect: 'if_required',
      })

      if (confirmError) {
        setError(confirmError.message || 'Payment failed. Please try again.')
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent.id)
      } else {
        setError('Payment was not completed successfully')
      }
    } catch (err) {
      setError('An unexpected error occurred.')
      onError(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-12">
      <div className="p-8 bg-slate-50 rounded-[2.5rem]">
         <PaymentElement 
            options={{
               layout: 'tabs',
               paymentMethodOrder: ['card'],
            }}
         />
      </div>
      
      {error && (
        <div className="flex items-center space-x-3 text-red-500 bg-red-50 p-6 rounded-3xl animate-shake">
          <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-black uppercase tracking-widest leading-tight">{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full btn-accent !py-8 !rounded-[2rem] flex items-center justify-center space-x-4 shadow-[0_20px_50px_rgba(37,99,235,0.2)]"
      >
        {loading ? <div className="animate-spin rounded-full h-6 w-6 border-2 border-white/30 border-t-white" /> : (
          <>
            <span className="font-black uppercase tracking-widest text-sm">Finalize Acquisition</span>
            <FiCheckCircle className="w-5 h-5" />
          </>
        )}
      </button>
    </form>
  )
}

const Checkout = () => {
  const navigate = useNavigate()
  const { items: cart, clearCart } = useCart()
  const { user, isAuthenticated } = useAuth()
  const { stripe, createPaymentIntent, createOrder, loading } = useStripe()
  
  const [clientSecret, setClientSecret] = useState(null)
  const [shippingAddress, setShippingAddress] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    phone: ''
  })
  const [shippingMethod, setShippingMethod] = useState('standard')
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true)
  const [billingAddress, setBillingAddress] = useState({ ...shippingAddress })
  const [step, setStep] = useState(1)

  const subtotal = cart && cart.length > 0 ? cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) : 0
  const shippingCost = shippingMethod === 'express' ? 15 : 5
  const tax = subtotal * 0.08
  const total = subtotal + shippingCost + tax

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Identity verification required')
      navigate('/login')
      return
    }

    if (!cart || cart.length === 0) {
      toast.error('Your collection is empty')
      navigate('/cart')
      return
    }

    initializePayment()
  }, [isAuthenticated, cart])

  const initializePayment = async () => {
    try {
      const paymentData = await createPaymentIntent(total, 'usd', {
        orderType: 'checkout',
        itemCount: cart.length
      })
      setClientSecret(paymentData.clientSecret)
    } catch (error) {
      toast.error('Payment bridge initialization failed')
    }
  }

  const handleAddressSubmit = async (e) => {
    e.preventDefault()
    if (!shippingAddress.address || !shippingAddress.city || !shippingAddress.zipCode) {
      toast.error('Incomplete logistics information')
      return
    }
    setStep(2)
  }

  const handlePaymentSuccess = async (paymentIntentId) => {
    try {
      const orderData = {
        items: cart,
        shippingAddress,
        billingAddress: billingSameAsShipping ? shippingAddress : billingAddress,
        shippingMethod,
        paymentIntentId: paymentIntentId
      }

      const order = await createOrder(orderData)
      clearCart()
      toast.success('Acquisition confirmed!')
      navigate('/checkout/success', { 
        state: { orderId: order._id, orderNumber: order.orderNumber } 
      })
    } catch (error) {
      toast.error('Logistics documentation failed')
    }
  }

  const handlePaymentError = (error) => {
    toast.error('Transaction failed: Server communication lost')
  }

  if (!cart || loading || !clientSecret) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center py-32">
        <div className="text-center space-y-10 animate-pulse">
          <div className="w-24 h-24 bg-slate-50 rounded-full mx-auto"></div>
          <div className="h-6 w-48 bg-slate-50 rounded-full mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white py-32">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center mb-24">
          <span className="text-accent font-black tracking-[0.3em] uppercase text-xs mb-6 block">Secure Bridge</span>
          <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tight leading-none mb-4">Complete <span className="text-gradient">Acquisition</span></h1>
          <div className="flex items-center justify-center space-x-10 pt-10">
             <div className={`flex items-center space-x-4 ${step >= 1 ? 'text-slate-900' : 'text-slate-200'}`}>
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs border-2 ${step >= 1 ? 'border-accent bg-accent text-white shadow-xl shadow-accent/20' : 'border-slate-100 text-slate-300'}`}>01</div>
                <span className="font-black uppercase tracking-widest text-[10px]">Logistics</span>
             </div>
             <div className="w-20 h-0.5 bg-slate-50"></div>
             <div className={`flex items-center space-x-4 ${step >= 2 ? 'text-slate-900' : 'text-slate-200'}`}>
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs border-2 ${step >= 2 ? 'border-accent bg-accent text-white shadow-xl shadow-accent/20' : 'border-slate-100 text-slate-300'}`}>02</div>
                <span className="font-black uppercase tracking-widest text-[10px]">Financials</span>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-start">
          <div className="lg:col-span-8">
            {step === 1 ? (
              <form onSubmit={handleAddressSubmit} className="space-y-16 animate-fade-in">
                <div className="space-y-12">
                   <h3 className="text-3xl font-black text-slate-900 tracking-tight">Shipping <span className="text-gradient">Logistics</span></h3>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-2 group">
                         <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">First Name</label>
                         <input
                           type="text"
                           value={shippingAddress.firstName}
                           onChange={(e) => setShippingAddress({ ...shippingAddress, firstName: e.target.value })}
                           className="w-full bg-slate-50 border-none rounded-3xl py-6 px-8 font-bold text-slate-900 focus:ring-4 focus:ring-accent/10 transition-all"
                           required
                         />
                      </div>
                      <div className="space-y-2 group">
                         <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Last Name</label>
                         <input
                           type="text"
                           value={shippingAddress.lastName}
                           onChange={(e) => setShippingAddress({ ...shippingAddress, lastName: e.target.value })}
                           className="w-full bg-slate-50 border-none rounded-3xl py-6 px-8 font-bold text-slate-900 focus:ring-4 focus:ring-accent/10 transition-all"
                           required
                         />
                      </div>
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Street Identifier</label>
                      <input
                        type="text"
                        value={shippingAddress.address}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                        className="w-full bg-slate-50 border-none rounded-3xl py-6 px-8 font-bold text-slate-900 focus:ring-4 focus:ring-accent/10 transition-all placeholder-slate-300"
                        placeholder="e.g. 123 Artisan Peak, Studio 4"
                        required
                      />
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">City</label>
                         <input
                           type="text"
                           value={shippingAddress.city}
                           onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                           className="w-full bg-slate-50 border-none rounded-3xl py-6 px-8 font-bold text-slate-900 focus:ring-4 focus:ring-accent/10 transition-all"
                           required
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Region</label>
                         <input
                           type="text"
                           value={shippingAddress.state}
                           onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                           className="w-full bg-slate-50 border-none rounded-3xl py-6 px-8 font-bold text-slate-900 focus:ring-4 focus:ring-accent/10 transition-all"
                           required
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Postal Code</label>
                         <input
                           type="text"
                           value={shippingAddress.zipCode}
                           onChange={(e) => setShippingAddress({ ...shippingAddress, zipCode: e.target.value })}
                           className="w-full bg-slate-50 border-none rounded-3xl py-6 px-8 font-bold text-slate-900 focus:ring-4 focus:ring-accent/10 transition-all"
                           required
                         />
                      </div>
                   </div>
                </div>

                <div className="space-y-10">
                   <h3 className="text-3xl font-black text-slate-900 tracking-tight">Delivery <span className="text-gradient">Preference</span></h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div 
                        onClick={() => setShippingMethod('standard')}
                        className={`p-10 rounded-[3rem] border-4 cursor-pointer transition-all ${shippingMethod === 'standard' ? 'border-accent bg-white shadow-2xl shadow-slate-100' : 'border-slate-50 bg-slate-50 hover:bg-white'}`}
                      >
                         <div className="flex justify-between items-start mb-6">
                            <FiTruck className={`w-8 h-8 ${shippingMethod === 'standard' ? 'text-accent' : 'text-slate-300'}`} />
                            <span className="font-black text-slate-900 text-xl font-black">$5.00</span>
                         </div>
                         <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs mb-2">Standard Protocol</h4>
                         <p className="text-slate-500 text-sm font-bold">5–7 Artisan Workdays</p>
                      </div>
                      <div 
                        onClick={() => setShippingMethod('express')}
                        className={`p-10 rounded-[3rem] border-4 cursor-pointer transition-all ${shippingMethod === 'express' ? 'border-accent bg-white shadow-2xl shadow-slate-100' : 'border-slate-50 bg-slate-50 hover:bg-white'}`}
                      >
                         <div className="flex justify-between items-start mb-6">
                            <FiTruck className={`w-8 h-8 ${shippingMethod === 'express' ? 'text-accent' : 'text-slate-300'}`} />
                            <span className="font-black text-slate-900 text-xl font-black">$15.00</span>
                         </div>
                         <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs mb-2">Express Command</h4>
                         <p className="text-slate-500 text-sm font-bold">2–3 Rapid Workdays</p>
                      </div>
                   </div>
                </div>

                <div className="pt-10">
                   <button type="submit" className="w-full btn-accent !py-8 !rounded-[2rem] flex items-center justify-center space-x-4">
                      <span className="font-black uppercase tracking-widest text-sm">Proceed to Financials</span>
                      <FiArrowRight className="w-5 h-5" />
                   </button>
                </div>
              </form>
            ) : (
              <div className="space-y-16 animate-fade-in">
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">Financial <span className="text-gradient">Verification</span></h3>
                {stripe && clientSecret && (
                  <Elements stripe={stripe} options={{ 
                    clientSecret,
                    appearance: {
                      theme: 'stripe',
                      variables: {
                        colorPrimary: '#2563eb',
                        colorBackground: '#f8fafc',
                        colorText: '#0f172a',
                        borderRadius: '2.5rem',
                        fontFamily: 'Inter, sans-serif'
                      },
                    },
                  }}>
                    <PaymentForm
                      clientSecret={clientSecret}
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                    />
                  </Elements>
                )}
                
                <button 
                  onClick={() => setStep(1)} 
                  className="text-slate-400 hover:text-slate-900 font-black uppercase tracking-widest text-[9px] flex items-center space-x-3 transition-colors"
                >
                   <FiArrowLeft />
                   <span>Return to Logistics</span>
                </button>
              </div>
            )}
          </div>

          <div className="lg:col-span-4 sticky top-10">
             <div className="p-12 bg-slate-950 rounded-[4rem] text-white shadow-3xl shadow-slate-200">
                <h3 className="text-2xl font-black mb-12 tracking-tight leading-none">Order Artifacts</h3>
                
                <div className="space-y-6 mb-12 max-h-96 overflow-y-auto pr-4 custom-scrollbar">
                   {cart.map((item) => (
                      <div key={item._id} className="flex space-x-6 items-center">
                         <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white/5 flex-shrink-0">
                            <img src={item.image} className="w-full h-full object-cover" />
                         </div>
                         <div className="flex-1">
                            <h4 className="text-xs font-black uppercase tracking-widest leading-tight mb-1">{item.name}</h4>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Qty: {item.quantity}</p>
                         </div>
                         <span className="font-black text-sm text-slate-200">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                   ))}
                </div>

                <div className="space-y-6 mb-12">
                   <div className="flex justify-between text-slate-400 font-bold uppercase tracking-widest text-[9px]">
                      <span>Subtotal</span>
                      <span className="text-slate-200">${subtotal.toFixed(2)}</span>
                   </div>
                   <div className="flex justify-between text-slate-400 font-bold uppercase tracking-widest text-[9px]">
                      <span>Logistics</span>
                      <span className="text-slate-200">${shippingCost.toFixed(2)}</span>
                   </div>
                   <div className="flex justify-between text-slate-400 font-bold uppercase tracking-widest text-[9px]">
                      <span>Reserved Tax</span>
                      <span className="text-slate-200">${tax.toFixed(2)}</span>
                   </div>
                   <div className="pt-6 border-t border-white/10 flex justify-between">
                      <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Aggregate</span>
                      <span className="text-5xl font-black tracking-tighter leading-none">${total.toFixed(2)}</span>
                   </div>
                </div>

                <div className="space-y-6 pt-12 border-t border-white/5">
                   <div className="flex items-center space-x-4 text-slate-500">
                      <FiShield className="w-5 h-5" />
                      <span className="font-black uppercase tracking-widest text-[9px]">SSL Protected Vault</span>
                   </div>
                   <div className="flex items-center space-x-4 text-slate-500">
                      <FiCheckCircle className="w-5 h-5" />
                      <span className="font-black uppercase tracking-widest text-[9px]">Verified Artisan Exchange</span>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}


export default Checkout
