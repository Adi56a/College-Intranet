import React, { useState, useEffect } from 'react';
import { 
  FiFolder, 
  FiDownload, 
  FiEye, 
  FiX,
  FiCalendar,
  FiClock,
  FiFileText,
  FiCheckCircle,
  FiAlertCircle
} from 'react-icons/fi';
import { 
  AiOutlineFilePdf, 
  AiOutlineFileWord, 
  AiOutlineFileExcel, 
  AiOutlineFileImage,
  AiOutlineFile
} from 'react-icons/ai';
import Header from '../components/Header';

const MyUploads = () => {
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [selectedUpload, setSelectedUpload] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

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
    if (contentType.includes('pdf')) return <AiOutlineFilePdf size={40} className="text-red-500" />;
    if (contentType.includes('image') || contentType.includes('jpeg') || contentType.includes('jpg') || contentType.includes('png')) 
      return <AiOutlineFileImage size={40} className="text-purple-500" />;
    if (contentType.includes('word') || contentType.includes('document')) return <AiOutlineFileWord size={40} className="text-blue-600" />;
    if (contentType.includes('sheet') || contentType.includes('excel')) return <AiOutlineFileExcel size={40} className="text-green-600" />;
    if (contentType.includes('text')) return <FiFileText size={40} className="text-slate-600" />;
    return <AiOutlineFile size={40} className="text-slate-400" />;
  };

  const getFileType = (contentType) => {
    if (contentType.includes('pdf')) return 'PDF Document';
    if (contentType.includes('jpeg') || contentType.includes('jpg')) return 'JPEG Image';
    if (contentType.includes('png')) return 'PNG Image';
    if (contentType.includes('word') || contentType.includes('document')) return 'Word Document';
    if (contentType.includes('sheet') || contentType.includes('excel')) return 'Excel Spreadsheet';
    if (contentType.includes('text')) return 'Text File';
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
        setMessage({ type: 'error', text: 'File data not available' });
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

      link.download = `upload_${idx + 1}${extension}`;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);

      setMessage({ type: 'success', text: 'File downloaded successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Download error:', error);
      setMessage({ type: 'error', text: 'Error downloading file' });
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
            className="max-w-full max-h-96 rounded-xl shadow-lg"
          />
        );
      }
      
      if (upload.file.contentType.includes('pdf')) {
        return (
          <iframe
            src={`data:${upload.file.contentType};base64,${base64Data}`}
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
              <FiFolder size={32} className="text-blue-600" />
              <h1 className="text-3xl lg:text-4xl font-bold text-slate-900">
                My Uploads
              </h1>
            </div>
            <p className="text-slate-600">View and manage your submitted assignments</p>
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

          {/* Loading State */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <div className="animate-spin h-16 w-16 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
              <p className="text-slate-600">Loading your uploads...</p>
            </div>
          ) : !studentData ? (
            <div className="text-center py-32 bg-white rounded-2xl border border-slate-200">
              <FiAlertCircle size={64} className="mx-auto mb-4 text-red-500" />
              <p className="text-slate-600 text-lg">Error loading your data</p>
            </div>
          ) : (
            <>
              {/* Student Info Section */}
              <div className="mb-8 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Student Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="text-xs font-semibold text-slate-600 mb-1">Name</p>
                    <p className="text-slate-900 font-bold">{studentData.name}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="text-xs font-semibold text-slate-600 mb-1">Roll Number</p>
                    <p className="text-slate-900 font-bold">{studentData.rollNumber}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="text-xs font-semibold text-slate-600 mb-1">Department</p>
                    <p className="text-slate-900 font-bold">{studentData.department}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="text-xs font-semibold text-slate-600 mb-1">Email</p>
                    <p className="text-slate-900 font-bold text-xs break-all">{studentData.email}</p>
                  </div>
                </div>
              </div>

              {/* Uploads Section */}
              {!studentData.uploads || studentData.uploads.length === 0 ? (
                <div className="text-center py-32 bg-white rounded-2xl border border-slate-200">
                  <FiFolder size={64} className="mx-auto mb-4 text-slate-300" />
                  <p className="text-slate-600 text-lg font-semibold mb-2">No uploads yet</p>
                  <p className="text-sm text-slate-500">Your submitted assignments will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">
                    Submissions ({studentData.uploads.length})
                  </h2>

                  {studentData.uploads
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .map((upload, idx) => {
                      const { day, date, time } = formatDateTime(upload.createdAt);
                      return (
                        <div
                          key={idx}
                          className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-blue-300 transition-all"
                        >
                          {/* Upload Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-4">
                              <div className="flex-shrink-0">
                                {getFileIcon(upload.file.contentType)}
                              </div>
                              <div>
                                <p className="font-bold text-lg text-slate-900">
                                  {getFileType(upload.file.contentType)}
                                </p>
                                <div className="flex items-center gap-4 text-sm text-slate-600 mt-1">
                                  <span className="flex items-center gap-1">
                                    <FiCalendar size={14} />
                                    {day}, {date}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <FiClock size={14} />
                                    {time}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 border border-blue-200 text-blue-700">
                              #{idx + 1}
                            </span>
                          </div>

                          {/* Description */}
                          <div className="mb-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                            <div className="flex items-center gap-2 mb-2">
                              <FiFileText size={16} className="text-slate-600" />
                              <p className="text-sm font-semibold text-slate-700">Description</p>
                            </div>
                            <p className="text-sm text-slate-700 leading-relaxed">
                              {upload.description}
                            </p>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-3">
                            <button
                              onClick={() => {
                                setSelectedUpload(upload);
                                setShowPreviewModal(true);
                              }}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-all"
                            >
                              <FiEye size={18} />
                              Preview
                            </button>
                            <button
                              onClick={() => handleDownload(upload, idx)}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold bg-green-600 hover:bg-green-700 text-white transition-all"
                            >
                              <FiDownload size={18} />
                              Download
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {showPreviewModal && selectedUpload && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">

            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between sticky top-0 z-10 rounded-t-2xl">
              <div className="flex items-center gap-2">
                <FiEye size={24} className="text-white" />
                <h2 className="text-xl font-bold text-white">File Preview</h2>
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

              {/* File Info */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-xs font-semibold text-slate-600 mb-1">File Type</p>
                  <p className="text-slate-900 font-bold">{getFileType(selectedUpload.file.contentType)}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-xs font-semibold text-slate-600 mb-1">Uploaded On</p>
                  <p className="text-slate-900 font-bold">{formatDateTime(selectedUpload.createdAt).fullDate}</p>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <FiFileText size={16} className="text-slate-600" />
                  <p className="font-bold text-sm text-slate-700">Description</p>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">{selectedUpload.description}</p>
              </div>

              {/* Preview */}
              <div className="rounded-xl bg-slate-100 p-6 flex items-center justify-center min-h-64">
                {renderPreview(selectedUpload) ? (
                  renderPreview(selectedUpload)
                ) : (
                  <div className="text-center">
                    <div className="mb-4">
                      {getFileIcon(selectedUpload.file.contentType)}
                    </div>
                    <p className="text-slate-600">Preview not available for this file type</p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-200 flex gap-3 bg-slate-50 rounded-b-2xl">
              <button
                onClick={() => setShowPreviewModal(false)}
                className="flex-1 px-4 py-3 rounded-xl font-semibold bg-slate-200 hover:bg-slate-300 text-slate-900 transition-all"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleDownload(selectedUpload, 0);
                  setShowPreviewModal(false);
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold bg-green-600 hover:bg-green-700 text-white transition-all"
              >
                <FiDownload size={18} />
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MyUploads;
