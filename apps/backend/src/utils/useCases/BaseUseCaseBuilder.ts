import type { TPermissionKey } from '../../permissions/permissionsRegistry.js';
import type { TUserId } from '@sh3pherd/shared-types';

/**
 * Base builder class for use cases, providing common functionality such as permission checks.
 */
export class BaseUseCaseBuilder<TUseCaseFn> {
  permissionCheck?: {
    fn: (asker_id: TUserId, permission: TPermissionKey) => Promise<boolean>;
    error?: string;
  };

  /**
   * Build the use case function. To be overridden by subclasses.
   */
  protected build(): TUseCaseFn {
    throw new Error('Build must be implemented in the subclass');
  }

  /**
   * Permission check function to verify if the action is allowed
   * @param input
   */
  withPermissionCheck(input: {
    fn: (asker_id: TUserId, action: TPermissionKey) => Promise<boolean>;
    error?: string;
  }): this {
    if (!this.permissionCheck) {
      this.permissionCheck = {
        fn: async () => false,
        error: 'PERMISSION_CHECK_NOT_CONFIGURED',
      };
    }

    this.permissionCheck = input;
    return this;
  }
}
