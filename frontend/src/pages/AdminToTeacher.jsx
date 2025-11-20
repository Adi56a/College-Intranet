import React, { useState, useEffect, useCallback } from 'react';
import { 
  FiBell, 
  FiFolder, 
  FiDownload, 
  FiEye, 
  FiX,
  FiCalendar,
  FiClock,
  FiFileText,
  FiCheckCircle,
  FiAlertCircle,
  FiChevronDown
} from 'react-icons/fi';
import { 
  AiOutlineFilePdf, 
  AiOutlineFileWord, 
  AiOutlineFileExcel, 
  AiOutlineFileImage,
  AiOutlineFile
} from 'react-icons/ai';
import { 
  MdHolidayVillage,
  MdSchool,
  MdWork,
  MdEventNote,
  MdEventAvailable
} from 'react-icons/md';
import Header from '../components/Header';

const NOTICE_TYPE_CONFIG = {
  'general': { 
    label: 'General', 
    color: 'from-blue-500 to-blue-600', 
    icon: <FiBell size={32} />,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  'attendance': { 
    label: 'Attendance', 
    color: 'from-yellow-500 to-yellow-600', 
    icon: <MdEventAvailable size={32} />,
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200'
  },
  'holiday': { 
    label: 'Holiday', 
    color: 'from-pink-500 to-pink-600', 
    icon: <MdHolidayVillage size={32} />,
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200'
  },
  'exam': { 
    label: 'Exam', 
    color: 'from-cyan-500 to-cyan-600', 
    icon: <MdSchool size={32} />,
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200'
  },
  'placement': { 
    label: 'Placement', 
    color: 'from-green-500 to-green-600', 
    icon: <MdWork size={32} />,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  }
};

const ITEMS_PER_PAGE = 9;

const getFileIcon = (contentType) => {
  if (!contentType) return <AiOutlineFile size={40} className="text-slate-400" />;
  const type = String(contentType).toLowerCase();
  if (type.includes('pdf')) return <AiOutlineFilePdf size={40} className="text-red-500" />;
  if (type.includes('image')) return <AiOutlineFileImage size={40} className="text-purple-500" />;
  if (type.includes('word') || type.includes('document')) return <AiOutlineFileWord size={40} className="text-blue-600" />;
  if (type.includes('sheet') || type.includes('excel')) return <AiOutlineFileExcel size={40} className="text-green-600" />;
  if (type.includes('text')) return <FiFileText size={40} className="text-slate-600" />;
  return <AiOutlineFile size={40} className="text-slate-400" />;
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

// Professional Loading Component
const LoadingSpinner = ({ size = 'default', text = '' }) => {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative">
        {/* Outer rotating ring */}
        <div className={`${size === 'small' ? 'w-12 h-12' : 'w-16 h-16'} rounded-full border-4 border-slate-200`}></div>
        
        {/* Animated gradient ring */}
        <div className={`absolute inset-0 ${size === 'small' ? 'w-12 h-12' : 'w-16 h-16'} rounded-full border-4 border-transparent border-t-blue-600 border-r-blue-500 animate-spin`}></div>
        
        {/* Inner pulsing dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`${size === 'small' ? 'w-3 h-3' : 'w-4 h-4'} bg-blue-600 rounded-full animate-pulse`}></div>
        </div>
      </div>
      
      {text && (
        <p className={`mt-4 text-slate-600 font-medium ${size === 'small' ? 'text-sm' : 'text-base'} animate-pulse`}>
          {text}
        </p>
      )}
    </div>
  );
};

// Alternative: Document Loading Animation
const DocumentLoadingAnimation = () => {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-20 h-24 mb-4">
        {/* Document icon animation */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg transform transition-all duration-300">
          <div className="absolute top-0 right-0 w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] border-t-white rounded-tr-lg"></div>
          
          {/* Animated lines */}
          <div className="absolute top-8 left-3 right-3 space-y-2">
            <div className="h-1.5 bg-blue-400 rounded animate-pulse" style={{ animationDelay: '0ms' }}></div>
            <div className="h-1.5 bg-blue-400 rounded animate-pulse" style={{ animationDelay: '150ms' }}></div>
            <div className="h-1.5 bg-blue-400 rounded w-3/4 animate-pulse" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
      <p className="text-slate-600 font-medium animate-pulse">Loading notices...</p>
    </div>
  );
};

const AdminToTeacher = () => {
  const [documents, setDocuments] = useState([]);
  const [displayedDocs, setDisplayedDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [showPreview, setShowPreviewModal] = useState(false);
  const [dynamicFolders, setDynamicFolders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

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
        setDocuments([]);
        setDynamicFolders([]);
      } else {
        const docs = Array.isArray(data.files) ? data.files : [];
        setDocuments(docs);

        const distinctTypes = new Set();
        docs.forEach(doc => {
          const noticeType = doc.notice_type || 'general';
          distinctTypes.add(noticeType);
        });

        const folders = Array.from(distinctTypes).map(type => ({
          value: type,
          label: NOTICE_TYPE_CONFIG[type]?.label || type.charAt(0).toUpperCase() + type.slice(1),
          color: NOTICE_TYPE_CONFIG[type]?.color || 'from-gray-500 to-gray-600',
          icon: NOTICE_TYPE_CONFIG[type]?.icon || <FiFolder size={32} />,
          bgColor: NOTICE_TYPE_CONFIG[type]?.bgColor || 'bg-gray-50',
          borderColor: NOTICE_TYPE_CONFIG[type]?.borderColor || 'border-gray-200'
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
        setMessage({ type: 'error', text: 'File data not available' });
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

      a.download = `notice_${index + 1}${extension}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setMessage({ type: 'success', text: 'File downloaded successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 2000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Download failed' });
    }
  };

  const handlePreview = (doc) => {
    setSelectedDoc(doc);
    setShowPreviewModal(true);
  };

  const renderPreview = (doc) => {
    if (!doc.fileData) {
      return (
        <div className="p-12 text-center">
          <div className="mb-4 flex justify-center">
            {getFileIcon(doc.contentType)}
          </div>
          <p className="text-slate-500">Unable to load preview</p>
        </div>
      );
    }
    const contentType = String(doc.contentType || '').toLowerCase();
    if (contentType.includes('image')) {
      return (
        <img
          src={`data:${doc.contentType};base64,${doc.fileData}`}
          alt="Preview"
          className="max-w-full max-h-96 rounded-xl shadow-lg"
          loading="lazy"
        />
      );
    }
    if (contentType.includes('pdf')) {
      return (
        <iframe
          src={`data:${doc.contentType};base64,${doc.fileData}`}
          className="w-full h-96 rounded-xl shadow-lg"
          title="PDF Preview"
          loading="lazy"
        />
      );
    }
    return (
      <div className="p-12 text-center">
        <div className="mb-4 flex justify-center">
          {getFileIcon(doc.contentType)}
        </div>
        <p className="text-slate-500">Preview not available for this file type</p>
      </div>
    );
  };

  const currentFolderInfo = dynamicFolders.find(f => f.value === selectedFolder);
  const totalDocsInFolder = documents.filter(doc => (doc.notice_type || 'general') === selectedFolder).length;

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

        <div className="relative z-10 max-w-7xl mx-auto">
          
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <FiBell size={32} className="text-blue-600" />
              <h1 className="text-3xl lg:text-4xl font-bold text-slate-900">
                All Notices
              </h1>
            </div>
            <p className="text-slate-600">Browse notices organized by category</p>
          </div>

          {/* Alert Message */}
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

          {/* Folder Tabs */}
          {dynamicFolders.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Categories</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {dynamicFolders.map((folder) => {
                  const count = documents.filter(d => (d.notice_type || 'general') === folder.value).length;
                  const isActive = selectedFolder === folder.value;
                  
                  return (
                    <button
                      key={folder.value}
                      onClick={() => setSelectedFolder(folder.value)}
                      className={`p-6 rounded-2xl border-2 transition-all ${
                        isActive
                          ? `bg-gradient-to-br ${folder.color} text-white border-transparent shadow-lg scale-105`
                          : `bg-white ${folder.borderColor} hover:shadow-md hover:scale-102`
                      }`}
                    >
                      <div className={`mb-3 flex justify-center ${isActive ? 'text-white' : ''}`}>
                        {folder.icon}
                      </div>
                      <p className={`font-bold text-sm mb-2 ${isActive ? 'text-white' : 'text-slate-900'}`}>
                        {folder.label}
                      </p>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        isActive 
                          ? 'bg-white/20 text-white' 
                          : `${folder.bgColor} text-slate-700`
                      }`}>
                        {count} {count === 1 ? 'notice' : 'notices'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Content Area */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <DocumentLoadingAnimation />
            </div>
          ) : displayedDocs.length > 0 ? (
            <div>
              {/* Folder Header */}
              {currentFolderInfo && (
                <div className="mb-6 p-4 rounded-xl bg-white border-2 border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-blue-600">{currentFolderInfo.icon}</div>
                    <div>
                      <p className="font-bold text-slate-900">{currentFolderInfo.label}</p>
                      <p className="text-sm text-slate-600">
                        Showing {displayedDocs.length} of {totalDocsInFolder} notices
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Notices Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {displayedDocs.map((doc, idx) => {
                  const { date, time } = formatDateTime(doc.createdAt || new Date());
                  const desc = doc.description || 'Notice';
                  const displayDesc = desc.substring(0, 80) + (desc.length > 80 ? '...' : '');

                  return (
                    <div
                      key={`${doc._id}-${idx}`}
                      className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-blue-300 transition-all"
                    >
                      <div className="flex items-start gap-4 mb-4">
                        <div className="flex-shrink-0">
                          {getFileIcon(doc.contentType)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 text-sm line-clamp-2 mb-2">
                            {displayDesc}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-slate-600">
                            <span className="flex items-center gap-1">
                              <FiCalendar size={12} />
                              {date}
                            </span>
                            <span className="flex items-center gap-1">
                              <FiClock size={12} />
                              {time}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handlePreview(doc)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all"
                        >
                          <FiEye size={16} />
                          View
                        </button>
                        <button
                          onClick={() => handleDownload(doc, idx)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold text-sm transition-all"
                        >
                          <FiDownload size={16} />
                          Download
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Load More Button */}
              {hasMore && (
                <div className="text-center">
                  <button
                    onClick={loadMoreDocs}
                    disabled={loadingMore}
                    className={`inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-white transition-all ${
                      loadingMore
                        ? 'bg-slate-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:scale-105'
                    }`}
                  >
                    {loadingMore ? (
                      <>
                        <LoadingSpinner size="small" />
                        <span>Loading...</span>
                      </>
                    ) : (
                      <>
                        <FiChevronDown size={20} />
                        Load More ({totalDocsInFolder - displayedDocs.length} remaining)
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-32 bg-white rounded-2xl border-2 border-slate-200">
              <FiFolder size={64} className="mx-auto mb-4 text-slate-300" />
              <p className="text-slate-600 text-lg font-semibold mb-2">No notices found</p>
              <p className="text-sm text-slate-500">Check back later for updates</p>
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && selectedDoc && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between sticky top-0 z-10 rounded-t-2xl">
              <div className="flex items-center gap-2">
                <FiEye size={24} className="text-white" />
                <h2 className="text-xl font-bold text-white">Notice Preview</h2>
              </div>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition"
              >
                <FiX size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              
              {/* Description */}
              <div className="mb-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <FiFileText size={16} className="text-slate-600" />
                  <p className="font-bold text-sm text-slate-700">Description</p>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {selectedDoc.description || 'No description'}
                </p>
              </div>

              {/* Date & Time */}
              <div className="mb-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <FiCalendar size={16} className="text-slate-600" />
                  <p className="font-bold text-sm text-slate-700">Date & Time</p>
                </div>
                <p className="text-sm text-slate-900">
                  {formatDateTime(selectedDoc.createdAt).date} at {formatDateTime(selectedDoc.createdAt).time}
                </p>
              </div>

              {/* Preview */}
              <div className="rounded-xl bg-slate-100 p-6 flex items-center justify-center min-h-64 mb-6">
                {renderPreview(selectedDoc)}
              </div>

              {/* Download Button */}
              <button
                onClick={() => {
                  handleDownload(selectedDoc, 0);
                  setShowPreviewModal(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold bg-green-600 hover:bg-green-700 text-white transition-all"
              >
                <FiDownload size={20} />
                Download File
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminToTeacher;
