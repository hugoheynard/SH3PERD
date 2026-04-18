import type { TPasswordResetMailPayload } from '../types.js';
import { htmlEscape } from './htmlEscape.js';

export type TRenderedMail = {
  subject: string;
  html: string;
};

/**
 * Password-reset email — sent from `ForgotPasswordHandler`.
 *
 * Inline CSS only (Gmail and most clients strip `<style>`). No images,
 * no external fonts — keeps the template fast and the spam-score low.
 * The link is single-use and expires after 1h (set server-side).
 */
export const passwordResetTemplate = (data: TPasswordResetMailPayload['data']): TRenderedMail => {
  const firstName = htmlEscape(data.firstName);
  const resetUrl = htmlEscape(data.resetUrl);
  const expires = htmlEscape(data.expiresAt.toUTCString());

  return {
    subject: 'Reset your Shepherd password',
    html: `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#0f172a;background:#f8fafc;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:8px;padding:32px;">
      <tr><td>
        <h1 style="margin:0 0 16px;font-size:20px;">Reset your password</h1>
        <p style="margin:0 0 16px;line-height:1.5;">Hi ${firstName},</p>
        <p style="margin:0 0 16px;line-height:1.5;">We received a request to reset the password on your Shepherd account. Click the button below to choose a new one.</p>
        <p style="margin:24px 0;">
          <a href="${resetUrl}" style="display:inline-block;padding:12px 20px;background:#0f172a;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:600;">Reset password</a>
        </p>
        <p style="margin:0 0 8px;line-height:1.5;font-size:13px;color:#64748b;">This link expires on ${expires} and can only be used once.</p>
        <p style="margin:0;line-height:1.5;font-size:13px;color:#64748b;">If you didn't request a reset, you can ignore this email — your password won't change.</p>
      </td></tr>
    </table>
  </body>
</html>`,
  };
};
