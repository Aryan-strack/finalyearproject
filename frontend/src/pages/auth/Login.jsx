import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import {
   FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight,
   FiShield, FiZap, FiStar, FiGlobe
} from 'react-icons/fi'
import toast from 'react-hot-toast'

const Login = () => {
   const [formData, setFormData] = useState({
      email: '',
      password: ''
   })
   const [showPassword, setShowPassword] = useState(false)
   const [loading, setLoading] = useState(false)

   const { login } = useAuth()
   const navigate = useNavigate()
   const location = useLocation()

   const from = location.state?.from?.pathname || '/dashboard'

   const handleChange = (e) => {
      setFormData({
         ...formData,
         [e.target.name]: e.target.value
      })
   }

   const handleSubmit = async (e) => {
      e.preventDefault()
      setLoading(true)

      try {
         const result = await login(formData.email, formData.password)
         if (result.success) {
            toast.success('Welcome back!')
            navigate(from, { replace: true })
         } else {
            toast.error(result.error || 'Identity verification failed')
         }
      } catch (error) {
         toast.error('An unexpected connection error occurred')
      } finally {
         setLoading(false)
      }
   }

   return (
      <div className="min-h-screen bg-white flex overflow-hidden">
         {/* Left Branding Grid */}
         <div className="hidden lg:flex w-1/2 bg-slate-950 p-24 flex-col justify-between relative overflow-hidden">
            <img
               src="https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=2070"
               alt="Vanguard Background"
               className="absolute inset-0 w-full h-full object-cover opacity-90 mix-blend-overlay grayscale"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/50" />
            <div className="absolute top-0 left-0 w-full h-full">
               <div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] bg-accent/20 blur-[150px] rounded-full" />
               <div className="absolute bottom-[20%] left-[10%] w-[400px] h-[400px] bg-blue-500/10 blur-[120px] rounded-full" />
            </div>

            <div className="relative z-10">
               <Link to="/" className="flex items-center space-x-4 group mb-32">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-2xl group-hover:rotate-12 transition-transform duration-500">
                     <span className="text-2xl font-black text-slate-900 italic">V</span>
                  </div>
                  <span className="text-2xl font-black text-white tracking-widest italic">VANGUARD</span>
               </Link>

               <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-10"
               >
                  <h1 className="text-7xl font-black text-white tracking-tighter leading-none italic">
                     Return to <br />
                     <span className="text-accent underline decoration-slate-800 underline-offset-[12px]">The Forge</span>
                  </h1>
                  <p className="text-xl text-slate-400 font-medium italic max-w-lg leading-relaxed">
                     Re-initialize your secure connection to the global artisan network and resume curation of your private collection.
                  </p>
               </motion.div>
            </div>

            <div className="relative z-10 grid grid-cols-2 gap-12">
               {[
                  { icon: FiShield, label: 'Secure Vault', desc: 'Hardware-Level Encryption' },
                  { icon: FiZap, label: 'Instant Sync', desc: 'Real-time Global Updates' },
                  { icon: FiStar, label: 'Priority Access', desc: 'Standard for Collective' },
                  { icon: FiGlobe, label: 'Neural Network', desc: 'Connected Global Hubs' }
               ].map((stat, i) => (
                  <div key={i} className="space-y-3">
                     <stat.icon className="w-6 h-6 text-accent" />
                     <p className="text-sm font-black text-white uppercase tracking-widest">{stat.label}</p>
                     <p className="text-xs text-slate-500 font-medium italic">{stat.desc}</p>
                  </div>
               ))}
            </div>
         </div>

         {/* Right Form Engine */}
         <div className="w-full lg:w-1/2 min-h-screen bg-white flex items-center justify-center p-8 md:p-24 relative">
            <div className="absolute top-40 right-12 hidden md:block">
               <p className="text-xs text-slate-400 font-black uppercase tracking-widest">
                  New to the Collective? <Link to="/register" className="text-slate-900 hover:text-accent ml-2 transition-colors underline underline-offset-4">Establish ID</Link>
               </p>
            </div>

            <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="w-full max-w-lg space-y-12"
            >
               <div className="space-y-6">
                  <div className="flex items-center space-x-3 md:hidden mb-12 mt-16">
                     <div className="w-10 h-10 bg-slate-950 rounded-xl flex items-center justify-center text-white italic font-black">V</div>
                     <span className="font-black tracking-widest text-slate-900">VANGUARD</span>
                  </div>
                  <span className="text-accent font-black tracking-[0.4em] uppercase text-[10px] block">Security Protocol Initialization</span>
                  <h2 className="text-5xl font-black text-slate-900 tracking-tighter leading-none italic">Verify <span className="text-slate-200">Identity</span></h2>
               </div>

               <form className="space-y-8" onSubmit={handleSubmit}>
                  <div className="space-y-6">
                     <div className="group">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-300 ml-6 mb-2 block group-focus-within:text-accent transition-colors">Credential Email</label>
                        <div className="relative">
                           <FiMail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-accent transition-all" />
                           <input name="email" type="email" required value={formData.email} onChange={handleChange} placeholder="Secure Link Address" className="w-full bg-slate-50 border-none rounded-[2rem] py-6 px-16 font-bold text-slate-900 focus:ring-4 focus:ring-accent/5 transition-all shadow-inner" />
                        </div>
                     </div>

                     <div className="group">
                        <div className="flex justify-between items-center ml-6 mb-2">
                           <label className="text-[9px] font-black uppercase tracking-widest text-slate-300 group-focus-within:text-accent transition-colors">Access Key</label>
                           <Link to="/forgot-password" size="xs" className="text-[9px] font-black uppercase tracking-widest text-accent hover:underline mr-6">Key Recovery?</Link>
                        </div>
                        <div className="relative">
                           <FiLock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-accent transition-all" />
                           <input name="password" type={showPassword ? 'text' : 'password'} required value={formData.password} onChange={handleChange} placeholder="••••••••" className="w-full bg-slate-50 border-none rounded-[2rem] py-6 px-16 font-bold text-slate-900 focus:ring-4 focus:ring-accent/5 transition-all shadow-inner" />
                           <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-900 transition-colors"><FiEye className="w-4 h-4" /></button>
                        </div>
                     </div>
                  </div>

                  <button
                     type="submit"
                     disabled={loading}
                     className="w-full h-24 bg-slate-950 text-white rounded-[2rem] flex items-center justify-center space-x-4 shadow-3xl shadow-slate-200 group relative overflow-hidden"
                  >
                     <div className="absolute inset-0 bg-accent translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                     <div className="relative z-10 flex items-center space-x-4">
                        {loading ? (
                           <div className="animate-spin rounded-full h-6 w-6 border-2 border-white/30 border-t-white" />
                        ) : (
                           <>
                              <span className="font-black uppercase tracking-[0.3em] text-xs">Authorize Terminal</span>
                              <FiArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                           </>
                        )}
                     </div>
                  </button>
               </form>

               <div className="md:hidden text-center pt-8">
                  <p className="text-xs text-slate-400 font-black uppercase tracking-widest">
                     First deployment? <Link to="/register" className="text-slate-900 hover:text-accent ml-2 transition-colors underline underline-offset-4">Establish ID</Link>
                  </p>
               </div>
            </motion.div>
         </div>
      </div>
   )
}

export default Login

