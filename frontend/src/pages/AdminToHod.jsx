import React, { useState } from 'react';
import { 
  FiBell,
  FiUpload,
  FiFile,
  FiCheckCircle,
  FiAlertCircle,
  FiFileText,
  FiInfo
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
    <div className="relative w-5 h-5">
      {/* Outer rotating ring */}
      <div className="absolute inset-0 rounded-full border-2 border-white/30"></div>
      
      {/* Animated gradient ring */}
      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-white border-r-white animate-spin"></div>
      
      {/* Inner pulsing dot */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
      </div>
    </div>
  );
};

const AdminToHodUpload = () => {
  const [description, setDescription] = useState('');
  const [noticeType, setNoticeType] = useState('general');
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const noticeTypes = [
    { value: 'general', label: 'General', icon: <MdEventNote size={20} /> },
    { value: 'attendance', label: 'Attendance', icon: <MdEventAvailable size={20} /> },
    { value: 'holiday', label: 'Holiday', icon: <MdHolidayVillage size={20} /> },
    { value: 'exam', label: 'Exam', icon: <MdSchool size={20} /> },
    { value: 'placement', label: 'Placement', icon: <MdWork size={20} /> }
  ];

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setMessage({ type: '', text: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!description.trim()) {
      setMessage({ type: 'error', text: 'Description is required' });
      return;
    }
    if (!file) {
      setMessage({ type: 'error', text: 'Please select a file' });
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: '', text: '' });

      const formData = new FormData();
      formData.append('description', description.trim());
      formData.append('notice_type', noticeType);
      formData.append('file', file);

      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:3000/admintohod', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage({ type: 'error', text: data.message || 'Upload failed' });
      } else {
        setMessage({ type: 'success', text: 'Notice uploaded successfully!' });
        // Reset form
        setDescription('');
        setNoticeType('general');
        setFile(null);
        setFileName('');
        // Reset file input
        document.getElementById('fileInput').value = '';
        
        // Clear success message after 3 seconds
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = () => {
    if (!fileName) return <FiFile size={32} className="text-slate-400" />;
    const ext = fileName.split('.').pop().toLowerCase();
    if (['pdf'].includes(ext)) return <AiOutlineFilePdf size={32} className="text-red-500" />;
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return <AiOutlineFileImage size={32} className="text-purple-500" />;
    if (['doc', 'docx'].includes(ext)) return <AiOutlineFileWord size={32} className="text-blue-600" />;
    if (['xls', 'xlsx'].includes(ext)) return <AiOutlineFileExcel size={32} className="text-green-600" />;
    if (['txt'].includes(ext)) return <FiFileText size={32} className="text-slate-600" />;
    return <AiOutlineFile size={32} className="text-slate-400" />;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
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
              <FiBell size={32} className="text-blue-600" />
              <h1 className="text-3xl lg:text-4xl font-bold text-slate-900">
                Admin to HOD Notice
              </h1>
            </div>
            <p className="text-slate-600">Upload important notices for HODs</p>
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

          {/* Upload Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 lg:p-8">
            
            {/* Description */}
            <div className="mb-6">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                <FiFileText size={16} />
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter notice description..."
                rows="4"
                maxLength={500}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none transition-all resize-none"
                disabled={loading}
              />
              <div className="flex justify-between items-center mt-2 text-xs text-slate-500">
                <span>Minimum 10 characters</span>
                <span>{description.length} / 500</span>
              </div>
            </div>

            {/* Notice Type */}
            <div className="mb-6">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                <MdEventNote size={16} />
                Notice Type <span className="text-red-500">*</span>
              </label>
              <select
                value={noticeType}
                onChange={(e) => setNoticeType(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-200 text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                disabled={loading}
              >
                {noticeTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* File Upload */}
            <div className="mb-8">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                <FiUpload size={16} />
                Upload File <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="fileInput"
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={loading}
                  accept="*/*"
                />
                <label
                  htmlFor="fileInput"
                  className={`flex items-center gap-4 px-6 py-5 rounded-xl border-2 border-dashed transition-all ${
                    fileName
                      ? 'border-blue-400 bg-blue-50'
                      : 'border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50'
                  } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex-shrink-0">
                    {getFileIcon()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 truncate">
                      {fileName || 'Choose a file'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {file ? formatFileSize(file.size) : 'All file types supported (PDF, Images, Word, Excel, etc.)'}
                    </p>
                  </div>
                  {fileName && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setFile(null);
                        setFileName('');
                        document.getElementById('fileInput').value = '';
                      }}
                      className="flex-shrink-0 p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-all"
                      disabled={loading}
                    >
                      <FiAlertCircle size={16} />
                    </button>
                  )}
                </label>
              </div>
            </div>

            {/* File Info */}
            {file && (
              <div className="mb-6 p-4 rounded-xl bg-blue-50 border border-blue-200 flex items-center gap-3">
                <FiCheckCircle className="text-blue-600 flex-shrink-0" size={20} />
                <div className="flex-1">
                  <p className="text-blue-900 font-medium text-sm">File ready for upload</p>
                  <p className="text-blue-700 text-xs mt-1">{file.type || 'Unknown type'} • {formatFileSize(file.size)}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !file || !description.trim()}
              className={`w-full flex items-center justify-center gap-3 py-4 rounded-xl font-bold text-white transition-all ${
                loading || !file || !description.trim()
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              {loading ? (
                <>
                  <LoadingSpinner />
                  <span>Uploading Notice...</span>
                </>
              ) : (
                <>
                  <FiUpload size={20} />
                  <span>Upload Notice</span>
                </>
              )}
            </button>
          </form>

          {/* Info Card */}
          <div className="mt-6 bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-3">
              <FiInfo size={20} className="text-blue-600" />
              <h3 className="font-bold text-slate-900">Upload Guidelines</h3>
            </div>
            <ul className="text-sm text-slate-600 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>All file types are supported (PDF, Images, Word, Excel, etc.)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Ensure description is clear and concise (minimum 10 characters)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Select appropriate notice type for better organization</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Large files may take longer to upload</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminToHodUpload;
