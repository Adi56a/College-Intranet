import React, { useState, useRef, useEffect } from 'react';
import Header from '../components/Header';

const StudentUpload = () => {
  const [file, setFile] = useState(null);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [ipAddress, setIpAddress] = useState('Fetching...');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [theme, setTheme] = useState('light');
  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const fileInputRef = useRef(null);
  const subjectInputRef = useRef(null);
  const suggestionsRef = useRef(null);

  const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB
  const ALLOWED_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'video/mp4',
    'video/quicktime'
  ];

  // Fetch subjects on component mount
  useEffect(() => {
    fetchSubjects();
    fetchIP();
  }, []);

  // Filter suggestions based on input
  useEffect(() => {
    if (subject.trim().length > 0) {
      const filtered = subjects.filter(s =>
        s.toLowerCase().includes(subject.toLowerCase())
      );
      setFilteredSuggestions(filtered);
    } else {
      setFilteredSuggestions(subjects);
    }
  }, [subject, subjects]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        !subjectInputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoadingSubjects(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:3000/api/teacher/get-subjects', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setSubjects(data.subjects || []);
        setFilteredSuggestions(data.subjects || []);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    } finally {
      setLoadingSubjects(false);
    }
  };

  const fetchIP = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      setIpAddress(data.ip || 'Unknown');
    } catch (error) {
      setIpAddress('Unable to fetch');
    }
  };

  const handleSubjectFocus = () => {
    setShowSuggestions(true);
    setFocusedIndex(-1);
  };

  const handleSubjectChange = (e) => {
    setSubject(e.target.value);
    setShowSuggestions(true);
    setFocusedIndex(-1);
  };

  const handleSuggestionClick = (suggestion) => {
    setSubject(suggestion);
    setShowSuggestions(false);
    setFocusedIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || filteredSuggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex((prev) =>
          prev < filteredSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredSuggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < filteredSuggestions.length) {
          handleSuggestionClick(filteredSuggestions[focusedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setFocusedIndex(-1);
        break;
      default:
        break;
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (!selectedFile) return;

    if (selectedFile.size > MAX_FILE_SIZE) {
      setMessage({ type: 'error', text: '📦 File must be less than 15MB' });
      return;
    }

    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      setMessage({ type: 'error', text: '❌ File type not allowed' });
      return;
    }

    setFile(selectedFile);
    setMessage({ type: '', text: '' });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFile = e.dataTransfer.files[0];

    if (droppedFile) {
      const event = { target: { files: [droppedFile] } };
      handleFileChange(event);
    }
  };

  const getFileIcon = () => {
    if (!file) return '📄';
    const type = file.type;
    if (type.includes('pdf')) return '📕';
    if (type.includes('word') || type.includes('document')) return '📘';
    if (type.includes('sheet')) return '📊';
    if (type.includes('image')) return '🖼️';
    if (type.includes('video')) return '🎬';
    if (type.includes('text')) return '📄';
    return '📦';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!file) {
      setMessage({ type: 'error', text: '📁 Please select a file' });
      return;
    }

    if (!subject.trim()) {
      setMessage({ type: 'error', text: '📚 Please select a subject' });
      return;
    }

    if (!description.trim()) {
      setMessage({ type: 'error', text: '📝 Description is required' });
      return;
    }

    if (description.trim().length < 10) {
      setMessage({ type: 'error', text: '📝 Min 10 characters' });
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('subject', subject.trim());
      formData.append('description', description);

      const response = await fetch('http://localhost:3000/student-upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage({ type: 'error', text: `❌ ${data.message || 'Error uploading'}` });
      } else {
        setMessage({ type: 'success', text: '✅ Uploaded successfully!' });
        setFile(null);
        setSubject('');
        setDescription('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: '🌐 Network error' });
    } finally {
      setLoading(false);
    }
  };

  const isDark = theme === 'dark';

  return (
    <>
      <Header />

      <div className={`min-h-screen transition-colors duration-300 ${
        isDark 
          ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
          : 'bg-gradient-to-br from-white via-blue-50 to-indigo-100'
      } py-8 px-4 relative overflow-hidden`}>

        {/* Animated Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob ${
            isDark ? 'bg-blue-500' : 'bg-blue-200'
          }`}></div>
          <div className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000 ${
            isDark ? 'bg-purple-500' : 'bg-indigo-200'
          }`}></div>
          <div className={`absolute top-1/2 left-1/2 w-80 h-80 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000 ${
            isDark ? 'bg-cyan-500' : 'bg-cyan-200'
          }`}></div>
        </div>

        <div className="relative z-10 max-w-3xl mx-auto">

          {/* Header with Theme Toggle */}
          <div className="flex justify-between items-start mb-10">
            <div className="text-left">
              <h1 className={`text-4xl md:text-5xl font-bold mb-2 ${
                isDark 
                  ? 'text-white' 
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent'
              }`}>
                📤 Submit Your Work
              </h1>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Upload your assignment files
              </p>
            </div>

            {/* Theme Toggle */}
            <div className="flex flex-col items-center gap-2">
              <p className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Switch Theme
              </p>
              <button
                onClick={() => setTheme(isDark ? 'light' : 'dark')}
                className={`px-4 py-2 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 ${
                  isDark
                    ? 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
                    : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-lg'
                }`}
              >
                {isDark ? '☀️ Light' : '🌙 Dark'}
              </button>
            </div>
          </div>

          {/* Alert Messages */}
          {message.text && (
            <div className={`mb-6 p-4 rounded-2xl border backdrop-blur-xl animate-slideDown ${
              message.type === 'success'
                ? isDark 
                  ? 'bg-green-500/20 border-green-500/50 text-green-300'
                  : 'bg-green-100 border-green-300 text-green-800'
                : isDark
                  ? 'bg-red-500/20 border-red-500/50 text-red-300'
                  : 'bg-red-100 border-red-300 text-red-800'
            }`}>
              <p className="font-semibold text-center text-sm md:text-base">{message.text}</p>
            </div>
          )}

          {/* Main Form Container */}
          <div className={`rounded-3xl shadow-2xl p-6 md:p-10 border transition-all duration-300 ${
            isDark
              ? 'bg-gray-800/50 border-gray-700/50 backdrop-blur-xl'
              : 'bg-white border-blue-100/50 backdrop-blur-xl'
          }`}>

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* IP Address Field (Disabled) */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  🌐 Your IP Address
                </label>
                <input
                  type="text"
                  value={ipAddress}
                  disabled
                  className={`w-full px-4 py-3 rounded-xl font-mono text-sm cursor-not-allowed ${
                    isDark
                      ? 'bg-gray-700/30 border border-gray-600/50 text-gray-400'
                      : 'bg-gray-100 border border-gray-300 text-gray-600'
                  }`}
                />
                <p className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  Auto-detected • Read-only
                </p>
              </div>

              {/* Subject Input with Autocomplete */}
              <div className="relative">
                <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  📚 Select Subject <span className="text-blue-500">*</span>
                </label>
                
                <input
                  ref={subjectInputRef}
                  type="text"
                  value={subject}
                  onChange={handleSubjectChange}
                  onFocus={handleSubjectFocus}
                  onKeyDown={handleKeyDown}
                  placeholder={loadingSubjects ? "Loading subjects..." : "Type to search subjects..."}
                  disabled={loading || loadingSubjects}
                  className={`w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 transition-all ${
                    isDark
                      ? 'bg-gray-700/50 border border-gray-600/50 text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-cyan-500/20'
                      : 'bg-blue-50 border border-blue-200 text-gray-900 placeholder-gray-500 focus:border-cyan-500 focus:ring-cyan-500/10'
                  }`}
                  autoComplete="off"
                />

                {/* Suggestions Dropdown */}
                {showSuggestions && filteredSuggestions.length > 0 && (
                  <div
                    ref={suggestionsRef}
                    className={`absolute top-full left-0 right-0 mt-2 max-h-60 overflow-y-auto rounded-xl border shadow-2xl z-20 animate-slideDown ${
                      isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}
                  >
                    {filteredSuggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSuggestionClick(suggestion)}
                        className={`w-full text-left px-4 py-3 transition-all flex items-center gap-3 ${
                          idx === focusedIndex
                            ? 'bg-blue-500 text-white'
                            : isDark
                            ? 'text-gray-200 hover:bg-gray-700'
                            : 'text-gray-700 hover:bg-blue-50'
                        } ${idx !== filteredSuggestions.length - 1 ? 'border-b border-gray-200 dark:border-gray-700' : ''}`}
                      >
                        <span className="text-xl">📖</span>
                        <span className="font-medium">{suggestion}</span>
                      </button>
                    ))}
                  </div>
                )}

                {showSuggestions && filteredSuggestions.length === 0 && subject.trim() && (
                  <div
                    ref={suggestionsRef}
                    className={`absolute top-full left-0 right-0 mt-2 p-4 rounded-xl border shadow-lg z-20 text-center ${
                      isDark ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-white border-gray-200 text-gray-600'
                    }`}
                  >
                    No matching subjects found
                  </div>
                )}

                <p className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  💡 Use ↑↓ arrows to navigate, Enter to select, Esc to close
                </p>
              </div>

              {/* File Upload Area */}
              <div>
                <label className={`block text-sm font-semibold mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  📁 Select File <span className="text-blue-500">*</span>
                </label>

                <p className={`text-xs mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Max file size: 15 MB
                </p>

                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className={`relative border-2 border-dashed rounded-2xl p-8 transition-all cursor-pointer group ${
                    isDark
                      ? 'border-gray-600/50 hover:border-cyan-500 hover:bg-cyan-500/5'
                      : 'border-blue-300 hover:border-cyan-500 hover:bg-blue-50'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={loading}
                  />

                  <div className="text-center">
                    <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">
                      {file ? getFileIcon() : '📂'}
                    </div>

                    {file ? (
                      <>
                        <p className={`font-semibold text-lg break-all ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {file.name}
                        </p>
                        <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {formatFileSize(file.size)}
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setFile(null);
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          className={`mt-4 px-4 py-2 rounded-lg transition-all text-sm font-semibold ${
                            isDark
                              ? 'bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-300'
                              : 'bg-red-100 hover:bg-red-200 border border-red-300 text-red-700'
                          }`}
                        >
                          ✕ Remove
                        </button>
                      </>
                    ) : (
                      <>
                        <p className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          Drag & drop here
                        </p>
                        <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          or click to browse
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  📝 Description <span className="text-blue-500">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your submission..."
                  rows="4"
                  disabled={loading}
                  maxLength={500}
                  className={`w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 transition-all resize-none ${
                    isDark
                      ? 'bg-gray-700/50 border border-gray-600/50 text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-cyan-500/20'
                      : 'bg-blue-50 border border-blue-200 text-gray-900 placeholder-gray-500 focus:border-cyan-500 focus:ring-cyan-500/10'
                  }`}
                />
                <div className={`flex justify-between items-center mt-2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <span>Provide clear details</span>
                  <span>{description.length}/500</span>
                </div>
              </div>

              {/* File Info Box */}
              {file && (
                <div className={`p-4 rounded-xl border ${
                  isDark
                    ? 'bg-blue-500/10 border-blue-500/30'
                    : 'bg-blue-100/50 border-blue-300'
                }`}>
                  <p className={isDark ? 'text-blue-300' : 'text-blue-700'}>
                    <strong>✓ Ready:</strong> {file.name}
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !file || !subject.trim()}
                className={`w-full py-4 rounded-xl font-bold text-white transition-all duration-300 transform flex items-center justify-center gap-2 ${
                  loading || !file || !subject.trim()
                    ? isDark ? 'bg-gray-600 cursor-not-allowed opacity-50' : 'bg-gray-400 cursor-not-allowed opacity-50'
                    : `bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 hover:scale-105 active:scale-95 shadow-lg`
                }`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    🚀 Upload & Submit
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default StudentUpload;
