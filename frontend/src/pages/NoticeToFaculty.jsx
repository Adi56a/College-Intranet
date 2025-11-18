import React, { useState, useEffect } from 'react';
import Header from '../components/Header';

const NoticeToFaculty = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [filterType, setFilterType] = useState('');
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [showModal, setShowModal] = useState(false);

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
        setMessage({ type: 'error', text: data.message || '❌ Error fetching notices' });
      } else {
        setNotices(data.notices || []);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: '❌ Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const getNoticeTypeIcon = (type) => {
    const icons = {
      general: '📁',
      attendance: '✅',
      holiday: '🏖️',
      exam: '📝',
      placement: '💼'
    };
    return icons[type] || '📁';
  };

  const getNoticeTypeColor = (type) => {
    const colors = {
      general: 'from-gray-500 to-gray-600',
      attendance: 'from-green-500 to-green-600',
      holiday: 'from-orange-500 to-orange-600',
      exam: 'from-blue-500 to-blue-600',
      placement: 'from-purple-500 to-purple-600'
    };
    return colors[type] || 'from-gray-500 to-gray-600';
  };

  const getNoticeTypeBadgeColor = (type) => {
    const colors = {
      general: 'bg-gray-100 text-gray-700 border-gray-300',
      attendance: 'bg-green-100 text-green-700 border-green-300',
      holiday: 'bg-orange-100 text-orange-700 border-orange-300',
      exam: 'bg-blue-100 text-blue-700 border-blue-300',
      placement: 'bg-purple-100 text-purple-700 border-purple-300'
    };
    return colors[type] || 'bg-gray-100 text-gray-700 border-gray-300';
  };

  const getFileIcon = (contentType) => {
    if (!contentType) return '📦';
    const type = contentType.toLowerCase();
    if (type.includes('pdf')) return '📕';
    if (type.includes('image')) return '🖼️';
    if (type.includes('word')) return '📘';
    if (type.includes('sheet') || type.includes('excel')) return '📊';
    if (type.includes('text')) return '📄';
    return '📦';
  };

  const getFileType = (contentType) => {
    if (!contentType) return 'File';
    const type = contentType.toLowerCase();
    if (type.includes('pdf')) return 'PDF';
    if (type.includes('image')) return 'Image';
    if (type.includes('word')) return 'Word';
    if (type.includes('sheet') || type.includes('excel')) return 'Excel';
    if (type.includes('text')) return 'Text';
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
        setMessage({ type: 'error', text: '❌ File data not available' });
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

      setMessage({ type: 'success', text: '✅ Downloaded!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 2000);
    } catch (error) {
      console.error('Download error:', error);
      setMessage({ type: 'error', text: '❌ Download failed' });
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
            className="max-w-full max-h-96 rounded-2xl"
          />
        );
      }

      if (notice.file.contentType.includes('pdf')) {
        return (
          <iframe
            src={`data:${notice.file.contentType};base64,${notice.file.data}`}
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

  const filteredNotices = filterType
    ? notices.filter(notice => notice.notice_type === filterType)
    : notices;

  return (
    <>
      <Header />

      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-indigo-100 py-8 px-4">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="mb-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              📢 Admin to HOD Notices
            </h1>
            <p className="text-gray-600">View all important notices from administration</p>
          </div>

          {/* Alert Messages */}
          {message.text && (
            <div className={`mb-6 p-4 rounded-2xl border backdrop-blur-xl animate-slideDown ${
              message.type === 'success'
                ? 'bg-green-100 border-green-300 text-green-800'
                : 'bg-red-100 border-red-300 text-red-800'
            }`}>
              <p className="text-center font-semibold">{message.text}</p>
            </div>
          )}

          {/* Filter */}
          <div className="mb-8 bg-white rounded-2xl p-6 border border-blue-100/50 shadow-lg">
            <div className="flex flex-col md:flex-row gap-3 items-center">
              <label className="font-bold text-gray-700">🏷️ Filter by Type:</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="flex-1 px-4 py-3 rounded-lg border border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
              >
                <option value="">📁 All Types</option>
                <option value="general">📁 General</option>
                <option value="attendance">✅ Attendance</option>
                <option value="holiday">🏖️ Holiday</option>
                <option value="exam">📝 Exam</option>
                <option value="placement">💼 Placement</option>
              </select>
              <button
                onClick={fetchNotices}
                className="px-6 py-3 rounded-lg font-bold bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white transition-all"
              >
                🔄 Refresh
              </button>
            </div>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <div className="animate-spin h-16 w-16 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
              <p className="text-gray-600">Loading notices...</p>
            </div>
          ) : filteredNotices.length === 0 ? (
            <div className="text-center py-32 bg-white/50 rounded-3xl border border-blue-100">
              <p className="text-5xl mb-3">📭</p>
              <p className="text-gray-600">No notices found</p>
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="mb-6 p-4 bg-blue-50 rounded-2xl text-center">
                <p className="text-lg font-bold text-gray-700">
                  📊 {filteredNotices.length} Notice{filteredNotices.length !== 1 ? 's' : ''}
                </p>
              </div>

              {/* Notice Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredNotices.map((notice, idx) => {
                  const { day, date, time } = formatDateTime(notice.createdAt);
                  return (
                    <div
                      key={notice._id}
                      className="bg-white rounded-2xl shadow-lg border border-blue-100/50 overflow-hidden transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl animate-fadeInUp"
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      {/* Header */}
                      <div className={`bg-gradient-to-r ${getNoticeTypeColor(notice.notice_type)} px-6 py-6 text-white`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-3xl">{getNoticeTypeIcon(notice.notice_type)}</span>
                          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getNoticeTypeBadgeColor(notice.notice_type)} bg-white/90`}>
                            {notice.notice_type.toUpperCase()}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold">Notice #{filteredNotices.length - idx}</h3>
                      </div>

                      {/* Content */}
                      <div className="p-6 space-y-4">
                        <div>
                          <p className="font-semibold text-gray-600 text-sm mb-1">📝 Description</p>
                          <p className="text-gray-900 text-sm line-clamp-3">{notice.description}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <p className="font-semibold text-gray-600 mb-1">📅 Date</p>
                            <p className="text-gray-900">{day}, {date}</p>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-600 mb-1">⏰ Time</p>
                            <p className="text-gray-900">{time}</p>
                          </div>
                        </div>

                        <div className="bg-blue-50 p-3 rounded-lg flex items-center gap-2">
                          <span className="text-2xl">{getFileIcon(notice.file?.contentType)}</span>
                          <div>
                            <p className="font-bold text-gray-900 text-sm">{getFileType(notice.file?.contentType)}</p>
                            <p className="text-xs text-gray-600">Attached File</p>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="px-6 py-4 border-t border-blue-100 bg-blue-50/50 flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedNotice(notice);
                            setShowModal(true);
                          }}
                          className="flex-1 px-4 py-3 rounded-lg font-bold bg-blue-500 hover:bg-blue-600 text-white transition-all text-sm"
                        >
                          👁️ View
                        </button>
                        <button
                          onClick={() => handleDownload(notice)}
                          className="flex-1 px-4 py-3 rounded-lg font-bold bg-green-500 hover:bg-green-600 text-white transition-all text-sm"
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
        </div>
      </div>

      {/* Preview Modal */}
      {showModal && selectedNotice && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/60 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-blue-100">

            {/* Modal Header */}
            <div className={`bg-gradient-to-r ${getNoticeTypeColor(selectedNotice.notice_type)} px-8 py-6 flex items-center justify-between sticky top-0 z-10`}>
              <div>
                <h2 className="text-2xl font-bold text-white">📄 Notice Details</h2>
                <p className="text-sm text-white/90">{selectedNotice.notice_type.toUpperCase()}</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-all"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-8">
              <div className="mb-6 p-4 bg-blue-50 rounded-xl">
                <p className="text-sm font-bold text-gray-700 mb-2">📝 Description</p>
                <p className="text-gray-900">{selectedNotice.description}</p>
              </div>

              <div className="mb-6 p-4 bg-blue-50 rounded-xl">
                <p className="text-sm font-bold text-gray-700 mb-2">📅 Posted On</p>
                <p className="text-gray-900">
                  {formatDateTime(selectedNotice.createdAt).day}, {formatDateTime(selectedNotice.createdAt).date} at {formatDateTime(selectedNotice.createdAt).time}
                </p>
              </div>

              <div className="mb-6 p-4 bg-blue-50 rounded-xl">
                <p className="text-sm font-bold text-gray-700 mb-2">📎 Attached File</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getFileIcon(selectedNotice.file?.contentType)}</span>
                  <p className="text-gray-900 font-bold">{getFileType(selectedNotice.file?.contentType)}</p>
                </div>
              </div>

              {/* File Preview */}
              <div className="bg-gray-100 rounded-2xl p-6 flex items-center justify-center min-h-64 mb-6">
                {renderPreview(selectedNotice) ? (
                  renderPreview(selectedNotice)
                ) : (
                  <div className="text-center">
                    <p className="text-5xl mb-2">{getFileIcon(selectedNotice.file?.contentType)}</p>
                    <p className="text-gray-600">Preview not available</p>
                  </div>
                )}
              </div>

              {/* Download Button */}
              <button
                onClick={() => {
                  handleDownload(selectedNotice);
                  setShowModal(false);
                }}
                className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold rounded-lg transition-all"
              >
                💾 Download File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Animations */}
      <style>{`
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
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp { animation: fadeInUp 0.6s ease-out forwards; }
      `}</style>
    </>
  );
};

export default NoticeToFaculty;
