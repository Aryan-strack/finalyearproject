import React, { useState } from 'react';
import { FiSearch, FiFilter, FiEye } from 'react-icons/fi';

const OrderManagement = ({ orders, loading }) => {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const filteredOrders = orders.filter(order => {
        const orderIdMatch = order._id?.toLowerCase().includes(search.toLowerCase());
        const customerMatch = order.customerId?.name?.toLowerCase().includes(search.toLowerCase());
        const matchesSearch = orderIdMatch || customerMatch;

        let matchesStatus = true;
        if (statusFilter === 'paid') matchesStatus = order.paymentStatus === 'paid';
        if (statusFilter === 'unpaid') matchesStatus = order.paymentStatus !== 'paid';
        if (statusFilter === 'delivered') matchesStatus = order.status === 'delivered';
        if (statusFilter === 'pending') matchesStatus = order.status !== 'delivered';

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="bg-white border-4 border-slate-50 rounded-[4rem] shadow-3xl shadow-slate-100 overflow-hidden">
            <div className="p-12 border-b border-slate-50 flex flex-col lg:flex-row lg:items-center justify-between gap-12">
               <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-accent">Global Logistics</span>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight italic">Acquisition <span className="text-gradient">Manifest</span></h2>
               </div>

                <div className="flex flex-wrap gap-6">
                    <div className="relative group">
                        <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-accent transition-colors" />
                        <input
                            type="text"
                            placeholder="Trace Protocol..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-14 pr-8 py-5 rounded-[1.5rem] border-none bg-slate-50 text-slate-900 font-bold focus:ring-4 focus:ring-slate-100 transition-all w-full md:w-80 placeholder:text-slate-300"
                        />
                    </div>

                    <div className="relative">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="pl-10 pr-12 py-5 rounded-[1.5rem] border-none bg-slate-50 text-slate-900 font-black uppercase tracking-widest text-[9px] focus:ring-4 focus:ring-slate-100 appearance-none cursor-pointer"
                        >
                            <option value="">All Protocols</option>
                            <option value="paid">Authorized Liquidity</option>
                            <option value="unpaid">Pending Liquidity</option>
                            <option value="delivered">Executed Delivery</option>
                            <option value="pending">In-Transit Processing</option>
                        </select>
                        <FiFilter className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50/50">
                        <tr>
                            <th className="px-10 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Protocol ID</th>
                            <th className="px-10 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Entity Source</th>
                            <th className="px-10 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Temporal Stamp</th>
                            <th className="px-10 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Total Valuation</th>
                            <th className="px-10 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Liquidity Status</th>
                            <th className="px-10 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Execution Status</th>
                            <th className="px-10 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filteredOrders.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="px-10 py-24 text-center">
                                   <p className="text-slate-300 font-black uppercase tracking-widest text-xs">No active acquisition protocols detected.</p>
                                </td>
                            </tr>
                        ) : (
                            filteredOrders.map(order => (
                                <tr key={order._id} className="group hover:bg-slate-50/50 transition-all duration-500">
                                    <td className="px-10 py-8 text-sm font-black text-slate-950 italic">
                                        #{order._id.slice(-8).toUpperCase()}
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xs italic shadow-xl shadow-slate-200">
                                                {order.customerId?.name?.[0] || 'U'}
                                            </div>
                                            <span className="text-sm font-bold text-slate-600 italic underline underline-offset-4 decoration-slate-200">{order.customerId?.name || 'Vanguard Guest'}</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-10 py-8 text-right font-black text-slate-900 text-xl tracking-tighter italic">
                                        ${order.total?.toFixed(0)}
                                    </td>
                                    <td className="px-10 py-8 text-center">
                                        <span className={`px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl shadow-slate-100 ${order.paymentStatus === 'paid'
                                                ? 'bg-slate-900 text-white'
                                                : 'bg-slate-50 text-slate-400'
                                            }`}>
                                            {order.paymentStatus === 'paid' ? 'Liquidity Secured' : 'Pending Verification'}
                                        </span>
                                    </td>
                                    <td className="px-10 py-8 text-center">
                                        <span className={`px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl shadow-slate-100 ${order.status === 'delivered'
                                                ? 'bg-accent text-white'
                                                : 'bg-slate-900 text-white'
                                            }`}>
                                            {order.status === 'delivered' ? 'Finalized Execution' : 'Protocol Processing'}
                                        </span>
                                    </td>
                                    <td className="px-10 py-8 text-center">
                                        <button className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-xl shadow-slate-200 text-slate-900 hover:scale-110 active:scale-95 transition-all mx-auto">
                                            <FiEye className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


export default OrderManagement;
