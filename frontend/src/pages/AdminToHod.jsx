import React, { useState } from 'react';
import Header from '../components/Header';

const AdminToHodUpload = () => {
  const [description, setDescription] = useState('');
  const [noticeType, setNoticeType] = useState('general');
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!description.trim()) {
      setMessage({ type: 'error', text: '❌ Description is required' });
      return;
    }
    if (!file) {
      setMessage({ type: 'error', text: '❌ Please select a file' });
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
        setMessage({ type: 'error', text: data.message || '❌ Upload failed' });
      } else {
        setMessage({ type: 'success', text: '✅ Notice uploaded successfully!' });
        // Reset form
        setDescription('');
        setNoticeType('general');
        setFile(null);
        setFileName('');
        // Reset file input
        document.getElementById('fileInput').value = '';
      }
    } catch (error) {
      console.error('Upload error:', error);
      setMessage({ type: 'error', text: '❌ Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = () => {
    if (!fileName) return '📁';
    const ext = fileName.split('.').pop().toLowerCase();
    if (['pdf'].includes(ext)) return '📕';
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return '🖼️';
    if (['doc', 'docx'].includes(ext)) return '📘';
    if (['xls', 'xlsx'].includes(ext)) return '📊';
    if (['txt'].includes(ext)) return '📄';
    return '📦';
  };

  return (
    <>
      <Header />
      
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-indigo-100 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              📢 Admin to HOD Notice
            </h1>
            <p className="text-gray-600">Upload important notices for HODs</p>
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

          {/* Upload Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl border border-blue-100/50 p-8">
            
            {/* Description */}
            <div className="mb-6">
              <label className="block text-gray-700 font-bold mb-2">
                📝 Description *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter notice description..."
                rows="4"
                className="w-full px-4 py-3 rounded-lg border border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all resize-none"
                disabled={loading}
              />
            </div>

            {/* Notice Type */}
            <div className="mb-6">
              <label className="block text-gray-700 font-bold mb-2">
                🏷️ Notice Type *
              </label>
              <select
                value={noticeType}
                onChange={(e) => setNoticeType(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                disabled={loading}
              >
                <option value="general">📁 General</option>
                <option value="attendance">✅ Attendance</option>
                <option value="holiday">🏖️ Holiday</option>
                <option value="exam">📝 Exam</option>
                <option value="placement">💼 Placement</option>
              </select>
            </div>

            {/* File Upload */}
            <div className="mb-8">
              <label className="block text-gray-700 font-bold mb-2">
                📎 Upload File *
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
                  className={`flex items-center justify-center gap-3 px-6 py-4 rounded-lg border-2 border-dashed transition-all cursor-pointer ${
                    fileName
                      ? 'border-blue-400 bg-blue-50'
                      : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'
                  } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span className="text-3xl">{getFileIcon()}</span>
                  <div className="text-left">
                    <p className="font-semibold text-gray-700">
                      {fileName || 'Choose a file'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {fileName ? 'Click to change' : 'All file types supported'}
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-lg font-bold text-lg transition-all ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                  Uploading...
                </span>
              ) : (
                '🚀 Upload Notice'
              )}
            </button>
          </form>

          {/* Info Card */}
          <div className="mt-6 bg-blue-50 rounded-2xl p-6 border border-blue-200">
            <h3 className="font-bold text-blue-900 mb-2">ℹ️ Upload Guidelines</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• All file types are supported (PDF, Images, Word, Excel, etc.)</li>
              <li>• Ensure description is clear and concise</li>
              <li>• Select appropriate notice type for better organization</li>
              <li>• Large files may take longer to upload</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style>{`
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
      `}</style>
    </>
  );
};

export default AdminToHodUpload;
