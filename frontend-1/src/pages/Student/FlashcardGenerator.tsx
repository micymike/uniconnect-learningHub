import React, { useState } from "react";

type Flashcard = {
  question: string;
  answer: string;
  explanation?: string;
};



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

  const generateFlashcards = async () => {
    setLoading(true);
    setError("");
    setFlashcards([]);
    try {
      let response;
      const token = localStorage.getItem("token") || "";
      console.log("Token sent to backend:", token);
      if (inputType === "file" && file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("numQuestions", numQuestions.toString());
        response = await fetch("https://uniconnect-learninghub-bc.onrender.com/api/ai/flashcards", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
          body: formData,
        });
      } else {
        response = await fetch("https://uniconnect-learninghub-bc.onrender.com/api/ai/flashcards", {
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
      const response = await fetch("https://uniconnect-learninghub-bc.onrender.com/api/ai/explain-flashcard", {
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

  return (
    <div className="min-h-screen w-full bg-black flex flex-col items-center px-2 sm:px-4 py-4 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-orange-400 mb-6 sm:mb-8 text-center">
        Flashcard Generator
      </h1>
      <div className="bg-gray-900 rounded-xl shadow-lg p-4 sm:p-6 w-full max-w-lg mb-8">
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <button
              className={`flex-1 py-2 rounded ${inputType === "text" ? "bg-orange-500 text-white" : "bg-gray-800 text-gray-300"}`}
              onClick={() => setInputType("text")}
            >
              Paste Text
            </button>
            <button
              className={`flex-1 py-2 rounded ${inputType === "file" ? "bg-orange-500 text-white" : "bg-gray-800 text-gray-300"}`}
              onClick={() => setInputType("file")}
            >
              Upload PDF/DOCX
            </button>
          </div>
          {inputType === "text" ? (
            <textarea
              className="w-full h-32 p-3 rounded bg-gray-800 text-white border border-gray-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 transition"
              placeholder="Paste your study material here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          ) : (
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          )}
          <div>
            <label className="block text-gray-300 mb-2">Number of Questions</label>
            <input
              type="number"
              min={1}
              max={50}
              value={numQuestions}
              onChange={(e) => setNumQuestions(Number(e.target.value))}
              className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
            />
          </div>
          <button
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded font-semibold transition mt-2"
            onClick={generateFlashcards}
            disabled={loading || (!text && !file)}
          >
            {loading ? "Generating..." : "Generate Flashcards"}
          </button>
          {error && (
            <div className="bg-red-900 text-red-300 p-2 rounded mt-2 text-center">{error}</div>
          )}
        </div>
      </div>
      <div className="w-full max-w-2xl">
        {flashcards.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-orange-400 mb-4 text-center">
              Generated Flashcards
            </h2>
            <div className="flex flex-col gap-6">
              {flashcards.map((fc, idx) => (
                <div key={idx} className="bg-white rounded-xl shadow p-4 flex flex-col">
                  <div className="font-semibold text-gray-900 mb-2">
                    Q{idx + 1}: {fc.question}
                  </div>
                  <div className="text-gray-700 mb-2">
                    <span className="font-bold">Answer:</span> {fc.answer}
                  </div>
                  <button
                    className="self-start bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded font-semibold text-xs sm:text-base"
                    onClick={() => explainFlashcard(idx)}
                  >
                    Explain
                  </button>
                  {fc.explanation && (
                    <div className="mt-2 p-3 bg-orange-50 text-orange-800 rounded text-sm">
                      {fc.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex flex-col items-center mt-6">
              <button
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded font-semibold text-base"
                onClick={() => setShowModal(true)}
              >
                Get More Questions
              </button>
            </div>
            {showModal && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xs flex flex-col items-center">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 text-center">
                    How many more questions would you like?
                  </h3>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={modalInput}
                    onChange={e => setModalInput(e.target.value)}
                    className="w-full p-2 rounded bg-gray-100 text-gray-900 border border-gray-300 mb-4"
                    disabled={modalLoading}
                  />
                  <div className="flex gap-2 w-full">
                    <button
                      className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded font-semibold"
                      disabled={modalLoading}
                      onClick={async () => {
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
                              response = await fetch("http://localhost:3004/api/ai/flashcards", {
                                method: "POST",
                                headers: {
                                  "Authorization": `Bearer ${token}`,
                                },
                                body: formData,
                              });
                            } else {
                              response = await fetch("http://localhost:3004/api/ai/flashcards", {
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
                      }}
                    >
                      {modalLoading ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                          </svg>
                          Adding...
                        </span>
                      ) : (
                        "Add"
                      )}
                    </button>
                    <button
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 py-2 rounded font-semibold"
                      disabled={modalLoading}
                      onClick={() => setShowModal(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
