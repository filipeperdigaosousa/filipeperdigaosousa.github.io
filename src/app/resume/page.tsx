import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PrintButton from "@/components/resume/PrintButton";
import { profile } from "@/data/profile";
import { experience } from "@/data/experience";
import { skillsByCategory, categoryLabels, type SkillCategory } from "@/data/skills";
import { formatRange } from "@/lib/format";

export const metadata: Metadata = {
  title: "Résumé",
  description: "Printable résumé — matches the website in style and content.",
  robots: { index: false, follow: false },
};

function stripMarkers(text: string) {
  return text.replace(/\*\*/g, "");
}

const catOrder: SkillCategory[] = [
  "language",
  "framework",
  "storage",
  "cloud",
  "tooling",
];

export default function ResumePage() {
  return (
    <div className="resume-shell relative">
      <div className="print:hidden max-w-content mx-auto px-margin-mobile md:px-margin-desktop pt-20 pb-2 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/work"
          className="font-mono text-code-sm text-tertiary hover:text-primary inline-flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to Work
        </Link>
        <PrintButton />
      </div>

      <div className="resume-page bg-background text-on-surface mx-auto max-w-4xl px-margin-mobile md:px-10 pt-2 pb-10 print:py-0 print:px-0">
        <header className="resume-header pb-5 mb-6 border-b border-white/10 grid grid-cols-[auto_1fr] gap-5 items-start">
          <div className="relative shrink-0 rounded-lg overflow-hidden border border-white/10 w-48 h-48">
            <Image
              src="/portrait.jpg"
              alt={`${profile.name} portrait`}
              fill
              sizes="192px"
              className="object-cover"
              priority
            />
          </div>
          <div>
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
              <div>
                <h1 className="font-mono text-headline-md md:text-[28px] text-primary leading-tight">
                  {profile.name}
                </h1>
                <p className="font-mono text-body-md text-on-surface-variant mt-0.5">
                  {profile.role}
                </p>
              </div>
              <ul className="font-mono text-[11px] text-on-surface-variant leading-relaxed md:text-right space-y-0.5">
                <li>{profile.location}</li>
                <li>{profile.socials.email.replace("mailto:", "")}</li>
                <li>github.com/filipeperdigaosousa</li>
                <li>linkedin.com/in/filipeperdigaosousa</li>
              </ul>
            </div>
            <p className="mt-3 text-[13px] leading-relaxed text-on-surface/85 max-w-3xl">
              I enjoy taking complex product ideas from architecture through
              production, working across Ruby on Rails, JavaScript, React,
              React Native, GraphQL and cloud infrastructure. More recently
              I&apos;ve been leading cross-functional engineering pods while
              remaining a hands-on contributor — owning technical direction,
              delivery planning and implementation.
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_220px] gap-6 print:gap-4">
          <section>
            <h2 className="font-mono text-[10px] uppercase tracking-widest text-secondary mb-3">
              / Experience
            </h2>
            <ul className="space-y-4">
              {experience.map((e) => (
                <li
                  key={`${e.company}-${e.start}`}
                  className="resume-entry break-inside-avoid"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                    <div className="font-mono">
                      <span className="text-[15px] text-primary font-semibold">
                        {e.company}
                      </span>
                      <span className="text-body-md text-on-surface-variant ml-2">
                        · {e.role}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-tertiary uppercase tracking-widest">
                      {formatRange(e.start, e.end)}
                    </span>
                  </div>
                  <p className="mt-1 text-[13px] text-on-surface/80 leading-relaxed">
                    {e.summary}
                  </p>
                  <ul className="mt-1.5 space-y-0.5 text-[12.5px] text-on-surface/80 leading-relaxed pl-4">
                    {e.highlights.map((h) => (
                      <li key={h} className="list-disc marker:text-primary/60">
                        {stripMarkers(h)}
                      </li>
                    ))}
                  </ul>
                  {e.stack.length ? (
                    <p className="mt-1.5 font-mono text-[10.5px] text-tertiary">
                      {e.stack.join(" · ")}
                    </p>
                  ) : null}
                  {e.note ? (
                    <p className="mt-1 font-mono text-[10.5px] text-on-surface-variant/70 italic">
                      {e.note}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>

          <aside className="space-y-5">
            <div>
              <h2 className="font-mono text-[10px] uppercase tracking-widest text-secondary mb-3">
                / Skills
              </h2>
              <div className="space-y-3">
                {catOrder.map((cat) => (
                  <div key={cat} className="break-inside-avoid">
                    <p className="font-mono text-[10px] text-primary uppercase tracking-widest mb-1">
                      {categoryLabels[cat]}
                    </p>
                    <p className="text-[12px] leading-relaxed text-on-surface/85">
                      {skillsByCategory[cat].map((s) => s.name).join(" · ")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
