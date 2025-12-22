import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

const Preview = ({
  text,
  userInput,
  cursorPosition,
  language = "javascript",
}) => {
  // Use actual cursor position if provided, otherwise fall back to input length
  // Ensure cursorPosition is a valid number
  const currentPosition =
    cursorPosition !== undefined && cursorPosition !== null
      ? Math.max(
          0,
          Math.min(cursorPosition, text ? text.replace(/\\n/g, "\n").length : 0)
        )
      : userInput
      ? userInput.length
      : 0;

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

  // Normalize text - convert \n to actual newlines
  const normalizedText = text ? text.replace(/\\n/g, "\n") : "";

  // Normalize userInput - ensure it matches the format of normalizedText
  const normalizedUserInput = userInput || "";

  // Create feedback spans that align with the code
  const createFeedbackOverlay = () => {
    if (!normalizedText) return null;

    const chars = normalizedText.split("");
    const feedback = [];

    chars.forEach((char, index) => {
      // ✅ Insert cursor BEFORE the character at currentPosition
      if (index === currentPosition) {
        feedback.push(
          <span
            key={`cursor-${index}`}
            className="preview__cursor"
            aria-hidden="true"
          />
        );
      }

      let className = "preview__char";

      if (index < normalizedUserInput.length) {
        const userChar = normalizedUserInput[index];
        className += char === userChar ? " correct" : " incorrect";
      }

      if (char === "\n") {
        feedback.push(
          <span key={`char-${index}`} className={className}>
            {"\n"}
          </span>
        );
      } else if (char === " ") {
        feedback.push(
          <span key={`char-${index}`} className={className}>
            {"\u00A0"}
          </span>
        );
      } else {
        feedback.push(
          <span key={`char-${index}`} className={className}>
            {char}
          </span>
        );
      }
    });

    // ✅ If caret is at the very end (after last char)
    if (currentPosition === normalizedText.length) {
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
        <pre
          style={{
            margin: 0,
            padding: "16px",
            fontFamily:
              'Monaco, Menlo, "Ubuntu Mono", Consolas, "source-code-pro", monospace',
            fontSize: "14px",
            lineHeight: "1.6",
            whiteSpace: "pre-wrap",
            wordWrap: "break-word",
            overflowWrap: "break-word",
            color: "transparent",
            overflow: "auto",
          }}
        >
          {createFeedbackOverlay()}
        </pre>
      </div>
    </div>
  );
};

export default Preview;
