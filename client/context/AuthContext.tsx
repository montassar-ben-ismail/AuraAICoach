import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { navigate } from '../utils/navigation';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user?: User) => void;
  updateUser: (data: Partial<User>) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children?: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check local storage on mount
    const storedToken = localStorage.getItem('aura_token');
    const storedUser = localStorage.getItem('aura_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = (newToken: string, newUser?: User) => {
    setToken(newToken);
    const userToStore = newUser || { id: 'user', name: 'User', email: '', isPro: false, role: 'user', isApproved: true };
    setUser(userToStore);
    localStorage.setItem('aura_token', newToken);
    localStorage.setItem('aura_user', JSON.stringify(userToStore));
  };

  const updateUser = (data: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...data };
    setUser(updatedUser);
    localStorage.setItem('aura_user', JSON.stringify(updatedUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('aura_token');
    localStorage.removeItem('aura_user');
    navigate('/');
  };

  return (
    <div className="contents">
      <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, login, updateUser, logout, isLoading }}>
        {children}
      </AuthContext.Provider>
    </div>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
