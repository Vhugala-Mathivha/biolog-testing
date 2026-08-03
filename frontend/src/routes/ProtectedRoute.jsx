import React from 'react';
import { Navigate } from 'react-router-dom';

// Simple route guard: renders its children when isAllowed is true,
// otherwise redirects to redirectTo (defaults to the login page).
function ProtectedRoute({ isAllowed, redirectTo = '/login', children }) {
  if (!isAllowed) {
    return <Navigate to={redirectTo} replace />;
  }
  return children;
}

export default ProtectedRoute;
