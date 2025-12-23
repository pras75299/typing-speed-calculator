import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { statsService } from '../../services/statsService';
import './Dashboard.css';

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

// Helper function to safely get number value
const getNumber = (value, defaultValue = 0) => {
  if (value === null || value === undefined || value === '') {
    return defaultValue;
  }
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(num) ? defaultValue : num;
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [detailedStats, setDetailedStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const location = useLocation();

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [basicStats, detailed] = await Promise.all([
        statsService.getUserStats(),
        statsService.getDetailedStats(),
      ]);
      
      // Normalize stats to ensure numbers are properly converted
      const normalizedStats = basicStats ? {
        ...basicStats,
        total_sessions: getNumber(basicStats.total_sessions, 0),
        average_wpm: getNumber(basicStats.average_wpm, 0),
        best_wpm: getNumber(basicStats.best_wpm, 0),
        average_accuracy: getNumber(basicStats.average_accuracy, 0),
      } : null;
      
      setStats(normalizedStats);
      setDetailedStats(detailed);
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to load statistics';
      setError(errorMessage);
      console.error('Error loading stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load stats on mount and when navigating to dashboard
  useEffect(() => {
    loadStats();
  }, [loadStats, location.pathname]);

  // Refresh stats when window gains focus (user might have completed a session in another tab)
  useEffect(() => {
    const handleFocus = () => {
      loadStats();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [loadStats]);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading statistics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <div className="error-icon">⚠️</div>
        <p>{error}</p>
        <button onClick={loadStats} className="retry-button">
          Try Again
        </button>
      </div>
    );
  }

  // Check if user has no stats yet
  const hasNoStats = !stats || (stats.total_sessions === 0 && !detailedStats?.additional?.totalCompletedSessions);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h2>Code Typing Statistics</h2>
          <p className="dashboard-subtitle">Track your coding speed and accuracy</p>
        </div>
        <button onClick={loadStats} className="refresh-button" disabled={loading}>
          {loading ? 'Refreshing...' : '🔄 Refresh'}
        </button>
      </div>

      {hasNoStats ? (
        <div className="dashboard-empty">
          <div className="empty-icon">📊</div>
          <h3>No Statistics Yet</h3>
          <p>Start practicing code typing to see your statistics here!</p>
          <a href="/" className="start-practice-button">
            Start Practicing
          </a>
        </div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Total Sessions</div>
              <div className="stat-value">{stats?.total_sessions || 0}</div>
              <div className="stat-description">Practice sessions completed</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Average WPM</div>
              <div className="stat-value">{formatNumber(stats?.average_wpm)}</div>
              <div className="stat-description">Words per minute average</div>
            </div>
            <div className="stat-card stat-card--highlight">
              <div className="stat-label">Best WPM</div>
              <div className="stat-value stat-value--highlight">
                {formatNumber(stats?.best_wpm)}
              </div>
              <div className="stat-description">Your personal best</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Average Accuracy</div>
              <div className="stat-value">{formatNumber(stats?.average_accuracy)}%</div>
              <div className="stat-description">Typing accuracy rate</div>
            </div>
          </div>

          {detailedStats?.additional && (
            <div className="detailed-stats">
              <h3>Additional Metrics</h3>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-label">Total Practice Time</div>
                  <div className="stat-value">
                    {(() => {
                      const totalMinutes = getNumber(detailedStats.additional.totalTimeMinutes, 0);
                      if (totalMinutes >= 60) {
                        const hours = Math.floor(totalMinutes / 60);
                        const minutes = Math.floor(totalMinutes % 60);
                        return `${hours}h ${minutes}m`;
                      }
                      return `${formatNumber(totalMinutes)} min`;
                    })()}
                  </div>
                  <div className="stat-description">Time spent practicing</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Characters Typed</div>
                  <div className="stat-value">
                    {detailedStats.additional.totalCharactersTyped?.toLocaleString() || '0'}
                  </div>
                  <div className="stat-description">Total characters coded</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Completed Sessions</div>
                  <div className="stat-value">
                    {detailedStats.additional.totalCompletedSessions || 0}
                  </div>
                  <div className="stat-description">Fully completed practices</div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;

