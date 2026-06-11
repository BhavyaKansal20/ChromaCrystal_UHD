"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type User = {
  name: string;
  email: string;
  image?: string;
};

type Session = {
  user: User;
} | null;

type AuthContextType = {
  data: Session;
  status: "loading" | "authenticated" | "unauthenticated";
  signIn: (provider?: string) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextType>({
  data: null,
  status: "loading",
  signIn: () => {},
  signOut: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session>(null);
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");

  useEffect(() => {
    const stored = localStorage.getItem("chromacrystal_auth");
    if (stored) {
      setSession(JSON.parse(stored));
      setStatus("authenticated");
    } else {
      setStatus("unauthenticated");
    }
  }, []);

  const signIn = (provider?: string) => {
    setStatus("loading");
    // Simulate OAuth delay
    setTimeout(() => {
      const mockUser = {
        user: {
          name: "Premium User",
          email: "user@example.com",
          image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
        },
      };
      localStorage.setItem("chromacrystal_auth", JSON.stringify(mockUser));
      setSession(mockUser);
      setStatus("authenticated");
    }, 1500);
  };

  const signOut = () => {
    localStorage.removeItem("chromacrystal_auth");
    setSession(null);
    setStatus("unauthenticated");
  };

  return (
    <AuthContext.Provider value={{ data: session, status, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useSession = () => useContext(AuthContext);
