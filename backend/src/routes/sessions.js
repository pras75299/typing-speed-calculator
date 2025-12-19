const express = require('express');
const { createSession, getSessions, updateSession } = require('../controllers/sessionController');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// All session routes require authentication
router.use(authenticateToken);

router.post('/', createSession);
router.get('/', getSessions);
router.patch('/:id', updateSession);

module.exports = router;

