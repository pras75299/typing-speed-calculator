import React from 'react';

const Speed = ({ symbols, seconds, finished }) => {
  if (!symbols || !seconds) {
    return (
      <div className="speed speed--muted">
        {finished ? 'Completed' : 'Start typing to calculate your speed.'}
      </div>
    );
  }

  const wordsPerMinute = Math.round((symbols / 5) / (seconds / 60));

  return (
    <div className="speed">
      <span className="speed__value">{wordsPerMinute} WPM</span>
      <span className="speed__meta">
        • {symbols} correct characters • {seconds}s
      </span>
    </div>
  );
};

export default Speed;

