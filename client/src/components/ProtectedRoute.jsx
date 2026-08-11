import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Compass } from 'lucide-react';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100">
        <div className="relative">
          <Compass className="w-12 h-12 text-cyan-400 animate-spin" style={{ animationDuration: '3s' }} />
          <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 animate-ping" />
        </div>
        <p className="mt-4 text-slate-400 text-sm font-medium tracking-wide">
          Verifying WanderWave credentials...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};
