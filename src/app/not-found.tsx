import Link from "next/link";

export default function NotFound() {
  return (
    <div className="pt-32 pb-24 px-margin-mobile md:px-margin-desktop max-w-content mx-auto min-h-[60vh]">
      <div className="glass-card rounded-xl p-8 max-w-2xl font-mono">
        <p className="text-error mb-4">
          $ cat /var/log/system.err | tail -1
        </p>
        <p className="text-code-sm text-on-surface-variant mb-2">
          ERROR 404: Requested resource not in filesystem.
        </p>
        <p className="text-code-sm text-on-surface-variant mb-6">
          → Segment did not match any known route.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 border border-white/10 px-6 py-3 text-label-caps uppercase hover:bg-white/5 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined">home</span>
          Return_Home
        </Link>
      </div>
    </div>
  );
}
