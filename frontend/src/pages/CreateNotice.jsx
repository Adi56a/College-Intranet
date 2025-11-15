import React, { useState, useRef } from 'react';
import Header from '../components/Header';

const CreateNotice = () => {
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/plain', 'image/jpeg', 'image/png'];

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (!selectedFile) {
      return;
    }

    // Validate file size
    if (selectedFile.size > MAX_FILE_SIZE) {
      setMessage({ type: 'error', text: '📦 File size must be less than 10MB' });
      return;
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      setMessage({ type: 'error', text: '❌ File type not allowed. Please upload PDF, Word, Excel, Text, or Image files.' });
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
      const event = {
        target: {
          files: [droppedFile]
        }
      };
      handleFileChange(event);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    // Validation
    if (!file) {
      setMessage({ type: 'error', text: '📁 Please select a file to upload' });
      return;
    }

    if (!description.trim()) {
      setMessage({ type: 'error', text: '📝 Description is required' });
      return;
    }

    if (description.trim().length < 10) {
      setMessage({ type: 'error', text: '📝 Description must be at least 10 characters' });
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('description', description);

      const response = await fetch('http://localhost:3000/upload-file', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage({ type: 'error', text: `❌ ${data.message || 'Error uploading file'}` });
      } else {
        setMessage({ type: 'success', text: '✅ File uploaded successfully!' });
        setFile(null);
        setDescription('');
        setUploadProgress(0);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: '🌐 Network error. Please try again.' });
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const getFileIcon = () => {
    if (!file) return '📄';
    const type = file.type;
    if (type.includes('pdf')) return '📕';
    if (type.includes('word') || type.includes('document')) return '📘';
    if (type.includes('sheet')) return '📊';
    if (type.includes('image')) return '🖼️';
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

  return (
    <>
      <Header />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4 relative overflow-hidden">
        
        {/* Animated Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 max-w-3xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-white mb-3 drop-shadow-lg">📤 Upload File</h1>
            <p className="text-lg text-gray-300">Share important documents with your institution</p>
          </div>

          {/* Alert Messages */}
          {message.text && (
            <div className={`mb-6 p-4 rounded-xl backdrop-blur-xl border ${
              message.type === 'success' 
                ? 'bg-green-500/20 border-green-500/50 text-green-300' 
                : 'bg-red-500/20 border-red-500/50 text-red-300'
            } animate-slideDown`}>
              <p className="font-semibold text-center">{message.text}</p>
            </div>
          )}

          {/* Main Form Container */}
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-gray-700/50">
            
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* File Upload Area */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-4">
                  📁 Select File <span className="text-pink-400">*</span>
                </label>
                
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="relative border-2 border-dashed border-gray-600/50 rounded-xl p-8 transition-all hover:border-purple-500 hover:bg-purple-500/5 cursor-pointer group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={loading}
                  />
                  
                  <div className="text-center">
                    <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">
                      {file ? getFileIcon() : '📂'}
                    </div>
                    
                    {file ? (
                      <>
                        <p className="text-white font-semibold text-lg">{file.name}</p>
                        <p className="text-gray-400 text-sm mt-2">{formatFileSize(file.size)}</p>
                        <button
                          type="button"
                          onClick={() => {
                            setFile(null);
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-300 rounded-lg transition-all text-sm font-semibold"
                        >
                          ✕ Remove File
                        </button>
                      </>
                    ) : (
                      <>
                        <p className="text-white font-semibold text-lg">Drag & drop your file here</p>
                        <p className="text-gray-400 text-sm mt-2">or click to browse</p>
                        <p className="text-gray-500 text-xs mt-3">Supported: PDF, Word, Excel, Text, Images (Max 10MB)</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  📝 Description <span className="text-pink-400">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter a detailed description for this file..."
                  rows="4"
                  disabled={loading}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
                />
                <p className="text-gray-400 text-xs mt-2">
                  {description.length} / 500 characters
                </p>
              </div>

              {/* File Info Box */}
              {file && (
                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <p className="text-blue-300 text-sm">
                    <strong>File Info:</strong> {file.type || 'Unknown type'} • {formatFileSize(file.size)}
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !file}
                className={`w-full py-4 rounded-lg font-bold text-white transition-all duration-300 transform flex items-center justify-center gap-2 ${
                  loading || !file
                    ? 'bg-gray-600 cursor-not-allowed opacity-50'
                    : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 hover:scale-105 active:scale-95'
                }`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    🚀 Upload File
                  </>
                )}
              </button>

              {/* Progress Bar */}
              {loading && (
                <div className="w-full bg-gray-700/30 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full transition-all duration-300 animate-pulse"
                    style={{ width: '75%' }}
                  ></div>
                </div>
              )}
            </form>
          </div>

          {/* Info Card */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl backdrop-blur-sm">
              <p className="text-purple-300 text-center">
                <span className="text-2xl block mb-2">📄</span>
                <strong className="text-sm">Multiple Formats</strong>
                <p className="text-xs mt-1">PDF, Word, Excel, Images</p>
              </p>
            </div>

            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl backdrop-blur-sm">
              <p className="text-blue-300 text-center">
                <span className="text-2xl block mb-2">🔒</span>
                <strong className="text-sm">Secure Upload</strong>
                <p className="text-xs mt-1">All data encrypted</p>
              </p>
            </div>

            <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl backdrop-blur-sm">
              <p className="text-cyan-300 text-center">
                <span className="text-2xl block mb-2">⚡</span>
                <strong className="text-sm">Fast & Reliable</strong>
                <p className="text-xs mt-1">Up to 10MB files</p>
              </p>
            </div>
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

export default CreateNotice;
