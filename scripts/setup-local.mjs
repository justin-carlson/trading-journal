#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import readline from "node:readline";
import { stdin as input, stdout as output } from "node:process";

const DEMO_DB = "data/tradingjournaldemo.db";
const LOCAL_DB = "data/journal.db";
const ENV_PATH = ".env.local";
const MASSIVE_TEST_URL = "https://api.massive.com/v3/reference/tickers/AAPL";
const colors =
  output.isTTY
    ? {
        bold: "\x1b[1m",
        dim: "\x1b[2m",
        green: "\x1b[32m",
        cyan: "\x1b[36m",
        blue: "\x1b[34m",
        yellow: "\x1b[33m",
        red: "\x1b[31m",
        reset: "\x1b[0m",
      }
    : {
        bold: "",
        dim: "",
        green: "",
        cyan: "",
        blue: "",
        yellow: "",
        red: "",
        reset: "",
      };

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    stdio: options.quiet ? "pipe" : "inherit",
    encoding: "utf8",
    env: { ...process.env, ...options.env },
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    if (options.quiet) {
      const outputText = [result.stdout, result.stderr].filter(Boolean).join("\n").trim();
      if (outputText) console.error(outputText);
    }
    throw new Error(`${command} ${args.join(" ")} exited with status ${result.status}`);
  }
}

function heading(text) {
  console.log(`${colors.bold}${text}${colors.reset}`);
}

function section(text) {
  console.log(`${colors.blue}${colors.bold}${text}${colors.reset}`);
}

function detail(text) {
  console.log(`${colors.dim}${text}${colors.reset}`);
}

function success(text) {
  console.log(`${colors.green}${text}${colors.reset}`);
}

function warn(text) {
  console.log(`${colors.yellow}${text}${colors.reset}`);
}

function divider() {
  detail("------------------------------------------------------------");
}

function quietStep(label, fn) {
  output.write(`${colors.dim}${label}...${colors.reset}`);
  try {
    fn();
    console.log(` ${colors.green}done${colors.reset}`);
  } catch (error) {
    console.log(` ${colors.red}failed${colors.reset}`);
    throw error;
  }
}

function question(prompt) {
  const rl = readline.createInterface({ input, output });
  return new Promise((resolveQuestion) => {
    rl.question(prompt, (answer) => {
      rl.close();
      resolveQuestion(answer.trim());
    });
  });
}

function secretQuestion(prompt) {
  if (!input.isTTY || !output.isTTY) return question(prompt);

  return new Promise((resolveQuestion) => {
    let value = "";
    const rl = readline.createInterface({
      input,
      output,
      terminal: true,
    });

    const originalWrite = rl._writeToOutput;
    rl._writeToOutput = function writeMasked(text) {
      if (text.includes("\r\n") || text.includes("\n")) {
        originalWrite.call(rl, text);
      } else {
        const masked = text.replace(/[^\r\n]/g, "*");
        originalWrite.call(rl, masked);
      }
    };

    output.write(prompt);
    rl.question("", (answer) => {
      value = answer;
      rl._writeToOutput = originalWrite;
      rl.close();
      resolveQuestion(value.trim());
    });
  });
}

function parseEnvFile(path) {
  if (!existsSync(path)) return new Map();
  const values = new Map();
  const lines = readFileSync(path, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    values.set(match[1], match[2].replace(/^['"]|['"]$/g, ""));
  }
  return values;
}

function writeLocalEnv({ dbPath, massiveKey }) {
  const existing = existsSync(ENV_PATH) ? readFileSync(ENV_PATH, "utf8").split(/\r?\n/) : [];
  const managed = new Set(["DB_PATH", "MASSIVE_API_KEY", "DEMO_READ_ONLY", "TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN"]);
  const kept = existing.filter((line) => {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=/);
    return !match || !managed.has(match[1]);
  });
  const lines = [
    ...kept.filter((line) => line.trim() !== ""),
    "",
    "# Local Trading Journal setup",
    `DB_PATH=${dbPath}`,
    "DEMO_READ_ONLY=false",
    massiveKey ? `MASSIVE_API_KEY=${massiveKey}` : "# MASSIVE_API_KEY=",
    "",
    "# Turso is intentionally left unset for local SQLite mode.",
    "# TURSO_DATABASE_URL=",
    "# TURSO_AUTH_TOKEN=",
    "",
  ];
  writeFileSync(ENV_PATH, lines.join("\n"));
}

async function testMassiveKey(apiKey) {
  const url = new URL(MASSIVE_TEST_URL);
  url.searchParams.set("apiKey", apiKey);
  try {
    const response = await fetch(url);
    if (response.ok) return { ok: true };
    const text = await response.text();
    return { ok: false, message: `${response.status} ${response.statusText}: ${text.slice(0, 160)}` };
  } catch (error) {
    return { ok: false, message: error.message };
  }
}

function ensureDataDir(dbPath) {
  mkdirSync(dirname(resolve(dbPath)), { recursive: true });
}

async function setupLocal() {
  section("Step 2 of 3: Set up your journal");
  detail("Press Enter to accept the default answer in brackets.");
  console.log("");

  heading("Choose a starting point");
  console.log("");
  console.log(`${colors.bold}1.${colors.reset} Install Trading Journal using demo data with sample trades and notes`);
  detail("   Best for previewing the app before using personal data.");
  console.log("");
  console.log(`${colors.bold}2.${colors.reset} Install Trading Journal to use your own data`);
  detail("   Best when you are ready to import your own broker CSV.");
  console.log("");

  const existingEnv = parseEnvFile(ENV_PATH);
  const defaultKey = existingEnv.get("MASSIVE_API_KEY")?.trim();
  const modeAnswer = await question("Choose a mode [1]: ");
  const useDemo = !/^2|n(o)?$/i.test(modeAnswer);
  const dbPath = useDemo ? DEMO_DB : LOCAL_DB;
  console.log("");
  success(useDemo ? "Demo mode selected." : "Local data mode selected.");

  console.log("");
  divider();
  console.log("");
  heading("Chart data");
  console.log("Massive provides candle data for charts.");
  console.log("Sign up for your free Massive key at https://www.massive.com/");
  detail("You can skip this now. The app will still run, but uncached charts will not fetch candles.");
  console.log("");
  const keyPrompt = defaultKey
    ? "Massive API key already found. Press Enter to keep it, or enter a new key: "
    : "Enter your Massive API key, or press Enter to skip this: ";
  const keyAnswer = await secretQuestion(keyPrompt);
  const massiveKey = keyAnswer || defaultKey || "";

  if (massiveKey) {
    output.write("Testing Massive key... ");
    const result = await testMassiveKey(massiveKey);
    if (result.ok) {
      success("ok");
    } else {
      warn("could not confirm");
      detail(`Massive key was saved, but the test request failed: ${result.message}`);
    }
  }

  ensureDataDir(dbPath);
  writeLocalEnv({ dbPath, massiveKey });
  console.log("");
  divider();
  console.log("");
  heading("Local database");
  detail(`Settings: ${ENV_PATH}`);
  detail(`Database: ${dbPath}`);

  quietStep("Applying database migrations", () => {
    run("npm", ["run", "--silent", "db:migrate"], { env: { DB_PATH: dbPath }, quiet: true });
  });

  if (useDemo) {
    quietStep("Loading demo trades and notes", () => {
      run("npm", ["run", "--silent", "demo:paper"], { quiet: true });
    });
    success("\nDemo trades and journal notes are ready.");
  } else {
    success("\nEmpty local journal is ready.");
    detail("Use Import in the app when you have a broker CSV.");
  }
}

function resetDemo() {
  ensureDataDir(DEMO_DB);
  writeLocalEnv({ dbPath: DEMO_DB, massiveKey: parseEnvFile(ENV_PATH).get("MASSIVE_API_KEY") ?? "" });
  quietStep("Applying database migrations", () => {
    run("npm", ["run", "--silent", "db:migrate"], { env: { DB_PATH: DEMO_DB }, quiet: true });
  });
  quietStep("Loading demo trades and notes", () => {
    run("npm", ["run", "--silent", "demo:paper"], { quiet: true });
  });
  success("\nReset local demo data in data/tradingjournaldemo.db.");
}

async function main() {
  if (process.argv.includes("--reset-demo")) {
    resetDemo();
    return;
  }
  await setupLocal();
}

main().catch((error) => {
  console.error(`\nSetup failed: ${error.message}`);
  process.exit(1);
});
