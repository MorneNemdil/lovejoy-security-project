import React from 'react';
import { Navigate } from 'react-router-dom';

// checks if a user is logged in before rendering the page.
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const token = localStorage.getItem('access_token');

    if (!token) {
        // if no token, go to login page
        return <Navigate to="/login" replace />;
    }

    // if token exists, render the page/child component
    return <>{children}</>;
}