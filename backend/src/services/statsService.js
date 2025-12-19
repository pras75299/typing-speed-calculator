const { pool } = require('../config/database');

/**
 * Update user statistics after a completed session
 */
async function updateUserStats(userId, wpm, accuracy) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Get current stats
    const currentStats = await client.query(
      'SELECT * FROM user_statistics WHERE user_id = $1',
      [userId]
    );

    if (currentStats.rows.length === 0) {
      // Create new stats record
      await client.query(
        `INSERT INTO user_statistics 
         (user_id, total_sessions, average_wpm, best_wpm, average_accuracy, updated_at)
         VALUES ($1, 1, $2, $2, $3, NOW())`,
        [userId, wpm, accuracy]
      );
    } else {
      const stats = currentStats.rows[0];
      const newTotalSessions = stats.total_sessions + 1;
      const newAverageWPM = (stats.average_wpm * stats.total_sessions + wpm) / newTotalSessions;
      const newBestWPM = Math.max(stats.best_wpm, wpm);
      const newAverageAccuracy = (stats.average_accuracy * stats.total_sessions + accuracy) / newTotalSessions;

      await client.query(
        `UPDATE user_statistics 
         SET total_sessions = $1,
             average_wpm = $2,
             best_wpm = $3,
             average_accuracy = $4,
             updated_at = NOW()
         WHERE user_id = $5`,
        [newTotalSessions, newAverageWPM, newBestWPM, newAverageAccuracy, userId]
      );
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Add entry to leaderboard
 */
async function addToLeaderboard(userId, username, wpm, accuracy, sessionId) {
  await pool.query(
    `INSERT INTO leaderboard (user_id, username, wpm, accuracy, session_id, recorded_at)
     VALUES ($1, $2, $3, $4, $5, NOW())`,
    [userId, username, wpm, accuracy, sessionId]
  );
}

module.exports = {
  updateUserStats,
  addToLeaderboard,
};

