// Maps a channel's subscriber count to the peer range ("one step ahead")
export function getPeerRange(subs: number): { min: number; max: number } {
  if (subs < 100) return { min: 100, max: 1_000 };
  if (subs < 500) return { min: 500, max: 5_000 };
  if (subs < 1_000) return { min: 1_000, max: 10_000 };
  if (subs < 5_000) return { min: 5_000, max: 25_000 };
  if (subs < 10_000) return { min: 10_000, max: 50_000 };
  if (subs < 50_000) return { min: 50_000, max: 200_000 };
  if (subs < 100_000) return { min: 100_000, max: 500_000 };
  if (subs < 500_000) return { min: 500_000, max: 2_000_000 };
  return { min: 1_000_000, max: 10_000_000 };
}

export function formatSubs(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(n);
}
