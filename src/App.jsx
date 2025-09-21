import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Upload, Music, BookOpen, Trophy, Zap, Volume2, Download, Eye, RotateCcw, Loader } from 'lucide-react';

// Mock AI Processing Functions
const processAudioFile = async (file) => {
  console.log('🎵 Processing file:', file.name);
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return {
    key: 'C Major',
    tempo: 120,
    timeSignature: '4/4',
    difficulty: 'Intermediate',
    notes: generateMockNotes(),
    duration: Math.floor(Math.random() * 240) + 60
  };
};

const generateMockNotes = () => {
  const notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const octaves = [3, 4, 5];
  
  return Array.from({ length: 20 }, (_, i) => ({
    id: i,
    note: notes[Math.floor(Math.random() * notes.length)],
    octave: octaves[Math.floor(Math.random() * octaves.length)],
    duration: 0.5,
    time: i * 0.5
  }));
};

// File Drop Hook
const useFileDrop = (onFilesDrop) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    console.log('📁 Files dropped:', files);
    onFilesDrop(files);
  }, [onFilesDrop]);

  return {
    isDragging,
    dragProps: {
      onDragOver: handleDragOver,
      onDragEnter: handleDragEnter,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop,
    },
  };
};

// Ludwig Logo Component
const LudwigLogo = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 32 32" className={className} fill="currentColor">
    <path d="M16 2L8 8v12l8 8 8-8V8l-8-6zm0 4l4 3v8l-4 4-4-4V9l4-3z"/>
    <circle cx="16" cy="16" r="3" fill="white"/>
  </svg>
);

// Components
const SheetMusicDisplay = ({ notes, isPlaying, currentTime }) => {
  return (
    <div className="bg-white rounded-xl p-6 min-h-48">
      <svg viewBox="0 0 800 200" className="w-full h-full">
        {/* Staff lines */}
        {[0, 1, 2, 3, 4].map(line => (
          <line 
            key={line} 
            x1="50" 
            y1={60 + line * 15} 
            x2="750" 
            y2={60 + line * 15} 
            stroke="#333" 
            strokeWidth="1"
          />
        ))}
        
        {/* Treble clef */}
        <text x="60" y="85" fontSize="40" fill="#333">𝄞</text>
        
        {/* Notes */}
        {notes.slice(0, 12).map((note, index) => {
          const x = 120 + index * 50;
          const y = 60 + (Math.random() * 60);
          const isActive = isPlaying && currentTime >= note.time && currentTime < note.time + note.duration;
          
          return (
            <g key={note.id}>
              <ellipse 
                cx={x} 
                cy={y} 
                rx="6" 
                ry="4" 
                fill={isActive ? "#ef4444" : "#333"}
                stroke={isActive ? "#dc2626" : "none"}
                strokeWidth="2"
              />
              <line 
                x1={x + 6} 
                y1={y} 
                x2={x + 6} 
                y2={y - 25} 
                stroke={isActive ? "#ef4444" : "#333"} 
                strokeWidth="1.5"
              />
              <text 
                x={x - 5} 
                y={y + 25} 
                fontSize="10" 
                fill="#666" 
                textAnchor="middle"
              >
                {note.note}{note.octave}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

const Piano3D = ({ currentNote, isPlaying }) => {
  const whiteKeys = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  
  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 h-64 flex items-end justify-center">
      <div className="relative">
        <div className="flex">
          {whiteKeys.map((key) => (
            <div
              key={key}
              className={`w-12 h-32 border-2 border-gray-400 bg-white mr-1 rounded-b-lg transition-all duration-150 cursor-pointer ${
                currentNote?.note === key && isPlaying 
                  ? 'bg-red-200 border-red-400 transform scale-95' 
                  : 'hover:bg-gray-100'
              }`}
            >
              <div className="text-black text-xs text-center mt-24 font-medium">
                {key}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const AudioPlayer = ({ file, onTimeUpdate, isPlaying, setIsPlaying }) => {
  const audioRef = useRef(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (file && audioRef.current) {
      console.log('🎵 Setting up audio for:', file.name);
      const url = URL.createObjectURL(file);
      audioRef.current.src = url;
      setIsLoaded(false);
      
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [file]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const time = audioRef.current.currentTime;
      setCurrentTime(time);
      onTimeUpdate(time);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      setIsLoaded(true);
      console.log('✅ Audio loaded, duration:', audioRef.current.duration);
    }
  };

  const togglePlayPause = async () => {
    if (audioRef.current) {
      try {
        if (isPlaying) {
          audioRef.current.pause();
          console.log('⏸️ Audio paused');
        } else {
          await audioRef.current.play();
          console.log('▶️ Audio playing');
        }
        setIsPlaying(!isPlaying);
      } catch (error) {
        console.error('❌ Audio play error:', error);
        alert('Cannot play audio. Try clicking play after interacting with the page.');
      }
    }
  };

  const handleSeek = (e) => {
    if (audioRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      const newTime = percent * duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        preload="metadata"
      />
      
      <div className="flex items-center space-x-4">
        <button
          onClick={togglePlayPause}
          disabled={!isLoaded}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
            isLoaded 
              ? 'bg-purple-600 hover:bg-purple-700' 
              : 'bg-gray-600 cursor-not-allowed'
          }`}
        >
          {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
        </button>
        
        <div className="flex-1">
          <div 
            className="h-2 bg-gray-700 rounded-full cursor-pointer relative"
            onClick={handleSeek}
          >
            <div 
              className="h-2 bg-purple-500 rounded-full transition-all"
              style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
            />
            <div 
              className="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg"
              style={{ left: `${(currentTime / duration) * 100 || 0}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
        
        <div className="text-sm text-gray-300 font-medium max-w-48 truncate">
          {file?.name || 'No file selected'}
        </div>
      </div>
    </div>
  );
};

const FileUploadZone = ({ onFileUpload, isProcessing }) => {
  const fileInputRef = useRef(null);
  
  const validateAndProcessFile = (file) => {
    console.log('🔍 Validating file:', file.name, file.type);
    
    const validTypes = [
      'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/flac', 
      'audio/aac', 'audio/mp4', 'audio/x-m4a', 'audio/ogg'
    ];
    
    const validExtensions = ['.mp3', '.wav', '.flac', '.aac', '.mp4', '.m4a', '.ogg'];
    const fileName = file.name.toLowerCase();
    
    const isValidType = validTypes.some(type => file.type.includes(type));
    const isValidExtension = validExtensions.some(ext => fileName.endsWith(ext));
    
    if (isValidType || isValidExtension) {
      console.log('✅ File is valid');
      onFileUpload(file);
    } else {
      console.log('❌ Invalid file type');
      alert('Please upload an audio file (MP3, WAV, FLAC, AAC, M4A, OGG)');
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('📁 File selected from input:', file.name);
      validateAndProcessFile(file);
    }
  };

  const { isDragging, dragProps } = useFileDrop((files) => {
    if (files.length > 0) {
      validateAndProcessFile(files[0]);
    }
  });

  if (isProcessing) {
    return (
      <div className="border-2 border-dashed border-purple-500 rounded-3xl p-16 text-center bg-gray-900/30">
        <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Loader className="w-10 h-10 animate-spin" />
        </div>
        <h3 className="text-2xl font-bold mb-4">Processing...</h3>
        <p className="text-gray-400">Ludwig is analyzing your audio</p>
      </div>
    );
  }

  return (
    <div
      {...dragProps}
      className={`border-2 border-dashed rounded-3xl p-16 text-center transition-all duration-300 cursor-pointer ${
        isDragging 
          ? 'border-purple-400 bg-purple-900/20 scale-105' 
          : 'border-gray-700 hover:border-purple-500 hover:bg-gray-900/30'
      }`}
      onClick={() => {
        console.log('🖱️ Upload zone clicked');
        fileInputRef.current?.click();
      }}
    >
      <div className={`w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-transform ${
        isDragging ? 'scale-110' : 'group-hover:scale-110'
      }`}>
        <Upload className="w-10 h-10" />
      </div>
      
      <h3 className="text-2xl font-bold mb-4">
        {isDragging ? 'Drop your file here!' : 'Upload your audio file'}
      </h3>
      
      <p className="text-gray-400 mb-8">
        Drag & drop or click to browse
      </p>
      
      <div className="flex flex-wrap justify-center gap-3">
        {['MP3', 'WAV', 'FLAC', 'AAC', 'M4A'].map((format) => (
          <span key={format} className="px-3 py-1 bg-gray-800 rounded-full text-sm">
            {format}
          </span>
        ))}
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*,.mp3,.wav,.flac,.aac,.m4a,.mp4,.ogg"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default function Ludwig() {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentView, setCurrentView] = useState('upload');
  const [selectedInstrument, setSelectedInstrument] = useState('piano');
  const [progress, setProgress] = useState(65);
  const [streak, setStreak] = useState(7);
  const [analysisData, setAnalysisData] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = async (file) => {
    console.log('🎯 Starting file upload process:', file.name);
    
    setUploadedFile(file);
    setCurrentView('upload');
    setIsProcessing(true);
    
    try {
      const data = await processAudioFile(file);
      setAnalysisData(data);
      setCurrentView('results');
      
      setProgress(prev => Math.min(prev + Math.floor(Math.random() * 15) + 5, 100));
      
      if (Math.random() > 0.7) {
        setStreak(prev => prev + 1);
      }
      
      console.log('✅ File processing complete');
    } catch (error) {
      console.error('❌ Processing failed:', error);
      alert('Failed to process the audio file. Please try again.');
      setCurrentView('upload');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    console.log('🔄 Resetting app');
    setUploadedFile(null);
    setAnalysisData(null);
    setCurrentView('upload');
    setIsPlaying(false);
    setCurrentTime(0);
    setIsProcessing(false);
  };

  const getCurrentNote = () => {
    if (!analysisData?.notes || !isPlaying) return null;
    return analysisData.notes.find(note => 
      currentTime >= note.time && currentTime < note.time + note.duration
    );
  };

  const downloadSheetMusic = () => {
    console.log('💾 Downloading sheet music');
    const svgContent = `<svg viewBox="0 0 800 200" xmlns="http://www.w3.org/2000/svg">
      <text x="400" y="100" text-anchor="middle" font-size="20">Generated Sheet Music for ${uploadedFile?.name}</text>
    </svg>`;
    
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${uploadedFile?.name || 'sheet-music'}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-500 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 p-6 border-b border-gray-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <LudwigLogo />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Ludwig
            </h1>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2 bg-gray-900 px-4 py-2 rounded-xl">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium">{streak} day streak</span>
            </div>
            <div className="flex items-center space-x-2 bg-gray-900 px-4 py-2 rounded-xl">
              <Trophy className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">{progress}% progress</span>
            </div>
            {currentView === 'results' && (
              <button
                onClick={handleReset}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-xl transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="text-sm font-medium">New Upload</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="relative z-10">
        {currentView === 'upload' && (
          <div className="max-w-4xl mx-auto px-6 py-20">
            <div className="text-center mb-16">
              <h2 className="text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent leading-tight">
                Transform Audio
                <br />
                Into Sheet Music
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Upload any audio file and get instant sheet music with AI-powered 3D tutorials
              </p>
            </div>

            <FileUploadZone onFileUpload={handleFileUpload} isProcessing={isProcessing} />

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-800">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold mb-3">Sheet Music Generation</h3>
                <p className="text-gray-400">AI-powered conversion from audio to accurate musical notation</p>
              </div>
              
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-800">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4">
                  <Eye className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold mb-3">3D Visual Tutorials</h3>
                <p className="text-gray-400">Interactive 3D lessons tailored to your chosen instrument</p>
              </div>
              
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-800">
                <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center mb-4">
                  <Trophy className="w-6 h-6 text-pink-400" />
                </div>
                <h3 className="text-xl font-bold mb-3">Progress Tracking</h3>
                <p className="text-gray-400">Gamified learning with streaks and achievement system</p>
              </div>
            </div>
          </div>
        )}

        {currentView === 'results' && analysisData && (
          <div className="max-w-6xl mx-auto px-6 py-12">
            {/* Audio Player */}
            {uploadedFile && (
              <div className="mb-8">
                <AudioPlayer 
                  file={uploadedFile}
                  onTimeUpdate={setCurrentTime}
                  isPlaying={isPlaying}
                  setIsPlaying={setIsPlaying}
                />
              </div>
            )}

            {/* Analysis Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-800">
                <div className="text-sm text-gray-400">Key</div>
                <div className="text-lg font-bold text-blue-400">{analysisData.key}</div>
              </div>
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-800">
                <div className="text-sm text-gray-400">Tempo</div>
                <div className="text-lg font-bold text-green-400">{analysisData.tempo} BPM</div>
              </div>
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-800">
                <div className="text-sm text-gray-400">Time Signature</div>
                <div className="text-lg font-bold text-purple-400">{analysisData.timeSignature}</div>
              </div>
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-800">
                <div className="text-sm text-gray-400">Difficulty</div>
                <div className="text-lg font-bold text-yellow-400">{analysisData.difficulty}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Sheet Music */}
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">Generated Sheet Music</h3>
                  <button 
                    onClick={downloadSheetMusic}
                    className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                </div>
                <SheetMusicDisplay 
                  notes={analysisData.notes} 
                  isPlaying={isPlaying} 
                  currentTime={currentTime}
                />
              </div>

              {/* 3D Tutorial */}
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">3D {selectedInstrument} Tutorial</h3>
                  <select 
                    value={selectedInstrument}
                    onChange={(e) => setSelectedInstrument(e.target.value)}
                    className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1 text-sm"
                  >
                    <option value="piano">Piano</option>
                    <option value="guitar">Guitar</option>
                    <option value="violin">Violin</option>
                  </select>
                </div>
                
                <Piano3D currentNote={getCurrentNote()} isPlaying={isPlaying} />
                
                <div className="mt-4 text-center">
                  <div className="text-sm text-gray-400 mb-2">
                    {getCurrentNote() ? (
                      <span className="text-red-400 font-bold">
                        Playing: {getCurrentNote().note}{getCurrentNote().octave}
                      </span>
                    ) : (
                      'Press play to see live tutorial'
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Section */}
            <div className="mt-8 bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800">
              <h3 className="text-xl font-bold mb-4">Your Learning Progress</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400 mb-1">{progress}%</div>
                  <div className="text-sm text-gray-400">Overall Progress</div>
                  <div className="w-full h-2 bg-gray-800 rounded-full mt-2">
                    <div className="h-2 bg-blue-500 rounded-full transition-all duration-500" style={{width: `${progress}%`}}></div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-400 mb-1">{streak}</div>
                  <div className="text-sm text-gray-400">Day Streak</div>
                  <div className="flex justify-center mt-2 space-x-1">
                    {[...Array(7)].map((_, i) => (
                      <div key={i} className={`w-3 h-3 rounded-full transition-colors ${i < streak ? 'bg-yellow-400' : 'bg-gray-700'}`}></div>
                    ))}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-1">{Math.floor(progress / 8)}</div>
                  <div className="text-sm text-gray-400">Songs Learned</div>
                  <div className="flex justify-center mt-2">
                    <Trophy className="w-6 h-6 text-purple-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}