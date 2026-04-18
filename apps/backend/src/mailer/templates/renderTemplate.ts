import type { TMailPayload } from '../types.js';
import { emailVerificationTemplate } from './emailVerificationTemplate.js';
import { passwordResetTemplate, type TRenderedMail } from './passwordResetTemplate.js';

/**
 * Resolve a template payload to `{ subject, html }`.
 *
 * Pure function — no I/O. Exhaustive switch on the discriminated union
 * guarantees a compile error when a new template is added without a
 * renderer.
 */
export const renderTemplate = (payload: TMailPayload): TRenderedMail => {
  switch (payload.template) {
    case 'password-reset':
      return passwordResetTemplate(payload.data);
    case 'email-verification':
      return emailVerificationTemplate(payload.data);
  }
};
