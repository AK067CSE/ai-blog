# 🚀 BlogCraft AI - Quick Deployment Checklist

## ⚡ Quick Start (30 minutes total)

### 📋 Step 1: Get Required API Keys (10 minutes)

#### 1.1 Groq API Key
1. Go to [console.groq.com](https://console.groq.com)
2. Sign up with Google/GitHub
3. Click "Create API Key"
4. Copy the key: `gsk_...`

#### 1.2 MongoDB Atlas Setup
1. Go to [mongodb.com/atlas](https://mongodb.com/atlas)
2. Sign up for free
3. Create new project: "BlogCraft AI"
4. Build database → M0 Sandbox (FREE)
5. Create database user:
   - Username: `blogcraft-admin`
   - Password: Generate strong password
6. Network Access → Add IP → `0.0.0.0/0` (allow all)
7. Connect → Application → Copy connection string
8. Replace `<password>` with your password

#### 1.3 Cloudinary (Optional)
1. Go to [cloudinary.com](https://cloudinary.com)
2. Sign up for free
3. Dashboard → Copy: Cloud Name, API Key, API Secret

### 🖥️ Step 2: Deploy Backend to Railway (10 minutes)

#### 2.1 Prepare Backend
1. Push your code to GitHub
2. Go to [railway.app](https://railway.app)
3. Sign up with GitHub
4. New Project → Deploy from GitHub
5. Select your repository
6. Choose `backend` folder as root

#### 2.2 Set Environment Variables
In Railway dashboard → Variables tab, add:

```env
PORT=8080
NODE_ENV=production
MONGODB_URI=mongodb+srv://blogcraft-admin:yourpassword@cluster0.xxxxx.mongodb.net/blogcraft-ai
JWT_SECRET=your-super-secure-jwt-secret-minimum-32-characters-long
FRONTEND_URL=https://your-app.vercel.app
GROQ_API_KEY=gsk_your_groq_api_key_here
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### 2.3 Get Backend URL
After deployment, copy the Railway URL: `https://your-backend.railway.app`

### 🌐 Step 3: Deploy Frontend to Vercel (10 minutes)

#### 3.1 Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. New Project → Import from GitHub
4. Select your repository
5. Framework: Next.js
6. Root Directory: `./` (leave default)

#### 3.2 Set Environment Variables
In Vercel dashboard → Settings → Environment Variables:

```env
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
NEXT_PUBLIC_FRONTEND_URL=https://your-app.vercel.app
NEXT_PUBLIC_ENABLE_AI_FEATURES=true
NEXT_PUBLIC_ENABLE_COLLABORATION=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

#### 3.3 Update Backend FRONTEND_URL
1. Go back to Railway dashboard
2. Update `FRONTEND_URL` with your Vercel URL
3. Redeploy backend

## ✅ Final Testing Checklist

### Test Core Features
- [ ] Visit your Vercel URL
- [ ] Register new account
- [ ] Login works
- [ ] Create new post
- [ ] AI content generation works
- [ ] SEO analysis works
- [ ] Plagiarism checker works
- [ ] Analytics dashboard loads
- [ ] Collaboration features work

### Performance Check
- [ ] Page loads in < 3 seconds
- [ ] No console errors
- [ ] Mobile responsive
- [ ] All buttons/links work

## 🎉 You're Live!

**Frontend**: `https://your-app.vercel.app`
**Backend**: `https://your-backend.railway.app`

## 🔧 Environment Variables Reference

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
NEXT_PUBLIC_FRONTEND_URL=https://your-app.vercel.app
NEXT_PUBLIC_ENABLE_AI_FEATURES=true
NEXT_PUBLIC_ENABLE_COLLABORATION=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

### Backend (.env)
```env
PORT=8080
NODE_ENV=production
MONGODB_URI=mongodb+srv://blogcraft-admin:password@cluster0.xxxxx.mongodb.net/blogcraft-ai
JWT_SECRET=your-super-secure-jwt-secret-minimum-32-characters-long
FRONTEND_URL=https://your-app.vercel.app
GROQ_API_KEY=gsk_your_groq_api_key_here
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🚨 Troubleshooting

### Common Issues

1. **CORS Error**
   - Check `FRONTEND_URL` in backend matches Vercel URL exactly
   - Redeploy backend after updating

2. **Database Connection Failed**
   - Verify MongoDB connection string
   - Check IP whitelist (0.0.0.0/0)
   - Ensure password is correct

3. **AI Features Not Working**
   - Verify Groq API key is correct
   - Check API key has sufficient credits

4. **Build Failures**
   - Check Node.js version (use 18.x)
   - Verify all dependencies in package.json
   - Check build logs for specific errors

### Quick Fixes
```bash
# If build fails, try:
npm install
npm run build

# If backend won't start:
cd backend
npm install
npm start
```

## 📞 Support Resources

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Railway Docs**: [docs.railway.app](https://docs.railway.app)
- **MongoDB Atlas**: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)
- **Groq API**: [console.groq.com/docs](https://console.groq.com/docs)

---

**🎯 Total Deployment Time: ~30 minutes**
**💰 Total Cost: $0 (all free tiers)**
**🚀 Result: Production-ready application!**
