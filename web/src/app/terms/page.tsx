"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, FileText } from "lucide-react";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" },
  }),
};

const sections = [
  {
    title: "1. Acceptance of Terms",
    content: `By accessing or using ChromaCrystal UHD ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Service.\n\nThese terms apply to all users, visitors, and anyone who accesses the Service.`,
  },
  {
    title: "2. Description of Service",
    content: `ChromaCrystal UHD is an AI-powered photo restoration platform by MultiModex AI:\n\n• **Photo Colorization**: AI-driven conversion of black-and-white images to full color.\n• **Face Restoration**: Enhancement of facial features using deep learning.\n• **4K Upscaling**: Intelligent upscaling up to 4K UHD resolution.`,
  },
  {
    title: "3. User Responsibilities",
    content: `As a user, you agree to:\n\n• Only upload images that you **own** or have explicit permission to process.\n• Not upload illegal, harmful, abusive, or explicit content.\n• Not attempt to reverse-engineer or exploit the AI models or infrastructure.\n• Not use automated scripts or bots without prior consent.`,
  },
  {
    title: "4. Intellectual Property",
    content: `• **Your Content**: You retain all rights to images you upload and the AI-enhanced results.\n• **Our Service**: The ChromaCrystal UHD brand, AI models, and UI are intellectual property of Bhavya Kansal / MultiModex AI.\n• **Open-Source Models**: Some AI models are open-source and subject to their respective licenses.`,
  },
  {
    title: "5. Limitation of Liability",
    content: `To the maximum extent permitted by law, ChromaCrystal UHD shall not be liable for:\n\n• Any indirect, incidental, or consequential damages.\n• Loss of data, profits, or business opportunities.\n• Any interruption or termination of the Service.\n• Any errors or quality issues in AI-generated results.\n\nThe Service is provided "as-is" without warranties of any kind.`,
  },
  {
    title: "6. Disclaimer",
    content: `Please be aware that:\n\n• **AI results may vary** depending on input image quality and content.\n• Colorization results are **AI-generated interpretations** and may not reflect original colors.\n• Face restoration may alter facial features slightly.\n• The Service is intended for personal and creative use.`,
  },
  {
    title: "7. Account Termination",
    content: `We reserve the right to suspend or terminate your account if:\n\n• You violate these Terms of Service.\n• You engage in abusive or fraudulent behavior.\n• Your usage degrades the Service for others.`,
  },
  {
    title: "8. Governing Law",
    content: `These Terms shall be governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in India.`,
  },
  {
    title: "9. Contact Information",
    content: `Questions about these Terms? Contact us:\n\n• **Email**: kansalbhavya27@gmail.com\n• **Website**: bhavyakansal.dev\n• **Company**: MultiModex AI`,
  },
];

export default function TermsOfServicePage() {
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
              <div className="rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 p-3 ring-1 ring-white/10">
                <FileText className="h-8 w-8 text-blue-400" />
              </div>
            </div>
            <h1 className="bg-gradient-to-r from-blue-400 via-purple-400 to-fuchsia-400 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl">Terms of Service</h1>
            <p className="mt-3 text-sm text-gray-500">Last updated: June 2026</p>
            <p className="mt-4 text-gray-400">Please read these Terms of Service carefully before using ChromaCrystal UHD.</p>
          </motion.div>

          <div className="mb-10 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />

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

          <div className="mt-12 mb-8 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="text-center text-sm text-gray-500">
            <p>© 2026 Bhavya Kansal — MultiModex AI. All rights reserved.</p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
