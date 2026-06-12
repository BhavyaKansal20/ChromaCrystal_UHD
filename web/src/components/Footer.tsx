"use client";

import Link from "next/link";
import { Diamond, Github, Linkedin, Globe, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative mt-auto border-t border-white/[0.06]">
      <div className="absolute inset-0 glass-nav -z-10" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img
                src="/logo.png"
                alt="ChromaCrystal Logo"
                className="h-12 w-auto hover:scale-105 transition-transform"
              />
              <span className="text-sm font-bold gradient-text tracking-tight uppercase">ChromaCrystal UHD</span>
            </div>

            <p className="text-gray-400 text-sm leading-relaxed max-w-md">
              AI-powered cinematic photo restoration. Transform old, degraded, black-and-white 
              memories into stunning Ultra-HD reality using DeOldify, GFPGAN, and Real-ESRGAN.
            </p>
            <div className="flex items-center gap-4 mt-4">
              <a
                href="https://github.com/BhavyaKansal20"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-purple-400 transition-colors"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://www.linkedin.com/in/kansal0920"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-purple-400 transition-colors"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="https://bhavyakansal.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-purple-400 transition-colors"
              >
                <Globe className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link href="/" className="text-gray-400 hover:text-purple-400 text-sm transition-colors">Home</Link></li>
              <li><Link href="/#features" className="text-gray-400 hover:text-purple-400 text-sm transition-colors">Features</Link></li>
              <li><Link href="/feedback" className="text-gray-400 hover:text-purple-400 text-sm transition-colors">Feedback</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><Link href="/privacy" className="text-gray-400 hover:text-purple-400 text-sm transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-gray-400 hover:text-purple-400 text-sm transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/[0.06] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-xs">
            © 2026 Bhavya Kansal — <a href="https://multimodexai.vercel.app" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 transition-colors">MultiModex AI</a>. All rights reserved.
          </p>
          <p className="text-gray-600 text-xs flex items-center gap-1">
            Built with <Heart className="h-3 w-3 text-pink-500" /> for preserving memories
          </p>
        </div>
      </div>
    </footer>
  );
}
