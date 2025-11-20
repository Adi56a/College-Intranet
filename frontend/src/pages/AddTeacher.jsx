import React, { useState } from 'react';
import { 
  FiUser,
  FiMail,
  FiLock,
  FiAward,
  FiBookOpen,
  FiCalendar,
  FiCheckCircle,
  FiAlertCircle,
  FiArrowRight,
  FiArrowLeft
} from 'react-icons/fi';
import { MdSchool } from 'react-icons/md';
import Header from '../components/Header';

// Professional Loading Spinner
const LoadingSpinner = () => {
  return (
    <div className="inline-flex items-center gap-2">
      <div className="relative w-5 h-5">
        <div className="absolute inset-0 rounded-full border-2 border-white/30"></div>
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-white border-r-white animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
        </div>
      </div>
      <span>Creating...</span>
    </div>
  );
};

const AddTeacher = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    post: '',
    qualification: '',
    specialization: ''
  });

  const [joiningDate, setJoiningDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [step, setStep] = useState(1);

  const teacherPosts = ['Lecturer', 'Assistant Professor', 'Associate Professor', 'Professor', 'Head of Department'];
  const qualifications = ['B.Tech', 'M.Tech', 'B.Sc', 'M.Sc', 'PhD', 'B.A', 'M.A', 'B.Com', 'M.Com'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    if (!formData.name.trim()) {
      setMessage({ type: 'error', text: 'Teacher name is required' });
      setLoading(false);
      return;
    }

    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setMessage({ type: 'error', text: 'Valid email is required' });
      setLoading(false);
      return;
    }

    if (!formData.password || formData.password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      setLoading(false);
      return;
    }

    if (!formData.post) {
      setMessage({ type: 'error', text: 'Please select a post' });
      setLoading(false);
      return;
    }

    if (!formData.qualification) {
      setMessage({ type: 'error', text: 'Please select qualification' });
      setLoading(false);
      return;
    }

    if (!formData.specialization.trim()) {
      setMessage({ type: 'error', text: 'Specialization is required' });
      setLoading(false);
      return;
    }

    if (!joiningDate) {
      setMessage({ type: 'error', text: 'Joining date is required' });
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch('http://localhost:3000/api/teacher/create-teacher', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          post: formData.post,
          qualification: formData.qualification,
          specialization: formData.specialization,
          joiningDate: joiningDate
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage({ type: 'error', text: data.message || 'Error adding teacher' });
      } else {
        setMessage({ type: 'success', text: 'Teacher added successfully!' });
        setFormData({
          name: '',
          email: '',
          password: '',
          post: '',
          qualification: '',
          specialization: ''
        });
        setJoiningDate('');
        setStep(1);
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1) {
      if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
        setMessage({ type: 'error', text: 'Please fill all fields in step 1' });
        return;
      }
    }
    setStep(2);
    setMessage({ type: '', text: '' });
  };

  const prevStep = () => {
    setStep(1);
    setMessage({ type: '', text: '' });
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

        <div className="relative z-10 max-w-2xl mx-auto">
          
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <FiUser size={32} className="text-blue-600" />
              <h1 className="text-3xl lg:text-4xl font-bold text-slate-900">
                Add Teacher
              </h1>
            </div>
            <p className="text-slate-600">Complete the form to register a new faculty member</p>
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

          {/* Form Container */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 lg:p-8">
            
            {/* Step Indicator */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className={`flex-1 h-2 rounded-full mr-3 transition-all duration-500 ${
                  step >= 1 ? 'bg-blue-600' : 'bg-slate-200'
                }`}></div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-100 text-blue-700">
                  Step {step} of 2
                </span>
                <div className={`flex-1 h-2 rounded-full ml-3 transition-all duration-500 ${
                  step >= 2 ? 'bg-blue-600' : 'bg-slate-200'
                }`}></div>
              </div>
              <p className="text-sm font-semibold text-slate-600 text-center">
                {step === 1 ? 'Personal Information' : 'Professional Details'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* STEP 1 */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-6">
                      <FiUser size={20} className="text-blue-600" />
                      <h2 className="text-xl font-bold text-slate-900">Personal Information</h2>
                    </div>
                  </div>

                  {/* Name */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                      <FiUser size={14} />
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                      <FiMail size={14} />
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@institution.com"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                      <FiLock size={14} />
                      Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                    />
                    <p className="text-xs text-slate-500 mt-1">Minimum 6 characters</p>
                  </div>

                  {/* Next Button */}
                  <button
                    type="button"
                    onClick={nextStep}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] mt-8"
                  >
                    <span>Next Step</span>
                    <FiArrowRight size={20} />
                  </button>
                </div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-6">
                      <MdSchool size={20} className="text-blue-600" />
                      <h2 className="text-xl font-bold text-slate-900">Professional Details</h2>
                    </div>
                  </div>

                  {/* Post */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                      <MdSchool size={14} />
                      Post/Designation <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="post"
                      value={formData.post}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-200 text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                    >
                      <option value="">Select a post</option>
                      {teacherPosts.map(post => (
                        <option key={post} value={post}>{post}</option>
                      ))}
                    </select>
                  </div>

                  {/* Qualification */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                      <FiAward size={14} />
                      Qualification <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="qualification"
                      value={formData.qualification}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-200 text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                    >
                      <option value="">Select qualification</option>
                      {qualifications.map(qual => (
                        <option key={qual} value={qual}>{qual}</option>
                      ))}
                    </select>
                  </div>

                  {/* Specialization */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                      <FiBookOpen size={14} />
                      Specialization <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleChange}
                      placeholder="e.g., Quantum Physics, Data Science"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                    />
                  </div>

                  {/* Joining Date */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                      <FiCalendar size={14} />
                      Joining Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={joiningDate}
                      onChange={(e) => setJoiningDate(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-200 text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 mt-8">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-bold bg-slate-200 hover:bg-slate-300 text-slate-900 transition-all"
                    >
                      <FiArrowLeft size={20} />
                      <span>Back</span>
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] text-white ${
                        loading
                          ? 'bg-slate-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                      }`}
                    >
                      {loading ? (
                        <LoadingSpinner />
                      ) : (
                        <>
                          <FiCheckCircle size={20} />
                          <span>Create Teacher</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddTeacher;
