import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

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

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(getStoredAuth);

  useEffect(() => {
    const syncAuthState = () => {
      setAuthState(getStoredAuth());
    };

    window.addEventListener('storage', syncAuthState);
    return () => window.removeEventListener('storage', syncAuthState);
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
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');

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
