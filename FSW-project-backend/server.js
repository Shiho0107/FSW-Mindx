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
const PORT = process.env.PORT || 5000;

// ─── MIDDLEWARE ───────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── MONGODB CONNECTION ───────────────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('✓ MongoDB connected');
    // Drop stale indexes from older Account schema (e.g. username_1 unique on null)
    await Account.syncIndexes();
    await Event.syncIndexes();
    console.log('✓ Account & Event indexes synced');
  })
  .catch((err) => console.error('✗ MongoDB connection failed:', err.message));

// ─── API ROUTES ───────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
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
app.listen(PORT, () => {
  console.log(`✓ Server running on http://localhost:${PORT}`);
});
