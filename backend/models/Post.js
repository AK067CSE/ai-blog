const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  excerpt: {
    type: String,
    maxlength: [500, 'Excerpt cannot exceed 500 characters']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  featuredImage: {
    url: String,
    alt: String,
    caption: String
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  seo: {
    metaTitle: {
      type: String,
      maxlength: [60, 'Meta title cannot exceed 60 characters']
    },
    metaDescription: {
      type: String,
      maxlength: [160, 'Meta description cannot exceed 160 characters']
    },
    keywords: [String],
    canonicalUrl: String
  },
  readingTime: {
    type: Number,
    default: 0
  },
  wordCount: {
    type: Number,
    default: 0
  },
  publishedAt: {
    type: Date,
    default: null
  },
  scheduledFor: {
    type: Date,
    default: null
  },
  analytics: {
    views: {
      type: Number,
      default: 0
    },
    likes: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    },
    comments: {
      type: Number,
      default: 0
    },
    readingTimeTotal: {
      type: Number,
      default: 0
    }
  },
  aiGenerated: {
    isAiAssisted: {
      type: Boolean,
      default: false
    },
    aiModel: String,
    prompt: String,
    confidence: Number
  },
  collaboration: {
    isCollaborative: {
      type: Boolean,
      default: false
    },
    collaborators: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      role: {
        type: String,
        enum: ['editor', 'reviewer', 'viewer'],
        default: 'viewer'
      },
      addedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  versions: [{
    content: String,
    title: String,
    createdAt: {
      type: Date,
      default: Date.now
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    changeNote: String
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance (slug already has unique: true)
postSchema.index({ author: 1, status: 1 });
postSchema.index({ status: 1, publishedAt: -1 });
postSchema.index({ tags: 1 });
postSchema.index({ 'analytics.views': -1 });
postSchema.index({ createdAt: -1 });

// Virtual for URL
postSchema.virtual('url').get(function() {
  return `/posts/${this.slug}`;
});

// Pre-save middleware to generate slug
postSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  
  // Calculate reading time (average 200 words per minute)
  if (this.isModified('content')) {
    const words = this.content.split(/\s+/).length;
    this.wordCount = words;
    this.readingTime = Math.ceil(words / 200);
  }
  
  // Set published date when status changes to published
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  next();
});

// Method to increment view count
postSchema.methods.incrementViews = function() {
  this.analytics.views += 1;
  return this.save();
};

// Method to add collaborator
postSchema.methods.addCollaborator = function(userId, role = 'viewer') {
  const existingCollaborator = this.collaboration.collaborators.find(
    collab => collab.user.toString() === userId.toString()
  );
  
  if (!existingCollaborator) {
    this.collaboration.collaborators.push({ user: userId, role });
    this.collaboration.isCollaborative = true;
  }
  
  return this.save();
};

module.exports = mongoose.model('Post', postSchema);
