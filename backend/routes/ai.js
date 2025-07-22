const express = require('express');
const aiService = require('../services/aiService');
const { auth } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting for AI endpoints
const aiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per windowMs
  message: {
    success: false,
    message: 'Too many AI requests, please try again later.'
  }
});

// Apply rate limiting to all AI routes
router.use(aiRateLimit);

// @route   POST /api/ai/generate-content
// @desc    Generate blog content using AI
// @access  Private
router.post('/generate-content', auth, async (req, res) => {
  try {
    const { prompt, options = {} } = req.body;

    if (!prompt || prompt.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Prompt is required'
      });
    }

    if (prompt.length > 2000) {
      return res.status(400).json({
        success: false,
        message: 'Prompt is too long (max 2000 characters)'
      });
    }

    const result = await aiService.generateContent(prompt, options);

    res.json({
      success: true,
      data: result,
      usage: {
        promptTokens: prompt.length,
        completionTokens: result.content?.length || 0,
        totalTokens: prompt.length + (result.content?.length || 0)
      }
    });

  } catch (error) {
    console.error('Generate content error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate content',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/ai/generate-outline
// @desc    Generate blog post outline
// @access  Private
router.post('/generate-outline', auth, async (req, res) => {
  try {
    const { topic, targetAudience } = req.body;

    if (!topic || topic.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Topic is required'
      });
    }

    const result = await aiService.generateOutline(topic, targetAudience);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Generate outline error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate outline',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/ai/seo-suggestions
// @desc    Generate SEO suggestions for content
// @access  Private
router.post('/seo-suggestions', auth, async (req, res) => {
  try {
    const { content, title } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Content is required'
      });
    }

    if (content.length > 10000) {
      return res.status(400).json({
        success: false,
        message: 'Content is too long for analysis (max 10,000 characters)'
      });
    }

    const result = await aiService.generateSEOSuggestions(content, title);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('SEO suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate SEO suggestions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/ai/improve-readability
// @desc    Improve content readability
// @access  Private
router.post('/improve-readability', auth, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Content is required'
      });
    }

    if (content.length > 5000) {
      return res.status(400).json({
        success: false,
        message: 'Content is too long for improvement (max 5,000 characters)'
      });
    }

    const result = await aiService.improveReadability(content);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Improve readability error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to improve readability',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/ai/check-plagiarism
// @desc    Check content for potential plagiarism
// @access  Private
router.post('/check-plagiarism', auth, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Content is required'
      });
    }

    if (content.length > 5000) {
      return res.status(400).json({
        success: false,
        message: 'Content is too long for plagiarism check (max 5,000 characters)'
      });
    }

    const result = await aiService.checkPlagiarism(content);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Plagiarism check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check plagiarism',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/ai/readability-score
// @desc    Calculate readability score for content
// @access  Private
router.post('/readability-score', auth, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Content is required'
      });
    }

    const result = aiService.calculateReadabilityScore(content);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Readability score error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate readability score',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/ai/usage
// @desc    Get AI usage statistics for user
// @access  Private
router.get('/usage', auth, async (req, res) => {
  try {
    // In a real implementation, you'd track usage in the database
    // For now, return mock data
    const usage = {
      currentMonth: {
        requests: 45,
        tokens: 12500,
        limit: 50000
      },
      lastMonth: {
        requests: 38,
        tokens: 9800
      },
      features: {
        contentGeneration: 25,
        seoSuggestions: 12,
        readabilityCheck: 8,
        plagiarismCheck: 5
      }
    };

    res.json({
      success: true,
      data: usage
    });

  } catch (error) {
    console.error('Get AI usage error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get usage statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/ai/models
// @desc    Get available AI models and their capabilities
// @access  Private
router.get('/models', auth, async (req, res) => {
  try {
    const models = [
      {
        id: 'llama3-8b-8192',
        name: 'Llama 3 8B',
        provider: 'Groq',
        description: 'Fast and efficient model for content generation',
        maxTokens: 8192,
        features: ['content-generation', 'seo-suggestions', 'readability'],
        free: true,
        speed: 'very-fast'
      },
      {
        id: 'microsoft/DialoGPT-medium',
        name: 'DialoGPT Medium',
        provider: 'Hugging Face',
        description: 'Good for conversational content and dialogue',
        maxTokens: 1024,
        features: ['content-generation'],
        free: true,
        speed: 'medium'
      },
      {
        id: 'gpt-3.5-turbo',
        name: 'GPT-3.5 Turbo',
        provider: 'OpenAI',
        description: 'High-quality content generation with excellent understanding',
        maxTokens: 4096,
        features: ['content-generation', 'seo-suggestions', 'readability', 'plagiarism-check'],
        free: false,
        speed: 'fast'
      }
    ];

    res.json({
      success: true,
      data: models
    });

  } catch (error) {
    console.error('Get AI models error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get AI models',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
