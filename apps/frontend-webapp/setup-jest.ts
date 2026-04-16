import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone/index.mjs';
import { jest as jestGlobals } from '@jest/globals';
import { webcrypto } from 'node:crypto';

type TJestSpy = ReturnType<typeof jestGlobals.fn> & {
  and: {
    returnValue(value: unknown): TJestSpy;
    callFake(impl: (...args: unknown[]) => unknown): TJestSpy;
  };
  calls: {
    allArgs(): unknown[][];
    count(): number;
    reset(): void;
    mostRecent(): { args: unknown[] } | undefined;
  };
  withContext(message: string): TJestSpy;
  identity: string;
};

function decorateJasmineSpy(spy: ReturnType<typeof jestGlobals.fn>, name = 'unknown'): TJestSpy {
  const typedSpy = spy as TJestSpy;
  typedSpy.and = {
    returnValue(value: unknown) {
      spy.mockReturnValue(value);
      return typedSpy;
    },
    callFake(impl: (...args: unknown[]) => unknown) {
      spy.mockImplementation(impl);
      return typedSpy;
    },
  };
  typedSpy.calls = {
    allArgs: () => spy.mock.calls,
    count: () => spy.mock.calls.length,
    reset: () => {
      spy.mockReset();
    },
    mostRecent: () => {
      const last = spy.mock.calls.at(-1);
      return last ? { args: last } : undefined;
    },
  };
  typedSpy.withContext = () => typedSpy;
  typedSpy.identity = name;
  return typedSpy;
}

// jsdom's `window.crypto` doesn't ship `randomUUID` in all versions; wire the
// real Node implementation in before any spec runs so `crypto.randomUUID()`
// calls from production code (e.g. the tab bar's mutation service) work
// under the test runner.
if (!globalThis.crypto || typeof globalThis.crypto.randomUUID !== 'function') {
  Object.defineProperty(globalThis, 'crypto', { value: webcrypto, configurable: true });
}

Object.defineProperty(globalThis, 'jest', { value: jestGlobals, configurable: true });
Object.defineProperty(globalThis, 'jasmine', {
  value: {
    createSpy(name?: string) {
      return decorateJasmineSpy(jestGlobals.fn(), name);
    },
    createSpyObj(baseName: string, methodNames: string[]) {
      return Object.fromEntries(
        methodNames.map((methodName) => [
          methodName,
          decorateJasmineSpy(jestGlobals.fn(), `${baseName}.${methodName}`),
        ]),
      );
    },
  },
  configurable: true,
});

Object.defineProperty(globalThis, 'spyOn', {
  value: <T extends object, K extends keyof T & string>(obj: T, methodName: K) =>
    decorateJasmineSpy(
      jestGlobals.spyOn(obj, methodName as never) as unknown as ReturnType<typeof jestGlobals.fn>,
      `${obj.constructor?.name ?? 'object'}.${methodName}`,
    ),
  configurable: true,
});

expect.extend({
  toBeTrue(received: unknown) {
    return {
      pass: received === true,
      message: () => `Expected ${String(received)} to be true`,
    };
  },
  toBeFalse(received: unknown) {
    return {
      pass: received === false,
      message: () => `Expected ${String(received)} to be false`,
    };
  },
  toHaveBeenCalledOnceWith(received: { mock?: { calls?: unknown[][] } }, ...expected: unknown[]) {
    const calls = received.mock?.calls ?? [];
    const pass = calls.length === 1 && this.equals(calls[0], expected);
    return {
      pass,
      message: () =>
        `Expected mock to have been called once with ${this.utils.printExpected(expected)}, got ${this.utils.printReceived(calls)}`,
    };
  },
});

setupZoneTestEnv();
