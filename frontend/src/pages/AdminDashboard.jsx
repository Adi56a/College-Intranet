import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiUserPlus,
  FiUsers,
  FiFileText,
  FiBell,
  FiEdit3,
  FiEye,
  FiClock,
  FiCalendar,
  FiActivity,
  FiSun,
  FiMoon
} from 'react-icons/fi';
import { MdSchool, MdDashboard, MdSettings, MdAnnouncement } from 'react-icons/md';
import Header from '../components/Header';

const TABS = [
  {
    label: "Add Teacher",
    route: "/add-teacher",
    icon: <FiUserPlus size={40} />,
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    description: "Register new faculty member",
    stat: "Active"
  },
  {
    label: "All Teachers",
    route: "/all-teachers",
    icon: <FiUsers size={40} />,
    color: "from-purple-500 to-indigo-500",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    description: "Manage teaching staff",
    stat: "Teachers"
  },
  {
    label: "All Students",
    route: "/all-students",
    icon: <MdSchool size={40} />,
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    description: "Monitor student records",
    stat: "Students"
  },
  {
    label: "All Notice",
    route: "/admintoall",
    icon: <FiFileText size={40} />,
    color: "from-rose-500 to-pink-500",
    bgColor: "bg-rose-50",
    borderColor: "border-rose-200",
    description: "View all announcements",
    stat: "Notices"
  },
  {
    label: "Create Notice",
    route: "/create-notice",
    icon: <FiBell size={40} />,
    color: "from-orange-500 to-red-500",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    description: "Publish announcements",
    stat: "Published"
  },
  {
    label: "Create Faculty Notice",
    route: "/admintohod",
    icon: <FiEdit3 size={40} />,
    color: "from-teal-500 to-cyan-600",
    bgColor: "bg-teal-50",
    borderColor: "border-teal-200",
    description: "Create notice for HOD/Faculty",
    stat: "Faculty"
  },
  {
    label: "Watch Faculty Notice",
    route: "/admin-to-faculty",
    icon: <FiEye size={40} />,
    color: "from-indigo-500 to-purple-600",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200",
    description: "View faculty announcements",
    stat: "View"
  }
];

const AdminDashboard = () => {
  const [adminName, setAdminName] = useState('Admin');
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
    if (hour < 12) return { text: 'Good Morning', icon: <FiSun size={28} /> };
    if (hour < 18) return { text: 'Good Afternoon', icon: <FiSun size={28} /> };
    return { text: 'Good Evening', icon: <FiMoon size={28} /> };
  };

  const getTimeString = () => {
    return currentTime.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: true 
    });
  };

  const getDayAndDate = () => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
  };

  const greeting = getGreeting();

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

          {/* Header Section */}
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
                  Welcome back, <span className="font-semibold text-blue-600">{adminName}</span>
                </h2>
                <p className="text-slate-600">
                  Manage your institution with ease from your dashboard.
                </p>
              </div>

              {/* Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
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

                {/* Status Card */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-2">
                    <FiActivity className="text-blue-600" size={20} />
                    <p className="text-sm font-semibold text-slate-600">System Status</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <p className="text-slate-900 font-semibold">All Systems Online</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Section */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Quick Actions</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {TABS.map((tab, idx) => (
                <button
                  key={tab.route}
                  onClick={() => navigate(tab.route)}
                  className="group bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-300 text-left"
                >
                  {/* Icon Container */}
                  <div className={`${tab.bgColor} ${tab.borderColor} border rounded-xl p-4 mb-4 inline-flex group-hover:scale-110 transition-transform duration-300`}>
                    <span className="text-slate-700">
                      {tab.icon}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {tab.label}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-slate-600 mb-4">
                    {tab.description}
                  </p>

                  {/* Badge */}
                  <div className="flex items-center justify-between">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${tab.color}`}>
                      {tab.stat}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Info Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Dashboard Overview</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <MdDashboard size={24} className="text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Dashboard</h4>
                  <p className="text-sm text-slate-600">Monitor all institutional activities</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <MdSettings size={24} className="text-green-600" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Management</h4>
                  <p className="text-sm text-slate-600">Manage teachers and students</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <MdAnnouncement size={24} className="text-purple-600" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Communication</h4>
                  <p className="text-sm text-slate-600">Keep everyone informed with notices</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
