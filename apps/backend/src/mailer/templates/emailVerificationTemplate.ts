import type { TEmailVerificationMailPayload } from '../types.js';
import { htmlEscape } from './htmlEscape.js';
import type { TRenderedMail } from './passwordResetTemplate.js';

/**
 * Email-verification email — sent from `UserRegisteredHandler`.
 *
 * The token embedded in `verifyUrl` is hashed server-side (same pattern
 * as password-reset) and expires after 24h. Single-use.
 */
export const emailVerificationTemplate = (
  data: TEmailVerificationMailPayload['data'],
): TRenderedMail => {
  const firstName = htmlEscape(data.firstName);
  const verifyUrl = htmlEscape(data.verifyUrl);
  const expires = htmlEscape(data.expiresAt.toUTCString());

  return {
    subject: 'Verify your Shepherd email address',
    html: `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#0f172a;background:#f8fafc;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:8px;padding:32px;">
      <tr><td>
        <h1 style="margin:0 0 16px;font-size:20px;">Confirm your email</h1>
        <p style="margin:0 0 16px;line-height:1.5;">Hi ${firstName},</p>
        <p style="margin:0 0 16px;line-height:1.5;">Welcome to Shepherd. Please confirm this is your email address so we can secure your account.</p>
        <p style="margin:24px 0;">
          <a href="${verifyUrl}" style="display:inline-block;padding:12px 20px;background:#0f172a;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:600;">Verify email</a>
        </p>
        <p style="margin:0 0 8px;line-height:1.5;font-size:13px;color:#64748b;">This link expires on ${expires} and can only be used once.</p>
        <p style="margin:0;line-height:1.5;font-size:13px;color:#64748b;">If you didn't create a Shepherd account, you can ignore this email.</p>
      </td></tr>
    </table>
  </body>
</html>`,
  };
};
