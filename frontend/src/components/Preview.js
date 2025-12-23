import React, { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
  normalizeText,
  normalizeUserInput,
  validateCursorPosition,
  isSpecialChar,
} from "../utils/textNormalization";

const Preview = ({
  text,
  userInput,
  cursorPosition,
  language = "javascript",
  debugMode = false, // Optional debug mode
}) => {
  // Map language names to Prism language identifiers
  const languageMap = {
    javascript: "javascript",
    python: "python",
    java: "java",
    typescript: "typescript",
    cpp: "cpp",
    go: "go",
  };

  const prismLanguage = languageMap[language] || "javascript";

  // Normalize texts consistently
  const normalizedText = normalizeText(text);
  const normalizedUserInput = normalizeUserInput(userInput);

  // Validate and get cursor position
  const currentPosition = validateCursorPosition(
    cursorPosition,
    text,
    userInput
  );

  // Create feedback spans that align with the code
  const createFeedbackOverlay = () => {
    if (!normalizedText) {
      // Handle empty text case - show cursor at position 0
      if (currentPosition === 0) {
        return (
          <span
            key="cursor-start"
            className="preview__cursor"
            aria-hidden="true"
          />
        );
      }
      return null;
    }

    const chars = normalizedText.split("");
    const feedback = [];

    // Handle cursor at start (position 0) - show cursor before first character
    if (currentPosition === 0) {
      feedback.push(
        <span
          key="cursor-start"
          className="preview__cursor"
          aria-hidden="true"
        />
      );
    }

    chars.forEach((char, index) => {
      // Insert cursor BEFORE the character at currentPosition
      if (index === currentPosition && currentPosition > 0) {
        feedback.push(
          <span
            key={`cursor-${index}`}
            className="preview__cursor"
            aria-hidden="true"
          />
        );
      }

      let className = "preview__char";

      // Check if this character has been typed (compare with normalized userInput)
      // Only mark as typed if we've actually typed up to this position
      if (index < normalizedUserInput.length) {
        const userChar = normalizedUserInput[index];
        // Compare characters, handling special cases
        if (char === userChar) {
          className += " correct";
        } else {
          // Special handling for whitespace variations
          const bothWhitespace =
            (char === " " || char === "\t" || char === "\n") &&
            (userChar === " " || userChar === "\t" || userChar === "\n");

          if (bothWhitespace) {
            // Both are whitespace but different types - mark as incorrect
            className += " incorrect";
          } else {
            className += " incorrect";
          }
        }
      }

      // Debug mode: add data attributes for debugging
      const debugProps = debugMode
        ? {
            "data-index": index,
            "data-char":
              char === "\n"
                ? "\\n"
                : char === "\t"
                ? "\\t"
                : char === " "
                ? " "
                : char,
            "data-special": isSpecialChar(char) ? "true" : "false",
          }
        : {};

      // Handle different character types for proper rendering
      if (char === "\n") {
        feedback.push(
          <span key={`char-${index}`} className={className} {...debugProps}>
            {"\n"}
          </span>
        );
      } else if (char === "\t") {
        // Render tab as visible spaces for alignment (4 spaces)
        feedback.push(
          <span key={`char-${index}`} className={className} {...debugProps}>
            {"    "}
          </span>
        );
      } else if (char === " ") {
        // Use non-breaking space for proper alignment
        feedback.push(
          <span key={`char-${index}`} className={className} {...debugProps}>
            {"\u00A0"}
          </span>
        );
      } else {
        // Regular character or special character (brackets, quotes, operators)
        // All characters are rendered the same way for consistency
        feedback.push(
          <span
            key={`char-${index}`}
            className={className}
            data-char={isSpecialChar(char) ? char : undefined}
            {...debugProps}
          >
            {char}
          </span>
        );
      }
    });

    // If caret is at the very end (after last char)
    if (currentPosition >= normalizedText.length) {
      feedback.push(
        <span key="cursor-end" className="preview__cursor" aria-hidden="true" />
      );
    }

    return feedback;
  };

  if (!text) {
    return null;
  }

  return (
    <div className="preview-wrapper">
      {/* Syntax highlighted code as background */}
      <div className="preview-syntax-highlight">
        <SyntaxHighlighter
          language={prismLanguage}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: "16px",
            borderRadius: "10px",
            fontSize: "14px",
            lineHeight: "1.6",
            background: "#1e1e1e",
            minHeight: "96px",
            overflow: "auto",
          }}
          PreTag="div"
          codeTagProps={{
            style: {
              fontFamily:
                'Monaco, Menlo, "Ubuntu Mono", Consolas, "source-code-pro", monospace',
              margin: 0,
              padding: 0,
              letterSpacing: "0", // Ensure consistent letter spacing
            },
          }}
          wrapLines={true}
          wrapLongLines={true}
        >
          {normalizedText}
        </SyntaxHighlighter>
      </div>

      {/* Typing feedback overlay */}
      <div
        className="preview-overlay"
        aria-label="code preview with typing feedback"
      >
        <pre>{createFeedbackOverlay()}</pre>
      </div>

      {/* Debug info (only in debug mode) */}
      {debugMode && (
        <div
          style={{
            position: "absolute",
            top: "8px",
            right: "8px",
            background: "rgba(0, 0, 0, 0.8)",
            color: "#fff",
            padding: "8px",
            borderRadius: "4px",
            fontSize: "12px",
            fontFamily: "monospace",
            zIndex: 10,
          }}
        >
          <div>Pos: {currentPosition}</div>
          <div>Text Len: {normalizedText.length}</div>
          <div>Input Len: {normalizedUserInput.length}</div>
          <div>Char: {normalizedText[currentPosition] || "END"}</div>
        </div>
      )}
    </div>
  );
};

export default Preview;
