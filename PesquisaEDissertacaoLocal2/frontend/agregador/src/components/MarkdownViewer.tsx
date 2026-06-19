'use client'; // Required if using Next.js's app directory

import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

// Define the props type for the component
interface MarkdownViewerProps {
  content: string; // The Markdown content to be rendered
}

const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ content }) => {
  return (
    <div className="markdown">
      {/* Render Markdown content */}
      <ReactMarkdown remarkPlugins={[remarkGfm]}
                     rehypePlugins={[rehypeRaw]}>{content}</ReactMarkdown>
    </div>
  );
};

export default MarkdownViewer;
