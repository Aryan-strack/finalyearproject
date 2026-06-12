const express = require('express');
const router = express.Router();
const ChatMessage = require('../models/ChatMessage');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const mongoose = require('mongoose');
const { GoogleGenAI } = require('@google/genai');
const path = require('path');
const dotenv = require('dotenv');
const Product = require('../models/Product');

dotenv.config({ path: path.join(__dirname, '../config.env') });

// Helper: Fetch product stats
const getPlatformStats = async () => {
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
          maxPrice: { $max: '$price' }
        }
      },
      {
        $project: {
          _id: 0,
          totalProducts: 1,
          totalCategories: { $size: '$totalCategories' },
          avgPrice: { $round: ['$avgPrice', 2] },
          minPrice: { $round: ['$minPrice', 2] },
          maxPrice: { $round: ['$maxPrice', 2] }
        }
      }
    ]);
    return stats[0] || { totalProducts: 0, totalCategories: 0, avgPrice: 0, minPrice: 0, maxPrice: 0 };
  } catch (error) {
    console.error('Error fetching platform stats:', error);
    return { totalProducts: 0, totalCategories: 0 };
  }
};

// Helper function to generate conversation ID
const generateConversationId = (userId1, userId2) => {
  return [userId1, userId2].sort().join('_');
};

// AI Chat Response Function - Enhanced
const generateAIResponse = async (userMessage) => {
  try {
    const key = process.env.GEMINI_API_KEY?.trim();
    if (!key || key === 'your_gemini_api_key_here') {
      console.log('Gemini API key not configured, skipping AI response');
      return null;
    }

    // Get live platform stats
    const stats = await getPlatformStats();

    const genAI = new GoogleGenAI({ apiKey: key });

    const prompt = `
You are an AI assistant for ArtisanMart vendor messaging, helping vendors respond to customer inquiries professionally.

=== PLATFORM FACTS ===
- Total Active Products: ${stats.totalProducts || 0}
- Available Categories: ${stats.totalCategories || 0}
- Price Range: $${Number(stats.minPrice || 0).toFixed(2)} - $${Number(stats.maxPrice || 0).toFixed(2)}
- Categories: Jewelry, Home Decor, Art & Prints, Clothing, Pottery, Textiles, Bath & Body, Leather, Glass, Metalwork, Kitchen, Garden, Beauty, Accessories

=== E-COMMERCE INFO ===
Payment: Stripe checkout, all major cards, guest checkout available
Shipping: Standard 3-5 days ($5-15), Express 1-2 days ($15-30), International available
Returns: 30-day hassle-free returns on most items
Vendors: Independent artisans who set their own prices and ship directly

=== YOUR ROLE ===
You are helping a VENDOR respond to a CUSTOMER message.
- Be professional, friendly, and helpful
- Keep response under 200 words
- Reference specific products/categories when possible
- If the customer asks about price, give category ranges (e.g., "Jewelry typically ranges from $15-$250 depending on craftsmanship")
- If the customer asks about shipping, mention standard 3-5 business days
- If the customer asks about returns, mention 30-day return policy
- If the question is complex or requires account access, suggest contacting support or checking the website
- NEVER discuss other platforms (Amazon, Etsy, eBay) - politely redirect to ArtisanMart

Customer message: "${userMessage}"

Provide a professional vendor response that a human vendor would send:
`;

    const result = await genAI.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: prompt }] }]
    });
    return result.text?.trim() || null;
  } catch (error) {
    console.error('AI Response Error:', error.message);
    return null;
  }
};

// @route   POST /api/chat/send
// @desc    Send a message
// @access  Private
router.post('/send', auth, async (req, res) => {
  try {
    const { recipientId, message, messageType = 'text', attachments = [] } = req.body;
    
    if (!recipientId || !message) {
      return res.status(400).json({
        success: false,
        message: 'Recipient ID and message are required'
      });
    }

    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'Recipient not found'
      });
    }

    // Generate conversation ID
    const conversationId = generateConversationId(req.user._id, recipientId);
    console.log('Chat send - Generated conversation ID:', conversationId);
    console.log('Chat send - Sender ID:', req.user._id, 'Recipient ID:', recipientId);

    // Create new message
    const newMessage = new ChatMessage({
      sender: req.user._id,
      recipient: recipientId,
      message,
      conversationId,
      messageType,
      attachments
    });

    const savedMessage = await newMessage.save();

    // Populate sender and recipient details
    await savedMessage.populate('sender', 'name email');
    await savedMessage.populate('recipient', 'name email');

    // Generate AI response if sender is a customer and recipient is a vendor
    let aiResponse = null;
    if (req.user.role === 'user' && recipient.role === 'vendor') {
      console.log('Generating AI response for customer query...');
      aiResponse = await generateAIResponse(message);
      
      if (aiResponse) {
        // Create AI response message
        const aiMessage = new ChatMessage({
          sender: recipientId, // From vendor (but AI-generated)
          recipient: req.user._id,
          message: aiResponse,
          conversationId,
          messageType: 'ai_response',
          attachments: []
        });
        
        const savedAIResponse = await aiMessage.save();
        await savedAIResponse.populate('sender', 'name email');
        await savedAIResponse.populate('recipient', 'name email');
        
        aiResponse = savedAIResponse;
        console.log('AI response generated and saved');
      }
    }

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: savedMessage,
      aiResponse: aiResponse
    });

  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending message',
      error: error.message
    });
  }
});

// @route   GET /api/chat/conversations
// @desc    Get all conversations for current user
// @access  Private
router.get('/conversations', auth, async (req, res) => {
  try {
    console.log('Chat conversations - User ID:', req.user._id, 'Type:', typeof req.user._id);
    
    // Get all conversations where user is either sender or recipient
    const conversations = await ChatMessage.aggregate([
      {
        $match: {
          $or: [
            { sender: new mongoose.Types.ObjectId(req.user._id) },
            { recipient: new mongoose.Types.ObjectId(req.user._id) }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: '$conversationId',
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                { 
                  $and: [
                    { recipient: new mongoose.Types.ObjectId(req.user._id) },
                    { isRead: false }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $sort: { 'lastMessage.createdAt': -1 }
      }
    ]);

    // Populate user details for each conversation
    const populatedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const otherUserId = conv.lastMessage.sender.toString() === req.user._id 
          ? conv.lastMessage.recipient 
          : conv.lastMessage.sender;

        const otherUser = await User.findById(otherUserId).select('name email role hasVendorProfile');
        
        // Mark messages as read when conversations are fetched
        if (conv.unreadCount > 0) {
          console.log(`Marking ${conv.unreadCount} messages as read for conversation: ${conv._id}`);
          await ChatMessage.updateMany(
            {
              conversationId: conv._id,
              recipient: req.user._id,
              isRead: false
            },
            { isRead: true }
          );
        }
        
        return {
          conversationId: conv._id,
          otherUser,
          lastMessage: conv.lastMessage,
          unreadCount: 0 // Reset to 0 since we just marked them as read
        };
      })
    );

    res.json({
      success: true,
      conversations: populatedConversations
    });

  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching conversations',
      error: error.message
    });
  }
});

// @route   GET /api/chat/messages/:conversationId
// @desc    Get messages for a specific conversation
// @access  Private
router.get('/messages/:conversationId', auth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    console.log('Chat messages - Conversation ID:', conversationId);
    console.log('Chat messages - User ID:', req.user._id);

    // Verify user is part of this conversation
    const message = await ChatMessage.findOne({ conversationId });
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    if (message.sender.toString() !== req.user._id.toString() && message.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this conversation'
      });
    }

    // Get messages with pagination
    const messages = await ChatMessage.find({ conversationId })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('sender', 'name email')
      .populate('recipient', 'name email');

    // Mark messages as read if current user is recipient
    await ChatMessage.updateMany(
      {
        conversationId,
        recipient: req.user._id,
        isRead: false
      },
      { isRead: true }
    );

    // Get total count for pagination
    const total = await ChatMessage.countDocuments({ conversationId });

    res.json({
      success: true,
      messages: messages.reverse(), // Show oldest first
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalMessages: total,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching messages',
      error: error.message
    });
  }
});

// @route   PUT /api/chat/messages/:messageId/read
// @desc    Mark a message as read
// @access  Private
router.put('/messages/:messageId/read', auth, async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await ChatMessage.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user is the recipient
    if (message.recipient.toString() !== req.user._id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to mark this message as read'
      });
    }

    message.isRead = true;
    await message.save();

    res.json({
      success: true,
      message: 'Message marked as read'
    });

  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking message as read',
      error: error.message
    });
  }
});

// @route   GET /api/chat/unread-count
// @desc    Get unread message count for current user
// @access  Private
router.get('/unread-count', auth, async (req, res) => {
  try {
    console.log('Unread count - User ID:', req.user._id);
    
    const count = await ChatMessage.countDocuments({
      recipient: req.user._id,
      isRead: false
    });
    
    console.log('Unread count - Total unread:', count);

    res.json({
      success: true,
      unreadCount: count
    });

  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching unread count',
      error: error.message
    });
  }
});

module.exports = router;
