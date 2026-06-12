import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HtmlRedirect from "@/components/HtmlRedirect";
import AuthModal from "@/components/AuthModal";

export const metadata: Metadata = {
  title: "ChromaCrystal UHD | AI-Powered Photo Restoration",
  description: "Transform old, degraded photos into stunning Ultra-HD masterpieces with AI-powered colorization, face restoration, and 4K upscaling.",
  keywords: "AI photo restoration, colorization, face restoration, 4K upscaling, DeOldify, GFPGAN, Real-ESRGAN",
  authors: [{ name: "Bhavya Kansal", url: "https://bhavyakansal.dev" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="font-sans antialiased min-h-screen relative bg-[#030014] text-white overflow-x-hidden">
        {/* Animated Background Orbs */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="bg-orb bg-orb-1" />
          <div className="bg-orb bg-orb-2" />
          <div className="bg-orb bg-orb-3" />
          <div className="bg-grid absolute inset-0" />
        </div>

        <AuthProvider>
          <HtmlRedirect />
          <AuthModal />
          <div className="relative z-10 flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}


