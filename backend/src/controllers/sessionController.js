const { pool } = require('../config/database');

async function createSession(req, res, next) {
  try {
    const { textId } = req.body;
    const userId = req.user.userId;

    if (!textId) {
      return res.status(400).json({ error: 'Text ID is required' });
    }

    // Verify text exists and is within character limits (100-400 chars for testing)
    const textCheck = await pool.query(
      `SELECT id FROM texts 
       WHERE id = $1 
         AND is_active = true 
         AND character_count >= 100 
         AND character_count <= 400`,
      [textId]
    );
    if (textCheck.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Text not found or exceeds character limit (100-400 characters for testing)' 
      });
    }

    const result = await pool.query(
      'INSERT INTO typing_sessions (user_id, text_id, started_at) VALUES ($1, $2, NOW()) RETURNING id, started_at',
      [userId, textId]
    );

    res.status(201).json({
      message: 'Session created successfully',
      session: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
}

async function getSessions(req, res, next) {
  try {
    const userId = req.user.userId;
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    const result = await pool.query(
      `SELECT 
        ts.id, 
        ts.text_id, 
        ts.started_at, 
        ts.completed_at, 
        ts.duration_seconds, 
        ts.correct_characters, 
        ts.wpm, 
        ts.accuracy, 
        ts.is_completed,
        t.content
      FROM typing_sessions ts
      JOIN texts t ON ts.text_id = t.id
      WHERE ts.user_id = $1
      ORDER BY ts.started_at DESC
      LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    res.json({
      sessions: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    next(error);
  }
}

async function updateSession(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { completed_at, duration_seconds, correct_characters, wpm, accuracy, is_completed } = req.body;

    // Verify session belongs to user
    const sessionCheck = await pool.query(
      'SELECT id FROM typing_sessions WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (sessionCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    if (completed_at !== undefined) {
      updateFields.push(`completed_at = $${paramCount++}`);
      updateValues.push(completed_at);
    }
    if (duration_seconds !== undefined) {
      updateFields.push(`duration_seconds = $${paramCount++}`);
      updateValues.push(duration_seconds);
    }
    if (correct_characters !== undefined) {
      updateFields.push(`correct_characters = $${paramCount++}`);
      updateValues.push(correct_characters);
    }
    if (wpm !== undefined) {
      updateFields.push(`wpm = $${paramCount++}`);
      updateValues.push(wpm);
    }
    if (accuracy !== undefined) {
      updateFields.push(`accuracy = $${paramCount++}`);
      updateValues.push(accuracy);
    }
    if (is_completed !== undefined) {
      updateFields.push(`is_completed = $${paramCount++}`);
      updateValues.push(is_completed);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updateValues.push(id, userId);
    const query = `UPDATE typing_sessions SET ${updateFields.join(', ')} WHERE id = $${paramCount++} AND user_id = $${paramCount++} RETURNING *`;

    const result = await pool.query(query, updateValues);

    res.json({
      message: 'Session updated successfully',
      session: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createSession,
  getSessions,
  updateSession,
};

