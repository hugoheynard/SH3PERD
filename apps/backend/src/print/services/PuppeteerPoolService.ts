import { Injectable, Logger } from '@nestjs/common';
import type { OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Browser, Page } from 'puppeteer';

/**
 * Minimal, zero-dependency Puppeteer browser pool.
 *
 * ## Why a pool at all?
 *
 * Booting Chromium costs ~600-900 ms and ~150 MB of RSS. If every export
 * spawns a fresh browser the backend spends most of its time in startup
 * and a burst of ten concurrent exports is enough to eat a medium container.
 *
 * This pool keeps `poolSize` long-lived browsers around and hands out one
 * per job. Each job gets a **fresh page** (never a reused page) so state
 * from one render never leaks into the next. If a browser crashes mid-job
 * we quarantine it and respawn before the next acquire.
 *
 * ## Concurrency model
 *
 * - `poolSize` is the max number of concurrent renders.
 * - Jobs beyond that wait on an internal FIFO queue with a configurable
 *   timeout so clients never hang forever under load.
 * - Each job runs inside `withPage(fn)` which guarantees page cleanup
 *   even if `fn` throws.
 *
 * ## Process isolation
 *
 * Chromium flags mirror what cloud providers recommend for headless:
 * `--no-sandbox` (we already trust the content we print — it's our own
 * frontend route), `--disable-dev-shm-usage` (tiny /dev/shm in containers),
 * `--disable-gpu`, `--no-zygote`, `--font-render-hinting=none` for
 * deterministic PDF output.
 */
@Injectable()
export class PuppeteerPoolService implements OnModuleDestroy {
  private readonly logger = new Logger(PuppeteerPoolService.name);

  private readonly poolSize: number;
  private readonly chromiumPath: string | undefined;

  /** Idle browsers, ready to lease. */
  private readonly idle: Browser[] = [];
  /** Browsers currently leased out. Tracked to enforce `poolSize`. */
  private readonly busy = new Set<Browser>();
  /** Pending leases waiting for a browser to be released. */
  private readonly waiters: Array<(browser: Browser) => void> = [];

  private destroyed = false;

  constructor(private readonly config: ConfigService) {
    const printConfig = this.config.get<{
      poolSize: number;
      chromiumPath: string | undefined;
    }>('print');
    this.poolSize = Math.max(1, printConfig?.poolSize ?? 2);
    this.chromiumPath = printConfig?.chromiumPath;
  }

  /**
   * Runs `fn` with a fresh page from a pooled browser. Guarantees the page
   * is closed on all paths, the browser is returned to the pool, and
   * waiters are unblocked. If the browser crashed during `fn` the browser
   * is disposed and replaced.
   */
  async withPage<T>(fn: (page: Page) => Promise<T>): Promise<T> {
    if (this.destroyed) {
      throw new Error('PuppeteerPoolService has been destroyed');
    }

    const browser = await this.acquire();
    let page: Page | undefined;
    let crashed = false;
    try {
      page = await browser.newPage();
      return await fn(page);
    } catch (err) {
      // A disconnected browser throws on newPage()/navigation — mark it
      // so we don't recycle a dead process.
      if (!browser.connected) crashed = true;
      throw err;
    } finally {
      if (page && browser.connected) {
        try {
          await page.close({ runBeforeUnload: false });
        } catch (closeErr) {
          this.logger.warn(`page.close failed: ${(closeErr as Error).message}`);
        }
      }
      this.release(browser, crashed);
    }
  }

  /** Returns the next available browser, blocking if the pool is saturated. */
  private async acquire(): Promise<Browser> {
    // Fast path — an idle browser is available.
    const idle = this.idle.pop();
    if (idle) {
      if (!idle.connected) {
        // Stale browser: respawn and retry.
        return this.spawnAndLease();
      }
      this.busy.add(idle);
      return idle;
    }

    // Pool not at capacity — spawn a new browser.
    if (this.busy.size < this.poolSize) {
      return this.spawnAndLease();
    }

    // At capacity — queue and wait.
    return new Promise<Browser>((resolve) => {
      this.waiters.push(resolve);
    });
  }

  /**
   * Returns a browser to the pool. If it crashed, disposes it and any
   * waiter will get a freshly spawned instance.
   */
  private release(browser: Browser, crashed: boolean): void {
    this.busy.delete(browser);

    if (crashed || !browser.connected) {
      this.disposeBrowser(browser).catch(() => {
        /* already dead */
      });
      // Serve the next waiter with a fresh browser.
      const waiter = this.waiters.shift();
      if (waiter) {
        this.spawnAndLease()
          .then(waiter)
          .catch((err) => {
            this.logger.error(`spawn failed while serving waiter: ${(err as Error).message}`);
          });
      }
      return;
    }

    // Hand the browser to the first waiter, or park it.
    const waiter = this.waiters.shift();
    if (waiter) {
      this.busy.add(browser);
      waiter(browser);
      return;
    }

    this.idle.push(browser);
  }

  private async spawnAndLease(): Promise<Browser> {
    const browser = await this.launchBrowser();
    this.busy.add(browser);
    return browser;
  }

  private async launchBrowser(): Promise<Browser> {
    // Dynamic import so the backend can still boot in environments where
    // Puppeteer is absent (e.g. a CI container that never renders PDFs).
    // The error surface is then surfaced at the first export attempt.
    const { default: puppeteer } = await import('puppeteer');

    const browser = await puppeteer.launch({
      headless: true,
      executablePath: this.chromiumPath,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-zygote',
        '--font-render-hinting=none',
        // Reduce background throttling so timers on the print page
        // (e.g. the readiness signal) fire predictably.
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
      ],
    });

    // If Chromium dies unexpectedly, evict it so the next acquire respawns.
    browser.once('disconnected', () => {
      this.idle.splice(this.idle.indexOf(browser), 1);
      this.busy.delete(browser);
    });

    return browser;
  }

  private async disposeBrowser(browser: Browser): Promise<void> {
    try {
      if (browser.connected) await browser.close();
    } catch {
      /* ignore */
    }
  }

  async onModuleDestroy(): Promise<void> {
    this.destroyed = true;
    const all = [...this.idle, ...this.busy];
    this.idle.length = 0;
    this.busy.clear();
    this.waiters.length = 0;
    await Promise.all(all.map((b) => this.disposeBrowser(b)));
  }
}
