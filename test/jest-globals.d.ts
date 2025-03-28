import type * as jestGlobals from '@jest/globals';


declare global {
    const describe: typeof jestGlobals.describe;
    const it: typeof jestGlobals.it;
    const test: typeof jestGlobals.test;
    const expect: typeof jestGlobals.expect;
    const beforeEach: typeof jestGlobals.beforeEach;
    const afterEach: typeof jestGlobals.afterEach;
    const beforeAll: typeof jestGlobals.beforeAll;
    const afterAll: typeof jestGlobals.afterAll;
    const jest: typeof jestGlobals.jest;
}
