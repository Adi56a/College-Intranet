import React, { useState, useEffect } from 'react';
import Header from '../components/Header';

const Event = () => {
  const [events, setEvents] = useState([]);
  const [driveUrl, setDriveUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingEvents, setFetchingEvents] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [theme, setTheme] = useState('light');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setFetchingEvents(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:3000/api/teacher/get-events', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage({ type: 'error', text: data.message || '❌ Error fetching events' });
      } else {
        setEvents(data.events || []);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: '❌ Network error. Please try again.' });
    } finally {
      setFetchingEvents(false);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();

    if (!driveUrl.trim() || !title.trim()) {
      setMessage({ type: 'error', text: '❌ Drive URL and Title are required' });
      return;
    }

    // Basic URL validation
    if (!driveUrl.includes('drive.google.com') && !driveUrl.startsWith('http')) {
      setMessage({ type: 'error', text: '❌ Please enter a valid URL' });
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:3000/api/teacher/create-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          driveUrl: driveUrl.trim(),
          title: title.trim(),
          description: description.trim()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage({ type: 'error', text: data.message || '❌ Failed to create event' });
      } else {
        setMessage({ type: 'success', text: '✅ Event created successfully!' });
        setDriveUrl('');
        setTitle('');
        setDescription('');
        fetchEvents();
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: '❌ Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = (url, id) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(id);
      setMessage({ type: 'success', text: '✅ Link copied to clipboard!' });
      setTimeout(() => {
        setCopiedId(null);
        setMessage({ type: '', text: '' });
      }, 2000);
    }).catch(() => {
      setMessage({ type: 'error', text: '❌ Failed to copy link' });
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return date.toLocaleDateString('en-US', options);
  };

  const getRelativeTime = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return formatDate(dateString);
  };

  // Filter events based on search and date
  const filteredEvents = events.filter(event => {
    const matchesSearch = 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.description && event.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDate = dateFilter
      ? new Date(event.createdAt).toISOString().split('T')[0] === dateFilter
      : true;

    return matchesSearch && matchesDate;
  });

  const isDark = theme === 'dark';

  return (
    <>
      <Header />

      <div className={`min-h-screen transition-colors duration-300 ${
        isDark
          ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
          : 'bg-gradient-to-br from-white via-blue-50 to-indigo-100'
      } py-8 px-4`}>

        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className={`text-4xl md:text-5xl font-bold mb-2 ${
                isDark 
                  ? 'text-white' 
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent'
              }`}>
                🎉 Events Management
              </h1>
              <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                Create and manage your events
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* CREATE EVENT FORM */}
            <div className="lg:col-span-1">
              <div className={`rounded-2xl p-6 border sticky top-8 ${
                isDark
                  ? 'bg-gray-800/50 border-gray-700'
                  : 'bg-white border-gray-200'
              }`}>
                <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  ➕ Create Event
                </h2>

                <form onSubmit={handleCreateEvent} className="space-y-4">
                  {/* Title */}
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Event Title *
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter event title..."
                      className={`w-full px-4 py-3 rounded-lg border-2 transition-all ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                          : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                      } focus:outline-none`}
                      disabled={loading}
                    />
                  </div>

                  {/* Drive URL */}
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Drive URL *
                    </label>
                    <input
                      type="url"
                      value={driveUrl}
                      onChange={(e) => setDriveUrl(e.target.value)}
                      placeholder="https://drive.google.com/..."
                      className={`w-full px-4 py-3 rounded-lg border-2 transition-all ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                          : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                      } focus:outline-none`}
                      disabled={loading}
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Event description..."
                      rows="4"
                      className={`w-full px-4 py-3 rounded-lg border-2 transition-all resize-none ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                          : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                      } focus:outline-none`}
                      disabled={loading}
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 rounded-lg font-semibold transition-all ${
                      loading
                        ? 'bg-gray-400 cursor-not-allowed text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {loading ? 'Creating...' : '🚀 Create Event'}
                  </button>
                </form>
              </div>
            </div>

            {/* EVENTS TIMELINE */}
            <div className="lg:col-span-2">
              {/* Search & Filter */}
              <div className={`mb-6 rounded-2xl p-4 border ${
                isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <div className="flex flex-col md:flex-row gap-3">
                  <input
                    type="text"
                    placeholder="🔍 Search by title or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`flex-1 px-4 py-2 rounded-lg border transition-all ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:border-blue-500`}
                  />
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className={`px-4 py-2 rounded-lg border transition-all ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-gray-50 border-gray-300 text-gray-900'
                    } focus:outline-none focus:border-blue-500`}
                  />
                  {(searchQuery || dateFilter) && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setDateFilter('');
                      }}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                        isDark
                          ? 'bg-gray-700 text-white hover:bg-gray-600'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Events Count */}
              {!fetchingEvents && filteredEvents.length > 0 && (
                <div className={`mb-6 p-3 rounded-xl text-center ${
                  isDark ? 'bg-gray-800/50' : 'bg-blue-50'
                }`}>
                  <p className={`font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    📊 {filteredEvents.length} Event{filteredEvents.length !== 1 ? 's' : ''} Found
                  </p>
                </div>
              )}

              {/* Timeline */}
              <div className="space-y-6">
                {fetchingEvents ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
                    <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>Loading events...</p>
                  </div>
                ) : filteredEvents.length === 0 ? (
                  <div className={`text-center py-20 rounded-2xl border ${
                    isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <p className="text-5xl mb-4">🎉</p>
                    <p className={`text-lg font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      {searchQuery || dateFilter ? 'No events match your search' : 'No events created yet'}
                    </p>
                    <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {searchQuery || dateFilter ? 'Try adjusting your filters' : 'Create your first event to get started'}
                    </p>
                  </div>
                ) : (
                  filteredEvents.map((event, index) => (
                    <div
                      key={event._id}
                      className={`rounded-2xl p-6 border-l-4 transition-all hover:shadow-lg animate-fadeInUp ${
                        isDark
                          ? 'bg-gray-800/50 border-l-blue-500 border-r border-t border-b border-gray-700'
                          : 'bg-white border-l-blue-500 border-r border-t border-b border-gray-200'
                      }`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      {/* Event Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className={`text-2xl font-bold mb-2 uppercase ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {event.title}
                          </h3>
                          <p className={`text-sm flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            <span>🕐</span>
                            <span>{getRelativeTime(event.createdAt)}</span>
                            <span>•</span>
                            <span>{formatDate(event.createdAt)}</span>
                          </p>
                        </div>
                        <span className="text-3xl">🎉</span>
                      </div>

                      {/* Description */}
                      {event.description && (
                        <p className={`text-sm mb-4 leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          {event.description}
                        </p>
                      )}

                      {/* Drive Link */}
                      <div className={`p-4 rounded-lg border ${
                        isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-blue-50 border-blue-200'
                      }`}>
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-semibold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              📎 Drive Link
                            </p>
                            <a
                              href={event.driveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`text-sm font-mono truncate block hover:underline ${
                                isDark ? 'text-blue-400' : 'text-blue-600'
                              }`}
                            >
                              {event.driveUrl}
                            </a>
                          </div>
                          <button
                            onClick={() => handleCopyLink(event.driveUrl, event._id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                              copiedId === event._id
                                ? isDark
                                  ? 'bg-green-500/20 text-green-300 border border-green-500/50'
                                  : 'bg-green-100 text-green-700 border border-green-300'
                                : isDark
                                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                          >
                            {copiedId === event._id ? (
                              <>
                                <span>✓</span>
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
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

export default Event;
