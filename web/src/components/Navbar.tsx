"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "@/context/AuthContext";
import { LogIn, LogOut, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const { data: session, setShowAuthModal, signOut } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/features", label: "Features" },
    { href: "/feedback", label: "Feedback" },
    { href: "/privacy", label: "Privacy" },
    { href: "/terms", label: "Terms" },
  ];

  return (
    <nav className="sticky top-0 z-50 glass-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <img
              src="/logo.png"
              alt="ChromaCrystal Logo"
              className="h-8 w-auto hover:scale-105 transition-transform"
            />
            <span className="text-lg font-bold gradient-text tracking-tight">
              ChromaCrystal UHD
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/[0.05]"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth + Mobile Toggle */}
          <div className="flex items-center gap-3">
            {session ? (
              <div className="hidden sm:flex items-center gap-3">
                {session.user?.image ? (
                  <img
                    className="h-8 w-8 rounded-full border border-purple-500/30"
                    src={session.user.image}
                    alt="Avatar"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full border border-purple-500/30 bg-purple-500/10 flex items-center justify-center text-purple-300 text-xs font-bold">
                    {session.user?.name?.charAt(0) || "U"}
                  </div>
                )}
                <span className="text-sm text-gray-300 font-medium">{session.user?.name}</span>
                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-400 hover:text-white rounded-lg border border-white/[0.08] hover:border-white/[0.15] hover:bg-white/[0.05] transition-all cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowAuthModal(true)}
                className="hidden sm:flex items-center gap-1.5 px-4 py-2 text-sm font-medium btn-primary rounded-lg cursor-pointer"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Sign In</span>
              </motion.button>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/[0.06] glass-nav overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-white/[0.05] rounded-lg transition-all"
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-3 border-t border-white/[0.06]">
                {session ? (
                  <div className="flex items-center justify-between px-3 py-2">
                    <div className="flex items-center gap-2">
                      {session.user?.image ? (
                        <img className="h-7 w-7 rounded-full" src={session.user.image} alt="Avatar" />
                      ) : (
                        <div className="h-7 w-7 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-300 text-[10px] font-bold">
                          {session.user?.name?.charAt(0) || "U"}
                        </div>
                      )}
                      <span className="text-sm text-gray-300">{session.user?.name}</span>
                    </div>
                    <button
                      onClick={() => { signOut(); setMobileOpen(false); }}
                      className="text-sm text-gray-500 hover:text-white cursor-pointer"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => { setShowAuthModal(true); setMobileOpen(false); }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium btn-primary rounded-lg cursor-pointer"
                  >
                    <LogIn className="h-4 w-4" />
                    Sign In
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}


