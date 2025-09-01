import React, { useState, useEffect, useRef } from "react";

// Type for a matching pair
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
  "https://uniconnect-learninghub-bc.onrender.com/api";

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

  // Upload state
  const [file, setFile] = useState<File | null>(null);
  const [noteName, setNoteName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch notes on mount
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

  // Fetch note content and generate pairs when a note is selected
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
        const filename = selectedNote.url.split('/').pop() || '';
        const ext = filename.split('.').pop()?.toLowerCase() || '';
        let noteText = "";

        if (["txt", "md"].includes(ext)) {
          // Fetch text content directly
          const res = await fetch(selectedNote.url);
          noteText = await res.text();
        } else {
          // For PDF/DOCX, send url to backend (backend should handle extraction)
          noteText = selectedNote.url;
        }

        // Call backend to get matching pairs
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

        // Prepare left (terms) and right (definitions) columns, shuffled
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

  // Handle card selection and matching
  useEffect(() => {
    if (selectedLeft !== null && selectedRight !== null) {
      let moveMade = false;
      const left = leftCards[selectedLeft];
      const right = rightCards[selectedRight];
      if (left.id === right.id) {
        // Match!
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
        // Not a match
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

  // Upload logic (from MyNotes)
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
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-blue-100 flex flex-col items-center py-8 px-2">
      <h1 className="text-3xl font-bold text-indigo-700 mb-2 text-center">Matching Game</h1>
      <p className="mb-2 text-gray-700 text-center">
        Select a note to play! Match questions (left) to answers (right). Fewer moves = higher score.
      </p>
      {/* New message about PDF notes */}
      <div className="mb-4 text-center text-indigo-900 font-medium">
        The games are generated from the PDF notes you upload below. Upload your notes to create new games!
      </div>
      {/* Upload Section */}
      <div className="w-full max-w-md mb-8 bg-white/80 rounded-xl shadow p-6 flex flex-col items-center">
        <h2 className="text-lg font-bold text-indigo-700 mb-4">Upload Note</h2>
        <input
          type="text"
          placeholder="Enter note name..."
          value={noteName}
          onChange={(e) => setNoteName(e.target.value)}
          className="w-full px-4 py-2 mb-3 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          disabled={uploading}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.txt,.md"
          className="w-full mb-3"
          onChange={(e) => {
            const selectedFile = e.target.files?.[0] || null;
            setFile(selectedFile);
            if (selectedFile && !noteName) {
              setNoteName(selectedFile.name.split('.')[0]);
            }
          }}
          disabled={uploading}
        />
        <button
          onClick={handleUpload}
          disabled={uploading || !file || !noteName.trim()}
          className={`w-full py-2 rounded-lg font-semibold transition-all duration-300 ${
            uploading || !file || !noteName.trim()
              ? "bg-indigo-200 text-indigo-400 cursor-not-allowed"
              : "bg-indigo-600 text-white hover:bg-indigo-700"
          }`}
        >
          {uploading ? "Uploading..." : "Upload Note"}
        </button>
        {uploadError && (
          <div className="mt-3 text-red-600 text-sm">{uploadError}</div>
        )}
        {uploadSuccess && (
          <div className="mt-3 text-green-600 text-sm">{uploadSuccess}</div>
        )}
      </div>
      {error && <div className="mb-4 text-red-600 font-semibold">{error}</div>}
      {/* Note selection */}
      <div className="mb-6 w-full max-w-2xl">
        {loadingNotes ? (
          <div className="text-lg text-gray-500">Loading your notes...</div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {notes.map((note) => (
              <button
                key={note.id}
                className={`px-4 py-2 rounded-lg font-semibold shadow transition-all ${
                  selectedNote?.id === note.id
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-indigo-700 hover:bg-indigo-100"
                }`}
                onClick={() => setSelectedNote(note)}
              >
                {note.name}
              </button>
            ))}
          </div>
        )}
      </div>
      {/* Game grid */}
      {loadingGame ? (
        <div className="text-lg text-gray-500">Loading game...</div>
      ) : selectedNote && pairs.length > 0 ? (
        <>
          <div className="mb-4 flex flex-col sm:flex-row gap-2 items-center">
            <span className="bg-white rounded px-3 py-1 shadow text-indigo-700 font-semibold">Moves: {moves}</span>
            <span className="bg-white rounded px-3 py-1 shadow text-pink-700 font-semibold">Score: {score}</span>
            {gameOver && (
              <button
                className="bg-green-500 text-white px-4 py-2 rounded-lg shadow hover:bg-green-600 font-bold"
                onClick={resetGame}
              >
                Play Again
              </button>
            )}
          </div>
          <div className="w-full max-w-4xl grid grid-cols-2 gap-4 mb-6">
            {/* Left: Questions/Terms */}
            <div>
              <h2 className="text-lg font-bold text-indigo-700 mb-2 text-center">Questions</h2>
              <div className="flex flex-col gap-2">
                {leftCards.map((card, idx) => (
                  <button
                    key={card.id}
                    className={`w-full py-3 rounded-lg shadow text-lg font-semibold transition-all duration-200
                      ${card.matched ? "bg-green-200 text-green-900" : card.selected ? "bg-indigo-300 text-indigo-900" : "bg-white text-indigo-700 hover:bg-indigo-100"}
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
                    {card.value}
                  </button>
                ))}
              </div>
            </div>
            {/* Right: Answers/Definitions */}
            <div>
              <h2 className="text-lg font-bold text-pink-700 mb-2 text-center">Answers</h2>
              <div className="flex flex-col gap-2">
                {rightCards.map((card, idx) => (
                  <button
                    key={card.id}
                    className={`w-full py-3 rounded-lg shadow text-lg font-semibold transition-all duration-200
                      ${card.matched ? "bg-green-200 text-green-900" : card.selected ? "bg-pink-200 text-pink-900" : "bg-white text-pink-700 hover:bg-pink-100"}
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
                    {card.value}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="h-8 text-center text-lg font-semibold text-indigo-600">{message}</div>
        </>
      ) : (
        <div className="text-gray-500 text-lg">Select a note to start the game.</div>
      )}
    </div>
  );
};

export default MatchingGame;
