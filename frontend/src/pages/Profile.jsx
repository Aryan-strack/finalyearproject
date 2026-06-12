import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiUser, FiMapPin, FiAward, FiClock, FiMail, FiPhone, FiGlobe, FiEdit2, FiStar, FiPackage, FiTrendingUp, FiHeart, FiShoppingBag } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import api from '../utils/api';

const Profile = () => {
  const [vendorProfile, setVendorProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showEditModal, setShowEditModal] = useState(false)

  useEffect(() => {
    fetchVendorProfile()
  }, [])

  const fetchVendorProfile = async () => {
    try {
      setLoading(true)
      const response = await api.get('/vendors/profile/me')
      const profile = response.data.profile
      if (profile) {
        const cleanProfile = {
          ...profile,
          shopName: String(profile.shopName || ''),
          bio: String(profile.bio || ''),
          tagline: String(profile.tagline || ''),
          specialties: Array.isArray(profile.specialties) ? profile.specialties.map(s => String(s)) : [],
          location: profile.location && typeof profile.location === 'object' ? profile.location : {},
          experience: profile.experience && typeof profile.experience === 'object' ? profile.experience : {},
          education: Array.isArray(profile.education) ? profile.education : [],
          certifications: Array.isArray(profile.certifications) ? profile.certifications : [],
          contactInfo: profile.contactInfo && typeof profile.contactInfo === 'object' ? profile.contactInfo : {},
          businessHours: profile.businessHours && typeof profile.businessHours === 'object' ? profile.businessHours : {},
          policies: profile.policies && typeof profile.policies === 'object' ? profile.policies : {}
        }
        setVendorProfile(cleanProfile)
      }
    } catch (error) {
      console.error('Error fetching vendor profile:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center py-32">
        <div className="text-center animate-pulse">
          <div className="w-24 h-24 bg-slate-50 rounded-full mx-auto mb-8"></div>
          <div className="h-8 w-48 bg-slate-50 rounded-lg mx-auto"></div>
        </div>
      </div>
    )
  }

  if (!vendorProfile) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center py-32">
        <div className="text-center max-w-xl mx-auto px-6">
          <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-10">
            <FiUser className="w-12 h-12 text-slate-200" />
          </div>
          <h2 className="text-6xl font-black text-slate-900 mb-8 tracking-tight">Profile not <span className="text-gradient">found</span></h2>
          <p className="text-xl text-slate-500 mb-12">Set up your artisan profile to start showcasing your collection.</p>
          <Link to="/dashboard" className="btn-accent !px-12">Create My Profile</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white py-32">
      <div className="container mx-auto px-6">
        {/* Profile Hero */}
        <div className="flex flex-col md:flex-row items-center gap-16 mb-40 animate-fade-in">
           <div className="relative group">
              <div className="w-64 h-64 rounded-[4rem] overflow-hidden bg-slate-50 shadow-2xl shadow-slate-100 transition-transform duration-700 group-hover:scale-105">
                 <img src={vendorProfile.profileImage} className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-accent rounded-2xl flex items-center justify-center shadow-xl border-4 border-white">
                 <FiAward className="text-white w-6 h-6" />
              </div>
           </div>

           <div className="flex-1 text-center md:text-left space-y-6">
              <span className="text-accent font-black tracking-[0.3em] uppercase text-xs">MASTER ARTISAN</span>
              <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tight leading-none">
                 {vendorProfile.shopName.split(' ')[0]} <span className="text-gradient">{vendorProfile.shopName.split(' ')[1] || 'Studio'}</span>
              </h1>
              <p className="text-2xl text-slate-500 font-medium leading-relaxed max-w-2xl">{vendorProfile.tagline}</p>
              
              <div className="flex flex-wrap gap-10 justify-center md:justify-start pt-6">
                 <div className="flex flex-col">
                    <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-2">Years Active</span>
                    <span className="text-3xl font-black text-slate-900">{vendorProfile.experience?.years || '5'}</span>
                 </div>
                 <div className="flex flex-col">
                    <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-2">Collection</span>
                    <span className="text-3xl font-black text-slate-900">32</span>
                 </div>
                 <div className="flex flex-col">
                    <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-2">Rating</span>
                    <div className="flex items-center space-x-2">
                       <span className="text-3xl font-black text-slate-900">5.0</span>
                       <FiStar className="text-accent fill-current w-5 h-5" />
                    </div>
                 </div>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
           {/* Left Info Sidebar */}
           <div className="lg:col-span-4 space-y-12">
              <div className="p-12 rounded-[4rem] bg-slate-950 text-white space-y-10">
                 <h3 className="text-2xl font-black uppercase tracking-widest text-[10px] text-slate-500">Contact Studio</h3>
                 <div className="space-y-8">
                    <div className="flex items-center space-x-6 group cursor-pointer">
                       <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-accent transition-colors"><FiMail className="w-5 h-5" /></div>
                       <div className="flex flex-col">
                          <span className="text-slate-500 font-bold text-[9px] uppercase tracking-widest">Email</span>
                          <span className="font-bold text-sm truncate">{vendorProfile.contactInfo?.email}</span>
                       </div>
                    </div>
                    <div className="flex items-center space-x-6 group cursor-pointer">
                       <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-accent transition-colors"><FiMapPin className="w-5 h-5" /></div>
                       <div className="flex flex-col">
                          <span className="text-slate-500 font-bold text-[9px] uppercase tracking-widest">Studio Location</span>
                          <span className="font-bold text-sm">{vendorProfile.location?.city}, {vendorProfile.location?.country}</span>
                       </div>
                    </div>
                 </div>

                 <button onClick={() => setShowEditModal(true)} className="w-full btn-accent !py-6 !rounded-[2rem] flex items-center justify-center space-x-3">
                    <FiEdit2 className="w-4 h-4" />
                    <span className="font-black uppercase tracking-widest text-xs">Edit Portfolio</span>
                 </button>
              </div>

              {vendorProfile.specialties && (
                 <div className="p-12 space-y-8">
                    <h3 className="font-black uppercase tracking-widest text-[10px] text-slate-400">Crafting Specialties</h3>
                    <div className="flex flex-wrap gap-4">
                       {vendorProfile.specialties.map(spec => (
                          <span key={spec} className="px-6 py-3 rounded-2xl bg-slate-50 text-slate-900 font-black text-xs uppercase tracking-widest">{spec}</span>
                       ))}
                    </div>
                 </div>
              )}
           </div>

           {/* Right Content */}
           <div className="lg:col-span-8 space-y-24">
              <div className="space-y-8">
                 <h3 className="text-4xl font-black text-slate-900 tracking-tight">The Artisan's <span className="text-gradient">Story</span></h3>
                 <p className="text-2xl text-slate-600 leading-relaxed font-normal">
                    {vendorProfile.bio}
                 </p>
              </div>

              {/* Achievements / Education */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div className="space-y-10">
                    <h3 className="font-black uppercase tracking-widest text-[10px] text-slate-400">Education & Heritage</h3>
                    <div className="space-y-8">
                       {vendorProfile.education?.map((edu, i) => (
                          <div key={i} className="flex gap-6 group">
                             <div className="w-0.5 bg-slate-100 group-hover:bg-accent transition-colors"></div>
                             <div>
                                <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs mb-1">{edu.degree}</h4>
                                <p className="text-slate-500 font-bold text-sm mb-1">{edu.institution}</p>
                                <span className="text-[10px] font-black text-accent">{edu.year}</span>
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-10">
                    <h3 className="font-black uppercase tracking-widest text-[10px] text-slate-400">Certifications</h3>
                    <div className="space-y-6">
                       {vendorProfile.certifications?.map((cert, i) => (
                          <div key={i} className="p-6 rounded-3xl border border-slate-50 flex items-center justify-between hover:border-slate-200 transition-colors">
                             <span className="font-black text-slate-900 uppercase tracking-widest text-[10px]">{cert.name || cert}</span>
                             <FiAward className="text-slate-200 w-5 h-5" />
                          </div>
                       ))}
                    </div>
                 </div>
              </div>

              {/* Policies & Hours */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-20 pt-20 border-t border-slate-50">
                 <div className="space-y-8">
                    <h3 className="font-black uppercase tracking-widest text-[10px] text-slate-400">Studio Policies</h3>
                    <div className="space-y-6">
                       {Object.entries(vendorProfile.policies).map(([key, val]) => (
                          <div key={key} className="space-y-2">
                             <h4 className="font-black text-slate-900 uppercase tracking-[0.2em] text-[8px]">{key.replace(/([A-Z])/g, ' $1')}</h4>
                             <p className="text-slate-500 font-bold text-xs">{String(val)}</p>
                          </div>
                       ))}
                    </div>
                 </div>
                 <div className="space-y-8">
                    <h3 className="font-black uppercase tracking-widest text-[10px] text-slate-400">Collaborative Hours</h3>
                    <div className="grid grid-cols-2 gap-4">
                       {Object.entries(vendorProfile.businessHours).map(([day, hours]) => (
                          <div key={day} className="flex flex-col space-y-1">
                             <span className="text-slate-400 font-black uppercase text-[8px] tracking-[0.2em]">{day}</span>
                             <span className="text-slate-900 font-bold text-xs">{typeof hours === 'string' ? hours : hours.closed ? 'Closed' : `${hours.open}–${hours.close}`}</span>
                          </div>
                       ))}
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {showEditModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xl flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-[4rem] max-w-xl w-full p-20 text-center space-y-10 animate-fade-in">
            <h3 className="text-4xl font-black text-slate-900 tracking-tight">Portfolio <span className="text-gradient">Manager</span></h3>
            <p className="text-xl text-slate-500 font-medium leading-relaxed">To update your collection or profile details, please visit your central command dashboard.</p>
            <div className="flex flex-col sm:flex-row gap-4 pt-10">
               <button onClick={() => setShowEditModal(false)} className="flex-1 btn-outline !py-6 !rounded-3xl uppercase tracking-widest font-black text-[10px]">Go Back</button>
               <Link to="/dashboard" className="flex-1 btn-accent !py-6 !rounded-3xl uppercase tracking-widest font-black text-[10px]">Dashboard</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Profile;
