import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import dns from 'dns';

// Routes
import studentRoutes from './routes/studentRoutes.js';
import teacherRoutes from './routes/teacherRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import accountRoutes from './routes/accountRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import conversationRoutes from './routes/conversationRoutes.js';
import activityRoutes from './routes/activityRoutes.js';
import foodRoutes from './routes/foodRoutes.js';
import financeRoutes from './routes/financeRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import statRoutes from './routes/statRoutes.js';
import groupRoutes from './routes/groupRoutes.js';
import authRoutes from './routes/authRoutes.js';
import Account from './models/Account.js';
import Event from './models/Event.js';

dotenv.config();

// Workaround: ensure SRV DNS lookups use a public resolver
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {
  console.warn('Could not set DNS servers:', e.message);
}

const app = express();
const httpServer = http.createServer(app);
const PORT = process.env.PORT || 5000;
const allowedOrigins = [
  'http://localhost:5173',                  // Your local Vite frontend
  'https://fsw-mindx-1.onrender.com'        // Your live Render frontend
];

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

// ─── MIDDLEWARE ───────────────────────────────────────────────────────────
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── SOCKET.IO REAL-TIME CHAT HANDLERS ──────────────────────────────────
const onlineUsers = new Map(); // userId -> socketId

io.on('connection', (socket) => {
  console.log(`⚡ Socket connected: ${socket.id}`);

  socket.on('user_online', (userId) => {
    if (userId) {
      onlineUsers.set(userId, socket.id);
      socket.userId = userId;
      io.emit('update_online_users', Array.from(onlineUsers.keys()));
    }
  });

  socket.on('join_conversation', (conversationId) => {
    socket.join(`conversation:${conversationId}`);
  });

  socket.on('leave_conversation', (conversationId) => {
    socket.leave(`conversation:${conversationId}`);
  });

  socket.on('send_message', (messageData) => {
    if (messageData && messageData.conversationId) {
      socket.to(`conversation:${messageData.conversationId}`).emit('receive_message', messageData);
      io.emit('conversation_updated', messageData.conversationId);
    }
  });

  socket.on('typing', ({ conversationId, userId, userName }) => {
    socket.to(`conversation:${conversationId}`).emit('user_typing', { conversationId, userId, userName });
  });

  socket.on('stop_typing', ({ conversationId, userId }) => {
    socket.to(`conversation:${conversationId}`).emit('user_stop_typing', { conversationId, userId });
  });

  socket.on('disconnect', () => {
    if (socket.userId) {
      onlineUsers.delete(socket.userId);
      io.emit('update_online_users', Array.from(onlineUsers.keys()));
    }
    console.log(`⚡ Socket disconnected: ${socket.id}`);
  });
});

// ─── MONGODB CONNECTION ───────────────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('✓ MongoDB connected');
    await Account.syncIndexes();
    await Event.syncIndexes();
    console.log('✓ Account & Event indexes synced');
  })
  .catch((err) => console.error('✗ MongoDB connection failed:', err.message));

// ─── API ROUTES ───────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/stats', statRoutes);

// ─── HEALTH CHECK ─────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date() });
});

// ─── ERROR HANDLING ───────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

// ─── 404 HANDLER ───────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ─── START SERVER ───────────────────────────────────────────────────────────
httpServer.listen(PORT, () => {
  console.log(`✓ Server running on http://localhost:${PORT}`);
});
