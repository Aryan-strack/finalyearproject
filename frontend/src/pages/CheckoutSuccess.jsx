import React from 'react'
import { Link } from 'react-router-dom'
import { FiCheckCircle, FiHome, FiShoppingBag, FiTruck } from 'react-icons/fi'

const CheckoutSuccess = () => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-32 px-6">
      <div className="max-w-xl w-full text-center space-y-12 animate-fade-in">
        {/* Success Icon */}
        <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-slate-100">
          <FiCheckCircle className="w-12 h-12 text-accent animate-pulse" />
        </div>

        {/* Success Message */}
        <div className="space-y-6">
           <span className="text-accent font-black tracking-[0.3em] uppercase text-xs block">Acquisition Complete</span>
           <h1 className="text-6xl font-black text-slate-900 tracking-tight leading-none">Thank <span className="text-gradient">You</span></h1>
           <p className="text-xl text-slate-500 font-medium leading-relaxed italic">"Every piece of art is a conversation between the artisan and the collector." — Your order has been documented.</p>
        </div>

        {/* Order Details */}
        <div className="p-10 bg-slate-950 rounded-[3rem] text-left space-y-8 text-white shadow-3xl shadow-slate-100">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Post-Acquisition Phases</h2>
          <div className="space-y-8">
            <div className="flex items-start space-x-6">
              <div className="bg-white/5 p-4 rounded-2xl">
                <FiCheckCircle className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-white mb-1">Documentation Confirmed</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Your digital certificate and receipt have been dispatched.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-6">
              <div className="bg-white/5 p-4 rounded-2xl">
                <FiShoppingBag className="w-6 h-6 text-slate-300" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-white mb-1">Artisan Curation</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">The artisan is preparing your artifact for transport.</p>
              </div>
            </div>

            <div className="flex items-start space-x-6">
              <div className="bg-white/5 p-4 rounded-2xl">
                <FiTruck className="w-6 h-6 text-slate-300" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-white mb-1">Secure Transit</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Global logistics will handle the final delivery protocol.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 pt-10">
          <Link
            to="/"
            className="flex-1 btn-accent !py-6 !rounded-3xl flex items-center justify-center space-x-4 shadow-[0_20px_50px_rgba(37,99,235,0.2)]"
          >
            <FiHome className="w-4 h-4" />
            <span className="font-black uppercase tracking-widest text-[10px]">Return to Gallery</span>
          </Link>
          <Link
            to="/dashboard"
            className="flex-1 btn-outline !py-6 !rounded-3xl flex items-center justify-center space-x-4"
          >
            <FiShoppingBag className="w-4 h-4" />
            <span className="font-black uppercase tracking-widest text-[10px]">View Acquisitions</span>
          </Link>
        </div>

        {/* Additional Info */}
        <div className="pt-10">
          <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em]">
            Digital verification code sent to your registered address.
          </p>
        </div>
      </div>
    </div>
  )
}


export default CheckoutSuccess
