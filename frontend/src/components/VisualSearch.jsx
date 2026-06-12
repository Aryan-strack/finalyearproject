import React, { useState } from 'react';
import { FiUpload, FiSearch, FiX, FiPackage, FiTag, FiGrid } from 'react-icons/fi';
import toast from 'react-hot-toast';

const VisualSearch = () => {
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [products, setProducts] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result);
      setImagePreview(reader.result);
      // Reset results when new image is uploaded
      setAnalysis(null);
      setProducts([]);
      setShowResults(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) {
      toast.error('Please upload an image first');
      return;
    }

    setLoading(true);
    try {
      // Convert base64 to blob
      const fetchResponse = await fetch(image);
      const blob = await fetchResponse.blob();

      const formData = new FormData();
      formData.append('image', blob, 'search-image.jpg');

      const response = await fetch('/api/products/visual-search', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setAnalysis(data.analysis);
        setProducts(data.products || []);
        setShowResults(true);
        toast.success(`Found ${data.count} related products`);
      } else {
        toast.error(data.message || 'Visual search failed');
      }
    } catch (error) {
      console.error('Visual search error:', error);
      toast.error('Failed to process image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setImage(null);
    setImagePreview(null);
    setAnalysis(null);
    setProducts([]);
    setShowResults(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-3xl shadow-lg border border-slate-100">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-3">AI Visual Search</h2>
        <p className="text-slate-500">Upload an image of any product to find similar items in our marketplace</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload Area */}
        <div
          className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
            imagePreview
              ? 'border-accent bg-accent/5'
              : 'border-slate-300 hover:border-accent hover:bg-slate-50'
          }`}
        >
          {imagePreview ? (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Uploaded product"
                className="max-h-64 mx-auto rounded-xl shadow-md"
              />
              <button
                type="button"
                onClick={handleClear}
                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
              >
                <FiX className="w-4 h-4" />
              </button>
              <p className="mt-3 text-sm text-slate-500">Click "X" to replace image</p>
            </div>
          ) : (
            <label className="cursor-pointer block">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-20 h-20 bg-gradient-to-br from-accent/20 to-indigo-500/20 rounded-full flex items-center justify-center">
                  <FiUpload className="w-8 h-8 text-accent" />
                </div>
                <div>
                  <p className="text-lg font-medium text-slate-700">Click to upload an image</p>
                  <p className="text-sm text-slate-400 mt-1">or drag and drop (JPG, PNG, WEBP - max 5MB)</p>
                </div>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={!image || loading}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-bold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <FiSearch className="w-5 h-5" />
                Find Similar Products
              </>
            )}
          </button>

          {image && (
            <button
              type="button"
              onClick={handleClear}
              className="px-6 py-4 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors font-medium"
            >
              Clear
            </button>
          )}
        </div>
      </form>

      {/* Results Section */}
      {showResults && analysis && (
        <div className="mt-8 space-y-6 animate-fade-in">
          {/* AI Analysis Summary */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-5 border border-indigo-100">
            <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
              <FiTag className="text-indigo-600" />
              AI Analysis
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Detected Item</p>
                 <p className="font-semibold text-slate-800">{analysis.description}</p>
               </div>
               <div>
                 <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Category</p>
                 <p className="font-semibold text-indigo-600 flex items-center gap-1">
                   <FiGrid className="w-3 h-3" />
                   {analysis.suggestedCategory || 'Uncategorized'}
                 </p>
               </div>
                <div>
                 <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Keywords</p>
                 <div className="flex flex-wrap gap-1 mt-1">
                   {(analysis.keywords || []).slice(0, 4).map((keyword, idx) => (
                     <span
                       key={idx}
                       className="px-2 py-1 bg-white text-xs font-medium text-slate-600 rounded-md border border-slate-200"
                     >
                       {keyword}
                     </span>
                   ))}
                 </div>
               </div>
            </div>
          </div>

          {/* Related Products */}
          <div>
            <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
              <FiPackage className="text-accent" />
              Related Products ({products.length})
            </h3>

            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                  <a
                    key={product._id}
                    href={`/products/${product._id}`}
                    className="group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={product.images?.[0] || '/placeholder.jpg'}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-slate-400 font-bold uppercase mb-1">
                        {product.category || 'Handmade'}
                      </p>
                      <h4 className="font-semibold text-slate-900 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                        {product.name}
                      </h4>
                      <p className="text-lg font-black text-accent mt-2">
                        ${product.price?.toFixed(2)}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-slate-50 rounded-2xl">
                <FiPackage className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No matching products found</p>
                <p className="text-sm text-slate-400 mt-1">Try a different image</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty State Hint */}
      {!showResults && !image && (
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-400">
            Try uploading an image of a laptop, jewelry, home decor, or any handmade item
          </p>
          <div className="flex justify-center gap-2 mt-3">
            {['Jewelry', 'Laptop', 'Pottery', 'Art'].map((example) => (
              <span
                key={example}
                className="px-3 py-1 bg-slate-100 text-slate-500 text-xs rounded-full"
              >
                {example}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VisualSearch;
