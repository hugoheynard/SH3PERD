import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

const PALETTE = [
  '#63b3ed', '#68d391', '#f6ad55', '#fc8181', '#b794f4',
  '#76e4f7', '#fbb6ce', '#f6e05e', '#4fd1c5', '#a3bffa',
] as const;

/**
 * `<sh3-avatar>` — Displays a user/entity avatar with initials or an image.
 *
 * If `imageUrl` is provided, displays the image. Otherwise, displays initials
 * with a deterministic background color.
 *
 * ## Inputs
 *
 * | Input       | Type                    | Default   | Description                                    |
 * |-------------|-------------------------|-----------|------------------------------------------------|
 * | `name`      | `string` (required)     | —         | Full name — initials are derived automatically.|
 * | `size`      | `'sm' \| 'md' \| 'lg'` | `'md'`    | Avatar size (20px / 32px / 44px).              |
 * | `colorSeed` | `string`                | `name`    | String used to pick a deterministic color.     |
 * | `variant`   | `'solid' \| 'ghost'`    | `'solid'` | `'ghost'` renders a dashed border (for guests).|
 * | `square`    | `boolean`               | `false`   | Square shape with small radius (for orgs).     |
 * | `imageUrl`  | `string`                | —         | URL of an image/logo. Replaces initials when set.|
 *
 * ## Examples
 *
 * ```html
 * <sh3-avatar name="Hugo Heynard" />
 * <sh3-avatar name="Guest User" variant="ghost" size="sm" />
 * <sh3-avatar name="Acme Corp" [square]="true" size="lg" />
 * <sh3-avatar name="Acme Corp" [square]="true" size="lg" imageUrl="/assets/logos/acme.png" />
 * ```
 */
@Component({
  selector: 'sh3-avatar',
  standalone: true,
  template: `
    @if (imageUrl()) {
      <div
        class="avatar has-image"
        [class.size-sm]="size() === 'sm'"
        [class.size-md]="size() === 'md'"
        [class.size-lg]="size() === 'lg'"
        [class.shape-square]="square()"
        [attr.title]="name()"
      >
        <img [src]="imageUrl()" [alt]="name()" class="avatar-img" />
      </div>
    } @else {
      <div
        class="avatar"
        [class.size-sm]="size() === 'sm'"
        [class.size-md]="size() === 'md'"
        [class.size-lg]="size() === 'lg'"
        [class.variant-ghost]="variant() === 'ghost'"
        [class.shape-square]="square()"
        [style.background]="variant() === 'solid' ? color() : ''"
        [style.color]="variant() === 'solid' ? '#1a202c' : ''"
        [attr.title]="name()"
      >{{ initials() }}</div>
    }
  `,
  styleUrl: './avatar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvatarComponent {
  readonly name = input.required<string>();
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly colorSeed = input<string | undefined>(undefined);
  readonly variant = input<'solid' | 'ghost'>('solid');
  readonly square = input(false);
  readonly imageUrl = input<string | undefined>(undefined);

  readonly initials = computed(() => {
    const n = this.name().trim();
    if (!n) return '?';
    const words = n.split(/\s+/);
    if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
    return n.substring(0, 2).toUpperCase();
  });

  readonly color = computed(() => {
    const seed = this.colorSeed() ?? this.name();
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    return PALETTE[Math.abs(hash) % PALETTE.length];
  });
}
