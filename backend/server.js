require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require('socket.io');
const authRoutes = require('./routes/auth');
const Message = require('./models/message'); // Assuming you have a Message model
const app = express();
const server = http.createServer(app);

// Socket.IO initialization with CORS configuration
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins for now
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes); // API routes for authentication

// MongoDB Connection with proper options
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});

// In-memory store for online users
const onlineUsers = {};

// Socket.IO Event Handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('user-joined', (userId) => {
    if (!userId) {
      console.log('UserId is missing or invalid');
      socket.disconnect();
      return;
    }

    onlineUsers[userId] = socket.id;
    console.log(`${userId} joined with socket ID: ${socket.id}`);

    // Notify other clients about the user's status (online)
    io.emit('update-user-status', { userId, status: 'online' });
  });

  // Listen for typing status and notify the other user
  socket.on('typing', ({ from }) => {
    socket.broadcast.emit('typing', { from });  // sends to everyone except sender
  });
  

  // Listen for messages sent by users and forward them to the recipient
  socket.on('send-message', async ({ from, message }) => {
    console.log(`Broadcasting message from ${from}: ${message}`);
  
    io.emit('receive-message', { from, message }); // 🔥 Sends to ALL connected sockets
  
    try {
      await Message.create({ from, message });
    } catch (err) {
      console.error('Message DB save error:', err);
    }
  });
  
  socket.on('user-joined', (userId) => {
    onlineUsers[userId] = socket.id;
    console.log(`${userId} joined`);
    io.emit('update-user-status', { userId, status: 'online' });
  
    // ✅ Send updated list
    io.emit('online-users', Object.keys(onlineUsers));
  });
  
  socket.on('disconnect', () => {
    const disconnectedUserId = Object.keys(onlineUsers).find(
      (key) => onlineUsers[key] === socket.id
    );
  
    if (disconnectedUserId) {
      delete onlineUsers[disconnectedUserId];
      io.emit('update-user-status', { userId: disconnectedUserId, status: 'offline' });
  
      // ✅ Update list
      io.emit('online-users', Object.keys(onlineUsers));
    }
  });
  

  // When a user disconnects, remove them from the online users list
//   socket.on('disconnect', () => {
//     const disconnectedUserId = Object.keys(onlineUsers).find(
//       (key) => onlineUsers[key] === socket.id
//     );

//     if (disconnectedUserId) {
//       delete onlineUsers[disconnectedUserId];
//       // Notify others that the user is offline
//       io.emit('update-user-status', { userId: disconnectedUserId, status: 'offline' });
//       console.log(`${disconnectedUserId} disconnected`);
//     }
//   });
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
