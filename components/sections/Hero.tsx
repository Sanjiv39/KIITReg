import Link from "next/link";
import { GitBranch, ArrowRight, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Hero() {
  return (
    <section id="home" className="relative min-h-screen pt-32 pb-20 flex items-center justify-center overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#00f2fe]/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <Badge variant="default" className="inline-flex items-center gap-2">
              <GitBranch className="w-3.5 h-3.5" />
              <span>Est. 2026 • Official Tech Community</span>
            </Badge>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
              From cursor to <span className="text-gradient">creator.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
              We don&apos;t just teach syntax; we build builders. Join a community of problem-solvers bridging the gap between writing your first line of code and architecting real-world solutions.
            </p>

            <div className="flex flex-wrap gap-4 justify-center lg:justify-start pt-2">
              <Button asChild size="lg" className="text-base font-semibold">
                <Link href="#registration">
                  Compile Your Future
                </Link>
              </Button>

              <Button asChild variant="secondary" size="lg" className="text-base font-semibold">
                <a href="https://kiitkodingclub.pythonanywhere.com/" target="_blank" rel="noreferrer" className="flex items-center gap-2">
                  Explore Events <ArrowRight className="w-4 h-4" />
                </a>
              </Button>
            </div>
          </div>

          {/* Right Interactive Visual Code Window */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-md rounded-2xl bg-slate-950/90 border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden backdrop-blur-xl group hover:border-[#00f2fe]/40 transition-all duration-300">
              {/* Window Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-slate-900/80 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                  <Terminal className="w-3.5 h-3.5 text-[#00f2fe]" />
                  <span>k_devs_init.py</span>
                </div>
              </div>

              {/* Code Body */}
              <div className="p-6 font-mono text-sm leading-relaxed overflow-x-auto text-slate-200">
                <p>
                  <span className="text-purple-400 font-semibold">class</span>{" "}
                  <span className="text-yellow-300 font-semibold">Developer</span>:
                </p>
                <p className="pl-4">
                  <span className="text-purple-400 font-semibold">def</span>{" "}
                  <span className="text-blue-400 font-semibold">__init__</span>(self, passion):
                </p>
                <p className="pl-8">
                  self.skills = [<span className="text-emerald-300">&quot;Logic&quot;</span>, <span className="text-emerald-300">&quot;Design&quot;</span>]
                </p>
                <p className="pl-8">
                  self.community = <span className="text-emerald-300">&quot;K&#123;devs&#125;&quot;</span>
                </p>
                <br />
                <p className="pl-4">
                  <span className="text-purple-400 font-semibold">def</span>{" "}
                  <span className="text-blue-400 font-semibold">build</span>(self):
                </p>
                <p className="pl-8">
                  <span className="text-purple-400 font-semibold">return</span>{" "}
                  <span className="text-emerald-300">&quot;Innovation unlocked&quot;</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
