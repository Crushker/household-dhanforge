import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { generateHousehold, type Household } from "./lib/generator";
import { DOC_LIST, docAvailable, exportDoc, exportAllXLSX, type DocId } from "./lib/exports";
import { inr } from "./lib/format";
import GeneratorPanel from "./components/GeneratorPanel";
import { CibilDoc, BankDoc, CardDoc, LoanDoc, Form16Doc, ItrDoc } from "./components/documents";
import { Monogram, Reveal, ToastHost, type Toast } from "./components/ui";
import {
  IconRupee, IconGauge, IconBank, IconCard, IconLoan, IconForm16, IconCheckFile,
  IconDownload, IconFileText, IconSheet, IconShield, IconUsers, IconSpark, IconTrendUp,
} from "./components/Icons";

const LS_KEY = "dhanforge:v1";

interface Persisted {
  size: number;
  seed: number;
  cityPref: string;
  household: Household | null;
  selectedId: string | null;
}

function loadPersisted(): Persisted {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const p = JSON.parse(raw) as Persisted;
      if (p && Array.isArray(p.household?.members)) return p;
    }
  } catch {
    /* corrupted storage — start fresh */
  }
  return {
    size: 4,
    seed: Math.floor(Math.random() * 899999) + 100000,
    cityPref: "auto",
    household: null,
    selectedId: null,
  };
}

const TAB_ICONS: Record<DocId, (p: { size?: number }) => JSX.Element> = {
  cibil: (p) => <IconGauge {...p} />,
  bank: (p) => <IconBank {...p} />,
  card: (p) => <IconCard {...p} />,
  loan: (p) => <IconLoan {...p} />,
  form16: (p) => <IconForm16 {...p} />,
  itr: (p) => <IconCheckFile {...p} />,
};

export default function App() {
  const init = useRef(loadPersisted()).current;
  const [size, setSize] = useState(init.size);
  const [seed, setSeed] = useState(init.seed);
  const [cityPref, setCityPref] = useState(init.cityPref);
  const [household, setHousehold] = useState<Household | null>(init.household);
  const [selectedId, setSelectedId] = useState<string | null>(init.selectedId);
  const [tab, setTab] = useState<DocId>("cibil");
  const [generating, setGenerating] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastSeq = useRef(0);

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({ size, seed, cityPref, household, selectedId }));
    } catch {
      /* storage full — ignore */
    }
  }, [size, seed, cityPref, household, selectedId]);

  const pushToast = useCallback((msg: string, kind: Toast["kind"] = "ok") => {
    const id = ++toastSeq.current;
    setToasts((t) => [...t.slice(-2), { id, msg, kind }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  const fabricate = useCallback(
    (people = size, s = seed, city = cityPref, silent = false) => {
      setGenerating(true);
      window.setTimeout(() => {
        const hh = generateHousehold(people, s, city);
        setHousehold(hh);
        setSelectedId(hh.members[0].id);
        setTab("cibil");
        setGenerating(false);
        if (!silent) pushToast(`Fabricated the ${hh.familyName} family — ${hh.members.length} members, ${hh.city.name}`);
      }, 560);
    },
    [size, seed, cityPref, pushToast],
  );

  const member = useMemo(
    () => household?.members.find((m) => m.id === selectedId) ?? household?.members[0] ?? null,
    [household, selectedId],
  );

  const handleExport = (kind: "pdf" | "xlsx" | "doc", docId: DocId) => {
    if (!household || !member) return;
    const label = DOC_LIST.find((d) => d.id === docId)?.label ?? docId;
    try {
      exportDoc(kind, docId, household, member);
      const ext = kind === "pdf" ? "PDF" : kind === "xlsx" ? "Excel workbook" : "Word document";
      pushToast(`${ext} downloaded — ${member.name.split(" ")[0]}'s ${label}`);
    } catch {
      pushToast(`That ${label} isn't available for ${member.name.split(" ")[0]} — try another member or format`, "warn");
    }
  };

  const handleExportAll = () => {
    if (!household) return;
    try {
      exportAllXLSX(household);
      pushToast(`Full ${household.familyName} household workbook downloaded`);
    } catch {
      pushToast("Export failed — please try again", "warn");
    }
  };

  const presets: { label: string; n: number }[] = [
    { label: "Solo earner", n: 1 },
    { label: "Couple", n: 2 },
    { label: "Family of 4", n: 4 },
    { label: "Joint family · 7", n: 7 },
  ];

  return (
    <div className="relative min-h-screen bg-ink text-snow">
      {/* ambient background */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div
          className="absolute inset-0 opacity-[0.55]"
          style={{ backgroundImage: "radial-gradient(rgba(242,246,255,0.05) 1px, transparent 1px)", backgroundSize: "28px 28px" }}
        />
        <div className="absolute -top-32 left-[8%] h-[420px] w-[420px] rounded-full bg-lime/[0.06] blur-[110px]" />
        <div className="absolute right-[-6%] top-[24%] h-[460px] w-[460px] rounded-full bg-mint/[0.07] blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[30%] h-[380px] w-[380px] rounded-full bg-[#16324a]/60 blur-[110px]" />
      </div>

      {/* ------------------------------- top bar ------------------------------- */}
      <header className="sticky top-0 z-40 border-b border-line bg-ink/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-lime text-ink shadow-[0_4px_18px_rgba(195,242,77,0.35)]">
              <IconRupee size={19} />
            </div>
            <div className="leading-tight">
              <p className="font-grotesk text-[16px] font-bold tracking-tight text-snow">DhanForge</p>
              <p className="text-[9.5px] font-semibold uppercase tracking-[0.18em] text-fog">Synthetic finance lab</p>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {household && (
              <span className="tnum hidden rounded-full border border-line bg-card px-3 py-1.5 text-[11px] font-semibold text-fog sm:block">
                seed <span className="text-mint">#{household.seed}</span> · {household.city.name}
              </span>
            )}
            <span className="hidden items-center gap-1.5 rounded-full border border-mint/25 bg-mint/[0.07] px-3 py-1.5 text-[11px] font-semibold text-mint md:flex">
              <IconShield size={13} /> 100% synthetic
            </span>
            <button
              onClick={handleExportAll}
              disabled={!household}
              className="flex h-9 items-center gap-2 rounded-xl border border-lime/35 bg-lime/[0.08] px-3.5 font-grotesk text-[12.5px] font-bold text-lime transition hover:bg-lime/[0.16] active:scale-95 disabled:cursor-not-allowed disabled:opacity-35"
            >
              <IconSheet size={15} />
              <span className="hidden sm:inline">Household XLSX</span>
            </button>
          </div>
        </div>
      </header>

      {/* --------------------------------- main --------------------------------- */}
      <main className="relative z-10 mx-auto grid max-w-[1440px] gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[352px_minmax(0,1fr)]">
        {/* left rail */}
        <div className="lg:sticky lg:top-[84px] lg:self-start">
          <GeneratorPanel
            size={size} setSize={setSize}
            seed={seed} setSeed={setSeed}
            cityPref={cityPref} setCityPref={setCityPref}
            onGenerate={() => fabricate()}
            generating={generating}
            household={household}
            selectedId={member?.id ?? null}
            onSelect={setSelectedId}
          />
        </div>

        {/* right column */}
        <div className="min-w-0 space-y-5">
          {!household && !generating && (
            <Reveal>
              <section className="relative overflow-hidden rounded-[28px] border border-line bg-card p-7 sm:p-10">
                <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-lime/[0.07] blur-3xl" />
                <div className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-mint/[0.08] blur-3xl" />
                <div className="relative grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
                  <div>
                    <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-lime">
                      <IconUsers size={14} /> Household fabricator
                    </p>
                    <h1 className="mt-3 font-grotesk text-[34px] font-bold leading-[1.06] tracking-tight sm:text-[44px]">
                      Forge a middle-class
                      <br />
                      Indian family's
                      <br />
                      <span className="text-lime">entire paper trail.</span>
                    </h1>
                    <p className="mt-4 max-w-[460px] text-[14px] leading-relaxed text-fog">
                      Dial in a headcount and DhanForge fabricates names, jobs, salaries, spends, EMIs and
                      credit behaviour — then renders the documents a lender would actually ask for,
                      ready to export as <span className="font-semibold text-snow">PDF, Excel or Word</span>.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-2">
                      {DOC_LIST.map((d) => (
                        <span key={d.id} className="flex items-center gap-1.5 rounded-full border border-line bg-card2/70 px-3 py-1.5 text-[11.5px] font-semibold text-snow/80">
                          <span className="text-lime">{TAB_ICONS[d.id]({ size: 13 })}</span>
                          {d.label}
                        </span>
                      ))}
                    </div>
                    <div className="mt-8">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-fog">Quick start</p>
                      <div className="mt-2.5 flex flex-wrap gap-2">
                        {presets.map((p) => (
                          <button
                            key={p.n}
                            onClick={() => { setSize(p.n); fabricate(p.n); }}
                            className="group flex items-center gap-2 rounded-2xl border border-line bg-card2/70 px-4 py-2.5 text-[13px] font-semibold text-snow transition hover:-translate-y-0.5 hover:border-lime/40 hover:text-lime active:scale-95"
                          >
                            <span className="tnum font-grotesk text-lime">{p.n}</span>
                            {p.label.replace(/·.*|of.*|\d+/g, "").trim() || "members"}
                            <IconSpark size={13} className="opacity-0 transition group-hover:opacity-100" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* decorative document stack */}
                  <div className="relative hidden h-[330px] lg:block" aria-hidden>
                    <div className="float-soft absolute left-2 top-6 w-52 rotate-[-7deg] rounded-2xl border border-line bg-card2/90 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.4)]">
                      <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-fog">CIBIL</p>
                      <p className="tnum mt-1 font-grotesk text-3xl font-bold text-mint">782</p>
                      <div className="mt-2 h-1.5 w-full rounded-full bg-ink"><div className="h-full w-[84%] rounded-full bg-mint" /></div>
                      <p className="mt-2 text-[9.5px] text-fog">Excellent · 0 missed EMIs</p>
                    </div>
                    <div className="float-soft absolute right-0 top-24 w-56 rotate-[5deg] rounded-2xl border border-line bg-card2/90 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.4)]" style={{ animationDelay: "1.2s" }}>
                      <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-fog">Bank statement</p>
                      {[
                        ["NEFT CR · SALARY", "+", "text-mint"],
                        ["UPI DR · DMart", "−", "text-snow"],
                        ["ECS DR · HOME EMI", "−", "text-snow"],
                        ["AUTOPAY · SIP", "−", "text-snow"],
                      ].map(([n, s, c]) => (
                        <div key={n as string} className="mt-1.5 flex items-center justify-between text-[10px]">
                          <span className="text-snow/75">{n}</span>
                          <span className={`tnum font-grotesk font-bold ${c}`}>{s} ₹{s === "+" ? "62,400" : "····"}</span>
                        </div>
                      ))}
                    </div>
                    <div className="float-soft absolute bottom-2 left-10 w-48 rotate-[-3deg] rounded-2xl border border-lime/25 bg-card2/90 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.4)]" style={{ animationDelay: "2.1s" }}>
                      <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-lime">Form 16 · AY 2025-26</p>
                      <p className="tnum mt-1 font-grotesk text-lg font-bold text-snow">₹9,48,200</p>
                      <p className="text-[9.5px] text-fog">Gross · TDS ₹74,880 · 80C maxed</p>
                    </div>
                  </div>
                </div>
              </section>
            </Reveal>
          )}

          {generating && (
            <div className="space-y-5">
              <div className="skeleton h-14 rounded-2xl" />
              <div className="skeleton h-[420px] rounded-[26px]" />
              <p className="flex items-center justify-center gap-2 text-[12.5px] font-medium text-fog">
                <span className="pulse-dot h-2 w-2 rounded-full bg-lime" />
                Assigning names, salaries, EMIs and credit histories…
              </p>
            </div>
          )}

          {household && member && !generating && (
            <>
              {/* member selector */}
              <Reveal>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  <span className="shrink-0 text-[11px] font-bold uppercase tracking-[0.14em] text-fog">Member</span>
                  {household.members.map((m) => {
                    const active = m.id === member.id;
                    return (
                      <button
                        key={m.id}
                        onClick={() => setSelectedId(m.id)}
                        className={`flex shrink-0 items-center gap-2 rounded-full border py-1 pl-1 pr-3.5 transition ${
                          active
                            ? "border-lime/50 bg-lime/[0.1] shadow-[0_0_16px_rgba(195,242,77,0.15)]"
                            : "border-line bg-card hover:border-fog/40"
                        }`}
                      >
                        <Monogram name={m.name} size={26} />
                        <span className={`text-[12.5px] font-semibold ${active ? "text-lime" : "text-snow/85"}`}>
                          {m.name.split(" ")[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </Reveal>

              {/* tabs + export bar */}
              <Reveal delay={60}>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex flex-1 gap-1.5 overflow-x-auto rounded-2xl border border-line bg-card p-1.5">
                    {DOC_LIST.map((d) => {
                      const active = tab === d.id;
                      const avail = docAvailable(d.id, member);
                      return (
                        <button
                          key={d.id}
                          onClick={() => setTab(d.id)}
                          className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-[12px] font-bold transition ${
                            active
                              ? "bg-lime text-ink shadow-[0_4px_16px_rgba(195,242,77,0.3)]"
                              : avail
                                ? "text-fog hover:bg-card2 hover:text-snow"
                                : "text-fog/40 hover:bg-card2/60"
                          }`}
                          title={avail ? d.label : `${d.label} — not applicable for this member`}
                        >
                          {TAB_ICONS[d.id]({ size: 14 })}
                          <span className="hidden md:inline">{d.short}</span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleExport("pdf", tab)}
                      className="flex h-[42px] items-center gap-1.5 rounded-xl bg-lime px-3.5 font-grotesk text-[12.5px] font-bold text-ink transition hover:brightness-110 active:scale-95"
                    >
                      <IconDownload size={14} /> PDF
                    </button>
                    <button
                      onClick={() => handleExport("xlsx", tab)}
                      className="flex h-[42px] items-center gap-1.5 rounded-xl border border-mint/35 bg-mint/[0.07] px-3.5 font-grotesk text-[12.5px] font-bold text-mint transition hover:bg-mint/[0.15] active:scale-95"
                    >
                      <IconSheet size={14} /> Excel
                    </button>
                    <button
                      onClick={() => handleExport("doc", tab)}
                      className="flex h-[42px] items-center gap-1.5 rounded-xl border border-line bg-card px-3.5 font-grotesk text-[12.5px] font-bold text-snow/85 transition hover:border-fog/40 hover:text-snow active:scale-95"
                    >
                      <IconFileText size={14} /> Word
                    </button>
                  </div>
                </div>
              </Reveal>

              {/* document */}
              <Reveal delay={110}>
                <div key={`${member.id}-${tab}`}>
                  {tab === "cibil" && <CibilDoc hh={household} m={member} />}
                  {tab === "bank" && <BankDoc hh={household} m={member} />}
                  {tab === "card" && <CardDoc hh={household} m={member} />}
                  {tab === "loan" && <LoanDoc hh={household} m={member} />}
                  {tab === "form16" && <Form16Doc hh={household} m={member} />}
                  {tab === "itr" && <ItrDoc hh={household} m={member} />}
                </div>
              </Reveal>

              {/* category spend strip */}
              <Reveal delay={150}>
                <section className="rounded-3xl border border-line bg-card p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <IconTrendUp size={16} className="text-mint" />
                      <h3 className="font-grotesk text-[14.5px] font-semibold text-snow">Household spend mix</h3>
                    </div>
                    <span className="text-[11px] text-fog">monthly average · all members · excl. rent & EMIs</span>
                  </div>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                    {household.categorySpend.map((c, i) => (
                      <div key={c.cat} className="fade-up rounded-2xl border border-line bg-ink/30 px-4 py-3" style={{ animationDelay: `${i * 60}ms` }}>
                        <p className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-fog">{catLabel(c.cat)}</p>
                        <p className="tnum mt-1 font-grotesk text-[16px] font-bold text-snow">{inr(c.total)}</p>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-card2">
                          <div
                            className="bar-grow h-full rounded-full"
                            style={{
                              width: `${(c.total / (household.categorySpend[0]?.total || 1)) * 100}%`,
                              background: i === 0 ? "#c3f24d" : "#1d2c49",
                              boxShadow: i === 0 ? "0 0 12px rgba(195,242,77,0.4)" : undefined,
                              animationDelay: `${i * 80}ms`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </Reveal>
            </>
          )}
        </div>
      </main>

      <footer className="relative z-10 border-t border-line py-6">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-2 px-4 text-[11.5px] text-fog sm:px-6">
          <p>
            DhanForge fabricates <span className="font-semibold text-snow">deterministic synthetic data</span> for testing
            lending, KYC and fintech flows — no real persons, accounts or bureau records.
          </p>
          <p className="tnum">same seed ⇒ same family · ₹ figures in INR</p>
        </div>
      </footer>

      <ToastHost toasts={toasts} dismiss={(id) => setToasts((t) => t.filter((x) => x.id !== id))} />
    </div>
  );
}

function catLabel(cat: string): string {
  const map: Record<string, string> = {
    grocery: "Groceries", food: "Food & dining", transport: "Transport & fuel",
    shopping: "Shopping", utilities: "Utilities", mobile: "Recharge", internet: "Broadband",
    health: "Health", education: "Education", entertainment: "Entertainment", sip: "SIP & investing",
    insurance: "Insurance", "card-payment": "Card payments", transfer: "Transfers", other: "Other", income: "Income",
  };
  return map[cat] ?? cat;
}
