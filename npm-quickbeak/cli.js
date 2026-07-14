#!/usr/bin/env node
const https = require("node:https");
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const cp = require("node:child_process");

const APP_URL = "https://www.quickbeak.com/QuickBeak.html";

function fetch(url, base) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith("https") ? https : url.startsWith("http") ? http : null;
    if (!mod) {
      return reject(new Error(`Invalid URL: ${url}`));
    }
    mod
      .get(url, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          const next = new URL(res.headers.location, base || url).href;
          return fetch(next, base || url).then(resolve, reject);
        }
        if (res.statusCode !== 200) {
          return reject(new Error(`Server returned ${res.statusCode}`));
        }
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => resolve(Buffer.concat(chunks)));
      })
      .on("error", reject);
  });
}

function openFile(filePath) {
  const p = `"${filePath}"`;
  switch (process.platform) {
    case "win32":
      return cp.execSync(`start "" ${p}`);
    case "darwin":
      return cp.execSync(`open ${p}`);
    default:
      return cp.execSync(`xdg-open ${p}`);
  }
}

async function main() {
  process.stdout.write("Fetching QuickBeak... ");
  const html = await fetch(APP_URL);
  process.stdout.write("done.\n");

  const tmp = path.join(os.tmpdir(), "QuickBeak.html");
  fs.writeFileSync(tmp, html);

  process.stdout.write(`Opening QuickBeak in your browser...\n`);
  openFile(tmp);
}

main().catch((err) => {
  console.error("QuickBeak launcher failed:", err.message);
  process.exit(1);
});
