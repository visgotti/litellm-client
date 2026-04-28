/**
 * E2E test lifecycle — start / stop the Docker-based LiteLLM proxy.
 *
 * Usage:
 *   globalSetup:    starts the container and waits for it to be healthy
 *   globalTeardown: stops and removes the container
 *
 * The proxy is available at http://localhost:14000 during tests.
 */

import { execSync } from 'child_process';
import { resolve } from 'path';

const COMPOSE_FILE = resolve(__dirname, 'docker-compose.yml');
const PROJECT_NAME = 'litellm-proxy-e2e';

const PROVIDER_KEYS = [
  'OPENAI_API_KEY',
  'ANTHROPIC_API_KEY',
  'DEEPSEEK_API_KEY',
  'GEMINI_API_KEY',
  'ALIBABA_API_KEY',
] as const;

function run(cmd: string): void {
  console.log(`[e2e-setup] ${cmd}`);
  execSync(cmd, { stdio: 'inherit' });
}

function assertAtLeastOneProviderKey(): void {
  const present = PROVIDER_KEYS.filter(
    (k) => process.env[k] && process.env[k]!.trim().length > 0,
  );
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
    '│  At least one of the following environment variables must be         │',
    '│  exported in the shell that runs `npm run test:e2e` so the LiteLLM   │',
    '│  proxy container can route to a real provider:                       │',
    '│                                                                      │',
    `│    ${PROVIDER_KEYS.join(', ').padEnd(66)}│`,
    '│                                                                      │',
    '│  Set them in your shell (e.g. ~/.zshrc, direnv .envrc, or a local    │',
    '│  .env file sourced before the test run):                             │',
    '│                                                                      │',
    '│    export OPENAI_API_KEY=sk-...                                      │',
    '│    export ANTHROPIC_API_KEY=sk-ant-...                               │',
    '│                                                                      │',
    '│  In CI, configure them as repository secrets and expose them on the  │',
    '│  workflow job (env: OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}).  │',
    '╰──────────────────────────────────────────────────────────────────────╯',
    '',
  ].join('\n');
  throw new Error(message);
}

export async function setup(): Promise<void> {
  assertAtLeastOneProviderKey();
  console.log('[e2e-setup] Starting LiteLLM proxy container…');
  run(`docker compose -f ${COMPOSE_FILE} -p ${PROJECT_NAME} up -d --wait`);
  console.log('[e2e-setup] LiteLLM proxy is healthy and ready.');
}

export async function teardown(): Promise<void> {
  console.log('[e2e-teardown] Stopping LiteLLM proxy container…');
  run(`docker compose -f ${COMPOSE_FILE} -p ${PROJECT_NAME} down -v --remove-orphans`);
  console.log('[e2e-teardown] Container removed.');
}
