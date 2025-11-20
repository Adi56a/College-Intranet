import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import AddTeacher from './pages/AddTeacher';
import Login from './pages/Login';
import Landing from './pages/Landing';
import AllTeacher from './pages/AllTeacher';
import CreateNotice from './pages/CreateNotice';
import AdminToTeacher from './pages/AdminToTeacher';
import StudentDashboard from './pages/StudentDashboard';
import StudentUpload from './pages/StudentUpload';
import AllStudents from './pages/AllStudents';
import MyUploads from './pages/MyUploads';
import TeacherDashboard from './pages/TeacherDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminToHodUpload from './pages/AdminToHod';
import NoticeToFaculty from './pages/NoticeToFaculty';
import ManageSubjects from './pages/ManageSubjects';
import Event from './pages/Event';
import Personal from './pages/Personal';
import UpdatePassword from './pages/UpdatePassword';

// Unauthorized Access Component with Role-Based Navigation
const UnauthorizedAccess = () => {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole');

  const getDashboardRoute = () => {
    switch(userRole) {
      case 'admin':
        return '/admin-dashboard';
      case 'teacher':
        return '/teacher-dashboard';
      case 'student':
        return '/student-dashboard';
      default:
        return '/login';
    }
  };

  const getDashboardName = () => {
    switch(userRole) {
      case 'admin':
        return 'Admin Dashboard';
      case 'teacher':
        return 'Teacher Dashboard';
      case 'student':
        return 'Student Dashboard';
      default:
        return 'Login';
    }
  };

  const getButtonColor = () => {
    switch(userRole) {
      case 'admin':
        return 'from-red-600 to-red-700';
      case 'teacher':
        return 'from-purple-600 to-purple-700';
      case 'student':
        return 'from-blue-600 to-blue-700';
      default:
        return 'from-gray-600 to-gray-700';
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 relative overflow-hidden">
      
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 bg-gray-800/50 backdrop-blur-xl rounded-3xl border border-gray-700/50 p-8 md:p-12 max-w-md w-full text-center shadow-2xl">
        <p className="text-7xl mb-6 animate-bounce">🔒</p>
        <h1 className="text-5xl font-bold text-white mb-4">Access Denied</h1>
        <p className="text-gray-300 text-lg mb-4">You don't have permission to access this page.</p>
        <p className="text-gray-400 text-sm mb-8">Your account role doesn't grant access to this resource.</p>
        
        {/* Role-Based Navigation Button */}
        <div className="space-y-3">
          <button
            onClick={() => navigate(getDashboardRoute())}
            className={`w-full bg-gradient-to-r ${getButtonColor()} hover:shadow-lg transition-all duration-300 transform hover:scale-105 text-white font-bold py-3 px-6 rounded-lg`}
          >
            ← Return to {getDashboardName()}
          </button>
        </div>

        {/* Additional Info */}
        <div className="mt-6 pt-6 border-t border-gray-700/50">
          <p className="text-gray-500 text-xs">
            Current Role: <span className="text-gray-300 font-semibold capitalize">{userRole || 'Unknown'}</span>
          </p>
          <p className="text-gray-500 text-xs mt-2">
            Contact your administrator if you believe this is an error.
          </p>
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
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce {
          animation: bounce 2s infinite;
        }
      `}</style>
    </div>
  );
};

// Protected Route Component - Stays on route if unauthorized
const ProtectedRoute = ({ element, requiredRoles }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    const authToken = localStorage.getItem('authToken');

    // Check if user has token and has required role
    if (authToken && requiredRoles.includes(userRole)) {
      setIsAuthorized(true);
    }
    setIsLoading(false);
  }, [requiredRoles]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // If not authorized, show unauthorized page with role-based navigation
  if (!isAuthorized) {
    return <UnauthorizedAccess />;
  }

  return element;
};

// Public Route Component (for routes accessible without login)
const PublicRoute = ({ element, isLoginPage = false }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [shouldShowPublic, setShouldShowPublic] = useState(true);

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    const userRole = localStorage.getItem('userRole');

    // If on login page and user is already logged in, redirect to dashboard based on role
    if (isLoginPage && authToken && userRole) {
      setShouldShowPublic(false);
    }
    setIsLoading(false);
  }, [isLoginPage]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // If already logged in and trying to access login page, redirect to appropriate dashboard
  if (!shouldShowPublic) {
    const userRole = localStorage.getItem('userRole');
    if (userRole === 'admin') return <Navigate to="/admin-dashboard" replace />;
    if (userRole === 'teacher') return <Navigate to="/teacher-dashboard" replace />;
    if (userRole === 'student') return <Navigate to="/student-dashboard" replace />;
  }

  return element;
};

// Root Redirect Component - Always redirects to login if no auth
const RootRedirect = () => {
  const authToken = localStorage.getItem('authToken');
  const userRole = localStorage.getItem('userRole');

  // If authenticated, redirect to appropriate dashboard
  if (authToken && userRole) {
    if (userRole === 'admin') return <Navigate to="/admin-dashboard" replace />;
    if (userRole === 'teacher') return <Navigate to="/teacher-dashboard" replace />;
    if (userRole === 'student') return <Navigate to="/student-dashboard" replace />;
  }

  // If not authenticated, redirect to login
  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <div>
        <Routes>
          
          {/* Root Route - Always redirects to login or dashboard */}
          <Route path="/" element={<RootRedirect />} />
          
          {/* Login Route */}
          <Route path="/login" element={<PublicRoute element={<Login />} isLoginPage={true} />} />

          {/* Landing Page - Not in use but kept for future */}
          <Route path="/landing" element={<PublicRoute element={<Landing />} />} />

          {/* Admin Routes - Only Admin can access */}
          <Route 
            path="/admin-dashboard" 
            element={<ProtectedRoute element={<AdminDashboard />} requiredRoles={['admin']} />} 
          />
          <Route 
            path="/admintohod" 
            element={<ProtectedRoute element={<AdminToHodUpload />} requiredRoles={['admin']} />} 
          />
          <Route 
            path="/add-teacher" 
            element={<ProtectedRoute element={<AddTeacher />} requiredRoles={['admin']} />} 
          />
          <Route 
            path="/all-teachers" 
            element={<ProtectedRoute element={<AllTeacher />} requiredRoles={['admin']} />} 
          />
          <Route 
            path="/create-notice" 
            element={<ProtectedRoute element={<CreateNotice />} requiredRoles={['admin']} />} 
          />

          {/* Admin & Teacher Routes - Shared access */}


          <Route 
            path="/personal" 
            element={<ProtectedRoute element={<Personal />} requiredRoles={['admin', 'teacher']} />} 
          />
          <Route 
            path="/events" 
            element={<ProtectedRoute element={<Event />} requiredRoles={['admin', 'teacher']} />} 
          />
          <Route 
            path="/all-students" 
            element={<ProtectedRoute element={<AllStudents />} requiredRoles={['admin', 'teacher']} />} 
          />
          <Route 
            path="/admin-to-faculty" 
            element={<ProtectedRoute element={<NoticeToFaculty />} requiredRoles={['admin', 'teacher']} />} 
          />
          <Route 
            path="/admintoall" 
            element={<ProtectedRoute element={<AdminToTeacher />} requiredRoles={['admin', 'teacher', 'student']} />} 
          />

          {/* Teacher Routes - Only Teacher can access */}
          <Route 
            path="/teacher-dashboard" 
            element={<ProtectedRoute element={<TeacherDashboard />} requiredRoles={['teacher']} />} 
          />
          <Route 
            path="/manage-subjects" 
            element={<ProtectedRoute element={<ManageSubjects/>} requiredRoles={['teacher']} />} 
          />

          {/* Student Routes - Only Student can access */}
          <Route 
            path="/update-password" 
            element={<ProtectedRoute element={<UpdatePassword />} requiredRoles={['student']} />} 
          />
          <Route 
            path="/student-dashboard" 
            element={<ProtectedRoute element={<StudentDashboard />} requiredRoles={['student']} />} 
          />
          <Route 
            path="/student-upload" 
            element={<ProtectedRoute element={<StudentUpload />} requiredRoles={['student']} />} 
          />
          <Route 
            path="/my-uploads" 
            element={<ProtectedRoute element={<MyUploads />} requiredRoles={['student']} />} 
          />
          <Route 
            path="/my-work" 
            element={<ProtectedRoute element={<MyUploads />} requiredRoles={['student']} />} 
          />

          {/* Catch-all - Redirect unknown routes to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;
