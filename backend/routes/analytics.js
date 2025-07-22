const express = require('express');
const { Analytics, DailyAnalytics } = require('../models/Analytics');
const Post = require('../models/Post');
const { auth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/analytics/track
// @desc    Track analytics event
// @access  Public
router.post('/track', optionalAuth, async (req, res) => {
  try {
    const {
      postId,
      event,
      sessionId,
      metadata = {}
    } = req.body;

    if (!postId || !event || !sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Post ID, event, and session ID are required'
      });
    }

    // Validate event type
    const validEvents = ['view', 'like', 'share', 'comment', 'scroll', 'time_spent'];
    if (!validEvents.includes(event)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event type'
      });
    }

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Create analytics record
    const analyticsData = {
      post: postId,
      user: req.user ? req.user.userId : null,
      sessionId,
      event,
      metadata: {
        ...metadata,
        timestamp: new Date(),
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip || req.connection.remoteAddress
      }
    };

    const analytics = new Analytics(analyticsData);
    await analytics.save();

    res.json({
      success: true,
      message: 'Event tracked successfully'
    });

  } catch (error) {
    console.error('Track analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/analytics/dashboard
// @desc    Get analytics dashboard data
// @access  Private
router.get('/dashboard', auth, async (req, res) => {
  try {
    const { startDate, endDate, postId } = req.query;
    
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    const end = endDate ? new Date(endDate) : new Date();

    let matchQuery = {
      createdAt: { $gte: start, $lte: end }
    };

    // If user is not admin, only show their posts
    if (req.user.role !== 'admin') {
      const userPosts = await Post.find({ author: req.user.userId }).select('_id');
      const userPostIds = userPosts.map(post => post._id);
      matchQuery.post = { $in: userPostIds };
    }

    // If specific post requested
    if (postId) {
      matchQuery.post = postId;
    }

    // Get overview stats
    const overviewStats = await Analytics.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$event',
          count: { $sum: 1 },
          uniqueUsers: { $addToSet: '$user' },
          uniqueSessions: { $addToSet: '$sessionId' }
        }
      },
      {
        $project: {
          event: '$_id',
          count: 1,
          uniqueUsers: { $size: '$uniqueUsers' },
          uniqueSessions: { $size: '$uniqueSessions' }
        }
      }
    ]);

    // Get daily stats
    const dailyStats = await Analytics.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            event: '$event'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.date',
          events: {
            $push: {
              event: '$_id.event',
              count: '$count'
            }
          },
          totalEvents: { $sum: '$count' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get top posts
    const topPosts = await Analytics.aggregate([
      { 
        $match: { 
          ...matchQuery,
          event: 'view'
        }
      },
      {
        $group: {
          _id: '$post',
          views: { $sum: 1 },
          uniqueViews: { $addToSet: '$sessionId' }
        }
      },
      {
        $project: {
          post: '$_id',
          views: 1,
          uniqueViews: { $size: '$uniqueViews' }
        }
      },
      { $sort: { views: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'posts',
          localField: 'post',
          foreignField: '_id',
          as: 'postDetails'
        }
      },
      {
        $project: {
          views: 1,
          uniqueViews: 1,
          title: { $arrayElemAt: ['$postDetails.title', 0] },
          slug: { $arrayElemAt: ['$postDetails.slug', 0] },
          createdAt: { $arrayElemAt: ['$postDetails.createdAt', 0] }
        }
      }
    ]);

    // Get traffic sources
    const trafficSources = await Analytics.aggregate([
      { 
        $match: { 
          ...matchQuery,
          event: 'view',
          'metadata.referrer': { $exists: true, $ne: '' }
        }
      },
      {
        $group: {
          _id: '$metadata.referrer',
          visits: { $sum: 1 }
        }
      },
      { $sort: { visits: -1 } },
      { $limit: 10 }
    ]);

    // Get device breakdown
    const deviceBreakdown = await Analytics.aggregate([
      { 
        $match: { 
          ...matchQuery,
          event: 'view'
        }
      },
      {
        $group: {
          _id: '$metadata.device',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        overview: overviewStats,
        dailyStats,
        topPosts,
        trafficSources,
        deviceBreakdown,
        dateRange: { start, end }
      }
    });

  } catch (error) {
    console.error('Get dashboard analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/analytics/post/:postId
// @desc    Get analytics for specific post
// @access  Private (author or admin)
router.get('/post/:postId', auth, async (req, res) => {
  try {
    const { postId } = req.params;
    const { startDate, endDate } = req.query;

    // Check if post exists and user has access
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    if (post.author.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const start = startDate ? new Date(startDate) : new Date(post.createdAt);
    const end = endDate ? new Date(endDate) : new Date();

    const analytics = await Analytics.getPostAnalytics(postId, start, end);

    res.json({
      success: true,
      data: {
        post: {
          id: post._id,
          title: post.title,
          slug: post.slug,
          createdAt: post.createdAt,
          publishedAt: post.publishedAt
        },
        analytics,
        dateRange: { start, end }
      }
    });

  } catch (error) {
    console.error('Get post analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/analytics/export
// @desc    Export analytics data
// @access  Private
router.get('/export', auth, async (req, res) => {
  try {
    const { startDate, endDate, format = 'json' } = req.query;
    
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    let matchQuery = {
      createdAt: { $gte: start, $lte: end }
    };

    // If user is not admin, only show their posts
    if (req.user.role !== 'admin') {
      const userPosts = await Post.find({ author: req.user.userId }).select('_id');
      const userPostIds = userPosts.map(post => post._id);
      matchQuery.post = { $in: userPostIds };
    }

    const analyticsData = await Analytics.find(matchQuery)
      .populate('post', 'title slug')
      .populate('user', 'username email')
      .sort({ createdAt: -1 });

    if (format === 'csv') {
      // Convert to CSV format
      const csvHeader = 'Date,Post Title,Event,User,Session ID,Metadata\n';
      const csvData = analyticsData.map(record => {
        return [
          record.createdAt.toISOString(),
          record.post?.title || 'Unknown',
          record.event,
          record.user?.username || 'Anonymous',
          record.sessionId,
          JSON.stringify(record.metadata)
        ].join(',');
      }).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=analytics-export.csv');
      res.send(csvHeader + csvData);
    } else {
      res.json({
        success: true,
        data: analyticsData,
        count: analyticsData.length,
        dateRange: { start, end }
      });
    }

  } catch (error) {
    console.error('Export analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
