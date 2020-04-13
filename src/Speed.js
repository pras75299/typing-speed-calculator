import React from "react";

export default (props) => {
  const sec = props.sec;
  const symbols = props.symbols;

  if (symbols !== 0 && sec !== 0) {
    const wpm = symbols / 5 / (sec / 60);
    return <div>{Math.round(wpm)} WPM</div>;
  }

  return null;
};
