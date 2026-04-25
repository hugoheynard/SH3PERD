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

type SignatureStep = {
  key: 'draft' | 'user' | 'company' | 'active';
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
  readonly userSignature = input<TContractSignature | null | undefined>(null);
  readonly companySignature = input<TContractSignature | null | undefined>(
    null,
  );
  readonly userLabel = input<string>('Signed by employee');
  readonly companyLabel = input<string>('Countersigned');

  readonly steps = computed<SignatureStep[]>(() => {
    const userSig = this.userSignature() ?? null;
    const companySig = this.companySignature() ?? null;

    const stepsList: SignatureStep[] = [
      { key: 'draft', label: 'Draft', date: null, state: 'done' },
      {
        key: 'user',
        label: this.userLabel(),
        date: userSig?.signed_at ?? null,
        state: userSig ? 'done' : 'current',
      },
      {
        key: 'company',
        label: this.companyLabel(),
        date: companySig?.signed_at ?? null,
        state: companySig ? 'done' : userSig ? 'current' : 'pending',
      },
      {
        key: 'active',
        label: 'Active',
        date: null,
        state: this.status() === 'active' ? 'done' : 'pending',
      },
    ];
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
    if (!s.length) return 0;
    const done = s.filter((x) => x.state === 'done').length;
    return Math.round(((done - 1) / (s.length - 1)) * 100);
  });
}
