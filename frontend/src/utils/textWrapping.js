/**
 * Text wrapping utilities for code typing practice
 * Handles cursor position calculation with wrapped lines
 */

/**
 * Calculate the visual position of cursor in wrapped text
 * @param {string} text - Text content
 * @param {number} cursorPosition - Logical cursor position
 * @param {number} lineWidth - Width of line in characters (approximate)
 * @returns {Object} { visualLine, visualColumn, logicalLine, logicalColumn }
 */
export function getWrappedPosition(text, cursorPosition, lineWidth = 80) {
  if (!text || cursorPosition < 0) {
    return {
      visualLine: 0,
      visualColumn: 0,
      logicalLine: 0,
      logicalColumn: 0,
    };
  }

  const lines = text.split('\n');
  let currentPos = 0;
  let logicalLine = 0;
  let visualLine = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineLength = line.length;
    const lineEnd = currentPos + lineLength;

    if (cursorPosition >= currentPos && cursorPosition <= lineEnd) {
      logicalLine = i;
      const column = cursorPosition - currentPos;
      
      // Calculate visual line (accounting for wrapping)
      const wrappedLines = Math.floor(column / lineWidth);
      visualLine += wrappedLines;
      
      return {
        visualLine,
        visualColumn: column % lineWidth,
        logicalLine: i,
        logicalColumn: column,
      };
    }

    // Calculate how many visual lines this logical line takes
    const wrappedLinesForThisLine = Math.floor(lineLength / lineWidth) + (lineLength % lineWidth > 0 ? 1 : 0);
    visualLine += wrappedLinesForThisLine;
    currentPos += lineLength + 1; // +1 for newline
  }

  // Cursor is at the end
  const lastLine = lines[lines.length - 1];
  const lastColumn = cursorPosition - (currentPos - lastLine.length - 1);
  const wrappedLines = Math.floor(lastColumn / lineWidth);
  
  return {
    visualLine: visualLine - Math.floor(lastLine.length / lineWidth) + wrappedLines,
    visualColumn: lastColumn % lineWidth,
    logicalLine: lines.length - 1,
    logicalColumn: lastColumn,
  };
}

/**
 * Check if text will wrap at a given position
 * @param {string} text - Text content
 * @param {number} position - Position to check
 * @param {number} lineWidth - Width of line in characters
 * @returns {boolean} True if text wraps at this position
 */
export function willWrapAt(text, position, lineWidth = 80) {
  const wrapped = getWrappedPosition(text, position, lineWidth);
  return wrapped.visualColumn === 0 && wrapped.logicalColumn > 0;
}

