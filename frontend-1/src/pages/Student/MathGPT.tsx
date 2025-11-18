import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import VideoGenerator from "../../components/VideoGenerator";
import "boxicons/css/boxicons.min.css";

const API_BASE = import.meta.env.VITE_API_URL || "https://uniconnect-learninghub-jqn0.onrender.com/api";

interface MathStep {
  step: number;
  description: string;
  equation: string;
  explanation: string;
}

interface MathSolution {
  problem: string;
  steps: MathStep[];
  finalAnswer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
}

interface VideoScript {
  script: string;
  animations: any[];
  duration: number;
  audioPath?: string;
}

const MathGPT: React.FC = () => {
  const [problem, setProblem] = useState("");
  const [solution, setSolution] = useState<MathSolution | null>(null);
  const [videoScript, setVideoScript] = useState<VideoScript | null>(null);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const sampleProblems = [
    "Solve for x: 2x + 5 = 13",
    "Find the area of a rectangle with length 8 and width 5",
    "Calculate: 15 × 7 + 23",
    "Solve: x² - 5x + 6 = 0"
  ];

  const solveProblem = async () => {
    if (!problem.trim() && !imageFile) return;

    setLoading(true);
    setSolution(null);
    setVideoScript(null);

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("problem", problem);
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const response = await fetch(`${API_BASE}/ai/solve-math`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to solve problem");
      }

      const data = await response.json();
      setSolution(data.solution);
      setVideoScript(data.videoScript);
      if (data.videoScript && data.videoScript.audioPath) {
        if (audioRef.current) {
          audioRef.current.src = `${API_BASE.replace(/\/api$/, "")}/tmp/${data.videoScript.audioPath.split("/tmp/").pop()}`;
        }
      }
    } catch (error) {
      console.error("Error solving problem:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateVideo = async () => {
    if (!solution || !videoScript) return;

    setIsGeneratingVideo(true);
    setCurrentStep(0);

    try {
      // Create video using Canvas API and Web Speech API
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas size
      canvas.width = 800;
      canvas.height = 600;

      // Create video frames
      const frames: string[] = [];
      
      for (let i = 0; i < solution.steps.length; i++) {
        setCurrentStep(i + 1);
        
        // Clear canvas
        ctx.fillStyle = '#1f2937';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw step content
        ctx.fillStyle = '#ffffff';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        
        // Title
        ctx.fillText(`Step ${solution.steps[i].step}: ${solution.steps[i].description}`, 400, 100);
        
        // Equation
        ctx.font = '32px Arial';
        ctx.fillStyle = '#f97316';
        ctx.fillText(solution.steps[i].equation, 400, 200);
        
        // Explanation
        ctx.font = '18px Arial';
        ctx.fillStyle = '#d1d5db';
        const words = solution.steps[i].explanation.split(' ');
        let line = '';
        let y = 300;
        
        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + ' ';
          const metrics = ctx.measureText(testLine);
          const testWidth = metrics.width;
          
          if (testWidth > 700 && n > 0) {
            ctx.fillText(line, 400, y);
            line = words[n] + ' ';
            y += 30;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, 400, y);
        
        // Capture frame
        frames.push(canvas.toDataURL());
        
        // Wait for animation
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Generate speech audio
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(videoScript.script);
        utterance.rate = 0.8;
        utterance.pitch = 1;
        utterance.volume = 1;
        
        speechSynthesis.speak(utterance);
      }

      setIsGeneratingVideo(false);
    } catch (error) {
      console.error("Error generating video:", error);
      setIsGeneratingVideo(false);
    }
  };

  const playVideoExplanation = () => {
    if (!videoScript || !videoScript.audioPath || !audioRef.current) return;
    setIsPlaying(true);
    setCurrentStep(0);
    audioRef.current.currentTime = 0;
    audioRef.current.play();
  };

  const stopVideoExplanation = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentStep(0);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'hard': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="bg-orange-500 bg-opacity-20 p-3 rounded-xl">
              <i className="bx bx-math text-3xl text-orange-500"></i>
            </div>
            <h1 className="text-4xl font-bold text-white">MathGPT</h1>
          </div>
          <p className="text-gray-400 text-lg">
            Solve math problems with AI-generated video explanations
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <i className="bx bx-edit text-orange-500 mr-2"></i>
              Enter Math Problem
            </h2>

            {/* Sample Problems */}
            <div className="mb-4">
              <p className="text-gray-400 text-sm mb-2">Try these examples:</p>
              <div className="grid grid-cols-1 gap-2">
                {sampleProblems.map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => setProblem(sample)}
                    className="text-left p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-gray-300 transition-colors"
                  >
                    {sample}
                  </button>
                ))}
              </div>
            </div>

            {/* Text Input */}
            <textarea
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              placeholder="Type your math problem here... (e.g., 'Solve for x: 2x + 5 = 13')"
              className="w-full h-32 p-4 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 resize-none"
            />

            {/* Image Upload */}
            <div className="mt-4">
              <label className="block text-gray-400 text-sm mb-2">
                Or upload an image of the problem:
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="math-image-upload"
                />
                <label
                  htmlFor="math-image-upload"
                  className="cursor-pointer px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors flex items-center space-x-2"
                >
                  <i className="bx bx-image"></i>
                  <span>Upload Image</span>
                </label>
                {imagePreview && (
                  <div className="flex items-center space-x-2">
                    <img
                      src={imagePreview}
                      alt="Problem preview"
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <button
                      onClick={clearImage}
                      className="text-red-400 hover:text-red-300"
                    >
                      <i className="bx bx-x"></i>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Solve Button */}
            <button
              onClick={solveProblem}
              disabled={loading || (!problem.trim() && !imageFile)}
              className={`w-full mt-6 py-3 rounded-lg font-semibold transition-all ${
                loading || (!problem.trim() && !imageFile)
                  ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white transform hover:scale-105"
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Solving...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <i className="bx bx-calculator"></i>
                  <span>Solve Problem</span>
                </div>
              )}
            </button>
          </div>

          {/* Solution Section */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <i className="bx bx-check-circle text-green-500 mr-2"></i>
              Solution
            </h2>

            {solution ? (
              <div className="space-y-6">
                {/* Problem Info */}
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-orange-400 font-semibold">{solution.topic}</span>
                    <span className={`text-sm font-medium ${getDifficultyColor(solution.difficulty)}`}>
                      {solution.difficulty.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-white font-medium">{solution.problem}</p>
                </div>

                {/* Steps */}
                <div className="space-y-4">
                  {solution.steps.map((step, idx) => (
                    <div
                      key={idx}
                      className={`bg-gray-700 rounded-lg p-4 transition-all ${
                        currentStep === step.step ? 'ring-2 ring-orange-500 bg-gray-600' : ''
                      }`}
                    >
                      <div className="flex items-center mb-2">
                        <div className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3">
                          {step.step}
                        </div>
                        <h3 className="text-white font-semibold">{step.description}</h3>
                      </div>
                      <div className="ml-9">
                        <div className="bg-gray-800 rounded p-3 mb-2 font-mono text-orange-300">
                          {step.equation}
                        </div>
                        <p className="text-gray-300 text-sm">{step.explanation}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Final Answer */}
                <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-4">
                  <h3 className="text-white font-semibold mb-2">Final Answer:</h3>
                  <p className="text-white text-xl font-mono">{solution.finalAnswer}</p>
                </div>

                {/* Video Explanation */}
                <div className="bg-gray-700 rounded-lg p-4">
                  <h3 className="text-white font-semibold mb-3 flex items-center">
                    <i className="bx bx-video text-orange-500 mr-2"></i>
                    Video Explanation
                  </h3>
                  
                  <VideoGenerator 
                    steps={solution.steps}
                    isPlaying={isPlaying}
                    onComplete={() => setIsPlaying(false)}
                  />
                  
                  <div className="flex space-x-3 mt-4">
                    <button
                      onClick={playVideoExplanation}
                      disabled={isPlaying || !videoScript?.audioPath}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                        isPlaying || !videoScript?.audioPath
                          ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                          : "bg-green-600 hover:bg-green-700 text-white"
                      }`}
                    >
                      <i className="bx bx-play mr-2"></i>
                      {isPlaying ? "Playing..." : "Play Explanation"}
                    </button>
                    {isPlaying && (
                      <button
                        onClick={stopVideoExplanation}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all"
                      >
                        <i className="bx bx-stop mr-2"></i>
                        Stop
                      </button>
                    )}
                    <audio ref={audioRef} onEnded={() => setIsPlaying(false)} style={{ display: "none" }} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <i className="bx bx-calculator text-6xl text-gray-600 mb-4"></i>
                <p className="text-gray-400">Enter a math problem to see the solution</p>
              </div>
            )}
          </div>
        </div>


      </div>
    </div>
  );
};

export default MathGPT;
