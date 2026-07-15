import Link from "next/link";

const items = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/work", label: "Work", icon: "code" },
  { href: "/impact", label: "Impact", icon: "analytics" },
  { href: "/labs", label: "Labs", icon: "biotech" },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 w-full z-50 md:hidden bg-surface-container-lowest/90 backdrop-blur-2xl border-t border-white/10 shadow-[0_-4px_24px_rgba(0,0,0,0.5)]">
      <div className="flex justify-around items-center h-20 px-margin-mobile">
        {items.map((it) => (
          <Link
            key={it.href}
            href={it.href}
            className="flex flex-col items-center justify-center text-on-surface-variant/60 active:scale-90 transition-transform"
          >
            <span className="material-symbols-outlined">{it.icon}</span>
            <span className="font-mono text-label-caps mt-1 uppercase">
              {it.label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
