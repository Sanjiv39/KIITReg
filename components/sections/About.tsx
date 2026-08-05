import { Code2, Trophy, Network, Workflow, Bug, ShieldCheck } from "lucide-react";

const ABOUT_CARDS = [
  {
    icon: Code2,
    title: "Technical Workshops",
    description:
      "Regular hands-on sessions on modern tech stacks, algorithmic thinking, data structures, and system design. Learn past the tutorials.",
  },
  {
    icon: Trophy,
    title: "Collaborative Sprints",
    description:
      "Participate in agile team environments and hackathons. Enclose your ideas in brackets and compile them into reality with fellow members.",
  },
  {
    icon: Network,
    title: "Networking Opportunities",
    description:
      "Connect with peers, alumni, and industry professionals. Build a network that supports your transition from student to software engineer.",
  },
  {
    icon: Workflow,
    title: "Real-world Projects",
    description:
      "Transition from consumers to active contributors. We partner to build digital solutions that address actual community needs.",
  },
  {
    icon: Bug,
    title: "Peer Debugging",
    description:
      "Foster a culture where no one codes in isolation. Whether tracing a logic error or optimizing a query, our community is your stack-trace.",
  },
  {
    icon: ShieldCheck,
    title: "Cybersecurity & Beyond",
    description:
      "Expand your horizons beyond standard dev. Explore ethical hacking, defend against SQL injections, and understand brute-force mitigation.",
  },
];

export function About() {
  return (
    <section id="about" className="py-24 relative bg-slate-950/50 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            About <span className="text-gradient">K&#123;devs&#125;</span>
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            Empowering the next generation of developers, innovators, and tech leaders
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {ABOUT_CARDS.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className="group p-8 rounded-2xl bg-slate-900/40 border border-white/10 backdrop-blur-md hover:border-[#00f2fe]/40 hover:bg-slate-900/70 hover:-translate-y-1 transition-all duration-300 shadow-lg"
              >
                <div className="w-14 h-14 rounded-xl bg-[#00f2fe]/10 border border-[#00f2fe]/20 flex items-center justify-center text-[#00f2fe] mb-6 group-hover:scale-110 group-hover:bg-[#00f2fe] group-hover:text-black transition-all duration-300">
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#00f2fe] transition-colors">
                  {card.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {card.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
