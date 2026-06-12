import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { FiSave, FiLock, FiSettings } from 'react-icons/fi';

const AdminSettings = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState({
        name: user?.name || '',
        email: user?.email || '',
    });
    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: ''
    });

    const handleProfileUpdate = (e) => {
        e.preventDefault();
        toast.success('Authority profile synchronized');
    };

    const handlePasswordUpdate = (e) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            return toast.error('Security handshake failed: Mismatched keys');
        }
        toast.success('Access protocol updated');
    };

    return (
        <div className="space-y-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Profile Authority */}
                <div className="lg:col-span-12">
                   <div className="flex items-center space-x-4 mb-8">
                      <div className="w-2 h-8 bg-accent rounded-full" />
                      <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">Authority Profile Configuration</h2>
                   </div>
                </div>

                <div className="lg:col-span-7 bg-white border-4 border-slate-50 rounded-[4rem] shadow-3xl shadow-slate-100 p-16">
                    <form onSubmit={handleProfileUpdate} className="space-y-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-4">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Designated Name</label>
                                <input
                                    type="text"
                                    value={profile.name}
                                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                    className="w-full px-8 py-6 rounded-[2rem] border-none bg-slate-50 text-slate-900 font-bold focus:ring-4 focus:ring-slate-100 transition-all italic"
                                />
                            </div>
                            <div className="space-y-4">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Communication Node</label>
                                <input
                                    type="email"
                                    value={profile.email}
                                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                    className="w-full px-8 py-6 rounded-[2rem] border-none bg-slate-50 text-slate-900 font-bold focus:ring-4 focus:ring-slate-100 transition-all italic"
                                />
                            </div>
                        </div>
                        <button type="submit" className="w-full md:w-auto px-16 py-6 bg-slate-950 text-white rounded-[2rem] font-black uppercase tracking-widest text-[10px] hover:bg-slate-800 shadow-2xl shadow-slate-400 transition-all flex items-center justify-center space-x-4">
                            <FiSave className="w-4 h-4" />
                            <span>Commit Profile Sync</span>
                        </button>
                    </form>
                </div>

                {/* Security Matrix */}
                <div className="lg:col-span-5 bg-slate-950 rounded-[4rem] p-16 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 blur-[100px] -mr-32 -mt-32" />
                    
                    <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40 mb-12 relative z-10 flex items-center space-x-3">
                        <FiLock className="text-accent" />
                        <span>Security Protocol Update</span>
                    </h3>

                    <form onSubmit={handlePasswordUpdate} className="space-y-10 relative z-10">
                        <div className="space-y-3">
                            <label className="block text-[9px] font-black text-white/30 uppercase tracking-widest px-4">Current Access Key</label>
                            <input
                                type="password"
                                value={passwords.current}
                                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                                className="w-full px-8 py-5 rounded-[1.5rem] border-none bg-white/5 text-white font-bold focus:ring-2 focus:ring-accent transition-all placeholder:text-white/10"
                                placeholder="••••••••"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="block text-[9px] font-black text-white/30 uppercase tracking-widest px-4">New Access Key</label>
                            <input
                                type="password"
                                value={passwords.new}
                                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                className="w-full px-8 py-5 rounded-[1.5rem] border-none bg-white/5 text-white font-bold focus:ring-2 focus:ring-accent transition-all placeholder:text-white/10"
                                placeholder="••••••••"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="block text-[9px] font-black text-white/30 uppercase tracking-widest px-4">Identify Confirmation</label>
                            <input
                                type="password"
                                value={passwords.confirm}
                                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                className="w-full px-8 py-5 rounded-[1.5rem] border-none bg-white/5 text-white font-bold focus:ring-2 focus:ring-accent transition-all placeholder:text-white/10"
                                placeholder="••••••••"
                            />
                        </div>
                        <button type="submit" className="w-full px-12 py-6 bg-accent text-white rounded-[1.5rem] font-black uppercase tracking-widest text-[9px] hover:bg-opacity-90 shadow-2xl shadow-accent/20 transition-all">
                            Rotate Access Protocol
                        </button>
                    </form>
                </div>
            </div>

            {/* Global Platform Directives */}
            <div className="bg-slate-50 border-2 border-slate-100 rounded-[4rem] p-16">
               <div className="flex items-center justify-between mb-16">
                   <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-accent">Strategic Oversight</span>
                      <h3 className="text-3xl font-black text-slate-900 tracking-tight italic">Platform <span className="text-slate-400">Directives</span></h3>
                   </div>
                   <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-xl shadow-slate-200">
                      <FiSettings className="text-slate-900" />
                   </div>
               </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-4">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Marketplace Identity</label>
                        <input type="text" defaultValue="Marketplace Protocol" disabled className="w-full px-8 py-6 rounded-[2rem] border-none bg-white text-slate-400 font-black uppercase tracking-widest text-[11px] shadow-sm italic cursor-not-allowed" />
                    </div>
                    <div className="space-y-4">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Protocol Support Node</label>
                        <input type="email" defaultValue="support@vanguard.io" className="w-full px-8 py-6 rounded-[2rem] border-none bg-white text-slate-900 font-bold focus:ring-4 focus:ring-slate-100 transition-all italic shadow-sm" />
                    </div>
                    
                    {[
                        { title: 'Infiltration Prevention', desc: 'Active platform maintenance mode', status: false },
                        { title: 'Entity Acquisition', desc: 'Allow new merchant registrations', status: true }
                    ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-10 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 hover:border-slate-200 transition-colors">
                            <div className="space-y-1">
                                <h4 className="font-black text-slate-900 text-sm tracking-tight italic leading-none">{item.title}</h4>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.desc}</p>
                            </div>
                            <div className={`w-16 h-8 rounded-full flex items-center px-1 cursor-pointer transition-colors ${item.status ? 'bg-accent' : 'bg-slate-200'}`}>
                                <div className={`w-6 h-6 bg-white rounded-full shadow-lg transform transition-transform ${item.status ? 'translate-x-8' : 'translate-x-0'}`} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};


export default AdminSettings;
