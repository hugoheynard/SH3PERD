/**
 * Represents a fully validated interaction context,
 * combining raw interaction data with its spatial projection.
 *
 * ---------------------------------------------------------------------------
 * 🧠 ROLE IN ARCHITECTURE
 * ---------------------------------------------------------------------------
 *
 * Core data structure of the **Interaction Engine layer**.
 *
 * This type acts as the bridge between:
 *
 * - **Interaction state** (drag, resize, insert, etc.)
 * - **Spatial projection** (timeline coordinates)
 *
 * It ensures that downstream systems (preview, constraints, UI)
 * always operate on a **safe and consistent input**.
 *
 * ---------------------------------------------------------------------------
 * 📦 STRUCTURE
 * ---------------------------------------------------------------------------
 *
 * - `interaction` → raw interaction object (domain-specific)
 * - `projection` → computed spatial data from pointer position
 *
 * ---------------------------------------------------------------------------
 * 🎯 USAGE
 * ---------------------------------------------------------------------------
 *
 * Produced by:
 * - {@link InteractionContextService}
 *
 * Consumed by:
 * - Drag preview systems
 * - Resize interactions
 * - Insert interaction logic
 * - Constraint / collision engines
 *
 * Example:
 *
 * ```ts
 * const ctx = interactionContextService.getContext(interaction);
 * if (!ctx) return;
 *
 * const { interaction, projection } = ctx;
 * ```
 *
 * ---------------------------------------------------------------------------
 * ⚠️ IMPORTANT
 * ---------------------------------------------------------------------------
 *
 * - This object is guaranteed to be **valid**:
 *   - interaction is not null
 *   - projection is not null
 *
 * - Consumers should NOT perform additional null checks
 *   on `interaction` or `projection`.
 *
 * ---------------------------------------------------------------------------
 * 💡 DESIGN NOTES
 * ---------------------------------------------------------------------------
 *
 * - Generic over `T` to support multiple interaction types:
 *   - drag
 *   - resize
 *   - insert
 *
 * - Keeps interaction logic decoupled from spatial computation
 *
 * ---------------------------------------------------------------------------
 * 🚀 EXTENSIONS
 * ---------------------------------------------------------------------------
 *
 * This type can evolve to include:
 *
 * - constraint metadata (bounds, snapping)
 * - collision hints
 * - interaction mode (strict, ripple, etc.)
 *
 */
export type InteractionContext<T> = {
  interaction: T;
  projection: InteractionProjection;
};

/**
 * Represents the projection of a pointer position
 * into timeline coordinates.
 *
 * ---------------------------------------------------------------------------
 * 🧠 ROLE
 * ---------------------------------------------------------------------------
 *
 * This type is produced by {@link TimelineSpatialService}
 * and consumed across the interaction system.
 *
 * It defines the mapping between:
 *
 * - Screen space (pointer position)
 * - Timeline space (room + time)
 *
 * ---------------------------------------------------------------------------
 * 📦 PROPERTIES
 * ---------------------------------------------------------------------------
 *
 * - `room_id` → target room under the pointer
 * - `minutes` → snapped timeline position (clamped ≥ 0)
 * - `px` → pixel position aligned with timeline grid
 *
 * ---------------------------------------------------------------------------
 * 🎯 USAGE
 * ---------------------------------------------------------------------------
 *
 * Used by:
 *
 * - drag interactions
 * - resize interactions
 * - insert systems
 * - preview computations
 *
 * ---------------------------------------------------------------------------
 * 💡 DESIGN NOTES
 * ---------------------------------------------------------------------------
 *
 * - Must stay in sync with TimelineSpatialService output
 * - Should remain UI-agnostic (no DOM references)
 * - Can be extended with snapping / bounds metadata
 *
 * ---------------------------------------------------------------------------
 * 🚀 EXTENSIONS
 * ---------------------------------------------------------------------------
 *
 * Future additions may include:
 *
 * - `snapped` → raw vs snapped distinction
 * - `roomRect` → bounds of the room
 * - `isValid` → constraint validation
 *
 */
export type InteractionProjection = {
  room_id: string;
  minutes: number;
  px: number;
};
