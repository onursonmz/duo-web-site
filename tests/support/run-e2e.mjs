import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { fileURLToPath } from "node:url";

/**
 * E2E koşucusu.
 *
 * Playwright yapılandırması HER worker sürecinde yeniden değerlendirilir; portu
 * config içinde seçersek her worker farklı bir port seçer ve yalnızca ana
 * sürecin portunda sunucu bulunur (S02-R1 sırasında yaşandı:
 * `ERR_CONNECTION_REFUSED`).
 *
 * Bu yüzden port BURADA, tek bir yerde seçilir ve `E2E_PORT` environment
 * değişkeniyle hem Playwright yapılandırmasına (baseURL) hem de web server
 * komutuna aktarılır. Tüm worker'lar aynı değeri devralır.
 *
 * FAIL-CLOSED: boş port seçilemezse testler hiç başlamaz ve komut sıfırdan
 * farklı exit code döner.
 */

/** Çekirdeğin verdiği boş bir loopback portu döndürür. */
function pickFreePort() {
  return new Promise((resolve, reject) => {
    const probe = createServer();
    probe.once("error", reject);
    probe.listen(0, "127.0.0.1", () => {
      const address = probe.address();
      if (address === null || typeof address === "string") {
        probe.close(() => reject(new Error("port adresi okunamadi")));
        return;
      }
      const { port } = address;
      probe.close(() => resolve(port));
    });
  });
}

let port;
try {
  port = await pickFreePort();
} catch (error) {
  process.stderr.write(`run-e2e: bos port secilemedi: ${String(error)}\n`);
  process.exit(1);
}

process.stdout.write(`run-e2e: E2E_PORT=${port}\n`);

const playwrightCli = fileURLToPath(
  new URL("../../node_modules/@playwright/test/cli.js", import.meta.url)
);

const child = spawn(process.execPath, [playwrightCli, "test", ...process.argv.slice(2)], {
  stdio: "inherit",
  env: { ...process.env, E2E_PORT: String(port) },
});

child.on("error", (error) => {
  process.stderr.write(`run-e2e: playwright baslatilamadi: ${String(error)}\n`);
  process.exit(1);
});

child.on("exit", (code, signal) => {
  if (signal !== null) {
    process.stderr.write(`run-e2e: playwright ${signal} ile sonlandi\n`);
    process.exit(1);
  }
  process.exit(code ?? 1);
});
