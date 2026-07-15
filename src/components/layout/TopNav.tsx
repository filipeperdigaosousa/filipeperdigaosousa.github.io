import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/work", label: "Work" },
  { href: "/impact", label: "Impact" },
  { href: "/labs", label: "Labs" },
];

export default function TopNav() {
  return (
    <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-white/10 shadow-[0_0_20px_rgba(173,198,255,0.05)]">
      <div className="flex justify-between items-center px-margin-mobile md:px-margin-desktop h-16 w-full max-w-content mx-auto">
        <Link
          href="/"
          className="flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-primary text-headline-md">
            terminal
          </span>
          <span className="font-mono text-headline-md font-bold text-primary tracking-tighter">
            SYS.LOG_
          </span>
        </Link>
        <nav className="hidden md:flex gap-8">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-on-surface-variant font-mono text-label-caps uppercase hover:text-primary transition-all"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined text-primary cursor-pointer active:scale-95">
            settings_ethernet
          </span>
        </div>
      </div>
    </header>
  );
}
