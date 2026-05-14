import React, { useEffect, useState, createContext, ReactNode } from 'react';
import { User } from '../types';
import { verifyToken } from '../services/api/auth';
interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}
export const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const AuthProvider = ({ children }: {children: ReactNode;}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('anublood_token');
      if (storedToken) {
        try {
          const verifiedUser = await verifyToken();
          setUser(verifiedUser);
          setToken(storedToken);
        } catch (error) {
          localStorage.removeItem('anublood_token');
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);
  const login = (newUser: User, newToken: string) => {
    setUser(newUser);
    setToken(newToken);
    localStorage.setItem('anublood_token', newToken);
  };
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('anublood_token');
  };
  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout
      }}>
      
      {children}
    </AuthContext.Provider>);

};