import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  
  const userRole = localStorage.getItem('userRole') || '';
  const userName = localStorage.getItem('userName') || 'User';

  // Auto-logout after 6 hours
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      navigate('/login');
    }, 6 * 60 * 60 * 1000); // 6 hours in milliseconds

    return () => clearTimeout(timer);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    setMenuOpen(false);
    navigate('/login');
  };

  const getRoleColor = () => {
    switch (userRole) {
      case 'student':
        return 'bg-blue-500/20 text-blue-400';
      case 'teacher':
        return 'bg-purple-500/20 text-purple-400';
      case 'admin':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getRoleIcon = () => {
    switch (userRole) {
      case 'student':
        return '🎓';
      case 'teacher':
        return '👨‍🏫';
      case 'admin':
        return '⚙️';
      default:
        return '👤';
    }
  };

  return (
    <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 shadow-lg border-b border-slate-700/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          
          {/* Logo Section */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg">
              <span className="text-white font-bold text-lg">FI</span>
            </div>
            <div className="hidden sm:flex flex-col">
              <h1 className="text-xl sm:text-2xl font-bold text-white">FEAT Intranet</h1>
              <p className="text-xs text-gray-400">Educational Management System</p>
            </div>
          </div>

          {/* Mobile Logo Only */}
          <div className="sm:hidden">
            <h1 className="text-lg font-bold text-white">FEAT</h1>
          </div>

          {/* Right Section - Desktop */}
          <div className="hidden md:flex items-center gap-6">
            
            {/* User Role Badge */}
            <div className={`px-4 py-2 rounded-full font-semibold text-sm flex items-center gap-2 capitalize ${getRoleColor()}`}>
              <span>{getRoleIcon()}</span>
              <span>{userRole}</span>
            </div>

            {/* User Name */}
            <div className="flex flex-col items-end">
              <p className="text-white font-semibold text-sm">{userName}</p>
              <p className="text-gray-400 text-xs">Logged in</p>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="px-6 py-2 rounded-lg font-semibold bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <span>🚪</span>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-3">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 text-white transition-all"
            >
              <svg
                className={`w-6 h-6 transition-transform ${menuOpen ? 'rotate-90' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-700/50 mt-4 pt-4 animate-slideDown">
            
            {/* Mobile User Info */}
            <div className="mb-4 p-3 bg-gray-700/30 rounded-lg">
              <p className="text-white font-semibold text-sm">{userName}</p>
              <div className={`mt-2 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2 capitalize w-fit ${getRoleColor()}`}>
                <span>{getRoleIcon()}</span>
                <span>{userRole}</span>
              </div>
            </div>

            {/* Mobile Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full px-4 py-3 rounded-lg font-semibold bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white transition-all duration-300 flex items-center justify-center gap-2"
            >
              <span>🚪</span>
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>

      {/* Tailwind Animations */}
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
