import React, { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "https://app.uniconnect-learninghub.co.ke/api";

type QuizQuestion = {
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
};

export default function SmartQuizGenerator() {
  const [notes, setNotes] = useState<string[]>([]);
  const [quizHistory, setQuizHistory] = useState<any[]>([]);
  const [numQuestions, setNumQuestions] = useState(5);
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [error, setError] = useState("");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);

  // For demo: allow user to paste notes and quiz history as JSON
  const [notesInput, setNotesInput] = useState("");
  const [quizHistoryInput, setQuizHistoryInput] = useState("");

  const handleGenerateQuiz = async () => {
    setLoading(true);
    setError("");
    setQuiz([]);
    setShowResults(false);
    setCurrentIdx(0);
    setUserAnswers([]);
    try {
      const token = localStorage.getItem("token") || "";
      const response = await fetch(`${API_URL}/ai/generate-quiz`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          notes,
          quizHistory,
          numQuestions,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to generate quiz");
      }
      const data = await response.json();
      setQuiz(data.quiz || []);
      setUserAnswers(Array((data.quiz || []).length).fill(""));
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (idx: number, value: string) => {
    setUserAnswers((prev) => {
      const updated = [...prev];
      updated[idx] = value;
      return updated;
    });
  };

  const handleNext = () => {
    if (currentIdx + 1 < quiz.length) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setShowResults(true);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  // For demo: parse notes and quiz history from textarea
  const handleParseInputs = () => {
    try {
      setNotes(JSON.parse(notesInput));
    } catch {
      setNotes([notesInput]);
    }
    try {
      setQuizHistory(JSON.parse(quizHistoryInput));
    } catch {
      setQuizHistory([]);
    }
  };

  return (
    <div className="min-h-screen w-full bg-black flex flex-col items-center px-2 sm:px-4 py-4 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-orange-400 mb-6 sm:mb-8 text-center">
        Smart Quiz Generator
      </h1>
      <div className="bg-gray-900 rounded-xl shadow-lg p-4 sm:p-6 w-full max-w-lg mb-8">
        <div className="flex flex-col gap-4">
          <label className="text-gray-300 font-semibold">Paste Your Notes (or JSON array):</label>
          <textarea
            className="w-full h-24 p-2 rounded bg-gray-800 text-white border border-gray-700"
            value={notesInput}
            onChange={(e) => setNotesInput(e.target.value)}
            placeholder='["Note 1", "Note 2", ...] or plain text'
          />
          <label className="text-gray-300 font-semibold">Paste Quiz History (JSON array, optional):</label>
          <textarea
            className="w-full h-16 p-2 rounded bg-gray-800 text-white border border-gray-700"
            value={quizHistoryInput}
            onChange={(e) => setQuizHistoryInput(e.target.value)}
            placeholder='[{"question": "...", "correct": false}, ...]'
          />
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold"
            onClick={handleParseInputs}
          >
            Use Inputs
          </button>
          <label className="text-gray-300 font-semibold">Number of Questions</label>
          <input
            type="number"
            min={1}
            max={20}
            value={numQuestions}
            onChange={(e) => setNumQuestions(Number(e.target.value))}
            className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
          />
          <button
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded font-semibold transition mt-2"
            onClick={handleGenerateQuiz}
            disabled={loading || notes.length === 0}
          >
            {loading ? "Generating..." : "Generate Smart Quiz"}
          </button>
          {error && (
            <div className="bg-red-900 text-red-300 p-2 rounded mt-2 text-center">{error}</div>
          )}
        </div>
      </div>
      <div className="w-full max-w-2xl">
        {quiz.length > 0 && !showResults && (
          <div className="mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-orange-400 mb-4 text-center">
              Quiz Question {currentIdx + 1} of {quiz.length}
            </h2>
            <div className="bg-white rounded-xl shadow p-4 flex flex-col">
              <div className="font-semibold text-gray-900 mb-2">
                {quiz[currentIdx].question}
              </div>
              <div className="flex flex-col gap-2">
                {quiz[currentIdx].options.map((opt, i) => (
                  <label key={i} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`q${currentIdx}`}
                      value={opt}
                      checked={userAnswers[currentIdx] === opt}
                      onChange={() => handleAnswer(currentIdx, opt)}
                      className="accent-orange-500"
                    />
                    <span className="text-gray-800">{opt}</span>
                  </label>
                ))}
              </div>
              <div className="flex justify-between mt-4">
                <button
                  className="bg-gray-300 hover:bg-gray-400 text-gray-900 px-4 py-2 rounded font-semibold"
                  onClick={handlePrev}
                  disabled={currentIdx === 0}
                >
                  Previous
                </button>
                <button
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-semibold"
                  onClick={handleNext}
                  disabled={!userAnswers[currentIdx]}
                >
                  {currentIdx + 1 === quiz.length ? "Finish" : "Next"}
                </button>
              </div>
            </div>
          </div>
        )}
        {showResults && (
          <div className="mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-green-400 mb-4 text-center">
              Quiz Results
            </h2>
            <div className="flex flex-col gap-6">
              {quiz.map((q, idx) => (
                <div key={idx} className="bg-white rounded-xl shadow p-4 flex flex-col">
                  <div className="font-semibold text-gray-900 mb-2">
                    Q{idx + 1}: {q.question}
                  </div>
                  <div className="mb-2">
                    <span className="font-bold">Your Answer:</span>{" "}
                    <span className={userAnswers[idx] === q.answer ? "text-green-600" : "text-red-600"}>
                      {userAnswers[idx] || "No answer"}
                    </span>
                  </div>
                  <div className="mb-2">
                    <span className="font-bold">Correct Answer:</span> {q.answer}
                  </div>
                  {q.explanation && (
                    <div className="mt-2 p-3 bg-orange-50 text-orange-800 rounded text-sm">
                      {q.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <button
              className="mt-6 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded font-semibold text-base"
              onClick={() => {
                setQuiz([]);
                setShowResults(false);
                setCurrentIdx(0);
                setUserAnswers([]);
              }}
            >
              Take Another Quiz
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
