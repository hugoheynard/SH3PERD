import { renderTemplate } from '../templates/renderTemplate.js';

describe('renderTemplate', () => {
  const expiresAt = new Date('2026-04-18T12:00:00Z');

  it('renders the password-reset template with a subject and HTML', () => {
    const { subject, html } = renderTemplate({
      template: 'password-reset',
      data: {
        firstName: 'Ada',
        resetUrl: 'https://app.test/reset?token=abc',
        expiresAt,
      },
    });

    expect(subject).toBe('Reset your Shepherd password');
    expect(html).toContain('Hi Ada');
    expect(html).toContain('https://app.test/reset?token=abc');
    expect(html).toContain(expiresAt.toUTCString());
  });

  it('renders the email-verification template with a subject and HTML', () => {
    const { subject, html } = renderTemplate({
      template: 'email-verification',
      data: {
        firstName: 'Grace',
        verifyUrl: 'https://app.test/verify?token=xyz',
        expiresAt,
      },
    });

    expect(subject).toBe('Verify your Shepherd email address');
    expect(html).toContain('Hi Grace');
    expect(html).toContain('https://app.test/verify?token=xyz');
  });

  it('escapes the firstName to prevent HTML injection', () => {
    const { html } = renderTemplate({
      template: 'password-reset',
      data: {
        firstName: '<script>alert(1)</script>',
        resetUrl: 'https://app.test/reset?token=abc',
        expiresAt,
      },
    });

    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
  });

  it('escapes the URL (quotes, ampersands) — URLs land in attributes', () => {
    const { html } = renderTemplate({
      template: 'password-reset',
      data: {
        firstName: 'Ada',
        resetUrl: 'https://app.test/reset?token=abc&amp=1',
        expiresAt,
      },
    });

    // & must be entity-encoded; quotes would break the href attribute
    expect(html).toContain('https://app.test/reset?token=abc&amp;amp=1');
  });
});
