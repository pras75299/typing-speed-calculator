import React, { useState, useEffect } from 'react';
import { statsService } from '../../services/statsService';
import './Leaderboard.css';

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
      const data = await statsService.getLeaderboard(50);
      setLeaderboard(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load leaderboard');
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
              <div className="username-col">{entry.username}</div>
              <div className="wpm-col">
                <strong>{entry.wpm?.toFixed(1)}</strong>
              </div>
              <div className="accuracy-col">{entry.accuracy?.toFixed(1)}%</div>
              <div className="date-col">
                {new Date(entry.recorded_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Leaderboard;

