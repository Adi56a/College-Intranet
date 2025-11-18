import React, { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';

const Personal = () => {
  const [files, setFiles] = useState([]);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingFiles, setFetchingFiles] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [theme, setTheme] = useState('light');
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchPersonalFiles();
  }, []);

  const fetchPersonalFiles = async () => {
    try {
      setFetchingFiles(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:3000/get-personalfile-teacher', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage({ type: 'error', text: data.message || '❌ Error fetching files' });
      } else {
        setFiles(data.personalFiles || []);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: '❌ Network error. Please try again.' });
    } finally {
      setFetchingFiles(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setMessage({ type: '', text: '' });
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setMessage({ type: 'error', text: '❌ Title is required' });
      return;
    }

    if (!file) {
      setMessage({ type: 'error', text: '❌ Please select a file' });
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title.trim());

      const response = await fetch('http://localhost:3000/add-personalfiles-teacher', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage({ type: 'error', text: data.message || '❌ Failed to upload file' });
      } else {
        setMessage({ type: 'success', text: '✅ File uploaded successfully!' });
        setTitle('');
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        fetchPersonalFiles();
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: '❌ Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (contentType) => {
    if (!contentType) return '📦';
    const type = contentType.toLowerCase();
    if (type.includes('pdf')) return '📕';
    if (type.includes('image')) return '🖼️';
    if (type.includes('word') || type.includes('document')) return '📘';
    if (type.includes('sheet') || type.includes('excel')) return '📊';
    if (type.includes('text')) return '📄';
    if (type.includes('video')) return '🎬';
    if (type.includes('audio')) return '🎵';
    if (type.includes('zip') || type.includes('compressed')) return '🗜️';
    return '📦';
  };

  const handleDownload = (file, index) => {
    try {
      const byteCharacters = atob(file.file.data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: file.file.contentType });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;

      let extension = '';
      const contentType = file.file.contentType.toLowerCase();
      if (contentType.includes('pdf')) extension = '.pdf';
      else if (contentType.includes('image')) extension = '.jpg';
      else if (contentType.includes('word')) extension = '.docx';
      else if (contentType.includes('sheet')) extension = '.xlsx';
      else if (contentType.includes('text')) extension = '.txt';

      a.download = `${file.title}${extension}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setMessage({ type: 'success', text: '✅ Downloaded!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 2000);
    } catch (error) {
      setMessage({ type: 'error', text: '❌ Download failed' });
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Filter files based on search query
  const filteredFiles = files.filter(file =>
    file.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isDark = theme === 'dark';

  return (
    <>
      <Header />

      <div className={`min-h-screen transition-colors duration-300 ${
        isDark
          ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
          : 'bg-gradient-to-br from-white via-blue-50 to-indigo-100'
      } py-8 px-4`}>

        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className={`text-4xl md:text-5xl font-bold mb-2 ${
                isDark 
                  ? 'text-white' 
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent'
              }`}>
                📁 Personal Files
              </h1>
              <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                Upload and manage your personal documents
              </p>
            </div>

            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                isDark
                  ? 'bg-white/10 text-white hover:bg-white/20'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {isDark ? '☀️' : '🌙'}
            </button>
          </div>

          {/* Alert Messages */}
          {message.text && (
            <div className={`mb-6 p-4 rounded-xl animate-slideDown ${
              message.type === 'success'
                ? isDark
                  ? 'bg-green-500/20 text-green-300 border border-green-500/50'
                  : 'bg-green-50 text-green-800 border border-green-200'
                : isDark
                  ? 'bg-red-500/20 text-red-300 border border-red-500/50'
                  : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              <p className="text-center font-semibold">{message.text}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* UPLOAD FORM */}
            <div className="lg:col-span-1">
              <div className={`rounded-2xl p-6 border sticky top-8 ${
                isDark
                  ? 'bg-gray-800/50 border-gray-700'
                  : 'bg-white border-gray-200'
              }`}>
                <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  ⬆️ Upload File
                </h2>

                <form onSubmit={handleUpload} className="space-y-4">
                  {/* Title */}
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      File Title *
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter file title..."
                      className={`w-full px-4 py-3 rounded-lg border-2 transition-all ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                          : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                      } focus:outline-none`}
                      disabled={loading}
                    />
                  </div>

                  {/* File Upload */}
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Select File *
                    </label>
                    <div className={`relative border-2 border-dashed rounded-xl p-6 transition-all cursor-pointer ${
                      isDark
                        ? 'border-gray-600 hover:border-blue-500 hover:bg-blue-500/5'
                        : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                    }`}>
                      <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={loading}
                      />

                      <div className="text-center">
                        <div className="text-5xl mb-3">
                          {file ? getFileIcon(file.type) : '📂'}
                        </div>

                        {file ? (
                          <>
                            <p className={`font-semibold break-all ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {file.name}
                            </p>
                            <p className={`text-xs mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {formatFileSize(file.size)}
                            </p>
                          </>
                        ) : (
                          <>
                            <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              Click to browse
                            </p>
                            <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              Any file type supported
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Upload Button */}
                  <button
                    type="submit"
                    disabled={loading || !file || !title.trim()}
                    className={`w-full py-3 rounded-lg font-semibold transition-all ${
                      loading || !file || !title.trim()
                        ? 'bg-gray-400 cursor-not-allowed text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {loading ? 'Uploading...' : '🚀 Upload File'}
                  </button>
                </form>
              </div>
            </div>

            {/* FILES GALLERY */}
            <div className="lg:col-span-2">
              {/* Search Bar */}
              <div className={`mb-6 rounded-2xl p-4 border ${
                isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="🔍 Search files by title..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`w-full px-4 py-3 pl-10 rounded-lg border transition-all ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                          : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                      } focus:outline-none`}
                    />
                    <svg 
                      className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                        isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                        isDark
                          ? 'bg-gray-700 text-white hover:bg-gray-600'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Files Count */}
              {!fetchingFiles && filteredFiles.length > 0 && (
                <div className={`mb-6 p-4 rounded-xl text-center ${
                  isDark ? 'bg-gray-800/50' : 'bg-blue-50'
                }`}>
                  <p className={`font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    📊 {filteredFiles.length} File{filteredFiles.length !== 1 ? 's' : ''} {searchQuery ? 'Found' : 'Uploaded'}
                  </p>
                </div>
              )}

              {/* Files Grid */}
              <div>
                {fetchingFiles ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
                    <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>Loading files...</p>
                  </div>
                ) : filteredFiles.length === 0 ? (
                  <div className={`text-center py-20 rounded-2xl border ${
                    isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <p className="text-5xl mb-4">{searchQuery ? '🔍' : '📁'}</p>
                    <p className={`text-lg font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      {searchQuery ? `No files match "${searchQuery}"` : 'No files uploaded yet'}
                    </p>
                    <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {searchQuery ? 'Try a different search term' : 'Upload your first file using the form'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredFiles.map((file, index) => (
                      <div
                        key={file._id}
                        className={`rounded-2xl p-6 border transition-all hover:shadow-lg animate-fadeInUp ${
                          isDark
                            ? 'bg-gray-800/50 border-gray-700 hover:border-blue-500'
                            : 'bg-white border-gray-200 hover:border-blue-500'
                        }`}
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        {/* File Icon & Title */}
                        <div className="flex items-start gap-4 mb-4">
                          <span className="text-5xl">{getFileIcon(file.file.contentType)}</span>
                          <div className="flex-1 min-w-0">
                            <h3 className={`font-bold text-lg mb-1 break-words ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {file.title}
                            </h3>
                            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              📅 {formatDate(file.createdAt)}
                            </p>
                          </div>
                        </div>

                        {/* File Info */}
                        <div className={`p-3 rounded-lg mb-4 ${
                          isDark ? 'bg-gray-700/50' : 'bg-blue-50'
                        }`}>
                          <p className={`text-xs font-mono truncate ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {file.file.contentType}
                          </p>
                        </div>

                        {/* Download Button */}
                        <button
                          onClick={() => handleDownload(file, index)}
                          className={`w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                            isDark
                              ? 'bg-blue-600 hover:bg-blue-700 text-white'
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                          }`}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          <span>Download</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
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
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
        }
      `}</style>
    </>
  );
};

export default Personal;
