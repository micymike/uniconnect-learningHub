import React, { useState } from 'react';
import { CheckCircle, XCircle, RotateCcw, Trophy } from 'lucide-react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface AITeacherQuizProps {
  questions: QuizQuestion[];
  onComplete: (score: number, results: boolean[]) => void;
  darkMode?: boolean;
}

const AITeacherQuiz: React.FC<AITeacherQuizProps> = ({ questions, onComplete, darkMode = false }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      completeQuiz();
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const completeQuiz = () => {
    setQuizComplete(true);
    setShowResults(true);
    
    const results = questions.map((q, index) => 
      selectedAnswers[index] === q.correctAnswer
    );
    const score = results.filter(Boolean).length;
    
    onComplete(score, results);
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswers([]);
    setShowResults(false);
    setQuizComplete(false);
  };

  const getScoreColor = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (questions.length === 0) {
    return (
      <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
        <p className="text-center text-gray-500">No quiz questions available</p>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const score = showResults ? selectedAnswers.filter((answer, index) => 
    answer === questions[index].correctAnswer
  ).length : 0;

  return (
    <div className={`p-6 rounded-lg shadow-lg transition-colors ${
      darkMode ? 'bg-gray-800 text-white' : 'bg-white'
    }`}>
      {!quizComplete ? (
        <>
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Question {currentQuestion + 1} of {questions.length}
              </span>
              <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {Math.round(((currentQuestion + 1) / questions.length) * 100)}%
              </span>
            </div>
            <div className={`w-full bg-gray-200 rounded-full h-2 ${darkMode ? 'bg-gray-700' : ''}`}>
              <div 
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Question */}
          <div className="mb-6">
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              <Markdown remarkPlugins={[remarkGfm]}>
                {currentQ.question}
              </Markdown>
            </h3>

            {/* Answer Options */}
            <div className="space-y-3">
              {currentQ.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                    selectedAnswers[currentQuestion] === index
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                      : darkMode
                        ? 'border-gray-600 bg-gray-700 text-white hover:border-gray-500'
                        : 'border-gray-200 bg-gray-50 text-gray-900 hover:border-gray-300'
                  } ${darkMode && selectedAnswers[currentQuestion] === index ? 'bg-indigo-900/30 text-indigo-200' : ''}`}
                >
                  <div className="flex items-center">
                    <span className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center text-sm font-medium ${
                      selectedAnswers[currentQuestion] === index
                        ? 'border-indigo-500 bg-indigo-500 text-white'
                        : darkMode
                          ? 'border-gray-500 text-gray-400'
                          : 'border-gray-300 text-gray-500'
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </span>
                    <Markdown className="flex-1" remarkPlugins={[remarkGfm]}>
                      {option}
                    </Markdown>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={prevQuestion}
              disabled={currentQuestion === 0}
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentQuestion === 0
                  ? 'opacity-50 cursor-not-allowed'
                  : darkMode
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Previous
            </button>

            <button
              onClick={nextQuestion}
              disabled={selectedAnswers[currentQuestion] === undefined}
              className={`px-6 py-2 rounded-lg transition-colors ${
                selectedAnswers[currentQuestion] === undefined
                  ? 'opacity-50 cursor-not-allowed bg-gray-400'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {currentQuestion === questions.length - 1 ? 'Complete Quiz' : 'Next'}
            </button>
          </div>
        </>
      ) : (
        /* Results */
        <div className="text-center">
          <div className="mb-6">
            <Trophy className={`h-16 w-16 mx-auto mb-4 ${getScoreColor(score, questions.length)}`} />
            <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Quiz Complete!
            </h2>
            <p className={`text-xl ${getScoreColor(score, questions.length)}`}>
              Score: {score}/{questions.length} ({Math.round((score / questions.length) * 100)}%)
            </p>
          </div>

          {/* Detailed Results */}
          <div className="space-y-4 mb-6 text-left">
            {questions.map((question, index) => {
              const isCorrect = selectedAnswers[index] === question.correctAnswer;
              return (
                <div key={index} className={`p-4 rounded-lg border ${
                  isCorrect 
                    ? (darkMode ? 'border-green-600 bg-green-900/20' : 'border-green-200 bg-green-50')
                    : (darkMode ? 'border-red-600 bg-red-900/20' : 'border-red-200 bg-red-50')
                }`}>
                  <div className="flex items-start gap-3">
                    {isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 mt-1 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Question {index + 1}
                      </p>
                      <p className={`text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Your answer: {question.options[selectedAnswers[index]]}
                      </p>
                      {!isCorrect && (
                        <p className={`text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Correct answer: {question.options[question.correctAnswer]}
                        </p>
                      )}
                      {question.explanation && (
                        <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          <Markdown remarkPlugins={[remarkGfm]}>
                            {question.explanation}
                          </Markdown>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={resetQuiz}
            className="flex items-center gap-2 mx-auto px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            Retake Quiz
          </button>
        </div>
      )}
    </div>
  );
};

export default AITeacherQuiz;