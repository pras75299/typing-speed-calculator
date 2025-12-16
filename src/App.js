import React, { useEffect, useMemo, useRef, useState } from 'react';
import './App.css';
import Preview from './components/Preview';
import Speed from './components/Speed';
import getRandomText from './utils/getRandomText';

const App = () => {
  const [targetText, setTargetText] = useState(() => getRandomText());
  const [userInput, setUserInput] = useState('');
  const [seconds, setSeconds] = useState(0);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);

  const timerRef = useRef(null);

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    if (!targetText) return;

    if (userInput === targetText) {
      setFinished(true);
      clearInterval(timerRef.current);
    }
  }, [targetText, userInput]);

  const startTimer = () => {
    if (timerRef.current) return;

    setStarted(true);
    timerRef.current = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
  };

  const handleInputChange = (event) => {
    if (!started) startTimer();
    setUserInput(event.target.value);
  };

  const handleRestart = () => {
    clearInterval(timerRef.current);
    timerRef.current = null;
    setTargetText(getRandomText());
    setUserInput('');
    setSeconds(0);
    setStarted(false);
    setFinished(false);
  };

  const correctSymbols = useMemo(
    () =>
      userInput
        .split('')
        .filter((char, index) => char === targetText[index]).length,
    [targetText, userInput]
  );

  return (
    <div className="app">
      <header className="app__header">
        <h1>Typing Speed Calculator</h1>
        <p>Type the prompt accurately to see your words per minute.</p>
      </header>

      <main className="app__card">
        <Preview text={targetText} userInput={userInput} />

        <label className="input__label" htmlFor="typing-area">
          Start typing below:
        </label>
        <textarea
          id="typing-area"
          value={userInput}
          onChange={handleInputChange}
          placeholder="Start typing here..."
          className="input__area"
          disabled={finished}
          spellCheck="false"
        />

        <Speed symbols={correctSymbols} seconds={seconds} finished={finished} />

        <div className="app__actions">
          <button type="button" onClick={handleRestart}>
            Restart
          </button>
        </div>
      </main>
    </div>
  );
};

export default App;
