"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "@/context/AuthContext";
import { LogIn, LogOut, Menu, X, Sparkles, MessageSquare, LayoutDashboard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const { data: session, setShowAuthModal, signOut } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

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
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
            <img
              src="/logo.png"
              alt="ChromaCrystal Logo"
              className="h-11 sm:h-13 w-auto hover:scale-105 transition-transform"
            />
            <span className="text-lg sm:text-xl md:text-2xl font-black gradient-text tracking-tight whitespace-nowrap">
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
          <div className="flex items-center gap-2.5 sm:gap-3 relative">
            {session ? (
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Account Button Trigger */}
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-2 py-1.5 sm:px-3 sm:py-2 rounded-xl hover:bg-white/[0.05] border border-transparent hover:border-white/[0.08] transition-all cursor-pointer select-none"
                >
                  {session.user?.image ? (
                    <img
                      className="h-7 w-7 sm:h-8 sm:w-8 rounded-full border border-purple-500/30"
                      src={session.user.image}
                      alt="Avatar"
                    />
                  ) : (
                    <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full border border-purple-500/30 bg-purple-500/10 flex items-center justify-center text-purple-300 text-xs font-bold">
                      {session.user?.name?.charAt(0) || "U"}
                    </div>
                  )}
                  <span className="hidden sm:inline text-sm text-gray-300 font-semibold">{session.user?.name}</span>
                </button>

                {/* Dropdown Backdrop to close on click outside */}
                {dropdownOpen && (
                  <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                )}

                {/* Dropdown Card */}
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 top-full mt-2 w-56 sm:w-60 rounded-2xl bg-[#0b0820]/95 border border-white/[0.08] p-3 sm:p-4 shadow-2xl backdrop-blur-2xl z-50 flex flex-col gap-2.5 sm:gap-3"
                    >
                      {/* User Info Header */}
                      <div className="flex flex-col gap-0.5 px-1">
                        <div className="text-xs font-bold text-white tracking-tight">{session.user?.name}</div>
                        <div className="text-[10px] text-gray-500 overflow-hidden text-ellipsis whitespace-nowrap">{session.user?.email}</div>
                      </div>

                      <div className="h-px bg-white/[0.06]" />

                      {/* Links */}
                      <div className="flex flex-col gap-1">
                        <Link
                          href="/restore"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/[0.05] transition-all"
                        >
                          <LayoutDashboard className="w-3.5 h-3.5 text-purple-400" />
                          Workspace
                        </Link>
                        <Link
                          href="/feedback"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/[0.05] transition-all"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                          Feedback Form
                        </Link>
                      </div>

                      <div className="h-px bg-white/[0.06]" />

                      {/* Logout */}
                      <button
                        onClick={() => { signOut(); setDropdownOpen(false); }}
                        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-bold text-red-400 hover:text-red-350 hover:bg-red-500/10 transition-all cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold btn-primary rounded-lg cursor-pointer"
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


