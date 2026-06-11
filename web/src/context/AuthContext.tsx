"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  User as FirebaseUser,
} from "firebase/auth";
import { auth, googleProvider, githubProvider } from "@/lib/firebase";

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

const mapFirebaseUser = (user: FirebaseUser): Session => ({
  user: {
    name: user.displayName || "User",
    email: user.email || "",
    image: user.photoURL || undefined,
  },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session>(null);
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setSession(mapFirebaseUser(user));
        setStatus("authenticated");
      } else {
        setSession(null);
        setStatus("unauthenticated");
      }
    });
    return () => unsubscribe();
  }, []);

  const signIn = async (provider?: string) => {
    setStatus("loading");
    try {
      const authProvider = provider === "github" ? githubProvider : googleProvider;
      await signInWithPopup(auth, authProvider);
      // onAuthStateChanged will handle the rest
    } catch (error: any) {
      console.error("Auth error:", error);
      setStatus("unauthenticated");
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      // onAuthStateChanged will handle the rest
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ data: session, status, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useSession = () => useContext(AuthContext);
