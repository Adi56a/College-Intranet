import React, { useState, useEffect } from 'react';
import { 
  FiBook,
  FiPlus,
  FiCheckCircle,
  FiAlertCircle,
  FiSearch,
  FiBookOpen
} from 'react-icons/fi';
import { MdSchool } from 'react-icons/md';
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

// Professional Loading Component
const LoadingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-16 h-16">
        {/* Outer rotating ring */}
        <div className="absolute inset-0 rounded-full border-4 border-slate-200"></div>
        
        {/* Animated gradient ring */}
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 border-r-blue-500 animate-spin"></div>
        
        {/* Inner pulsing dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 bg-blue-600 rounded-full animate-pulse"></div>
        </div>
      </div>
      
      <p className="mt-4 text-slate-600 font-medium animate-pulse">Loading subjects...</p>
    </div>
  );
};

const ManageSubjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [newSubject, setNewSubject] = useState('');
  const [loading, setLoading] = useState(true);
  const [addingSubject, setAddingSubject] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
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
        setMessage({ type: 'error', text: data.message || 'Error fetching subjects' });
      } else {
        setSubjects(data.subjects || []);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubject = async (subjectToAdd) => {
    const subjectName = subjectToAdd || newSubject.trim();

    if (!subjectName) {
      setMessage({ type: 'error', text: 'Subject name cannot be empty' });
      return;
    }

    // Check for duplicate
    if (subjects.some(s => s.toLowerCase() === subjectName.toLowerCase())) {
      setMessage({ type: 'error', text: 'Subject already exists' });
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
        setMessage({ type: 'error', text: data.message || 'Failed to add subject' });
      } else {
        setMessage({ type: 'success', text: 'Subject added successfully!' });
        setNewSubject('');
        setShowSuggestions(false);
        fetchSubjects();
        
        // Clear success message after 3 seconds
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setAddingSubject(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setNewSubject(suggestion);
    setShowSuggestions(false);
    handleAddSubject(suggestion);
  };

  return (
    <>
      <Header />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4">
        
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgb(51, 65, 85) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <FiBook size={32} className="text-blue-600" />
              <h1 className="text-3xl lg:text-4xl font-bold text-slate-900">
                Manage Subjects
              </h1>
            </div>
            <p className="text-slate-600">Add and organize course subjects</p>
          </div>

          {/* Alert Messages */}
          {message.text && (
            <div className={`mb-6 p-4 rounded-xl border-2 flex items-center gap-3 ${
              message.type === 'success'
                ? 'bg-green-50 border-green-500 text-green-800'
                : 'bg-red-50 border-red-500 text-red-800'
            }`}>
              {message.type === 'success' ? (
                <FiCheckCircle size={20} className="flex-shrink-0" />
              ) : (
                <FiAlertCircle size={20} className="flex-shrink-0" />
              )}
              <p className="font-semibold">{message.text}</p>
            </div>
          )}

          {/* Add Subject Form */}
          <div className="mb-8 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <FiPlus size={20} className="text-blue-600" />
              <h2 className="text-xl font-bold text-slate-900">Add New Subject</h2>
            </div>

            <div className="relative">
              <form onSubmit={(e) => { e.preventDefault(); handleAddSubject(); }} className="flex gap-3">
                <div className="flex-1 relative">
                  <div className="relative">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                      type="text"
                      value={newSubject}
                      onChange={(e) => setNewSubject(e.target.value)}
                      placeholder="Type to search or enter custom subject name..."
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                      disabled={addingSubject}
                    />
                  </div>

                  {/* Suggestions Dropdown */}
                  {showSuggestions && (
                    <div className="absolute top-full left-0 right-0 mt-2 max-h-60 overflow-y-auto rounded-xl border-2 border-slate-200 shadow-lg z-10 bg-white">
                      {filteredSuggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSuggestionClick(suggestion)}
                          className={`w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors text-slate-700 flex items-center gap-2 ${
                            idx !== filteredSuggestions.length - 1 ? 'border-b border-slate-100' : ''
                          }`}
                        >
                          <FiBookOpen size={16} className="text-blue-600 flex-shrink-0" />
                          <span>{suggestion}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={addingSubject || !newSubject.trim()}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                    addingSubject || !newSubject.trim()
                      ? 'bg-slate-400 cursor-not-allowed text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {addingSubject ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>Adding...</span>
                    </>
                  ) : (
                    <>
                      <FiPlus size={18} />
                      <span>Add</span>
                    </>
                  )}
                </button>
              </form>

              <div className="flex items-center gap-2 text-sm mt-3 text-slate-600">
                <FiBookOpen size={14} className="text-blue-600" />
                <p>Start typing to see suggestions from {SUGGESTED_SUBJECTS.length} pre-defined CS/AIML/AIDS subjects</p>
              </div>
            </div>
          </div>

          {/* Subject Count */}
          {!loading && subjects.length > 0 && (
            <div className="mb-6 p-4 rounded-xl bg-white border border-slate-200 text-center">
              <p className="font-bold text-slate-900">
                Total Subjects: {subjects.length}
              </p>
            </div>
          )}

          {/* Subjects Grid */}
          <div>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32">
                <LoadingSpinner />
              </div>
            ) : subjects.length === 0 ? (
              <div className="text-center py-32 bg-white rounded-2xl border-2 border-slate-200">
                <FiBook size={64} className="mx-auto mb-4 text-slate-300" />
                <p className="text-lg font-semibold text-slate-600 mb-2">
                  No subjects added yet
                </p>
                <p className="text-sm text-slate-500">
                  Add your first subject using the form above
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-6">
                  <MdSchool size={24} className="text-blue-600" />
                  <h2 className="text-2xl font-bold text-slate-900">
                    All Subjects ({subjects.length})
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {subjects.map((subject, index) => (
                    <div
                      key={index}
                      className="bg-white p-5 rounded-xl border-2 border-slate-200 hover:border-blue-400 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FiBook size={20} className="text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm leading-tight break-words text-slate-900">
                            {subject}
                          </p>
                          <p className="text-xs mt-1 text-slate-500">
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
