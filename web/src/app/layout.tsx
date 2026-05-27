import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ChromaCrystal_UHD | Reviving History in Ultra Reality",
  description: "AI-powered cinematic restoration, colorization, enhancement, and 4K upscaling technology.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen relative">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] -z-10" />
        <main className="relative z-10 flex flex-col min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
