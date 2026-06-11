"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Shield } from "lucide-react";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" },
  }),
};

const sections = [
  {
    title: "1. Information We Collect",
    content: `When you use ChromaCrystal UHD, we may collect the following information:\n\n• **Uploaded Images**: Photos you submit for AI restoration, colorization, or upscaling.\n• **Account Information**: If you sign in via Google or GitHub (through Firebase Authentication), we receive your display name, email address, and profile photo.\n• **Usage Data**: Basic analytics such as pages visited, features used, and session duration to help us improve the service.`,
  },
  {
    title: "2. How We Use Your Information",
    content: `Your information is used solely to provide and improve our service:\n\n• **Image Processing**: Uploaded images are processed by our AI models in real-time. They are used exclusively for the restoration task you request and are **not stored permanently** on our servers.\n• **Authentication**: Account data is used to manage your session and personalize your experience.\n• **Service Improvement**: Aggregated, anonymized usage data helps us understand how the app is used and where to focus improvements.`,
  },
  {
    title: "3. Data Security",
    content: `We take your data security seriously:\n\n• All uploaded images are processed **in-memory** and are **automatically deleted** after you download the result or your session ends.\n• We do **not** train our AI models on your uploaded images.\n• Communication between your browser and our servers is encrypted via HTTPS/TLS.\n• Authentication is handled securely through Firebase Auth with industry-standard OAuth 2.0 protocols.`,
  },
  {
    title: "4. Third-Party Services",
    content: `ChromaCrystal UHD relies on the following trusted third-party services:\n\n• **Firebase Authentication** (Google): Handles user sign-in securely via Google and GitHub OAuth providers.\n• **Hugging Face Spaces**: Hosts our AI processing backend.\n• **Vercel / Static Hosting**: The frontend is deployed as a static site and does not process or store user data on the hosting platform.`,
  },
  {
    title: "5. Cookies",
    content: `We use minimal cookies and local storage:\n\n• **Authentication Cookies**: Session tokens to keep you signed in.\n• **Preference Cookies**: To remember your UI preferences.\n• We do **not** use third-party advertising or tracking cookies.`,
  },
  {
    title: "6. Changes to This Policy",
    content: `We may update this Privacy Policy from time to time. Any changes will be reflected on this page with an updated "Last Updated" date. Continued use of ChromaCrystal UHD after changes constitutes acceptance of the updated policy.`,
  },
  {
    title: "7. Contact Us",
    content: `If you have any questions regarding this Privacy Policy, please contact us:\n\n• **Email**: kansalbhavya27@gmail.com\n• **Website**: bhavyakansal.dev\n• **Company**: MultiModex AI`,
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
          <Link href="/" className="group mb-8 inline-flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-purple-400">
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Home
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 sm:p-10 lg:p-14">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-10 text-center">
            <div className="mb-4 flex justify-center">
              <div className="rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 p-3 ring-1 ring-white/10">
                <Shield className="h-8 w-8 text-purple-400" />
              </div>
            </div>
            <h1 className="bg-gradient-to-r from-purple-400 via-fuchsia-400 to-blue-400 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl">Privacy Policy</h1>
            <p className="mt-3 text-sm text-gray-500">Last updated: June 2026</p>
            <p className="mt-4 text-gray-400">At ChromaCrystal UHD, your privacy matters. This policy explains how we collect, use, and protect your information.</p>
          </motion.div>

          <div className="mb-10 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />

          <div className="space-y-8">
            {sections.map((section, i) => (
              <motion.div key={section.title} custom={i} initial="hidden" animate="visible" variants={fadeIn}>
                <h2 className="mb-3 text-xl font-semibold text-white">{section.title}</h2>
                <div className="whitespace-pre-line text-[15px] leading-relaxed text-gray-400">
                  {section.content.split(/(\*\*.*?\*\*)/).map((part, j) => {
                    if (part.startsWith("**") && part.endsWith("**")) {
                      return <span key={j} className="font-medium text-gray-200">{part.slice(2, -2)}</span>;
                    }
                    return <span key={j}>{part}</span>;
                  })}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 mb-8 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="text-center text-sm text-gray-500">
            <p>© 2026 Bhavya Kansal — MultiModex AI. All rights reserved.</p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
