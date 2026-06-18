'use client';

import { User } from '@/lib/auth';
import React from 'react';

const AuthContext = React.createContext<{
  user: User | undefined;
  updateUser: (user: User | undefined) => void;
}>({
  user: undefined,
  updateUser: () => {},
});

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

function AuthProvider({ children, user }: { children: React.ReactNode; user?: User }) {
  const [currentUser, setCurrentUser] = React.useState<User | undefined>(user);

  const updateUser = React.useCallback((newUser: User | undefined) => {
    setCurrentUser(newUser);
  }, []);

  return (
    <AuthContext.Provider value={{ user: currentUser, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
