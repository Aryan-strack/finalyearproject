import React from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiArrowLeft } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import { useFavorites } from '../contexts/FavoritesContext';

const Favorites = () => {
  const { favorites, loading, favoritesCount } = useFavorites();

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-32">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-[4/5] bg-slate-50 rounded-[3rem] animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-32">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="max-w-4xl mx-auto text-center mb-24">
          <span className="text-accent font-black tracking-[0.3em] uppercase text-xs mb-6 block">Curated Collection</span>
          <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tight leading-none mb-8">My <span className="text-gradient">Favorites</span></h1>
          <p className="text-xl text-slate-500 font-medium">{favoritesCount} products reserved in your private selection.</p>
        </div>

        {/* Favorites Grid */}
        {favorites.length === 0 ? (
          <div className="max-w-2xl mx-auto text-center py-20 space-y-12">
            <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-10">
              <FiHeart className="w-12 h-12 text-slate-200" />
            </div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Your collection is empty</h2>
            <p className="text-xl text-slate-500 font-medium leading-relaxed italic">"Art is not what you see, but what you make others see." — Begin your visual journey today.</p>
            <Link
              to="/products"
              className="inline-block btn-accent !px-12 !py-6 !rounded-3xl uppercase tracking-widest font-black text-xs"
            >
              Explore Collection
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
            {favorites.map((favorite) => {
              const product = favorite.product;
              return (
                <Link
                  to={`/products/${product._id}`}
                  key={favorite._id}
                  className="group block"
                >
                  <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden bg-slate-100 mb-6 shadow-2xl shadow-slate-100 group-hover:shadow-slate-200 transition-all duration-700">
                    <img
                      src={product.images && product.images.length > 0 ? product.images[0] : 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500&h=500&fit=crop'}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="absolute top-8 right-8">
                      <div className="bg-white p-4 rounded-full shadow-xl">
                        <FaHeart className="w-4 h-4 text-accent" />
                      </div>
                    </div>

                    <div className="absolute bottom-10 left-10 right-10 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                       <button className="w-full bg-white text-slate-900 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px]">View Artifact</button>
                    </div>
                  </div>

                  <div className="px-4 space-y-2">
                    <div className="flex justify-between items-start">
                       <h3 className="text-slate-900 font-black text-xl tracking-tight leading-tight group-hover:text-accent transition-colors truncate pr-4">
                         {product.name}
                       </h3>
                       <span className="text-accent font-black text-xl tracking-tighter">${product.price}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-widest text-slate-400">
                       <span>{product.category}</span>
                       <span>by {product.vendorName || 'Anonymous'}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};


export default Favorites;
