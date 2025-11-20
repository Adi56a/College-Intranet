import React, { useState, useRef, useEffect } from 'react';
import { 
  FiUpload, 
  FiFile, 
  FiX, 
  FiCheckCircle,
  FiAlertCircle,
  FiGlobe,
  FiBook,
  FiFileText,
  FiChevronDown,
  FiChevronUp
} from 'react-icons/fi';
import { 
  AiOutlineFilePdf, 
  AiOutlineFileWord, 
  AiOutlineFileExcel, 
  AiOutlineFileImage,
  AiOutlineVideoCamera
} from 'react-icons/ai';
import Header from '../components/Header';

const StudentUpload = () => {
  const [file, setFile] = useState(null);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [ipAddress, setIpAddress] = useState('Fetching...');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
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

  useEffect(() => {
    fetchSubjects();
    fetchIP();
  }, []);

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
      setMessage({ type: 'error', text: 'File must be less than 15MB' });
      return;
    }

    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      setMessage({ type: 'error', text: 'File type not allowed' });
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
    if (!file) return <FiFile size={48} className="text-slate-400" />;
    const type = file.type;
    if (type.includes('pdf')) return <AiOutlineFilePdf size={48} className="text-red-500" />;
    if (type.includes('word') || type.includes('document')) return <AiOutlineFileWord size={48} className="text-blue-600" />;
    if (type.includes('sheet')) return <AiOutlineFileExcel size={48} className="text-green-600" />;
    if (type.includes('image')) return <AiOutlineFileImage size={48} className="text-purple-600" />;
    if (type.includes('video')) return <AiOutlineVideoCamera size={48} className="text-pink-600" />;
    if (type.includes('text')) return <FiFileText size={48} className="text-slate-600" />;
    return <FiFile size={48} className="text-slate-400" />;
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
      setMessage({ type: 'error', text: 'Please select a file' });
      return;
    }

    if (!subject.trim()) {
      setMessage({ type: 'error', text: 'Please select a subject' });
      return;
    }

    if (!description.trim()) {
      setMessage({ type: 'error', text: 'Description is required' });
      return;
    }

    if (description.trim().length < 10) {
      setMessage({ type: 'error', text: 'Description must be at least 10 characters' });
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
        setMessage({ type: 'error', text: data.message || 'Error uploading file' });
      } else {
        setMessage({ type: 'success', text: 'File uploaded successfully!' });
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
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4">
        
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgb(51, 65, 85) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        <div className="relative z-10 max-w-3xl mx-auto">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-2">
              Submit Your Work
            </h1>
            <p className="text-slate-600">Upload your assignment files securely</p>
          </div>

          {/* Alert Messages */}
          {message.text && (
            <div className={`mb-6 p-4 rounded-xl border-2 flex items-center gap-3 ${
              message.type === 'success'
                ? 'bg-green-50 border-green-500 text-green-800'
                : 'bg-red-50 border-red-500 text-red-800'
            }`}>
              {message.type === 'success' ? (
                <FiCheckCircle size={20} className="flex-shrink-0" />
              ) : (
                <FiAlertCircle size={20} className="flex-shrink-0" />
              )}
              <p className="font-semibold">{message.text}</p>
            </div>
          )}

          {/* Main Form */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 lg:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* IP Address Field */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                  <FiGlobe size={16} />
                  Your IP Address
                </label>
                <input
                  type="text"
                  value={ipAddress}
                  disabled
                  className="w-full px-4 py-3 rounded-xl font-mono text-sm cursor-not-allowed bg-slate-50 border border-slate-200 text-slate-600"
                />
                <p className="text-xs text-slate-500 mt-2">Auto-detected • Read-only</p>
              </div>

              {/* Subject Input with Autocomplete */}
              <div className="relative">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                  <FiBook size={16} />
                  Select Subject <span className="text-red-500">*</span>
                </label>
                
                <div className="relative">
                  <input
                    ref={subjectInputRef}
                    type="text"
                    value={subject}
                    onChange={handleSubjectChange}
                    onFocus={handleSubjectFocus}
                    onKeyDown={handleKeyDown}
                    placeholder={loadingSubjects ? "Loading subjects..." : "Type to search subjects..."}
                    disabled={loading || loadingSubjects}
                    className="w-full px-4 py-3 pr-10 rounded-xl bg-slate-50 border-2 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none transition-all disabled:opacity-50"
                    autoComplete="off"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    {showSuggestions ? (
                      <FiChevronUp className="text-slate-400" size={20} />
                    ) : (
                      <FiChevronDown className="text-slate-400" size={20} />
                    )}
                  </div>
                </div>

                {/* Suggestions Dropdown */}
                {showSuggestions && filteredSuggestions.length > 0 && (
                  <div
                    ref={suggestionsRef}
                    className="absolute top-full left-0 right-0 mt-2 max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl z-20"
                  >
                    {filteredSuggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSuggestionClick(suggestion)}
                        className={`w-full text-left px-4 py-3 transition-all flex items-center gap-3 ${
                          idx === focusedIndex
                            ? 'bg-blue-500 text-white'
                            : 'text-slate-700 hover:bg-slate-50'
                        } ${idx !== filteredSuggestions.length - 1 ? 'border-b border-slate-100' : ''}`}
                      >
                        <FiBook size={16} />
                        <span className="font-medium">{suggestion}</span>
                      </button>
                    ))}
                  </div>
                )}

                {showSuggestions && filteredSuggestions.length === 0 && subject.trim() && (
                  <div
                    ref={suggestionsRef}
                    className="absolute top-full left-0 right-0 mt-2 p-4 rounded-xl border border-slate-200 bg-white shadow-lg z-20 text-center text-slate-600"
                  >
                    No matching subjects found
                  </div>
                )}

                <p className="text-xs text-slate-500 mt-2">
                  Use ↑↓ arrows to navigate, Enter to select, Esc to close
                </p>
              </div>

              {/* File Upload Area */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                  <FiUpload size={16} />
                  Upload File <span className="text-red-500">*</span>
                </label>

                <p className="text-xs text-slate-600 mb-3">Maximum file size: 15 MB</p>

                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="relative border-2 border-dashed border-slate-300 rounded-xl p-8 transition-all cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={loading}
                  />

                  <div className="text-center">
                    <div className="mb-4 flex justify-center group-hover:scale-110 transition-transform">
                      {getFileIcon()}
                    </div>

                    {file ? (
                      <>
                        <p className="font-semibold text-lg text-slate-900 break-all mb-2">
                          {file.name}
                        </p>
                        <p className="text-sm text-slate-600 mb-4">
                          {formatFileSize(file.size)}
                        </p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFile(null);
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-semibold text-sm transition-all"
                        >
                          <FiX size={16} />
                          Remove File
                        </button>
                      </>
                    ) : (
                      <>
                        <p className="font-semibold text-lg text-slate-900 mb-2">
                          Drag & drop your file here
                        </p>
                        <p className="text-sm text-slate-600">
                          or click to browse from your device
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                  <FiFileText size={16} />
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide details about your submission..."
                  rows="4"
                  disabled={loading}
                  maxLength={500}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none transition-all resize-none"
                />
                <div className="flex justify-between items-center mt-2 text-xs text-slate-500">
                  <span>Minimum 10 characters</span>
                  <span>{description.length}/500</span>
                </div>
              </div>

              {/* File Ready Indicator */}
              {file && (
                <div className="p-4 rounded-xl bg-green-50 border border-green-200 flex items-center gap-3">
                  <FiCheckCircle className="text-green-600 flex-shrink-0" size={20} />
                  <p className="text-green-800 font-medium">
                    File ready: <span className="font-semibold">{file.name}</span>
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !file || !subject.trim()}
                className={`w-full py-4 rounded-xl font-bold text-white transition-all duration-300 flex items-center justify-center gap-2 ${
                  loading || !file || !subject.trim()
                    ? 'bg-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]'
                }`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <FiUpload size={20} />
                    Submit Assignment
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentUpload;
