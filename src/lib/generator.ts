import { createRng, type Rng } from "./rng";
import {
  CITIES, LAST_NAMES, MALE_NAMES, FEMALE_NAMES, OCCUPATIONS, EMPLOYERS,
  BANKS, CARD_PRODUCTS, LOAN_TYPES, LOAN_LENDERS, GROCERY_MERCHANTS,
  FOOD_MERCHANTS, TRANSPORT_MERCHANTS, SHOPPING_MERCHANTS, HEALTH_MERCHANTS,
  ENTERTAINMENT_MERCHANTS, EDUCATION_MERCHANTS, SIP_PLATFORMS, INSURERS,
  LANDLORD_NAMES, MOBILE_PLANS, NET_PROVIDERS, COMPANY_TAN_PREFIX,
  type City, type TxnCategory,
} from "./data";
import { toISO } from "./format";

/* ---------------------------------- types ---------------------------------- */

export interface Txn {
  id: string;
  date: string;
  narration: string;
  ref: string;
  amount: number; // + credit, − debit
  category: TxnCategory;
  balance: number;
}

export interface CardTxn {
  id: string;
  date: string;
  detail: string;
  amount: number;
  category: TxnCategory;
}

export interface Employment {
  kind: "salaried" | "self" | "pension" | "student" | "homemaker";
  title: string;
  employer?: string;
  sector?: string;
  monthlyGross: number;
  monthlyTakeHome: number;
  annualGross: number;
}

export interface LoanAccount {
  lender: string;
  type: string;
  accountNo: string;
  sanctionDate: string;
  principal: number;
  rate: number;
  tenureMonths: number;
  emi: number;
  outstanding: number;
  nextDue: string;
  paidInstallments: number;
  schedule: { no: number; date: string; emi: number; principal: number; interest: number; balance: number }[];
}

export interface CardAccount {
  bank: string;
  product: string;
  numberMasked: string;
  limit: number;
  txns: CardTxn[];
  lastStatementTotal: number;
}

export interface Form16Data {
  employer: string;
  tan: string;
  fy: string;
  ay: string;
  gross: number;
  basic: number;
  hra: number;
  special: number;
  epfEmployee: number;
  stdDeduction: number;
  c80: number;
  d80: number;
  hraExempt: number;
  otherIncome: number;
  taxable: number;
  tax: number;
  cess: number;
  totalTax: number;
  tdsMonthly: number;
}

export interface Tradeline {
  type: string;
  institution: string;
  account: string;
  amount: number;
  status: "ACTIVE" | "CLOSED" | "STANDARD";
  since: string;
}

export interface Member {
  id: string;
  name: string;
  gender: "Male" | "Female";
  age: number;
  role: "Primary" | "Spouse" | "Child" | "Parent";
  pan: string | null;
  employment: Employment;
  bankName: string;
  accountNo: string;
  ifsc: string;
  branch: string;
  openingBalance: number;
  cibil: number | null;
  tradelines: Tradeline[];
  card: CardAccount | null;
  loan: LoanAccount | null;
  txns: Txn[];
  form16: Form16Data | null;
  monthlyIncome: number;
  monthlyExpense: number;
}

export interface Household {
  id: string;
  seed: number;
  createdAt: string;
  city: City;
  familyName: string;
  members: Member[];
  monthlyIncome: number;
  monthlyExpense: number;
  monthlyEmi: number;
  net: number;
  categorySpend: { cat: TxnCategory; total: number }[];
  weeklySpend: number[]; // Mon..Sun
  monthLabels: string[];
}

/* --------------------------------- helpers --------------------------------- */

function makePan(rnd: Rng, lastName: string): string {
  const L = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let s = "";
  for (let i = 0; i < 3; i++) s += L[rnd.int(0, 25)];
  s += "P";
  s += lastName[0]!.toUpperCase();
  s += rnd.digits(4);
  s += L[rnd.int(0, 25)];
  return s;
}

function makeTan(rnd: Rng): string {
  const L = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return rnd.pick(COMPANY_TAN_PREFIX) + rnd.digits(5) + L[rnd.int(0, 25)];
}

function emiOf(principal: number, annualRate: number, months: number): number {
  const r = annualRate / 1200;
  const f = Math.pow(1 + r, months);
  return Math.round((principal * r * f) / (f - 1));
}

function fyStrings(d: Date): { fy: string; ay: string } {
  const start = d.getMonth() >= 3 ? d.getFullYear() : d.getFullYear() - 1;
  return {
    fy: `FY ${start}-${`${start + 1}`.slice(2)}`,
    ay: `AY ${start + 1}-${`${start + 2}`.slice(2)}`,
  };
}

/** Salary credit on the 5th of the "current" statement month anchor. */
function lastMonths(count: number): Date[] {
  const now = new Date();
  const out: Date[] = [];
  for (let i = count - 1; i >= 0; i--) {
    out.push(new Date(now.getFullYear(), now.getMonth() - i, 1));
  }
  return out;
}

function daysIn(m: Date): number {
  return new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate();
}

/* ------------------------------- employment ------------------------------- */

function buildEmployment(rnd: Rng, role: Member["role"], age: number, city: City): Employment {
  const none: Employment = {
    kind: "homemaker", title: "Homemaker", monthlyGross: 0, monthlyTakeHome: 0, annualGross: 0,
  };
  if (age < 18) return { ...none, kind: "student", title: "School Student" };
  if (role === "Child" && age <= 22) return { ...none, kind: "student", title: "College Student" };
  if (role === "Parent") {
    if (rnd.chance(0.6)) {
      const occ = OCCUPATIONS.find((o) => o.kind === "pension")!;
      const gross = rnd.round50(occ.min * city.mult, occ.max * city.mult);
      return { kind: "pension", title: occ.title, sector: occ.sector, monthlyGross: gross, monthlyTakeHome: gross, annualGross: gross * 12 };
    }
    return none;
  }
  if (role === "Spouse" && rnd.chance(0.28)) return none;

  const pool = OCCUPATIONS.filter((o) => o.kind === (rnd.chance(0.78) ? "salaried" : "self"));
  const occ = rnd.pick(pool);
  const gross = rnd.round50(occ.min * city.mult, occ.max * city.mult);
  if (occ.kind === "self") {
    const takeHome = Math.round(gross * 0.94);
    return { kind: "self", title: occ.title, sector: occ.sector, monthlyGross: gross, monthlyTakeHome: takeHome, annualGross: gross * 12 };
  }
  const employer = rnd.pick(EMPLOYERS);
  const epf = Math.round(gross * 0.5 * 0.12);
  const tdsEst = gross > 85000 ? Math.round(gross * 0.1) : gross > 55000 ? Math.round(gross * 0.04) : 0;
  const takeHome = gross - epf - tdsEst;
  return {
    kind: "salaried", title: occ.title, employer, sector: occ.sector,
    monthlyGross: gross, monthlyTakeHome: takeHome, annualGross: gross * 12,
  };
}

/* ---------------------------------- loans ---------------------------------- */

function buildLoan(rnd: Rng, type: string, income: number, now: Date): LoanAccount | null {
  const spec = LOAN_TYPES.find((t) => t.type === type);
  if (!spec) return null;
  let principal = rnd.round50(spec.min, spec.max);
  const rate = rnd.float(spec.rateMin, spec.rateMax);
  const tenure = rnd.int(spec.tenureMin, spec.tenureMax);
  // keep EMI serviceable against income (if any)
  if (income > 0) {
    let guard = 0;
    while (emiOf(principal, rate, tenure) > income * 0.42 && guard++ < 8) principal = Math.round(principal * 0.82);
  }
  const emi = emiOf(principal, rate, tenure);
  const paid = rnd.int(Math.max(4, Math.floor(tenure * 0.08)), Math.max(6, Math.floor(tenure * 0.55)));
  const sanction = new Date(now.getFullYear(), now.getMonth() - Math.round(paid * 1.4) - 2, rnd.int(3, 25));
  let bal = principal;
  const r = rate / 1200;
  const schedule: LoanAccount["schedule"] = [];
  for (let i = 1; i <= tenure; i++) {
    const interest = bal * r;
    let prin = emi - interest;
    if (i === tenure) prin = bal;
    const pay = i === tenure ? prin + interest : emi;
    bal = Math.max(0, bal - prin);
    const d = new Date(sanction.getFullYear(), sanction.getMonth() + i, 7);
    schedule.push({
      no: i, date: toISO(d), emi: Math.round(pay), principal: Math.round(prin),
      interest: Math.round(interest), balance: Math.round(bal),
    });
    if (bal <= 0) break;
  }
  const outstanding = schedule[Math.min(paid, schedule.length) - 1]?.balance ?? 0;
  return {
    lender: rnd.pick(LOAN_LENDERS), type, accountNo: rnd.digits(12),
    sanctionDate: toISO(sanction), principal, rate: Math.round(rate * 100) / 100,
    tenureMonths: tenure, emi, outstanding,
    nextDue: toISO(new Date(now.getFullYear(), now.getMonth(), rnd.int(5, 9))),
    paidInstallments: paid, schedule,
  };
}

/* ----------------------------------- card ----------------------------------- */

function buildCard(rnd: Rng, income: number, months: Date[], now: Date): CardAccount | null {
  const spec = rnd.pick(CARD_PRODUCTS);
  const limit = Math.max(30000, Math.round((income * rnd.float(1.6, 2.8)) / 1000) * 1000);
  const last4 = rnd.digits(4);
  const txns: CardTxn[] = [];
  months.forEach((m, mi) => {
    const capDays = mi === months.length - 1 ? now.getDate() : daysIn(m);
    const count = rnd.int(5, 10);
    for (let i = 0; i < count; i++) {
      const cat = rnd.pick(["food", "shopping", "entertainment", "grocery", "transport", "food", "shopping"] as TxnCategory[]);
      const merchants =
        cat === "food" ? FOOD_MERCHANTS :
        cat === "shopping" ? SHOPPING_MERCHANTS :
        cat === "entertainment" ? ENTERTAINMENT_MERCHANTS :
        cat === "grocery" ? GROCERY_MERCHANTS : TRANSPORT_MERCHANTS;
      const amount =
        cat === "food" ? rnd.int(180, 900) :
        cat === "shopping" ? rnd.int(450, 4200) :
        cat === "entertainment" ? rnd.int(199, 1100) :
        cat === "grocery" ? rnd.int(400, 2100) : rnd.int(200, 1800);
      const day = Math.min(rnd.int(1, capDays), capDays);
      txns.push({
        id: `c${mi}-${i}`,
        date: toISO(new Date(m.getFullYear(), m.getMonth(), day)),
        detail: `${rnd.pick(merchants)} · ${rnd.pick(["UPI", "POS", "ONLINE"])}`,
        amount, category: cat,
      });
    }
  });
  txns.sort((a, b) => a.date.localeCompare(b.date));
  const lastMonth = months[months.length - 2];
  const lastStatementTotal = txns
    .filter((t) => t.date.startsWith(`${lastMonth.getFullYear()}-${`${lastMonth.getMonth() + 1}`.padStart(2, "0")}`))
    .reduce((s, t) => s + t.amount, 0);
  return {
    bank: spec.bank, product: spec.product,
    numberMasked: `${spec.prefix} •• •••• ${last4}`,
    limit, txns, lastStatementTotal,
  };
}

/* ------------------------------- transactions ------------------------------- */

interface TxnDraft {
  date: Date;
  narration: string;
  amount: number;
  category: TxnCategory;
}

function buildTxns(
  rnd: Rng,
  member: Member,
  months: Date[],
  now: Date,
  ctx: {
    renting: boolean;
    rent: number;
    landlord: string;
    primaryName: string;
    familySize: number;
    kidCount: number;
    isPrimary: boolean;
    electricity: string;
    water: string;
  },
): Txn[] {
  const drafts: TxnDraft[] = [];
  const inc = member.employment.monthlyTakeHome;

  months.forEach((m, mi) => {
    const capDays = mi === months.length - 1 ? now.getDate() : daysIn(m);
    const at = (day: number) => new Date(m.getFullYear(), m.getMonth(), Math.min(day, capDays));
    const push = (day: number, narration: string, amount: number, category: TxnCategory) =>
      drafts.push({ date: at(day), narration, amount, category });
    const monthKey = `${m.getFullYear()}-${`${m.getMonth() + 1}`.padStart(2, "0")}`;
    void monthKey;

    /* income */
    if (member.employment.kind === "salaried") {
      push(1, `NEFT CR-${member.employment.employer}-SALARY`, inc, "salary");
    } else if (member.employment.kind === "pension") {
      push(1, "NEFT CR-GOVT PENSION-DISBURSEMENT", inc, "income");
    } else if (member.employment.kind === "self") {
      const n = rnd.int(2, 4);
      for (let i = 0; i < n; i++) {
        const share = inc / n;
        push(rnd.int(2, 24), `UPI CR-${rnd.pick(["Shop Sales", "Client Payment", "Order Settlement"])}`, Math.round(share * rnd.float(0.7, 1.3)), "income");
      }
    } else if (member.role === "Child" && member.age >= 18) {
      push(6, `UPI CR-${ctx.primaryName}-POCKET MONEY`, rnd.round50(3000, 8000), "transfer");
    } else if (member.role === "Spouse" && inc === 0) {
      push(6, `UPI CR-${ctx.primaryName}-HOUSEHOLD`, rnd.round50(8000, 18000), "transfer");
    } else if (member.role === "Parent" && inc === 0) {
      push(6, `UPI CR-${ctx.primaryName}-FOR YOU`, rnd.round50(4000, 10000), "transfer");
    }

    /* fixed outflows for the earning primary */
    if (ctx.isPrimary) {
      if (ctx.renting) push(1, `IMPS-RENT-${ctx.landlord}`, -ctx.rent, "rent");
      if (member.age >= 18) push(rnd.int(8, 12), `AUTOPAY-${ctx.electricity.toUpperCase()}`, -rnd.round50(700 * ctx.familySize * 0.4, 1500 * ctx.familySize * 0.45), "utilities");
      push(rnd.int(12, 16), `AUTOPAY-${ctx.water.toUpperCase()}`, -rnd.round50(280, 850), "utilities");
      push(rnd.int(3, 6), `AUTOPAY-${rnd.pick(NET_PROVIDERS)}`, -rnd.pick([699, 799, 999, 1199]), "internet");
      if (ctx.kidCount > 0 && rnd.chance(0.85)) {
        push(rnd.int(3, 8), `UPI DR-${rnd.pick(EDUCATION_MERCHANTS)}`, -rnd.round50(1400 * ctx.kidCount, 3800 * ctx.kidCount), "education");
      }
      if (mi % 3 === 1) push(rnd.int(18, 24), `ECS DR-${rnd.pick(INSURERS)}`, -rnd.round50(1100, 4200), "insurance");
    }

    if (member.loan) {
      push(7, `ECS DR-${member.loan.lender}-${member.loan.type.toUpperCase()} EMI`, -member.loan.emi, "emi");
    }

    if (member.employment.kind === "salaried" && inc > 30000) {
      push(15, `AUTOPAY-${rnd.pick(SIP_PLATFORMS)}`, -Math.round(inc * rnd.float(0.05, 0.1)), "sip");
    }

    if (member.age >= 18) {
      push(rnd.int(2, 5), `UPI DR-${rnd.pick(MOBILE_PLANS)}`, -rnd.pick([239, 299, 479, 749]), "mobile");
    }

    /* card payment (bill of previous month) */
    if (member.card && mi > 0) {
      const prev = months[mi - 1];
      const key = `${prev.getFullYear()}-${`${prev.getMonth() + 1}`.padStart(2, "0")}`;
      const bill = member.card.txns
        .filter((t) => t.date.startsWith(key))
        .reduce((s, t) => s + t.amount, 0);
      if (bill > 0) push(20, `PAYMENT TO-${member.card.product.toUpperCase()}`, -bill, "card-payment");
    }

    /* lifestyle spends — richer for earning adults */
    const wallet = inc > 0 || member.role === "Spouse" ? 1 : 0.4;
    const groc = ctx.isPrimary || (member.role === "Spouse" && inc === 0) ? rnd.int(3, 4) : inc > 0 ? rnd.int(1, 2) : rnd.int(0, 2);
    for (let i = 0; i < groc; i++) {
      push(rnd.int(2, 27), `UPI DR-${rnd.pick(GROCERY_MERCHANTS)}`, -rnd.round50(350, 1200 + ctx.familySize * 220), "grocery");
    }
    if (member.age >= 15 && member.age <= 55) {
      const n = rnd.int(1, 3);
      for (let i = 0; i < n; i++) {
        push(rnd.int(1, capDays), `UPI DR-${rnd.pick(FOOD_MERCHANTS)}`, -Math.round(rnd.int(180, 650) * wallet + rnd.int(0, 120)), "food");
      }
    }
    if (member.age >= 18) {
      const n = rnd.int(1, 3);
      for (let i = 0; i < n; i++) {
        const merch = rnd.pick(TRANSPORT_MERCHANTS);
        const isFuel = merch.includes("Petrol") || merch.includes("Fuel");
        push(rnd.int(1, capDays), `UPI DR-${merch}`, -rnd.round50(isFuel ? 500 : 90, isFuel ? 2000 : 480), "transport");
      }
    }
    if (inc > 0 || member.role === "Spouse") {
      const n = rnd.int(0, 2);
      for (let i = 0; i < n; i++) {
        push(rnd.int(1, capDays), `UPI DR-${rnd.pick(SHOPPING_MERCHANTS)}`, -rnd.round50(400, 2600), "shopping");
      }
    }
    if (member.age >= 16 && member.age <= 60) {
      const n = rnd.int(0, 2);
      for (let i = 0; i < n; i++) {
        push(rnd.int(1, capDays), `UPI DR-${rnd.pick(ENTERTAINMENT_MERCHANTS)}`, -rnd.int(199, 1100), "entertainment");
      }
    }
    if (rnd.chance(wallet > 0.5 ? 0.55 : 0.35)) {
      push(rnd.int(1, capDays), `UPI DR-${rnd.pick(HEALTH_MERCHANTS)}`, -rnd.round50(150, 1400), "health");
    }

    /* tiny interest credit once */
    if (mi === 1) push(28, "SB INT.CR", rnd.int(120, 850), "income");
  });

  drafts.sort((a, b) => a.date.getTime() - b.date.getTime() || b.amount - a.amount);

  let bal = member.openingBalance;
  const out: Txn[] = [];
  drafts.forEach((d, i) => {
    bal = Math.round(bal + d.amount);
    out.push({
      id: `${member.id}-t${i}`,
      date: toISO(d.date),
      narration: d.narration,
      ref: d.amount > 0 ? `CRN${rnd.digits(9)}` : `UPI${rnd.digits(10)}`,
      amount: d.amount,
      category: d.category,
      balance: bal,
    });
  });
  return out;
}

/* ---------------------------------- form16 ---------------------------------- */

function buildForm16(rnd: Rng, member: Member, city: City, now: Date): Form16Data | null {
  if (member.employment.kind !== "salaried") return null;
  const gross = member.employment.annualGross;
  const basic = Math.round(gross * 0.5);
  const hra = Math.round(gross * 0.25);
  const special = gross - basic - hra;
  const epfEmployee = Math.round(basic * 0.12);
  const stdDeduction = 75000;
  const lic = rnd.round50(24000, 60000);
  const c80 = Math.min(150000, epfEmployee + lic + rnd.round50(20000, 60000));
  const d80 = 25000;
  const paysRent = !member.loan || member.loan.type !== "Home Loan";
  const hraExempt = paysRent
    ? Math.min(hra, Math.round(basic * 0.5 * (city.metro ? 0.5 : 0.4)), Math.round(hra * 0.75))
    : 0;
  const otherIncome = rnd.int(2800, 9500);
  const taxable = Math.max(0, gross + otherIncome - stdDeduction - c80 - d80 - hraExempt - epfEmployee);
  let tax = 0;
  if (taxable > 500000) {
    tax =
      (taxable > 1000000 ? (taxable - 1000000) * 0.3 : 0) +
      (taxable > 500000 ? (Math.min(taxable, 1000000) - 500000) * 0.2 : 0) +
      12500;
  } else if (taxable > 250000) {
    tax = (taxable - 250000) * 0.05;
  }
  if (taxable <= 500000) tax = 0; // 87A rebate
  const cess = Math.round(tax * 0.04);
  const totalTax = Math.round(tax + cess);
  return {
    employer: member.employment.employer!,
    tan: makeTan(rnd),
    ...fyStrings(now),
    gross, basic, hra, special, epfEmployee, stdDeduction, c80, d80, hraExempt,
    otherIncome, taxable, tax: Math.round(tax), cess, totalTax,
    tdsMonthly: Math.round(totalTax / 12),
  };
}

/* --------------------------------- cibil --------------------------------- */

function computeCibil(rnd: Rng, member: Member): number | null {
  if (member.age < 18) return null;
  if (member.age < 23 && !member.card) return null;
  let score = 706;
  if (member.loan) score += member.loan.type === "Home Loan" ? 34 : 18;
  if (member.age >= 34) score += 14;
  if (member.tradelines.length >= 3) score += 12;
  if (member.card) {
    const util = member.card.lastStatementTotal / member.card.limit;
    if (util > 0.6) score -= 46;
    else if (util > 0.35) score -= 16;
    else score += 8;
  }
  score += rnd.int(-24, 30);
  return Math.max(572, Math.min(834, score));
}

/* ------------------------------- household ------------------------------- */

export function generateHousehold(size: number, seed: number, cityPref: string): Household {
  const rnd = createRng(seed);
  const now = new Date();
  const months = lastMonths(3);
  const city = cityPref === "auto" ? rnd.pick(CITIES) : CITIES.find((c) => c.name === cityPref) ?? rnd.pick(CITIES);
  const familyName = rnd.pick(LAST_NAMES);

  const structure: { role: Member["role"]; gender: "Male" | "Female"; age: number }[] = [];
  const primaryGender: "Male" | "Female" = rnd.chance(0.62) ? "Male" : "Female";
  const primaryAge = rnd.int(28, 52);
  structure.push({ role: "Primary", gender: primaryGender, age: primaryAge });

  let remaining = size - 1;
  if (remaining > 0) {
    structure.push({
      role: "Spouse",
      gender: primaryGender === "Male" ? "Female" : "Male",
      age: Math.max(24, primaryAge + rnd.int(-4, 4)),
    });
    remaining--;
  }
  const seniors = remaining >= 4 ? 2 : remaining >= 3 ? (rnd.chance(0.6) ? 1 : 0) : 0;
  for (let i = 0; i < seniors; i++) {
    structure.push({
      role: "Parent",
      gender: i === 0 ? (rnd.chance(0.5) ? "Male" : "Female") : structure[structure.length - 1].gender === "Male" ? "Female" : "Male",
      age: rnd.int(56, 74),
    });
    remaining--;
  }
  for (let i = 0; i < remaining; i++) {
    const g: "Male" | "Female" = rnd.chance(0.5) ? "Male" : "Female";
    structure.push({ role: "Child", gender: g, age: rnd.int(5, 21) });
  }

  const kidCount = structure.filter((s) => s.role === "Child").length;
  const primaryName = `${rnd.pick(primaryGender === "Male" ? MALE_NAMES : FEMALE_NAMES)} ${familyName}`;
  const familyBank = rnd.pick(BANKS);

  /* household-level decisions */
  const members: Member[] = structure.map((s, idx) => {
    const first = s.role === "Primary"
      ? primaryName.split(" ")[0]
      : rnd.pick(s.gender === "Male" ? MALE_NAMES : FEMALE_NAMES);
    const name = s.role === "Primary" ? primaryName : `${first} ${familyName}`;
    const employment = buildEmployment(rnd, s.role, s.age, city);
    const actualBank = idx === 0 ? familyBank : rnd.chance(0.62) ? familyBank : rnd.pick(BANKS);
    return {
      id: `m${idx}`,
      name,
      gender: s.gender,
      age: s.age,
      role: s.role,
      pan: s.age >= 18 ? makePan(rnd, familyName) : null,
      employment,
      bankName: actualBank.name,
      accountNo: actualBank.ifsc.slice(0, 4) === "HDFC" ? `5010${rnd.digits(8)}` : `000${rnd.digits(9)}`,
      ifsc: `${actualBank.ifsc}${rnd.digits(3)}`,
      branch: rnd.pick(["Main Branch", `${city.name} City Branch`, "MG Road Branch", "Station Road Branch", `${city.name} Hub`]),
      openingBalance: Math.round((employment.monthlyTakeHome || 12000) * rnd.float(1.2, 2.4) + 18000),
      cibil: null,
      tradelines: [],
      card: null,
      loan: null,
      txns: [],
      form16: null,
      monthlyIncome: employment.monthlyTakeHome,
      monthlyExpense: 0,
    };
  });

  /* loans */
  const primary = members[0];
  const homeLoan = primaryAge >= 31 && rnd.chance(0.62) ? buildLoan(rnd, "Home Loan", primary.employment.monthlyTakeHome, now) : null;
  primary.loan = homeLoan ?? buildLoan(rnd, primaryAge >= 30 ? "Car Loan" : "Two-Wheeler Loan", primary.employment.monthlyTakeHome, now);
  members.forEach((m) => {
    if (m.role === "Spouse" && m.employment.monthlyTakeHome > 0 && primary.loan?.type === "Home Loan" && rnd.chance(0.4)) {
      m.loan = buildLoan(rnd, "Car Loan", m.employment.monthlyTakeHome, now);
    }
    if (m.role === "Parent" && rnd.chance(0.18)) m.loan = buildLoan(rnd, "Gold Loan", m.employment.monthlyTakeHome || 15000, now);
  });

  /* cards */
  members.forEach((m) => {
    const inc = m.employment.monthlyTakeHome;
    const getsCard = m.role !== "Child" ? inc > 0 || (m.role === "Spouse" && rnd.chance(0.55)) : m.age >= 19 && rnd.chance(0.3);
    if (getsCard && m.age >= 18) m.card = buildCard(rnd, Math.max(inc, 20000), months, now);
  });

  /* renting vs owning (household level) */
  const hhIncome = members.reduce((s, m) => s + m.employment.monthlyTakeHome, 0);
  const renting = !homeLoan;
  const rent = renting ? Math.round((hhIncome * rnd.float(0.2, 0.28)) / 100) * 100 : 0;
  const landlord = rnd.pick(LANDLORD_NAMES);

  /* transactions */
  members.forEach((m, idx) => {
    m.txns = buildTxns(rnd, m, months, now, {
      renting, rent, landlord, primaryName: primary.name.split(" ")[0],
      familySize: members.length, kidCount, isPrimary: idx === 0,
      electricity: city.electricity, water: city.water,
    });
    m.monthlyExpense = Math.round(
      m.txns.filter((t) => t.amount < 0).reduce((s, t) => s - t.amount, 0) / months.length,
    );
    m.monthlyIncome = Math.round(m.txns.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0) / months.length);
  });

  /* tradelines + cibil */
  members.forEach((m) => {
    const since = (yrs: number) => toISO(new Date(now.getFullYear() - yrs, rnd.int(0, 11), rnd.int(2, 26)));
    if (m.card) m.tradelines.push({ type: "Credit Card", institution: m.card.bank, account: `•••• ${m.card.numberMasked.slice(-4)}`, amount: m.card.limit, status: "ACTIVE", since: since(rnd.int(1, 7)) });
    if (m.loan) m.tradelines.push({ type: m.loan.type, institution: m.loan.lender, account: `•••• ${m.loan.accountNo.slice(-4)}`, amount: m.loan.principal, status: "STANDARD", since: m.loan.sanctionDate });
    if (m.age >= 30 && rnd.chance(0.5)) {
      m.tradelines.push({ type: rnd.pick(["Consumer Loan", "Two-Wheeler Loan", "Credit Card"]), institution: rnd.pick(LOAN_LENDERS), account: `•••• ${rnd.digits(4)}`, amount: rnd.round50(20000, 120000), status: "CLOSED", since: since(rnd.int(5, 11)) });
    }
    m.cibil = computeCibil(rnd, m);
  });

  /* form 16 */
  members.forEach((m) => {
    m.form16 = buildForm16(rnd, m, city, now);
  });

  /* aggregates — household income from employment only (transfers are internal) */
  const monthlyIncome = Math.round(members.reduce((s, m) => s + m.employment.monthlyTakeHome, 0));
  const monthlyEmi = members.reduce((s, m) => s + (m.loan ? m.loan.emi : 0), 0);

  const catMap = new Map<TxnCategory, number>();
  const weekly = [0, 0, 0, 0, 0, 0, 0];
  let expenseSum = 0;
  members.forEach((m) =>
    m.txns.forEach((t) => {
      if (t.amount < 0 && t.category !== "transfer") {
        expenseSum += -t.amount;
        if (t.category !== "rent" && t.category !== "emi") {
          catMap.set(t.category, (catMap.get(t.category) ?? 0) - t.amount);
          const dow = (new Date(t.date).getDay() + 6) % 7; // Mon=0
          weekly[dow] += -t.amount;
        }
      }
    }),
  );
  const monthlyExpense = Math.round(expenseSum / months.length);
  const categorySpend = [...catMap.entries()]
    .map(([cat, total]) => ({ cat, total: Math.round(total / months.length) }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 7);

  return {
    id: `h-${seed}`,
    seed,
    createdAt: toISO(now),
    city,
    familyName,
    members,
    monthlyIncome,
    monthlyExpense,
    monthlyEmi,
    net: monthlyIncome - monthlyExpense,
    categorySpend,
    weeklySpend: weekly.map((v) => Math.round(v / months.length)),
    monthLabels: months.map((m) => m.toLocaleDateString("en-IN", { month: "short", year: "numeric" })),
  };
}
