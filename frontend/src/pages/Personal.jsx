import React, { useState, useEffect, useRef } from 'react';
import { 
  FiFolder,
  FiUpload,
  FiDownload,
  FiSearch,
  FiX,
  FiCheckCircle,
  FiAlertCircle,
  FiFile,
  FiFileText,
  FiCalendar
} from 'react-icons/fi';
import { 
  AiOutlineFilePdf, 
  AiOutlineFileWord, 
  AiOutlineFileExcel, 
  AiOutlineFileImage,
  AiOutlineFile
} from 'react-icons/ai';
import { 
  MdVideoLibrary,
  MdAudiotrack,
  MdArchive
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
      
      <p className="mt-4 text-slate-600 font-medium animate-pulse">Loading files...</p>
    </div>
  );
};

const Personal = () => {
  const [files, setFiles] = useState([]);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingFiles, setFetchingFiles] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
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
        setMessage({ type: 'error', text: data.message || 'Error fetching files' });
      } else {
        setFiles(data.personalFiles || []);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
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
      setMessage({ type: 'error', text: 'Title is required' });
      return;
    }

    if (!file) {
      setMessage({ type: 'error', text: 'Please select a file' });
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
        setMessage({ type: 'error', text: data.message || 'Failed to upload file' });
      } else {
        setMessage({ type: 'success', text: 'File uploaded successfully!' });
        setTitle('');
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        fetchPersonalFiles();
        
        // Clear success message after 3 seconds
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (contentType, size = 40) => {
    if (!contentType) return <AiOutlineFile size={size} className="text-slate-400" />;
    const type = contentType.toLowerCase();
    if (type.includes('pdf')) return <AiOutlineFilePdf size={size} className="text-red-500" />;
    if (type.includes('image')) return <AiOutlineFileImage size={size} className="text-purple-500" />;
    if (type.includes('word') || type.includes('document')) return <AiOutlineFileWord size={size} className="text-blue-600" />;
    if (type.includes('sheet') || type.includes('excel')) return <AiOutlineFileExcel size={size} className="text-green-600" />;
    if (type.includes('text')) return <FiFileText size={size} className="text-slate-600" />;
    if (type.includes('video')) return <MdVideoLibrary size={size} className="text-pink-500" />;
    if (type.includes('audio')) return <MdAudiotrack size={size} className="text-orange-500" />;
    if (type.includes('zip') || type.includes('compressed')) return <MdArchive size={size} className="text-yellow-600" />;
    return <AiOutlineFile size={size} className="text-slate-400" />;
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

      setMessage({ type: 'success', text: 'File downloaded successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 2000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Download failed' });
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
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Filter files based on search query
  const filteredFiles = files.filter(file =>
    file.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                Personal Files
              </h1>
            </div>
            <p className="text-slate-600">Upload and manage your personal documents</p>
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* UPLOAD FORM */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-8">
                <div className="flex items-center gap-2 mb-6">
                  <FiUpload size={20} className="text-blue-600" />
                  <h2 className="text-xl font-bold text-slate-900">Upload File</h2>
                </div>

                <form onSubmit={handleUpload} className="space-y-4">
                  {/* Title */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                      <FiFileText size={14} />
                      File Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter file title..."
                      maxLength={100}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                      disabled={loading}
                    />
                    <p className="text-xs text-slate-500 mt-1">{title.length}/100 characters</p>
                  </div>

                  {/* File Upload */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                      <FiFile size={14} />
                      Select File <span className="text-red-500">*</span>
                    </label>
                    <div className="relative border-2 border-dashed border-slate-300 rounded-xl p-6 hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer">
                      <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={loading}
                      />

                      <div className="text-center">
                        <div className="mb-3 flex justify-center">
                          {file ? getFileIcon(file.type, 48) : <FiFolder size={48} className="text-slate-400" />}
                        </div>

                        {file ? (
                          <>
                            <p className="font-semibold text-slate-900 break-all text-sm mb-2">
                              {file.name}
                            </p>
                            <p className="text-xs text-slate-600">
                              {formatFileSize(file.size)}
                            </p>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setFile(null);
                                if (fileInputRef.current) fileInputRef.current.value = '';
                              }}
                              className="mt-3 inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-xs font-semibold transition-all"
                            >
                              <FiX size={14} />
                              Remove
                            </button>
                          </>
                        ) : (
                          <>
                            <p className="font-semibold text-slate-900 mb-1">
                              Click to browse
                            </p>
                            <p className="text-xs text-slate-500">
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
                    className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold transition-all ${
                      loading || !file || !title.trim()
                        ? 'bg-slate-400 cursor-not-allowed text-white'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]'
                    }`}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <FiUpload size={20} />
                        <span>Upload File</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* FILES GALLERY */}
            <div className="lg:col-span-2">
              {/* Search Bar */}
              <div className="mb-6 bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex-1 relative">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                      type="text"
                      placeholder="Search files by title..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                    />
                  </div>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold transition-all"
                    >
                      <FiX size={16} />
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Files Count */}
              {!fetchingFiles && filteredFiles.length > 0 && (
                <div className="mb-6 p-4 bg-white rounded-xl border border-slate-200 text-center">
                  <p className="font-bold text-slate-900">
                    {filteredFiles.length} File{filteredFiles.length !== 1 ? 's' : ''} {searchQuery ? 'Found' : 'Uploaded'}
                  </p>
                </div>
              )}

              {/* Files Grid */}
              <div>
                {fetchingFiles ? (
                  <div className="flex flex-col items-center justify-center py-32">
                    <LoadingSpinner />
                  </div>
                ) : filteredFiles.length === 0 ? (
                  <div className="text-center py-32 bg-white rounded-2xl border-2 border-slate-200">
                    {searchQuery ? (
                      <>
                        <FiSearch size={64} className="mx-auto mb-4 text-slate-300" />
                        <p className="text-lg font-semibold text-slate-600 mb-2">
                          No files match "{searchQuery}"
                        </p>
                        <p className="text-sm text-slate-500">
                          Try a different search term
                        </p>
                      </>
                    ) : (
                      <>
                        <FiFolder size={64} className="mx-auto mb-4 text-slate-300" />
                        <p className="text-lg font-semibold text-slate-600 mb-2">
                          No files uploaded yet
                        </p>
                        <p className="text-sm text-slate-500">
                          Upload your first file using the form
                        </p>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredFiles.map((file, index) => (
                      <div
                        key={file._id}
                        className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-blue-300 transition-all"
                      >
                        {/* File Icon & Title */}
                        <div className="flex items-start gap-4 mb-4">
                          <div className="flex-shrink-0">
                            {getFileIcon(file.file.contentType, 48)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-lg mb-2 break-words text-slate-900">
                              {file.title}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-slate-600">
                              <FiCalendar size={12} />
                              <span>{formatDate(file.createdAt)}</span>
                            </div>
                          </div>
                        </div>

                        {/* File Info */}
                        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 mb-4">
                          <p className="text-xs font-mono truncate text-slate-700">
                            {file.file.contentType}
                          </p>
                        </div>

                        {/* Download Button */}
                        <button
                          onClick={() => handleDownload(file, index)}
                          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-all"
                        >
                          <FiDownload size={18} />
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
    </>
  );
};

export default Personal;
