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

function run(cmd: string): void {
  console.log(`[e2e-setup] ${cmd}`);
  execSync(cmd, { stdio: 'inherit' });
}

export async function setup(): Promise<void> {
  console.log('[e2e-setup] Starting LiteLLM proxy container…');
  run(`docker compose -f ${COMPOSE_FILE} -p ${PROJECT_NAME} up -d --wait`);
  console.log('[e2e-setup] LiteLLM proxy is healthy and ready.');
}

export async function teardown(): Promise<void> {
  console.log('[e2e-teardown] Stopping LiteLLM proxy container…');
  run(`docker compose -f ${COMPOSE_FILE} -p ${PROJECT_NAME} down -v --remove-orphans`);
  console.log('[e2e-teardown] Container removed.');
}
