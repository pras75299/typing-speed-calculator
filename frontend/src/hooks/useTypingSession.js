import { useState, useEffect, useRef, useCallback } from 'react';
import { sessionService } from '../services/sessionService';
import { textService } from '../services/textService';
import websocketService from '../services/websocket';

export const useTypingSession = (language = 'javascript') => {
  const [targetText, setTargetText] = useState(null);
  const [textId, setTextId] = useState(null);
  const [userInput, setUserInput] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [correctChars, setCorrectChars] = useState(0);
  const [currentLanguage, setCurrentLanguage] = useState(language);

  const timerRef = useRef(null);
  const lastUpdateRef = useRef(0);
  const finishedRef = useRef(false);
  const THROTTLE_MS = 100;

  // Initialize session with random code snippet
  const initializeSession = useCallback(async (lang) => {
    const languageToUse = lang || currentLanguage;
    try {
      const text = await textService.getRandomText(languageToUse);
      // Normalize text - convert \n to actual newlines
      const normalizedContent = text.content.replace(/\\n/g, '\n');
      setTargetText(normalizedContent);
      setTextId(text.id);
      setCurrentLanguage(languageToUse);
      setUserInput('');
      setCursorPosition(0);
      setSeconds(0);
      setStarted(false);
      setFinished(false);
      finishedRef.current = false;
      setSessionId(null);
      setWpm(0);
      setAccuracy(0);
      setCorrectChars(0);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    } catch (error) {
      console.error('Failed to load code snippet:', error);
    }
  }, [currentLanguage]);

  // Start typing session
  const startSession = useCallback(async () => {
    if (!textId || sessionId) return;

    try {
      const session = await sessionService.createSession(textId);
      setSessionId(session.id);

      // Send session start via WebSocket
      if (websocketService.isConnected()) {
        websocketService.send({
          type: 'session:start',
          data: {
            sessionId: session.id,
            textId: textId,
          },
        });
      }
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  }, [textId, sessionId]);

  // Handle input change
  const handleInputChange = useCallback(
    (value, cursorPos = value.length) => {
      const now = Date.now();
      
      // Throttle WebSocket updates
      if (now - lastUpdateRef.current < THROTTLE_MS && started) {
        setUserInput(value);
        setCursorPosition(cursorPos);
        return;
      }

      lastUpdateRef.current = now;
      setUserInput(value);
      setCursorPosition(cursorPos);

      // Check for completion first - timer stops when text is completely typed
      if (targetText && value === targetText && !finishedRef.current) {
        // Stop the timer immediately
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        setFinished(true);
        finishedRef.current = true;
        setStarted(false); // Prevent timer from restarting

        // Send completion via WebSocket (this will update statistics in database)
        if (sessionId && websocketService.isConnected()) {
          websocketService.send({
            type: 'typing:complete',
            data: {
              sessionId: sessionId,
              finalInput: value,
            },
          });
        }
        return; // Exit early to prevent further processing
      }

      // Start timer on first keystroke (only if not finished)
      if (!started && !finishedRef.current && value.length > 0) {
        setStarted(true);
        startSession();
        timerRef.current = setInterval(() => {
          // Don't increment if finished
          if (!finishedRef.current) {
            setSeconds((prev) => prev + 1);
          } else {
            // Stop timer if finished
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
          }
        }, 1000);
      }

      // Send typing input via WebSocket (only if not finished)
      if (sessionId && websocketService.isConnected() && started && !finishedRef.current) {
        websocketService.send({
          type: 'typing:input',
          data: {
            sessionId: sessionId,
            input: value,
            position: value.length,
          },
        });
      }
    },
    [targetText, started, sessionId, startSession, finished]
  );

  // Restart session
  const restart = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    initializeSession();
  }, [initializeSession]);

  // Set up WebSocket listeners
  useEffect(() => {
    const handleProgress = (data) => {
      setWpm(data.wpm || 0);
      setAccuracy(data.accuracy || 0);
      setCorrectChars(data.correctChars || 0);
      setSeconds(data.seconds || 0);
    };

    const handleCompleted = (data) => {
      // Ensure timer is stopped when session is completed
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      setFinished(true);
      finishedRef.current = true;
      setWpm(data.wpm || 0);
      setAccuracy(data.accuracy || 0);
      setCorrectChars(data.correctCharacters || 0);
      setSeconds(data.duration || 0);
      
      // Statistics have been updated in the database at this point
      // Dashboard will refresh when user navigates to it
      console.log('Session completed! Statistics updated in database.');
    };

    websocketService.on('progress:update', handleProgress);
    websocketService.on('session:completed', handleCompleted);

    return () => {
      websocketService.off('progress:update', handleProgress);
      websocketService.off('session:completed', handleCompleted);
    };
  }, []);

  // Initialize on mount or when language changes
  useEffect(() => {
    initializeSession(currentLanguage);
  }, [currentLanguage, initializeSession]);

  // Function to change language
  const changeLanguage = useCallback((newLanguage) => {
    setCurrentLanguage(newLanguage);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    initializeSession(newLanguage);
  }, [initializeSession]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return {
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
  };
};

