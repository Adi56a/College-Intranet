import React, { useState, useEffect, useCallback } from 'react';
import Header from '../components/Header';


const NOTICE_TYPE_CONFIG = {
  'general': { label: 'General', color: 'from-blue-400 to-blue-600', icon: '📁' },
  'attendance': { label: 'Attendance', color: 'from-yellow-400 to-yellow-600', icon: '🗂️' },
  'holiday': { label: 'Holiday', color: 'from-pink-400 to-pink-600', icon: '🏖️' },
  'exam': { label: 'Exam', color: 'from-cyan-400 to-cyan-600', icon: '📚' },
  'placement': { label: 'Placement', color: 'from-green-400 to-green-600', icon: '💼' }
};

const ITEMS_PER_PAGE = 9; // Load 9 items at a time

const getFileIcon = (contentType) => {
  if (!contentType) return '📦';
  const type = String(contentType).toLowerCase();
  if (type.includes('pdf')) return '📕';
  if (type.includes('image')) return '🖼️';
  if (type.includes('word') || type.includes('document')) return '📘';
  if (type.includes('sheet') || type.includes('excel')) return '📊';
  if (type.includes('text')) return '📄';
  if (type.includes('video')) return '🎬';
  return '📦';
};


const formatDateTime = (dateString) => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return { day: 'N/A', date: 'Invalid', time: 'N/A' };
    }
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    const dateFormatted = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    return { day: dayName, date: dateFormatted, time: time };
  } catch (e) {
    return { day: 'N/A', date: 'Invalid', time: 'N/A' };
  }
};


const AdminToTeacher = () => {
  const [documents, setDocuments] = useState([]);
  const [displayedDocs, setDisplayedDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [theme, setTheme] = useState('light');
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [showPreview, setShowPreviewModal] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [dynamicFolders, setDynamicFolders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);


  useEffect(() => {
    fetchDocuments();
  }, []);


  // Fetch only metadata first (without file data)
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
        setDocuments([]);
        setDynamicFolders([]);
      } else {
        const docs = Array.isArray(data.files) ? data.files : [];
        setDocuments(docs);


        // Generate dynamic folders
        const distinctTypes = new Set();
        docs.forEach(doc => {
          const noticeType = doc.notice_type || 'general';
          distinctTypes.add(noticeType);
        });


        const folders = Array.from(distinctTypes).map(type => ({
          value: type,
          label: NOTICE_TYPE_CONFIG[type]?.label || type.charAt(0).toUpperCase() + type.slice(1),
          color: NOTICE_TYPE_CONFIG[type]?.color || 'from-gray-400 to-gray-600',
          icon: NOTICE_TYPE_CONFIG[type]?.icon || '📁'
        })).sort((a, b) => {
          if (a.value === 'general') return -1;
          if (b.value === 'general') return 1;
          return a.label.localeCompare(b.label);
        });


        setDynamicFolders(folders);
        
        if (folders.length > 0) {
          setSelectedFolder(folders[0].value);
        }
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
      setDocuments([]);
      setDynamicFolders([]);
    } finally {
      setLoading(false);
    }
  };


  // Load documents progressively when folder changes
  useEffect(() => {
    if (selectedFolder) {
      loadInitialDocs();
    }
  }, [selectedFolder]);


  const loadInitialDocs = () => {
    setCurrentPage(1);
    const filtered = documents.filter(doc => (doc.notice_type || 'general') === selectedFolder);
    const initial = filtered.slice(0, ITEMS_PER_PAGE);
    setDisplayedDocs(initial);
    setHasMore(filtered.length > ITEMS_PER_PAGE);
  };


  const loadMoreDocs = useCallback(() => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    
    // Simulate network delay for smooth UX
    setTimeout(() => {
      const filtered = documents.filter(doc => (doc.notice_type || 'general') === selectedFolder);
      const nextPage = currentPage + 1;
      const startIdx = currentPage * ITEMS_PER_PAGE;
      const endIdx = nextPage * ITEMS_PER_PAGE;
      const moreDocs = filtered.slice(startIdx, endIdx);
      
      setDisplayedDocs(prev => [...prev, ...moreDocs]);
      setCurrentPage(nextPage);
      setHasMore(filtered.length > endIdx);
      setLoadingMore(false);
    }, 300);
  }, [currentPage, selectedFolder, documents, loadingMore, hasMore]);


  const handleDownload = async (doc, index) => {
    try {
      if (!doc.fileData) {
        setMessage({ type: 'error', text: '❌ File data not available' });
        return;
      }


      const byteCharacters = atob(doc.fileData);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: doc.contentType || 'application/octet-stream' });


      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;


      let extension = '.bin';
      const contentType = String(doc.contentType || '').toLowerCase();
      if (contentType.includes('pdf')) extension = '.pdf';
      else if (contentType.includes('image')) extension = '.jpg';
      else if (contentType.includes('word')) extension = '.docx';
      else if (contentType.includes('sheet')) extension = '.xlsx';
      else if (contentType.includes('text')) extension = '.txt';


      a.download = `notice_${index}${extension}`;
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


  const handlePreview = (doc) => {
    setPreviewLoading(true);
    setSelectedDoc(doc);
    setTimeout(() => {
      setShowPreviewModal(true);
      setPreviewLoading(false);
    }, 200);
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
    const contentType = String(doc.contentType || '').toLowerCase();
    if (contentType.includes('image')) {
      return (
        <img
          src={`data:${doc.contentType};base64,${doc.fileData}`}
          alt="Preview"
          className="max-w-full max-h-96 rounded-2xl"
          loading="lazy"
          onError={() => setMessage({ type: 'error', text: '❌ Image preview failed' })}
        />
      );
    }
    if (contentType.includes('pdf')) {
      return (
        <iframe
          src={`data:${doc.contentType};base64,${doc.fileData}`}
          className="w-full h-96 rounded-2xl"
          title="PDF Preview"
          loading="lazy"
          onError={() => setMessage({ type: 'error', text: '❌ PDF preview failed' })}
        />
      );
    }
    return (
      <div className="p-12 text-center">
        <p className="text-6xl mb-4">{getFileIcon(doc.contentType)}</p>
        <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Preview not available for this file type</p>
      </div>
    );
  };


  const isDark = theme === 'dark';
  const currentFolderInfo = dynamicFolders.find(f => f.value === selectedFolder);
  const totalDocsInFolder = documents.filter(doc => (doc.notice_type || 'general') === selectedFolder).length;


  return (
    <>
      <Header />
      <div className={`min-h-screen transition-colors duration-300 ${
        isDark
          ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
          : 'bg-gradient-to-br from-white via-blue-50 to-indigo-100'
      } py-8 px-4 relative overflow-hidden`}>


        {/* Background blobs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute -top-40 -right-40 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob ${isDark ? 'bg-blue-500' : 'bg-blue-200'}`}></div>
          <div className={`absolute -bottom-40 -left-40 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000 ${isDark ? 'bg-purple-500' : 'bg-indigo-200'}`}></div>
        </div>


        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="flex justify-between items-center mb-10">
            <h1 className={`text-4xl md:text-5xl font-bold ${isDark ? "text-white" : "bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"}`}>
              🗂️ All Notices
            </h1>
            <button
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className={`px-4 py-2 rounded-full font-semibold transition-all ${
                isDark
                  ? 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
                  : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-lg'
              }`}
            >
              {isDark ? "☀️" : "🌙"}
            </button>
          </div>


          {/* Alert Message */}
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


          {/* Dynamic Folder Tabs */}
          {dynamicFolders.length > 0 && (
            <div className="flex flex-wrap gap-8 justify-center mt-8 mb-8 px-4">
              {dynamicFolders.map((folder) => {
                const count = documents.filter(d => (d.notice_type || 'general') === folder.value).length;
                return (
                  <button
                    key={folder.value}
                    onClick={() => setSelectedFolder(folder.value)}
                    className={`flex flex-col items-center px-8 py-6 rounded-3xl group shadow-2xl border-2 transition-all duration-300 ${
                      selectedFolder === folder.value
                        ? `ring-4 ring-cyan-400 scale-105 border-cyan-400 bg-gradient-to-br ${folder.color}`
                        : `border-transparent bg-gradient-to-br ${folder.color} opacity-70 hover:opacity-100`
                    }`}
                  >
                    <span className="text-5xl md:text-6xl mb-2 drop-shadow">{folder.icon}</span>
                    <span className="font-bold text-white drop-shadow text-sm md:text-base">{folder.label}</span>
                    <span className="mt-2 px-3 py-1 bg-black/20 text-xs rounded-full text-white font-bold">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}


          {/* Folder Content */}
          <div className="mt-8">
            {loading ? (
              <div className="text-center py-16">
                <div className="animate-spin h-16 w-16 border-4 border-blue-500 border-t-transparent rounded-full mb-5 mx-auto"></div>
                <p className={isDark ? "text-gray-300" : "text-gray-500"}>Loading notices...</p>
              </div>
            ) : displayedDocs.length > 0 ? (
              <div>
                {currentFolderInfo && (
                  <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500">
                    <p className="text-white font-bold text-lg">
                      {currentFolderInfo.icon} {currentFolderInfo.label} (Showing {displayedDocs.length} of {totalDocsInFolder})
                    </p>
                  </div>
                )}
                
                {/* Progressive grid rendering */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayedDocs.map((doc, idx) => {
                    const { date, time } = formatDateTime(doc.createdAt || new Date());
                    const desc = doc.description || 'Notice';
                    const displayDesc = desc.substring(0, 60) + (desc.length > 60 ? '...' : '');


                    return (
                      <div
                        key={`${doc._id}-${idx}`}
                        className={`rounded-2xl p-6 border-2 transition-all duration-300 shadow-lg hover:shadow-xl animate-fadeInUp ${
                          isDark
                            ? 'bg-gray-800/70 border-gray-700 hover:border-cyan-400'
                            : 'bg-white border-blue-200 hover:border-cyan-400'
                        }`}
                        style={{ animationDelay: `${(idx % ITEMS_PER_PAGE) * 50}ms` }}
                      >
                        <div className="flex items-start mb-4 gap-3">
                          <span className="text-4xl flex-shrink-0">{getFileIcon(doc.contentType)}</span>
                          <div className="flex-1 min-w-0">
                            <div className={`font-bold text-sm md:text-base truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {displayDesc}
                            </div>
                            <div className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              {date} • {time}
                            </div>
                          </div>
                        </div>


                        <div className="flex gap-2 mt-4">
                          <button
                            onClick={() => handlePreview(doc)}
                            className="flex-1 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold text-sm transition hover:scale-105 shadow-lg active:scale-95"
                          >
                            👁️ View
                          </button>
                          <button
                            onClick={() => handleDownload(doc, idx)}
                            className="flex-1 px-3 py-2 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold text-sm transition hover:scale-105 shadow-lg active:scale-95"
                          >
                            💾 Get
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>


                {/* Load More Button */}
                {hasMore && (
                  <div className="text-center mt-8">
                    <button
                      onClick={loadMoreDocs}
                      disabled={loadingMore}
                      className={`px-8 py-4 rounded-xl font-bold text-white transition-all ${
                        loadingMore
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 hover:shadow-xl transform hover:scale-105'
                      }`}
                    >
                      {loadingMore ? (
                        <span className="flex items-center gap-2">
                          <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                          Loading more...
                        </span>
                      ) : (
                        `⬇️ Load More (${totalDocsInFolder - displayedDocs.length} remaining)`
                      )}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className={`py-16 text-center rounded-3xl border-2 ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-blue-50 border-blue-200'}`}>
                <span className="text-6xl">📂</span>
                <p className={`mt-4 font-semibold text-lg ${isDark ? "text-gray-200" : "text-gray-600"}`}>
                  No notices found
                </p>
              </div>
            )}
          </div>
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
              <h2 className="text-xl md:text-2xl font-bold text-white">📄 Preview</h2>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition"
              >
                ✕
              </button>
            </div>


            {/* Modal Content */}
            <div className="p-6 md:p-8">
              <div className={`mb-6 p-4 rounded-xl ${isDark ? "bg-gray-800/50" : "bg-blue-50"}`}>
                <p className={`text-xs font-bold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>📝 Description</p>
                <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                  {selectedDoc.description || 'No description'}
                </p>
              </div>


              <div className={`mb-6 p-4 rounded-xl ${isDark ? "bg-gray-800/50" : "bg-blue-50"}`}>
                <p className={`text-xs font-bold mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>📅 Date & Time</p>
                <p className={`text-sm ${isDark ? "text-white" : "text-gray-900"}`}>
                  {formatDateTime(selectedDoc.createdAt).date} at {formatDateTime(selectedDoc.createdAt).time}
                </p>
              </div>


              <div className={`bg-gray-200 dark:bg-gray-800/50 rounded-2xl p-6 flex items-center justify-center mb-6 min-h-64`}>
                {previewLoading ? (
                  <div className="text-center">
                    <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                    <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>Loading preview...</p>
                  </div>
                ) : (
                  renderPreview(selectedDoc)
                )}
              </div>


              <button
                onClick={() => {
                  handleDownload(selectedDoc, 0);
                  setShowPreviewModal(false);
                }}
                className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold rounded-lg transition active:scale-95"
              >
                💾 Download File
              </button>
            </div>
          </div>
        </div>
      )}


      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animate-slideDown { animation: slideDown 0.3s ease-out; }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp { animation: fadeInUp 0.6s ease-out forwards; }
      `}</style>
    </>
  );
};


export default AdminToTeacher;
