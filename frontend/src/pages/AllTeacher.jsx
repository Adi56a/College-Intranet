import React, { useState, useEffect } from 'react';
import { 
  FiUsers,
  FiSearch,
  FiFilter,
  FiEye,
  FiTrash2,
  FiX,
  FiMail,
  FiAward,
  FiBookOpen,
  FiCalendar,
  FiCheckCircle,
  FiAlertCircle,
  FiUser
} from 'react-icons/fi';
import { MdSchool } from 'react-icons/md';
import Header from '../components/Header';

// Professional Loading Component
const LoadingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-slate-200"></div>
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 border-r-blue-500 animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 bg-blue-600 rounded-full animate-pulse"></div>
        </div>
      </div>
      <p className="mt-4 text-slate-600 font-medium animate-pulse">Loading teachers...</p>
    </div>
  );
};

const AllTeacher = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPost, setFilterPost] = useState('');

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:3000/api/teacher/get-teachers', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage({ type: 'error', text: data.message || 'Error fetching teachers' });
      } else {
        setTeachers(data.teachers || []);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (teacherId) => {
    if (!window.confirm('Are you sure you want to delete this teacher?')) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:3000/api/teacher/delete-teacher/${teacherId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage({ type: 'error', text: data.message || 'Error deleting teacher' });
      } else {
        setMessage({ type: 'success', text: 'Teacher deleted successfully!' });
        setTeachers(teachers.filter(teacher => teacher._id !== teacherId));
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    }
  };

  const handleViewProfile = (teacher) => {
    setSelectedTeacher(teacher);
    setShowModal(true);
  };

  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          teacher.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterPost ? teacher.post === filterPost : true;
    return matchesSearch && matchesFilter;
  });

  const uniquePosts = [...new Set(teachers.map(t => t.post))];

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
                All Teachers
              </h1>
            </div>
            <p className="text-slate-600">Manage faculty members</p>
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

          {/* Search and Filter */}
          <div className="mb-8 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                />
              </div>

              <div className="relative">
                <FiFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <select
                  value={filterPost}
                  onChange={(e) => setFilterPost(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-200 text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none transition-all appearance-none"
                >
                  <option value="">All Posts</option>
                  {uniquePosts.map(post => (
                    <option key={post} value={post}>{post}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <LoadingSpinner />
            </div>
          ) : filteredTeachers.length === 0 ? (
            <div className="text-center py-32 bg-white rounded-2xl border-2 border-slate-200">
              <FiUsers size={64} className="mx-auto mb-4 text-slate-300" />
              <p className="text-lg font-semibold text-slate-600 mb-2">No teachers found</p>
              <p className="text-sm text-slate-500">Try adjusting your search or filters</p>
            </div>
          ) : (
            <>
              {/* Count */}
              <div className="mb-6 p-4 bg-white rounded-xl border border-slate-200 text-center">
                <p className="font-bold text-slate-900">
                  {filteredTeachers.length} Teacher{filteredTeachers.length !== 1 ? 's' : ''}
                </p>
              </div>

              {/* Teachers Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTeachers.map((teacher) => (
                  <div
                    key={teacher._id}
                    className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md hover:border-blue-300 transition-all"
                  >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5">
                      <h3 className="text-xl font-bold text-white mb-1">{teacher.name}</h3>
                      <p className="text-blue-100 text-sm">{teacher.post}</p>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-3">
                      <div className="flex items-start gap-2">
                        <FiMail size={16} className="text-slate-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-600 mb-1">Email</p>
                          <p className="text-sm text-slate-900 break-all">{teacher.email}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <FiAward size={16} className="text-slate-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-slate-600 mb-1">Qualification</p>
                          <p className="text-sm text-slate-900">{teacher.qualification}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <FiBookOpen size={16} className="text-slate-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-slate-600 mb-1">Specialization</p>
                          <p className="text-sm text-slate-900">{teacher.specialization}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 border border-slate-200">
                        <FiCalendar size={14} className="text-slate-600" />
                        <p className="text-xs text-slate-700">
                          Joined {new Date(teacher.joiningDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex gap-2">
                      <button
                        onClick={() => handleViewProfile(teacher)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-all"
                      >
                        <FiEye size={16} />
                        View
                      </button>
                      <button
                        onClick={() => handleDelete(teacher._id)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold bg-red-600 hover:bg-red-700 text-white transition-all"
                      >
                        <FiTrash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Profile Modal - Mobile Optimized */}
      {showModal && selectedTeacher && (
        <div className="fixed inset-0 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-3xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col animate-slideUp">
            
            {/* Header - Sticky */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <FiUser size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Teacher Profile</h2>
                  <p className="text-blue-100 text-sm">Faculty Details</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition"
              >
                <FiX size={24} />
              </button>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              
              {/* Name Card */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 p-5 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <FiUser size={18} className="text-blue-600" />
                  <p className="text-xs font-semibold text-blue-900">Full Name</p>
                </div>
                <p className="text-lg font-bold text-slate-900">{selectedTeacher.name}</p>
              </div>

              {/* Email Card */}
              <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <FiMail size={18} className="text-slate-600" />
                  <p className="text-xs font-semibold text-slate-600">Email Address</p>
                </div>
                <p className="text-sm font-medium text-slate-900 break-all">{selectedTeacher.email}</p>
              </div>

              {/* Post Card */}
              <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <MdSchool size={18} className="text-slate-600" />
                  <p className="text-xs font-semibold text-slate-600">Position</p>
                </div>
                <p className="text-sm font-medium text-slate-900">{selectedTeacher.post}</p>
              </div>

              {/* Qualification Card */}
              <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <FiAward size={18} className="text-slate-600" />
                  <p className="text-xs font-semibold text-slate-600">Qualification</p>
                </div>
                <p className="text-sm font-medium text-slate-900">{selectedTeacher.qualification}</p>
              </div>

              {/* Specialization Card */}
              <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <FiBookOpen size={18} className="text-slate-600" />
                  <p className="text-xs font-semibold text-slate-600">Specialization</p>
                </div>
                <p className="text-sm font-medium text-slate-900">{selectedTeacher.specialization}</p>
              </div>

              {/* Dates Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <FiCalendar size={16} className="text-slate-600" />
                    <p className="text-xs font-semibold text-slate-600">Joining Date</p>
                  </div>
                  <p className="text-sm font-medium text-slate-900">
                    {new Date(selectedTeacher.joiningDate).toLocaleDateString()}
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <FiCalendar size={16} className="text-slate-600" />
                    <p className="text-xs font-semibold text-slate-600">Member Since</p>
                  </div>
                  <p className="text-sm font-medium text-slate-900">
                    {new Date(selectedTeacher.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer - Sticky */}
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex gap-3 flex-shrink-0">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-3 rounded-xl font-semibold bg-slate-200 hover:bg-slate-300 text-slate-900 transition-all"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleDelete(selectedTeacher._id);
                  setShowModal(false);
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all"
              >
                <FiTrash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(100%);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
      `}</style>
    </>
  );
};

export default AllTeacher;
