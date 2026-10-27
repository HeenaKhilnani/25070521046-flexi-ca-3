import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check authenticated session on initial mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await api.auth.me();
        if (res?.student) {
          setStudent(res.student);
        }
      } catch {
        setStudent(null);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const res = await api.auth.login({ email, password });
      setStudent(res.student);
      return res.student;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const register = async (formData) => {
    setError(null);
    try {
      const res = await api.auth.register(formData);
      setStudent(res.student);
      return res.student;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch (err) {
      console.warn('Logout notice:', err.message);
    } finally {
      setStudent(null);
    }
  };

  const updateProfile = async (name) => {
    const res = await api.students.updateProfile({ name });
    if (res?.student) {
      setStudent((prev) => ({ ...prev, name: res.student.name }));
    }
    return res.student;
  };

  return (
    <AuthContext.Provider
      value={{
        student,
        loading,
        error,
        login,
        register,
        logout,
        updateProfile,
        isAuthenticated: Boolean(student)
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
