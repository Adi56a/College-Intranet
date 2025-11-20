import React, { useState, useEffect } from 'react';
import Header from '../components/Header';

const UpdatePassword = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingPassword, setFetchingPassword] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [theme, setTheme] = useState('light');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    fetchCurrentPassword();
  }, []);

  const fetchCurrentPassword = async () => {
    try {
      setFetchingPassword(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:3000/api/student/getpassword', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage({ type: 'error', text: data.message || '❌ Error fetching password' });
      } else {
        setCurrentPassword(data.password || '');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: '❌ Network error. Please try again.' });
    } finally {
      setFetchingPassword(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    // Validation
    if (!newPassword.trim()) {
      setMessage({ type: 'error', text: '❌ New password is required' });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: '❌ Password must be at least 6 characters long' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: '❌ Passwords do not match' });
      return;
    }

    if (newPassword === currentPassword) {
      setMessage({ type: 'error', text: '❌ New password must be different from current password' });
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:3000/api/student/updatepassword', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newPassword: newPassword.trim() })
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage({ type: 'error', text: data.message || '❌ Failed to update password' });
      } else {
        setMessage({ type: 'success', text: '✅ Password updated successfully!' });
        setCurrentPassword(newPassword);
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: '❌ Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const isDark = theme === 'dark';

  return (
    <>
      <Header />

      <div className={`min-h-screen transition-colors duration-300 ${
        isDark
          ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
          : 'bg-gradient-to-br from-white via-blue-50 to-indigo-100'
      } py-8 px-4`}>

        <div className="max-w-2xl mx-auto">

          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className={`text-4xl md:text-5xl font-bold mb-2 ${
                isDark 
                  ? 'text-white' 
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent'
              }`}>
                🔐 Update Password
              </h1>
              <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                Change your account password securely
              </p>
            </div>

            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                isDark
                  ? 'bg-white/10 text-white hover:bg-white/20'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {isDark ? '☀️' : '🌙'}
            </button>
          </div>

          {/* Alert Messages */}
          {message.text && (
            <div className={`mb-6 p-4 rounded-xl animate-slideDown ${
              message.type === 'success'
                ? isDark
                  ? 'bg-green-500/20 text-green-300 border border-green-500/50'
                  : 'bg-green-50 text-green-800 border border-green-200'
                : isDark
                  ? 'bg-red-500/20 text-red-300 border border-red-500/50'
                  : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              <p className="text-center font-semibold">{message.text}</p>
            </div>
          )}

          {/* Update Password Form */}
          <div className={`rounded-2xl p-8 border ${
            isDark
              ? 'bg-gray-800/50 border-gray-700'
              : 'bg-white border-gray-200'
          }`}>

            {fetchingPassword ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
                <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>Loading...</p>
              </div>
            ) : (
              <form onSubmit={handleUpdatePassword} className="space-y-6">

                {/* Current Password (Read-only) */}
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      disabled
                      className={`w-full px-4 py-3 rounded-lg border-2 transition-all cursor-not-allowed ${
                        isDark
                          ? 'bg-gray-700/50 border-gray-600 text-gray-400'
                          : 'bg-gray-100 border-gray-300 text-gray-600'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                        isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {showCurrentPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    New Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password (min 6 characters)..."
                      className={`w-full px-4 py-3 rounded-lg border-2 transition-all ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                          : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                      } focus:outline-none`}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                        isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {showNewPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Confirm New Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password..."
                      className={`w-full px-4 py-3 rounded-lg border-2 transition-all ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                          : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                      } focus:outline-none`}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                        isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>

                {/* Password Match Indicator */}
                {newPassword && confirmPassword && (
                  <div className={`p-3 rounded-lg text-sm ${
                    newPassword === confirmPassword
                      ? isDark
                        ? 'bg-green-500/20 text-green-300'
                        : 'bg-green-50 text-green-700'
                      : isDark
                        ? 'bg-red-500/20 text-red-300'
                        : 'bg-red-50 text-red-700'
                  }`}>
                    {newPassword === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || !newPassword || !confirmPassword}
                  className={`w-full py-3 rounded-lg font-semibold transition-all ${
                    loading || !newPassword || !confirmPassword
                      ? 'bg-gray-400 cursor-not-allowed text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {loading ? 'Updating...' : '🔒 Update Password'}
                </button>
              </form>
            )}
          </div>
        </div>
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
    </>
  );
};

export default UpdatePassword;
