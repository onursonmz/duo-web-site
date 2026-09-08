import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { extname, join, normalize, resolve, sep } from "node:path";

/**
 * `dist/` için küçük, ön planda çalışan statik sunucu.
 *
 * Neden `astro preview` değil: Astro 7'nin preview komutu TTY yokken kendini
 * arka plana alıp bir kilit dosyası tutuyor. Playwright'ın `webServer`'ı ön planda
 * kalan bir süreç beklediği için bu davranış testleri kırıyor.
 *
 * FAIL-CLOSED: port bind edilemezse süreç HEMEN sıfırdan farklı exit code ile
 * biter. Playwright yeni sunucu ayağa kalkmadan test başlatamaz; başka bir
 * süreçte çalışan bayat bir sunucuya bağlanma ihtimali yoktur.
 *
 * Astro'nun üretim davranışını taklit eder:
 * - `trailingSlash: "always"` + `build.format: "directory"` -> `/yol/` -> `dist/yol/index.html`
 * - bilinmeyen yol -> `dist/404.html` ile **HTTP 404**
 *
 * Kullanım: node preview-server.mjs <dist> <port> [host]
 * Port `0` verilirse çekirdek boş bir port seçer ve gerçek port stdout'a yazılır.
 */

const ROOT = resolve(process.argv[2] ?? "dist");
const PORT = Number(process.argv[3] ?? 0);
const HOST = process.argv[4] ?? "127.0.0.1";

if (!Number.isInteger(PORT) || PORT < 0 || PORT > 65535) {
  process.stderr.write(`preview-server: gecersiz port: ${process.argv[3]}\n`);
  process.exit(2);
}

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
};

/** Dizin dışına çıkmayı (path traversal) engelleyerek dosya yolunu çözer. */
function safeJoin(pathname) {
  const clean = normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, "");
  const full = join(ROOT, clean);
  return full === ROOT || full.startsWith(ROOT + sep) ? full : null;
}

async function resolveFile(pathname) {
  const base = safeJoin(pathname);
  if (base === null) return null;

  try {
    const info = await stat(base);
    if (info.isFile()) return base;
  } catch {
    // Dosya yok: aşağıda index.html denenir.
  }

  try {
    const index = join(base, "index.html");
    if ((await stat(index)).isFile()) return index;
  } catch {
    return null;
  }
  return null;
}

function send(res, status, file) {
  res.writeHead(status, {
    "content-type": MIME[extname(file).toLowerCase()] ?? "application/octet-stream",
    "cache-control": "no-store",
    // Testlerin hangi sunucuya bağlandığını kanıtlamak için işaret.
    "x-duosis-preview": "e2e",
  });
  createReadStream(file).pipe(res);
}

const server = createServer(async (req, res) => {
  const pathname = new URL(req.url ?? "/", `http://${HOST}`).pathname;
  const file = await resolveFile(pathname);

  if (file !== null) {
    send(res, 200, file);
    return;
  }

  // Astro statik çıktısındaki 404 sayfası, doğru HTTP durum koduyla.
  const notFound = join(ROOT, "404.html");
  try {
    await stat(notFound);
    send(res, 404, notFound);
  } catch {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("404");
  }
});

// FAIL-CLOSED: bind hatası sessizce yutulmaz.
server.on("error", (error) => {
  process.stderr.write(
    `preview-server: sunucu baslatilamadi (${HOST}:${PORT}): ${String(error)}\n`
  );
  process.exit(1);
});

function shutdown(signal) {
  server.close(() => process.exit(0));
  // Açık bağlantılar kapanmazsa da süreç sonlansın.
  setTimeout(() => process.exit(0), 2000).unref();
  process.stderr.write(`preview-server: ${signal} alindi, kapaniyor\n`);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

server.listen(PORT, HOST, () => {
  const address = server.address();
  const actual = address !== null && typeof address !== "string" ? address.port : PORT;
  // Playwright bu satırı loglar; regresyon kanıtında kullanılır.
  console.log(`preview-server: http://${HOST}:${actual} -> ${ROOT}`);
});
