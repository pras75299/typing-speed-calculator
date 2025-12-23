import React, { useState, useEffect } from 'react';
import { statsService } from '../../services/statsService';
import './Leaderboard.css';

// Helper function to safely format numbers
const formatNumber = (value, decimals = 1) => {
  if (value === null || value === undefined || value === '') {
    return '0.0';
  }
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) {
    return '0.0';
  }
  return num.toFixed(decimals);
};

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await statsService.getLeaderboard(50);
      // Normalize leaderboard data to ensure numbers are properly converted
      const normalizedData = (data || []).map(entry => ({
        ...entry,
        wpm: typeof entry.wpm === 'string' ? parseFloat(entry.wpm) : entry.wpm,
        accuracy: typeof entry.accuracy === 'string' ? parseFloat(entry.accuracy) : entry.accuracy,
      }));
      setLeaderboard(normalizedData);
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to load leaderboard';
      setError(errorMessage);
      console.error('Error loading leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="leaderboard-loading">Loading leaderboard...</div>;
  }

  if (error) {
    return <div className="leaderboard-error">{error}</div>;
  }

  return (
    <div className="leaderboard">
      <h2>Leaderboard</h2>
      {leaderboard.length === 0 ? (
        <div className="leaderboard-empty">No scores yet. Be the first!</div>
      ) : (
        <div className="leaderboard-table">
          <div className="leaderboard-header">
            <div className="rank-col">Rank</div>
            <div className="username-col">Username</div>
            <div className="wpm-col">WPM</div>
            <div className="accuracy-col">Accuracy</div>
            <div className="date-col">Date</div>
          </div>
          {leaderboard.map((entry, index) => (
            <div key={entry.id} className="leaderboard-row">
              <div className="rank-col">
                <span className={`rank-badge rank-badge--${index + 1 <= 3 ? 'top' : 'normal'}`}>
                  {index + 1}
                </span>
              </div>
              <div className="username-col">{entry.username || 'Anonymous'}</div>
              <div className="wpm-col">
                <strong>{formatNumber(entry.wpm)}</strong>
              </div>
              <div className="accuracy-col">{formatNumber(entry.accuracy)}%</div>
              <div className="date-col">
                {entry.recorded_at ? new Date(entry.recorded_at).toLocaleDateString() : 'N/A'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Leaderboard;

