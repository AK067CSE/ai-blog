# 🚀 BlogCraft AI - Complete Deployment Guide

This comprehensive guide will walk you through deploying your BlogCraft AI application to production using modern cloud platforms.

## 📋 Deployment Overview

- **Frontend**: Vercel (Next.js hosting) - FREE
- **Backend**: Railway (Node.js hosting) - FREE tier
- **Database**: MongoDB Atlas (Cloud database) - FREE tier
- **File Storage**: Cloudinary (Image hosting) - FREE tier
- **AI Services**: Groq API - FREE tier

## �️ Pre-Deployment Checklist

### Required Accounts & Services
- [ ] GitHub account (for code repository)
- [ ] Vercel account (frontend hosting)
- [ ] Railway account (backend hosting)
- [ ] MongoDB Atlas account (database)
- [ ] Groq account (AI services)
- [ ] Cloudinary account (optional - file uploads)

### Code Preparation
- [ ] All features tested locally
- [ ] Environment variables documented
- [ ] Build process working without errors
- [ ] No console errors in production build

## 🗄️ Database Setup (MongoDB Atlas)

### 1. Create MongoDB Atlas Cluster
1. Go to [mongodb.com/atlas](https://mongodb.com/atlas)
2. Sign up for free account
3. Create a new project
4. Build a database (choose M0 Sandbox - FREE)
5. Choose AWS/Google Cloud and nearest region
6. Create cluster

### 2. Configure Database Access
1. **Database Access** → Add new database user
   - Username: `blogcraft-admin`
   - Password: Generate secure password
   - Database User Privileges: Read and write to any database

2. **Network Access** → Add IP Address
   - Add `0.0.0.0/0` (allow access from anywhere)
   - Or add specific IPs for better security

### 3. Get Connection String
1. Go to **Clusters** → Connect
2. Choose "Connect your application"
3. Copy connection string
4. Replace `<password>` with your database user password
5. Replace `<dbname>` with `blogcraft-ai`

Example: `mongodb+srv://blogcraft-admin:yourpassword@cluster0.abc123.mongodb.net/blogcraft-ai`

## 🖥️ Backend Deployment (Railway)

### 1. Prepare Backend for Deployment
1. Create `backend/package.json` if not exists:
```json
{
  "name": "blogcraft-ai-backend",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^8.0.3",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "express-rate-limit": "^7.1.5",
    "helmet": "^7.1.0",
    "socket.io": "^4.7.4",
    "yjs": "^13.6.10",
    "y-websocket": "^1.5.0",
    "axios": "^1.6.2"
  }
}
```

### 2. Deploy to Railway
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Create new project → Deploy from GitHub repo
4. Select your repository
5. Choose `backend` folder as root directory

### 3. Set Environment Variables in Railway
```env
MONGODB_URI=mongodb+srv://blogcraft-admin:yourpassword@cluster0.abc123.mongodb.net/blogcraft-ai
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long-production
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-vercel-app.vercel.app
GROQ_API_KEY=your-groq-api-key
HUGGINGFACE_API_KEY=your-huggingface-api-key
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 4. Deploy Collaboration Server (Optional)
For real-time collaboration, deploy the WebSocket server separately:
1. Create new Railway service
2. Deploy `collaboration-server.js`
3. Set PORT environment variable
4. Note the WebSocket URL

## 🌐 Frontend Deployment (Vercel)

### 1. Prepare Frontend
1. Update `next.config.ts`:
```typescript
/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    BACKEND_URL: process.env.BACKEND_URL,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.BACKEND_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
```

### 2. Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Import your repository
4. Configure project:
   - Framework Preset: Next.js
   - Root Directory: `./` (project root)
   - Build Command: `npm run build`
   - Output Directory: `.next`

### 3. Set Environment Variables in Vercel
```env
BACKEND_URL=https://your-railway-app.railway.app
NEXTAUTH_SECRET=your-super-secret-nextauth-key-production
NEXT_PUBLIC_ENABLE_AI_FEATURES=true
NEXT_PUBLIC_ENABLE_COLLABORATION=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

### 4. Deploy
1. Click "Deploy"
2. Wait for build to complete
3. Get your Vercel URL: `https://your-app.vercel.app`

## 🔗 Connect Frontend and Backend

### 1. Update Backend CORS
In your Railway backend, update `FRONTEND_URL`:
```env
FRONTEND_URL=https://your-vercel-app.vercel.app
```

### 2. Update Frontend API URLs
The Next.js rewrites should handle API routing automatically.

## 🧪 Testing Deployment

### 1. Test Basic Functionality
1. Visit your Vercel URL
2. Navigate to `/auth/login`
3. Try to register a new account
4. Check if backend API is responding

### 2. Test AI Features
1. Login to dashboard
2. Try AI content generation
3. Verify Groq API is working

### 3. Test Database
1. Create a test post
2. Check if data persists
3. Verify MongoDB Atlas connection

## 🔧 Troubleshooting

### Common Issues

**1. CORS Errors**
- Ensure `FRONTEND_URL` is set correctly in backend
- Check CORS configuration in `server.js`

**2. Database Connection Failed**
- Verify MongoDB connection string
- Check network access settings in Atlas
- Ensure database user has correct permissions

**3. API Routes Not Working**
- Check Next.js rewrites configuration
- Verify `BACKEND_URL` environment variable
- Check Railway deployment logs

**4. AI Features Not Working**
- Verify API keys are set correctly
- Check rate limiting settings
- Review API usage quotas

### Debugging Steps

**1. Check Logs**
- Railway: View deployment logs in dashboard
- Vercel: Check function logs in dashboard
- MongoDB: Monitor connections in Atlas

**2. Test API Endpoints**
```bash
# Test backend health
curl https://your-railway-app.railway.app/api/health

# Test authentication
curl -X POST https://your-railway-app.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

## 🔒 Security Considerations

### Production Security Checklist
- [ ] Use strong JWT secrets (32+ characters)
- [ ] Enable MongoDB IP whitelist
- [ ] Set up proper CORS origins
- [ ] Use HTTPS for all communications
- [ ] Enable rate limiting
- [ ] Validate all user inputs
- [ ] Use environment variables for secrets
- [ ] Enable MongoDB authentication
- [ ] Set up monitoring and alerts

### Environment Variables Security
- Never commit `.env` files to git
- Use different secrets for production
- Rotate API keys regularly
- Monitor API usage and quotas

## 📊 Monitoring & Analytics

### Set Up Monitoring
1. **Vercel Analytics**: Enable in project settings
2. **Railway Metrics**: Monitor resource usage
3. **MongoDB Monitoring**: Use Atlas monitoring tools
4. **Error Tracking**: Consider Sentry integration

### Performance Optimization
1. **CDN**: Vercel provides global CDN automatically
2. **Database Indexing**: Ensure proper MongoDB indexes
3. **Caching**: Implement Redis for session storage
4. **Image Optimization**: Use Vercel Image Optimization

## 🚀 Going Live

### Final Steps
1. **Custom Domain** (Optional):
   - Add domain in Vercel dashboard
   - Configure DNS records
   - Enable SSL certificate

2. **SEO Setup**:
   - Add meta tags
   - Configure sitemap
   - Set up Google Analytics

3. **Backup Strategy**:
   - Enable MongoDB Atlas backups
   - Export important data regularly
   - Document recovery procedures

### Launch Checklist
- [ ] All environment variables set
- [ ] Database connected and tested
- [ ] AI features working
- [ ] Authentication flow tested
- [ ] Real-time collaboration tested
- [ ] Analytics tracking working
- [ ] Error monitoring enabled
- [ ] Performance optimized
- [ ] Security measures in place
- [ ] Backup strategy implemented

## 🎉 Congratulations!

Your BlogCraft AI platform is now live! 

**Next Steps:**
- Share your platform with users
- Monitor performance and usage
- Gather feedback for improvements
- Scale resources as needed
- Add new features based on user needs

**Support:**
- Check logs for any issues
- Monitor API usage and quotas
- Keep dependencies updated
- Regular security audits

---

**Happy Blogging with AI! 🚀✨**
