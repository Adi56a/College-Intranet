import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiUpload, 
  FiFolder, 
  FiBell, 
  FiLock, 
  FiCalendar, 
  FiClock,
  FiSun,
  FiMoon,
  FiSunrise,
  FiArrowRight
} from 'react-icons/fi';
import Header from '../components/Header';

const StudentDashboard = () => {
  const [studentData, setStudentData] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
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
    if (hour < 12) return { text: 'Good Morning', icon: <FiSunrise className="inline" /> };
    if (hour < 18) return { text: 'Good Afternoon', icon: <FiSun className="inline" /> };
    return { text: 'Good Evening', icon: <FiMoon className="inline" /> };
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

  const greeting = getGreeting();

  const shortcuts = [
    {
      title: 'Upload Work',
      description: 'Submit assignments and projects',
      icon: <FiUpload size={32} />,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      route: '/student-upload'
    },
    {
      title: 'My Work',
      description: 'View submitted assignments',
      icon: <FiFolder size={32} />,
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      route: '/my-work'
    },
    {
      title: 'Notices',
      description: 'View announcements and updates',
      icon: <FiBell size={32} />,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      route: '/admintoall'
    },
    {
      title: 'Update Password',
      description: 'Change your account password',
      icon: <FiLock size={32} />,
      color: 'from-gray-600 to-gray-700',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      route: '/update-password'
    }
  ];

  return (
    <>
      <Header />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgb(51, 65, 85) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          
          {/* Welcome Section */}
          <div className="mb-12">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 lg:p-10">
              
              {/* Greeting */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-blue-600">{greeting.icon}</span>
                  <h1 className="text-3xl lg:text-4xl font-bold text-slate-900">
                    {greeting.text}
                  </h1>
                </div>
                <h2 className="text-xl lg:text-2xl text-slate-700 mb-2">
                  Welcome back, <span className="font-semibold text-blue-600">{studentData?.name || 'Student'}</span>
                </h2>
                <p className="text-slate-600">
                  Ready to make today productive and successful.
                </p>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Date Card */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-2">
                    <FiCalendar className="text-blue-600" size={20} />
                    <p className="text-sm font-semibold text-slate-600">Today's Date</p>
                  </div>
                  <p className="text-lg font-semibold text-slate-900">{getDayAndDate()}</p>
                </div>

                {/* Time Card */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-2">
                    <FiClock className="text-blue-600" size={20} />
                    <p className="text-sm font-semibold text-slate-600">Current Time</p>
                  </div>
                  <p className="text-lg font-semibold text-slate-900 font-mono">{getTimeString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-6">Quick Actions</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {shortcuts.map((shortcut, index) => (
                <button
                  key={index}
                  onClick={() => navigate(shortcut.route)}
                  className="group bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-300 text-left"
                >
                  {/* Icon Container */}
                  <div className={`${shortcut.bgColor} ${shortcut.borderColor} border rounded-xl p-4 mb-4 inline-flex group-hover:scale-110 transition-transform duration-300`}>
                    <span className="text-slate-700">
                      {shortcut.icon}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {shortcut.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-slate-600 mb-4">
                    {shortcut.description}
                  </p>

                  {/* Arrow */}
                  <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Open</span>
                    <FiArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Info Note */}
          <div className="mt-12 text-center">
            <p className="text-slate-600 text-sm">
              Stay updated with announcements and submit your work on time for the best results.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentDashboard;
