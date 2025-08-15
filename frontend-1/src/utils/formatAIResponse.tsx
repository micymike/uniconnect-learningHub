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
 * Enhanced mathematical expression parser
 */
function parseMathExpressions(text: string): string {
  let processed = text;
  
  // Handle complex expressions that start with $ but aren't properly wrapped
  processed = processed.replace(/\$\[([^\]]+)\]/g, '$$[$1]$$');
  processed = processed.replace(/\$\{([^}]+)\}/g, '$$\\{$1\\}$$');
  
  // Handle expressions with parentheses and mathematical notation
  processed = processed.replace(/\$\(([^)]*(?:[+\-*/=^\\][^)]*)*)\)/g, '$$($1)$$');
  
  // Handle standalone mathematical expressions (more comprehensive)
  const mathPatterns = [
    // Expressions with equals signs
    /^([^:\n]*[a-zA-Z0-9\s]*[=][^:\n]*)$/gm,
    // Expressions with mathematical operators and parentheses
    /^([^:\n]*\([^)]*[+\-*/^][^)]*\)[^:\n]*)$/gm,
    // Expressions with exponents
    /^([^:\n]*[a-zA-Z0-9]+\^[^:\n]*)$/gm,
    // Expressions with multiplication symbols
    /^([^:\n]*[×\\times][^:\n]*)$/gm,
    // Expressions with division symbols
    /^([^:\n]*[÷\\div][^:\n]*)$/gm,
  ];
  
  mathPatterns.forEach(pattern => {
    processed = processed.replace(pattern, (match) => {
      // Don't format if it's already a heading, contains "Step", is very short, or contains apostrophes (likely a sentence)
      if (
        match.includes(':') ||
        match.includes('Step') ||
        match.includes('#') ||
        match.length < 3 ||
        match.includes("'") // skip lines with apostrophes
      ) {
        return match;
      }
      return `$$${match.trim()}$$`;
    });
  });
  
  return processed;
}

/**
 * Advanced text preprocessor for mathematical content
 */
function preprocessText(text: string): string {
  let processed = text;

  // Handle headings and structure first
  processed = processed.replace(/^(Question \d+:)$/gm, '# $1');
  processed = processed.replace(/^(Step \d+:.*?)$/gm, '## $1');
  processed = processed.replace(/^(Final Answer:)$/gm, '## $1');
  
  // Handle mathematical expressions
  processed = parseMathExpressions(processed);

  // Remove unwanted asterisks from math output (inside $$...$$)
  processed = processed.replace(/\$\$([^\$]+)\$\$/g, (match, mathContent) => {
    // Remove all asterisks (single or multiple) from math content
    const cleaned = mathContent.replace(/\*+/g, '');
    return `$$${cleaned}$$`;
  });

  // Fix specific mathematical notation issues
  processed = processed.replace(/\\\(/g, '(');
  processed = processed.replace(/\\\)/g, ')');
  processed = processed.replace(/\\\{/g, '\\{');
  processed = processed.replace(/\\\}/g, '\\}');
  
  // Handle expressions that should be inline vs block math
  processed = processed.replace(/\$\$([a-zA-Z0-9])\$\$/g, '$$$1$$'); // Single variables
  processed = processed.replace(/\$\$(\d+)\$\$/g, '$$$1$$'); // Single numbers
  
  // Handle complex expressions that were missed
  processed = processed.replace(/(\$[^$\n]*[+\-*/=^][^$\n]*\$)/g, '$$$1$$');
  
  // Clean up multiple dollar signs
  processed = processed.replace(/\$\$\$+/g, '$$');
  processed = processed.replace(/\$\$\$([^$]+)\$\$\$/g, '$$$1$$');
  
  // Ensure proper spacing around block equations
  processed = processed.replace(/(\$\$[^$\n]+\$\$)/g, '\n\n$1\n\n');
  
  // Clean up excessive whitespace
  processed = processed.replace(/\n{3,}/g, '\n\n');
  
  return processed.trim();
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

          // Enhanced heading styling for mathematical content
          h1: ({ children }) => (
            <h1 className="text-2xl md:text-3xl font-bold mb-6 mt-8 text-blue-600 dark:text-blue-400 border-b-2 border-blue-200 dark:border-blue-800 pb-3">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl md:text-2xl font-bold mb-4 mt-6 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border-l-4 border-green-500">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg md:text-xl font-semibold mb-3 mt-5 text-purple-600 dark:text-purple-400">
              {children}
            </h3>
          ),

          // Enhanced code blocks with syntax highlighting
          code: ({ node, inline, className, children, ...props }) => {
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
                    {...props}
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
                {...props}
              >
                {children}
              </code>
            );
          },

          // Enhanced lists with better spacing for mathematical steps
          ul: ({ children }) => (
            <ul className="mb-6 space-y-3 list-disc list-inside pl-4">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-6 space-y-3 list-decimal list-inside pl-4">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed text-base">{children}</li>
          ),

          // Enhanced tables
          table: ({ children }) => (
            <div className="overflow-x-auto my-6">
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

          // Enhanced math expressions with better styling
          div: ({ className, children, ...props }) => {
            if (className?.includes('math-display')) {
              return (
                <div className="my-6 p-6 bg-gradient-to-r from-indigo-50 via-blue-50 to-cyan-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 rounded-xl border-l-4 border-indigo-500 shadow-lg overflow-x-auto">
                  <div className={`${className} text-center text-lg md:text-xl`} {...props}>
                    {children}
                  </div>
                </div>
              );
            }
            return <div className={className} {...props}>{children}</div>;
          },

          // Inline math expressions
          span: ({ className, children, ...props }) => {
            if (className?.includes('math-inline')) {
              return (
                <span 
                  className={`${className} inline-block px-2 py-1 mx-1 bg-indigo-100 dark:bg-indigo-900/30 rounded-md text-indigo-800 dark:text-indigo-200 font-mono text-sm md:text-base shadow-sm`} 
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
 * Specialized formatter for mathematical step-by-step solutions
 */
export function formatMathSolution(text: string, theme: 'light' | 'dark' = 'dark'): React.ReactNode {
  // Enhanced preprocessing specifically for mathematical solutions
  let processed = text;
  
  // More aggressive mathematical expression detection
  const lines = processed.split('\n');
  const processedLines = lines.map(line => {
    const trimmedLine = line.trim();
    
    // Skip if it's already a heading or contains certain keywords
    if (trimmedLine.startsWith('#') || trimmedLine.includes('Step') || trimmedLine.includes('Question') || trimmedLine.includes('Answer:') || trimmedLine.length < 3) {
      return line;
    }
    
    // Check if line contains mathematical expressions
    if (/[=+\-*/^(){}[\]]/.test(trimmedLine) && !/^[A-Z][a-z]/.test(trimmedLine)) {
      // Wrap in math delimiters if not already wrapped
      if (!trimmedLine.startsWith('$$') && !trimmedLine.endsWith('$$')) {
        return `$$${trimmedLine}$$`;
      }
    }
    
    return line;
  });
  
  processed = processedLines.join('\n');
  
  // Additional cleanup for common issues
  processed = processed.replace(/\$\$\$\$/g, '$$');
  processed = processed.replace(/(\$\$[^$\n]+\$\$)/g, '\n\n$1\n\n');
  processed = processed.replace(/\n{3,}/g, '\n\n');
  
  return formatAIResponse(processed, { theme });
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

  const formatMathResponse = React.useCallback((text: string) => {
    return formatMathSolution(text, theme);
  }, [theme]);

  return { formatResponse, formatMathResponse };
}

// Export types for TypeScript users
export type { AIResponseFormatterProps };
