import React, { useState, useEffect } from 'react';
import Header from '../components/Header';

const AdminToTeacher = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [showPreview, setShowPreviewModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:3000/get-admintoteacher', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage({ type: 'error', text: data.message || 'Error fetching notices' });
      } else {
        const docs = data.files || [];
        setDocuments(docs);
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
    if (contentType.includes('image')) return '🖼️';
    if (contentType.includes('word') || contentType.includes('document')) return '📘';
    if (contentType.includes('sheet') || contentType.includes('excel')) return '📊';
    if (contentType.includes('text')) return '📄';
    if (contentType.includes('video')) return '🎬';
    return '📦';
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    const dateFormatted = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    
    return { day: dayName, date: dateFormatted, time: time };
  };

  const handleDownload = async (doc, index) => {
    try {
      const byteCharacters = atob(doc.fileData);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: doc.contentType });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;

      let extension = '';
      if (doc.contentType.includes('pdf')) extension = '.pdf';
      else if (doc.contentType.includes('image')) extension = '.jpg';
      else if (doc.contentType.includes('word')) extension = '.docx';
      else if (doc.contentType.includes('sheet')) extension = '.xlsx';

      a.download = `notice_${index}${extension}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setMessage({ type: 'success', text: '✅ Downloaded!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 2000);
    } catch (error) {
      console.error('Download error:', error);
      setMessage({ type: 'error', text: '❌ Download failed' });
    }
  };

  const handlePreview = (doc) => {
    setPreviewLoading(true);
    setSelectedDoc(doc);
    setTimeout(() => {
      setShowPreviewModal(true);
      setPreviewLoading(false);
    }, 300);
  };

  const renderPreview = (doc) => {
    if (!doc.fileData) {
      return (
        <div className="p-12 text-center">
          <p className="text-6xl mb-4">{getFileIcon(doc.contentType)}</p>
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Unable to load preview</p>
        </div>
      );
    }

    if (doc.contentType.includes('image')) {
      return (
        <img
          src={`data:${doc.contentType};base64,${doc.fileData}`}
          alt="Preview"
          className="max-w-full max-h-96 rounded-2xl"
        />
      );
    }

    if (doc.contentType.includes('pdf')) {
      return (
        <iframe
          src={`data:${doc.contentType};base64,${doc.fileData}`}
          className="w-full h-96 rounded-2xl"
          title="PDF Preview"
        />
      );
    }

    return (
      <div className="p-12 text-center">
        <p className="text-6xl mb-4">{getFileIcon(doc.contentType)}</p>
        <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Preview not available</p>
      </div>
    );
  };

  const filteredDocuments = documents.filter(doc => {
    if (!selectedDate) return true;
    const docDate = new Date(doc.createdAt);
    const filterDate = new Date(selectedDate);
    return (
      docDate.getFullYear() === filterDate.getFullYear() &&
      docDate.getMonth() === filterDate.getMonth() &&
      docDate.getDate() === filterDate.getDate()
    );
  });

  const sortedDocuments = [...filteredDocuments].sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  );

  const isDark = theme === 'dark';

  return (
    <>
      <Header />

      <div className={`min-h-screen transition-colors duration-300 ${
        isDark
          ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
          : 'bg-gradient-to-br from-white via-blue-50 to-indigo-100'
      } py-8 px-4 relative overflow-hidden`}>

        {/* Background Blobs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute -top-40 -right-40 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob ${
            isDark ? 'bg-blue-500' : 'bg-blue-200'
          }`}></div>
          <div className={`absolute -bottom-40 -left-40 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000 ${
            isDark ? 'bg-purple-500' : 'bg-indigo-200'
          }`}></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">

          {/* Header */}
          <div className="flex justify-between items-start mb-10">
            <div>
              <h1 className={`text-4xl md:text-5xl font-bold mb-2 ${
                isDark ? 'text-white' : 'bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent'
              }`}>
                📢 Notice Board
              </h1>
              <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>Important announcements & updates</p>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className={`px-4 py-2 rounded-full font-semibold transition-all ${
                isDark
                  ? 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
                  : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-lg'
              }`}
            >
              {isDark ? '☀️' : '🌙'}
            </button>
          </div>

          {/* Alerts */}
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
              <p className="text-center font-semibold">{message.text}</p>
            </div>
          )}

          {/* Calendar Filter */}
          <div className={`mb-8 p-6 rounded-2xl border transition-all duration-300 ${
            isDark
              ? 'bg-gray-800/50 border-gray-700/50 backdrop-blur-xl'
              : 'bg-white border-blue-100/50 backdrop-blur-xl'
          }`}>
            <label className={`block text-sm font-bold mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              📅 Filter by Date
            </label>
            <div className="flex gap-2">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                  isDark
                    ? 'bg-gray-700/50 border border-gray-600/50 text-white focus:border-cyan-500 focus:ring-cyan-500/20'
                    : 'bg-blue-50 border border-blue-200 text-gray-900 focus:border-cyan-500 focus:ring-cyan-500/10'
                } focus:outline-none focus:ring-2`}
              />
              {selectedDate && (
                <button
                  onClick={() => setSelectedDate('')}
                  className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                    isDark
                      ? 'bg-red-500/20 border border-red-500/50 text-red-300 hover:bg-red-500/30'
                      : 'bg-red-100 border border-red-300 text-red-700 hover:bg-red-200'
                  }`}
                >
                  ✕ Clear
                </button>
              )}
            </div>
            {selectedDate && (
              <p className={`text-sm mt-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Showing notices from: <span className="font-semibold">{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </p>
            )}
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <div className="animate-spin h-16 w-16 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
              <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>Loading notices...</p>
            </div>
          ) : sortedDocuments.length === 0 ? (
            <div className={`text-center py-32 rounded-3xl border ${isDark ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white/50 border-blue-100'}`}>
              <p className="text-6xl mb-4">📭</p>
              <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>No notices available</p>
            </div>
          ) : (
            <>
              {/* Notice Count */}
              <div className="mb-6 text-center">
                <p className={`text-lg font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  📊 {sortedDocuments.length} notice{sortedDocuments.length !== 1 ? 's' : ''}
                </p>
              </div>

              {/* Notices Timeline */}
              <div className="space-y-4">
                {sortedDocuments.map((doc, index) => {
                  const { day, date, time } = formatDateTime(doc.createdAt);
                  return (
                    <div
                      key={index}
                      className={`rounded-2xl p-6 border transition-all duration-300 hover:shadow-lg ${
                        isDark
                          ? 'bg-gray-800/50 border-gray-700/50 hover:border-blue-500/50'
                          : 'bg-white border-blue-100/50 hover:border-blue-400/50'
                      }`}
                    >
                      <div className="flex items-start gap-6">
                        {/* Date Box */}
                        <div className={`flex-shrink-0 rounded-xl p-4 text-center min-w-max ${
                          isDark
                            ? 'bg-gradient-to-br from-blue-600 to-cyan-600 text-white'
                            : 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white'
                        }`}>
                          <p className="text-2xl font-bold">{new Date(doc.createdAt).getDate()}</p>
                          <p className="text-xs font-semibold">{new Date(doc.createdAt).toLocaleDateString('en-US', { month: 'short' })}</p>
                          <p className="text-xs mt-1">⏰ {time}</p>
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <p className={`font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {doc.description || 'Notice'}
                          </p>
                          <p className={`text-sm line-clamp-2 mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {doc.description || 'No description provided'}
                          </p>

                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            <button
                              onClick={() => handlePreview(doc)}
                              disabled={previewLoading}
                              className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all text-sm flex items-center justify-center gap-2 ${
                                previewLoading
                                  ? isDark
                                    ? 'bg-gray-700 cursor-not-allowed'
                                    : 'bg-gray-300 cursor-not-allowed'
                                  : isDark
                                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white'
                                    : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white'
                              }`}
                            >
                              {previewLoading ? (
                                <>
                                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                  Loading...
                                </>
                              ) : (
                                <>👁️ View</>
                              )}
                            </button>
                            <button
                              onClick={() => handleDownload(doc, index)}
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
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && selectedDoc && (
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
              <h2 className="text-2xl font-bold text-white">📄 Notice Preview</h2>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-8">
              <div className={`mb-6 p-4 rounded-xl ${isDark ? 'bg-gray-800/50' : 'bg-blue-50'}`}>
                <p className={`text-sm font-bold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>📝 Notice</p>
                <p className={`text-base leading-relaxed ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                  {selectedDoc.description || 'No description'}
                </p>
              </div>

              <div className={`mb-6 p-4 rounded-xl ${isDark ? 'bg-gray-800/50' : 'bg-blue-50'}`}>
                <p className={`text-sm font-bold mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>📅 Date & Time</p>
                <p className={isDark ? 'text-white' : 'text-gray-900'}>{formatDateTime(selectedDoc.createdAt).date} at {formatDateTime(selectedDoc.createdAt).time}</p>
              </div>

              <div className={`bg-gray-800/50 rounded-2xl p-6 flex items-center justify-center mb-6 min-h-64 ${
                !isDark ? 'bg-gray-100' : ''
              }`}>
                {renderPreview(selectedDoc)}
              </div>

              <button
                onClick={() => {
                  handleDownload(selectedDoc, documents.indexOf(selectedDoc));
                  setShowPreviewModal(false);
                }}
                className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold rounded-lg transition"
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
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideDown { animation: slideDown 0.3s ease-out; }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </>
  );
};

export default AdminToTeacher;
