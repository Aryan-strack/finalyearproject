import React, { useState } from 'react';
import { FiSearch, FiFilter, FiBox, FiEye, FiTrash2 } from 'react-icons/fi';

const ProductManagement = ({ products, loading, onDelete }) => {
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name?.toLowerCase().includes(search.toLowerCase()) ||
            product.vendor?.name?.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = categoryFilter ? product.category === categoryFilter : true;
        return matchesSearch && matchesCategory;
    });

    const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

    return (
        <div className="bg-white border-4 border-slate-50 rounded-[4rem] shadow-3xl shadow-slate-100 overflow-hidden">
            <div className="p-12 border-b border-slate-50 flex flex-col lg:flex-row lg:items-center justify-between gap-12">
                <div className="space-y-1">
                   <span className="text-[10px] font-black uppercase tracking-[0.4em] text-accent">Strategic Catalog</span>
                   <h2 className="text-3xl font-black text-slate-900 tracking-tight italic">Artifact <span className="text-gradient">Registry</span></h2>
                </div>

                <div className="flex flex-wrap gap-6">
                    <div className="relative group">
                        <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-accent transition-colors" />
                        <input
                            type="text"
                            placeholder="Identify Artifact..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-14 pr-8 py-5 rounded-[1.5rem] border-none bg-slate-50 text-slate-900 font-bold focus:ring-4 focus:ring-slate-100 transition-all w-full md:w-80 placeholder:text-slate-300"
                        />
                    </div>

                    <div className="relative">
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="pl-10 pr-12 py-5 rounded-[1.5rem] border-none bg-slate-50 text-slate-900 font-black uppercase tracking-widest text-[9px] focus:ring-4 focus:ring-slate-100 appearance-none cursor-pointer"
                        >
                            <option value="">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                        <FiFilter className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50/50">
                        <tr>
                            <th className="px-10 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Artifact Vector</th>
                            <th className="px-10 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Classification</th>
                            <th className="px-10 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Source Entity</th>
                            <th className="px-10 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Strategic Value</th>
                            <th className="px-10 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Reserve Status</th>
                            <th className="px-10 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filteredProducts.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-10 py-24 text-center">
                                    <p className="text-slate-300 font-black uppercase tracking-widest text-xs">No matching artifacts detected in the current matrix.</p>
                                </td>
                            </tr>
                        ) : (
                            filteredProducts.map(product => (
                                <tr key={product._id} className="group hover:bg-slate-50/50 transition-all duration-500">
                                    <td className="px-10 py-8">
                                        <div className="flex items-center space-x-6">
                                            <div className="h-20 w-20 rounded-[1.5rem] bg-slate-100 flex-shrink-0 overflow-hidden shadow-inner group-hover:scale-105 transition-transform duration-500">
                                                {product.images && product.images[0] ? (
                                                    <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center text-slate-300"><FiBox size={32} /></div>
                                                )}
                                            </div>
                                            <div className="space-y-1">
                                                <p className="font-black text-slate-900 text-lg tracking-tight leading-none truncate max-w-[200px] italic">{product.name}</p>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Node ID: {product._id.slice(-8).toUpperCase()}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <span className="px-6 py-2 bg-slate-900 text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl shadow-slate-200">
                                            {product.category || 'Classified'}
                                        </span>
                                    </td>
                                    <td className="px-10 py-8">
                                        <p className="text-sm font-bold text-slate-600 italic underline underline-offset-4 decoration-slate-200">{product.vendor?.name || 'Vanguard Artisan'}</p>
                                    </td>
                                    <td className="px-10 py-8 text-right font-black text-slate-900 text-xl tracking-tighter italic">
                                        ${product.price?.toFixed(0)}
                                    </td>
                                    <td className="px-10 py-8 text-center">
                                        <div className={`text-[10px] font-black uppercase tracking-widest ${product.countInStock > 10 ? 'text-green-600' : 'text-accent'}`}>
                                            {product.countInStock} Units
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex items-center justify-center space-x-4">
                                            <button className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-xl shadow-slate-200 text-slate-900 hover:scale-110 active:scale-95 transition-all">
                                                <FiEye className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => onDelete(product._id)}
                                                className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-xl shadow-slate-200 text-slate-400 hover:text-red-500 hover:scale-110 active:scale-95 transition-all"
                                            >
                                                <FiTrash2 className="w-5 h-5" />
                                            </button>
                                        </div>
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


export default ProductManagement;
