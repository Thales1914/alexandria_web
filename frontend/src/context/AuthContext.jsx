import { createContext, useContext, useEffect, useState } from 'react';
import { AUTH_CHANGED_EVENT } from '../services/api';

const AuthContext = createContext();
const AUTH_STORAGE_KEYS = ['token', 'userName', 'userEmail', 'userId'];

function getStoredAuth() {
  const token = localStorage.getItem('token');
  const name = localStorage.getItem('userName');
  const email = localStorage.getItem('userEmail');
  const userId = localStorage.getItem('userId');

  return {
    token,
    user: token
      ? {
          id: userId ? Number(userId) : null,
          name: name || '',
          email: email || '',
        }
      : null,
  };
}

function clearStoredAuth() {
  AUTH_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
}

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(getStoredAuth);

  useEffect(() => {
    const syncAuthState = () => {
      setAuthState(getStoredAuth());
    };

    window.addEventListener('storage', syncAuthState);
    window.addEventListener(AUTH_CHANGED_EVENT, syncAuthState);

    return () => {
      window.removeEventListener('storage', syncAuthState);
      window.removeEventListener(AUTH_CHANGED_EVENT, syncAuthState);
    };
  }, []);

  const login = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('userName', data.name);
    localStorage.setItem('userEmail', data.email);
    localStorage.setItem('userId', String(data.userId || data.id || ''));

    setAuthState({
      token: data.token,
      user: {
        id: data.userId || data.id || null,
        name: data.name,
        email: data.email,
      },
    });
  };

  const logout = () => {
    clearStoredAuth();

    setAuthState({
      token: null,
      user: null,
    });
  };

  const isLoggedIn = !!authState.token;

  return (
    <AuthContext.Provider
      value={{
        user: authState.user,
        token: authState.token,
        login,
        logout,
        isLoggedIn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
