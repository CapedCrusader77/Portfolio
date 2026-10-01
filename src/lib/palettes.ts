/** Accent pairs for the systems-interface theme (no blue tones). */
export type Palette = { name: string; acc: string; acc2: string };

export const palettes: Palette[] = [
  { name: "ORANGE", acc: "#ff5a36", acc2: "#f5b841" },
  { name: "RED", acc: "#ff2238", acc2: "#ff6b4a" },
  { name: "AMBER", acc: "#f5a623", acc2: "#ff5a36" },
  { name: "JADE", acc: "#2ee59d", acc2: "#f5b841" },
  { name: "CRIMSON", acc: "#ff3b5c", acc2: "#ff9e44" },
  { name: "MONO", acc: "#e8e2d5", acc2: "#9c9488" },
];

export function applyPalette(p: Palette) {
  const s = document.documentElement.style;
  s.setProperty("--acc", p.acc);
  s.setProperty("--acc2", p.acc2);
}
