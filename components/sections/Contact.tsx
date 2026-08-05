import { MessageSquare, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ContactProps {
  onOpenWhatsApp: () => void;
  onOpenEmail: () => void;
}

export function Contact({ onOpenWhatsApp, onOpenEmail }: ContactProps) {
  return (
    <section id="contact" className="py-24 relative border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Contact & <span className="text-gradient">Support</span>
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            Get in touch with the K&#123;devs&#125; team for queries and support
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* WhatsApp Card */}
          <div className="p-8 rounded-2xl bg-slate-900/60 border border-white/10 text-center hover:border-emerald-500/40 backdrop-blur-md transition-all duration-300 flex flex-col justify-between space-y-6 group">
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white">WhatsApp Query</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Fill a quick form with your details and query. We&apos;ll redirect you to WhatsApp with all information pre-filled for easy communication.
              </p>
            </div>

            <Button
              variant="whatsapp"
              size="lg"
              onClick={onOpenWhatsApp}
              className="w-full gap-2 font-bold"
            >
              <MessageSquare className="w-4 h-4" /> WhatsApp Query
            </Button>
          </div>

          {/* Email Card */}
          <div className="p-8 rounded-2xl bg-slate-900/60 border border-white/10 text-center hover:border-red-500/40 backdrop-blur-md transition-all duration-300 flex flex-col justify-between space-y-6 group">
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 group-hover:scale-110 transition-transform">
                <Mail className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white">Email Query</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                For detailed queries, use our email form. We&apos;ll respond to your KIIT email within 24 hours.
              </p>
            </div>

            <Button
              variant="email"
              size="lg"
              onClick={onOpenEmail}
              className="w-full gap-2 font-bold"
            >
              <Mail className="w-4 h-4" /> Send Email Query
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
