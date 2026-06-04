import { spawn, spawnSync } from "node:child_process";

const API_HOST = process.env.REVIVAL_API_HOST ?? "127.0.0.1";
const API_PORT = Number(process.env.REVIVAL_API_PORT ?? "8787");
const HEALTH_URL = `http://${API_HOST}:${API_PORT}/api/health`;

async function canReuseExistingServer() {
  try {
    const response = await fetch(HEALTH_URL);
    if (!response.ok) {
      return false;
    }

    const payload = await response.json();
    return Boolean(payload?.ok);
  } catch {
    return false;
  }
}

function killExistingServer() {
  const command = [
    "$connections = Get-NetTCPConnection -LocalPort " + API_PORT + " -State Listen -ErrorAction SilentlyContinue",
    "if (-not $connections) { exit 0 }",
    "$pids = $connections | Select-Object -ExpandProperty OwningProcess -Unique",
    "foreach ($pidValue in $pids) {",
    "  if ($pidValue -and $pidValue -ne $PID) {",
    "    try { Stop-Process -Id $pidValue -Force -ErrorAction Stop } catch {}",
    "  }",
    "}",
  ].join("; ");

  const result = spawnSync(
    "powershell",
    ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", command],
    {
      stdio: "inherit",
    }
  );

  if (result.status !== 0) {
    throw new Error(
      `[museum-intelligence] Failed to stop existing server on port ${API_PORT}.`
    );
  }

  console.log(
    `[museum-intelligence] Restarting existing server on port ${API_PORT} so logs attach to this terminal.`
  );
}

function startServer() {
  const child = spawn(process.execPath, ["./server/revival-server.mjs"], {
    stdio: "inherit",
    env: process.env,
  });

  const forwardSignal = (signal) => {
    if (!child.killed) {
      child.kill(signal);
    }
  };

  process.on("SIGINT", () => forwardSignal("SIGINT"));
  process.on("SIGTERM", () => forwardSignal("SIGTERM"));

  child.on("exit", (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }

    process.exit(code ?? 0);
  });
}

if (await canReuseExistingServer()) {
  killExistingServer();
}

startServer();
