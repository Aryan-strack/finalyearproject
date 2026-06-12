import React, { useState, useEffect, useRef } from 'react';
import { FiX, FiUpload, FiTrash2, FiPlus, FiPackage } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ProductFormModal = ({ isOpen, onClose, onSubmit, initialData = null, isSubmitting = false }) => {
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    productType: '',
    sku: '',
    status: 'active',
    images: [],
    tags: '',
    materials: '',
    features: '',
    specifications: {}
  });
  const [imagePreview, setImagePreview] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        price: initialData.price?.toString() || '',
        stock: initialData.stock?.toString() || '',
        category: initialData.category || '',
        productType: initialData.productType || '',
        sku: initialData.sku || '',
        status: initialData.status || 'active',
        images: initialData.images || [],
        tags: Array.isArray(initialData.tags) ? initialData.tags.join(', ') : (initialData.tags || ''),
        materials: Array.isArray(initialData.materials) ? initialData.materials.join(', ') : (initialData.materials || ''),
        features: Array.isArray(initialData.features) ? initialData.features.join(', ') : (initialData.features || ''),
        specifications: initialData.specifications || {}
      });
      setImagePreview(initialData.images || []);
      setAnalysisResult(null);
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        stock: '',
        category: '',
        productType: '',
        sku: '',
        status: 'active',
        images: [],
        tags: '',
        materials: '',
        features: '',
        specifications: {}
      });
      setImagePreview([]);
      setAnalysisResult(null);
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files) => {
    const newImages = Array.from(files).slice(0, 5 - formData.images.length);
    const validFiles = newImages.filter(file => file.type.startsWith('image/'));

    if (validFiles.length !== newImages.length) {
      toast.error('Only image files are allowed');
      return;
    }

    validFiles.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`File ${file.name} exceeds 5MB limit`);
        return;
      }
    });

    const readers = validFiles.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then(results => {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...results]
      }));
      setImagePreview(prev => [...prev, ...results]);
    });
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    setImagePreview(prev => prev.filter((_, i) => i !== index));
  };

  const analyzeImage = async (imageData) => {
    setAnalyzing(true);
    try {
      // Convert base64 to blob
      const fetchResponse = await fetch(imageData);
      const blob = await fetchResponse.blob();

      const formData = new FormData();
      formData.append('image', blob, 'product-image.jpg');

      const response = await fetch('/api/products/analyze', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setAnalysisResult(data);
        // Auto-fill form fields based on analysis
        if (data.suggestedCategory && !formData.category) {
          setFormData(prev => ({ ...prev, category: data.suggestedCategory }));
        }
        if (data.productType && !formData.productType) {
          setFormData(prev => ({ ...prev, productType: data.productType }));
        }
        toast.success('Product analyzed successfully!');
      } else {
        toast.error(data.message || 'Analysis failed');
      }
    } catch (err) {
      console.error('Analysis error:', err);
      toast.error('Failed to analyze image');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAnalyze = () => {
    if (formData.images.length === 0) {
      toast.error('Please upload an image first');
      return;
    }
    // Analyze first image
    analyzeImage(formData.images[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Product name is required');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Product description is required');
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error('Valid price is required');
      return;
    }
    if (!formData.category) {
      toast.error('Category is required');
      return;
    }
    if (formData.images.length === 0) {
      toast.error('At least one image is required');
      return;
    }

    // Convert tags, materials, features to arrays
    const payload = {
      ...formData,
      tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      materials: formData.materials ? formData.materials.split(',').map(m => m.trim()).filter(Boolean) : [],
      features: formData.features ? formData.features.split(',').map(f => f.trim()).filter(Boolean) : [],
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock) || 0
    };

    onSubmit(payload);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      stock: '',
      category: '',
      productType: '',
      sku: '',
      status: 'active',
      images: [],
      tags: '',
      materials: '',
      features: '',
      specifications: {}
    });
    setImagePreview([]);
    setAnalysisResult(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-[3rem] w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-3xl relative animate-fade-in">
        {/* Header */}
        <div className="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-slate-100 p-8 flex items-center justify-between z-10">
          <h2 className="text-3xl font-black text-slate-900">
            {initialData ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button
            onClick={handleClose}
            className="p-3 rounded-2xl hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-900"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Image Upload Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FiPackage className="text-accent" />
                Product Images
              </h3>
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={formData.images.length === 0 || analyzing}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold text-sm hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                {analyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Analyze with AI'
                )}
              </button>
            </div>

            {/* Drag & Drop Area */}
            <div
              className={`relative border-2 border-dashed rounded-3xl p-8 text-center transition-all ${
                dragActive
                  ? 'border-accent bg-accent/5'
                  : 'border-slate-300 hover:border-accent/50 hover:bg-slate-50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileInput}
                className="hidden"
              />

              {imagePreview.length > 0 ? (
                <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                  {imagePreview.map((img, idx) => (
                    <div key={idx} className="relative group aspect-square rounded-2xl overflow-hidden">
                      <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      >
                        <FiTrash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {imagePreview.length < 5 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square rounded-2xl border-2 border-dashed border-slate-300 hover:border-accent flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-accent transition-all"
                    >
                      <FiUpload className="w-8 h-8" />
                      <span className="text-sm">Add</span>
                    </button>
                  )}
                </div>
              ) : (
                <label className="cursor-pointer block">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-24 h-24 bg-gradient-to-br from-accent/20 to-indigo-500/20 rounded-full flex items-center justify-center">
                      <FiUpload className="w-10 h-10 text-accent" />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-slate-700">Drag & drop images here</p>
                      <p className="text-sm text-slate-400 mt-1">or click to select (max 5 images, 5MB each)</p>
                    </div>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileInput}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* AI Analysis Result */}
            {analysisResult && (
              <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 animate-fade-in">
                <h4 className="text-sm font-black uppercase tracking-wider text-accent mb-4">AI Analysis Result</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 uppercase mb-1">Product Type</p>
                    <p className="font-bold text-slate-900 capitalize">{analysisResult.productType}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase mb-1">Category</p>
                    <p className="font-bold text-indigo-600">{analysisResult.suggestedCategory}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase mb-1">Colors</p>
                    <div className="flex flex-wrap gap-1">
                      {analysisResult.colors?.slice(0, 2).map((c, i) => (
                        <span key={i} className="px-2 py-0.5 bg-white rounded text-xs text-slate-600">{c}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase mb-1">Materials</p>
                    <div className="flex flex-wrap gap-1">
                      {analysisResult.materials?.slice(0, 2).map((m, i) => (
                        <span key={i} className="px-2 py-0.5 bg-white rounded text-xs text-slate-600">{m}</span>
                      ))}
                    </div>
                  </div>
                </div>
                {analysisResult.keywords?.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs text-slate-500 uppercase mb-2">Suggested Keywords</p>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.keywords.slice(0, 6).map((kw, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            const current = formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
                            if (!current.includes(kw)) {
                              setFormData(prev => ({
                                ...prev,
                                tags: [...current, kw].join(', ')
                              }));
                            }
                          }}
                          className="px-4 py-1.5 bg-white hover:bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium transition-colors border border-indigo-200"
                        >
                          + {kw}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Basic Info */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-900">Basic Information</h3>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Product Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter product name"
                  className="input-premium"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Describe your product"
                  className="input-premium resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Price ($) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="input-premium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Stock</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    min="0"
                    placeholder="0"
                    className="input-premium"
                  />
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-900">Product Details</h3>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="input-premium cursor-pointer"
                >
                  <option value="">Select category</option>
                  <option value="Jewelry">Jewelry</option>
                  <option value="Home Decor">Home Decor</option>
                  <option value="Art & Prints">Art & Prints</option>
                  <option value="Clothing">Clothing</option>
                  <option value="Pottery">Pottery</option>
                  <option value="Textiles">Textiles</option>
                  <option value="Bath & Body">Bath & Body</option>
                  <option value="Leather">Leather</option>
                  <option value="Glass">Glass</option>
                  <option value="Metalwork">Metalwork</option>
                  <option value="Kitchen">Kitchen</option>
                  <option value="Garden">Garden</option>
                  <option value="Beauty">Beauty</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Laptop">Laptop</option>
                  <option value="Mobile">Mobile</option>
                  <option value="Camera">Camera</option>
                  <option value="Audio">Audio</option>
                  <option value="Wearable">Wearable</option>
                  <option value="Smart Home">Smart Home</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Product Type</label>
                <input
                  type="text"
                  name="productType"
                  value={formData.productType}
                  onChange={handleChange}
                  placeholder="e.g., Silver Necklace, Ceramic Vase"
                  className="input-premium"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">SKU</label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  placeholder="Stock Keeping Unit"
                  className="input-premium"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="input-premium cursor-pointer"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>

            {/* Tags & Extra Info */}
            <div className="space-y-6 md:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Tags (comma-separated)</label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="handmade, artisan, unique"
                    className="input-premium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Materials (comma-separated)</label>
                  <input
                    type="text"
                    name="materials"
                    value={formData.materials}
                    onChange={handleChange}
                    placeholder="silver, clay, cotton"
                    className="input-premium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Features (comma-separated)</label>
                  <input
                    type="text"
                    name="features"
                    value={formData.features}
                    onChange={handleChange}
                    placeholder="waterproof, handmade"
                    className="input-premium"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="sticky bottom-0 bg-white/80 backdrop-blur-xl border-t border-slate-100 p-8 flex items-center justify-end gap-4 -mx-8 -mb-8 mt-8">
            <button
              type="button"
              onClick={handleClose}
              className="px-8 py-4 border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 transition-colors font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-accent px-12 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
              ) : initialData ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductFormModal;
