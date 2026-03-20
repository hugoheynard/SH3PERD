# Insert Interaction System

This module handles all user interactions related to inserting elements
(cues, slots, buffers, notes) into the planner timeline.

It provides a complete interaction pipeline from UI to domain execution.

## Architecture

UI (InsertLineComponent / RadialMenu)
↓
InsertActionService (dispatcher)
↓
InsertActionRegistry
↓
Action Handlers (CueService, SlotService, ...)

## Key Concepts

### Insert State
Managed by InsertLineService:
- preview (pointer-driven)
- locked (user-confirmed)

### Actions
Each insert action is defined by:
- type (InsertActionType)
- handler (registered in registry)

### Registry Pattern
Avoids switch/case and decouples UI from logic.

## Interaction Flow

1. User activates ALT mode → preview appears
2. User clicks "+" → position is locked
3. Radial menu opens
4. User selects action
5. Action is executed via InsertActionService
6. Insert state is cleared

## Adding a new action

1. Add type in `insert-action.types.ts`

2. Register handler in `planner-insert-actions-init.service.ts`

3. Add UI config in `radial-menu.config.ts`

No changes required in components.

## Design Principles

- UI is stateless
- No business logic in components
- Registry pattern for extensibility
- Signals for reactive state


## Future Improvements

- Undo/redo transaction support
- Context-aware actions
- Permissions
- Analytics tracking
