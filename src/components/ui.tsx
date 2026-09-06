import { useEffect, useRef, useState, type ReactNode } from "react";
import { initialsOf, tintFor } from "../lib/format";
import { IconX } from "./Icons";

/* -------------------------------- monogram -------------------------------- */

export function Monogram({ name, size = 40, ring = false }: { name: string; size?: number; ring?: boolean }) {
  const t = tintFor(name);
  return (
    <div
      className={`grid shrink-0 place-items-center rounded-full font-grotesk font-semibold ${ring ? "ring-2 ring-line" : ""}`}
      style={{
        width: size, height: size,
        background: t.bg, color: t.fg,
        fontSize: size * 0.34,
        letterSpacing: "0.02em",
      }}
    >
      {initialsOf(name)}
    </div>
  );
}

/* ------------------------------ score gauge ------------------------------ */

export function scoreBand(score: number) {
  if (score >= 750) return { label: "Excellent", color: "#c3f24d" };
  if (score >= 700) return { label: "Good", color: "#57e0a8" };
  if (score >= 650) return { label: "Fair", color: "#ffd166" };
  return { label: "Needs work", color: "#ff7a7a" };
}

export function ScoreGauge({ score }: { score: number | null }) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    setProgress(0);
    if (score == null) return;
    const t = setTimeout(() => setProgress((score - 300) / 600), 60);
    return () => clearTimeout(t);
  }, [score]);

  if (score == null) {
    return (
      <div className="grid h-[176px] place-items-center">
        <div className="text-center">
          <div className="font-grotesk text-4xl font-bold text-fog">NH</div>
          <p className="mt-2 max-w-[150px] text-xs leading-relaxed text-fog">
            No credit history — bureau has no tradelines on file.
          </p>
        </div>
      </div>
    );
  }

  const band = scoreBand(score);
  const R = 74;
  const C = 2 * Math.PI * R;
  const ARC = 0.75; // 270° arc
  const dash = C * ARC * progress;

  return (
    <div className="relative grid h-[176px] place-items-center">
      <svg width="176" height="176" viewBox="0 0 176 176" className="-rotate-[225deg]">
        <circle cx="88" cy="88" r={R} fill="none" stroke="#1d2c49" strokeWidth="13"
          strokeDasharray={`${C * ARC} ${C}`} strokeLinecap="round" />
        <circle cx="88" cy="88" r={R} fill="none" stroke={band.color} strokeWidth="13"
          strokeDasharray={`${dash} ${C}`} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1.1s cubic-bezier(0.22,1,0.36,1), stroke 0.4s", filter: `drop-shadow(0 0 10px ${band.color}55)` }} />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className="tnum font-grotesk text-[42px] font-bold leading-none" style={{ color: band.color }}>
            {score}
          </div>
          <div className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-fog">
            {band.label}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ mini meters ------------------------------ */

export function Meter({ pct, color }: { pct: number; color: string }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    setW(0);
    const t = setTimeout(() => setW(Math.min(100, Math.max(4, pct))), 80);
    return () => clearTimeout(t);
  }, [pct]);
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-card2">
      <div className="h-full rounded-full" style={{ width: `${w}%`, background: color, transition: "width 0.9s cubic-bezier(0.22,1,0.36,1)" }} />
    </div>
  );
}

export function BarChart({ values, labels, peakClass }: { values: number[]; labels: string[]; peakClass?: string }) {
  const max = Math.max(...values, 1);
  const peakIdx = values.indexOf(Math.max(...values));
  return (
    <div className="flex h-24 items-end gap-1.5">
      {values.map((v, i) => {
        const isPeak = i === peakIdx;
        return (
          <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
            <div className="flex h-[72px] w-full items-end rounded-md">
              <div
                className={`bar-grow w-full rounded-md ${isPeak ? (peakClass ?? "bg-lime") : "bg-card2"}`}
                style={{
                  height: `${Math.max(8, (v / max) * 100)}%`,
                  animationDelay: `${i * 55}ms`,
                  boxShadow: isPeak ? "0 0 14px rgba(195,242,77,0.35)" : undefined,
                }}
              />
            </div>
            <span className={`text-[10px] font-semibold ${isPeak ? "text-lime" : "text-fog"}`}>{labels[i]}</span>
          </div>
        );
      })}
    </div>
  );
}

export function CategoryBars({ items }: { items: { label: string; value: number; tint: string; text: string }[] }) {
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <div className="space-y-2.5">
      {items.map((it, i) => (
        <div key={it.label} className="flex items-center gap-3">
          <span className="w-20 shrink-0 text-[11px] font-medium text-fog">{it.label}</span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink/60">
            <div
              className="bar-grow h-full rounded-full"
              style={{
                width: `${Math.max(5, (it.value / max) * 100)}%`,
                background: it.text,
                animationDelay: `${i * 70}ms`,
                transformOrigin: "left",
                opacity: 0.9,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/* --------------------------------- reveal --------------------------------- */

export function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.classList.add("is-in");
          io.disconnect();
        }
      },
      { threshold: 0.08 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

/* ------------------------------ count up ------------------------------ */

export function useCountUp(target: number, duration = 700): number {
  const [val, setVal] = useState(target);
  const fromRef = useRef(target);
  useEffect(() => {
    const from = fromRef.current;
    if (from === target) return;
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const e = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(from + (target - from) * e));
      if (p < 1) raf = requestAnimationFrame(tick);
      else fromRef.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val;
}

/* --------------------------------- toasts --------------------------------- */

export interface Toast {
  id: number;
  msg: string;
  kind: "ok" | "warn";
}

export function ToastHost({ toasts, dismiss }: { toasts: Toast[]; dismiss: (id: number) => void }) {
  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-50 flex w-[300px] flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="toast-in pointer-events-auto flex items-center gap-3 rounded-2xl border border-line bg-card px-4 py-3 shadow-[0_12px_40px_rgba(0,0,0,0.45)]"
        >
          <span
            className="pulse-dot h-2 w-2 shrink-0 rounded-full"
            style={{ background: t.kind === "ok" ? "#57e0a8" : "#ffd166" }}
          />
          <p className="flex-1 text-[13px] font-medium leading-snug text-snow">{t.msg}</p>
          <button
            onClick={() => dismiss(t.id)}
            className="rounded-lg p-1 text-fog transition hover:bg-card2 hover:text-snow"
            aria-label="Dismiss"
          >
            <IconX size={13} />
          </button>
        </div>
      ))}
    </div>
  );
}

/* -------------------------------- empty doc -------------------------------- */

export function EmptyDoc({ title, note }: { title: string; note: string }) {
  return (
    <div className="fade-up grid place-items-center rounded-3xl border border-dashed border-line bg-card/40 px-8 py-20 text-center">
      <div className="max-w-[340px]">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-card2 text-fog">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5z" />
            <path d="M9.5 12.5l5 3M14.5 12.5l-5 3" strokeLinecap="round" />
          </svg>
        </div>
        <h3 className="mt-4 font-grotesk text-lg font-semibold text-snow">{title}</h3>
        <p className="mt-1.5 text-[13px] leading-relaxed text-fog">{note}</p>
      </div>
    </div>
  );
}
