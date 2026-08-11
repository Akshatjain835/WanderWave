import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navbar } from './components/Navbar';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Dashboard } from './pages/Dashboard';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Protected Dashboard Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/plan"
                element={
                  <ProtectedRoute>
                    <div className="max-w-7xl mx-auto px-4 py-12 text-center">
                      <h1 className="text-2xl font-bold text-white mb-2">Trip Planner Component</h1>
                      <p className="text-sm text-slate-400">Scheduled for Days 4–7 Agent Integration</p>
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/trips"
                element={
                  <ProtectedRoute>
                    <div className="max-w-7xl mx-auto px-4 py-12 text-center">
                      <h1 className="text-2xl font-bold text-white mb-2">Saved Trips Gallery</h1>
                      <p className="text-sm text-slate-400">Scheduled for Day 13 UI Integration</p>
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <div className="max-w-7xl mx-auto px-4 py-12 text-center">
                      <h1 className="text-2xl font-bold text-white mb-2">User Memory & Preferences</h1>
                      <p className="text-sm text-slate-400">Long-Term Memory Storage Active</p>
                    </div>
                  </ProtectedRoute>
                }
              />

              {/* Default Redirect */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}
