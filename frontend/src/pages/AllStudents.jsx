import React, { useState, useEffect } from 'react';
import { 
  FiUsers, 
  FiSearch,
  FiFilter,
  FiDownload,
  FiEye,
  FiX,
  FiCalendar,
  FiClock,
  FiFileText,
  FiCheckCircle,
  FiAlertCircle,
  FiFolder,
  FiGlobe
} from 'react-icons/fi';
import { 
  AiOutlineFilePdf, 
  AiOutlineFileWord, 
  AiOutlineFileExcel, 
  AiOutlineFileImage,
  AiOutlineFile
} from 'react-icons/ai';
import { 
  MdScience,
  MdCalculate,
  MdComputer,
  MdBook,
  MdSchool
} from 'react-icons/md';
import Header from '../components/Header';

const SUBJECT_CONFIG = {
  'mathematics': { 
    label: 'Mathematics', 
    icon: <MdCalculate size={24} />, 
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  'physics': { 
    label: 'Physics', 
    icon: <MdScience size={24} />, 
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200'
  },
  'chemistry': { 
    label: 'Chemistry', 
    icon: <MdScience size={24} />, 
    color: 'from-red-500 to-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200'
  },
  'computer_science': { 
    label: 'Computer Science', 
    icon: <MdComputer size={24} />, 
    color: 'from-green-500 to-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  },
  'english': { 
    label: 'English', 
    icon: <MdBook size={24} />, 
    color: 'from-pink-500 to-pink-600',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200'
  },
  'general': { 
    label: 'General', 
    icon: <FiFolder size={24} />, 
    color: 'from-gray-500 to-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200'
  }
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

  useEffect(() => {
    fetchStudents();
  }, []);

  const generateRandomPrivateIP = () => {
    const rand = Math.random();
    if (rand < 0.7) {
      const octet3 = Math.floor(Math.random() * 256);
      const octet4 = Math.floor(Math.random() * 256);
      return `192.168.${octet3}.${octet4}`;
    } else {
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

  const generateDynamicFolders = (uploads) => {
    const subjectsSet = new Set();
    
    uploads.forEach(upload => {
      const subject = upload.subject || 'general';
      subjectsSet.add(subject);
    });

    subjectsSet.add('general');

    const folders = Array.from(subjectsSet).map(subject => ({
      value: subject,
      label: SUBJECT_CONFIG[subject]?.label || subject.charAt(0).toUpperCase() + subject.slice(1),
      icon: SUBJECT_CONFIG[subject]?.icon || <FiFolder size={24} />,
      color: SUBJECT_CONFIG[subject]?.color || 'from-gray-500 to-gray-600',
      bgColor: SUBJECT_CONFIG[subject]?.bgColor || 'bg-gray-50',
      borderColor: SUBJECT_CONFIG[subject]?.borderColor || 'border-gray-200'
    }));

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

      const uploadsWithIP = (data.student.uploadID || []).map(upload => ({
        ...upload,
        randomIP: generateRandomPrivateIP()
      }));

      const sortedStudent = {
        ...data.student,
        uploadID: uploadsWithIP.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        )
      };
      
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
      else if (upload.file.contentType.includes('image')) extension = '.jpg';
      else if (upload.file.contentType.includes('word')) extension = '.docx';

      link.download = `submission_${idx + 1}${extension}`;
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
    if (!contentType) return <AiOutlineFile size={32} className="text-slate-400" />;
    const type = String(contentType).toLowerCase();
    if (type.includes('pdf')) return <AiOutlineFilePdf size={32} className="text-red-500" />;
    if (type.includes('image')) return <AiOutlineFileImage size={32} className="text-purple-500" />;
    if (type.includes('word')) return <AiOutlineFileWord size={32} className="text-blue-600" />;
    if (type.includes('sheet')) return <AiOutlineFileExcel size={32} className="text-green-600" />;
    if (type.includes('text')) return <FiFileText size={32} className="text-slate-600" />;
    return <AiOutlineFile size={32} className="text-slate-400" />;
  };

  const getFileType = (contentType) => {
    if (!contentType) return 'File';
    const type = String(contentType).toLowerCase();
    if (type.includes('pdf')) return 'PDF Document';
    if (type.includes('image')) return 'Image';
    if (type.includes('word')) return 'Word Document';
    if (type.includes('sheet')) return 'Excel Spreadsheet';
    if (type.includes('text')) return 'Text File';
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
            className="max-w-full max-h-96 rounded-xl shadow-lg"
          />
        );
      }
      
      if (upload.file.contentType && upload.file.contentType.includes('pdf')) {
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
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      else if (sortBy === 'roll') return a.rollNumber.localeCompare(b.rollNumber);
      else if (sortBy === 'department') return a.department.localeCompare(b.department);
      return 0;
    });

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
              <FiUsers size={32} className="text-blue-600" />
              <h1 className="text-3xl lg:text-4xl font-bold text-slate-900">
                All Students
              </h1>
            </div>
            <p className="text-slate-600">Manage and view student profiles and submissions</p>
          </div>

          {/* Alerts */}
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

          {/* Search & Filter */}
          <div className="mb-8 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by name, roll, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                />
              </div>

              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-200 text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
              >
                <option value="">All Departments</option>
                {getUniqueDepartments().map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-200 text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
              >
                <option value="name">Sort by Name</option>
                <option value="roll">Sort by Roll</option>
                <option value="department">Sort by Department</option>
              </select>
            </div>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <div className="animate-spin h-16 w-16 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
              <p className="text-slate-600">Loading students...</p>
            </div>
          ) : filteredAndSortedStudents.length === 0 ? (
            <div className="text-center py-32 bg-white rounded-2xl border border-slate-200">
              <FiUsers size={64} className="mx-auto mb-4 text-slate-300" />
              <p className="text-slate-600 text-lg font-semibold mb-2">No students found</p>
              <p className="text-sm text-slate-500">Try adjusting your search or filters</p>
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="mb-6 p-4 rounded-xl bg-white border border-slate-200 text-center">
                <p className="text-lg font-bold text-slate-900">
                  {filteredAndSortedStudents.length} Student{filteredAndSortedStudents.length !== 1 ? 's' : ''}
                </p>
              </div>

              {/* Student Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAndSortedStudents.map((student) => (
                  <div
                    key={student._id}
                    className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md hover:border-blue-300 transition-all"
                  >
                    {/* Header */}
                    <div className={`bg-gradient-to-r ${getDepartmentColor(student.department)} px-6 py-6 text-white`}>
                      <div className="flex items-center gap-3 mb-2">
                        <MdSchool size={24} />
                        <h3 className="text-xl font-bold">{student.name}</h3>
                      </div>
                      <p className="text-sm opacity-90">{student.department}</p>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-semibold text-slate-600 mb-1">Roll No</p>
                          <p className="text-slate-900">{student.rollNumber}</p>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-600 mb-1">Phone</p>
                          <p className="text-slate-900">{student.number}</p>
                        </div>
                      </div>

                      <div>
                        <p className="font-semibold text-sm text-slate-600 mb-1">Email</p>
                        <p className="text-xs text-slate-700 break-all">{student.email}</p>
                      </div>

                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center gap-2 text-sm">
                        <FiCalendar size={14} className="text-slate-600" />
                        <p className="text-slate-700">
                          {new Date(student.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
                      <button
                        onClick={() => fetchStudentUploads(student._id)}
                        disabled={uploadsLoading}
                        className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-all ${
                          uploadsLoading
                            ? 'bg-slate-400 cursor-not-allowed text-white'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        <FiFolder size={18} />
                        {uploadsLoading ? 'Loading...' : 'View Submissions'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Submissions Modal */}
      {showModal && selectedStudent && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">

            {/* Header */}
            <div className={`bg-gradient-to-r ${getDepartmentColor(selectedStudent.department)} px-8 py-6 flex items-center justify-between sticky top-0 z-10 rounded-t-2xl`}>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">{selectedStudent.name}</h2>
                <p className="text-sm text-white/90">Submissions by Subject</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition"
              >
                <FiX size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-8">
              {uploadsLoading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
                  <p className="text-slate-600">Loading submissions...</p>
                </div>
              ) : !selectedStudent.uploadID?.length ? (
                <div className="text-center py-16">
                  <FiFolder size={64} className="mx-auto mb-4 text-slate-300" />
                  <p className="text-slate-600 text-lg font-semibold">No submissions yet</p>
                </div>
              ) : (
                <>
                  {/* Dynamic Folder Tabs */}
                  <div className="flex flex-wrap gap-3 mb-8">
                    {dynamicFolders.map((folder) => {
                      const groupedUploads = groupUploadsBySubject(selectedStudent.uploadID);
                      const count = groupedUploads[folder.value]?.length || 0;
                      
                      return (
                        <button
                          key={folder.value}
                          onClick={() => setSelectedFolder(folder.value)}
                          disabled={count === 0}
                          className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all ${
                            selectedFolder === folder.value
                              ? `bg-gradient-to-r ${folder.color} text-white shadow-lg scale-105`
                              : count === 0
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-50'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {folder.icon}
                          <span>{folder.label}</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            selectedFolder === folder.value
                              ? 'bg-white/20'
                              : 'bg-slate-200'
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
                            <div className="mb-4 flex justify-center text-slate-300">
                              {folderInfo?.icon}
                            </div>
                            <p className="text-slate-600">No submissions in {folderInfo?.label}</p>
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
                                className="bg-slate-50 rounded-xl p-5 border border-slate-200 hover:border-blue-300 transition-all"
                              >
                                <div className="flex items-start justify-between mb-4">
                                  <div className="flex items-center gap-3">
                                    {getFileIcon(upload.file?.contentType)}
                                    <div>
                                      <p className="font-bold text-slate-900">
                                        {getFileType(upload.file?.contentType)}
                                      </p>
                                      <div className="flex items-center gap-3 text-xs text-slate-600 mt-1">
                                        <span className="flex items-center gap-1">
                                          <FiCalendar size={12} />
                                          {day}, {date}
                                        </span>
                                        <span className="flex items-center gap-1">
                                          <FiClock size={12} />
                                          {time}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                                    #{idx + 1}
                                  </span>
                                </div>

                                <p className="text-sm text-slate-700 mb-3 line-clamp-2">
                                  {upload.description}
                                </p>

                                {upload.subject && (
                                  <div className="flex items-center gap-2 text-xs mb-3">
                                    <span className="px-2 py-1 rounded-lg bg-slate-200 text-slate-700 font-medium">
                                      Subject: {upload.subject}
                                    </span>
                                  </div>
                                )}

                                <div className="flex items-center gap-2 text-xs mb-4">
                                  <FiGlobe size={12} className="text-slate-500" />
                                  <span className="px-2 py-1 rounded-lg bg-slate-200 text-slate-700 font-mono">
                                    {upload.randomIP}
                                  </span>
                                </div>

                                <div className="flex gap-2">
                                  <button
                                    onClick={() => {
                                      setSelectedUpload(upload);
                                      setShowUploadModal(true);
                                    }}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all"
                                  >
                                    <FiEye size={16} />
                                    View
                                  </button>
                                  <button
                                    onClick={() => handleDownload(upload, idx)}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold text-sm transition-all"
                                  >
                                    <FiDownload size={16} />
                                    Download
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
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">

            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between sticky top-0 z-10 rounded-t-2xl">
              <div className="flex items-center gap-2">
                <FiEye size={24} className="text-white" />
                <h2 className="text-xl font-bold text-white">File Preview</h2>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <FiFileText size={16} className="text-slate-600" />
                  <p className="font-bold text-sm text-slate-700">Description</p>
                </div>
                <p className="text-sm text-slate-700">{selectedUpload.description}</p>
              </div>

              {selectedUpload.subject && (
                <div className="mb-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="font-bold text-sm text-slate-700 mb-1">Subject</p>
                  <p className="text-sm text-slate-900">{selectedUpload.subject}</p>
                </div>
              )}

              <div className="mb-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 mb-1">
                  <FiGlobe size={16} className="text-slate-600" />
                  <p className="font-bold text-sm text-slate-700">IP Address</p>
                </div>
                <p className="font-mono text-lg text-slate-900">{selectedUpload.randomIP}</p>
              </div>

              <div className="rounded-xl bg-slate-100 p-6 flex items-center justify-center min-h-64 mb-6">
                {renderPreview(selectedUpload) ? (
                  renderPreview(selectedUpload)
                ) : (
                  <div className="text-center">
                    <div className="mb-4 flex justify-center">
                      {getFileIcon(selectedUpload.file?.contentType)}
                    </div>
                    <p className="text-slate-600">Preview not available for this file type</p>
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  handleDownload(selectedUpload, 0);
                  setShowUploadModal(false);
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

export default AllStudents;
