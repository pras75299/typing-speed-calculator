const samples = [
  'Well, and so we breakfasted at ten as usual; I thought it would never be over; for, by the bye, you are to understand, that my uncle and aunt were unpleasant all the time I was with them. If you will believe me, I did not once put my foot out of doors, though I was there a fortnight.',
  'In the gallery there were many family portraits, but they could have little to fix the attention of a stranger. Elizabeth walked in quest of the only face whose features would be known to her.',
  'She did at last extort from her father an acknowledgment that the horses were engaged. Jane was therefore obliged to go on horseback, and her mother attended her to the door with many cheerful prognostics of a bad day.',
  'I am no longer surprised at your knowing only six accomplished women. I rather wonder now at your knowing any.',
  'All this she must possess, added Darcy, and to all this she must yet add something more substantial, in the improvement of her mind by extensive reading.',
];

const getRandomText = () => samples[Math.floor(Math.random() * samples.length)];

export default getRandomText;

