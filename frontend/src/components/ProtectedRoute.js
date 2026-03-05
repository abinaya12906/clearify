import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  const gstin = localStorage.getItem('gstin');

  // If not logged in, redirect to login page
  if (!token || !gstin) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;