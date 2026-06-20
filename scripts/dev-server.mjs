#!/usr/bin/env node
import { execFileSync, spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const repoRoot = process.cwd();
const lockPath = path.join(repoRoot, ".next", "dev", "lock");
const mode = process.argv[2] ?? "stop";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function isAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function commandFor(pid) {
  try {
    return execFileSync("ps", ["-p", String(pid), "-o", "command="], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "";
  }
}

function cwdFor(pid) {
  const procCwd = `/proc/${pid}/cwd`;
  try {
    if (fs.existsSync(procCwd)) return fs.realpathSync(procCwd);
  } catch {
    // Fall back to lsof on macOS.
  }

  try {
    const output = execFileSync("lsof", ["-a", "-p", String(pid), "-d", "cwd", "-Fn"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    return output
      .split("\n")
      .find((line) => line.startsWith("n"))
      ?.slice(1);
  } catch {
    return "";
  }
}

function lockPid() {
  try {
    const lock = JSON.parse(fs.readFileSync(lockPath, "utf8"));
    return Number.isInteger(lock.pid) ? lock.pid : null;
  } catch {
    return null;
  }
}

function nextPids() {
  try {
    return execFileSync("pgrep", ["-f", "next"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    })
      .split("\n")
      .map((line) => Number.parseInt(line.trim(), 10))
      .filter(Number.isInteger);
  } catch {
    return [];
  }
}

function collectTargets() {
  const targets = new Map();
  const lockedPid = lockPid();

  if (lockedPid && lockedPid !== process.pid) {
    targets.set(lockedPid, "Next dev lock");
  }

  for (const pid of nextPids()) {
    if (pid === process.pid || pid === process.ppid) continue;

    const cwd = cwdFor(pid);
    if (cwd !== repoRoot) continue;

    const command = commandFor(pid);
    if (!/\b(next dev|next-server)\b/.test(command)) continue;

    targets.set(pid, command || "Next dev server");
  }

  return targets;
}

async function stopDevServer() {
  const targets = collectTargets();

  if (targets.size === 0) {
    console.log("No repo-local Next dev server found.");
    removeStaleLock();
    return;
  }

  for (const [pid, reason] of targets) {
    if (!isAlive(pid)) continue;
    console.log(`Stopping ${pid} (${reason})...`);
    try {
      process.kill(pid, "SIGTERM");
    } catch {
      // It may have exited between discovery and signal.
    }
  }

  await waitForExit([...targets.keys()], 2500);

  for (const pid of targets.keys()) {
    if (!isAlive(pid)) continue;
    console.log(`Force stopping ${pid}...`);
    try {
      process.kill(pid, "SIGKILL");
    } catch {
      // It may have exited between checks.
    }
  }

  await waitForExit([...targets.keys()], 1000);
  removeStaleLock();
  console.log("Dev server cleanup complete.");
}

async function waitForExit(pids, timeoutMs) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    if (pids.every((pid) => !isAlive(pid))) return;
    await sleep(100);
  }
}

function removeStaleLock() {
  const pid = lockPid();
  if (!pid || isAlive(pid)) return;

  try {
    fs.unlinkSync(lockPath);
    console.log("Removed stale Next dev lock.");
  } catch {
    // The lock may already be gone.
  }
}

async function restartDevServer() {
  await stopDevServer();
  console.log("Starting Next dev server...");
  const child = spawn("npm", ["run", "dev"], {
    cwd: repoRoot,
    stdio: "inherit",
  });

  child.on("exit", (code, signal) => {
    if (signal) process.kill(process.pid, signal);
    process.exit(code ?? 0);
  });
}

if (mode === "stop") {
  await stopDevServer();
} else if (mode === "restart") {
  await restartDevServer();
} else {
  console.error("Usage: node scripts/dev-server.mjs <stop|restart>");
  process.exit(1);
}
