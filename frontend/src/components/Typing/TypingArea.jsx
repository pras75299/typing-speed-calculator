import React from 'react';
import { Link } from 'react-router-dom';
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
    currentLanguage,
    changeLanguage,
  } = useTypingSession();

  const languages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'cpp', label: 'C++' },
    { value: 'go', label: 'Go' },
  ];

  if (!targetText) {
    return <div className="typing-loading">Loading code snippet...</div>;
  }

  return (
    <div className="typing-area">
      <header className="typing-area__header">
        <h1>Code Typing Practice</h1>
        <p>Practice typing code to improve your coding speed and accuracy.</p>
      </header>

      <main className="typing-area__card">
        <div className="language-selector">
          <label htmlFor="language-select" className="language-selector__label">
            Programming Language:
          </label>
          <select
            id="language-select"
            value={currentLanguage}
            onChange={(e) => changeLanguage(e.target.value)}
            className="language-selector__select"
            disabled={started && !finished}
          >
            {languages.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        <Preview text={targetText} userInput={userInput} />

        <label className="input__label" htmlFor="typing-area-input">
          Type the code below:
        </label>
        <textarea
          id="typing-area-input"
          value={userInput}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="Start typing the code here..."
          className="input__area code-input"
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
              🎉 Great job! You completed the code snippet!
            </p>
            <p className="typing-complete__stats">
              Final Score: {wpm.toFixed(1)} WPM • {accuracy.toFixed(1)}% Accuracy
            </p>
            <p className="typing-complete__link">
              <Link to="/dashboard">View your updated statistics →</Link>
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

