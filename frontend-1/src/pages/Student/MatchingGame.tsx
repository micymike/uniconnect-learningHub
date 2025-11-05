import React, { useState, useEffect, useRef } from "react";
import { 
  Brain, Upload, FileText, Play, RotateCcw, Trophy, Target,
  Clock, Star, CheckCircle, X, Plus, Eye, Download, Trash2,
  BookOpen, Zap, Award, Gamepad2
} from 'lucide-react';

type Pair = {
  id: number;
  term: string;
  definition: string;
};

type Card = {
  id: number;
  value: string;
  type: "term" | "definition";
  matched: boolean;
  selected: boolean;
};

type Note = {
  id: string;
  name: string;
  url: string;
  uploadedAt: string;
  file_type?: string;
};

const api_url =
import.meta.env.VITE_API_URL ||
  "https://app.uniconnect-learninghub.co.ke/api";

const CELEBRATE = ["🎉", "👏", "🥳", "🏆", "💡"];

const shuffle = <T,>(array: T[]): T[] => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const MatchingGame: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [loadingGame, setLoadingGame] = useState(false);
  const [pairs, setPairs] = useState<Pair[]>([]);
  const [leftCards, setLeftCards] = useState<Card[]>([]);
  const [rightCards, setRightCards] = useState<Card[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [selectedRight, setSelectedRight] = useState<number | null>(null);
  const [matchedCount, setMatchedCount] = useState(0);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [file, setFile] = useState<File | null>(null);
  const [noteName, setNoteName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchNotes = async () => {
    setLoadingNotes(true);
    try {
      const token = localStorage.getItem("token") || "";
      const res = await fetch(`${api_url}/notes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch notes");
      const data = await res.json();
      const notes = (data.notes || []).map((n: any) => ({
        ...n,
        uploadedAt: n.uploaded_at,
      }));
      setNotes(notes);
    } catch (err: any) {
      setError(err.message || "Failed to load notes");
    } finally {
      setLoadingNotes(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  useEffect(() => {
    if (!selectedNote) return;
    const fetchPairs = async () => {
      setLoadingGame(true);
      setError("");
      setMessage("");
      setGameOver(false);
      setMatchedCount(0);
      setMoves(0);
      setPairs([]);
      setLeftCards([]);
      setRightCards([]);
      try {
        const token = localStorage.getItem("token") || "";
        let filename = "";
        let ext = "";
        let noteText = "";

        if (selectedNote.url) {
          filename = selectedNote.url.split('/').pop() || '';
          ext = filename.split('.').pop()?.toLowerCase() || '';
        }

        if (selectedNote.url && ["txt", "md"].includes(ext)) {
          const res = await fetch(selectedNote.url);
          noteText = await res.text();
        } else if (selectedNote.url) {
          noteText = selectedNote.url;
        } else {
          setError("Selected note is missing a valid URL.");
          setLoadingGame(false);
          return;
        }

        const res = await fetch(`${api_url}/ai/matching-pairs`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            text: noteText,
            numPairs: 8,
          }),
        });
        if (!res.ok) throw new Error("Failed to generate pairs from note");
        const data = await res.json();
        const pairs: Pair[] = (data.pairs || []).map((p: any, i: number) => ({
          id: i,
          term: p.term,
          definition: p.definition,
        }));
        setPairs(pairs);

        setLeftCards(shuffle(pairs.map((p) => ({
          id: p.id,
          value: p.term,
          type: "term",
          matched: false,
          selected: false,
        }))));
        setRightCards(shuffle(pairs.map((p) => ({
          id: p.id,
          value: p.definition,
          type: "definition",
          matched: false,
          selected: false,
        }))));
      } catch (err: any) {
        setError(err.message || "Failed to load game data.");
      } finally {
        setLoadingGame(false);
      }
    };
    fetchPairs();
  }, [selectedNote]);

  useEffect(() => {
    if (selectedLeft !== null && selectedRight !== null) {
      let moveMade = false;
      const left = leftCards[selectedLeft];
      const right = rightCards[selectedRight];
      if (left.id === right.id) {
        moveMade = true;
        const newLeft = leftCards.map((c, i) =>
          i === selectedLeft ? { ...c, matched: true, selected: false } : c
        );
        const newRight = rightCards.map((c, i) =>
          i === selectedRight ? { ...c, matched: true, selected: false } : c
        );
        setLeftCards(newLeft);
        setRightCards(newRight);
        setMatchedCount((count) => Math.min(count + 1, pairs.length));
        setScore((s) => s + 10);
        setMessage(CELEBRATE[Math.floor(Math.random() * CELEBRATE.length)] + " Match!");
      } else {
        moveMade = true;
        setTimeout(() => {
          setLeftCards((prev) =>
            prev.map((c, i) =>
              i === selectedLeft ? { ...c, selected: false } : c
            )
          );
          setRightCards((prev) =>
            prev.map((c, i) =>
              i === selectedRight ? { ...c, selected: false } : c
            )
          );
        }, 700);
        setMessage("Try again!");
      }
      if (moveMade) {
        setMoves((m) => m + 1);
      }
      setTimeout(() => {
        setSelectedLeft(null);
        setSelectedRight(null);
      }, 700);
    }
  }, [selectedLeft, selectedRight]);

  useEffect(() => {
    if (matchedCount === pairs.length && pairs.length > 0) {
      setGameOver(true);
      setMessage("You matched all pairs! " + CELEBRATE.join(" "));
    }
  }, [matchedCount, pairs.length]);

  const resetGame = () => {
    setMatchedCount(0);
    setScore(0);
    setMoves(0);
    setGameOver(false);
    setMessage("");
    setSelectedLeft(null);
    setSelectedRight(null);
    setLeftCards(shuffle(leftCards.map((c) => ({ ...c, matched: false, selected: false }))));
    setRightCards(shuffle(rightCards.map((c) => ({ ...c, matched: false, selected: false }))));
  };

  const handleUpload = async () => {
    setUploadError("");
    setUploadSuccess("");
    if (!file) {
      setUploadError("Please select a file.");
      return;
    }
    if (!noteName.trim()) {
      setUploadError("Please enter a note name.");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setUploadError("File size must be less than 3MB.");
      return;
    }
    setUploading(true);
    try {
      const token = localStorage.getItem("token") || "";
      const formData = new FormData();
      formData.append("file", file, file.name);
      formData.append("name", noteName.trim());
      formData.append("contentType", file.type || "application/octet-stream");
      formData.append("file_type", file.name.split('.').pop()?.toLowerCase() || "");

      const res = await fetch(`${api_url}/notes/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Upload failed");
      }

      setUploadSuccess("Note uploaded successfully!");
      setNoteName("");
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      await fetchNotes();
    } catch (err: any) {
      setUploadError(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4 py-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8 animate-fade-in-up">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center">
              <Brain className="text-orange-500 mr-3" />
              AI Matching Game
            </h1>
            <p className="text-gray-400 text-lg">Upload your notes and test your knowledge with AI-generated matching pairs!</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-gray-800/70 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 mb-6 animate-fade-in-up animation-delay-200">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-white">
                <Upload className="text-orange-500" />
                Upload Note
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-blue-400" />
                    Note name:
                  </label>
                  <input
                    type="text"
                    value={noteName}
                    onChange={(e) => setNoteName(e.target.value)}
                    placeholder="Enter note name..."
                    className="w-full p-3 bg-gray-900/50 border border-gray-700 text-white placeholder-gray-500 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                    disabled={uploading}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 flex items-center">
                    <Plus className="h-4 w-4 mr-2 text-green-400" />
                    Select file:
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.txt,.md"
                    className="w-full p-3 bg-gray-900/50 border border-gray-700 text-white rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-500 file:text-white hover:file:bg-orange-600 transition-all duration-300"
                    onChange={(e) => {
                      const selectedFile = e.target.files?.[0] || null;
                      setFile(selectedFile);
                      if (selectedFile && !noteName) {
                        setNoteName(selectedFile.name.split('.')[0]);
                      }
                    }}
                    disabled={uploading}
                  />
                </div>

                <button
                  onClick={handleUpload}
                  disabled={uploading || !file || !noteName.trim()}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3 px-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg shadow-orange-500/20"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Upload Note
                    </>
                  )}
                </button>

                {uploadError && (
                  <div className="text-red-400 text-sm bg-red-900/20 p-3 rounded-xl border border-red-500/30">
                    {uploadError}
                  </div>
                )}
                {uploadSuccess && (
                  <div className="text-green-400 text-sm bg-green-900/20 p-3 rounded-xl border border-green-500/30">
                    {uploadSuccess}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-800/70 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 animate-fade-in-up animation-delay-400">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-white">
                <BookOpen className="text-orange-500" />
                Your Notes
              </h2>
              
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {loadingNotes ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-3"></div>
                    <p className="text-gray-400">Loading notes...</p>
                  </div>
                ) : notes.map((note) => (
                  <div
                    key={note.id}
                    className={`p-3 border rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                      selectedNote?.id === note.id
                        ? 'border-orange-500 bg-orange-900/20'
                        : 'border-gray-700 hover:border-orange-400/50 bg-gray-700/30 hover:bg-gray-700/50'
                    }`}
                    onClick={() => setSelectedNote(note)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-white">{note.name}</h3>
                        <div className="flex items-center mt-2">
                          <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
                            <FileText className="h-3 w-3 inline mr-1" />
                            {note.file_type?.toUpperCase() || 'FILE'}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedNote(note);
                          }}
                          className={`p-1 transition-all duration-300 transform hover:scale-110 ${
                            selectedNote?.id === note.id
                              ? 'text-orange-500'
                              : 'text-gray-400 hover:text-orange-500'
                          }`}
                          title="Select for game"
                        >
                          <Play className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {(!notes || notes.length === 0) && !loadingNotes && (
                  <div className="text-gray-400 text-center py-8">
                    <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-600" />
                    <p>No notes yet. Upload your first one!</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            {selectedNote && !loadingGame && pairs.length > 0 ? (
              <div className="bg-gray-800/70 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 animate-fade-in-up animation-delay-300">
                <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                      <Gamepad2 className="text-orange-500" />
                      {selectedNote.name}
                    </h2>
                    <div className="flex items-center text-gray-400 mt-1">
                      <Target className="h-4 w-4 mr-1" />
                      <span className="mr-3">Match {pairs.length} pairs</span>
                      <Trophy className="h-4 w-4 mr-1" />
                      <span>Moves: {moves}</span>
                    </div>
                  </div>
                  <div className="flex flex-col xs:flex-row gap-2 w-full max-w-xs sm:max-w-none sm:flex-row sm:items-center sm:justify-end">
                    <div className="flex items-center gap-2 bg-purple-500/20 text-purple-300 px-4 py-2 rounded-xl">
                      <Star className="h-4 w-4" />
                      <span className="font-semibold">Score: {score}</span>
                    </div>
                    {gameOver && (
                      <button
                        onClick={resetGame}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 w-full sm:w-auto font-semibold transition-all duration-300 transform hover:scale-105"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Play Again
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
                      <Zap className="text-blue-400" />
                      Questions
                    </h3>
                    <div className="space-y-3">
                      {leftCards.map((card, idx) => (
                        <button
                          key={card.id}
                          className={`w-full p-4 rounded-xl text-left font-medium transition-all duration-300 transform hover:scale-105 shadow-lg
                            ${card.matched 
                              ? "bg-green-500/20 text-green-300 border-2 border-green-500/30 cursor-not-allowed" 
                              : card.selected 
                                ? "bg-blue-500/30 text-blue-200 border-2 border-blue-400 scale-105" 
                                : "bg-gray-700/50 text-white hover:bg-blue-500/20 border-2 border-gray-600 hover:border-blue-400/50"}
                          `}
                          disabled={card.matched || selectedLeft !== null || gameOver}
                          onClick={() => {
                            if (!card.matched && selectedLeft === null && !gameOver) {
                              setLeftCards((prev) =>
                                prev.map((c, i) =>
                                  i === idx ? { ...c, selected: true } : c
                                )
                              );
                              setSelectedLeft(idx);
                            }
                          }}
                        >
                          <div className="flex items-center gap-3">
                            {card.matched && <CheckCircle className="h-5 w-5 text-green-400" />}
                            <span className="flex-1">{card.value}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
                      <Award className="text-pink-400" />
                      Answers
                    </h3>
                    <div className="space-y-3">
                      {rightCards.map((card, idx) => (
                        <button
                          key={card.id}
                          className={`w-full p-4 rounded-xl text-left font-medium transition-all duration-300 transform hover:scale-105 shadow-lg
                            ${card.matched 
                              ? "bg-green-500/20 text-green-300 border-2 border-green-500/30 cursor-not-allowed" 
                              : card.selected 
                                ? "bg-pink-500/30 text-pink-200 border-2 border-pink-400 scale-105" 
                                : "bg-gray-700/50 text-white hover:bg-pink-500/20 border-2 border-gray-600 hover:border-pink-400/50"}
                          `}
                          disabled={card.matched || selectedRight !== null || selectedLeft === null || gameOver}
                          onClick={() => {
                            if (!card.matched && selectedRight === null && selectedLeft !== null && !gameOver) {
                              setRightCards((prev) =>
                                prev.map((c, i) =>
                                  i === idx ? { ...c, selected: true } : c
                                )
                              );
                              setSelectedRight(idx);
                            }
                          }}
                        >
                          <div className="flex items-center gap-3">
                            {card.matched && <CheckCircle className="h-5 w-5 text-green-400" />}
                            <span className="flex-1">{card.value}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {message && (
                  <div className="mt-6 text-center">
                    <div className={`inline-block px-6 py-3 rounded-xl font-bold text-lg ${
                      gameOver 
                        ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                        : matchedCount > 0 && message.includes('Match') 
                          ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                          : 'bg-gray-700/50 text-gray-300 border border-gray-600'
                    }`}>
                      {message}
                    </div>
                  </div>
                )}
              </div>
            ) : loadingGame ? (
              <div className="bg-gray-800/70 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-12 text-center animate-fade-in-up animation-delay-300">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold text-white mb-2">Generating Game...</h3>
                <p className="text-gray-400">AI is creating matching pairs from your note.</p>
              </div>
            ) : (
              <div className="bg-gray-800/70 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-12 text-center animate-fade-in-up animation-delay-300">
                <Gamepad2 className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Select a Note to Start</h3>
                <p className="text-gray-400">Choose a note from your collection to generate a matching game.</p>
              </div>
            )}

            {error && (
              <div className="mt-4 bg-red-900/20 border border-red-500/30 rounded-xl p-4 text-red-400 text-center">
                {error}
              </div>
            )}
          </div>
        </div>

        {loadingGame && (
          <div className="fixed inset-0 bg-black/70 flex flex-col items-center justify-center z-50 animate-fade-in">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mb-4"></div>
            <p className="text-white text-lg">Generating your matching game...</p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
          animation-fill-mode: both;
        }

        .animation-delay-300 {
          animation-delay: 0.3s;
          animation-fill-mode: both;
        }

        .animation-delay-400 {
          animation-delay: 0.4s;
          animation-fill-mode: both;
        }
      `}</style>
    </div>
  );
};

export default MatchingGame;
