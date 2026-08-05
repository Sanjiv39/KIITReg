"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Impact } from "@/components/sections/Impact";
import { Registration } from "@/components/sections/Registration";
import { Contact } from "@/components/sections/Contact";
import { WhatsAppModal } from "@/components/modals/WhatsAppModal";
import { EmailModal } from "@/components/modals/EmailModal";

export default function Home() {
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [isEmailOpen, setIsEmailOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  return (
    <main className="min-h-screen bg-[#0b0f19] text-white relative">
      {/* Navigation Header */}
      <Navbar />

      {/* Hero Section */}
      <Hero />

      {/* About Section */}
      <About />

      {/* Impact Section */}
      <Impact />

      {/* Registration Section */}
      <Registration />

      {/* Contact Section */}
      <Contact
        onOpenWhatsApp={() => setIsWhatsAppOpen(true)}
        onOpenEmail={() => setIsEmailOpen(true)}
      />

      {/* Footer */}
      <Footer />

      {/* Modals */}
      <WhatsAppModal
        isOpen={isWhatsAppOpen}
        onClose={() => setIsWhatsAppOpen(false)}
        onShowToast={showToast}
      />
      <EmailModal
        isOpen={isEmailOpen}
        onClose={() => setIsEmailOpen(false)}
        onShowToast={showToast}
      />

      {/* Success Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl bg-slate-900 border border-[#00f2fe]/40 shadow-[0_10px_30px_rgba(0,0,0,0.8)] text-white text-sm animate-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 className="w-5 h-5 text-[#00f2fe] shrink-0" />
          <div className="font-medium">{toastMessage}</div>
        </div>
      )}
    </main>
  );
}
