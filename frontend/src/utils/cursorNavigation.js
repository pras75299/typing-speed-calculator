/**
 * Cursor navigation utilities for code typing practice
 * Handles complex navigation scenarios like arrow keys, Home/End, etc.
 */

/**
 * Get line information for a given position in text
 * @param {string} text - Text to analyze
 * @param {number} position - Cursor position
 * @returns {Object} { lineIndex, columnIndex, lineStart, lineEnd, lineText }
 */
export function getLineInfo(text, position) {
  if (!text || position < 0) {
    return {
      lineIndex: 0,
      columnIndex: 0,
      lineStart: 0,
      lineEnd: text ? text.length : 0,
      lineText: text || '',
    };
  }

  const lines = text.split('\n');
  let currentPos = 0;
  let lineIndex = 0;
  let lineStart = 0;

  for (let i = 0; i < lines.length; i++) {
    const lineLength = lines[i].length + 1; // +1 for newline character
    const lineEnd = currentPos + lines[i].length;

    if (position >= currentPos && position <= lineEnd) {
      lineIndex = i;
      lineStart = currentPos;
      return {
        lineIndex: i,
        columnIndex: position - currentPos,
        lineStart: currentPos,
        lineEnd: lineEnd,
        lineText: lines[i],
      };
    }

    currentPos += lineLength;
  }

  // Cursor is at the end
  const lastLineIndex = lines.length - 1;
  return {
    lineIndex: lastLineIndex,
    columnIndex: position - (currentPos - lines[lastLineIndex].length - 1),
    lineStart: currentPos - lines[lastLineIndex].length - 1,
    lineEnd: text.length,
    lineText: lines[lastLineIndex],
  };
}

/**
 * Calculate cursor position for arrow up key
 * Moves cursor to same column on previous line
 * @param {string} text - Text content
 * @param {number} currentPosition - Current cursor position
 * @returns {number} New cursor position
 */
export function moveCursorUp(text, currentPosition) {
  const currentLine = getLineInfo(text, currentPosition);
  
  if (currentLine.lineIndex === 0) {
    // Already at first line, move to start
    return 0;
  }

  // Get previous line
  const lines = text.split('\n');
  const previousLine = lines[currentLine.lineIndex - 1];
  const previousLineStart = currentLine.lineStart - previousLine.length - 1;

  // Move to same column on previous line (or end of line if shorter)
  const targetColumn = Math.min(currentLine.columnIndex, previousLine.length);
  return previousLineStart + targetColumn;
}

/**
 * Calculate cursor position for arrow down key
 * Moves cursor to same column on next line
 * @param {string} text - Text content
 * @param {number} currentPosition - Current cursor position
 * @returns {number} New cursor position
 */
export function moveCursorDown(text, currentPosition) {
  const currentLine = getLineInfo(text, currentPosition);
  const lines = text.split('\n');
  
  if (currentLine.lineIndex >= lines.length - 1) {
    // Already at last line, move to end
    return text.length;
  }

  // Get next line
  const nextLine = lines[currentLine.lineIndex + 1];
  const nextLineStart = currentLine.lineEnd + 1;

  // Move to same column on next line (or end of line if shorter)
  const targetColumn = Math.min(currentLine.columnIndex, nextLine.length);
  return nextLineStart + targetColumn;
}

/**
 * Calculate cursor position for Home key
 * Moves cursor to start of current line
 * @param {string} text - Text content
 * @param {number} currentPosition - Current cursor position
 * @returns {number} New cursor position
 */
export function moveCursorHome(text, currentPosition) {
  const currentLine = getLineInfo(text, currentPosition);
  return currentLine.lineStart;
}

/**
 * Calculate cursor position for End key
 * Moves cursor to end of current line
 * @param {string} text - Text content
 * @param {number} currentPosition - Current cursor position
 * @returns {number} New cursor position
 */
export function moveCursorEnd(text, currentPosition) {
  const currentLine = getLineInfo(text, currentPosition);
  return currentLine.lineEnd;
}

/**
 * Handle arrow key navigation
 * @param {string} key - Key pressed (ArrowUp, ArrowDown, ArrowLeft, ArrowRight)
 * @param {string} text - Text content
 * @param {number} currentPosition - Current cursor position
 * @returns {number} New cursor position
 */
export function handleArrowKey(key, text, currentPosition) {
  switch (key) {
    case 'ArrowUp':
      return moveCursorUp(text, currentPosition);
    case 'ArrowDown':
      return moveCursorDown(text, currentPosition);
    case 'ArrowLeft':
      return Math.max(0, currentPosition - 1);
    case 'ArrowRight':
      return Math.min(text.length, currentPosition + 1);
    default:
      return currentPosition;
  }
}

