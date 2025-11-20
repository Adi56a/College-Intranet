import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiMenu,
  FiX,
  FiLogOut,
  FiUser
} from 'react-icons/fi';
import { MdSchool, MdAdminPanelSettings } from 'react-icons/md';
import { HiAcademicCap } from 'react-icons/hi';

const Header = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const userRole = localStorage.getItem('userRole') || '';
  const userName = localStorage.getItem('userName') || 'User';

  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        clearSessionAndRedirect();
        return;
      }

      try {
        const response = await fetch('http://localhost:3000/tokencheck', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ token })
        });

        if (!response.ok) {
          clearSessionAndRedirect();
        }
      } catch (error) {
        clearSessionAndRedirect();
      }
    };

    const clearSessionAndRedirect = () => {
      localStorage.removeItem('authToken');
      localStorage.removeItem('authTokenExpiry');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      navigate('/login');
    };

    validateToken();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authTokenExpiry');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    setMenuOpen(false);
    navigate('/login');
  };

  const getRoleConfig = () => {
    switch (userRole) {
      case 'student':
        return {
          color: 'bg-blue-600 text-white',
          icon: <HiAcademicCap size={20} />,
          label: 'Student'
        };
      case 'teacher':
        return {
          color: 'bg-purple-600 text-white',
          icon: <MdSchool size={20} />,
          label: 'Teacher'
        };
      case 'admin':
        return {
          color: 'bg-gradient-to-r from-orange-500 to-red-600 text-white',
          icon: <MdAdminPanelSettings size={20} />,
          label: 'Admin'
        };
      default:
        return {
          color: 'bg-slate-600 text-white',
          icon: <FiUser size={20} />,
          label: 'User'
        };
    }
  };

  const roleConfig = getRoleConfig();

  return (
    <header className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3">
          
          {/* Logo and Brand */}
          <div className="flex items-center gap-4">
            {/* Large Logo - 80x80 (8x bigger than original 10x10) */}
            <div className="flex items-center justify-center w-20 h-20 bg-white rounded-xl shadow-lg overflow-hidden p-2">
              <img 
                src="/logo.png" 
                alt="FEAT Logo" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  // Fallback if image doesn't load
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = '<span class="text-blue-600 font-bold text-4xl">FI</span>';
                }}
              />
            </div>
            <div className="hidden sm:flex flex-col">
              <h1 className="text-xl font-bold text-white">FEAT Intranet</h1>
              <p className="text-sm text-blue-100">Educational Management System</p>
            </div>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-4">
            
            {/* Role Badge */}
            <div className={`px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 shadow-md ${roleConfig.color}`}>
              {roleConfig.icon}
              <span>{roleConfig.label}</span>
            </div>

            {/* User Info */}
            <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <FiUser size={18} className="text-blue-600" />
              </div>
              <div className="flex flex-col">
                <p className="text-white font-semibold text-sm">{userName}</p>
                <p className="text-blue-100 text-xs">Active</p>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold bg-white text-blue-600 hover:bg-blue-50 transition-all shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
            >
              <FiLogOut size={18} />
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2.5 rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white transition-all"
            >
              {menuOpen ? (
                <FiX size={26} />
              ) : (
                <FiMenu size={26} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 border-t border-white/20 mt-2 pt-4 animate-slideDown">
            
            {/* Mobile User Info */}
            <div className="mb-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center">
                  <FiUser size={24} className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-bold text-lg">{userName}</p>
                  <p className="text-blue-100 text-sm">Active Session</p>
                </div>
              </div>
              
              {/* Mobile Role Badge */}
              <div className={`px-4 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 shadow-md ${roleConfig.color}`}>
                {roleConfig.icon}
                <span>{roleConfig.label}</span>
              </div>
            </div>

            {/* Mobile Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl font-bold bg-white text-blue-600 hover:bg-blue-50 transition-all shadow-md"
            >
              <FiLogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>

      <style>{`
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
    </header>
  );
};

export default Header;
