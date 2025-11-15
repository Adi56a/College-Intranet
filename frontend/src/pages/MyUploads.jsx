import React, { useState, useEffect } from 'react';
import Header from '../components/Header';

const MyUploads = () => {
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [selectedUpload, setSelectedUpload] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    fetchMyUploads();
  }, []);

  const fetchMyUploads = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:3000/api/student/meStudent', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage({ type: 'error', text: data.message || 'Error fetching uploads' });
      } else {
        setStudentData(data.student);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (contentType) => {
    if (contentType.includes('pdf')) return '📕';
    if (contentType.includes('image') || contentType.includes('jpeg') || contentType.includes('jpg') || contentType.includes('png')) return '🖼️';
    if (contentType.includes('word') || contentType.includes('document')) return '📘';
    if (contentType.includes('sheet') || contentType.includes('excel')) return '📊';
    if (contentType.includes('text')) return '📄';
    return '📦';
  };

  const getFileType = (contentType) => {
    if (contentType.includes('pdf')) return 'PDF';
    if (contentType.includes('jpeg') || contentType.includes('jpg')) return 'JPEG';
    if (contentType.includes('png')) return 'PNG';
    if (contentType.includes('word') || contentType.includes('document')) return 'Word';
    if (contentType.includes('sheet') || contentType.includes('excel')) return 'Excel';
    if (contentType.includes('text')) return 'Text';
    return 'File';
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    const dateFormatted = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    
    return {
      day: dayName,
      date: dateFormatted,
      time: time,
      fullDate: `${dayName}, ${dateFormatted}`
    };
  };

  const handleDownload = (upload, idx) => {
    try {
      if (!upload.file?.data) {
        setMessage({ type: 'error', text: '❌ File data not available' });
        return;
      }

      let binaryData = '';
      if (typeof upload.file.data === 'string') {
        binaryData = atob(upload.file.data);
      } else if (upload.file.data.data) {
        const bytes = upload.file.data.data;
        for (let i = 0; i < bytes.length; i++) {
          binaryData += String.fromCharCode(bytes[i]);
        }
      }

      const byteArray = new Uint8Array(binaryData.length);
      for (let i = 0; i < binaryData.length; i++) {
        byteArray[i] = binaryData.charCodeAt(i);
      }

      const blob = new Blob([byteArray], { type: upload.file.contentType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      let extension = '';
      if (upload.file.contentType.includes('pdf')) extension = '.pdf';
      else if (upload.file.contentType.includes('jpeg') || upload.file.contentType.includes('jpg')) extension = '.jpg';
      else if (upload.file.contentType.includes('png')) extension = '.png';
      else if (upload.file.contentType.includes('word') || upload.file.contentType.includes('document')) extension = '.docx';
      else if (upload.file.contentType.includes('sheet') || upload.file.contentType.includes('excel')) extension = '.xlsx';
      else if (upload.file.contentType.includes('text')) extension = '.txt';
      else extension = '';

      link.download = `my_upload_${idx}${extension}`;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);

      setMessage({ type: 'success', text: '✅ Downloaded successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Download error:', error);
      setMessage({ type: 'error', text: '❌ Error downloading file' });
    }
  };

  const renderPreview = (upload) => {
    try {
      if (!upload.file?.data) return null;
      
      let base64Data = '';
      if (typeof upload.file.data === 'string') {
        base64Data = upload.file.data;
      } else if (upload.file.data.data) {
        const bytes = upload.file.data.data;
        let binary = '';
        for (let i = 0; i < bytes.length; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        base64Data = btoa(binary);
      }

      if (upload.file.contentType.includes('image')) {
        return (
          <img
            src={`data:${upload.file.contentType};base64,${base64Data}`}
            alt="Preview"
            className="max-w-full max-h-96 rounded-2xl"
          />
        );
      }
      
      if (upload.file.contentType.includes('pdf')) {
        return (
          <iframe
            src={`data:${upload.file.contentType};base64,${base64Data}`}
            className="w-full h-96 rounded-2xl"
            title="PDF Preview"
          />
        );
      }

      return null;
    } catch (error) {
      console.error('Preview error:', error);
      return null;
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
          <div className={`absolute -top-40 -right-40 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob ${
            isDark ? 'bg-blue-500' : 'bg-blue-200'
          }`}></div>
          <div className={`absolute -bottom-40 -left-40 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000 ${
            isDark ? 'bg-purple-500' : 'bg-indigo-200'
          }`}></div>
          <div className={`absolute top-1/2 left-1/2 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000 ${
            isDark ? 'bg-cyan-500' : 'bg-cyan-200'
          }`}></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">

          {/* Header with Theme Toggle */}
          <div className="flex justify-between items-start mb-10">
            <div>
              <h1 className={`text-4xl md:text-5xl font-bold mb-2 ${
                isDark ? 'text-white' : 'bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent'
              }`}>
                📂 My Uploads
              </h1>
              <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                View and manage your submissions
              </p>
            </div>

            {/* Theme Toggle */}
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

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center py-32">
              <div className="animate-spin h-16 w-16 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
          ) : !studentData ? (
            <div className={`text-center py-32 rounded-3xl border ${isDark ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white/50 border-blue-100'}`}>
              <p className="text-5xl mb-4">❌</p>
              <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>Error loading your data</p>
            </div>
          ) : (
            <>
              {/* Student Info Section */}
              <div className={`mb-8 rounded-3xl p-6 border transition-all duration-300 ${
                isDark
                  ? 'bg-gray-800/50 border-gray-700/50 backdrop-blur-xl'
                  : 'bg-white border-blue-100/50 backdrop-blur-xl'
              }`}>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-blue-50'}`}>
                    <p className={`text-xs font-semibold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Name</p>
                    <p className={isDark ? 'text-white font-bold' : 'text-gray-900 font-bold'}>{studentData.name}</p>
                  </div>
                  <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-blue-50'}`}>
                    <p className={`text-xs font-semibold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Roll No</p>
                    <p className={isDark ? 'text-white font-bold' : 'text-gray-900 font-bold'}>{studentData.rollNumber}</p>
                  </div>
                  <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-blue-50'}`}>
                    <p className={`text-xs font-semibold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Department</p>
                    <p className={isDark ? 'text-white font-bold' : 'text-gray-900 font-bold'}>{studentData.department}</p>
                  </div>
                  <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-blue-50'}`}>
                    <p className={`text-xs font-semibold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Email</p>
                    <p className={`${isDark ? 'text-white' : 'text-gray-900'} font-bold text-xs break-all`}>{studentData.email}</p>
                  </div>
                </div>
              </div>

              {/* Uploads Section */}
              {!studentData.uploads || studentData.uploads.length === 0 ? (
                <div className={`text-center py-32 rounded-3xl border ${isDark ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white/50 border-blue-100'}`}>
                  <p className="text-6xl mb-4">📭</p>
                  <p className={isDark ? 'text-gray-300 text-lg' : 'text-gray-600 text-lg'}>No uploads yet</p>
                  <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Start uploading to see submissions here</p>
                </div>
              ) : (
                <>
                  {/* Uploads Grid */}
                  <div className="space-y-4">
                    {studentData.uploads
                      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                      .map((upload, idx) => {
                        const { day, date, time } = formatDateTime(upload.createdAt);
                        return (
                          <div
                            key={idx}
                            className={`rounded-2xl p-6 border transition-all duration-300 hover:shadow-lg ${
                              isDark
                                ? 'bg-gray-800/50 border-gray-700/50 hover:border-blue-500/50'
                                : 'bg-white border-blue-100/50 hover:border-blue-400/50'
                            }`}
                          >
                            {/* Upload Header */}
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-4">
                                <span className="text-4xl">{getFileIcon(upload.file.contentType)}</span>
                                <div>
                                  <p className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {getFileType(upload.file.contentType)} Submission
                                  </p>
                                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {day}, {date} • {time}
                                  </p>
                                </div>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                isDark
                                  ? 'bg-blue-500/20 border border-blue-500/50 text-blue-300'
                                  : 'bg-blue-100 border border-blue-300 text-blue-700'
                              }`}>
                                #{idx + 1}
                              </span>
                            </div>

                            {/* Description */}
                            <div className={`mb-4 p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-blue-50'}`}>
                              <p className={`text-sm font-semibold mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                📝 Description
                              </p>
                              <p className={`text-sm line-clamp-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                                {upload.description}
                              </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setSelectedUpload(upload);
                                  setShowPreviewModal(true);
                                }}
                                className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all text-sm ${
                                  isDark
                                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white'
                                    : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white'
                                }`}
                              >
                                👁️ Preview
                              </button>
                              <button
                                onClick={() => handleDownload(upload, idx)}
                                className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all text-sm ${
                                  isDark
                                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white'
                                    : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
                                }`}
                              >
                                💾 Download
                              </button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {showPreviewModal && selectedUpload && (
        <div className={`fixed inset-0 flex items-center justify-center z-50 p-4 animate-fadeIn ${
          isDark ? 'bg-black/70' : 'bg-black/60'
        }`}>
          <div className={`rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border ${
            isDark
              ? 'bg-gray-900 border-gray-700'
              : 'bg-white border-blue-100'
          }`}>

            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
              <h2 className="text-2xl font-bold text-white">👁️ Preview</h2>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">

              {/* File Info */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-blue-50'}`}>
                  <p className={`text-xs font-semibold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>File Type</p>
                  <p className={isDark ? 'text-white font-bold' : 'text-gray-900 font-bold'}>{getFileType(selectedUpload.file.contentType)}</p>
                </div>
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-blue-50'}`}>
                  <p className={`text-xs font-semibold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Uploaded</p>
                  <p className={isDark ? 'text-white font-bold' : 'text-gray-900 font-bold'}>{formatDateTime(selectedUpload.createdAt).fullDate}</p>
                </div>
              </div>

              {/* Description */}
              <div className={`mb-6 p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-blue-50'}`}>
                <p className={`font-bold text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>📝 Description:</p>
                <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{selectedUpload.description}</p>
              </div>

              {/* Preview */}
              <div className={`rounded-2xl p-6 flex items-center justify-center mb-6 min-h-64 ${
                isDark ? 'bg-gray-800/50' : 'bg-gray-100'
              }`}>
                {renderPreview(selectedUpload) ? (
                  renderPreview(selectedUpload)
                ) : (
                  <div className="text-center">
                    <p className="text-5xl mb-3">{getFileIcon(selectedUpload.file.contentType)}</p>
                    <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Preview not available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className={`px-6 py-4 border-t flex gap-2 ${isDark ? 'border-gray-700 bg-gray-800/30' : 'border-blue-100'}`}>
              <button
                onClick={() => setShowPreviewModal(false)}
                className={`flex-1 px-4 py-2 rounded-lg font-semibold transition ${
                  isDark
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                }`}
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleDownload(selectedUpload, 0);
                  setShowPreviewModal(false);
                }}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-lg transition"
              >
                💾 Download
              </button>
            </div>
          </div>
        </div>
      )}

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
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default MyUploads;
