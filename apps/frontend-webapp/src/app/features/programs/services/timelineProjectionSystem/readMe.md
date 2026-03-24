# Timeline Projection System

## Overview

The Timeline Projection System is a **hook-based transformation layer** that sits between the raw timeline data and what the user sees on screen.

It allows features like buffers, time offsets, and future non-linear transforms to affect the visual representation of the timeline **without touching the domain model or the constraints engine**.

---

## Two Time Spaces

| Space              | Description                         | Examples                                  |
|--------------------|-------------------------------------|-------------------------------------------|
| **Base time**      | Raw domain data, source of truth    | Slot `startMinutes`, constraints, history |
| **Projected time** | What the user sees after transforms | Slots shifted by buffers, visual offsets  |

These two spaces must never be mixed. Every boundary crossing is explicit — either a `project()` or `unproject()` call.

---

## Architecture

### `TimelineProjector` — Interface + Token

```ts
// TimelineProjector.ts
export interface TimelineProjector {
  project(min: number): number;    // base → projected (for rendering)
  unproject(min: number): number;  // projected → base (for pointer input)
}

export const TIMELINE_PROJECTOR = new InjectionToken<TimelineProjector>('TIMELINE_PROJECTOR');
```

This is the only thing consumers depend on. Nothing else leaks out of this system.

---

### `TimelineProjectionService` — Orchestrator

```ts
// TimelineProjectionService.ts
@Injectable({ providedIn: 'root' })
export class TimelineProjectionService implements TimelineProjector {

  private hooks: TimelineHook[] = [];

  registerHook(hook: TimelineHook) {
    this.hooks.push(hook);
  }

  project(min: number): number {
    return this.hooks.reduce((acc, hook) => hook.project(acc), min);
  }

  unproject(min: number): number {
    return [...this.hooks].reverse().reduce((acc, hook) => hook.unproject(acc), min);
  }
}
```

- With **zero hooks** registered, it behaves as an identity (pass-through) — no special no-op class needed.
- `project()` applies hooks **left to right**.
- `unproject()` applies hooks **right to left** (strict inverse of projection).

---

### `TimelineHook` — Plugin Contract

```ts
// exported from TimelineProjectionService.ts
export interface TimelineHook {
  project(min: number): number;
  unproject(min: number): number;
}
```

Any feature that wants to affect the visual timeline implements this interface and registers itself via `registerHook()`.

---

### Token Registration (app.config.ts)

```ts
{
  provide: TIMELINE_PROJECTOR,
  useExisting: TimelineProjectionService
}
```

`useExisting` ensures there is only one instance. `TimelineProjectionService` is `providedIn: 'root'` and the token points to that same singleton.

To swap the entire projection strategy (e.g. for testing or a completely different algorithm), change only this provider.

---

## Activating a Hook

Hooks are registered imperatively. The component or service responsible for a feature calls `registerHook()` once on init.

```ts
// Example: activating the BufferTransform hook
export class ProgramPlannerComponent implements OnInit {
  private projection = inject(TimelineProjectionService);
  private bufferTransform = inject(BufferTransform);

  ngOnInit() {
    this.projection.registerHook(this.bufferTransform);
  }
}
```

`BufferTransform` is `@Injectable()` without `providedIn: 'root'` — it must be provided explicitly where needed.

---

## Built-in Hooks

### `BufferTransform`

Applies timeline offsets (buffers) defined in the program state.

- Buffers are stored in **projected time**, not base time.
- Each buffer shifts everything after its insertion point by its `delta`.
- `project()` accumulates all deltas at or before `min`.
- `unproject()` reverses the accumulation.

```ts
@Injectable()
export class BufferTransform implements TimelineHook {
  project(min: number): number { ... }   // base → projected
  unproject(min: number): number { ... } // projected → base
}
```

---

## Where to Apply Projection

| Situation                 | Call                                   | Direction        |
|---------------------------|----------------------------------------|------------------|
| Rendering a slot          | `projector.project(slot.startMinutes)` | base → projected |
| Drag / pointer input      | `projector.unproject(pointerMinutes)`  | projected → base |
| Resize input              | `projector.unproject(pointerMinutes)`  | projected → base |
| Reading a buffer position | **none** — already in projected time   | —                |
| Constraints engine        | **none** — always works in base time   | —                |

---

## Rules

**Slots** are stored in base time. Always project them before rendering. Always unproject pointer input before writing back to state.

**Buffers** are stored in projected time. Never unproject them. They define the projection itself.

**The constraints engine** works exclusively in base time and is never aware of projection.

**The spatial engine** (`TimelineSpatialService`) uses `unproject()` when converting pointer position to minutes, and `project()` when computing render positions.

**Never project a duration.** Only project and unproject absolute time positions.

```ts
// WRONG
const projectedEnd = projector.project(slot.startMinutes + slot.durationMinutes);

// CORRECT
const projectedStart = projector.project(slot.startMinutes);
const projectedEnd = projectedStart + slot.durationMinutes; // duration is invariant
```

---

## Common Mistakes

| Mistake                                                    | Why it breaks                                                                 |
|------------------------------------------------------------|-------------------------------------------------------------------------------|
| `inject(TimelineProjectionService)` directly in a consumer | Couples the consumer to the concrete class — use `inject(TIMELINE_PROJECTOR)` |
| Forgetting `unproject()` on drag input                     | Slot drifts on every drop                                                     |
| Applying `unproject()` to a buffer position                | Buffers are already in projected space                                        |
| Projecting base time in the constraints engine             | Constraints would enforce incorrect positions                                 |
| Projecting `start + duration` as a single value            | Duration is not a time position, it does not transform                        |

---

## Extending the System

To add a new transform (e.g. a global time offset, zoom warp, or BPM-based mapping):

1. Create a class implementing `TimelineHook`.
2. Decorate it with `@Injectable()`.
3. Register it via `projection.registerHook(myHook)` at the appropriate init point.
4. Hook order matters: hooks are applied in registration order during `project()`, and in reverse during `unproject()`.

No change is needed in any consumer of `TIMELINE_PROJECTOR`.

---

## Future Extensions

- Timeline sections with independent tempos
- Zoom-aware transforms (px density mapping)
- Magnetic snapping layers
- Non-linear / logarithmic timelines
- Hook deregistration (for lazy-loaded feature modules)
