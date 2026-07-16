import type { Metadata } from "next";
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

export default function ResumePage() {
  return (
    <div className="pt-24 pb-24 px-margin-mobile md:px-margin-desktop max-w-content mx-auto">
      <div className="mb-6 print:hidden flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/work"
          className="font-mono text-code-sm text-tertiary hover:text-primary inline-flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to Work
        </Link>
        <PrintButton />
      </div>

      <div className="resume-page mx-auto max-w-4xl">
        <header className="resume-header pb-6 mb-6 border-b border-white/10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
            <div>
              <h1 className="font-mono text-headline-xl-mobile md:text-headline-xl text-primary mb-1 leading-tight">
                {profile.name}
              </h1>
              <p className="font-mono text-body-lg text-on-surface-variant">
                {profile.role}
              </p>
            </div>
            <ul className="font-mono text-code-sm text-on-surface-variant space-y-1 md:text-right">
              <li>{profile.location}</li>
              <li>
                <a
                  href={profile.socials.email}
                  className="hover:text-primary transition-colors"
                >
                  {profile.socials.email.replace("mailto:", "")}
                </a>
              </li>
              <li>
                <a
                  href={profile.socials.github}
                  className="hover:text-primary transition-colors"
                >
                  github.com/filipeperdigaosousa
                </a>
              </li>
              <li>
                <a
                  href={profile.socials.linkedin}
                  className="hover:text-primary transition-colors"
                >
                  linkedin.com/in/filipeperdigaosousa
                </a>
              </li>
            </ul>
          </div>

          <p className="mt-5 text-body-md text-on-surface/85 max-w-3xl leading-relaxed">
            {profile.tagline}
          </p>
        </header>

        <section className="mb-6">
          <h2 className="font-mono text-label-caps uppercase tracking-widest text-secondary mb-4">
            / Experience
          </h2>
          <ul className="space-y-6">
            {experience.map((e) => (
              <li key={`${e.company}-${e.start}`} className="resume-entry break-inside-avoid">
                <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-1 mb-2">
                  <div>
                    <span className="font-mono text-headline-md text-primary">
                      {e.company}
                    </span>
                    <span className="font-mono text-body-md text-on-surface-variant ml-3">
                      · {e.role}
                    </span>
                  </div>
                  <span className="font-mono text-code-sm text-tertiary shrink-0 uppercase tracking-widest">
                    {formatRange(e.start, e.end)}
                  </span>
                </div>
                <p className="text-body-md text-on-surface/85 mb-2 leading-relaxed">
                  {e.summary}
                </p>
                <ul className="list-disc pl-5 space-y-1 text-body-md text-on-surface/80 leading-relaxed">
                  {e.highlights.map((h) => (
                    <li key={h}>{stripMarkers(h)}</li>
                  ))}
                </ul>
                {e.stack.length ? (
                  <p className="mt-2 font-mono text-code-sm text-tertiary">
                    {e.stack.join(" · ")}
                  </p>
                ) : null}
                {e.note ? (
                  <p className="mt-2 font-mono text-code-sm text-on-surface-variant/70 italic">
                    Note: {e.note}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="font-mono text-label-caps uppercase tracking-widest text-secondary mb-4">
            / Skills
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            {(Object.keys(categoryLabels) as SkillCategory[]).map((cat) => (
              <div key={cat} className="break-inside-avoid">
                <p className="font-mono text-label-caps text-primary uppercase tracking-widest mb-1">
                  {categoryLabels[cat]}
                </p>
                <p className="text-body-md text-on-surface/85 leading-relaxed">
                  {skillsByCategory[cat].map((s) => s.name).join(" · ")}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
