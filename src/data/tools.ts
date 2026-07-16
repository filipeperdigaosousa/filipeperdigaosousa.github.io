export type ToolCategory = "workflow" | "data" | "time" | "web" | "security";

export interface Tool {
  slug: string;
  name: string;
  summary: string;
  category: ToolCategory;
  icon: string;
  tags: string[];
  featured?: boolean;
}

export const categoryLabels: Record<ToolCategory, string> = {
  workflow: "FROM_WORKFLOW",
  data: "DATA_&_TEXT",
  time: "TIME_&_OPS",
  web: "WEB_&_DESIGN",
  security: "SECURITY",
};

export const categoryOrder: ToolCategory[] = [
  "workflow",
  "data",
  "time",
  "web",
  "security",
];

export const tools: Tool[] = [
  {
    slug: "pr-size",
    name: "PR Size Classifier",
    summary:
      "Paste a diff-stat or type in the LOC. Get an S/M/L/XL bucket and a recommendation. Mirrors how I triage my own PRs.",
    category: "workflow",
    icon: "commit",
    tags: ["code-review", "workflow"],
    featured: true,
  },
  {
    slug: "cycle",
    name: "Cycle Doc Generator",
    summary:
      "Fill in scopes, decisions and weeks — get a ready-to-drop Shape-Up-style cycle doc as Markdown.",
    category: "workflow",
    icon: "description",
    tags: ["planning", "markdown"],
    featured: true,
  },
  {
    slug: "meeting-cost",
    name: "Meeting Cost",
    summary:
      "Headcount × salary × minutes → real cost of a meeting. Persuasive when you need to cancel one.",
    category: "workflow",
    icon: "groups",
    tags: ["planning", "cost"],
    featured: true,
  },
  {
    slug: "leave-planner",
    name: "Leave Planner",
    summary:
      "Plan one or many leave periods (days or hours). Handles partial days, skips weekends and holidays, calendar view of when each ends.",
    category: "workflow",
    icon: "beach_access",
    tags: ["planning", "time-off"],
    featured: true,
  },
  {
    slug: "diff",
    name: "Diff Viewer",
    summary:
      "Paste two blobs of text. See line-by-line differences, side-by-side or unified. Handy for config drift.",
    category: "data",
    icon: "difference",
    tags: ["review", "text"],
  },
  {
    slug: "yaml-json",
    name: "YAML ↔ JSON",
    summary:
      "Convert between YAML and JSON both ways. Parses, validates and re-emits so you can sanity-check configs.",
    category: "data",
    icon: "swap_horiz",
    tags: ["config", "convert"],
  },
  {
    slug: "json",
    name: "JSON Toolbox",
    summary:
      "Format, minify, validate. Pretty error location, path lookup and clipboard copy in one place.",
    category: "data",
    icon: "data_object",
    tags: ["json", "debug"],
  },
  {
    slug: "base64",
    name: "Base64",
    summary:
      "Encode / decode text or files. Optional URL-safe variant. Handles UTF-8 correctly, unlike the built-in atob.",
    category: "data",
    icon: "code",
    tags: ["encode", "utility"],
  },
  {
    slug: "url",
    name: "URL Encoder + Query Parser",
    summary:
      "Encode/decode strings. Paste a full URL to inspect and edit each query parameter individually.",
    category: "data",
    icon: "link",
    tags: ["url", "encode"],
  },
  {
    slug: "cron",
    name: "Cron Translator",
    summary:
      "Cron expression ↔ human-language, both directions, with common presets. What I keep re-opening for GitHub Actions.",
    category: "time",
    icon: "schedule",
    tags: ["ops", "devops"],
  },
  {
    slug: "timestamp",
    name: "Unix Timestamp",
    summary:
      "Epoch ↔ human date, with timezone picker and common units (s, ms). What you want when a log says '1710000000'.",
    category: "time",
    icon: "update",
    tags: ["time", "debug"],
  },
  {
    slug: "duration",
    name: "Duration Parser",
    summary:
      "Human duration (\"1h30m5s\") ↔ seconds, milliseconds, and ISO 8601 (PT1H30M5S). Round-trip safe.",
    category: "time",
    icon: "timer",
    tags: ["time", "convert"],
  },
  {
    slug: "business-days",
    name: "Business Days",
    summary:
      "Working days between two dates. Skips weekends, paste custom holidays in. Useful for delivery estimates.",
    category: "time",
    icon: "date_range",
    tags: ["time", "planning"],
  },
  {
    slug: "contrast",
    name: "Contrast Checker",
    summary:
      "Foreground vs background → WCAG contrast ratio and AA/AAA verdicts, with live preview.",
    category: "web",
    icon: "contrast",
    tags: ["a11y", "design"],
  },
  {
    slug: "clamp",
    name: "CSS clamp()",
    summary:
      "Min font-size at min viewport, max at max viewport → the exact clamp() expression for fluid typography.",
    category: "web",
    icon: "text_fields",
    tags: ["css", "responsive"],
  },
  {
    slug: "rem-px",
    name: "rem ↔ px",
    summary:
      "Convert rem to px and back with a root-size slider. Also shows the em / percentage equivalents.",
    category: "web",
    icon: "straighten",
    tags: ["css", "convert"],
  },
  {
    slug: "shadow",
    name: "Box Shadow Builder",
    summary:
      "Sliders for offset, blur, spread, colour, inset — see the shadow live and copy the CSS.",
    category: "web",
    icon: "layers",
    tags: ["css", "design"],
  },
  {
    slug: "qr",
    name: "QR Code Generator",
    summary:
      "Encode text / URL / Wi-Fi credentials into a QR code. Downloadable as PNG or SVG, no external calls.",
    category: "web",
    icon: "qr_code_2",
    tags: ["encode", "utility"],
  },
  {
    slug: "jwt-decoder",
    name: "JWT Decoder",
    summary:
      "See header, payload, expiry status, algorithm. Everything runs in-browser — token never leaves your device.",
    category: "security",
    icon: "key",
    tags: ["auth", "debug"],
  },
  {
    slug: "password",
    name: "Password Generator",
    summary:
      "Cryptographically-strong passwords: pick length, letters, numbers, symbols. Live strength bar and entropy estimate.",
    category: "security",
    icon: "lock",
    tags: ["auth", "generate"],
  },
];
