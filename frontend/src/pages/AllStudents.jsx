import React, { useState, useEffect } from 'react';
import Header from '../components/Header';


// Subject icon and color mapping (no hardcoded folders)
const SUBJECT_CONFIG = {
  'mathematics': { label: 'Mathematics', icon: '📐', color: 'from-blue-400 to-blue-600' },
  'physics': { label: 'Physics', icon: '⚛️', color: 'from-purple-400 to-purple-600' },
  'chemistry': { label: 'Chemistry', icon: '🧪', color: 'from-red-400 to-red-600' },
  'computer_science': { label: 'Computer Science', icon: '💻', color: 'from-green-400 to-green-600' },
  'english': { label: 'English', icon: '📚', color: 'from-pink-400 to-pink-600' },
  'general': { label: 'General', icon: '📁', color: 'from-gray-400 to-gray-600' }
};


const AllStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [uploadsLoading, setUploadsLoading] = useState(false);
  const [selectedUpload, setSelectedUpload] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState('general');
  const [dynamicFolders, setDynamicFolders] = useState([]);
  const [theme, setTheme] = useState('light');


  useEffect(() => {
    fetchStudents();
  }, []);


  // Generate random private IP address (192.168.x.x or 10.x.x.x)
  const generateRandomPrivateIP = () => {
    const rand = Math.random();
    if (rand < 0.7) {
      // 192.168.x.x (most common private range)
      const octet3 = Math.floor(Math.random() * 256);
      const octet4 = Math.floor(Math.random() * 256);
      return `192.168.${octet3}.${octet4}`;
    } else {
      // 10.x.x.x (another common private range)
      const octet2 = Math.floor(Math.random() * 256);
      const octet3 = Math.floor(Math.random() * 256);
      const octet4 = Math.floor(Math.random() * 256);
      return `10.${octet2}.${octet3}.${octet4}`;
    }
  };


  const fetchStudents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:3000/api/student/getAllStudents', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });


      const data = await response.json();


      if (!response.ok) {
        setMessage({ type: 'error', text: data.message || 'Error fetching students' });
      } else {
        setStudents(data.students || []);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };


  // Generate dynamic folders based on actual subjects in uploads
  const generateDynamicFolders = (uploads) => {
    const subjectsSet = new Set();
    
    uploads.forEach(upload => {
      const subject = upload.subject || 'general';
      subjectsSet.add(subject);
    });


    // Always include 'general' even if empty
    subjectsSet.add('general');


    const folders = Array.from(subjectsSet).map(subject => ({
      value: subject,
      label: SUBJECT_CONFIG[subject]?.label || subject.charAt(0).toUpperCase() + subject.slice(1),
      icon: SUBJECT_CONFIG[subject]?.icon || '📁',
      color: SUBJECT_CONFIG[subject]?.color || 'from-gray-400 to-gray-600'
    }));


    // Sort folders: general first, then others alphabetically
    return folders.sort((a, b) => {
      if (a.value === 'general') return -1;
      if (b.value === 'general') return 1;
      return a.label.localeCompare(b.label);
    });
  };


  const fetchStudentUploads = async (studentId) => {
    try {
      setUploadsLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:3000/api/student/getStudentUploads/${studentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });


      const data = await response.json();


      if (!response.ok) {
        setMessage({ type: 'error', text: data.message || 'Error fetching uploads' });
        return;
      }


      // Add random IP to each upload (ignoring any IP from database)
      const uploadsWithIP = (data.student.uploadID || []).map(upload => ({
        ...upload,
        randomIP: generateRandomPrivateIP() // Generate random IP for display
      }));


      const sortedStudent = {
        ...data.student,
        uploadID: uploadsWithIP.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        )
      };
      
      // Generate dynamic folders from actual uploads
      const folders = generateDynamicFolders(sortedStudent.uploadID);
      setDynamicFolders(folders);
      
      setSelectedStudent(sortedStudent);
      setSelectedFolder('general');
      setShowModal(true);
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setUploadsLoading(false);
    }
  };


  // Group uploads by subject - dynamically based on actual subjects
  const groupUploadsBySubject = (uploads) => {
    const grouped = {};
    
    dynamicFolders.forEach(folder => {
      grouped[folder.value] = [];
    });


    uploads.forEach(upload => {
      const subject = upload.subject || 'general';
      if (!grouped[subject]) {
        grouped[subject] = [];
      }
      grouped[subject].push(upload);
    });


    return grouped;
  };


  const handleDownload = (upload, idx) => {
    try {
      if (!upload.file?.data) {
        setMessage({ type: 'error', text: '❌ File data not available' });
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
      else if (upload.file.contentType.includes('image')) extension = '.jpg';
      else if (upload.file.contentType.includes('word')) extension = '.docx';


      link.download = `submission_${idx}${extension}`;
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


  const getUniqueDepartments = () => {
    const departments = [...new Set(students.map(s => s.department))];
    return departments.sort();
  };


  const getDepartmentColor = (dept) => {
    const colors = {
      'AIML': 'from-blue-600 to-blue-700',
      'AIDS': 'from-purple-600 to-purple-700',
      'CSD': 'from-pink-600 to-pink-700',
      'CSME': 'from-cyan-600 to-cyan-700',
      'CSE': 'from-indigo-600 to-indigo-700'
    };
    return colors[dept] || 'from-gray-600 to-gray-700';
  };


  const getFileIcon = (contentType) => {
    if (!contentType) return '📦';
    const type = String(contentType).toLowerCase();
    if (type.includes('pdf')) return '📕';
    if (type.includes('image')) return '🖼️';
    if (type.includes('word')) return '📘';
    if (type.includes('sheet')) return '📊';
    if (type.includes('text')) return '📄';
    return '📦';
  };


  const getFileType = (contentType) => {
    if (!contentType) return 'File';
    const type = String(contentType).toLowerCase();
    if (type.includes('pdf')) return 'PDF';
    if (type.includes('image')) return 'Image';
    if (type.includes('word')) return 'Word';
    if (type.includes('sheet')) return 'Excel';
    if (type.includes('text')) return 'Text';
    return 'File';
  };


  const formatDateTime = (dateString) => {
    try {
      const date = new Date(dateString);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      const dateFormatted = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
      const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      
      return { day: dayName, date: dateFormatted, time: time, fullDate: `${dayName}, ${dateFormatted}` };
    } catch (e) {
      return { day: 'N/A', date: 'Invalid', time: 'N/A', fullDate: 'Invalid Date' };
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


      if (upload.file.contentType && upload.file.contentType.includes('image')) {
        return (
          <img
            src={`data:${upload.file.contentType};base64,${base64Data}`}
            alt="Preview"
            className="max-w-full max-h-96 rounded-2xl"
          />
        );
      }
      
      if (upload.file.contentType && upload.file.contentType.includes('pdf')) {
        return (
          <iframe
            src={`data:${upload.file.contentType};base64,${base64Data}`}
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


  const filteredAndSortedStudents = students
    .filter(student => {
      const matchesSearch = 
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFilter = filterDepartment ? student.department === filterDepartment : true;
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'roll') {
        return a.rollNumber.localeCompare(b.rollNumber);
      } else if (sortBy === 'department') {
        return a.department.localeCompare(b.department);
      }
      return 0;
    });


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


          {/* Header with Theme Toggle */}
          <div className="flex justify-between items-start mb-10">
            <div>
              <h1 className={`text-4xl md:text-5xl font-bold mb-2 ${
                isDark ? 'text-white' : 'bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent'
              }`}>
                👥 All Students
              </h1>
              <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>Manage and view student profiles</p>
            </div>


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


          {/* Search & Filter */}
          <div className={`mb-8 rounded-2xl p-6 border transition-all duration-300 ${
            isDark
              ? 'bg-gray-800/50 border-gray-700/50 backdrop-blur-xl'
              : 'bg-white border-blue-100/50 backdrop-blur-xl'
          }`}>
            <div className="flex flex-col md:flex-row gap-3">
              <input
                type="text"
                placeholder="🔍 Search by name, roll, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                  isDark
                    ? 'bg-gray-700/50 border border-gray-600/50 text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-cyan-500/20'
                    : 'bg-blue-50 border border-blue-200 text-gray-900 placeholder-gray-500 focus:border-cyan-500 focus:ring-cyan-500/10'
                } focus:outline-none focus:ring-2`}
              />


              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                  isDark
                    ? 'bg-gray-700/50 border border-gray-600/50 text-white focus:border-cyan-500 focus:ring-cyan-500/20'
                    : 'bg-blue-50 border border-blue-200 text-gray-900 focus:border-cyan-500 focus:ring-cyan-500/10'
                } focus:outline-none focus:ring-2`}
              >
                <option value="">📚 All Departments</option>
                {getUniqueDepartments().map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>


              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                  isDark
                    ? 'bg-gray-700/50 border border-gray-600/50 text-white focus:border-cyan-500 focus:ring-cyan-500/20'
                    : 'bg-blue-50 border border-blue-200 text-gray-900 focus:border-cyan-500 focus:ring-cyan-500/10'
                } focus:outline-none focus:ring-2`}
              >
                <option value="name">📝 By Name</option>
                <option value="roll">🏷️ By Roll</option>
                <option value="department">📚 By Dept</option>
              </select>
            </div>
          </div>


          {/* Loading */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <div className="animate-spin h-16 w-16 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
              <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>Loading students...</p>
            </div>
          ) : filteredAndSortedStudents.length === 0 ? (
            <div className={`text-center py-32 rounded-3xl border ${isDark ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white/50 border-blue-100'}`}>
              <p className="text-5xl mb-3">📭</p>
              <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>No students found</p>
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className={`mb-6 p-4 rounded-2xl text-center ${isDark ? 'bg-gray-800/50' : 'bg-blue-50'}`}>
                <p className={`text-lg font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  📊 {filteredAndSortedStudents.length} Student{filteredAndSortedStudents.length !== 1 ? 's' : ''}
                </p>
              </div>


              {/* Student Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAndSortedStudents.map((student, idx) => (
                  <div
                    key={student._id}
                    className={`rounded-2xl shadow-lg border overflow-hidden transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl animate-fadeInUp ${
                      isDark
                        ? 'bg-gray-800/50 border-gray-700/50'
                        : 'bg-white border-blue-100/50'
                    }`}
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    {/* Header */}
                    <div className={`bg-gradient-to-r ${getDepartmentColor(student.department)} px-6 py-6 text-white`}>
                      <h3 className="text-2xl font-bold mb-1">{student.name}</h3>
                      <p className="text-sm opacity-90">{student.department}</p>
                    </div>


                    {/* Content */}
                    <div className="p-6 space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className={`font-semibold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Roll No</p>
                          <p className={isDark ? 'text-white' : 'text-gray-900'}>{student.rollNumber}</p>
                        </div>
                        <div>
                          <p className={`font-semibold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Phone</p>
                          <p className={isDark ? 'text-white' : 'text-gray-900'}>{student.number}</p>
                        </div>
                      </div>


                      <div>
                        <p className={`font-semibold text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Email</p>
                        <p className={`text-xs break-all ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{student.email}</p>
                      </div>


                      <div className={`p-3 rounded-lg text-sm ${isDark ? 'bg-gray-700/50' : 'bg-blue-50'}`}>
                        <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                          📅 {new Date(student.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>


                    {/* Action Button */}
                    <div className={`px-6 py-4 border-t ${isDark ? 'border-gray-700/50 bg-gray-700/20' : 'border-blue-100 bg-blue-50/50'}`}>
                      <button
                        onClick={() => fetchStudentUploads(student._id)}
                        disabled={uploadsLoading}
                        className={`w-full px-4 py-3 rounded-lg font-bold transition-all text-sm ${
                          uploadsLoading
                            ? isDark ? 'bg-gray-700 cursor-not-allowed' : 'bg-gray-300 cursor-not-allowed'
                            : `bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white`
                        }`}
                      >
                        {uploadsLoading ? '⏳ Loading...' : '📂 View Submissions'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>


      {/* Submissions Modal - With Dynamic Folder Structure */}
      {showModal && selectedStudent && (
        <div className={`fixed inset-0 flex items-center justify-center z-50 p-4 animate-fadeIn ${
          isDark ? 'bg-black/70' : 'bg-black/60'
        }`}>
          <div className={`rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border ${
            isDark
              ? 'bg-gray-900 border-gray-700'
              : 'bg-white border-blue-100'
          }`}>


            {/* Header */}
            <div className={`bg-gradient-to-r ${getDepartmentColor(selectedStudent.department)} px-8 py-6 flex items-center justify-between sticky top-0 z-10`}>
              <div>
                <h2 className="text-3xl font-bold text-white">{selectedStudent.name}</h2>
                <p className="text-sm opacity-90">📁 Submissions by Subject</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-white hover:bg-white/20 p-2 rounded-lg"
              >
                ✕
              </button>
            </div>


            {/* Content */}
            <div className="p-8">
              {uploadsLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                </div>
              ) : !selectedStudent.uploadID?.length ? (
                <div className="text-center py-16">
                  <p className="text-5xl mb-3">📭</p>
                  <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>No submissions</p>
                </div>
              ) : (
                <>
                  {/* Dynamic Folder Tabs - Based on API Response */}
                  <div className="flex flex-wrap gap-3 mb-8">
                    {dynamicFolders.map((folder) => {
                      const groupedUploads = groupUploadsBySubject(selectedStudent.uploadID);
                      const count = groupedUploads[folder.value]?.length || 0;
                      
                      return (
                        <button
                          key={folder.value}
                          onClick={() => setSelectedFolder(folder.value)}
                          disabled={count === 0}
                          className={`flex items-center gap-2 px-4 py-3 rounded-2xl font-bold transition-all ${
                            selectedFolder === folder.value
                              ? `bg-gradient-to-r ${folder.color} text-white shadow-lg scale-105`
                              : count === 0
                              ? isDark
                                ? 'bg-gray-700/30 text-gray-500 cursor-not-allowed opacity-50'
                                : 'bg-gray-200 text-gray-500 cursor-not-allowed opacity-50'
                              : isDark
                              ? 'bg-gray-700/50 text-gray-300 hover:bg-gray-700/70'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <span className="text-2xl">{folder.icon}</span>
                          <span>{folder.label}</span>
                          <span className={`text-sm px-2 py-1 rounded-full ${
                            selectedFolder === folder.value
                              ? 'bg-white/20'
                              : isDark
                              ? 'bg-gray-600'
                              : 'bg-gray-300'
                          }`}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>


                  {/* Folder Content */}
                  <div>
                    {(() => {
                      const groupedUploads = groupUploadsBySubject(selectedStudent.uploadID);
                      const folderUploads = groupedUploads[selectedFolder] || [];
                      const folderInfo = dynamicFolders.find(f => f.value === selectedFolder);


                      if (folderUploads.length === 0) {
                        return (
                          <div className="text-center py-12">
                            <p className="text-5xl mb-3">{folderInfo?.icon}</p>
                            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>No submissions in {folderInfo?.label}</p>
                          </div>
                        );
                      }


                      return (
                        <div className="space-y-4">
                          {folderUploads.map((upload, idx) => {
                            const { day, date, time } = formatDateTime(upload.createdAt);
                            return (
                              <div
                                key={idx}
                                className={`rounded-xl p-4 border transition-all ${
                                  isDark
                                    ? 'bg-gray-800/50 border-gray-700/50 hover:border-blue-500/50'
                                    : 'bg-blue-50/50 border-blue-200/50 hover:border-blue-400/50'
                                }`}
                              >
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex items-center gap-3">
                                    <span className="text-3xl">{getFileIcon(upload.file?.contentType)}</span>
                                    <div>
                                      <p className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        {getFileType(upload.file?.contentType)}
                                      </p>
                                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {day}, {date} • {time}
                                      </p>
                                    </div>
                                  </div>
                                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                                    isDark ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-700'
                                  }`}>
                                    #{idx + 1}
                                  </span>
                                </div>


                                <p className={`text-sm mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                  {upload.description}
                                </p>


                                {upload.subject && (
                                  <p className={`text-xs mb-3 px-2 py-1 rounded-lg inline-block ${
                                    isDark ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-200 text-gray-700'
                                  }`}>
                                    Subject: <strong>{upload.subject}</strong>
                                  </p>
                                )}


                                {/* Display Random Private IP (not from database) */}
                                <p className={`text-xs mb-3 px-2 py-1 rounded-lg inline-block ml-2 ${
                                  isDark ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-200 text-gray-700'
                                }`}>
                                  🌐 IP: <strong className="font-mono">{upload.randomIP}</strong>
                                </p>


                                <div className="flex gap-2">
                                  <button
                                    onClick={() => {
                                      setSelectedUpload(upload);
                                      setShowUploadModal(true);
                                    }}
                                    className={`flex-1 px-3 py-2 rounded-lg font-semibold text-sm transition-all ${
                                      isDark
                                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                                    }`}
                                  >
                                    👁️ View
                                  </button>
                                  <button
                                    onClick={() => handleDownload(upload, idx)}
                                    className={`flex-1 px-3 py-2 rounded-lg font-semibold text-sm transition-all ${
                                      isDark
                                        ? 'bg-green-600 hover:bg-green-700 text-white'
                                        : 'bg-green-500 hover:bg-green-600 text-white'
                                    }`}
                                  >
                                    💾 Download
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}


      {/* Preview Modal */}
      {showUploadModal && selectedUpload && (
        <div className={`fixed inset-0 flex items-center justify-center z-50 p-4 animate-fadeIn ${
          isDark ? 'bg-black/70' : 'bg-black/60'
        }`}>
          <div className={`rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border ${
            isDark
              ? 'bg-gray-900 border-gray-700'
              : 'bg-white border-blue-100'
          }`}>


            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-8 py-6 flex items-center justify-between sticky top-0 z-10">
              <h2 className="text-2xl font-bold text-white">📄 Preview</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-white hover:bg-white/20 p-2 rounded-lg"
              >
                ✕
              </button>
            </div>


            <div className="p-8">
              <div className={`mb-6 p-4 rounded-xl ${isDark ? 'bg-gray-800/50' : 'bg-blue-50'}`}>
                <p className={`text-sm font-bold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>📝 Description</p>
                <p className={isDark ? 'text-gray-200' : 'text-gray-900'}>{selectedUpload.description}</p>
              </div>


              {selectedUpload.subject && (
                <div className={`mb-6 p-4 rounded-xl ${isDark ? 'bg-gray-800/50' : 'bg-blue-50'}`}>
                  <p className={`text-sm font-bold mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>📚 Subject</p>
                  <p className={isDark ? 'text-gray-200' : 'text-gray-900'}>{selectedUpload.subject}</p>
                </div>
              )}


              {/* Display Random Private IP in Preview Modal */}
              <div className={`mb-6 p-4 rounded-xl ${isDark ? 'bg-gray-800/50' : 'bg-blue-50'}`}>
                <p className={`text-sm font-bold mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>🌐 IP Address (Private)</p>
                <p className={`font-mono text-lg ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>{selectedUpload.randomIP}</p>
              </div>


              <div className={`bg-gray-800/50 rounded-2xl p-6 flex items-center justify-center min-h-64 mb-6 ${
                !isDark ? 'bg-gray-100' : ''
              }`}>
                {renderPreview(selectedUpload) ? (
                  renderPreview(selectedUpload)
                ) : (
                  <div className="text-center">
                    <p className="text-5xl mb-2">{getFileIcon(selectedUpload.file?.contentType)}</p>
                    <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Preview not available</p>
                  </div>
                )}
              </div>


              <button
                onClick={() => {
                  handleDownload(selectedUpload, 0);
                  setShowUploadModal(false);
                }}
                className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold rounded-lg"
              >
                💾 Download
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


export default AllStudents;
