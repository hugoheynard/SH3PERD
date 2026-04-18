import { getMailerConfig } from '../getMailerConfig.js';

describe('getMailerConfig', () => {
  const ORIGINAL_ENV = { ...process.env };

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it('returns enabled=false when RESEND_API_KEY is unset', () => {
    delete process.env['RESEND_API_KEY'];

    const cfg = getMailerConfig();

    expect(cfg.enabled).toBe(false);
    expect(cfg.apiKey).toBeNull();
  });

  it('returns enabled=false when RESEND_API_KEY is whitespace only', () => {
    process.env['RESEND_API_KEY'] = '   ';

    const cfg = getMailerConfig();

    expect(cfg.enabled).toBe(false);
    expect(cfg.apiKey).toBeNull();
  });

  it('returns enabled=true with the key when configured', () => {
    process.env['RESEND_API_KEY'] = 're_test_key';

    const cfg = getMailerConfig();

    expect(cfg.enabled).toBe(true);
    expect(cfg.apiKey).toBe('re_test_key');
  });

  it('defaults fromAddress to the noreply address when unset', () => {
    delete process.env['MAILER_FROM_ADDRESS'];

    const cfg = getMailerConfig();

    expect(cfg.fromAddress).toBe('noreply@sh3pherd.com');
  });

  it('honours MAILER_FROM_ADDRESS when configured', () => {
    process.env['MAILER_FROM_ADDRESS'] = 'hello@sh3pherd.com';

    const cfg = getMailerConfig();

    expect(cfg.fromAddress).toBe('hello@sh3pherd.com');
  });

  it('falls back to default when MAILER_FROM_ADDRESS is blank', () => {
    process.env['MAILER_FROM_ADDRESS'] = '   ';

    const cfg = getMailerConfig();

    expect(cfg.fromAddress).toBe('noreply@sh3pherd.com');
  });

  it('returns replyTo=null when MAILER_REPLY_TO is unset', () => {
    delete process.env['MAILER_REPLY_TO'];

    const cfg = getMailerConfig();

    expect(cfg.replyTo).toBeNull();
  });

  it('returns replyTo=null when MAILER_REPLY_TO is blank', () => {
    process.env['MAILER_REPLY_TO'] = '   ';

    const cfg = getMailerConfig();

    expect(cfg.replyTo).toBeNull();
  });

  it('honours MAILER_REPLY_TO when configured', () => {
    process.env['MAILER_REPLY_TO'] = 'support@sh3pherd.com';

    const cfg = getMailerConfig();

    expect(cfg.replyTo).toBe('support@sh3pherd.com');
  });
});
