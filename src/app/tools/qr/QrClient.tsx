"use client";

import QRCode from "qrcode";
import { useEffect, useMemo, useState } from "react";

type Preset = "text" | "url" | "wifi" | "email";
type ECC = "L" | "M" | "Q" | "H";

interface WifiState {
  ssid: string;
  password: string;
  encryption: "WPA" | "WEP" | "nopass";
  hidden: boolean;
}

interface EmailState {
  to: string;
  subject: string;
  body: string;
}

function wifiPayload(w: WifiState): string {
  const esc = (s: string) => s.replace(/([\\;,":])/g, "\\$1");
  const parts = [
    `WIFI:T:${w.encryption}`,
    `S:${esc(w.ssid)}`,
    w.password && w.encryption !== "nopass" ? `P:${esc(w.password)}` : "",
    w.hidden ? "H:true" : "",
    ";",
  ];
  return parts.filter(Boolean).join(";");
}

function emailPayload(e: EmailState): string {
  const params = new URLSearchParams();
  if (e.subject) params.set("subject", e.subject);
  if (e.body) params.set("body", e.body);
  const qs = params.toString();
  return `mailto:${encodeURIComponent(e.to)}${qs ? `?${qs}` : ""}`;
}

export default function QrClient() {
  const [preset, setPreset] = useState<Preset>("text");
  const [text, setText] = useState("Hello world");
  const [url, setUrl] = useState("https://filipeperdigaosousa.github.io");
  const [wifi, setWifi] = useState<WifiState>({
    ssid: "",
    password: "",
    encryption: "WPA",
    hidden: false,
  });
  const [email, setEmail] = useState<EmailState>({
    to: "",
    subject: "",
    body: "",
  });
  const [ecc, setEcc] = useState<ECC>("M");
  const [size, setSize] = useState(360);
  const [fg, setFg] = useState("#e0e2ed");
  const [bg, setBg] = useState("#10131b");

  const payload = useMemo(() => {
    switch (preset) {
      case "url":
        return url.trim();
      case "wifi":
        return wifi.ssid ? wifiPayload(wifi) : "";
      case "email":
        return email.to ? emailPayload(email) : "";
      default:
        return text;
    }
  }, [preset, text, url, wifi, email]);

  const [pngUrl, setPngUrl] = useState("");
  const [svgMarkup, setSvgMarkup] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    if (!payload) {
      setPngUrl("");
      setSvgMarkup("");
      setError(null);
      return () => {
        alive = false;
      };
    }
    const opts = {
      errorCorrectionLevel: ecc,
      margin: 2,
      width: size,
      color: { dark: fg, light: bg },
    } as const;
    QRCode.toDataURL(payload, opts)
      .then((u) => {
        if (alive) {
          setPngUrl(u);
          setError(null);
        }
      })
      .catch((e) => {
        if (alive) setError(e instanceof Error ? e.message : "QR error");
      });
    QRCode.toString(payload, { ...opts, type: "svg" })
      .then((s) => {
        if (alive) setSvgMarkup(s);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [payload, ecc, size, fg, bg]);

  function download(kind: "png" | "svg") {
    const blob =
      kind === "png"
        ? null
        : new Blob([svgMarkup], { type: "image/svg+xml" });
    const href = kind === "png" ? pngUrl : blob ? URL.createObjectURL(blob) : "";
    if (!href) return;
    const a = document.createElement("a");
    a.href = href;
    a.download = `qr.${kind}`;
    a.click();
    if (kind === "svg") URL.revokeObjectURL(href);
  }

  return (
    <div className="space-y-6">
      <div className="inline-flex rounded-lg border border-white/10 bg-white/5 p-0.5 flex-wrap">
        {(
          [
            ["text", "Text"],
            ["url", "URL"],
            ["wifi", "Wi-Fi"],
            ["email", "Email"],
          ] as [Preset, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setPreset(key)}
            className={`px-3 py-1.5 rounded-md font-mono text-code-sm ${
              preset === key
                ? "bg-primary/20 text-primary"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-gutter">
        <div className="glass-card rounded-xl p-5 space-y-3">
          <p className="font-mono text-label-caps text-secondary uppercase tracking-widest">
            / Content
          </p>
          {preset === "text" ? (
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              className="w-full bg-black/30 border border-white/10 rounded-lg p-3 font-mono text-code-sm text-on-surface focus:outline-none focus:border-primary/50 resize-y"
            />
          ) : preset === "url" ? (
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-black/30 border border-white/10 rounded-lg p-3 font-mono text-code-sm text-primary focus:outline-none focus:border-primary/50"
            />
          ) : preset === "wifi" ? (
            <WifiForm value={wifi} onChange={setWifi} />
          ) : (
            <EmailForm value={email} onChange={setEmail} />
          )}

          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/5">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">
                Error correction
              </p>
              <div className="inline-flex rounded-lg border border-white/10 bg-white/5 p-0.5">
                {(["L", "M", "Q", "H"] as ECC[]).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setEcc(k)}
                    className={`px-2 py-1 rounded-md font-mono text-code-sm ${
                      ecc === k
                        ? "bg-primary/20 text-primary"
                        : "text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    {k}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">
                Size ({size}px)
              </p>
              <input
                type="range"
                min={128}
                max={720}
                step={8}
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>
            <ColorRow label="Foreground" value={fg} onChange={setFg} />
            <ColorRow label="Background" value={bg} onChange={setBg} />
          </div>
        </div>

        <div className="glass-card rounded-xl p-5 flex flex-col items-center justify-center gap-4">
          {error ? (
            <p className="font-mono text-code-sm text-tertiary text-center">
              {error}
            </p>
          ) : pngUrl ? (
            <img
              src={pngUrl}
              alt="QR code"
              className="w-full max-w-[280px] rounded-lg"
            />
          ) : (
            <p className="font-mono text-code-sm text-tertiary text-center">
              Fill in the content.
            </p>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => download("png")}
              disabled={!pngUrl}
              className="px-3 py-2 rounded-lg border border-primary/40 bg-primary/10 text-primary font-mono text-code-sm hover:bg-primary/20 disabled:opacity-40"
            >
              PNG
            </button>
            <button
              type="button"
              onClick={() => download("svg")}
              disabled={!svgMarkup}
              className="px-3 py-2 rounded-lg border border-secondary/40 bg-secondary/10 text-secondary font-mono text-code-sm hover:bg-secondary/20 disabled:opacity-40"
            >
              SVG
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function WifiForm({
  value,
  onChange,
}: {
  value: WifiState;
  onChange: (v: WifiState) => void;
}) {
  return (
    <div className="space-y-2">
      <input
        type="text"
        value={value.ssid}
        onChange={(e) => onChange({ ...value, ssid: e.target.value })}
        placeholder="SSID"
        className="w-full bg-black/30 border border-white/10 rounded-lg p-2 font-mono text-code-sm text-on-surface focus:outline-none focus:border-primary/50"
      />
      <input
        type="text"
        value={value.password}
        onChange={(e) => onChange({ ...value, password: e.target.value })}
        placeholder="Password"
        disabled={value.encryption === "nopass"}
        className="w-full bg-black/30 border border-white/10 rounded-lg p-2 font-mono text-code-sm text-on-surface focus:outline-none focus:border-primary/50 disabled:opacity-40"
      />
      <div className="flex items-center gap-3 flex-wrap">
        <select
          value={value.encryption}
          onChange={(e) =>
            onChange({
              ...value,
              encryption: e.target.value as WifiState["encryption"],
            })
          }
          className="bg-black/30 border border-white/10 rounded p-2 font-mono text-code-sm text-on-surface"
        >
          <option value="WPA">WPA/WPA2</option>
          <option value="WEP">WEP</option>
          <option value="nopass">Open</option>
        </select>
        <label className="inline-flex items-center gap-2 font-mono text-code-sm text-tertiary cursor-pointer">
          <input
            type="checkbox"
            checked={value.hidden}
            onChange={(e) => onChange({ ...value, hidden: e.target.checked })}
            className="accent-primary"
          />
          hidden SSID
        </label>
      </div>
    </div>
  );
}

function EmailForm({
  value,
  onChange,
}: {
  value: EmailState;
  onChange: (v: EmailState) => void;
}) {
  return (
    <div className="space-y-2">
      <input
        type="email"
        value={value.to}
        onChange={(e) => onChange({ ...value, to: e.target.value })}
        placeholder="to@example.com"
        className="w-full bg-black/30 border border-white/10 rounded-lg p-2 font-mono text-code-sm text-primary focus:outline-none focus:border-primary/50"
      />
      <input
        type="text"
        value={value.subject}
        onChange={(e) => onChange({ ...value, subject: e.target.value })}
        placeholder="Subject"
        className="w-full bg-black/30 border border-white/10 rounded-lg p-2 font-mono text-code-sm text-on-surface focus:outline-none focus:border-primary/50"
      />
      <textarea
        value={value.body}
        onChange={(e) => onChange({ ...value, body: e.target.value })}
        placeholder="Body"
        rows={3}
        className="w-full bg-black/30 border border-white/10 rounded-lg p-2 font-mono text-code-sm text-on-surface focus:outline-none focus:border-primary/50 resize-y"
      />
    </div>
  );
}

function ColorRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">
        {label}
      </p>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-9 h-9 rounded-lg cursor-pointer bg-transparent border border-white/10"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-black/30 border border-white/10 rounded p-1.5 font-mono text-code-sm text-on-surface min-w-0"
        />
      </div>
    </div>
  );
}
