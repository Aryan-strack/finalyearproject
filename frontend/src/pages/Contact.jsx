import React, { useState } from 'react'
import { FiMail, FiPhone, FiMapPin, FiClock, FiSend, FiUser, FiMessageSquare } from 'react-icons/fi'
import toast from 'react-hot-toast'

const Contact = () => {
   const [formData, setFormData] = useState({
      name: '',
      email: '',
      subject: '',
      message: ''
   })
   const [loading, setLoading] = useState(false)

   const handleChange = (e) => {
      setFormData({
         ...formData,
         [e.target.name]: e.target.value
      })
   }

   const handleSubmit = async (e) => {
      e.preventDefault()
      setLoading(true)
      setTimeout(() => {
         toast.success('Your message has been encoded into our systems. Our curators will respond shortly.')
         setFormData({ name: '', email: '', subject: '', message: '' })
         setLoading(false)
      }, 1500)
   }

   const contactMethods = [
      { icon: FiMail, label: 'Digital Hub', value: 'curators@artisanmart.com', sub: 'Instant inquiry' },
      { icon: FiPhone, label: 'Voice Command', value: '+44 (0) 20 7946 0123', sub: 'GMT 09:00 - 18:00' },
      { icon: FiMapPin, label: 'Coordinates', value: 'Artisan Square, Block 9', sub: 'Metropolis Central' }
   ]

   return (
      <div className="min-h-screen bg-white py-20 md:py-32">
         <div className="container mx-auto px-6">
            {/* Header Section */}
            <div className="max-w-4xl mb-16 md:mb-32 space-y-12 pt-8">
               <span className="text-accent font-black tracking-[0.3em] uppercase text-xs block">Communication Bridge</span>
               <h1 className="text-4xl md:text-8xl font-black text-slate-900 tracking-tight leading-none italic">Let’s <span className="text-gradient">Synchronize.</span></h1>
               <p className="text-xl md:text-2xl text-slate-500 font-medium leading-relaxed max-w-2xl">
                  Our curators are perpetually standing by to facilitate your architectural and artisanal inquiries.
               </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
               {/* Left: Communication Stats & Hubs */}
               <div className="lg:col-span-5 space-y-12">
                  <div className="space-y-10">
                     {contactMethods.map((method, i) => (
                        <div key={i} className="flex items-center space-x-8 group">
                           <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-900 group-hover:bg-slate-950 group-hover:text-white transition-all duration-500">
                              <method.icon className="w-6 h-6" />
                           </div>
                           <div className="space-y-1">
                              <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none">{method.label}</p>
                              <h3 className="text-[16px] md:text-xl font-black text-slate-900 tracking-tight">{method.value}</h3>
                              <p className="text-xs text-slate-500 font-medium italic">{method.sub}</p>
                           </div>
                        </div>
                     ))}
                  </div>

                  <div className="p-8 md:p-12 bg-slate-950 rounded-[2.5rem] md:rounded-[4rem] text-white space-y-10 shadow-3xl shadow-slate-200">
                     <h2 className="text-2xl md:text-3xl font-black tracking-tight leading-none italic">The <span className="text-accent">Studio</span> Hours</h2>
                     <div className="space-y-6">
                        <div className="flex justify-between items-center text-sm font-bold border-b border-white/5 pb-4">
                           <span className="text-slate-500 uppercase tracking-widest text-[10px]">Weekday Operations</span>
                           <span className="text-white tracking-widest font-black uppercase text-[10px]">09:00 — 18:00</span>
                        </div>
                        <div className="flex justify-between items-center text-sm font-bold border-b border-white/5 pb-4">
                           <span className="text-slate-500 uppercase tracking-widest text-[10px]">Saturday Curation</span>
                           <span className="text-white tracking-widest font-black uppercase text-[10px]">10:00 — 16:00</span>
                        </div>
                        <div className="flex justify-between items-center text-sm font-bold">
                           <span className="text-slate-500 uppercase tracking-widest text-[10px]">Sunday Hiatus</span>
                           <span className="text-accent tracking-widest font-black uppercase text-[10px]">Dormant</span>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Right: Intelligence Form */}
               <div className="lg:col-span-7 bg-white rounded-[2.5rem] md:rounded-[4rem] border-4 border-slate-50 p-6 sm:p-12 md:p-20 shadow-3xl shadow-slate-100">
                  <form onSubmit={handleSubmit} className="space-y-12">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-4">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Codename</label>
                           <div className="relative">
                              <input
                                 name="name"
                                 required
                                 value={formData.name}
                                 onChange={handleChange}
                                 className="w-full bg-slate-50 border-none rounded-3xl px-8 py-6 text-sm font-bold focus:ring-4 focus:ring-slate-100 transition-all placeholder:text-slate-300"
                                 placeholder="Enter your name"
                              />
                              <FiUser className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-300" />
                           </div>
                        </div>
                        <div className="space-y-4">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Digital Key (Email)</label>
                           <div className="relative">
                              <input
                                 name="email"
                                 type="email"
                                 required
                                 value={formData.email}
                                 onChange={handleChange}
                                 className="w-full bg-slate-50 border-none rounded-3xl px-8 py-6 text-sm font-bold focus:ring-4 focus:ring-slate-100 transition-all placeholder:text-slate-300"
                                 placeholder="name@nexus.com"
                              />
                              <FiMail className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-300" />
                           </div>
                        </div>
                     </div>

                     <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Subject Directive</label>
                        <input
                           name="subject"
                           required
                           value={formData.subject}
                           onChange={handleChange}
                           className="w-full bg-slate-50 border-none rounded-3xl px-8 py-6 text-sm font-bold focus:ring-4 focus:ring-slate-100 transition-all placeholder:text-slate-300"
                           placeholder="Artisan Support / Custom Request"
                        />
                     </div>

                     <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Transmission Payload</label>
                        <textarea
                           name="message"
                           required
                           value={formData.message}
                           onChange={handleChange}
                           rows={6}
                           className="w-full bg-slate-50 border-none rounded-[2rem] px-8 py-8 text-sm font-bold focus:ring-4 focus:ring-slate-100 transition-all placeholder:text-slate-300 resize-none"
                           placeholder="Type your message here..."
                        />
                     </div>

                     <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-accent !py-8 !rounded-[2rem] flex items-center justify-center space-x-4 uppercase tracking-[0.3em] font-black text-xs disabled:opacity-50"
                     >
                        {loading ? (
                           <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                           <>
                              <FiSend className="w-5 h-5" />
                              <span>Initialize Transmission</span>
                           </>
                        )}
                     </button>
                  </form>
               </div>
            </div>

            {/* FAQ Section */}
            <div className="mt-24 md:mt-48 space-y-12 md:space-y-24">
               <div className="text-center space-y-6">
                  <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none">Frequent <span className="text-gradient">Inquiries</span></h2>
                  <p className="text-lg text-slate-500 font-medium uppercase tracking-widest text-xs">A collective of curated solutions</p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto">
                  {[
                     { q: "Becoming a Curator?", a: "Register as a vendor. Our board reviews applications within 72 digital hours." },
                     { q: "Currency Protocols?", a: "We utilize Stripe as our primary financial conduit for all global assets." },
                     { q: "Relocation Timelines?", a: "Global artifacts typically arrive within 3-7 operational solar cycles." },
                     { q: "Artifact Reversal?", a: "We provide a 30-day window for artifact returns for any reason." }
                  ].map((faq, i) => (
                     <div key={i} className="p-8 md:p-12 bg-slate-50 rounded-[2rem] md:rounded-[3rem] border-2 border-transparent hover:border-slate-100 hover:bg-white hover:shadow-2xl hover:shadow-slate-50 transition-all duration-500 group">
                        <h3 className="text-xl font-black text-slate-900 tracking-tight mb-4 group-hover:text-accent transition-colors italic">{faq.q}</h3>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed italic pr-8">"{faq.a}"</p>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </div>
   )
}


export default Contact
