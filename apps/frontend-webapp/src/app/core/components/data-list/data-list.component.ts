import {
  ChangeDetectionStrategy,
  Component, inject,
  Injector,
  input, type PipeTransform,
  TemplateRef, Type,
} from '@angular/core';
import {
  CommonModule,
  CurrencyPipe,
  DatePipe,
  DecimalPipe,
  NgTemplateOutlet,
  PercentPipe,
  UpperCasePipe,
} from '@angular/common';

export type DataListColumn<T> = {
  fromKey: keyof T;
  label?: string;
  pipe?: PipeName;
  pipeArgs?: unknown[];
};

export type PipeName = keyof typeof DEFAULT_PIPES | string;

const DEFAULT_PIPES = {
  date: DatePipe,
  uppercase: UpperCasePipe,
  currency: CurrencyPipe,
  number: DecimalPipe,
  percent: PercentPipe,
} as const satisfies Record<string, Type<PipeTransform>>;

@Component({
  selector: 'data-list',
  imports: [
    NgTemplateOutlet,
    CommonModule,
  ],
  providers: [
    DatePipe,
    UpperCasePipe,
    CurrencyPipe,
    DecimalPipe,
    PercentPipe,
  ],
  standalone: true,
  templateUrl: './data-list.component.html',
  styleUrls: ['./data-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataListComponent<T extends object> {
  private readonly injector = inject(Injector);

  readonly data = input.required<T[]>();
  /**
   * List of keys of T to display as columns.
   * The order of the keys in the array determines the order of the columns.
   * If empty, all keys of T will be displayed.
   */
  readonly column = input<DataListColumn<T>[]>([]);
  readonly rowActionsTemplate = input<TemplateRef<{ $implicit: T }> | null>(null);
  private readonly pipeInstances = new Map<string, PipeTransform>();
  readonly customPipes = input<Record<string, Type<PipeTransform>>>({});

  constructor() {
    // Instanciation sécurisée de tous les pipes connus
    for (const [key, type] of Object.entries(DEFAULT_PIPES) as [string, Type<PipeTransform>][]) {
      this.pipeInstances.set(key, this.injector.get(type));
    }
  }

  formatValue(
    value: unknown,
    col: DataListColumn<T>
  ): string {
    if (!col.pipe) return String(value ?? '');

    // Si le pipe custom n’a jamais été instancié, on l’ajoute maintenant
    if (!this.pipeInstances.has(col.pipe)) {
      const customPipe = this.customPipes()[col.pipe];
      if (customPipe) {
        this.pipeInstances.set(col.pipe, this.injector.get(customPipe));
      } else {
        return String(value ?? '');
      }
    }

    try {
      const pipe = this.pipeInstances.get(col.pipe);
      return pipe?.transform(value, ...(col.pipeArgs ?? [])) ?? '';
    } catch (err) {
      console.error(`Error in pipe "${col.pipe}" :`, err);
      return String(value ?? '');
    }
  }
}
