import { readFile, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

/**
 * OPEN GRAPH GÖRSELLERİ (S13).
 *
 * GERÇEK 1200×630 PNG üretir — "yer tutucu" veya SVG değil. Paylaşım
 * önizlemesi gösteren servislerin çoğu SVG'yi hiç okumaz; ürettiğimiz şey
 * gerçekten görüntülenebilir bir raster olmalıdır.
 *
 * KAYNAK: yalnızca Duosis marka sistemi.
 *   - yüzey  `--surface-canvas` koyu tema değeri (#14181c)
 *   - vurgu  `--brand-cyan` (#16a6de)
 *   - metin  koyu yüzey metin rengi (#eef1f4)
 *   - logo   `public/brand/duosis-wordmark-inverse.svg` (kendi varlığımız)
 *
 * ÜÇÜNCÜ TARAF LOGOSU VEYA İZİNSİZ MÜŞTERİ MARKASI KULLANILMAZ. Görsellerde
 * müşteri adı, partnerlik iddiası veya başarı metriği YOKTUR — kartlar
 * yalnızca marka kimliğini ve rota ailesinin adını taşır.
 *
 * Command Atlas ile tutarlılık: yatay sinyal yolu + düğüm noktaları, aynı
 * geometrik dil. Yeni bir çalışma zamanı bağımlılığı eklenmedi; `sharp`
 * zaten `astro:assets` için kurulu.
 *
 * Çıktılar `public/og/` altına yazılır ve depoya İŞLENİR: derleme sırasında
 * üretilmezler, bu yüzden CI'da font kurulumu gerekmez.
 *
 * Kullanım: node scripts/build-og-images.mjs
 */

const WIDTH = 1200;
const HEIGHT = 630;

const SURFACE = "#14181c";
const SURFACE_RAISED = "#1c2126";
const ACCENT = "#16a6de";
const TEXT = "#eef1f4";
const TEXT_MUTED = "#8d979f";

const OUT_DIR = join(process.cwd(), "public", "og");
const WORDMARK = join(process.cwd(), "public", "brand", "duosis-wordmark-inverse.svg");

/**
 * Kart varyantları.
 *
 * `label` rota ailesinin ADIDIR; iddia değildir. `nodes` sinyal yolundaki
 * düğüm sayısıdır ve yalnızca görsel ritmi değiştirir.
 */
const VARIANTS = [
  {
    file: "og-default.png",
    label: "duosis.com",
    nodes: 5,
  },
  {
    file: "og-cyclops.png",
    label: "CyclOps",
    nodes: 7,
  },
  {
    file: "og-insights.png",
    label: "İçgörüler · Insights",
    nodes: 4,
  },
];

/** Kartın arka planı: yüzey, ince ızgara ve sinyal yolu. */
function backgroundSvg(nodes) {
  const baseline = 430;
  const step = (WIDTH - 200) / (nodes - 1);
  const points = Array.from({ length: nodes }, (_, index) => {
    const x = 100 + index * step;
    // Yol yukarı-aşağı salınır; genlik düğüm sırasına göre değişir.
    const y = baseline + (index % 2 === 0 ? -46 : 34) - index * 6;
    return { x, y };
  });

  const path = points
    .map((point, index) => `${index === 0 ? "M" : "L"}${point.x} ${point.y}`)
    .join(" ");

  const dots = points
    .map(
      (point) =>
        `<circle cx="${point.x}" cy="${point.y}" r="9" fill="${SURFACE}" stroke="${ACCENT}" stroke-width="3"/>`
    )
    .join("");

  const rules = [520, 556, 592]
    .map(
      (y) =>
        `<line x1="100" y1="${y}" x2="${WIDTH - 100}" y2="${y}" stroke="${SURFACE_RAISED}" stroke-width="2"/>`
    )
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">
  <rect width="${WIDTH}" height="${HEIGHT}" fill="${SURFACE}"/>
  <rect x="0" y="0" width="${WIDTH}" height="8" fill="${ACCENT}"/>
  ${rules}
  <path d="${path}" fill="none" stroke="${ACCENT}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" opacity="0.9"/>
  ${dots}
</svg>`;
}

/** Kartın metin katmanı: rota ailesi adı ve site adresi. */
function labelSvg(label) {
  const family = "Segoe UI, Inter, DejaVu Sans, Arial, sans-serif";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">
  <text x="100" y="320" font-family="${family}" font-size="64" font-weight="600" fill="${TEXT}">${escapeXml(
    label
  )}</text>
  <text x="100" y="${HEIGHT - 60}" font-family="${family}" font-size="26" fill="${TEXT_MUTED}" letter-spacing="2">duosis.com</text>
</svg>`;
}

function escapeXml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

await mkdir(OUT_DIR, { recursive: true });

// Wordmark kendi SVG'sinden rasterlenir; yeniden çizilmez.
const wordmarkSource = await readFile(WORDMARK);
const wordmark = await sharp(wordmarkSource).resize({ width: 260 }).png().toBuffer();

const written = [];

for (const variant of VARIANTS) {
  const image = await sharp(Buffer.from(backgroundSvg(variant.nodes)))
    .composite([
      { input: wordmark, top: 96, left: 100 },
      { input: Buffer.from(labelSvg(variant.label)), top: 0, left: 0 },
    ])
    .png({ compressionLevel: 9 })
    .toBuffer();

  const meta = await sharp(image).metadata();
  if (meta.width !== WIDTH || meta.height !== HEIGHT) {
    process.stderr.write(`og: ${variant.file} boyutu yanlış: ${meta.width}×${meta.height}\n`);
    process.exit(1);
  }

  await writeFile(join(OUT_DIR, variant.file), image);
  written.push({ file: variant.file, bytes: image.length });
}

for (const item of written) {
  process.stdout.write(`og: public/og/${item.file} — ${Math.round(item.bytes / 1024)} KB\n`);
}
