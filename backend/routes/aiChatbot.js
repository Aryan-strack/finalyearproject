const express = require('express');
const router = express.Router();
const { GoogleGenAI } = require('@google/genai');
const path = require('path');
const dotenv = require('dotenv');
const Product = require('../models/Product');

dotenv.config({ path: path.join(__dirname, '../config.env') });

// Rate limiting for AI chatbot
const rateLimit = require('express-rate-limit');

const aiChatbotLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: {
    success: false,
    response: 'Too many requests. Please wait a minute before trying again.',
    canAnswer: false
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Helper: Fetch product data from database
const getProductInfo = async () => {
  try {
    const stats = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalCategories: { $addToSet: '$category' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
          featuredProducts: {
            $sum: { $cond: [{ $eq: ['$isFeatured', true] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          _id: 0,
          totalProducts: 1,
          totalCategories: { $size: '$totalCategories' },
          categories: '$totalCategories',
          avgPrice: { $round: ['$avgPrice', 2] },
          minPrice: { $round: ['$minPrice', 2] },
          maxPrice: { $round: ['$maxPrice', 2] },
          featuredProducts: 1
        }
      }
    ]);

    const categoryStats = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    return {
      stats: stats[0] || { totalProducts: 0, totalCategories: 0, categories: [], avgPrice: 0, minPrice: 0, maxPrice: 0, featuredProducts: 0 },
      categoryStats
    };
  } catch (error) {
    console.error('Error fetching product info:', error);
    return { stats: {}, categoryStats: [] };
  }
};

// Generate dynamic platform knowledge with live stats
const generatePlatformKnowledge = async () => {
  try {
    const platformData = await getProductInfo();
    const { stats, categoryStats } = platformData;

    // Build category pricing info from DB
    let categoryPricing = '\n=== CURRENT MARKET PRICING BY CATEGORY ===\n';
    if (categoryStats && categoryStats.length > 0) {
      categoryStats.forEach(cat => {
        categoryPricing += `[${cat._id}]: ${cat.count} products | Range: $${Number(cat.minPrice).toFixed(2)} - $${Number(cat.maxPrice).toFixed(2)}\n`;
      });
    } else {
      categoryPricing += 'Product data loading...\n';
    }

    return `
You are a professional customer service AI assistant for ArtisanMart, an online marketplace for handmade and artisanal products.

=== LIVE PLATFORM STATISTICS ===
- Total Active Products: ${stats.totalProducts || 0}
- Featured Products: ${stats.featuredProducts || 0}
- Categories Available: ${stats.totalCategories || 0}
- Overall Price Range: $${Number(stats.minPrice || 0).toFixed(2)} - $${Number(stats.maxPrice || 0).toFixed(2)}
${categoryPricing}

=== AVAILABLE PRODUCT CATEGORIES ===
- Jewelry: Handcrafted necklaces, earrings, bracelets, rings, pendants, brooches
- Home Decor: Artisan candles, pottery vases, wall art, sculptures, decorative items
- Art & Prints: Original paintings, digital prints, photography, calligraphy, lithographs
- Clothing: Handmade apparel, embroidered garments, custom designs, hats, scarves
- Pottery: Ceramic vases, mugs, bowls, planters, dinnerware sets
- Textiles: Woven fabrics, tapestries, linen, embroidered textiles, rugs, quilts
- Bath & Body: Artisan soaps, bath bombs, skincare, natural fragrances, lotions
- Leather: Handmade bags, wallets, belts, leather journals, keychains
- Glass: Blown glass art, stained glass, glass jewelry, ornaments, vases
- Metalwork: Sculptures, metal jewelry, decorative ironwork, rings, accessories
- Kitchen: Handmade kitchenware, wooden utensils, ceramic dishes, cutting boards
- Garden: Garden sculptures, planters, outdoor art, wind chimes, birdhouses
- Beauty: Natural cosmetics, organic skincare, handmade perfumes, lip balms
- Accessories: Handmade bags, scarves, hats, belts, jewelry accessories

=== E-COMMERCE FEATURES ===
Payment & Checkout:
- Secure checkout powered by Stripe
- Accepts all major credit/debit cards, PayPal
- No account required to checkout (guest checkout)
- Multiple shipping addresses supported
- Order confirmation via email immediately after purchase

Shipping & Delivery:
- Standard shipping (3-5 business days): $5-$15 depending on weight
- Express shipping (1-2 business days): $15-$30
- International shipping available to 50+ countries
- Tracking provided for all orders via email
- Ships directly from vendor to customer

Returns & Refunds:
- 30-day hassle-free returns on most items
- Custom/personalized items non-returnable unless defective
- Refund processed within 5-7 business days after return receipt
- Return shipping cost may apply (free if vendor error)
- Partial refunds available for damaged items

Vendor Program:
- Vendors are independent artisans and sellers
- Each vendor sets their own product prices
- Vendors handle their own packaging and shipping
- Direct messaging available for custom orders
- Vendor ratings based on product quality and customer service

=== PRICING GUIDELINES ===
Use these general ranges (actual prices vary by vendor):
- Jewelry: $15-$250
- Home Decor: $20-$500
- Art & Prints: $10-$400
- Clothing: $30-$200
- Pottery: $15-$150
- Textiles: $25-$200
- Bath & Body: $8-$60
- Leather: $40-$300
- Glass: $25-$400
- Metalwork: $50-$800
- Kitchen: $15-$150
- Garden: $30-$300
- Beauty: $12-$100
- Accessories: $20-$200

Note: Each piece is unique; prices vary by artisan, complexity, and materials used. Custom pieces may cost more.

=== BOUNDARY RULES ===
YOU MAY discuss:
- ArtisanMart products (prices, features, availability, categories)
- Ordering process and payments
- Shipping, delivery, returns, refunds policies
- Vendor information and artisan stories
- Account management (login, registration, profiles)
- Product customization requests
- Platform navigation and features
- Product tags, materials, care instructions

YOU MUST REFUSE to discuss:
- Politics, news, weather, current events
- Personal advice, opinions, health, legal matters
- Other e-commerce platforms by name (Amazon, Etsy, eBay, etc.)
- General knowledge questions (science, history, math)
- Jokes or casual chit-chat
- Technical topics unrelated to ArtisanMart
- Specific order status (requires login)

If asked about competitors: "I focus exclusively on helping you with ArtisanMart's platform and products. How can I assist you with our marketplace today?"

=== RESPONSE STYLE ===
- Be professional but friendly and warm
- Use specific category names and price ranges from data above
- Reference artisan craftsmanship when discussing products
- Keep responses 100-150 words maximum
- For price questions, give range + note about uniqueness
- Always encourage exploring the platform
- Mention "check our website" for specific product availability

=== JSON RESPONSE FORMAT ===
Return ONLY this JSON structure, nothing else:
{
  "canAnswer": true/false,
  "response": "Your helpful 100-150 word response here"
}
`;
  } catch (error) {
    console.error('Error generating platform knowledge:', error);
    // Fallback static knowledge
    return `
You are a professional customer service AI assistant for ArtisanMart.

=== AVAILABLE CATEGORIES ===
Jewelry, Home Decor, Art & Prints, Clothing, Pottery, Textiles, Bath & Body, Leather, Glass, Metalwork, Kitchen, Garden, Beauty, Accessories.

=== PLATFORM INFO ===
- Secure Stripe checkout
- Shipping: 3-5 days standard, 1-2 days express
- 30-day returns
- Over 1000+ handmade products

If asked about prices, give general ranges: Jewelry (\$15-\$250), Home Decor (\$20-\$500), Art (\$10-\$400), Clothing (\$30-\$200).

IMPORTANT: Only answer questions about ArtisanMart. Decline off-topic questions politely.

Return JSON format: {"canAnswer": true/false, "response": "Your response"}
`;
  }
};

// AI Response Generation with retry logic
const generateAIResponse = async (userMessage, retryCount = 0) => {
  const maxRetries = 3;
  const baseDelay = 2000;

  try {
    const key = process.env.GEMINI_API_KEY?.trim();

    if (!key || key === 'your_gemini_api_key_here') {
      return {
        success: false,
        response: 'AI service is currently unavailable. Please contact human support for assistance.',
        canAnswer: false
      };
    }

    // Generate dynamic knowledge with live stats
    const dynamicKnowledge = await generatePlatformKnowledge();

    const genAI = new GoogleGenAI({ apiKey: key });

    const prompt = `
${dynamicKnowledge}

CUSTOMER QUESTION: "${userMessage}"

IMPORTANT: Analyze if this question is about ArtisanMart's marketplace, products, or services.
- If YES: Provide a concise, professional response under 150 words
- If NO (off-topic, competitor-focused, non-platform): Set canAnswer to false and politely decline

RESPONSE FORMAT (JSON only):
{
  "canAnswer": true/false,
  "response": "Your response here"
}
`;

    const result = await genAI.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: prompt }] }]
    });
    const text = result.text?.trim();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return {
        success: true,
        response: 'I can help you with questions about ArtisanMart platform, products, orders, shipping, and more. Please ask a platform-related question.',
        canAnswer: true
      };
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      success: true,
      response: parsed.response || 'I can help you with questions about ArtisanMart platform.',
      canAnswer: parsed.canAnswer !== false
    };

  } catch (error) {
    console.error('AI Chatbot Error:', error.message);

    if (error.status === 429 || error.message.includes('429')) {
      let retryDelay = baseDelay * Math.pow(2, retryCount);
      const retryMatch = error.message.match(/retry in (\d+\.?\d*)s/);
      if (retryMatch) {
        retryDelay = Math.ceil(parseFloat(retryMatch[1]) * 1000);
      }

      if (retryCount < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return generateAIResponse(userMessage, retryCount + 1);
      }

      return {
        success: false,
        response: 'The AI service is currently experiencing high demand. Please wait a minute and try again, or contact human support for immediate assistance.',
        canAnswer: false,
        retryAfter: retryDelay
      };
    }

    if (error.status === 404) {
      return {
        success: false,
        response: 'AI service configuration error. Please contact support.',
        canAnswer: false
      };
    }

    return {
      success: false,
      response: 'Sorry, I encountered an error. Please try again later or contact human support.',
      canAnswer: false
    };
  }
};

// @route   POST /api/ai-chatbot/chat
// @desc    Get AI response for user query
// @access  Public
router.post('/chat', aiChatbotLimiter, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    if (message.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Message is too long. Please keep it under 500 characters.'
      });
    }

    console.log('AI Chatbot - User message:', message);
    const aiResponse = await generateAIResponse(message);
    console.log('AI Chatbot - Response:', aiResponse);

    res.json({
      success: aiResponse.success,
      response: aiResponse.response,
      canAnswer: aiResponse.canAnswer
    });

  } catch (error) {
    console.error('AI Chatbot route error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing your request',
      error: error.message
    });
  }
});

// @route   GET /api/ai-chatbot/health
// @desc    Check AI chatbot service health
// @access  Public
router.get('/health', (req, res) => {
  const key = process.env.GEMINI_API_KEY?.trim();
  const isConfigured = key && key !== 'your_gemini_api_key_here';

  res.json({
    success: true,
    status: isConfigured ? 'operational' : 'not_configured',
    message: isConfigured ? 'AI Chatbot is ready' : 'AI Chatbot requires API key configuration'
  });
});

module.exports = router;
