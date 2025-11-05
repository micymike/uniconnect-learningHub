import React, { useState } from "react";
import { 
  Brain, Upload, FileText, Play, RotateCcw, Trophy, Target,
  Clock, Star, CheckCircle, X, Plus, Eye, Download, Trash2,
  BookOpen, Zap, Award, Gamepad2, MessageCircle, Lightbulb,
  Users, Timer, Flame, Save
} from 'lucide-react';
import Toast from "../../components/Toast";

type Flashcard = {
  question: string;
  answer: string;
  explanation?: string;
  saved?: boolean | "loading";
};

const api_url =
  import.meta.env.VITE_API_URL ||
"https://app.uniconnect-learninghub.co.ke/api";

const CELEBRATE = ["🎉", "👏", "🥳", "🏆", "💡"];

export default function FlashcardGenerator() {
  const [inputType, setInputType] = useState<"text" | "file">("text");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [numQuestions, setNumQuestions] = useState(5);
  const [loading, setLoading] = useState(false);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalInput, setModalInput] = useState("5");
  const [modalLoading, setModalLoading] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Save flashcard
  const saveFlashcard = async (idx: number) => {
    const fc = flashcards[idx];
    setFlashcards((prev) =>
      prev.map((f, i) =>
        i === idx ? { ...f, saved: "loading" } : f
      )
    );
    try {
      const token = localStorage.getItem("token") || "";
      const response = await fetch(`${api_url}/ai/save-flashcard`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          question: fc.question,
          answer: fc.answer,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to save flashcard");
      }
      setFlashcards((prev) =>
        prev.map((f, i) =>
          i === idx ? { ...f, saved: true } : f
        )
      );
      setToast({ type: "success", message: "Flashcard saved!" });
    } catch (err: any) {
      setFlashcards((prev) =>
        prev.map((f, i) =>
          i === idx ? { ...f, saved: false } : f
        )
      );
      setToast({ type: "error", message: err.message || "Failed to save flashcard" });
    }
  };

  // Game mode state
  const [gameMode, setGameMode] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [bonus, setBonus] = useState(0);
  const [checking, setChecking] = useState(false);
  const [answered, setAnswered] = useState(false);

  // Save score to backend when game ends
  React.useEffect(() => {
    const postScore = async () => {
      try {
        const token = localStorage.getItem("token") || "";
        const res = await fetch(`${api_url}/notes/flashcard-score`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            score: points,
            bonus,
            numQuestions: flashcards.length,
            timestamp: new Date().toISOString(),
          }),
        });
        // Optionally handle response
      } catch (err) {
        // Optionally handle error
      }
    };
    if (gameOver && points > 0 && flashcards.length > 0) {
      postScore();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameOver]);

  const generateFlashcards = async () => {
    setLoading(true);
    setError("");
    setFlashcards([]);
    try {
      let response;
      const token = localStorage.getItem("token") || "";
      if (inputType === "file" && file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("numQuestions", numQuestions.toString());
        response = await fetch(`${api_url}/ai/flashcards`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
          body: formData,
        });
      } else {
        response = await fetch(`${api_url}/ai/flashcards`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            text,
            numQuestions,
          }),
        });
      }
      if (!response.ok) {
        throw new Error("Failed to generate flashcards");
      }
      const data = await response.json();
      setFlashcards(data.flashcards || []);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const explainFlashcard = async (idx: number) => {
    setFlashcards((prev) =>
      prev.map((fc, i) =>
        i === idx
          ? { ...fc, explanation: "Loading explanation..." }
          : fc
      )
    );
    try {
      const token = localStorage.getItem("token") || "";
      const fc = flashcards[idx];
      const response = await fetch(`${api_url}/ai/explain-flashcard`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          question: fc.question,
          answer: fc.answer,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to get explanation");
      }
      const data = await response.json();
      setFlashcards((prev) =>
        prev.map((fc, i) =>
          i === idx
            ? { ...fc, explanation: data.explanation }
            : fc
        )
      );
    } catch (err: any) {
      setFlashcards((prev) =>
        prev.map((fc, i) =>
          i === idx
            ? { ...fc, explanation: err.message || "Error getting explanation" }
            : fc
        )
      );
    }
  };

  // Game logic
  const startGame = () => {
    setGameMode(true);
    setCurrentIdx(0);
    setPoints(0);
    setStreak(0);
    setFeedback("");
    setGameOver(false);
    setBonus(0);
    setUserAnswer("");
    setAnswered(false);
  };

  const submitAnswer = async () => {
    if (!gameMode || gameOver || checking || answered) return;
    setChecking(true);
    const fc = flashcards[currentIdx];
    let newPoints = points;
    let newStreak = streak;
    let newBonus = bonus;
    let aiCorrect = false;
    let aiFeedback = "";

    try {
      const token = localStorage.getItem("token") || "";
      const res = await fetch(`${api_url}/ai/check-flashcard-answer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          question: fc.question,
          answer: fc.answer,
          userAnswer,
        }),
      });
      if (!res.ok) throw new Error("AI answer check failed");
      const data = await res.json();
      aiCorrect = data.correct;
      aiFeedback = data.feedback || "";
    } catch (err) {
      aiCorrect = false;
      aiFeedback = "Could not check answer. Please try again.";
    }

    if (aiCorrect) {
      newPoints += 1;
      newStreak += 1;
      setFeedback(CELEBRATE[Math.floor(Math.random() * CELEBRATE.length)] + " Correct! +1 point");
      if (newStreak > 0 && newStreak % 5 === 0) {
        newPoints += 2;
        newBonus += 2;
        setFeedback(CELEBRATE[Math.floor(Math.random() * CELEBRATE.length)] + " Correct! +1 point (+2 streak bonus!)");
      }
    } else {
      setFeedback(aiFeedback ? `Incorrect. ${aiFeedback}` : "Incorrect. 0 points");
      newStreak = 0;
    }
    setPoints(newPoints);
    setStreak(newStreak);
    setBonus(newBonus);
    setAnswered(true);
    setChecking(false);
  };

  const nextQuestion = () => {
    if (currentIdx + 1 < flashcards.length) {
      setCurrentIdx(currentIdx + 1);
      setUserAnswer("");
      setFeedback("");
      setAnswered(false);
    } else {
      setGameOver(true);
    }
  };

  const resetGame = () => {
    setGameMode(false);
    setCurrentIdx(0);
    setUserAnswer("");
    setPoints(0);
    setStreak(0);
    setFeedback("");
    setGameOver(false);
    setBonus(0);
    setAnswered(false);
  };

  const handleAddMoreQuestions = async () => {
    const moreNum = Number(modalInput);
    if (!isNaN(moreNum) && moreNum > 0) {
      setModalLoading(true);
      try {
        let response;
        const token = localStorage.getItem("token") || "";
        if (inputType === "file" && file) {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("numQuestions", moreNum.toString());
          response = await fetch(`${api_url}/ai/flashcards`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${token}`,
            },
            body: formData,
          });
        } else {
          response = await fetch(`${api_url}/ai/flashcards`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({
              text,
              numQuestions: moreNum,
            }),
          });
        }
        if (!response.ok) {
          throw new Error("Failed to get more flashcards");
        }
        const data = await response.json();
        setFlashcards((prev) => [...prev, ...(data.flashcards || [])]);
        setShowModal(false);
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setModalLoading(false);
      }
    }
  };

  return (
    <div>
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4 py-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 animate-fade-in-up">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center">
              <Brain className="text-orange-500 mr-3" />
              AI Flashcard Generator
            </h1>
            <p className="text-gray-400 text-lg">Create intelligent flashcards from your content and test your knowledge!</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Section */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800/70 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 mb-6 animate-fade-in-up animation-delay-200">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-white">
                <Zap className="text-orange-500" />
                Generate Flashcards
              </h2>
              
              <div className="space-y-6">
                {/* Input Type Toggle */}
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-3 flex items-center">
                    <Target className="h-4 w-4 mr-2 text-blue-400" />
                    Content Source:
                  </label>
                  <div className="flex gap-2">
                    <button
                      className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                        inputType === "text" 
                          ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" 
                          : "bg-gray-700/50 text-gray-300 hover:bg-gray-700/70"
                      }`}
                      onClick={() => setInputType("text")}
                      disabled={gameMode}
                    >
                      <FileText className="h-4 w-4 inline mr-2" />
                      Text
                    </button>
                    <button
                      className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                        inputType === "file" 
                          ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" 
                          : "bg-gray-700/50 text-gray-300 hover:bg-gray-700/70"
                      }`}
                      onClick={() => setInputType("file")}
                      disabled={gameMode}
                    >
                      <Upload className="h-4 w-4 inline mr-2" />
                      File
                    </button>
                  </div>
                </div>

                {/* Content Input */}
                {inputType === "text" ? (
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 flex items-center">
                      <BookOpen className="h-4 w-4 mr-2 text-green-400" />
                      Study Material:
                    </label>
                    <textarea
                      className="w-full h-40 p-4 bg-gray-900/50 border border-gray-700 text-white placeholder-gray-500 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                      placeholder="Paste your study material here..."
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      disabled={gameMode}
                    />
                  </div>
                ) : (
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 flex items-center">
                      <Upload className="h-4 w-4 mr-2 text-purple-400" />
                      Upload File:
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="w-full p-3 bg-gray-900/50 border border-gray-700 text-white rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-500 file:text-white hover:file:bg-orange-600 transition-all duration-300"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      disabled={gameMode}
                    />
                  </div>
                )}

                {/* Number of Questions */}
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 flex items-center">
                    <MessageCircle className="h-4 w-4 mr-2 text-pink-400" />
                    Number of Questions:
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={numQuestions}
                    onChange={(e) => setNumQuestions(Number(e.target.value))}
                    className="w-full p-3 bg-gray-900/50 border border-gray-700 text-white placeholder-gray-500 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                    disabled={gameMode}
                  />
                </div>

                {/* Generate Button */}
                <button
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3 px-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg shadow-orange-500/20"
                  onClick={generateFlashcards}
                  disabled={loading || (!text && !file) || gameMode}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4" />
                      Generate Flashcards
                    </>
                  )}
                </button>

                {error && (
                  <div className="text-red-400 text-sm bg-red-900/20 p-3 rounded-xl border border-red-500/30">
                    {error}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            {/* Game Mode */}
            {gameMode && flashcards.length > 0 && (
              <div className="bg-gray-800/70 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 animate-fade-in-up animation-delay-300">
                <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                      <Gamepad2 className="text-orange-500" />
                      Flashcard Game
                    </h2>
                    <div className="flex items-center text-gray-400 mt-1">
                      <Timer className="h-4 w-4 mr-1" />
                      <span className="mr-4">Question {currentIdx + 1}/{flashcards.length}</span>
                      <Flame className="h-4 w-4 mr-1" />
                      <span>Streak: {streak}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 bg-purple-500/20 text-purple-300 px-4 py-2 rounded-xl">
                      <Star className="h-4 w-4" />
                      <span className="font-semibold">Score: {points}</span>
                    </div>
                    {bonus > 0 && (
                      <div className="flex items-center gap-2 bg-green-500/20 text-green-300 px-4 py-2 rounded-xl">
                        <Trophy className="h-4 w-4" />
                        <span className="font-semibold">Bonus: +{bonus}</span>
                      </div>
                    )}
                  </div>
                </div>

                {!gameOver ? (
                  <div className="space-y-6">
                    <div className="bg-gray-700/50 rounded-xl p-6 border border-gray-600">
                      <div className="font-semibold text-white mb-4 text-lg">
                        {flashcards[currentIdx].question}
                      </div>
                      <input
                        type="text"
                        className="w-full p-4 bg-gray-900/50 border border-gray-700 text-white placeholder-gray-500 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                        placeholder="Type your answer..."
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        disabled={answered || checking}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !answered && !checking) submitAnswer();
                        }}
                      />
                      <button
                        className="mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                        onClick={submitAnswer}
                        disabled={answered || checking || !userAnswer.trim()}
                      >
                        {checking ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline mr-2"></div>
                            Checking...
                          </>
                        ) : (
                          "Submit Answer"
                        )}
                      </button>
                    </div>

                    {feedback && (
                      <div className="text-center">
                        <div className={`inline-block px-6 py-3 rounded-xl font-bold text-lg ${
                          feedback.includes("Correct") 
                            ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                            : 'bg-red-500/20 text-red-300 border border-red-500/30'
                        }`}>
                          {feedback}
                        </div>
                      </div>
                    )}

                    {answered && !gameOver && (
                      <div className="text-center">
                        <button
                          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                          onClick={nextQuestion}
                        >
                          Next Question
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center space-y-6">
                    <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl p-8 border border-green-500/30">
                      <Trophy className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold text-white mb-4">Game Complete!</h3>
                      <div className="text-lg text-orange-400 mb-2">
                        Final Score: {points}
                      </div>
                      {bonus > 0 && (
                        <div className="text-md text-green-400 mb-4">
                          Streak Bonus: +{bonus}
                        </div>
                      )}
                      <button
                        className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                        onClick={resetGame}
                      >
                        <RotateCcw className="h-4 w-4 inline mr-2" />
                        Play Again
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Study Mode */}
            {flashcards.length > 0 && !gameMode && (
              <div className="bg-gray-800/70 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 animate-fade-in-up animation-delay-300">
                <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                      <BookOpen className="text-orange-500" />
                      Study Mode
                    </h2>
                    <p className="text-gray-400 mt-1">{flashcards.length} flashcards generated</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                      onClick={() => setShowModal(true)}
                    >
                      <Plus className="h-4 w-4 inline mr-2" />
                      More Questions
                    </button>
                    <button
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                      onClick={startGame}
                    >
                      <Play className="h-4 w-4 inline mr-2" />
                      Start Game
                    </button>
                  </div>
                </div>

                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                  {flashcards.map((fc, idx) => (
                    <div key={idx} className="bg-gray-700/30 rounded-xl p-4 border border-gray-600 transition-all duration-300 hover:bg-gray-700/50">
                      <div className="font-semibold text-white mb-3 flex items-start gap-2">
                        <MessageCircle className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                        <span>Q{idx + 1}: {fc.question}</span>
                      </div>
                      <div className="text-gray-300 mb-3 flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                        <span><span className="font-semibold">Answer:</span> {fc.answer}</span>
                      </div>
                      <div className="flex gap-2 mb-2">
                        <button
                          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                          onClick={() => explainFlashcard(idx)}
                        >
                          <Lightbulb className="h-4 w-4" />
                          Explain
                        </button>
                        <button
                          className={`bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 transform hover:scale-105 flex items-center gap-2 ${
                            fc.saved === true
                              ? "opacity-60 cursor-not-allowed"
                              : ""
                          }`}
                          onClick={() => saveFlashcard(idx)}
                          disabled={fc.saved === true || fc.saved === "loading"}
                        >
                          <Save className="h-4 w-4" />
                          {fc.saved === true
                            ? "Saved"
                            : fc.saved === "loading"
                            ? "Saving..."
                            : "Save"}
                        </button>
                      </div>
                      {fc.explanation && (
                        <div className="mt-4 p-4 bg-orange-500/10 border border-orange-500/20 text-orange-200 rounded-xl text-sm">
                          <div className="flex items-start gap-2">
                            <Eye className="h-4 w-4 text-orange-400 mt-0.5 flex-shrink-0" />
                            <span>{fc.explanation}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {flashcards.length === 0 && !loading && (
              <div className="bg-gray-800/70 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-12 text-center animate-fade-in-up animation-delay-300">
                <Brain className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Ready to Generate Flashcards</h3>
                <p className="text-gray-400">Enter your content and click generate to create AI-powered flashcards.</p>
              </div>
            )}
          </div>
        </div>

        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black/70 flex flex-col items-center justify-center z-50 animate-fade-in">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mb-4"></div>
            <p className="text-white text-lg">Generating your flashcards...</p>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-md border border-gray-700">
              <h3 className="text-xl font-semibold mb-4 text-white text-center flex items-center gap-2 justify-center">
                <Plus className="text-orange-500" />
                Add More Questions
              </h3>
              <div className="space-y-4">
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={modalInput}
                  onChange={e => setModalInput(e.target.value)}
                  className="w-full p-3 bg-gray-900/50 border border-gray-700 text-white placeholder-gray-500 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                  placeholder="Number of questions"
                  disabled={modalLoading}
                />
                <div className="flex gap-3">
                  <button
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={modalLoading}
                    onClick={handleAddMoreQuestions}
                  >
                    {modalLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline mr-2"></div>
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 inline mr-2" />
                        Add
                      </>
                    )}
                  </button>
                  <button
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
                    disabled={modalLoading}
                    onClick={() => setShowModal(false)}
                  >
                    <X className="h-4 w-4 inline mr-2" />
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      {/* Toast notification */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
    </div>
      </div>
  )
}
