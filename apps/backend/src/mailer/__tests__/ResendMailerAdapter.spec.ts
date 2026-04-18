import { Logger } from '@nestjs/common';
import { ResendMailerAdapter, type TResendLike } from '../ResendMailerAdapter.js';
import { TechnicalError } from '../../utils/errorManagement/TechnicalError.js';
import type { TSendMailArgs } from '../types.js';

const makeArgs = (): TSendMailArgs => ({
  to: 'user@example.test',
  template: 'password-reset',
  data: {
    firstName: 'Ada',
    resetUrl: 'https://app.test/reset?token=abc',
    expiresAt: new Date('2026-04-18T12:00:00Z'),
  },
});

const makeClient = (): {
  client: TResendLike;
  sendMock: jest.Mock;
} => {
  const sendMock = jest.fn().mockResolvedValue({
    data: { id: 'email_123' },
    error: null,
  });
  return {
    client: { emails: { send: sendMock } } as unknown as TResendLike,
    sendMock,
  };
};

describe('ResendMailerAdapter', () => {
  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('exposes enabled=true', () => {
    const { client } = makeClient();
    const adapter = new ResendMailerAdapter({
      client,
      fromAddress: 'noreply@sh3pherd.com',
      replyTo: null,
    });

    expect(adapter.enabled).toBe(true);
  });

  it('forwards a rendered payload to Resend with from + subject + html', async () => {
    const { client, sendMock } = makeClient();
    const adapter = new ResendMailerAdapter({
      client,
      fromAddress: 'noreply@sh3pherd.com',
      replyTo: null,
    });

    await adapter.send(makeArgs());

    expect(sendMock).toHaveBeenCalledTimes(1);
    const payload = sendMock.mock.calls[0][0];
    expect(payload.from).toBe('noreply@sh3pherd.com');
    expect(payload.to).toBe('user@example.test');
    expect(payload.subject).toBe('Reset your Shepherd password');
    expect(payload.html).toContain('Hi Ada');
    expect(payload.html).toContain('https://app.test/reset?token=abc');
  });

  it('omits replyTo when not configured', async () => {
    const { client, sendMock } = makeClient();
    const adapter = new ResendMailerAdapter({
      client,
      fromAddress: 'noreply@sh3pherd.com',
      replyTo: null,
    });

    await adapter.send(makeArgs());

    expect(sendMock.mock.calls[0][0].replyTo).toBeUndefined();
  });

  it('includes replyTo when configured', async () => {
    const { client, sendMock } = makeClient();
    const adapter = new ResendMailerAdapter({
      client,
      fromAddress: 'noreply@sh3pherd.com',
      replyTo: 'support@sh3pherd.com',
    });

    await adapter.send(makeArgs());

    expect(sendMock.mock.calls[0][0].replyTo).toBe('support@sh3pherd.com');
  });

  it('wraps a provider-level error as TechnicalError(MAILER_SEND_FAILED)', async () => {
    const sendMock = jest.fn().mockResolvedValue({
      data: null,
      error: { message: 'Invalid API key', name: 'validation_error', statusCode: 401 },
    });
    const adapter = new ResendMailerAdapter({
      client: { emails: { send: sendMock } } as unknown as TResendLike,
      fromAddress: 'noreply@sh3pherd.com',
      replyTo: null,
    });

    try {
      await adapter.send(makeArgs());
      fail('Should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(TechnicalError);
      expect((e as TechnicalError).code).toBe('MAILER_SEND_FAILED');
      expect((e as TechnicalError).context).toMatchObject({
        template: 'password-reset',
        to: 'user@example.test',
        providerStatus: 401,
        providerError: 'validation_error',
      });
    }
  });

  it('wraps a thrown SDK error (network fail) as TechnicalError with cause', async () => {
    const underlying = new Error('ECONNRESET');
    const sendMock = jest.fn().mockRejectedValue(underlying);
    const adapter = new ResendMailerAdapter({
      client: { emails: { send: sendMock } } as unknown as TResendLike,
      fromAddress: 'noreply@sh3pherd.com',
      replyTo: null,
    });

    try {
      await adapter.send(makeArgs());
      fail('Should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(TechnicalError);
      expect((e as TechnicalError).code).toBe('MAILER_SEND_FAILED');
      expect((e as TechnicalError).cause).toBe(underlying);
    }
  });

  it('routes email-verification template to Resend with the right subject', async () => {
    const { client, sendMock } = makeClient();
    const adapter = new ResendMailerAdapter({
      client,
      fromAddress: 'noreply@sh3pherd.com',
      replyTo: null,
    });

    await adapter.send({
      to: 'new@example.test',
      template: 'email-verification',
      data: {
        firstName: 'Grace',
        verifyUrl: 'https://app.test/verify?token=xyz',
        expiresAt: new Date('2026-04-19T00:00:00Z'),
      },
    });

    expect(sendMock.mock.calls[0][0].subject).toBe('Verify your Shepherd email address');
    expect(sendMock.mock.calls[0][0].html).toContain('https://app.test/verify?token=xyz');
  });
});
