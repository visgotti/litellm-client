/**
 * E2E test lifecycle — start / stop the Docker-based LiteLLM proxy.
 *
 * Usage:
 *   globalSetup:    starts the container and waits for it to be healthy
 *   globalTeardown: stops and removes the container
 *
 * The proxy is available at http://localhost:14000 during tests.
 *
 * Provider scoping:
 *   When LITELLM_E2E_PROVIDER is set (CI matrix legs), the run is locked to
 *   that single provider and the corresponding *_API_KEY MUST be present —
 *   missing keys hard-fail. When it's unset (local dev), at-least-one-key
 *   suffices and the rest self-skip.
 */

import { execSync } from 'child_process';
import { platform } from 'os';
import { resolve } from 'path';

const COMPOSE_FILE = resolve(__dirname, 'docker-compose.yml');
const PROJECT_NAME = 'litellm-client-e2e';

const DOCKER_BOOT_TIMEOUT_MS = 90_000;
const DOCKER_BOOT_POLL_MS = 2_000;

const PROVIDER_TO_KEY = {
  openai: 'OPENAI_API_KEY',
  anthropic: 'ANTHROPIC_API_KEY',
  deepseek: 'DEEPSEEK_API_KEY',
  gemini: 'GEMINI_API_KEY',
  alibaba: 'ALIBABA_API_KEY',
} as const;

type ProviderName = keyof typeof PROVIDER_TO_KEY;

const PROVIDER_KEYS = Object.values(PROVIDER_TO_KEY);

function run(cmd: string): void {
  console.log(`[e2e-setup] ${cmd}`);
  execSync(cmd, { stdio: 'inherit' });
}

function isPresent(name: string): boolean {
  return Boolean(process.env[name] && process.env[name]!.trim().length > 0);
}

function assertProviderKeysAvailable(): void {
  const scope = process.env.LITELLM_E2E_PROVIDER?.trim().toLowerCase();

  if (scope) {
    if (!(scope in PROVIDER_TO_KEY)) {
      throw new Error(
        `[e2e-setup] Unknown LITELLM_E2E_PROVIDER="${scope}". ` +
          `Expected one of: ${Object.keys(PROVIDER_TO_KEY).join(', ')}.`,
      );
    }
    const keyName = PROVIDER_TO_KEY[scope as ProviderName];
    if (!isPresent(keyName)) {
      throw new Error(
        `[e2e-setup] LITELLM_E2E_PROVIDER="${scope}" but ${keyName} is not set. ` +
          `In CI, add ${keyName} to repository secrets and expose it on the matrix leg.`,
      );
    }
    console.log(`[e2e-setup] Provider scope: ${scope} (${keyName} present).`);
    return;
  }

  // Unscoped (local dev) — at least one provider key must be set.
  const present = PROVIDER_KEYS.filter(isPresent);
  if (present.length > 0) {
    console.log(
      `[e2e-setup] Live provider keys detected: ${present.join(', ')}`,
    );
    return;
  }

  const message = [
    '',
    '╭──────────────────────────────────────────────────────────────────────╮',
    '│  E2E SETUP ABORTED — no provider API keys are set.                   │',
    '│                                                                      │',
    '│  At least one of the following environment variables must be        │',
    '│  exported in the shell that runs `npm run test:e2e`:                 │',
    '│                                                                      │',
    `│    ${PROVIDER_KEYS.join(', ').padEnd(66)}│`,
    '│                                                                      │',
    '│  Quickest path:                                                      │',
    '│    cp .env.template .env                                             │',
    '│    # fill in the keys you have                                       │',
    '│    set -a; source .env; set +a                                       │',
    '│    npm run test:e2e                                                  │',
    '╰──────────────────────────────────────────────────────────────────────╯',
    '',
  ].join('\n');
  throw new Error(message);
}

function isDockerDaemonReachable(): boolean {
  try {
    execSync('docker info', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

async function ensureDockerDaemon(): Promise<void> {
  if (isDockerDaemonReachable()) return;

  console.log('[e2e-setup] Docker daemon not reachable — attempting to start it…');

  if (platform() === 'darwin') {
    try {
      execSync('open -a Docker', { stdio: 'ignore' });
    } catch {
      // Docker Desktop not installed — fall through to the timeout error below.
    }
  } else if (platform() === 'linux') {
    try {
      execSync('systemctl start docker', { stdio: 'ignore' });
    } catch {
      // Likely needs sudo or systemd unit doesn't exist — fall through.
    }
  }

  const deadline = Date.now() + DOCKER_BOOT_TIMEOUT_MS;
  while (Date.now() < deadline) {
    if (isDockerDaemonReachable()) {
      console.log('[e2e-setup] Docker daemon is up.');
      return;
    }
    await new Promise((r) => setTimeout(r, DOCKER_BOOT_POLL_MS));
  }

  throw new Error(
    [
      '',
      '╭──────────────────────────────────────────────────────────────────────╮',
      '│  E2E SETUP ABORTED — Docker daemon is not reachable.                 │',
      '│                                                                      │',
      '│  Tried to auto-start Docker Desktop / systemd, but the daemon did   │',
      `│  not come up within ${(DOCKER_BOOT_TIMEOUT_MS / 1000)
        .toString()
        .padEnd(2)} seconds. Start Docker Desktop or Colima  │`,
      '│  manually, then re-run the tests.                                    │',
      '╰──────────────────────────────────────────────────────────────────────╯',
      '',
    ].join('\n'),
  );
}

export async function setup(): Promise<void> {
  if (process.env.E2E_KEEP_PROXY) {
    console.log(
      '[e2e-setup] E2E_KEEP_PROXY set — assuming proxy is already running on http://localhost:14000.',
    );
    assertProviderKeysAvailable();
    return;
  }
  assertProviderKeysAvailable();
  await ensureDockerDaemon();
  console.log('[e2e-setup] Starting LiteLLM proxy container…');
  run(`docker compose -f ${COMPOSE_FILE} -p ${PROJECT_NAME} up -d --wait`);
  console.log('[e2e-setup] LiteLLM proxy is healthy and ready.');
}

export async function teardown(): Promise<void> {
  if (process.env.E2E_KEEP_PROXY) {
    console.log('[e2e-teardown] E2E_KEEP_PROXY set — leaving proxy running.');
    return;
  }
  console.log('[e2e-teardown] Stopping LiteLLM proxy container…');
  run(`docker compose -f ${COMPOSE_FILE} -p ${PROJECT_NAME} down -v --remove-orphans`);
  console.log('[e2e-teardown] Container removed.');
}
