const calculateWPM = require('../utils/calculateWPM');
const calculateAccuracy = require('../utils/calculateAccuracy');

/**
 * Calculate correct characters by comparing user input with target text
 * @param {string} userInput - User's typed input
 * @param {string} targetText - Target text to type
 * @returns {number} Number of correct characters
 */
function calculateCorrectCharacters(userInput, targetText) {
  let correctCount = 0;
  const minLength = Math.min(userInput.length, targetText.length);

  for (let i = 0; i < minLength; i++) {
    if (userInput[i] === targetText[i]) {
      correctCount++;
    }
  }

  return correctCount;
}

/**
 * Calculate typing statistics
 * @param {string} userInput - User's typed input
 * @param {string} targetText - Target text
 * @param {number} seconds - Time taken in seconds
 * @returns {Object} Statistics object with wpm, accuracy, correctCharacters
 */
function calculateTypingStats(userInput, targetText, seconds) {
  const correctCharacters = calculateCorrectCharacters(userInput, targetText);
  const wpm = calculateWPM(correctCharacters, seconds);
  const accuracy = calculateAccuracy(correctCharacters, userInput.length);

  return {
    correctCharacters,
    wpm,
    accuracy,
  };
}

module.exports = {
  calculateCorrectCharacters,
  calculateTypingStats,
};

