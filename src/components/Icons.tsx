import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { size?: number };

function base({ size = 18, ...props }: P) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.9,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    ...props,
  };
}

export const IconRupee = (p: P) => (
  <svg {...base(p)}>
    <path d="M7 4h10M7 8h10M7 4c4.8 0 6.8 1.6 6.8 4s-2 4-6.8 4l7 8" />
  </svg>
);

export const IconPlus = (p: P) => (
  <svg {...base(p)}><path d="M12 5v14M5 12h14" /></svg>
);

export const IconMinus = (p: P) => (
  <svg {...base(p)}><path d="M5 12h14" /></svg>
);

export const IconDice = (p: P) => (
  <svg {...base(p)}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="4" />
    <circle cx="8.5" cy="8.5" r="1.15" fill="currentColor" stroke="none" />
    <circle cx="15.5" cy="15.5" r="1.15" fill="currentColor" stroke="none" />
    <circle cx="15.5" cy="8.5" r="1.15" fill="currentColor" stroke="none" />
    <circle cx="8.5" cy="15.5" r="1.15" fill="currentColor" stroke="none" />
  </svg>
);

export const IconSpark = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3l1.9 5.3L19 10l-5.1 1.7L12 17l-1.9-5.3L5 10l5.1-1.7L12 3z" />
    <path d="M18.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2z" />
  </svg>
);

export const IconDownload = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3v11M7.5 10.5L12 15l4.5-4.5M4.5 20h15" />
  </svg>
);

export const IconFileText = (p: P) => (
  <svg {...base(p)}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5z" />
    <path d="M14 3v5h5M9 13h6M9 17h4" />
  </svg>
);

export const IconSheet = (p: P) => (
  <svg {...base(p)}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="2.5" />
    <path d="M3.5 9.5h17M9.5 3.5v17" />
  </svg>
);

export const IconGauge = (p: P) => (
  <svg {...base(p)}>
    <path d="M4.4 18a9 9 0 1 1 15.2 0" />
    <path d="M12 14.5l3.2-4.3" />
    <circle cx="12" cy="15" r="1.4" />
  </svg>
);

export const IconBank = (p: P) => (
  <svg {...base(p)}>
    <path d="M3 21h18M4 10h16M12 3L4 8.5h16L12 3zM6 10.5V18M10 10.5V18M14 10.5V18M18 10.5V18" />
  </svg>
);

export const IconCard = (p: P) => (
  <svg {...base(p)}>
    <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
    <path d="M2.5 9.5h19M6 15h4" />
  </svg>
);

export const IconLoan = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M9.6 15.2l4.8-6.4" />
    <circle cx="9.4" cy="9.4" r="1" fill="currentColor" stroke="none" />
    <circle cx="14.6" cy="14.6" r="1" fill="currentColor" stroke="none" />
  </svg>
);

export const IconForm16 = (p: P) => (
  <svg {...base(p)}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5z" />
    <path d="M14 3v5h5" />
    <circle cx="12" cy="13" r="2" />
    <path d="M12 15v3.5" />
  </svg>
);

export const IconCheckFile = (p: P) => (
  <svg {...base(p)}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5z" />
    <path d="M14 3v5h5M9 14.5l2 2 4-4.5" />
  </svg>
);

export const IconArrowUpRight = (p: P) => (
  <svg {...base(p)}><path d="M7 17L17 7M8.5 7H17v8.5" /></svg>
);

export const IconX = (p: P) => (
  <svg {...base(p)}><path d="M18 6L6 18M6 6l12 12" /></svg>
);

export const IconWallet = (p: P) => (
  <svg {...base(p)}>
    <path d="M19 7H5.5A2.5 2.5 0 0 1 3 4.5M19 7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4.5M19 7l-2.5-3H5.5" />
    <circle cx="16" cy="13.5" r="1.1" fill="currentColor" stroke="none" />
  </svg>
);

export const IconUsers = (p: P) => (
  <svg {...base(p)}>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5" />
    <path d="M15.5 4.8a3.5 3.5 0 0 1 0 6.4M17.8 14.9c2 .8 3.3 2.5 3.7 5.1" />
  </svg>
);

export const IconPin = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 21s-7-5.4-7-11a7 7 0 1 1 14 0c0 5.6-7 11-7 11z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);

export const IconShield = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3l7 2.6v5.6c0 4.6-3 8-7 9.8-4-1.8-7-5.2-7-9.8V5.6L12 3z" />
    <path d="M9 11.8l2.1 2.2 4-4.4" />
  </svg>
);

export const IconTrendUp = (p: P) => (
  <svg {...base(p)}>
    <path d="M3.5 17.5l5.5-5.5 3.5 3.5 7.5-8" />
    <path d="M14.5 7.5H20V13" />
  </svg>
);
