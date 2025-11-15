import React, { useState } from 'react';
import Header from '../components/Header';

const AddTeacher = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    post: '',
    qualification: '',
    specialization: ''
  });

  const [joiningDate, setJoiningDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [step, setStep] = useState(1);
  const [theme, setTheme] = useState('light');

  const teacherPosts = ['Lecturer', 'Assistant Professor', 'Associate Professor', 'Professor', 'Head of Department'];
  const qualifications = ['B.Tech', 'M.Tech', 'B.Sc', 'M.Sc', 'PhD', 'B.A', 'M.A', 'B.Com', 'M.Com'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    if (!formData.name.trim()) {
      setMessage({ type: 'error', text: '👤 Teacher name is required' });
      setLoading(false);
      return;
    }

    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setMessage({ type: 'error', text: '📧 Valid email is required' });
      setLoading(false);
      return;
    }

    if (!formData.password || formData.password.length < 6) {
      setMessage({ type: 'error', text: '🔒 Password must be at least 6 characters' });
      setLoading(false);
      return;
    }

    if (!formData.post) {
      setMessage({ type: 'error', text: '📍 Please select a post' });
      setLoading(false);
      return;
    }

    if (!formData.qualification) {
      setMessage({ type: 'error', text: '🎓 Please select qualification' });
      setLoading(false);
      return;
    }

    if (!formData.specialization.trim()) {
      setMessage({ type: 'error', text: '🔬 Specialization is required' });
      setLoading(false);
      return;
    }

    if (!joiningDate) {
      setMessage({ type: 'error', text: '📅 Joining date is required' });
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch('http://localhost:3000/api/teacher/create-teacher', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          post: formData.post,
          qualification: formData.qualification,
          specialization: formData.specialization,
          joiningDate: joiningDate
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage({ type: 'error', text: `❌ ${data.message || 'Error adding teacher'}` });
      } else {
        setMessage({ type: 'success', text: '✅ Teacher added successfully!' });
        setFormData({
          name: '',
          email: '',
          password: '',
          post: '',
          qualification: '',
          specialization: ''
        });
        setJoiningDate('');
        setStep(1);
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: '🌐 Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1) {
      if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
        setMessage({ type: 'error', text: '⚠️ Please fill all fields in step 1' });
        return;
      }
    }
    setStep(2);
    setMessage({ type: '', text: '' });
  };

  const prevStep = () => {
    setStep(1);
    setMessage({ type: '', text: '' });
  };

  const isDark = theme === 'dark';

  return (
    <>
      <Header />
      
      <div className={`min-h-screen transition-colors duration-300 ${
        isDark
          ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
          : 'bg-gradient-to-br from-white via-blue-50 to-indigo-100'
      } py-8 px-4 relative overflow-hidden`}>
        
        {/* Animated Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute -top-40 -right-40 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob ${
            isDark ? 'bg-blue-500' : 'bg-blue-200'
          }`}></div>
          <div className={`absolute -bottom-40 -left-40 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000 ${
            isDark ? 'bg-purple-500' : 'bg-indigo-200'
          }`}></div>
          <div className={`absolute top-1/2 left-1/2 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000 ${
            isDark ? 'bg-cyan-500' : 'bg-cyan-200'
          }`}></div>
        </div>

        <div className="relative z-10 max-w-2xl mx-auto">
          
          {/* Header with Theme Toggle */}
          <div className="flex justify-between items-center mb-10">
            <div>
              <h1 className={`text-4xl md:text-5xl font-bold mb-2 ${
                isDark
                  ? 'text-white'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent'
              }`}>
                ✨ Add Teacher
              </h1>
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Complete the form below</p>
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

          {/* Form Container */}
          <div className={`rounded-3xl shadow-2xl p-8 md:p-10 border transition-all duration-300 backdrop-blur-xl ${
            isDark
              ? 'bg-gray-800/50 border-gray-700/50'
              : 'bg-white border-blue-100/50'
          }`}>
            
            {/* Step Indicator */}
            <div className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <div className={`flex-1 h-2 rounded-full mr-3 transition-all duration-500 ${
                  step === 1
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500'
                    : isDark ? 'bg-gray-600' : 'bg-gray-300'
                }`}></div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                  isDark ? 'bg-gray-700 text-gray-300' : 'bg-blue-100 text-blue-700'
                }`}>
                  Step {step}/2
                </span>
                <div className={`flex-1 h-2 rounded-full ml-3 transition-all duration-500 ${
                  step === 2
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                    : isDark ? 'bg-gray-600' : 'bg-gray-300'
                }`}></div>
              </div>
              <p className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {step === 1 ? '📋 Personal Information' : '🎓 Professional Details'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* STEP 1 */}
              {step === 1 && (
                <div className="space-y-6 animate-slideIn">
                  <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    👤 Personal Information
                  </h2>

                  {/* Name */}
                  <div>
                    <label className={`block text-sm font-semibold mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Full Name <span className="text-blue-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className={`w-full px-4 py-3 rounded-xl font-semibold transition-all ${
                        isDark
                          ? 'bg-gray-700/50 border border-gray-600/50 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20'
                          : 'bg-blue-50 border border-blue-200 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/10'
                      } focus:outline-none focus:ring-2`}
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className={`block text-sm font-semibold mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Email Address <span className="text-blue-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@institution.com"
                      className={`w-full px-4 py-3 rounded-xl font-semibold transition-all ${
                        isDark
                          ? 'bg-gray-700/50 border border-gray-600/50 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20'
                          : 'bg-blue-50 border border-blue-200 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/10'
                      } focus:outline-none focus:ring-2`}
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label className={`block text-sm font-semibold mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Password <span className="text-blue-500">*</span>
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className={`w-full px-4 py-3 rounded-xl font-semibold transition-all ${
                        isDark
                          ? 'bg-gray-700/50 border border-gray-600/50 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20'
                          : 'bg-blue-50 border border-blue-200 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/10'
                      } focus:outline-none focus:ring-2`}
                    />
                  </div>

                  {/* Next Button */}
                  <button
                    type="button"
                    onClick={nextStep}
                    className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white transition-all duration-300 transform hover:scale-105 active:scale-95 mt-8"
                  >
                    Next Step →
                  </button>
                </div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <div className="space-y-6 animate-slideIn">
                  <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    🎓 Professional Details
                  </h2>

                  {/* Post */}
                  <div>
                    <label className={`block text-sm font-semibold mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Post/Designation <span className="text-blue-500">*</span>
                    </label>
                    <select
                      name="post"
                      value={formData.post}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-xl font-semibold transition-all ${
                        isDark
                          ? 'bg-gray-700/50 border border-gray-600/50 text-white focus:border-blue-500 focus:ring-blue-500/20'
                          : 'bg-blue-50 border border-blue-200 text-gray-900 focus:border-blue-500 focus:ring-blue-500/10'
                      } focus:outline-none focus:ring-2`}
                    >
                      <option value="">Select a post</option>
                      {teacherPosts.map(post => (
                        <option key={post} value={post}>{post}</option>
                      ))}
                    </select>
                  </div>

                  {/* Qualification */}
                  <div>
                    <label className={`block text-sm font-semibold mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Qualification <span className="text-blue-500">*</span>
                    </label>
                    <select
                      name="qualification"
                      value={formData.qualification}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-xl font-semibold transition-all ${
                        isDark
                          ? 'bg-gray-700/50 border border-gray-600/50 text-white focus:border-blue-500 focus:ring-blue-500/20'
                          : 'bg-blue-50 border border-blue-200 text-gray-900 focus:border-blue-500 focus:ring-blue-500/10'
                      } focus:outline-none focus:ring-2`}
                    >
                      <option value="">Select qualification</option>
                      {qualifications.map(qual => (
                        <option key={qual} value={qual}>{qual}</option>
                      ))}
                    </select>
                  </div>

                  {/* Specialization */}
                  <div>
                    <label className={`block text-sm font-semibold mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Specialization <span className="text-blue-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleChange}
                      placeholder="e.g., Quantum Physics, Data Science"
                      className={`w-full px-4 py-3 rounded-xl font-semibold transition-all ${
                        isDark
                          ? 'bg-gray-700/50 border border-gray-600/50 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20'
                          : 'bg-blue-50 border border-blue-200 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/10'
                      } focus:outline-none focus:ring-2`}
                    />
                  </div>

                  {/* Joining Date */}
                  <div>
                    <label className={`block text-sm font-semibold mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Joining Date <span className="text-blue-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={joiningDate}
                      onChange={(e) => setJoiningDate(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl font-semibold transition-all ${
                        isDark
                          ? 'bg-gray-700/50 border border-gray-600/50 text-white focus:border-blue-500 focus:ring-blue-500/20'
                          : 'bg-blue-50 border border-blue-200 text-gray-900 focus:border-blue-500 focus:ring-blue-500/10'
                      } focus:outline-none focus:ring-2`}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 mt-8">
                    <button
                      type="button"
                      onClick={prevStep}
                      className={`flex-1 py-3 rounded-xl font-bold transition-all duration-300 ${
                        isDark
                          ? 'bg-gray-700/50 hover:bg-gray-600/50 text-white'
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                      }`}
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className={`flex-1 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 text-white ${
                        loading
                          ? isDark ? 'bg-gray-600 cursor-not-allowed' : 'bg-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
                      }`}
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                          Creating...
                        </>
                      ) : (
                        <>
                          🎉 Create Teacher
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
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

export default AddTeacher;
