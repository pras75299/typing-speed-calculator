const express = require('express');
const { getRandomText, getTextById } = require('../controllers/textController');

const router = express.Router();

router.get('/random', getRandomText);
router.get('/:id', getTextById);

module.exports = router;

