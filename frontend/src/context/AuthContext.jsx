import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => {
        setUser(res.data);
        setLoading(false);
      }).catch(() => {
        localStorage.removeItem('token');
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password, role) => {
    const res = await axios.post('/api/auth/login', { email, password, role });
    return res.data; // Returns message indicating OTP sent
  };

  const verifyLogin = async (email, otp) => {
    const res = await axios.post('/api/auth/verify-login', { email, otp });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
  };

  const signup = async (name, email, password, role) => {
    const res = await axios.post('/api/auth/signup', { name, email, password, role });
    return res.data; // Returns message indicating OTP sent
  };

  const verifySignup = async (email, otp) => {
    const res = await axios.post('/api/auth/verify-signup', { email, otp });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, verifyLogin, signup, verifySignup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
