const WebSocket = require('ws');
const Y = require('yjs');
const { setupWSConnection } = require('y-websocket/bin/utils');
const http = require('http');

// Create HTTP server
const server = http.createServer();

// Create WebSocket server
const wss = new WebSocket.Server({ 
  server,
  port: 1234 
});

console.log('🔗 Collaboration WebSocket server starting on port 1234...');

// Store documents in memory (in production, use Redis or database)
const docs = new Map();

wss.on('connection', (ws, req) => {
  console.log('📡 New WebSocket connection established');
  
  // Setup Y.js WebSocket connection
  setupWSConnection(ws, req, {
    // Optional: Add authentication here
    // authenticate: (auth) => {
    //   // Verify JWT token or session
    //   return true;
    // },
    
    // Document persistence
    docName: req.url?.slice(1) || 'default-doc',
    
    // Garbage collection
    gc: true
  });

  ws.on('close', () => {
    console.log('📡 WebSocket connection closed');
  });

  ws.on('error', (error) => {
    console.error('📡 WebSocket error:', error);
  });
});

// Enhanced collaboration server with document management
class CollaborationServer {
  constructor() {
    this.documents = new Map();
    this.userSessions = new Map();
  }

  // Get or create document
  getDocument(docId) {
    if (!this.documents.has(docId)) {
      const ydoc = new Y.Doc();
      this.documents.set(docId, {
        doc: ydoc,
        connections: new Set(),
        lastModified: new Date(),
        metadata: {
          title: '',
          author: '',
          collaborators: []
        }
      });
      console.log(`📄 Created new document: ${docId}`);
    }
    return this.documents.get(docId);
  }

  // Add user to document
  addUserToDocument(docId, userId, userInfo) {
    const document = this.getDocument(docId);
    document.connections.add(userId);
    
    if (!document.metadata.collaborators.find(c => c.id === userId)) {
      document.metadata.collaborators.push({
        id: userId,
        name: userInfo.name || 'Anonymous',
        color: userInfo.color || this.generateUserColor(),
        joinedAt: new Date()
      });
    }
    
    console.log(`👤 User ${userId} joined document ${docId}`);
    this.broadcastUserList(docId);
  }

  // Remove user from document
  removeUserFromDocument(docId, userId) {
    const document = this.documents.get(docId);
    if (document) {
      document.connections.delete(userId);
      console.log(`👤 User ${userId} left document ${docId}`);
      this.broadcastUserList(docId);
      
      // Clean up empty documents after 5 minutes
      if (document.connections.size === 0) {
        setTimeout(() => {
          if (document.connections.size === 0) {
            this.documents.delete(docId);
            console.log(`🗑️ Cleaned up empty document: ${docId}`);
          }
        }, 5 * 60 * 1000);
      }
    }
  }

  // Broadcast user list to all connections in document
  broadcastUserList(docId) {
    const document = this.documents.get(docId);
    if (!document) return;

    const userList = {
      type: 'user-list',
      users: document.metadata.collaborators.filter(c => 
        document.connections.has(c.id)
      )
    };

    // In a real implementation, you'd send this to all WebSocket connections
    // for this document
    console.log(`📤 Broadcasting user list for ${docId}:`, userList.users.length, 'users');
  }

  // Generate random color for user
  generateUserColor() {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // Save document to database (implement based on your needs)
  async saveDocument(docId, content) {
    try {
      // Here you would save to your database
      // For now, just log
      console.log(`💾 Saving document ${docId} to database`);
      
      const document = this.documents.get(docId);
      if (document) {
        document.lastModified = new Date();
        // In production: await Post.findByIdAndUpdate(docId, { content });
      }
      
      return true;
    } catch (error) {
      console.error('💾 Error saving document:', error);
      return false;
    }
  }

  // Get document statistics
  getDocumentStats(docId) {
    const document = this.documents.get(docId);
    if (!document) return null;

    return {
      activeUsers: document.connections.size,
      totalCollaborators: document.metadata.collaborators.length,
      lastModified: document.lastModified,
      title: document.metadata.title
    };
  }

  // Get server statistics
  getServerStats() {
    return {
      totalDocuments: this.documents.size,
      totalConnections: Array.from(this.documents.values())
        .reduce((sum, doc) => sum + doc.connections.size, 0),
      uptime: process.uptime()
    };
  }
}

// Initialize collaboration server
const collaborationServer = new CollaborationServer();

// Periodic cleanup and stats logging
setInterval(() => {
  const stats = collaborationServer.getServerStats();
  console.log('📊 Server Stats:', stats);
}, 60000); // Every minute

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('🛑 Shutting down collaboration server...');
  wss.close(() => {
    console.log('✅ Collaboration server shut down gracefully');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down...');
  wss.close(() => {
    process.exit(0);
  });
});

// Start the server
server.listen(1234, () => {
  console.log('✅ Collaboration WebSocket server running on port 1234');
  console.log('🔗 WebSocket URL: ws://localhost:1234');
});

// Export for testing
module.exports = {
  wss,
  collaborationServer,
  server
};
