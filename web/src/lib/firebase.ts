import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  GithubAuthProvider,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAQYq4NpKlpaGvL6XTYyEGj6SQ5U3hPKcE",
  authDomain: "chromacrystal-uhd.firebaseapp.com",
  projectId: "chromacrystal-uhd",
  storageBucket: "chromacrystal-uhd.firebasestorage.app",
  messagingSenderId: "57646159998",
  appId: "1:57646159998:web:9e4bf25a3735a13653a02f",
  measurementId: "G-LNV2TPX65L",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();
