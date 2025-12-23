import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTypingSession } from '../../hooks/useTypingSession';
import Preview from '../Preview';
import Speed from '../Speed';
import { handleArrowKey, moveCursorHome, moveCursorEnd } from '../../utils/cursorNavigation';
import { normalizeText } from '../../utils/textNormalization';
import './TypingArea.css';

const TypingArea = () => {
  const [debugMode, setDebugMode] = useState(false);
  
  const {
    targetText,
    userInput,
    cursorPosition,
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

  const handleTextareaChange = (e) => {
    const textarea = e.target;
    const value = textarea.value;
    // Get cursor position synchronously - selectionStart is available immediately
    // Use requestAnimationFrame to ensure DOM is updated
    requestAnimationFrame(() => {
      const cursorPos = textarea.selectionStart;
      handleInputChange(value, cursorPos);
    });
  };

  const handleTextareaPaste = (e) => {
    // Allow paste, but update cursor position after paste
    // The onChange handler will catch the new value and cursor position
    setTimeout(() => {
      const textarea = e.target;
      const cursorPos = textarea.selectionStart;
      handleInputChange(textarea.value, cursorPos);
    }, 0);
  };

  const handleTextareaKeyDown = (e) => {
    const textarea = e.target;
    const value = textarea.value;
    const currentPos = textarea.selectionStart;

    // Handle Tab key - prevent default and insert spaces instead
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      // Insert 2 spaces (common in JavaScript) or 4 spaces (Python style)
      const spaces = '  ';
      const newValue = value.substring(0, start) + spaces + value.substring(end);
      const newCursorPos = start + spaces.length;
      
      handleInputChange(newValue, newCursorPos);
      
      // Set cursor position after state update
      setTimeout(() => {
        textarea.selectionStart = newCursorPos;
        textarea.selectionEnd = newCursorPos;
      }, 0);
      return;
    }

    // Handle Home key - move to start of line
    if (e.key === 'Home') {
      e.preventDefault();
      const normalizedValue = normalizeText(value);
      const newPos = moveCursorHome(normalizedValue, currentPos);
      handleInputChange(value, newPos);
      setTimeout(() => {
        textarea.selectionStart = newPos;
        textarea.selectionEnd = newPos;
      }, 0);
      return;
    }

    // Handle End key - move to end of line
    if (e.key === 'End') {
      e.preventDefault();
      const normalizedValue = normalizeText(value);
      const newPos = moveCursorEnd(normalizedValue, currentPos);
      handleInputChange(value, newPos);
      setTimeout(() => {
        textarea.selectionStart = newPos;
        textarea.selectionEnd = newPos;
      }, 0);
      return;
    }

    // Handle Arrow keys with improved navigation
    if (['ArrowUp', 'ArrowDown'].includes(e.key)) {
      e.preventDefault();
      const normalizedValue = normalizeText(value);
      const newPos = handleArrowKey(e.key, normalizedValue, currentPos);
      handleInputChange(value, newPos);
      setTimeout(() => {
        textarea.selectionStart = newPos;
        textarea.selectionEnd = newPos;
      }, 0);
      return;
    }

    // For ArrowLeft/Right, let browser handle it but update our state
    if (['ArrowLeft', 'ArrowRight'].includes(e.key)) {
      // Use setTimeout to ensure browser has processed the key
      setTimeout(() => {
        const cursorPos = textarea.selectionStart;
        if (cursorPos !== cursorPosition) {
          handleInputChange(textarea.value, cursorPos);
        }
      }, 0);
    }
  };

  const handleTextareaKeyUp = (e) => {
    // Update cursor position after key is released (for all keys except navigation keys we handle)
    // This ensures cursor position is always up-to-date
    if (['ArrowUp', 'ArrowDown', 'Home', 'End', 'Tab'].includes(e.key)) {
      // These are handled in keyDown, skip here
      return;
    }

    const textarea = e.target;
    const cursorPos = textarea.selectionStart;
    
    // Only update if cursor position actually changed
    if (cursorPos !== cursorPosition) {
      handleInputChange(textarea.value, cursorPos);
    }
  };

  const handleTextareaClick = (e) => {
    // Update cursor position on click
    const textarea = e.target;
    const cursorPos = textarea.selectionStart;
    handleInputChange(textarea.value, cursorPos);
  };

  const handleTextareaSelect = (e) => {
    // Update cursor position on text selection
    const textarea = e.target;
    const cursorPos = textarea.selectionStart;
    handleInputChange(textarea.value, cursorPos);
  };

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

        <Preview 
          text={targetText} 
          userInput={userInput} 
          cursorPosition={cursorPosition} 
          language={currentLanguage}
          debugMode={debugMode}
        />

        <label className="input__label" htmlFor="typing-area-input">
          Type the code below:
        </label>
        <textarea
          id="typing-area-input"
          value={userInput}
          onChange={handleTextareaChange}
          onKeyDown={handleTextareaKeyDown}
          onKeyUp={handleTextareaKeyUp}
          onClick={handleTextareaClick}
          onSelect={handleTextareaSelect}
          onPaste={handleTextareaPaste}
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
          <button 
            type="button" 
            onClick={() => setDebugMode(!debugMode)} 
            className="debug-button"
            title="Toggle debug mode to see cursor position info"
          >
            {debugMode ? '🔍 Debug ON' : '🔍 Debug'}
          </button>
          <button type="button" onClick={restart} className="restart-button">
            {finished ? 'Try Again' : 'Restart'}
          </button>
        </div>
      </main>
    </div>
  );
};

export default TypingArea;

