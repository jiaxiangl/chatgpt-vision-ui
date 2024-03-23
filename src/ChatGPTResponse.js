import React from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";

const ChatGPTResponse = ({ markdownText }) => {
  // Convert Markdown to HTML
  const createMarkup = () => {
    const rawMarkup = marked(markdownText, { breaks: true });
    // Sanitize the rawMarkup to prevent XSS attacks.
    const sanitizedMarkup = DOMPurify.sanitize(rawMarkup);
    return { __html: sanitizedMarkup };
  };

  return <div dangerouslySetInnerHTML={createMarkup()} />;
};

export default ChatGPTResponse;
