/**
 * Dev-only art generator: draws cohesive, boutique-style crochet product
 * artwork as SVG and renders it to WebP for /public/images.
 *
 * Run:  node scripts/generate-art.mjs
 *
 * The output is intentionally easy to replace with real product photography
 * later (same paths, same file names).
 */
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const PUBLIC = path.join(process.cwd(), "public", "images");
const MASTER = path.join(process.cwd(), ".cache", "masters");

/* ------------------------------------------------------------------ palette */
const C = {
  cream: "#F7F1E7",
  creamDeep: "#EDE0CE",
  linen: "#F2E9DC",
  blush: "#F3DED8",
  blushDeep: "#E9C7BF",
  rose: "#D89A94",
  roseDeep: "#B9736C",
  wine: "#9E5A57",
  sage: "#AEBBA3",
  sageDeep: "#7E9070",
  leaf: "#6F8263",
  mustard: "#E4B778",
  honey: "#D89A4F",
  terracotta: "#C98063",
  kraft: "#DCC3A1",
  kraftDeep: "#C4A57F",
  cocoa: "#8A6A56",
  cocoaDeep: "#5E4739",
  ink: "#3D3129",
  white: "#FCFAF5",
  gold: "#C9A227",
  sky: "#B7C7CE",
};

/* ------------------------------------------------------------------ helpers */
const f = (n) => Math.round(n * 100) / 100;

function defs({ w, h, bg1, bg2 }) {
  return `<defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.35" y2="1">
      <stop offset="0" stop-color="${bg1}"/><stop offset="1" stop-color="${bg2}"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0.32" r="0.72">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.6"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="vig" cx="0.5" cy="0.44" r="0.78">
      <stop offset="0.55" stop-color="#000000" stop-opacity="0"/>
      <stop offset="1" stop-color="#4A372B" stop-opacity="0.18"/>
    </radialGradient>
    <filter id="blurL" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="26"/>
    </filter>
    <filter id="blurS" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="10"/>
    </filter>
    <filter id="drop" x="-40%" y="-40%" width="200%" height="200%">
      <feDropShadow dx="0" dy="26" stdDeviation="26" flood-color="#5B463A" flood-opacity="0.22"/>
    </filter>
    ${stitch("st", 1)}
    ${stitch("stS", 0.72)}
    ${stitch("stL", 1.45)}
    <pattern id="rib" width="26" height="26" patternUnits="userSpaceOnUse">
      <path d="M-4 6 Q 6 0 16 6 T 36 6" fill="none" stroke="#000" stroke-opacity="0.14" stroke-width="4" stroke-linecap="round"/>
      <path d="M-4 19 Q 6 13 16 19 T 36 19" fill="none" stroke="#000" stroke-opacity="0.1" stroke-width="4" stroke-linecap="round"/>
    </pattern>
    <pattern id="granny" width="150" height="150" patternUnits="userSpaceOnUse">
      <rect width="150" height="150" fill="none"/>
      <rect x="6" y="6" width="138" height="138" fill="none" stroke="#000" stroke-opacity="0.12" stroke-width="6" rx="14"/>
      <circle cx="75" cy="75" r="34" fill="none" stroke="#000" stroke-opacity="0.1" stroke-width="7" stroke-dasharray="12 14"/>
    </pattern>
    <radialGradient id="floor" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#6B5346" stop-opacity="0.34"/>
      <stop offset="1" stop-color="#6B5346" stop-opacity="0"/>
    </radialGradient>
  </defs>`;
}

function stitch(id, s = 1) {
  const w = 18 * s;
  const h = 14 * s;
  const chev = (x, y) =>
    `M${f(x - 6 * s)} ${f(y + 5 * s)} L${f(x)} ${f(y - 4 * s)} L${f(x + 6 * s)} ${f(y + 5 * s)}`;
  return `<pattern id="${id}" width="${f(w)}" height="${f(h)}" patternUnits="userSpaceOnUse">
      <path d="${chev(3 * s, 5 * s)} ${chev(12 * s, 5 * s)} ${chev(21 * s, 5 * s)}" fill="none" stroke="#4A372B" stroke-opacity="0.5" stroke-width="${f(2.2 * s)}" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="${chev(-6 * s, 15 * s)} ${chev(3 * s, 15 * s)} ${chev(12 * s, 15 * s)} ${chev(21 * s, 15 * s)}" fill="none" stroke="#4A372B" stroke-opacity="0.34" stroke-width="${f(2.2 * s)}" stroke-linecap="round" stroke-linejoin="round"/>
    </pattern>`;
}

/** fill + stitch texture overlay for a path */
const p = (d, fill, { tex = "st", texOpacity = 0.4, stroke = "none", sw = 0, so = 0.16 } = {}) =>
  `<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-opacity="${so}"/>
   ${tex ? `<path d="${d}" fill="url(#${tex})" opacity="${texOpacity}"/>` : ""}`;

const ellipse = (cx, cy, rx, ry, fill, extra = "") =>
  `<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(rx)}" ry="${f(ry)}" fill="${fill}" ${extra}/>`;

const floorShadow = (cx, cy, rx, ry) =>
  `<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(rx)}" ry="${f(ry)}" fill="url(#floor)"/>`;

function frame(w, h, body, bg1 = C.cream, bg2 = C.creamDeep) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    ${defs({ w, h, bg1, bg2 })}
    <rect width="${w}" height="${h}" fill="url(#bg)"/>
    <rect width="${w}" height="${h}" fill="url(#glow)"/>
    ${body}
    <rect width="${w}" height="${h}" fill="url(#vig)"/>
  </svg>`;
}

/* ------------------------------------------------------------ flower pieces */
function daisy(cx, cy, r, { petal = C.white, center = C.mustard } = {}) {
  let out = "";
  for (let i = 0; i < 12; i++) {
    const a = i * 30;
    out += `<ellipse cx="0" cy="${f(-r * 0.62)}" rx="${f(r * 0.2)}" ry="${f(r * 0.46)}" fill="${petal}" stroke="#D9CBB8" stroke-width="2" transform="rotate(${a})"/>`;
  }
  for (let i = 0; i < 12; i++) {
    const a = i * 30 + 15;
    out += `<ellipse cx="0" cy="${f(-r * 0.5)}" rx="${f(r * 0.16)}" ry="${f(r * 0.34)}" fill="${petal}" opacity="0.92" transform="rotate(${a})"/>`;
  }
  out += `<circle r="${f(r * 0.27)}" fill="${center}"/>
    <circle r="${f(r * 0.27)}" fill="url(#stS)" opacity="0.5"/>
    <circle r="${f(r * 0.27)}" fill="none" stroke="#B98531" stroke-width="3" stroke-opacity="0.5"/>`;
  return `<g transform="translate(${f(cx)},${f(cy)})">${out}</g>`;
}

function rose(cx, cy, r, color, deep) {
  let outer = "";
  for (let i = 0; i < 6; i++) {
    const a = i * 60 + 30;
    outer += `<path d="M0 ${f(-r * 0.2)} C ${f(r * 0.5)} ${f(-r * 0.9)} ${f(r * 1.05)} ${f(-r * 0.5)} ${f(r * 0.95)} ${f(r * 0.05)} C ${f(r * 0.85)} ${f(r * 0.55)} ${f(r * 0.35)} ${f(r * 0.6)} 0 ${f(r * 0.2)} Z" fill="${deep}" opacity="0.95" transform="rotate(${f(a)})"/>`;
  }
  let petals = "";
  for (let i = 0; i < 6; i++) {
    const a = i * 60;
    petals += `<path d="M0 0 C ${f(r * 0.6)} ${f(-r * 0.34)} ${f(r * 0.68)} ${f(r * 0.46)} 0 ${f(r * 0.62)} C ${f(-r * 0.68)} ${f(r * 0.46)} ${f(-r * 0.6)} ${f(-r * 0.34)} 0 0 Z" fill="${color}" transform="rotate(${f(a)})"/>`;
  }
  let swirl = "";
  for (let i = 3; i >= 1; i--) {
    const rr = (r * i) / 3.4;
    swirl += `<path d="M ${f(-rr)} 0 A ${f(rr)} ${f(rr * 0.78)} 0 1 1 ${f(rr * 0.6)} ${f(rr * 0.55)}" fill="none" stroke="${deep}" stroke-opacity="0.75" stroke-width="${f(r * 0.1)}" stroke-linecap="round"/>`;
  }
  return `<g transform="translate(${f(cx)},${f(cy)})">
    <g>${outer}</g>
    <circle r="${f(r * 0.84)}" fill="${color}"/>
    <g>${petals}</g>
    <circle r="${f(r * 0.84)}" fill="url(#st)" opacity="0.35"/>
    ${swirl}
    <circle r="${f(r * 0.16)}" fill="${deep}" opacity="0.8"/>
  </g>`;
}

function tulipHead(cx, cy, r, color, deep, rot = 0) {
  const d = `M ${f(-r)} ${f(-r * 0.1)} C ${f(-r * 1.02)} ${f(r * 0.7)} ${f(-r * 0.5)} ${f(r)} 0 ${f(r)}
    C ${f(r * 0.5)} ${f(r)} ${f(r * 1.02)} ${f(r * 0.7)} ${f(r)} ${f(-r * 0.1)}
    C ${f(r * 0.9)} ${f(-r * 0.5)} ${f(r * 0.55)} ${f(-r * 0.35)} ${f(r * 0.42)} ${f(-r * 0.62)}
    C ${f(r * 0.2)} ${f(-r * 0.95)} ${f(r * 0.1)} ${f(-r * 0.45)} 0 ${f(-r * 0.78)}
    C ${f(-r * 0.1)} ${f(-r * 0.45)} ${f(-r * 0.2)} ${f(-r * 0.95)} ${f(-r * 0.42)} ${f(-r * 0.62)}
    C ${f(-r * 0.55)} ${f(-r * 0.35)} ${f(-r * 0.9)} ${f(-r * 0.5)} ${f(-r)} ${f(-r * 0.1)} Z`;
  return `<g transform="translate(${f(cx)},${f(cy)}) rotate(${rot})">
    ${p(d, color, { texOpacity: 0.32 })}
    <path d="M ${f(-r * 0.34)} ${f(-r * 0.55)} C ${f(-r * 0.3)} ${f(r * 0.2)} ${f(-r * 0.2)} ${f(r * 0.6)} ${f(-r * 0.1)} ${f(r * 0.9)}" fill="none" stroke="${deep}" stroke-opacity="0.55" stroke-width="${f(r * 0.1)}" stroke-linecap="round"/>
    <path d="M ${f(r * 0.34)} ${f(-r * 0.55)} C ${f(r * 0.3)} ${f(r * 0.2)} ${f(r * 0.2)} ${f(r * 0.6)} ${f(r * 0.1)} ${f(r * 0.9)}" fill="none" stroke="${deep}" stroke-opacity="0.45" stroke-width="${f(r * 0.1)}" stroke-linecap="round"/>
  </g>`;
}

const stem = (x1, y1, x2, y2, w = 14) =>
  `<path d="M ${f(x1)} ${f(y1)} Q ${f((x1 + x2) / 2 + 24)} ${f((y1 + y2) / 2)} ${f(x2)} ${f(y2)}" fill="none" stroke="${C.leaf}" stroke-width="${w}" stroke-linecap="round"/>`;

const leafShape = (x, y, s, rot) =>
  `<g transform="translate(${f(x)},${f(y)}) rotate(${rot}) scale(${s})">
    ${p("M0 0 C 46 -40 110 -26 130 6 C 96 44 34 44 0 0 Z", C.leaf, { texOpacity: 0.25 })}
    <path d="M0 0 C 44 -6 92 2 128 8" fill="none" stroke="#4F6047" stroke-opacity="0.5" stroke-width="4"/>
  </g>`;

function wrapCone(cx, cy, s, fill = C.kraft) {
  const d = `M -190 -150 L 190 -150 L 66 330 C 40 372 -40 372 -66 330 Z`;
  return `<g transform="translate(${f(cx)},${f(cy)}) scale(${s})">
    ${p(d, fill, { tex: "stL", texOpacity: 0.22, stroke: C.kraftDeep, sw: 4, so: 0.5 })}
    <path d="M -190 -150 L -22 -150 L -66 330 C -92 300 -140 40 -190 -150 Z" fill="#000000" opacity="0.07"/>
    <path d="M 190 -150 L 40 -150 L 66 330 C 110 260 160 40 190 -150 Z" fill="#ffffff" opacity="0.16"/>
    <path d="M -196 -150 L -120 -232 L -40 -152 Z" fill="${C.kraftDeep}" opacity="0.85"/>
    <path d="M 196 -150 L 120 -232 L 40 -152 Z" fill="${C.kraftDeep}" opacity="0.7"/>
    <g>
      <path d="M -170 40 L 170 40 L 158 96 L -158 96 Z" fill="${C.roseDeep}" opacity="0.95"/>
      <path d="M -170 40 L 170 40 L 158 96 L -158 96 Z" fill="url(#st)" opacity="0.3"/>
      <circle cx="0" cy="68" r="26" fill="${C.wine}"/>
      <path d="M -6 96 L -58 190 L -6 168 Z" fill="${C.roseDeep}"/>
      <path d="M 6 96 L 58 190 L 6 168 Z" fill="${C.roseDeep}" opacity="0.85"/>
    </g>
  </g>`;
}

/* ------------------------------------------------------------------ objects */
function bouquetDaisy(W, H) {
  const cx = W / 2;
  const base = H * 0.72;
  let stems = "";
  const heads = [
    [cx - 250, H * 0.3],
    [cx - 118, H * 0.21],
    [cx + 8, H * 0.26],
    [cx + 140, H * 0.185],
    [cx + 268, H * 0.305],
    [cx - 60, H * 0.38],
    [cx + 90, H * 0.39],
  ];
  for (const [hx, hy] of heads) stems += stem(hx, hy + 40, cx + (hx - cx) * 0.18, base + 40, 15);
  return `${floorShadow(cx, H * 0.9, 380, 60)}
    <g filter="url(#drop)">
      ${stems}
      ${leafShape(cx - 300, H * 0.44, 1.05, -24)}
      ${leafShape(cx + 170, H * 0.42, 1.1, 20)}
      ${leafShape(cx - 120, H * 0.5, 0.85, -8)}
      ${wrapCone(cx, base, 1.25)}
      ${heads.map(([hx, hy], i) => daisy(hx, hy, 96 + (i % 3) * 8)).join("")}
    </g>`;
}

function bouquetRose(W, H) {
  const cx = W / 2;
  const base = H * 0.73;
  const heads = [
    [cx - 240, H * 0.29, C.rose, C.roseDeep],
    [cx - 90, H * 0.2, C.blushDeep, C.rose],
    [cx + 60, H * 0.25, C.wine, C.roseDeep],
    [cx + 210, H * 0.3, C.rose, C.wine],
    [cx - 30, H * 0.37, C.blushDeep, C.roseDeep],
    [cx + 130, H * 0.4, C.roseDeep, C.rose],
  ];
  let stems = "";
  for (const [hx, hy] of heads) stems += stem(hx, hy + 50, cx + (hx - cx) * 0.2, base + 40, 15);
  return `${floorShadow(cx, H * 0.9, 380, 60)}
    <g filter="url(#drop)">
      ${stems}
      ${leafShape(cx - 290, H * 0.46, 1.0, -26)}
      ${leafShape(cx + 190, H * 0.45, 1.0, 22)}
      ${wrapCone(cx, base, 1.25, C.linen)}
      ${heads.map(([hx, hy, a, b]) => rose(hx, hy, 84, a, b)).join("")}
    </g>`;
}

function bouquetTulip(W, H) {
  const cx = W / 2;
  const base = H * 0.73;
  const heads = [
    [cx - 230, H * 0.3, C.rose, C.roseDeep, -14],
    [cx - 70, H * 0.2, C.blushDeep, C.rose, -4],
    [cx + 80, H * 0.245, C.wine, C.roseDeep, 6],
    [cx + 230, H * 0.32, C.blush, C.rose, 15],
    [cx + 10, H * 0.4, C.rose, C.wine, 2],
  ];
  let stems = "";
  for (const [hx, hy] of heads) stems += stem(hx, hy + 60, cx + (hx - cx) * 0.2, base + 40, 15);
  return `${floorShadow(cx, H * 0.9, 380, 60)}
    <g filter="url(#drop)">
      ${stems}
      ${leafShape(cx - 300, H * 0.5, 1.15, -30)}
      ${leafShape(cx + 160, H * 0.48, 1.2, 26)}
      ${leafShape(cx - 40, H * 0.55, 0.9, -6)}
      ${wrapCone(cx, base, 1.25, C.linen)}
      ${heads.map(([hx, hy, a, b, r]) => tulipHead(hx, hy, 92, a, b, r)).join("")}
    </g>`;
}

function toteBag(W, H) {
  const cx = W / 2;
  const top = H * 0.42;
  const body = `M ${cx - 340} ${top} L ${cx + 340} ${top} L ${cx + 296} ${top + 560} Q ${cx} ${top + 620} ${cx - 296} ${top + 560} Z`;
  return `${floorShadow(cx, top + 640, 400, 62)}
    <g filter="url(#drop)">
      <path d="M ${cx - 210} ${top + 20} C ${cx - 240} ${top - 220} ${cx + 240} ${top - 220} ${cx + 210} ${top + 20}" fill="none" stroke="${C.cocoa}" stroke-width="34" stroke-linecap="round"/>
      <path d="M ${cx - 210} ${top + 20} C ${cx - 240} ${top - 220} ${cx + 240} ${top - 220} ${cx + 210} ${top + 20}" fill="none" stroke="url(#stL)" stroke-width="34" stroke-linecap="round" opacity="0.5"/>
      <path d="M ${cx - 150} ${top + 20} C ${cx - 172} ${top - 150} ${cx + 172} ${top - 150} ${cx + 150} ${top + 20}" fill="none" stroke="${C.cocoaDeep}" stroke-width="26" stroke-linecap="round" opacity="0.9"/>
      ${p(body, C.linen, { tex: "stL", texOpacity: 0.5, stroke: C.kraftDeep, sw: 5, so: 0.4 })}
      <path d="M ${cx - 340} ${top} L ${cx + 340} ${top} L ${cx + 330} ${top + 66} L ${cx - 330} ${top + 66} Z" fill="${C.rose}"/>
      <path d="M ${cx - 340} ${top} L ${cx + 340} ${top} L ${cx + 330} ${top + 66} L ${cx - 330} ${top + 66} Z" fill="url(#st)" opacity="0.35"/>
      <g transform="translate(${cx},${top + 330})">
        ${daisy(0, 0, 86, { petal: C.white, center: C.mustard })}
      </g>
      <path d="M ${cx - 296} ${top + 560} Q ${cx} ${top + 620} ${cx + 296} ${top + 560}" fill="none" stroke="${C.kraftDeep}" stroke-width="8" opacity="0.5"/>
    </g>`;
}

function miniHandbag(W, H) {
  const cx = W / 2;
  const top = H * 0.46;
  const body = `M ${cx - 300} ${top} L ${cx + 300} ${top} L ${cx + 268} ${top + 380} Q ${cx} ${top + 450} ${cx - 268} ${top + 380} Z`;
  return `${floorShadow(cx, top + 470, 360, 56)}
    <g filter="url(#drop)">
      <path d="M ${cx - 150} ${top + 10} C ${cx - 170} ${top - 170} ${cx + 170} ${top - 170} ${cx + 150} ${top + 10}" fill="none" stroke="${C.cocoa}" stroke-width="30" stroke-linecap="round"/>
      ${p(body, C.blushDeep, { tex: "stL", texOpacity: 0.42, stroke: C.roseDeep, sw: 5, so: 0.35 })}
      <path d="M ${cx - 300} ${top} L ${cx + 300} ${top} L ${cx + 286} ${top + 130} L ${cx - 286} ${top + 130} Z" fill="${C.rose}" opacity="0.92"/>
      <path d="M ${cx - 300} ${top} L ${cx + 300} ${top} L ${cx + 286} ${top + 130} L ${cx - 286} ${top + 130} Z" fill="url(#st)" opacity="0.3"/>
      <g transform="translate(${cx},${top + 250})">
        ${rose(0, 0, 66, C.cream, C.blush)}
      </g>
      <circle cx="${cx}" cy="${top + 130}" r="16" fill="${C.gold}"/>
    </g>`;
}

function teddyBear(W, H) {
  const cx = W / 2;
  const gy = H * 0.86;
  const fur = C.mustard;
  const furDeep = "#C89349";
  return `${floorShadow(cx, gy, 340, 56)}
    <g filter="url(#drop)">
      <g transform="translate(${cx},${H * 0.42})">
        <ellipse cx="0" cy="${H * 0.24}" rx="215" ry="205" fill="${fur}"/>
        <ellipse cx="0" cy="${H * 0.24}" rx="215" ry="205" fill="url(#st)" opacity="0.42"/>
        <ellipse cx="-185" cy="${-H * 0.115}" rx="72" ry="72" fill="${fur}"/>
        <ellipse cx="185" cy="${-H * 0.115}" rx="72" ry="72" fill="${fur}"/>
        <ellipse cx="-185" cy="${-H * 0.115}" rx="40" ry="40" fill="${C.rose}"/>
        <ellipse cx="185" cy="${-H * 0.115}" rx="40" ry="40" fill="${C.rose}"/>
        <ellipse cx="-238" cy="${H * 0.2}" rx="78" ry="58" fill="${furDeep}" transform="rotate(-18 -238 ${(H * 0.2).toFixed(0)})"/>
        <ellipse cx="238" cy="${H * 0.2}" rx="78" ry="58" fill="${furDeep}" transform="rotate(18 238 ${(H * 0.2).toFixed(0)})"/>
        <ellipse cx="-118" cy="${H * 0.42}" rx="86" ry="66" fill="${furDeep}"/>
        <ellipse cx="118" cy="${H * 0.42}" rx="86" ry="66" fill="${furDeep}"/>
        <circle r="215" fill="${fur}"/>
        <circle r="215" fill="url(#st)" opacity="0.4"/>
        <ellipse cx="0" cy="46" rx="96" ry="74" fill="${C.white}" opacity="0.92"/>
        <ellipse cx="0" cy="18" rx="34" ry="26" fill="${C.cocoaDeep}"/>
        <path d="M0 36 L0 62 M0 62 Q -22 82 -44 66 M0 62 Q 22 82 44 66" fill="none" stroke="${C.cocoaDeep}" stroke-width="9" stroke-linecap="round"/>
        <ellipse cx="-74" cy="-32" rx="17" ry="21" fill="${C.ink}"/>
        <ellipse cx="74" cy="-32" rx="17" ry="21" fill="${C.ink}"/>
        <circle cx="-68" cy="-40" r="6" fill="#ffffff" opacity="0.9"/>
        <circle cx="80" cy="-40" r="6" fill="#ffffff" opacity="0.9"/>
        <ellipse cx="-118" cy="58" rx="34" ry="22" fill="${C.rose}" opacity="0.5"/>
        <ellipse cx="118" cy="58" rx="34" ry="22" fill="${C.rose}" opacity="0.5"/>
        <path d="M -150 170 Q 0 226 150 170" fill="none" stroke="${C.roseDeep}" stroke-width="12" stroke-linecap="round" stroke-dasharray="4 26"/>
      </g>
      <g transform="translate(${cx},${H * 0.42})">
        <ellipse cx="0" cy="${H * 0.255}" rx="150" ry="120" fill="${C.white}" opacity="0.35"/>
      </g>
    </g>`;
}

function bunny(W, H) {
  const cx = W / 2;
  const gy = H * 0.87;
  const fur = C.white;
  const furShade = C.linen;
  return `${floorShadow(cx, gy, 320, 54)}
    <g filter="url(#drop)">
      <g transform="translate(${cx},${H * 0.5})">
        <g transform="translate(-88,-250)">
          <ellipse cx="0" cy="-130" rx="62" ry="165" fill="${fur}" stroke="${C.blushDeep}" stroke-width="4"/>
          <ellipse cx="0" cy="-126" rx="30" ry="112" fill="${C.rose}" opacity="0.55"/>
        </g>
        <g transform="translate(88,-250)">
          <ellipse cx="0" cy="-130" rx="62" ry="165" fill="${fur}" stroke="${C.blushDeep}" stroke-width="4"/>
          <ellipse cx="0" cy="-126" rx="30" ry="112" fill="${C.rose}" opacity="0.55"/>
        </g>
        <ellipse cx="0" cy="${H * 0.2}" rx="195" ry="185" fill="${furShade}"/>
        <ellipse cx="0" cy="${H * 0.2}" rx="195" ry="185" fill="url(#st)" opacity="0.35"/>
        <ellipse cx="-190" cy="${H * 0.21}" rx="58" ry="72" fill="${fur}" stroke="${C.blushDeep}" stroke-width="4"/>
        <ellipse cx="190" cy="${H * 0.21}" rx="58" ry="72" fill="${fur}" stroke="${C.blushDeep}" stroke-width="4"/>
        <circle r="180" fill="${fur}"/>
        <circle r="180" fill="url(#st)" opacity="0.35"/>
        <ellipse cx="0" cy="40" rx="78" ry="58" fill="${C.white}"/>
        <path d="M0 14 L -18 34 L 18 34 Z" fill="${C.roseDeep}"/>
        <path d="M0 34 L0 54 M0 54 Q -24 74 -46 58 M0 54 Q 24 74 46 58" fill="none" stroke="${C.cocoaDeep}" stroke-width="8" stroke-linecap="round"/>
        <ellipse cx="-64" cy="-24" rx="15" ry="19" fill="${C.ink}"/>
        <ellipse cx="64" cy="-24" rx="15" ry="19" fill="${C.ink}"/>
        <circle cx="-59" cy="-31" r="5" fill="#ffffff"/>
        <circle cx="69" cy="-31" r="5" fill="#ffffff"/>
        <ellipse cx="-104" cy="46" rx="30" ry="19" fill="${C.rose}" opacity="0.5"/>
        <ellipse cx="104" cy="46" rx="30" ry="19" fill="${C.rose}" opacity="0.5"/>
        <path d="M -130 150 Q 0 196 130 150" fill="none" stroke="${C.rose}" stroke-width="11" stroke-linecap="round" stroke-dasharray="4 24"/>
        <ellipse cx="0" cy="${H * 0.31}" rx="86" ry="72" fill="${C.white}" opacity="0.85"/>
      </g>
    </g>`;
}

function flowerKeychain(W, H) {
  const cx = W / 2;
  const cy = H * 0.56;
  return `${floorShadow(cx, H * 0.84, 250, 46)}
    <g filter="url(#drop)">
      <path d="M ${cx} ${cy - 150} C ${cx + 10} ${cy - 260} ${cx + 120} ${cy - 300} ${cx + 170} ${cy - 330}" fill="none" stroke="${C.gold}" stroke-width="16" stroke-linecap="round"/>
      <g transform="translate(${cx + 196},${cy - 356})">
        <ellipse rx="62" ry="74" fill="none" stroke="${C.gold}" stroke-width="20"/>
        <ellipse rx="62" ry="74" fill="none" stroke="#F2DD9A" stroke-width="7" opacity="0.8"/>
      </g>
      <path d="M ${cx - 130} ${cy + 120} C ${cx - 60} ${cy + 190} ${cx + 60} ${cy + 190} ${cx + 130} ${cy + 120}" fill="none" stroke="${C.leaf}" stroke-width="26" stroke-linecap="round"/>
      ${leafShape(cx - 250, cy + 108, 1.0, -160)}
      ${daisy(cx, cy, 210, { petal: C.mustard, center: C.terracotta })}
      <g transform="translate(${cx},${cy})">
        <circle r="56" fill="${C.terracotta}"/>
        <circle r="56" fill="url(#stS)" opacity="0.55"/>
        <circle r="56" fill="none" stroke="#A9674B" stroke-width="6" stroke-opacity="0.6"/>
      </g>
    </g>`;
}

function heartKeychain(W, H) {
  const cx = W / 2;
  const cy = H * 0.62;
  const heartPath =
    "M0 84 C -44 30 -132 -14 -132 -84 C -132 -140 -86 -168 -46 -152 C -22 -142 -6 -124 0 -108 C 6 -124 22 -142 46 -152 C 86 -168 132 -140 132 -84 C 132 -14 44 30 0 84 Z";
  return `${floorShadow(cx, H * 0.85, 250, 46)}
    <g filter="url(#drop)">
      <path d="M ${cx - 4} ${cy - 150} C ${cx - 10} ${cy - 250} ${cx - 110} ${cy - 292} ${cx - 156} ${cy - 330}" fill="none" stroke="${C.gold}" stroke-width="16" stroke-linecap="round"/>
      <path d="M ${cx - 4} ${cy - 150} C ${cx - 10} ${cy - 250} ${cx - 110} ${cy - 292} ${cx - 156} ${cy - 330}" fill="none" stroke="#F2DD9A" stroke-width="6" stroke-linecap="round" opacity="0.7"/>
      <g transform="translate(${cx - 186},${cy - 358}) rotate(-24)">
        <ellipse rx="60" ry="74" fill="none" stroke="${C.gold}" stroke-width="20"/>
        <ellipse rx="60" ry="74" fill="none" stroke="#F2DD9A" stroke-width="7" opacity="0.8"/>
      </g>
      <g transform="translate(${cx},${cy}) scale(1.4)">
        ${p(heartPath, C.rose, { texOpacity: 0.42, stroke: C.roseDeep, sw: 6, so: 0.45 })}
        <path d="${heartPath}" fill="none" stroke="${C.white}" stroke-width="7" stroke-dasharray="3 20" stroke-opacity="0.75" transform="scale(0.86)"/>
        <path d="M -74 -60 C -66 -96 -34 -116 -8 -108" fill="none" stroke="${C.white}" stroke-opacity="0.55" stroke-width="16" stroke-linecap="round"/>
      </g>
      <g transform="translate(${cx - 118},${cy - 74}) rotate(-30)">${leafShape(0, 0, 0.72, 0)}</g>
    </g>`;
}

function coasters(W, H) {
  const cx = W / 2;
  const one = (x, y, c, d, rot = 0) => `<g transform="translate(${f(x)},${f(y)}) rotate(${rot})">
      <ellipse cx="0" cy="66" rx="196" ry="46" fill="#6B5346" opacity="0.16" filter="url(#blurS)"/>
      <ellipse rx="186" ry="66" fill="${c}"/>
      <ellipse rx="186" ry="66" fill="url(#st)" opacity="0.45"/>
      <ellipse rx="150" ry="52" fill="none" stroke="${d}" stroke-width="9" stroke-dasharray="18 16" opacity="0.75"/>
      <ellipse rx="104" ry="36" fill="none" stroke="${d}" stroke-width="9" stroke-dasharray="18 16" opacity="0.6"/>
      <ellipse rx="58" ry="20" fill="${d}" opacity="0.5"/>
      <ellipse rx="58" ry="20" fill="url(#stS)" opacity="0.5"/>
    </g>`;
  return `${floorShadow(cx, H * 0.76, 430, 76)}
    <g filter="url(#drop)">
      ${one(cx - 215, H * 0.6, C.sage, C.sageDeep, -8)}
      ${one(cx + 220, H * 0.56, C.white, C.kraftDeep, 7)}
      ${one(cx + 95, H * 0.68, C.blush, C.rose, 4)}
      <g transform="translate(${cx - 75},${H * 0.52}) rotate(-6)">
        <ellipse cx="0" cy="66" rx="200" ry="48" fill="#6B5346" opacity="0.18" filter="url(#blurS)"/>
        <ellipse rx="192" ry="68" fill="${C.rose}"/>
        <ellipse rx="192" ry="68" fill="url(#st)" opacity="0.45"/>
        <ellipse rx="152" ry="54" fill="none" stroke="${C.wine}" stroke-width="9" stroke-dasharray="18 16" opacity="0.7"/>
        <ellipse rx="104" ry="36" fill="none" stroke="${C.wine}" stroke-width="9" stroke-dasharray="18 16" opacity="0.55"/>
        <ellipse rx="58" ry="22" fill="${C.wine}" opacity="0.55"/>
        <ellipse rx="58" ry="22" fill="url(#stS)" opacity="0.5"/>
      </g>
    </g>`;
}

function tableDecor(W, H) {
  const cx = W / 2;
  const top = H * 0.52;
  const vase = `M ${cx - 130} ${top} C ${cx - 176} ${top + 150} ${cx - 150} ${top + 330} ${cx - 92} ${top + 380} L ${cx + 92} ${top + 380} C ${cx + 150} ${top + 330} ${cx + 176} ${top + 150} ${cx + 130} ${top} Z`;
  const heads = [
    [cx - 165, top - 250, C.rose, C.roseDeep],
    [cx, top - 330, C.blushDeep, C.rose],
    [cx + 165, top - 240, C.wine, C.roseDeep],
    [cx - 78, top - 140, C.white, C.mustard],
    [cx + 84, top - 130, C.mustard, C.terracotta],
  ];
  let stems = "";
  for (const [hx, hy] of heads) stems += stem(hx, hy + 40, cx + (hx - cx) * 0.25, top + 40, 13);
  return `${floorShadow(cx, H * 0.86, 420, 62)}
    <g filter="url(#drop)">
      <ellipse cx="${cx}" cy="${H * 0.84}" rx="430" ry="88" fill="${C.white}"/>
      <ellipse cx="${cx}" cy="${H * 0.84}" rx="430" ry="88" fill="url(#st)" opacity="0.4"/>
      <ellipse cx="${cx}" cy="${H * 0.84}" rx="330" ry="66" fill="none" stroke="${C.roseDeep}" stroke-width="8" stroke-dasharray="20 18" opacity="0.65"/>
      <ellipse cx="${cx}" cy="${H * 0.84}" rx="220" ry="44" fill="none" stroke="${C.roseDeep}" stroke-width="8" stroke-dasharray="20 18" opacity="0.5"/>
      ${stems}
      ${leafShape(cx - 240, top - 60, 0.9, -150)}
      ${leafShape(cx + 150, top - 40, 0.9, -30)}
      ${p(vase, C.linen, { tex: "stL", texOpacity: 0.4, stroke: C.kraftDeep, sw: 5, so: 0.4 })}
      <path d="M ${cx - 130} ${top} L ${cx + 130} ${top} L ${cx + 118} ${top + 54} L ${cx - 118} ${top + 54} Z" fill="${C.rose}"/>
      <path d="M ${cx - 130} ${top} L ${cx + 130} ${top} L ${cx + 118} ${top + 54} L ${cx - 118} ${top + 54} Z" fill="url(#st)" opacity="0.35"/>
      ${heads.map(([hx, hy, a, b]) =>
        hx === cx - 78 || a === C.white
          ? daisy(hx, hy, 74, { petal: C.white, center: C.mustard })
          : rose(hx, hy, 74, a, b),
      ).join("")}
    </g>`;
}

function babyBlanket(W, H) {
  const cx = W / 2;
  const top = H * 0.3;
  const body = `M ${cx - 350} ${top} L ${cx + 350} ${top} L ${cx + 330} ${top + 480} Q ${cx} ${top + 560} ${cx - 330} ${top + 480} Z`;
  return `${floorShadow(cx, H * 0.84, 420, 60)}
    <g filter="url(#drop)">
      <path d="M ${cx - 350} ${top + 30} Q ${cx} ${top + 110} ${cx + 350} ${top + 30} L ${cx + 350} ${top + 120} Q ${cx} ${top + 200} ${cx - 350} ${top + 120} Z" fill="${C.blushDeep}" opacity="0.9"/>
      ${p(body, C.white, { tex: "granny", texOpacity: 0.75, stroke: C.kraftDeep, sw: 5, so: 0.35 })}
      <path d="M ${cx - 350} ${top} L ${cx + 350} ${top} L ${cx + 348} ${top + 44} L ${cx - 348} ${top + 44} Z" fill="${C.sage}"/>
      <path d="M ${cx - 348} ${top + 470} Q ${cx} ${top + 548} ${cx + 348} ${top + 470}" fill="none" stroke="${C.rose}" stroke-width="30"/>
      <path d="M ${cx - 348} ${top + 470} Q ${cx} ${top + 548} ${cx + 348} ${top + 470}" fill="none" stroke="url(#st)" stroke-width="30" opacity="0.4"/>
      <g transform="translate(${cx + 168},${top + 430})">${daisy(0, 0, 78, { petal: C.white, center: C.mustard })}</g>
      <g transform="translate(${cx - 232},${top + 446})">
        ${rose(0, 0, 62, C.rose, C.roseDeep)}
      </g>
    </g>`;
}

function giftBox(W, H) {
  const cx = W / 2;
  const top = H * 0.46;
  const box = `M ${cx - 320} ${top} L ${cx + 320} ${top} L ${cx + 300} ${top + 400} L ${cx - 300} ${top + 400} Z`;
  return `${floorShadow(cx, top + 470, 400, 60)}
    <g filter="url(#drop)">
      ${p(box, C.kraft, { tex: "stL", texOpacity: 0.4, stroke: C.kraftDeep, sw: 5, so: 0.4 })}
      <rect x="${cx - 78}" y="${top}" width="156" height="${400}" fill="${C.rose}"/>
      <rect x="${cx - 78}" y="${top}" width="156" height="400" fill="url(#st)" opacity="0.35"/>
      <path d="M ${cx - 340} ${top - 76} L ${cx + 340} ${top - 76} L ${cx + 320} ${top + 44} L ${cx - 320} ${top + 44} Z" fill="${C.blushDeep}"/>
      <path d="M ${cx - 340} ${top - 76} L ${cx + 340} ${top - 76} L ${cx + 320} ${top + 44} L ${cx - 320} ${top + 44} Z" fill="url(#st)" opacity="0.3"/>
      <rect x="${cx - 76}" y="${top - 76}" width="152" height="120" fill="${C.roseDeep}"/>
      <g transform="translate(${cx},${top - 150}) scale(0.62)">
        <path d="M0 60 C -34 14 -110 -18 -110 -86 C -110 -136 -70 -160 -34 -146 C -14 -138 -2 -122 0 -110 C 2 -122 14 -138 34 -146 C 70 -160 110 -136 110 -86 C 110 -18 34 14 0 60 Z" fill="${C.white}"/>
        <path d="M0 60 C -34 14 -110 -18 -110 -86 C -110 -136 -70 -160 -34 -146 C -14 -138 -2 -122 0 -110 C 2 -122 14 -138 34 -146 C 70 -160 110 -136 110 -86 C 110 -18 34 14 0 60 Z" fill="url(#st)" opacity="0.4"/>
      </g>
      <path d="M ${cx - 60} ${top - 76} C ${cx - 190} ${top - 160} ${cx - 230} ${top - 40} ${cx - 60} ${top - 30}" fill="none" stroke="${C.rose}" stroke-width="34" stroke-linecap="round"/>
      <path d="M ${cx + 60} ${top - 76} C ${cx + 190} ${top - 160} ${cx + 230} ${top - 40} ${cx + 60} ${top - 30}" fill="none" stroke="${C.rose}" stroke-width="34" stroke-linecap="round"/>
    </g>`;
}

/* --------------------------------------------------------------- big scenes */
function heroScene(W, H) {
  const cx = W * 0.5;
  const base = H * 0.8;
  const heads = [
    [cx - 330, H * 0.4, C.rose, C.roseDeep],
    [cx - 150, H * 0.29, C.blushDeep, C.rose],
    [cx + 30, H * 0.35, C.wine, C.roseDeep],
    [cx + 210, H * 0.26, C.rose, C.wine],
    [cx + 370, H * 0.43, C.blushDeep, C.roseDeep],
    [cx - 40, H * 0.5, C.white, C.mustard],
    [cx + 160, H * 0.53, C.mustard, C.terracotta],
  ];
  let stems = "";
  for (const [hx, hy] of heads) stems += stem(hx, hy + 60, cx + (hx - cx) * 0.2, base + 30, 16);
  const yarnBall = (x, y, r, c, d) => `<g transform="translate(${f(x)},${f(y)})">
      <circle r="${r}" fill="${c}"/>
      <circle r="${r}" fill="url(#stL)" opacity="0.35"/>
      <path d="M ${f(-r * 0.72)} ${f(-r * 0.4)} A ${f(r * 0.9)} ${f(r * 0.9)} 0 0 1 ${f(r * 0.5)} ${f(-r * 0.75)}" fill="none" stroke="${d}" stroke-width="${f(r * 0.14)}" opacity="0.75"/>
      <path d="M ${f(-r * 0.9)} ${f(r * 0.3)} A ${f(r * 0.95)} ${f(r * 0.95)} 0 0 0 ${f(r * 0.86)} ${f(r * 0.3)}" fill="none" stroke="${d}" stroke-width="${f(r * 0.14)}" opacity="0.6"/>
      <path d="M ${f(-r * 0.2)} ${f(-r * 0.95)} A ${f(r * 0.98)} ${f(r * 0.98)} 0 0 1 ${f(r * 0.6)} ${f(r * 0.7)}" fill="none" stroke="${d}" stroke-width="${f(r * 0.13)}" opacity="0.55"/>
      <path d="M ${f(r * 0.7)} ${f(r * 0.6)} Q ${f(r * 1.5)} ${f(r * 0.9)} ${f(r * 1.9)} ${f(r * 0.5)}" fill="none" stroke="${c}" stroke-width="${f(r * 0.12)}" stroke-linecap="round"/>
    </g>`;
  return `${floorShadow(cx, H * 0.92, 620, 74)}
    <g filter="url(#drop)">
      ${stems}
      ${leafShape(cx - 470, H * 0.5, 1.25, -28)}
      ${leafShape(cx + 300, H * 0.47, 1.3, 24)}
      ${leafShape(cx - 190, H * 0.57, 1.0, -8)}
      ${wrapCone(cx, base, 1.75, C.linen)}
      ${heads.map(([hx, hy, a, b]) =>
        a === C.white ? daisy(hx, hy, 110) : a === C.mustard ? daisy(hx, hy, 100, { petal: C.cream, center: C.terracotta }) : rose(hx, hy, 98, a, b),
      ).join("")}
      ${yarnBall(cx - 560, H * 0.82, 96, C.sage, C.sageDeep)}
      ${yarnBall(cx + 580, H * 0.84, 116, C.blushDeep, C.roseDeep)}
      <g transform="translate(${cx + 760},${H * 0.66}) rotate(28)">
        <rect x="-14" y="-300" width="28" height="330" rx="14" fill="${C.cocoa}"/>
        <ellipse cx="0" cy="-318" rx="34" ry="26" fill="none" stroke="${C.cocoa}" stroke-width="22"/>
      </g>
    </g>`;
}

function aboutScene(W, H) {
  const cx = W * 0.5;
  const tableY = H * 0.48;
  const yarnBall = (x, y, r, c, d) => `<g transform="translate(${f(x)},${f(y)})">
      <circle r="${r}" fill="${c}"/>
      <circle r="${r}" fill="url(#stL)" opacity="0.32"/>
      <path d="M ${f(-r * 0.72)} ${f(-r * 0.4)} A ${f(r * 0.9)} ${f(r * 0.9)} 0 0 1 ${f(r * 0.5)} ${f(-r * 0.75)}" fill="none" stroke="${d}" stroke-width="${f(r * 0.15)}" opacity="0.75"/>
      <path d="M ${f(-r * 0.9)} ${f(r * 0.28)} A ${f(r * 0.95)} ${f(r * 0.95)} 0 0 0 ${f(r * 0.88)} ${f(r * 0.26)}" fill="none" stroke="${d}" stroke-width="${f(r * 0.15)}" opacity="0.62"/>
      <path d="M ${f(-r * 0.25)} ${f(-r * 0.94)} A ${f(r * 0.98)} ${f(r * 0.98)} 0 0 1 ${f(r * 0.55)} ${f(r * 0.74)}" fill="none" stroke="${d}" stroke-width="${f(r * 0.14)}" opacity="0.55"/>
    </g>`;
  return `${floorShadow(cx, H * 0.9, 640, 70)}
    <rect x="0" y="${tableY}" width="${W}" height="${H - tableY}" fill="${C.kraft}" opacity="0.55"/>
    <rect x="0" y="${tableY}" width="${W}" height="${H - tableY}" fill="url(#rib)" opacity="0.35"/>
    <rect x="0" y="${tableY}" width="${W}" height="16" fill="${C.kraftDeep}" opacity="0.6"/>
    <g filter="url(#drop)">
      ${yarnBall(cx - 380, tableY - 70, 130, C.rose, C.roseDeep)}
      ${yarnBall(cx - 130, tableY - 40, 104, C.sage, C.sageDeep)}
      ${yarnBall(cx + 90, tableY - 60, 120, C.mustard, "#BE8B44")}
      <g transform="translate(${cx + 330},${tableY - 60}) rotate(-16)">
        <rect x="-13" y="-300" width="26" height="320" rx="13" fill="${C.cocoa}"/>
        <ellipse cx="0" cy="-316" rx="32" ry="24" fill="none" stroke="${C.cocoa}" stroke-width="20"/>
      </g>
      <g transform="translate(${cx + 480},${tableY - 90})">
        <path d="M -96 -90 L 96 -90 L 76 76 Q 0 116 -76 76 Z" fill="${C.white}" stroke="${C.kraftDeep}" stroke-width="5"/>
        <path d="M -96 -90 L 96 -90 L 76 76 Q 0 116 -76 76 Z" fill="url(#st)" opacity="0.25"/>
        <path d="M 96 -54 C 156 -54 156 34 96 34" fill="none" stroke="${C.white}" stroke-width="24"/>
        <ellipse cx="0" cy="-92" rx="96" ry="20" fill="${C.rose}"/>
      </g>
      ${daisy(cx + 240, tableY - 230, 86)}
      ${rose(cx - 300, tableY - 240, 78, C.blushDeep, C.rose)}
      <path d="M ${cx - 560} ${tableY + 60} Q ${cx - 300} ${tableY + 120} ${cx - 40} ${tableY + 60}" fill="none" stroke="${C.roseDeep}" stroke-width="14" stroke-linecap="round" stroke-dasharray="4 26" opacity="0.7"/>
    </g>`;
}

/* ------------------------------------------------------------------ renders */
const OUT = {};

async function render(name, svg, dir, w, h, { quality = 82 } = {}) {
  const outDir = path.join(PUBLIC, dir);
  await fs.mkdir(outDir, { recursive: true });
  await fs.mkdir(MASTER, { recursive: true });
  const masterPath = path.join(MASTER, `${name}.png`);
  await sharp(Buffer.from(svg)).png({ compressionLevel: 6 }).toFile(masterPath);
  OUT[name] = masterPath;
  return masterPath;
}

/** derive extra gallery shots from a master render */
async function derive(masterPath, dir, name, { zoom = 1, focusX = 0.5, focusY = 0.5, ratio = 4 / 5, tint }) {
  const meta = await sharp(masterPath).metadata();
  let img = sharp(masterPath);
  if (tint) img = img.tint(tint);
  // ratio = width / height of the desired crop
  let baseW = Math.round(meta.width / zoom);
  let baseH = Math.round(baseW / ratio);
  if (baseH > meta.height) {
    baseH = meta.height;
    baseW = Math.round(baseH * ratio);
  }
  if (baseW > meta.width) {
    baseW = meta.width;
    baseH = Math.round(baseW / ratio);
  }
  const maxX = Math.max(0, meta.width - baseW);
  const maxY = Math.max(0, meta.height - baseH);
  const left = Math.round(maxX * focusX);
  const top = Math.round(maxY * focusY);
  const outDir = path.join(PUBLIC, dir);
  await fs.mkdir(outDir, { recursive: true });
  const targetW = Math.min(1200, baseW);
  await img
    .extract({ left, top, width: baseW, height: baseH })
    .resize(targetW)
    .webp({ quality: 82, effort: 5 })
    .toFile(path.join(outDir, `${name}.webp`));
}

async function main() {
  const products = [
    ["flowers", "daisy-bouquet", bouquetDaisy, { bg1: "#F8F2E9", bg2: "#EFE1CF" }],
    ["flowers", "rose-bouquet", bouquetRose, { bg1: "#FAF1EC", bg2: "#F0DDD6" }],
    ["flowers", "tulip-bouquet", bouquetTulip, { bg1: "#F9F1E9", bg2: "#EFDFD4" }],
    ["bags", "tote-bag", toteBag, { bg1: "#F7F1E6", bg2: "#EADFCB" }],
    ["bags", "mini-handbag", miniHandbag, { bg1: "#FAF2EF", bg2: "#F1DDD7" }],
    ["toys", "teddy-bear", teddyBear, { bg1: "#F8F3EA", bg2: "#EEE2D2" }],
    ["toys", "bunny", bunny, { bg1: "#FAF4F0", bg2: "#F0E2DB" }],
    ["keychains", "flower-keychain", flowerKeychain, { bg1: "#F9F3E9", bg2: "#F0E3CE" }],
    ["keychains", "heart-keychain", heartKeychain, { bg1: "#FAF1EE", bg2: "#F1DED8" }],
    ["decor", "coaster-set", coasters, { bg1: "#F7F2E9", bg2: "#EDE1D2" }],
    ["decor", "table-decor", tableDecor, { bg1: "#F8F2E9", bg2: "#EEE1D4" }],
    ["decor", "baby-blanket", babyBlanket, { bg1: "#F9F4EC", bg2: "#EFE7DA" }],
    ["gifts", "custom-gift", giftBox, { bg1: "#FAF2EE", bg2: "#EFDFD6" }],
  ];

  const PW = 1400;
  const PH = 1750;

  for (const [dir, name, fn, bg] of products) {
    const svg = frame(PW, PH, fn(PW, PH), bg.bg1, bg.bg2);
    const master = await render(name, svg, `products/${dir}`, PW, PH);
    await derive(master, `products/${dir}`, `${name}-2`, { zoom: 1.45, focusX: 0.5, focusY: 0.36, ratio: 4 / 5 });
    await derive(master, `products/${dir}`, `${name}-3`, { zoom: 2.1, focusX: 0.5, focusY: 0.3, ratio: 1 });
    await derive(master, `products/${dir}`, `${name}-1`, { zoom: 1, ratio: 4 / 5 });
    console.log("product", name);
  }

  /* hero */
  const HW = 1600;
  const HH = 1800;
  const heroMaster = await render(
    "hero-main",
    frame(HW, HH, heroScene(HW, HH), "#F9F3EA", "#EEE0CE"),
    "hero",
    HW,
    HH,
  );
  await derive(heroMaster, "hero", "hero-main", { zoom: 1, ratio: 1600 / 1800, focusX: 0.5, focusY: 0.5 });
  await derive(heroMaster, "hero", "hero-side", { zoom: 1.8, focusX: 0.5, focusY: 0.32, ratio: 4 / 5 });
  await derive(heroMaster, "hero", "cta-bg", { zoom: 1.1, focusX: 0.5, focusY: 0.4, ratio: 16 / 9 });

  /* about */
  const AW = 1700;
  const AH = 1250;
  const aboutMaster = await render(
    "studio-table",
    frame(AW, AH, aboutScene(AW, AH), "#F9F2E8", "#EFE0CE"),
    "about",
    AW,
    AH,
  );
  await derive(aboutMaster, "about", "studio-detail", { zoom: 2.6, focusX: 0.3, focusY: 0.12, ratio: 4 / 5 });
  await derive(aboutMaster, "about", "story", { zoom: 2.2, focusX: 0.64, focusY: 0.15, ratio: 4 / 5 });

  /* categories reuse product masters as square crops */
  const cats = [
    ["flowers", "daisy-bouquet"],
    ["bags", "tote-bag"],
    ["toys", "bunny"],
    ["keychains", "flower-keychain"],
    ["decor", "coaster-set"],
    ["gifts", "custom-gift"],
  ];
  for (const [cat, src] of cats) {
    await derive(OUT[src], `categories`, cat, { zoom: 1.15, focusX: 0.5, focusY: 0.36, ratio: 1 });
  }

  /* instagram / gallery grid */
  const gallery = [
    ["g1", "rose-bouquet", { zoom: 1.3, focusX: 0.5, focusY: 0.3 }],
    ["g2", "bunny", { zoom: 1.35, focusX: 0.5, focusY: 0.4 }],
    ["g3", "coaster-set", { zoom: 1.3, focusX: 0.5, focusY: 0.45 }],
    ["g4", "tote-bag", { zoom: 1.35, focusX: 0.5, focusY: 0.35 }],
    ["g5", "tulip-bouquet", { zoom: 1.25, focusX: 0.5, focusY: 0.28 }],
    ["g6", "teddy-bear", { zoom: 1.3, focusX: 0.5, focusY: 0.4 }],
    ["g7", "custom-gift", { zoom: 1.35, focusX: 0.5, focusY: 0.4 }],
    ["g8", "table-decor", { zoom: 1.3, focusX: 0.5, focusY: 0.3 }],
  ];
  for (const [name, src, opt] of gallery) {
    await derive(OUT[src], "gallery", name, { ...opt, ratio: 1 });
  }

  console.log("done");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
