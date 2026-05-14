import React, { createContext, useContext, useEffect, useState } from "react";
import { useGetMe, setAuthTokenGetter } from "@workspace/api-client-react";
import type { User } from "@workspace/api-client-react";

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    const t = localStorage.getItem("sg_token");
    setAuthTokenGetter(() => t);
    return t;
  });
  const [user, setUser] = useState<User | null>(null);

  // Use the API client to fetch the current user if we have a token
  const { data: meData, isLoading, error } = useGetMe({
    query: {
      queryKey: ["me"],
      enabled: !!token,
      retry: false,
    } as any,
  });

  useEffect(() => {
    if (meData) {
      setUser(meData);
    }
  }, [meData]);

  useEffect(() => {
    if (error) {
      // If unauthorized or error, clear token
      setToken(null);
      setUser(null);
      localStorage.removeItem("sg_token");
    }
  }, [error]);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("sg_token", newToken);
    setAuthTokenGetter(() => newToken);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("sg_token");
    setAuthTokenGetter(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
