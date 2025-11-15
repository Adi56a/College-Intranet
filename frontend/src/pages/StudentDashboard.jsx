import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';

const StudentDashboard = () => {
  const [studentData, setStudentData] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [fadeIn, setFadeIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setFadeIn(true);
    
    const token = localStorage.getItem('authToken');
    const userRole = localStorage.getItem('userRole');
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName');

    if (token && userRole === 'student') {
      setStudentData({
        name: userName || 'Student',
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
      title: 'Upload Your Work',
      description: 'Submit assignments and projects',
      icon: '📤',
      color: 'from-blue-400 to-cyan-500',
      hoverShadow: 'hover:shadow-blue-200',
      route: '/student-upload'
    },
    {
      title: 'My Work',
      description: 'View your submitted uploads',
      icon: '📂',
      color: 'from-indigo-400 to-blue-500',
      hoverShadow: 'hover:shadow-indigo-200',
      route: '/my-work'
    },
    {
      title: 'Notices',
      description: 'View announcements and updates',
      icon: '📢',
      color: 'from-cyan-400 to-blue-500',
      hoverShadow: 'hover:shadow-cyan-200',
      route: '/admintoall'
    }
  ];

  return (
    <>
      <Header />

      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-indigo-100 relative overflow-hidden">
        
        {/* Animated Background Blobs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 md:w-96 h-80 md:h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 md:w-96 h-80 md:h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 w-80 md:w-96 h-80 md:h-96 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        {/* Main Content */}
        <div className={`relative z-10 w-full min-h-screen flex items-center justify-center px-4 md:px-8 py-8 md:py-12 transition-all duration-1000 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
          <div className="w-full max-w-6xl">
            
            {/* Welcome Section */}
            <div className="mb-8 md:mb-16 animate-fadeInDown">
              <div className="bg-white rounded-3xl shadow-2xl border border-blue-100/50 p-6 md:p-10 lg:p-12 backdrop-blur-xl">
                
                {/* Greeting & Welcome */}
                <div className="space-y-3 md:space-y-5 mb-8 md:mb-10">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600">
                    {getGreeting()}
                  </h1>
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
                    👨‍🎓 Welcome Back, <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{studentData?.name || 'Student'}</span>!
                  </h2>
                  <p className="text-base md:text-lg text-gray-600 leading-relaxed">
                    You're all set to excel in your academic journey. Let's make today productive!
                  </p>
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  
                  {/* Date */}
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200/50 rounded-2xl p-4 md:p-6 transition-all duration-300 hover:shadow-lg hover:shadow-blue-100">
                    <p className="text-sm md:text-base text-gray-600 mb-2 font-semibold">📅 Today's Date</p>
                    <p className="text-lg md:text-xl text-gray-900 font-bold">{getDayAndDate()}</p>
                  </div>

                  {/* Time */}
                  <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200/50 rounded-2xl p-4 md:p-6 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-100">
                    <p className="text-sm md:text-base text-gray-600 mb-2 font-semibold">⏰ Current Time</p>
                    <p className="text-lg md:text-xl text-gray-900 font-bold font-mono">{getTimeString()}</p>
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
                  className={`group relative bg-white rounded-3xl shadow-lg border border-blue-100/50 p-6 md:p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 animate-fadeInUp`}
                  style={{ animationDelay: `${index * 100}ms` }}
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
                    <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-2 md:mb-3">
                      {shortcut.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6">
                      {shortcut.description}
                    </p>

                    {/* CTA Button */}
                    <div className={`inline-block px-6 py-2 md:px-8 md:py-3 bg-gradient-to-r ${shortcut.color} text-white font-semibold rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-y-2 group-hover:translate-y-0`}>
                      Get Started →
                    </div>
                  </div>

                  {/* Subtle Gradient Border */}
                  <div className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}
                    style={{
                      background: `linear-gradient(135deg, transparent, transparent)`,
                      borderRadius: '24px'
                    }}
                  ></div>
                </button>
              ))}
            </div>

            {/* Footer Note */}
            <div className="mt-12 md:mt-16 text-center animate-fadeInUp" style={{ animationDelay: '300ms' }}>
              <p className="text-sm md:text-base text-gray-600">
                💡 Keep yourself updated with latest announcements and submit your work on time
              </p>
            </div>
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

export default StudentDashboard;
