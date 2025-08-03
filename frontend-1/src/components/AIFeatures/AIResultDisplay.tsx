import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AIResultDisplayProps {
  result: any;
  loading: boolean;
  error?: string;
  onClear: () => void;
}

const AIResultDisplay: React.FC<AIResultDisplayProps> = ({
  result,
  loading,
  error,
  onClear
}) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const formatResult = (data: any): string => {
    if (typeof data === 'string') return data;
    return JSON.stringify(data, null, 2);
  };

  // Move explanation state and handler to the main component
  const [explanations, setExplanations] = useState<{ [key: number]: string | null }>({});
  const [loadingIdx, setLoadingIdx] = useState<number | null>(null);

  const handleExplain = async (q: any, idx: number) => {
    setLoadingIdx(idx);
    setExplanations((prev) => ({ ...prev, [idx]: null }));
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3000/api/ai/explain-quiz-question', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ question: q.question, answer: q.answer }),
      });
      const data = await res.json();
      setExplanations((prev) => ({ ...prev, [idx]: data.explanation || 'No explanation found.' }));
    } catch (err) {
      setExplanations((prev) => ({ ...prev, [idx]: 'Failed to fetch explanation.' }));
    } finally {
      setLoadingIdx(null);
    }
  };

const renderSpecializedResult = (data: any): React.ReactNode => {
    // Prevent rendering React elements or arrays of React elements directly
    if (
      React.isValidElement(data) ||
      (Array.isArray(data) && data.every(React.isValidElement))
    ) {
      return (
        <div className="bg-red-50 rounded-lg p-4 border border-red-200 text-red-800">
          <strong>Error:</strong> Invalid data: attempted to render a React element or array of React elements as a child. Please check the API response or data structure.
        </div>
      );
    }


    
    // Handle flashcards
    if (Array.isArray(data) && data.length > 0 && data[0].question && data[0].answer) {
      return (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Generated Flashcards</h3>
          {data.map((card: any, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200"
            >
              <div className="mb-3">
                <span className="text-sm font-medium text-blue-600 uppercase tracking-wide">Question</span>
                <p className="text-gray-900 mt-1">{card.question}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-green-600 uppercase tracking-wide">Answer</span>
                <p className="text-gray-900 mt-1">{card.answer}</p>
              </div>
            </motion.div>
          ))}
        </div>
      );
    }

    // Handle quiz questions
    if (data.questions && Array.isArray(data.questions)) {
      return (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Generated Quiz</h3>
          {data.questions.map((q: any, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200"
            >
              <div className="mb-3">
                <span className="text-sm font-medium text-purple-600 uppercase tracking-wide">
                  Question {index + 1}
                </span>
                <p className="text-gray-900 mt-1 font-medium">{q.question}</p>
              </div>
              {q.options && (
                <div className="mb-3">
                  <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">Options</span>
                  <ul className="mt-1 space-y-1">
                    {q.options.map((option: string, optIndex: number) => (
                      <li key={optIndex} className="text-gray-700 ml-4">
                        {String.fromCharCode(65 + optIndex)}. {option}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div>
                <span className="text-sm font-medium text-green-600 uppercase tracking-wide">Answer</span>
                <p className="text-gray-900 mt-1 font-medium">{q.answer}</p>
              </div>
              <div className="mt-3">
                <button
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                  onClick={() => handleExplain(q, index)}
                  disabled={loadingIdx === index}
                >
                  {loadingIdx === index ? 'Loading...' : 'Explain'}
                </button>
                {explanations[index] && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded text-blue-900 text-sm">
                    <strong>Explanation:</strong>
                    <div className="mt-1 whitespace-pre-line">{explanations[index]}</div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      );
    }

    // Handle assignment feedback data
    if (data.feedback && typeof data.feedback === 'string') {
      const feedback = data.feedback;
      const sections = feedback.split('**').filter((section: string) => section.trim());
      
      return (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Assignment Feedback</h3>
          
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
            {sections.map((section: string, index: number) => {
              const lines = section.split('\n').filter((line: string) => line.trim());
              if (lines.length === 0) return null;
              
              const isHeader = lines[0] && !lines[0].startsWith('-') && !lines[0].startsWith('  -') && lines[0].includes(':');
              
              if (isHeader) {
                const header = lines[0].replace(':', '').trim();
                const content = lines.slice(1);
                
                return (
                  <div key={index} className="mb-6">
                    <h4 className="font-semibold text-blue-800 mb-3 text-lg">{header}</h4>
                    <div className="space-y-2">
                      {content.map((line: string, lineIndex: number) => {
                        const trimmedLine = line.trim();
                        if (!trimmedLine) return null;
                        
                        if (trimmedLine.startsWith('- **') && trimmedLine.includes(':**')) {
                          const subHeader = trimmedLine.replace('- **', '').replace(':**', '').trim();
                          return (
                            <h5 key={lineIndex} className="font-medium text-gray-800 mt-4 mb-2">{subHeader}</h5>
                          );
                        }
                        
                        if (trimmedLine.startsWith('  - ')) {
                          return (
                            <li key={lineIndex} className="text-gray-700 ml-6 list-disc">
                              {trimmedLine.replace('  - ', '')}
                            </li>
                          );
                        }
                        
                        if (trimmedLine.startsWith('- **') && trimmedLine.includes(':**')) {
                          return (
                            <h5 key={lineIndex} className="font-medium text-gray-800 mt-3 mb-2">
                              {trimmedLine.replace('- **', '').replace(':**', '')}
                            </h5>
                          );
                        }
                        
                        if (trimmedLine.match(/^\d+\./)) {
                          return (
                            <div key={lineIndex} className="flex items-start mt-2">
                              <span className="text-blue-600 font-semibold mr-2">
                                {trimmedLine.match(/^\d+/)?.[0]}.
                              </span>
                              <span className="text-gray-700">
                                {trimmedLine.replace(/^\d+\.\s*/, '')}
                              </span>
                            </div>
                          );
                        }
                        
                        return (
                          <p key={lineIndex} className="text-gray-700 leading-relaxed">
                            {trimmedLine}
                          </p>
                        );
                      })}
                    </div>
                  </div>
                );
              } else {
                return (
                  <div key={index} className="mb-4">
                    {lines.map((line: string, lineIndex: number) => {
                      const trimmedLine = line.trim();
                      if (!trimmedLine) return null;
                      
                      return (
                        <p key={lineIndex} className="text-gray-700 leading-relaxed mb-2">
                          {trimmedLine}
                        </p>
                      );
                    })}
                  </div>
                );
              }
            })}
          </div>
        </div>
      );
    }

// Handle smart study scheduler data
if (
  data.schedule !== undefined &&
  Array.isArray(data.recommendations) &&
  typeof data.recommendations[0] === "string" &&
  data.recommendations[0].includes("study_plan")
) {
  // Extract JSON code block and notes
  const rec = data.recommendations[0];
  // Match the code block (```json ... ```)
  const codeBlockMatch = rec.match(/```json\s*([\s\S]*?)```/);
  let studyData = null;
  if (codeBlockMatch) {
    try {
      studyData = JSON.parse(codeBlockMatch[1]);
    } catch (e) {
      console.error("Failed to parse study plan JSON:", e);
    }
  }
  // Extract notes after the code block
  const notesMatch = rec.split("```").slice(2).join("```").trim();
  // Split notes into lines, remove empty, and remove "**Notes:**" if present
  const notesLines = notesMatch
    .replace(/^\*\*Notes:\*\*\s*/, "")
    .split(/\n|  - /)
    .map((line) => line.replace(/^\s*-\s*/, "").trim())
    .filter((line) => line.length > 0);

  if (studyData && Array.isArray(studyData.study_plan)) {
    return (
      <div className="space-y-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Smart Study Schedule</h3>

        {/* Study Plan */}
        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-3">📅 Study Plan</h4>
          <div className="space-y-4">
            {studyData.study_plan.map((day: any, idx: number) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200"
              >
                <div className="flex items-center mb-3">
                  <span className="text-lg font-semibold text-green-700">
                    {new Date(day.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="space-y-3">
                  {day.blocks.map((block: any, blockIdx: number) => (
                    <div
                      key={blockIdx}
                      className={`rounded-md p-3 border ${
                        block.course === "Rest"
                          ? "bg-yellow-50 border-yellow-200"
                          : "bg-white border-gray-200"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-sm font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                          {block.time}
                        </span>
                        <span
                          className={`text-sm font-medium px-2 py-1 rounded capitalize ${
                            block.course === "Rest"
                              ? "text-yellow-700 bg-yellow-100"
                              : "text-purple-600 bg-purple-100"
                          }`}
                        >
                          {block.course}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">{block.task}</p>
                      {block.notes && (
                        <p className="text-gray-500 text-xs mt-1">{block.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Spaced Repetition & Wellness */}
        <div className="grid md:grid-cols-2 gap-6">
          {studyData.spaced_repetition && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">🔁 Spaced Repetition Strategy</h4>
              <p className="text-blue-700 text-sm mb-2">{studyData.spaced_repetition.strategy}</p>
              <ul className="list-disc ml-5 text-blue-700 text-sm">
                {studyData.spaced_repetition.tools.map((tool: string, i: number) => (
                  <li key={i}>{tool}</li>
                ))}
              </ul>
            </div>
          )}
          {studyData.wellness && (
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2">🌱 Wellness & Review</h4>
              <p className="text-green-700 text-sm mb-1">
                <strong>Breaks:</strong> {studyData.wellness.breaks}
              </p>
              <p className="text-green-700 text-sm">
                <strong>Review Sessions:</strong> {studyData.wellness.review_sessions}
              </p>
            </div>
          )}
        </div>

        {/* Notes */}
        {notesLines.length > 0 && (
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <h4 className="font-medium text-yellow-800 mb-2">📝 Notes</h4>
            <ul className="list-disc ml-5 text-yellow-700 text-sm">
              {notesLines.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }
}

    // Handle research assistant data
    if (data.outline && data.sources && data.writingTips && data.timeline) {
      return (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Research Plan</h3>
          
          {/* Outline Section */}
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-3">Research Outline</h4>
            <h5 className="text-lg font-medium text-gray-900 mb-4">{data.outline.title}</h5>
            <div className="space-y-4">
              {data.outline.sections.map((section: any, index: number) => (
                <div key={index} className="border-l-4 border-blue-300 pl-4">
                  <h6 className="font-medium text-gray-800 mb-2">{section.heading}</h6>
                  <ul className="space-y-1 text-sm text-gray-700">
                    {section.keyPoints.map((point: string, pointIndex: number) => (
                      <li key={pointIndex} className="flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-gray-500 mt-2">Suggested sources: {section.suggestedSources}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Sources Section */}
          <div className="bg-green-50 rounded-lg p-6 border border-green-200">
            <h4 className="font-semibold text-green-800 mb-3">Recommended Sources</h4>
            <div className="space-y-4">
              {data.sources.map((source: any, index: number) => (
                <div key={index} className="bg-white p-4 rounded border border-green-100">
                  <h6 className="font-medium text-gray-900 mb-2">{source.title}</h6>
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>Authors:</strong> {source.authors.join(', ')}
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>Year:</strong> {source.year} | <strong>Type:</strong> {source.type}
                  </p>
                  <p className="text-sm text-gray-700 mb-2 italic">{source.relevance}</p>
                  <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded font-mono">
                    {source.citation}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Writing Tips Section */}
          <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
            <h4 className="font-semibold text-purple-800 mb-3">Writing Tips</h4>
            <ul className="space-y-2">
              {data.writingTips.map((tip: string, index: number) => (
                <li key={index} className="flex items-start text-sm text-purple-700">
                  <span className="text-purple-500 mr-2 font-bold">{index + 1}.</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* Timeline Section */}
          <div className="bg-orange-50 rounded-lg p-6 border border-orange-200">
            <h4 className="font-semibold text-orange-800 mb-3">Project Timeline</h4>
            <div className="space-y-4">
              {data.timeline.map((phase: any, index: number) => (
                <div key={index} className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h6 className="font-medium text-gray-900">{phase.phase}</h6>
                    <p className="text-sm text-orange-600 mb-2">{phase.duration}</p>
                    <ul className="space-y-1">
                      {phase.tasks.map((task: string, taskIndex: number) => (
                        <li key={taskIndex} className="text-sm text-gray-700 flex items-start">
                          <span className="text-orange-400 mr-2">▸</span>
                          {task}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // Handle progress data
    if (data.strengths && data.weaknesses && data.recommendations) {
      return (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Progress Analysis</h3>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <h4 className="font-medium text-green-800 mb-2">Strengths</h4>
              <ul className="space-y-1">
                {data.strengths.map((strength: string, index: number) => (
                  <li key={index} className="text-green-700 text-sm">• {strength}</li>
                ))}
              </ul>
            </div>
            
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
              <h4 className="font-medium text-orange-800 mb-2">Areas to Improve</h4>
              <ul className="space-y-1">
                {data.weaknesses.map((weakness: string, index: number) => (
                  <li key={index} className="text-orange-700 text-sm">• {weakness}</li>
                ))}
              </ul>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-2">Recommendations</h4>
              <ul className="space-y-1">
                {data.recommendations.map((rec: string, index: number) => (
                  <li key={index} className="text-blue-700 text-sm">• {rec}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      );
    }

    // Handle expense tracking
    if (data.summary && data.insights && data.recommendations) {
      return (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Expense Analysis</h3>
          
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-gray-200">
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <span className="text-sm font-medium text-gray-600">Total Spent</span>
                <p className="text-2xl font-bold text-gray-900">${data.summary.totalSpent}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Budget Status</span>
                <p className={`text-lg font-semibold capitalize ${
                  data.summary.budgetStatus === 'over' ? 'text-red-600' :
                  data.summary.budgetStatus === 'under' ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {data.summary.budgetStatus.replace('_', ' ')}
                </p>
              </div>
            </div>
            
<div className="mb-4">
  <h4 className="font-medium text-gray-800 mb-2">Category Breakdown</h4>
  <div className="space-y-2">
    {Object.entries(data.summary.categoryBreakdown).map(([category, amount]) => (
      <div key={category} className="flex justify-between items-center">
        <span className="text-gray-700 capitalize">{category}</span>
        <span className="font-medium">${String(amount)}</span>
      </div>
    ))}
  </div>
</div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-2">Insights</h4>
              <ul className="space-y-1">
                {data.insights.map((insight: string, index: number) => (
                  <li key={index} className="text-blue-700 text-sm">• {insight}</li>
                ))}
              </ul>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <h4 className="font-medium text-purple-800 mb-2">Recommendations</h4>
              <ul className="space-y-1">
                {data.recommendations.map((rec: string, index: number) => (
                  <li key={index} className="text-purple-700 text-sm">• {rec}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      );
    }

    // Handle motivation coach response (single "message" property)
    if (
      data &&
      typeof data === "object" &&
      typeof data.message === "string" &&
      Object.keys(data).length === 1
    ) {
      // Split message into intro, tips, and outro
      const lines = data.message.split("\n").filter((l: string) => l.trim() !== "");
      const intro: string[] = [];
      const tips: string[] = [];
      const outro: string[] = [];
      let inTips = false;
      let inOutro = false;
      for (const line of lines) {
        if (/^\d+\.\s/.test(line)) {
          inTips = true;
        }
        if (inTips && !/^\d+\.\s/.test(line)) {
          inOutro = true;
        }
        if (!inTips && !inOutro) {
          intro.push(line);
        } else if (inTips && !inOutro && /^\d+\.\s/.test(line)) {
          tips.push(line);
        } else if (inOutro) {
          outro.push(line);
        }
      }
      return (
        <div className="bg-gradient-to-r from-yellow-50 to-pink-50 rounded-lg p-6 border border-yellow-200">
          <h3 className="text-lg font-semibold text-pink-800 mb-3">Motivation & Wellness</h3>
          {intro.length > 0 && (
            <div className="mb-4 text-gray-800 text-base whitespace-pre-line">
              {intro.map((p, i) => (
                <p key={i} className="mb-2">{p}</p>
              ))}
            </div>
          )}
          {tips.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium text-yellow-700 mb-2">Quick Tips</h4>
              <ul className="list-decimal ml-6 space-y-2">
                {tips.map((tip, i) => {
                  // Remove the number and parse markdown bold
                  const tipText = tip.replace(/^\d+\.\s*/, "");
                  // Render **bold** as <strong>
                  const parts = tipText.split(/(\*\*.*?\*\*)/g).map((part, idx) =>
                    part.startsWith("**") && part.endsWith("**") ? (
                      <strong key={idx} className="font-semibold">{part.replace(/\*\*/g, "")}</strong>
                    ) : (
                      <span key={idx}>{part}</span>
                    )
                  );
                  return <li key={i} className="text-gray-700">{parts}</li>;
                })}
              </ul>
            </div>
          )}
          {outro.length > 0 && (
            <div className="text-gray-700 text-base whitespace-pre-line">
              {outro.map((p, i) => (
                <p key={i} className="mb-2">{p}</p>
              ))}
            </div>
          )}
        </div>
      );
    }

    // If the result is an object with an "answer" property, show just the answer
    if (data && typeof data === "object" && typeof data.answer === "string") {
      return (
        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">AI Answer</h3>
          <p className="text-gray-900 text-base whitespace-pre-line">{data.answer}</p>
        </div>
      );
    }

    // If the result is a Markdown string (e.g., quiz in Markdown), render as plain text
    if (
      typeof data === "string" &&
      (data.includes("### Question") || data.includes("---") || data.includes("**Correct Answer:**"))
    ) {
      return (
        <div className="bg-white rounded-lg p-6 border border-blue-200">
          <pre className="whitespace-pre-wrap text-gray-800">{data}</pre>
        </div>
      );
    }

    // Default JSON display for other types
    return (
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <pre className="text-sm text-gray-800 whitespace-pre-wrap overflow-x-auto">
          {formatResult(data)}
        </pre>
      </div>
    );
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-xl shadow-lg p-8"
      >
        <div className="flex items-center justify-center space-x-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-lg text-gray-600">AI is thinking...</span>
        </div>
        <div className="mt-4 text-center text-sm text-gray-500">
          This may take a few moments
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-lg p-8"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={onClear}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </motion.div>
    );
  }

  if (!result) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 p-12 text-center"
      >
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Ready for AI Magic</h3>
        <p className="text-gray-500">Fill out the form and submit to see AI-generated results here</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg p-8"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">AI Results</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => copyToClipboard(formatResult(result))}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
          <button
            onClick={onClear}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {renderSpecializedResult(result as any)}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default AIResultDisplay;
