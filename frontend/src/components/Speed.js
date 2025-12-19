import React from 'react';

const Speed = ({ symbols, seconds, finished, wpm, accuracy }) => {
  // Use provided WPM if available, otherwise calculate
  const wordsPerMinute = wpm || (symbols && seconds ? Math.round((symbols / 5) / (seconds / 60)) : 0);

  if (!symbols && !wpm) {
    return (
      <div className="speed speed--muted">
        {finished ? 'Completed' : 'Start typing to calculate your speed.'}
      </div>
    );
  }

  return (
    <div className="speed">
      <span className="speed__value">{wordsPerMinute} WPM</span>
      {accuracy > 0 && (
        <span className="speed__meta">
          • {accuracy.toFixed(1)}% accuracy
        </span>
      )}
      <span className="speed__meta">
        • {symbols || 0} correct characters • {seconds}s
      </span>
    </div>
  );
};

export default Speed;

