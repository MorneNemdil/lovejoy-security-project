import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { RegisterPage } from '@/pages/RegisterPage';
import { LoginPage } from '@/pages/LoginPage';
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/ResetPasswordPage';
import { ProtectedRoute } from '@/lib/ProtectedRoute';
import { RequestEvaluationPage } from '@/pages/RequestEvaluationPage';
import { jwtDecode } from 'jwt-decode';
import { AdminDashboardPage } from '@/pages/AdminDashboardPage';
import { AdminProtectedRoute } from '@/lib/AdminProtectedRoute'

interface TokenPayload {
  is_admin: boolean;
}

function App() {
  const navigate = useNavigate();
  const token = localStorage.getItem('access_token');

  let isLoggedIn = false;
  let isAdmin = false;

  if (token) {
    try {
      const decodedToken = jwtDecode<TokenPayload>(token);
      isLoggedIn = true;
      isAdmin = decodedToken.is_admin;
    } catch (error) {
      console.error("Invalid token found:", error);
      localStorage.removeItem('access_token');
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/login');
  };

  return (
    <div className="flex flex-col h-screen">
      <nav className="p-4 bg-white shadow-md">
        <div className="container flex items-center justify-between mx-auto">
          <Link to="/" className="text-xl font-bold text-gray-800">Lovejoy's Antiques</Link>
          <div className="space-x-4">

            {/* Show links based on login state */}
            {!isLoggedIn && (
              <>
                <Link to="/register" className="text-gray-600 hover:text-blue-600">Register</Link>
                <Link to="/login" className="text-gray-600 hover:text-blue-600">Login</Link>
              </>
            )}

            {isLoggedIn && (
              <>
                {/* 4. Add "Request" link */}
                <Link to="/request-evaluation" className="text-gray-600 hover:text-blue-600">
                  New Request
                </Link>
                {isAdmin && (
                  <Link to="/admin" className="font-bold text-blue-700 hover:text-blue-900">
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-blue-600"
                >
                  Logout
                </button>
              </>
            )}

          </div>
        </div>
      </nav>
      <div className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<RegisterPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route
            path="/request-evaluation"
            element={
              <ProtectedRoute>
                <RequestEvaluationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminProtectedRoute>
                <AdminDashboardPage />
              </AdminProtectedRoute>
            }
          />
        </Routes>
      </div>
    </div>
  );
}

export default App;