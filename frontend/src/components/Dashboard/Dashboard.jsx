import React, { useState, useEffect } from 'react';
import { statsService } from '../../services/statsService';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [detailedStats, setDetailedStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [basicStats, detailed] = await Promise.all([
        statsService.getUserStats(),
        statsService.getDetailedStats(),
      ]);
      setStats(basicStats);
      setDetailedStats(detailed);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="dashboard-loading">Loading statistics...</div>;
  }

  if (error) {
    return <div className="dashboard-error">{error}</div>;
  }

  return (
    <div className="dashboard">
      <h2>Your Statistics</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Sessions</div>
          <div className="stat-value">{stats?.total_sessions || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Average WPM</div>
          <div className="stat-value">{stats?.average_wpm?.toFixed(1) || '0.0'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Best WPM</div>
          <div className="stat-value stat-value--highlight">
            {stats?.best_wpm?.toFixed(1) || '0.0'}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Average Accuracy</div>
          <div className="stat-value">{stats?.average_accuracy?.toFixed(1) || '0.0'}%</div>
        </div>
      </div>

      {detailedStats?.additional && (
        <div className="detailed-stats">
          <h3>Additional Metrics</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Total Time</div>
              <div className="stat-value">
                {detailedStats.additional.totalTimeMinutes?.toFixed(1) || '0.0'} min
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Characters Typed</div>
              <div className="stat-value">
                {detailedStats.additional.totalCharactersTyped?.toLocaleString() || '0'}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Completed Sessions</div>
              <div className="stat-value">
                {detailedStats.additional.totalCompletedSessions || 0}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

