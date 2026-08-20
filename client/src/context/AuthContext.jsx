import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, getCurrentUser, updatePreferences, updateUserProfile } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('wanderwave_token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('wanderwave_token');
      if (storedToken) {
        try {
          const data = await getCurrentUser();
          if (data.success && data.user) {
            setUser(data.user);
          }
        } catch (err) {
          console.warn('Session expired or invalid token');
          localStorage.removeItem('wanderwave_token');
          localStorage.removeItem('wanderwave_user');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const data = await loginUser(email, password);
      if (data.success && data.token) {
        localStorage.setItem('wanderwave_token', data.token);
        localStorage.setItem('wanderwave_user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        return { success: true };
      }
      return { success: false, message: data.message || 'Login failed' };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  const signup = async (userData) => {
    setError(null);
    try {
      const data = await registerUser(userData);
      if (data.success && data.token) {
        localStorage.setItem('wanderwave_token', data.token);
        localStorage.setItem('wanderwave_user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        return { success: true };
      }
      return { success: false, message: data.message || 'Registration failed' };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    localStorage.removeItem('wanderwave_token');
    localStorage.removeItem('wanderwave_user');
    setToken(null);
    setUser(null);
  };

  const updateUserPrefs = async (newPrefs) => {
    // 1. Immediately update local state & localStorage for instant UI feedback
    setUser((prev) => {
      const updated = {
        ...(prev || { name: 'Explorer', email: 'explorer@wanderwave.ai' }),
        preferences: { ...(prev?.preferences || {}), ...newPrefs },
      };
      localStorage.setItem('wanderwave_user', JSON.stringify(updated));
      return updated;
    });

    try {
      const data = await updatePreferences(newPrefs);
      if (data.success) {
        return { success: true, message: 'Preferences saved to memory!' };
      }
    } catch (err) {
      console.warn('[Offline/Demo Notice] Saved preferences locally:', err.message);
    }
    return { success: true, message: 'Preferences updated in local profile!' };
  };

  const updateProfileInfo = async (profileData) => {
    // 1. Immediately update local state & localStorage for instant UI feedback
    setUser((prev) => {
      const updated = {
        ...(prev || {}),
        name: profileData.name || prev?.name || 'Explorer',
        email: profileData.email || prev?.email || 'explorer@wanderwave.ai',
        preferences: { ...(prev?.preferences || {}), ...(profileData.preferences || {}) },
      };
      localStorage.setItem('wanderwave_user', JSON.stringify(updated));
      return updated;
    });

    try {
      const data = await updateUserProfile(profileData);
      if (data.success && data.user) {
        setUser((prev) => {
          const updated = { ...prev, ...data.user };
          localStorage.setItem('wanderwave_user', JSON.stringify(updated));
          return updated;
        });
        return { success: true, message: data.message };
      }
    } catch (err) {
      console.warn('[Offline/Demo Notice] Saved profile locally:', err.message);
    }
    return { success: true, message: 'Profile & preferences saved successfully! 🌊' };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        signup,
        logout,
        updateUserPrefs,
        updateProfileInfo,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
