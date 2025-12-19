const { pool } = require('../config/database');

async function getUserStats(req, res, next) {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      'SELECT * FROM user_statistics WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      // Return default stats if user has no statistics yet
      return res.json({
        user_id: userId,
        total_sessions: 0,
        average_wpm: 0,
        best_wpm: 0,
        average_accuracy: 0,
      });
    }

    res.json({ statistics: result.rows[0] });
  } catch (error) {
    next(error);
  }
}

async function getLeaderboard(req, res, next) {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 100); // Max 100 entries

    // Get best score per user, then sort by WPM
    const result = await pool.query(
      `WITH user_best_scores AS (
        SELECT DISTINCT ON (l.user_id)
          l.id,
          l.user_id,
          l.username,
          l.wpm,
          l.accuracy,
          l.recorded_at,
          l.session_id
        FROM leaderboard l
        ORDER BY l.user_id, l.wpm DESC, l.accuracy DESC
      )
      SELECT * FROM user_best_scores
      ORDER BY wpm DESC, accuracy DESC
      LIMIT $1`,
      [limit]
    );

    res.json({
      leaderboard: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    next(error);
  }
}

async function getSessionHistory(req, res, next) {
  try {
    const userId = req.user.userId;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
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
        t.content,
        t.difficulty_level
      FROM typing_sessions ts
      JOIN texts t ON ts.text_id = t.id
      WHERE ts.user_id = $1
      ORDER BY ts.started_at DESC
      LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    // Get total count for pagination
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM typing_sessions WHERE user_id = $1',
      [userId]
    );
    const totalCount = parseInt(countResult.rows[0].count);

    res.json({
      sessions: result.rows,
      pagination: {
        limit,
        offset,
        total: totalCount,
        hasMore: offset + limit < totalCount,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function getProgressOverTime(req, res, next) {
  try {
    const userId = req.user.userId;
    const days = Math.min(parseInt(req.query.days) || 30, 365); // Max 1 year

    const result = await pool.query(
      `SELECT 
        DATE(ts.completed_at) as date,
        COUNT(*) as sessions_count,
        AVG(ts.wpm) as avg_wpm,
        MAX(ts.wpm) as max_wpm,
        AVG(ts.accuracy) as avg_accuracy
      FROM typing_sessions ts
      WHERE ts.user_id = $1
        AND ts.is_completed = true
        AND ts.completed_at >= NOW() - INTERVAL '${days} days'
      GROUP BY DATE(ts.completed_at)
      ORDER BY date ASC`,
      [userId]
    );

    res.json({
      progress: result.rows,
      period: `${days} days`,
    });
  } catch (error) {
    next(error);
  }
}

async function getDetailedStats(req, res, next) {
  try {
    const userId = req.user.userId;

    // Get basic statistics
    const statsResult = await pool.query(
      'SELECT * FROM user_statistics WHERE user_id = $1',
      [userId]
    );

    // Get additional statistics from sessions
    const additionalStats = await pool.query(
      `SELECT 
        COUNT(*) as total_completed_sessions,
        SUM(duration_seconds) as total_time_seconds,
        AVG(wpm) as calculated_avg_wpm,
        MAX(wpm) as calculated_max_wpm,
        AVG(accuracy) as calculated_avg_accuracy,
        SUM(correct_characters) as total_characters_typed
      FROM typing_sessions
      WHERE user_id = $1 AND is_completed = true`,
      [userId]
    );

    const stats = statsResult.rows[0] || {
      user_id: userId,
      total_sessions: 0,
      average_wpm: 0,
      best_wpm: 0,
      average_accuracy: 0,
    };

    const additional = additionalStats.rows[0] || {
      total_completed_sessions: 0,
      total_time_seconds: 0,
      calculated_avg_wpm: 0,
      calculated_max_wpm: 0,
      calculated_avg_accuracy: 0,
      total_characters_typed: 0,
    };

    res.json({
      statistics: stats,
      additional: {
        totalCompletedSessions: parseInt(additional.total_completed_sessions) || 0,
        totalTimeSeconds: parseInt(additional.total_time_seconds) || 0,
        totalTimeMinutes: Math.round((parseInt(additional.total_time_seconds) || 0) / 60 * 100) / 100,
        totalCharactersTyped: parseInt(additional.total_characters_typed) || 0,
        calculatedAvgWPM: parseFloat(additional.calculated_avg_wpm) || 0,
        calculatedMaxWPM: parseFloat(additional.calculated_max_wpm) || 0,
        calculatedAvgAccuracy: parseFloat(additional.calculated_avg_accuracy) || 0,
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getUserStats,
  getLeaderboard,
  getSessionHistory,
  getProgressOverTime,
  getDetailedStats,
};

