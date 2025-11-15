import React, { useState, useEffect } from 'react';
import Header from '../components/Header';

const AllTeacher = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPost, setFilterPost] = useState('');
  const [theme, setTheme] = useState('light');

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
        setMessage({ type: 'success', text: '✅ Teacher deleted successfully!' });
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
                isDark
                  ? 'text-white'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent'
              }`}>
                👨‍🏫 All Teachers
              </h1>
              <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>Manage faculty members</p>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className={`px-4 py-2 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 ${
                isDark
                  ? 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
                  : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-lg'
              }`}
            >
              {isDark ? '☀️' : '🌙'}
            </button>
          </div>

          {/* Alert Messages */}
          {message.text && (
            <div className={`mb-6 p-4 rounded-2xl backdrop-blur-xl border animate-slideDown ${
              message.type === 'success' 
                ? isDark
                  ? 'bg-green-500/20 border-green-500/50 text-green-300'
                  : 'bg-green-100 border-green-300 text-green-800'
                : isDark
                  ? 'bg-red-500/20 border-red-500/50 text-red-300'
                  : 'bg-red-100 border-red-300 text-red-800'
            }`}>
              <p className="font-semibold text-center">{message.text}</p>
            </div>
          )}

          {/* Search and Filter */}
          <div className={`mb-8 rounded-2xl p-6 border transition-all duration-300 ${
            isDark
              ? 'bg-gray-800/50 border-gray-700/50 backdrop-blur-xl'
              : 'bg-white border-blue-100/50 backdrop-blur-xl'
          }`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="🔍 Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                  isDark
                    ? 'bg-gray-700/50 border border-gray-600/50 text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-cyan-500/20'
                    : 'bg-blue-50 border border-blue-200 text-gray-900 placeholder-gray-500 focus:border-cyan-500 focus:ring-cyan-500/10'
                } focus:outline-none focus:ring-2`}
              />

              <select
                value={filterPost}
                onChange={(e) => setFilterPost(e.target.value)}
                className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                  isDark
                    ? 'bg-gray-700/50 border border-gray-600/50 text-white focus:border-cyan-500 focus:ring-cyan-500/20'
                    : 'bg-blue-50 border border-blue-200 text-gray-900 focus:border-cyan-500 focus:ring-cyan-500/10'
                } focus:outline-none focus:ring-2`}
              >
                <option value="">📚 All Posts</option>
                {uniquePosts.map(post => (
                  <option key={post} value={post}>{post}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <div className="animate-spin h-16 w-16 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
              <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>Loading teachers...</p>
            </div>
          ) : filteredTeachers.length === 0 ? (
            <div className={`text-center py-32 rounded-3xl border ${isDark ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white/50 border-blue-100'}`}>
              <p className="text-5xl mb-3">👨‍🏫</p>
              <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>No teachers found</p>
            </div>
          ) : (
            <>
              {/* Count */}
              <div className={`mb-6 p-4 rounded-2xl text-center ${isDark ? 'bg-gray-800/50' : 'bg-blue-50'}`}>
                <p className={`font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  📊 {filteredTeachers.length} Teacher{filteredTeachers.length !== 1 ? 's' : ''}
                </p>
              </div>

              {/* Teachers Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTeachers.map((teacher, idx) => (
                  <div
                    key={teacher._id}
                    className={`rounded-2xl shadow-lg border overflow-hidden transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl animate-fadeInUp ${
                      isDark
                        ? 'bg-gray-800/50 border-gray-700/50'
                        : 'bg-white border-blue-100/50'
                    }`}
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                      <h3 className="text-xl font-bold text-white">{teacher.name}</h3>
                      <p className="text-blue-100 text-sm">{teacher.post}</p>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-3">
                      <div>
                        <p className={`text-xs font-semibold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Email</p>
                        <p className={`text-sm break-all ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>{teacher.email}</p>
                      </div>

                      <div>
                        <p className={`text-xs font-semibold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Qualification</p>
                        <p className={isDark ? 'text-gray-300' : 'text-gray-900'}>{teacher.qualification}</p>
                      </div>

                      <div>
                        <p className={`text-xs font-semibold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Specialization</p>
                        <p className={isDark ? 'text-gray-300' : 'text-gray-900'}>{teacher.specialization}</p>
                      </div>

                      <div className={`p-3 rounded-lg text-sm ${isDark ? 'bg-gray-700/50' : 'bg-blue-50'}`}>
                        <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                          📅 {new Date(teacher.joiningDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className={`px-6 py-4 border-t flex gap-2 ${isDark ? 'border-gray-700/50 bg-gray-700/20' : 'border-blue-100 bg-blue-50/50'}`}>
                      <button
                        onClick={() => handleViewProfile(teacher)}
                        className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all text-sm ${
                          isDark
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                        }`}
                      >
                        👁️ View
                      </button>
                      <button
                        onClick={() => handleDelete(teacher._id)}
                        className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all text-sm ${
                          isDark
                            ? 'bg-red-600 hover:bg-red-700 text-white'
                            : 'bg-red-500 hover:bg-red-600 text-white'
                        }`}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Profile Modal */}
      {showModal && selectedTeacher && (
        <div className={`fixed inset-0 flex items-center justify-center z-50 p-4 animate-fadeIn ${
          isDark ? 'bg-black/70' : 'bg-black/60'
        }`}>
          <div className={`rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border ${
            isDark
              ? 'bg-gray-900 border-gray-700'
              : 'bg-white border-blue-100'
          }`}>

            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Teacher Profile</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {[
                { label: 'Full Name', value: selectedTeacher.name },
                { label: 'Email', value: selectedTeacher.email },
                { label: 'Post', value: selectedTeacher.post },
                { label: 'Qualification', value: selectedTeacher.qualification },
                { label: 'Specialization', value: selectedTeacher.specialization },
                { label: 'Joining Date', value: new Date(selectedTeacher.joiningDate).toLocaleDateString() },
                { label: 'Member Since', value: new Date(selectedTeacher.createdAt).toLocaleDateString() }
              ].map((item, idx) => (
                <div key={idx} className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-blue-50'}`}>
                  <p className={`text-xs font-semibold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{item.label}</p>
                  <p className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.value}</p>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className={`px-6 py-4 border-t flex gap-2 ${isDark ? 'border-gray-700 bg-gray-800/30' : 'border-blue-100'}`}>
              <button
                onClick={() => setShowModal(false)}
                className={`flex-1 px-4 py-2 rounded-lg font-semibold transition ${
                  isDark
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                }`}
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleDelete(selectedTeacher._id);
                  setShowModal(false);
                }}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Animations */}
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

export default AllTeacher;
