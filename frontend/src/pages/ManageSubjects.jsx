import React, { useState, useEffect } from 'react';
import Header from '../components/Header';

// 50 Computer Science Engineering subjects including AIML and AIDS specializations
const SUGGESTED_SUBJECTS = [
  'Data Structures',
  'Algorithms',
  'Operating Systems',
  'Database Management Systems',
  'Computer Networks',
  'Software Engineering',
  'Object Oriented Programming',
  'Web Development',
  'Mobile Application Development',
  'Cloud Computing',
  'Cyber Security',
  'Artificial Intelligence',
  'Machine Learning',
  'Deep Learning',
  'Natural Language Processing',
  'Computer Vision',
  'Neural Networks',
  'Reinforcement Learning',
  'Data Mining',
  'Big Data Analytics',
  'Data Science',
  'Business Intelligence',
  'Information Retrieval',
  'Pattern Recognition',
  'Expert Systems',
  'Fuzzy Logic',
  'Genetic Algorithms',
  'Digital Image Processing',
  'Speech Processing',
  'Robotics',
  'Internet of Things',
  'Blockchain Technology',
  'Distributed Systems',
  'Parallel Computing',
  'Compiler Design',
  'Theory of Computation',
  'Discrete Mathematics',
  'Linear Algebra',
  'Probability and Statistics',
  'Numerical Methods',
  'Computer Graphics',
  'Human Computer Interaction',
  'Software Testing',
  'DevOps',
  'Agile Methodology',
  'Data Warehousing',
  'ETL Processes',
  'Predictive Analytics',
  'Time Series Analysis',
  'Recommendation Systems'
];

const ManageSubjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [newSubject, setNewSubject] = useState('');
  const [loading, setLoading] = useState(true);
  const [addingSubject, setAddingSubject] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [theme, setTheme] = useState('light');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (newSubject.trim().length > 0) {
      const filtered = SUGGESTED_SUBJECTS.filter(s => 
        s.toLowerCase().includes(newSubject.toLowerCase()) &&
        !subjects.some(existing => existing.toLowerCase() === s.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
      setFilteredSuggestions([]);
    }
  }, [newSubject, subjects]);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:3000/api/teacher/get-subjects', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage({ type: 'error', text: data.message || '❌ Error fetching subjects' });
      } else {
        setSubjects(data.subjects || []);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: '❌ Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubject = async (subjectToAdd) => {
    const subjectName = subjectToAdd || newSubject.trim();

    if (!subjectName) {
      setMessage({ type: 'error', text: '❌ Subject name cannot be empty' });
      return;
    }

    // Check for duplicate
    if (subjects.some(s => s.toLowerCase() === subjectName.toLowerCase())) {
      setMessage({ type: 'error', text: '❌ Subject already exists' });
      return;
    }

    try {
      setAddingSubject(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:3000/api/teacher/add-subject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newSubject: subjectName })
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage({ type: 'error', text: data.message || '❌ Failed to add subject' });
      } else {
        setMessage({ type: 'success', text: '✅ Subject added successfully!' });
        setNewSubject('');
        setShowSuggestions(false);
        fetchSubjects();
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: '❌ Network error. Please try again.' });
    } finally {
      setAddingSubject(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setNewSubject(suggestion);
    setShowSuggestions(false);
    handleAddSubject(suggestion);
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

        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className={`text-4xl md:text-5xl font-bold mb-2 ${
                isDark 
                  ? 'text-white' 
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent'
              }`}>
                📚 Manage Subjects
              </h1>
              <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                Add and organize course subjects
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
            <div className={`mb-6 p-4 rounded-xl ${
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

          {/* Add Subject Form */}
          <div className={`mb-8 rounded-2xl p-6 border ${
            isDark
              ? 'bg-gray-800/50 border-gray-700'
              : 'bg-white border-gray-200'
          }`}>
            <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Add New Subject
            </h2>

            <div className="relative">
              <form onSubmit={(e) => { e.preventDefault(); handleAddSubject(); }} className="flex gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    placeholder="Type to search or enter custom subject name..."
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-all ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                        : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                    } focus:outline-none`}
                    disabled={addingSubject}
                  />

                  {/* Suggestions Dropdown */}
                  {showSuggestions && (
                    <div className={`absolute top-full left-0 right-0 mt-2 max-h-60 overflow-y-auto rounded-lg border shadow-lg z-10 ${
                      isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}>
                      {filteredSuggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSuggestionClick(suggestion)}
                          className={`w-full text-left px-4 py-3 hover:bg-blue-500 hover:text-white transition-colors ${
                            isDark ? 'text-gray-200' : 'text-gray-700'
                          } ${idx !== filteredSuggestions.length - 1 ? 'border-b border-gray-200 dark:border-gray-700' : ''}`}
                        >
                          💡 {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={addingSubject}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                    addingSubject
                      ? 'bg-gray-400 cursor-not-allowed text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {addingSubject ? 'Adding...' : 'Add'}
                </button>
              </form>

              <p className={`text-sm mt-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                💡 Start typing to see suggestions from {SUGGESTED_SUBJECTS.length} pre-defined CS/AIML/AIDS subjects
              </p>
            </div>
          </div>

          {/* Subject Count */}
          {!loading && subjects.length > 0 && (
            <div className={`mb-6 p-4 rounded-xl text-center ${
              isDark ? 'bg-gray-800/50' : 'bg-blue-50'
            }`}>
              <p className={`font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                📊 Total Subjects: {subjects.length}
              </p>
            </div>
          )}

          {/* Subjects Grid */}
          <div>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
                <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>Loading subjects...</p>
              </div>
            ) : subjects.length === 0 ? (
              <div className={`text-center py-20 rounded-2xl border ${
                isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
              }`}>
                <p className="text-5xl mb-4">📚</p>
                <p className={`text-lg font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  No subjects added yet
                </p>
                <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Add your first subject using the form above
                </p>
              </div>
            ) : (
              <>
                <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  All Subjects ({subjects.length})
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {subjects.map((subject, index) => (
                    <div
                      key={index}
                      className={`p-5 rounded-xl border-2 transition-all hover:shadow-lg ${
                        isDark
                          ? 'bg-gray-800/50 border-gray-700 hover:border-blue-500'
                          : 'bg-white border-gray-200 hover:border-blue-500'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-3xl">📖</span>
                        <div className="flex-1 min-w-0">
                          <p className={`font-semibold text-sm leading-tight break-words ${
                            isDark ? 'text-white' : 'text-gray-900'
                          }`}>
                            {subject}
                          </p>
                          <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            Subject #{index + 1}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ManageSubjects;
