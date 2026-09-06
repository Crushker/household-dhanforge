import { useMemo, useState, type ReactNode } from "react";
import type { Household, Member } from "../lib/generator";
import { CATEGORY_META } from "../lib/data";
import { inr, inr2, plain, dateShort, monthLabel } from "../lib/format";
import { computeItr, scoreBandLabel } from "../lib/exports-doc";
import { EmptyDoc, Meter, Monogram, ScoreGauge } from "./ui";

/* ------------------------------- primitives ------------------------------- */

export function DocShell({
  org, orgColor, title, subtitle, right, member, children,
}: {
  org: string; orgColor: string; title: string; subtitle: string;
  right: ReactNode; member: Member; children: ReactNode;
}) {
  return (
    <article className="fade-up relative overflow-hidden rounded-[26px] border border-line bg-card">
      {/* diagonal synthetic watermark */}
      <div className="watermark pointer-events-none absolute inset-0 z-0" />
      <div className="pointer-events-none absolute inset-0 z-0 grid select-none place-items-center overflow-hidden">
        <span className="-rotate-[24deg] whitespace-nowrap font-grotesk text-[64px] font-bold tracking-[0.2em] text-snow/[0.028]">
          SYNTHETIC · NOT REAL · SYNTHETIC · NOT REAL
        </span>
      </div>

      <header className="relative z-10 flex flex-wrap items-center gap-4 border-b border-line bg-gradient-to-r from-card2/80 to-card px-6 py-5">
        <div
          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl font-grotesk text-sm font-bold"
          style={{ background: `${orgColor}22`, color: orgColor, boxShadow: `inset 0 0 0 1px ${orgColor}44` }}
        >
          {org.split(" ").slice(0, 2).map((w) => w[0]).join("")}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] font-semibold uppercase tracking-[0.13em] text-fog">{org}</p>
          <h2 className="truncate font-grotesk text-lg font-bold text-snow">{title}</h2>
          <p className="truncate text-[12px] text-fog">{subtitle}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          {right}
          <div className="flex items-center gap-2">
            <Monogram name={member.name} size={26} />
            <span className="font-grotesk text-[12.5px] font-semibold text-snow">{member.name}</span>
          </div>
        </div>
      </header>

      <div className="relative z-10 px-6 py-5">{children}</div>
    </article>
  );
}

function KV({ items, cols = 4 }: { items: [string, ReactNode][]; cols?: number }) {
  return (
    <div className={`grid gap-x-6 gap-y-4 rounded-2xl border border-line bg-ink/30 p-4`}
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }}>
      {items.map(([k, v]) => (
        <div key={k} className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-fog">{k}</p>
          <div className="tnum mt-1 truncate font-grotesk text-[13.5px] font-semibold text-snow">{v}</div>
        </div>
      ))}
    </div>
  );
}

function DataTable({ head, rows, aligns, maxH = 380 }: {
  head: string[]; rows: ReactNode[][]; aligns?: ("l" | "r")[]; maxH?: number;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line">
      <div className="overflow-auto" style={{ maxHeight: maxH }}>
        <table className="w-full border-collapse text-[12.5px]">
          <thead className="sticky top-0 z-10">
            <tr className="bg-card2 text-left">
              {head.map((h, i) => (
                <th key={h} className={`whitespace-nowrap px-3.5 py-2.5 text-[10.5px] font-bold uppercase tracking-[0.1em] text-fog ${aligns?.[i] === "r" ? "text-right" : ""}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, ri) => (
              <tr key={ri} className={`border-t border-line/60 transition hover:bg-card2/50 ${ri % 2 ? "bg-ink/20" : ""}`}>
                {r.map((c, ci) => (
                  <td key={ci} className={`whitespace-nowrap px-3.5 py-2.5 ${aligns?.[ci] === "r" ? "tnum text-right font-grotesk font-medium" : "text-snow/90"}`}>
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Amt({ v, signed = false }: { v: number; signed?: boolean }) {
  const credit = v > 0;
  return (
    <span className={credit ? "text-mint" : "text-snow"}>
      {signed ? (credit ? "+" : "−") : ""}{inr2(Math.abs(v))}
    </span>
  );
}

const Chip = ({ children, tone = "lime" }: { children: ReactNode; tone?: "lime" | "mint" | "fog" | "coral" | "gold" }) => {
  const map = {
    lime: "bg-lime/12 text-lime", mint: "bg-mint/12 text-mint", fog: "bg-card2 text-fog",
    coral: "bg-coral/12 text-coral", gold: "bg-gold/12 text-gold",
  };
  return <span className={`rounded-full px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wide ${map[tone]}`}>{children}</span>;
};

/* ---------------------------------- CIBIL ---------------------------------- */

export function CibilDoc({ hh, m }: { hh: Household; m: Member }) {
  const util = m.card ? Math.round((m.card.lastStatementTotal / m.card.limit) * 100) : 0;
  const factors = [
    { f: "Payment history", note: m.cibil && m.cibil >= 700 ? "0 missed EMIs in 36 mo" : "1 late mark (30 days)", pct: m.cibil ? Math.min(100, m.cibil - 560) / 2.4 : 30, color: "#57e0a8" },
    { f: "Credit utilisation", note: m.card ? `${util}% of ₹ limit used` : "No revolving credit", pct: m.card ? 100 - util : 72, color: "#c3f24d" },
    { f: "Credit age", note: `${Math.max(1, Math.min(14, m.age - 21))} years average`, pct: Math.min(100, Math.max(12, m.age - 21) * 8), color: "#7dbeff" },
    { f: "Credit mix", note: m.loan && m.card ? "Secured + revolving" : "Single credit type", pct: m.loan && m.card ? 88 : 48, color: "#ffd166" },
    { f: "Recent enquiries", note: `${m.age % 3} hard pulls in 6 months`, pct: 90 - (m.age % 3) * 22, color: "#ff8ac4" },
  ];

  return (
    <DocShell
      org="TransUnion CIBIL" orgColor="#57e0a8"
      title="Credit Report & Score"
      subtitle={`Bureau reference CBL-${m.accountNo.slice(-8)} · generated ${dateShort(new Date().toISOString())}`}
      right={m.cibil != null ? <Chip tone={m.cibil >= 750 ? "lime" : m.cibil >= 700 ? "mint" : m.cibil >= 650 ? "gold" : "coral"}>{scoreBandLabel(m.cibil)}</Chip> : <Chip tone="fog">No history</Chip>}
      member={m}
    >
      {m.cibil == null ? (
        <EmptyDoc
          title="No credit history (NH)"
          note={m.age < 18
            ? "Minors are not scored by credit bureaus. Documents like bank statements remain available."
            : "This member has no tradelines reported to the bureau yet — a first credit product would create a file."}
        />
      ) : (
        <>
          <div className="grid gap-5 md:grid-cols-[220px_1fr]">
            <div className="grid place-items-center rounded-2xl border border-line bg-ink/30 p-3">
              <ScoreGauge score={m.cibil} />
            </div>
            <div className="space-y-3.5 rounded-2xl border border-line bg-ink/30 p-4">
              {factors.map((f) => (
                <div key={f.f}>
                  <div className="mb-1.5 flex items-baseline justify-between gap-3">
                    <span className="text-[12.5px] font-semibold text-snow">{f.f}</span>
                    <span className="text-[11px] text-fog">{f.note}</span>
                  </div>
                  <Meter pct={f.pct} color={f.color} />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between">
            <h3 className="font-grotesk text-[14px] font-semibold text-snow">Tradelines</h3>
            <span className="text-[11px] text-fog">{m.tradelines.length} account{m.tradelines.length === 1 ? "" : "s"} on record</span>
          </div>
          <div className="mt-2.5">
            {m.tradelines.length === 0 ? (
              <EmptyDoc title="No accounts" note="No credit accounts are reported for this member." />
            ) : (
              <DataTable
                head={["Account", "Institution", "Type", "Amount", "Status", "Open since"]}
                aligns={["l", "l", "l", "r", "l", "r"]}
                rows={m.tradelines.map((t) => [
                  <span key="a" className="font-grotesk font-semibold">{t.account}</span>,
                  t.institution, t.type, inr(t.amount),
                  <Chip key="s" tone={t.status === "CLOSED" ? "fog" : "mint"}>{t.status}</Chip>,
                  dateShort(t.since),
                ])}
              />
            )}
          </div>
          <p className="mt-3 text-[11px] text-fog">
            Score band: 300–900 · Derived from {hh.members.length}-member household repayment behaviour. Synthetic data — not a real bureau report.
          </p>
        </>
      )}
    </DocShell>
  );
}

/* ------------------------------- bank statement ------------------------------- */

export function BankDoc({ hh, m }: { hh: Household; m: Member }) {
  const [monthIdx, setMonthIdx] = useState(-1);
  const monthKeys = useMemo(() => {
    const now = new Date();
    return [2, 1, 0].map((off) => {
      const d = new Date(now.getFullYear(), now.getMonth() - off, 1);
      return `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, "0")}`;
    });
  }, []);
  const txns = monthIdx < 0 ? m.txns : m.txns.filter((t) => t.date.startsWith(monthKeys[monthIdx]));
  const first = txns[0];
  const last = txns[txns.length - 1];
  const opening = first ? first.balance - first.amount : m.openingBalance;
  const cr = txns.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const dr = txns.filter((t) => t.amount < 0).reduce((s, t) => s - t.amount, 0);

  return (
    <DocShell
      org={m.bankName} orgColor="#7dbeff"
      title="Savings Account Statement"
      subtitle={`A/c ${m.accountNo} · ${m.branch} · IFSC ${m.ifsc}`}
      right={<Chip>e-Statement</Chip>}
      member={m}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1.5">
          <button onClick={() => setMonthIdx(-1)}
            className={`rounded-full px-3.5 py-1.5 text-[11.5px] font-semibold transition ${monthIdx === -1 ? "bg-lime text-ink" : "bg-card2 text-fog hover:text-snow"}`}>
            All months
          </button>
          {hh.monthLabels.map((l, i) => (
            <button key={l} onClick={() => setMonthIdx(i)}
              className={`rounded-full px-3.5 py-1.5 text-[11.5px] font-semibold transition ${monthIdx === i ? "bg-lime text-ink" : "bg-card2 text-fog hover:text-snow"}`}>
              {l}
            </button>
          ))}
        </div>
        <div className="tnum text-[11.5px] font-semibold text-fog">
          Opening <span className="text-snow">{inr(opening)}</span> · Closing{" "}
          <span className="text-mint">{inr(last?.balance ?? opening)}</span>
        </div>
      </div>

      <div className="mt-3.5">
        <DataTable
          head={["Date", "Narration", "Reference", "Debit", "Credit", "Balance"]}
          aligns={["l", "l", "l", "r", "r", "r"]}
          maxH={440}
          rows={txns.map((t) => {
            const meta = CATEGORY_META[t.category];
            return [
              dateShort(t.date),
              <span key="n" className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 shrink-0 rounded-full" style={{ background: meta.text }} />
                <span className="max-w-[300px] truncate">{t.narration}</span>
              </span>,
              <span key="r" className="text-fog">{t.ref}</span>,
              t.amount < 0 ? <span key="d" className="text-snow">−{plain(-t.amount)}</span> : <span key="d" className="text-fog/40">—</span>,
              t.amount > 0 ? <span key="c" className="text-mint">+{plain(t.amount)}</span> : <span key="c" className="text-fog/40">—</span>,
              plain(t.balance),
            ];
          })}
        />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2.5">
        {[
          { l: "Total credits", v: cr, c: "text-mint" },
          { l: "Total debits", v: dr, c: "text-snow" },
          { l: "Net movement", v: cr - dr, c: cr - dr >= 0 ? "text-mint" : "text-coral" },
        ].map((s) => (
          <div key={s.l} className="rounded-2xl border border-line bg-ink/30 px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-fog">{s.l}</p>
            <p className={`tnum mt-1 font-grotesk text-[15px] font-bold ${s.c}`}>
              {s.v < 0 ? "−" : ""}{inr(Math.abs(s.v))}
            </p>
          </div>
        ))}
      </div>
    </DocShell>
  );
}

/* ------------------------------ card statement ------------------------------ */

export function CardDoc({ hh, m }: { hh: Household; m: Member }) {
  if (!m.card) {
    return (
      <DocShell org="Card Services" orgColor="#7dbeff" title="Credit Card Statement" subtitle="No card on file" right={<Chip tone="fog">—</Chip>} member={m}>
        <EmptyDoc title="No credit card for this member"
          note="Cards are issued to earning adults in the household. Pick another member from the roster, or re-forge the household to reshuffle products." />
      </DocShell>
    );
  }
  const card = m.card;
  const now = new Date();
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const key = `${prev.getFullYear()}-${`${prev.getMonth() + 1}`.padStart(2, "0")}`;
  const period = card.txns.filter((t) => t.date.startsWith(key));
  const purchases = period.reduce((s, t) => s + t.amount, 0);
  const unpaid = card.txns.filter((t) => !t.date.startsWith(key)).reduce((s, t) => s + t.amount, 0);
  const minDue = Math.round(purchases * 0.05);
  const dueDate = new Date(now.getFullYear(), now.getMonth(), 18);

  return (
    <DocShell
      org={card.bank} orgColor="#ff8ac4"
      title={card.product}
      subtitle={`${card.numberMasked} · statement cycle ${monthLabel(prev)}`}
      right={<Chip tone="mint">{Math.round((purchases / card.limit) * 100)}% utilised</Chip>}
      member={m}
    >
      <div className="grid gap-2.5 sm:grid-cols-3">
        {[
          { l: "Credit limit", v: inr(card.limit), c: "text-snow" },
          { l: "Available credit", v: inr(card.limit - purchases), c: "text-mint" },
          { l: "Reward points", v: `${Math.round(purchases / 100)} pts`, c: "text-lime" },
          { l: "Previous balance", v: inr(0), c: "text-snow" },
          { l: "Purchases this cycle", v: inr(purchases), c: "text-snow" },
          { l: "Finance charge", v: inr(0), c: "text-mint" },
        ].map((s) => (
          <div key={s.l} className="rounded-2xl border border-line bg-ink/30 px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-fog">{s.l}</p>
            <p className={`tnum mt-1 font-grotesk text-[15px] font-bold ${s.c}`}>{s.v}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-lime/20 bg-lime/[0.06] px-4 py-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-fog">Total amount due</p>
          <p className="tnum font-grotesk text-xl font-bold text-snow">{inr(purchases)}</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-fog">Minimum due</p>
          <p className="tnum font-grotesk text-xl font-bold text-gold">{inr(minDue)}</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-fog">Payment due date</p>
          <p className="tnum font-grotesk text-xl font-bold text-coral">{dateShort(dueDate.toISOString())}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <h3 className="font-grotesk text-[14px] font-semibold text-snow">Cycle transactions</h3>
        <span className="text-[11px] text-fog">{period.length} purchases</span>
      </div>
      <div className="mt-2.5">
        <DataTable
          head={["Date", "Particulars", "Category", "Amount (₹)"]}
          aligns={["l", "l", "l", "r"]}
          maxH={360}
          rows={period.map((t) => {
            const meta = CATEGORY_META[t.category];
            return [
              dateShort(t.date),
              t.detail,
              <span key="c" className="rounded-full px-2 py-0.5 text-[10.5px] font-semibold" style={{ background: meta.tint, color: meta.text }}>
                {meta.label}
              </span>,
              plain(t.amount),
            ];
          })}
        />
      </div>
      <p className="mt-3 text-[11px] text-fog">
        Unbilled spend (current cycle): <span className="tnum font-semibold text-snow">{inr(unpaid)}</span> · Payments are auto-debited from the linked {m.bankName} savings account on the 20th. {void hh}
      </p>
    </DocShell>
  );
}

/* -------------------------------- loan statement -------------------------------- */

export function LoanDoc({ hh, m }: { hh: Household; m: Member }) {
  if (!m.loan) {
    return (
      <DocShell org="Loan Services" orgColor="#ffd166" title="Loan Statement" subtitle="No active loan" right={<Chip tone="fog">—</Chip>} member={m}>
        <EmptyDoc title="No active loan for this member"
          note="This member has no sanctioned loan in the current fabric. The primary earner usually carries the household's home or vehicle loan." />
      </DocShell>
    );
  }
  const L = m.loan;
  const paidPct = Math.round((L.paidInstallments / L.tenureMonths) * 100);
  const interestSoFar = L.schedule.slice(0, L.paidInstallments).reduce((s, r) => s + r.interest, 0);

  return (
    <DocShell
      org={L.lender} orgColor="#ffd166"
      title={`${L.type} — Statement of Account`}
      subtitle={`Loan A/c ${L.accountNo} · sanctioned ${dateShort(L.sanctionDate)}`}
      right={<Chip tone="gold">{L.rate}% p.a.</Chip>}
      member={m}
    >
      <div className="grid gap-2.5 sm:grid-cols-4">
        {[
          { l: "Sanctioned principal", v: inr(L.principal), c: "text-snow" },
          { l: "Monthly EMI", v: inr(L.emi), c: "text-snow" },
          { l: "Outstanding principal", v: inr(L.outstanding), c: "text-coral" },
          { l: "Next due date", v: dateShort(L.nextDue), c: "text-gold" },
        ].map((s) => (
          <div key={s.l} className="rounded-2xl border border-line bg-ink/30 px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-fog">{s.l}</p>
            <p className={`tnum mt-1 font-grotesk text-[15px] font-bold ${s.c}`}>{s.v}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-2xl border border-line bg-ink/30 p-4">
        <div className="flex items-baseline justify-between">
          <p className="text-[12px] font-semibold text-snow">
            Repayment progress — <span className="tnum text-lime">{L.paidInstallments}</span> of {L.tenureMonths} EMIs
          </p>
          <p className="tnum text-[11px] text-fog">interest paid {inr(interestSoFar)}</p>
        </div>
        <div className="mt-2.5 h-2.5 overflow-hidden rounded-full bg-card2">
          <div className="bar-grow h-full rounded-full bg-gradient-to-r from-mint to-lime" style={{ width: `${paidPct}%`, animationDelay: "100ms" }} />
        </div>
        <div className="mt-1.5 flex justify-between text-[10.5px] font-semibold text-fog">
          <span>{paidPct}% repaid</span>
          <span>{L.tenureMonths - L.paidInstallments} EMIs remaining</span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <h3 className="font-grotesk text-[14px] font-semibold text-snow">Amortisation schedule</h3>
        <span className="text-[11px] text-fog">EMI {inr(L.emi)} · {L.tenureMonths} months</span>
      </div>
      <div className="mt-2.5">
        <DataTable
          head={["#", "Due date", "EMI", "Principal", "Interest", "Balance"]}
          aligns={["l", "l", "r", "r", "r", "r"]}
          maxH={380}
          rows={L.schedule.map((s) => [
            s.no <= L.paidInstallments ? (
              <span key="n" className="flex items-center gap-1.5 font-grotesk font-semibold text-snow">
                {s.no}
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-mint" />
              </span>
            ) : (
              <span key="n" className="font-grotesk text-fog">{s.no}</span>
            ),
            dateShort(s.date),
            plain(s.emi),
            <span key="p" className="text-snow">{plain(s.principal)}</span>,
            <span key="i" className="text-gold">{plain(s.interest)}</span>,
            <span key="b" className={s.balance === 0 ? "text-mint" : "text-snow"}>{plain(s.balance)}</span>,
          ])}
        />
      </div>
      <p className="mt-3 text-[11px] text-fog">
        {void hh} EMI auto-debits on the 7th from {m.bankName} A/c ••••{m.accountNo.slice(-4)}. Prepayment allowed after 6 EMIs with nil charges on floating rate.
      </p>
    </DocShell>
  );
}

/* ---------------------------------- Form 16 ---------------------------------- */

export function Form16Doc({ hh, m }: { hh: Household; m: Member }) {
  if (!m.form16) {
    return (
      <DocShell org="Income Tax Dept." orgColor="#c3f24d" title="Form 16 — TDS Certificate" subtitle="Not applicable" right={<Chip tone="fog">—</Chip>} member={m}>
        <EmptyDoc
          title={m.employment.kind === "self" ? "Self-employed — no Form 16" : "Not salaried"}
          note={m.employment.kind === "self"
            ? "Form 16 is issued only by salaried employers. This member's taxes are computed in their ITR under presumptive income."
            : m.employment.kind === "pension"
              ? "Pensioners receive Form 16 from the disbursing bank only when TDS applies. No TDS was deducted on this pension."
              : "This member has no salary income this financial year, so no TDS certificate is generated."}
        />
      </DocShell>
    );
  }
  const f = m.form16;
  const rows: [string, string, boolean][] = [
    ["Gross salary u/s 17(1)", inr2(f.gross), false],
    ["— Basic salary", inr2(f.basic), false],
    ["— House rent allowance", inr2(f.hra), false],
    ["— Special allowance", inr2(f.special), false],
    ["Less: Standard deduction u/s 16(ia)", `(${inr2(f.stdDeduction)})`, true],
    ["Less: HRA exempt u/s 10(13A)", `(${inr2(f.hraExempt)})`, true],
    ["Less: Employee EPF contribution", `(${inr2(f.epfEmployee)})`, true],
    ["Less: Deduction u/s 80C (LIC, ELSS, EPF)", `(${inr2(f.c80)})`, true],
    ["Less: Health insurance u/s 80D", `(${inr2(f.d80)})`, true],
    ["Income from other sources (interest)", inr2(f.otherIncome), false],
  ];

  return (
    <DocShell
      org={f.employer} orgColor="#c3f24d"
      title={`Form 16 · ${f.ay}`}
      subtitle={`Certificate under section 203 of the Income-tax Act, 1961 · ${f.fy}`}
      right={<Chip>TDS ₹{Math.round(f.totalTax / 1000)}k</Chip>}
      member={m}
    >
      <div className="grid gap-2.5 sm:grid-cols-2">
        <div className="rounded-2xl border border-line bg-ink/30 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-lime">Part A — Employer & employee</p>
          <dl className="mt-3 space-y-2.5 text-[12.5px]">
            {[
              ["Employer", f.employer], ["Employer TAN", f.tan],
              ["Employee", m.name], ["Employee PAN", m.pan ?? "—"],
              ["Designation", m.employment.title], ["Assessment year", f.ay],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4">
                <dt className="text-fog">{k}</dt>
                <dd className="tnum font-grotesk font-semibold text-snow">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="rounded-2xl border border-line bg-ink/30 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-lime">Tax summary</p>
          <dl className="mt-3 space-y-2.5 text-[12.5px]">
            {[
              ["Gross total income", inr2(f.gross + f.otherIncome)],
              ["Net taxable income", inr2(f.taxable)],
              ["Income tax", inr2(f.tax)],
              ["Health & education cess (4%)", inr2(f.cess)],
              ["Total tax deducted", inr2(f.totalTax)],
              ["Average monthly TDS", inr2(f.tdsMonthly)],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4">
                <dt className="text-fog">{k}</dt>
                <dd className="tnum font-grotesk font-semibold text-snow">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="mt-4">
        <h3 className="mb-2.5 font-grotesk text-[14px] font-semibold text-snow">Part B — Computation of income</h3>
        <div className="overflow-hidden rounded-2xl border border-line">
          {rows.map(([k, v, dim], i) => (
            <div key={k} className={`flex items-center justify-between px-4 py-2.5 text-[12.5px] ${i % 2 ? "bg-ink/20" : ""} ${dim ? "text-fog" : "text-snow/90"}`}>
              <span className={k.startsWith("—") ? "pl-4" : ""}>{k}</span>
              <span className="tnum font-grotesk font-semibold text-snow">{v}</span>
            </div>
          ))}
          <div className="flex items-center justify-between border-t border-lime/25 bg-lime/[0.07] px-4 py-3 text-[13px]">
            <span className="font-bold text-snow">Net taxable income</span>
            <span className="tnum font-grotesk text-[15px] font-bold text-lime">{inr2(f.taxable)}</span>
          </div>
        </div>
      </div>
      <p className="mt-3 text-[11px] text-fog">
        {void hh} TDS deposited to the government on the 7th of each month · challan traces available on TRACES. Synthetic certificate — not valid for filing.
      </p>
    </DocShell>
  );
}

/* ------------------------------------ ITR ------------------------------------ */

export function ItrDoc({ hh, m }: { hh: Household; m: Member }) {
  if (m.age < 18 || m.employment.monthlyGross <= 0) {
    return (
      <DocShell org="Income Tax Dept." orgColor="#57e0a8" title="ITR-1 (Sahaj) Acknowledgement" subtitle="Not applicable" right={<Chip tone="fog">—</Chip>} member={m}>
        <EmptyDoc title="No return filed for this member"
          note="Income-tax returns are generated only for adult members with assessable income in the household fabric." />
      </DocShell>
    );
  }
  const t = computeItr(m);
  const hasRefund = t.refund > 0;

  return (
    <DocShell
      org="Income Tax Department" orgColor="#57e0a8"
      title={`ITR-1 (Sahaj) — ${t.ay}`}
      subtitle={`Acknowledgement ${t.ack} · e-filed with Aadhaar OTP on ${dateShort(new Date().toISOString())}`}
      right={<Chip tone="mint">Processed u/s 143(1)</Chip>}
      member={m}
    >
      <div className="grid gap-2.5 sm:grid-cols-4">
        {[
          ["PAN", m.pan ?? "—"],
          ["Return form", "ITR-1 (Sahaj)"],
          ["Financial year", t.fy],
          ["Status", hasRefund ? "Refund issued" : t.payable > 0 ? "Tax payable" : "Nil demand"],
        ].map(([k, v]) => (
          <div key={k} className="rounded-2xl border border-line bg-ink/30 px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-fog">{k}</p>
            <p className="tnum mt-1 truncate font-grotesk text-[13.5px] font-bold text-snow">{v}</p>
          </div>
        ))}
      </div>

      <div className={`mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-5 py-4 ${hasRefund ? "border-mint/25 bg-mint/[0.07]" : "border-gold/25 bg-gold/[0.06]"}`}>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-fog">
            {hasRefund ? "Refund issuable (with ₹ interest)" : t.payable > 0 ? "Self-assessment tax payable" : "No demand, no refund"}
          </p>
          <p className={`tnum font-grotesk text-[26px] font-bold ${hasRefund ? "text-mint" : t.payable > 0 ? "text-gold" : "text-fog"}`}>
            {inr(hasRefund ? t.refund : t.payable)}
          </p>
        </div>
        <div className="text-right text-[11.5px] text-fog">
          {hasRefund ? (
            <>Credited to {m.bankName} A/c ••••{m.accountNo.slice(-4)}<br />via ECS within 10 working days</>
          ) : t.payable > 0 ? (
            <>Pay via challan ITNS-280 before<br />the due date to avoid interest u/s 234A</>
          ) : (
            <>TDS exactly covers the liability<br />for this assessment year</>
          )}
        </div>
      </div>

      <div className="mt-4">
        <h3 className="mb-2.5 font-grotesk text-[14px] font-semibold text-snow">Computation</h3>
        <div className="overflow-hidden rounded-2xl border border-line">
          {[
            ["Gross total income", inr2(t.grossTotal), false],
            ["Deductions (Ch. VI-A & others)", `(${inr2(t.deductions)})`, true],
            ["Total income", inr2(t.totalIncome), false],
            ["Tax liability (incl. 4% cess)", inr2(t.taxLiability), false],
            ["TDS / taxes already paid", inr2(t.tds), false],
            [hasRefund ? "Refund" : "Balance payable", inr2(hasRefund ? t.refund : t.payable), false],
          ].map(([k, v, dim], i) => (
            <div key={k as string} className={`flex items-center justify-between px-4 py-2.5 text-[12.5px] ${i % 2 ? "bg-ink/20" : ""} ${dim ? "text-fog" : "text-snow/90"}`}>
              <span>{k as string}</span>
              <span className="tnum font-grotesk font-semibold text-snow">{v as string}</span>
            </div>
          ))}
        </div>
      </div>
      <p className="mt-3 text-[11px] text-fog">
        {void hh} Intimation issued under section 143(1) · CPC Bengaluru. Synthetic acknowledgement — not a real filing.
      </p>
    </DocShell>
  );
}

export { Amt };
