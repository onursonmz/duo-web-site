import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";

/**
 * LIGHTHOUSE ÖLÇÜMÜ (S15).
 *
 * Kendi önizleme sunucusunu boş bir portta açar, üç kritik rotayı ölçer ve
 * raporları `evidence/s14-s15/lighthouse/` altına yazar.
 *
 * NOT — SEO skoru bilinçli olarak düşüktür: site tamamen `noindex` olduğu
 * için Lighthouse `is-crawlable` denetiminden puan kırar. Diğer tüm SEO
 * denetimleri geçer. İndeksleme açıldığında skor kendiliğinden yükselir.
 *
 * Kullanım: node scripts/lighthouse.mjs
 */
const PORT = 45407;
const OUT = "evidence/s14-s15/lighthouse";
const ROUTES = [
  ["home", ""],
  ["products", "urunler/"],
  ["logislot", "urunler/logislot/"],
];

await mkdir(OUT, { recursive: true });

const server = spawn(process.execPath, ["tests/support/preview-server.mjs", "dist", String(PORT)], {
  stdio: "ignore",
});
await new Promise((resolve) => setTimeout(resolve, 2000));

let failed = 0;
for (const [name, route] of ROUTES) {
  const code = await new Promise((resolve) => {
    const child = spawn(
      process.execPath,
      [
        "node_modules/lighthouse/cli/index.js",
        `http://127.0.0.1:${PORT}/${route}`,
        "--quiet",
        "--chrome-flags=--headless=new --no-sandbox",
        "--output=json",
        "--output=html",
        `--output-path=${OUT}/${name}`,
      ],
      { stdio: "inherit" }
    );
    child.on("close", resolve);
  });
  process.stdout.write(`lighthouse: ${name} exit=${code}\n`);
  if (code !== 0) failed += 1;
}

server.kill();
process.exit(failed > 0 ? 1 : 0);
