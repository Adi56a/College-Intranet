import React, { useState, useRef } from 'react';
import { 
  FiUpload,
  FiFile,
  FiX,
  FiCheckCircle,
  FiAlertCircle,
  FiFileText,
  FiInfo,
  FiLock,
  FiZap
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
    <div className="inline-flex items-center gap-2">
      <div className="relative w-5 h-5">
        <div className="absolute inset-0 rounded-full border-2 border-white/30"></div>
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-white border-r-white animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
        </div>
      </div>
      <span>Uploading...</span>
    </div>
  );
};

const CreateNotice = () => {
  const [file, setFile] = useState(null);
  const [noticeType, setNoticeType] = useState('general');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const fileInputRef = useRef(null);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = [
    'application/pdf', 
    'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
    'application/vnd.ms-excel', 
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 
    'text/plain', 
    'image/jpeg', 
    'image/png'
  ];

  const noticeTypes = [
    { value: 'general', label: 'General', icon: <MdEventNote size={20} /> },
    { value: 'attendance', label: 'Attendance', icon: <MdEventAvailable size={20} /> },
    { value: 'holiday', label: 'Holiday', icon: <MdHolidayVillage size={20} /> },
    { value: 'exam', label: 'Exam', icon: <MdSchool size={20} /> },
    { value: 'placement', label: 'Placement', icon: <MdWork size={20} /> }
  ];

  const getFileIcon = (fileType) => {
    if (!fileType) return <AiOutlineFile size={48} className="text-slate-400" />;
    const type = fileType.toLowerCase();
    if (type.includes('pdf')) return <AiOutlineFilePdf size={48} className="text-red-500" />;
    if (type.includes('word') || type.includes('document')) return <AiOutlineFileWord size={48} className="text-blue-600" />;
    if (type.includes('sheet') || type.includes('excel')) return <AiOutlineFileExcel size={48} className="text-green-600" />;
    if (type.includes('image')) return <AiOutlineFileImage size={48} className="text-purple-500" />;
    if (type.includes('text')) return <FiFileText size={48} className="text-slate-600" />;
    return <AiOutlineFile size={48} className="text-slate-400" />;
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (!selectedFile) return;

    // Validate file size
    if (selectedFile.size > MAX_FILE_SIZE) {
      setMessage({ type: 'error', text: 'File size must be less than 10MB' });
      return;
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      setMessage({ type: 'error', text: 'File type not allowed. Please upload PDF, Word, Excel, Text, or Image files.' });
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
      setMessage({ type: 'error', text: 'Please select a file to upload' });
      return;
    }

    if (!noticeType) {
      setMessage({ type: 'error', text: 'Please select a notice type' });
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
      formData.append('notice_type', noticeType);
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
        setMessage({ type: 'error', text: data.message || 'Error uploading file' });
      } else {
        setMessage({ type: 'success', text: 'File uploaded successfully!' });
        setFile(null);
        setNoticeType('general');
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

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
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
            <div className="flex items-center gap-3 mb-2">
              <FiUpload size={32} className="text-blue-600" />
              <h1 className="text-3xl lg:text-4xl font-bold text-slate-900">
                Create Notice
              </h1>
            </div>
            <p className="text-slate-600">Share important documents with your institution</p>
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

          {/* Main Form Container */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 lg:p-8">
            
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* File Upload Area */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                  <FiFile size={14} />
                  Select File <span className="text-red-500">*</span>
                </label>
                
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="relative border-2 border-dashed border-slate-300 rounded-xl p-8 transition-all hover:border-blue-400 hover:bg-blue-50 cursor-pointer group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={loading}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png"
                  />
                  
                  <div className="text-center">
                    <div className="mb-4 flex justify-center group-hover:scale-110 transition-transform">
                      {file ? getFileIcon(file.type) : <FiFile size={48} className="text-slate-400" />}
                    </div>
                    
                    {file ? (
                      <>
                        <p className="text-slate-900 font-semibold text-lg mb-2">{file.name}</p>
                        <p className="text-slate-600 text-sm mb-4">{formatFileSize(file.size)}</p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFile(null);
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-lg transition-all text-sm font-semibold"
                        >
                          <FiX size={16} />
                          Remove File
                        </button>
                      </>
                    ) : (
                      <>
                        <p className="text-slate-900 font-semibold text-lg mb-2">Drag & drop your file here</p>
                        <p className="text-slate-600 text-sm mb-3">or click to browse</p>
                        <p className="text-slate-500 text-xs">Supported: PDF, Word, Excel, Text, Images (Max 10MB)</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Notice Type Dropdown */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                  <MdEventNote size={14} />
                  Notice Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={noticeType}
                  onChange={(e) => setNoticeType(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                >
                  {noticeTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                  <FiFileText size={14} />
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter a detailed description for this notice..."
                  rows="4"
                  maxLength={500}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none transition-all resize-none"
                />
                <div className="flex justify-between items-center mt-2 text-xs text-slate-500">
                  <span>Minimum 10 characters</span>
                  <span>{description.length} / 500</span>
                </div>
              </div>

              {/* File Info Box */}
              {file && (
                <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <FiInfo className="text-blue-600 flex-shrink-0" size={20} />
                  <div className="flex-1">
                    <p className="text-blue-900 font-medium text-sm">File ready for upload</p>
                    <p className="text-blue-700 text-xs mt-1">
                      {file.type || 'Unknown type'} • {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !file || !description.trim()}
                className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-white transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] ${
                  loading || !file || !description.trim()
                    ? 'bg-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                }`}
              >
                {loading ? (
                  <LoadingSpinner />
                ) : (
                  <>
                    <FiUpload size={20} />
                    Upload Notice
                  </>
                )}
              </button>

              {/* Progress Bar */}
              {loading && (
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full transition-all duration-300 animate-pulse" style={{ width: '75%' }}></div>
                </div>
              )}
            </form>
          </div>

          {/* Info Cards */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div className="p-5 bg-white border border-slate-200 rounded-xl hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FiFile size={20} className="text-purple-600" />
                </div>
                <p className="font-bold text-slate-900 text-sm">Multiple Formats</p>
              </div>
              <p className="text-xs text-slate-600">PDF, Word, Excel, Images</p>
            </div>

            <div className="p-5 bg-white border border-slate-200 rounded-xl hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FiLock size={20} className="text-blue-600" />
                </div>
                <p className="font-bold text-slate-900 text-sm">Secure Upload</p>
              </div>
              <p className="text-xs text-slate-600">All data encrypted</p>
            </div>

            <div className="p-5 bg-white border border-slate-200 rounded-xl hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <FiZap size={20} className="text-green-600" />
                </div>
                <p className="font-bold text-slate-900 text-sm">Fast & Reliable</p>
              </div>
              <p className="text-xs text-slate-600">Up to 10MB files</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateNotice;
