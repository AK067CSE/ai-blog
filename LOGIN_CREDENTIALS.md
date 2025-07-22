# 🔐 BlogCraft AI - Login Credentials

## Default User Accounts

The following user accounts have been created for testing and demonstration purposes:

### 👑 Admin Account
- **Username:** `admin`
- **Email:** `admin@blogcraft.ai`
- **Password:** `admin123`
- **Role:** Administrator
- **Access:** Full system access, user management, analytics

### 🎭 Demo Account  
- **Username:** `demo`
- **Email:** `demo@blogcraft.ai`
- **Password:** `demo123`
- **Role:** Regular User
- **Access:** Create posts, use AI features, view analytics

### 🧪 Test Account
- **Username:** `testuser`
- **Email:** `test@blogcraft.ai`
- **Password:** `test123`
- **Role:** Regular User
- **Access:** Create posts, use AI features, view analytics

## 🚀 How to Login

1. **Start the application:**
   ```bash
   # Backend (from /backend directory)
   npm run dev
   
   # Frontend (from root directory)
   npm run dev
   ```

2. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

3. **Login process:**
   - Go to http://localhost:3000/auth/login
   - Enter any of the credentials above
   - You can use either username or email to login

## 🔧 Creating New Users

To create additional users, you can:

1. **Use the registration page:** http://localhost:3000/auth/register
2. **Run the seed script again:** `node seed-users.js` (from backend directory)
3. **Use the API directly:** POST to `/api/auth/register`

## 🛡️ Security Notes

- These are **demo credentials** for development/testing
- Change passwords before production deployment
- The admin account has elevated privileges
- All accounts are pre-verified for convenience

## 📱 Features Available

With these accounts you can:
- ✅ Create and edit blog posts
- ✅ Use AI writing assistant
- ✅ Generate content with AI
- ✅ View analytics and statistics
- ✅ Manage user profiles
- ✅ Access all dashboard features

---

**Happy Blogging with BlogCraft AI! 🚀✨**
