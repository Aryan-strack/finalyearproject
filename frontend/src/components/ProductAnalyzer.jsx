import React, { useState } from 'react';
import { FiUpload, FiSearch, FiX, FiPackage, FiTag } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ProductAnalyzer = () => {
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result);
      setImagePreview(reader.result);
      setResult(null);
      setError(null);
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
    setError(null);
    setResult(null);

    try {
      const fetchResponse = await fetch(image);
      const blob = await fetchResponse.blob();

      const formData = new FormData();
      formData.append('image', blob, 'product-image.jpg');

      const response = await fetch('/api/products/analyze', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setResult(data);
        toast.success('Product identified!');
      } else {
        setError(data.message || 'Analysis failed');
        toast.error(data.message || 'Analysis failed');
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setError('Failed to process image. Please try again.');
      toast.error('Failed to process image');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setImage(null);
    setImagePreview(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-3xl shadow-lg border border-slate-100">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-3">Product Image Analysis</h2>
        <p className="text-slate-500">Upload a product image to identify its type and category</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload Area */}
        <div
          className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
            imagePreview
              ? 'border-indigo-500 bg-indigo-50'
              : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'
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
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full flex items-center justify-center">
                  <FiUpload className="w-8 h-8 text-indigo-600" />
                </div>
                <div>
                  <p className="text-lg font-medium text-slate-700">Click to upload an image</p>
                  <p className="text-sm text-slate-400 mt-1">JPG, PNG, WEBP - max 5MB</p>
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
                Identify Product
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

      {/* Loading State */}
      {loading && (
        <div className="mt-6 text-center py-8">
          <div className="inline-block w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
          <p className="text-slate-500">Analyzing image with AI...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
          <p className="font-medium">Error</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Results */}
      {result && result.success && (
        <div className="mt-8 space-y-6 animate-fade-in">
          {/* Product Type Card */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <FiPackage className="text-indigo-600" />
              Identified Product
            </h3>

            <div className="space-y-4">
              {/* Product Type - Main Display */}
              <div className="bg-white rounded-xl p-4 shadow-sm border border-indigo-100">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Product Type</p>
                <p className="text-2xl font-bold text-indigo-600 capitalize">
                  {result.productType}
                </p>
              </div>

              {/* Description */}
              {result.description && (
                <div className="bg-white rounded-xl p-4 shadow-sm border border-indigo/100">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Description</p>
                  <p className="text-slate-800 font-medium">{result.description}</p>
                </div>
              )}

              {/* Category & Tags */}
              <div className="grid grid-cols-2 gap-4">
                {result.suggestedCategory && (
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-indigo-100">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Category</p>
                    <p className="text-slate-800 font-semibold">{result.suggestedCategory}</p>
                  </div>
                )}

                {result.keywords && result.keywords.length > 0 && (
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-indigo-100">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Top Keywords</p>
                    <div className="flex flex-wrap gap-1">
                      {result.keywords.slice(0, 3).map((keyword, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-md"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State Hint */}
      {!result && !loading && !error && (
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-400">
            Try uploading an image of a laptop, jewelry, shoes, or any product
          </p>
          <div className="flex justify-center gap-2 mt-3">
            {['Laptop', 'Smartphone', 'Jewelry', 'Shoes'].map((example) => (
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

export default ProductAnalyzer;
