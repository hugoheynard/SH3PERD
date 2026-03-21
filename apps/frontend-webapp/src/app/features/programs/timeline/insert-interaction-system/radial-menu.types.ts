import type { InsertActionType } from './actions-services/insert-action.types';

/**
 * Describes a single item in the radial insert menu.
 */
export type RadialMenuItem = {
  /** Action identifier (must match InsertActionType) */
  type: InsertActionType;

  /** Display label shown in the UI */
  label: string;

  /** Angle in degrees for radial positioning */
  angle: number;
};


