/**
 * Generic base registry used to store and retrieve values by key.
 *
 * ---------------------------------------------------------------------------
 * 🧠 ROLE IN ARCHITECTURE
 * ---------------------------------------------------------------------------
 *
 * This class provides a **strict, reusable registry pattern** used across the
 * application to manage mappings such as:
 *
 * - Insert actions
 * - Render definitions
 * - Constraint strategies
 * - Drag preview configurations
 *
 * It is designed as a **pure infrastructure utility** (non-Angular),
 * and should be extended by feature-specific registries.
 *
 * ---------------------------------------------------------------------------
 * ⚡ FEATURES
 * ---------------------------------------------------------------------------
 *
 * - Strongly typed key → value mapping
 * - Strict mode:
 *   - ❗ Throws on duplicate registration
 *   - ❗ Throws on missing key access
 * - Lightweight and framework-agnostic
 *
 * ---------------------------------------------------------------------------
 * 🧩 USAGE
 * ---------------------------------------------------------------------------
 *
 * Extend this class to create a domain-specific registry:
 *
 * ```ts
 * @Injectable({ providedIn: 'root' })
 * export class InsertActionRegistry extends BaseRegistry<
 *   InsertActionType,
 *   InsertActionHandler
 * > {
 *   constructor() {
 *     super('InsertActionRegistry');
 *   }
 * }
 * ```
 *
 * ---------------------------------------------------------------------------
 * 🚫 DESIGN CONSTRAINTS
 * ---------------------------------------------------------------------------
 *
 * - This class is NOT injectable and should not depend on Angular DI
 * - Registration is expected to happen during app initialization
 * - Once populated, the registry is treated as immutable
 *
 * ---------------------------------------------------------------------------
 * 🧠 ERROR HANDLING
 * ---------------------------------------------------------------------------
 *
 * Errors are explicit and include the registry name for easier debugging:
 *
 * - Duplicate key:
 *   `[RegistryName] Key "X" is already registered`
 *
 * - Missing key:
 *   `[RegistryName] Missing definition for key "X"`
 *
 * ---------------------------------------------------------------------------
 * 💡 DESIGN NOTES
 * ---------------------------------------------------------------------------
 *
 * - Uses a Map internally for O(1) access
 * - Enforces correctness early (fail-fast approach)
 * - Encourages modular and extensible architecture
 *
 * ---------------------------------------------------------------------------
 * 🚀 EXTENSIONS
 * ---------------------------------------------------------------------------
 *
 * This base class can be extended to support:
 *
 * - Registry freezing (prevent late registration)
 * - Lazy loading / plugin systems
 * - Debug tooling (introspection of registered keys)
 *
 * @typeParam TKey - Type of the registry key (e.g. enum)
 * @typeParam TValue - Type of the stored value (e.g. handler, definition)
 */
export class BaseRegistry<TKey, TValue> {

  private registry = new Map<TKey, TValue>();

  protected constructor(
    private readonly registryName: string
  ) {}

  /**
   * Registers a value for a given key.
   *
   * ❗ Throws if the key is already registered.
   */
  register(key: TKey, value: TValue): void {

    if (this.registry.has(key)) {
      throw new Error(
        `[${this.registryName}] Key "${String(key)}" is already registered`
      );
    }

    this.registry.set(key, value);
  }

  /**
   * Retrieves a value for a given key.
   *
   * ❗ Throws if the key is not found.
   */
  get(key: TKey): TValue {

    const value = this.registry.get(key);

    if (!value) {
      throw new Error(
        `[${this.registryName}] Missing definition for key "${String(key)}"`
      );
    }

    return value;
  }

  /**
   * Checks if a key exists.
   */
  has(key: TKey): boolean {
    return this.registry.has(key);
  }
}
