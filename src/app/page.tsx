import Link from "next/link";
import TerminalWindow from "@/components/ui/TerminalWindow";
import GlassCard from "@/components/ui/GlassCard";
import TechStackBar from "@/components/ui/TechStackBar";
import Typewriter from "@/components/home/Typewriter";
import Heatmap from "@/components/metrics/Heatmap";
import { profile } from "@/data/profile";
import { featuredSkills } from "@/data/skills";
import stats from "@/data/generated/stats.json";
import contributions from "@/data/generated/contributions.json";

const availabilityLabel: Record<typeof profile.availability, string> = {
  open: "Open for Collaboration",
  "contract-only": "Contract Only",
  closed: "Focused Engagement",
};

export default function HomePage() {
  return (
    <div className="pt-24 pb-32 px-margin-mobile md:px-margin-desktop max-w-content mx-auto">
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-gutter mb-20">
        <div className="lg:col-span-8">
          <TerminalWindow prompt="user@system:~ (main)">
            <div className="space-y-2 text-on-surface-variant leading-relaxed">
              <p className="text-secondary font-mono text-code-sm">
                $ init --profile --detailed
              </p>
              <p className="text-primary-fixed-dim font-mono text-code-sm">
                Initializing System Architecture...
              </p>
              <p className="pl-4 border-l-2 border-primary/20 font-mono text-code-sm">
                Loading core modules: [react_native, ruby_on_rails, graphql,
                typescript]
              </p>
              <div className="pt-6">
                <h1 className="font-mono text-headline-xl-mobile md:text-headline-xl text-primary mb-2 leading-none">
                  <Typewriter text="Init_Success" />
                </h1>
                <p className="text-body-lg text-on-surface/80 max-w-2xl mt-6">
                  {profile.tagline}
                </p>
              </div>
              <div className="pt-8 flex flex-wrap gap-3">
                <Link
                  href="/work"
                  className="bg-primary text-on-primary px-6 py-3 font-mono text-label-caps uppercase flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined">work</span>
                  View_Experience
                </Link>
                <a
                  href={profile.socials.email}
                  className="border border-white/10 px-6 py-3 font-mono text-label-caps uppercase flex items-center gap-2 hover:bg-white/5 active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined">mail</span>
                  Contact_Me
                </a>
              </div>
            </div>
          </TerminalWindow>
        </div>

        <div className="lg:col-span-4 space-y-gutter">
          <GlassCard className="p-6">
            <div className="aspect-square w-full mb-6 relative overflow-hidden rounded-lg bg-surface-container">
              <div className="w-full h-full flex items-center justify-center text-tertiary/40">
                <span className="material-symbols-outlined text-6xl">
                  person
                </span>
              </div>
              <div className="absolute inset-0 bg-primary/10 mix-blend-overlay" />
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <p className="font-mono text-label-caps text-secondary uppercase tracking-widest mb-1">
                    Current_Loc
                  </p>
                  <p className="text-body-md font-bold">{profile.location}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-label-caps text-secondary uppercase tracking-widest mb-1">
                    Availability
                  </p>
                  <div className="flex items-center gap-2 justify-end">
                    <div className="w-2 h-2 bg-secondary rounded-full animate-pulse shadow-[0_0_8px_rgba(66,227,85,1)]" />
                    <p className="text-body-md">
                      {availabilityLabel[profile.availability]}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>

          <div className="grid grid-cols-2 gap-4">
            <a
              href={profile.socials.github}
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card rounded-xl p-4 flex flex-col items-center gap-2 text-on-surface-variant hover:text-primary transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-3xl">code</span>
              <span className="font-mono text-label-caps uppercase">GitHub</span>
            </a>
            <a
              href={profile.socials.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card rounded-xl p-4 flex flex-col items-center gap-2 text-on-surface-variant hover:text-primary transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-3xl">hub</span>
              <span className="font-mono text-label-caps uppercase">
                LinkedIn
              </span>
            </a>
          </div>
        </div>
      </section>

      <section className="mb-20">
        <div className="flex items-center gap-4 mb-8">
          <h2 className="font-mono text-headline-md text-primary">Tech_Stack</h2>
          <div className="h-px flex-1 bg-white/10" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-x-12 md:gap-y-6 glass-card rounded-xl p-8">
          {featuredSkills.map((s) => (
            <TechStackBar key={s.name} label={s.name} percent={s.proficiency} />
          ))}
        </div>
      </section>

      <section>
        <div className="glass-card rounded-xl p-6 md:p-8 border-secondary/20 glow-secondary">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h3 className="font-mono text-headline-md text-secondary">
                System_Activity
              </h3>
              <p className="font-mono text-code-sm opacity-60">
                {stats.totals.contributionsLastYear.toLocaleString()} contributions
                / last 12 months · streak {stats.totals.currentStreak} days
              </p>
            </div>
            <div className="flex items-center gap-2 font-mono text-code-sm">
              <span className="opacity-40">Less</span>
              <div className="flex gap-1">
                <div className="w-3 h-3 bg-white/5 rounded-[2px]" />
                <div className="w-3 h-3 bg-secondary/20 rounded-[2px]" />
                <div className="w-3 h-3 bg-secondary/40 rounded-[2px]" />
                <div className="w-3 h-3 bg-secondary/70 rounded-[2px]" />
                <div className="w-3 h-3 bg-secondary rounded-[2px]" />
              </div>
              <span className="opacity-40">More</span>
            </div>
          </div>
          <Heatmap days={contributions.days} />
        </div>
      </section>
    </div>
  );
}
