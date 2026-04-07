import type { TUserPreferencesDomainModel, TContractId } from '@sh3pherd/shared-types';
import { Entity, type TEntityInput } from '../../utils/entities/Entity.js';

/**
 * UserPreferences Entity
 * @extends Entity<TUserPreferencesDomainModel>
 */
export class UserPreferences extends Entity<TUserPreferencesDomainModel>{

  // --- Constructor ---
  constructor(props: TEntityInput<TUserPreferencesDomainModel>) {
    super(props, 'userPreferences');
  };

  // --- Getters  ---
  get contractWorkspace(): TContractId {
    return this.props.contract_workspace;
  };

  get theme(): 'light' | 'dark' {
    return this.props.theme;
  };

  // --- Methods ---
  /**
   * Change the theme from light → dark or dark → light.
   */
  changeTheme(): void {
    this.props.theme = this.theme === 'light' ? 'dark' : 'light';
  };

  /**
   * Set theme to a specific value.
   */
  setTheme(theme: 'light' | 'dark'): void {
    this.props.theme = theme;
  };

  /**
   * Change the contract workspace.
   * @param newWorkspace
   */
  changeContractWorkspace(newWorkspace: TContractId): void {
    this.props.contract_workspace = newWorkspace;
  };
}