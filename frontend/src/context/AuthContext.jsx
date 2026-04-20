/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storedName = localStorage.getItem('userName');
    const storedEmail = localStorage.getItem('userEmail');
    if (storedName || storedEmail) {
      return { name: storedName, email: storedEmail };
    }
    return null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const loading = false;

  const login = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('userName', data.name);
    localStorage.setItem('userEmail', data.email);
    setToken(data.token);
    setUser({ name: data.name, email: data.email });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    setToken(null);
    setUser(null);
  };

  const isLoggedIn = !!token;

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoggedIn, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
