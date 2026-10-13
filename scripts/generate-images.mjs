// Generates branded placeholder SVG assets into public/images.
// Deterministic output; run with: node scripts/generate-images.mjs
import { mkdirSync, writeFileSync } from "node:fs";

const OUT = "public/images";

const palettes = {
  navy: ["#0f172a", "#1e3a5f", "#38bdf8"],
  teal: ["#042f2e", "#0f766e", "#2dd4bf"],
  violet: ["#2e1065", "#6d28d9", "#a78bfa"],
  amber: ["#451a03", "#b45309", "#fbbf24"],
  rose: ["#4c0519", "#be123c", "#fb7185"],
  green: ["#052e16", "#15803d", "#4ade80"],
  slate: ["#0f172a", "#334155", "#94a3b8"],
};

function svg({ file, title, subtitle, palette, w = 1200, h = 800 }) {
  const [dark, mid, accent] = palettes[palette];
  const content = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${dark}"/>
      <stop offset="1" stop-color="${mid}"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  <circle cx="${w * 0.82}" cy="${h * 0.2}" r="${h * 0.28}" fill="${accent}" opacity="0.16"/>
  <circle cx="${w * 0.15}" cy="${h * 0.85}" r="${h * 0.22}" fill="${accent}" opacity="0.12"/>
  <rect x="${w * 0.08}" y="${h * 0.14}" width="${w * 0.26}" height="${h * 0.09}" rx="${h * 0.045}" fill="${accent}" opacity="0.9"/>
  <text x="${w * 0.1}" y="${h * 0.21}" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="${h * 0.045}" fill="${dark}">KODEVA</text>
  <text x="${w * 0.08}" y="${h * 0.52}" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="${h * 0.085}" fill="#ffffff">${title}</text>
  <text x="${w * 0.08}" y="${h * 0.62}" font-family="Arial, Helvetica, sans-serif" font-size="${h * 0.042}" fill="${accent}">${subtitle}</text>
  <g opacity="0.85">
    <rect x="${w * 0.08}" y="${h * 0.72}" width="${w * 0.36}" height="${h * 0.035}" rx="${h * 0.0175}" fill="#ffffff" opacity="0.25"/>
    <rect x="${w * 0.08}" y="${h * 0.79}" width="${w * 0.24}" height="${h * 0.035}" rx="${h * 0.0175}" fill="#ffffff" opacity="0.18"/>
    <rect x="${w * 0.08}" y="${h * 0.86}" width="${w * 0.3}" height="${h * 0.035}" rx="${h * 0.0175}" fill="#ffffff" opacity="0.12"/>
  </g>
</svg>
`;
  writeFileSync(`${OUT}/${file}`, content);
}

mkdirSync(OUT, { recursive: true });
mkdirSync(`${OUT}/products`, { recursive: true });
mkdirSync(`${OUT}/blog`, { recursive: true });

svg({
  file: "hero.svg",
  title: "Satu langganan,",
  subtitle: "semua operasional beres.",
  palette: "navy",
  w: 1280,
  h: 960,
});

const products = [
  ["kodeva-pos", "Kodeva POS", "Kasir & outlet", "navy"],
  ["kodeva-kiosk", "Kodeva Kiosk", "Self-service order", "teal"],
  ["kodeva-hr", "Kodeva HR", "SDM & cuti", "violet"],
  ["kodeva-payroll", "Kodeva Payroll", "Gaji & slip", "amber"],
  ["kodeva-inventory", "Kodeva Inventory", "Stok multi-gudang", "green"],
  ["kodeva-loyalty", "Kodeva Loyalty", "Poin & member", "rose"],
  ["kodeva-reports", "Kodeva Reports", "Dashboard bisnis", "slate"],
];

for (const [slug, name, subtitle, palette] of products) {
  svg({
    file: `products/${slug}-a.svg`,
    title: name,
    subtitle: subtitle,
    palette,
    w: 1200,
    h: 800,
  });
  svg({
    file: `products/${slug}-b.svg`,
    title: `${name} — Dashboard`,
    subtitle: "Ringkasan real-time",
    palette: palette === "slate" ? "navy" : palette,
    w: 1200,
    h: 800,
  });
}

const posts = [
  ["pos-rookie-mistakes", "5 Kesalahan Kasir", "Panduan POS", "navy"],
  ["payroll-year-end", "Payroll Akhir Tahun", "Checklist THR", "amber"],
  ["omni-channel", "Kanal Jualan Banyak", "Studi kasus", "teal"],
  ["promo-quota-guide", "Cara Kerja Kuota", "Info promo", "rose"],
  ["hr-onboarding", "Onboarding Karyawan", "Tips HR", "violet"],
  [" reports-dashboard", "Dashboard Reports", "Fitur baru", "green"],
];

for (const [slug, title, subtitle, palette] of posts) {
  svg({
    file: `blog/${slug.trim()}.svg`,
    title,
    subtitle,
    palette,
    w: 1200,
    h: 630,
  });
}

console.log("Generated placeholder images in", OUT);
