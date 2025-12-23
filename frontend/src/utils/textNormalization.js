/**
 * Text normalization utilities for code typing practice
 * Handles consistent normalization between target text and user input
 */

/**
 * Normalize text by converting escape sequences to actual characters
 * @param {string} text - Text to normalize
 * @param {Object} options - Normalization options
 * @param {number} options.tabSize - Number of spaces to use for tabs (default: 4)
 * @returns {string} Normalized text
 */
export function normalizeText(text, options = {}) {
  if (!text) return '';
  
  const { tabSize = 4 } = options;
  const tabSpaces = ' '.repeat(tabSize);
  
  // Convert \n to actual newlines
  // Convert \t to spaces (configurable tab size for code indentation)
  // Keep other escape sequences as-is for now
  return text
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, tabSpaces); // Convert tabs to spaces (common in code)
}

/**
 * Normalize user input to match target text format
 * @param {string} userInput - User input from textarea
 * @returns {string} Normalized user input
 */
export function normalizeUserInput(userInput) {
  if (!userInput) return '';
  
  // Textarea already provides actual newlines and tabs
  // Just ensure it's a string
  return String(userInput);
}

/**
 * Validate and clamp cursor position to valid range
 * @param {number} position - Cursor position to validate
 * @param {string} text - Target text
 * @param {string} userInput - User input (fallback for position)
 * @returns {number} Valid cursor position
 */
export function validateCursorPosition(position, text, userInput = '') {
  const normalizedText = normalizeText(text);
  const maxPosition = normalizedText.length;
  
  // If position is not provided, use userInput length
  if (position === undefined || position === null) {
    return Math.min(userInput.length, maxPosition);
  }
  
  // Clamp position to valid range [0, maxPosition]
  return Math.max(0, Math.min(Number(position), maxPosition));
}

/**
 * Get character at specific position in normalized text
 * @param {string} text - Text to get character from
 * @param {number} position - Position in text
 * @returns {string} Character at position
 */
export function getCharAt(text, position) {
  const normalized = normalizeText(text);
  if (position < 0 || position >= normalized.length) {
    return '';
  }
  return normalized[position];
}

/**
 * Compare characters at specific position
 * @param {string} targetText - Target text
 * @param {string} userInput - User input
 * @param {number} position - Position to compare
 * @returns {boolean} True if characters match
 */
export function compareCharAt(targetText, userInput, position) {
  const targetChar = getCharAt(targetText, position);
  const normalizedInput = normalizeUserInput(userInput);
  const inputChar = position < normalizedInput.length ? normalizedInput[position] : '';
  
  return targetChar === inputChar;
}

/**
 * Check if character is a special code character
 * @param {string} char - Character to check
 * @returns {boolean} True if character is special
 */
export function isSpecialChar(char) {
  if (!char) return false;
  
  // Brackets, quotes, operators, etc.
  const specialChars = [
    '{', '}', '[', ']', '(', ')',
    '"', "'", '`',
    '+', '-', '*', '/', '=', '!', '<', '>', '&', '|', '%', '^', '~',
    ';', ':', ',', '.', '?',
    '@', '#', '$', '\\',
  ];
  
  return specialChars.includes(char);
}

/**
 * Get indentation level for a line
 * @param {string} line - Line of code
 * @param {number} tabSize - Size of tab in spaces (default: 4)
 * @returns {Object} { spaces, tabs, level, indentString }
 */
export function getIndentation(line, tabSize = 4) {
  if (!line) return { spaces: 0, tabs: 0, level: 0, indentString: '' };
  
  let spaces = 0;
  let tabs = 0;
  
  for (let i = 0; i < line.length; i++) {
    if (line[i] === ' ') {
      spaces++;
    } else if (line[i] === '\t') {
      tabs++;
    } else {
      break;
    }
  }
  
  // Calculate level (tabs count as tabSize spaces)
  const level = spaces + (tabs * tabSize);
  const indentString = line.substring(0, spaces + tabs);
  
  return { spaces, tabs, level, indentString };
}

/**
 * Normalize indentation - convert tabs to spaces or vice versa
 * @param {string} text - Text to normalize indentation
 * @param {Object} options - Normalization options
 * @param {boolean} options.useSpaces - Use spaces instead of tabs (default: true)
 * @param {number} options.tabSize - Number of spaces per tab (default: 4)
 * @returns {string} Text with normalized indentation
 */
export function normalizeIndentation(text, options = {}) {
  if (!text) return '';
  
  const { useSpaces = true, tabSize = 4 } = options;
  const lines = text.split('\n');
  
  return lines.map(line => {
    const indent = getIndentation(line, tabSize);
    
    if (useSpaces) {
      // Convert tabs to spaces
      const spaces = ' '.repeat(indent.level);
      return spaces + line.substring(indent.spaces + indent.tabs);
    } else {
      // Convert spaces to tabs (prefer tabs when possible)
      const tabs = '\t'.repeat(Math.floor(indent.level / tabSize));
      const remainingSpaces = ' '.repeat(indent.level % tabSize);
      return tabs + remainingSpaces + line.substring(indent.spaces + indent.tabs);
    }
  }).join('\n');
}

