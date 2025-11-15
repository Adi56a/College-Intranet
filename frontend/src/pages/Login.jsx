import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [activePanel, setActivePanel] = useState(0);
  const [showSignup, setShowSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    rollNumber: '',
    number: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const formContainerRef = useRef(null);
  const navigate = useNavigate();

  const API_BASE_URL = 'http://localhost:3000/api';

  const loginEndpoints = {
    student: `${API_BASE_URL}/auth/student-login`,
    teacher: `${API_BASE_URL}/auth/teacher-login`,
    admin: `${API_BASE_URL}/auth/admin-login`
  };

  const departments = ['AIML', 'AIDS', 'CSD', 'CSME', 'CSE'];

  const loginTypes = [
    { name: 'Student', icon: '🎓', color: 'from-blue-400 to-blue-600', bg: 'bg-blue-50' },
    { name: 'Teacher', icon: '👨‍🏫', color: 'from-indigo-400 to-indigo-600', bg: 'bg-indigo-50' },
    { name: 'Admin', icon: '⚙️', color: 'from-cyan-400 to-blue-600', bg: 'bg-cyan-50' }
  ];

  const handlePanelChange = (index) => {
    if (index === activePanel) return;
    
    if (formContainerRef.current) {
      formContainerRef.current.style.animation = 'slideOutLeft 0.3s ease-in forwards';
      setTimeout(() => {
        setActivePanel(index);
        setEmail('');
        setPassword('');
        setShowSignup(false);
        setMessage({ type: '', text: '' });
        if (formContainerRef.current) {
          formContainerRef.current.style.animation = 'slideInRight 0.3s ease-out forwards';
        }
      }, 300);
    } else {
      setActivePanel(index);
      setEmail('');
      setPassword('');
      setShowSignup(false);
      setMessage({ type: '', text: '' });
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    if (!email.trim() || !password.trim()) {
      setMessage({ type: 'error', text: '📧 Email and password are required' });
      setLoading(false);
      return;
    }

    const roleKeys = Object.keys(loginEndpoints);
    const endpoint = loginEndpoints[roleKeys[activePanel]];

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage({ type: 'error', text: data.message || 'Login failed' });
      } else {
        const decodedToken = JSON.parse(atob(data.token.split('.')[1]));
        const roleFromToken = decodedToken.role;

        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userRole', roleFromToken);
        localStorage.setItem('userId', decodedToken._id);
        
        setMessage({ type: 'success', text: '✅ Login successful! Redirecting...' });
        setEmail('');
        setPassword('');
        
        setTimeout(() => {
          if (roleFromToken === 'student') navigate('/student-dashboard');
          else if (roleFromToken === 'teacher') navigate('/teacher-dashboard');
          else if (roleFromToken === 'admin') navigate('/admin-dashboard');
        }, 1500);
      }
    } catch (error) {
      console.error('Login error:', error);
      setMessage({ type: 'error', text: '🌐 Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSignupChange = (e) => {
    const { name, value } = e.target;
    setSignupData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    if (!signupData.name.trim()) {
      setMessage({ type: 'error', text: '👤 Name is required' });
      setLoading(false);
      return;
    }
    if (!signupData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupData.email)) {
      setMessage({ type: 'error', text: '📧 Valid email is required' });
      setLoading(false);
      return;
    }
    if (!signupData.department) {
      setMessage({ type: 'error', text: '🎓 Department is required' });
      setLoading(false);
      return;
    }
    if (!signupData.rollNumber.trim()) {
      setMessage({ type: 'error', text: '🏷️ Roll number is required' });
      setLoading(false);
      return;
    }
    if (!signupData.number.trim() || !/^\d{10}$/.test(signupData.number)) {
      setMessage({ type: 'error', text: '📱 Phone number must be exactly 10 digits' });
      setLoading(false);
      return;
    }
    if (signupData.password.length < 6) {
      setMessage({ type: 'error', text: '🔒 Password must be at least 6 characters' });
      setLoading(false);
      return;
    }
    if (signupData.password !== signupData.confirmPassword) {
      setMessage({ type: 'error', text: '🔒 Passwords do not match' });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/student/create-student`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: signupData.name,
          email: signupData.email,
          password: signupData.password,
          department: signupData.department,
          rollNumber: signupData.rollNumber,
          number: signupData.number
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage({ type: 'error', text: data.message || 'Signup failed' });
      } else {
        setMessage({ type: 'success', text: '✅ Signup successful! You can now login.' });
        setSignupData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          department: '',
          rollNumber: '',
          number: ''
        });
        
        setTimeout(() => {
          setShowSignup(false);
          setMessage({ type: '', text: '' });
        }, 2000);
      }
    } catch (error) {
      console.error('Signup error:', error);
      setMessage({ type: 'error', text: '🌐 Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-indigo-100 flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
      
      {/* Animated Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 md:w-96 h-80 md:h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 md:w-96 h-80 md:h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-80 md:w-96 h-80 md:h-96 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Message Popup */}
      {message.text && (
        <div className={`fixed top-4 md:top-6 left-4 right-4 md:left-1/2 md:right-auto md:transform md:-translate-x-1/2 z-50 animate-slideDown ${
          message.type === 'success' 
            ? 'bg-green-100 border border-green-300 text-green-800' 
            : 'bg-red-100 border border-red-300 text-red-800'
        } px-4 md:px-6 py-3 md:py-4 rounded-xl shadow-lg text-sm md:text-base`}>
          <p className="font-semibold flex items-center gap-2">
            <span className="text-lg">{message.type === 'success' ? '✅' : '❌'}</span>
            {message.text}
          </p>
        </div>
      )}

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-6xl">
        
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          
          {/* Left Side - Header & Info (Hidden on Mobile) */}
          <div className="hidden md:block text-left">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">FEAT Intranet</h1>
            <p className="text-gray-600 text-xl mb-8">Secure access for students, teachers, and administrators</p>
            <div className="space-y-6">
              {loginTypes.map((type, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <div className={`p-4 rounded-xl bg-gradient-to-br ${type.color} text-white text-3xl`}>{type.icon}</div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{type.name}</h3>
                    <p className="text-gray-600 text-sm">Secure {type.name.toLowerCase()} access</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div>
            
            {/* Mobile Header */}
            <div className="md:hidden text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Institution Portal</h1>
              <p className="text-gray-600">{showSignup && activePanel === 0 ? 'Create Your Account' : 'Secure Access for All'}</p>
            </div>

            {/* Role Selector Tabs */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              {loginTypes.map((type, index) => (
                <button
                  key={index}
                  onClick={() => handlePanelChange(index)}
                  className={`py-3 md:py-4 px-2 md:px-4 rounded-2xl font-semibold transition-all duration-300 transform text-sm md:text-base ${
                    activePanel === index
                      ? `bg-gradient-to-br ${type.color} text-white shadow-lg scale-105`
                      : 'bg-white text-gray-600 hover:bg-gray-50 shadow-sm'
                  }`}
                >
                  <span className="text-2xl md:text-4xl mb-1 md:mb-2 block">{type.icon}</span>
                  <span className="text-xs md:text-sm">{type.name}</span>
                </button>
              ))}
            </div>

            {/* Form Card */}
            <div ref={formContainerRef} className="bg-white rounded-3xl shadow-2xl p-6 md:p-10">
              
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">
                {showSignup && activePanel === 0 ? '✨ Student Registration' : `${loginTypes[activePanel].name} Login`}
              </h2>

              {/* LOGIN FORM */}
              {!showSignup || activePanel !== 0 ? (
                <form onSubmit={handleLogin} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@institution.com"
                      disabled={loading}
                      className="w-full px-4 py-3 md:py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none transition-all duration-300 disabled:opacity-50 text-sm md:text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      disabled={loading}
                      className="w-full px-4 py-3 md:py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none transition-all duration-300 disabled:opacity-50 text-sm md:text-base"
                    />
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 cursor-pointer text-gray-700">
                      <input type="checkbox" className="w-4 h-4 rounded accent-blue-600" disabled={loading} />
                      Remember me
                    </label>
                    <a href="#" className="text-blue-600 hover:text-blue-700 font-semibold">Forgot?</a>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 md:py-4 rounded-xl font-bold text-white transition-all duration-300 transform hover:scale-105 active:scale-95 text-sm md:text-base ${
                      loading
                        ? 'bg-gray-400 cursor-not-allowed'
                        : `bg-gradient-to-r ${loginTypes[activePanel].color} shadow-lg hover:shadow-xl`
                    }`}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                        Logging in...
                      </span>
                    ) : (
                      'Login'
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={signupData.name}
                        onChange={handleSignupChange}
                        placeholder="John Doe"
                        disabled={loading}
                        className="w-full px-3 md:px-4 py-2 md:py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none transition-all duration-300 disabled:opacity-50 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={signupData.email}
                        onChange={handleSignupChange}
                        placeholder="john@institution.com"
                        disabled={loading}
                        className="w-full px-3 md:px-4 py-2 md:py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none transition-all duration-300 disabled:opacity-50 text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">Roll Number</label>
                      <input
                        type="text"
                        name="rollNumber"
                        value={signupData.rollNumber}
                        onChange={handleSignupChange}
                        placeholder="RN001"
                        disabled={loading}
                        className="w-full px-3 md:px-4 py-2 md:py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none transition-all duration-300 disabled:opacity-50 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">Department</label>
                      <select
                        name="department"
                        value={signupData.department}
                        onChange={handleSignupChange}
                        disabled={loading}
                        className="w-full px-3 md:px-4 py-2 md:py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg text-gray-900 focus:border-blue-500 focus:outline-none transition-all duration-300 disabled:opacity-50 text-sm"
                      >
                        <option value="">Select Department</option>
                        {departments.map(dept => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      name="number"
                      value={signupData.number}
                      onChange={handleSignupChange}
                      placeholder="9876543210"
                      disabled={loading}
                      maxLength="10"
                      className="w-full px-3 md:px-4 py-2 md:py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none transition-all duration-300 disabled:opacity-50 text-sm"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">Password</label>
                      <input
                        type="password"
                        name="password"
                        value={signupData.password}
                        onChange={handleSignupChange}
                        placeholder="Min 6 characters"
                        disabled={loading}
                        className="w-full px-3 md:px-4 py-2 md:py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none transition-all duration-300 disabled:opacity-50 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={signupData.confirmPassword}
                        onChange={handleSignupChange}
                        placeholder="Confirm password"
                        disabled={loading}
                        className="w-full px-3 md:px-4 py-2 md:py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none transition-all duration-300 disabled:opacity-50 text-sm"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 md:py-4 rounded-xl font-bold text-white transition-all duration-300 transform hover:scale-105 active:scale-95 text-sm md:text-base ${
                      loading
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg hover:shadow-xl'
                    }`}
                  >
                    {loading ? 'Creating Account...' : '✨ Create Account'}
                  </button>
                </form>
              )}

              <div className="my-6 flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-300"></div>
                <span className="text-gray-500 text-xs md:text-sm font-medium">OR</span>
                <div className="flex-1 h-px bg-gray-300"></div>
              </div>

              {activePanel === 0 && (
                <button
                  type="button"
                  onClick={() => setShowSignup(!showSignup)}
                  disabled={loading}
                  className="w-full py-3 md:py-4 border-2 border-blue-300 hover:border-blue-500 text-blue-600 font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 text-sm md:text-base"
                >
                  {showSignup ? '← Back to Login' : '📝 Create New Account'}
                </button>
              )}
            </div>

            <p className="text-center text-gray-600 text-xs md:text-sm mt-6">
              {showSignup && activePanel === 0 ? (
                <>Already have account? <a href="#" className="text-blue-600 font-semibold hover:text-blue-700">Login</a></>
              ) : (
                <>Don't have account? <a href="#" className="text-blue-600 font-semibold hover:text-blue-700 cursor-pointer" onClick={() => activePanel === 0 && setShowSignup(true)}>Sign up</a></>
              )}
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideDown { animation: slideDown 0.3s ease-out; }
        @keyframes slideOutLeft {
          from { opacity: 1; transform: translateX(0); }
          to { opacity: 0; transform: translateX(-50px); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(50px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

export default Login;
