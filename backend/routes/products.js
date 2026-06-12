const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { uploadMultiple, uploadSingle, convertUploadedFiles } = require('../middleware/base64Upload');
const { auth } = require('../middleware/auth');
const vendorAuth = require('../middleware/vendorAuth');
const { analyzeProductImage } = require('../utils/geminiService');

// Escape RegExp special characters
const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// @route   POST /api/products
// @desc    Create a new product
// @access  Private (Vendor only)
router.post('/', auth, vendorAuth, uploadMultiple('images', 5), convertUploadedFiles, async (req, res) => {
  try {
    console.log('Creating product - Request body:', req.body);
    console.log('Creating product - Files:', req.files ? req.files.length : 0);
    console.log('Creating product - User:', req.user);
    console.log('Creating product - User role:', req.user?.role);

    const {
      name,
      description,
      price,
      category,
      stock,
      tags,
      materials,
      careInstructions,
      dimensions,
      weight
    } = req.body;

    const images = req.files ? req.files.map(file => file.base64) : [];

    console.log('Creating product with stock:', {
      originalStock: stock,
      parsedStock: parseInt(stock),
      finalStock: parseInt(stock) || 0
    });

    const parseArrayField = (field) => {
      if (!field) return [];
      if (Array.isArray(field)) return field;
      if (typeof field === 'string') return field.split(',').map(v => v.trim()).filter(Boolean);
      return [];
    };

    const product = new Product({
      name,
      description,
      price: parseFloat(price),
      category,
      productType: req.body.productType || '',
      sku: req.body.sku && req.body.sku.trim() !== '' ? req.body.sku.trim() : undefined,
      status: req.body.status || 'active',
      images,
      vendor: req.user.id,
      vendorName: req.user.name,
      stock: parseInt(stock) || 0,
      tags: parseArrayField(tags),
      materials: parseArrayField(materials),
      features: parseArrayField(req.body.features),
      specifications: req.body.specifications ? JSON.parse(req.body.specifications) : {},
      careInstructions: req.body.careInstructions || '',
      dimensions: (() => {
        try {
          if (!req.body.dimensions) return {};
          if (typeof req.body.dimensions === 'string') {
            return req.body.dimensions.trim() ? JSON.parse(req.body.dimensions) : {};
          }
          return req.body.dimensions;
        } catch (error) {
          console.error('Error parsing dimensions:', req.body.dimensions, error);
          return {};
        }
      })(),
      weight: (() => {
        try {
          if (!req.body.weight) return {};
          if (typeof req.body.weight === 'string') {
            return req.body.weight.trim() ? JSON.parse(req.body.weight) : {};
          }
          return req.body.weight;
        } catch (error) {
          console.error('Error parsing weight:', req.body.weight, error);
          return {};
        }
      })()
    });

    const savedProduct = await product.save();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: savedProduct
    });

  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: error.message
    });
  }
});

// @route   GET /api/products
// @desc    Get all products with filtering and pagination
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      minPrice,
      maxPrice,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = { isActive: true };

    if (category) {
      filter.category = category;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const products = await Product.find(filter)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('vendor', 'name shopName');

    console.log('Products being returned:', products.map(p => ({
      id: p._id,
      name: p.name,
      stock: p.stock,
      stockType: typeof p.stock,
      inStock: p.inStock,
      inStockType: typeof p.inStock
    })));

    const total = await Product.countDocuments(filter);

    res.json({
      success: true,
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalProducts: total,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
});

// @route   GET /api/products/featured
// @desc    Get featured products
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const featuredProducts = await Product.find({
      isActive: true,
      isFeatured: true
    })
      .sort({ rating: -1, createdAt: -1 })
      .limit(8)
      .populate('vendor', 'name shopName');

    res.json({
      success: true,
      products: featuredProducts
    });

  } catch (error) {
    console.error('Error fetching featured products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching featured products',
      error: error.message
    });
  }
});

// @route   GET /api/products/vendor/me
// @desc    Get current vendor's products
// @access  Private (Vendor only)
router.get('/vendor/me', auth, vendorAuth, async (req, res) => {
  try {
    const products = await Product.find({
      vendor: req.user.id,
      isActive: true
    })
      .sort({ createdAt: -1 })
      .populate('vendor', 'name shopName');

    res.json({
      success: true,
      products
    });

  } catch (error) {
    console.error('Error fetching vendor products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching vendor products',
      error: error.message
    });
  }
});

// @route   GET /api/products/vendor/:vendorId
// @desc    Get products by vendor
// @access  Public
router.get('/vendor/:vendorId', async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { page = 1, limit = 12 } = req.query;

    const products = await Product.find({
      vendor: vendorId,
      isActive: true
    })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('vendor', 'name shopName');

    const total = await Product.countDocuments({
      vendor: vendorId,
      isActive: true
    });

    res.json({
      success: true,
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalProducts: total
      }
    });

  } catch (error) {
    console.error('Error fetching vendor products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching vendor products',
      error: error.message
    });
  }
});

// @route   GET /api/products/me
// @desc    Get current vendor's products (for dashboard/my products)
// @access  Private (Vendor only)
router.get('/me', auth, vendorAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    const filter = { vendor: req.user.id };

    if (status && status !== 'all') {
      filter.status = status;
    }

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('vendor', 'name shopName');

    const total = await Product.countDocuments(filter);

    res.json({
      success: true,
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalProducts: total
      }
    });

  } catch (error) {
    console.error('Error fetching vendor products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching vendor products',
      error: error.message
    });
  }
});

// @route   GET /api/products/categories
// @desc    Get all product categories
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = await Product.distinct('category');

    res.json({
      success: true,
      categories
    });

  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message
    });
  }
});

// @route   POST /api/products/analyze
// @desc    Analyze uploaded image using geminiService and return full product analysis
// @access  Public
router.post('/analyze', uploadSingle('image'), convertUploadedFiles, async (req, res) => {
  try {
    if (!req.file || !req.file.base64) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file'
      });
    }

    console.log('Analyzing product image with Gemini AI...');
    const analysis = await analyzeProductImage(req.file.base64);
    console.log('AI Analysis Results:', analysis);

    res.json({
      success: true,
      productType: analysis.productType || '',
      // description: analysis.description || '',
      suggestedCategory: analysis.suggestedCategory || '',
      keywords: analysis.keywords || [],
      // searchPhrases: analysis.searchPhrases || [],
      // colors: analysis.colors || [],
      materials: analysis.materials || [],
      style: analysis.style || ''
    });

  } catch (error) {
    console.error('Product analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze product image',
      error: error.message
    });
  }
});

// @route   POST /api/products/visual-search
// @desc    Identify product in image and search for similar products
// @access  Public
router.post('/visual-search', uploadSingle('image'), convertUploadedFiles, async (req, res) => {
  try {
    if (!req.file || !req.file.base64) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image for visual search'
      });
    }

    // Step 1: Analyze image using Gemini
    console.log('Analyzing image with Gemini...');
    const analysis = await analyzeProductImage(req.file.base64);
    console.log('AI Analysis Results:', analysis);

    const { keywords, suggestedCategory, productType } = analysis;

    // Validate keywords
    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return res.status(500).json({
        success: false,
        message: 'AI analysis returned invalid keywords. Please try again.',
        error: 'Invalid analysis result'
      });
    }

    const activeFilter = { isActive: true };

    // --- productType ko specific DB category se map karo ---
    // Problem: AI kabhi kabhi "Electronics" return karta hai broad category
    // Fix: productType se exact category nikalo
    const productTypeToCategory = {
      'laptop': 'Laptop',
      'notebook': 'Laptop',
      'macbook': 'Laptop',
      'chromebook': 'Laptop',
      'gaming laptop': 'Laptop',
      'smartphone': 'Mobile',
      'mobile': 'Mobile',
      'phone': 'Mobile',
      'iphone': 'Mobile',
      'android phone': 'Mobile',
      'camera': 'Camera',
      'dslr': 'Camera',
      'mirrorless': 'Camera',
      'webcam': 'Camera',
      'headphones': 'Audio',
      'earbuds': 'Audio',
      'earphones': 'Audio',
      'speaker': 'Audio',
      'headset': 'Audio',
      'smartwatch': 'Wearable',
      'smart watch': 'Wearable',
      'fitness band': 'Wearable',
      'fitness tracker': 'Wearable',
      'smart bulb': 'Smart Home',
      'smart home': 'Smart Home',
      'router': 'Smart Home',
      'smart speaker': 'Smart Home',
    };

    // productType lowercase mein check karo
    const ptLower = (productType || '').toLowerCase();
    let resolvedCategory = suggestedCategory; // default: AI ka diya hua answer

    // Agar AI ne "Electronics" ya kuch nahi diya, to productType se override karo
    if (suggestedCategory === 'Electronics' || !suggestedCategory) {
      for (const [key, cat] of Object.entries(productTypeToCategory)) {
        if (ptLower.includes(key)) {
          resolvedCategory = cat;
          console.log(`✅ Category override: "${suggestedCategory}" → "${cat}" (productType: "${productType}")`);
          break;
        }
      }
    }

    console.log(`🔍 Resolved Category: ${resolvedCategory} | ProductType: ${productType}`);

    // --- Step 2: Exact category se search ---
    let categoryProducts = [];
    if (resolvedCategory) {
      categoryProducts = await Product.find({
        ...activeFilter,
        category: resolvedCategory
      })
        .limit(12)
        .populate('vendor', 'name shopName profileImage');
    }

    // --- Step 3: productType + keywords se search ---
    const escapedKeywords = keywords.map(k => escapeRegExp(k));

    // productType ko search terms mein highest priority dena hai
    const searchTerms = productType
      ? [escapeRegExp(productType), ...escapedKeywords]
      : escapedKeywords;

    const keywordFilter = {
      ...activeFilter,
      $or: [
        { name: { $regex: searchTerms.slice(0, 5).join('|'), $options: 'i' } },
        { description: { $regex: searchTerms.slice(0, 3).join('|'), $options: 'i' } },
        { tags: { $in: searchTerms.slice(0, 5).map(t => new RegExp(t, 'i')) } },
        { productType: { $regex: escapeRegExp(ptLower), $options: 'i' } }
      ]
    };

    const keywordProducts = await Product.find(keywordFilter)
      .limit(15)
      .populate('vendor', 'name shopName profileImage');

    // --- Step 4: Results merge (dedup) ---
    const productMap = new Map();
    categoryProducts.forEach(p => productMap.set(p._id.toString(), p));
    keywordProducts.forEach(p => {
      if (!productMap.has(p._id.toString())) {
        productMap.set(p._id.toString(), p);
      }
    });

    let products = Array.from(productMap.values()).slice(0, 15);

    // --- Step 5: Agar kuch nahi mila to fallback broad search ---
    if (products.length === 0) {
      const fallbackTerm = escapeRegExp(productType || (escapedKeywords[0] || ''));
      if (fallbackTerm) {
        products = await Product.find({
          isActive: true,
          $or: [
            { name: { $regex: fallbackTerm, $options: 'i' } },
            { description: { $regex: fallbackTerm, $options: 'i' } },
            { tags: { $in: [new RegExp(fallbackTerm, 'i')] } }
          ]
        })
          .limit(15)
          .populate('vendor', 'name shopName profileImage');
      }
    }

    console.log(`✅ Visual search found ${products.length} products | Category: ${resolvedCategory} | ProductType: ${productType} | Keywords: ${keywords.slice(0, 4).join(', ')}`);

    res.json({
      success: true,
      analysis: { ...analysis, resolvedCategory },
      products,
      count: products.length
    });

  } catch (error) {
    console.error('Visual search error:', error);
    res.status(500).json({
      success: false,
      message: 'AI Visual Search failed',
      error: error.message
    });
  }
});

// @route   GET /api/products/:id
// @desc    Get single product by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('vendor', 'name shopName profileImage');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      product
    });

  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: error.message
    });
  }
});

// @route   PUT /api/products/:id
// @desc    Update product
// @access  Private (Vendor only - owner of product)
router.put('/:id', auth, vendorAuth, uploadMultiple('images', 5), convertUploadedFiles, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (product.vendor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this product'
      });
    }

    const updateData = { ...req.body };

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => file.base64);

      if (req.body.replaceImages === 'true') {
        updateData.images = newImages;
      } else {
        updateData.images = [...product.images, ...newImages];
      }
    }

    if (updateData.price) updateData.price = parseFloat(updateData.price);
    if (updateData.stock) updateData.stock = parseInt(updateData.stock);
    if (updateData.tags) {
      updateData.tags = Array.isArray(updateData.tags) ? updateData.tags : updateData.tags.split(',').map(tag => tag.trim());
    }
    if (updateData.materials) {
      updateData.materials = Array.isArray(updateData.materials) ? updateData.materials : updateData.materials.split(',').map(material => material.trim());
    }
    if (updateData.features) {
      updateData.features = Array.isArray(updateData.features) ? updateData.features : updateData.features.split(',').map(f => f.trim());
    }
    if (updateData.specifications && typeof updateData.specifications === 'string') {
      try {
        updateData.specifications = JSON.parse(updateData.specifications);
      } catch (e) {
        updateData.specifications = {};
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Product updated successfully',
      product: updatedProduct
    });

  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating product',
      error: error.message
    });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete product
// @access  Private (Vendor only - owner of product)
router.delete('/:id', auth, vendorAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (product.vendor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this product'
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting product',
      error: error.message
    });
  }
});

module.exports = router;
