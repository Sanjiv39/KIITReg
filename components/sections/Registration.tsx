"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  Star,
  Hourglass,
  Edit3,
  Clock,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { auth } from "@/lib/firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

const REGISTRATION_CLOSE = new Date("July 01, 2026 23:59:59").getTime();

export function Registration() {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState({
    days: "00",
    hours: "00",
    mins: "00",
    secs: "00",
  });
  const [isClosed, setIsClosed] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const pad = (n: number) => String(n).padStart(2, "0");

    const updateTimer = () => {
      const now = Date.now();
      const distance = REGISTRATION_CLOSE - now;

      if (distance <= 0) {
        setIsClosed(true);
        return;
      }

      setIsClosed(false);
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((distance / (1000 * 60)) % 60);
      const secs = Math.floor((distance / 1000) % 60);

      setTimeLeft({
        days: pad(days),
        hours: pad(hours),
        mins: pad(mins),
        secs: pad(secs),
      });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      id="registration"
      className="py-24 relative bg-slate-950/60 border-t border-white/5"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Register <span className="text-gradient">Now.</span>
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            Become an official member of K&#123;devs&#125;
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Process & Guidelines */}
          <div className="lg:col-span-7 space-y-6">
            <h3 className="text-2xl font-bold text-white mb-4">
              Registration Process
            </h3>

            <ul className="space-y-3">
              {[
                "Fill the official registration form",
                "Use your university email ID only (@kiit.ac.in)",
                "Verify your details before submission",
                "Receive confirmation within 48 hours",
                "Attend orientation session",
              ].map((step, idx) => (
                <li
                  key={idx}
                  className="flex items-center gap-3 text-slate-300 text-sm"
                >
                  <CheckCircle2 className="w-5 h-5 text-[#00f2fe] shrink-0" />
                  <span>{step}</span>
                </li>
              ))}
            </ul>

            {/* Warning Box */}
            <div className="p-5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-sm space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-400">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <h4>Important Instructions</h4>
              </div>
              <p className="text-amber-200/90 leading-relaxed">
                &quot;Please register ONLY using your official Email ID. Ensure
                all information is correct. Incorrect details may lead to
                rejection.&quot;
              </p>
            </div>

            {/* Benefits Box */}
            <div className="p-5 rounded-xl bg-[#00f2fe]/10 border border-[#00f2fe]/20 text-slate-200 text-sm space-y-2">
              <div className="flex items-center gap-2 font-bold text-[#00f2fe]">
                <Star className="w-5 h-5 shrink-0" />
                <h4>Membership Benefits</h4>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Access to all workshops, priority for hackathons, club
                merchandise, networking events, and official certification.
              </p>
            </div>
          </div>

          {/* Right Column: Dynamic Action Card */}
          <div className="lg:col-span-5">
            <div className="p-8 rounded-2xl bg-slate-900/80 border border-white/10 shadow-2xl backdrop-blur-xl space-y-6 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#00f2fe]/10 border border-[#00f2fe]/30 flex items-center justify-center text-[#00f2fe]">
                <Edit3 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Ready to Join?
                </h3>
                <p className="text-slate-400 text-sm">
                  Click the button below to register through our official Google
                  Form. Remember to use your official KIIT email address.
                </p>
              </div>

              {!isClosed ? (
                /* OPEN STATE */
                <div className="space-y-6 pt-2">
                  {/* Timer Display */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-white/10">
                    <div className="flex items-center justify-center gap-2 text-xs text-slate-400 font-medium mb-3">
                      <Hourglass className="w-4 h-4 text-[#00f2fe] animate-pulse" />
                      <span>Registration closes in</span>
                    </div>

                    <div className="flex items-center justify-center gap-3 text-white">
                      <div className="text-center">
                        <div className="text-2xl font-bold font-mono text-[#00f2fe]">
                          {timeLeft.days}
                        </div>
                        <div className="text-[10px] uppercase tracking-wider text-slate-400">
                          Days
                        </div>
                      </div>
                      <span className="text-xl font-bold text-slate-600">
                        :
                      </span>
                      <div className="text-center">
                        <div className="text-2xl font-bold font-mono text-[#00f2fe]">
                          {timeLeft.hours}
                        </div>
                        <div className="text-[10px] uppercase tracking-wider text-slate-400">
                          Hours
                        </div>
                      </div>
                      <span className="text-xl font-bold text-slate-600">
                        :
                      </span>
                      <div className="text-center">
                        <div className="text-2xl font-bold font-mono text-[#00f2fe]">
                          {timeLeft.mins}
                        </div>
                        <div className="text-[10px] uppercase tracking-wider text-slate-400">
                          Mins
                        </div>
                      </div>
                      <span className="text-xl font-bold text-slate-600">
                        :
                      </span>
                      <div className="text-center">
                        <div className="text-2xl font-bold font-mono text-[#00f2fe]">
                          {timeLeft.secs}
                        </div>
                        <div className="text-[10px] uppercase tracking-wider text-slate-400">
                          Secs
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Register Button */}
                  <Button
                    asChild
                    size="lg"
                    className="w-full text-base font-bold gap-2 py-3.5"
                  >
                    <a
                      href="https://forms.gle/mfDjfJX7bUUpaCKn8"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Edit3 className="w-4 h-4" /> Register Now
                    </a>
                  </Button>

                  {/* Dashboard / Login Button */}
                  <Button
                    asChild
                    variant="secondary"
                    size="lg"
                    className="w-full text-base font-semibold py-3.5"
                  >
                    <Link href="/dashboard">
                      {isAuthenticated ? "Go to Dashboard" : "Login / Sign Up"}
                    </Link>
                  </Button>

                  <p className="text-xs text-amber-400 flex items-center justify-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" /> Use your official
                    KIIT Email ID only
                  </p>
                </div>
              ) : (
                /* CLOSED STATE */
                <div className="space-y-4 pt-2">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 font-semibold text-sm">
                    <XCircle className="w-4 h-4" /> Registration Closed
                  </div>
                  <div className="p-4 rounded-xl bg-slate-950 border border-white/10 text-left text-xs text-slate-300 space-y-3 leading-relaxed">
                    <div className="flex items-center gap-2 text-slate-400 font-medium">
                      <Clock className="w-4 h-4 text-[#00f2fe]" />
                      <span>Late Entry / Queries</span>
                    </div>
                    <p>
                      If anyone still wishes to register at this moment, please
                      fill out the form available in the Contact & Support
                      section below.
                    </p>
                    <p>
                      We sincerely thank everyone who has already completed
                      their registration. A confirmation email with further
                      details will be sent to you soon.
                    </p>
                  </div>

                  {/* Dashboard / Login Button */}
                  <Button
                    asChild
                    variant="secondary"
                    size="lg"
                    className="w-full text-base font-semibold py-3.5"
                    onClick={() => router.push("/dashboard")}
                  >
                    {/* <Link href="/dashboard"> */}
                    {isAuthenticated ? "Go to Dashboard" : "Login / Sign Up"}
                    {/* </Link> */}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
