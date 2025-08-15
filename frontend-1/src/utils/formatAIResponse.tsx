import React from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import "katex/dist/katex.min.css";

interface AIResponseFormatterProps {
  text: string;
  className?: string;
  theme?: 'light' | 'dark';
}

/**
 * Advanced AI response formatter with enhanced math, code, and text processing
 */
export function formatAIResponse(
  text: string, 
  options: { className?: string; theme?: 'light' | 'dark' } = {}
): React.ReactNode {
  const { className = "", theme = 'dark' } = options;

  // Preprocess the text to handle special cases
  const preprocessedText = preprocessText(text);

  const isDark = theme === 'dark';
  const baseClasses = `prose ${isDark ? 'prose-invert' : 'prose-slate'} max-w-none ${className}`;

  return (
    <div className={baseClasses}>
      <ReactMarkdown
        children={preprocessedText}
        remarkPlugins={[remarkMath, remarkGfm]}
        rehypePlugins={[rehypeKatex]}
        components={{
          // Paragraphs with better spacing
          p: ({ children }) => (
            <p className="mb-4 leading-relaxed text-sm md:text-base">
              {children}
            </p>
          ),

          // Headings with consistent styling
          h1: ({ children }) => (
            <h1 className="text-2xl md:text-3xl font-bold mb-4 mt-6 text-blue-600 dark:text-blue-400 border-b-2 border-blue-200 dark:border-blue-800 pb-2">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl md:text-2xl font-bold mb-3 mt-5 text-green-600 dark:text-green-400">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg md:text-xl font-semibold mb-2 mt-4 text-purple-600 dark:text-purple-400">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-base md:text-lg font-semibold mb-2 mt-3 text-gray-700 dark:text-gray-300">
              {children}
            </h4>
          ),

          // Enhanced code blocks with syntax highlighting
          code: (props) => {
            // Use the type from react-markdown for code blocks
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { inline, className, children, ...rest } = props as any;
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            
            if (!inline && language) {
              return (
                <div className="my-4 rounded-lg overflow-hidden shadow-lg">
                  <div className="bg-gray-800 text-gray-200 px-4 py-2 text-sm font-mono border-b border-gray-700">
                    {language.toUpperCase()}
                  </div>
                  <SyntaxHighlighter
                    style={vscDarkPlus}
                    language={language}
                    PreTag="div"
                    customStyle={{
                      margin: 0,
                      borderRadius: '0 0 0.5rem 0.5rem',
                      fontSize: '0.875rem',
                    }}
                    {...rest}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                </div>
              );
            }

            // Inline code
            return (
              <code
                className={`${isDark ? 'bg-gray-800 text-green-400' : 'bg-gray-100 text-red-600'} px-2 py-1 rounded-md text-sm font-mono`}
                {...rest}
              >
                {children}
              </code>
            );
          },

          // Enhanced lists
          ul: ({ children }) => (
            <ul className="mb-4 space-y-2 list-disc list-inside pl-4">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-4 space-y-2 list-decimal list-inside pl-4">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed">{children}</li>
          ),

          // Enhanced tables
          table: ({ children }) => (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-700">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-gray-100 dark:bg-gray-800">
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left font-semibold">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">
              {children}
            </td>
          ),

          // Enhanced blockquotes
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-blue-500 pl-4 py-2 my-4 bg-blue-50 dark:bg-blue-900/20 italic">
              {children}
            </blockquote>
          ),

          // Text formatting
          strong: ({ children }) => (
            <strong className="font-bold text-gray-900 dark:text-gray-100">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-gray-800 dark:text-gray-200">
              {children}
            </em>
          ),

          // Links
          a: ({ href, children }) => (
            <a
              href={href}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 underline transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),

          // Horizontal rules
          hr: () => (
            <hr className="my-6 border-gray-300 dark:border-gray-700" />
          ),

          // Enhanced Math expressions (handled by KaTeX)
          div: ({ className, children, ...props }) => {
            if (className?.includes('math-display')) {
              return (
                <div className="my-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-blue-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-800 shadow-lg overflow-x-auto">
                  <div className="flex items-center justify-center">
                    <div className={`${className} text-lg md:text-xl`} {...props}>
                      {children}
                    </div>
                  </div>
                </div>
              );
            }
            return <div className={className} {...props}>{children}</div>;
          },

          // Enhanced inline math styling
          span: ({ className, children, ...props }) => {
            if (className?.includes('math-inline')) {
              return (
                <span 
                  className={`${className} inline-block px-2 py-1 mx-1 bg-blue-100 dark:bg-blue-900/30 rounded-md border border-blue-200 dark:border-blue-700 text-blue-900 dark:text-blue-100 font-medium`} 
                  {...props}
                >
                  {children}
                </span>
              );
            }
            return <span className={className} {...props}>{children}</span>;
          },
        }}
      />
    </div>
  );
}

/**
 * Simple and precise mathematical formatting
 */
function preprocessText(text: string): string {
  let processed = text;

  // Step 1: Normalize line endings
  processed = processed.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Step 2: Handle step headings
  processed = processed.replace(/^(Step\s+\d+[:.]\s*.*?)$/gmi, '## $1');
  processed = processed.replace(/^(Final\s+Answer[:.]\s*.*?)$/gmi, '## $1');

  // Step 3: Handle boxed expressions
  processed = processed.replace(/\\boxed\s*\(([^)]+)\)/g, '$$\\boxed{$1}$$');
  processed = processed.replace(/boxed\s*\(([^)]+)\)/g, '$$\\boxed{$1}$$');

  // Step 4: Convert backtick expressions to math (only if they contain math symbols)
  processed = processed.replace(/`([^`]+)`/g, (match, content) => {
    // Only convert if it contains clear mathematical notation
    if (/[\^_=+\-*/(){}\\]|[a-zA-Z]\s*[=<>]|\d+\s*[a-zA-Z]|[a-zA-Z]\s*\d+/.test(content)) {
      // Check if it should be block or inline
      if (content.includes('=') && content.length > 10) {
        return `$$${content}$$`;
      } else {
        return `$${content}$`;
      }
    }
    return match; // Keep as code if not mathematical
  });

  // Step 5: Handle simple mathematical expressions on their own lines
  processed = processed.replace(/^([^$\n]*[=<>≤≥≠]\s*[^$\n]*)$/gm, (match) => {
    // Skip if already in math mode, is a heading, or too short
    if (match.includes('$') || match.match(/^#+\s/) || match.length < 5) {
      return match;
    }
    // Only convert if it looks like a mathematical equation
    if (/[a-zA-Z0-9]\s*[=<>≤≥≠]\s*[a-zA-Z0-9]/.test(match)) {
      return `$$${match.trim()}$$`;
    }
    return match;
  });

  // Step 6: Clean up math expressions - fix the broken $$$$1$$ pattern
  processed = processed.replace(/\$\$([^$]+)\$\$/g, (match, content) => {
    return `\n\n$$${content}$$\n\n`;
  });

  // Step 7: Handle basic mathematical symbols (only inside math blocks)
  processed = processed.replace(/\$\$([^$]+)\$\$/g, (match, content) => {
    let mathContent = content;
    mathContent = mathContent.replace(/\s*÷\s*/g, ' \\div ');
    mathContent = mathContent.replace(/\s*×\s*/g, ' \\times ');
    return `$$${mathContent}$$`;
  });

  // Step 8: Handle inline math symbols
  processed = processed.replace(/\$([^$]+)\$/g, (match, content) => {
    let mathContent = content;
    mathContent = mathContent.replace(/\s*÷\s*/g, ' \\div ');
    mathContent = mathContent.replace(/\s*×\s*/g, ' \\times ');
    return `$${mathContent}$`;
  });

  // Step 9: Remove asterisks from inside math expressions
  // Remove from block math
  processed = processed.replace(/\$\$([^$]+)\$\$/g, (match, content) => {
    return `$$${content.replace(/\*/g, '')}$$`;
  });
  // Remove from inline math
  processed = processed.replace(/\$([^$]+)\$/g, (match, content) => {
    return `$${content.replace(/\*/g, '')}$`;
  });

  // Step 10: Final cleanup
  processed = processed.replace(/\n{3,}/g, '\n\n'); // Limit excessive newlines
  processed = processed.replace(/\$\$\s*\$\$/g, ''); // Remove empty math blocks

  return processed.trim();
}

/**
 * Component wrapper for easy use in React applications
 */
export const AIResponseFormatter: React.FC<AIResponseFormatterProps> = ({ 
  text, 
  className = "",
  theme = 'dark' 
}) => {
  return (
    <div className={`ai-response-container ${className}`}>
      {formatAIResponse(text, { theme })}
    </div>
  );
};

/**
 * Hook for formatting AI responses with additional processing
 */
export function useAIResponseFormatter(theme: 'light' | 'dark' = 'dark') {
  const formatResponse = React.useCallback((text: string, className?: string) => {
    return formatAIResponse(text, { className, theme });
  }, [theme]);

  return { formatResponse };
}

// Export types for TypeScript users
export type { AIResponseFormatterProps };
