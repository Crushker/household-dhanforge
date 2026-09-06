import type { Member } from "./generator";
import { fyOf } from "./format";

export function scoreBandLabel(score: number): string {
  return score >= 750 ? "Excellent" : score >= 700 ? "Good" : score >= 650 ? "Fair" : "Needs work";
}

export interface ItrData {
  fy: string;
  ay: string;
  grossTotal: number;
  deductions: number;
  totalIncome: number;
  taxLiability: number;
  tds: number;
  refund: number;
  payable: number;
  ack: string;
}

/** Deterministic ITR-1 computation derived from a member's synthetic profile. */
export function computeItr(m: Member): ItrData {
  const now = new Date();
  const { fy, ay } = fyOf(now);
  let gross = m.employment.annualGross;
  let deductions = 0;
  let tds = 0;

  if (m.form16) {
    gross = m.form16.gross + m.form16.otherIncome;
    deductions =
      m.form16.stdDeduction + m.form16.c80 + m.form16.d80 +
      m.form16.hraExempt + m.form16.epfEmployee;
    tds = m.form16.totalTax;
  } else if (m.employment.kind === "self") {
    deductions = Math.min(150000, Math.round(gross * 0.08)) + 25000;
  } else {
    // pension
    deductions = 75000 + (m.age >= 60 ? 25000 : 0);
  }

  const totalIncome = Math.max(0, gross - deductions);
  let tax = 0;
  if (totalIncome > 500000) {
    tax =
      (totalIncome > 1000000 ? (totalIncome - 1000000) * 0.3 : 0) +
      (Math.min(totalIncome, 1000000) - 500000) * 0.2 +
      12500;
  } else if (totalIncome > 250000) {
    tax = (totalIncome - 250000) * 0.05;
  }
  if (totalIncome <= 500000) tax = 0; // rebate u/s 87A
  const totalTax = Math.round(tax * 1.04);

  // small deterministic refund for salaried members (slightly excess TDS)
  const refundExtra = m.form16 ? (parseInt(m.accountNo.slice(-3), 10) % 2300) + 380 : 0;

  return {
    fy, ay,
    grossTotal: gross,
    deductions,
    totalIncome,
    taxLiability: totalTax,
    tds: tds + refundExtra,
    refund: Math.max(0, tds + refundExtra - totalTax),
    payable: Math.max(0, totalTax - tds),
    ack: `${`${parseInt(m.accountNo.slice(-7), 10)}${now.getDate()}${now.getMonth() + 1}`.slice(0, 10)}`,
  };
}
