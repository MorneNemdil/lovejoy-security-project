import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

interface TokenPayload {
  is_admin: boolean;
  // iat: number;
  // exp: number;
  // jti: string;
}

export function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('access_token');

  if (!token) {
    // if not logged in at all
    return <Navigate to="/login" replace />;
  }

  try {
    const decodedToken = jwtDecode<TokenPayload>(token);
    
    // if logged in but not an admin
    if (!decodedToken.is_admin) {
      // go back to a non-admin page
      return <Navigate to="/request-evaluation" replace />;
    }

    // if logged in and is admin
    return <>{children}</>;

  } catch (error) {
    // if token is invalid or expired
    console.error("Invalid token:", error);
    localStorage.removeItem('access_token');
    return <Navigate to="/login" replace />;
  }
}