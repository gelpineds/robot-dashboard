import { useState } from "react";

export interface UserData {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: string;
  room?: string;
}

export function useUser() {
  const [user, setUser] = useState<UserData | null>(() => {
    try {
      const storedUser = localStorage.getItem("user_data");
      console.log("🔍 Loading user from localStorage:", { storedUser, parsed: storedUser ? JSON.parse(storedUser) : null });
      if (storedUser) {
        return JSON.parse(storedUser);
      }
    } catch (e) {
      console.error("❌ Failed to parse stored user data:", e);
    }
    return null;
  });
  const [loading, setLoading] = useState(false);

  const setUserData = (userData: UserData) => {
    console.log("✅ Saving user data to localStorage:", userData);
    setUser(userData);
    localStorage.setItem("user_data", JSON.stringify(userData));
  };

  const clearUserData = () => {
    console.log("🗑️ Clearing user data from localStorage");
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
