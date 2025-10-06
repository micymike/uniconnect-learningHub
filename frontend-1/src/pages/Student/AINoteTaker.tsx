import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import 'boxicons/css/boxicons.min.css';

const API_URL = import.meta.env.VITE_API_URL || "https://uniconnect-learninghub-backend.onrender.com/api";

// Web Speech API types
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

function SaveGeneratedNoteButton({ noteName, noteContent }: { noteName: string, noteContent: string }) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [timestamp, setTimestamp] = useState<string | null>(null);
  const [finalName, setFinalName] = useState<string>(noteName);

  // Generate a relevant note name from content if user leaves it blank
  function generateRelevantName(content: string) {
    if (!content) return "Untitled Note";
    // Try to get the first sentence, or first 8 words if no punctuation
    let firstSentence = content.split(/[.?!\n]/)[0];
    if (!firstSentence || firstSentence.trim().length < 3) {
      firstSentence = content.trim();
    }
    // Limit to 8 words max for brevity
    let words = firstSentence.trim().split(/\s+/).slice(0, 8).join(" ");
    // Capitalize first letter, remove trailing punctuation
    words = words.charAt(0).toUpperCase() + words.slice(1);
    words = words.replace(/[\W_]+$/, "");
    return words.length > 0 ? words : "Untitled Note";
  }

  const handleSave = async () => {
    setSaving(true);
    setError('');
    let nameToUse = noteName && noteName.trim() ? noteName.trim() : generateRelevantName(noteContent);
    setFinalName(nameToUse);
    try {
      const token = localStorage.getItem('token') || '';
      const now = new Date();
      setTimestamp(now.toLocaleString());
      const response = await fetch(`${API_URL}/notes/save-generated`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          noteName: nameToUse,
          content: noteContent,
          timestamp: now.toISOString(),
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save note');
      }
      setSaved(true);
    } catch (err: any) {
      setError(err.message || 'Failed to save note');
    } finally {
      setSaving(false);
    }
  };



  return (
    <div className="mt-6 flex flex-col items-center">
      <button
        onClick={handleSave}
        disabled={saving || saved}
        className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-2 ${
          saving || saved
            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg transform hover:scale-105'
        }`}
      >
        {saving ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Saving...</span>
          </>
        ) : saved ? (
          <>
            <i className="bx bx-check text-xl"></i>
            <span>Saved</span>
          </>
        ) : (
          <>
            <i className="bx bx-save text-xl"></i>
            <span>Save Note</span>
          </>
        )}
      </button>
      {saved && timestamp && (
        <div className="mt-3 text-sm text-green-400">
          Saved at {timestamp} <br />
          <span className="font-bold text-white">Note Name:</span> {finalName}
        </div>
      )}
      {error && (
        <div className="mt-3 text-sm text-red-400">{error}</div>
      )}
    </div>
  );
}

export default function AINoteTaker() {
  // Modal state for viewing a note
  const [modalNote, setModalNote] = useState<any | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [noteName, setNoteName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [transcription, setTranscription] = useState('');
  const [structuredNotes, setStructuredNotes] = useState('');
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const transcriptRef = useRef<string>('');

  useEffect(() => {
    // Check if Web Speech API is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      setError('Speech recognition not supported in this browser. Please use Chrome, Edge, or Safari.');
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (modalNote) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'auto';
      };
    }
  }, [modalNote]);

  const startRecording = async () => {
    if (!isSupported) {
      setError('Speech recognition not supported in this browser.');
      return;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognitionRef.current = recognition;
      transcriptRef.current = '';
      setTranscription('');
      
      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }
        
        transcriptRef.current += finalTranscript;
        setTranscription(transcriptRef.current + interimTranscript);
      };
      
      recognition.onerror = (event: any) => {
        setError(`Speech recognition error: ${event.error}`);
        setIsRecording(false);
        if (timerRef.current) clearInterval(timerRef.current);
      };
      
      recognition.onend = () => {
        if (isRecording && !isPaused) {
          // Restart recognition if it stops unexpectedly
          recognition.start();
        }
      };
      
      recognition.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (err) {
      setError('Failed to start speech recognition. Please check microphone permissions.');
    }
  };

  const pauseRecording = () => {
    if (recognitionRef.current && isRecording) {
      if (isPaused) {
        recognitionRef.current.start();
        timerRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
      } else {
        recognitionRef.current.stop();
        if (timerRef.current) clearInterval(timerRef.current);
      }
      setIsPaused(!isPaused);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (timerRef.current) clearInterval(timerRef.current);
      setTranscription(transcriptRef.current);
    }
  };

  const processRecording = async () => {
    if (!transcription.trim() || !noteName.trim()) {
      setError('Please provide a note name and record some speech.');
      return;
    }

    setIsProcessing(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token') || '';
      const response = await fetch(`${API_URL}/notes/save-transcription`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcription: transcription.trim(),
          noteName: noteName.trim()
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to process transcription');
      }

      const result = await response.json();
      setStructuredNotes(result.structuredNotes);
      setSuccess('Notes generated and saved successfully!');
      
      // Reset form
      setNoteName('');
      setRecordingTime(0);

    } catch (err: any) {
      setError(err.message || 'Failed to process transcription');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const clearRecording = () => {
    setRecordingTime(0);
    setTranscription('');
    setStructuredNotes('');
    setError('');
    setSuccess('');
    transcriptRef.current = '';
  };

  // --- Notes List State and Fetch ---
  const [notes, setNotes] = useState<any[]>([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesError, setNotesError] = useState('');

  const fetchNotes = async () => {
    setNotesLoading(true);
    setNotesError('');
    try {
      const token = localStorage.getItem('token') || '';
      const res = await fetch(`${API_URL}/notes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch notes");
      const data = await res.json();
      setNotes(data.notes || []);
    } catch (err: any) {
      setNotesError(err.message || "Failed to load notes");
    } finally {
      setNotesLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  // Optionally, refresh notes after saving a new one
  // (You can pass fetchNotes to SaveGeneratedNoteButton and call after save if desired)

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 px-4 py-6">
      {/* Header */}
      <div className="mb-8 animate-fade-in-up">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center">
          <i className="bx bx-microphone text-green-500 mr-3"></i>
          AI Note Taker
        </h1>
        <p className="text-gray-400 text-lg">Record lectures and let AI generate structured notes for you</p>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recording Section */}
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center">
              <i className="bx bx-radio-circle-marked text-red-500 mr-2"></i>
              Recording Studio
            </h2>

            {/* Note Name Input */}
            <div className="mb-6">
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Note Name
              </label>
              <input
                type="text"
                placeholder="e.g., Physics Lecture - Chapter 5"
                value={noteName}
                onChange={(e) => setNoteName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500 focus:ring-opacity-20 transition-all"
                disabled={isRecording || isProcessing}
              />
            </div>

            {/* Recording Controls */}
            <div className="text-center mb-6">
              <div className="bg-gray-900 rounded-2xl p-8 mb-6">
                <div className="text-6xl font-mono text-green-400 mb-4">
                  {formatTime(recordingTime)}
                </div>
                
                {isRecording && (
                  <div className="flex items-center justify-center space-x-2 text-red-400">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">
                      {isPaused ? 'PAUSED' : 'RECORDING'}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-center space-x-4">
                {!isRecording && !transcription && (
                  <button
                    onClick={startRecording}
                    disabled={isProcessing || !isSupported}
                    className={`px-8 py-4 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 shadow-lg ${
                      isProcessing || !isSupported
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                  >
                    <i className="bx bx-microphone text-xl"></i>
                    <span>Start Recording</span>
                  </button>
                )}

                {isRecording && (
                  <>
                    <button
                      onClick={pauseRecording}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-4 rounded-full font-semibold transition-all duration-300 flex items-center space-x-2"
                    >
                      <i className={`bx ${isPaused ? 'bx-play' : 'bx-pause'} text-xl`}></i>
                      <span>{isPaused ? 'Resume' : 'Pause'}</span>
                    </button>
                    
                    <button
                      onClick={stopRecording}
                      className="bg-red-500 hover:bg-red-600 text-white px-6 py-4 rounded-full font-semibold transition-all duration-300 flex items-center space-x-2"
                    >
                      <i className="bx bx-stop text-xl"></i>
                      <span>Stop</span>
                    </button>
                  </>
                )}

                {transcription && !isRecording && (
                  <>
                    <button
                      onClick={processRecording}
                      disabled={isProcessing || !noteName.trim()}
                      className={`px-8 py-4 rounded-full font-semibold transition-all duration-300 flex items-center space-x-2 ${
                        isProcessing || !noteName.trim()
                          ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          : 'bg-blue-500 hover:bg-blue-600 text-white transform hover:scale-105 shadow-lg'
                      }`}
                    >
                      {isProcessing ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <i className="bx bx-brain text-xl"></i>
                          <span>Generate Notes</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={clearRecording}
                      disabled={isProcessing}
                      className="bg-gray-600 hover:bg-gray-500 text-white px-6 py-4 rounded-full font-semibold transition-all duration-300 flex items-center space-x-2"
                    >
                      <i className="bx bx-trash text-xl"></i>
                      <span>Clear</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Messages */}
            {error && (
              <div className="bg-red-900 border border-red-700 text-red-300 px-4 py-3 rounded-xl flex items-center mb-4">
                <i className="bx bx-error-circle mr-2"></i>
                <span className="text-sm">{error}</span>
              </div>
            )}
            
            {success && (
              <div className="bg-green-900 border border-green-700 text-green-300 px-4 py-3 rounded-xl flex items-center mb-4">
                <i className="bx bx-check-circle mr-2"></i>
                <span className="text-sm">{success}</span>
              </div>
            )}
          </div>

          {/* Results Section */}
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center">
              <i className="bx bx-file-blank text-blue-500 mr-2"></i>
              Generated Notes
            </h2>

            {!transcription && !structuredNotes && (
              <div className="text-center py-12">
                <i className="bx bx-note text-6xl text-gray-600 mb-4"></i>
                <h3 className="text-xl font-semibold text-white mb-2">No notes yet</h3>
                <p className="text-gray-400">Start recording speech to see live transcription and generate AI notes</p>
              </div>
            )}

            {/* Live Transcription Display */}
            {transcription && !structuredNotes && (
              <div className="bg-gray-900 rounded-xl p-4 border border-gray-600">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                  <i className="bx bx-microphone text-orange-500 mr-2"></i>
                  Live Transcription
                </h3>
                <div className="bg-gray-800 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {transcription || 'Listening...'}
                  </p>
                </div>
              </div>
            )}

{structuredNotes && (
  <div className="space-y-4">
    <div className="bg-gray-900 rounded-xl p-4 border border-gray-600">
      <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
        <i className="bx bx-brain text-green-500 mr-2"></i>
        AI Generated Notes
      </h3>
      <div className="bg-gray-800 rounded-lg p-4 max-h-96 overflow-y-auto prose prose-invert prose-sm">
        <ReactMarkdown>
          {structuredNotes}
        </ReactMarkdown>
      </div>
      {/* Save Button and Timestamp */}
      <SaveGeneratedNoteButton
        noteName={noteName}
        noteContent={structuredNotes}
      />
    </div>

    {transcription && (
      <details className="bg-gray-900 rounded-xl border border-gray-600">
        <summary className="p-4 cursor-pointer text-white font-medium flex items-center">
          <i className="bx bx-microphone text-orange-500 mr-2"></i>
          View Raw Transcription
        </summary>
        <div className="px-4 pb-4">
          <div className="bg-gray-800 rounded-lg p-4 max-h-64 overflow-y-auto">
            <p className="text-gray-400 text-sm leading-relaxed">
              {transcription}
            </p>
          </div>
        </div>
      </details>
    )}
  </div>
)}
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-8 bg-gray-800 rounded-2xl p-6 border border-gray-700">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center">
            <i className="bx bx-bulb text-yellow-500 mr-2"></i>
            Tips for Better Results
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300 text-sm">
            <div className="flex items-start space-x-2">
              <i className="bx bx-check text-green-500 mt-0.5"></i>
              <span>Ensure quiet environment for clear audio</span>
            </div>
            <div className="flex items-start space-x-2">
              <i className="bx bx-check text-green-500 mt-0.5"></i>
              <span>Speak clearly and at moderate pace</span>
            </div>
            <div className="flex items-start space-x-2">
              <i className="bx bx-check text-green-500 mt-0.5"></i>
              <span>Use descriptive note names for organization</span>
            </div>
            <div className="flex items-start space-x-2">
              <i className="bx bx-check text-green-500 mt-0.5"></i>
              <span>Works completely offline - no data usage!</span>
            </div>
          </div>
        </div>

        {/* Notes List Section */}
        <div className="mt-10">
          <h2 className="text-2xl font-bold text-orange-400 mb-6 flex items-center">
            <i className="bx bx-library mr-2"></i>
            All Saved Notes
          </h2>
          {notesLoading ? (
            <div className="text-gray-400 text-center py-8">Loading notes...</div>
          ) : notesError ? (
            <div className="text-red-400 text-center py-8">{notesError}</div>
          ) : notes.length === 0 ? (
            <div className="text-gray-400 text-center py-8">No notes saved yet.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {notes.map((note: any) => (
                <div
                  key={note.id}
                  className="bg-gray-800 border border-gray-700 rounded-xl p-5 shadow hover:border-orange-500 transition-all duration-300 cursor-pointer"
                  onClick={() => setModalNote(note)}
                  tabIndex={0}
                  role="button"
                  aria-label={`Open note ${note.name}`}
                >
                  <div className="flex items-center mb-2">
                    <i className="bx bx-file text-blue-400 text-2xl mr-3"></i>
                    <div>
                      <div className="font-bold text-white text-lg truncate">{note.name}</div>
                      <div className="text-xs text-gray-400">
                        {note.uploaded_at
                          ? new Date(note.uploaded_at).toLocaleString()
                          : ""}
                      </div>
                    </div>
                  </div>
                  <div className="text-gray-300 text-sm mt-2 line-clamp-4 whitespace-pre-line">
                    {note.ocr_text
                      ? note.ocr_text.slice(0, 200) + (note.ocr_text.length > 200 ? "..." : "")
                      : "No preview available."}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Note Modal */}
        {modalNote && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm p-4"
            onClick={() => setModalNote(null)}
          >
            <div 
              className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl h-[90vh] relative border border-gray-700 animate-fade-in-up flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-700 flex-shrink-0">
                <div className="flex items-center space-x-3">
                  <i className="bx bx-file text-blue-400 text-2xl"></i>
                  <h2 className="text-xl font-bold text-white">{modalNote.name}</h2>
                </div>
                <div className="flex items-center space-x-2">
                  {modalNote.id || modalNote._id ? (
                    <button
                      onClick={async () => {
                        const noteId = modalNote.id || modalNote._id;
                        const shareUrl = window.location.origin + '/notes/' + noteId;
                        const shareText = modalNote.ocr_text || '';
                        if (navigator.share) {
                          try {
                            await navigator.share({
                              title: modalNote.name,
                              text: shareText,
                              url: shareUrl,
                            });
                          } catch (err) {
                            // User cancelled or error
                          }
                        } else {
                          try {
                            await navigator.clipboard.writeText(shareUrl);
                            alert('Link copied to clipboard!');
                          } catch {
                            alert('Failed to copy link.');
                          }
                        }
                      }}
                      className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded-lg"
                      aria-label="Share note"
                      title="Share note"
                    >
                      <i className="bx bx-share-alt text-2xl"></i>
                    </button>
                  ) : null}
                  <button
                    onClick={() => setModalNote(null)}
                    className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded-lg"
                    aria-label="Close note modal"
                  >
                    <i className="bx bx-x text-2xl"></i>
                  </button>
                </div>
              </div>
              {/* Modal Content */}
              <div className="flex-1 overflow-auto">
                {modalNote.file_type === "pdf" || (modalNote.url && /\.pdf(\?.*)?$/i.test(modalNote.url)) ? (
                  <div className="p-6">
                    <div className="text-xs text-gray-400 mb-2">
                      {modalNote.uploaded_at
                        ? new Date(modalNote.uploaded_at).toLocaleString()
                        : ""}
                    </div>
                    <iframe
                      src={modalNote.url}
                      title={modalNote.name}
                      className="w-full h-[70vh] rounded-lg border border-gray-600 bg-white"
                    />
                  </div>
                ) : (
                  <div className="p-6">
                    <div className="text-xs text-gray-400 mb-2">
                      {modalNote.uploaded_at
                        ? new Date(modalNote.uploaded_at).toLocaleString()
                        : ""}
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4 text-gray-300 text-sm border border-gray-600 whitespace-pre-wrap prose prose-invert prose-sm">
                      <ReactMarkdown>
                        {modalNote.ocr_text || "No content available."}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
