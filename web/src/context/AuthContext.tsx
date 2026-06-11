"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
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
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  signIn: (provider?: string) => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (name: string, email: string, pass: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  data: null,
  status: "loading",
  showAuthModal: false,
  setShowAuthModal: () => {},
  signIn: async () => {},
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  signOut: async () => {},
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
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setSession(mapFirebaseUser(user));
        setStatus("authenticated");
        setShowAuthModal(false); // Close modal on successful auth
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
    } catch (error: any) {
      console.error("Auth error:", error);
      setStatus("unauthenticated");
      throw error;
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    setStatus("loading");
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error: any) {
      console.error("Email sign-in error:", error);
      setStatus("unauthenticated");
      throw error;
    }
  };

  const signUpWithEmail = async (name: string, email: string, pass: string) => {
    setStatus("loading");
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(userCredential.user, {
        displayName: name,
      });
      // Force update session with name
      setSession({
        user: {
          name,
          email,
        },
      });
      setStatus("authenticated");
      setShowAuthModal(false);
    } catch (error: any) {
      console.error("Email sign-up error:", error);
      setStatus("unauthenticated");
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        data: session,
        status,
        showAuthModal,
        setShowAuthModal,
        signIn,
        signInWithEmail,
        signUpWithEmail,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useSession = () => useContext(AuthContext);
