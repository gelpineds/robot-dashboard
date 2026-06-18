import { useState } from "react";

export interface UserData {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: string;
  floor?: string;
  room?: string;
}

export function useUser() {
  const [user, setUser] = useState<UserData | null>(() => {
    try {
      const storedUser = localStorage.getItem("user_data");
      if (storedUser) {
        return JSON.parse(storedUser);
      }
    } catch (e) {
      // Silently handle JSON parse error
    }
    return null;
  });
  const [loading, setLoading] = useState(false);

  const setUserData = (userData: UserData) => {
    setUser(userData);
    localStorage.setItem("user_data", JSON.stringify(userData));
  };

  const clearUserData = () => {
    setUser(null);
    localStorage.removeItem("user_data");
  };

  const getInitials = () => {
    if (!user) return "U";
    const parts = user.full_name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  return {
    user,
    loading,
    setUserData,
    clearUserData,
    getInitials,
  };
}
