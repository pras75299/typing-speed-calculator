import React from 'react';

const Preview = ({ text, userInput }) => {
  const currentPosition = userInput.length;

  return (
    <div className="preview" aria-label="text preview">
      {text.split('').map((char, index) => {
        let status = '';

        if (index < userInput.length) {
          status = char === userInput[index] ? 'correct' : 'incorrect';
        }

        return (
          <React.Fragment key={`${char}-${index}`}>
            {index === currentPosition && (
              <span className="preview__cursor" aria-hidden="true" />
            )}
            <span className={`preview__char ${status}`}>{char}</span>
          </React.Fragment>
        );
      })}
      {currentPosition >= text.length && (
        <span className="preview__cursor" aria-hidden="true" />
      )}
    </div>
  );
};

export default Preview;

