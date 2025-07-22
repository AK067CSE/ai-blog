const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

// Default users to create
const defaultUsers = [
  {
    username: 'admin',
    email: 'admin@blogcraft.ai',
    password: 'admin123',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    bio: 'System administrator with full access to BlogCraft AI platform.'
  },
  {
    username: 'demo',
    email: 'demo@blogcraft.ai',
    password: 'demo123',
    firstName: 'Demo',
    lastName: 'User',
    role: 'user',
    bio: 'Demo account for testing BlogCraft AI features.'
  },
  {
    username: 'testuser',
    email: 'test@blogcraft.ai',
    password: 'test123',
    firstName: 'Test',
    lastName: 'Writer',
    role: 'user',
    bio: 'Content creator exploring AI-powered blogging tools.'
  }
];

async function seedUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if users already exist
    const existingUsers = await User.find({});
    if (existingUsers.length > 0) {
      console.log('📋 Users already exist in database:');
      existingUsers.forEach(user => {
        console.log(`   - ${user.username} (${user.email})`);
      });
      
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      const answer = await new Promise(resolve => {
        rl.question('Do you want to add more users anyway? (y/N): ', resolve);
      });
      rl.close();
      
      if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
        console.log('❌ Cancelled. No new users added.');
        process.exit(0);
      }
    }

    // Create default users
    console.log('🔄 Creating default users...');
    
    for (const userData of defaultUsers) {
      // Check if user already exists
      const existingUser = await User.findOne({ 
        $or: [
          { email: userData.email },
          { username: userData.username }
        ]
      });
      
      if (existingUser) {
        console.log(`⚠️  User ${userData.username} already exists, skipping...`);
        continue;
      }

      // Create user
      const user = new User({
        username: userData.username,
        email: userData.email,
        password: userData.password, // Let the pre-save hook handle hashing
        firstName: userData.firstName,
        lastName: userData.lastName,
        bio: userData.bio || '',
        role: userData.role || 'user',
        isEmailVerified: true, // Auto-verify for demo purposes
        isActive: true
      });

      await user.save();
      console.log(`✅ Created user: ${userData.username} (${userData.email})`);
    }

    console.log('\n🎉 User seeding completed!');
    console.log('\n📋 Login Credentials:');
    console.log('┌─────────────┬─────────────────────┬───────────┐');
    console.log('│ Username    │ Email               │ Password  │');
    console.log('├─────────────┼─────────────────────┼───────────┤');
    console.log('│ admin       │ admin@blogcraft.ai  │ admin123  │');
    console.log('│ demo        │ demo@blogcraft.ai   │ demo123   │');
    console.log('│ testuser    │ test@blogcraft.ai   │ test123   │');
    console.log('└─────────────┴─────────────────────┴───────────┘');
    console.log('\n🚀 You can now login with any of these credentials!');

  } catch (error) {
    console.error('❌ Error seeding users:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('📤 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the seeding
seedUsers();
