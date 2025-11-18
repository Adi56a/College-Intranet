import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';


const TABS = [
  {
    label: "Add Teacher",
    route: "/add-teacher",
    icon: "➕",
    color: "from-blue-500 to-cyan-500",
    description: "Register new faculty member",
    stat: "Active"
  },
  {
    label: "All Teachers",
    route: "/all-teachers",
    icon: "👨‍🏫",
    color: "from-purple-500 to-indigo-500",
    description: "Manage teaching staff",
    stat: "Teachers"
  },
  {
    label: "All Students",
    route: "/all-students",
    icon: "👥",
    color: "from-green-500 to-emerald-500",
    description: "Monitor student records",
    stat: "Students"
  },
  {
    label: "All Notice",
    route: "/admintoall",
    icon: "📋",
    color: "from-rose-500 to-pink-500",
    description: "View all announcements",
    stat: "Notices"
  },
  {
    label: "Create Notice",
    route: "/create-notice",
    icon: "📢",
    color: "from-orange-500 to-red-500",
    description: "Publish announcements",
    stat: "Published"
  },
  {
    label: "Create Faculty Notice",
    route: "/admintohod",
    icon: "✍️",
    color: "from-teal-500 to-cyan-600",
    description: "Create notice for HOD/Faculty",
    stat: "Faculty"
  },
  {
    label: "Watch Faculty Notice",
    route: "/admin-to-faculty",
    icon: "👀",
    color: "from-indigo-500 to-purple-600",
    description: "View faculty announcements",
    stat: "View"
  }
];


const AdminDashboard = () => {
  const [adminName, setAdminName] = useState('Admin');
  const [theme, setTheme] = useState('light');
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();


  useEffect(() => {
    const uname = localStorage.getItem('userName');
    if (uname) setAdminName(uname);


    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);


  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '🌅 Good Morning';
    if (hour < 18) return '☀️ Good Afternoon';
    return '🌙 Good Evening';
  };


  const getTimeString = () => {
    return currentTime.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };


  const getDayAndDate = () => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
  };


  const isDark = theme === 'dark';


  return (
    <>
      <Header />
      <div className={`min-h-screen transition-colors duration-300 ${
        isDark
          ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
          : 'bg-gradient-to-br from-white via-blue-50 to-indigo-100'
      } relative overflow-hidden py-8 px-4`}>


        {/* Background Blobs */}
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
        <div className="relative z-10 w-full max-w-7xl mx-auto">


          {/* Header with Theme Toggle */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className={`text-4xl md:text-5xl font-bold mb-2 ${
                isDark 
                  ? 'text-white' 
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent'
              }`}>
                {getGreeting()}
              </h1>
              <p className={`text-xl font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Welcome back, <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{adminName}</span>
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
              {isDark ? '☀️' : '🌙'}
            </button>
          </div>


          {/* Welcome Card */}
          <div className={`rounded-3xl p-6 md:p-8 mb-8 border transition-all duration-300 backdrop-blur-xl ${
            isDark
              ? 'bg-gray-800/50 border-gray-700/50'
              : 'bg-white border-blue-100/50'
          }`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Today's Date</p>
                <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{getDayAndDate()}</p>
              </div>
              <div>
                <p className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Current Time</p>
                <p className={`text-lg font-bold font-mono ${isDark ? 'text-white' : 'text-gray-900'}`}>{getTimeString()}</p>
              </div>
              <div>
                <p className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Status</p>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <p className={isDark ? 'text-white' : 'text-gray-900'}>All Systems Online</p>
                </div>
              </div>
            </div>
          </div>


          {/* Quick Actions Title */}
          <div className="mb-6">
            <h2 className={`text-2xl md:text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              ⚡ Quick Actions
            </h2>
            <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Access main administrative functions
            </p>
          </div>


          {/* Quick Actions Grid - Updated to handle 7 items */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {TABS.map((tab, idx) => (
              <button
                key={tab.route}
                onClick={() => navigate(tab.route)}
                className={`group relative rounded-2xl border overflow-hidden transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl animate-fadeInUp ${
                  isDark
                    ? 'bg-gray-800/50 border-gray-700/50'
                    : 'bg-white border-blue-100/50'
                }`}
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                {/* Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-r ${tab.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>


                {/* Content */}
                <div className="relative p-6 text-center">
                  <div className={`text-5xl md:text-6xl mb-3 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6`}>
                    {tab.icon}
                  </div>
                  <h3 className={`text-lg md:text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {tab.label}
                  </h3>
                  <p className={`text-xs md:text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {tab.description}
                  </p>
                  <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${tab.color}`}>
                    {tab.stat}
                  </div>
                </div>


                {/* Bottom Bar */}
                <div className={`h-1 bg-gradient-to-r ${tab.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left absolute bottom-0 w-full`}></div>
              </button>
            ))}
          </div>


          {/* Info Section */}
          <div className={`rounded-2xl p-6 md:p-8 border transition-all duration-300 ${
            isDark
              ? 'bg-gray-800/50 border-gray-700/50'
              : 'bg-blue-50/50 border-blue-200/50'
          }`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-2xl mb-2">📊</p>
                <h4 className={`font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Dashboard</h4>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Monitor all institutional activities</p>
              </div>
              <div>
                <p className="text-2xl mb-2">⚙️</p>
                <h4 className={`font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Management</h4>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Manage teachers and students</p>
              </div>
              <div>
                <p className="text-2xl mb-2">📢</p>
                <h4 className={`font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Communication</h4>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Keep everyone informed with notices</p>
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
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeInUp {
            animation: fadeInUp 0.6s ease-out forwards;
          }
        `}</style>
      </div>
    </>
  );
};


export default AdminDashboard;
