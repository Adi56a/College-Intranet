import React, { useState, useEffect } from 'react';
import { 
  FiBell,
  FiDownload,
  FiEye,
  FiX,
  FiCalendar,
  FiClock,
  FiFileText,
  FiCheckCircle,
  FiAlertCircle,
  FiRefreshCw,
  FiFilter
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

// Professional Loading Component
const LoadingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-16 h-16">
        {/* Outer rotating ring */}
        <div className="absolute inset-0 rounded-full border-4 border-slate-200"></div>
        
        {/* Animated gradient ring */}
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 border-r-blue-500 animate-spin"></div>
        
        {/* Inner pulsing dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 bg-blue-600 rounded-full animate-pulse"></div>
        </div>
      </div>
      
      <p className="mt-4 text-slate-600 font-medium animate-pulse">Loading notices...</p>
    </div>
  );
};

const NoticeToFaculty = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [filterType, setFilterType] = useState('');
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const noticeTypeConfig = {
    general: { 
      label: 'General', 
      icon: <MdEventNote size={24} />, 
      color: 'from-gray-500 to-gray-600',
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-700',
      borderColor: 'border-gray-300'
    },
    attendance: { 
      label: 'Attendance', 
      icon: <MdEventAvailable size={24} />, 
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      borderColor: 'border-green-300'
    },
    holiday: { 
      label: 'Holiday', 
      icon: <MdHolidayVillage size={24} />, 
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700',
      borderColor: 'border-orange-300'
    },
    exam: { 
      label: 'Exam', 
      icon: <MdSchool size={24} />, 
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-300'
    },
    placement: { 
      label: 'Placement', 
      icon: <MdWork size={24} />, 
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      borderColor: 'border-purple-300'
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:3000/getadmintohod', {
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
        setNotices(data.notices || []);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (contentType) => {
    if (!contentType) return <AiOutlineFile size={32} className="text-slate-400" />;
    const type = contentType.toLowerCase();
    if (type.includes('pdf')) return <AiOutlineFilePdf size={32} className="text-red-500" />;
    if (type.includes('image')) return <AiOutlineFileImage size={32} className="text-purple-500" />;
    if (type.includes('word')) return <AiOutlineFileWord size={32} className="text-blue-600" />;
    if (type.includes('sheet') || type.includes('excel')) return <AiOutlineFileExcel size={32} className="text-green-600" />;
    if (type.includes('text')) return <FiFileText size={32} className="text-slate-600" />;
    return <AiOutlineFile size={32} className="text-slate-400" />;
  };

  const getFileType = (contentType) => {
    if (!contentType) return 'File';
    const type = contentType.toLowerCase();
    if (type.includes('pdf')) return 'PDF Document';
    if (type.includes('image')) return 'Image';
    if (type.includes('word')) return 'Word Document';
    if (type.includes('sheet') || type.includes('excel')) return 'Excel Spreadsheet';
    if (type.includes('text')) return 'Text File';
    return 'File';
  };

  const formatDateTime = (dateString) => {
    try {
      const date = new Date(dateString);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      const dateFormatted = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
      const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      return { day: dayName, date: dateFormatted, time: time };
    } catch (e) {
      return { day: 'N/A', date: 'Invalid', time: 'N/A' };
    }
  };

  const handleDownload = (notice) => {
    try {
      if (!notice.file?.data) {
        setMessage({ type: 'error', text: 'File data not available' });
        return;
      }

      const binaryData = atob(notice.file.data);
      const byteArray = new Uint8Array(binaryData.length);
      for (let i = 0; i < binaryData.length; i++) {
        byteArray[i] = binaryData.charCodeAt(i);
      }

      const blob = new Blob([byteArray], { type: notice.file.contentType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      let extension = '';
      if (notice.file.contentType.includes('pdf')) extension = '.pdf';
      else if (notice.file.contentType.includes('image')) extension = '.jpg';
      else if (notice.file.contentType.includes('word')) extension = '.docx';
      else if (notice.file.contentType.includes('sheet')) extension = '.xlsx';
      else if (notice.file.contentType.includes('text')) extension = '.txt';

      link.download = `notice_${notice._id}${extension}`;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);

      setMessage({ type: 'success', text: 'File downloaded successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 2000);
    } catch (error) {
      console.error('Download error:', error);
      setMessage({ type: 'error', text: 'Download failed' });
    }
  };

  const renderPreview = (notice) => {
    try {
      if (!notice.file?.data) return null;

      if (notice.file.contentType.includes('image')) {
        return (
          <img
            src={`data:${notice.file.contentType};base64,${notice.file.data}`}
            alt="Preview"
            className="max-w-full max-h-96 rounded-xl shadow-lg"
          />
        );
      }

      if (notice.file.contentType.includes('pdf')) {
        return (
          <iframe
            src={`data:${notice.file.contentType};base64,${notice.file.data}`}
            className="w-full h-96 rounded-xl shadow-lg"
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

  const filteredNotices = filterType
    ? notices.filter(notice => notice.notice_type === filterType)
    : notices;

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

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <FiBell size={32} className="text-blue-600" />
              <h1 className="text-3xl lg:text-4xl font-bold text-slate-900">
                Admin to HOD Notices
              </h1>
            </div>
            <p className="text-slate-600">View all important notices from administration</p>
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

          {/* Filter */}
          <div className="mb-8 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <FiFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-200 text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                >
                  <option value="">All Types</option>
                  {Object.entries(noticeTypeConfig).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={fetchNotices}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-all"
              >
                <FiRefreshCw size={18} />
                Refresh
              </button>
            </div>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <LoadingSpinner />
            </div>
          ) : filteredNotices.length === 0 ? (
            <div className="text-center py-32 bg-white rounded-2xl border-2 border-slate-200">
              <FiBell size={64} className="mx-auto mb-4 text-slate-300" />
              <p className="text-slate-600 text-lg font-semibold mb-2">No notices found</p>
              <p className="text-sm text-slate-500">Check back later for updates</p>
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="mb-6 p-4 bg-white rounded-xl border border-slate-200 text-center">
                <p className="text-lg font-bold text-slate-900">
                  {filteredNotices.length} Notice{filteredNotices.length !== 1 ? 's' : ''}
                </p>
              </div>

              {/* Notice Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredNotices.map((notice, idx) => {
                  const { day, date, time } = formatDateTime(notice.createdAt);
                  const config = noticeTypeConfig[notice.notice_type] || noticeTypeConfig.general;
                  
                  return (
                    <div
                      key={notice._id}
                      className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md hover:border-blue-300 transition-all"
                    >
                      {/* Header */}
                      <div className={`bg-gradient-to-r ${config.color} px-6 py-6 text-white`}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-white">
                            {config.icon}
                          </div>
                          <span className={`text-xs font-bold px-3 py-1 rounded-full ${config.bgColor} ${config.textColor} border ${config.borderColor}`}>
                            {config.label}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold">Notice #{filteredNotices.length - idx}</h3>
                      </div>

                      {/* Content */}
                      <div className="p-6 space-y-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <FiFileText size={14} className="text-slate-600" />
                            <p className="font-semibold text-slate-600 text-xs">Description</p>
                          </div>
                          <p className="text-slate-900 text-sm line-clamp-3">{notice.description}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <div className="flex items-center gap-1 mb-1">
                              <FiCalendar size={12} className="text-slate-600" />
                              <p className="font-semibold text-slate-600">Date</p>
                            </div>
                            <p className="text-slate-900">{day}, {date}</p>
                          </div>
                          <div>
                            <div className="flex items-center gap-1 mb-1">
                              <FiClock size={12} className="text-slate-600" />
                              <p className="font-semibold text-slate-600">Time</p>
                            </div>
                            <p className="text-slate-900">{time}</p>
                          </div>
                        </div>

                        <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg flex items-center gap-3">
                          {getFileIcon(notice.file?.contentType)}
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-900 text-sm truncate">{getFileType(notice.file?.contentType)}</p>
                            <p className="text-xs text-slate-600">Attached File</p>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedNotice(notice);
                            setShowModal(true);
                          }}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-all text-sm"
                        >
                          <FiEye size={16} />
                          View
                        </button>
                        <button
                          onClick={() => handleDownload(notice)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold bg-green-600 hover:bg-green-700 text-white transition-all text-sm"
                        >
                          <FiDownload size={16} />
                          Download
                        </button>
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
      {showModal && selectedNotice && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">

            {/* Modal Header */}
            <div className={`bg-gradient-to-r ${noticeTypeConfig[selectedNotice.notice_type]?.color || 'from-gray-500 to-gray-600'} px-6 py-4 flex items-center justify-between sticky top-0 z-10 rounded-t-2xl`}>
              <div className="flex items-center gap-2">
                <FiEye size={24} className="text-white" />
                <div>
                  <h2 className="text-xl font-bold text-white">Notice Details</h2>
                  <p className="text-sm text-white/90">{noticeTypeConfig[selectedNotice.notice_type]?.label || 'General'}</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition"
              >
                <FiX size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="mb-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <FiFileText size={16} className="text-slate-600" />
                  <p className="font-bold text-sm text-slate-700">Description</p>
                </div>
                <p className="text-sm text-slate-900 leading-relaxed">{selectedNotice.description}</p>
              </div>

              <div className="mb-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <FiCalendar size={16} className="text-slate-600" />
                  <p className="font-bold text-sm text-slate-700">Posted On</p>
                </div>
                <p className="text-sm text-slate-900">
                  {formatDateTime(selectedNotice.createdAt).day}, {formatDateTime(selectedNotice.createdAt).date} at {formatDateTime(selectedNotice.createdAt).time}
                </p>
              </div>

              <div className="mb-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 mb-3">
                  <FiFileText size={16} className="text-slate-600" />
                  <p className="font-bold text-sm text-slate-700">Attached File</p>
                </div>
                <div className="flex items-center gap-3">
                  {getFileIcon(selectedNotice.file?.contentType)}
                  <p className="text-slate-900 font-semibold">{getFileType(selectedNotice.file?.contentType)}</p>
                </div>
              </div>

              {/* File Preview */}
              <div className="rounded-xl bg-slate-100 p-6 flex items-center justify-center min-h-64 mb-6">
                {renderPreview(selectedNotice) ? (
                  renderPreview(selectedNotice)
                ) : (
                  <div className="text-center">
                    <div className="mb-4 flex justify-center">
                      {getFileIcon(selectedNotice.file?.contentType)}
                    </div>
                    <p className="text-slate-600">Preview not available for this file type</p>
                  </div>
                )}
              </div>

              {/* Download Button */}
              <button
                onClick={() => {
                  handleDownload(selectedNotice);
                  setShowModal(false);
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

export default NoticeToFaculty;
