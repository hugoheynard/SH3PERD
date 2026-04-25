import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import type {
  TContractSignature,
  TContractStatus,
} from '@sh3pherd/shared-types';

/**
 * Whose point of view the stepper renders from. The order of the
 * steps and the visibility of the "draft" step depend on this:
 *
 * - `company`: draft → company signs ("Sign & Send") → user signs → active
 * - `user`:    company signed → user signs → active (no draft — recipients
 *              never see a contract before it has been sent)
 */
type Perspective = 'company' | 'user';

type SignatureStep = {
  key: 'draft' | 'company' | 'user' | 'active';
  label: string;
  date: Date | null;
  state: 'done' | 'current' | 'pending';
};

@Component({
  selector: 'sh3-signature-stepper',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './signature-stepper.component.html',
  styleUrl: './signature-stepper.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignatureStepperComponent {
  readonly status = input.required<TContractStatus>();
  readonly perspective = input.required<Perspective>();
  readonly userSignature = input<TContractSignature | null | undefined>(null);
  readonly companySignature = input<TContractSignature | null | undefined>(
    null,
  );

  readonly steps = computed<SignatureStep[]>(() => {
    const userSig = this.userSignature() ?? null;
    const companySig = this.companySignature() ?? null;
    const isActive = this.status() === 'active';

    const companyStep: SignatureStep = {
      key: 'company',
      label: this.perspective() === 'company' ? 'You signed' : 'Company signed',
      date: companySig?.signed_at ?? null,
      state: companySig ? 'done' : 'current',
    };

    const userStep: SignatureStep = {
      key: 'user',
      label: this.perspective() === 'user' ? 'You signed' : 'Employee signed',
      date: userSig?.signed_at ?? null,
      state: userSig ? 'done' : companySig ? 'current' : 'pending',
    };

    const activeStep: SignatureStep = {
      key: 'active',
      label: 'Active',
      date: null,
      state: isActive ? 'done' : 'pending',
    };

    const stepsList: SignatureStep[] =
      this.perspective() === 'company'
        ? [
            { key: 'draft', label: 'Draft', date: null, state: 'done' },
            companyStep,
            userStep,
            activeStep,
          ]
        : [companyStep, userStep, activeStep];

    // Only the first 'current' stays current — anything after it that
    // also resolved to 'current' is downgraded to 'pending'.
    let seenCurrent = false;
    return stepsList.map((s) => {
      if (s.state === 'current' && seenCurrent)
        return { ...s, state: 'pending' as const };
      if (s.state === 'current') seenCurrent = true;
      return s;
    });
  });

  readonly progressPercent = computed(() => {
    const s = this.steps();
    if (s.length <= 1) return 0;
    const done = s.filter((x) => x.state === 'done').length;
    return Math.round(((done - 1) / (s.length - 1)) * 100);
  });
}
