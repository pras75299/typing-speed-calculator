const express = require('express');
const {
  getUserStats,
  getLeaderboard,
  getSessionHistory,
  getProgressOverTime,
  getDetailedStats,
} = require('../controllers/statsController');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Public endpoints
router.get('/leaderboard', getLeaderboard);

// Protected endpoints (require authentication)
router.get('/user', authenticateToken, getUserStats);
router.get('/user/detailed', authenticateToken, getDetailedStats);
router.get('/user/history', authenticateToken, getSessionHistory);
router.get('/user/progress', authenticateToken, getProgressOverTime);

module.exports = router;

