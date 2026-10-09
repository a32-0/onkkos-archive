const svg = (from: string, to: string) =>
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 9" preserveAspectRatio="none"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs><rect width="16" height="9" fill="url(#g)"/></svg>`,
  );

export const SAMPLE_ART = [
  svg("#2d1f4f", "#0d3b5c"),
  svg("#14402b", "#3a1d12"),
  svg("#3b2a4a", "#1b1b2e"),
  svg("#4a3a1a", "#1a2a3a"),
  svg("#2a1a3a", "#4a1a2a"),
  svg("#1a3a3a", "#2a2a1a"),
] as const;
