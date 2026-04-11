/**
 * DI tokens for the print module.
 *
 * We keep tokens dedicated to this module so its services can be swapped
 * independently of the main auth surface and so the print stack can be
 * dropped in a worker container without pulling the whole auth graph.
 */
export const PRINT_TOKEN_SERVICE = Symbol('PRINT_TOKEN_SERVICE');
export const PUPPETEER_POOL_SERVICE = Symbol('PUPPETEER_POOL_SERVICE');
export const ORGCHART_PDF_SERVICE = Symbol('ORGCHART_PDF_SERVICE');
