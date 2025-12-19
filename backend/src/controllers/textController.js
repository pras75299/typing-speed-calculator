const { pool } = require('../config/database');

async function getRandomText(req, res, next) {
  try {
    const result = await pool.query(
      'SELECT id, content, difficulty_level, word_count, character_count FROM texts WHERE is_active = true ORDER BY RANDOM() LIMIT 1'
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No texts available' });
    }

    res.json({ text: result.rows[0] });
  } catch (error) {
    next(error);
  }
}

async function getTextById(req, res, next) {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT id, content, difficulty_level, word_count, character_count FROM texts WHERE id = $1 AND is_active = true',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Text not found' });
    }

    res.json({ text: result.rows[0] });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getRandomText,
  getTextById,
};

