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
    // TODO: Replace with Firebase onAuthStateChanged when credentials are provided
    const stored = localStorage.getItem("chromacrystal_auth");
    if (stored) {
      try {
        setSession(JSON.parse(stored));
        setStatus("authenticated");
      } catch {
        localStorage.removeItem("chromacrystal_auth");
        setStatus("unauthenticated");
      }
    } else {
      setStatus("unauthenticated");
    }
  }, []);

  const signIn = (provider?: string) => {
    setStatus("loading");
    // TODO: Replace with Firebase signInWithPopup(auth, provider) when credentials are provided
    setTimeout(() => {
      const mockUser = {
        user: {
          name: "Premium User",
          email: "user@chromacrystal.ai",
          image: "https://api.dicebear.com/7.x/avataaars/svg?seed=ChromaCrystal",
        },
      };
      localStorage.setItem("chromacrystal_auth", JSON.stringify(mockUser));
      setSession(mockUser);
      setStatus("authenticated");
    }, 1200);
  };

  const signOut = () => {
    // TODO: Replace with Firebase signOut(auth) when credentials are provided
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
