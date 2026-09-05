import { CITIES } from "../lib/data";
import type { Household } from "../lib/generator";
import { inr } from "../lib/format";
import { BarChart, Monogram, Reveal, useCountUp } from "./ui";
import { IconDice, IconMinus, IconPlus, IconSpark, IconPin, IconWallet } from "./Icons";

interface Props {
  size: number;
  setSize: (n: number) => void;
  seed: number;
  setSeed: (n: number) => void;
  cityPref: string;
  setCityPref: (c: string) => void;
  onGenerate: () => void;
  generating: boolean;
  household: Household | null;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const DAY_LETTERS = ["M", "T", "W", "T", "F", "S", "S"];

export default function GeneratorPanel(p: Props) {
  const { household: hh } = p;
  const net = useCountUp(hh?.net ?? 0);
  const income = useCountUp(hh?.monthlyIncome ?? 0);
  const expense = useCountUp(hh?.monthlyExpense ?? 0);

  return (
    <div className="space-y-5">
      {/* ------------------------------ fabricator ------------------------------ */}
      <Reveal>
        <section className="rounded-3xl border border-line bg-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-grotesk text-[15px] font-semibold text-snow">Fabricator</h2>
            <span className="rounded-full bg-card2 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-fog">
              Synthetic
            </span>
          </div>

          {/* family size */}
          <div className="mt-5">
            <label className="text-[11px] font-semibold uppercase tracking-[0.12em] text-fog">
              People in household
            </label>
            <div className="mt-2 flex items-center gap-2">
              <button
                onClick={() => p.setSize(Math.max(1, p.size - 1))}
                disabled={p.size <= 1}
                className="grid h-11 w-11 place-items-center rounded-xl border border-line bg-card2 text-snow transition hover:border-lime/40 hover:text-lime active:scale-95 disabled:cursor-not-allowed disabled:opacity-35"
                aria-label="Fewer people"
              >
                <IconMinus />
              </button>
              <div className="relative flex h-11 flex-1 items-center justify-center rounded-xl border border-line bg-ink/50">
                <span className="tnum font-grotesk text-xl font-bold text-snow">{p.size}</span>
                <span className="ml-2 text-[11px] text-fog">{p.size === 1 ? "person" : "people"}</span>
              </div>
              <button
                onClick={() => p.setSize(Math.min(10, p.size + 1))}
                disabled={p.size >= 10}
                className="grid h-11 w-11 place-items-center rounded-xl border border-line bg-card2 text-snow transition hover:border-lime/40 hover:text-lime active:scale-95 disabled:cursor-not-allowed disabled:opacity-35"
                aria-label="More people"
              >
                <IconPlus />
              </button>
            </div>
            <div className="mt-2 flex gap-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <button
                  key={n}
                  onClick={() => p.setSize(n)}
                  className={`tnum h-1.5 flex-1 rounded-full transition-all ${
                    p.size >= n ? "bg-lime" : "bg-card2 hover:bg-fog/30"
                  }`}
                  aria-label={`${n} people`}
                />
              ))}
            </div>
          </div>

          {/* seed */}
          <div className="mt-5">
            <label className="text-[11px] font-semibold uppercase tracking-[0.12em] text-fog">
              Seed <span className="normal-case tracking-normal text-fog/70">· same seed, same family</span>
            </label>
            <div className="mt-2 flex items-center gap-2">
              <input
                type="number"
                value={p.seed}
                onChange={(e) => p.setSeed(Math.abs(parseInt(e.target.value || "0", 10)) || 1)}
                className="tnum h-11 w-full rounded-xl border border-line bg-ink/50 px-3 font-grotesk text-sm font-semibold text-snow outline-none transition focus:border-lime/50"
              />
              <button
                onClick={() => p.setSeed(Math.floor(Math.random() * 899999) + 100000)}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-line bg-card2 text-mint transition hover:rotate-12 hover:border-mint/40 active:scale-95"
                title="Randomize seed"
              >
                <IconDice />
              </button>
            </div>
          </div>

          {/* city */}
          <div className="mt-5">
            <label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-fog">
              <IconPin size={12} /> Base city
            </label>
            <select
              value={p.cityPref}
              onChange={(e) => p.setCityPref(e.target.value)}
              className="mt-2 h-11 w-full appearance-none rounded-xl border border-line bg-ink/50 px-3 text-sm font-medium text-snow outline-none transition focus:border-lime/50"
            >
              <option value="auto">Anywhere in India (random)</option>
              {CITIES.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name} · {c.state}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={p.onGenerate}
            disabled={p.generating}
            className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-lime font-grotesk text-[15px] font-bold text-ink shadow-[0_8px_30px_rgba(195,242,77,0.22)] transition hover:brightness-110 hover:shadow-[0_8px_38px_rgba(195,242,77,0.35)] active:scale-[0.98] disabled:opacity-70"
          >
            {p.generating ? (
              <>
                <span className="pulse-dot inline-block h-2 w-2 rounded-full bg-ink" />
                Fabricating…
              </>
            ) : (
              <>
                <IconSpark size={17} />
                {hh ? "Re-forge household" : "Generate household"}
              </>
            )}
          </button>
        </section>
      </Reveal>

      {/* ------------------------------ household hero ------------------------------ */}
      {hh && !p.generating && (
        <Reveal delay={80}>
          <section className="relative overflow-hidden rounded-3xl border border-white/10 p-5"
            style={{ background: "linear-gradient(135deg,#1c3a2f 0%,#16324a 55%,#14213b 100%)" }}>
            <div className="pointer-events-none absolute -right-10 -top-14 h-44 w-44 rounded-full bg-mint/25 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-10 h-44 w-44 rounded-full bg-lime/20 blur-3xl" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-snow/60">
                  {hh.familyName} household
                </span>
                <span className="flex items-center gap-1 rounded-full bg-lime/15 px-2 py-0.5 text-[11px] font-semibold text-lime">
                  <IconPin size={11} /> {hh.city.name}
                </span>
              </div>

              <p className="mt-4 text-[11px] font-medium uppercase tracking-[0.12em] text-snow/60">
                Net monthly cashflow
              </p>
              <div className="flex items-end gap-2">
                <span className="tnum font-grotesk text-[34px] font-bold leading-none text-snow">
                  {inr(net)}
                </span>
                <span className={`mb-1 flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                  hh.net >= 0 ? "bg-mint/15 text-mint" : "bg-coral/15 text-coral"
                }`}>
                  {hh.net >= 0 ? "▲" : "▼"} surplus
                </span>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                {[
                  { l: "Income", v: income, c: "text-mint" },
                  { l: "Spent", v: expense, c: "text-snow" },
                  { l: "EMIs", v: hh.monthlyEmi, c: "text-coral" },
                ].map((s) => (
                  <div key={s.l} className="rounded-2xl border border-white/5 bg-ink/25 px-3 py-2.5">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-snow/50">{s.l}</p>
                    <p className={`tnum mt-0.5 font-grotesk text-[13px] font-bold ${s.c}`}>{inr(s.v)}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-snow/60">
                    Spending by weekday
                  </p>
                  <span className="tnum text-[11px] font-semibold text-mint">
                    {inr(hh.weeklySpend.reduce((a, b) => a + b, 0))}/wk
                  </span>
                </div>
                <BarChart values={hh.weeklySpend} labels={DAY_LETTERS} />
              </div>
            </div>
          </section>
        </Reveal>
      )}

      {/* ------------------------------ roster ------------------------------ */}
      {hh && !p.generating && (
        <Reveal delay={140}>
          <section className="rounded-3xl border border-line bg-card p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-grotesk text-[15px] font-semibold text-snow">Family roster</h2>
              <span className="tnum text-[11px] font-semibold text-fog">{hh.members.length} members</span>
            </div>
            <div className="mt-3 space-y-1.5">
              {hh.members.map((m) => {
                const active = m.id === p.selectedId;
                return (
                  <button
                    key={m.id}
                    onClick={() => p.onSelect(m.id)}
                    className={`group flex w-full items-center gap-3 rounded-2xl border p-2.5 text-left transition ${
                      active
                        ? "border-lime/40 bg-card2 shadow-[0_0_0_1px_rgba(195,242,77,0.15)]"
                        : "border-transparent hover:border-line hover:bg-card2/60"
                    }`}
                  >
                    <Monogram name={m.name} size={38} />
                    <div className="min-w-0 flex-1">
                      <p className={`truncate font-grotesk text-[13.5px] font-semibold ${active ? "text-lime" : "text-snow"}`}>
                        {m.name}
                      </p>
                      <p className="truncate text-[11px] text-fog">
                        {m.age} yrs · {m.gender} · {m.employment.title}
                      </p>
                    </div>
                    <div className="text-right">
                      {m.monthlyIncome > 0 ? (
                        <p className="tnum font-grotesk text-[12.5px] font-bold text-mint">
                          +{inr(m.monthlyIncome)}
                        </p>
                      ) : (
                        <p className="text-[11px] text-fog">dependent</p>
                      )}
                      <div className="mt-0.5 flex justify-end gap-1">
                        {m.card && (
                          <span className="rounded bg-sky-400/10 px-1 text-[9px] font-bold uppercase text-[#7dbeff]">card</span>
                        )}
                        {m.loan && (
                          <span className="rounded bg-coral/10 px-1 text-[9px] font-bold uppercase text-coral">loan</span>
                        )}
                        {m.cibil != null && (
                          <span className="tnum rounded bg-lime/10 px-1 text-[9px] font-bold text-lime">{m.cibil}</span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="mt-3 flex items-center gap-1.5 text-[11px] text-fog">
              <IconWallet size={13} className="text-mint" />
              Select a member to open their documents.
            </p>
          </section>
        </Reveal>
      )}
    </div>
  );
}
