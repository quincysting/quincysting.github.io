import React, { createContext, useContext, useState, useEffect } from 'react';
import { checkAuth, login as authLogin, logout as authLogout } from '../lib/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(checkAuth());
  }, []);

  const login = async (username: string) => {
    const success = await authLogin(username);
    setIsAuthenticated(success);
    return success;
  };

  const logout = () => {
    authLogout();
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};