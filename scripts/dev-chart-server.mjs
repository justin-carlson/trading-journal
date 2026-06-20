#!/usr/bin/env node

import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, isAbsolute, join, normalize, relative, resolve } from "node:path";

const ROOT = resolve(process.cwd());
const PORT = Number(process.env.PORT || 4173);
const MASSIVE_BASE_URL = "https://api.massive.com";

function loadEnvText(text) {
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match) continue;

    const [, key, rawValue] = match;
    if (process.env[key] !== undefined) continue;

    process.env[key] = rawValue.trim().replace(/^['"]|['"]$/g, "");
  }
}

async function loadEnvFile(path) {
  try {
    loadEnvText(await readFile(path, "utf8"));
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}

async function loadLocalEnv() {
  await loadEnvFile(join(ROOT, ".env.local"));
  await loadEnvFile(join(ROOT, ".env"));
}

function sendJson(res, status, payload) {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  });
  res.end(JSON.stringify(payload));
}

function sendText(res, status, text) {
  res.writeHead(status, {
    "content-type": "text/plain; charset=utf-8",
    "cache-control": "no-store",
  });
  res.end(text);
}

function contentTypeFor(path) {
  const type = {
    ".css": "text/css; charset=utf-8",
    ".csv": "text/csv; charset=utf-8",
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".mjs": "text/javascript; charset=utf-8",
    ".svg": "image/svg+xml",
  }[extname(path).toLowerCase()];
  return type || "application/octet-stream";
}

async function serveStatic(req, res, url) {
  const decodedPath = decodeURIComponent(
    url.pathname === "/"
      ? "/docs/design/prototypes/trade_chart (10)-prototype.html"
      : url.pathname,
  );
  const filePath = normalize(join(ROOT, decodedPath));
  const relativePath = relative(ROOT, filePath);
  const pathSegments = relativePath.split(/[\\/]+/);

  if (
    relativePath.startsWith("..") ||
    isAbsolute(relativePath) ||
    pathSegments.some((segment) => segment.startsWith(".")) ||
    pathSegments.includes("node_modules")
  ) {
    sendText(res, 403, "Forbidden");
    return;
  }

  try {
    const body = await readFile(filePath);
    res.writeHead(200, {
      "content-type": contentTypeFor(filePath),
      "cache-control": "no-store",
    });
    res.end(body);
  } catch (error) {
    sendText(res, error.code === "ENOENT" ? 404 : 500, error.code === "ENOENT" ? "Not found" : "Server error");
  }
}

async function proxyMassiveAggregates(res, url) {
  const apiKey = process.env.MASSIVE_API_KEY;
  if (!apiKey) {
    sendJson(res, 500, { error: "MASSIVE_API_KEY is not set in .env.local or the shell." });
    return;
  }

  const symbol = String(url.searchParams.get("symbol") || "").trim().toUpperCase();
  const date = String(url.searchParams.get("date") || "").trim();
  if (!/^[A-Z0-9. -]+$/.test(symbol)) {
    sendJson(res, 400, { error: "Invalid symbol." });
    return;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    sendJson(res, 400, { error: "Invalid date. Expected YYYY-MM-DD." });
    return;
  }

  const massiveUrl = new URL(`/v2/aggs/ticker/${encodeURIComponent(symbol)}/range/1/minute/${date}/${date}`, MASSIVE_BASE_URL);
  massiveUrl.searchParams.set("adjusted", "false");
  massiveUrl.searchParams.set("sort", "asc");
  massiveUrl.searchParams.set("limit", "50000");
  massiveUrl.searchParams.set("apiKey", apiKey);

  try {
    const response = await fetch(massiveUrl);
    const contentType = response.headers.get("content-type") || "";
    const body = contentType.includes("application/json") ? await response.json() : await response.text();
    if (!response.ok) {
      const message = typeof body === "string" ? body : body.error || body.message || JSON.stringify(body);
      sendJson(res, response.status, { error: message });
      return;
    }
    sendJson(res, 200, body);
  } catch (error) {
    sendJson(res, 502, { error: error.message });
  }
}

await loadLocalEnv();

const server = createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || `127.0.0.1:${PORT}`}`);
  if (url.pathname === "/api/config") {
    sendJson(res, 200, { massiveApiKeyConfigured: Boolean(process.env.MASSIVE_API_KEY) });
    return;
  }
  if (url.pathname === "/api/massive/aggs") {
    await proxyMassiveAggregates(res, url);
    return;
  }
  await serveStatic(req, res, url);
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Trade chart dev server: http://127.0.0.1:${PORT}/`);
  console.log(`MASSIVE_API_KEY configured: ${process.env.MASSIVE_API_KEY ? "yes" : "no"}`);
});
