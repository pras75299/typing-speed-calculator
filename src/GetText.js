import React from "react";

export default () => {
  const texts = [
    `Well, and so we breakfasted at ten as usual; I thought it would never be over; for, 
    by the bye, you are to understand, that my uncle and aunt were horrid unpleasant 
    all the time I was with them. If you’ll believe me, I did not once put my foot 
    out of doors, though I was there a fortnight. Not one party, or scheme, or anything. 
    To be sure London was rather thin, but, however, the Little Theatre was open. Well, 
    and so just as the carriage came to the door, my uncle was called away upon business 
    to that horrid man Mr. Stone. And then, you know, when once they get together, there 
    is no end of it. Well, I was so frightened I did not know what to do, for my uncle was 
    to give me away; and if we were beyond the hour, we could not be married all day. But, 
    luckily, he came back again in ten minutes’ time, and then we all set out. However, 
    I recollected afterwards that if he had been prevented going, the wedding need not be 
    put off, for Mr. Darcy might have done as well.`,
    `In the gallery there were many family portraits, but they could have little to 
    fix the attention of a stranger. Elizabeth walked in quest of the only face whose 
    features would be known to her. At last it arrested her--and she beheld a striking 
    resemblance to Mr. Darcy, with such a smile over the face as she remembered to have 
    sometimes seen when he looked at her. She stood several minutes before the picture, 
    in earnest contemplation, and returned to it again before they quitted the gallery. 
    Mrs. Reynolds informed them that it had been taken in his father’s lifetime.`,
    `She did at last extort from her father an acknowledgment that the horses were engaged. 
    Jane was therefore obliged to go on horseback, and her mother attended her to the door 
    with many cheerful prognostics of a bad day. Her hopes were answered; Jane had not been 
    gone long before it rained hard. Her sisters were uneasy for her, but her mother was delighted. 
    The rain continued the whole evening without intermission; Jane certainly could not come back.`,
    `I am no longer surprised at your knowing only six accomplished women. I rather wonder now at your knowing any.`,
    `All this she must possess,” added Darcy, “and to all this she must yet add something more substantial, 
    in the improvement of her mind by extensive reading.`,
  ];

  return texts[Math.floor(Math.random() * texts.length)];
};
