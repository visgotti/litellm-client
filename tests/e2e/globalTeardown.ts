import { teardown } from './setup';

export default async function globalTeardown(): Promise<void> {
  await teardown();
}
