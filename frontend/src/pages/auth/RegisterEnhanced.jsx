import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import {
  FiUser, FiMail, FiLock, FiEye, FiEyeOff,
  FiShoppingBag, FiArrowRight, FiClock,
  FiCheckCircle, FiAward, FiShield, FiActivity
} from 'react-icons/fi'
import toast from 'react-hot-toast'

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer'
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showApprovalMessage, setShowApprovalMessage] = useState(false)
  const [approvalMessage, setApprovalMessage] = useState('')

  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast.error('Identity verification failed: Passwords mismatch')
      return
    }

    if (formData.password.length < 6) {
      toast.error('Identity verification failed: Security key too short')
      return
    }

    setLoading(true)

    try {
      const { confirmPassword, ...registerData } = formData
      const result = await register(registerData)

      if (result.success) {
        if (result.requiresApproval) {
          setApprovalMessage(result.message)
          setShowApprovalMessage(true)
          toast.success('Artisan application received')
        } else {
          toast.success('Account established successfully')
          navigate('/dashboard')
        }
      } else {
        toast.error(result.error || 'Registration failed')
      }
    } catch (error) {
      toast.error('An unexpected connection error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (showApprovalMessage) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl w-full text-center space-y-12"
        >
          <div className="w-32 h-32 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-inner">
            <FiClock className="w-12 h-12 text-accent animate-pulse" />
          </div>
          <div className="space-y-6">
            <span className="text-accent font-black tracking-[0.4em] uppercase text-xs">Deployment Phase: Validation</span>
            <h2 className="text-6xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none italic">Application <span className="text-slate-400">Pending</span></h2>
            <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-lg mx-auto">{approvalMessage}</p>
          </div>

          <div className="p-12 bg-slate-950 rounded-[4rem] text-left space-y-8 text-white shadow-3xl shadow-slate-400 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 blur-[100px] -mr-32 -mt-32" />
            <div className="relative z-10">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-8">Operational Roadmap</h3>
              <div className="space-y-8">
                {[
                  { id: '01', title: 'Curatorial Review', desc: 'Team audits your artisan portfolio (1-2 days)' },
                  { id: '02', title: 'Encryption Key', desc: 'Secure verification metrics dispatched via email' },
                  { id: '03', title: 'Broadcasting', desc: 'Full access to the Artisan Control Suite' }
                ].map((step) => (
                  <div key={step.id} className="flex items-start space-x-6">
                    <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-xs font-black italic">{step.id}</div>
                    <div>
                      <p className="font-black text-white italic">{step.title}</p>
                      <p className="text-sm text-slate-400 mt-1 font-medium italic">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-10 flex flex-col sm:flex-row gap-6">
            <Link to="/login" className="flex-1 py-6 bg-slate-950 text-white rounded-3xl uppercase tracking-widest font-black text-xs hover:bg-slate-900 transition-all shadow-xl shadow-slate-200">Terminal Login</Link>
            <button onClick={() => setShowApprovalMessage(false)} className="flex-1 py-6 bg-slate-50 text-slate-400 rounded-3xl uppercase tracking-widest font-black text-xs hover:bg-slate-100 transition-all">New Deployment</button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex overflow-hidden">
      {/* Left Branding Grid */}
      <div className="hidden lg:flex w-1/2 bg-slate-950 p-24 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-[10%] left-[10%] w-[500px] h-[500px] bg-accent/20 blur-[150px] rounded-full" />
          <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] bg-blue-500/10 blur-[120px] rounded-full" />
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
              Join the <br />
              <span className="text-accent underline decoration-slate-800 underline-offset-[12px]">Elite Collective</span>
            </h1>
            <p className="text-xl text-slate-400 font-medium italic max-w-lg leading-relaxed">
              Establish your presence in the global artisan hierarchy. Secure access to high-liquidity marketplaces and curated collectors.
            </p>
          </motion.div>
        </div>

        <div className="relative z-10 grid grid-cols-2 gap-12">
          {[
            { icon: FiAward, label: 'Curated Excellence', desc: 'Top 1% Global Artisans' },
            { icon: FiShield, label: 'Secure Protocols', desc: 'Military-Grade Transactions' },
            { icon: FiActivity, label: 'Market Velocity', desc: '$2.4M Daily Liquidity' },
            { icon: FiCheckCircle, label: 'Authenticated', desc: 'Direct Artisan-to-Patron' }
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
            Established Collector? <Link to="/login" className="text-slate-900 hover:text-accent ml-2 transition-colors underline underline-offset-4">Sign In</Link>
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg space-y-12"
        >
          <div className="space-y-6 pt-16">
            <div className="flex items-center space-x-3 md:hidden mb-12">
              <div className="w-10 h-10 bg-slate-950 rounded-xl flex items-center justify-center text-white italic font-black">V</div>
              <span className="font-black tracking-widest text-slate-900">VANGUARD</span>
            </div>
            <span className="text-accent font-black tracking-[0.4em] uppercase text-[10px] block">Operational Access Request</span>
            <h2 className="text-5xl font-black text-slate-900 tracking-tighter leading-none italic">Initialize <span className="text-slate-200">Account</span></h2>
          </div>

          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div className="group">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-300 ml-6 mb-2 block group-focus-within:text-accent transition-colors">Identifier</label>
                <div className="relative">
                  <FiUser className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-accent transition-all" />
                  <input name="name" type="text" required value={formData.name} onChange={handleChange} placeholder="Full Legal Name" className="w-full bg-slate-50 border-none rounded-[2rem] py-6 px-16 font-bold text-slate-900 focus:ring-4 focus:ring-accent/5 transition-all shadow-inner" />
                </div>
              </div>

              <div className="group">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-300 ml-6 mb-2 block group-focus-within:text-accent transition-colors">Communication Link</label>
                <div className="relative">
                  <FiMail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-accent transition-all" />
                  <input name="email" type="email" required value={formData.email} onChange={handleChange} placeholder="Secure Email Contact" className="w-full bg-slate-50 border-none rounded-[2rem] py-6 px-16 font-bold text-slate-900 focus:ring-4 focus:ring-accent/5 transition-all shadow-inner" />
                </div>
              </div>

              <div className="group">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-300 ml-6 mb-2 block group-focus-within:text-accent transition-colors">Collective Role</label>
                <div className="relative">
                  <FiShoppingBag className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-accent transition-all" />
                  <select name="role" value={formData.role} onChange={handleChange} className="w-full bg-slate-50 border-none rounded-[2rem] py-6 px-16 font-bold text-slate-900 focus:ring-4 focus:ring-accent/5 transition-all appearance-none cursor-pointer shadow-inner">
                    <option value="customer">Collective Patron</option>
                    <option value="vendor">Master Artisan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-300 ml-6 mb-2 block">Security Key</label>
                  <div className="relative">
                    <FiLock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-accent transition-all" />
                    <input name="password" type={showPassword ? 'text' : 'password'} required value={formData.password} onChange={handleChange} placeholder="••••••••" className="w-full bg-slate-50 border-none rounded-[2rem] py-6 px-12 font-bold text-slate-900 focus:ring-4 focus:ring-accent/5 transition-all shadow-inner" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-900 transition-colors"><FiEye className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="group">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-300 ml-6 mb-2 block">Verify Key</label>
                  <div className="relative">
                    <FiLock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-accent transition-all" />
                    <input name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} required value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" className="w-full bg-slate-50 border-none rounded-[2rem] py-6 px-12 font-bold text-slate-900 focus:ring-4 focus:ring-accent/5 transition-all shadow-inner" />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-900 transition-colors"><FiEye className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 flex items-start space-x-4 group cursor-pointer">
              <div className="relative mt-0.5">
                <input type="checkbox" required className="peer w-5 h-5 opacity-0 absolute inset-0 cursor-pointer z-10" />
                <div className="w-5 h-5 border-2 border-slate-100 rounded-lg group-hover:border-accent transition-all peer-checked:bg-slate-950 peer-checked:border-slate-950 flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-sm scale-0 peer-checked:scale-100 transition-transform" />
                </div>
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 leading-normal group-hover:text-slate-900 transition-colors">I adhere to the collective code of conduct and protocol guidelines.</span>
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
                    <span className="font-black uppercase tracking-[0.3em] text-xs">Authorize Deployment</span>
                    <FiArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                  </>
                )}
              </div>
            </button>
          </form>

          <div className="md:hidden text-center pt-8">
            <p className="text-xs text-slate-400 font-black uppercase tracking-widest">
              Member? <Link to="/login" className="text-slate-900 hover:text-accent ml-2 transition-colors underline underline-offset-4">Log In</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Register;

