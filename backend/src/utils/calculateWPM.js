/**
 * Calculate Words Per Minute (WPM)
 * Standard: 5 characters = 1 word
 * @param {number} correctCharacters - Number of correct characters typed
 * @param {number} seconds - Time taken in seconds
 * @returns {number} WPM rounded to 2 decimal places
 */
function calculateWPM(correctCharacters, seconds) {
  if (seconds === 0) return 0;
  const words = correctCharacters / 5;
  const minutes = seconds / 60;
  return Math.round((words / minutes) * 100) / 100;
}

module.exports = calculateWPM;

