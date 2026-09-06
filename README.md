# DhanForge — Synthetic Indian Household Finance Lab

> Generate complete, fictional financial profiles for Indian middle-class families — and export them as bank-grade documents.

DhanForge fabricates a deterministic household from a single input (number of people) and a seed, then renders six financial documents per member. Every figure, name, account number, and transaction is **synthetic** — no real personal data is used or stored anywhere beyond your browser.

![Built with React + Vite + Tailwind](https://img.shields.io/badge/stack-React%20%C2%B7%20Vite%20%C2%B7%20Tailwind%20v4-1d2c49?style=flat-square)
![Exports](https://img.shields.io/badge/exports-PDF%20%C2%B7%20XLSX%20%C2%B7%20DOC-c3f24d?style=flat-square&color=c3f24d)

---

## What it generates

For a household of **1–10 people** it produces:

- **People** — fictitious Indian names (shared family surname), gender, age, role (earner, spouse, child, parent)
- **Employment & income** — salaried (with employer, PAN, EPF/TDS), self-employed, pensioner, student, homemaker; salaries scaled to city tier
- **Spending** — 3 months of bank transactions per member: salary credits, rent/home-loan EMI, groceries, food delivery, fuel, utilities, SIPs, insurance, card repayments, with running balances
- **Credit** — credit cards with limits/utilisation, six loan types with full amortisation schedules
- **CIBIL score** — derived from the generated repayment behaviour, with factor breakdown and tradelines

## The six documents

| Document | Highlights |
| --- | --- |
| **CIBIL Report** | Score gauge (300–900), factor meters, tradeline history |
| **Bank Statement** | Month filter, debit/credit columns, opening/closing balances, IFSC |
| **Credit Card Statement** | Statement cycle, utilisation %, minimum due, reward points |
| **Loan Statement** | Repayment progress, EMI schedule (principal/interest split) |
| **Form 16** | Part A & B — 80C/80D, HRA exemption, standard deduction, TDS |
| **ITR-1 Acknowledgement** | Income computation, refund or self-assessment tax payable |

## Exports

- **PDF** — formatted via jsPDF + autotable
- **Excel** — multi-sheet workbooks (SheetJS), plus a whole-household workbook with a roster sheet
- **Word** — `.doc` files for all documents
- Whole-household Excel export covering every member's documents at once

Unavailable combinations (e.g. Form 16 for a homemaker) are handled gracefully with in-app states.

## Quick start

```bash
npm install
npm run dev      # local dev server
npm run build    # production build → dist/
```

## Usage

1. Pick a household size (1–10) and optionally a base city.
2. Hit **Generate household** — the same **seed** always reproduces the same family; roll the dice for a new one.
3. Switch members, filter statements by month, and pick any of the six documents.
4. Export as PDF, Excel, or Word.

State persists in `localStorage`, so your last household survives a refresh.

## Deploy to GitHub Pages

A workflow is included at `.github/workflows/pages.yml`. After pushing:

1. **Settings → Pages → Source → GitHub Actions**
2. Push to `main` — the site builds and deploys automatically.

## Windows toolkit

Double-click **`kk-dhanforge.bat`** in the project folder for a menu-driven script:

1. Install dependencies (`npm install`)
2. Start the dev server (`npm run dev`)
3. Build for production (`npm run build`)
4. **Publish to GitHub as `kk-dhanforge`** — uses the GitHub CLI if installed, otherwise falls back to plain git (prompts for your username and pushes to `main`)
5. Open a preview of the last build

Requirements: [Node.js](https://nodejs.org) and [Git](https://git-scm.com/download/win); optionally the [GitHub CLI](https://cli.github.com) for one-command repo creation.

## Tech

React 18 · Vite · Tailwind CSS v4 · jsPDF + jspdf-autotable · SheetJS · deterministic seeded RNG

## Disclaimer

All data is randomly generated for testing, demos, and fintech prototyping. It does not constitute real financial, credit, or tax records.
