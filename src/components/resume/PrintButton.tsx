"use client";

import { track } from "@/lib/analytics";

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => {
        track("resume-pdf");
        window.print();
      }}
      className="inline-flex items-center gap-2 bg-primary text-on-primary px-4 py-2 font-mono text-label-caps uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all"
    >
      <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
      Save as PDF
    </button>
  );
}
