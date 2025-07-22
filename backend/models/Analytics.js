const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // null for anonymous users
  },
  sessionId: {
    type: String,
    required: true
  },
  event: {
    type: String,
    enum: ['view', 'like', 'share', 'comment', 'scroll', 'time_spent'],
    required: true
  },
  metadata: {
    // For view events
    referrer: String,
    userAgent: String,
    ipAddress: String,
    country: String,
    city: String,
    device: {
      type: String,
      enum: ['desktop', 'mobile', 'tablet']
    },
    
    // For scroll events
    scrollDepth: Number, // percentage
    
    // For time spent events
    timeSpent: Number, // seconds
    
    // For share events
    platform: String, // twitter, facebook, linkedin, etc.
    
    // General metadata
    timestamp: {
      type: Date,
      default: Date.now
    },
    url: String,
    utm: {
      source: String,
      medium: String,
      campaign: String,
      term: String,
      content: String
    }
  }
}, {
  timestamps: true
});

// Indexes for analytics queries
analyticsSchema.index({ post: 1, event: 1, createdAt: -1 });
analyticsSchema.index({ user: 1, createdAt: -1 });
analyticsSchema.index({ sessionId: 1 });
analyticsSchema.index({ createdAt: -1 });
analyticsSchema.index({ 'metadata.country': 1 });
analyticsSchema.index({ 'metadata.device': 1 });

// Daily analytics summary schema
const dailyAnalyticsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true
  },
  totalViews: {
    type: Number,
    default: 0
  },
  uniqueVisitors: {
    type: Number,
    default: 0
  },
  totalLikes: {
    type: Number,
    default: 0
  },
  totalShares: {
    type: Number,
    default: 0
  },
  totalComments: {
    type: Number,
    default: 0
  },
  averageTimeSpent: {
    type: Number,
    default: 0
  },
  topPosts: [{
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post'
    },
    views: Number,
    likes: Number,
    shares: Number
  }],
  trafficSources: [{
    source: String,
    visits: Number,
    percentage: Number
  }],
  deviceBreakdown: {
    desktop: {
      type: Number,
      default: 0
    },
    mobile: {
      type: Number,
      default: 0
    },
    tablet: {
      type: Number,
      default: 0
    }
  },
  geographicData: [{
    country: String,
    visits: Number,
    percentage: Number
  }]
}, {
  timestamps: true
});

dailyAnalyticsSchema.index({ date: -1 });

// User engagement schema
const userEngagementSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  postsViewed: [{
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post'
    },
    viewCount: Number,
    timeSpent: Number,
    lastViewed: Date
  }],
  totalTimeSpent: {
    type: Number,
    default: 0
  },
  actionsPerformed: {
    likes: Number,
    shares: Number,
    comments: Number
  },
  engagementScore: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

userEngagementSchema.index({ user: 1, date: -1 });
userEngagementSchema.index({ date: -1 });

// Static methods for analytics aggregation
analyticsSchema.statics.getPostAnalytics = async function(postId, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        post: mongoose.Types.ObjectId(postId),
        createdAt: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: '$event',
        count: { $sum: 1 },
        uniqueUsers: { $addToSet: '$user' }
      }
    },
    {
      $project: {
        event: '$_id',
        count: 1,
        uniqueUsers: { $size: '$uniqueUsers' }
      }
    }
  ]);
};

analyticsSchema.statics.getTopPosts = async function(limit = 10, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        event: 'view',
        createdAt: {
          $gte: startDate,
          $lte: endDate
        }
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
    {
      $sort: { views: -1 }
    },
    {
      $limit: limit
    },
    {
      $lookup: {
        from: 'posts',
        localField: 'post',
        foreignField: '_id',
        as: 'postDetails'
      }
    }
  ]);
};

const Analytics = mongoose.model('Analytics', analyticsSchema);
const DailyAnalytics = mongoose.model('DailyAnalytics', dailyAnalyticsSchema);
const UserEngagement = mongoose.model('UserEngagement', userEngagementSchema);

module.exports = {
  Analytics,
  DailyAnalytics,
  UserEngagement
};
