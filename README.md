# 🚀 BlogCraft AI - Next-Gen Content Creation Platform

A modern, AI-powered blogging platform built with Next.js 14, featuring real-time collaboration, intelligent content generation, and comprehensive analytics.

## ✨ Features

### 🤖 AI-Powered Writing
- **Content Generation** with Groq API (free tier)
- **SEO Optimization** suggestions
- **Readability Analysis** with Flesch Reading Ease scoring
- **Plagiarism Detection** framework
- **Blog Outline Creation** from topics

### ✍️ Rich Text Editor
- **TipTap Editor** with full formatting support
- **Real-time Collaboration** using Yjs and WebSockets
- **Version History** and change tracking
- **Auto-save** functionality
- **Media Embedding** support

### 📊 Analytics Dashboard
- **Real-time Analytics** tracking
- **Engagement Metrics** (views, likes, shares, comments)
- **Traffic Sources** analysis
- **Device Breakdown** statistics
- **Top Content** performance tracking
- **Interactive Charts** with Recharts

### 👥 Collaboration Features
- **Multi-user Editing** in real-time
- **User Presence** indicators
- **Comment System** (framework ready)
- **Role-based Permissions** (admin, editor, viewer)
- **Collaborative Cursors** with user identification

### 🔐 Authentication & Security
- **JWT-based Authentication** with secure token handling
- **Role-based Access Control**
- **Password Encryption** with bcrypt
- **Rate Limiting** for API protection
- **Input Validation** and sanitization

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** with App Router and TypeScript
- **Tailwind CSS** for styling
- **Shadcn UI** for component library
- **TipTap** for rich text editing
- **Recharts** for data visualization
- **Yjs** for real-time collaboration

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **Socket.io** for WebSocket connections
- **JWT** for authentication
- **Bcrypt** for password hashing

### AI & APIs
- **Groq API** for fast content generation (free tier)
- **Hugging Face API** for AI fallback (free tier)
- **OpenAI API** support (optional)

### Deployment
- **Vercel** for frontend hosting
- **MongoDB Atlas** for database (free tier)
- **Railway/Render** for backend hosting (free tier)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- MongoDB instance (local or Atlas)
- Git

### 1. Clone the Repository
```bash
git clone <repository-url>
cd blogcraft-ai
```

### 2. Install Dependencies
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 3. Environment Setup

Create `.env.local` in the root directory:
```env
BACKEND_URL=http://localhost:5000
NEXTAUTH_SECRET=your-super-secret-nextauth-key
NEXT_PUBLIC_ENABLE_AI_FEATURES=true
```

Create `backend/.env`:
```env
MONGODB_URI=mongodb://localhost:27017/blogcraft-ai
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
GROQ_API_KEY=your-groq-api-key-from-console.groq.com
```

### 4. Start the Development Servers

**Terminal 1 - Frontend:**
```bash
npm run dev
```

**Terminal 2 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 3 - Collaboration Server:**
```bash
cd backend
node collaboration-server.js
```

### 5. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Collaboration WebSocket**: ws://localhost:1234

## 🔧 Configuration

### Getting Free API Keys

#### Groq API (Recommended - Very Fast & Free)
1. Visit [console.groq.com](https://console.groq.com)
2. Sign up for a free account
3. Create an API key
4. Add to `GROQ_API_KEY` in backend/.env

#### Hugging Face API (Free Fallback)
1. Visit [huggingface.co](https://huggingface.co)
2. Sign up and go to Settings > Access Tokens
3. Create a new token
4. Add to `HUGGINGFACE_API_KEY` in backend/.env

#### MongoDB Atlas (Free Database)
1. Visit [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create a free cluster
3. Get connection string
4. Add to `MONGODB_URI` in backend/.env

## 📱 Usage

### Creating Content
1. **Sign up/Login** at `/auth/login`
2. **Access Dashboard** at `/dashboard`
3. **Create New Post** using the editor at `/editor`
4. **Use AI Assistant** for content generation and optimization
5. **Collaborate** in real-time with team members
6. **Publish** when ready

### AI Features
- **Generate Content**: Provide a topic or prompt
- **Create Outlines**: Get structured blog post outlines
- **SEO Analysis**: Get optimization suggestions
- **Readability Check**: Improve content readability
- **Plagiarism Check**: Verify content originality

### Analytics
- **View Dashboard** at `/analytics`
- **Track Performance**: Monitor views, engagement, and traffic
- **Export Data**: Download analytics reports
- **Real-time Metrics**: See live user activity

## 🚀 Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Backend (Railway/Render)
1. Connect repository to Railway or Render
2. Set environment variables
3. Deploy backend service

### Database (MongoDB Atlas)
1. Create free cluster on MongoDB Atlas
2. Configure network access and database user
3. Update connection string in environment variables

## 🧪 Testing

```bash
# Run frontend tests
npm test

# Run backend tests
cd backend
npm test

# Run end-to-end tests
npm run test:e2e
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Posts Endpoints
- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create new post
- `GET /api/posts/:id` - Get single post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post

### AI Endpoints
- `POST /api/ai/generate-content` - Generate content
- `POST /api/ai/generate-outline` - Create outline
- `POST /api/ai/seo-suggestions` - Get SEO suggestions
- `POST /api/ai/readability-score` - Check readability

### Analytics Endpoints
- `GET /api/analytics/dashboard` - Get dashboard data
- `POST /api/analytics/track` - Track events
- `GET /api/analytics/export` - Export data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js** team for the amazing framework
- **Vercel** for hosting and deployment
- **MongoDB** for the database
- **Groq** for fast AI inference
- **TipTap** for the rich text editor
- **Shadcn** for the beautiful UI components

## 📞 Support

For support, email support@blogcraft-ai.com or join our Discord community.

---

**Built with ❤️ by the BlogCraft AI Team**
## 🌐 **Live Application**
- **🎨 Frontend (User Interface)**: https://ai-blog-git-main-abhisheks-projects-18e7d0a2.vercel.app
- **⚙️ Backend API**: https://ai-blog-fnsc.onrender.com/api/health
