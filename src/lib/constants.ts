export const FIBONACCI_SYSTEM = [
  "0",
  "1",
  "2",
  "3",
  "5",
  "8",
  "13",
  "21",
  "34",
  "55",
  "89",
  "?",
  "☕",
] as const;

export type VoteValue = (typeof FIBONACCI_SYSTEM)[number];
