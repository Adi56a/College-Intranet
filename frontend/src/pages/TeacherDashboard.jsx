import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';


const TeacherDashboard = () => {
  const [teacherData, setTeacherData] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [theme, setTheme] = useState('light');
  const [fadeIn, setFadeIn] = useState(false);
  const navigate = useNavigate();


  useEffect(() => {
    setFadeIn(true);
    
    const token = localStorage.getItem('authToken');
    const userRole = localStorage.getItem('userRole');
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName');


    if (token && userRole === 'teacher') {
      setTeacherData({
        name: userName || 'Teacher',
        role: userRole,
        id: userId
      });
    }


    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);


    return () => clearInterval(timer);
  }, []);


  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '🌅 Good Morning';
    if (hour < 18) return '☀️ Good Afternoon';
    return '🌙 Good Evening';
  };


  const getDayAndDate = () => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
  };


  const getTimeString = () => {
    return currentTime.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: true 
    });
  };


  const shortcuts = [
    {
      title: 'All Students',
      description: 'Manage all enrolled students',
      icon: '👥',
      color: 'from-blue-400 to-cyan-500',
      hoverShadow: 'hover:shadow-blue-200',
      route: '/all-students'
    },
    {
      title: 'General Notices',
      description: 'View announcements & updates',
      icon: '📢',
      color: 'from-indigo-400 to-blue-500',
      hoverShadow: 'hover:shadow-indigo-200',
      route: '/admintoall'
    },
    {
      title: 'Admin Notices',
      description: 'View admin notices for faculty',
      icon: '👀',
      color: 'from-purple-400 to-indigo-500',
      hoverShadow: 'hover:shadow-purple-200',
      route: '/admin-to-faculty'
    }, 
    {
      title: 'Manage Subject',
      description: 'Add Subject for students to upload',
      icon: '➕',
      color: 'from-purple-400 to-indigo-500',
      hoverShadow: 'hover:shadow-purple-200',
      route: '/manage-subjects'
    },
    {
      title: 'Manage Events',
      description: 'Upload drive links with Event titles',
      icon: '🎊',
      color: 'from-indigo-400 to-blue-500',
      hoverShadow: 'hover:shadow-indigo-200',
      route: '/events'
    },
    {
      title: 'Personal Files',
      description: 'Upload Class files for Easy access',
      icon: '📚',
      color: 'from-indigo-400 to-blue-500',
      hoverShadow: 'hover:shadow-indigo-200',
      route: '/personal'
    }

  ];


  const isDark = theme === 'dark';


  return (
    <>
      <Header />


      <div className={`min-h-screen transition-colors duration-300 ${
        isDark 
          ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
          : 'bg-gradient-to-br from-white via-blue-50 to-indigo-100'
      } py-8 px-4 relative overflow-hidden`}>


        {/* Animated Background Blobs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute -top-40 -right-40 w-80 md:w-96 h-80 md:h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob ${
            isDark ? 'bg-blue-500' : 'bg-blue-200'
          }`}></div>
          <div className={`absolute -bottom-40 -left-40 w-80 md:w-96 h-80 md:h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000 ${
            isDark ? 'bg-purple-500' : 'bg-indigo-200'
          }`}></div>
          <div className={`absolute top-1/2 left-1/2 w-80 md:w-96 h-80 md:h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000 ${
            isDark ? 'bg-cyan-500' : 'bg-cyan-200'
          }`}></div>
        </div>


        {/* Main Content */}
        <div className={`relative z-10 w-full max-w-6xl mx-auto transition-all duration-1000 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>


          {/* Header with Theme Toggle */}
          <div className="flex justify-between items-start mb-10 animate-fadeInDown">
            <div>
              <h1 className={`text-4xl md:text-5xl font-bold mb-2 ${
                isDark 
                  ? 'text-white' 
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent'
              }`}>
                👨‍🏫 Teacher Dashboard
              </h1>
              <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                Manage students and view announcements
              </p>
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
              {isDark ? '☀️ Light' : '🌙 Dark'}
            </button>
          </div>


          {/* Welcome Section */}
          <div className="mb-10 animate-fadeInDown" style={{ animationDelay: '100ms' }}>
            <div className={`rounded-3xl shadow-2xl p-6 md:p-10 lg:p-12 border transition-all duration-300 backdrop-blur-xl ${
              isDark
                ? 'bg-gray-800/50 border-gray-700/50'
                : 'bg-white border-blue-100/50'
            }`}>
              
              {/* Greeting & Welcome */}
              <div className="space-y-3 md:space-y-5 mb-8 md:mb-10">
                <h2 className={`text-4xl md:text-5xl lg:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600`}>
                  {getGreeting()}
                </h2>
                <h3 className={`text-2xl md:text-3xl lg:text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Welcome Back, <span className={`bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent`}>
                    {teacherData?.name || 'Teacher'}
                  </span>!
                </h3>
                <p className={`text-base md:text-lg leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  You're all set to manage your students and stay updated with important announcements
                </p>
              </div>


              {/* Date & Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                
                {/* Date */}
                <div className={`rounded-2xl p-4 md:p-6 transition-all duration-300 hover:shadow-lg ${
                  isDark
                    ? 'bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-500/30'
                    : 'bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200/50'
                }`}>
                  <p className={`text-sm md:text-base font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>📅 Today's Date</p>
                  <p className={`text-lg md:text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{getDayAndDate()}</p>
                </div>


                {/* Time */}
                <div className={`rounded-2xl p-4 md:p-6 transition-all duration-300 hover:shadow-lg ${
                  isDark
                    ? 'bg-gradient-to-br from-indigo-600/20 to-blue-600/20 border border-indigo-500/30'
                    : 'bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200/50'
                }`}>
                  <p className={`text-sm md:text-base font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>⏰ Current Time</p>
                  <p className={`text-lg md:text-xl font-bold font-mono ${isDark ? 'text-white' : 'text-gray-900'}`}>{getTimeString()}</p>
                </div>
              </div>
            </div>
          </div>


          {/* Quick Shortcuts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {shortcuts.map((shortcut, index) => (
              <button
                key={index}
                onClick={() => navigate(shortcut.route)}
                className={`group relative rounded-3xl shadow-lg border p-6 md:p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 animate-fadeInUp ${
                  isDark
                    ? 'bg-gray-800/50 border-gray-700/50 hover:border-blue-500/50'
                    : 'bg-white border-blue-100/50 hover:border-blue-400/50'
                }`}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Gradient Background on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${shortcut.color} rounded-3xl opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>


                {/* Content */}
                <div className="relative z-10 text-center">
                  {/* Icon */}
                  <div className={`text-5xl md:text-6xl mb-4 md:mb-6 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6`}>
                    {shortcut.icon}
                  </div>


                  {/* Title */}
                  <h4 className={`text-lg md:text-xl lg:text-2xl font-bold mb-2 md:mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {shortcut.title}
                  </h4>


                  {/* Description */}
                  <p className={`text-sm md:text-base mb-4 md:mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {shortcut.description}
                  </p>


                  {/* CTA Arrow */}
                  <div className={`inline-block px-6 py-2 md:px-8 md:py-3 bg-gradient-to-r ${shortcut.color} text-white font-semibold rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-y-2 group-hover:translate-y-0 text-sm md:text-base`}>
                    Access →
                  </div>
                </div>
              </button>
            ))}
          </div>


          {/* Footer Note */}
          <div className="mt-12 md:mt-16 text-center animate-fadeInUp" style={{ animationDelay: '450ms' }}>
            <p className={`text-sm md:text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              💡 Keep your students engaged and informed with timely updates
            </p>
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
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInDown {
          animation: fadeInDown 0.6s ease-out;
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
        }
      `}</style>
    </>
  );
};


export default TeacherDashboard;
