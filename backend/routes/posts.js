const express = require('express');
const Post = require('../models/Post');
const { auth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/posts
// @desc    Get all published posts (public) or user's posts (private)
// @access  Public/Private
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status = 'published',
      author,
      tags,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    let query = {};

    // If user is authenticated, they can see their own drafts
    if (req.user) {
      if (status === 'all') {
        query = { author: req.user.userId };
      } else if (status === 'published') {
        query = { status: 'published' };
      } else {
        query = { 
          $or: [
            { status: status, author: req.user.userId },
            { status: 'published' }
          ]
        };
      }
    } else {
      // Public users only see published posts
      query = { status: 'published' };
    }

    // Add filters
    if (author) query.author = author;
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : tags.split(',');
      query.tags = { $in: tagArray.map(tag => tag.trim()) };
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } }
      ];
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const posts = await Post.find(query)
      .populate('author', 'username firstName lastName avatar')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .select('-content'); // Exclude full content for list view

    const total = await Post.countDocuments(query);

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          current: pageNum,
          pages: Math.ceil(total / limitNum),
          total,
          hasNext: pageNum < Math.ceil(total / limitNum),
          hasPrev: pageNum > 1
        }
      }
    });

  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/posts/:id
// @desc    Get single post by ID
// @access  Public/Private
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username firstName lastName avatar bio')
      .populate('collaboration.collaborators.user', 'username firstName lastName avatar');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user can view this post
    if (post.status !== 'published') {
      if (!req.user || (req.user.userId !== post.author._id.toString() && req.user.role !== 'admin')) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    // Increment view count for published posts
    if (post.status === 'published') {
      await post.incrementViews();
    }

    res.json({
      success: true,
      data: post
    });

  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/posts/slug/:slug
// @desc    Get single post by slug
// @access  Public
router.get('/slug/:slug', optionalAuth, async (req, res) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug, status: 'published' })
      .populate('author', 'username firstName lastName avatar bio');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Increment view count
    await post.incrementViews();

    res.json({
      success: true,
      data: post
    });

  } catch (error) {
    console.error('Get post by slug error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/posts
// @desc    Create new post
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    console.log('Received post data:', req.body); // Debug log
    console.log('User from auth:', req.user); // Debug log

    const {
      title,
      content,
      excerpt,
      tags,
      status = 'draft',
      featuredImage,
      seo,
      scheduledFor
    } = req.body;

    // Validate required fields
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Title is required'
      });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Content is required'
      });
    }

    // Handle tags - can be string or array
    let processedTags = [];
    if (tags) {
      if (Array.isArray(tags)) {
        processedTags = tags.map(tag => tag.trim()).filter(Boolean);
      } else if (typeof tags === 'string') {
        processedTags = tags.split(',').map(tag => tag.trim()).filter(Boolean);
      }
    }

    // Generate slug from title
    const generateSlug = (title) => {
      return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        .substring(0, 100); // Limit length
    };

    const baseSlug = generateSlug(title);
    let slug = baseSlug;

    // Ensure slug is unique
    let counter = 1;
    while (await Post.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const post = new Post({
      title,
      slug,
      content,
      excerpt,
      author: req.user.userId,
      tags: processedTags,
      status,
      featuredImage,
      seo,
      scheduledFor
    });

    console.log('About to save post with data:', {
      title: post.title,
      content: post.content.substring(0, 50) + '...',
      author: post.author,
      tags: post.tags,
      status: post.status
    });

    await post.save();
    console.log('Post saved successfully with ID:', post._id);

    await post.populate('author', 'username firstName lastName avatar');

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: post
    });

  } catch (error) {
    console.error('Create post error:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   PUT /api/posts/:id
// @desc    Update post
// @access  Private (author or admin)
router.put('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user can edit this post
    if (post.author.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Save current version before updating
    if (req.body.content && req.body.content !== post.content) {
      post.versions.push({
        content: post.content,
        title: post.title,
        createdBy: req.user.userId,
        changeNote: req.body.changeNote || 'Content updated'
      });
    }

    // Update fields
    const allowedUpdates = [
      'title', 'content', 'excerpt', 'tags', 'status', 
      'featuredImage', 'seo', 'scheduledFor'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'tags') {
          // Handle tags - can be string or array
          if (Array.isArray(req.body[field])) {
            post[field] = req.body[field].map(tag => tag.trim()).filter(Boolean);
          } else if (typeof req.body[field] === 'string') {
            post[field] = req.body[field].split(',').map(tag => tag.trim()).filter(Boolean);
          } else {
            post[field] = [];
          }
        } else {
          post[field] = req.body[field];
        }
      }
    });

    await post.save();
    await post.populate('author', 'username firstName lastName avatar');

    res.json({
      success: true,
      message: 'Post updated successfully',
      data: post
    });

  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   DELETE /api/posts/:id
// @desc    Delete post
// @access  Private (author or admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user can delete this post
    if (post.author.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await Post.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });

  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/posts/:id/collaborate
// @desc    Add collaborator to post
// @access  Private (author or admin)
router.post('/:id/collaborate', auth, async (req, res) => {
  try {
    const { userId, role = 'viewer' } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user can add collaborators
    if (post.author.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await post.addCollaborator(userId, role);

    res.json({
      success: true,
      message: 'Collaborator added successfully',
      data: post
    });

  } catch (error) {
    console.error('Add collaborator error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
