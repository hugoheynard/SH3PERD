import { Logger } from '@nestjs/common';
import { DryRunMailerAdapter } from '../DryRunMailerAdapter.js';

describe('DryRunMailerAdapter', () => {
  let warnSpy: jest.SpyInstance;
  let logSpy: jest.SpyInstance;

  beforeEach(() => {
    warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});
    logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('exposes enabled=false (it never delivers)', () => {
    const adapter = new DryRunMailerAdapter();

    expect(adapter.enabled).toBe(false);
  });

  it('warns once at construction that the mailer is not wired', () => {
    new DryRunMailerAdapter();

    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0]?.[0]).toContain('dry-run');
  });

  it('logs a parsable line for a password-reset template', async () => {
    const adapter = new DryRunMailerAdapter();
    const expiresAt = new Date('2026-04-18T12:00:00Z');

    await adapter.send({
      to: 'user@example.test',
      template: 'password-reset',
      data: {
        firstName: 'Ada',
        resetUrl: 'https://app.test/reset?token=abc',
        expiresAt,
      },
    });

    const line = logSpy.mock.calls[0]?.[0] as string;
    expect(line).toContain('template=password-reset');
    expect(line).toContain('to=user@example.test');
    expect(line).toContain('"firstName":"Ada"');
    expect(line).toContain('"resetUrl":"https://app.test/reset?token=abc"');
  });

  it('logs a parsable line for an email-verification template', async () => {
    const adapter = new DryRunMailerAdapter();

    await adapter.send({
      to: 'new@example.test',
      template: 'email-verification',
      data: {
        firstName: 'Grace',
        verifyUrl: 'https://app.test/verify?token=xyz',
        expiresAt: new Date('2026-04-19T00:00:00Z'),
      },
    });

    const line = logSpy.mock.calls[0]?.[0] as string;
    expect(line).toContain('template=email-verification');
    expect(line).toContain('to=new@example.test');
    expect(line).toContain('"verifyUrl":"https://app.test/verify?token=xyz"');
  });

  it('resolves without throwing (never blocks callers)', async () => {
    const adapter = new DryRunMailerAdapter();

    await expect(
      adapter.send({
        to: 'user@example.test',
        template: 'password-reset',
        data: {
          firstName: 'Ada',
          resetUrl: 'https://app.test/reset?token=abc',
          expiresAt: new Date(),
        },
      }),
    ).resolves.toBeUndefined();
  });
});
