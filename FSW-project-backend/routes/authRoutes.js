import express from 'express';

const router = express.Router();

// TODO: Implement authentication routes
// - POST /register
// - POST /login
// - POST /logout
// - POST /refresh-token
// - POST /reset-password

router.post('/register', (req, res) => {
  res.json({ message: 'Register endpoint - TODO' });
});

router.post('/login', (req, res) => {
  res.json({ message: 'Login endpoint - TODO' });
});

export default router;
