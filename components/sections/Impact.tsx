import { Rocket, Target, Lightbulb } from "lucide-react";

const IMPACT_ITEMS = [
  {
    icon: Rocket,
    emoji: "🚀",
    title: "Hackathons",
    description: "We will organize innovative hackathons to encourage creativity and teamwork.",
  },
  {
    icon: Target,
    emoji: "🎯",
    title: "Workshops",
    description: "We will conduct hands-on workshops focused on practical learning.",
  },
  {
    icon: Lightbulb,
    emoji: "💡",
    title: "Projects",
    description: "We will build real-world projects to gain industry-level experience.",
  },
];

export function Impact() {
  return (
    <section id="impact" className="py-24 relative border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Real-World <span className="text-gradient">Impact</span>
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            Enclosing our ideas in brackets and compiling them into reality.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {IMPACT_ITEMS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-8 rounded-2xl bg-gradient-to-b from-slate-900/60 to-slate-950/80 border border-white/10 text-center hover:border-[#00f2fe]/30 hover:shadow-[0_10px_30px_rgba(0,242,254,0.15)] transition-all duration-300 group"
              >
                <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-800/80 border border-white/10 flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                  <span>{item.emoji}</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#00f2fe] transition-colors">
                  {item.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
