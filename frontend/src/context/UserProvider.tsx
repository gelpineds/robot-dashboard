import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useUser } from '@/hooks/useUser';
import { authAPI } from '@/lib/api';

interface UserProviderContextType {
  isInitialized: boolean;
}

const UserProviderContext = createContext<UserProviderContextType>({
  isInitialized: false,
});

export function UserProvider({ children }: { children: ReactNode }) {
  const { user, setUserData } = useUser();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeUser = async () => {
      const token = localStorage.getItem('token');
      
      // If there's a token but no user data, fetch it
      if (token && !user) {
        try {
          const userData = await authAPI.getCurrentUser();
          setUserData(userData);
        } catch (err) {
          console.error('Failed to fetch user data:', err);
          // If we can't fetch user data, clear the token
          localStorage.removeItem('token');
        }
      }
      
      setIsInitialized(true);
    };

    initializeUser();
  }, [user, setUserData]);

  return (
    <UserProviderContext.Provider value={{ isInitialized }}>
      {children}
    </UserProviderContext.Provider>
  );
}

export function useUserProvider() {
  return useContext(UserProviderContext);
}
