const { pool } = require('../config/database');
const { calculateTypingStats } = require('./typingService');
const { updateUserStats, addToLeaderboard } = require('./statsService');

// Store active sessions: sessionId -> { userId, textId, text, startTime, ws, lastUpdateTime }
const activeSessions = new Map();

// Throttle configuration: max 1 message per 100ms
const TYPING_THROTTLE_MS = 100;

/**
 * Handle WebSocket messages
 */
async function handleWebSocketMessage(ws, message) {
  try {
    switch (message.type) {
      case 'session:start':
        await handleSessionStart(ws, message.data);
        break;

      case 'typing:input':
        await handleTypingInput(ws, message.data);
        break;

      case 'typing:complete':
        await handleTypingComplete(ws, message.data);
        break;

      default:
        ws.send(
          JSON.stringify({
            type: 'error',
            data: { message: `Unknown message type: ${message.type}` },
          })
        );
    }
  } catch (error) {
    console.error('WebSocket error:', error);
    ws.send(
      JSON.stringify({
        type: 'error',
        data: { message: error.message || 'An error occurred' },
      })
    );
  }
}

/**
 * Handle session start
 */
async function handleSessionStart(ws, data) {
  const { sessionId, textId } = data;
  const userId = ws.userId;

  if (!sessionId || !textId) {
    ws.send(
      JSON.stringify({
        type: 'error',
        data: { message: 'sessionId and textId are required' },
      })
    );
    return;
  }

  // Get text content (ensure it's within reasonable limits for testing)
  const textResult = await pool.query(
    `SELECT id, content, character_count 
     FROM texts 
     WHERE id = $1 
       AND is_active = true 
       AND character_count <= 400 
       AND character_count >= 100`,
    [textId]
  );

  if (textResult.rows.length === 0) {
    ws.send(
      JSON.stringify({
        type: 'error',
        data: { message: 'Text not found' },
      })
    );
    return;
  }

  const text = textResult.rows[0];
  const startTime = Date.now();

  // Store session
  activeSessions.set(sessionId, {
    userId,
    textId: text.id,
    text: text.content,
    startTime,
    ws,
    lastUpdateTime: null,
  });

  ws.send(
    JSON.stringify({
      type: 'session:created',
      data: {
        sessionId,
        textId: text.id,
        text: text.content,
      },
    })
  );
}

/**
 * Handle typing input
 */
async function handleTypingInput(ws, data) {
  const { sessionId, input, position } = data;

  // Validation
  if (!sessionId) {
    ws.send(
      JSON.stringify({
        type: 'error',
        data: { message: 'sessionId is required' },
      })
    );
    return;
  }

  if (typeof input !== 'string') {
    ws.send(
      JSON.stringify({
        type: 'error',
        data: { message: 'input must be a string' },
      })
    );
    return;
  }

  const session = activeSessions.get(sessionId);
  if (!session) {
    ws.send(
      JSON.stringify({
        type: 'error',
        data: { message: 'Session not found. Please start a new session.' },
      })
    );
    return;
  }

  // Throttle: Only process if enough time has passed since last update
  const now = Date.now();
  if (session.lastUpdateTime && (now - session.lastUpdateTime) < TYPING_THROTTLE_MS) {
    // Skip this update, but don't send error (silent throttle)
    return;
  }

  // Update last update time
  session.lastUpdateTime = now;

  // Check if text is already completed
  if (input === session.text) {
    // Text is complete, trigger completion
    await handleTypingComplete(ws, { sessionId, finalInput: input });
    return;
  }

  // Calculate progress
  let elapsedSeconds = Math.floor((now - session.startTime) / 1000);
  
  // Only calculate if at least 1 second has passed (avoid division by zero)
  if (elapsedSeconds === 0) {
    elapsedSeconds = 1;
  }

  const stats = calculateTypingStats(input, session.text, elapsedSeconds);

  // Send progress update
  ws.send(
    JSON.stringify({
      type: 'progress:update',
      data: {
        sessionId,
        correctChars: stats.correctCharacters,
        wpm: stats.wpm,
        accuracy: stats.accuracy,
        seconds: elapsedSeconds,
        totalChars: input.length,
        targetLength: session.text.length,
      },
    })
  );
}

/**
 * Handle typing completion
 */
async function handleTypingComplete(ws, data) {
  const { sessionId, finalInput } = data;

  // Validation
  if (!sessionId) {
    ws.send(
      JSON.stringify({
        type: 'error',
        data: { message: 'sessionId is required' },
      })
    );
    return;
  }

  if (typeof finalInput !== 'string') {
    ws.send(
      JSON.stringify({
        type: 'error',
        data: { message: 'finalInput must be a string' },
      })
    );
    return;
  }

  const session = activeSessions.get(sessionId);
  if (!session) {
    ws.send(
      JSON.stringify({
        type: 'error',
        data: { message: 'Session not found' },
      })
    );
    return;
  }

  // Verify that the input matches the target text (timer stops when text is completely typed)
  if (finalInput !== session.text) {
    ws.send(
      JSON.stringify({
        type: 'error',
        data: { message: 'Text does not match target. Please complete the text correctly.' },
      })
    );
    return;
  }

  // Calculate final stats with precise timing
  const completionTime = Date.now();
  const durationSeconds = Math.max(1, Math.floor((completionTime - session.startTime) / 1000));
  const stats = calculateTypingStats(finalInput, session.text, durationSeconds);

  try {
    // Update session in database (timer stops here - completion is recorded)
    await pool.query(
      `UPDATE typing_sessions 
       SET completed_at = NOW(),
           duration_seconds = $1,
           correct_characters = $2,
           wpm = $3,
           accuracy = $4,
           is_completed = true
       WHERE id = $5 AND user_id = $6`,
      [durationSeconds, stats.correctCharacters, stats.wpm, stats.accuracy, sessionId, session.userId]
    );

    // Update user statistics
    await updateUserStats(session.userId, stats.wpm, stats.accuracy);

    // Add to leaderboard (if WPM > 0 and accuracy >= 50%)
    if (stats.wpm > 0 && stats.accuracy >= 50) {
      const userResult = await pool.query('SELECT username FROM users WHERE id = $1', [session.userId]);
      const username = userResult.rows[0]?.username || 'Unknown';
      await addToLeaderboard(session.userId, username, stats.wpm, stats.accuracy, sessionId);
    }

    // Remove from active sessions
    activeSessions.delete(sessionId);

    // Send completion message
    ws.send(
      JSON.stringify({
        type: 'session:completed',
        data: {
          sessionId,
          wpm: stats.wpm,
          accuracy: stats.accuracy,
          duration: durationSeconds,
          correctCharacters: stats.correctCharacters,
          totalCharacters: finalInput.length,
          message: 'Session completed successfully! Timer stopped.',
        },
      })
    );

    console.log(`Session ${sessionId} completed: ${stats.wpm} WPM, ${stats.accuracy}% accuracy`);
  } catch (error) {
    console.error('Error completing session:', error);
    ws.send(
      JSON.stringify({
        type: 'error',
        data: { message: 'Failed to save session results' },
      })
    );
  }
}

/**
 * Get active session count (for monitoring)
 */
function getActiveSessionCount() {
  return activeSessions.size;
}

/**
 * Clean up inactive sessions (sessions older than 1 hour)
 */
function cleanupInactiveSessions() {
  const now = Date.now();
  const maxAge = 60 * 60 * 1000; // 1 hour

  for (const [sessionId, session] of activeSessions.entries()) {
    if (now - session.startTime > maxAge) {
      activeSessions.delete(sessionId);
      console.log(`Cleaned up inactive session: ${sessionId}`);
    }
  }
}

// Run cleanup every 30 minutes
setInterval(cleanupInactiveSessions, 30 * 60 * 1000);

module.exports = {
  handleWebSocketMessage,
  getActiveSessionCount,
  cleanupInactiveSessions,
};

