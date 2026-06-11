"use client";

import { useSession } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { LogIn, LogOut, Zap } from "lucide-react";

export default function Navbar() {
  const { data: session, signIn, signOut } = useSession();

  return (
    <nav className="sticky top-0 z-50 w-full glass border-b border-white/5 shadow-[0_0_20px_rgba(139,92,246,0.1)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0 flex items-center space-x-2">
            <Zap className="h-6 w-6 text-purple-400" />
            <span className="font-bold text-xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 neon-text">
              ChromaCrystal UHD
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            {session ? (
              <div className="flex items-center space-x-4">
                <div className="hidden sm:flex items-center space-x-2">
                  {session.user?.image && (
                    <img
                      className="h-8 w-8 rounded-full border border-purple-500/50"
                      src={session.user.image}
                      alt="User Avatar"
                    />
                  )}
                  <span className="text-sm font-medium text-gray-200">
                    {session.user?.name}
                  </span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => signOut()}
                  className="flex items-center space-x-2 bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg border border-white/10 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </motion.button>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => signIn()}
                className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-5 py-2 rounded-lg neon-border transition-all"
              >
                <LogIn className="h-4 w-4" />
                <span className="font-medium">Sign In</span>
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
