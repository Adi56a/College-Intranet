import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaLock, FaEnvelope } from 'react-icons/fa';

const Login = () => {
  const [activePanel, setActivePanel] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

  const loginTypes = [
    { name: 'Student', icon: '🎓', color: 'from-blue-500 to-blue-600', hoverColor: 'hover:from-blue-600 hover:to-blue-700' },
    { name: 'Teacher', icon: '👨‍🏫', color: 'from-purple-500 to-purple-600', hoverColor: 'hover:from-purple-600 hover:to-purple-700' },
    { name: 'Admin', icon: '⚙️', color: 'from-gray-700 to-gray-800', hoverColor: 'hover:from-gray-800 hover:to-gray-900' }
  ];

  const handlePanelChange = (index) => {
    if (index === activePanel) return;
    
    if (formContainerRef.current) {
      formContainerRef.current.style.animation = 'slideOutLeft 0.3s ease-in forwards';
      setTimeout(() => {
        setActivePanel(index);
        setEmail('');
        setPassword('');
        setShowPassword(false);
        setMessage({ type: '', text: '' });
        if (formContainerRef.current) {
          formContainerRef.current.style.animation = 'slideInRight 0.3s ease-out forwards';
        }
      }, 300);
    } else {
      setActivePanel(index);
      setEmail('');
      setPassword('');
      setShowPassword(false);
      setMessage({ type: '', text: '' });
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    if (!email.trim() || !password.trim()) {
      setMessage({ type: 'error', text: 'Email and password are required' });
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
        localStorage.setItem('userName', decodedToken.name || 'User');
        
        setMessage({ type: 'success', text: 'Login successful! Redirecting...' });
        setEmail('');
        setPassword('');
        
        setTimeout(() => {
          if (roleFromToken === 'student') navigate('/student-dashboard');
          else if (roleFromToken === 'teacher') navigate('/teacher-dashboard');
          else if (roleFromToken === 'admin') navigate('/admin-dashboard');
        }, 1000);
      }
    } catch (error) {
      console.error('Login error:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col relative overflow-hidden">
      
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgb(51, 65, 85) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      {/* Message Popup */}
      {message.text && (
        <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 animate-slideDown ${
          message.type === 'success' 
            ? 'bg-green-50 border-2 border-green-500 text-green-800' 
            : 'bg-red-50 border-2 border-red-500 text-red-800'
        } px-6 py-4 rounded-xl shadow-2xl max-w-md w-full mx-4`}>
          <p className="font-semibold text-center">{message.text}</p>
        </div>
      )}

      {/* Main Content Container */}
      <div className="flex-1 flex items-center justify-center p-4 py-8">
        <div className="relative z-10 w-full max-w-6xl">
          
          <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
            
            {/* Left Side - Branding */}
            <div className="hidden md:block">
              <div className="mb-10">
                <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 mb-4">FEAT INTRANET</h1>
                <div className="w-24 h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"></div>
              </div>
              <p className="text-slate-600 text-lg lg:text-xl mb-12 leading-relaxed">
                Secure authentication portal for students, teachers, and administrators.
              </p>
              
              <div className="space-y-6">
                {loginTypes.map((type, idx) => (
                  <div key={idx} className="flex items-center gap-5 group">
                    <div className={`p-5 rounded-2xl bg-gradient-to-br ${type.color} text-white text-4xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      {type.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-xl">{type.name} Portal</h3>
                      <p className="text-slate-600">Secure access for {type.name.toLowerCase()}s</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side - Login Form */}
            <div>
              
              {/* Mobile Branding */}
              <div className="md:hidden text-center mb-8">
                <h1 className="text-4xl font-bold text-slate-900 mb-3">FEAT Intranet</h1>
                <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mx-auto mb-3"></div>
                <p className="text-slate-600">Secure Portal Access</p>
              </div>

              {/* Role Selector */}
              <div className="grid grid-cols-3 gap-3 mb-8">
                {loginTypes.map((type, index) => (
                  <button
                    key={index}
                    onClick={() => handlePanelChange(index)}
                    className={`py-5 px-3 rounded-2xl font-semibold transition-all duration-300 ${
                      activePanel === index
                        ? `bg-gradient-to-br ${type.color} text-white shadow-xl scale-105`
                        : 'bg-white text-slate-700 hover:bg-slate-50 shadow-md hover:shadow-lg'
                    }`}
                  >
                    <span className="text-4xl mb-2 block">{type.icon}</span>
                    <span className="text-sm block">{type.name}</span>
                  </button>
                ))}
              </div>

              {/* Login Card */}
              <div ref={formContainerRef} className="bg-white rounded-3xl shadow-2xl p-8 lg:p-10 border border-slate-200">
                
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">
                    {loginTypes[activePanel].name} Login
                  </h2>
                  <p className="text-slate-500">Enter your credentials to access your account</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                  
                  {/* Email Field */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FaEnvelope className="text-slate-400" />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your.email@institution.edu"
                        disabled={loading}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none transition-all disabled:opacity-50"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FaLock className="text-slate-400" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        disabled={loading}
                        className="w-full pl-12 pr-12 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none transition-all disabled:opacity-50"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                        disabled={loading}
                      >
                        {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                      </button>
                    </div>
                  </div>

                  {/* Remember & Forgot */}
                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" 
                        disabled={loading} 
                      />
                      <span>Remember me</span>
                    </label>
                    <a href="#" className="text-blue-600 hover:text-blue-700 font-semibold">
                      Forgot password?
                    </a>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-4 rounded-xl font-bold text-white transition-all duration-300 ${
                      loading
                        ? 'bg-slate-400 cursor-not-allowed'
                        : `bg-gradient-to-r ${loginTypes[activePanel].color} ${loginTypes[activePanel].hoverColor} shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]`
                    }`}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                        Signing in...
                      </span>
                    ) : (
                      `Sign in as ${loginTypes[activePanel].name}`
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer - Always Visible */}
      <footer className="relative z-10 w-full bg-white/90 backdrop-blur-sm border-t border-slate-200 py-6 px-4 mt-auto">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <p className="font-semibold text-slate-800 text-sm md:text-base">
                💻 Developed by <span className="text-blue-600">Aditya Jogdand</span>
              </p>
              <p className="text-slate-600 text-xs md:text-sm">B.Tech in Artificial Intelligence & Machine Learning</p>
            </div>
            
            <div className="hidden md:block w-px h-12 bg-slate-300"></div>
            
            <div className="text-center md:text-right">
              <p className="text-slate-700 font-medium text-sm mb-1">Contact</p>
              <a 
                href="mailto:adityajogdand15@gmail.com" 
                className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors inline-flex items-center gap-2"
              >
                📧 adityajogdand15@gmail.com
              </a>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-slate-200 text-center">
            <p className="text-xs text-slate-500">
              © 2025 FEAT Intranet • Built with React & Tailwind CSS • All Rights Reserved
            </p>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translate(-50%, -20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        .animate-slideDown { animation: slideDown 0.3s ease-out; }
        @keyframes slideOutLeft {
          from { opacity: 1; transform: translateX(0); }
          to { opacity: 0; transform: translateX(-30px); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

export default Login;
