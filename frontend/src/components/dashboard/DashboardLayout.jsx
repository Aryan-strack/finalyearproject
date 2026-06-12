import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX, FiSun, FiMoon, FiHome, FiUsers, FiShoppingBag, FiDollarSign, FiSettings, FiLogOut, FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const SidebarItem = ({ icon: Icon, label, id, active, onClick }) => (
    <motion.button
        whileHover={{ x: 8 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onClick(id)}
        className={`w-full flex items-center space-x-4 px-8 py-5 rounded-[1.5rem] transition-all duration-500 group ${active
            ? 'bg-slate-950 text-white shadow-2xl shadow-slate-400 font-black italic'
            : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50 font-bold'
            }`}
    >
        <Icon className={`w-5 h-5 ${active ? 'text-accent' : 'group-hover:text-slate-900'} transition-colors`} />
        <span className="text-[11px] uppercase tracking-[0.3em] truncate">{label}</span>
        {active && <div className="ml-auto w-1.5 h-1.5 bg-accent rounded-full shadow-[0_0_10px_rgba(var(--accent-rgb),0.5)]" />}
    </motion.button>
);

const DashboardLayout = ({ children, activeTab, setActiveTab, title = "Command Center", navItems = [], vendorProfileSidebar = null }) => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [isSidebarOpen, setIsSidebarOpen] = useState(typeof window !== 'undefined' ? window.innerWidth >= 768 : true);
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-white font-display">
            {/* Mobile Directive Header */}
            <div className="md:hidden flex items-center justify-between p-6 bg-white border-b border-slate-50 sticky top-0 z-[60]">
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-900">
                    {isSidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                </button>
                <div className="flex flex-col items-center">
                    <span className="text-[9px] font-black uppercase tracking-[0.5em] text-accent leading-none mb-1">Global Directive</span>
                    <h1 className="text-xl font-black text-slate-900 tracking-tighter italic">Vanguard</h1>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-slate-950 flex items-center justify-center text-white font-black text-xs italic">
                    {user?.name?.charAt(0)}
                </div>
            </div>

            <div className="flex">
                {/* Protocol Sidebar */}
                <aside className={`fixed md:sticky top-0 left-0 z-50 h-screen w-80 flex-shrink-0 bg-white border-r border-slate-50 flex flex-col pt-32 md:pt-12 pb-12 transition-all duration-500 overflow-y-auto scrollbar-hide ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
                            <div className="px-10 mb-16">
                                <Link to="/" className="flex items-center space-x-4 mb-16 group">
                                    <div className="relative w-12 h-12 bg-slate-950 rounded-[1.25rem] flex items-center justify-center transform group-hover:rotate-[15deg] transition-all duration-500 shadow-2xl">
                                        <span className="text-2xl font-black text-white italic">V</span>
                                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-accent/20"></div>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xl font-black text-slate-900 tracking-tighter leading-none italic">VANGUARD</span>
                                        <span className="text-[9px] font-black uppercase tracking-[0.4em] text-accent mt-1 leading-none">Protocol</span>
                                    </div>
                                </Link>

                                {vendorProfileSidebar && (
                                    <div className="mb-12 p-8 bg-slate-50 rounded-[2.5rem] border-2 border-slate-100/50 shadow-inner">
                                        <div className="flex flex-col items-center text-center space-y-4">
                                            <div className="w-24 h-24 rounded-[2rem] overflow-hidden border-4 border-white shadow-2xl shadow-slate-200">
                                                {vendorProfileSidebar.image ? (
                                                    <img src={vendorProfileSidebar.image} alt="Profile" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-slate-950 text-white font-black text-3xl italic">
                                                        {vendorProfileSidebar.name?.charAt(0) || 'V'}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-lg font-black text-slate-900 tracking-tighter italic leading-none">{vendorProfileSidebar.name}</p>
                                                <p className="text-[9px] font-black uppercase tracking-widest text-accent mt-2">{vendorProfileSidebar.tagline}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <nav className="space-y-3">
                                    <div className="flex items-center space-x-3 mb-6 px-4">
                                       <div className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
                                       <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-300">Authority Access</span>
                                    </div>
                                    {navItems.map((item) => (
                                        <SidebarItem
                                            key={item.id}
                                            {...item}
                                            active={activeTab === item.id}
                                            onClick={(id) => {
                                                setActiveTab(id);
                                                if (window.innerWidth < 768) setIsSidebarOpen(false);
                                            }}
                                        />
                                    ))}
                                </nav>
                            </div>

                            <div className="mt-auto px-10">
                                <div className="p-8 bg-slate-950 rounded-[2.5rem] space-y-8 relative overflow-hidden shadow-2xl shadow-slate-400">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 blur-3xl -mr-16 -mt-16" />
                                    <div className="flex items-center space-x-4 relative z-10">
                                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center font-black text-white italic text-lg shadow-inner">
                                            {user?.name?.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-black text-white tracking-tight italic truncate">{user?.name}</p>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-accent truncate">ID: {user?._id?.slice(-6).toUpperCase()}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl transition-all duration-300 group"
                                    >
                                        <FiLogOut className="w-4 h-4 text-slate-500 group-hover:text-accent" />
                                        <span className="text-[9px] font-black uppercase tracking-widest">Terminate Session</span>
                                    </button>
                                </div>
                            </div>
                        </aside>

                {/* Main Protocol Feed */}
                <main className="flex-1 min-h-screen bg-white relative">
                    <div className="container mx-auto py-12 px-6 md:py-24 md:px-16 lg:px-24 max-w-screen-2xl">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};


export default DashboardLayout;
