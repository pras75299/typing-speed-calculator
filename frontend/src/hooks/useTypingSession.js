import { useState, useEffect, useRef, useCallback } from 'react';
import { sessionService } from '../services/sessionService';
import { textService } from '../services/textService';
import websocketService from '../services/websocket';

export const useTypingSession = () => {
  const [targetText, setTargetText] = useState(null);
  const [textId, setTextId] = useState(null);
  const [userInput, setUserInput] = useState('');
  const [seconds, setSeconds] = useState(0);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [correctChars, setCorrectChars] = useState(0);

  const timerRef = useRef(null);
  const lastUpdateRef = useRef(0);
  const THROTTLE_MS = 100;

  // Initialize session with random text
  const initializeSession = useCallback(async () => {
    try {
      const text = await textService.getRandomText();
      setTargetText(text.content);
      setTextId(text.id);
      setUserInput('');
      setSeconds(0);
      setStarted(false);
      setFinished(false);
      setSessionId(null);
      setWpm(0);
      setAccuracy(0);
      setCorrectChars(0);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    } catch (error) {
      console.error('Failed to load text:', error);
    }
  }, []);

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
    (value) => {
      const now = Date.now();
      
      // Throttle WebSocket updates
      if (now - lastUpdateRef.current < THROTTLE_MS && started) {
        setUserInput(value);
        return;
      }

      lastUpdateRef.current = now;
      setUserInput(value);

      // Start timer on first keystroke
      if (!started && value.length > 0) {
        setStarted(true);
        startSession();
        timerRef.current = setInterval(() => {
          setSeconds((prev) => prev + 1);
        }, 1000);
      }

      // Send typing input via WebSocket
      if (sessionId && websocketService.isConnected() && started) {
        websocketService.send({
          type: 'typing:input',
          data: {
            sessionId: sessionId,
            input: value,
            position: value.length,
          },
        });
      }

      // Check for completion
      if (targetText && value === targetText) {
        setFinished(true);
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }

        // Send completion via WebSocket
        if (sessionId && websocketService.isConnected()) {
          websocketService.send({
            type: 'typing:complete',
            data: {
              sessionId: sessionId,
              finalInput: value,
            },
          });
        }
      }
    },
    [targetText, started, sessionId, startSession]
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
      setFinished(true);
      setWpm(data.wpm || 0);
      setAccuracy(data.accuracy || 0);
      setCorrectChars(data.correctCharacters || 0);
      setSeconds(data.duration || 0);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };

    websocketService.on('progress:update', handleProgress);
    websocketService.on('session:completed', handleCompleted);

    return () => {
      websocketService.off('progress:update', handleProgress);
      websocketService.off('session:completed', handleCompleted);
    };
  }, []);

  // Initialize on mount
  useEffect(() => {
    initializeSession();
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
    seconds,
    started,
    finished,
    wpm,
    accuracy,
    correctChars,
    handleInputChange,
    restart,
  };
};

