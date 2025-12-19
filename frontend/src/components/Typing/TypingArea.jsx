import React from 'react';
import { useTypingSession } from '../../hooks/useTypingSession';
import Preview from '../Preview';
import Speed from '../Speed';
import './TypingArea.css';

const TypingArea = () => {
  const {
    targetText,
    userInput,
    seconds,
    started,
    finished,
    wpm,
    accuracy,
    correctChars,
    handleInputChange,
    restart,
  } = useTypingSession();

  if (!targetText) {
    return <div className="typing-loading">Loading text...</div>;
  }

  return (
    <div className="typing-area">
      <header className="typing-area__header">
        <h1>Typing Speed Calculator</h1>
        <p>Type the prompt accurately to see your words per minute.</p>
      </header>

      <main className="typing-area__card">
        <Preview text={targetText} userInput={userInput} />

        <label className="input__label" htmlFor="typing-area-input">
          Start typing below:
        </label>
        <textarea
          id="typing-area-input"
          value={userInput}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="Start typing here..."
          className="input__area"
          disabled={finished}
          spellCheck="false"
          autoFocus
        />

        <Speed
          symbols={correctChars}
          seconds={seconds}
          finished={finished}
          wpm={wpm}
          accuracy={accuracy}
        />

        {finished && (
          <div className="typing-complete">
            <p className="typing-complete__message">
              🎉 Great job! You completed the text!
            </p>
            <p className="typing-complete__stats">
              Final Score: {wpm.toFixed(1)} WPM • {accuracy.toFixed(1)}% Accuracy
            </p>
          </div>
        )}

        <div className="app__actions">
          <button type="button" onClick={restart} className="restart-button">
            {finished ? 'Try Again' : 'Restart'}
          </button>
        </div>
      </main>
    </div>
  );
};

export default TypingArea;

