import Image from "next/image";
import { Mail, MapPin, MessageSquare } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 border-t border-white/10 pt-16 pb-8 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pb-12 border-b border-white/10">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12">
                <Image
                  src="/Kdevs.png"
                  alt="KDEVS Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white tracking-wide">
                  KIIT <span className="text-[#00f2fe]">Koding Club</span>
                </h3>
                <p className="text-xs text-slate-400">K&#123;devs&#125; Tech Community</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              Official KIIT - Koding club community School of Computer Application. Enclosing our ideas in brackets and compiling them into reality.
            </p>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Contact Info</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <a
                href="mailto:2570237@kiit.ac.in"
                className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-900/60 border border-white/5 hover:border-[#00f2fe]/40 hover:text-white transition-all"
              >
                <Mail className="w-4 h-4 text-[#00f2fe]" />
                <span className="truncate">2570237@kiit.ac.in</span>
              </a>

              <a
                href="https://www.instagram.com/kdev_sca_26?igsh=MXJxa3hqbjJoZXJjZw%3D%3D"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-900/60 border border-white/5 hover:border-pink-500/40 hover:text-white transition-all"
              >
                <svg
                  className="w-4 h-4 text-pink-500 fill-current"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                <span>@kdevs_kiit</span>
              </a>

              <a
                href="https://wa.me/917366006363"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-900/60 border border-white/5 hover:border-emerald-500/40 hover:text-white transition-all"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>+91 7366006363</span>
              </a>

              <a
                href="https://wa.me/916202839178"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-900/60 border border-white/5 hover:border-emerald-500/40 hover:text-white transition-all"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>+91 6202839178</span>
              </a>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-900/60 border border-white/5 text-xs">
              <MapPin className="w-4 h-4 text-[#00f2fe] shrink-0 mt-0.5" />
              <span>Campus 15, KIIT University, School of Computer Application, Bhubaneswar, Odisha</span>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="pt-8 text-center text-xs text-slate-500">
          &copy; {currentYear} K&#123;devs&#125; KIIT Koding club. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
