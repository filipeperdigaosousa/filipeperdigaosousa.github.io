import Link from "next/link";
import Logo from "@/components/ui/Logo";
import { profile } from "@/data/profile";

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
          className="flex items-center gap-3 cursor-pointer active:scale-95 transition-all"
        >
          <Logo size={32} />
          <span className="font-mono text-headline-md font-bold text-primary tracking-tighter">
            {profile.name}
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
      </div>
    </header>
  );
}
