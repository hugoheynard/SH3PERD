import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';
import { webcrypto } from 'node:crypto';

// jsdom's `window.crypto` doesn't ship `randomUUID` in all versions; wire the
// real Node implementation in before any spec runs so `crypto.randomUUID()`
// calls from production code (e.g. the tab bar's mutation service) work
// under the test runner.
if (!globalThis.crypto || typeof globalThis.crypto.randomUUID !== 'function') {
  Object.defineProperty(globalThis, 'crypto', { value: webcrypto, configurable: true });
}

setupZoneTestEnv();
