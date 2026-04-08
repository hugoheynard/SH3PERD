# AI Instructions — frontend-webapp

## Design tokens

All colors, spacing, typography, radii, shadows and transitions are defined in a single source of truth:

**`src/styles/_tokens.css`**

Always use CSS custom properties from this file. Never hardcode hex colors, pixel sizes or raw rgba values in component SCSS. If a token is missing, add it to `_tokens.css` first, then consume it.

## Shared components

Before creating any local styling or markup for common UI elements, **use the shared components**. They enforce design consistency and reduce duplication.

| Component | Selector | Location |
|-----------|----------|----------|
| Button | `sh3-button` | `src/app/shared/buttons/button/` |
| Input | `sh3-input` | `src/app/shared/forms/input/` |
| Badge | `sh3-badge` | `src/app/shared/badges/badge/` |
| Popover frame | `ui-popover-frame` | `src/app/shared/ui-frames/popover-frame/` |

### Button — `sh3-button`

Inputs: `variant` (`primary` | `recommended` | `critical` | `ghost` | `solid`), `size` (`sm` | `md` | `lg`), `type` (`button` | `submit`), `disabled`.
Output: `clicked`.

### Badge — `sh3-badge`

Inputs: `content` (required, text), `variant` (`accent` | `info` | `warning` | `alert`), `radius` (`pill` | `square`).

### Input — `sh3-input`

Supports `formControlName`, `ngModel`, `type`, `placeholder`, `readonly`, `disabled`, `autofocus`, `size`.

## Popover pattern — LayoutService

All floating panels / popovers **must** be rendered through the `LayoutService`, never with manual `*ngIf` or conditional DOM.

The `LayoutService` (`src/app/core/services/layout.service.ts`) manages a single popover slot. Use `setPopover()` to open and `clearPopover()` to close.

### Example — opening a popover from a feature component

```typescript
import { LayoutService } from '../../../core/services/layout.service';
import { MyPanelComponent } from './my-panel.component';

@Component({ ... })
export class SomeFeatureComponent {
  private layout = inject(LayoutService);

  openPanel(): void {
    this.layout.setPopover(MyPanelComponent);
  }
}
```

The panel component itself should use `<ui-popover-frame>` as its root wrapper:

```html
<ui-popover-frame width="480px" (closed)="onClose()">

  <div popover-title>Panel title</div>

  <div popover-body>
    <!-- content here -->
  </div>

  <div popover-footer>
    <sh3-button variant="ghost" size="sm" (clicked)="onClose()">Cancel</sh3-button>
    <sh3-button variant="solid" size="sm" (clicked)="save()">Save</sh3-button>
  </div>

</ui-popover-frame>
```

- `popover-title` — optional, header hides automatically if empty
- `popover-footer` — optional, hides automatically if empty
- `width` — optional, defaults to `340px`
- `(closed)` — emitted on backdrop click or close button
