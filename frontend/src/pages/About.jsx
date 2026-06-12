import React from 'react'
import { FiHeart, FiUsers, FiShield, FiGlobe, FiAward, FiCheckCircle } from 'react-icons/fi'

const About = () => {
  const stats = [
    { number: '500+', label: 'Verified Artisans', icon: FiUsers },
    { number: '10K+', label: 'Masterpieces', icon: FiHeart },
    { number: '50K+', label: 'Global Collectors', icon: FiAward },
    { number: '99%', label: 'Satisfaction Rate', icon: FiCheckCircle }
  ]

  const values = [
    {
      icon: FiHeart,
      title: 'Passion for Craft',
      description: 'Every artifact tells a unique story, born from the resonance between materials and human spirit.'
    },
    {
      icon: FiUsers,
      title: 'Global Collective',
      description: 'Forging deep connections between artisans and collectors in a borderless creative ecosystem.'
    },
    {
      icon: FiShield,
      title: 'Quality Protocol',
      description: 'A rigorous curation process ensuring every artifact meets our uncompromising standards of excellence.'
    },
    {
      icon: FiGlobe,
      title: 'Cultural Heritage',
      description: 'Preserving traditional techniques while empowering local communities in the modern era.'
    }
  ]

  const team = [
    {
      name: 'Sarah Chen',
      role: 'Founder & Visionary',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
      bio: 'Former gallery curator dedicated to elevating the global perception of artisan craftsmanship.'
    },
    {
      name: 'Marcus Rodriguez',
      role: 'Chief Architect',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
      bio: 'Bridging the physical and digital worlds through sophisticated software architecture.'
    },
    {
      name: 'Aisha Patel',
      role: 'Curatorial Director',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
      bio: 'Third-generation artisan with a profound understanding of traditional craft lineages.'
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="pt-48 pb-32">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto text-center space-y-12">
            <div className="flex items-center justify-center space-x-4">
              <div className="w-12 h-[1px] bg-slate-200" />
              <span className="text-accent font-black tracking-[0.5em] uppercase text-[10px] block">Our Manifesto</span>
              <div className="w-12 h-[1px] bg-slate-200" />
            </div>
            <h1 className="text-5xl md:text-9xl font-black text-slate-900 tracking-tighter leading-none italic">The <span className="text-slate-400">Resonance</span> of Origin</h1>
            <p className="text-2xl text-slate-500 font-bold leading-relaxed max-w-3xl mx-auto italic">
              "ArtisanMart was founded on a singular premise: that the human touch is irreplaceable."
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-6 mb-64">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-20">
          {stats.map((stat, index) => (
            <div key={index} className="space-y-6 group text-center md:text-left">
              <div className="w-12 h-1.5 bg-slate-100 group-hover:bg-accent group-hover:w-24 transition-all duration-700 mx-auto md:mx-0 rounded-full" />
              <h3 className="text-6xl font-black text-slate-900 tracking-tighter leading-none italic">{stat.number}</h3>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 group-hover:text-slate-900 transition-colors leading-none">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24 mb-64">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
            <div className="space-y-12">
              <div className="space-y-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">The Core Directive</span>
                <h2 className="text-5xl md:text-7xl  font-black tracking-tighter leading-[0.9] text-slate-900 italic">Empowering the <span className="text-accent">Global Makers</span></h2>
              </div>
              <p className="text-xl text-slate-500 leading-relaxed font-bold italic">
                We believe traditional craftsmanship is the soul of our modern world. Our platform provides world-class digital instruments for artisans to reach global audiences while preserving their heritage.
              </p>
              <div className="pt-6">
                <button className="px-16 py-8 bg-slate-950 text-white rounded-[2.5rem] font-black uppercase tracking-widest text-[11px] shadow-3xl shadow-slate-300 hover:bg-slate-800 transition-all active:scale-95">Forge Your Legacy</button>
              </div>
            </div>
            <div className="relative group">
              <div className="aspect-[4/5] bg-slate-100 rounded-[5rem] overflow-hidden shadow-3xl shadow-slate-200">
                <img
                  src="https://images.unsplash.com/photo-1456086272160-b28b0645b729?auto=format&fit=crop&q=80&w=1000"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 grayscale group-hover:grayscale-0"
                />
              </div>
              <div className="absolute -bottom-12 -right-12 md:w-48 md:h-48 w-24 h-24  bg-accent rounded-full flex items-center justify-center text-white shadow-3xl shadow-accent/20 group-hover:rotate-12 transition-transform duration-700">
                <FiHeart size={64} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="container mx-auto px-6 mb-64">
        <div className="max-w-4xl mx-auto text-center mb-32 space-y-6">
          <span className="text-accent font-black tracking-[0.5em] uppercase text-[10px] block">Our Foundation</span>
          <h2 className="md:text-6xl text-5xl font-black text-slate-900 tracking-tighter leading-none italic">The <span className="text-slate-400 font-normal">Strategic</span> Foundation</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {values.map((value, index) => (
            <div key={index} className="p-16 bg-slate-50 rounded-[4rem] space-y-10 hover:bg-white border-4 border-transparent hover:border-slate-50 transition-all duration-700 group shadow-none hover:shadow-3xl hover:shadow-slate-100">
              <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-slate-900 shadow-2xl shadow-slate-100 group-hover:scale-110 group-hover:bg-slate-950 group-hover:text-white transition-all duration-500">
                <value.icon className="w-8 h-8" />
              </div>
              <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.3em] leading-none">{value.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed font-bold italic">{value.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Team Section */}
      <section className="container mx-auto px-6 mb-64">
        <div className="max-w-4xl mx-auto text-center mb-32 space-y-6">
          <span className="text-accent font-black tracking-[0.5em] uppercase text-[10px] block">The Curators</span>
          <h2 className="text-6xl font-black text-slate-900 tracking-tighter leading-none italic">The <span className="text-slate-400 font-normal">Vanguard</span> Collective</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-20">
          {team.map((member, index) => (
            <div key={index} className="space-y-12 group">
              <div className="aspect-[3/4] rounded-[5rem] overflow-hidden bg-slate-50 shadow-3xl shadow-slate-100 group-hover:shadow-slate-200 transition-all duration-700 relative">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 grayscale group-hover:grayscale-0"
                />
                <div className="absolute inset-x-0 bottom-0 p-12 bg-gradient-to-t from-slate-950 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 transform translate-y-8 group-hover:translate-y-0">
                  <p className="text-xs text-white/60 font-black uppercase tracking-widest">{member.role}</p>
                </div>
              </div>
              <div className="space-y-4 px-4">
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter italic leading-none">{member.name}</h3>
                <p className="text-sm text-slate-500 font-bold leading-relaxed italic">"{member.bio}"</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 pb-48">
        <div className="p-24 bg-slate-950 rounded-[5rem] text-center space-y-16 relative overflow-hidden shadow-3xl shadow-slate-300">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/5 to-transparent pointer-events-none" />
          <div className="space-y-6 relative z-10">
            <span className="text-accent font-black tracking-[0.5em] uppercase text-[10px] block">Forge Your Connection</span>
            <h2 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-[0.8] italic">Legacy Starts <span className="text-accent">Here.</span></h2>
          </div>

          <div className="flex flex-col sm:flex-row gap-10 justify-center relative z-10">
            <button className="px-16 py-8 bg-accent text-white rounded-[2rem] font-black uppercase tracking-widest text-[11px] shadow-3xl shadow-accent/20 hover:scale-105 transition-all">Become an Artisan</button>
            <button className="px-16 py-8 bg-white text-slate-950 rounded-[2rem] font-black uppercase tracking-widest text-[11px] hover:scale-105 transition-all shadow-3xl shadow-slate-900">Explore Matrix</button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default About
