/** Deterministic seeded RNG (mulberry32) so a seed always reproduces the same household. */
export type Rng = {
  next: () => number;
  int: (min: number, max: number) => number;
  float: (min: number, max: number) => number;
  pick: <T,>(arr: readonly T[]) => T;
  chance: (p: number) => boolean;
  sample: <T,>(arr: readonly T[], n: number) => T[];
  shuffle: <T,>(arr: readonly T[]) => T[];
  digits: (n: number) => string;
  round50: (min: number, max: number) => number;
};

export function createRng(seed: number): Rng {
  let a = seed >>> 0;
  const next = () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    int: (min, max) => Math.floor(next() * (max - min + 1)) + min,
    float: (min, max) => next() * (max - min) + min,
    pick: (arr) => arr[Math.floor(next() * arr.length)],
    chance: (p) => next() < p,
    sample: (arr, n) => {
      const copy = [...arr];
      const out: typeof copy = [];
      while (out.length < n && copy.length) {
        out.push(copy.splice(Math.floor(next() * copy.length), 1)[0]);
      }
      return out;
    },
    shuffle: (arr) => {
      const copy = [...arr];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    },
    digits: (n) => {
      let s = "";
      for (let i = 0; i < n; i++) s += Math.floor(next() * 10);
      return s;
    },
    round50: (min, max) => Math.round((min + next() * (max - min)) / 50) * 50,
  };
}

export function randomSeed(): number {
  return Math.floor(Math.random() * 899999) + 100000;
}
