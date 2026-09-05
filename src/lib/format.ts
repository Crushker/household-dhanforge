const fmt0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const fmt2 = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const inr = (n: number) => `₹${fmt0.format(Math.round(n))}`;
export const inr2 = (n: number) => `₹${fmt2.format(n)}`;
export const num = (n: number) => fmt0.format(Math.round(n));
export const plain = (n: number) => fmt2.format(n);

export function dateShort(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function monthLabel(d: Date): string {
  return d.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}

export function monthShort(d: Date): string {
  return d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
}

export function addDays(d: Date, days: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

export function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function ageLabel(age: number): string {
  return `${age} yrs`;
}

export function maskAccount(acct: string): string {
  return `XX${acct.slice(-4)}`;
}

export function initialsOf(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}

const AVATAR_TINTS = [
  { bg: "rgba(195,242,77,0.16)", fg: "#c3f24d" },
  { bg: "rgba(87,224,168,0.16)", fg: "#57e0a8" },
  { bg: "rgba(125,190,255,0.16)", fg: "#7dbeff" },
  { bg: "rgba(255,138,196,0.16)", fg: "#ff8ac4" },
  { bg: "rgba(255,209,102,0.16)", fg: "#ffd166" },
  { bg: "rgba(255,166,87,0.16)", fg: "#ffa657" },
];

export function tintFor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_TINTS[h % AVATAR_TINTS.length];
}

export function fyOf(d: Date): { fy: string; ay: string } {
  const y = d.getFullYear();
  const start = d.getMonth() >= 3 ? y : y - 1;
  return { fy: `${start}-${`${start + 1}`.slice(2)}`, ay: `${start + 1}-${`${start + 2}`.slice(2)}` };
}

export function downloadBlob(content: BlobPart, filename: string, mime: string) {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}
