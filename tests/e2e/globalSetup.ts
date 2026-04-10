import { setup } from './setup';

export default async function globalSetup(): Promise<void> {
  await setup();
}
