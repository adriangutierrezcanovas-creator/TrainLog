// SVGs inline stroke-based (estilo lucide) para no depender de npm/lucide-react.
// icon(name, {size, color, strokeWidth}) -> string HTML de un <svg>.

const ICON_PATHS = {
  minus: '<line x1="5" y1="12" x2="19" y2="12"/>',
  plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
  check: '<polyline points="20 6 9 17 4 12"/>',
  "chevron-left": '<polyline points="15 18 9 12 15 6"/>',
  x: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
  "arrow-right": '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>',
  download:
    '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
  timer:
    '<line x1="10" y1="2" x2="14" y2="2"/><line x1="12" y1="14" x2="15" y2="11"/><circle cx="12" cy="14" r="8"/>',
  dumbbell:
    '<path d="M6.5 6.5 17.5 17.5"/><path d="M4.6 4.6a2 2 0 1 1 2.8 2.8L4.6 10.2a2 2 0 1 1-2.8-2.8z"/><path d="M19.4 19.4a2 2 0 1 1-2.8-2.8l2.8-2.8a2 2 0 1 1 2.8 2.8z"/><path d="M2.8 9.2 4.6 11" /><path d="M9.2 2.8 11 4.6"/><path d="M13 19.4l1.8 1.8"/><path d="M19.4 13l1.8 1.8"/>',
  history: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
  gauge: '<path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>',
  target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
};

function icon(name, opts) {
  opts = opts || {};
  const size = opts.size || 24;
  const color = opts.color || "currentColor";
  const strokeWidth = opts.strokeWidth || 2;
  const path = ICON_PATHS[name];
  if (!path) return "";
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
}
