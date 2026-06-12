const StatCard = ({ title, value, icon: Icon, color, trend }) => {
  return (
    <div className="p-10 bg-slate-50 rounded-[3rem] border-2 border-transparent hover:border-slate-100 transition-all duration-500 group relative overflow-hidden">
      {/* Decorative Gradient Background (Subtle) */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-slate-200/20 blur-3xl rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-slate-900 mb-8 shadow-xl shadow-slate-200 group-hover:scale-110 transition-transform duration-500">
          <Icon className="w-6 h-6" />
        </div>
        
        <div className="mt-auto space-y-2">
          <h4 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">{value}</h4>
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{title}</p>
            {trend && (
              <span className={`text-[9px] font-black uppercase tracking-widest ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {trend > 0 ? '+' : ''}{trend}%
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}


export default StatCard;
