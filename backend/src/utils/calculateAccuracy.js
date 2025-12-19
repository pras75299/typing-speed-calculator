/**
 * Calculate typing accuracy percentage
 * @param {number} correctCharacters - Number of correct characters
 * @param {number} totalCharacters - Total characters typed
 * @returns {number} Accuracy percentage rounded to 2 decimal places
 */
function calculateAccuracy(correctCharacters, totalCharacters) {
  if (totalCharacters === 0) return 0;
  return Math.round((correctCharacters / totalCharacters) * 10000) / 100;
}

module.exports = calculateAccuracy;

