import React from 'react'
import { useAuth } from '../../contexts/AuthContext'
import UserDashboard from './UserDashboard'
import VendorDashboard from './VendorDashboard'
import AdminDashboard from './AdminDashboard'

const Dashboard = () => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-10 animate-pulse">
          <div className="w-24 h-24 bg-slate-50 rounded-full mx-auto"></div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">Synchronizing Identity</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="text-center max-w-xl">
           <h1 className="text-6xl font-black text-slate-900 tracking-tight leading-none mb-8">Access <span className="text-gradient">Denied</span></h1>
           <p className="text-xl text-slate-500 font-medium italic mb-12">"The gate is locked for those without a key." — Please authenticate your account to enter the sanctum.</p>
           <a href="/login" className="btn-accent !px-12">Begin Authentication</a>
        </div>
      </div>
    )
  }

  switch (user.role) {
    case 'admin':
      return <AdminDashboard />
    case 'vendor':
      return <VendorDashboard />
    case 'customer':
      return <UserDashboard />
    default:
      return (
        <div className="min-h-screen bg-white flex items-center justify-center px-6">
          <div className="text-center max-w-xl">
             <h1 className="text-6xl font-black text-slate-900 tracking-tight leading-none mb-8">Protocol <span className="text-gradient">Unknown</span></h1>
             <p className="text-xl text-slate-500 font-medium italic">Your classification has not been properly assigned.</p>
          </div>
        </div>
      )
  }
}


export default Dashboard
